import type { ReactNode } from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export interface SegmentedTabItem<T extends string> {
  key: T;
  label: string;
  icon?: ReactNode;
}

export type SegmentedTabsShell = "default" | "darkWorkspace";

interface SegmentedTabsProps<T extends string> {
  tabs: SegmentedTabItem<T>[];
  activeTab: T;
  onChange: (key: T) => void;
  ariaLabel?: string;
  className?: string;
  shell?: SegmentedTabsShell;
}

const defaultShellClass =
  "flex flex-wrap gap-2 rounded-2xl border border-slate-200/80 bg-white/90 p-2 shadow-soft dark:border-white/10 dark:bg-piq-surface/70 dark:shadow-panel";

const darkWorkspaceShellClass =
  "flex flex-wrap gap-2 rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(30,41,59,0.92),rgba(15,23,42,0.94))] p-2 shadow-panel backdrop-blur-sm dark:border-white/10";

const tabBaseDefault =
  "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-piq-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-piq-canvas";

const tabBaseDarkRail =
  "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-piq-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1e293b]";

const tabInactiveDefault =
  "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-white";

const tabInactiveDark =
  "text-slate-400 hover:bg-white/10 hover:text-slate-100";

const tabActive =
  "bg-gradient-primary text-white shadow-soft ring-1 ring-piq-accent/30 dark:ring-piq-accent/25";

export function SegmentedTabs<T extends string>({
  tabs,
  activeTab,
  onChange,
  ariaLabel = "Section navigation",
  className = "",
  shell = "default",
}: SegmentedTabsProps<T>) {
  const shellClass = shell === "darkWorkspace" ? darkWorkspaceShellClass : defaultShellClass;
  const tabBase = shell === "darkWorkspace" ? tabBaseDarkRail : tabBaseDefault;
  const tabInactive = shell === "darkWorkspace" ? tabInactiveDark : tabInactiveDefault;

  return (
    <div role="tablist" aria-label={ariaLabel} className={twMerge(clsx(shellClass, className))}>
      {tabs.map((tab) => {
        const isActive = tab.key === activeTab;
        return (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.key)}
            className={clsx(tabBase, isActive ? tabActive : tabInactive)}
          >
            {tab.icon}
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
