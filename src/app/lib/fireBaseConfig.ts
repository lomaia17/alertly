// lib/firebaseJobs.ts
import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  getDoc,
  setDoc,
  Timestamp,
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// ✅ Firebase config
export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// ✅ Initialize app & db
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app); // <- THIS is what you must pass to collection()

// ✅ Exporting db if needed elsewhere
export { app, auth, db };

// ✅ Define Types

// Define the structure of a Job
export interface Job {
  id: string; // job identifier
  title: string;
  jobTitle: string;
  link: string;
  source: 'Jobs.ge' | 'LinkedIn';
  company: string;
  location: string;
  description: string;
  keywords:string[],
}

// Define the structure of user preferences (Alert)
interface UserPreference {
  id: string; // email as ID
  jobTitle: string;
  keywords: string[];
  category: string;
  frequency: 'Daily' | 'Weekly';
  email: string;
  city: string;
  createdAt: Timestamp; // Timestamp
  updatedAt: Timestamp; // Timestamp
}

// ✅ Fetch user preferences from "alerts" collection
export const getUserPreferences = async (): Promise<UserPreference[]> => {
  const colRef = collection(db, 'alerts');
  const snapshot = await getDocs(colRef);

  return snapshot.docs.map((doc) => ({
    id: doc.id, // email as ID
    ...doc.data(),
  })) as UserPreference[];
};

// ✅ Get saved jobs for a user
export const getSavedJobsForUser = async (email: string): Promise<Job[]> => {
  const userDoc = doc(db, 'users', email); // Assuming users are stored by their email
  const docSnapshot = await getDoc(userDoc);

  if (docSnapshot.exists()) {
    return docSnapshot.data()?.jobs || []; // Return saved jobs or an empty array if not found
  } else {
    return [];
  }
};

// ✅ Function to save new jobs for a user
export const saveNewJobsForUser = async (email: string, jobs: Job[]): Promise<Job[]> => {
  const userDocRef = doc(db, 'users', email); // Assuming the collection is 'users' and the document ID is the user's email
  const userDocSnap = await getDoc(userDocRef);

  if (userDocSnap.exists()) {
    // If the document exists, update it
    const updatedJobs = [...userDocSnap.data().jobs, ...jobs];
    await setDoc(userDocRef, { jobs: updatedJobs }, { merge: true });
    return updatedJobs;
  } else {
    // If the document doesn't exist, create it
    await setDoc(userDocRef, { jobs });
    return jobs;
  }
};

export async function getAllUserPreferencesFromFirestore(): Promise<UserPreference[]> {
  const usersCollection = collection(db, 'users');
  const snapshot = await getDocs(usersCollection);
  
  const preferences: UserPreference[] = [];
  
  snapshot.forEach(doc => {
    const userData = doc.data();
  
    // Ensure that userData.preferences exists before accessing its properties
    if (userData.email && userData.preferences) {
      const userPreference: UserPreference = {
        id: userData.email,  // email as ID
        jobTitle: userData.preferences.jobTitle || '', // Provide default value if missing
        keywords: userData.preferences.keywords || [],  // Default to empty array if missing
        category: userData.preferences.category || '',  // Default to empty string if missing
        frequency: userData.preferences.frequency || 'Daily', // Default to 'Daily' if missing
        email: userData.email,
        city: userData.preferences.city || '',  // Default to empty string if missing
        createdAt: userData.createdAt || new Timestamp(0, 0), // Default to timestamp 0 if missing
        updatedAt: userData.updatedAt || new Timestamp(0, 0) // Default to timestamp 0 if missing
      };
  
      preferences.push(userPreference);
    }
  });
  
  return preferences;
}
