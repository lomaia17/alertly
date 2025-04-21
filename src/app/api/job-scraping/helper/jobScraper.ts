import * as cheerio from 'cheerio';
import { UserPreference, JobA } from '../types';
import { Job } from '../../../lib/fireBaseConfig';

export const extractJobIdJobsGe = (link: string): string | null => {
    const match = link.match(/[?&]id=(\d+)/);
    return match ? `jobge-${match[1]}` : null;
  };
  
export const extractJobIdLinkedIn = (link: string): string | null => {
    const match = link.match(/(?:jobs\/view\/)([^?&]+)/);
    return match ? `linkedin-${match[1]}` : null;
  };

export const extractUniqueJobIdentifier = (link: string): string | null => {
    if (link.includes('jobs.ge')) return extractJobIdJobsGe(link);
    if (link.includes('linkedin.com')) return extractJobIdLinkedIn(link);
    return null;
  };
  
export const getNewJobs = (oldJobs: JobA[], newJobs: JobA[]): JobA[] => {
    const oldJobIds = oldJobs.map((job) => extractUniqueJobIdentifier(job.link));
    return newJobs.filter((job) => {
      const jobId = extractUniqueJobIdentifier(job.link);
      return jobId !== null && !oldJobIds.includes(jobId);
    });
  };
  
export const mapJobAtoJob = (jobA: JobA): Job => {
    const jobTitle = jobA.jobTitle.trim();
    const keywords = jobTitle
      .toLowerCase()
      .split(' ')
      .filter((k) => k.length > 0);
    
    return {
      id: extractUniqueJobIdentifier(jobA.link) || '',
      title: jobTitle,
      jobTitle,
      link: jobA.link,
      source: jobA.source,
      company: jobA.company,
      location: jobA.location || 'Unknown',
      description: `${jobA.company} is hiring for ${jobTitle}.`,
      keywords,
    };
  };
  
export const scrapeJobs = async (preferences: UserPreference[]): Promise<JobA[]> => {
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
  
export const scrapeJobsFromJobsGe = async (searchTitle: string, keywords: string[]): Promise<JobA[]> => {
    const baseUrl = 'https://jobs.ge';
    let page = 1;
    let hasNext = true;
  
    const jobs: JobA[] = [];
    const seenLinks = new Set<string>();
  
    const normalize = (str: string) => str.toLowerCase().replace(/\s+/g, ' ').trim();
    const normalizedSearchTitle = normalize(searchTitle);
    const normalizedKeywords = keywords.map(normalize);
  
    try {
      while (hasNext) {
        const url = `${baseUrl}/?page=${page}&q=${encodeURIComponent(searchTitle)}&cid=&lid=&jid=`;
        const res = await fetch(url);
        const html = await res.text();
        const $ = cheerio.load(html);
  
        const rows = $('table#job_list_table tr').toArray();
  
        if (rows.length === 0) {
          hasNext = false;
          break;
        }
  
        let foundNewJob = false;
  
        rows.forEach((el) => {
          const titleAnchor = $(el).find('td:nth-child(2) > a.vip');
          const jobTitle = titleAnchor.text().trim();
          const relativeLink = titleAnchor.attr('href');
          if (!jobTitle || !relativeLink) return;
  
          const link = baseUrl + relativeLink;
          if (seenLinks.has(link)) return; // avoid duplicates
          seenLinks.add(link);
  
          const company = $(el).find('td:nth-child(4) a').text().trim();
          const published = $(el).find('td:nth-child(5)').text().trim();
          const deadline = $(el).find('td:nth-child(6)').text().trim();
  
          const normalizedTitle = normalize(jobTitle);
          
          if (
            normalizedTitle.includes(normalizedSearchTitle) ||
            normalizedKeywords.some((kw) => normalizedTitle.includes(kw))
          ){
            jobs.push({
              jobTitle,
              company,
              published,
              deadline,
              link,
              source: 'Jobs.ge',
            });
            foundNewJob = true;
          }
        });
  
        // If no jobs were found or added on this page, stop the loop
        if (!foundNewJob) {
          hasNext = false;
        } else {
          page++;
        }
      }
  
      return jobs;
    } catch (error) {
      console.error('Error scraping Jobs.ge:', error);
      throw new Error('Failed to scrape Jobs.ge');
    }
  };
  
export const scrapeLinkedInJobs = async (
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
            (lowerTitle.includes(jobTitleSearch) || keywords.some((kw) => lowerTitle.includes(kw))
          )) {
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
  