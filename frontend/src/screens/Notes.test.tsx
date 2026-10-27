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
      {
        id: "n_1",
        title: "Groceries",
        body: "<p>Milk and eggs</p>",
        updated_at: "2026-10-26T14:32:00",
      },
    ]);

    renderNotes();

    await waitFor(() => expect(screen.getByText("Groceries")).toBeInTheDocument());
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/notes"),
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: "Bearer test-token" }),
      }),
    );
    // None of the previously hardcoded sample notes should ever appear.
    expect(screen.queryByText("Sprint retro takeaways")).not.toBeInTheDocument();
    expect(screen.queryByText("Reading list 2026")).not.toBeInTheDocument();
  });

  it("[AC-024] shows an empty state when there are no notes", async () => {
    mockFetchOnce([]);

    renderNotes();

    await waitFor(() => expect(screen.getByText(/nothing written here yet/i)).toBeInTheDocument());
  });

  it("shows an error state and can retry when the list fails to load", async () => {
    mockFetchOnce({ detail: "boom" }, 500);
    mockFetchOnce([]);

    renderNotes();

    await waitFor(() =>
      expect(screen.getByText(/couldn.t load your notes just now/i)).toBeInTheDocument(),
    );

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

  // ---------------------------------------------------------------------
  // US-010-2 -- search box wired to GET /notes?q=
  // ---------------------------------------------------------------------

  it("[AC-020] typing a term in the search box calls GET /notes?q= and filters the list to matches", async () => {
    mockFetchOnce([
      { id: "n_1", title: "Groceries", body: "<p>Milk</p>", updated_at: "2026-10-26T14:32:00" },
      { id: "n_2", title: "Trip plan", body: "<p>Flights</p>", updated_at: "2026-10-25T14:32:00" },
    ]);
    renderNotes();
    await waitFor(() => expect(screen.getByText("Groceries")).toBeInTheDocument());

    mockFetchOnce([
      { id: "n_1", title: "Groceries", body: "<p>Milk</p>", updated_at: "2026-10-26T14:32:00" },
    ]);
    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "grocer" } });

    await waitFor(
      () =>
        expect(fetch).toHaveBeenCalledWith(
          expect.stringContaining("/notes?q=grocer"),
          expect.anything(),
        ),
      { timeout: 2000 },
    );
    await waitFor(() => expect(screen.queryByText("Trip plan")).not.toBeInTheDocument());
    expect(screen.getByText("Groceries")).toBeInTheDocument();
  });

  it("[AC-021] shows an empty-result indication when no notes match, with a clear control that returns the full list", async () => {
    mockFetchOnce([
      { id: "n_1", title: "Groceries", body: "<p>Milk</p>", updated_at: "2026-10-26T14:32:00" },
    ]);
    renderNotes();
    await waitFor(() => expect(screen.getByText("Groceries")).toBeInTheDocument());

    mockFetchOnce([]);
    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "nonexistent" } });

    await waitFor(() => expect(screen.getByText(/no notes match/i)).toBeInTheDocument(), {
      timeout: 2000,
    });

    mockFetchOnce([
      { id: "n_1", title: "Groceries", body: "<p>Milk</p>", updated_at: "2026-10-26T14:32:00" },
    ]);
    const clearButtons = screen.getAllByRole("button", { name: /clear search/i });
    fireEvent.click(clearButtons[clearButtons.length - 1]);

    await waitFor(() => expect(screen.getByText("Groceries")).toBeInTheDocument());
    expect(screen.queryByText(/no notes match/i)).not.toBeInTheDocument();
  });

  it("debounces search requests so rapid keystrokes do not each trigger a fetch", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    mockFetchOnce([
      { id: "n_1", title: "Groceries", body: "<p>Milk</p>", updated_at: "2026-10-26T14:32:00" },
    ]);
    renderNotes();
    await vi.waitFor(() => expect(screen.getByText("Groceries")).toBeInTheDocument());

    const callsBefore = (fetch as unknown as ReturnType<typeof vi.fn>).mock.calls.length;
    const input = screen.getByRole("searchbox");
    fireEvent.change(input, { target: { value: "g" } });
    vi.advanceTimersByTime(100);
    fireEvent.change(input, { target: { value: "gr" } });
    vi.advanceTimersByTime(100);
    fireEvent.change(input, { target: { value: "gro" } });

    // Still within the 300ms debounce window of the last keystroke -- no
    // additional request has gone out yet.
    expect((fetch as unknown as ReturnType<typeof vi.fn>).mock.calls.length).toBe(callsBefore);

    mockFetchOnce([
      { id: "n_1", title: "Groceries", body: "<p>Milk</p>", updated_at: "2026-10-26T14:32:00" },
    ]);
    vi.advanceTimersByTime(350);

    await vi.waitFor(() =>
      expect((fetch as unknown as ReturnType<typeof vi.fn>).mock.calls.length).toBe(
        callsBefore + 1,
      ),
    );
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/notes?q=gro"),
      expect.anything(),
    );
    vi.useRealTimers();
  });

  it("discards an in-flight response for a stale search term", async () => {
    mockFetchOnce([
      { id: "n_1", title: "Groceries", body: "<p>Milk</p>", updated_at: "2026-10-26T14:32:00" },
    ]);
    renderNotes();
    await waitFor(() => expect(screen.getByText("Groceries")).toBeInTheDocument());

    // The first search's response resolves only after the second one -- it
    // must not be allowed to overwrite the result of the term that followed.
    let resolveStale: (value: unknown) => void = () => undefined;
    const stalePromise = new Promise((resolve) => {
      resolveStale = resolve;
    });
    (fetch as unknown as ReturnType<typeof vi.fn>).mockImplementationOnce(() => stalePromise);

    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "stale" } });
    await waitFor(
      () =>
        expect(fetch).toHaveBeenCalledWith(
          expect.stringContaining("/notes?q=stale"),
          expect.anything(),
        ),
      { timeout: 2000 },
    );

    mockFetchOnce([
      { id: "n_2", title: "Trip plan", body: "<p>Flights</p>", updated_at: "2026-10-25T14:32:00" },
    ]);
    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "trip" } });
    await waitFor(() => expect(screen.getByText("Trip plan")).toBeInTheDocument(), {
      timeout: 2000,
    });

    // Now let the stale "stale" request resolve. Its result must be dropped.
    resolveStale({
      ok: true,
      status: 200,
      json: async () => [
        { id: "n_1", title: "Groceries", body: "<p>Milk</p>", updated_at: "2026-10-26T14:32:00" },
      ],
    });

    await new Promise((r) => setTimeout(r, 50));
    expect(screen.getByText("Trip plan")).toBeInTheDocument();
    expect(screen.queryByText("Groceries")).not.toBeInTheDocument();
  });

  it("shows a retry affordance on a failed search and never blanks the existing list", async () => {
    mockFetchOnce([
      { id: "n_1", title: "Groceries", body: "<p>Milk</p>", updated_at: "2026-10-26T14:32:00" },
    ]);
    renderNotes();
    await waitFor(() => expect(screen.getByText("Groceries")).toBeInTheDocument());

    mockFetchOnce({ detail: "boom" }, 500);
    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "grocer" } });

    await waitFor(
      () => expect(screen.getByText(/couldn.t search your notes/i)).toBeInTheDocument(),
      { timeout: 2000 },
    );
    // The previous list is still on screen -- a failed search never blanks it.
    expect(screen.getByText("Groceries")).toBeInTheDocument();

    mockFetchOnce([
      { id: "n_1", title: "Groceries", body: "<p>Milk</p>", updated_at: "2026-10-26T14:32:00" },
    ]);
    fireEvent.click(screen.getByRole("button", { name: /try again/i }));

    await waitFor(() =>
      expect(screen.queryByText(/couldn.t search your notes/i)).not.toBeInTheDocument(),
    );
    expect(screen.getByText("Groceries")).toBeInTheDocument();
  });
});
