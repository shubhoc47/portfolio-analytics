import { Link } from "react-router-dom";

import { Button } from "../../../components/ui/Button";
import type { Portfolio } from "../../../types/portfolio";
import { formatDate } from "../../../utils/format";
import { workspaceNavyCardClass } from "../../../theme/workspaceSurfaces";

interface PortfolioCardProps {
  portfolio: Portfolio;
  onDelete: (id: number) => Promise<void>;
}

const metaFieldClass =
  "rounded-xl border border-white/10 bg-slate-950/35 px-3 py-2.5 backdrop-blur-sm";

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
      className={`group flex h-full flex-col justify-between p-6 ${workspaceNavyCardClass} hover:-translate-y-1 hover:border-white/25 hover:shadow-[0_20px_48px_-20px_rgba(0,0,0,0.55),0_0_0_1px_rgba(255,255,255,0.12)]`}
    >
      <div className="relative z-[1]">
        <div className="mb-4 flex items-start justify-between gap-3">
          <h3 className="min-w-0 flex-1 text-lg font-semibold leading-snug tracking-tight text-piq-text-primary">
            <Link
              to={`/portfolios/${portfolio.id}`}
              className="!text-piq-text-primary cursor-pointer rounded-md no-underline transition-colors hover:!text-piq-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-piq-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0F172A]"
            >
              {portfolio.name}
            </Link>
          </h3>
          <span className="shrink-0 rounded-full border border-white/10 bg-white/[0.06] px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-piq-accent backdrop-blur-sm">
            {portfolio.base_currency}
          </span>
        </div>

        <p className="mb-5 min-h-[3rem] text-base leading-[1.6] text-piq-text-muted">
          {portfolio.description || "No description provided."}
        </p>

        <div className="grid grid-cols-2 gap-2.5">
          <div className={metaFieldClass}>
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-piq-text-muted">
              Owner
            </p>
            <p className="mt-1 truncate text-sm font-medium text-piq-text-primary">
              {portfolio.owner_name || "Not set"}
            </p>
          </div>
          <div className={metaFieldClass}>
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-piq-text-muted">
              Created
            </p>
            <p className="mt-1 truncate text-sm font-medium text-piq-text-primary">
              {formatDate(portfolio.created_at)}
            </p>
          </div>
        </div>
      </div>

      <div className="relative z-[1] mt-6 flex flex-wrap items-center gap-2 border-t border-white/10 pt-5">
        <Link to={`/portfolios/${portfolio.id}`} className="inline-flex">
          <Button
            variant="marketingPrimary"
            className="px-4 py-2 text-sm shadow-[0_10px_24px_-12px_rgba(99,102,241,0.45)]"
          >
            View
          </Button>
        </Link>
        <Link to={`/portfolios/${portfolio.id}/edit`} className="inline-flex">
          <Button variant="marketingSecondary" className="px-4 py-2 text-sm">
            Edit
          </Button>
        </Link>
        <Button variant="danger" className="px-4 py-2 text-sm" onClick={() => void handleDelete()}>
          Delete
        </Button>
      </div>
    </article>
  );
}
