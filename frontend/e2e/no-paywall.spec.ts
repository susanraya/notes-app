import { expect, test, type Page } from "@playwright/test";

/**
 * US-013 -- AC-026: the app is free to use. No payment, billing,
 * subscription or paywall screen is presented at any point while using any
 * feature. This drives the same screens and controls a person uses --
 * logging in, creating a note, searching, editing, formatting and deleting
 * -- and after each step confirms none of that wording or a matching
 * control appears anywhere on the page. A final spec confirms the same
 * guarantee holds at the API contract: no billing-shaped endpoint exists
 * and a normal CRUD cycle never answers with 402 Payment Required.
 *
 * Reuses the real owner credentials seeded into the running environment,
 * the same way the other e2e specs do (see US-001-3 constraints).
 */
const OWNER_EMAIL = process.env.E2E_OWNER_EMAIL ?? "owner@example.com";
const OWNER_PASSWORD = process.env.E2E_OWNER_PASSWORD ?? "ChangeMe123!";

// The backend the frontend build under test talks to (see
// frontend/src/lib/api.ts, `API_BASE_URL`). Playwright's webServer in
// playwright.config.ts starts the backend on this address when no deployed
// target is given (see edit-note.spec.ts for the same convention).
const API_BASE_URL = process.env.E2E_API_BASE_URL ?? "http://localhost:8000";

const BILLING_TEXT =
  /\b(pay|payment|bill|billing|subscribe|subscription|plan|tier|quota|pricing|paywall|checkout|invoice|upgrade|free trial|premium|pro plan)\b/i;

const BILLING_WORDS = [
  "pay",
  "payment",
  "bill",
  "billing",
  "subscribe",
  "subscription",
  "plan",
  "tier",
  "quota",
  "pricing",
  "paywall",
  "checkout",
  "invoice",
  "upgrade",
];

async function login(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(OWNER_EMAIL);
  await page.getByLabel("Password", { exact: true }).fill(OWNER_PASSWORD);
  await page.getByRole("button", { name: /log in/i }).click();
  await expect(page).toHaveURL(/\/notes$/);
}

/** Asserts no payment/billing/subscription/paywall wording or control is on
 * this page, and that the page did not navigate somewhere billing-shaped. */
async function expectNoPaywall(page: Page) {
  expect(page.url()).not.toMatch(/pay|bill|subscri|checkout|plan|upgrade/i);

  const bodyText = await page.locator("body").innerText();
  expect(bodyText).not.toMatch(BILLING_TEXT);

  for (const name of [
    /pay/i,
    /billing/i,
    /subscribe/i,
    /subscription/i,
    /upgrade/i,
    /checkout/i,
    /pricing/i,
    /premium/i,
  ]) {
    await expect(page.getByRole("button", { name })).toHaveCount(0);
    await expect(page.getByRole("link", { name })).toHaveCount(0);
  }

  // A paywall is often an overlay rather than an inline control; a modal
  // dialog or alert box is itself suspect unless it is one of this app's
  // own, known dialogs (the delete-confirmation prompt).
  const dialogs = page.locator('[role="dialog"], [role="alertdialog"]');
  const dialogCount = await dialogs.count();
  for (let i = 0; i < dialogCount; i += 1) {
    const text = await dialogs.nth(i).innerText();
    expect(text).not.toMatch(BILLING_TEXT);
  }
}

test("[AC-026] the login screen presents no payment, billing, subscription or paywall wording", async ({
  page,
}) => {
  await page.goto("/login");
  await expectNoPaywall(page);
});

test("[AC-026] a failed login attempt does not surface a payment or subscription prompt", async ({
  page,
}) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill(OWNER_EMAIL);
  await page.getByLabel("Password", { exact: true }).fill("definitely-the-wrong-password");
  await page.getByRole("button", { name: /log in/i }).click();
  await expect(page.getByRole("alert")).toBeVisible();

  await expectNoPaywall(page);
});

test("[AC-026] the notes list presents no payment, billing, subscription or paywall wording", async ({
  page,
}) => {
  await login(page);
  await expectNoPaywall(page);
});

test("[AC-026] searching notes presents no payment, billing, subscription or paywall wording", async ({
  page,
}) => {
  await login(page);
  await page.getByLabel("Search").fill("anything at all");
  await page.waitForTimeout(500); // let the debounced search round-trip settle
  await expectNoPaywall(page);
});

test("[AC-026] creating, formatting, auto-saving and deleting a note never presents a payment, billing, subscription or paywall screen", async ({
  page,
}) => {
  await login(page);

  await page.getByRole("button", { name: /new note/i }).click();
  await expect(page).toHaveURL(/\/note$/);
  await expectNoPaywall(page);

  const title = `QA No Paywall ${Date.now()}`;
  await page.getByLabel("Title").fill(title);
  const body = page.locator(".ProseMirror");
  await body.click();
  await page.keyboard.type("This app is free, with no plans and no billing.");
  await expectNoPaywall(page);

  // Apply every rich-text feature this story's editor offers -- none of
  // them is gated behind a payment prompt.
  await page.keyboard.press("ControlOrMeta+a");
  await page.getByRole("button", { name: "Bold", exact: true }).click();
  await page.keyboard.press("ControlOrMeta+a");
  await page.getByRole("button", { name: "Heading", exact: true }).click();
  await page.keyboard.press("ControlOrMeta+a");
  await page.getByRole("button", { name: "List", exact: true }).click();
  await page.keyboard.press("ControlOrMeta+a");
  await page.getByRole("button", { name: "Link", exact: true }).click();
  await expectNoPaywall(page);

  // Auto-save completes with no interruption asking for payment.
  await expect(page.getByText(/saved.*last updated/i)).toBeVisible({ timeout: 10000 });
  await expectNoPaywall(page);

  await page.getByRole("button", { name: /back to notes/i }).click();
  await expect(page).toHaveURL(/\/notes$/);
  await expect(page.getByText(title)).toBeVisible();
  await expectNoPaywall(page);

  // Reopen and delete -- the full lifecycle of a note, start to finish.
  await page.getByText(title).click();
  await expect(page).toHaveURL(/\/note\?id=/);
  await expectNoPaywall(page);

  await page.getByRole("button", { name: "Delete", exact: true }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  const dialogText = await dialog.innerText();
  expect(dialogText).not.toMatch(BILLING_TEXT);

  await page.getByRole("button", { name: "Delete note" }).click();
  await expect(page).toHaveURL(/\/notes$/);
  await expectNoPaywall(page);
});

test("[AC-026] no payment, billing or subscription endpoint can be reached through the running API, and a full CRUD cycle never returns 402 Payment Required", async ({
  request,
}) => {
  const loginResponse = await request.post(`${API_BASE_URL}/auth/login`, {
    data: { email: OWNER_EMAIL, password: OWNER_PASSWORD },
  });
  expect(loginResponse.ok()).toBeTruthy();
  const { access_token: token } = await loginResponse.json();
  const headers = { Authorization: `Bearer ${token}` };

  const spec = await request.get(`${API_BASE_URL}/openapi.json`);
  expect(spec.ok()).toBeTruthy();
  const openapi = await spec.json();
  const paths = Object.keys(openapi.paths ?? {});
  for (const path of paths) {
    const lowered = path.toLowerCase();
    for (const word of BILLING_WORDS) {
      expect(lowered).not.toContain(word);
    }
  }

  // No declared response schema carries a plan, tier, quota or billing field.
  const schemas: Record<string, { properties?: Record<string, unknown> }> =
    openapi.components?.schemas ?? {};
  for (const [schemaName, schema] of Object.entries(schemas)) {
    const properties = schema?.properties ?? {};
    for (const propertyName of Object.keys(properties)) {
      const lowered = propertyName.toLowerCase();
      for (const word of [
        "plan",
        "tier",
        "quota",
        "bill",
        "billing",
        "subscription",
        "pay",
        "payment",
      ]) {
        expect(lowered, `schema ${schemaName} field ${propertyName}`).not.toContain(word);
      }
    }
  }

  // A normal CRUD cycle through the real API is never answered with a
  // 402 Payment Required at any step.
  const list = await request.get(`${API_BASE_URL}/notes`, { headers });
  expect(list.status()).not.toBe(402);

  const created = await request.post(`${API_BASE_URL}/notes`, {
    headers,
    data: { title: "Free API flow", body: "no charge" },
  });
  expect(created.status()).not.toBe(402);
  const { id } = await created.json();

  try {
    const fetched = await request.get(`${API_BASE_URL}/notes/${id}`, { headers });
    expect(fetched.status()).not.toBe(402);

    const updated = await request.put(`${API_BASE_URL}/notes/${id}`, {
      headers,
      data: { title: "Still free", body: "still no charge" },
    });
    expect(updated.status()).not.toBe(402);

    const searched = await request.get(`${API_BASE_URL}/notes?q=still`, { headers });
    expect(searched.status()).not.toBe(402);
  } finally {
    const deleted = await request.delete(`${API_BASE_URL}/notes/${id}`, { headers });
    expect(deleted.status()).not.toBe(402);
    expect(deleted.status()).toBe(204);
  }
});
