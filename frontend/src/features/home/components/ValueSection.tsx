import { motion } from "framer-motion";

import { sectionReveal } from "./motion";

const valuePoints = [
  "Identify concentration risk before it impacts performance.",
  "Understand diversification quality beyond surface-level allocation.",
  "Compare outcomes against a benchmark with clear context.",
  "Keep analysis explainable for confident investment discussions.",
];

export function ValueSection() {
  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.25 }}
      variants={sectionReveal}
      className="grid gap-6 rounded-2xl border border-slate-200/80 bg-gradient-to-br from-slate-100/95 to-slate-200/50 p-6 shadow-panel lg:grid-cols-2 lg:p-8 dark:border-white/10 dark:from-piq-surface/60 dark:to-piq-canvas/90 dark:shadow-panel"
    >
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-600 dark:text-piq-accent">
          Why PortfolioIQ
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl dark:text-slate-100">
          Turn holdings data into confident investment decisions.
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          PortfolioIQ is designed to surface what matters: risk concentration, diversification
          strength, portfolio health, and benchmark-relative performance in one coherent workflow.
        </p>
      </div>

      <ul className="space-y-3">
        {valuePoints.map((point) => (
          <li
            key={point}
            className="flex gap-3 rounded-lg border border-slate-200/80 bg-white/90 p-3 dark:border-white/10 dark:bg-piq-canvas/80"
          >
            <span className="mt-1 inline-block h-2.5 w-2.5 shrink-0 rounded-full bg-gradient-primary" />
            <p className="text-sm text-slate-600 dark:text-slate-300">{point}</p>
          </li>
        ))}
      </ul>
    </motion.section>
  );
}
