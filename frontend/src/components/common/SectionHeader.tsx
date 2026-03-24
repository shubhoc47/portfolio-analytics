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
      className={`flex flex-wrap items-end justify-between gap-3 ${compact ? "" : "mb-4 sm:mb-5"}`}
    >
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100 sm:text-[1.18rem]">
          {title}
        </h2>
        {description ? (
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}
