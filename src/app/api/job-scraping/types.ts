// types.ts
export type JobA = {
    jobTitle: string;
    company: string;
    published?: string;
    deadline?: string;
    postedTime?: string;
    location?: string;
    link: string;
    source: 'Jobs.ge' | 'LinkedIn';
  };
  
  export type UserPreference = {
    id: string;
    email: string;
    jobTitle: string;
    city?: string;
    keywords?: string;
    frequency: string;
    category: string;
  };
  