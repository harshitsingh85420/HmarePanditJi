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

// ─────────────────────────────────────────────────────────────
// CANON FRAME 32 GUARD. The identity block's literals are read straight
// off design/canon/हमारे पंडित जी.dc.html; a silent flatten (losing the
// avatar gradient, the gold ring, or the 8/20 sindoor lift) is the exact
// regression this screen has had before.
// ─────────────────────────────────────────────────────────────
describe("profile-view — canon frame 32 literals", () => {
  it("avatar is a 92px gold-ringed sindoor gradient with the 8/20 lift", () => {
    expect(src).toMatch(/w-\[92px\] h-\[92px\]/);
    expect(src).toMatch(/linear-gradient\(150deg,#D95F38,#B23A1A\)/);
    expect(src).toMatch(/border-4 border-gold/);
    expect(src).toMatch(/shadow-\[0_8px_20px_rgba\(178,58,26,0\.3\)\]/);
  });

  it("the verified seal is a 32px leaf disc on a #FFF9EE ring", () => {
    expect(src).toMatch(/w-8 h-8 rounded-full bg-leaf-500 border-\[3px\] border-\[#FFF9EE\]/);
  });

  it("stat tiles use canon's UN-LIT flat surface, not the lit card", () => {
    expect(src).toMatch(/bg-none bg-card border-\[1\.5px\] border-sand !shadow-none/);
  });

  it("no text drops below the 18sp floor (law outranks canon's 13-17px)", () => {
    const belowFloor = src.match(/text-\[(\d+)px\]/g) || [];
    const bodySizes = belowFloor
      .map((c) => Number(c.replace(/\D/g, "")))
      // display numerals and icon glyphs are exempt: they are not body text
      .filter((n) => n < 18 && n !== 19 && n !== 20);
    expect(bodySizes).toEqual([]);
  });
});
