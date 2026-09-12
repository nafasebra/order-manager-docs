import type { ApiError, FieldErrors } from "@/types";

const API_BASE = "/api/v1";

function getCsrfToken(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|; )csrf_token=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export class ApiClientError extends Error {
  readonly code: ApiError["code"];
  readonly status: number;
  readonly fieldErrors?: FieldErrors;

  constructor(error: ApiError) {
    super(error.message);
    this.name = "ApiClientError";
    this.code = error.code;
    this.status = error.status;
    this.fieldErrors = error.fieldErrors;
  }
}

function mapStatus(status: number): ApiError["code"] {
  switch (status) {
    case 401:
      return "unauthorized";
    case 403:
      return "forbidden";
    case 404:
      return "not_found";
    case 409:
      return "conflict";
    case 422:
      return "validation";
    default:
      return "unknown";
  }
}

async function parseError(res: Response): Promise<ApiClientError> {
  let message = res.statusText || "Request failed";
  let fieldErrors: FieldErrors | undefined;

  try {
    const body = (await res.json()) as {
      message?: string;
      errors?: FieldErrors;
    };
    if (body.message) message = body.message;
    if (body.errors) fieldErrors = body.errors;
  } catch {
    // ignore non-JSON bodies
  }

  return new ApiClientError({
    code: mapStatus(res.status),
    message,
    status: res.status,
    fieldErrors,
  });
}

export type RequestOptions = {
  method?: string;
  body?: unknown;
  searchParams?: Record<string, string | number | boolean | undefined | null>;
  headers?: HeadersInit;
  signal?: AbortSignal;
};

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = "GET", body, searchParams, headers, signal } = options;

  const url = new URL(`${API_BASE}${path}`, window.location.origin);
  if (searchParams) {
    for (const [key, value] of Object.entries(searchParams)) {
      if (value === undefined || value === null || value === "") continue;
      url.searchParams.set(key, String(value));
    }
  }

  const isMutation = !["GET", "HEAD", "OPTIONS"].includes(method.toUpperCase());
  const reqHeaders = new Headers(headers);
  if (body !== undefined) {
    reqHeaders.set("Content-Type", "application/json");
  }
  if (isMutation) {
    const csrf = getCsrfToken();
    if (csrf) reqHeaders.set("X-CSRF-Token", csrf);
  }

  const res = await fetch(url.toString(), {
    method,
    credentials: "include",
    headers: reqHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal,
  });

  if (!res.ok) {
    throw await parseError(res);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return (await res.json()) as T;
}

export const api = {
  get: <T>(path: string, options?: Omit<RequestOptions, "method" | "body">) =>
    apiRequest<T>(path, { ...options, method: "GET" }),
  post: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, "method" | "body">) =>
    apiRequest<T>(path, { ...options, method: "POST", body }),
  patch: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, "method" | "body">) =>
    apiRequest<T>(path, { ...options, method: "PATCH", body }),
  put: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, "method" | "body">) =>
    apiRequest<T>(path, { ...options, method: "PUT", body }),
  delete: <T>(path: string, options?: Omit<RequestOptions, "method" | "body">) =>
    apiRequest<T>(path, { ...options, method: "DELETE" }),
};
