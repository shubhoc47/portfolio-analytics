const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.trim() || "http://localhost:8000";

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

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { jsonBody, headers, ...rest } = options;

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...rest,
      headers: {
        "Content-Type": "application/json",
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

  const json = (await response.json().catch(() => null)) as
    | { detail?: string }
    | null;

  if (!response.ok) {
    throw new ApiError(
      response.status,
      json?.detail || "Something went wrong. Please try again.",
    );
  }

  return json as T;
}
