import { Link, NavLink } from "react-router-dom";
import type { ReactNode } from "react";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" className="text-lg font-semibold tracking-tight text-slate-900">
            PortfolioIQ
          </Link>
          <nav className="flex items-center gap-5 text-sm font-medium">
            <NavLink
              to="/"
              className={({ isActive }) =>
                isActive ? "text-brand-700" : "text-slate-600 hover:text-slate-900"
              }
            >
              Home
            </NavLink>
            <NavLink
              to="/portfolios"
              className={({ isActive }) =>
                isActive ? "text-brand-700" : "text-slate-600 hover:text-slate-900"
              }
            >
              Portfolios
            </NavLink>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
