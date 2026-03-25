import { useState } from "react";
import { Link } from "react-router-dom";

import { deletePortfolio } from "../api/portfolios";
import { EmptyState } from "../components/common/EmptyState";
import { ErrorState } from "../components/common/ErrorState";
import { LoadingState } from "../components/common/LoadingState";
import { Button } from "../components/ui/Button";
import { usePortfolios } from "../features/portfolios/hooks/usePortfolios";
import { PortfolioCard } from "../features/portfolios/components/PortfolioCard";
import { workspacePageHeroClass } from "../theme/workspaceSurfaces";

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
    <div className="relative space-y-6 sm:space-y-8">
      <div
        className="pointer-events-none absolute -top-4 left-1/2 -z-0 h-56 w-[min(100%,42rem)] -translate-x-1/2 bg-[radial-gradient(ellipse_at_50%_0%,rgba(99,102,241,0.12),transparent_65%),radial-gradient(ellipse_at_80%_20%,rgba(6,182,212,0.06),transparent_50%)] dark:bg-[radial-gradient(ellipse_at_50%_0%,rgba(99,102,241,0.18),transparent_60%),radial-gradient(ellipse_at_20%_10%,rgba(6,182,212,0.08),transparent_48%)]"
        aria-hidden
      />

      <header className={`${workspacePageHeroClass} relative z-[1]`}>
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
          <div className="space-y-2 sm:space-y-2.5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-piq-accent">
              Workspace
            </p>
            <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl sm:leading-tight">
              Portfolios
            </h1>
            <p className="max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-[0.9375rem]">
              Manage portfolio entities, review ownership metadata, and open each portfolio workspace.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
            <Link to="/portfolios/new" className="inline-flex w-full sm:w-auto">
              <Button
                variant="marketingPrimary"
                className="w-full justify-center px-5 py-2.5 shadow-[0_14px_28px_-14px_rgba(99,102,241,0.65)] sm:w-auto"
              >
                Create Portfolio
              </Button>
            </Link>
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
        <div className="relative z-[1] grid gap-5 sm:grid-cols-2 sm:gap-6 xl:grid-cols-3">
          {portfolios.map((portfolio) => (
            <PortfolioCard
              key={portfolio.id}
              portfolio={portfolio}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
