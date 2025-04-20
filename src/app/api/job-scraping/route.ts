import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import * as cheerio from 'cheerio';
import { saveNewJobsForUser, getSavedJobsForUser, Job } from '../../lib/fireBaseConfig';

const resend = new Resend('re_eHFafFe4_8BcczssVbbwpDg6QneRxRtqX'); // API key moved to .env.local

type JobA = {
  jobTitle: string;
  company: string;
  published?: string;
  deadline?: string;
  postedTime?: string;
  location?: string;
  link: string;
  source: 'Jobs.ge' | 'LinkedIn';
};

type UserPreference = {
  email: string;
  jobTitle: string;
  city?: string;
  keywords?: string;
};

export async function POST(req: NextRequest) {
  try {
    const { userPreferences }: { userPreferences: UserPreference[] } = await req.json();
    console.log('Received user preferences:', userPreferences);

    if (!userPreferences || userPreferences.length === 0) {
      console.error('No preferences found in the request.');
      return NextResponse.json({ message: 'No preferences provided in the request.' }, { status: 400 });
    }

    const allScrapedJobs: JobA[] = [];

    for (const preference of userPreferences) {
      const scrapedJobs = await scrapeJobs([preference]);
      allScrapedJobs.push(...scrapedJobs);
    }

    console.log('Scraped Jobs:', allScrapedJobs);

    if (allScrapedJobs.length > 0) {
      for (const preference of userPreferences) {
        const savedJobs: JobA[] = await getSavedJobsForUser(preference.email);
        const newJobs = getNewJobs(savedJobs, allScrapedJobs);
        await sendEmailNotification([preference], newJobs);

        const mapJobAtoJob = (jobA: JobA): Job => {
          const jobTitle = jobA.jobTitle.trim();
          const keywords = jobTitle
            .toLowerCase()
            .split(' ')
            .filter((k) => k.length > 0);
        
          return {
            id: extractUniqueJobIdentifier(jobA.link) || '', // Fallback to empty string if ID can't be extracted
            title: jobTitle,
            jobTitle,
            link: jobA.link,
            source: jobA.source,
            company: jobA.company,
            location: jobA.location || 'Unknown', // default if location is optional and missing
            description: `${jobA.company} is hiring for ${jobTitle}.`, // customize as needed
            keywords,
          };
        };
        
        
        
        if (newJobs.length > 0) {
          const mappedNewJobs = newJobs.map(mapJobAtoJob);
          await saveNewJobsForUser(preference.email, mappedNewJobs);
        }
      }
    } else {
      console.log('No matching jobs found.');
    }

    return NextResponse.json({ message: 'Job scraping completed and notifications sent.' });
  } catch (error) {
    console.error('Error in job scraping:', error);
    return NextResponse.json(
      { message: `Error: ${error instanceof Error ? error.message : 'There was an error during job scraping.'}` },
      { status: 500 }
    );
  }
}

const extractJobIdJobsGe = (link: string): string | null => {
  const match = link.match(/[?&]id=(\d+)/);
  return match ? `jobge-${match[1]}` : null;
};

const extractJobIdLinkedIn = (link: string): string | null => {
  const match = link.match(/(?:jobs\/view\/)([^?&]+)/);
  return match ? `linkedin-${match[1]}` : null;
};

const extractUniqueJobIdentifier = (link: string): string | null => {
  if (link.includes('jobs.ge')) return extractJobIdJobsGe(link);
  if (link.includes('linkedin.com')) return extractJobIdLinkedIn(link);
  return null;
};

const getNewJobs = (oldJobs: JobA[], newJobs: JobA[]): JobA[] => {
  const oldJobIds = oldJobs.map((job) => extractUniqueJobIdentifier(job.link));
  return newJobs.filter((job) => {
    const jobId = extractUniqueJobIdentifier(job.link);
    return jobId !== null && !oldJobIds.includes(jobId);
  });
};

const scrapeJobs = async (preferences: UserPreference[]): Promise<JobA[]> => {
  try {
    const allJobs: JobA[] = [];

    for (const preference of preferences) {
      const searchTitle = preference.jobTitle.toLowerCase();
      const location = preference.city || '';
      const keywords = (preference.keywords || '')
        .split(',')
        .map((k) => k.trim().toLowerCase())
        .filter((k) => k.length > 0);

      console.log(`Searching for jobs: ${searchTitle}, Location: ${location}, Keywords: ${keywords.join(', ')}`);

      const jobsGeJobs = await scrapeJobsFromJobsGe(searchTitle, keywords);
      const linkedinJobs = await scrapeLinkedInJobs(searchTitle, location, keywords);

      allJobs.push(...jobsGeJobs, ...linkedinJobs);
    }

    return allJobs;
  } catch (error) {
    console.error('Error scraping jobs:', error);
    throw new Error('Failed to scrape jobs');
  }
};

const scrapeJobsFromJobsGe = async (searchTitle: string, keywords: string[]): Promise<JobA[]> => {
  const baseUrl = 'https://jobs.ge';
  const url = `${baseUrl}/?page=1&q=${encodeURIComponent(searchTitle)}&cid=&lid=&jid=`;

  try {
    const res = await fetch(url);
    const html = await res.text();
    const $ = cheerio.load(html);

    const jobs: JobA[] = [];
    const rows = $('table#job_list_table tr').toArray();

    rows.forEach((el) => {
      const titleAnchor = $(el).find('td:nth-child(2) > a.vip');
      const jobTitle = titleAnchor.text().trim();
      const relativeLink = titleAnchor.attr('href');
      if (!jobTitle || !relativeLink) return;

      const link = baseUrl + relativeLink;
      const company = $(el).find('td:nth-child(4) a').text().trim();
      const published = $(el).find('td:nth-child(5)').text().trim();
      const deadline = $(el).find('td:nth-child(6)').text().trim();

      const normalize = (str: string) => str.toLowerCase().replace(/\s+/g, '').trim();
      const normalizedTitle = normalize(jobTitle);
      const normalizedSearchTitle = normalize(searchTitle);
      const normalizedKeywords = keywords.map(normalize);

      if (
        normalizedTitle.includes(normalizedSearchTitle) ||
        normalizedKeywords.some((kw) => normalizedTitle.includes(kw))
      ) {
        jobs.push({
          jobTitle,
          company,
          published,
          deadline,
          link,
          source: 'Jobs.ge',
        });
      }
    });

    return jobs;
  } catch (error) {
    console.error('Error scraping Jobs.ge:', error);
    throw new Error('Failed to scrape Jobs.ge');
  }
};

const scrapeLinkedInJobs = async (
  jobTitleSearch: string,
  location: string = '',
  keywords: string[]
): Promise<JobA[]> => {
  const jobs: JobA[] = [];
  const pageSize = 25;
  const maxPages = 4;

  try {
    for (let page = 0; page < maxPages; page++) {
      const start = page * pageSize;
      const searchParams = new URLSearchParams({
        keywords: jobTitleSearch,
        location: location,
        start: start.toString(),
      });

      const searchUrl = `https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?${searchParams.toString()}`;
      const response = await fetch(searchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0',
          'Accept-Language': 'en-US,en;q=0.9',
        },
      });

      if (!response.ok) {
        console.error(`Failed to fetch LinkedIn jobs: ${response.statusText}`);
        break;
      }

      const html = await response.text();
      const $ = cheerio.load(html);

      $('li > div.base-card').each((_, element) => {
        const jobTitle = $(element).find('[class*="title"]').text().trim();
        const company = $(element).find('[class*="subtitle"]').text().trim();
        const loc = $(element).find('[class*="location"]').text().trim();
        const postedTime = $(element).find('[class*="listdate"]').text().trim();
        const link = $(element).find('[class*="full-link"]').attr('href');

        const lowerTitle = jobTitle.toLowerCase();

        if (
          jobTitle &&
          company &&
          link &&
          (lowerTitle.includes(jobTitleSearch) || keywords.some((kw) => lowerTitle.includes(kw)))
        ) {
          jobs.push({
            jobTitle,
            company,
            location: loc,
            postedTime,
            link: link.startsWith('http') ? link : `https://www.linkedin.com${link}`,
            source: 'LinkedIn',
          });
        }
      });

      if ($('li > div.base-card').length === 0) {
        break;
      }
    }
  } catch (error) {
    console.error('Error fetching LinkedIn jobs:', error);
    throw new Error('Failed to scrape LinkedIn');
  }

  return jobs;
};

// Send Email Notification
// Send Email Notification
const sendEmailNotification = async (preferences: UserPreference[], jobs: JobA[]) => {
  // Iterate over the preferences array to handle each user's email and job preferences
  for (const preference of preferences) {
    const userEmail = preference?.email;
    const preferredJobTitle = preference?.jobTitle;
  
    if (!userEmail) {
      console.error('No email address found in preferences.');
      return;
    }

    const hasJobs = jobs && jobs.length > 0;

    const jobListHtml = hasJobs
      ? jobs
          .map(
            (job) => `
              <div class="job-item">
                <h3>${job.jobTitle}</h3>
                <p>Company: ${job.company}</p>
                ${job.location ? `<p>Location: ${job.location}</p>` : ''}
                ${job.postedTime ? `<p>Posted: ${job.postedTime}</p>` : ''}
                <a href="${job.link || '#'}" target="_blank">View Job</a>
              </div>
            `
          )
          .join('')
      : `<p>No new opportunities were found today based on your preferences. We’ll keep checking and let you know when something comes up!</p>`;

    const subject = hasJobs
      ? `Your Job Matches for ${preferredJobTitle || 'New Opportunities'}`
      : `No New Jobs for ${preferredJobTitle || 'Your Preferences'} – We’re Still Looking!`;

    try {
      await resend.emails.send({
        from: 'Alertly <onboarding@resend.dev>',
        to: userEmail,
        subject,
        html: `
          <html>
            <head>
              <style>
                body {
                  font-family: Arial, sans-serif;
                  background-color: #f4f4f9;
                  color: #333;
                  padding: 20px;
                }
                .container {
                  width: 600px;
                  margin: 0 auto;
                  background-color: #ffffff;
                  border-radius: 8px;
                  padding: 20px;
                  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                }
                .header {
                  text-align: center;
                  padding: 20px 0;
                  background-color: #f0f8ff;
                  border-radius: 8px 8px 0 0;
                }
                .footer {
                  text-align: center;
                  margin-top: 20px;
                  color: #aaa;
                  font-size: 12px;
                }
                .job-item {
                  margin-bottom: 20px;
                  padding: 15px;
                  border: 1px solid #ddd;
                  border-radius: 5px;
                  background-color: #fafafa;
                }
                .job-item h3 {
                  font-size: 18px;
                  margin-bottom: 10px;
                }
                .job-item p {
                  margin: 5px 0;
                }
                .job-item a {
                  color: #007bff;
                  text-decoration: none;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h2>Your Latest Job Alerts</h2>
                </div>
                ${jobListHtml}
                <div class="footer">
                  <p>If you wish to unsubscribe or update your preferences, please visit your profile settings.</p>
                </div>
              </div>
            </body>
          </html>
        `,
      });
      console.log(`Email sent to ${userEmail}`);
    } catch (error) {
      console.error(`Error sending email to ${userEmail}:`, error);
    }
  }
};
