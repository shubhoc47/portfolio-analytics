import { Button } from "../../../components/ui/Button";
import type { Holding } from "../types";

interface HoldingsListProps {
  holdings: Holding[];
  deletingHoldingId: number | null;
  onEdit: (holding: Holding) => void;
  onDelete: (holding: Holding) => Promise<void>;
}

function formatCurrency(value: number | null, currency: string): string {
  if (value === null) {
    return "N/A";
  }

  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return value.toFixed(2);
  }
}

function formatQuantity(value: number): string {
  return new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 4,
  }).format(value);
}

export function HoldingsList({
  holdings,
  deletingHoldingId,
  onEdit,
  onDelete,
}: HoldingsListProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-soft dark:border-slate-700 dark:bg-slate-900">
      <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-700">
        <thead className="bg-slate-100 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-950 dark:text-slate-400">
          <tr>
            <th className="px-4 py-3 text-left font-semibold">Ticker</th>
            <th className="px-4 py-3 text-right font-semibold">Quantity</th>
            <th className="px-4 py-3 text-right font-semibold">Average Cost</th>
            <th className="px-4 py-3 text-right font-semibold">Estimated Market Value</th>
            <th className="px-4 py-3 text-right font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-800 dark:bg-slate-900">
          {holdings.map((holding) => {
            const marketValue =
              holding.current_price === null
                ? null
                : Number(holding.quantity) * Number(holding.current_price);

            return (
              <tr key={holding.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">{holding.ticker}</td>
                <td className="px-4 py-3 text-right text-slate-700 dark:text-slate-300">
                  {formatQuantity(Number(holding.quantity))}
                </td>
                <td className="px-4 py-3 text-right text-slate-700 dark:text-slate-300">
                  {formatCurrency(Number(holding.average_cost), holding.currency)}
                </td>
                <td className="px-4 py-3 text-right text-slate-700 dark:text-slate-300">
                  {marketValue === null
                    ? "Price unavailable"
                    : formatCurrency(marketValue, holding.currency)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" onClick={() => onEdit(holding)}>
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      loading={deletingHoldingId === holding.id}
                      onClick={() => void onDelete(holding)}
                    >
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
