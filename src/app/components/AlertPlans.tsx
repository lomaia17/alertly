import Link from 'next/link';

export default function AlertPlans() {
  return (
    <section className="py-28 px-8 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-center">
      <h2 className="text-4xl sm:text-5xl font-bold text-white mb-12">
        Choose Your Alert Plan
      </h2>

      <div className="grid md:grid-cols-2 gap-14 max-w-6xl mx-auto text-left">
        {/* Free Plan */}
        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all">
          <h3 className="text-2xl font-semibold mb-3 text-indigo-600 dark:text-indigo-400">Free Plan</h3>
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            Receive notifications manually when there are new job alerts. Simply click a button to get notified.
          </p>
          <Link href="/dashboard">
            <button className="px-8 py-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-all">
              Get Manual Alerts
            </button>
          </Link>
        </div>

        {/* Premium Plan */}
        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all">
          <h3 className="text-2xl font-semibold mb-3 text-green-600 dark:text-green-400">Premium Plan</h3>
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            Pay 5 GEL/month to receive job alerts on a daily or weekly basis based on your preference.
          </p>
          <button className="px-8 py-3 bg-green-600 text-white rounded-full hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-300 transition-all">
            Subscribe for 5 GEL/month
          </button>
        </div>
      </div>
    </section>
  );
}
