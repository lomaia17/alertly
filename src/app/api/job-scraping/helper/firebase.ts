import { UserPreference } from "../types";
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const db = getFirestore();

export async function getAllUserPreferencesFromFirestore(): Promise<UserPreference[]> {
  const alertsCollection = collection(db, 'alerts');
  const snapshot = await getDocs(alertsCollection);
  
  const preferences: UserPreference[] = [];
  
  snapshot.forEach(doc => {
    const alertData = doc.data();
    
    // Check for required fields based on your screenshot
    if (alertData.email && alertData.jobTitle) {
      preferences.push({
        id: doc.id, // Include the document ID
        email: alertData.email,
        jobTitle: alertData.jobTitle,
        city: alertData.city || '', // Fallback for optional fields
        keywords: alertData.keywords || '',
        frequency: alertData.frequency || 'Daily', // Default from your screenshot
        category: alertData.category || ''
      });
    }
  });
  
  return preferences;
}
