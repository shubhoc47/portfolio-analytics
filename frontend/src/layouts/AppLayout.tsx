import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import type { ReactNode } from "react";

import { useAuth } from "../auth/AuthProvider";
import { Button } from "../components/ui/Button";

interface AppLayoutProps {
  children: ReactNode;
}

const shellDefault =
  "min-h-screen bg-app-shell-light bg-cover dark:bg-app-shell-dark";

const shellLanding =
  "relative min-h-screen overflow-hidden bg-landing-page bg-cover";

const headerDefault =
  "sticky top-0 z-20 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl dark:border-white/10 dark:bg-piq-canvas/75";

const headerLanding =
  "sticky top-0 z-20 border-b border-white/10 bg-slate-950/40 backdrop-blur-xl";

const navLinkBase =
  "rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-200/70 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-white";

const navLinkLanding =
  "rounded-lg px-3 py-1.5 text-sm font-medium text-piq-text-muted transition hover:bg-white/5 hover:text-piq-text-primary";

const navLinkActive =
  "bg-gradient-primary text-white shadow-soft ring-1 ring-piq-accent/35 dark:ring-piq-accent/25";

const linkBrandDefault =
  "text-lg font-semibold tracking-tight text-slate-900 transition-colors hover:text-brand-600 dark:text-slate-100 dark:hover:text-piq-accent";

const linkBrandLanding =
  "text-lg font-semibold tracking-tight text-piq-text-primary transition-colors hover:text-piq-accent";

/** Landing + portfolio workspace: same gradient shell and dark UI tokens as marketing home */
function isWorkspaceShellPath(pathname: string) {
  return (
    pathname === "/" ||
    pathname.startsWith("/portfolios") ||
    pathname === "/login" ||
    pathname === "/signup"
  );
}

export function AppLayout({ children }: AppLayoutProps) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, logout, user } = useAuth();
  const workspaceShell = isWorkspaceShellPath(pathname);

  const shellClass = workspaceShell ? shellLanding : shellDefault;
  const headerClass = workspaceShell ? headerLanding : headerDefault;
  const navBase = workspaceShell ? navLinkLanding : navLinkBase;
  const linkBrand = workspaceShell ? linkBrandLanding : linkBrandDefault;

  const mainContent = workspaceShell ? <div className="dark">{children}</div> : children;

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className={shellClass}>
      {workspaceShell ? (
        <>
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-[min(70vh,520px)] bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(99,102,241,0.18),transparent_55%)]"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-[min(50vh,360px)] bg-[radial-gradient(ellipse_70%_50%_at_80%_100%,rgba(6,182,212,0.08),transparent_50%)]"
            aria-hidden
          />
        </>
      ) : null}

      <header className={headerClass}>
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
          <Link to="/" className={linkBrand}>
            PortfolioIQ
          </Link>
          <div className="flex items-center gap-3">
            <nav className="flex items-center gap-1 text-sm font-medium">
              <NavLink
                to="/"
                className={({ isActive }) => (isActive ? `${navBase} ${navLinkActive}` : navBase)}
                end
              >
                Home
              </NavLink>
              <NavLink
                to="/portfolios"
                className={({ isActive }) => (isActive ? `${navBase} ${navLinkActive}` : navBase)}
              >
                Portfolios
              </NavLink>
            </nav>
            {isAuthenticated ? (
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="hidden max-w-[180px] truncate text-sm text-piq-text-muted sm:inline">
                  {user?.email}
                </span>
                <Button variant="marketingSecondary" className="px-3 py-1.5" onClick={handleLogout}>
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className={navBase}>
                  Sign in
                </Link>
                <Link
                  to="/signup"
                  className="rounded-lg border border-piq-accent/35 bg-gradient-primary px-3 py-1.5 text-sm font-medium text-white shadow-soft hover:opacity-95"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="relative mx-auto max-w-6xl px-4 pb-10 pt-6 sm:px-6 sm:pb-12 sm:pt-7 lg:px-8">
        {mainContent}
      </main>
    </div>
  );
}
