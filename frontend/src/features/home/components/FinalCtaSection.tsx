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
      className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-piq-card-surface p-6 shadow-card-lift sm:p-8"
    >
      <div className="pointer-events-none absolute inset-0 rounded-2xl bg-[radial-gradient(ellipse_80%_60%_at_20%_0%,rgba(99,102,241,0.12),transparent_55%)] opacity-90" />
      <div className="relative flex flex-wrap items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-piq-text-primary sm:text-[32px] sm:leading-tight">
            Ready for a sharper portfolio workflow?
          </h2>
          <p className="mt-2 max-w-2xl text-base leading-[1.6] text-piq-text-muted">
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
