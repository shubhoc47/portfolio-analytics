interface PerformanceComparisonVisualProps {
  portfolioReturnPercent: number;
  benchmarkReturnPercent: number;
  benchmarkLabel: string;
}

function formatPercent(value: number): string {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

function widthByMagnitude(value: number, maxMagnitude: number): number {
  if (maxMagnitude <= 0) {
    return 6;
  }
  return Math.max(6, Math.min(100, (Math.abs(value) / maxMagnitude) * 100));
}

export function PerformanceComparisonVisual({
  portfolioReturnPercent,
  benchmarkReturnPercent,
  benchmarkLabel,
}: PerformanceComparisonVisualProps) {
  const maxMagnitude = Math.max(
    Math.abs(portfolioReturnPercent),
    Math.abs(benchmarkReturnPercent),
    1,
  );

  const portfolioPositive = portfolioReturnPercent >= 0;
  const benchmarkPositive = benchmarkReturnPercent >= 0;

  return (
    <div className="rounded-xl border border-white/10 bg-piq-canvas/80 p-4 dark:bg-piq-canvas/90">
      <h4 className="text-sm font-semibold text-slate-100">Performance Visual</h4>
      <p className="mt-1 text-xs text-slate-300">
        Relative magnitude of portfolio return versus {benchmarkLabel}.
      </p>

      <div className="mt-4 space-y-3">
        <div>
          <div className="mb-1 flex items-center justify-between text-sm">
            <span className="font-medium text-slate-300">Portfolio Return</span>
            <span className={portfolioPositive ? "text-piq-profit" : "text-piq-loss"}>
              {formatPercent(portfolioReturnPercent)}
            </span>
          </div>
          <div className="h-2 rounded-full bg-slate-700 dark:bg-piq-canvas">
            <div
              className={`h-2 rounded-full ${portfolioPositive ? "bg-piq-profit" : "bg-piq-loss"}`}
              style={{ width: `${widthByMagnitude(portfolioReturnPercent, maxMagnitude)}%` }}
            />
          </div>
        </div>

        <div>
          <div className="mb-1 flex items-center justify-between text-sm">
            <span className="font-medium text-slate-300">{benchmarkLabel}</span>
            <span className={benchmarkPositive ? "text-piq-accent" : "text-piq-loss"}>
              {formatPercent(benchmarkReturnPercent)}
            </span>
          </div>
          <div className="h-2 rounded-full bg-slate-700 dark:bg-piq-canvas">
            <div
              className={`h-2 rounded-full ${benchmarkPositive ? "bg-gradient-primary" : "bg-piq-loss"}`}
              style={{ width: `${widthByMagnitude(benchmarkReturnPercent, maxMagnitude)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
