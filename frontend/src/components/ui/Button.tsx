import type { ButtonHTMLAttributes, ReactNode } from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "danger"
  | "ghost"
  | "marketingPrimary"
  | "marketingSecondary";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  loading?: boolean;
  children: ReactNode;
}

const focusRing =
  "focus:outline-none focus:ring-2 focus:ring-piq-accent/50 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-piq-accent/45 dark:focus:ring-offset-piq-canvas";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-gradient-primary text-white shadow-sm hover:opacity-92 disabled:opacity-50 disabled:from-slate-400 disabled:to-slate-500 dark:shadow-soft",
  secondary:
    "border border-slate-300/90 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50 disabled:border-slate-300 disabled:text-slate-400 dark:border-white/15 dark:bg-piq-surface/60 dark:text-slate-100 dark:hover:border-white/25 dark:hover:bg-piq-surface dark:disabled:border-slate-600 dark:disabled:text-slate-500",
  danger:
    "bg-piq-loss text-white shadow-sm hover:opacity-90 disabled:opacity-45 dark:disabled:opacity-40",
  ghost:
    "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 disabled:text-slate-400 dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-white dark:disabled:text-slate-500",
  marketingPrimary:
    "border border-piq-accent/35 bg-gradient-primary text-white shadow-soft hover:opacity-95 dark:border-piq-accent/30 disabled:border-slate-300 disabled:opacity-50 dark:disabled:border-slate-600",
  marketingSecondary:
    "border border-slate-200/90 bg-white/90 text-slate-900 hover:border-slate-300 hover:bg-white dark:border-white/15 dark:bg-white/5 dark:text-piq-text-primary dark:backdrop-blur-sm dark:hover:border-white/25 dark:hover:bg-white/10 disabled:border-slate-300 disabled:bg-slate-200 disabled:text-slate-500 dark:disabled:border-slate-600 dark:disabled:bg-white/5 dark:disabled:text-slate-500",
};

export function Button({
  variant = "primary",
  loading = false,
  children,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const mergedClassName = twMerge(
    clsx(
      "inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed",
      focusRing,
      variantClasses[variant],
      className,
    ),
  );

  return (
    <button className={mergedClassName} disabled={disabled || loading} {...props}>
      {loading ? "Please wait..." : children}
    </button>
  );
}
