import { Link } from "react-router-dom";
import { motion } from "framer-motion";

import { Button } from "../../../components/ui/Button";
import { sectionReveal } from "./motion";

export function FinalCtaSection() {
  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.35 }}
      variants={sectionReveal}
      className="rounded-2xl border border-brand-200 bg-gradient-to-r from-brand-600 to-brand-700 p-6 text-white shadow-soft sm:p-8"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            See your portfolio with institutional-grade clarity.
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-brand-100">
            Start with your current holdings, then explore diversification, risk, health, and
            benchmark comparison in a single analytics experience.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link to="/portfolios">
            <Button variant="secondary" className="px-5 py-2.5">
              View Portfolios
            </Button>
          </Link>
          <a href="#features">
            <Button className="bg-white/15 px-5 py-2.5 text-white hover:bg-white/25">
              Explore Analytics
            </Button>
          </a>
        </div>
      </div>
    </motion.section>
  );
}
