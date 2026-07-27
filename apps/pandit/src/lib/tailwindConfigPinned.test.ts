import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// ─────────────────────────────────────────────────────────────
// CSS-REACHES-THE-BROWSER GUARD (QA, 2026-07-27).
//
// Tailwind's PostCSS plugin resolves tailwind.config.* from the process CWD.
// When a Next app is built or served from the monorepo root, it finds NO
// config, emits zero utilities, and the app renders with only its handful of
// globals.css rules — no borders, no badges, no spacing. Nothing fails: a
// missing stylesheet is not a build error.
//
// The admin panel shipped that way and it was invisible until a QA screenshot
// showed an unstyled table (47 CSS rules; 940 once pinned). Every app's
// postcss config must pin its config path so dev CSS === prod CSS from any
// working directory.
// ─────────────────────────────────────────────────────────────

const APPS = ["pandit", "admin", "web"] as const;
const ROOT = join(__dirname, "..", "..", "..", "..");

describe("every app pins its tailwind config path", () => {
  for (const app of APPS) {
    it(`apps/${app} resolves tailwind.config from its own directory`, () => {
      const p = join(ROOT, "apps", app, "postcss.config.js");
      let src: string;
      try {
        src = readFileSync(p, "utf8");
      } catch {
        return; // app has no postcss config (or a different css pipeline) — not this guard's business
      }
      if (!/tailwindcss/.test(src)) return;
      expect(
        src,
        `apps/${app}/postcss.config.js does not pin its tailwind config path. ` +
          `Built from the repo root it will find no config and ship an unstyled app. ` +
          `Use: tailwindcss: { config: path.join(__dirname, 'tailwind.config.ts') }`,
      ).toMatch(/config:\s*path\.join\(__dirname/);
    });
  }
});
