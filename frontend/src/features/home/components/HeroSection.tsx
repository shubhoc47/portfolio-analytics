import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";

import { Button } from "../../../components/ui/Button";
import { itemReveal, sectionReveal, staggerContainer } from "./motion";

export function HeroSection() {
  const reduceMotion = useReducedMotion();

  return (
    <motion.section
      initial="hidden"
      animate="visible"
      variants={sectionReveal}
      className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-brand-50/40 to-slate-50 p-6 shadow-soft sm:p-8 lg:p-10"
    >
      <div className="pointer-events-none absolute inset-0">
        <motion.div
          className="absolute -left-24 top-10 h-56 w-56 rounded-full bg-brand-100/60 blur-3xl"
          animate={reduceMotion ? undefined : { x: [0, 20, 0], y: [0, -12, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -right-24 bottom-6 h-64 w-64 rounded-full bg-indigo-100/60 blur-3xl"
          animate={reduceMotion ? undefined : { x: [0, -16, 0], y: [0, 14, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="relative grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]"
      >
        <div className="space-y-6">
          <motion.span
            variants={itemReveal}
            className="inline-flex rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-700"
          >
            Premium Portfolio Intelligence
          </motion.span>

          <motion.h1
            variants={itemReveal}
            className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl"
          >
            Make every portfolio decision with clarity and conviction.
          </motion.h1>

          <motion.p variants={itemReveal} className="max-w-xl text-base leading-relaxed text-slate-600">
            PortfolioIQ transforms holdings data into clear diversification, risk, health, and
            benchmark insights so you can evaluate performance with confidence.
          </motion.p>

          <motion.div variants={itemReveal} className="flex flex-wrap items-center gap-3">
            <Link to="/portfolios">
              <Button className="px-5 py-2.5">View Portfolios</Button>
            </Link>
            <a href="#features">
              <Button variant="secondary" className="px-5 py-2.5">
                Explore Analytics
              </Button>
            </a>
          </motion.div>

          <motion.div
            variants={itemReveal}
            className="grid max-w-lg gap-3 text-sm text-slate-600 sm:grid-cols-3"
          >
            <p className="rounded-lg border border-slate-200 bg-white/90 px-3 py-2">
              Transparent scoring model
            </p>
            <p className="rounded-lg border border-slate-200 bg-white/90 px-3 py-2">
              Benchmark-aware insights
            </p>
            <p className="rounded-lg border border-slate-200 bg-white/90 px-3 py-2">
              Extensible architecture
            </p>
          </motion.div>
        </div>

        <motion.div variants={itemReveal} className="relative">
          <div className="rounded-2xl border border-slate-200 bg-white/95 p-5 shadow-soft backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Portfolio Snapshot
            </p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">Health Score: 78.4</p>
            <p className="mt-1 text-sm text-slate-600">Strong allocation profile with balanced risk.</p>

            <div className="mt-5 space-y-3">
              <div>
                <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
                  <span>Diversification</span>
                  <span>74.2</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100">
                  <div className="h-2 w-[74%] rounded-full bg-emerald-500" />
                </div>
              </div>
              <div>
                <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
                  <span>Risk</span>
                  <span>34.8</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100">
                  <div className="h-2 w-[35%] rounded-full bg-amber-500" />
                </div>
              </div>
              <div>
                <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
                  <span>Benchmark Delta</span>
                  <span>+3.6%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100">
                  <div className="h-2 w-[62%] rounded-full bg-brand-600" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </motion.section>
  );
}
