import { FeatureHighlights } from "../features/home/components/FeatureHighlights";
import { FinalCtaSection } from "../features/home/components/FinalCtaSection";
import { HeroSection } from "../features/home/components/HeroSection";
import { ProductPreview } from "../features/home/components/ProductPreview";

export function HomePage() {
  return (
    <div className="relative space-y-16 pb-10 sm:space-y-20 sm:pb-12">
      <HeroSection />
      <div className="space-y-16 sm:space-y-20">
        <ProductPreview />
        <FeatureHighlights />
        <FinalCtaSection />
      </div>
    </div>
  );
}
