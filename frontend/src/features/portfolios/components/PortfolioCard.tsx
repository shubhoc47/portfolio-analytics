import { Link } from "react-router-dom";

import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import type { Portfolio } from "../../../types/portfolio";
import { formatDate } from "../../../utils/format";

interface PortfolioCardProps {
  portfolio: Portfolio;
  onDelete: (id: number) => Promise<void>;
}

export function PortfolioCard({ portfolio, onDelete }: PortfolioCardProps) {
  const handleDelete = async () => {
    const shouldDelete = window.confirm(
      `Delete "${portfolio.name}"? This action cannot be undone.`,
    );
    if (!shouldDelete) {
      return;
    }
    await onDelete(portfolio.id);
  };

  return (
    <Card variant="elevated" className="flex h-full flex-col justify-between p-5">
      <div>
        <div className="mb-3 flex items-start justify-between gap-3">
          <h3 className="text-lg font-semibold tracking-tight">
            <Link
              to={`/portfolios/${portfolio.id}`}
              className="cursor-pointer rounded text-slate-900 transition-colors hover:text-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-2 focus:ring-offset-white dark:text-slate-100 dark:hover:text-brand-300 dark:focus:ring-offset-slate-950"
            >
              {portfolio.name}
            </Link>
          </h3>
          <span className="rounded-full border border-brand-300/70 bg-brand-50/80 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-brand-700 dark:border-brand-700 dark:bg-brand-950/60 dark:text-brand-300">
            {portfolio.base_currency}
          </span>
        </div>
        <p className="mb-4 min-h-12 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          {portfolio.description || "No description provided."}
        </p>
        <dl className="space-y-1.5 rounded-xl border border-slate-200/80 bg-slate-50/80 p-3 text-xs text-slate-500 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-400">
          <div className="flex justify-between gap-4">
            <dt>Owner</dt>
            <dd className="font-medium text-slate-700 dark:text-slate-200">
              {portfolio.owner_name || "Not set"}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt>Created</dt>
            <dd className="font-medium text-slate-700 dark:text-slate-200">{formatDate(portfolio.created_at)}</dd>
          </div>
        </dl>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <Link to={`/portfolios/${portfolio.id}`}>
          <Button variant="secondary">View</Button>
        </Link>
        <Link to={`/portfolios/${portfolio.id}/edit`}>
          <Button variant="ghost">Edit</Button>
        </Link>
        <Button variant="danger" onClick={() => void handleDelete()}>
          Delete
        </Button>
      </div>
    </Card>
  );
}
