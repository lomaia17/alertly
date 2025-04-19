// pages/api/auth/linkedin.ts

import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const redirectUri = 'http://localhost:3000/api/auth/linkedin/callback';
  const clientId = '77uhsm7ecc3lwv';
  const state = 'random_string_or_hash'; // Optional: for CSRF protection

  const linkedinAuthUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(
    redirectUri!
  )}&scope=r_liteprofile%20r_emailaddress&state=${state}`;

  res.redirect(linkedinAuthUrl);
}
