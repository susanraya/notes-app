import { expect, test, type Page } from "@playwright/test";

/**
 * US-011-3 -- AC-022 (desktop, 1280x800) and AC-023 (mobile, 375x667): the
 * app is usable at both viewport widths. This drives login, the notes list
 * and the note editor at each width and asserts: no horizontal overflow, the
 * core controls are visible, and at mobile width the primary actions (log
 * in, new note, search, open note, delete) are clickable with touch targets
 * at least 44px high.
 *
 * Reuses the real owner credentials seeded into the running environment,
 * the same way the other e2e specs do (see US-001-3 constraints). Runs
 * against the real running app -- no mocked services.
 */
const OWNER_EMAIL = process.env.E2E_OWNER_EMAIL ?? "owner@example.com";
const OWNER_PASSWORD = process.env.E2E_OWNER_PASSWORD ?? "ChangeMe123!";

const DESKTOP = { width: 1280, height: 800 };
const MOBILE = { width: 375, height: 667 };

// Small tolerance for sub-pixel rounding / scrollbar gutters.
const OVERFLOW_TOLERANCE_PX = 1;

async function login(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(OWNER_EMAIL);
  await page.getByLabel("Password", { exact: true }).fill(OWNER_PASSWORD);
  await page.getByRole("button", { name: /log in/i }).click();
  await expect(page).toHaveURL(/\/notes$/);
}

/** Deletes the note currently open in the editor, via its own delete dialog. */
async function deleteOpenNote(page: Page) {
  await page.getByRole("button", { name: "Delete", exact: true }).click();
  await page.getByRole("button", { name: "Delete note" }).click();
  await expect(page).toHaveURL(/\/notes$/);
}

/** True when the document does not scroll wider than the viewport. */
async function hasNoHorizontalOverflow(page: Page): Promise<boolean> {
  const { scrollWidth, clientWidth } = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  return scrollWidth <= clientWidth + OVERFLOW_TOLERANCE_PX;
}

async function minHeightOf(page: Page, locator: ReturnType<Page["locator"]>): Promise<number> {
  const box = await locator.boundingBox();
  if (!box) throw new Error("expected a visible element with a bounding box");
  return box.height;
}

test.describe("[AC-022] desktop viewport (1280x800)", () => {
  test.use({ viewport: DESKTOP });

  test("login screen renders without horizontal overflow and with core controls visible", async ({
    page,
  }) => {
    await page.goto("/login");

    expect(await hasNoHorizontalOverflow(page)).toBe(true);
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Password", { exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: /log in/i })).toBeVisible();
  });

  test("notes list renders without horizontal overflow and with core controls visible", async ({
    page,
  }) => {
    await login(page);

    expect(await hasNoHorizontalOverflow(page)).toBe(true);
    await expect(page.getByRole("heading", { name: /all notes/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /new note/i })).toBeVisible();
    await expect(page.getByLabel("Search")).toBeVisible();
  });

  test("note editor renders without horizontal overflow and with core controls visible", async ({
    page,
  }) => {
    await login(page);
    await page.getByRole("button", { name: /new note/i }).click();
    await expect(page).toHaveURL(/\/note$/);

    expect(await hasNoHorizontalOverflow(page)).toBe(true);
    await expect(page.getByLabel("Title")).toBeVisible();
    await expect(page.getByRole("textbox", { name: /body/i })).toBeVisible();
    const toolbar = page.getByRole("group", { name: /formatting/i });
    await expect(toolbar.getByRole("button", { name: "Bold", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Delete", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: /back to notes/i })).toBeVisible();
  });
});

test.describe("[AC-023] mobile viewport (375x667)", () => {
  test.use({ viewport: MOBILE });

  test("login screen reflows without horizontal overflow, and logging in is clickable with a touch-sized target", async ({
    page,
  }) => {
    await page.goto("/login");

    expect(await hasNoHorizontalOverflow(page)).toBe(true);

    const loginButton = page.getByRole("button", { name: /log in/i });
    await expect(loginButton).toBeVisible();
    expect(await minHeightOf(page, loginButton)).toBeGreaterThanOrEqual(44);

    await page.getByLabel("Email").fill(OWNER_EMAIL);
    await page.getByLabel("Password", { exact: true }).fill(OWNER_PASSWORD);
    await loginButton.click();
    await expect(page).toHaveURL(/\/notes$/);
  });

  test("notes list reflows without horizontal overflow, and new note / search / open note / delete are clickable with touch-sized targets", async ({
    page,
  }) => {
    await login(page);
    expect(await hasNoHorizontalOverflow(page)).toBe(true);

    const newNoteButton = page.getByRole("button", { name: /new note/i });
    await expect(newNoteButton).toBeVisible();
    expect(await minHeightOf(page, newNoteButton)).toBeGreaterThanOrEqual(44);

    // Create a note to exercise open and delete from the mobile list.
    await newNoteButton.click();
    await expect(page).toHaveURL(/\/note$/);
    const title = `QA Mobile ${Date.now()}`;
    await page.getByLabel("Title").fill(title);
    await page.locator(".ProseMirror").click();
    await page.keyboard.type("Mobile viewport body text.");
    await expect(page).toHaveURL(/\/note\?id=/, { timeout: 10000 });
    await page.getByRole("button", { name: /back to notes/i }).click();
    await expect(page).toHaveURL(/\/notes$/);
    await expect(page.getByText(title)).toBeVisible();
    expect(await hasNoHorizontalOverflow(page)).toBe(true);

    const searchInput = page.getByLabel("Search");
    await expect(searchInput).toBeVisible();
    expect(await minHeightOf(page, searchInput)).toBeGreaterThanOrEqual(44);
    await searchInput.fill(title);
    await expect(page.getByText(title)).toBeVisible({ timeout: 5000 });
    await searchInput.fill("");

    // Open the note from the list -- the row itself is the clickable target.
    const row = page.locator("li", { hasText: title });
    const openButton = row.getByRole("button").first();
    await expect(openButton).toBeVisible();
    expect(await minHeightOf(page, openButton)).toBeGreaterThanOrEqual(44);
    await openButton.click();
    await expect(page).toHaveURL(/\/note\?id=/);

    // Delete from within the note editor (its own touch target is checked below).
    await deleteOpenNote(page);
    await expect(page.getByText(title)).not.toBeVisible();
  });

  test("note editor reflows without horizontal overflow, and its delete control is clickable with a touch-sized target", async ({
    page,
  }) => {
    await login(page);
    await page.getByRole("button", { name: /new note/i }).click();
    await expect(page).toHaveURL(/\/note$/);

    expect(await hasNoHorizontalOverflow(page)).toBe(true);
    await expect(page.getByLabel("Title")).toBeVisible();
    await expect(page.getByRole("textbox", { name: /body/i })).toBeVisible();

    const toolbar = page.getByRole("group", { name: /formatting/i });
    for (const name of ["Bold", "Heading", "List", "Link"] as const) {
      const btn = toolbar.getByRole("button", { name, exact: true });
      await expect(btn).toBeVisible();
      expect(await minHeightOf(page, btn)).toBeGreaterThanOrEqual(44);
    }

    const deleteButton = page.getByRole("button", { name: "Delete", exact: true });
    await expect(deleteButton).toBeVisible();
    expect(await minHeightOf(page, deleteButton)).toBeGreaterThanOrEqual(44);

    // A note must exist to delete through the real dialog; give it content first.
    await page.getByLabel("Title").fill(`QA Mobile Editor ${Date.now()}`);
    await page.locator(".ProseMirror").click();
    await page.keyboard.type("Content so the delete dialog has a real note to remove.");
    await expect(page).toHaveURL(/\/note\?id=/, { timeout: 10000 });
    expect(await hasNoHorizontalOverflow(page)).toBe(true);

    await deleteButton.click();
    const confirmButton = page.getByRole("button", { name: "Delete note" });
    await expect(confirmButton).toBeVisible();
    expect(await minHeightOf(page, confirmButton)).toBeGreaterThanOrEqual(44);
    await confirmButton.click();
    await expect(page).toHaveURL(/\/notes$/);
  });
});
