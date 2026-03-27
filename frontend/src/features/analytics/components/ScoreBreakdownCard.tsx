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

const rowClass =
  "rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2.5 backdrop-blur-sm";

export function ScoreBreakdownCard({
  title,
  subtitle,
  items,
  notes = [],
}: ScoreBreakdownCardProps) {
  return (
    <Card variant="workspace" className="h-full">
      <h3 className="text-base font-semibold text-piq-text-primary">{title}</h3>
      <p className="mt-1 text-sm leading-relaxed text-piq-text-muted">{subtitle}</p>

      <dl className="mt-4 grid gap-3 sm:grid-cols-2">
        {items.map((item) => (
          <div key={item.label} className={rowClass}>
            <dt className="text-[11px] font-semibold uppercase tracking-wide text-piq-text-muted">
              {item.label}
            </dt>
            <dd className="mt-1 text-base font-semibold text-piq-text-primary">{item.value}</dd>
          </div>
        ))}
      </dl>

      {notes.length > 0 ? (
        <div className="mt-5 rounded-lg border border-white/[0.08] bg-white/[0.04] p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-piq-text-muted">Notes</p>
          <ul className="mt-2 space-y-1 text-sm leading-relaxed text-piq-text-muted">
            {notes.map((note) => (
              <li key={note}>- {note}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </Card>
  );
}
