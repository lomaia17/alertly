import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import * as cheerio from 'cheerio';
import puppeteer, { Browser, Page } from 'puppeteer';
import { saveNewJobsForUser, getSavedJobsForUser } from '../../lib/fireBaseConfig'; 

const resend = new Resend("re_uWcAXk1c_CC6ybco19GWZu5ow2KKDCdiU"); // make sure this is in .env.local

export async function POST(req: NextRequest) {
  try {
    const { userPreferences } = await req.json();
    console.log('Received user preferences:', userPreferences);

    if (!userPreferences || userPreferences.length === 0) {
      console.error('No preferences found in the request.');
      return NextResponse.json({ message: 'No preferences provided in the request.' }, { status: 400 });
    }

    // Collect all scraped jobs from each user preference
    const allScrapedJobs: any[] = [];

    for (const preference of userPreferences) {
      const scrapedJobs = await scrapeJobs([preference]);
      allScrapedJobs.push(...scrapedJobs); // Accumulate all scraped jobs
    }

    console.log('Scraped Jobs:', allScrapedJobs);

    if (allScrapedJobs.length > 0) {
      for (const preference of userPreferences) {
        // Get the saved jobs from the database
        const savedJobs = await getSavedJobsForUser(preference.email);
        
        // Compare the scraped jobs with the saved ones to identify new jobs
        const newJobs = getNewJobs(savedJobs, allScrapedJobs);
        await sendEmailNotification(preference, newJobs);
        
        // If there are new jobs, save them to the database
        if (newJobs.length > 0) {
          await saveNewJobsForUser(preference.email, newJobs);
        }
      }
    } else {
      console.log('No matching jobs found.');
    }

    return NextResponse.json({ message: 'Job scraping completed and notifications sent.' });
  } catch (error) {
    console.error('Error in job scraping:', error);
    return NextResponse.json({ message: `Error: ${error.message || 'There was an error during job scraping.'}` }, { status: 500 });
  }
}

const extractJobIdJobsGe = (link: string): string | null => {
  // Extract job ID from jobs.ge URLs (e.g. ?view=jobs&id=627545)
  const regex = /[?&]id=(\d+)/;
  const match = link.match(regex);
  return match ? `jobge-${match[1]}` : null;
};

const extractJobIdLinkedIn = (link: string): string | null => {
  // Extract job ID from LinkedIn URLs (e.g. fullstack-developer-at-geniuses-software-4199743313)
  const regex = /(?:jobs\/view\/)([^?&]+)/;
  const match = link.match(regex);
  return match ? `linkedin-${match[1]}` : null;
};

const extractUniqueJobIdentifier = (link: string): string | null => {
  if (link.includes('jobs.ge')) {
    return extractJobIdJobsGe(link);
  } else if (link.includes('linkedin.com')) {
    return extractJobIdLinkedIn(link);
  }
  return null;
};

const getNewJobs = (oldJobs: any[], newJobs: any[]) => {
  const oldJobIds = oldJobs.map((job) => extractUniqueJobIdentifier(job.link));
  
  return newJobs.filter((job) => {
    const jobId = extractUniqueJobIdentifier(job.link);
    return jobId !== null && !oldJobIds.includes(jobId);
  });
};

export const scrapeJobs = async (preferences: any[]) => {
  try {
    const allJobs: any[] = [];

    for (const preference of preferences) {
      const searchTitle = preference.jobTitle.toLowerCase();
      const location = preference.city || '';
      const rawKeywords = preference.keywords || '';
      const keywords = rawKeywords
        .split(',')
        .map((k: string) => k.trim().toLowerCase())
        .filter((k: string) => k.length > 0);

      console.log(`Searching for jobs: ${searchTitle}, Location: ${location}, Keywords: ${keywords.join(', ')}`);

      // Fetch jobs from jobs.ge
      const jobsGeJobs = await scrapeJobsFromJobsGe(searchTitle, keywords);
      console.log(`Found ${jobsGeJobs.length} jobs from jobs.ge for ${searchTitle}`);

      // Fetch jobs from LinkedIn
      const linkedinJobs = await scrapeLinkedInJobs(searchTitle, location, keywords);
      console.log(`Found ${linkedinJobs.length} jobs from LinkedIn for ${searchTitle}`);

      // Accumulate all jobs
      allJobs.push(...jobsGeJobs, ...linkedinJobs);
    }

    console.log(`Total jobs found across all preferences: ${allJobs.length}`);
    return allJobs;
  } catch (error) {
    console.error('Error scraping jobs:', error);
    throw new Error('Failed to scrape jobs');
  }
};



const scrapeJobsFromJobsGe = async (searchTitle: string, keywords: string[]) => {
  const baseUrl = 'https://jobs.ge';

  const query = encodeURIComponent(searchTitle);
  const url = `${baseUrl}/?page=1&q=${query}&cid=&lid=&jid=`;

  try {
    const res = await fetch(url);
    const html = await res.text();
    const $ = cheerio.load(html);

    const jobs: any[] = [];
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
      const normalizedKeywords = keywords.map(kw => normalize(kw));

      // Match searchTitle or any keyword
      if (
          normalizedTitle.includes(normalizedSearchTitle) ||
          normalizedKeywords.some(kw => normalizedTitle.includes(kw))
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


// Scrape Jobs from LinkedIn
export async function scrapeLinkedInJobs(
  jobTitleSearch: string,
  location: string = '',
  keywords: string[]
) {
  const jobs: any[] = [];
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
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
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
        const location = $(element).find('[class*="location"]').text().trim();
        const postedTime = $(element).find('[class*="listdate"]').text().trim();
        const link = $(element).find('[class*="full-link"]').attr('href');

        const lowerTitle = jobTitle.toLowerCase();

        if (
          jobTitle &&
          company &&
          link &&
          (lowerTitle.includes(jobTitleSearch) ||
            keywords.some((kw) => lowerTitle.includes(kw)))
        ) {
          jobs.push({
            jobTitle,
            company,
            location,
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
}

// Send Email Notification
const sendEmailNotification = async (preferences: any, jobs: any[]) => {
  const userEmail = preferences?.email;
  const preferredJobTitle = preferences?.jobTitle;
  
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
    const res = await resend.emails.send({
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
                width: 100%;
                max-width: 600px;
                margin: 0 auto;
                background-color: #fff;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
              }
              h2 {
                color: #4CAF50;
                font-size: 24px;
                margin-bottom: 20px;
              }
              p {
                font-size: 16px;
                line-height: 1.5;
                margin-bottom: 20px;
              }
              .job-list {
                list-style-type: none;
                padding: 0;
              }
              .job-item {
                background-color: #f9f9f9;
                margin: 10px 0;
                padding: 15px;
                border-radius: 6px;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
              }
              .job-item h3 {
                margin: 0;
                font-size: 18px;
                color: #333;
              }
              .job-item p {
                margin: 5px 0;
                color: #777;
              }
              .job-item a {
                display: inline-block;
                margin-top: 10px;
                padding: 8px 15px;
                background-color: #4CAF50;
                color: white !important;
                text-decoration: none;
                border-radius: 4px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h2>${hasJobs ? 'Your New Job Matches' : 'Job Alert Update'}</h2>
              <p>
                Hi there! ${
                  hasJobs
                    ? 'We\'ve found some job opportunities based on your preferences:'
                    : 'Unfortunately, there were no new job listings that matched your preferences today.'
                }
              </p>
              <div class="job-list">${jobListHtml}</div>
              <p>We'll keep checking and let you know as soon as something pops up!</p>
              <p>Cheers, <br/> Your Job Alert Team</p>
            </div>
          </body>
        </html>
      `,
    });

    console.log('Email sent successfully', res);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};
