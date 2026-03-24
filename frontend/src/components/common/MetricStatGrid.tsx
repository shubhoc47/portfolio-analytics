interface MetricStatItem {
  label: string;
  value: string;
  tone?: "default" | "positive" | "negative" | "accent";
}

interface MetricStatGridProps {
  items: MetricStatItem[];
  columns?: 2 | 3 | 4;
  context?: "default" | "darkSurface";
}

const toneClasses: Record<NonNullable<MetricStatItem["tone"]>, string> = {
  default:
    "border-slate-200 bg-white text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100",
  positive:
    "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300",
  negative:
    "border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-700 dark:bg-rose-950/50 dark:text-rose-300",
  accent:
    "border-brand-200 bg-brand-50 text-brand-800 dark:border-brand-700 dark:bg-brand-950/50 dark:text-brand-300",
};

const columnClasses: Record<NonNullable<MetricStatGridProps["columns"]>, string> = {
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-2 lg:grid-cols-3",
  4: "sm:grid-cols-2 lg:grid-cols-4",
};

export function MetricStatGrid({ items, columns = 4, context = "default" }: MetricStatGridProps) {
  return (
    <div className={`grid gap-3 ${columnClasses[columns]}`}>
      {items.map((item) => {
        const tone = item.tone || "default";
        const baseToneClasses =
          tone === "default" && context === "darkSurface"
            ? "border-slate-300/20 bg-slate-950/45 text-slate-100 dark:border-slate-700/70 dark:bg-slate-900/70"
            : toneClasses[tone];
        const labelClasses =
          tone === "default" && context === "darkSurface"
            ? "text-xs uppercase tracking-wide text-slate-300 dark:text-slate-400"
            : "text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400";

        return (
          <div key={`${item.label}-${item.value}`} className={`rounded-xl border p-4 ${baseToneClasses}`}>
            <p className={labelClasses}>{item.label}</p>
            <p className="mt-1 text-lg font-semibold">{item.value}</p>
          </div>
        );
      })}
    </div>
  );
}
