import { defineConfig } from "vitest/config";

/**
 * A separate Vitest project for the monochrome-theme unit suite
 * (US-014-2). It lives under `e2e/` because QA's scope for this ticket is
 * `frontend/e2e/` only, but it is a plain Vitest run, not a Playwright spec:
 * it reads `src/lib/brand.ts`, `src/index.css` and `src/lib/ui.tsx` as
 * source/text and asserts every brand colour is black, white or grey.
 *
 * Playwright's own config only picks up `*.spec.ts` under `e2e/`, so naming
 * this suite `*.test.ts` keeps the two runners from colliding. Run it with:
 *   npx vitest run --config e2e/vitest.monochrome.config.ts
 */
export default defineConfig({
  test: {
    include: ["e2e/**/*.test.ts"],
    environment: "node",
    globals: true,
  },
});
