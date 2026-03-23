import type { AlertSeverity, NormalizedRating, SentimentLabel } from "../types";

export function SentimentBadge({ sentiment }: { sentiment: SentimentLabel }) {
  const styles: Record<SentimentLabel, string> = {
    positive: "border-green-200 bg-green-50 text-green-700",
    neutral: "border-gray-300 bg-gray-100 text-gray-700",
    negative: "border-red-200 bg-red-50 text-red-700",
  };

  return (
    <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${styles[sentiment]}`}>
      {sentiment}
    </span>
  );
}

export function SeverityBadge({ severity }: { severity: AlertSeverity }) {
  const styles: Record<AlertSeverity, string> = {
    low: "border-gray-300 bg-gray-100 text-gray-700",
    medium: "border-amber-200 bg-amber-50 text-amber-700",
    high: "border-orange-200 bg-orange-50 text-orange-700",
    critical: "border-red-200 bg-red-50 text-red-700",
  };

  return (
    <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${styles[severity]}`}>
      {severity}
    </span>
  );
}

export function RatingBadge({ rating }: { rating: NormalizedRating }) {
  const styles: Record<NormalizedRating, string> = {
    buy: "border-green-200 bg-green-50 text-green-700",
    hold: "border-gray-300 bg-gray-100 text-gray-700",
    sell: "border-red-200 bg-red-50 text-red-700",
  };

  return (
    <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${styles[rating]}`}>
      {rating}
    </span>
  );
}
