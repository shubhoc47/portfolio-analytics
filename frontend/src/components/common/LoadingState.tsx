interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = "Loading..." }: LoadingStateProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-soft">
      <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-brand-600" />
      <p className="text-sm text-slate-600">{message}</p>
    </div>
  );
}
