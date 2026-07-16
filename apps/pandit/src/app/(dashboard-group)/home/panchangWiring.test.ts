import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// ─────────────────────────────────────────────────────────────
// PANCHANG-CHIP WIRING GUARD. The शुभ-मुहूर्त chip is a TRUTH claim ("today
// is auspicious for a booking") — it must be fed by REAL MuhuratDate rows via
// GET /muhurat/pujas-for-date, never hardcoded on. This fails the build if:
//  - the home container stops fetching today's muhurats, or
//  - the chip stops being gated on the shubh prop, or
//  - production code hardcodes shubh(Muhurat)={true} (harness mock exempt).
// ─────────────────────────────────────────────────────────────
const read = (rel: string) => readFileSync(join(__dirname, rel), "utf-8");

describe("panchang शुभ-मुहूर्त chip — data-fed, never hardcoded", () => {
  it("home container fetches today's muhurats from the real endpoint", () => {
    const src = read("page.tsx");
    expect(src).toMatch(/\/muhurat\/pujas-for-date\?date=/);
    expect(src).toMatch(/setShubhMuhurat\(.*length > 0\)/);
  });

  it("HomeView passes the flag through to PanchangStrip", () => {
    const src = read("HomeView.tsx");
    expect(src).toMatch(/<PanchangStrip shubh=\{shubhMuhurat\}/);
  });

  it("PanchangStrip gates the chip on shubh and defaults it OFF", () => {
    const src = readFileSync(
      join(__dirname, "..", "..", "..", "components", "moments", "PanchangStrip.tsx"),
      "utf-8",
    );
    expect(src).toMatch(/shubh = false/);
    expect(src).toMatch(/\{shubh && \(/);
  });

  it("production home code never hardcodes the chip on", () => {
    for (const rel of ["page.tsx", "HomeView.tsx"]) {
      const src = read(rel);
      expect(src, `${rel} must not hardcode shubh`).not.toMatch(/shubh(Muhurat)?=\{?true\}?/);
    }
  });
});
