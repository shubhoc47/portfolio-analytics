import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

import { getCurrentUser, login as loginRequest, signup as signupRequest } from "../api/auth";
import { ApiError, subscribeToAuthSessionExpired } from "../api/client";
import type { LoginInput, SignupInput, User } from "../types/auth";
import { clearStoredToken, getStoredToken, storeToken } from "./authStorage";

interface LogoutOptions {
  sessionExpired?: boolean;
}

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  hasSessionExpired: boolean;
  login: (payload: LoginInput) => Promise<void>;
  signup: (payload: SignupInput) => Promise<void>;
  logout: (options?: LogoutOptions) => void;
  refreshMe: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [token, setToken] = useState<string | null>(() => getStoredToken());
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasSessionExpired, setHasSessionExpired] = useState(false);

  const logout = useCallback((options: LogoutOptions = {}) => {
    clearStoredToken();
    setToken(null);
    setUser(null);
    setHasSessionExpired(Boolean(options.sessionExpired));
  }, []);

  const refreshMe = useCallback(async () => {
    const currentToken = getStoredToken();
    if (!currentToken) {
      setUser(null);
      setHasSessionExpired(false);
      setIsLoading(false);
      return;
    }

    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      setToken(currentToken);
    } catch (err) {
      logout({ sessionExpired: err instanceof ApiError && err.status === 401 });
    } finally {
      setIsLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    void refreshMe();
  }, [refreshMe]);

  useEffect(
    () => subscribeToAuthSessionExpired(() => logout({ sessionExpired: true })),
    [logout],
  );

  const login = useCallback(async (payload: LoginInput) => {
    const response = await loginRequest(payload);
    storeToken(response.access_token);
    setToken(response.access_token);
    setHasSessionExpired(false);
    const currentUser = await getCurrentUser();
    setUser(currentUser);
  }, []);

  const signup = useCallback(async (payload: SignupInput) => {
    await signupRequest(payload);
    await login({ email: payload.email, password: payload.password });
  }, [login]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isLoading,
      isAuthenticated: Boolean(token && user),
      hasSessionExpired,
      login,
      signup,
      logout,
      refreshMe,
    }),
    [hasSessionExpired, isLoading, login, logout, refreshMe, signup, token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
