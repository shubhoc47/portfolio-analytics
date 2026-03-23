import type { ReactNode } from "react";

interface SectionHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  compact?: boolean;
}

export function SectionHeader({
  title,
  description,
  actions,
  compact = false,
}: SectionHeaderProps) {
  return (
    <div
      className={`flex flex-wrap items-end justify-between gap-3 ${compact ? "" : "mb-4"}`}
    >
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-gray-900">{title}</h2>
        {description ? <p className="mt-1 text-sm text-gray-600">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}
