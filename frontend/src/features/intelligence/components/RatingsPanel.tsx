import { useCallback, useEffect, useMemo, useState } from "react";

import { listPortfolioRatings, refreshPortfolioRatings } from "../../../api/ratings";
import { EmptyState } from "../../../components/common/EmptyState";
import { ErrorState } from "../../../components/common/ErrorState";
import { LoadingState } from "../../../components/common/LoadingState";
import { MetricStatGrid } from "../../../components/common/MetricStatGrid";
import { NotesBlock } from "../../../components/common/NotesBlock";
import { SectionHeader } from "../../../components/common/SectionHeader";
import {
  TableShell,
  dataTableRowHoverClass,
  dataTableTheadClass,
  dataTableTbodyClass,
} from "../../../components/common/TableShell";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import type {
  PortfolioRatingsListResponse,
  RatingsRefreshResponse,
  AnalystRatingRead,
} from "../types";
import { RatingBadge } from "./badges";

interface RatingsPanelProps {
  portfolioId: number;
}

export function RatingsPanel({ portfolioId }: RatingsPanelProps) {
  const [listData, setListData] = useState<PortfolioRatingsListResponse | null>(null);
  const [lastRefresh, setLastRefresh] = useState<RatingsRefreshResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadRatings = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await listPortfolioRatings(portfolioId, 100);
      setListData(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load ratings.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [portfolioId]);

  useEffect(() => {
    void loadRatings();
  }, [loadRatings]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setError(null);
    try {
      const refreshResult = await refreshPortfolioRatings(portfolioId);
      setLastRefresh(refreshResult);
      await loadRatings();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to refresh ratings.";
      setError(message);
    } finally {
      setIsRefreshing(false);
    }
  };

  const ratings = listData?.ratings ?? [];

  const groupedCounts = useMemo(() => {
    const initial: Record<AnalystRatingRead["normalized_rating"], number> = {
      buy: 0,
      hold: 0,
      sell: 0,
    };
    for (const item of ratings) {
      initial[item.normalized_rating] += 1;
    }
    return initial;
  }, [ratings]);

  return (
    <section className="space-y-4">
      <Card variant="workspace">
        <SectionHeader
          title="Ratings"
          description="Refresh and review normalized analyst rating signals."
          compact
          actions={
            <>
              <Button variant="ghost" onClick={() => void loadRatings()}>
                Reload
              </Button>
              <Button loading={isRefreshing} onClick={() => void handleRefresh()}>
                Refresh Ratings
              </Button>
            </>
          }
        />
      </Card>

      {lastRefresh ? (
        <Card variant="workspace">
          <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-200">
            Last Refresh Result
          </h4>
          <div className="mt-3">
            <MetricStatGrid
              columns={4}
              context="darkSurface"
              items={[
                { label: "Fetched", value: String(lastRefresh.fetched_count), tone: "accent" },
                { label: "Stored", value: String(lastRefresh.stored_count) },
                { label: "Created", value: String(lastRefresh.created_count), tone: "positive" },
                { label: "Updated", value: String(lastRefresh.updated_count) },
              ]}
            />
          </div>
          <NotesBlock notes={lastRefresh.notes} className="mt-3" />
        </Card>
      ) : null}

      {!isLoading && !error && ratings.length > 0 ? (
        <Card variant="workspace">
          <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-200">
            Normalized Rating Mix
          </h4>
          <div className="mt-3">
            <MetricStatGrid
              columns={3}
              context="darkSurface"
              items={[
                { label: "Buy", value: String(groupedCounts.buy), tone: "positive" },
                { label: "Hold", value: String(groupedCounts.hold) },
                { label: "Sell", value: String(groupedCounts.sell), tone: "negative" },
              ]}
            />
          </div>
        </Card>
      ) : null}

      {isLoading ? <LoadingState message="Loading portfolio ratings..." /> : null}
      {!isLoading && error ? (
        <ErrorState
          title="Unable to load ratings"
          message={error}
          onRetry={() => void loadRatings()}
        />
      ) : null}
      {!isLoading && !error && ratings.length === 0 ? (
        <EmptyState
          title="No ratings stored"
          description="Refresh ratings to ingest normalized analyst recommendations."
          action={
            <Button loading={isRefreshing} onClick={() => void handleRefresh()}>
              Refresh Ratings
            </Button>
          }
        />
      ) : null}

      {!isLoading && !error && ratings.length > 0 ? (
        <TableShell>
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm dark:divide-white/10">
            <thead className={dataTableTheadClass}>
              <tr>
                <th className="px-4 py-3.5 font-semibold">Ticker</th>
                <th className="px-4 py-3.5 font-semibold">Provider</th>
                <th className="px-4 py-3.5 font-semibold">Analyst / Firm</th>
                <th className="px-4 py-3.5 font-semibold">Raw</th>
                <th className="px-4 py-3.5 font-semibold">Normalized</th>
                <th className="px-4 py-3.5 font-semibold">As Of</th>
                <th className="px-4 py-3.5 font-semibold">Price Target</th>
              </tr>
            </thead>
            <tbody className={dataTableTbodyClass}>
              {ratings.map((rating) => (
                <tr key={rating.id} className={dataTableRowHoverClass}>
                  <td className="px-4 py-3.5 font-semibold text-slate-900 dark:text-slate-100">
                    {rating.ticker}
                  </td>
                  <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300">{rating.provider_name}</td>
                  <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300">
                    {rating.analyst_name || rating.firm_name}
                  </td>
                  <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300">{rating.raw_rating}</td>
                  <td className="px-4 py-3.5">
                    <RatingBadge rating={rating.normalized_rating} />
                  </td>
                  <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300">{rating.as_of_date}</td>
                  <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300">
                    {rating.price_target == null ? "—" : rating.price_target}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableShell>
      ) : null}
    </section>
  );
}
