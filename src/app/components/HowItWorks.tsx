import { MessageSquareHeart, Globe, MailOpen } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      title: '1. Set Your Interests',
      desc: 'Choose job titles, keywords, or categories that match what you’re looking for.',
      icon: <MessageSquareHeart size={32} className="text-indigo-600 dark:text-white" />,
    },
    {
      title: '2. We Scan the Web',
      desc: 'Our bot checks multiple job boards daily so you don’t have to.',
      icon: <Globe size={32} className="text-indigo-600 dark:text-white" />,
    },
    {
      title: '3. Get Daily Alerts',
      desc: 'Receive curated job opportunities directly to your inbox every morning.',
      icon: <MailOpen size={32} className="text-indigo-600 dark:text-white" />,
    },
  ];

  return (
    <section className="py-32 px-8 bg-gray-50 dark:bg-gray-900 text-center">
      <h2 className="text-4xl sm:text-5xl font-bold mb-20 text-gray-900 dark:text-white">How It Works</h2>
      <div className="grid md:grid-cols-3 gap-12 max-w-7xl mx-auto">
        {steps.map((step, index) => (
          <div
            key={index}
            className="group p-10 rounded-2xl bg-white dark:bg-gray-800 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 border border-gray-200 dark:border-gray-700 relative overflow-hidden"
          >

            {/* Icon Wrapper */}
            <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-800 shadow-md group-hover:rotate-6 transition-transform">
              {step.icon}
            </div>

            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
              {step.title}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-base sm:text-lg leading-relaxed">
              {step.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
