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
        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft lg:col-span-2"
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
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Performance Overview
            </p>
            <h2 className="mt-1 text-xl font-semibold text-slate-900">Investor Dashboard Preview</h2>
          </div>
          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
            Live-style Demo
          </span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <svg viewBox="0 0 300 80" className="h-24 w-full">
            <polyline
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              className="text-brand-600"
              points={chartPoints.join(" ")}
            />
          </svg>
          <div className="mt-3 grid gap-3 text-sm text-slate-600 sm:grid-cols-3">
            <div className="rounded-lg bg-white px-3 py-2">
              <p className="text-xs uppercase tracking-wide text-slate-500">Return</p>
              <p className="mt-1 font-semibold text-emerald-700">+12.4%</p>
            </div>
            <div className="rounded-lg bg-white px-3 py-2">
              <p className="text-xs uppercase tracking-wide text-slate-500">Risk Score</p>
              <p className="mt-1 font-semibold text-amber-700">38.2</p>
            </div>
            <div className="rounded-lg bg-white px-3 py-2">
              <p className="text-xs uppercase tracking-wide text-slate-500">SPY Delta</p>
              <p className="mt-1 font-semibold text-brand-700">+2.1%</p>
            </div>
          </div>
        </div>
      </motion.article>

      <motion.aside
        className="rounded-2xl border border-slate-200 bg-gradient-to-b from-brand-50 to-white p-5 shadow-soft"
        animate={
          reduceMotion
            ? undefined
            : {
                y: [0, 5, 0],
              }
        }
        transition={{ duration: 8.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Allocation Intelligence
        </p>
        <h3 className="mt-2 text-lg font-semibold text-slate-900">Sector Exposure Snapshot</h3>
        <div className="mt-4 space-y-3">
          {[
            { label: "Technology", value: 44, color: "bg-brand-600" },
            { label: "Healthcare", value: 21, color: "bg-emerald-500" },
            { label: "ETF", value: 19, color: "bg-indigo-500" },
            { label: "Consumer", value: 16, color: "bg-amber-500" },
          ].map((row) => (
            <div key={row.label}>
              <div className="mb-1 flex justify-between text-xs text-slate-600">
                <span>{row.label}</span>
                <span>{row.value}%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-200">
                <div className={`h-2 rounded-full ${row.color}`} style={{ width: `${row.value}%` }} />
              </div>
            </div>
          ))}
        </div>
      </motion.aside>
    </motion.section>
  );
}
