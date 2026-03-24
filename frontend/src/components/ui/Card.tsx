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
    "rounded-2xl border border-slate-200/80 bg-white/88 shadow-soft dark:border-slate-700/70 dark:bg-slate-900/80",
  elevated:
    "rounded-2xl border border-slate-200/75 bg-white/94 shadow-[0_16px_32px_-24px_rgba(15,23,42,0.45)] dark:border-slate-700/70 dark:bg-slate-900/85",
  darkSurface:
    "rounded-2xl border border-slate-200/55 bg-[linear-gradient(160deg,rgba(16,30,58,0.98),rgba(15,28,52,0.94))] shadow-[0_18px_34px_-24px_rgba(2,6,23,0.85)] dark:border-slate-700/70 dark:bg-[linear-gradient(160deg,rgba(10,20,41,0.98),rgba(10,19,37,0.94))]",
  inset:
    "rounded-xl border border-slate-200/80 bg-slate-50/78 shadow-[0_10px_24px_-24px_rgba(15,23,42,0.45)] dark:border-slate-700/70 dark:bg-slate-900/70",
};

export function Card({ children, variant = "default", className = "" }: CardProps) {
  const mergedClassName = twMerge(clsx("p-6", variantClasses[variant], className));

  return (
    <div className={mergedClassName}>
      {children}
    </div>
  );
}
