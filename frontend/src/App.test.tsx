import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import App from "./App";
import { setToken } from "@/lib/api";

describe("App", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("[AC-004] redirects /notes to the login page when no token is stored, with no note content", () => {
    render(
      <MemoryRouter initialEntries={["/notes"]}>
        <App />
      </MemoryRouter>,
    );
    expect(screen.getByText(/log in to notes/i)).toBeInTheDocument();
    expect(screen.queryByText(/all notes/i)).not.toBeInTheDocument();
  });

  it("[AC-004] redirects /note to the login page when no token is stored", () => {
    render(
      <MemoryRouter initialEntries={["/note"]}>
        <App />
      </MemoryRouter>,
    );
    expect(screen.getByText(/log in to notes/i)).toBeInTheDocument();
  });

  it("renders a screen inside the app shell and shows its menu when authenticated", () => {
    setToken("test-token");
    render(
      <MemoryRouter initialEntries={["/notes"]}>
        <App />
      </MemoryRouter>,
    );
    // getAllByText, not getByText: the page may repeat its menu item's text.
    expect(screen.getAllByText("Notes").length).toBeGreaterThan(0);
  });

  it("[AC-005] logs out, clears the token and sends notes routes back to login", async () => {
    setToken("test-token");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, status: 204, json: async () => undefined }),
    );

    render(
      <MemoryRouter initialEntries={["/notes"]}>
        <App />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole("button", { name: /log out/i }));

    await waitFor(() => expect(screen.getByText(/log in to notes/i)).toBeInTheDocument());
    expect(localStorage.getItem("qd_notes_token")).toBeNull();
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/auth/logout"),
      expect.objectContaining({ method: "POST" }),
    );
  });
});
