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

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-brand-600 text-white shadow-sm hover:bg-brand-500 disabled:bg-slate-300 disabled:text-slate-500 dark:bg-brand-500 dark:hover:bg-brand-400 dark:disabled:bg-slate-700 dark:disabled:text-slate-300",
  secondary:
    "border border-slate-300/90 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50 disabled:border-slate-300 disabled:text-slate-400 dark:border-slate-600 dark:bg-slate-900/70 dark:text-slate-100 dark:hover:border-slate-500 dark:hover:bg-slate-800/80 dark:disabled:border-slate-700 dark:disabled:text-slate-500",
  danger:
    "bg-rose-600 text-white shadow-sm hover:bg-rose-500 disabled:bg-rose-300 disabled:text-rose-100 dark:bg-rose-600 dark:hover:bg-rose-500 dark:disabled:bg-rose-900 dark:disabled:text-rose-200",
  ghost: "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 disabled:text-slate-400 dark:text-slate-300 dark:hover:bg-slate-800/80 dark:hover:text-slate-100 dark:disabled:text-slate-500",
  marketingPrimary:
    "border border-cyan-200/30 bg-gradient-to-r from-brand-500 to-cyan-500 text-white hover:from-brand-400 hover:to-cyan-400 focus:ring-cyan-300 focus:ring-offset-white dark:border-cyan-500/40 dark:focus:ring-offset-slate-950 disabled:border-slate-300 disabled:from-slate-400 disabled:to-slate-400 disabled:text-slate-100 dark:disabled:border-slate-700 dark:disabled:from-slate-700 dark:disabled:to-slate-700 dark:disabled:text-slate-300",
  marketingSecondary:
    "border border-slate-200/80 bg-white/80 text-slate-900 hover:border-slate-300 hover:bg-white focus:ring-brand-300 focus:ring-offset-white dark:border-slate-600/80 dark:bg-slate-900/65 dark:text-slate-100 dark:hover:border-slate-500 dark:hover:bg-slate-900/85 dark:focus:ring-offset-slate-950 disabled:border-slate-300 disabled:bg-slate-200 disabled:text-slate-500 dark:disabled:border-slate-700 dark:disabled:bg-slate-800 dark:disabled:text-slate-400",
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
      "inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-brand-300 dark:focus:ring-offset-slate-950 disabled:cursor-not-allowed",
      variantClasses[variant],
      className,
    ),
  );

  return (
    <button
      className={mergedClassName}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? "Please wait..." : children}
    </button>
  );
}
