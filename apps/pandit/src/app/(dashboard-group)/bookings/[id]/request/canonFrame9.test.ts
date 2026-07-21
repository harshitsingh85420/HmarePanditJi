import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// ─────────────────────────────────────────────────────────────
// CANON FRAME 9 (नई बुकिंग विनती) — exact-UI batch 2B pins.
//
// Source-pins over page.tsx:
//   1. the CTAs are the LAST rows of the SCROLL column — canon has no
//      docked footer chrome on this frame
//   2. accept draws Material check_circle FILLED (drawn-not-emoji), and
//      both CTAs hold their canon heights (66/58 ≥ 52 tap floor)
//   3. the bell rings on canon g-bell literals (1.8s infinite, origin
//      50% 10%, 16/-12/7/-3) with a reduced-motion kill-switch
//   4. conservation: the total binds the server's earnings figure; no
//      rupee amount in emitted code is hardcoded
//   5. register: the sub-line keeps the -इए form, confirms use the danda
// ─────────────────────────────────────────────────────────────

const src = readFileSync(join(__dirname, "page.tsx"), "utf-8");
const code = src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");

describe("नई बुकिंग विनती — canon frame 9 pins", () => {
  it("CTAs live at the end of the scroll column — no docked footer", () => {
    expect(src).not.toMatch(/<footer/);
    // accept then decline, inside <main>, before its close
    const mainBlock = src.slice(src.indexOf("<main"), src.indexOf("</main>"));
    expect(mainBlock).toContain("onClick={handleAccept}");
    expect(mainBlock).toContain("setShowRejectConfirm(true)");
  });

  it("accept draws Material check_circle FILLED; canon CTA heights hold", () => {
    expect(src).toMatch(/material-symbols-filled[^>]*text-\[28px\][\s\S]{0,200}check_circle/);
    expect(src).toMatch(/min-h-\[66px\][^"]*bg-leaf-500/);
    expect(src).toMatch(/min-h-\[58px\][^"]*border-\[#E7C9C2\]/);
    // the raw ✓ char and the string's legacy ✅ must not render beside it
    expect(code).not.toMatch(/>✓</);
    expect(src).toMatch(/replace\(\/\^✅\\s\*\/, ""\)/);
  });

  it("bell rings on canon g-bell literals, reduced-motion covered", () => {
    expect(src).toMatch(/pa-bell-canon 1\.8s ease-in-out infinite/);
    expect(src).toMatch(/transform-origin: 50% 10%/);
    for (const deg of ["16deg", "-12deg", "7deg", "-3deg"]) {
      expect(src).toContain(`rotate(${deg})`);
    }
    expect(src).toMatch(/prefers-reduced-motion: reduce/);
  });

  it("money is real: total binds earnings.totalToPandit, no hardcoded ₹", () => {
    expect(src).toMatch(/MoneyCount target=\{total\} className="text-\[28px\]/);
    expect(src).toMatch(/booking\.earnings\?\.totalToPandit/);
    expect(code).not.toMatch(/₹\s*[0-9०-९]/);
  });

  it("register law: -इए sub-line, danda in the spoken confirms", () => {
    expect(src).toContain("अभी जवाब दीजिए");
    // comments may QUOTE canon's दें — emitted code must not
    expect(code).not.toContain("अभी जवाब दें");
    expect(src).toContain("स्वीकार कर रहे हैं। पक्का?");
    expect(src).not.toMatch(/कर रहे हैं\. पक्का\?/);
  });

  it("type floors hold: nothing below 15px", () => {
    const sizes = [...src.matchAll(/text-\[(\d+)px\]/g)].map((m) => Number(m[1]));
    expect(Math.min(...sizes)).toBeGreaterThanOrEqual(15);
  });
});
