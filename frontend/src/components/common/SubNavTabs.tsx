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
      className="flex flex-wrap gap-2 rounded-xl border border-gray-200 bg-white p-2 shadow-soft"
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
                ? "bg-blue-600 text-white shadow"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
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
