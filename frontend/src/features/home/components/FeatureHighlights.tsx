import { motion } from "framer-motion";

import { itemReveal, sectionReveal, staggerContainer } from "./motion";

const features = [
  {
    title: "Portfolio Management",
    description: "Organize portfolios with clean workflows designed for disciplined investing.",
  },
  {
    title: "Holdings Tracking",
    description: "Track positions, value basis, and allocation structure with precision.",
  },
  {
    title: "Analytics Engine",
    description: "Break down diversification, risk, and health with transparent formulas.",
  },
  {
    title: "Benchmark Comparison",
    description: "Measure performance against the S&P 500 with clear relative insights.",
  },
  {
    title: "Explainable Insights",
    description: "Understand why metrics move using readable factor breakdowns and notes.",
  },
];

export function FeatureHighlights() {
  return (
    <motion.section
      id="features"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.25 }}
      variants={sectionReveal}
      className="space-y-5"
    >
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">Capabilities</p>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
          Built for portfolio decisions that require trust and clarity.
        </h2>
      </div>

      <motion.div
        variants={staggerContainer}
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        {features.map((feature) => (
          <motion.article
            key={feature.title}
            variants={itemReveal}
            whileHover={{ y: -4 }}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-soft transition"
          >
            <h3 className="text-base font-semibold text-slate-900">{feature.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{feature.description}</p>
          </motion.article>
        ))}
      </motion.div>
    </motion.section>
  );
}
