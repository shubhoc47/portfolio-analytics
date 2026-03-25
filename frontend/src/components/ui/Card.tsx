import type { ReactNode } from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

type CardVariant = "default" | "elevated" | "darkSurface" | "inset";

interface CardProps {
  children: ReactNode;
  variant?: CardVariant;
  className?: string;
}

const variantClasses: Record<CardVariant, string> = {
  default:
    "rounded-2xl border border-slate-200/80 bg-white/95 shadow-soft dark:border-white/10 dark:bg-piq-surface/80 dark:shadow-panel",
  elevated:
    "rounded-2xl border border-slate-200/80 bg-white shadow-panel dark:border-white/10 dark:bg-piq-surface dark:shadow-panel",
  darkSurface:
    "rounded-2xl border border-slate-700/70 bg-slate-900 text-slate-100 shadow-panel dark:border-white/10 dark:bg-[linear-gradient(165deg,rgba(30,41,59,0.98),rgba(15,23,42,0.96))] dark:text-slate-100",
  inset:
    "rounded-xl border border-slate-200/80 bg-slate-50/95 shadow-soft dark:border-white/10 dark:bg-piq-canvas/90 dark:shadow-none",
};

export function Card({ children, variant = "default", className = "" }: CardProps) {
  const mergedClassName = twMerge(clsx("p-6", variantClasses[variant], className));

  return <div className={mergedClassName}>{children}</div>;
}
