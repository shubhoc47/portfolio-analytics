import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";

import { deletePortfolio, getPortfolio } from "../api/portfolios";
import { ErrorState } from "../components/common/ErrorState";
import { LoadingState } from "../components/common/LoadingState";
import { MetricStatGrid } from "../components/common/MetricStatGrid";
import { SubNavTabs, type SubNavTabItem } from "../components/common/SubNavTabs";
import { Button } from "../components/ui/Button";
import { PortfolioAnalyticsSection } from "../features/analytics/components/PortfolioAnalyticsSection";
import { HoldingsSection } from "../features/holdings/components/HoldingsSection";
import { PortfolioIntelligenceSection } from "../features/intelligence/components/PortfolioIntelligenceSection";
import { workspaceNavyCardClass, workspacePageHeroClass } from "../theme/workspaceSurfaces";
import type { Portfolio } from "../types/portfolio";
import { formatDate } from "../utils/format";

type PortfolioDetailTab = "overview" | "holdings" | "analytics" | "intelligence";

const heroGhostBtn =
  "text-slate-200 hover:bg-white/10 hover:text-white dark:text-slate-200 dark:hover:bg-white/10";

const fieldShell = "rounded-xl border border-white/[0.08] bg-black/25 px-4 py-3 backdrop-blur-sm dark:border-white/10 dark:bg-black/20";
const fieldLabel =
  "text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-slate-500";
const fieldValue = "mt-1 text-sm font-medium text-slate-100";

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
    <div className="relative space-y-6 sm:space-y-8">
      <div
        className="pointer-events-none absolute -top-4 left-1/2 -z-0 h-48 w-[min(100%,40rem)] -translate-x-1/2 bg-[radial-gradient(ellipse_at_50%_0%,rgba(99,102,241,0.1),transparent_65%),radial-gradient(ellipse_at_80%_30%,rgba(6,182,212,0.05),transparent_50%)] dark:bg-[radial-gradient(ellipse_at_50%_0%,rgba(99,102,241,0.16),transparent_58%)]"
        aria-hidden
      />

      {isLoading ? (
        <div className="relative z-[1]">
          <LoadingState message="Loading portfolio details..." />
        </div>
      ) : null}
      {!isLoading && error ? (
        <div className="relative z-[1]">
          <ErrorState message={error} onRetry={() => window.location.reload()} />
        </div>
      ) : null}

      {!isLoading && !error && portfolio ? (
        <div className="relative z-[1] space-y-6 sm:space-y-7">
          <header className={workspacePageHeroClass}>
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0 space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-piq-accent">
                  Portfolio
                </p>
                <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                  {portfolio.name}
                </h1>
                <p className="max-w-2xl text-sm leading-relaxed text-slate-300">
                  Explore portfolio structure, risk, benchmark context, and intelligence signals.
                </p>
                <p className="text-xs text-slate-400">
                  Last updated: {formatDate(portfolio.updated_at)} · Created{" "}
                  {formatDate(portfolio.created_at)}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 lg:shrink-0 lg:pt-1">
                <Link to={`/portfolios/${portfolio.id}/edit`} className="inline-flex">
                  <Button
                    variant="marketingSecondary"
                    className="border-white/20 bg-white/10 text-slate-100 shadow-none hover:bg-white/[0.14] dark:border-white/20 dark:bg-white/10"
                  >
                    Edit Portfolio
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  className={heroGhostBtn}
                  onClick={() => setActiveTab("intelligence")}
                >
                  View Intelligence
                </Button>
                <Link to="/portfolios" className="inline-flex">
                  <Button variant="ghost" className={heroGhostBtn}>
                    Back
                  </Button>
                </Link>
              </div>
            </div>
          </header>

          <MetricStatGrid
            columns={4}
            surface="navyPanel"
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

          <SubNavTabs
            tabs={tabs}
            activeTab={activeTab}
            onChange={setActiveTab}
            shell="darkWorkspace"
          />

          {activeTab === "overview" ? (
            <section className={`${workspaceNavyCardClass} p-6 sm:p-7`}>
              <h2 className="text-lg font-semibold text-slate-50">Overview</h2>
              <p className="mt-1 text-sm text-slate-400">
                Core profile details and governance metadata for this portfolio.
              </p>
              <dl className="mt-5 grid gap-3 text-sm md:grid-cols-2">
                <div className={fieldShell}>
                  <dt className={fieldLabel}>Name</dt>
                  <dd className={fieldValue}>{portfolio.name}</dd>
                </div>
                <div className={fieldShell}>
                  <dt className={fieldLabel}>Base currency</dt>
                  <dd className={fieldValue}>{portfolio.base_currency}</dd>
                </div>
                <div className={fieldShell}>
                  <dt className={fieldLabel}>Owner</dt>
                  <dd className={fieldValue}>{portfolio.owner_name || "Not set"}</dd>
                </div>
                <div className={fieldShell}>
                  <dt className={fieldLabel}>Created</dt>
                  <dd className={fieldValue}>{formatDate(portfolio.created_at)}</dd>
                </div>
                <div className={`${fieldShell} md:col-span-2`}>
                  <dt className={fieldLabel}>Description</dt>
                  <dd className={`${fieldValue} whitespace-pre-wrap`}>
                    {portfolio.description || "No description provided."}
                  </dd>
                </div>
              </dl>
              <div className="mt-6 border-t border-white/10 pt-5">
                <Button
                  variant="danger"
                  loading={isDeleting}
                  onClick={() => void handleDelete()}
                >
                  Delete Portfolio
                </Button>
              </div>
            </section>
          ) : null}

          {activeTab === "holdings" ? <HoldingsSection portfolioId={portfolio.id} /> : null}

          {activeTab === "analytics" ? <PortfolioAnalyticsSection portfolioId={portfolio.id} /> : null}

          {activeTab === "intelligence" ? (
            <PortfolioIntelligenceSection portfolioId={portfolio.id} />
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
