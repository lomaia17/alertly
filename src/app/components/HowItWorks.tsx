import { MessageSquareHeart, Globe, MailOpen } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      title: '1. Set Your Interests',
      desc: 'Choose job titles, keywords, or categories that match what you’re looking for.',
      icon: <MessageSquareHeart size={50} className="text-indigo-600 dark:text-white mb-4 mx-auto" />,
    },
    {
      title: '2. We Scan the Web',
      desc: 'Our bot checks multiple job boards daily so you don’t have to.',
      icon: <Globe size={50} className="text-white dark:text-white mb-4 mx-auto" />,
    },
    {
      title: '3. Get Daily Alerts',
      desc: 'Receive curated job opportunities directly to your inbox every morning.',
      icon: <MailOpen size={50} className="text-indigo-600 dark:text-white mb-4 mx-auto" />,
    },
  ];

  return (
    <section className="py-32 px-8 bg-gray-50 dark:bg-gray-900 text-center">
      <h2 className="text-4xl sm:text-5xl font-bold mb-16 text-gray-900 dark:text-white">How It Works</h2>
      <div className="grid md:grid-cols-3 gap-12 max-w-7xl mx-auto">
        {steps.map((step, index) => (
          <div
            key={index}
            className="p-8 rounded-lg bg-white dark:bg-gray-800 shadow-md hover:shadow-xl transition-all transform hover:scale-105"
            role="article"
            aria-labelledby={`step-${index}`}
          >
            {step.icon}
            <h3 id={`step-${index}`} className="text-2xl sm:text-3xl font-semibold text-indigo-600 dark:text-indigo-400 mb-4">
              {step.title}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-base sm:text-lg leading-relaxed">{step.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
