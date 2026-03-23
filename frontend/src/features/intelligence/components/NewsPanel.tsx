import { useCallback, useEffect, useState } from "react";

import { listPortfolioNews, refreshPortfolioNews } from "../../../api/news";
import { EmptyState } from "../../../components/common/EmptyState";
import { ErrorState } from "../../../components/common/ErrorState";
import { LoadingState } from "../../../components/common/LoadingState";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import type { NewsRefreshResponse, PortfolioNewsListResponse } from "../types";
import { formatDate } from "../../../utils/format";

interface NewsPanelProps {
  portfolioId: number;
}

export function NewsPanel({ portfolioId }: NewsPanelProps) {
  const [listData, setListData] = useState<PortfolioNewsListResponse | null>(null);
  const [lastRefresh, setLastRefresh] = useState<NewsRefreshResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadNews = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await listPortfolioNews(portfolioId, 100);
      setListData(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load portfolio news.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [portfolioId]);

  useEffect(() => {
    void loadNews();
  }, [loadNews]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setError(null);
    try {
      const refreshResult = await refreshPortfolioNews(portfolioId);
      setLastRefresh(refreshResult);
      await loadNews();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to refresh portfolio news.";
      setError(message);
    } finally {
      setIsRefreshing(false);
    }
  };

  const articles = listData?.articles ?? [];

  return (
    <section className="space-y-4">
      <Card>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-slate-900">News</h3>
            <p className="mt-1 text-sm text-slate-600">
              Refresh and review locally stored portfolio news articles.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => void loadNews()}>
              Reload
            </Button>
            <Button loading={isRefreshing} onClick={() => void handleRefresh()}>
              Refresh News
            </Button>
          </div>
        </div>
      </Card>

      {lastRefresh ? (
        <Card className="bg-slate-50">
          <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
            Last Refresh Result
          </h4>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-slate-200 bg-white p-3">
              <p className="text-xs text-slate-500">Fetched</p>
              <p className="text-lg font-semibold text-slate-900">{lastRefresh.fetched_count}</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-3">
              <p className="text-xs text-slate-500">Inserted</p>
              <p className="text-lg font-semibold text-slate-900">{lastRefresh.inserted_count}</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-3">
              <p className="text-xs text-slate-500">Deduplicated</p>
              <p className="text-lg font-semibold text-slate-900">
                {lastRefresh.deduplicated_count}
              </p>
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

      {isLoading ? <LoadingState message="Loading portfolio news..." /> : null}
      {!isLoading && error ? (
        <ErrorState
          title="Unable to load portfolio news"
          message={error}
          onRetry={() => void loadNews()}
        />
      ) : null}
      {!isLoading && !error && articles.length === 0 ? (
        <EmptyState
          title="No news stored yet"
          description="Refresh portfolio news to ingest and view relevant articles."
          action={
            <Button loading={isRefreshing} onClick={() => void handleRefresh()}>
              Refresh News
            </Button>
          }
        />
      ) : null}

      {!isLoading && !error && articles.length > 0 ? (
        <Card className="p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Ticker</th>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Source</th>
                  <th className="px-4 py-3">Published</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {articles.map((article) => (
                  <tr key={article.id} className="align-top">
                    <td className="px-4 py-3 font-medium text-slate-900">{article.ticker}</td>
                    <td className="px-4 py-3">
                      <a
                        href={article.url}
                        target="_blank"
                        rel="noreferrer"
                        className="font-medium text-brand-700 hover:text-brand-800"
                      >
                        {article.title}
                      </a>
                      <p className="mt-1 line-clamp-2 text-xs text-slate-600">
                        {article.summary || article.content || "No summary available."}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{article.source}</td>
                    <td className="px-4 py-3 text-slate-700">{formatDate(article.published_at)}</td>
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
