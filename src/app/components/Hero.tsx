// components/Hero.tsx
import { Briefcase, MailCheck } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative overflow-hidden py-24 px-6 text-center bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Decorative Blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-purple-300 opacity-30 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-yellow-300 opacity-20 rounded-full blur-3xl -z-10"></div>

      <div className="max-w-4xl mx-auto">
        <div className="flex justify-center mb-6">
          <Briefcase size={48} className="text-indigo-600 dark:text-indigo-400" />
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-500 text-transparent bg-clip-text">
          Your Job Hunt Sidekick 🦾
        </h1>

        <p className="mt-6 text-lg sm:text-xl max-w-2xl mx-auto text-gray-700 dark:text-gray-300">
          Alertly watches job boards for you. Just tell it what roles or keywords you're into — and boom 💥,
          daily emails with fresh job leads.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="/register"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-full font-medium hover:bg-indigo-700 transition"
          >
            <MailCheck size={18} />
            Get Started
          </a>
          <a
            href="/login"
            className="px-6 py-3 border border-gray-400 dark:border-gray-600 text-gray-800 dark:text-white rounded-full font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            Log In
          </a>
        </div>
      </div>
    </section>
  );
}
