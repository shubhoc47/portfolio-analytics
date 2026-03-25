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

const featureCardClass =
  "rounded-2xl border border-white/[0.06] bg-piq-card-surface p-5 shadow-card-lift transition-colors duration-300 hover:border-white/15";

export function FeatureHighlights() {
  return (
    <motion.section
      id="features"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.25 }}
      variants={sectionReveal}
      className="scroll-mt-24 space-y-5 border-t border-white/[0.06] pt-16 sm:pt-20"
    >
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-piq-accent">Capabilities</p>
        <h2 className="text-2xl font-semibold tracking-tight text-piq-text-primary sm:text-[32px] sm:leading-tight">
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
            className={`scroll-mt-24 ${featureCardClass}`}
          >
            <h3 className="text-base font-semibold text-piq-text-primary">{feature.title}</h3>
            <p className="mt-2 text-base leading-[1.6] text-piq-text-muted">{feature.description}</p>
          </motion.article>
        ))}
      </motion.div>
    </motion.section>
  );
}
