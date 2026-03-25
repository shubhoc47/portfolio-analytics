interface MetricStatItem {
  label: string;
  value: string;
  tone?: "default" | "positive" | "negative" | "accent";
}

interface MetricStatGridProps {
  items: MetricStatItem[];
  columns?: 2 | 3 | 4;
  context?: "default" | "darkSurface";
  /** Premium navy tiles (same on light/dark app shell) — portfolio workspace */
  surface?: "default" | "navyPanel";
}

const toneClasses: Record<NonNullable<MetricStatItem["tone"]>, string> = {
  default:
    "border-slate-200/90 bg-white text-slate-900 dark:border-white/10 dark:bg-piq-surface/70 dark:text-slate-100",
  positive:
    "border-piq-profit/30 bg-piq-profit/5 text-emerald-800 dark:border-piq-profit/35 dark:bg-piq-profit/10 dark:text-piq-profit",
  negative:
    "border-piq-loss/30 bg-piq-loss/5 text-rose-800 dark:border-piq-loss/35 dark:bg-piq-loss/10 dark:text-piq-loss",
  accent:
    "border-brand-300/50 bg-brand-50 text-brand-800 dark:border-piq-accent/30 dark:bg-piq-accent/10 dark:text-piq-accent",
};

/** Same inset panel as overview fields — semantics only via value color, no pastel tile fills */
const navyPanelTile =
  "rounded-xl border border-white/[0.08] bg-black/25 p-4 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] backdrop-blur-sm dark:border-white/10 dark:bg-black/30";

const navyPanelValue: Record<NonNullable<MetricStatItem["tone"]>, string> = {
  default: "text-slate-100",
  accent: "text-piq-accent",
  positive: "text-piq-profit",
  negative: "text-piq-loss",
};

const columnClasses: Record<NonNullable<MetricStatGridProps["columns"]>, string> = {
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-2 lg:grid-cols-3",
  4: "sm:grid-cols-2 lg:grid-cols-4",
};

const navyLabelClass =
  "text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-slate-500";

export function MetricStatGrid({
  items,
  columns = 4,
  context = "default",
  surface = "default",
}: MetricStatGridProps) {
  return (
    <div className={`grid gap-3 sm:gap-4 ${columnClasses[columns]}`}>
      {items.map((item) => {
        const tone = item.tone || "default";

        if (surface === "navyPanel") {
          return (
            <div key={`${item.label}-${item.value}`} className={navyPanelTile}>
              <p className={navyLabelClass}>{item.label}</p>
              <p className={`mt-1.5 text-lg font-semibold tracking-tight ${navyPanelValue[tone]}`}>
                {item.value}
              </p>
            </div>
          );
        }

        const baseToneClasses =
          tone === "default" && context === "darkSurface"
            ? "border-white/10 bg-piq-canvas/85 text-slate-100 dark:bg-piq-canvas/90"
            : toneClasses[tone];
        const labelClasses =
          tone === "default" && context === "darkSurface"
            ? "text-xs uppercase tracking-wide text-slate-400"
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
