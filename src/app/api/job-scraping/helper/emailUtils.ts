// utils/emailUtils.ts
import { Resend } from 'resend';
import { UserPreference, JobA } from '../types';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmailNotification = async (preferences: UserPreference[], jobs: JobA[]) => {
  for (const preference of preferences) {
    const userEmail = preference?.email;
    if (!userEmail) {
      console.error('No email address found in preferences.');
      return;
    }

    const hasJobs = jobs && jobs.length > 0;

    const jobListHtml = hasJobs
      ? jobs
          .map(
            (job) => `
              <tr>
                <td style="padding: 15px; background-color: #ffffff; border-radius: 8px; margin-bottom: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                  <h3 style="margin: 0 0 5px; color: #007bff;">${job.jobTitle}</h3>
                  <p style="margin: 5px 0;"><strong>Company:</strong> ${job.company}</p>
                  ${job.location ? `<p style="margin: 5px 0;"><strong>Location:</strong> ${job.location}</p>` : ''}
                  ${job.postedTime ? `<p style="margin: 5px 0;"><strong>Posted:</strong> ${job.postedTime}</p>` : ''}
                  <a href="${job.link}" style="display: inline-block; margin-top: 10px; padding: 8px 12px; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 4px;" target="_blank">View Job</a>
                </td>
              </tr>
            `
          )
          .join('')
      : `<tr><td style="padding: 15px; background-color: #ffffff; border-radius: 8px;">
          <p style="margin: 0;">No new opportunities were found today based on your preferences. We’ll keep checking and let you know when something comes up!</p>
         </td></tr>`;

    const subject = hasJobs
      ? `🔍 ${jobs.length} New Job Match${jobs.length > 1 ? 'es' : ''} for You`
      : `📭 No New Job Matches Today – We're Still Searching!`;

    try {
      await resend.emails.send({
        from: 'Alertly <onboarding@resend.dev>',
        to: userEmail,
        subject,
        html: `
          <html>
            <head>
              <meta charset="UTF-8" />
              <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            </head>
            <body style="margin: 0; padding: 0; background-color: #f4f4f9; font-family: Arial, sans-serif; color: #333;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding: 20px;">
                    <table width="600" align="center" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden;">
                      <tr>
                        <td style="background-color: #007bff; color: #ffffff; padding: 20px; text-align: center;">
                          <h1 style="margin: 0;">🎯 Alertly Job Alerts</h1>
                          <p style="margin: 5px 0;">Your personalized job updates</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 20px;">
                          <h2 style="margin-top: 0;">Hi there,</h2>
                          <p>Here are today's opportunities that match your preferences:</p>
                          <table width="100%" cellpadding="0" cellspacing="0">
                            ${jobListHtml}
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="background-color: #f1f1f5; padding: 15px; text-align: center; font-size: 12px; color: #888;">
                          <p style="margin: 0;">You're receiving this because you subscribed to Alertly job updates.</p>
                          <p style="margin: 0;">Want to change your preferences? <a href="#" style="color: #007bff;">Update here</a></p>
                          <p style="margin: 0;">© ${new Date().getFullYear()} Alertly</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </body>
          </html>
        `,
      });
    } catch (error) {
      console.error(`Failed to send email to ${userEmail}:`, error);
    }
  }
};
