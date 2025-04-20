// components/HowItWorks.tsx
import { MessageSquareHeart, Globe, MailOpen } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      title: '1. Set Your Interests',
      desc: 'Choose job titles, keywords, or categories that match what you’re looking for.',
      icon: <MessageSquareHeart size={40} className="text-indigo-600 dark:text-white mb-4 mx-auto" />,
    },
    {
      title: '2. We Scan the Web',
      desc: 'Our bot checks multiple job boards daily so you don’t have to.',
      icon: <Globe size={40} className="text-white dark:text-white mb-4 mx-auto" />,
    },
    {
      title: '3. Get Daily Alerts',
      desc: 'Receive curated job opportunities directly to your inbox every morning.',
      icon: <MailOpen size={40} className="text-indigo-600 dark:text-white mb-4 mx-auto" />,
    },
  ];

  return (
    <section className="py-20 px-6 bg-gray-50 dark:bg-gray-900 text-center">
      <h2 className="text-3xl sm:text-4xl font-bold mb-12 text-gray-900 dark:text-white">How It Works</h2>
      <div className="grid md:grid-cols-3 gap-10 max-w-6xl mx-auto">
        {steps.map((step, index) => (
          <div key={index} className="p-6 rounded-lg bg-white dark:bg-gray-800 shadow-md hover:shadow-xl transition-all">
            {step.icon}
            <h3 className="text-xl sm:text-2xl font-semibold text-indigo-600 dark:text-indigo-400 mb-2">
              {step.title}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">{step.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
