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
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-soft">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
          <tr>
            <th className="px-4 py-3 text-left font-semibold">Ticker</th>
            <th className="px-4 py-3 text-right font-semibold">Quantity</th>
            <th className="px-4 py-3 text-right font-semibold">Average Cost</th>
            <th className="px-4 py-3 text-right font-semibold">Estimated Market Value</th>
            <th className="px-4 py-3 text-right font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {holdings.map((holding) => {
            const marketValue =
              holding.current_price === null
                ? null
                : Number(holding.quantity) * Number(holding.current_price);

            return (
              <tr key={holding.id} className="hover:bg-gray-50/70">
                <td className="px-4 py-3 font-medium text-gray-900">{holding.ticker}</td>
                <td className="px-4 py-3 text-right text-gray-700">
                  {formatQuantity(Number(holding.quantity))}
                </td>
                <td className="px-4 py-3 text-right text-gray-700">
                  {formatCurrency(Number(holding.average_cost), holding.currency)}
                </td>
                <td className="px-4 py-3 text-right text-gray-700">
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
