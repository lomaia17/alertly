import { NextResponse } from 'next/server';
import { getUserPreferences, getSavedJobsForUser, saveNewJobsForUser } from '@/lib/fireBaseConfig';
import { scrapeJobs } from './lib/jobScraper';
import { sendEmailNotification } from './lib/emailSender';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const frequency = searchParams.get('frequency') || 'daily';
  const secret = searchParams.get('secret');

  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const userPreferences = await getUserPreferences();
    const matchingPreferences = userPreferences.filter(
      (pref) => pref.frequency?.toLowerCase() === frequency.toLowerCase()
    );

    if (!matchingPreferences.length) {
      return NextResponse.json({ message: `No user preferences for ${frequency}` });
    }

    const scrapedJobs = await scrapeJobs(); // Your custom scraper logic

    for (const preference of matchingPreferences) {
      const savedJobs = await getSavedJobsForUser(preference.email);
      const newJobs = getNewJobs(savedJobs, scrapedJobs, preference);

      await sendEmailNotification(preference, newJobs);
      if (newJobs.length > 0) {
        await saveNewJobsForUser(preference.email, newJobs);
      }
    }

    return NextResponse.json({ message: `Processed ${matchingPreferences.length} users.` });
  } catch (error: any) {
    console.error('Error in cron job:', error);
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 });
  }
}

// Helper to filter new jobs
function getNewJobs(oldJobs: any[], newJobs: any[], preference: any) {
  const oldLinks = oldJobs.map((job) => normalizeLink(job.link));
  return newJobs.filter((job) => {
    const normalized = normalizeLink(job.link);
    const matchesPref =
      (!preference.jobTitle || job.jobTitle.toLowerCase().includes(preference.jobTitle.toLowerCase())) &&
      (!preference.city || job.location?.toLowerCase().includes(preference.city.toLowerCase()));
    return matchesPref && !oldLinks.includes(normalized);
  });
}

// Normalize links to avoid false negatives
function normalizeLink(link: string) {
  return link?.split('?')[0]?.toLowerCase();
}
