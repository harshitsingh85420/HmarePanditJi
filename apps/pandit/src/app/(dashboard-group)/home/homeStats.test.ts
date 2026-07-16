import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// ─────────────────────────────────────────────────────────────
// HOME 3-STAT ROW GUARD. The रेटिंग/पूर्णता/बुकिंग cards are TRUTH claims —
// they must come from GET /pandit/stats and hide without data. Fails the
// build if the fetch disappears, the row loses its data gate, or production
// home code hardcodes stats (the harness mock is exempt).
// ─────────────────────────────────────────────────────────────
const read = (rel: string) => readFileSync(join(__dirname, rel), "utf-8");

describe("home 3-stat row — data-fed, hidden without data", () => {
  it("container fetches the real /pandit/stats endpoint", () => {
    const src = read("page.tsx");
    expect(src).toMatch(/api\("\/pandit\/stats"\)/);
    expect(src).toMatch(/setStats\(/);
  });

  it("HomeView gates the row on real, non-empty stats", () => {
    const src = read("HomeView.tsx");
    expect(src).toMatch(/stats && \(stats\.completedBookings > 0 \|\| stats\.rating !== null\)/);
    // per-stat truthfulness: each card renders only when its value exists
    expect(src).toMatch(/stats\.rating !== null &&/);
    expect(src).toMatch(/stats\.completionPct !== null &&/);
    expect(src).toMatch(/stats\.completedBookings > 0 &&/);
  });

  it("production home code never hardcodes stats", () => {
    for (const rel of ["page.tsx", "HomeView.tsx"]) {
      const src = read(rel);
      expect(src, `${rel} must not inline a stats literal`).not.toMatch(/stats=\{\{/);
    }
  });
});
