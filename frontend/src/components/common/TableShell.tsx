import type { ReactNode } from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

interface TableShellProps {
  children: ReactNode;
  className?: string;
}

const frameClass =
  "overflow-x-auto rounded-2xl border border-slate-200/80 bg-white/95 shadow-soft dark:border-white/10 dark:bg-piq-surface/80 dark:shadow-panel";

/** Shared table chrome for data tables inside TableShell */
export const dataTableTheadClass =
  "bg-slate-100/95 text-xs uppercase tracking-wide text-slate-500 dark:bg-piq-canvas/80 dark:text-slate-400";

export const dataTableTbodyClass =
  "divide-y divide-slate-200 bg-white/95 dark:divide-white/10 dark:bg-piq-surface/40";

export const dataTableRowHoverClass = "transition-colors hover:bg-slate-50/90 dark:hover:bg-white/5";

export function TableShell({ children, className = "" }: TableShellProps) {
  return <div className={twMerge(clsx(frameClass, className))}>{children}</div>;
}
