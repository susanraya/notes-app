/// <reference types="vite/client" />
// Without the reference above, `import.meta.env` is not typed and `tsc --noEmit` fails --
// which `vite build` does not catch, because it tree-shakes this module out when no screen
// imports it yet.
//
// Where the generated API lives.
//
// Set at build time: the platform bakes the deployed API URL into the frontend build. The
// fallback is the local backend so a bare `npm run dev` still points somewhere real.
export const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

// Retained for compatibility with any build that still bakes a shared bearer in; apiFetch
// no longer sends it, since authenticated calls now carry the session JWT issued by
// POST /auth/login instead.
export const API_SECRET_KEY: string = import.meta.env.VITE_API_SECRET_KEY ?? "";

const TOKEN_STORAGE_KEY = "qd_notes_token";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
}

function redirectToLogin(): void {
  if (typeof window === "undefined") return;
  const base = import.meta.env.BASE_URL ?? "/";
  const target = `${base}login`.replace(/\/{2,}/g, "/");
  window.location.href = target;
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers ?? {}),
    },
  });

  if (response.status === 401) {
    // A session that is missing, expired or otherwise rejected by the API: drop it and
    // send the visitor back to log in, rather than rendering with a call that failed.
    clearToken();
    redirectToLogin();
    throw new Error(`${init?.method ?? "GET"} ${path} failed: 401`);
  }

  if (!response.ok) {
    throw new Error(`${init?.method ?? "GET"} ${path} failed: ${response.status}`);
  }
  return response.status === 204 ? (undefined as T) : ((await response.json()) as T);
}
