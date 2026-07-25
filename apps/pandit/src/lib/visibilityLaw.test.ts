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
  });
});
