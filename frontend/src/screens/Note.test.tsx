import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
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

/** Selects the whole body (the keymap StarterKit includes binds Mod-a to
 * select-all), the way a person would before applying formatting to text
 * they've already written. */
function selectAllInBody(pm: HTMLElement) {
  pm.focus();
  fireEvent.keyDown(pm, { key: "a", code: "KeyA", ctrlKey: true });
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

  // ---------------------------------------------------------------------
  // US-006 -- AC-011: the edited title and body are stored and shown when
  // the note is reopened.
  // ---------------------------------------------------------------------

  it("[AC-011] editing an existing note's title sends both the new title and the unchanged body in the save", async () => {
    mockFetchOnce({
      id: "n_1",
      title: "Groceries",
      body: "<p>Milk and eggs</p>",
      updated_at: "2026-10-26T14:32:00",
    });
    renderNote("/note?id=n_1");
    await waitFor(() => expect(screen.getByText("Milk and eggs")).toBeInTheDocument());

    mockFetchOnce({
      id: "n_1",
      title: "Groceries, updated",
      body: "<p>Milk and eggs</p>",
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
    const call = (fetch as unknown as ReturnType<typeof vi.fn>).mock.calls.find(
      ([, init]) => (init as RequestInit)?.method === "PUT",
    );
    const sentBody = JSON.parse((call?.[1] as RequestInit).body as string);
    expect(sentBody.title).toBe("Groceries, updated");
    expect(sentBody.body).toContain("Milk and eggs");
  });

  it("[AC-011] reopening a note after it was edited shows the content the server now stores", async () => {
    // First visit: the note as it was before this edit.
    mockFetchOnce({
      id: "n_1",
      title: "Groceries",
      body: "<p>Original body</p>",
      updated_at: "2026-10-26T14:32:00",
    });
    const { unmount } = renderNote("/note?id=n_1");
    await waitFor(() => expect(screen.getByText("Original body")).toBeInTheDocument());
    // Leaving the screen, as a user navigating away after their edit was saved elsewhere.
    unmount();

    // Reopening the same note re-fetches it; the screen must render whatever
    // the server returns now, not anything left over from the first visit.
    mockFetchOnce({
      id: "n_1",
      title: "Groceries, updated",
      body: "<p>Edited body</p>",
      updated_at: "2026-10-27T10:00:00",
    });
    renderNote("/note?id=n_1");

    await waitFor(() =>
      expect((screen.getByLabelText(/title/i) as HTMLInputElement).value).toBe(
        "Groceries, updated",
      ),
    );
    expect(screen.getByText("Edited body")).toBeInTheDocument();
    expect(screen.queryByText("Original body")).not.toBeInTheDocument();
  });

  // ---------------------------------------------------------------------
  // US-006 -- AC-012: saving an edit sets the note's last-updated timestamp
  // to the time of that change, and the screen reflects it.
  // ---------------------------------------------------------------------

  it("[AC-012] after an edit is saved, the displayed last-updated stamp moves to the new updated_at from the server", async () => {
    mockFetchOnce({
      id: "n_1",
      title: "Groceries",
      body: "<p>Milk</p>",
      updated_at: "2026-10-20T09:00:00",
    });
    renderNote("/note?id=n_1");
    await waitFor(() =>
      expect((screen.getByLabelText(/title/i) as HTMLInputElement).value).toBe("Groceries"),
    );
    // The stale timestamp from before this edit is what's currently shown.
    await waitFor(() => expect(screen.getByText(/20 Oct 2026/)).toBeInTheDocument());

    mockFetchOnce({
      id: "n_1",
      title: "Groceries, updated",
      body: "<p>Milk</p>",
      updated_at: "2026-10-27T11:45:00",
    });
    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: "Groceries, updated" } });

    // The save round trip's response timestamp -- not a client-side clock
    // guess -- is what the screen now shows as the last-updated stamp.
    await waitFor(() => expect(screen.getByText(/27 Oct 2026/)).toBeInTheDocument(), {
      timeout: 2000,
    });
    expect(screen.queryByText(/20 Oct 2026/)).not.toBeInTheDocument();
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

  // ---------------------------------------------------------------------
  // US-004 -- AC-008: bold, list, heading and link formatting on selected
  // text shows in the editor and round-trips through a save and reopen.
  // ---------------------------------------------------------------------

  it("[AC-008] applying bold to selected text shows a <strong> in the editor, is marked pressed, and is sent to PUT /notes/{id}", async () => {
    mockFetchOnce({
      id: "n_1",
      title: "Groceries",
      body: "<p>Format me</p>",
      updated_at: "2026-10-26T14:32:00",
    });
    const { container } = renderNote("/note?id=n_1");
    await waitFor(() => expect(screen.getByText("Format me")).toBeInTheDocument());

    const pm = container.querySelector(".ProseMirror") as HTMLElement;
    selectAllInBody(pm);
    fireEvent.click(screen.getByRole("button", { name: "Bold" }));

    // Shown in the editor immediately, and the toolbar reflects the active state.
    expect(pm.querySelector("strong")).not.toBeNull();
    expect(pm.querySelector("strong")?.textContent).toBe("Format me");
    expect(screen.getByRole("button", { name: "Bold" })).toHaveAttribute("aria-pressed", "true");

    mockFetchOnce({
      id: "n_1",
      title: "Groceries",
      body: "<p><strong>Format me</strong></p>",
      updated_at: "2026-10-27T10:00:00",
    });

    // Retained when saved: the markup is in the autosave payload, not
    // dropped before it reaches the server.
    await waitFor(
      () =>
        expect(fetch).toHaveBeenCalledWith(
          expect.stringContaining("/notes/n_1"),
          expect.objectContaining({ method: "PUT" }),
        ),
      { timeout: 2000 },
    );
    const call = (fetch as unknown as ReturnType<typeof vi.fn>).mock.calls.find(
      ([, init]) => (init as RequestInit)?.method === "PUT",
    );
    const sentBody = JSON.parse((call?.[1] as RequestInit).body as string);
    expect(sentBody.body).toContain("<strong>Format me</strong>");
  });

  it("[AC-008] applying a heading, a bullet list and a link to selected text each show the matching tag in the editor", async () => {
    mockFetchOnce({
      id: "n_1",
      title: "Groceries",
      body: "<p>Format me</p>",
      updated_at: "2026-10-26T14:32:00",
    });
    const { container } = renderNote("/note?id=n_1");
    await waitFor(() => expect(screen.getByText("Format me")).toBeInTheDocument());

    const pm = container.querySelector(".ProseMirror") as HTMLElement;

    selectAllInBody(pm);
    fireEvent.click(screen.getByRole("button", { name: "Heading" }));
    expect(pm.querySelector("h3")).not.toBeNull();
    expect(pm.querySelector("h3")?.textContent).toBe("Format me");

    selectAllInBody(pm);
    fireEvent.click(screen.getByRole("button", { name: "List" }));
    expect(pm.querySelector("ul > li")).not.toBeNull();

    selectAllInBody(pm);
    fireEvent.click(screen.getByRole("button", { name: "Link" }));
    expect(pm.querySelector("a")).not.toBeNull();
  });

  it("[AC-008] formatting applied before a save is still shown when the note is reopened", async () => {
    mockFetchOnce({
      id: "n_1",
      title: "Groceries",
      body: "<p>Format me</p>",
      updated_at: "2026-10-26T14:32:00",
    });
    const { container, unmount } = renderNote("/note?id=n_1");
    await waitFor(() => expect(screen.getByText("Format me")).toBeInTheDocument());

    const pm = container.querySelector(".ProseMirror") as HTMLElement;
    selectAllInBody(pm);
    fireEvent.click(screen.getByRole("button", { name: "Bold" }));
    selectAllInBody(pm);
    fireEvent.click(screen.getByRole("button", { name: "List" }));

    const savedHtml = "<ul><li><p><strong>Format me</strong></p></li></ul>";
    mockFetchOnce({
      id: "n_1",
      title: "Groceries",
      body: savedHtml,
      updated_at: "2026-10-27T10:00:00",
    });
    await waitFor(
      () =>
        expect(fetch).toHaveBeenCalledWith(
          expect.stringContaining("/notes/n_1"),
          expect.objectContaining({ method: "PUT" }),
        ),
      { timeout: 2000 },
    );

    unmount();

    // Reopening re-fetches the note; the server's stored markup -- not
    // anything left in memory from the editing session -- is what renders.
    mockFetchOnce({
      id: "n_1",
      title: "Groceries",
      body: savedHtml,
      updated_at: "2026-10-27T10:00:00",
    });
    const { container: reopened } = renderNote("/note?id=n_1");

    await waitFor(() =>
      expect((reopened.querySelector(".ProseMirror") as HTMLElement).querySelector("strong")).not
        .toBeNull(),
    );
    const reopenedPm = reopened.querySelector(".ProseMirror") as HTMLElement;
    expect(reopenedPm.querySelector("ul > li")).not.toBeNull();
    expect(reopenedPm.querySelector("strong")?.textContent).toBe("Format me");
  });

  // ---------------------------------------------------------------------
  // US-004 -- AC-009: the editor offers no option to add file or image
  // attachments.
  // ---------------------------------------------------------------------

  it("[AC-009] the editor offers no option to add file or image attachments", () => {
    renderNote("/note");

    expect(document.querySelector('input[type="file"]')).toBeNull();
    for (const name of [/attach/i, /image/i, /upload/i, /photo/i, /picture/i]) {
      expect(screen.queryByRole("button", { name })).not.toBeInTheDocument();
    }

    // The formatting toolbar offers exactly the four formatting controls --
    // nothing that adds a file or an image alongside them.
    const toolbar = screen.getByRole("group", { name: /formatting/i });
    const buttonLabels = within(toolbar)
      .getAllByRole("button")
      .map((button) => button.textContent);
    expect(buttonLabels).toEqual(["Bold", "Heading", "List", "Link"]);
  });
});
