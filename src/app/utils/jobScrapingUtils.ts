// utils.ts
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
  