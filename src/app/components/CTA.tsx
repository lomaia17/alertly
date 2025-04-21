import { Rocket } from 'lucide-react';

export default function CTA() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 dark:from-gray-800 dark:via-gray-700 dark:to-gray-900 py-24 px-6 text-center  shadow-xl">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-center mb-6">
          <Rocket size={48} className="text-white animate-pulse" />
        </div>
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Ready to automate your job hunt?
        </h2>
        <p className="text-lg md:text-xl text-white mb-8 opacity-80">
          Join hundreds of users already finding jobs smarter and faster with Alertly.
        </p>
        <a
          href="/register"
          className="inline-block px-10 py-5 bg-white text-gray-900 font-semibold rounded-full shadow-lg hover:shadow-xl transition duration-300 ease-in-out transform hover:scale-105"
        >
          Create Free Account
        </a>
      </div>
    </section>
  );
}
