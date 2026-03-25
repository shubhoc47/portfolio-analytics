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
      className="relative pt-2 sm:pt-4"
    >
      <div className="pointer-events-none absolute -left-32 top-0 h-64 w-64 rounded-full bg-cyan-400/15 blur-3xl" />
      <div className="pointer-events-none absolute -right-28 top-24 h-72 w-72 rounded-full bg-indigo-500/15 blur-3xl" />

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="relative grid items-start gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-12"
      >
        <div className="space-y-6 lg:space-y-7">
          <motion.span
            variants={itemReveal}
            className="inline-flex rounded-full border border-piq-accent/35 bg-white/5 px-3.5 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-piq-accent"
          >
            Next-Gen Portfolio Intelligence
          </motion.span>

          <motion.h1
            variants={itemReveal}
            className="max-w-2xl text-4xl font-bold tracking-tight text-piq-text-primary sm:text-5xl lg:text-[56px] lg:leading-[1.08]"
          >
            Institutional-grade portfolio clarity for modern investors.
          </motion.h1>

          <motion.p
            variants={itemReveal}
            className="max-w-xl text-base leading-[1.6] text-piq-text-muted"
          >
            Turn raw holdings into explainable risk, diversification, and benchmark insights in one
            focused workflow.
          </motion.p>

          <motion.div variants={itemReveal} className="flex flex-wrap items-center gap-3 pt-1">
            <Button
              variant="marketingPrimary"
              className="px-5 py-2.5 text-sm shadow-[0_14px_28px_-12px_rgba(99,102,241,0.55)]"
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
            className="grid max-w-2xl gap-2.5 text-sm text-piq-text-muted sm:grid-cols-3"
          >
            {featureChipTargets.map((chip) => (
              <button
                key={chip.targetId}
                type="button"
                onClick={() => scrollToFeatureCard(chip.targetId)}
                className="rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-left text-piq-text-primary transition hover:border-piq-accent/45 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-piq-accent/50 focus:ring-offset-0 focus:ring-offset-transparent"
              >
                {chip.label}
              </button>
            ))}
          </motion.div>
        </div>

        <motion.div variants={itemReveal} className="relative lg:pt-2">
          <motion.div
            className="relative"
            animate={reduceMotion ? undefined : { y: [0, -6, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-white/18 via-brand-500/20 to-marketing-500/15 opacity-80 blur-sm" />
            <div className="relative rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.08] to-white/[0.02] p-5 shadow-hero-float backdrop-blur-xl sm:p-6">
              <div className="pointer-events-none absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_20%_0%,rgba(99,102,241,0.12),transparent_50%)]" />
              <div className="relative">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-piq-text-muted">
                  Example Snapshot
                </p>
                <p className="mt-2 text-2xl font-semibold text-piq-text-primary">Health Score: 78.4</p>
                <p className="mt-1 text-sm text-piq-text-muted">
                  Balanced risk profile with consistent alpha.
                </p>

                <div className="mt-6 space-y-3.5">
                  <div>
                    <div className="mb-1 flex items-center justify-between text-xs text-piq-text-muted">
                      <span>Diversification</span>
                      <span className="font-medium text-piq-text-primary">74.2</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-800/80">
                      <div className="h-2 w-[74%] rounded-full bg-piq-profit" />
                    </div>
                  </div>
                  <div>
                    <div className="mb-1 flex items-center justify-between text-xs text-piq-text-muted">
                      <span>Risk</span>
                      <span className="font-medium text-piq-text-primary">34.8</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-800/80">
                      <div className="h-2 w-[35%] rounded-full bg-amber-500" />
                    </div>
                  </div>
                  <div>
                    <div className="mb-1 flex items-center justify-between text-xs text-piq-text-muted">
                      <span>Benchmark Delta</span>
                      <span className="font-medium text-piq-profit">+3.6%</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-800/80">
                      <div className="h-2 w-[62%] rounded-full bg-piq-accent" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.section>
  );
}
