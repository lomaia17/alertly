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
const firebaseConfig = {
  apiKey: "AIzaSyD9uC7PmX36l3OEvJ6YQvGLXfk_WUSI3gM",
  authDomain: "jobalerter-gl.firebaseapp.com",
  projectId: "jobalerter-gl",
  storageBucket: "jobalerter-gl.firebasestorage.app",
  messagingSenderId: "751495068422",
  appId: "1:751495068422:web:f2f1bd6b9b93189d67fc87",
};

// ✅ Initialize app & db
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app); // <- THIS is what you must pass to collection()

// ✅ Exporting db if needed elsewhere
export { app, auth, db };

// ✅ Define Types

// Define the structure of a Job
interface Job {
  id: string; // job identifier
  title: string;
  company: string;
  location: string;
  description: string;
  keyword:string,
}

// Define the structure of user preferences (Alert)
interface UserPreference {
  id: string; // email as ID
  jobTitle: string;
  keywords: string;
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
