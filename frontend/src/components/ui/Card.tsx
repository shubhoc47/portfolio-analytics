import type { ReactNode } from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

import { workspaceNavyCardClass } from "../../theme/workspaceSurfaces";

type CardVariant = "default" | "elevated" | "darkSurface" | "inset" | "workspace";

interface CardProps {
  children: ReactNode;
  variant?: CardVariant;
  className?: string;
}

const workspaceText = "relative z-[1] text-piq-text-primary";

const variantClasses: Record<CardVariant, string> = {
  default:
    "rounded-2xl border border-slate-200/80 bg-white/95 text-slate-900 shadow-soft dark:border-white/15 dark:bg-card-dashboard dark:text-piq-text-primary dark:shadow-[0_12px_40px_-16px_rgba(0,0,0,0.55)] dark:ring-1 dark:ring-inset dark:ring-white/[0.07]",
  elevated:
    "rounded-2xl border border-slate-200/80 bg-white text-slate-900 shadow-panel dark:border-white/15 dark:bg-card-dashboard dark:text-piq-text-primary dark:shadow-[0_12px_40px_-16px_rgba(0,0,0,0.55)] dark:ring-1 dark:ring-inset dark:ring-white/[0.07]",
  darkSurface: twMerge(workspaceNavyCardClass, workspaceText),
  inset:
    "rounded-xl border border-slate-200/80 bg-slate-50/95 shadow-soft dark:border-white/10 dark:bg-piq-card-surface/90 dark:shadow-none",
  workspace: twMerge(workspaceNavyCardClass, workspaceText),
};

export function Card({ children, variant = "default", className = "" }: CardProps) {
  const mergedClassName = twMerge(clsx("p-6", variantClasses[variant], className));

  return <div className={mergedClassName}>{children}</div>;
}
