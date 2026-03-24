import { Card } from "../../../components/ui/Card";

interface BreakdownItem {
  label: string;
  value: string;
}

interface ScoreBreakdownCardProps {
  title: string;
  subtitle: string;
  items: BreakdownItem[];
  notes?: string[];
}

export function ScoreBreakdownCard({
  title,
  subtitle,
  items,
  notes = [],
}: ScoreBreakdownCardProps) {
  return (
    <Card variant="darkSurface" className="h-full">
      <h3 className="text-base font-semibold text-slate-100">{title}</h3>
      <p className="mt-1 text-sm leading-relaxed text-slate-300">{subtitle}</p>

      <dl className="mt-4 grid gap-3 sm:grid-cols-2">
        {items.map((item) => (
          <div
            key={item.label}
            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5"
          >
            <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              {item.label}
            </dt>
            <dd className="mt-1 text-base font-semibold text-slate-100">{item.value}</dd>
          </div>
        ))}
      </dl>

      {notes.length > 0 ? (
        <div className="mt-5 rounded-lg border border-slate-700 bg-slate-900 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Notes</p>
          <ul className="mt-2 space-y-1 text-sm leading-relaxed text-slate-300">
            {notes.map((note) => (
              <li key={note}>- {note}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </Card>
  );
}
