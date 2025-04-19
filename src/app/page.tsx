import Hero from './components/Hero';
import HowItWorks from './components/HowItWorks';
import ProblemSolver from './components/ProblemSolves';
import CTA from './components/CTA';
import Footer from './components/Footer';

export default function Home() {
  return (
    <main className="bg-white dark:bg-black text-black dark:text-white transition-colors duration-300">
      <Hero />
      <HowItWorks />
      <ProblemSolver />
      <CTA />
      <Footer />
    </main>
  );
}
