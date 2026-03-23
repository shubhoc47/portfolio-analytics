import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";

import { deletePortfolio, getPortfolio } from "../api/portfolios";
import { ErrorState } from "../components/common/ErrorState";
import { LoadingState } from "../components/common/LoadingState";
import { PageHeader } from "../components/common/PageHeader";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { PortfolioAnalyticsSection } from "../features/analytics/components/PortfolioAnalyticsSection";
import { HoldingsSection } from "../features/holdings/components/HoldingsSection";
import { PortfolioIntelligenceSection } from "../features/intelligence/components/PortfolioIntelligenceSection";
import type { Portfolio } from "../types/portfolio";
import { formatDate } from "../utils/format";

export function PortfolioDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const portfolioId = Number(id);
    if (!portfolioId) {
      setError("Invalid portfolio id.");
      setIsLoading(false);
      return;
    }

    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getPortfolio(portfolioId);
        setPortfolio(data);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to load portfolio details.";
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, [id]);

  const handleDelete = async () => {
    if (!portfolio) {
      return;
    }
    const shouldDelete = window.confirm(
      `Delete "${portfolio.name}"? This action cannot be undone.`,
    );
    if (!shouldDelete) {
      return;
    }

    setIsDeleting(true);
    try {
      await deletePortfolio(portfolio.id);
      navigate("/portfolios");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete portfolio.";
      setError(message);
      setIsDeleting(false);
    }
  };

  return (
    <section>
      <PageHeader
        title={portfolio?.name || "Portfolio details"}
        subtitle="Portfolio profile with prepared placeholders for future modules."
        actions={
          <div className="flex gap-2">
            {portfolio ? (
              <Link to={`/portfolios/${portfolio.id}/edit`}>
                <Button variant="secondary">Edit</Button>
              </Link>
            ) : null}
            <Link to="/portfolios">
              <Button variant="ghost">Back</Button>
            </Link>
          </div>
        }
      />

      {isLoading ? <LoadingState message="Loading portfolio details..." /> : null}
      {!isLoading && error ? (
        <ErrorState message={error} onRetry={() => window.location.reload()} />
      ) : null}

      {!isLoading && !error && portfolio ? (
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Portfolio Overview</h2>
            <p className="text-sm text-slate-600">
              Core profile details and metadata for this portfolio.
            </p>
          </div>

          <Card>
            <dl className="grid gap-4 text-sm md:grid-cols-2">
              <div>
                <dt className="text-slate-500">Name</dt>
                <dd className="font-medium text-slate-900">{portfolio.name}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Base currency</dt>
                <dd className="font-medium text-slate-900">{portfolio.base_currency}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Owner</dt>
                <dd className="font-medium text-slate-900">
                  {portfolio.owner_name || "Not set"}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Created</dt>
                <dd className="font-medium text-slate-900">
                  {formatDate(portfolio.created_at)}
                </dd>
              </div>
              <div className="md:col-span-2">
                <dt className="text-slate-500">Description</dt>
                <dd className="font-medium text-slate-900">
                  {portfolio.description || "No description provided."}
                </dd>
              </div>
            </dl>
            <div className="mt-6">
              <Button variant="danger" loading={isDeleting} onClick={() => void handleDelete()}>
                Delete Portfolio
              </Button>
            </div>
          </Card>

          <HoldingsSection portfolioId={portfolio.id} />

          <PortfolioAnalyticsSection portfolioId={portfolio.id} />

          <PortfolioIntelligenceSection portfolioId={portfolio.id} />
        </div>
      ) : null}
    </section>
  );
}
