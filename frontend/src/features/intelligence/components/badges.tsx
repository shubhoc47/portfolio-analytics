import type { AlertSeverity, NormalizedRating, SentimentLabel } from "../types";

export function SentimentBadge({ sentiment }: { sentiment: SentimentLabel }) {
  const styles: Record<SentimentLabel, string> = {
    positive: "border-emerald-700 bg-emerald-950/50 text-emerald-300",
    neutral: "border-slate-600 bg-slate-900 text-slate-300",
    negative: "border-rose-700 bg-rose-950/50 text-rose-300",
  };

  return (
    <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${styles[sentiment]}`}>
      {sentiment}
    </span>
  );
}

export function SeverityBadge({ severity }: { severity: AlertSeverity }) {
  const styles: Record<AlertSeverity, string> = {
    low: "border-slate-600 bg-slate-900 text-slate-300",
    medium: "border-amber-700 bg-amber-950/50 text-amber-300",
    high: "border-orange-700 bg-orange-950/50 text-orange-300",
    critical: "border-rose-700 bg-rose-950/50 text-rose-300",
  };

  return (
    <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${styles[severity]}`}>
      {severity}
    </span>
  );
}

export function RatingBadge({ rating }: { rating: NormalizedRating }) {
  const styles: Record<NormalizedRating, string> = {
    buy: "border-emerald-700 bg-emerald-950/50 text-emerald-300",
    hold: "border-slate-600 bg-slate-900 text-slate-300",
    sell: "border-rose-700 bg-rose-950/50 text-rose-300",
  };

  return (
    <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${styles[rating]}`}>
      {rating}
    </span>
  );
}
