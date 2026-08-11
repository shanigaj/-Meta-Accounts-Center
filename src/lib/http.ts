// Thin client-side wrapper around fetch. Unwraps our { success, data } envelope
// and, on a 401, tries a single silent token refresh before surfacing the error.

export class HttpError extends Error {
  status: number;
  details?: unknown;
  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

type Options = Omit<RequestInit, "body"> & { body?: unknown };

let refreshing: Promise<boolean> | null = null;

async function tryRefresh(): Promise<boolean> {
  // Collapse parallel 401s into one refresh call.
  if (!refreshing) {
    refreshing = fetch("/api/auth/refresh", { method: "POST" })
      .then((r) => r.ok)
      .catch(() => false)
      .finally(() => {
        refreshing = null;
      });
  }
  return refreshing;
}

async function raw<T>(path: string, options: Options, retry = true): Promise<T> {
  const res = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  if (res.status === 401 && retry && !path.includes("/auth/")) {
    const refreshed = await tryRefresh();
    if (refreshed) return raw<T>(path, options, false);
  }

  const payload = await res.json().catch(() => null);

  if (!res.ok || !payload?.success) {
    throw new HttpError(
      payload?.message ?? "Request failed.",
      res.status,
      payload?.details
    );
  }

  return payload.data as T;
}

export const api = {
  get: <T>(path: string) => raw<T>(path, { method: "GET" }),
  post: <T>(path: string, body?: unknown) => raw<T>(path, { method: "POST", body }),
  patch: <T>(path: string, body?: unknown) => raw<T>(path, { method: "PATCH", body }),
  del: <T>(path: string) => raw<T>(path, { method: "DELETE" }),
};
