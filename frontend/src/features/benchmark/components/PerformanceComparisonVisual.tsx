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
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <h4 className="text-sm font-semibold text-slate-900">Performance Visual</h4>
      <p className="mt-1 text-xs text-slate-600">
        Relative magnitude of portfolio return versus {benchmarkLabel}.
      </p>

      <div className="mt-4 space-y-3">
        <div>
          <div className="mb-1 flex items-center justify-between text-sm">
            <span className="font-medium text-slate-700">Portfolio Return</span>
            <span className={portfolioPositive ? "text-emerald-700" : "text-rose-700"}>
              {formatPercent(portfolioReturnPercent)}
            </span>
          </div>
          <div className="h-2 rounded-full bg-slate-200">
            <div
              className={`h-2 rounded-full ${portfolioPositive ? "bg-emerald-500" : "bg-rose-500"}`}
              style={{ width: `${widthByMagnitude(portfolioReturnPercent, maxMagnitude)}%` }}
            />
          </div>
        </div>

        <div>
          <div className="mb-1 flex items-center justify-between text-sm">
            <span className="font-medium text-slate-700">{benchmarkLabel}</span>
            <span className={benchmarkPositive ? "text-brand-700" : "text-rose-700"}>
              {formatPercent(benchmarkReturnPercent)}
            </span>
          </div>
          <div className="h-2 rounded-full bg-slate-200">
            <div
              className={`h-2 rounded-full ${benchmarkPositive ? "bg-brand-500" : "bg-rose-500"}`}
              style={{ width: `${widthByMagnitude(benchmarkReturnPercent, maxMagnitude)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
