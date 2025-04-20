const { initializeApp, getApps } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, updateDoc } = require('firebase/firestore');
const fetch = require('node-fetch');
const dayjs = require('dayjs');

const firebaseConfig = {
  apiKey: "AIzaSyD9uC7PmX36l3OEvJ6YQvGLXfk_WUSI3gM",
  authDomain: "jobalerter-gl.firebaseapp.com",
  projectId: "jobalerter-gl",
  storageBucket: "jobalerter-gl.firebasestorage.app",
  messagingSenderId: "751495068422",
  appId: "1:751495068422:web:f2f1bd6b9b93189d67fc87",
};

if (!getApps().length) {
  initializeApp(firebaseConfig);
}
const db = getFirestore();

async function getAllUserPreferences() {
  try {
    const alertsCollection = collection(db, 'alerts');
    const snapshot = await getDocs(alertsCollection);

    const preferences = [];

    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      preferences.push({
        id: docSnap.id,
        ...data
      });
    });

    return preferences;
  } catch (error) {
    console.error('Error fetching user preferences:', error);
    throw error;
  }
}

async function triggerJobScraping() {
  try {
    const allPreferences = await getAllUserPreferences();
    const now = dayjs();

    const eligibleUsers = allPreferences.filter(user => {
      const freq = user.frequency?.toLowerCase();
      const lastSent = user.lastSent ? dayjs(user.lastSent) : null;

      if (freq === 'daily') {
        return true;
      }

      if (freq === 'weekly' && (!lastSent || now.diff(lastSent, 'day') >= 7)) {
        return true;
      }

      return false;
    });

    if (eligibleUsers.length === 0) {
      console.log('No eligible users for scraping today.');
      return;
    }

    console.log(`Triggering scraping for ${eligibleUsers.length} users`);

    const response = await fetch('https://alertly-two.vercel.app/api/job-scraping', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userPreferences: eligibleUsers }),
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const result = await response.json();
    console.log('Job scraping completed:', result);

    // Optionally update "lastSent" field in Firestore for weekly users
    await Promise.all(eligibleUsers.map(async user => {
      if (user.frequency === 'weekly') {
        const userRef = doc(db, 'alerts', user.id);
        await updateDoc(userRef, { lastSent: now.format('YYYY-MM-DD') });
      }
    }));

  } catch (error) {
    console.error('Error triggering job scraping:', error);
    process.exit(1);
  }
}

triggerJobScraping();
