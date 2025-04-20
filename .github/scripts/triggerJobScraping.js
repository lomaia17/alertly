const { initializeApp, getApps } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');
const fetch = require('node-fetch');

// Initialize Firebase (use your actual config)
const firebaseConfig = {
    apiKey: "AIzaSyD9uC7PmX36l3OEvJ6YQvGLXfk_WUSI3gM",
    authDomain: "jobalerter-gl.firebaseapp.com",
    projectId: "jobalerter-gl",
    storageBucket: "jobalerter-gl.firebasestorage.app",
    messagingSenderId: "751495068422",
    appId: "1:751495068422:web:f2f1bd6b9b93189d67fc87",
};

// Initialize Firebase if not already initialized
if (!getApps().length) {
  initializeApp(firebaseConfig);
}
const db = getFirestore();

async function getAllUserPreferences() {
  try {
    const usersCollection = collection(db, 'users');
    const snapshot = await getDocs(usersCollection);
    
    const preferences = [];
    
    snapshot.forEach(doc => {
      const userData = doc.data();
      console.log('Fetched user data:', userData);  // Log the user data for debugging
      if (userData.preferences) {
        preferences.push({
          email: userData.email,
          ...userData.preferences
        });
      }
    });
    
    return preferences;
  } catch (error) {
    console.error('Error fetching user preferences:', error);
    throw error;
  }
}

async function triggerJobScraping() {
  try {
    const preferences = await getAllUserPreferences();
    
    if (preferences.length === 0) {
      console.log('No user preferences found.');
      return;
    }
    
    console.log('Sending preferences to job scraping API:', preferences);  // Log preferences being sent
    
    // Call your API endpoint
    const response = await fetch('https://alertly-two.vercel.app/api/job-scraping', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userPreferences: preferences }),
    });
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const result = await response.json();
    console.log('Job scraping completed:', result);
  } catch (error) {
    console.error('Error triggering job scraping:', error);
    process.exit(1);
  }
}

// Run the script
triggerJobScraping();
