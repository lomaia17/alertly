// components/ProblemSolver.tsx
export default function ProblemSolver() {
    return (
      <section className="py-20 px-6 bg-white dark:bg-black text-center">
        <h2 className="text-3xl font-bold mb-10 text-gray-900 dark:text-white">Why Alertly?</h2>
        <div className="grid md:grid-cols-2 gap-10 max-w-5xl mx-auto text-left">
          <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-xl">
            <h3 className="text-xl font-semibold mb-2 text-indigo-600 dark:text-indigo-400">Job Searching is Time-Consuming</h3>
            <p className="text-gray-700 dark:text-gray-300">Scrolling through dozens of job boards daily is exhausting. Alertly automates that for you.</p>
          </div>
          <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-xl">
            <h3 className="text-xl font-semibold mb-2 text-indigo-600 dark:text-indigo-400">Opportunities Get Missed</h3>
            <p className="text-gray-700 dark:text-gray-300">Great jobs often get buried. Alertly helps you catch them before they’re gone.</p>
          </div>
          <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-xl">
            <h3 className="text-xl font-semibold mb-2 text-indigo-600 dark:text-indigo-400">You Deserve Focused Alerts</h3>
            <p className="text-gray-700 dark:text-gray-300">Only receive roles tailored to your interests, not just random listings.</p>
          </div>
          <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-xl">
            <h3 className="text-xl font-semibold mb-2 text-indigo-600 dark:text-indigo-400">Built for Busy People</h3>
            <p className="text-gray-700 dark:text-gray-300">Alertly works while you sleep. Wake up to opportunities in your inbox.</p>
          </div>
        </div>
      </section>
    );
  }
  