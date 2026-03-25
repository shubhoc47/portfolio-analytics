import { Card } from "../../../components/ui/Card";
import type { BenchmarkComparison, BenchmarkComparisonStatus } from "../../analytics/types";
import { PerformanceComparisonVisual } from "./PerformanceComparisonVisual";

interface BenchmarkComparisonCardProps {
  comparison: BenchmarkComparison;
}

function formatCurrency(value: number): string {
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatPercent(value: number): string {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

function statusBadgeClass(status: BenchmarkComparisonStatus): string {
  if (status === "outperformed") {
    return "border-piq-profit/40 bg-piq-profit/10 text-piq-profit";
  }
  if (status === "underperformed") {
    return "border-piq-loss/40 bg-piq-loss/10 text-piq-loss";
  }
  return "border-white/15 bg-piq-canvas/80 text-slate-300";
}

function statusLabel(status: BenchmarkComparisonStatus): string {
  if (status === "outperformed") {
    return "Outperformed";
  }
  if (status === "underperformed") {
    return "Underperformed";
  }
  return "Matched";
}

function priceSourceLabel(source: string): string {
  if (source === "holding_current_price") {
    return "Holding price";
  }
  if (source === "mock_price") {
    return "Mock price";
  }
  return "Average cost fallback";
}

export function BenchmarkComparisonCard({ comparison }: BenchmarkComparisonCardProps) {
  const status = comparison.comparison.status;
  const relative = comparison.comparison.relative_performance_percent;

  return (
    <Card variant="darkSurface" className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-100">Benchmark Comparison</h3>
          <p className="mt-1 text-sm text-slate-300">
            Portfolio performance compared against {comparison.benchmark.name} (
            {comparison.benchmark.symbol}).
          </p>
        </div>
        <span
          className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${statusBadgeClass(status)}`}
        >
          {statusLabel(status)}
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-lg border border-white/10 bg-piq-canvas/80 p-3 dark:bg-piq-canvas/90">
          <p className="text-xs uppercase tracking-wide text-slate-400">Invested Value</p>
          <p className="mt-1 text-base font-semibold text-slate-100">
            {formatCurrency(comparison.portfolio.invested_value)}
          </p>
        </div>
        <div className="rounded-lg border border-white/10 bg-piq-canvas/80 dark:bg-piq-canvas/90 p-3">
          <p className="text-xs uppercase tracking-wide text-slate-400">Current Value</p>
          <p className="mt-1 text-base font-semibold text-slate-100">
            {formatCurrency(comparison.portfolio.current_value)}
          </p>
        </div>
        <div className="rounded-lg border border-white/10 bg-piq-canvas/80 dark:bg-piq-canvas/90 p-3">
          <p className="text-xs uppercase tracking-wide text-slate-400">Absolute Return</p>
          <p className="mt-1 text-base font-semibold text-slate-100">
            {formatCurrency(comparison.portfolio.absolute_return)}
          </p>
        </div>
        <div className="rounded-lg border border-white/10 bg-piq-canvas/80 dark:bg-piq-canvas/90 p-3">
          <p className="text-xs uppercase tracking-wide text-slate-400">Portfolio Return</p>
          <p className="mt-1 text-lg font-semibold text-slate-100">
            {formatPercent(comparison.portfolio.return_percent)}
          </p>
        </div>
        <div className="rounded-lg border border-white/10 bg-piq-canvas/80 dark:bg-piq-canvas/90 p-3">
          <p className="text-xs uppercase tracking-wide text-slate-400">Benchmark Return</p>
          <p className="mt-1 text-lg font-semibold text-slate-100">
            {formatPercent(comparison.benchmark.return_percent)}
          </p>
        </div>
        <div className="rounded-lg border border-white/10 bg-piq-canvas/80 dark:bg-piq-canvas/90 p-3">
          <p className="text-xs uppercase tracking-wide text-slate-400">Relative Performance</p>
          <p className={`mt-1 text-lg font-semibold ${relative >= 0 ? "text-emerald-300" : "text-rose-300"}`}>
            {formatPercent(relative)}
          </p>
        </div>
      </div>

      <PerformanceComparisonVisual
        portfolioReturnPercent={comparison.portfolio.return_percent}
        benchmarkReturnPercent={comparison.benchmark.return_percent}
        benchmarkLabel={`${comparison.benchmark.name} (${comparison.benchmark.symbol})`}
      />

      <div className="rounded-lg border border-white/10 bg-piq-canvas/80 dark:bg-piq-canvas/90 p-3">
        <p className="text-xs uppercase tracking-wide text-slate-400">Summary</p>
        <p className="mt-1 text-sm text-slate-200">{comparison.comparison.summary}</p>
      </div>

      {comparison.holdings.length > 0 ? (
        <div className="rounded-lg border border-white/10 bg-piq-canvas/80 dark:bg-piq-canvas/90 p-4">
          <h4 className="text-sm font-semibold text-slate-100">Holding Breakdown</h4>
          <div className="mt-3 space-y-2">
            {comparison.holdings.map((holding) => (
              <div
                key={holding.ticker}
                className="grid gap-2 rounded-md border border-white/10 bg-piq-canvas p-3 text-sm sm:grid-cols-[100px_1fr_auto] dark:bg-piq-canvas/95"
              >
                <p className="font-semibold text-slate-100">{holding.ticker}</p>
                <p className="text-slate-300">
                  Price source: {priceSourceLabel(holding.price_source)} | Price used:{" "}
                  {formatCurrency(holding.price_used)}
                </p>
                <p
                  className={`font-semibold ${holding.return_percent >= 0 ? "text-emerald-300" : "text-rose-300"}`}
                >
                  {formatPercent(holding.return_percent)}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {comparison.notes.length > 0 ? (
        <div className="rounded-lg border border-white/10 bg-piq-canvas/80 dark:bg-piq-canvas/90 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Notes</p>
          <ul className="mt-2 space-y-1 text-sm text-slate-300">
            {comparison.notes.map((note) => (
              <li key={note}>- {note}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </Card>
  );
}
