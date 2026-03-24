import { Card } from "../../../components/ui/Card";
import type { SectorExposure } from "../types";

interface SectorExposureCardProps {
  sectorExposure: SectorExposure;
}

function formatPercent(value: number): string {
  return `${value.toFixed(2)}%`;
}

function formatCurrency(value: number): string {
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function SectorExposureCard({ sectorExposure }: SectorExposureCardProps) {
  const maxWeight = Math.max(
    ...sectorExposure.sector_exposure.map((item) => item.weight_percent),
    0,
  );

  return (
    <Card variant="darkSurface">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-100">Sector Exposure</h3>
          <p className="mt-1 text-sm text-slate-300">
            Allocation by sector using holding cost-basis weights.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 rounded-lg border border-slate-700/80 bg-slate-900/80 px-3 py-2 text-xs text-slate-300">
          <p>
            Holdings:{" "}
            <span className="font-semibold text-slate-100">{sectorExposure.total_holdings}</span>
          </p>
          <p>
            Value basis:{" "}
            <span className="font-semibold text-slate-100">
              {formatCurrency(sectorExposure.total_value_basis)}
            </span>
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {sectorExposure.sector_exposure.map((row, index) => {
          const visualWidth =
            maxWeight <= 0 ? 0 : Math.max(6, (row.weight_percent / maxWeight) * 100);

          return (
            <div
              key={row.sector}
              className="rounded-xl border border-slate-700/80 bg-slate-900/75 px-4 py-3 shadow-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                <p className="font-medium text-slate-100">{row.sector}</p>
                <div className="flex items-center gap-3 text-slate-300">
                  <span className="font-semibold text-slate-100">
                    {formatPercent(row.weight_percent)}
                  </span>
                  <span>{row.holding_count} holdings</span>
                </div>
              </div>

              <div className="mt-2 h-2 rounded-full bg-slate-700">
                <div className="h-2 rounded-full bg-brand-500 transition-all" style={{ width: `${Math.min(100, Math.max(0, visualWidth))}%` }} />
              </div>
              <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
                <span>#{index + 1} by allocation</span>
                <span>{formatPercent(row.weight_percent)} of portfolio</span>
              </div>
            </div>
          );
        })}
      </div>

      {sectorExposure.notes.length > 0 ? (
        <div className="mt-5 rounded-lg border border-slate-700 bg-slate-900 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Notes
          </p>
          <ul className="mt-2 space-y-1 text-sm leading-relaxed text-slate-300">
            {sectorExposure.notes.map((note) => (
              <li key={note}>- {note}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </Card>
  );
}
