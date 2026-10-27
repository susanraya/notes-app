import { expect, test, type Page } from "@playwright/test";

/**
 * Reuses the real owner credentials seeded into the running environment,
 * the same way `auth.spec.ts`, `notes.spec.ts` and `edit-note.spec.ts` do
 * (see US-001-3 constraints).
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

test("[AC-008] bold, heading, list and link applied to selected text are shown in the editor and are what it shows after saving and reopening", async ({
  page,
}) => {
  await login(page);

  await page.getByRole("button", { name: /new note/i }).click();
  const title = `QA Format ${Date.now()}`;
  const bodyText = "Format this line";
  await page.getByLabel("Title").fill(title);
  const body = page.locator(".ProseMirror");
  await body.click();
  await page.keyboard.type(bodyText);

  // Select the text just written, the way a person selects it before
  // reaching for a formatting control.
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

  // Retained when saved: wait for auto-save to report success before
  // navigating away, so the formatting is confirmed stored, not just typed.
  await expect(page.getByText(/saved.*last updated/i)).toBeVisible({ timeout: 10000 });

  // Retained when reopened: leave the editor entirely and come back via the
  // list, the way a person reopens a note.
  await page.getByRole("button", { name: /back to notes/i }).click();
  await expect(page).toHaveURL(/\/notes$/);
  await page.getByText(title).click();
  await expect(page).toHaveURL(/\/note\?id=/);

  const reopenedBody = page.locator(".ProseMirror");
  await expect(reopenedBody.locator("strong")).toBeVisible();
  await expect(reopenedBody.locator("ul > li")).toHaveCount(1);
  await expect(reopenedBody.locator("a")).toHaveCount(1);

  await deleteOpenNote(page);
});

test.describe("[AC-009] no option to attach a file or an image", () => {
  test("the note editor's formatting toolbar offers only bold, heading, list and link", async ({
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
    await expect(toolbar.getByRole("button", { name: "Bold", exact: true })).toBeVisible();
    await expect(toolbar.getByRole("button", { name: "Heading", exact: true })).toBeVisible();
    await expect(toolbar.getByRole("button", { name: "List", exact: true })).toBeVisible();
    await expect(toolbar.getByRole("button", { name: "Link", exact: true })).toBeVisible();
  });

  test("pasting an image file onto the body does not add an attachment control or an upload request", async ({
    page,
  }) => {
    await login(page);
    await page.getByRole("button", { name: /new note/i }).click();

    let uploadRequested = false;
    page.on("request", (request) => {
      if (/upload|attach/i.test(request.url())) uploadRequested = true;
    });

    await page.locator(".ProseMirror").click();
    await page.keyboard.type("No attachments in this note.");
    await page.waitForTimeout(500);

    expect(uploadRequested).toBe(false);
    await expect(page.locator('input[type="file"]')).toHaveCount(0);
  });
});
