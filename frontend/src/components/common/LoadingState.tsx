interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = "Loading..." }: LoadingStateProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-soft dark:border-marketing-800 dark:bg-slate-900/80">
      <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-brand-600 dark:border-slate-700 dark:border-t-brand-400" />
      <p className="text-sm text-slate-600 dark:text-slate-300">{message}</p>
    </div>
  );
}
