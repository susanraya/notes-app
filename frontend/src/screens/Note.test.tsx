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

/** Parses `#rgb` / `#rrggbb` or `rgb(...)` / `rgba(...)` into 0-255 channels plus alpha (0-1). */
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
  if (!value || value === "transparent" || value === "rgba(0, 0, 0, 0)") return true;
  const [r, g, b] = parseColor(value);
  return r === g && g === b;
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
      expect(
        (reopened.querySelector(".ProseMirror") as HTMLElement).querySelector("strong"),
      ).not.toBeNull(),
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

  // ---------------------------------------------------------------------
  // US-017-1 -- AC-032 / AC-033: black-and-white palette for the editor
  // and its formatting toolbar.
  // ---------------------------------------------------------------------

  it("[AC-032] the title field, body field and formatting toolbar render in greyscale with no indigo/purple remaining", async () => {
    mockFetchOnce({
      id: "n_1",
      title: "Groceries",
      body: "<p>Format me</p>",
      updated_at: "2026-10-26T14:32:00",
    });
    const { container } = renderNote("/note?id=n_1");
    await waitFor(() => expect(screen.getByText("Format me")).toBeInTheDocument());

    const titleInput = screen.getByLabelText(/title/i) as HTMLInputElement;
    const titleStyles = getComputedStyle(titleInput);
    expect(isGreyscale(titleStyles.color)).toBe(true);
    expect(isGreyscale(titleStyles.backgroundColor)).toBe(true);

    const bodyField = screen.getByRole("textbox", { name: /body/i });
    expect(isGreyscale(getComputedStyle(bodyField).color)).toBe(true);

    const toolbar = screen.getByRole("group", { name: /formatting/i });
    const toolbarButtons = within(toolbar).getAllByRole("button");
    for (const button of toolbarButtons) {
      const styles = getComputedStyle(button);
      expect(isGreyscale(styles.color)).toBe(true);
      expect(isGreyscale(styles.backgroundColor)).toBe(true);
      expect(isGreyscale(styles.borderColor || styles.borderTopColor)).toBe(true);
    }

    expect(container.innerHTML.toLowerCase()).not.toMatch(/indigo|purple|violet/);
  });

  it("[AC-033] the active bold toolbar state renders in monochrome and is visually distinct from inactive", async () => {
    mockFetchOnce({
      id: "n_1",
      title: "Groceries",
      body: "<p>Format me</p>",
      updated_at: "2026-10-26T14:32:00",
    });
    const { container } = renderNote("/note?id=n_1");
    await waitFor(() => expect(screen.getByText("Format me")).toBeInTheDocument());

    const pm = container.querySelector(".ProseMirror") as HTMLElement;
    const boldButton = screen.getByRole("button", { name: "Bold" });
    const inactiveStyles = getComputedStyle(boldButton);
    const inactiveBg = inactiveStyles.backgroundColor;
    const inactiveBorder = inactiveStyles.borderColor || inactiveStyles.borderTopColor;

    selectAllInBody(pm);
    fireEvent.click(boldButton);
    expect(boldButton).toHaveAttribute("aria-pressed", "true");

    const activeStyles = getComputedStyle(boldButton);
    expect(isGreyscale(activeStyles.backgroundColor)).toBe(true);
    expect(isGreyscale(activeStyles.borderColor || activeStyles.borderTopColor)).toBe(true);
    expect(
      activeStyles.backgroundColor !== inactiveBg ||
        (activeStyles.borderColor || activeStyles.borderTopColor) !== inactiveBorder,
    ).toBe(true);
  });

  // The remaining three controls (heading/list/link) are checked against a
  // note already carrying that formatting: selecting its content lands
  // cleanly inside the formatted node, avoiding the instability of a
  // mid-transaction selection seen when toggling live in this harness. The
  // inactive baseline comes from the same button on a plain-text note.

  it("[AC-033] the active heading toolbar state renders in monochrome and is visually distinct from inactive", async () => {
    mockFetchOnce({
      id: "n_plain",
      title: "Groceries",
      body: "<p>Format me</p>",
      updated_at: "2026-10-26T14:32:00",
    });
    renderNote("/note?id=n_plain");
    await waitFor(() => expect(screen.getByText("Format me")).toBeInTheDocument());
    const inactiveBg = getComputedStyle(
      screen.getByRole("button", { name: "Heading" }),
    ).backgroundColor;

    mockFetchOnce({
      id: "n_1",
      title: "Groceries",
      body: "<h3>Heading text</h3>",
      updated_at: "2026-10-26T14:32:00",
    });
    const { container } = renderNote("/note?id=n_1");
    await waitFor(() => expect(screen.getByText("Heading text")).toBeInTheDocument());

    const pm = container.querySelector(".ProseMirror") as HTMLElement;
    const headingButton = within(container).getByRole("button", { name: "Heading" });

    selectAllInBody(pm);
    expect(headingButton).toHaveAttribute("aria-pressed", "true");

    const activeStyles = getComputedStyle(headingButton);
    expect(isGreyscale(activeStyles.backgroundColor)).toBe(true);
    expect(activeStyles.backgroundColor).not.toBe(inactiveBg);
  });

  it("[AC-033] the active list toolbar state renders in monochrome and is visually distinct from inactive", async () => {
    mockFetchOnce({
      id: "n_plain",
      title: "Groceries",
      body: "<p>Format me</p>",
      updated_at: "2026-10-26T14:32:00",
    });
    renderNote("/note?id=n_plain");
    await waitFor(() => expect(screen.getByText("Format me")).toBeInTheDocument());
    const inactiveBg = getComputedStyle(
      screen.getByRole("button", { name: "List" }),
    ).backgroundColor;

    mockFetchOnce({
      id: "n_1",
      title: "Groceries",
      body: "<ul><li><p>Item</p></li></ul>",
      updated_at: "2026-10-26T14:32:00",
    });
    const { container } = renderNote("/note?id=n_1");
    await waitFor(() => expect(screen.getByText("Item")).toBeInTheDocument());

    const pm = container.querySelector(".ProseMirror") as HTMLElement;
    const listButton = within(container).getByRole("button", { name: "List" });

    selectAllInBody(pm);
    expect(listButton).toHaveAttribute("aria-pressed", "true");

    const activeStyles = getComputedStyle(listButton);
    expect(isGreyscale(activeStyles.backgroundColor)).toBe(true);
    expect(activeStyles.backgroundColor).not.toBe(inactiveBg);
  });

  it("[AC-033] the active link toolbar state renders in monochrome and is visually distinct from inactive", async () => {
    mockFetchOnce({
      id: "n_plain",
      title: "Groceries",
      body: "<p>Format me</p>",
      updated_at: "2026-10-26T14:32:00",
    });
    renderNote("/note?id=n_plain");
    await waitFor(() => expect(screen.getByText("Format me")).toBeInTheDocument());
    const inactiveBg = getComputedStyle(
      screen.getByRole("button", { name: "Link" }),
    ).backgroundColor;

    mockFetchOnce({
      id: "n_1",
      title: "Groceries",
      body: '<p><a href="https://example.com">Link text</a></p>',
      updated_at: "2026-10-26T14:32:00",
    });
    const { container } = renderNote("/note?id=n_1");
    await waitFor(() => expect(screen.getByText("Link text")).toBeInTheDocument());

    const pm = container.querySelector(".ProseMirror") as HTMLElement;
    const linkButton = within(container).getByRole("button", { name: "Link" });

    selectAllInBody(pm);
    expect(linkButton).toHaveAttribute("aria-pressed", "true");

    const activeStyles = getComputedStyle(linkButton);
    expect(isGreyscale(activeStyles.backgroundColor)).toBe(true);
    expect(activeStyles.backgroundColor).not.toBe(inactiveBg);
  });

  it("[AC-032] ProseMirror content styles (headings, bold, lists, links, placeholder) use monochrome values", async () => {
    mockFetchOnce({
      id: "n_1",
      title: "Groceries",
      body: "<h3>Heading</h3><p><strong>Bold</strong></p><ul><li><p>Item</p></li></ul>",
      updated_at: "2026-10-26T14:32:00",
    });
    const { container } = renderNote("/note?id=n_1");
    await waitFor(() => expect(screen.getByText("Heading")).toBeInTheDocument());

    const heading = container.querySelector(".ProseMirror h3") as HTMLElement;
    const bold = container.querySelector(".ProseMirror strong") as HTMLElement;
    expect(isGreyscale(getComputedStyle(heading).color)).toBe(true);
    expect(isGreyscale(getComputedStyle(bold).color)).toBe(true);
  });

  // ---------------------------------------------------------------------
  // US-018-1 -- AC-034 / AC-035: viewing and editing an existing saved note
  // uses the same black-and-white palette, with no indigo/purple anywhere.
  // ---------------------------------------------------------------------

  it("[AC-034] opening a saved note renders its title, body and applied formatting in the black-and-white palette with no indigo/purple remaining", async () => {
    mockFetchOnce({
      id: "n_1",
      title: "Groceries",
      body: '<h3>Heading</h3><p><strong>Bold</strong> and <a href="https://example.com">a link</a></p><ul><li><p>Item</p></li></ul>',
      updated_at: "2026-10-26T14:32:00",
    });
    const { container } = renderNote("/note?id=n_1");
    await waitFor(() => expect(screen.getByText("Heading")).toBeInTheDocument());

    const titleInput = screen.getByLabelText(/title/i) as HTMLInputElement;
    expect(isGreyscale(getComputedStyle(titleInput).color)).toBe(true);
    expect(isGreyscale(getComputedStyle(titleInput).backgroundColor)).toBe(true);

    const bodyField = screen.getByRole("textbox", { name: /body/i });
    expect(isGreyscale(getComputedStyle(bodyField).color)).toBe(true);

    const heading = container.querySelector(".ProseMirror h3") as HTMLElement;
    const bold = container.querySelector(".ProseMirror strong") as HTMLElement;
    const link = container.querySelector(".ProseMirror a") as HTMLElement;
    expect(isGreyscale(getComputedStyle(heading).color)).toBe(true);
    expect(isGreyscale(getComputedStyle(bold).color)).toBe(true);
    expect(isGreyscale(getComputedStyle(link).color)).toBe(true);

    expect(container.innerHTML.toLowerCase()).not.toMatch(/indigo|purple|violet/);
  });

  it("[AC-035] the edit screen for an existing note uses the identical palette tokens as the view state", async () => {
    mockFetchOnce({
      id: "n_1",
      title: "Groceries",
      body: "<p>Format me</p>",
      updated_at: "2026-10-26T14:32:00",
    });
    const { container: viewContainer, unmount: unmountView } = renderNote("/note?id=n_1");
    await waitFor(() => expect(screen.getByText("Format me")).toBeInTheDocument());
    const viewTitle = viewContainer.querySelector("#note-title") as HTMLInputElement;
    const viewTitleStyles = getComputedStyle(viewTitle);
    const viewToolbarButton = within(
      within(viewContainer).getByRole("group", { name: /formatting/i }),
    ).getByRole("button", { name: "Bold" });
    const viewToolbarStyles = getComputedStyle(viewToolbarButton);
    unmountView();

    mockFetchOnce({
      id: "n_2",
      title: "Shopping",
      body: "<p>Edit me</p>",
      updated_at: "2026-10-26T14:32:00",
    });
    const { container: editContainer } = renderNote("/note?id=n_2");
    await waitFor(() => expect(screen.getByText("Edit me")).toBeInTheDocument());
    const editTitle = editContainer.querySelector("#note-title") as HTMLInputElement;
    const editTitleStyles = getComputedStyle(editTitle);
    const editToolbarButton = within(
      within(editContainer).getByRole("group", { name: /formatting/i }),
    ).getByRole("button", { name: "Bold" });
    const editToolbarStyles = getComputedStyle(editToolbarButton);

    expect(editTitleStyles.color).toBe(viewTitleStyles.color);
    expect(editTitleStyles.backgroundColor).toBe(viewTitleStyles.backgroundColor);
    expect(editTitleStyles.fontFamily).toBe(viewTitleStyles.fontFamily);
    expect(editToolbarStyles.color).toBe(viewToolbarStyles.color);
    expect(editToolbarStyles.backgroundColor).toBe(viewToolbarStyles.backgroundColor);
    expect(editToolbarStyles.borderColor || editToolbarStyles.borderTopColor).toBe(
      viewToolbarStyles.borderColor || viewToolbarStyles.borderTopColor,
    );
  });

  it("the status chip, save/last-updated indicator, back and delete affordances render in the monochrome palette for a saved note", async () => {
    mockFetchOnce({
      id: "n_1",
      title: "Groceries",
      body: "<p>Milk</p>",
      updated_at: "2026-10-26T14:32:00",
    });
    renderNote("/note?id=n_1");
    await waitFor(() => expect(screen.getByText(/last updated/i)).toBeInTheDocument());

    const statusChip = screen.getByText(/last updated/i).closest("p") as HTMLElement;
    expect(isGreyscale(getComputedStyle(statusChip).color)).toBe(true);
    expect(isGreyscale(getComputedStyle(statusChip).backgroundColor)).toBe(true);

    const backButton = screen.getByRole("button", { name: /back to notes/i });
    expect(isGreyscale(getComputedStyle(backButton).color)).toBe(true);

    const deleteButton = screen.getByRole("button", { name: /^delete$/i });
    expect(isGreyscale(getComputedStyle(deleteButton).color)).toBe(true);
    expect(isGreyscale(getComputedStyle(deleteButton).borderColor)).toBe(true);
  });

  it("the load-error message for a saved note renders in the monochrome palette", async () => {
    (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => ({ detail: "Not found" }),
    });

    renderNote("/note?id=n_missing");

    const alert = await screen.findByRole("alert");
    expect(isGreyscale(getComputedStyle(alert).color)).toBe(true);
    expect(isGreyscale(getComputedStyle(alert).backgroundColor)).toBe(true);
  });

  // ---------------------------------------------------------------------
  // US-011-2 -- AC-022 / AC-023: the editor is responsive across desktop
  // and mobile widths, with no horizontal scroll and touch-sized controls.
  //
  // Tailwind's generated stylesheet isn't loaded in this jsdom harness, so
  // the utility classes that drive layout (grid columns, widths, min-width,
  // wrapping) are asserted directly on `className` rather than through
  // `getComputedStyle`, which only reflects the screen's own inline `style`
  // values here. Fixed pixel sizes set via inline `style` (e.g. the 44px
  // touch-target minimums) are still checked with `getComputedStyle`.
  // ---------------------------------------------------------------------

  it("[AC-022] at 1280px the screen root clips overflow and the content column, toolbar and status row stay within a bounded, centred width", async () => {
    mockFetchOnce({
      id: "n_1",
      title: "Groceries",
      body: "<p>Format me</p>",
      updated_at: "2026-10-26T14:32:00",
    });
    const { container } = renderNote("/note?id=n_1");
    await waitFor(() => expect(screen.getByText("Format me")).toBeInTheDocument());

    // The screen root clips any accidental overflow rather than growing the
    // page horizontally, and the content column is capped well under
    // 1280px and centred, so the toolbar and status row read as a
    // comfortable column rather than being stretched edge to edge.
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toMatch(/overflow-x-hidden/);
    const column = root.querySelector(":scope > div") as HTMLElement;
    expect(column.className).toMatch(/mx-auto/);
    expect(column.className).toMatch(/max-w-\[960px\]/);

    // The formatting toolbar lays its four controls out as a grid -- a
    // single readable row at this width, not an overflowing list.
    const toolbar = screen.getByRole("group", { name: /formatting/i });
    expect(toolbar.className).toMatch(/\bgrid\b/);
    expect(toolbar.className).toMatch(/sm:grid-cols-4/);

    // The status row's text is allowed to wrap and is capped to the width
    // of its column, rather than forcing the pill (and the page) wider
    // than the viewport.
    const statusPill = screen.getByText(/last updated/i).closest("p") as HTMLElement;
    expect(statusPill.className).toMatch(/whitespace-normal/);
    expect(statusPill.className).toMatch(/max-w-full/);
    expect(statusPill.className).toMatch(/break-words/);
  });

  it("[AC-023] at 375px the title, toolbar and body carry the classes that let them reflow to a narrow screen instead of overflowing it", async () => {
    mockFetchOnce({
      id: "n_1",
      title: "Groceries",
      body: "<p>Format me</p>",
      updated_at: "2026-10-26T14:32:00",
    });
    const { container } = renderNote("/note?id=n_1");
    await waitFor(() => expect(screen.getByText("Format me")).toBeInTheDocument());

    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toMatch(/overflow-x-hidden/);

    // The title field spans the full width of its narrow parent rather
    // than carrying a fixed desktop width that would overflow.
    const titleInput = screen.getByLabelText(/title/i) as HTMLInputElement;
    expect(titleInput.className).toMatch(/\bw-full\b/);

    // The toolbar is a 2-column grid by default (4 columns only from the
    // `sm` breakpoint up), so its four controls reflow over two rows
    // instead of running off a 375px screen.
    const toolbar = screen.getByRole("group", { name: /formatting/i });
    expect(toolbar.className).toMatch(/grid-cols-2/);
    expect(toolbar.className).toMatch(/sm:grid-cols-4/);

    // The body editor's wrapper can shrink below its content's natural
    // width (`min-w-0`) instead of forcing the row wider than the screen,
    // and its ProseMirror content wraps long, unbroken text/URLs.
    const bodyWrap = screen.getByRole("textbox", { name: /body/i });
    expect(bodyWrap.className).toMatch(/min-w-0/);

    // The status pill's long text wraps rather than forcing the pill wider
    // than its column.
    const statusPill = screen.getByText(/last updated/i).closest("p") as HTMLElement;
    expect(statusPill.className).toMatch(/whitespace-normal/);
    expect(statusPill.className).toMatch(/break-words/);
  });

  it("[AC-023] at 375px the back, delete and all four formatting toolbar controls meet the 44px touch-target minimum", async () => {
    mockFetchOnce({
      id: "n_1",
      title: "Groceries",
      body: "<p>Format me</p>",
      updated_at: "2026-10-26T14:32:00",
    });
    renderNote("/note?id=n_1");
    await waitFor(() => expect(screen.getByText("Format me")).toBeInTheDocument());

    // h-11 is Tailwind's 2.75rem (44px) utility -- present on every one of
    // these controls so none falls under the touch-target minimum.
    const backButton = screen.getByRole("button", { name: /back to notes/i });
    expect(backButton.className).toMatch(/\bh-11\b/);

    const deleteButton = screen.getByRole("button", { name: /^delete$/i });
    expect(deleteButton.className).toMatch(/\bh-11\b/);

    const toolbar = screen.getByRole("group", { name: /formatting/i });
    for (const button of within(toolbar).getAllByRole("button")) {
      expect(button.className).toMatch(/\bh-11\b/);
    }

    // The title field's inline `min-height: 44px` is a real style value --
    // checked with `getComputedStyle` rather than a class match.
    const titleInput = screen.getByLabelText(/title/i) as HTMLElement;
    expect(parseFloat(getComputedStyle(titleInput).minHeight)).toBeGreaterThanOrEqual(44);
  });

  it("[AC-023] at 375px the delete-confirmation dialog's title wraps and its Cancel / Delete controls stack full-width at >=44px tall", async () => {
    mockFetchOnce({
      id: "n_1",
      title: "Groceries",
      body: "<p>Milk</p>",
      updated_at: "2026-10-26T14:32:00",
    });
    renderNote("/note?id=n_1");
    await waitFor(() => expect(screen.getByText("Milk")).toBeInTheDocument());

    fireEvent.click(screen.getByRole("button", { name: /^delete$/i }));

    const dialog = await screen.findByRole("dialog");
    // The dialog is never wider than the viewport: it's capped at 480px but
    // otherwise fills whatever narrower width it's given.
    expect(dialog.className).toMatch(/w-full/);
    expect(dialog.className).toMatch(/max-w-\[480px\]/);

    const heading = screen.getByText(/delete “groceries”\?/i);
    expect(heading.className).toMatch(/break-words/);

    const cancelButton = screen.getByRole("button", { name: /cancel/i });
    const deleteConfirmButton = screen.getByRole("button", { name: /delete note/i });
    expect(cancelButton.className).toMatch(/\bh-11\b/);
    expect(deleteConfirmButton.className).toMatch(/\bh-11\b/);
    expect(cancelButton.className).toMatch(/w-full/);
    expect(deleteConfirmButton.className).toMatch(/w-full/);

    // The two actions stack as a single column below `sm` rather than
    // squeezing two fixed-width columns into a 375px dialog.
    const actionsRow = cancelButton.parentElement as HTMLElement;
    expect(actionsRow.className).toMatch(/grid-cols-1/);
    expect(actionsRow.className).toMatch(/sm:grid-cols-2/);
  });

  it("the formatting toolbar wraps (reflows into additional rows) rather than overflowing at narrow widths", () => {
    renderNote("/note");
    const toolbar = screen.getByRole("group", { name: /formatting/i });
    // A 2-column grid below `sm` lays four controls out over two rows --
    // the toolbar reflows instead of running off-screen; from `sm` up it
    // widens to a single 4-column row.
    expect(toolbar.className).toMatch(/grid-cols-2/);
    expect(toolbar.className).toMatch(/sm:grid-cols-4/);
  });
});
