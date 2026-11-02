import { expect, test, type Page } from "@playwright/test";

/**
 * Reuses the real owner credentials seeded into the running environment,
 * the same way the other e2e specs do (see US-001-3 constraints).
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
  await expect(page.getByText(title)).not.toBeVisible();
}

test.describe("[AC-020][AC-021] note search", () => {
  test("typing a term filters the visible list to matching notes, a non-matching term shows the empty-result indication, and clearing it restores the full list", async ({
    page,
  }) => {
    await login(page);

    const stamp = Date.now();
    const titleA = `QA Search Match ${stamp}`;
    const titleB = `QA Search Other ${stamp}`;

    await createNote(page, titleA, `this body mentions searchable-term-${stamp}`);
    await createNote(page, titleB, "this body mentions nothing special");

    const searchInput = page.getByLabel("Search");

    // Typing a term filters the visible list down to the matching note.
    await searchInput.fill(`searchable-term-${stamp}`);
    await expect(page.getByText(titleA)).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(titleB)).not.toBeVisible();

    // A non-matching term shows the empty-result indication.
    await searchInput.fill(`no-such-term-${stamp}-zzz`);
    await expect(page.getByText(/no notes match/i)).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(titleA)).not.toBeVisible();
    await expect(page.getByText(titleB)).not.toBeVisible();

    // Clearing the term restores the full list.
    await page.getByRole("button", { name: /clear search/i }).click();
    await expect(searchInput).toHaveValue("");
    await expect(page.getByText(titleA)).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(titleB)).toBeVisible();

    await deleteFromList(page, titleA);
    await deleteFromList(page, titleB);
  });

  test("[AC-020] search by title matches independently of case", async ({ page }) => {
    await login(page);

    const stamp = Date.now();
    const title = `QA CaseTest-${stamp}-Title`;
    await createNote(page, title, "body text irrelevant to this case");

    const searchInput = page.getByLabel("Search");
    await searchInput.fill(`casetest-${stamp}-title`);

    await expect(page.getByText(title)).toBeVisible({ timeout: 5000 });

    await searchInput.fill("");
    await deleteFromList(page, title);
  });
});
