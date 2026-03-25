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

const sectorRows = [
  { label: "Technology", value: 44, color: "bg-piq-accent" },
  { label: "Healthcare", value: 21, color: "bg-piq-profit" },
  { label: "ETF", value: 19, color: "bg-marketing-400" },
  { label: "Consumer", value: 16, color: "bg-amber-500" },
];

const cardBase =
  "rounded-2xl border border-white/[0.06] bg-card-dashboard shadow-card-lift transition duration-300 hover:-translate-y-1 hover:border-white/10";

export function ProductPreview() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="space-y-16 sm:space-y-20">
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={sectionReveal}
        className="space-y-6"
        aria-labelledby="portfolio-intelligence-heading"
      >
        <div className="max-w-2xl space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-piq-accent">Preview</p>
          <h2
            id="portfolio-intelligence-heading"
            className="text-2xl font-semibold tracking-tight text-piq-text-primary sm:text-[32px] sm:leading-tight"
          >
            Portfolio intelligence
          </h2>
          <p className="text-base leading-[1.6] text-piq-text-muted">
            A single command view of performance, positioning, and signal health—built for fast
            orientation before you drill in.
          </p>
        </div>

        <motion.article
          className={`${cardBase} p-5 sm:p-6`}
          animate={
            reduceMotion
              ? undefined
              : {
                  y: [0, -3, 0],
                }
          }
          transition={{ duration: 7.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-piq-text-muted">
                Performance Overview
              </p>
              <h3 className="mt-1 text-xl font-semibold text-piq-text-primary">Portfolio Control Center</h3>
            </div>
            <span className="rounded-full border border-piq-profit/35 bg-piq-profit/10 px-2.5 py-1 text-xs font-medium text-piq-profit">
              Example Signal Feed
            </span>
          </div>

          <div className="rounded-2xl border border-white/[0.06] bg-piq-card-surface/80 p-4">
            <svg viewBox="0 0 300 80" className="h-24 w-full" aria-hidden="true">
              <polyline
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                className="text-piq-accent"
                points={chartPoints.join(" ")}
              />
            </svg>
            <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
              <div className="rounded-xl border border-white/[0.06] bg-piq-canvas/60 px-3 py-2.5">
                <p className="text-xs uppercase tracking-wide text-piq-text-muted">Return</p>
                <p className="mt-1 font-semibold text-piq-profit">+12.4%</p>
              </div>
              <div className="rounded-xl border border-white/[0.06] bg-piq-canvas/60 px-3 py-2.5">
                <p className="text-xs uppercase tracking-wide text-piq-text-muted">Volatility</p>
                <p className="mt-1 font-semibold text-amber-400">Moderate</p>
              </div>
              <div className="rounded-xl border border-white/[0.06] bg-piq-canvas/60 px-3 py-2.5">
                <p className="text-xs uppercase tracking-wide text-piq-text-muted">Focus</p>
                <p className="mt-1 font-semibold text-piq-text-primary">Balanced</p>
              </div>
            </div>
          </div>
        </motion.article>
      </motion.section>

      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={sectionReveal}
        className="space-y-6"
        aria-labelledby="analytics-preview-heading"
      >
        <div className="max-w-2xl space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-piq-accent">Dashboard</p>
          <h2
            id="analytics-preview-heading"
            className="text-2xl font-semibold tracking-tight text-piq-text-primary sm:text-[32px] sm:leading-tight"
          >
            Analytics preview
          </h2>
          <p className="text-base leading-[1.6] text-piq-text-muted">
            Core scores and exposure in one glance—mirroring how PortfolioIQ surfaces risk,
            diversification, and benchmark context.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <motion.article
            className={`${cardBase} p-5`}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-piq-text-muted">
              Diversification
            </p>
            <p className="mt-2 text-3xl font-semibold tabular-nums text-piq-text-primary">74.2</p>
            <p className="mt-1 text-sm text-piq-profit">Strong spread</p>
            <div className="mt-4 h-2 rounded-full bg-slate-800/80">
              <div className="h-2 w-[74%] rounded-full bg-piq-profit" />
            </div>
          </motion.article>

          <motion.article
            className={`${cardBase} p-5`}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-piq-text-muted">
              Risk score
            </p>
            <p className="mt-2 text-3xl font-semibold tabular-nums text-piq-text-primary">38.2</p>
            <p className="mt-1 text-sm text-amber-400/95">Within tolerance</p>
            <div className="mt-4 h-2 rounded-full bg-slate-800/80">
              <div className="h-2 w-[38%] rounded-full bg-amber-500" />
            </div>
          </motion.article>

          <motion.article
            className={`${cardBase} p-5`}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-piq-text-muted">
              Benchmark delta
            </p>
            <p className="mt-2 text-3xl font-semibold tabular-nums text-piq-accent">+2.1%</p>
            <p className="mt-1 text-sm text-piq-text-muted">vs SPY (example)</p>
            <div className="mt-4 h-2 rounded-full bg-slate-800/80">
              <div className="h-2 w-[62%] rounded-full bg-piq-accent" />
            </div>
          </motion.article>

          <motion.article
            className={`${cardBase} p-5`}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-piq-text-muted">
              Sector exposure
            </p>
            <p className="mt-2 text-3xl font-semibold text-piq-text-primary">4</p>
            <p className="mt-1 text-sm text-piq-text-muted">Active sleeves</p>
            <ul className="mt-4 space-y-2">
              {sectorRows.slice(0, 3).map((row) => (
                <li key={row.label} className="flex items-center justify-between text-xs">
                  <span className="text-piq-text-muted">{row.label}</span>
                  <span className="font-medium tabular-nums text-piq-text-primary">{row.value}%</span>
                </li>
              ))}
            </ul>
          </motion.article>
        </div>

        <motion.article
          className={`${cardBase} p-5 sm:p-6`}
          animate={
            reduceMotion
              ? undefined
              : {
                  y: [0, 4, 0],
                }
          }
          transition={{ duration: 8.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-piq-text-muted">
            Allocation detail
          </p>
          <h3 className="mt-2 text-lg font-semibold text-piq-text-primary">Sector exposure snapshot</h3>
          <div className="mt-5 space-y-3">
            {sectorRows.map((row) => (
              <div key={row.label}>
                <div className="mb-1 flex justify-between text-xs text-piq-text-muted">
                  <span>{row.label}</span>
                  <span className="tabular-nums text-piq-text-primary">{row.value}%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-800/80">
                  <div className={`h-2 rounded-full ${row.color}`} style={{ width: `${row.value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </motion.article>
      </motion.section>
    </div>
  );
}
