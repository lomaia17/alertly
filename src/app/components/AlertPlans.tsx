import Link from 'next/link';


export default function AlertPlans() {
    return (
      <section className="py-20 px-6 bg-white dark:bg-black text-center">
        <h2 className="text-3xl font-bold mb-10 text-gray-900 dark:text-white">Choose Your Alert Plan</h2>
        
        <div className="grid md:grid-cols-2 gap-10 max-w-5xl mx-auto text-left">
          {/* Free Plan */}
          <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-xl shadow-md">
            <h3 className="text-xl font-semibold mb-2 text-blue-600 dark:text-blue-400">Free Plan</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">Receive notifications manually when there are new job alerts. Simply click a button to get notified.</p>
            <Link href="/dashboard">
                <button className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300 cursor-pointer">
                Get Manual Alerts
                </button>
            </Link>
          </div>
  
          {/* Premium Plan */}
          <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-xl shadow-md">
            <h3 className="text-xl font-semibold mb-2 text-green-600 dark:text-green-400">Premium Plan</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">Pay 5 GEL/month to receive job alerts on a daily or weekly basis based on your preference.</p>
            <button className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-300 cursor-pointer">
              Subscribe for 5 GEL/month
            </button>
          </div>
        </div>
      </section>
    );
  }
  