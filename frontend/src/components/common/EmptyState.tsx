import type { ReactNode } from "react";

interface EmptyStateProps {
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300/90 bg-white/95 p-10 text-center shadow-soft dark:border-white/[0.1] dark:bg-piq-card-surface dark:shadow-card-lift">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-piq-text-primary">{title}</h2>
      <p className="mx-auto mt-2 max-w-xl text-base leading-[1.6] text-slate-600 dark:text-piq-text-muted">
        {description}
      </p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
