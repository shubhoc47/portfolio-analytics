import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className = "" }: CardProps) {
  return (
    <div className={`rounded-xl border border-slate-200 bg-white p-6 shadow-soft dark:border-marketing-800 dark:bg-slate-900/80 ${className}`}>
      {children}
    </div>
  );
}
