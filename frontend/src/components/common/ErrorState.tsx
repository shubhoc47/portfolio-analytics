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
    <div className="rounded-2xl border border-piq-loss/25 bg-rose-50/95 p-6 shadow-soft dark:border-piq-loss/35 dark:bg-piq-loss/10 dark:shadow-panel">
      <h2 className="text-base font-semibold text-rose-800 dark:text-piq-loss">{title}</h2>
      <p className="mt-1 text-sm text-rose-700 dark:text-rose-200">{message}</p>
      {onRetry ? (
        <div className="mt-4">
          <Button variant="secondary" onClick={onRetry}>
            Retry
          </Button>
        </div>
      ) : null}
    </div>
  );
}
