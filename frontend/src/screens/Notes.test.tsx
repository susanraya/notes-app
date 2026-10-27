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

/** Parses `#rgb` / `#rrggbb` or `rgb(...)` / `rgba(...)` into 0-255 channels. */
function parseColor(value: string): [number, number, number, number] {
  const hexMatch = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.exec(value.trim());
  if (hexMatch) {
    let h = hexMatch[1];
    if (h.length === 3) {
      h = h
        .split("")
        .map((c) => c + c)
        .join("");
    }
    return [
      parseInt(h.slice(0, 2), 16),
      parseInt(h.slice(2, 4), 16),
      parseInt(h.slice(4, 6), 16),
      1,
    ];
  }
  const rgbMatch =
    /^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+)\s*)?\)$/i.exec(
      value.trim(),
    );
  if (rgbMatch) {
    return [
      Number(rgbMatch[1]),
      Number(rgbMatch[2]),
      Number(rgbMatch[3]),
      rgbMatch[4] !== undefined ? Number(rgbMatch[4]) : 1,
    ];
  }
  throw new Error(`could not parse colour value: ${value}`);
}

function isGreyscale(value: string): boolean {
  const [r, g, b] = parseColor(value);
  return r === g && g === b;
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
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining("/notes?q=gro"), expect.anything());
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

  // ---------------------------------------------------------------------
  // US-016-1 -- AC-030 / AC-031: black-and-white palette for the list,
  // its highlights and the search box.
  // ---------------------------------------------------------------------

  it("[AC-030] the search box, row text and hover-highlight colour are all greyscale with no indigo/purple/violet present", async () => {
    mockFetchOnce([
      { id: "n_1", title: "Groceries", body: "<p>Milk</p>", updated_at: "2026-10-26T14:32:00" },
    ]);
    const { container } = renderNotes();
    await waitFor(() => expect(screen.getByText("Groceries")).toBeInTheDocument());

    const root = container.firstElementChild as HTMLElement;
    expect(isGreyscale(getComputedStyle(root).backgroundColor)).toBe(true);

    const searchInput = screen.getByRole("searchbox");
    const searchStyles = getComputedStyle(searchInput);
    expect(isGreyscale(searchStyles.backgroundColor)).toBe(true);
    expect(isGreyscale(searchStyles.color)).toBe(true);

    const rowTitle = screen.getByText("Groceries");
    expect(isGreyscale(getComputedStyle(rowTitle).color)).toBe(true);

    // The row hover highlight is driven by the --qd-hover custom property on
    // the screen root -- confirm it resolves to a real, greyscale colour
    // rather than being left undefined (which would silently drop the
    // highlight entirely).
    const hoverVar = getComputedStyle(root).getPropertyValue("--qd-hover").trim();
    expect(hoverVar.length).toBeGreaterThan(0);
    expect(isGreyscale(hoverVar)).toBe(true);

    expect(container.innerHTML.toLowerCase()).not.toMatch(/indigo|purple|violet/);
  });

  it("[AC-030] dividers and the clear-search control render in the monochrome palette", async () => {
    mockFetchOnce([
      { id: "n_1", title: "Groceries", body: "<p>Milk</p>", updated_at: "2026-10-26T14:32:00" },
    ]);
    renderNotes();
    await waitFor(() => expect(screen.getByText("Groceries")).toBeInTheDocument());

    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "g" } });
    const clearInputButton = await screen.findByRole("button", { name: /clear search/i });
    expect(isGreyscale(getComputedStyle(clearInputButton).color)).toBe(true);

    const heading = screen.getByText("Newest first");
    const divider = heading.closest("div") as HTMLElement;
    expect(isGreyscale(getComputedStyle(divider).borderBottomColor)).toBe(true);
  });

  it("[AC-031] the no-results indication for a search term renders in greyscale text with a legible clear-search action", async () => {
    mockFetchOnce([
      { id: "n_1", title: "Groceries", body: "<p>Milk</p>", updated_at: "2026-10-26T14:32:00" },
    ]);
    renderNotes();
    await waitFor(() => expect(screen.getByText("Groceries")).toBeInTheDocument());

    mockFetchOnce([]);
    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "nonexistent" } });

    const message = await screen.findByText(/no notes match/i);
    expect(isGreyscale(getComputedStyle(message).color)).toBe(true);

    const clearButtons = screen.getAllByRole("button", { name: /clear search/i });
    const emptyStateClear = clearButtons[clearButtons.length - 1];
    expect(isGreyscale(getComputedStyle(emptyStateClear).backgroundColor)).toBe(true);
    expect(isGreyscale(getComputedStyle(emptyStateClear).color)).toBe(true);
  });

  // ---------------------------------------------------------------------
  // US-011-1 -- AC-022 / AC-023: responsive layout for desktop and mobile.
  // ---------------------------------------------------------------------

  it("[AC-022] the list column has a sensible max content width that keeps it readable at 1280px", async () => {
    mockFetchOnce([
      { id: "n_1", title: "Groceries", body: "<p>Milk</p>", updated_at: "2026-10-26T14:32:00" },
    ]);
    const { container } = renderNotes();
    await waitFor(() => expect(screen.getByText("Groceries")).toBeInTheDocument());

    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toContain("w-full");
    const contentColumn = root.querySelector("div.mx-auto") as HTMLElement;
    expect(contentColumn).not.toBeNull();
    expect(contentColumn.className).toContain("max-w-3xl");
    expect(contentColumn.className).toContain("w-full");
  });

  it("[AC-023] New note, search and clear-search controls each meet the 44px minimum touch target", async () => {
    mockFetchOnce([
      { id: "n_1", title: "Groceries", body: "<p>Milk</p>", updated_at: "2026-10-26T14:32:00" },
    ]);
    renderNotes();
    await waitFor(() => expect(screen.getByText("Groceries")).toBeInTheDocument());

    const newNoteButton = screen.getByRole("button", { name: /new note/i });
    expect(newNoteButton.className).toMatch(/min-h-\[44px\]/);

    const searchInput = screen.getByRole("searchbox");
    expect(searchInput.className).toMatch(/(^|\s)h-12(\s|$)/);

    fireEvent.change(searchInput, { target: { value: "g" } });
    const clearButton = await screen.findByRole("button", { name: /clear search/i });
    expect(clearButton.className).toMatch(/(^|\s)h-11(\s|$)/);
    expect(clearButton.className).toMatch(/(^|\s)w-11(\s|$)/);
  });

  it("[AC-023] the per-row delete control meets the 44px minimum touch target", async () => {
    mockFetchOnce([
      { id: "n_1", title: "Groceries", body: "<p>Milk</p>", updated_at: "2026-10-26T14:32:00" },
    ]);
    renderNotes();
    await waitFor(() => expect(screen.getByText("Groceries")).toBeInTheDocument());

    const deleteButton = screen.getByRole("button", { name: /delete “groceries”/i });
    expect(deleteButton.className).toMatch(/(^|\s)h-11(\s|$)/);
    expect(deleteButton.className).toMatch(/(^|\s)w-11(\s|$)/);
  });

  it("[AC-022] the top controls reflow to a single column below the sm breakpoint", async () => {
    mockFetchOnce([
      { id: "n_1", title: "Groceries", body: "<p>Milk</p>", updated_at: "2026-10-26T14:32:00" },
    ]);
    const { container } = renderNotes();
    await waitFor(() => expect(screen.getByText("Groceries")).toBeInTheDocument());

    const headerGrid = container.querySelector(".sm\\:grid-cols-12") as HTMLElement;
    expect(headerGrid).not.toBeNull();
    expect(headerGrid.className).toContain("grid-cols-1");
  });
});
