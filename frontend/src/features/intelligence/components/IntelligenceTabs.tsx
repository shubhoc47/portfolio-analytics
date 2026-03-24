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
    <div className="flex flex-wrap gap-2 rounded-xl border border-marketing-800 bg-slate-900/80 p-2">
      {tabs.map((tab) => {
        const isActive = tab.key === activeTab;
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChange(tab.key)}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
              isActive
                ? "bg-brand-600 text-white shadow"
                : "text-slate-300 hover:bg-slate-800 hover:text-slate-100"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
