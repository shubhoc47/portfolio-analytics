import { FeatureHighlights } from "../features/home/components/FeatureHighlights";
import { FinalCtaSection } from "../features/home/components/FinalCtaSection";
import { HeroSection } from "../features/home/components/HeroSection";
import { ProductPreview } from "../features/home/components/ProductPreview";
import { TrustSection } from "../features/home/components/TrustSection";
import { ValueSection } from "../features/home/components/ValueSection";

export function HomePage() {
  return (
    <div className="space-y-8 pb-4 sm:space-y-10">
      <HeroSection />
      <ProductPreview />
      <FeatureHighlights />
      <ValueSection />
      <TrustSection />
      <FinalCtaSection />
    </div>
  );
}
