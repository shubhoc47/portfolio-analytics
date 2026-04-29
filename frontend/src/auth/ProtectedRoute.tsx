import { Navigate, useLocation } from "react-router-dom";
import type { ReactNode } from "react";

import { LoadingState } from "../components/common/LoadingState";
import { useAuth } from "./AuthProvider";

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { hasSessionExpired, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingState message="Checking your session..." />;
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location, reason: hasSessionExpired ? "session-expired" : undefined }}
      />
    );
  }

  return children;
}
