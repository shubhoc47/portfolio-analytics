import { motion } from "framer-motion";

import { itemReveal, sectionReveal, staggerContainer } from "./motion";

const trustBlocks = [
  {
    label: "Analytics-Driven Portfolio View",
    detail: "A single, coherent view of holdings, risk, diversification, and performance.",
  },
  {
    label: "Explainable Scoring",
    detail: "Every score includes transparent factors so insights are auditable and teachable.",
  },
  {
    label: "FastAPI + React Foundation",
    detail: "Modern backend/frontend architecture designed for reliability and iteration speed.",
  },
  {
    label: "Built for Extensibility",
    detail: "Provider and service layers support future market data, sentiment, and alerts.",
  },
];

export function TrustSection() {
  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={sectionReveal}
      className="space-y-5"
    >
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-600 dark:text-piq-accent">
          Engineering Trust
        </p>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl dark:text-slate-100">
          Purpose-built architecture for serious portfolio analytics.
        </h2>
      </div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="grid gap-4 sm:grid-cols-2"
      >
        {trustBlocks.map((block) => (
          <motion.article
            key={block.label}
            variants={itemReveal}
            whileHover={{ y: -3 }}
            className="rounded-xl border border-slate-200/80 bg-white/95 p-5 shadow-soft dark:border-white/10 dark:bg-piq-surface/70 dark:shadow-panel"
          >
            <p className="text-base font-semibold text-slate-900 dark:text-slate-100">{block.label}</p>
            <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{block.detail}</p>
          </motion.article>
        ))}
      </motion.div>
    </motion.section>
  );
}
