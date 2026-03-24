export type IntelligenceTabKey = "news" | "sentiment" | "summaries" | "alerts" | "ratings";

export interface IntelligenceTabItem {
  key: IntelligenceTabKey;
  label: string;
}

interface IntelligenceTabsProps {
  tabs: IntelligenceTabItem[];
  activeTab: IntelligenceTabKey;
  onChange: (tab: IntelligenceTabKey) => void;
}

export function IntelligenceTabs({ tabs, activeTab, onChange }: IntelligenceTabsProps) {
  return (
    <div className="flex flex-wrap gap-2 rounded-2xl border border-slate-200/80 bg-white/85 p-2 shadow-soft dark:border-slate-700/70 dark:bg-slate-900/80">
      {tabs.map((tab) => {
        const isActive = tab.key === activeTab;
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChange(tab.key)}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
              isActive
                ? "bg-brand-600 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
