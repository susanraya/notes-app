import { expect, test, type Page } from "@playwright/test";

/**
 * Reuses the real owner credentials seeded into the running environment,
 * the same way `auth.spec.ts` does (see US-001-3 constraints).
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

test.describe("[AC-006][AC-007] creating a note", () => {
  test("opens an empty editor with a title field and a rich-text body, and the saved note appears back in the list", async ({
    page,
  }) => {
    await login(page);

    await page.getByRole("button", { name: /new note/i }).click();
    await expect(page).toHaveURL(/\/note$/);

    // Empty editor: no pre-filled title, no pre-filled body.
    const titleField = page.getByLabel("Title");
    await expect(titleField).toHaveValue("");
    const bodyField = page.getByRole("textbox", { name: /body/i });
    await expect(bodyField).toBeVisible();
    await expect(bodyField).toHaveText("");

    const title = `QA Note ${Date.now()}`;
    const bodyText = "Hello from the QA suite";
    await titleField.fill(title);
    await page.locator(".ProseMirror").click();
    await page.keyboard.type(bodyText);

    // A successful first save assigns the note an id and reflects it in the URL.
    await expect(page).toHaveURL(/\/note\?id=/, { timeout: 10000 });

    await page.getByRole("button", { name: /back to notes/i }).click();
    await expect(page).toHaveURL(/\/notes$/);
    await expect(page.getByText(title)).toBeVisible();

    // Clean up: delete the note this test created.
    await page.getByText(title).click();
    await expect(page).toHaveURL(/\/note\?id=/);
    await deleteOpenNote(page);
  });
});

test("[AC-024] a note saved in one session is still listed with its title and body after logging out and back in", async ({
  page,
}) => {
  await login(page);

  await page.getByRole("button", { name: /new note/i }).click();
  const title = `QA Persist ${Date.now()}`;
  const bodyText = "This text must survive a logout and a fresh login.";
  await page.getByLabel("Title").fill(title);
  await page.locator(".ProseMirror").click();
  await page.keyboard.type(bodyText);
  await expect(page).toHaveURL(/\/note\?id=/, { timeout: 10000 });

  await page.getByRole("button", { name: /log out/i }).click();
  await expect(page).toHaveURL(/\/login$/);

  await login(page);
  await expect(page.getByText(title)).toBeVisible();

  await page.getByText(title).click();
  await expect(page).toHaveURL(/\/note\?id=/);
  await expect(page.getByLabel("Title")).toHaveValue(title);
  await expect(page.locator(".ProseMirror")).toContainText(bodyText);

  await deleteOpenNote(page);
});

test.describe("[AC-025] no sync or export-to-external-service control", () => {
  test("is offered on the notes list", async ({ page }) => {
    await login(page);
    await page.goto("/notes");

    for (const name of [/sync/i, /export/i, /import/i, /connect/i, /integration/i]) {
      await expect(page.getByRole("button", { name })).toHaveCount(0);
      await expect(page.getByRole("link", { name })).toHaveCount(0);
    }
  });

  test("is offered on the note editor", async ({ page }) => {
    await login(page);
    await page.goto("/note");

    for (const name of [/sync/i, /export/i, /import/i, /connect/i, /integration/i]) {
      await expect(page.getByRole("button", { name })).toHaveCount(0);
      await expect(page.getByRole("link", { name })).toHaveCount(0);
    }
  });
});
