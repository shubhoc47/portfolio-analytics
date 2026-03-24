import { Link, NavLink, useLocation } from "react-router-dom";
import type { ReactNode } from "react";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { pathname } = useLocation();
  const isHome = pathname === "/";

  return (
    <div
      className={
        isHome
          ? "min-h-screen bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.14),transparent_42%),linear-gradient(180deg,#f8fbff_0%,#eef4ff_34%,#dfe9fb_62%,#d4e1f8_100%)] dark:bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.2),transparent_45%),linear-gradient(180deg,#060a17_0%,#0b142a_38%,#0f1a33_70%,#111f38_100%)]"
          : "min-h-screen bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.1),transparent_44%),linear-gradient(180deg,#f8fbff_0%,#edf3ff_42%,#e7eefb_100%)] dark:bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.15),transparent_48%),linear-gradient(180deg,#070d1e_0%,#0c162c_48%,#111b33_100%)]"
      }
    >
      <header
        className={
          isHome
            ? "sticky top-0 z-20 border-b border-slate-200/70 bg-slate-50/75 backdrop-blur-xl dark:border-slate-700/50 dark:bg-[#070d1f]/70"
            : "sticky top-0 z-20 border-b border-slate-200/70 bg-slate-50/80 backdrop-blur-xl dark:border-slate-700/60 dark:bg-[#070d1f]/72"
        }
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
          <Link
            to="/"
            className={
              isHome
                ? "text-lg font-semibold tracking-tight text-slate-900 transition-colors hover:text-slate-700 dark:text-slate-100 dark:hover:text-white"
                : "text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100"
            }
          >
            PortfolioIQ
          </Link>
          <div className="flex items-center gap-3">
            <nav className="flex items-center gap-1 text-sm font-medium">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  isActive
                    ? "rounded-lg border border-slate-300/80 bg-white/80 px-3 py-1.5 text-slate-900 shadow-sm dark:border-slate-600/80 dark:bg-slate-900/70 dark:text-slate-100"
                    : "rounded-lg px-3 py-1.5 text-slate-600 transition hover:bg-white/60 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-900/40 dark:hover:text-white"
                }
              >
                Home
              </NavLink>
              <NavLink
                to="/portfolios"
                className={({ isActive }) =>
                  isActive
                    ? "rounded-lg border border-slate-300/80 bg-white/80 px-3 py-1.5 text-slate-900 shadow-sm dark:border-slate-600/80 dark:bg-slate-900/70 dark:text-slate-100"
                    : "rounded-lg px-3 py-1.5 text-slate-600 transition hover:bg-white/60 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-900/40 dark:hover:text-white"
                }
              >
                Portfolios
              </NavLink>
            </nav>
          </div>
        </div>
      </header>

      <main className={isHome ? "mx-auto max-w-6xl px-4 pb-10 pt-5 sm:px-6 sm:pb-12 sm:pt-6 lg:px-8" : "mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8"}>
        {children}
      </main>
    </div>
  );
}
