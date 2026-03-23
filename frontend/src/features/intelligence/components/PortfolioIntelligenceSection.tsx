import { useMemo, useState } from "react";

import { Card } from "../../../components/ui/Card";
import { AlertsPanel } from "./AlertsPanel";
import {
  IntelligenceTabs,
  type IntelligenceTabItem,
  type IntelligenceTabKey,
} from "./IntelligenceTabs";
import { NewsPanel } from "./NewsPanel";
import { RatingsPanel } from "./RatingsPanel";
import { SentimentPanel } from "./SentimentPanel";
import { SummariesPanel } from "./SummariesPanel";

interface PortfolioIntelligenceSectionProps {
  portfolioId: number;
}

export function PortfolioIntelligenceSection({ portfolioId }: PortfolioIntelligenceSectionProps) {
  const [activeTab, setActiveTab] = useState<IntelligenceTabKey>("news");

  const tabs = useMemo<IntelligenceTabItem[]>(
    () => [
      { key: "news", label: "News" },
      { key: "sentiment", label: "Sentiment" },
      { key: "summaries", label: "Summaries" },
      { key: "alerts", label: "Alerts" },
      { key: "ratings", label: "Ratings" },
    ],
    [],
  );

  return (
    <section className="space-y-4">
      <Card className="bg-gradient-to-br from-white to-slate-50">
        <div className="space-y-3">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-slate-900">Intelligence</h2>
            <p className="mt-1 text-sm text-slate-600">
              Portfolio enrichment tools for news, sentiment, summaries, alerts, and ratings.
            </p>
          </div>
          <IntelligenceTabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
        </div>
      </Card>

      {activeTab === "news" ? <NewsPanel portfolioId={portfolioId} /> : null}
      {activeTab === "sentiment" ? <SentimentPanel portfolioId={portfolioId} /> : null}
      {activeTab === "summaries" ? <SummariesPanel portfolioId={portfolioId} /> : null}
      {activeTab === "alerts" ? <AlertsPanel portfolioId={portfolioId} /> : null}
      {activeTab === "ratings" ? <RatingsPanel portfolioId={portfolioId} /> : null}
    </section>
  );
}
