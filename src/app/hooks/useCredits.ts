import { useState, useEffect } from 'react';
import { db } from '../lib/fireBaseConfig';
import { doc, onSnapshot } from 'firebase/firestore';

export const useCredits = (uid: string | null) => {
  const [credits, setCredits] = useState<number | null>(null);

  useEffect(() => {
    if (uid) {
      const creditsRef = doc(db, 'credits', uid);

      // Set up a real-time listener
      const unsubscribe = onSnapshot(creditsRef, (docSnap) => {
        if (docSnap.exists()) {
          const userData = docSnap.data();
          setCredits(userData?.credits || 0);
        } else {
          setCredits(0);  // Handle case where the document doesn't exist
        }
      });

      // Clean up the listener when component is unmounted or UID changes
      return () => unsubscribe();
    }
  }, [uid]);

  return credits;
};
