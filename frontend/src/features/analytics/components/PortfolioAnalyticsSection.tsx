import { useCallback, useEffect, useState } from "react";

import { getPortfolioAnalytics } from "../../../api/analytics";
import { LoadingState } from "../../../components/common/LoadingState";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import type { AnalyticsSummary } from "../types";
import { AnalyticsSummaryCards } from "./AnalyticsSummaryCards";
import { ScoreBreakdownCard } from "./ScoreBreakdownCard";
import { SectorExposureCard } from "./SectorExposureCard";
import { BenchmarkSection } from "../../benchmark/components/BenchmarkSection";

interface PortfolioAnalyticsSectionProps {
  portfolioId: number;
}

function formatPercent(value: number): string {
  return `${value.toFixed(2)}%`;
}

function formatNumber(value: number): string {
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

export function PortfolioAnalyticsSection({ portfolioId }: PortfolioAnalyticsSectionProps) {
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAnalytics = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await getPortfolioAnalytics(portfolioId);
      setAnalytics(data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load portfolio analytics.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [portfolioId]);

  useEffect(() => {
    void loadAnalytics();
  }, [loadAnalytics]);

  const totalHoldings = analytics?.sector_exposure.total_holdings ?? 0;
  const hasExposureRows = (analytics?.sector_exposure.sector_exposure.length ?? 0) > 0;
  const isEmpty = !isLoading && !error && analytics && totalHoldings === 0 && !hasExposureRows;

  return (
    <section className="space-y-5">
      <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-5 shadow-soft">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-slate-900">Analytics</h2>
            <p className="mt-1 text-sm text-slate-600">
              Understand portfolio diversification, risk, and overall health at a glance.
            </p>
          </div>
          <Button variant="ghost" onClick={() => void loadAnalytics()}>
            Refresh Analytics
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <LoadingState message="Calculating analytics..." />
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <div className="h-40 animate-pulse rounded-xl border border-slate-200 bg-slate-100" />
            <div className="h-40 animate-pulse rounded-xl border border-slate-200 bg-slate-100" />
            <div className="hidden h-40 animate-pulse rounded-xl border border-slate-200 bg-slate-100 xl:block" />
          </div>
        </div>
      ) : null}
      {!isLoading && error ? (
        <Card className="border-rose-200 bg-rose-50">
          <h3 className="text-base font-semibold text-rose-900">Unable to load analytics</h3>
          <p className="mt-1 text-sm text-rose-700">{error}</p>
          <div className="mt-4">
            <Button variant="secondary" onClick={() => void loadAnalytics()}>
              Retry
            </Button>
          </div>
        </Card>
      ) : null}
      {isEmpty ? (
        <Card className="bg-slate-50">
          <h3 className="text-base font-semibold text-slate-900">
            Analytics unavailable for this portfolio
          </h3>
          <p className="mt-1 text-sm text-slate-600">
            Add holdings to this portfolio first. Analytics scores and sector exposure are
            computed only after holdings exist.
          </p>
          <div className="mt-4">
            <Button variant="ghost" onClick={() => void loadAnalytics()}>
              Refresh
            </Button>
          </div>
        </Card>
      ) : null}

      {!isLoading && !error && analytics && !isEmpty ? (
        <div className="space-y-5">
          <AnalyticsSummaryCards
            diversification={analytics.diversification}
            risk={analytics.risk}
            health={analytics.health}
          />

          <SectorExposureCard sectorExposure={analytics.sector_exposure} />

          <BenchmarkSection portfolioId={portfolioId} />

          <div className="grid gap-4 xl:grid-cols-3">
            <ScoreBreakdownCard
              title="Diversification Breakdown"
              subtitle="Higher diversification score indicates broader and less concentrated exposure."
              items={[
                {
                  label: "Sector Count",
                  value: formatNumber(analytics.diversification.breakdown.sector_count),
                },
                {
                  label: "Max Sector Concentration",
                  value: formatPercent(
                    analytics.diversification.breakdown.max_sector_concentration_percent,
                  ),
                },
                {
                  label: "Holding Count",
                  value: formatNumber(analytics.diversification.breakdown.holding_count),
                },
                {
                  label: "Sector Breadth Points",
                  value: formatNumber(analytics.diversification.breakdown.sector_breadth_points),
                },
                {
                  label: "Concentration Points",
                  value: formatNumber(analytics.diversification.breakdown.concentration_points),
                },
                {
                  label: "Holding Count Points",
                  value: formatNumber(analytics.diversification.breakdown.holding_count_points),
                },
              ]}
              notes={analytics.diversification.breakdown.notes}
            />

            <ScoreBreakdownCard
              title="Risk Breakdown"
              subtitle="Risk score is directional: higher score means higher risk."
              items={[
                {
                  label: "Max Sector Concentration",
                  value: formatPercent(analytics.risk.breakdown.max_sector_concentration_percent),
                },
                {
                  label: "Sector Count",
                  value: formatNumber(analytics.risk.breakdown.sector_count),
                },
                {
                  label: "Holding Count",
                  value: formatNumber(analytics.risk.breakdown.holding_count),
                },
                {
                  label: "ETF Holding Percent",
                  value: formatPercent(analytics.risk.breakdown.etf_holding_percent),
                },
                {
                  label: "Concentration Points",
                  value: formatNumber(analytics.risk.breakdown.concentration_points),
                },
                {
                  label: "Single-Sector Penalty",
                  value: formatNumber(analytics.risk.breakdown.single_sector_penalty),
                },
                {
                  label: "Holding Count Penalty",
                  value: formatNumber(analytics.risk.breakdown.holding_count_penalty),
                },
                {
                  label: "ETF Mix Adjustment",
                  value: formatNumber(analytics.risk.breakdown.etf_mix_adjustment),
                },
              ]}
              notes={analytics.risk.breakdown.notes}
            />

            <ScoreBreakdownCard
              title="Health Breakdown"
              subtitle="Health combines diversification strength with inverse risk contribution."
              items={[
                {
                  label: "Diversification Score",
                  value: formatNumber(analytics.health.breakdown.diversification_score),
                },
                {
                  label: "Risk Score",
                  value: formatNumber(analytics.health.breakdown.risk_score),
                },
                {
                  label: "Diversification Contribution",
                  value: formatNumber(
                    analytics.health.breakdown.diversification_contribution,
                  ),
                },
                {
                  label: "Inverse Risk Contribution",
                  value: formatNumber(analytics.health.breakdown.inverse_risk_contribution),
                },
              ]}
              notes={analytics.health.breakdown.notes}
            />
          </div>

          <Card className="bg-slate-50">
            <h3 className="text-base font-semibold text-slate-900">Coming Later</h3>
            <p className="mt-1 text-sm text-slate-600">
              Future modules will be added in upcoming milestones.
            </p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <span className="rounded-full border border-slate-300 bg-white px-2 py-1 text-slate-700">
                Market News & Sentiment
              </span>
              <span className="rounded-full border border-slate-300 bg-white px-2 py-1 text-slate-700">
                Alerts & Ratings
              </span>
            </div>
          </Card>
        </div>
      ) : null}
    </section>
  );
}
