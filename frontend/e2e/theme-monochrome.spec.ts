import { expect, test, type Page } from "@playwright/test";

/**
 * Reuses the real owner credentials seeded into the running environment,
 * the same way `auth.spec.ts` and `notes.spec.ts` do (see US-001-3
 * constraints).
 */
const OWNER_EMAIL = process.env.E2E_OWNER_EMAIL ?? "owner@example.com";
const OWNER_PASSWORD = process.env.E2E_OWNER_PASSWORD ?? "ChangeMe123!";

// Former indigo/purple family values this theme replaced (see brand.ts /
// index.css / ui.tsx). Any of these appearing in a rendered computed colour
// is a regression back to the old palette.
const FORBIDDEN_RGB_FRAGMENTS = [
  "168, 85, 247", // #a855f7 (purple)
  "244, 63, 94", // #f43f5e (rose)
  "165, 161, 200", // #a5a1c8 (muted indigo)
  "15, 7, 37", // #0f0725 (indigo-black)
];

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

/** Parses `rgb(...)` / `rgba(...)` into channels, 0-255 plus 0-1 alpha. */
function parseRgba(value: string): [number, number, number, number] {
  const m = /rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+)\s*)?\)/i.exec(
    value,
  );
  if (!m) throw new Error(`not an rgb()/rgba() colour: ${value}`);
  return [Number(m[1]), Number(m[2]), Number(m[3]), m[4] === undefined ? 1 : Number(m[4])];
}

function isGreyscale(value: string): boolean {
  const [r, g, b] = parseRgba(value);
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

function expectNoForbiddenColors(colors: Array<{ bg: string; color: string }>) {
  for (const { bg, color } of colors) {
    for (const fragment of FORBIDDEN_RGB_FRAGMENTS) {
      expect(bg).not.toContain(fragment);
      expect(color).not.toContain(fragment);
    }
  }
}

/** Composites an element's *effective* (opaque) background colour by
 * walking from <html> down to the element, alpha-blending each ancestor's
 * background over a white base (the browser's own default canvas colour),
 * then over the element's own background. Needed because several surfaces
 * in this app use translucent rgba() backgrounds layered over a solid page
 * background, so the element's own computed background-color alone is not
 * what is actually rendered on screen. */
async function effectiveBackgroundColor(
  page: Page,
  locator: ReturnType<Page["locator"]>,
): Promise<string> {
  return locator.evaluate((el) => {
    const chain: Element[] = [];
    let node: Element | null = el;
    while (node) {
      chain.unshift(node);
      node = node.parentElement;
    }
    let r = 255,
      g = 255,
      b = 255;
    for (const n of chain) {
      const cs = getComputedStyle(n);
      const m = /rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+)\s*)?\)/i.exec(
        cs.backgroundColor,
      );
      if (!m) continue;
      const nr = Number(m[1]);
      const ng = Number(m[2]);
      const nb = Number(m[3]);
      const na = m[4] === undefined ? 1 : Number(m[4]);
      if (na === 0) continue;
      r = nr * na + r * (1 - na);
      g = ng * na + g * (1 - na);
      b = nb * na + b * (1 - na);
    }
    return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
  });
}

/** WCAG relative luminance, per https://www.w3.org/TR/WCAG21/#dfn-relative-luminance */
function relativeLuminance([r, g, b]: [number, number, number]): number {
  const channel = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  const [rl, gl, bl] = [channel(r), channel(g), channel(b)];
  return 0.2126 * rl + 0.7152 * gl + 0.0722 * bl;
}

function contrastRatio(fg: string, bg: string): number {
  const [fr, fg2, fb] = parseRgba(fg);
  const [br, bgc, bb] = parseRgba(bg);
  const l1 = relativeLuminance([fr, fg2, fb]);
  const l2 = relativeLuminance([br, bgc, bb]);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

test.describe("[AC-028] login screen is monochrome", () => {
  test("background, text and input computed colours are greyscale, with no indigo/purple present", async ({
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

    const emailInput = page.getByLabel("Email");
    const [emailBg, emailColor, emailBorder] = await emailInput.evaluate((el) => {
      const cs = getComputedStyle(el as HTMLElement);
      return [cs.backgroundColor, cs.color, cs.borderTopColor];
    });
    expect(isGreyscale(emailBg)).toBe(true);
    expect(isGreyscale(emailColor)).toBe(true);
    expect(isGreyscale(emailBorder)).toBe(true);

    const passwordInput = page.getByLabel("Password", { exact: true });
    const [pwBg, pwColor] = await passwordInput.evaluate((el) => {
      const cs = getComputedStyle(el as HTMLElement);
      return [cs.backgroundColor, cs.color];
    });
    expect(isGreyscale(pwBg)).toBe(true);
    expect(isGreyscale(pwColor)).toBe(true);

    expectNoForbiddenColors(await allComputedColors(page));
  });
});

test("[AC-029] a wrong-credentials login shows a monochrome, legible error message", async ({
  page,
}) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill(OWNER_EMAIL);
  await page.getByLabel("Password", { exact: true }).fill("definitely-the-wrong-password");
  await page.getByRole("button", { name: /log in/i }).click();

  const alert = page.getByRole("alert");
  await expect(alert).toBeVisible();

  const alertColor = await alert.evaluate((el) => getComputedStyle(el as HTMLElement).color);
  expect(isGreyscale(alertColor)).toBe(true);

  const effectiveBg = await effectiveBackgroundColor(page, alert);
  expect(isGreyscale(effectiveBg)).toBe(true);

  const ratio = contrastRatio(alertColor, effectiveBg);
  expect(ratio).toBeGreaterThanOrEqual(4.5);

  expectNoForbiddenColors(await allComputedColors(page));
});

test.describe("[AC-030] notes list, search box and highlights are monochrome", () => {
  test("list rows, highlight accents and the search box use monochrome computed colours", async ({
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

    // The search box itself.
    const searchInput = page.getByLabel("Search");
    const [searchBg, searchColor, searchBorder] = await searchInput.evaluate((el) => {
      const cs = getComputedStyle(el as HTMLElement);
      return [cs.backgroundColor, cs.color, cs.borderTopColor];
    });
    expect(isGreyscale(searchBg)).toBe(true);
    expect(isGreyscale(searchColor)).toBe(true);
    expect(isGreyscale(searchBorder)).toBe(true);

    // Create a note so the list has at least one row and a highlighted
    // accent rail to inspect.
    await page.getByRole("button", { name: /new note/i }).click();
    const title = `QA Theme Row ${Date.now()}`;
    await page.getByLabel("Title").fill(title);
    await page.locator(".ProseMirror").click();
    await page.keyboard.type("Body text for a theme check.");
    await expect(page).toHaveURL(/\/note\?id=/, { timeout: 10000 });
    await page.getByRole("button", { name: /back to notes/i }).click();
    await expect(page).toHaveURL(/\/notes$/);
    await expect(page.getByText(title)).toBeVisible();

    const row = page.locator("li", { hasText: title });
    const [rowColor, rowBorder] = await row.evaluate((el) => {
      const cs = getComputedStyle(el as HTMLElement);
      return [cs.color, cs.borderBottomColor];
    });
    expect(isGreyscale(rowColor)).toBe(true);
    expect(isGreyscale(rowBorder)).toBe(true);

    // The highlighted accent rail that runs alongside the list.
    const accentRail = page.locator("ul > span[aria-hidden='true']").first();
    const railBg = await accentRail.evaluate(
      (el) => getComputedStyle(el as HTMLElement).backgroundColor,
    );
    expect(isGreyscale(railBg)).toBe(true);

    expectNoForbiddenColors(await allComputedColors(page));

    // Clean up the note this test created.
    const deleteButton = row.getByRole("button", { name: /delete/i });
    await deleteButton.click();
    await page.getByRole("button", { name: "Delete note" }).click();
    await expect(page.getByText(title)).not.toBeVisible();
  });
});

test("[AC-031] the no-results indication for an unmatched search term is monochrome", async ({
  page,
}) => {
  await login(page);
  await page.goto("/notes");

  const noSuchTerm = `no-such-term-${Date.now()}-zzz`;
  const searchInput = page.getByLabel("Search");
  await searchInput.fill(noSuchTerm);

  const emptyHeading = page.getByText(/no notes match/i);
  await expect(emptyHeading).toBeVisible({ timeout: 5000 });

  const headingColor = await emptyHeading.evaluate(
    (el) => getComputedStyle(el as HTMLElement).color,
  );
  expect(isGreyscale(headingColor)).toBe(true);

  const emptyBg = await effectiveBackgroundColor(page, emptyHeading);
  expect(isGreyscale(emptyBg)).toBe(true);

  const clearButton = page.getByRole("button", { name: /clear search/i });
  const [clearBg, clearColor] = await clearButton.evaluate((el) => {
    const cs = getComputedStyle(el as HTMLElement);
    return [cs.backgroundColor, cs.color];
  });
  expect(isGreyscale(clearBg)).toBe(true);
  expect(isGreyscale(clearColor)).toBe(true);

  expectNoForbiddenColors(await allComputedColors(page));
});

test.describe("[AC-032] the new-note editor is monochrome", () => {
  test("title field, body field and toolbar computed colours are monochrome with no indigo/purple", async ({
    page,
  }) => {
    await login(page);
    await page.getByRole("button", { name: /new note/i }).click();
    await expect(page).toHaveURL(/\/note$/);

    const titleField = page.getByLabel("Title");
    const [titleBg, titleColor] = await titleField.evaluate((el) => {
      const cs = getComputedStyle(el as HTMLElement);
      return [cs.backgroundColor, cs.color];
    });
    expect(isGreyscale(titleBg)).toBe(true);
    expect(isGreyscale(titleColor)).toBe(true);

    const bodyField = page.getByRole("textbox", { name: /body/i });
    const bodyColor = await bodyField.evaluate((el) => getComputedStyle(el as HTMLElement).color);
    expect(isGreyscale(bodyColor)).toBe(true);
    const bodyEffectiveBg = await effectiveBackgroundColor(page, bodyField);
    expect(isGreyscale(bodyEffectiveBg)).toBe(true);

    const toolbar = page.getByRole("group", { name: /formatting/i });
    for (const name of ["Bold", "Heading", "List", "Link"]) {
      const btn = toolbar.getByRole("button", { name, exact: true });
      const [btnBg, btnColor] = await btn.evaluate((el) => {
        const cs = getComputedStyle(el as HTMLElement);
        return [cs.backgroundColor, cs.color];
      });
      expect(isGreyscale(btnBg)).toBe(true);
      expect(isGreyscale(btnColor)).toBe(true);
    }

    expectNoForbiddenColors(await allComputedColors(page));
  });
});

test.describe("[AC-033] active toolbar states are monochrome and distinguishable", () => {
  test("bold, list, heading and link each become monochrome-but-distinguishable once applied", async ({
    page,
  }) => {
    await login(page);
    await page.getByRole("button", { name: /new note/i }).click();
    const title = `QA Toolbar State ${Date.now()}`;
    await page.getByLabel("Title").fill(title);
    const body = page.locator(".ProseMirror");
    await body.click();
    await page.keyboard.type("Toolbar state check");
    await page.keyboard.press("ControlOrMeta+a");

    const toolbar = page.getByRole("group", { name: /formatting/i });

    // Capture an inactive button's colours as the baseline to compare against.
    const inactiveLink = toolbar.getByRole("button", { name: "Link", exact: true });
    const [inactiveBg, inactiveColor] = await inactiveLink.evaluate((el) => {
      const cs = getComputedStyle(el as HTMLElement);
      return [cs.backgroundColor, cs.color];
    });
    expect(isGreyscale(inactiveBg)).toBe(true);
    expect(isGreyscale(inactiveColor)).toBe(true);

    for (const name of ["Bold", "Heading", "List"] as const) {
      await page.keyboard.press("ControlOrMeta+a");
      const btn = toolbar.getByRole("button", { name, exact: true });
      await btn.click();
      await expect(btn).toHaveAttribute("aria-pressed", "true");

      const [activeBg, activeColor] = await btn.evaluate((el) => {
        const cs = getComputedStyle(el as HTMLElement);
        return [cs.backgroundColor, cs.color];
      });
      expect(isGreyscale(activeBg)).toBe(true);
      expect(isGreyscale(activeColor)).toBe(true);

      // Distinguishable from an inactive control: at least one of
      // background or text colour must differ from the inactive baseline.
      expect(activeBg !== inactiveBg || activeColor !== inactiveColor).toBe(true);
    }

    await page.keyboard.press("ControlOrMeta+a");
    const linkBtn = toolbar.getByRole("button", { name: "Link", exact: true });
    await linkBtn.click();
    await expect(linkBtn).toHaveAttribute("aria-pressed", "true");
    const [activeLinkBg, activeLinkColor] = await linkBtn.evaluate((el) => {
      const cs = getComputedStyle(el as HTMLElement);
      return [cs.backgroundColor, cs.color];
    });
    expect(isGreyscale(activeLinkBg)).toBe(true);
    expect(isGreyscale(activeLinkColor)).toBe(true);
    expect(activeLinkBg !== inactiveBg || activeLinkColor !== inactiveColor).toBe(true);

    expectNoForbiddenColors(await allComputedColors(page));

    await expect(page.getByText(/saved.*last updated/i)).toBeVisible({ timeout: 10000 });
    await deleteOpenNote(page);
  });
});

test.describe("[AC-034] a saved note renders monochrome when reopened", () => {
  test("title, body and formatted content are monochrome on reopen", async ({ page }) => {
    await login(page);
    await page.getByRole("button", { name: /new note/i }).click();
    const title = `QA Saved Monochrome ${Date.now()}`;
    const bodyText = "Saved note content";
    await page.getByLabel("Title").fill(title);
    const body = page.locator(".ProseMirror");
    await body.click();
    await page.keyboard.type(bodyText);
    await page.keyboard.press("ControlOrMeta+a");
    await page.getByRole("button", { name: "Bold", exact: true }).click();
    await page.keyboard.press("ControlOrMeta+a");
    await page.getByRole("button", { name: "Heading", exact: true }).click();
    await page.keyboard.press("ControlOrMeta+a");
    await page.getByRole("button", { name: "List", exact: true }).click();
    await page.keyboard.press("ControlOrMeta+a");
    await page.getByRole("button", { name: "Link", exact: true }).click();
    await expect(page.getByText(/saved.*last updated/i)).toBeVisible({ timeout: 10000 });

    await page.getByRole("button", { name: /back to notes/i }).click();
    await expect(page).toHaveURL(/\/notes$/);
    await page.getByText(title).click();
    await expect(page).toHaveURL(/\/note\?id=/);

    const titleField = page.getByLabel("Title");
    const titleColor = await titleField.evaluate((el) => getComputedStyle(el as HTMLElement).color);
    expect(isGreyscale(titleColor)).toBe(true);

    const reopenedBody = page.locator(".ProseMirror");
    const bodyColor = await reopenedBody.evaluate(
      (el) => getComputedStyle(el as HTMLElement).color,
    );
    expect(isGreyscale(bodyColor)).toBe(true);

    const strongColor = await reopenedBody
      .locator("strong")
      .first()
      .evaluate((el) => getComputedStyle(el as HTMLElement).color);
    expect(isGreyscale(strongColor)).toBe(true);

    const headingColor = await reopenedBody
      .locator("h3")
      .first()
      .evaluate((el) => getComputedStyle(el as HTMLElement).color);
    expect(isGreyscale(headingColor)).toBe(true);

    const linkColor = await reopenedBody
      .locator("a")
      .first()
      .evaluate((el) => getComputedStyle(el as HTMLElement).color);
    expect(isGreyscale(linkColor)).toBe(true);

    expectNoForbiddenColors(await allComputedColors(page));

    await deleteOpenNote(page);
  });
});

test.describe("[AC-035] the edit screen uses the same palette as the view state", () => {
  test("title and body colours are identical before and after making an edit", async ({
    page,
  }) => {
    await login(page);
    await page.getByRole("button", { name: /new note/i }).click();
    const title = `QA Palette Parity ${Date.now()}`;
    await page.getByLabel("Title").fill(title);
    const body = page.locator(".ProseMirror");
    await body.click();
    await page.keyboard.type("Palette parity check");
    await expect(page.getByText(/saved.*last updated/i)).toBeVisible({ timeout: 10000 });

    await page.getByRole("button", { name: /back to notes/i }).click();
    await expect(page).toHaveURL(/\/notes$/);
    await page.getByText(title).click();
    await expect(page).toHaveURL(/\/note\?id=/);

    // "View" state: just-reopened, before any edit.
    const titleField = page.getByLabel("Title");
    const [viewTitleBg, viewTitleColor] = await titleField.evaluate((el) => {
      const cs = getComputedStyle(el as HTMLElement);
      return [cs.backgroundColor, cs.color];
    });
    const viewBodyColor = await body.evaluate((el) => getComputedStyle(el as HTMLElement).color);
    const viewBg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);

    // "Edit" state: focus and change the title and body.
    await titleField.click();
    await page.keyboard.type(" edited");
    await body.click();
    await page.keyboard.type(" more text");
    await expect(page.getByText(/saved.*last updated/i)).toBeVisible({ timeout: 10000 });

    const [editTitleBg, editTitleColor] = await titleField.evaluate((el) => {
      const cs = getComputedStyle(el as HTMLElement);
      return [cs.backgroundColor, cs.color];
    });
    const editBodyColor = await body.evaluate((el) => getComputedStyle(el as HTMLElement).color);
    const editBg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);

    expect(editTitleBg).toBe(viewTitleBg);
    expect(editTitleColor).toBe(viewTitleColor);
    expect(editBodyColor).toBe(viewBodyColor);
    expect(editBg).toBe(viewBg);
    expect(isGreyscale(editTitleColor)).toBe(true);
    expect(isGreyscale(editBodyColor)).toBe(true);

    await deleteOpenNote(page);
  });
});

test.describe("[AC-036] the delete confirmation dialog is monochrome and legible", () => {
  test("dialog background, heading, description and buttons are monochrome with sufficient contrast", async ({
    page,
  }) => {
    await login(page);
    await page.getByRole("button", { name: /new note/i }).click();
    const title = `QA Delete Dialog ${Date.now()}`;
    await page.getByLabel("Title").fill(title);
    await page.locator(".ProseMirror").click();
    await page.keyboard.type("About to be deleted");
    await expect(page).toHaveURL(/\/note\?id=/, { timeout: 10000 });

    await page.getByRole("button", { name: "Delete", exact: true }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    const heading = page.locator("#delete-title");
    const headingColor = await heading.evaluate((el) => getComputedStyle(el as HTMLElement).color);
    expect(isGreyscale(headingColor)).toBe(true);

    const description = page.locator("#delete-desc");
    const descColor = await description.evaluate(
      (el) => getComputedStyle(el as HTMLElement).color,
    );
    expect(isGreyscale(descColor)).toBe(true);

    const dialogEffectiveBg = await effectiveBackgroundColor(page, dialog);
    expect(isGreyscale(dialogEffectiveBg)).toBe(true);

    const headingRatio = contrastRatio(headingColor, dialogEffectiveBg);
    expect(headingRatio).toBeGreaterThanOrEqual(4.5);
    const descRatio = contrastRatio(descColor, dialogEffectiveBg);
    expect(descRatio).toBeGreaterThanOrEqual(4.5);

    const cancelButton = page.getByRole("button", { name: "Cancel", exact: true });
    const [cancelBg, cancelColor] = await cancelButton.evaluate((el) => {
      const cs = getComputedStyle(el as HTMLElement);
      return [cs.backgroundColor, cs.color];
    });
    expect(isGreyscale(cancelBg)).toBe(true);
    expect(isGreyscale(cancelColor)).toBe(true);

    const confirmButton = page.getByRole("button", { name: "Delete note" });
    const [confirmBg, confirmColor] = await confirmButton.evaluate((el) => {
      const cs = getComputedStyle(el as HTMLElement);
      return [cs.backgroundColor, cs.color];
    });
    expect(isGreyscale(confirmBg)).toBe(true);
    expect(isGreyscale(confirmColor)).toBe(true);
    const confirmRatio = contrastRatio(confirmColor, confirmBg);
    expect(confirmRatio).toBeGreaterThanOrEqual(3);

    expectNoForbiddenColors(await allComputedColors(page));

    await confirmButton.click();
    await expect(page).toHaveURL(/\/notes$/);
  });
});
