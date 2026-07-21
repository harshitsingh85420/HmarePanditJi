import { describe, it, expect } from "vitest";
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

// ─────────────────────────────────────────────────────────────
// CANON-SHAPES-ARE-LIVE GUARD.
//
// Isj's exact-UI ruling resolved both Wave 2 side-by-sides in canon's
// favour. Merging the branches alone did NOT achieve that: it left the
// legacy shape and the canon shape live at the same time, so a pandit
// could reach two different UIs for one task. This pins the promotion.
//
// What is pinned, and why each line is here:
//   1. no /my-poojas/add5 — the parallel route is gone, not just unlinked
//   2. add/ IS the 5-step (canon titles the frames 1/5…5/5)
//   3. every readiness ENTRY lands on the hub (canon frame 12), never on
//      the linear wizard directly
//   4. the wizard still exists and still honours ?step= — the hub deep
//      -links into it, so deleting it would break the whole flow
// ─────────────────────────────────────────────────────────────

const GROUP = __dirname;
const addDir = join(GROUP, "my-poojas", "add");

describe("पूजा जोड़ें — canon's 5-step is the live path", () => {
  it("the parallel add5 route no longer exists", () => {
    expect(existsSync(join(GROUP, "my-poojas", "add5"))).toBe(false);
  });

  it("/my-poojas/add is the 5-step shape", () => {
    const src = readFileSync(join(addDir, "page.tsx"), "utf-8");
    expect(src).toMatch(/STEPS_5/);
    const model = readFileSync(join(addDir, "stepModel.ts"), "utf-8");
    expect(model).toMatch(/STEPS_5\s*=\s*\[[^\]]*\]/);
  });

  it("keeps the merged-grammar regression coverage beside it", () => {
    const files = readdirSync(addDir);
    expect(files).toContain("mergedGrammar.test.tsx");
    expect(files).toContain("stepModel.test.ts");
  });
});

describe("तैयारी — canon's hub is the live entry", () => {
  const entryFiles = [
    join(GROUP, "bookings", "page.tsx"),
    join(GROUP, "home", "HomeView.tsx"),
    join(GROUP, "home", "page.tsx"),
    join(GROUP, "..", "..", "components", "voice", "DashboardVoiceNav.tsx"),
  ];

  it("no entry point routes straight into the linear wizard", () => {
    for (const f of entryFiles) {
      const src = readFileSync(f, "utf-8");
      // bare "/readiness" as a navigation target is the regression
      expect(src, `${f} still navigates to the bare wizard`).not.toMatch(
        /(?:push|onNavigate|replace)\("\/readiness"\)/
      );
    }
  });

  it("every entry point routes to the hub", () => {
    for (const f of entryFiles) {
      expect(readFileSync(f, "utf-8")).toMatch(/\/readiness\/hub/);
    }
  });

  it("the wizard survives and still honours the hub's ?step= deep link", () => {
    const wizard = readFileSync(join(GROUP, "readiness", "page.tsx"), "utf-8");
    expect(wizard).toMatch(/step/);
    const hub = readFileSync(join(GROUP, "readiness", "hub", "page.tsx"), "utf-8");
    expect(hub).toMatch(/\/readiness\?step=\$\{/);
  });
});
