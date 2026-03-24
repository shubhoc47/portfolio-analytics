import type { ReactNode } from "react";

interface EmptyStateProps {
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300/90 bg-white/90 p-10 text-center shadow-soft dark:border-slate-700 dark:bg-slate-900/80">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h2>
      <p className="mx-auto mt-2 max-w-xl text-sm text-slate-600 dark:text-slate-300">{description}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
