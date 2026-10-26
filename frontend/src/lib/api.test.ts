import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { apiFetch, clearToken, setToken } from "./api";

describe("apiFetch", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    clearToken();
  });

  it("attaches the stored JWT as the Authorization bearer", async () => {
    setToken("abc123");
    (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ ok: true }),
    });

    await apiFetch("/notes");

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/notes"),
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: "Bearer abc123" }),
      }),
    );
  });

  it("sends no Authorization header when there is no stored token", async () => {
    (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ ok: true }),
    });

    await apiFetch("/notes");

    const call = (fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0];
    expect((call[1]?.headers as Record<string, string>).Authorization).toBeUndefined();
  });

  it("clears the stored token and redirects to /login on a 401", async () => {
    setToken("expired-token");
    (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ detail: "Not authenticated" }),
    });

    await expect(apiFetch("/notes")).rejects.toThrow();

    expect(localStorage.getItem("qd_notes_token")).toBeNull();
  });
});
