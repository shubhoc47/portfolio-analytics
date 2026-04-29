import { getStoredToken } from "../auth/authStorage";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.trim() || "http://localhost:8000";

export const AUTH_SESSION_EXPIRED_EVENT = "portfolioiq:auth-session-expired";

export interface AuthSessionExpiredEventDetail {
  status: number;
  detail: string;
  path: string;
}

export class ApiError extends Error {
  readonly status: number;
  readonly detail: string;

  constructor(status: number, detail: string) {
    super(detail);
    this.status = status;
    this.detail = detail;
  }
}

interface RequestOptions extends RequestInit {
  jsonBody?: unknown;
}

interface ValidationDetail {
  msg?: string;
}

export function subscribeToAuthSessionExpired(
  listener: (detail: AuthSessionExpiredEventDetail) => void,
): () => void {
  const handleSessionExpired = (event: Event) => {
    listener((event as CustomEvent<AuthSessionExpiredEventDetail>).detail);
  };

  window.addEventListener(AUTH_SESSION_EXPIRED_EVENT, handleSessionExpired);
  return () => window.removeEventListener(AUTH_SESSION_EXPIRED_EVENT, handleSessionExpired);
}

function extractErrorMessage(payload: unknown): string {
  if (!payload || typeof payload !== "object") {
    return "Something went wrong. Please try again.";
  }

  const detail = (payload as { detail?: unknown }).detail;

  if (typeof detail === "string") {
    return detail;
  }

  if (Array.isArray(detail)) {
    const firstMessage = (detail[0] as ValidationDetail | undefined)?.msg;
    if (firstMessage) {
      return firstMessage;
    }
  }

  return "Something went wrong. Please try again.";
}

function isAuthEndpoint(path: string): boolean {
  return path.startsWith("/api/v1/auth/login") || path.startsWith("/api/v1/auth/signup");
}

function notifyAuthSessionExpired(detail: AuthSessionExpiredEventDetail): void {
  window.dispatchEvent(
    new CustomEvent<AuthSessionExpiredEventDetail>(AUTH_SESSION_EXPIRED_EVENT, {
      detail,
    }),
  );
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { jsonBody, headers, ...rest } = options;

  let response: Response;
  const token = getStoredToken();
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...rest,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      body: jsonBody === undefined ? undefined : JSON.stringify(jsonBody),
    });
  } catch {
    throw new ApiError(
      0,
      "Cannot reach backend API. Check backend server, VITE_API_BASE_URL, and CORS settings.",
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const json = (await response.json().catch(() => null)) as unknown;

  if (!response.ok) {
    const detail = extractErrorMessage(json);
    if (response.status === 401 && token && !isAuthEndpoint(path)) {
      notifyAuthSessionExpired({ status: response.status, detail, path });
    }

    throw new ApiError(response.status, detail);
  }

  return json as T;
}
