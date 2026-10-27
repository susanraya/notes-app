import { API_BASE_URL, apiFetch, clearToken, getToken, setToken } from "@/lib/api";

export interface LoginResponseBody {
  access_token: string;
  token_type: string;
}

/** Thrown by `login` so the screen can tell "rejected" apart from "the network is down". */
export class LoginError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "LoginError";
  }
}

/**
 * Calls POST /auth/login directly rather than through `apiFetch`: that helper redirects to
 * /login on any 401, which is exactly the response a bad password returns here, and the
 * login screen needs to show its own error instead of bouncing itself.
 */
export async function login(email: string, password: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    let detail = "Those credentials were not accepted.";
    try {
      const body = (await response.json()) as { detail?: string };
      if (body?.detail) detail = body.detail;
    } catch {
      /* no JSON body on this error */
    }
    throw new LoginError(response.status, detail);
  }

  const body = (await response.json()) as LoginResponseBody;
  setToken(body.access_token);
}

export async function logout(): Promise<void> {
  try {
    await apiFetch<void>("/auth/logout", { method: "POST" });
  } catch {
    // Even if the server call fails, the session on this device still ends.
  } finally {
    clearToken();
  }
}

export function isAuthenticated(): boolean {
  return Boolean(getToken());
}
