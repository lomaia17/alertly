import { Metadata } from 'next';
import Hero from './components/Hero';
import HowItWorks from './components/HowItWorks';
import ProblemSolver from './components/ProblemSolves';
import AlertPlans from './components/AlertPlans'; 
import CTA from './components/CTA';
import Footer from './components/Footer';

// Export metadata for SEO and social media sharing
export const metadata: Metadata = {
  title: 'Alertly - Your Job Hunt Sidekick 🦾',
  description: 'Alertly watches job boards for you and sends you daily job leads based on your interests.',
  keywords: 'job search, job alerts, job hunt, employment, job opportunities, career',

  // Open Graph Tags for Social Media
  openGraph: {
    type: 'website',
    title: 'Alertly - Your Job Hunt Sidekick 🦾',
    description: 'Alertly watches job boards for you and sends you daily job leads based on your interests.',
    url: 'https://alertly-two.vercel.app/', // Replace with your page URL
    images: [
      {
        url: '/favicon.ico', // Replace with your image URL
        width: 1200,
        height: 630,
        alt: 'Alertly Logo',
      },
    ],
  },

};

export default function Home() {
  return (
    <main className="bg-white dark:bg-black text-black dark:text-white transition-colors duration-300">
      <Hero />
      <HowItWorks />
      <ProblemSolver />
      <CTA />
      <AlertPlans />
      <Footer />
    </main>
  );
}
