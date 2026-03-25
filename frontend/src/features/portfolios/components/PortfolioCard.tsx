import { Link } from "react-router-dom";

import { Button } from "../../../components/ui/Button";
import type { Portfolio } from "../../../types/portfolio";
import { formatDate } from "../../../utils/format";
import { workspaceNavyCardClass } from "../../../theme/workspaceSurfaces";

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
    <article
      className={`flex h-full flex-col justify-between p-5 ${workspaceNavyCardClass} group hover:border-piq-accent/25 hover:shadow-[0_22px_44px_-22px_rgba(99,102,241,0.35)] dark:hover:border-piq-accent/20`}
    >
      <div>
        <div className="mb-4 flex items-start justify-between gap-3">
          <h3 className="min-w-0 flex-1 text-lg font-semibold leading-snug tracking-tight text-slate-50">
            <Link
              to={`/portfolios/${portfolio.id}`}
              className="cursor-pointer rounded-md text-slate-50 transition-colors hover:text-piq-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-piq-accent/55 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0c162c]"
            >
              {portfolio.name}
            </Link>
          </h3>
          <span className="shrink-0 rounded-full border border-piq-accent/35 bg-white/[0.08] px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-[0.14em] text-piq-accent backdrop-blur-sm">
            {portfolio.base_currency}
          </span>
        </div>

        <p className="mb-5 min-h-[3rem] text-sm leading-relaxed text-slate-400">
          {portfolio.description || "No description provided."}
        </p>

        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-xl border border-white/[0.08] bg-black/25 px-3 py-2.5 backdrop-blur-sm dark:border-white/10 dark:bg-black/20">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-slate-500">
              Owner
            </p>
            <p className="mt-1 truncate text-sm font-medium text-slate-100">
              {portfolio.owner_name || "Not set"}
            </p>
          </div>
          <div className="rounded-xl border border-white/[0.08] bg-black/25 px-3 py-2.5 backdrop-blur-sm dark:border-white/10 dark:bg-black/20">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-slate-500">
              Created
            </p>
            <p className="mt-1 truncate text-sm font-medium text-slate-100">
              {formatDate(portfolio.created_at)}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-white/10 pt-4">
        <Link to={`/portfolios/${portfolio.id}`} className="inline-flex">
          <Button variant="marketingPrimary" className="px-4 shadow-[0_10px_24px_-12px_rgba(99,102,241,0.55)]">
            View
          </Button>
        </Link>
        <Link to={`/portfolios/${portfolio.id}/edit`} className="inline-flex">
          <Button variant="marketingSecondary" className="border-white/20 bg-white/10 text-slate-100 hover:bg-white/15 dark:border-white/20 dark:bg-white/10 dark:hover:bg-white/[0.14]">
            Edit
          </Button>
        </Link>
        <Button variant="danger" onClick={() => void handleDelete()}>
          Delete
        </Button>
      </div>
    </article>
  );
}
