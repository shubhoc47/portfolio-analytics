import type { AlertSeverity, NormalizedRating, SentimentLabel } from "../types";

export function SentimentBadge({ sentiment }: { sentiment: SentimentLabel }) {
  const styles: Record<SentimentLabel, string> = {
    positive: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300",
    neutral: "border-slate-300 bg-slate-100 text-slate-700 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-300",
    negative: "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-700 dark:bg-rose-950/50 dark:text-rose-300",
  };

  return (
    <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${styles[sentiment]}`}>
      {sentiment}
    </span>
  );
}

export function SeverityBadge({ severity }: { severity: AlertSeverity }) {
  const styles: Record<AlertSeverity, string> = {
    low: "border-slate-300 bg-slate-100 text-slate-700 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-300",
    medium: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-700 dark:bg-amber-950/50 dark:text-amber-300",
    high: "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-700 dark:bg-orange-950/50 dark:text-orange-300",
    critical: "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-700 dark:bg-rose-950/50 dark:text-rose-300",
  };

  return (
    <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${styles[severity]}`}>
      {severity}
    </span>
  );
}

export function RatingBadge({ rating }: { rating: NormalizedRating }) {
  const styles: Record<NormalizedRating, string> = {
    buy: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300",
    hold: "border-slate-300 bg-slate-100 text-slate-700 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-300",
    sell: "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-700 dark:bg-rose-950/50 dark:text-rose-300",
  };

  return (
    <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${styles[rating]}`}>
      {rating}
    </span>
  );
}
