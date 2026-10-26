import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import Login from "./Login";

function renderLogin() {
  return render(
    <MemoryRouter initialEntries={["/login"]}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/notes" element={<div>Notes Screen</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

function fillForm(email: string, password: string) {
  fireEvent.change(screen.getByLabelText(/email/i), { target: { value: email } });
  fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: password } });
}

describe("Login screen", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("[AC-001] submits correct credentials, stores the token and navigates to notes", async () => {
    (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ access_token: "token-123", token_type: "bearer" }),
    });

    renderLogin();
    fillForm("susan.raya@quorq.ai", "correct-password");
    fireEvent.click(screen.getByRole("button", { name: /log in/i }));

    await waitFor(() => expect(screen.getByText("Notes Screen")).toBeInTheDocument());
    expect(localStorage.getItem("qd_notes_token")).toBe("token-123");
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/auth/login"),
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("[AC-002] keeps the user on login and shows an error when credentials are rejected", async () => {
    (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ detail: "Incorrect email or password" }),
    });

    renderLogin();
    fillForm("wrong@example.com", "bad-password");
    fireEvent.click(screen.getByRole("button", { name: /log in/i }));

    await waitFor(() => expect(screen.getByRole("alert")).toBeInTheDocument());
    expect(screen.getByText(/log in to notes/i)).toBeInTheDocument();
    expect(screen.queryByText("Notes Screen")).not.toBeInTheDocument();
    expect(localStorage.getItem("qd_notes_token")).toBeNull();
    expect(screen.queryByText(/preview account/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/fill these in/i)).not.toBeInTheDocument();
  });

  it("[AC-003] offers no sign-up or account-creation link", () => {
    renderLogin();
    expect(screen.queryByText(/sign up/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/create an account/i)).not.toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});
