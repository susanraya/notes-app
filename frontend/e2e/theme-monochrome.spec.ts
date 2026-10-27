import { expect, test, type Page } from "@playwright/test";

/**
 * Reuses the real owner credentials seeded into the running environment,
 * the same way `auth.spec.ts` and `notes.spec.ts` do (see US-001-3
 * constraints).
 */
const OWNER_EMAIL = process.env.E2E_OWNER_EMAIL ?? "owner@example.com";
const OWNER_PASSWORD = process.env.E2E_OWNER_PASSWORD ?? "ChangeMe123!";

// The former purple primary this theme replaced (see brand.ts / index.css).
const FORMER_PURPLE_RGB = "168, 85, 247"; // #a855f7

async function login(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(OWNER_EMAIL);
  await page.getByLabel("Password", { exact: true }).fill(OWNER_PASSWORD);
  await page.getByRole("button", { name: /log in/i }).click();
  await expect(page).toHaveURL(/\/notes$/);
}

/** Parses `rgb(...)` / `rgba(...)` into 0-255 channels, ignoring alpha. */
function parseRgb(value: string): [number, number, number] {
  const m = /rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/i.exec(value);
  if (!m) throw new Error(`not an rgb()/rgba() colour: ${value}`);
  return [Number(m[1]), Number(m[2]), Number(m[3])];
}

function isGreyscale(value: string): boolean {
  const [r, g, b] = parseRgb(value);
  return r === g && g === b;
}

/** Reads the computed background-color and color of every element on the
 * page, for the "no purple anywhere" assertion. */
async function allComputedColors(page: Page): Promise<Array<{ bg: string; color: string }>> {
  return page.evaluate(() => {
    return Array.from(document.querySelectorAll("*")).map((el) => {
      const cs = getComputedStyle(el);
      return { bg: cs.backgroundColor, color: cs.color };
    });
  });
}

test.describe("[AC] the rendered app is monochrome", () => {
  test("the login screen's body background and primary button colours are greyscale, with no purple anywhere", async ({
    page,
  }) => {
    await page.goto("/login");

    const bodyBg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    const bodyColor = await page.evaluate(() => getComputedStyle(document.body).color);
    expect(isGreyscale(bodyBg)).toBe(true);
    expect(isGreyscale(bodyColor)).toBe(true);

    const loginButton = page.getByRole("button", { name: /log in/i });
    const [btnBg, btnColor] = await loginButton.evaluate((el) => {
      const cs = getComputedStyle(el as HTMLElement);
      return [cs.backgroundColor, cs.color];
    });
    expect(isGreyscale(btnBg)).toBe(true);
    expect(isGreyscale(btnColor)).toBe(true);

    const allColors = await allComputedColors(page);
    for (const { bg, color } of allColors) {
      expect(bg).not.toContain(FORMER_PURPLE_RGB);
      expect(color).not.toContain(FORMER_PURPLE_RGB);
    }
  });

  test("the notes screen's body background and primary button colours are greyscale, with no purple anywhere", async ({
    page,
  }) => {
    await login(page);
    await page.goto("/notes");

    const bodyBg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    const bodyColor = await page.evaluate(() => getComputedStyle(document.body).color);
    expect(isGreyscale(bodyBg)).toBe(true);
    expect(isGreyscale(bodyColor)).toBe(true);

    const newNoteButton = page.getByRole("button", { name: /new note/i });
    const [btnBg, btnColor] = await newNoteButton.evaluate((el) => {
      const cs = getComputedStyle(el as HTMLElement);
      return [cs.backgroundColor, cs.color];
    });
    expect(isGreyscale(btnBg)).toBe(true);
    expect(isGreyscale(btnColor)).toBe(true);

    const allColors = await allComputedColors(page);
    for (const { bg, color } of allColors) {
      expect(bg).not.toContain(FORMER_PURPLE_RGB);
      expect(color).not.toContain(FORMER_PURPLE_RGB);
    }
  });
});
