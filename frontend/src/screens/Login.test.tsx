import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import Login from "./Login";

function renderLogin() {
  return render(
    <MemoryRouter initialEntries={["/login"]}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/notes" element={<div>Notes Screen</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

function fillForm(email: string, password: string) {
  fireEvent.change(screen.getByLabelText(/email/i), { target: { value: email } });
  fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: password } });
}

/** Parses `#rgb` / `#rrggbb` or `rgb(...)` / `rgba(...)` into 0-255 channels plus alpha (0-1). */
function parseColor(value: string): [number, number, number, number] {
  const hexMatch = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.exec(value.trim());
  if (hexMatch) {
    let h = hexMatch[1];
    if (h.length === 3) {
      h = h
        .split("")
        .map((c) => c + c)
        .join("");
    }
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16), 1];
  }
  const rgbMatch =
    /^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+)\s*)?\)$/i.exec(value.trim());
  if (rgbMatch) {
    return [
      Number(rgbMatch[1]),
      Number(rgbMatch[2]),
      Number(rgbMatch[3]),
      rgbMatch[4] !== undefined ? Number(rgbMatch[4]) : 1,
    ];
  }
  throw new Error(`could not parse colour value: ${value}`);
}

function isGreyscale(value: string): boolean {
  const [r, g, b] = parseColor(value);
  return r === g && g === b;
}

function relativeLuminance([r, g, b]: [number, number, number]): number {
  const toLinear = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  const [rl, gl, bl] = [toLinear(r), toLinear(g), toLinear(b)];
  return 0.2126 * rl + 0.7152 * gl + 0.0722 * bl;
}

function contrastRatio(fg: [number, number, number], bg: [number, number, number]): number {
  const l1 = relativeLuminance(fg);
  const l2 = relativeLuminance(bg);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/** Composites a (possibly translucent) colour "over" an opaque base, the way a
 * browser paints a semi-transparent background on top of whatever sits behind it. */
function compositeOver(
  fg: [number, number, number, number],
  base: [number, number, number],
): [number, number, number] {
  const [r, g, b, a] = fg;
  return [r * a + base[0] * (1 - a), g * a + base[1] * (1 - a), b * a + base[2] * (1 - a)];
}

/** Walks from the document root down to `el`, compositing every ancestor's
 * background colour in turn, to find what actually paints behind `el` -- the
 * same thing a real renderer does with stacked translucent surfaces. */
function effectiveBackgroundColor(el: HTMLElement): [number, number, number] {
  const chain: HTMLElement[] = [];
  let node: HTMLElement | null = el;
  while (node) {
    chain.unshift(node);
    node = node.parentElement;
  }
  let base: [number, number, number] = [255, 255, 255];
  for (const ancestor of chain) {
    const bg = getComputedStyle(ancestor).backgroundColor;
    if (!bg || bg === "transparent" || bg === "rgba(0, 0, 0, 0)") continue;
    const [r, g, b, a] = parseColor(bg);
    if (a === 0) continue;
    base = compositeOver([r, g, b, a], base);
  }
  return base;
}

describe("Login screen", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("[AC-001] submits correct credentials, stores the token and navigates to notes", async () => {
    (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ access_token: "token-123", token_type: "bearer" }),
    });

    renderLogin();
    fillForm("susan.raya@quorq.ai", "correct-password");
    fireEvent.click(screen.getByRole("button", { name: /log in/i }));

    await waitFor(() => expect(screen.getByText("Notes Screen")).toBeInTheDocument());
    expect(localStorage.getItem("qd_notes_token")).toBe("token-123");
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/auth/login"),
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("[AC-002] keeps the user on login and shows an error when credentials are rejected", async () => {
    (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ detail: "Incorrect email or password" }),
    });

    renderLogin();
    fillForm("wrong@example.com", "bad-password");
    fireEvent.click(screen.getByRole("button", { name: /log in/i }));

    await waitFor(() => expect(screen.getByRole("alert")).toBeInTheDocument());
    expect(screen.getByText(/log in to notes/i)).toBeInTheDocument();
    expect(screen.queryByText("Notes Screen")).not.toBeInTheDocument();
    expect(localStorage.getItem("qd_notes_token")).toBeNull();
    expect(screen.queryByText(/preview account/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/fill these in/i)).not.toBeInTheDocument();
  });

  it("[AC-003] offers no sign-up or account-creation link", () => {
    renderLogin();
    expect(screen.queryByText(/sign up/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/create an account/i)).not.toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  // ---------------------------------------------------------------------
  // US-015-1 -- AC-028: black-and-white palette throughout, no indigo/purple.
  // ---------------------------------------------------------------------

  it("[AC-028] on render, the page background, labels, inputs and primary button are all greyscale", () => {
    const { container } = renderLogin();

    const root = container.firstElementChild as HTMLElement;
    const rootStyles = getComputedStyle(root);
    expect(isGreyscale(rootStyles.backgroundColor)).toBe(true);
    expect(isGreyscale(rootStyles.color)).toBe(true);

    const emailLabel = screen.getByText(/^email$/i);
    expect(isGreyscale(getComputedStyle(emailLabel).color)).toBe(true);
    const passwordLabel = screen.getByText(/^password$/i);
    expect(isGreyscale(getComputedStyle(passwordLabel).color)).toBe(true);

    const emailInput = screen.getByLabelText(/email/i);
    const inputStyles = getComputedStyle(emailInput);
    expect(isGreyscale(inputStyles.backgroundColor)).toBe(true);
    expect(isGreyscale(inputStyles.color)).toBe(true);

    const passwordInput = screen.getByLabelText(/^password$/i);
    const passwordStyles = getComputedStyle(passwordInput);
    expect(isGreyscale(passwordStyles.backgroundColor)).toBe(true);
    expect(isGreyscale(passwordStyles.color)).toBe(true);

    const submitButton = screen.getByRole("button", { name: /log in/i });
    const buttonStyles = getComputedStyle(submitButton);
    expect(isGreyscale(buttonStyles.backgroundColor)).toBe(true);
    expect(isGreyscale(buttonStyles.color)).toBe(true);
  });

  // ---------------------------------------------------------------------
  // US-015-1 -- AC-029: the incorrect-credentials error stays monochrome and legible.
  // ---------------------------------------------------------------------

  it("[AC-029] the incorrect-credentials error banner renders in greyscale with sufficient contrast against its background", async () => {
    (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ detail: "Incorrect email or password" }),
    });

    renderLogin();
    fillForm("wrong@example.com", "bad-password");
    fireEvent.click(screen.getByRole("button", { name: /log in/i }));

    const alert = await screen.findByRole("alert");
    const alertStyles = getComputedStyle(alert);
    expect(isGreyscale(alertStyles.backgroundColor)).toBe(true);

    const message = within(alert).getByText(/incorrect email or password/i);
    const messageColor = getComputedStyle(message).color;
    expect(isGreyscale(messageColor)).toBe(true);

    const effectiveBg = effectiveBackgroundColor(alert);
    const [r, g, b] = parseColor(messageColor);
    expect(contrastRatio([r, g, b], effectiveBg)).toBeGreaterThanOrEqual(4.5);
  });

  it("[AC-029] field-level validation errors use the same monochrome treatment", () => {
    renderLogin();
    fireEvent.click(screen.getByRole("button", { name: /log in/i }));

    const emailError = screen.getByText(/enter the email this desk was set up with/i);
    expect(isGreyscale(getComputedStyle(emailError).color)).toBe(true);
  });
});
