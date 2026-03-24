import { useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";

import { Button } from "../../../components/ui/Button";
import { itemReveal, sectionReveal, staggerContainer } from "./motion";

export function HeroSection() {
  const reduceMotion = useReducedMotion();
  const navigate = useNavigate();

  const featureChipTargets = [
    { label: "Explainable scoring", targetId: "feature-explainable-metrics" },
    { label: "Benchmark intelligence", targetId: "feature-benchmark-intelligence" },
    { label: "Guided decisions", targetId: "feature-guided-decisions" },
  ];

  const scrollToFeatures = () => {
    const featuresElement = document.getElementById("features");
    featuresElement?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const scrollToFeatureCard = (targetId: string) => {
    const featureCard = document.getElementById(targetId);
    featureCard?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <motion.section
      initial="hidden"
      animate="visible"
      variants={sectionReveal}
      className="relative overflow-hidden rounded-[1.75rem] border border-slate-200/70 bg-[radial-gradient(circle_at_12%_14%,rgba(125,211,252,0.32),transparent_37%),radial-gradient(circle_at_85%_18%,rgba(96,165,250,0.2),transparent_44%),linear-gradient(135deg,#0b1630_0%,#10203f_52%,#15294b_100%)] p-6 shadow-[0_22px_44px_-24px_rgba(15,23,42,0.55)] sm:p-8 lg:p-10 dark:border-slate-700/80 dark:bg-[radial-gradient(circle_at_12%_14%,rgba(56,189,248,0.2),transparent_35%),radial-gradient(circle_at_82%_16%,rgba(99,102,241,0.22),transparent_42%),linear-gradient(135deg,#081023_0%,#0e1a34_50%,#132342_100%)]"
    >
      <div className="pointer-events-none absolute inset-0">
        <motion.div
          className="absolute -left-24 top-10 h-56 w-56 rounded-full bg-cyan-300/20 blur-3xl dark:bg-cyan-400/25"
          animate={reduceMotion ? undefined : { x: [0, 20, 0], y: [0, -12, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -right-24 bottom-6 h-64 w-64 rounded-full bg-indigo-300/25 blur-3xl dark:bg-indigo-400/25"
          animate={reduceMotion ? undefined : { x: [0, -16, 0], y: [0, 14, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="relative grid items-start gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-10"
      >
        <div className="space-y-6 lg:space-y-7">
          <motion.span
            variants={itemReveal}
            className="inline-flex rounded-full border border-cyan-200/35 bg-white/10 px-3.5 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-cyan-100"
          >
            Next-Gen Portfolio Intelligence
          </motion.span>

          <motion.h1
            variants={itemReveal}
            className="max-w-2xl text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-[3.2rem] lg:leading-[1.1]"
          >
            Institutional-grade portfolio clarity for modern investors.
          </motion.h1>

          <motion.p
            variants={itemReveal}
            className="max-w-xl text-base leading-relaxed text-slate-200/95 sm:text-[1.03rem]"
          >
            Turn raw holdings into explainable risk, diversification, and benchmark insights in one
            focused workflow.
          </motion.p>

          <motion.div variants={itemReveal} className="flex flex-wrap items-center gap-3 pt-1">
            <Button
              variant="marketingPrimary"
              className="px-5 py-2.5 text-sm shadow-[0_14px_24px_-16px_rgba(8,47,73,0.8)]"
              onClick={() => navigate("/portfolios")}
            >
              Launch Dashboard
            </Button>
            <Button
              variant="marketingSecondary"
              className="px-5 py-2.5 text-sm"
              onClick={scrollToFeatures}
            >
              Explore Analytics
            </Button>
          </motion.div>

          <motion.div
            variants={itemReveal}
            className="grid max-w-2xl gap-2.5 text-sm text-slate-200 sm:grid-cols-3"
          >
            {featureChipTargets.map((chip) => (
              <button
                key={chip.targetId}
                type="button"
                onClick={() => scrollToFeatureCard(chip.targetId)}
                className="rounded-xl border border-slate-200/20 bg-white/10 px-3 py-2.5 text-left text-slate-100/95 transition hover:border-cyan-200/55 hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:ring-offset-0"
              >
                {chip.label}
              </button>
            ))}
          </motion.div>
        </div>

        <motion.div variants={itemReveal} className="relative">
          <div className="rounded-2xl border border-slate-300/20 bg-slate-950/55 p-5 shadow-[0_18px_30px_-20px_rgba(2,6,23,0.95)] backdrop-blur-md dark:border-slate-600/60 dark:bg-slate-950/60 sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-300">Example Snapshot</p>
            <p className="mt-2 text-2xl font-semibold text-white">Health Score: 78.4</p>
            <p className="mt-1 text-sm text-slate-300/95">Balanced risk profile with consistent alpha.</p>

            <div className="mt-6 space-y-3.5">
              <div>
                <div className="mb-1 flex items-center justify-between text-xs text-slate-400">
                  <span>Diversification</span>
                  <span>74.2</span>
                </div>
                <div className="h-2 rounded-full bg-slate-700/70">
                  <div className="h-2 w-[74%] rounded-full bg-emerald-500" />
                </div>
              </div>
              <div>
                <div className="mb-1 flex items-center justify-between text-xs text-slate-400">
                  <span>Risk</span>
                  <span>34.8</span>
                </div>
                <div className="h-2 rounded-full bg-slate-700/70">
                  <div className="h-2 w-[35%] rounded-full bg-amber-500" />
                </div>
              </div>
              <div>
                <div className="mb-1 flex items-center justify-between text-xs text-slate-400">
                  <span>Benchmark Delta</span>
                  <span>+3.6%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-700/70">
                  <div className="h-2 w-[62%] rounded-full bg-cyan-400" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </motion.section>
  );
}
