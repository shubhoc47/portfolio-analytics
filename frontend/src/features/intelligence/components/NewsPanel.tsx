import { useCallback, useEffect, useState } from "react";

import { listPortfolioNews, refreshPortfolioNews } from "../../../api/news";
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
      <Card variant="workspace">
        <SectionHeader
          title="News"
          description="Refresh and review locally stored portfolio news articles."
          compact
          actions={
            <>
              <Button variant="ghost" onClick={() => void loadNews()}>
                Reload
              </Button>
              <Button loading={isRefreshing} onClick={() => void handleRefresh()}>
                Refresh News
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
              columns={3}
              context="darkSurface"
              items={[
                { label: "Fetched", value: String(lastRefresh.fetched_count) },
                { label: "Inserted", value: String(lastRefresh.inserted_count), tone: "positive" },
                {
                  label: "Deduplicated",
                  value: String(lastRefresh.deduplicated_count),
                  tone: "accent",
                },
              ]}
            />
          </div>
          <NotesBlock notes={lastRefresh.notes} className="mt-3" />
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
        <TableShell>
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm dark:divide-white/10">
            <thead className={dataTableTheadClass}>
              <tr>
                <th className="px-4 py-3.5 font-semibold">Ticker</th>
                <th className="px-4 py-3.5 font-semibold">Title</th>
                <th className="px-4 py-3.5 font-semibold">Source</th>
                <th className="px-4 py-3.5 font-semibold">Published</th>
              </tr>
            </thead>
            <tbody className={dataTableTbodyClass}>
              {articles.map((article) => (
                <tr key={article.id} className={`align-top ${dataTableRowHoverClass}`}>
                  <td className="px-4 py-3.5 font-semibold text-slate-900 dark:text-slate-100">
                    {article.ticker}
                  </td>
                  <td className="px-4 py-3.5">
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noreferrer"
                      className="font-medium text-brand-600 hover:text-brand-500 dark:text-piq-accent/90 dark:hover:text-piq-accent"
                    >
                        {article.title}
                      </a>
                      <p className="mt-1 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">
                        {article.summary || article.content || "No summary available."}
                      </p>
                    </td>
                  <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300">{article.source}</td>
                  <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300">
                    {formatDate(article.published_at)}
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
