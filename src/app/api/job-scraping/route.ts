import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, getApps } from 'firebase/app';
import { saveNewJobsForUser, getSavedJobsForUser, firebaseConfig } from '../../lib/fireBaseConfig';
import { sendEmailNotification } from './helper/emailUtils';
import { UserPreference, JobA } from './types';
import {getAllUserPreferencesFromFirestore} from "./helper/firebase"
import {
  getNewJobs,
  mapJobAtoJob,
  scrapeJobs,
} from './helper/jobScraper';

// Initialize Firebase if not already initialized
if (!getApps().length) {
  initializeApp(firebaseConfig);
}


export async function POST(req: NextRequest) {
  try {
    const { userPreferences }: { userPreferences: UserPreference[] } = await req.json();
    console.log('Received user preferences:', userPreferences);

    if (!userPreferences || userPreferences.length === 0) {
      console.error('No preferences found in the request.');
      return NextResponse.json({ message: 'No preferences provided in the request.' }, { status: 400 });
    }

    const result = await processJobScraping(userPreferences);
    return NextResponse.json({ 
      message: 'Job scraping completed and notifications sent.',
      ...result
    });
  } catch (error) {
    console.error('Error in job scraping:', error);
    return NextResponse.json(
      { message: `Error: ${error instanceof Error ? error.message : 'There was an error during job scraping.'}` },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Fetch all user preferences from Firestore
    const userPreferences = await getAllUserPreferencesFromFirestore();
    
    if (!userPreferences || userPreferences.length === 0) {
      return NextResponse.json({ message: 'No user preferences found.' }, { status: 200 });
    }

    const result = await processJobScraping(userPreferences);
    return NextResponse.json({ 
      message: 'Job scraping completed and notifications sent.',
      ...result
    });
  } catch (error) {
    console.error('Error in GET job scraping:', error);
    return NextResponse.json(
      { message: `Error: ${error instanceof Error ? error.message : 'There was an error during job scraping.'}` },
      { status: 500 }
    );
  }
}

async function processJobScraping(userPreferences: UserPreference[]) {
  const allScrapedJobs: JobA[] = [];
  let totalJobsFound = 0;
  let totalEmailsSent = 0;

  // Scrape jobs once based on all preferences (you can optimize this further)
  for (const preference of userPreferences) {
    const scrapedJobs = await scrapeJobs([preference]);
    allScrapedJobs.push(...scrapedJobs);
  }

  console.log('Total scraped jobs:', allScrapedJobs.length);

  // Group new jobs per user
  for (const preference of userPreferences) {
    const savedJobs: JobA[] = await getSavedJobsForUser(preference.email);
    const newJobs = getNewJobs(savedJobs, allScrapedJobs);
  
    console.log(`Preparing email for ${preference.email} - ${newJobs.length} new jobs`);
  
    try {
      // ✅ Always send email, even if no jobs
      await sendEmailNotification([preference], newJobs);
  
      // Save only if there are new jobs
      if (newJobs.length > 0) {
        const mappedNewJobs = newJobs.map(mapJobAtoJob);
        await saveNewJobsForUser(preference.email, mappedNewJobs);
        totalJobsFound += newJobs.length;
      }
  
      totalEmailsSent++;
    } catch (error) {
      console.error(`❌ Failed to process ${preference.email}`, error);
    }
  }

  return {
    totalUsers: userPreferences.length,
    totalJobsFound,
    totalEmailsSent,
    hadErrors: totalEmailsSent !== userPreferences.length, // optional metric
  };
}


