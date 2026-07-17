import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// ─────────────────────────────────────────────────────────────
// PROFILE-VIEW STATS GUARD (mockup frame 24). The ✓/⭐ pills and the
// पूजाएँ/बुकिंग/साल-अनुभव cards are TRUTH claims — they must come from
// real payloads (/auth/me profile + GET /pandit/stats) and hide without
// data. Fails the build if the fetch disappears or a gate is dropped.
// ─────────────────────────────────────────────────────────────
const src = readFileSync(join(__dirname, "page.tsx"), "utf-8");

describe("profile-view — data-fed pills and stat cards, hidden without data", () => {
  it("fetches the real /pandit/stats endpoint alongside /auth/me", () => {
    expect(src).toMatch(/api\("\/pandit\/stats"\)/);
    expect(src).toMatch(/setStats\(/);
  });

  it("प्रमाणित pill only on a VERIFIED profile", () => {
    expect(src).toMatch(/verificationStatus === "VERIFIED" &&/);
  });

  it("rating pill and बुकिंग card gate on non-null stats", () => {
    expect(src).toMatch(/stats !== null && stats\.rating !== null &&/);
    expect(src).toMatch(/stats !== null && stats\.completedBookings > 0 &&/);
  });

  it("साल-अनुभव card hides at the 0 default (no fake brag)", () => {
    expect(src).toMatch(/\(profile\?\.experienceYears \|\| 0\) > 0 &&/);
  });

  it("never hardcodes a stats literal", () => {
    expect(src).not.toMatch(/setStats\(\{/);
  });
});
