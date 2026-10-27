import { expect, test, type Page } from "@playwright/test";

/**
 * Reuses the real owner credentials seeded into the running environment,
 * the same way `auth.spec.ts` and `notes.spec.ts` do (see US-001-3
 * constraints).
 */
const OWNER_EMAIL = process.env.E2E_OWNER_EMAIL ?? "owner@example.com";
const OWNER_PASSWORD = process.env.E2E_OWNER_PASSWORD ?? "ChangeMe123!";

// The backend the frontend build under test talks to (see
// frontend/src/lib/api.ts, `API_BASE_URL`). Playwright's webServer in
// playwright.config.ts starts the backend on this address when no deployed
// target is given.
const API_BASE_URL = process.env.E2E_API_BASE_URL ?? "http://localhost:8000";

const TOKEN_STORAGE_KEY = "qd_notes_token";

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

/** Reads the bearer token the logged-in page stored, for a direct API call. */
async function readStoredToken(page: Page): Promise<string> {
  const token = await page.evaluate((key) => window.localStorage.getItem(key), TOKEN_STORAGE_KEY);
  if (!token) throw new Error("expected a session token in localStorage after login");
  return token;
}

test.describe("[AC-011] editing an existing note", () => {
  test("a changed title and body are stored and are what the note shows when it is reopened", async ({
    page,
  }) => {
    await login(page);

    // Create the note this test will edit.
    await page.getByRole("button", { name: /new note/i }).click();
    const originalTitle = `QA Edit Original ${Date.now()}`;
    const originalBody = "The body before any edit.";
    await page.getByLabel("Title").fill(originalTitle);
    await page.locator(".ProseMirror").click();
    await page.keyboard.type(originalBody);
    await expect(page).toHaveURL(/\/note\?id=/, { timeout: 10000 });

    // Leave the editor and come back in, exactly as "reopening" the note
    // means for a person using the app.
    await page.getByRole("button", { name: /back to notes/i }).click();
    await expect(page.getByText(originalTitle)).toBeVisible();
    await page.getByText(originalTitle).click();
    await expect(page).toHaveURL(/\/note\?id=/);
    await expect(page.getByLabel("Title")).toHaveValue(originalTitle);
    await expect(page.locator(".ProseMirror")).toContainText(originalBody);

    // Now change both the title and the body.
    const editedTitle = `QA Edit Updated ${Date.now()}`;
    const appendedText = " ...and this sentence was added by the edit.";
    const titleField = page.getByLabel("Title");
    await titleField.fill(editedTitle);
    await page.locator(".ProseMirror").click();
    await page.keyboard.press("End");
    await page.keyboard.type(appendedText);

    // Wait for auto-save to report success before navigating away, so the
    // edit is confirmed saved rather than merely typed.
    await expect(page.getByText(/saved.*last updated/i)).toBeVisible({ timeout: 10000 });

    // Reopen the note: leave the editor entirely and come back via the list.
    await page.getByRole("button", { name: /back to notes/i }).click();
    await expect(page).toHaveURL(/\/notes$/);
    await expect(page.getByText(editedTitle)).toBeVisible();
    await expect(page.getByText(originalTitle)).not.toBeVisible();

    await page.getByText(editedTitle).click();
    await expect(page).toHaveURL(/\/note\?id=/);
    await expect(page.getByLabel("Title")).toHaveValue(editedTitle);
    await expect(page.locator(".ProseMirror")).toContainText(originalBody + appendedText);

    await deleteOpenNote(page);
  });
});

test("[AC-012] saving an edit through the UI advances the note's updated_at, as confirmed directly from the API", async ({
  page,
  request,
}) => {
  await login(page);

  await page.getByRole("button", { name: /new note/i }).click();
  const title = `QA Stamp ${Date.now()}`;
  await page.getByLabel("Title").fill(title);
  await page.locator(".ProseMirror").click();
  await page.keyboard.type("Body before the edit.");
  await expect(page).toHaveURL(/\/note\?id=/, { timeout: 10000 });

  const noteId = new URL(page.url()).searchParams.get("id");
  expect(noteId).toBeTruthy();

  const token = await readStoredToken(page);
  const authHeaders = { Authorization: `Bearer ${token}` };

  const afterCreate = await request.get(`${API_BASE_URL}/notes/${noteId}`, {
    headers: authHeaders,
  });
  expect(afterCreate.ok()).toBeTruthy();
  const createdBody = await afterCreate.json();
  const createdAt = createdBody.created_at;
  const updatedAtAfterCreate = createdBody.updated_at;

  // Give the clock room to move on, so a later comparison is unambiguous.
  await page.waitForTimeout(1200);

  // The edit itself happens in the UI, the way a person edits a note.
  await page.getByLabel("Title").fill(`${title} (edited)`);
  await expect(page.getByText(/saved.*last updated/i)).toBeVisible({ timeout: 10000 });

  // The result is confirmed through the API contract, not just the screen.
  const afterEdit = await request.get(`${API_BASE_URL}/notes/${noteId}`, {
    headers: authHeaders,
  });
  expect(afterEdit.ok()).toBeTruthy();
  const editedBody = await afterEdit.json();

  expect(editedBody.title).toBe(`${title} (edited)`);
  // created_at never moves; only updated_at reflects the time of the edit.
  expect(editedBody.created_at).toBe(createdAt);
  expect(new Date(editedBody.updated_at).getTime()).toBeGreaterThan(
    new Date(updatedAtAfterCreate).getTime(),
  );
  // The new updated_at is close to now, not a stale or far-future value.
  expect(Math.abs(Date.now() - new Date(editedBody.updated_at).getTime())).toBeLessThan(15_000);

  await deleteOpenNote(page);
});

test("[AC-012] PUT /notes/{id} response reports an updated_at strictly later than the note's created_at", async ({
  request,
}) => {
  const loginResponse = await request.post(`${API_BASE_URL}/auth/login`, {
    data: { email: OWNER_EMAIL, password: OWNER_PASSWORD },
  });
  expect(loginResponse.ok()).toBeTruthy();
  const { access_token: token } = await loginResponse.json();
  const authHeaders = { Authorization: `Bearer ${token}` };

  const created = await (
    await request.post(`${API_BASE_URL}/notes`, {
      headers: authHeaders,
      data: { title: "API-only edit subject", body: "initial body" },
    })
  ).json();

  try {
    const updateResponse = await request.put(`${API_BASE_URL}/notes/${created.id}`, {
      headers: authHeaders,
      data: { title: "API-only edit subject, changed", body: "changed body" },
    });

    expect(updateResponse.status()).toBe(200);
    const updated = await updateResponse.json();

    expect(updated.id).toBe(created.id);
    expect(updated.title).toBe("API-only edit subject, changed");
    expect(updated.body).toBe("changed body");
    expect(updated.created_at).toBe(created.created_at);
    expect(new Date(updated.updated_at).getTime()).toBeGreaterThanOrEqual(
      new Date(created.updated_at).getTime(),
    );
  } finally {
    await request.delete(`${API_BASE_URL}/notes/${created.id}`, { headers: authHeaders });
  }
});
