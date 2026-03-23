import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";

import { deletePortfolio, getPortfolio } from "../api/portfolios";
import { ErrorState } from "../components/common/ErrorState";
import { LoadingState } from "../components/common/LoadingState";
import { MetricStatGrid } from "../components/common/MetricStatGrid";
import { SubNavTabs, type SubNavTabItem } from "../components/common/SubNavTabs";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { PortfolioAnalyticsSection } from "../features/analytics/components/PortfolioAnalyticsSection";
import { HoldingsSection } from "../features/holdings/components/HoldingsSection";
import { PortfolioIntelligenceSection } from "../features/intelligence/components/PortfolioIntelligenceSection";
import type { Portfolio } from "../types/portfolio";
import { formatDate } from "../utils/format";

type PortfolioDetailTab = "overview" | "holdings" | "analytics" | "intelligence";

export function PortfolioDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState<PortfolioDetailTab>("overview");

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

  const tabs = useMemo<SubNavTabItem<PortfolioDetailTab>[]>(
    () => [
      { key: "overview", label: "Overview" },
      { key: "holdings", label: "Holdings" },
      { key: "analytics", label: "Analytics" },
      { key: "intelligence", label: "Intelligence" },
    ],
    [],
  );

  return (
    <section>
      {isLoading ? <LoadingState message="Loading portfolio details..." /> : null}
      {!isLoading && error ? (
        <ErrorState message={error} onRetry={() => window.location.reload()} />
      ) : null}

      {!isLoading && !error && portfolio ? (
        <div className="space-y-5">
          <Card className="bg-gradient-to-br from-white to-gray-50">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-1">
                <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
                  {portfolio.name}
                </h1>
                <p className="text-sm text-gray-600">
                  Explore portfolio structure, risk, benchmark context, and intelligence signals.
                </p>
                <p className="text-xs text-gray-500">
                  Last updated: {formatDate(portfolio.updated_at)} | Created:{" "}
                  {formatDate(portfolio.created_at)}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link to={`/portfolios/${portfolio.id}/edit`}>
                  <Button variant="secondary">Edit Portfolio</Button>
                </Link>
                <Button variant="ghost" onClick={() => setActiveTab("intelligence")}>
                  View Intelligence
                </Button>
                <Link to="/portfolios">
                  <Button variant="ghost">Back</Button>
                </Link>
              </div>
            </div>
          </Card>

          <MetricStatGrid
            columns={4}
            items={[
              { label: "Base Currency", value: portfolio.base_currency, tone: "accent" },
              { label: "Owner", value: portfolio.owner_name || "Not set", tone: "default" },
              { label: "Portfolio ID", value: String(portfolio.id), tone: "default" },
              {
                label: "Description",
                value: portfolio.description ? "Available" : "Not provided",
                tone: portfolio.description ? "positive" : "default",
              },
            ]}
          />

          <SubNavTabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

          {activeTab === "overview" ? (
            <Card>
              <h2 className="text-lg font-semibold text-gray-900">Overview</h2>
              <p className="mt-1 text-sm text-gray-600">
                Core profile details and governance metadata for this portfolio.
              </p>
              <dl className="mt-4 grid gap-4 text-sm md:grid-cols-2">
                <div>
                  <dt className="text-gray-500">Name</dt>
                  <dd className="font-medium text-gray-900">{portfolio.name}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Base currency</dt>
                  <dd className="font-medium text-gray-900">{portfolio.base_currency}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Owner</dt>
                  <dd className="font-medium text-gray-900">{portfolio.owner_name || "Not set"}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Created</dt>
                  <dd className="font-medium text-gray-900">{formatDate(portfolio.created_at)}</dd>
                </div>
                <div className="md:col-span-2">
                  <dt className="text-gray-500">Description</dt>
                  <dd className="font-medium text-gray-900">
                    {portfolio.description || "No description provided."}
                  </dd>
                </div>
              </dl>
              <div className="mt-6">
                <Button
                  variant="danger"
                  loading={isDeleting}
                  className="bg-red-600 hover:bg-red-700 disabled:bg-red-300"
                  onClick={() => void handleDelete()}
                >
                  Delete Portfolio
                </Button>
              </div>
            </Card>
          ) : null}

          {activeTab === "holdings" ? <HoldingsSection portfolioId={portfolio.id} /> : null}

          {activeTab === "analytics" ? <PortfolioAnalyticsSection portfolioId={portfolio.id} /> : null}

          {activeTab === "intelligence" ? (
            <PortfolioIntelligenceSection portfolioId={portfolio.id} />
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
