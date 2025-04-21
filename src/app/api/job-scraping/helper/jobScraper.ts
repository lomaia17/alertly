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
  
  
        const jobsGeJobs = await scrapeJobsFromJobsGe(searchTitle, keywords);
        const linkedinJobs = await scrapeLinkedInJobs(searchTitle, keywords, location);
  
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

    // Function to normalize text (to lowercase and remove extra spaces)
    const normalize = (str: string) => str.toLowerCase().replace(/\s+/g, ' ').trim();
    const normalizedSearchTitle = normalize(searchTitle);

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

                // Check if the job title contains the search term or any keyword
                const isTitleMatch = normalizedTitle.includes(normalizedSearchTitle);
                const isKeywordMatch = keywords.some((kw) => normalizedTitle.includes(kw));

                if (isTitleMatch || isKeywordMatch) {
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



  const fetchCities = async (cityTerm: string) => {
    const url = `https://www.linkedin.com/jobs-guest/api/typeaheadHits?origin=jserp&typeaheadType=GEO&geoTypes=POPULATED_PLACE&query=${encodeURIComponent(cityTerm)}`;
    const res = await fetch(url);
    const data = await res.json();
  

  
    if (!Array.isArray(data) || data.length === 0) {
      console.warn('No cities found or invalid structure:', data);
      return [];
    }
  
    return data.map(item => ({
      cityName: item.displayName, // this is what your job scraper uses
    }));
  };

  
  const scrapeLinkedInJobs = async (searchTitle: string, keywords: string[], cityTerm: string) => {
    const jobs: JobA[] = [];
    const cities = await fetchCities(cityTerm); // Get the list of cities for the given term
  
  
    for (const city of cities) {
      const searchUrl = `https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords=${encodeURIComponent(searchTitle)}&location=${encodeURIComponent(city.cityName)}`;
      let page = 0;
      const maxPages = 4;
      while (page < maxPages) {
        const url = `${searchUrl}&start=${page * 25}`;
        const response = await fetch(url);
        const html = await response.text();
        const $ = cheerio.load(html);
  
        const jobElements = $('.base-card'); // Updated selector
  
        if (jobElements.length === 0) break;
  
        jobElements.each((_, el) => {
          const jobTitle = $(el).find('.base-search-card__title').text().trim();
          const company = $(el).find('.base-search-card__subtitle').text().trim();
          const location = $(el).find('.job-search-card__location').text().trim();
          const link = $(el).find('a.base-card__full-link').attr('href');
  
          const lowerTitle = jobTitle.toLowerCase();
          const lowerKeywords = keywords.map(k => k.toLowerCase());
  
          if (
            jobTitle &&
            company &&
            link &&
            (lowerTitle.includes(searchTitle.toLowerCase()) ||
              lowerKeywords.some((kw) => lowerTitle.includes(kw)))
          ) {
            if (location.toLowerCase().includes(city.cityName.toLowerCase()) || location.toLowerCase().includes('tbilisi')) {
              const fullLink = link.startsWith('http') ? link : `https://www.linkedin.com${link}`;
  
              jobs.push({
                jobTitle,
                company,
                location,
                link: fullLink,
                source: 'LinkedIn',
              });

            }
          }
        });
  
        page++;
      }
    }
  
    return jobs;
  };
  