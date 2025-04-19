// lib/firebaseJobs.ts
import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  getDoc,
  setDoc,
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
export {app,auth, db };

// ✅ Fetch user preferences from "alerts" collection
export const getUserPreferences = async () => {
  const colRef = collection(db, 'alerts');
  const snapshot = await getDocs(colRef);

  return snapshot.docs.map(doc => ({
    id: doc.id, // email as ID
    ...doc.data(),
  }));
};



export const getSavedJobsForUser = async (email: string) => {
  const userDoc = doc(db, 'users', email); // Assuming users are stored by their email
  const docSnapshot = await getDoc(userDoc);

  if (docSnapshot.exists()) {
    return docSnapshot.data()?.jobs || []; // Return saved jobs or an empty array if not found
  } else {
    return [];
  }
};

// Function to save new jobs for a user
export const saveNewJobsForUser = async (email: string, jobs: any[]) => {
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
