// pages/api/auth/linkedin/callback.ts

import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const code = req.query.code as string;

  if (!code) {
    return res.status(400).json({ error: 'Authorization code is missing' });
  }

  const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: 'http://localhost:3000/api/auth/linkedin/callback',
      client_id: '77uhsm7ecc3lwv',
      client_secret: 'WPL_AP1.aPNlkg4WicQaDJVi.j4IF4A==',
    }),
  });

  const tokenData = await tokenResponse.json();

  if (!tokenData.access_token) {
    return res.status(500).json({ error: 'Failed to retrieve access token', details: tokenData });
  }

  // Optional: Fetch user's LinkedIn profile
  const profileResponse = await fetch('https://api.linkedin.com/v2/me', {
    headers: {
      Authorization: `Bearer ${tokenData.access_token}`,
    },
  });
  const profile = await profileResponse.json();

  const emailResponse = await fetch('https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))', {
    headers: {
      Authorization: `Bearer ${tokenData.access_token}`,
    },
  });
  const emailData = await emailResponse.json();

  // You could store `profile` and `emailData` in a database here

  return res.status(200).json({
    message: 'LinkedIn login successful!',
    token: tokenData.access_token,
    profile,
    email: emailData.elements?.[0]?.['handle~']?.emailAddress,
  });
}
