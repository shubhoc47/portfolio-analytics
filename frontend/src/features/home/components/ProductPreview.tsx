import { motion, useReducedMotion } from "framer-motion";

import { sectionReveal } from "./motion";

const chartPoints = [
  "8,64",
  "50,38",
  "98,46",
  "146,22",
  "194,30",
  "242,18",
  "290,26",
];

export function ProductPreview() {
  const reduceMotion = useReducedMotion();

  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.25 }}
      variants={sectionReveal}
      className="grid gap-4 lg:grid-cols-3"
    >
      <motion.article
        className="rounded-2xl border border-slate-200/70 bg-[radial-gradient(circle_at_18%_0%,rgba(125,211,252,0.2),transparent_45%),linear-gradient(140deg,rgba(16,31,59,0.98),rgba(18,34,64,0.94))] p-5 shadow-[0_20px_34px_-24px_rgba(15,23,42,0.75)] dark:border-slate-700/70 dark:bg-[radial-gradient(circle_at_18%_0%,rgba(56,189,248,0.16),transparent_45%),linear-gradient(140deg,rgba(10,20,41,0.98),rgba(14,28,52,0.94))] lg:col-span-2"
        animate={
          reduceMotion
            ? undefined
            : {
                y: [0, -4, 0],
              }
        }
        transition={{ duration: 7.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-300">
              Performance Overview
            </p>
            <h2 className="mt-1 text-xl font-semibold text-white">Portfolio Control Center</h2>
          </div>
          <span className="rounded-full border border-emerald-300/40 bg-emerald-400/10 px-2.5 py-1 text-xs font-medium text-emerald-200">
            Example Signal Feed
          </span>
        </div>

        <div className="rounded-xl border border-slate-300/20 bg-slate-950/55 p-4 dark:border-slate-700/80 dark:bg-slate-900/65">
          <svg viewBox="0 0 300 80" className="h-24 w-full" aria-hidden="true">
            <polyline
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              className="text-cyan-400"
              points={chartPoints.join(" ")}
            />
          </svg>
          <div className="mt-3 grid gap-3 text-sm text-slate-300 sm:grid-cols-3">
            <div className="rounded-lg border border-slate-300/15 bg-slate-950/75 px-3 py-2 dark:border-slate-700/70">
              <p className="text-xs uppercase tracking-wide text-slate-400">Return</p>
              <p className="mt-1 font-semibold text-emerald-300">+12.4%</p>
            </div>
            <div className="rounded-lg border border-slate-300/15 bg-slate-950/75 px-3 py-2 dark:border-slate-700/70">
              <p className="text-xs uppercase tracking-wide text-slate-400">Risk Score</p>
              <p className="mt-1 font-semibold text-amber-400">38.2</p>
            </div>
            <div className="rounded-lg border border-slate-300/15 bg-slate-950/75 px-3 py-2 dark:border-slate-700/70">
              <p className="text-xs uppercase tracking-wide text-slate-400">SPY Delta</p>
              <p className="mt-1 font-semibold text-cyan-300">+2.1%</p>
            </div>
          </div>
        </div>
      </motion.article>

      <motion.aside
        className="rounded-2xl border border-slate-200/70 bg-[radial-gradient(circle_at_50%_-15%,rgba(99,102,241,0.28),transparent_48%),linear-gradient(180deg,rgba(19,34,63,0.94),rgba(10,18,37,0.95))] p-5 shadow-[0_20px_34px_-24px_rgba(15,23,42,0.75)] dark:border-slate-700/70 dark:bg-[radial-gradient(circle_at_50%_-15%,rgba(99,102,241,0.2),transparent_48%),linear-gradient(180deg,rgba(13,24,48,0.94),rgba(8,15,32,0.95))]"
        animate={
          reduceMotion
            ? undefined
            : {
                y: [0, 5, 0],
              }
        }
        transition={{ duration: 8.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-300">
          Allocation Intelligence
        </p>
        <h3 className="mt-2 text-lg font-semibold text-white">Sector Exposure Snapshot</h3>
        <div className="mt-4 space-y-3">
          {[
            { label: "Technology", value: 44, color: "bg-cyan-400" },
            { label: "Healthcare", value: 21, color: "bg-emerald-500" },
            { label: "ETF", value: 19, color: "bg-violet-400" },
            { label: "Consumer", value: 16, color: "bg-amber-500" },
          ].map((row) => (
            <div key={row.label}>
              <div className="mb-1 flex justify-between text-xs text-slate-300">
                <span>{row.label}</span>
                <span>{row.value}%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-700/70">
                <div className={`h-2 rounded-full ${row.color}`} style={{ width: `${row.value}%` }} />
              </div>
            </div>
          ))}
        </div>
      </motion.aside>
    </motion.section>
  );
}
