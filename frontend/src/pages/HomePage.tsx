import { FeatureHighlights } from "../features/home/components/FeatureHighlights";
import { FinalCtaSection } from "../features/home/components/FinalCtaSection";
import { HeroSection } from "../features/home/components/HeroSection";
import { ProductPreview } from "../features/home/components/ProductPreview";

export function HomePage() {
  return (
    <div className="relative space-y-7 pb-8 sm:space-y-9 sm:pb-10">
      <div className="pointer-events-none absolute inset-x-0 top-[-3.5rem] -z-10 h-72 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.2),transparent_70%)] dark:bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.18),transparent_70%)]" />
      <HeroSection />
      <div className="space-y-6 sm:space-y-7">
        <ProductPreview />
        <FeatureHighlights />
        <FinalCtaSection />
      </div>
    </div>
  );
}
