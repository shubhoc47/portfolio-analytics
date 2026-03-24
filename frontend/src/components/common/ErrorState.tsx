import { Button } from "../ui/Button";

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = "Something went wrong",
  message,
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 dark:border-rose-700 dark:bg-rose-950/50">
      <h2 className="text-base font-semibold text-rose-800 dark:text-rose-300">{title}</h2>
      <p className="mt-1 text-sm text-rose-700 dark:text-rose-200">{message}</p>
      {onRetry ? (
        <div className="mt-4">
          <Button
            variant="secondary"
            className="dark:border-marketing-400/40 dark:bg-marketing-900/60 dark:text-slate-100 dark:hover:bg-marketing-800/70"
            onClick={onRetry}
          >
            Retry
          </Button>
        </div>
      ) : null}
    </div>
  );
}
