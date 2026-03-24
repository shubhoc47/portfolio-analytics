import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";

import { getPortfolio, updatePortfolio } from "../api/portfolios";
import { ErrorState } from "../components/common/ErrorState";
import { LoadingState } from "../components/common/LoadingState";
import { PageHeader } from "../components/common/PageHeader";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import {
  PortfolioForm,
  type PortfolioFormSubmitPayload,
} from "../features/portfolios/components/PortfolioForm";
import type { Portfolio } from "../types/portfolio";

export function PortfolioEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const portfolioId = Number(id);
    if (!portfolioId) {
      setLoadError("Invalid portfolio id.");
      setIsLoading(false);
      return;
    }

    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const data = await getPortfolio(portfolioId);
        setPortfolio(data);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to load portfolio details.";
        setLoadError(message);
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, [id]);

  const handleSubmit = async (payload: PortfolioFormSubmitPayload) => {
    if (!portfolio) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const updated = await updatePortfolio(portfolio.id, payload);
      navigate(`/portfolios/${updated.id}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update portfolio.";
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="space-y-5">
      <PageHeader
        title="Edit Portfolio"
        subtitle="Update portfolio metadata while preserving portfolio-level analytics and intelligence history."
        actions={
          <div className="flex gap-2">
            {portfolio ? (
              <Link to={`/portfolios/${portfolio.id}`}>
                <Button variant="secondary">View</Button>
              </Link>
            ) : null}
            <Link to="/portfolios">
              <Button variant="ghost">Back</Button>
            </Link>
          </div>
        }
      />

      {isLoading ? <LoadingState message="Loading portfolio for edit..." /> : null}
      {!isLoading && loadError ? <ErrorState message={loadError} /> : null}

      {!isLoading && !loadError && portfolio ? (
        <Card variant="elevated">
          <PortfolioForm
            initialValues={{
              name: portfolio.name,
              description: portfolio.description || "",
              base_currency: portfolio.base_currency,
              owner_name: portfolio.owner_name || "",
            }}
            submitLabel="Save Changes"
            isSubmitting={isSubmitting}
            submitError={submitError}
            onSubmit={handleSubmit}
          />
        </Card>
      ) : null}
    </section>
  );
}
