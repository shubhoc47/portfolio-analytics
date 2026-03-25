import type { AlertSeverity, NormalizedRating, SentimentLabel } from "../types";

const base = "rounded-full border px-2 py-0.5 text-xs";

export function SentimentBadge({ sentiment }: { sentiment: SentimentLabel }) {
  const styles: Record<SentimentLabel, string> = {
    positive: `${base} border-piq-profit/35 bg-piq-profit/10 font-medium text-emerald-800 dark:text-piq-profit`,
    neutral: `${base} border-slate-300 bg-slate-100 font-medium text-slate-700 dark:border-white/15 dark:bg-piq-canvas/80 dark:text-slate-300`,
    negative: `${base} border-piq-loss/35 bg-piq-loss/10 font-medium text-rose-800 dark:text-piq-loss`,
  };

  return <span className={styles[sentiment]}>{sentiment}</span>;
}

export function SeverityBadge({ severity }: { severity: AlertSeverity }) {
  const styles: Record<AlertSeverity, string> = {
    low: `${base} border-slate-300 bg-slate-100 font-semibold text-slate-700 dark:border-white/15 dark:bg-piq-canvas/80 dark:text-slate-300`,
    medium: `${base} border-amber-300/80 bg-amber-50 font-semibold text-amber-800 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-300`,
    high: `${base} border-orange-300/80 bg-orange-50 font-semibold text-orange-800 dark:border-orange-500/40 dark:bg-orange-500/10 dark:text-orange-300`,
    critical: `${base} border-piq-loss/40 bg-piq-loss/10 font-semibold text-rose-800 dark:text-piq-loss`,
  };

  return <span className={styles[severity]}>{severity}</span>;
}

export function RatingBadge({ rating }: { rating: NormalizedRating }) {
  const styles: Record<NormalizedRating, string> = {
    buy: `${base} border-piq-profit/35 bg-piq-profit/10 font-semibold text-emerald-800 dark:text-piq-profit`,
    hold: `${base} border-slate-300 bg-slate-100 font-semibold text-slate-700 dark:border-white/15 dark:bg-piq-canvas/80 dark:text-slate-300`,
    sell: `${base} border-piq-loss/35 bg-piq-loss/10 font-semibold text-rose-800 dark:text-piq-loss`,
  };

  return <span className={styles[rating]}>{rating}</span>;
}
