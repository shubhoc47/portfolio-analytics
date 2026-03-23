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
    <div className="flex flex-wrap gap-2 rounded-xl border border-gray-200 bg-white p-2">
      {tabs.map((tab) => {
        const isActive = tab.key === activeTab;
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChange(tab.key)}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
              isActive
                ? "bg-blue-600 text-white shadow"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
