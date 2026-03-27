import { useCallback, useEffect, useMemo, useState } from "react";

import { listPortfolioAlerts, refreshPortfolioAlerts } from "../../../api/alerts";
import { EmptyState } from "../../../components/common/EmptyState";
import { ErrorState } from "../../../components/common/ErrorState";
import { LoadingState } from "../../../components/common/LoadingState";
import { MetricStatGrid } from "../../../components/common/MetricStatGrid";
import { NotesBlock } from "../../../components/common/NotesBlock";
import { SectionHeader } from "../../../components/common/SectionHeader";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import type { AlertRead, AlertRefreshResponse, PortfolioAlertsListResponse } from "../types";
import { SeverityBadge } from "./badges";
import { formatDate } from "../../../utils/format";

interface AlertsPanelProps {
  portfolioId: number;
}

export function AlertsPanel({ portfolioId }: AlertsPanelProps) {
  const [listData, setListData] = useState<PortfolioAlertsListResponse | null>(null);
  const [lastRefresh, setLastRefresh] = useState<AlertRefreshResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAlerts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await listPortfolioAlerts(portfolioId, 100);
      setListData(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load active alerts.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [portfolioId]);

  useEffect(() => {
    void loadAlerts();
  }, [loadAlerts]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setError(null);
    try {
      const refreshResult = await refreshPortfolioAlerts(portfolioId);
      setLastRefresh(refreshResult);
      await loadAlerts();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to refresh alerts.";
      setError(message);
    } finally {
      setIsRefreshing(false);
    }
  };

  const severityOrder: Record<AlertRead["severity"], number> = {
    critical: 4,
    high: 3,
    medium: 2,
    low: 1,
  };

  const alerts = useMemo(() => {
    const rows = listData?.alerts ?? [];
    return [...rows].sort((a, b) => severityOrder[b.severity] - severityOrder[a.severity]);
  }, [listData]);

  return (
    <section className="space-y-4">
      <Card variant="workspace">
        <SectionHeader
          title="Alerts"
          description="Refresh and monitor active alert signals for this portfolio."
          compact
          actions={
            <>
              <Button variant="ghost" onClick={() => void loadAlerts()}>
                Reload
              </Button>
              <Button loading={isRefreshing} onClick={() => void handleRefresh()}>
                Refresh Alerts
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
                { label: "Detected", value: String(lastRefresh.detected_count), tone: "accent" },
                { label: "Created", value: String(lastRefresh.created_count), tone: "positive" },
                { label: "Updated", value: String(lastRefresh.updated_count) },
                { label: "Active", value: String(lastRefresh.active_alert_count), tone: "negative" },
              ]}
            />
          </div>
          <NotesBlock notes={lastRefresh.notes} className="mt-3" />
        </Card>
      ) : null}

      {isLoading ? <LoadingState message="Loading active alerts..." /> : null}
      {!isLoading && error ? (
        <ErrorState title="Unable to load alerts" message={error} onRetry={() => void loadAlerts()} />
      ) : null}
      {!isLoading && !error && alerts.length === 0 ? (
        <EmptyState
          title="No active alerts"
          description="Run alert refresh to detect current portfolio signals."
          action={
            <Button loading={isRefreshing} onClick={() => void handleRefresh()}>
              Refresh Alerts
            </Button>
          }
        />
      ) : null}

      {!isLoading && !error && alerts.length > 0 ? (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <Card
              variant="workspace"
              key={alert.id}
              className={
                alert.severity === "critical"
                  ? "border-piq-loss/35 bg-piq-loss/5 dark:border-piq-loss/40 dark:bg-piq-loss/10"
                  : alert.severity === "high"
                    ? "border-orange-300/90 bg-orange-50/90 dark:border-orange-500/35 dark:bg-orange-500/10"
                    : ""
              }
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {alert.ticker || "Portfolio"}
                </span>
                <SeverityBadge severity={alert.severity} />
                <span className="rounded-full border border-slate-300 bg-slate-100 px-2 py-0.5 text-xs text-slate-700 dark:border-white/15 dark:bg-piq-canvas/80 dark:text-slate-300">
                  {alert.source_kind}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">{formatDate(alert.detected_at)}</span>
              </div>
              <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-slate-100">{alert.title}</p>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{alert.message}</p>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">type: {alert.alert_type}</p>
            </Card>
          ))}
        </div>
      ) : null}
    </section>
  );
}
