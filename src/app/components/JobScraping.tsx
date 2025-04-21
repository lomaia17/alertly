'use client';

import { useState, useEffect } from 'react';
import { db } from '../lib/fireBaseConfig';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs, query, where } from 'firebase/firestore';

interface UserPreferenceData {
  id: string;
  jobTitle: string;
  city: string;
  keywords: string[];
}

const JobScraping = () => {
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<string[]>([]);
  const [userPreferences, setUserPreferences] = useState<UserPreferenceData[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

    // Function to fetch user preferences from Firestore
    const getUserPreferences = async (uid: string): Promise<UserPreferenceData[]> => {
      try {
        const colRef = collection(db, 'alerts');
        const q = query(colRef, where('email', '==', uid));
        const snapshot = await getDocs(q);
  
        return snapshot.docs.map((doc) => ({
          id: doc.id, // Document ID can be treated as user identifier (or email)
          ...doc.data(), // Spread document data into the object
        })) as UserPreferenceData[];
      } catch (error) {
        console.error('Error fetching user preferences:', error);
        throw error;
      }
    };

  // Fetch user preferences from Firestore based on the UID
  const fetchUserPreferences = async (uid: string) => {
    try {
      const preferences = await getUserPreferences(uid);
      setUserPreferences(preferences);
    } catch (error) {
      console.error('Error fetching preferences:', error);
      setMessages(['❌ Failed to load user preferences.']);
    }
  };


  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Fetch user preferences when the user is signed in
        fetchUserPreferences(user.email!);
      } else {
        console.log('No user is signed in');
      }
    });

    return () => unsubscribe();
  }, []);

  const handleJobScraping = async () => {
    setLoading(true);
    setMessages([]);
    setIsModalOpen(true);  // Open the modal when scraping starts
    if (!userPreferences.length) {
      setMessages(['⚠️ No preferences available to scrape.']);
      setLoading(false);
      return;
    }

    const newMessages: string[] = [];

    try {
      // Send only the current user's preference for job scraping
      const response = await fetch('/api/job-scraping', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userPreferences }),
      });

      if (response.ok) {
        const { message } = await response.json();
        newMessages.push(`✅ ${message}`);  // Success message
      } else {
        newMessages.push('❌ Error scraping for job title in the specified city');
      }
    } catch (error) {
      console.error('Error:', error);
      newMessages.push('❌ Failed to trigger job scraping. Please try again later.');
    }

    setMessages(newMessages);
    setLoading(false);
  };

  const closeModal = () => {
    setIsModalOpen(false);  // Close the modal when user clicks close button
  };

  return (
    <>
      <div className="flex flex-col items-center space-y-6">
        {/* Button Section */}
        <button
          onClick={handleJobScraping}
          className={`w-full max-w-md px-5 py-3 rounded-lg text-white font-semibold transition-all duration-300 ${
            loading
              ? 'bg-blue-300 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
          }`}
          disabled={loading}
        >
          {loading ? 'Processing...' : '🚀 Start Job Scraping'}
        </button>
      </div>

      {/* Modal Section - Moved outside the main div */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex justify-center items-center bg-opacity-50 backdrop-blur-sm">
          {/* Background Overlay - Applying a stronger blur effect */}
          <div className="absolute inset-0 bg-black opacity-50 pointer-events-none" />

          <div className="relative bg-white p-8 rounded-lg shadow-lg max-w-lg w-full z-10">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Job Scraping Status</h2>
              <button
                onClick={closeModal}
                className="text-xl font-bold text-gray-600"
              >
                ×
              </button>
            </div>

            <div className="mt-4">
              {/* Display loading message when scraping is in progress */}
              {loading && messages.length === 0 && (
               <div className="p-3 rounded-lg shadow-sm text-sm bg-blue-100 text-blue-800 flex items-center gap-2">
               <span className="inline-block animate-spin">⏳</span>
               Waiting for results...
             </div>
              )}

              {/* Display messages after scraping completes */}
              {messages.length > 0 && (
                <>
                  {messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-lg shadow-sm text-sm mb-2 ${
                        msg.startsWith('✅') ? 'bg-green-100 text-green-800' :
                        msg.startsWith('⚠️') ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}
                    >
                      {msg}
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default JobScraping;
