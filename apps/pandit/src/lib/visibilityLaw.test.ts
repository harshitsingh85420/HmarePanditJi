import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// ─────────────────────────────────────────────────────────────
// §3-V VISIBILITY LAW guards (Isj standing order, 2026-07-25).
// The machine check lives in scripts/lib/visibilityAudit.mjs and runs
// as part of every walked page's §3; these pins keep the two layout
// fixes the retro-sweep forced from silently regressing:
//   1. home अगली बुकिंग hero: a <button> flex item has no
//      min-height:auto floor — without shrink-0 it collapsed to
//      354×4px inside the flex-col scroller and overflow-hidden ate
//      the entire card (invisible on the populated home).
//   2. CoachSpotlight: a tall target near the top has room on NEITHER
//      side — the old two-way flip anchored the card past the top edge
//      (समझा at y=-43 on the bookings list). The third placement pins
//      the card inside the viewport, clear of the bottom nav.
// ─────────────────────────────────────────────────────────────

const SRC = (p: string) => readFileSync(join(__dirname, "..", p), "utf8");

describe("§3-V visibility law — layout pins", () => {
  it("home next-booking hero button keeps shrink-0 (flex-col scroller collapse)", () => {
    const src = SRC("app/(dashboard-group)/home/HomeView.tsx");
    expect(src).toMatch(/className="w-full shrink-0[^"]*overflow-hidden[^"]*flex flex-col/);
  });
  it("CoachSpotlight has the in-viewport third placement (no off-screen card)", () => {
    const src = SRC("components/moments/CoachSpotlight.tsx");
    expect(src).toMatch(/tooltipAbove = !tooltipBelow && rect\.top > 220/);
    // 180, not 104: the pinned card must clear the SOS pill at
    // bottom-[104px] — an emergency control may never sit under a tip
    expect(src).toMatch(/\{ bottom: 180 \}/);
    expect(src).toMatch(/data-coach-tip/);
    // second catch: the BELOW placement clamps above the SOS band too
    expect(src).toMatch(/sosBandTop = viewportH - 176/);
    expect(src).toMatch(/Math\.min\(belowTopRaw, sosBandTop - cardH\)/);
    expect(src).toMatch(/\{ top: belowTop \}/);
    // third catch: the ABOVE placement's bottom edge clears the band
    // (my-poojas footer-CTA tip put समझा under 🆘)
    expect(src).toMatch(/aboveBottom = Math\.max\(viewportH - rect\.top \+ 14, viewportH - sosBandTop\)/);
    expect(src).toMatch(/\{ bottom: aboveBottom \}/);
  });
  it("Screen's column is w-full + max-w (never shrink-to-fit past the device)", () => {
    const src = SRC("components/ui/Screen.tsx");
    expect(src).toMatch(/className="w-full h-\[100dvh\] flex flex-col max-w-\[430px\]/);
  });
  it("add-wizard samagri inputs keep min-w-0 (the 430-in-390 column clip)", () => {
    const src = SRC("app/(dashboard-group)/my-poojas/add/page.tsx");
    const pair = src.slice(src.indexOf('placeholder="मात्रा"') - 200, src.indexOf("कंपनी (${SAMAGRI_BRAND_ANY})") + 200);
    expect(pair.match(/flex-1 min-w-0 h-\[56px\]/g)?.length).toBe(2);
  });
  it("my-poojas floor error: server message surfaced AND spoken (F11-04 class)", () => {
    const src = SRC("app/(dashboard-group)/my-poojas/page.tsx");
    expect(src).toMatch(/res\.error\?\.code === "dakshina_below_floor" && res\.error\?\.message/);
    expect(src).toMatch(/voiceController\.speakAndWait\(msg, \{ interrupt: false \}\)/);
  });
});

describe("Ruling #11 — contrast tokens (veto reverts the two config lines)", () => {
  it("the tokens ship the darkened shades", () => {
    const cfg = readFileSync(join(__dirname, "..", "..", "tailwind.config.ts"), "utf8");
    expect(cfg).toMatch(/softgrey:'#7E6553'/);
    expect(cfg).toMatch(/brassdark: '#8A6508'/);
  });
  it("no TEXT color literal reintroduces the old hexes (objects/gradients exempt)", async () => {
    const { readdirSync, statSync } = await import("node:fs");
    const walk = (dir: string): string[] =>
      readdirSync(dir).flatMap((f) => {
        const p = join(dir, f);
        return statSync(p).isDirectory() ? walk(p) : /\.tsx?$/.test(f) ? [p] : [];
      });
    for (const f of walk(join(__dirname, ".."))) {
      const src = readFileSync(f, "utf8");
      expect(src, f).not.toMatch(/color:\s*["']#(8A6F5C|B8860B)/i);
    }
  });
});
