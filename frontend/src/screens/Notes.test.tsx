import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import Notes from "./Notes";
import { setToken } from "@/lib/api";

function renderNotes() {
  return render(
    <MemoryRouter initialEntries={["/notes"]}>
      <Routes>
        <Route path="/notes" element={<Notes />} />
        <Route path="/note" element={<div>Note Screen</div>} />
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

describe("Notes screen", () => {
  beforeEach(() => {
    localStorage.clear();
    setToken("test-token");
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("[AC-024] renders notes fetched from GET /notes with no seeded sample data", async () => {
    mockFetchOnce([
      { id: "n_1", title: "Groceries", body: "<p>Milk and eggs</p>", updated_at: "2026-10-26T14:32:00" },
    ]);

    renderNotes();

    await waitFor(() => expect(screen.getByText("Groceries")).toBeInTheDocument());
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/notes"),
      expect.objectContaining({ headers: expect.objectContaining({ Authorization: "Bearer test-token" }) }),
    );
    // None of the previously hardcoded sample notes should ever appear.
    expect(screen.queryByText("Sprint retro takeaways")).not.toBeInTheDocument();
    expect(screen.queryByText("Reading list 2026")).not.toBeInTheDocument();
  });

  it("[AC-024] shows an empty state when there are no notes", async () => {
    mockFetchOnce([]);

    renderNotes();

    await waitFor(() =>
      expect(screen.getByText(/nothing written here yet/i)).toBeInTheDocument(),
    );
  });

  it("shows an error state and can retry when the list fails to load", async () => {
    mockFetchOnce({ detail: "boom" }, 500);
    mockFetchOnce([]);

    renderNotes();

    await waitFor(() => expect(screen.getByText(/couldn.t load your notes just now/i)).toBeInTheDocument());

    fireEvent.click(screen.getByRole("button", { name: /try again/i }));

    await waitFor(() => expect(screen.getByText(/nothing written here yet/i)).toBeInTheDocument());
  });

  it("[AC-006] clicking New note navigates to the note editor", async () => {
    mockFetchOnce([]);
    renderNotes();

    await waitFor(() => expect(screen.getByText(/nothing written here yet/i)).toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: /new note/i }));

    await waitFor(() => expect(screen.getByText("Note Screen")).toBeInTheDocument());
  });

  it("[AC-025] offers no sync, import, or export option", async () => {
    mockFetchOnce([
      { id: "n_1", title: "Groceries", body: "<p>Milk</p>", updated_at: "2026-10-26T14:32:00" },
    ]);
    renderNotes();

    await waitFor(() => expect(screen.getByText("Groceries")).toBeInTheDocument());
    expect(screen.queryByText(/sync/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/import/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/export/i)).not.toBeInTheDocument();
  });

  it("[AC-004] a 401 while loading notes clears the token and never shows note content", async () => {
    (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ detail: "Not authenticated" }),
    });

    renderNotes();

    await waitFor(() => expect(localStorage.getItem("qd_notes_token")).toBeNull());
    expect(screen.queryByText(/nothing written here yet/i)).not.toBeInTheDocument();
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });

  it("deletes a note and removes it from the list", async () => {
    mockFetchOnce([
      { id: "n_1", title: "Groceries", body: "<p>Milk</p>", updated_at: "2026-10-26T14:32:00" },
    ]);
    renderNotes();
    await waitFor(() => expect(screen.getByText("Groceries")).toBeInTheDocument());

    mockFetchOnce(undefined, 204);
    fireEvent.click(screen.getByRole("button", { name: /delete “groceries”/i }));
    fireEvent.click(await screen.findByRole("button", { name: /delete note/i }));

    await waitFor(() => expect(screen.queryByText("Groceries")).not.toBeInTheDocument());
  });
});
