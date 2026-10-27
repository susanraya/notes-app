import { expect, test, type Page } from "@playwright/test";

/**
 * Reuses the real owner credentials seeded into the running environment,
 * the same way the other e2e specs do (see US-001-3 constraints). Logs in
 * through the real POST /auth/login; nothing here stubs the API.
 */
const OWNER_EMAIL = process.env.E2E_OWNER_EMAIL ?? "owner@example.com";
const OWNER_PASSWORD = process.env.E2E_OWNER_PASSWORD ?? "ChangeMe123!";

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

test("[AC-008] bold, a bullet list, a heading and a link applied to the body survive a save and a reopen", async ({
  page,
}) => {
  await login(page);

  await page.getByRole("button", { name: /new note/i }).click();
  const title = `QA Rich Text ${Date.now()}`;
  const bodyText = "Rich text survives reopening";
  await page.getByLabel("Title").fill(title);
  const body = page.locator(".ProseMirror");
  await body.click();
  await page.keyboard.type(bodyText);

  await page.keyboard.press("ControlOrMeta+a");
  await page.getByRole("button", { name: "Bold", exact: true }).click();
  await expect(body.locator("strong")).toHaveText(bodyText);

  await page.keyboard.press("ControlOrMeta+a");
  await page.getByRole("button", { name: "Heading", exact: true }).click();
  await expect(body.locator("h3")).toContainText(bodyText);

  await page.keyboard.press("ControlOrMeta+a");
  await page.getByRole("button", { name: "List", exact: true }).click();
  await expect(body.locator("ul > li")).toHaveCount(1);

  await page.keyboard.press("ControlOrMeta+a");
  await page.getByRole("button", { name: "Link", exact: true }).click();
  await expect(body.locator("a")).toHaveCount(1);

  // Confirm auto-save succeeded before leaving the editor.
  await expect(page.getByText(/saved.*last updated/i)).toBeVisible({ timeout: 10000 });

  // Reopen the note via the list, the way a person reopens it.
  await page.getByRole("button", { name: /back to notes/i }).click();
  await expect(page).toHaveURL(/\/notes$/);
  await page.getByText(title).click();
  await expect(page).toHaveURL(/\/note\?id=/);

  const reopenedBody = page.locator(".ProseMirror");
  await expect(reopenedBody.locator("strong")).toBeVisible();
  await expect(reopenedBody.locator("h3")).toContainText(bodyText);
  await expect(reopenedBody.locator("ul > li")).toHaveCount(1);
  await expect(reopenedBody.locator("a")).toHaveCount(1);

  await deleteOpenNote(page);
});

test("[AC-009] no file or image attachment control is present on the note editor", async ({
  page,
}) => {
  await login(page);
  await page.goto("/note");

  for (const name of [/attach/i, /image/i, /upload/i, /photo/i, /picture/i]) {
    await expect(page.getByRole("button", { name })).toHaveCount(0);
  }
  await expect(page.locator('input[type="file"]')).toHaveCount(0);

  const toolbar = page.getByRole("group", { name: /formatting/i });
  await expect(toolbar.getByRole("button")).toHaveCount(4);
});

test("[AC-010] selecting a note from the list renders its title and formatted body", async ({
  page,
}) => {
  await login(page);

  await page.getByRole("button", { name: /new note/i }).click();
  const title = `QA Select ${Date.now()}`;
  const bodyText = "Selected from the list";
  await page.getByLabel("Title").fill(title);
  const body = page.locator(".ProseMirror");
  await body.click();
  await page.keyboard.type(bodyText);
  await page.keyboard.press("ControlOrMeta+a");
  await page.getByRole("button", { name: "Bold", exact: true }).click();
  await expect(page.getByText(/saved.*last updated/i)).toBeVisible({ timeout: 10000 });

  await page.getByRole("button", { name: /back to notes/i }).click();
  await expect(page).toHaveURL(/\/notes$/);

  await page.getByText(title).click();
  await expect(page).toHaveURL(/\/note\?id=/);
  await expect(page.getByLabel("Title")).toHaveValue(title);
  await expect(page.locator(".ProseMirror strong")).toHaveText(bodyText);

  await deleteOpenNote(page);
});

test("[AC-013] typing into a note auto-saves and updates the last-updated indicator without an explicit save click", async ({
  page,
}) => {
  await login(page);

  await page.getByRole("button", { name: /new note/i }).click();
  const title = `QA Autosave ${Date.now()}`;
  await page.getByLabel("Title").fill(title);
  await page.locator(".ProseMirror").click();
  await page.keyboard.type("First sentence.");

  // No explicit save control exists; confirm the indicator reflects the
  // save purely from typing and waiting.
  await expect(page.getByRole("button", { name: /^save$/i })).toHaveCount(0);
  await expect(page.getByText(/saved.*last updated/i)).toBeVisible({ timeout: 10000 });

  await deleteOpenNote(page);
});

test("[AC-014][NFR-003] reloading the page and reopening the note shows the most recently auto-saved content", async ({
  page,
}) => {
  await login(page);

  await page.getByRole("button", { name: /new note/i }).click();
  const title = `QA Reload ${Date.now()}`;
  const firstText = "Content before reload.";
  const secondText = " Content added just before reload.";
  await page.getByLabel("Title").fill(title);
  await page.locator(".ProseMirror").click();
  await page.keyboard.type(firstText);
  await expect(page).toHaveURL(/\/note\?id=/, { timeout: 10000 });

  await page.keyboard.type(secondText);
  await expect(page.getByText(/saved.*last updated/i)).toBeVisible({ timeout: 10000 });

  const noteUrl = page.url();

  // Reload the whole app, then reopen the note the same way a person would.
  await page.reload();
  await expect(page.getByLabel("Title")).toHaveValue(title);
  await expect(page.locator(".ProseMirror")).toContainText(firstText + secondText);

  await page.goto("/notes");
  await expect(page.getByText(title)).toBeVisible();
  await page.getByText(title).click();
  await expect(page).toHaveURL(noteUrl.includes("?id=") ? /\/note\?id=/ : /\/note/);
  await expect(page.getByLabel("Title")).toHaveValue(title);
  await expect(page.locator(".ProseMirror")).toContainText(firstText + secondText);

  await deleteOpenNote(page);
});
