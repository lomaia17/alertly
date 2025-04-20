// lib/api.ts
import { db } from './fireBaseConfig';
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  Timestamp,
  where,
  query
} from 'firebase/firestore';

// Define the structure for the Alert data
interface Alert {
  id: string;
  jobTitle: string;
  keywords: string;
  category: string;
  frequency: 'Daily' | 'Weekly';
  email: string;
  city: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

const alertsCollection = collection(db, 'alerts');

// Fetch alerts for the current user
export const getAlerts = async (email: string): Promise<Alert[]> => {
  const q = query(alertsCollection, where('email', '==', email));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Alert[];
};

// Function to create a new alert
export const createAlert = async (data: Omit<Alert, 'id' | 'createdAt' | 'updatedAt'>): Promise<Alert> => {
  const alertData = {
    ...data,
    createdAt: Timestamp.fromDate(new Date()), // Add created timestamp
    updatedAt: Timestamp.fromDate(new Date()), // Add updated timestamp
  };
  const docRef = await addDoc(alertsCollection, alertData);
  return { id: docRef.id, ...alertData };
};

// Function to delete an alert by id
export const deleteAlert = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, 'alerts', id));
};

// Function to update an existing alert
export const updateAlert = async (id: string, data: Omit<Alert, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> => {
  const updatedData = {
    ...data,
    updatedAt: Timestamp.fromDate(new Date()), // Update the updatedAt timestamp
  };
  const alertRef = doc(db, 'alerts', id);
  await updateDoc(alertRef, updatedData);
};
