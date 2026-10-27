import { expect, test, type Page } from "@playwright/test";

/**
 * Reuses the real owner credentials seeded into the running environment,
 * the same way `auth.spec.ts` and `notes.spec.ts` do (see US-001-3
 * constraints).
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

async function createNote(page: Page, title: string, bodyText: string) {
  await page.getByRole("button", { name: /new note/i }).click();
  await expect(page).toHaveURL(/\/note$/);
  await page.getByLabel("Title").fill(title);
  await page.locator(".ProseMirror").click();
  await page.keyboard.type(bodyText);
  await expect(page).toHaveURL(/\/note\?id=/, { timeout: 10000 });
  await page.getByRole("button", { name: /back to notes/i }).click();
  await expect(page).toHaveURL(/\/notes$/);
}

/** Deletes a note by title directly from the list, confirming the dialog. */
async function deleteFromList(page: Page, title: string) {
  const row = page.locator("li", { hasText: title });
  await row.getByRole("button", { name: /delete/i }).click();
  await page.getByRole("button", { name: "Delete note" }).click();
}

test.describe("[AC-017][AC-019] the notes list", () => {
  test("renders newest-updated-first and shows no tags, labels, folders or notebooks", async ({
    page,
  }) => {
    await login(page);

    const stamp = Date.now();
    const titleA = `QA List Older ${stamp}`;
    const titleB = `QA List Newer ${stamp}`;

    await createNote(page, titleA, "older note body");
    await page.waitForTimeout(1200);
    await createNote(page, titleB, "newer note body");

    const rowTexts = await page.locator("li").allTextContents();
    const indexA = rowTexts.findIndex((t) => t.includes(titleA));
    const indexB = rowTexts.findIndex((t) => t.includes(titleB));
    expect(indexA).toBeGreaterThanOrEqual(0);
    expect(indexB).toBeGreaterThanOrEqual(0);
    expect(indexB).toBeLessThan(indexA);

    // No organizational concepts beyond the plain notes list are on screen.
    for (const name of [/tag/i, /label/i, /folder/i, /notebook/i]) {
      await expect(page.getByRole("button", { name })).toHaveCount(0);
      await expect(page.getByRole("link", { name })).toHaveCount(0);
      await expect(page.getByText(name)).toHaveCount(0);
    }

    await deleteFromList(page, titleA);
    await expect(page.getByText(titleA)).not.toBeVisible();
    await deleteFromList(page, titleB);
    await expect(page.getByText(titleB)).not.toBeVisible();
  });
});

test("[AC-015][AC-016] deleting a note from the list removes it and it stays gone after reload", async ({
  page,
}) => {
  await login(page);

  const title = `QA List Delete ${Date.now()}`;
  await createNote(page, title, "this note will be deleted from the list");

  await expect(page.getByText(title)).toBeVisible();
  await deleteFromList(page, title);

  await expect(page.getByText(title)).not.toBeVisible();

  await page.reload();
  await expect(page).toHaveURL(/\/notes$/);
  await expect(page.getByText(title)).not.toBeVisible();
});
