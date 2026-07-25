import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// ─────────────────────────────────────────────────────────────
// HOME NULL-SAFETY (PAGE 9 finding, 2026-07-25). A today-booking without
// venueAddress crashed the ENTIRE dashboard: HomeView.tsx:435 called
// b.venueAddress.split(",") unguarded while its two siblings used ?. —
// one missing field, white screen. Pinned: every venueAddress.split in
// the home tree is optional-chained.
// ─────────────────────────────────────────────────────────────

describe("home — booking fields never crash the dashboard", () => {
  it("every venueAddress.split is optional-chained", () => {
    const src = readFileSync(join(__dirname, "HomeView.tsx"), "utf8");
    const bare = src.match(/venueAddress\.split/g) || [];
    expect(bare, "unguarded venueAddress.split — one null field would white-screen home").toEqual([]);
    expect((src.match(/venueAddress\?\.split/g) || []).length).toBeGreaterThanOrEqual(3);
  });
});
