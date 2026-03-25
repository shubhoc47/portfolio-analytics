import type { TextareaHTMLAttributes } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

export function Textarea({
  label,
  error,
  className = "",
  id,
  ...props
}: TextareaProps) {
  const textareaId = id || props.name;

  return (
    <div className="space-y-1">
      <label htmlFor={textareaId} className="block text-sm font-medium text-slate-700 dark:text-slate-300">
        {label}
      </label>
      <textarea
        id={textareaId}
        className={`w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:outline-none focus:ring-2 dark:bg-piq-canvas/90 dark:text-slate-100 dark:placeholder:text-slate-500 ${
          error
            ? "border-piq-loss/60 focus:border-piq-loss focus:ring-piq-loss/25 dark:border-piq-loss/50 dark:focus:border-piq-loss"
            : "border-slate-300 focus:border-piq-accent focus:ring-piq-accent/30 dark:border-white/15 dark:focus:border-piq-accent/70 dark:focus:ring-piq-accent/25"
        } ${className}`}
        {...props}
      />
      {error ? <p className="text-xs text-piq-loss dark:text-piq-loss">{error}</p> : null}
    </div>
  );
}
