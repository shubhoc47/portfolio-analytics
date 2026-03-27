import {
  TableShell,
  dataTableRowHoverClass,
  dataTableTheadClass,
  dataTableTbodyClass,
} from "../../../components/common/TableShell";
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
    <TableShell>
      <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-white/10 dark:text-piq-text-primary">
        <thead className={dataTableTheadClass}>
          <tr>
            <th className="px-4 py-3.5 text-left font-semibold">Ticker</th>
            <th className="px-4 py-3.5 text-right font-semibold">Quantity</th>
            <th className="px-4 py-3.5 text-right font-semibold">Average Cost</th>
            <th className="px-4 py-3.5 text-right font-semibold">Estimated Market Value</th>
            <th className="px-4 py-3.5 text-right font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody className={dataTableTbodyClass}>
          {holdings.map((holding) => {
            const marketValue =
              holding.current_price === null
                ? null
                : Number(holding.quantity) * Number(holding.current_price);

            return (
              <tr key={holding.id} className={dataTableRowHoverClass}>
                <td className="px-4 py-3.5 font-semibold text-slate-900 dark:text-piq-text-primary">
                  {holding.ticker}
                </td>
                <td className="px-4 py-3.5 text-right text-slate-700 dark:text-piq-text-muted">
                  {formatQuantity(Number(holding.quantity))}
                </td>
                <td className="px-4 py-3.5 text-right text-slate-700 dark:text-piq-text-muted">
                  {formatCurrency(Number(holding.average_cost), holding.currency)}
                </td>
                <td className="px-4 py-3.5 text-right text-slate-700 dark:text-piq-text-muted">
                  {marketValue === null
                    ? "Price unavailable"
                    : formatCurrency(marketValue, holding.currency)}
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex justify-end gap-2">
                    <Button variant="secondary" onClick={() => onEdit(holding)}>
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
    </TableShell>
  );
}
