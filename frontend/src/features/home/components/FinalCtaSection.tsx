import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import { Button } from "../../../components/ui/Button";
import { sectionReveal } from "./motion";

export function FinalCtaSection() {
  const navigate = useNavigate();

  const scrollToFeatures = () => {
    const featuresElement = document.getElementById("features");
    featuresElement?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.35 }}
      variants={sectionReveal}
      className="rounded-2xl border border-slate-200/70 bg-[radial-gradient(circle_at_15%_30%,rgba(125,211,252,0.28),transparent_45%),linear-gradient(100deg,#122344_0%,#182f57_48%,#1a3f63_100%)] p-6 text-white shadow-[0_20px_34px_-22px_rgba(15,23,42,0.8)] dark:border-slate-700/70 dark:bg-[radial-gradient(circle_at_15%_30%,rgba(56,189,248,0.2),transparent_45%),linear-gradient(100deg,#0d1a35_0%,#14264a_48%,#123552_100%)] sm:p-8"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Ready for a sharper portfolio workflow?
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-100/95">
            Move from positions to clear risk and benchmark insight in minutes, with analysis you
            can actually explain.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="marketingPrimary" className="px-5 py-2.5" onClick={() => navigate("/portfolios")}>
            Open Portfolios
          </Button>
          <Button variant="marketingSecondary" className="px-5 py-2.5" onClick={scrollToFeatures}>
            Explore Analytics
          </Button>
        </div>
      </div>
    </motion.section>
  );
}
