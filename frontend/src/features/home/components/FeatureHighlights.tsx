import { motion } from "framer-motion";

import { itemReveal, sectionReveal, staggerContainer } from "./motion";

const features = [
  {
    id: "feature-unified-view",
    title: "Unified Portfolio View",
    description: "Track holdings, risk, and health from one decision-ready workspace.",
  },
  {
    id: "feature-explainable-metrics",
    title: "Explainable Metrics",
    description: "Drill into the factors behind every score with full context.",
  },
  {
    id: "feature-benchmark-intelligence",
    title: "Benchmark Intelligence",
    description: "Compare outcomes versus SPY with instantly readable deltas.",
  },
  {
    id: "feature-guided-decisions",
    title: "Guided Decision Support",
    description: "Act faster with prioritized signals that point to what needs attention.",
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
      className="scroll-mt-24 space-y-5 rounded-2xl border border-slate-200/60 bg-[linear-gradient(180deg,rgba(238,246,255,0.44),rgba(224,236,254,0.3))] p-5 shadow-[0_14px_28px_-24px_rgba(15,23,42,0.65)] dark:border-slate-700/70 dark:bg-[linear-gradient(180deg,rgba(12,22,41,0.74),rgba(11,20,38,0.45))] sm:p-6"
    >
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-700 dark:text-cyan-300">
          Capabilities
        </p>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
          Core analytics for high-conviction decisions.
        </h2>
      </div>

      <motion.div
        variants={staggerContainer}
        className="grid gap-4 sm:grid-cols-2"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        {features.map((feature) => (
          <motion.article
            key={feature.id}
            id={feature.id}
            variants={itemReveal}
            whileHover={{ y: -4 }}
            className="scroll-mt-24 rounded-xl border border-slate-200/80 bg-white/70 p-5 shadow-[0_16px_26px_-22px_rgba(15,23,42,0.65)] transition dark:border-slate-700/70 dark:bg-slate-900/70"
          >
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">{feature.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{feature.description}</p>
          </motion.article>
        ))}
      </motion.div>
    </motion.section>
  );
}
