import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function Input({ label, error, className = "", id, ...props }: InputProps) {
  const inputId = id || props.name;

  return (
    <div className="space-y-1">
      <label htmlFor={inputId} className="block text-sm font-medium text-slate-700 dark:text-slate-300">
        {label}
      </label>
      <input
        id={inputId}
        className={`w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:outline-none focus:ring-2 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 ${
          error
            ? "border-rose-400 focus:border-rose-500 focus:ring-rose-200 dark:border-rose-500 dark:focus:border-rose-400 dark:focus:ring-rose-800/70"
            : "border-slate-300 focus:border-brand-500 focus:ring-brand-200 dark:border-slate-700 dark:focus:border-marketing-400 dark:focus:ring-marketing-700/50"
        } ${className}`}
        {...props}
      />
      {error ? <p className="text-xs text-rose-600 dark:text-rose-300">{error}</p> : null}
    </div>
  );
}
