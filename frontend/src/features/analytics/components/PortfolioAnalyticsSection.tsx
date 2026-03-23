import { useCallback, useEffect, useState } from "react";

import { getPortfolioAnalytics } from "../../../api/analytics";
import { LoadingState } from "../../../components/common/LoadingState";
import { SectionHeader } from "../../../components/common/SectionHeader";
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
    <section className="space-y-4">
      <Card>
        <SectionHeader
          title="Analytics"
          description="Understand diversification, risk, and health at a glance."
          compact
          actions={
            <Button variant="ghost" onClick={() => void loadAnalytics()}>
              Refresh Analytics
            </Button>
          }
        />
      </Card>

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
        <div className="space-y-4">
          <AnalyticsSummaryCards
            diversification={analytics.diversification}
            risk={analytics.risk}
            health={analytics.health}
          />

          <SectorExposureCard sectorExposure={analytics.sector_exposure} />

          <BenchmarkSection portfolioId={portfolioId} />

          <Card className="p-0">
            <details className="group">
              <summary className="cursor-pointer list-none border-b border-gray-200 px-4 py-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-700">
                      Advanced Breakdown
                    </h3>
                    <p className="text-xs text-gray-500">
                      Expand for detailed scoring factors and underlying calculations.
                    </p>
                  </div>
                  <span className="text-xs font-medium text-blue-700 group-open:hidden">
                    Show Details
                  </span>
                  <span className="hidden text-xs font-medium text-blue-700 group-open:inline">
                    Hide Details
                  </span>
                </div>
              </summary>
              <div className="grid gap-4 p-4 xl:grid-cols-3">
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
            </details>
          </Card>

        </div>
      ) : null}
    </section>
  );
}
