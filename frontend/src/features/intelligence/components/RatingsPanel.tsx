import { useCallback, useEffect, useMemo, useState } from "react";

import { listPortfolioRatings, refreshPortfolioRatings } from "../../../api/ratings";
import { EmptyState } from "../../../components/common/EmptyState";
import { ErrorState } from "../../../components/common/ErrorState";
import { LoadingState } from "../../../components/common/LoadingState";
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
      <Card>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-slate-900">Ratings</h3>
            <p className="mt-1 text-sm text-slate-600">
              Refresh and review normalized analyst rating signals.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => void loadRatings()}>
              Reload
            </Button>
            <Button loading={isRefreshing} onClick={() => void handleRefresh()}>
              Refresh Ratings
            </Button>
          </div>
        </div>
      </Card>

      {lastRefresh ? (
        <Card className="bg-slate-50">
          <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
            Last Refresh Result
          </h4>
          <div className="mt-3 grid gap-3 sm:grid-cols-4">
            <div className="rounded-lg border border-slate-200 bg-white p-3">
              <p className="text-xs text-slate-500">Fetched</p>
              <p className="text-lg font-semibold text-slate-900">{lastRefresh.fetched_count}</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-3">
              <p className="text-xs text-slate-500">Stored</p>
              <p className="text-lg font-semibold text-slate-900">{lastRefresh.stored_count}</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-3">
              <p className="text-xs text-slate-500">Created</p>
              <p className="text-lg font-semibold text-slate-900">{lastRefresh.created_count}</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-3">
              <p className="text-xs text-slate-500">Updated</p>
              <p className="text-lg font-semibold text-slate-900">{lastRefresh.updated_count}</p>
            </div>
          </div>
          {lastRefresh.notes.length > 0 ? (
            <ul className="mt-3 list-disc space-y-1 pl-5 text-xs text-slate-600">
              {lastRefresh.notes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          ) : null}
        </Card>
      ) : null}

      {!isLoading && !error && ratings.length > 0 ? (
        <Card className="bg-slate-50">
          <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
            Normalized Rating Mix
          </h4>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
              <p className="text-xs text-emerald-700">Buy</p>
              <p className="text-xl font-semibold text-emerald-900">{groupedCounts.buy}</p>
            </div>
            <div className="rounded-lg border border-slate-300 bg-slate-100 p-3">
              <p className="text-xs text-slate-700">Hold</p>
              <p className="text-xl font-semibold text-slate-900">{groupedCounts.hold}</p>
            </div>
            <div className="rounded-lg border border-rose-200 bg-rose-50 p-3">
              <p className="text-xs text-rose-700">Sell</p>
              <p className="text-xl font-semibold text-rose-900">{groupedCounts.sell}</p>
            </div>
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
        <Card className="p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Ticker</th>
                  <th className="px-4 py-3">Provider</th>
                  <th className="px-4 py-3">Analyst / Firm</th>
                  <th className="px-4 py-3">Raw</th>
                  <th className="px-4 py-3">Normalized</th>
                  <th className="px-4 py-3">As Of</th>
                  <th className="px-4 py-3">Price Target</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {ratings.map((rating) => (
                  <tr key={rating.id}>
                    <td className="px-4 py-3 font-medium text-slate-900">{rating.ticker}</td>
                    <td className="px-4 py-3 text-slate-700">{rating.provider_name}</td>
                    <td className="px-4 py-3 text-slate-700">
                      {rating.analyst_name || rating.firm_name}
                    </td>
                    <td className="px-4 py-3 text-slate-700">{rating.raw_rating}</td>
                    <td className="px-4 py-3">
                      <RatingBadge rating={rating.normalized_rating} />
                    </td>
                    <td className="px-4 py-3 text-slate-700">{rating.as_of_date}</td>
                    <td className="px-4 py-3 text-slate-700">
                      {rating.price_target == null ? "—" : rating.price_target}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : null}
    </section>
  );
}
