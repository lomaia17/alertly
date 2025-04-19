// lib/api.ts
import { auth, db } from './fireBaseConfig';
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

const alertsCollection = collection(db, 'alerts');


export const getAlerts = async () => {
  const user = auth.currentUser;

  if (!user) {
    return [];
  }

  const q = query(alertsCollection, where('email', '==', user.email));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

// Function to create a new alert
export const createAlert = async (data: any) => {
  const alertData = {
    ...data,
    createdAt: Timestamp.fromDate(new Date()), // Add created timestamp
    updatedAt: Timestamp.fromDate(new Date()), // Add updated timestamp
  };
  const docRef = await addDoc(alertsCollection, alertData);
  return { id: docRef.id, ...alertData };
};

// Function to delete an alert by id
export const deleteAlert = async (id: string) => {
  await deleteDoc(doc(db, 'alerts', id));
};

// Function to update an existing alert
export const updateAlert = async (id: string, data: any) => {
  const updatedData = {
    ...data,
    updatedAt: Timestamp.fromDate(new Date()), // Update the updatedAt timestamp
  };
  const alertRef = doc(db, 'alerts', id);
  await updateDoc(alertRef, updatedData);
};
