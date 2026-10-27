import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import { brand } from "../src/lib/brand";

const srcDir = fileURLToPath(new URL("../src", import.meta.url));
const indexCss = readFileSync(`${srcDir}/index.css`, "utf-8");
const uiTsx = readFileSync(`${srcDir}/lib/ui.tsx`, "utf-8");
const brandTs = readFileSync(`${srcDir}/lib/brand.ts`, "utf-8");

/** Parses `#rgb` or `#rrggbb` into 0-255 channels. */
function parseHex(hex: string): [number, number, number] | null {
  const m = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.exec(hex.trim());
  if (!m) return null;
  let h = m[1];
  if (h.length === 3) {
    h = h
      .split("")
      .map((c) => c + c)
      .join("");
  }
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return [r, g, b];
}

/** Parses `rgb(...)` / `rgba(...)` into 0-255 channels, ignoring alpha. */
function parseRgbFn(value: string): [number, number, number] | null {
  const m = /^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*[\d.]+\s*)?\)$/i.exec(
    value.trim(),
  );
  if (!m) return null;
  return [Number(m[1]), Number(m[2]), Number(m[3])];
}

/** True when a CSS colour value (hex or rgb/rgba) has equal R, G and B channels. */
function isGreyscaleColorValue(value: string): boolean {
  const channels = parseHex(value) ?? parseRgbFn(value);
  if (!channels) {
    throw new Error(`could not parse colour value: ${value}`);
  }
  const [r, g, b] = channels;
  return r === g && g === b;
}

/** Colour-valued keys exported from brand.ts (the non-colour keys -- radius,
 * font names, density -- are intentionally excluded). */
const BRAND_COLOR_KEYS = [
  "primaryColor",
  "accentColor",
  "neutralColor",
  "backgroundColor",
] as const;

/** `--brand-*` custom properties in index.css whose values are colours
 * (hex or rgb/rgba), i.e. excluding radius and font-family tokens. */
function extractBrandColorCustomProperties(css: string): Array<{ name: string; value: string }> {
  const declarationPattern = /--brand-([a-z-]+):\s*([^;]+);/g;
  const results: Array<{ name: string; value: string }> = [];
  let match: RegExpExecArray | null;
  while ((match = declarationPattern.exec(css)) !== null) {
    const name = `--brand-${match[1]}`;
    const value = match[2].trim();
    if (parseHex(value) || parseRgbFn(value)) {
      results.push({ name, value });
    }
  }
  return results;
}

const FORBIDDEN_HEX_VALUES = ["#a855f7", "#f43f5e", "#a5a1c8", "#0f0725"];
const FORBIDDEN_TAILWIND_FAMILIES = ["indigo", "violet", "purple", "fuchsia", "rose"];

function findForbiddenMentions(source: string, label: string): string[] {
  const hits: string[] = [];
  for (const hex of FORBIDDEN_HEX_VALUES) {
    if (source.toLowerCase().includes(hex.toLowerCase())) {
      hits.push(`${label} contains forbidden hex value ${hex}`);
    }
  }
  for (const family of FORBIDDEN_TAILWIND_FAMILIES) {
    // Matches Tailwind utility classes like `bg-indigo-500`, `text-purple-600`,
    // `border-fuchsia-400`, `from-rose-50`, `ring-violet-700`, etc.
    const classPattern = new RegExp(`\\b[\\w-]*${family}-\\d{2,3}\\b`, "i");
    if (classPattern.test(source)) {
      hits.push(`${label} contains a Tailwind ${family} utility class`);
    }
  }
  return hits;
}

describe("[AC] brand.ts colour exports are monochrome", () => {
  it.each(BRAND_COLOR_KEYS)("brand.%s is black, white or grey", (key) => {
    const value = (brand as Record<string, unknown>)[key];
    expect(typeof value).toBe("string");
    expect(isGreyscaleColorValue(value as string)).toBe(true);
  });
});

describe("[AC] --brand-* colour custom properties in index.css are monochrome", () => {
  const colorProps = extractBrandColorCustomProperties(indexCss);

  it("found at least one brand colour custom property to check", () => {
    expect(colorProps.length).toBeGreaterThan(0);
  });

  it.each(colorProps.map((p) => [p.name, p.value] as const))(
    "%s (%s) is black, white or grey",
    (_name, value) => {
      expect(isGreyscaleColorValue(value)).toBe(true);
    },
  );
});

describe("[AC] no indigo/purple remnants in theme or component source", () => {
  it("index.css has no forbidden hex values or purple-family Tailwind classes", () => {
    expect(findForbiddenMentions(indexCss, "index.css")).toEqual([]);
  });

  it("brand.ts has no forbidden hex values or purple-family Tailwind classes", () => {
    expect(findForbiddenMentions(brandTs, "brand.ts")).toEqual([]);
  });

  it("lib/ui.tsx has no forbidden hex values or purple-family Tailwind classes", () => {
    expect(findForbiddenMentions(uiTsx, "lib/ui.tsx")).toEqual([]);
  });
});
