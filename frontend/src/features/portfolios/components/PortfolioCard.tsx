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
    <Card className="flex h-full flex-col justify-between">
      <div>
        <div className="mb-2 flex items-start justify-between gap-3">
          <h3 className="text-lg font-semibold text-slate-900">{portfolio.name}</h3>
          <span className="rounded-full bg-brand-50 px-2 py-1 text-xs font-medium text-brand-700">
            {portfolio.base_currency}
          </span>
        </div>
        <p className="mb-4 min-h-12 text-sm text-slate-600">
          {portfolio.description || "No description provided."}
        </p>
        <dl className="space-y-1 text-xs text-slate-500">
          <div className="flex justify-between gap-4">
            <dt>Owner</dt>
            <dd className="font-medium text-slate-700">
              {portfolio.owner_name || "Not set"}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt>Created</dt>
            <dd className="font-medium text-slate-700">{formatDate(portfolio.created_at)}</dd>
          </div>
        </dl>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
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
