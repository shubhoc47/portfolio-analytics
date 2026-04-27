import { FormEvent, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../auth/AuthProvider";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";

interface AuthLocationState {
  from?: { pathname?: string };
}

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/portfolios" replace />;
  }

  const redirectTo =
    (location.state as AuthLocationState | null)?.from?.pathname || "/portfolios";

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError("Email is required.");
      return;
    }
    if (!password) {
      setError("Password is required.");
      return;
    }

    setIsSubmitting(true);
    try {
      await login({ email, password });
      navigate(redirectTo, { replace: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to sign in.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="relative mx-auto flex min-h-[calc(100vh-10rem)] max-w-5xl items-center py-8">
      <div className="grid w-full gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(380px,0.8fr)] lg:items-center">
        <div className="space-y-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-piq-accent">
            Secure Workspace
          </p>
          <h1 className="max-w-2xl text-4xl font-bold tracking-tight text-piq-text-primary sm:text-5xl">
            Sign in to your portfolio command center.
          </h1>
          <p className="max-w-xl text-base leading-[1.7] text-piq-text-muted">
            Your portfolios, holdings, analytics, and market refreshes are scoped to your account.
          </p>
        </div>

        <Card variant="workspace" className="p-7">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-1">
              <h2 className="text-xl font-semibold text-piq-text-primary">Welcome back</h2>
              <p className="text-sm text-piq-text-muted">
                Use your email and password to continue.
              </p>
            </div>

            <Input
              label="Email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            <Input
              label="Password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />

            {error ? (
              <div className="rounded-xl border border-piq-loss/30 bg-piq-loss/10 px-4 py-3 text-sm text-red-100">
                {error}
              </div>
            ) : null}

            <Button
              type="submit"
              variant="marketingPrimary"
              loading={isSubmitting}
              className="w-full py-2.5"
            >
              Sign In
            </Button>

            <p className="text-center text-sm text-piq-text-muted">
              New to PortfolioIQ?{" "}
              <Link to="/signup" className="font-semibold text-piq-accent hover:text-piq-accent/80">
                Create an account
              </Link>
            </p>
          </form>
        </Card>
      </div>
    </section>
  );
}
