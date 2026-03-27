import type { ReactNode } from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

interface TableShellProps {
  children: ReactNode;
  className?: string;
}

const frameClass =
  "overflow-x-auto rounded-2xl border border-slate-200/80 bg-white/95 shadow-soft dark:border-white/15 dark:bg-card-dashboard dark:shadow-[0_12px_40px_-16px_rgba(0,0,0,0.55)] dark:ring-1 dark:ring-inset dark:ring-white/[0.07]";

/** Shared table chrome for data tables inside TableShell */
export const dataTableTheadClass =
  "bg-slate-100/95 text-xs uppercase tracking-wide text-slate-500 dark:bg-white/[0.06] dark:text-piq-text-muted";

export const dataTableTbodyClass =
  "divide-y divide-slate-200 bg-white/95 dark:divide-white/10 dark:bg-transparent";

export const dataTableRowHoverClass =
  "transition-colors hover:bg-slate-50/90 dark:hover:bg-white/[0.04]";

export function TableShell({ children, className = "" }: TableShellProps) {
  return <div className={twMerge(clsx(frameClass, className))}>{children}</div>;
}
