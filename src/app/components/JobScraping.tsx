// components/JobScraping.tsx
'use client';

import { useState, useEffect } from 'react';
import { getUserPreferences } from '../lib/fireBaseConfig'; 

const JobScraping = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [userPreferences, setUserPreferences] = useState<any[]>([]);

  // Fetch user preferences on component mount
  useEffect(() => {
    const fetchUserPreferences = async () => {
      try {
        const preferences = await getUserPreferences();
        setUserPreferences(preferences);
      } catch (error) {
        console.error('Error fetching preferences:', error);
        setMessage('Failed to load user preferences.');
      }
    };

    fetchUserPreferences();
  }, []); // Empty dependency array ensures this runs once on component mount

  const handleJobScraping = async () => {
    setLoading(true);
    setMessage('');
    
    if (!userPreferences || userPreferences.length === 0) {
      setMessage('No preferences available to scrape.');
      setLoading(false);
      return;
    }
    
    try {
      for (const preference of userPreferences) {
        const response = await fetch('/api/job-scraping', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userPreferences: [preference] }),
        });
  
        if (response.ok) {
          const { message } = await response.json();
          setMessage(message); // Display the message returned from API
        } else {
          setMessage('There was an error triggering the job scraping.');
        }
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('Failed to trigger job scraping. Please try again later.');
    }
    
    setLoading(false);
  };
  
  
  
  

  return (
    <div className="job-scraping-container">
      <h2>Job Scraping</h2>
      <button
      onClick={handleJobScraping}
        className="bg-blue-500 text-white px-4 py-2 rounded"
        disabled={loading}
      >
        {loading ? 'Processing...' : 'Start Job Scraping'}
      </button>

      {message && <p className="mt-2">{message}</p>}
    </div>
  );
};

export default JobScraping;
