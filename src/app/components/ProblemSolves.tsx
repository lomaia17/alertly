export default function ProblemSolver() {
  return (
    <section className="py-28 px-8 bg-white dark:bg-black text-center">
      <h2 className="text-4xl sm:text-5xl font-bold mb-14 text-gray-900 dark:text-white">
        Why Alertly?
      </h2>
      <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto text-left">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all">
          <h3 className="text-2xl font-semibold mb-3 text-white">Job Searching is Time-Consuming</h3>
          <p className="text-white opacity-80">
            Scrolling through dozens of job boards daily is exhausting. Alertly automates that for you.
          </p>
        </div>
        <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all">
          <h3 className="text-2xl font-semibold mb-3 text-white">Opportunities Get Missed</h3>
          <p className="text-white opacity-80">
            Great jobs often get buried. Alertly helps you catch them before they’re gone.
          </p>
        </div>
        <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all">
          <h3 className="text-2xl font-semibold mb-3 text-white">You Deserve Focused Alerts</h3>
          <p className="text-white opacity-80">
            Only receive roles tailored to your interests, not just random listings.
          </p>
        </div>
        <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all">
          <h3 className="text-2xl font-semibold mb-3 text-white">Built for Busy People</h3>
          <p className="text-white opacity-80">
            Alertly works while you sleep. Wake up to opportunities in your inbox.
          </p>
        </div>
      </div>
    </section>
  );
}
