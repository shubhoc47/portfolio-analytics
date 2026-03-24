import { useState } from "react";
import { Link } from "react-router-dom";

import { deletePortfolio } from "../api/portfolios";
import { EmptyState } from "../components/common/EmptyState";
import { ErrorState } from "../components/common/ErrorState";
import { LoadingState } from "../components/common/LoadingState";
import { PageHeader } from "../components/common/PageHeader";
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
    <section className="space-y-5">
      <PageHeader
        title="Portfolios"
        subtitle="Manage portfolio entities, review ownership metadata, and open each portfolio workspace."
        actions={
          <Link to="/portfolios/new">
            <Button>Create Portfolio</Button>
          </Link>
        }
      />

      {deleteError ? (
        <div className="mb-4">
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

      {isLoading ? <LoadingState message="Loading portfolios..." /> : null}

      {!isLoading && error ? (
        <ErrorState
          title="Unable to load portfolios"
          message={error}
          onRetry={() => void reload()}
        />
      ) : null}

      {!isLoading && !error && portfolios.length === 0 ? (
        <EmptyState
          title="No portfolios yet"
          description="Create your first portfolio to start organizing your investment strategy."
          action={
            <Link to="/portfolios/new">
              <Button>Create your first portfolio</Button>
            </Link>
          }
        />
      ) : null}

      {!isLoading && !error && portfolios.length > 0 ? (
        <div className="grid gap-4 lg:gap-5 md:grid-cols-2 xl:grid-cols-3">
          {portfolios.map((portfolio) => (
            <PortfolioCard
              key={portfolio.id}
              portfolio={portfolio}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}
