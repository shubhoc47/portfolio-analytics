import type { ReactNode } from "react";

export interface SubNavTabItem<T extends string> {
  key: T;
  label: string;
  icon?: ReactNode;
}

interface SubNavTabsProps<T extends string> {
  tabs: SubNavTabItem<T>[];
  activeTab: T;
  onChange: (tab: T) => void;
}

export function SubNavTabs<T extends string>({
  tabs,
  activeTab,
  onChange,
}: SubNavTabsProps<T>) {
  return (
    <div
      role="tablist"
      aria-label="Section navigation"
      className="flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-white p-2 shadow-soft dark:border-marketing-800 dark:bg-slate-900/80"
    >
      {tabs.map((tab) => {
        const isActive = tab.key === activeTab;
        return (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.key)}
            className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
              isActive
                ? "bg-brand-600 text-white shadow"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
