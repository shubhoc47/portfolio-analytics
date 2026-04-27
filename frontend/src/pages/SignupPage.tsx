import { FormEvent, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";

import { useAuth } from "../auth/AuthProvider";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";

export function SignupPage() {
  const navigate = useNavigate();
  const { isAuthenticated, signup } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/portfolios" replace />;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError("Email is required.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      await signup({
        email,
        password,
        full_name: fullName.trim() || null,
      });
      navigate("/portfolios", { replace: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to create account.";
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
            Personal Portfolio Intelligence
          </p>
          <h1 className="max-w-2xl text-4xl font-bold tracking-tight text-piq-text-primary sm:text-5xl">
            Create a private workspace for every investing decision.
          </h1>
          <p className="max-w-xl text-base leading-[1.7] text-piq-text-muted">
            Sign up with email and password, then build portfolios that only your account can access.
          </p>
        </div>

        <Card variant="workspace" className="p-7">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-1">
              <h2 className="text-xl font-semibold text-piq-text-primary">Start free</h2>
              <p className="text-sm text-piq-text-muted">
                No OAuth or extra setup. Just your email and a strong password.
              </p>
            </div>

            <Input
              label="Full name"
              name="fullName"
              type="text"
              autoComplete="name"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
            />
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
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            <Input
              label="Confirm password"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
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
              Create Account
            </Button>

            <p className="text-center text-sm text-piq-text-muted">
              Already have an account?{" "}
              <Link to="/login" className="font-semibold text-piq-accent hover:text-piq-accent/80">
                Sign in
              </Link>
            </p>
          </form>
        </Card>
      </div>
    </section>
  );
}
