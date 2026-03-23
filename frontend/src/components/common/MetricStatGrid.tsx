interface MetricStatItem {
  label: string;
  value: string;
  tone?: "default" | "positive" | "negative" | "accent";
}

interface MetricStatGridProps {
  items: MetricStatItem[];
  columns?: 2 | 3 | 4;
}

const toneClasses: Record<NonNullable<MetricStatItem["tone"]>, string> = {
  default: "border-gray-200 bg-white text-gray-900",
  positive: "border-green-200 bg-green-50 text-green-800",
  negative: "border-red-200 bg-red-50 text-red-800",
  accent: "border-blue-200 bg-blue-50 text-blue-800",
};

const columnClasses: Record<NonNullable<MetricStatGridProps["columns"]>, string> = {
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-2 lg:grid-cols-3",
  4: "sm:grid-cols-2 lg:grid-cols-4",
};

export function MetricStatGrid({ items, columns = 4 }: MetricStatGridProps) {
  return (
    <div className={`grid gap-3 ${columnClasses[columns]}`}>
      {items.map((item) => {
        const tone = item.tone || "default";
        return (
          <div key={`${item.label}-${item.value}`} className={`rounded-xl border p-4 ${toneClasses[tone]}`}>
            <p className="text-xs uppercase tracking-wide text-gray-500">{item.label}</p>
            <p className="mt-1 text-lg font-semibold">{item.value}</p>
          </div>
        );
      })}
    </div>
  );
}
