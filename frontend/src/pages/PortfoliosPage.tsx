import { useState } from "react";
import { Link } from "react-router-dom";

import { deletePortfolio } from "../api/portfolios";
import { EmptyState } from "../components/common/EmptyState";
import { ErrorState } from "../components/common/ErrorState";
import { LoadingState } from "../components/common/LoadingState";
import { Button } from "../components/ui/Button";
import { usePortfolios } from "../features/portfolios/hooks/usePortfolios";
import { PortfolioCard } from "../features/portfolios/components/PortfolioCard";

export function PortfoliosPage() {
  const { portfolios, isLoading, error, reload } = usePortfolios();
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDelete = async (portfolioId: number) => {
    setDeleteError(null);
    try {
      await deletePortfolio(portfolioId);
      await reload();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete portfolio.";
      setDeleteError(message);
    }
  };

  return (
    <div className="relative space-y-10 sm:space-y-12">
      <header className="relative z-[1] space-y-6">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-piq-accent">Workspace</p>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between sm:gap-8">
            <div className="mt-1 max-w-2xl space-y-2">
              <h1 className="text-2xl font-semibold tracking-tight text-piq-text-primary sm:text-[32px] sm:leading-tight">
                Portfolios
              </h1>
              <p className="text-base leading-[1.6] text-piq-text-muted">
                Manage portfolio entities, review ownership metadata, and open each portfolio workspace.
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
              <Link to="/portfolios/new" className="inline-flex w-full sm:w-auto">
                <Button
                  variant="marketingPrimary"
                  className="w-full justify-center px-5 py-2.5 shadow-[0_14px_28px_-12px_rgba(99,102,241,0.55)] sm:w-auto"
                >
                  Create Portfolio
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {deleteError ? (
        <div className="relative z-[1]">
          <ErrorState
            title="Could not delete portfolio"
            message={deleteError}
            onRetry={() => {
              setDeleteError(null);
              void reload();
            }}
          />
        </div>
      ) : null}

      {isLoading ? (
        <div className="relative z-[1]">
          <LoadingState message="Loading portfolios..." />
        </div>
      ) : null}

      {!isLoading && error ? (
        <div className="relative z-[1]">
          <ErrorState
            title="Unable to load portfolios"
            message={error}
            onRetry={() => void reload()}
          />
        </div>
      ) : null}

      {!isLoading && !error && portfolios.length === 0 ? (
        <div className="relative z-[1]">
          <EmptyState
            title="No portfolios yet"
            description="Create your first portfolio to start organizing your investment strategy."
            action={
              <Link to="/portfolios/new" className="inline-flex">
                <Button variant="marketingPrimary" className="px-5 py-2.5">
                  Create your first portfolio
                </Button>
              </Link>
            }
          />
        </div>
      ) : null}

      {!isLoading && !error && portfolios.length > 0 ? (
        <div className="relative z-[1] grid gap-6 sm:grid-cols-2 sm:gap-7 xl:grid-cols-3 xl:gap-8">
          {portfolios.map((portfolio) => (
            <PortfolioCard key={portfolio.id} portfolio={portfolio} onDelete={handleDelete} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
