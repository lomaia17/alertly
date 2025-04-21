import { FiSearch, FiEyeOff, FiBell, FiClock } from "react-icons/fi";

const features = [
  {
    title: "Job Searching is Time-Consuming",
    description: "Scrolling through dozens of job boards daily is exhausting. Alertly automates that for you.",
    icon: <FiSearch />,
  },
  {
    title: "Opportunities Get Missed",
    description: "Great jobs often get buried. Alertly helps you catch them before they’re gone.",
    icon: <FiEyeOff />,
  },
  {
    title: "You Deserve Focused Alerts",
    description: "Only receive roles tailored to your interests, not just random listings.",
    icon: <FiBell />,
  },
  {
    title: "Built for Busy People",
    description: "Alertly works while you sleep. Wake up to opportunities in your inbox.",
    icon: <FiClock />,
  },
];

export default function ProblemSolver() {
  return (
    <section className="py-28 px-8 bg-white dark:bg-black text-center">
      <h2 className="text-4xl sm:text-5xl font-bold mb-14 text-gray-900 dark:text-white">
        Why Alertly?
      </h2>
      <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto text-left">
        {features.map((feature, index) => (
          <div
            key={index}
            className="group relative bg-gradient-to-r from-indigo-500 to-purple-500 p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all overflow-hidden"
          >
            {/* Glowing Background Shape */}
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-2xl opacity-30 group-hover:scale-110 transition-transform duration-500" />

            {/* Icon */}
            <div className="mb-5 inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 backdrop-blur-lg text-white text-3xl shadow-inner shadow-white/10 border border-white/20">
              {feature.icon}
            </div>

            {/* Title and Text */}
            <h3 className="text-2xl font-semibold mb-3 text-white">{feature.title}</h3>
            <p className="text-white/80 leading-relaxed">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
