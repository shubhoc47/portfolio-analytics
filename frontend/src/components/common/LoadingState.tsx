interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = "Loading..." }: LoadingStateProps) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white/95 p-8 text-center shadow-soft dark:border-white/10 dark:bg-piq-surface/60 dark:shadow-panel">
      <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-brand-600 dark:border-slate-600 dark:border-t-piq-accent" />
      <p className="text-sm text-slate-600 dark:text-slate-300">{message}</p>
    </div>
  );
}
