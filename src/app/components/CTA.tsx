import { Rocket } from 'lucide-react';

export default function CTA() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-20 px-6 text-center">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-center mb-4">
          <Rocket size={36} className="text-white" />
        </div>
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Ready to automate your job hunt?
        </h2>
        <p className="text-lg mb-8">
          Join hundreds of users already finding jobs smarter and faster.
        </p>
        <a
          href="/register"
          className="inline-block px-8 py-4 bg-white text-gray-900 font-semibold rounded-full shadow-md hover:shadow-lg transition"
        >
          Create Free Account
        </a>
      </div>
    </section>
  );
}
