import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import Note from "./Note";
import { setToken } from "@/lib/api";

function renderNote(initialEntry: string) {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/note" element={<Note />} />
        <Route path="/notes" element={<div>Notes Screen</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

function mockFetchOnce(body: unknown, status = 200) {
  (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  });
}

describe("Note screen", () => {
  beforeEach(() => {
    localStorage.clear();
    setToken("test-token");
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("[AC-006] a new note opens an empty editor with a title field and a rich-text body", () => {
    renderNote("/note");

    const title = screen.getByLabelText(/title/i) as HTMLInputElement;
    expect(title.value).toBe("");
    expect(screen.getByRole("textbox", { name: /body/i })).toBeInTheDocument();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("opens an existing note via GET /notes/{id} and renders its stored body", async () => {
    mockFetchOnce({
      id: "n_1",
      title: "Groceries",
      body: "<p>Stored content here</p>",
      updated_at: "2026-10-26T14:32:00",
    });

    renderNote("/note?id=n_1");

    await waitFor(() =>
      expect((screen.getByLabelText(/title/i) as HTMLInputElement).value).toBe("Groceries"),
    );
    await waitFor(() => expect(screen.getByText("Stored content here")).toBeInTheDocument());
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/notes/n_1"),
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: "Bearer test-token" }),
      }),
    );
  });

  it("[AC-007] saving a new note calls POST /notes with the title", async () => {
    mockFetchOnce({
      id: "n_new",
      title: "Shopping list",
      body: "<p></p>",
      updated_at: "2026-10-27T10:00:00",
    });

    renderNote("/note");

    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: "Shopping list" } });

    await waitFor(
      () =>
        expect(fetch).toHaveBeenCalledWith(
          expect.stringContaining("/notes"),
          expect.objectContaining({ method: "POST" }),
        ),
      { timeout: 2000 },
    );
    const call = (fetch as unknown as ReturnType<typeof vi.fn>).mock.calls.find(
      ([, init]) => (init as RequestInit)?.method === "POST",
    );
    expect(JSON.parse((call?.[1] as RequestInit).body as string)).toMatchObject({
      title: "Shopping list",
    });
  });

  it("saving an existing note calls PUT /notes/{id}", async () => {
    mockFetchOnce({
      id: "n_1",
      title: "Groceries",
      body: "<p></p>",
      updated_at: "2026-10-26T14:32:00",
    });
    renderNote("/note?id=n_1");
    await waitFor(() =>
      expect((screen.getByLabelText(/title/i) as HTMLInputElement).value).toBe("Groceries"),
    );

    mockFetchOnce({
      id: "n_1",
      title: "Groceries, updated",
      body: "<p></p>",
      updated_at: "2026-10-27T10:00:00",
    });
    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: "Groceries, updated" } });

    await waitFor(
      () =>
        expect(fetch).toHaveBeenCalledWith(
          expect.stringContaining("/notes/n_1"),
          expect.objectContaining({ method: "PUT" }),
        ),
      { timeout: 2000 },
    );
  });

  it("[AC-025] offers no sync, import, or export option", () => {
    renderNote("/note");
    expect(screen.queryByText(/sync/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/import/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/export/i)).not.toBeInTheDocument();
  });

  it("[AC-004] a 401 while opening a note clears the token and never shows note content", async () => {
    (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ detail: "Not authenticated" }),
    });

    renderNote("/note?id=n_1");

    await waitFor(() => expect(localStorage.getItem("qd_notes_token")).toBeNull());
    expect(screen.queryByText(/stored content here/i)).not.toBeInTheDocument();
    expect((screen.getByLabelText(/title/i) as HTMLInputElement).value).toBe("");
  });
});
