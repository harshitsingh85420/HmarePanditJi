import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { hi } from "./strings";

// ─────────────────────────────────────────────────────────────
// FAT-FINGER LAW guards (PAGE 13 triage, 2026-07-25).
//   1. ✖ never deletes directly — it ARMS the two-button ask; the one
//      removePooja call lives in the confirm-yes handler alone.
//   2. The ask is shown AND spoken (queued+awaited, narration law).
//   3. ONE add control on the empty screen — the footer dashed CTA
//      renders only for a populated list (canon 27c vs 29).
// ─────────────────────────────────────────────────────────────

const src = readFileSync(
  join(__dirname, "..", "app/(dashboard-group)/my-poojas/page.tsx"),
  "utf8",
);

describe("✖ delete confirmation", () => {
  it("the ✖ arms confirmRemove — it can never call removePooja itself", () => {
    // the ✖ button block: aria-label `${pooja} हटाइए`
    const btnStart = src.indexOf('aria-label={`${pooja} हटाइए`}');
    const btnBlock = src.slice(src.lastIndexOf("<button", btnStart), btnStart);
    expect(btnBlock).toMatch(/setConfirmRemove\(pooja\)/);
    expect(btnBlock).not.toMatch(/removePooja/);
  });
  it("removePooja is invoked from exactly ONE call site — the confirm-yes button", () => {
    const calls = src.match(/void removePooja\(/g) || [];
    expect(calls.length).toBe(1);
    const idx = src.indexOf("void removePooja(");
    const context = src.slice(idx - 900, idx);
    expect(context).toMatch(/setConfirmRemove\(null\)/);
    expect(context).toMatch(/confirmRemove === pooja/);
  });
  it("the ask is spoken (queued, awaited) AND shown", () => {
    expect(src).toMatch(/voiceController\.speakAndWait\(\s*t\("myPoojas\.removeAsk"\)\.replace\("\{name\}", pooja\),\s*\{ interrupt: false \}/);
    expect(src).toMatch(/\{t\("myPoojas\.removeAsk"\)\.replace\("\{name\}", pooja\)\}/);
  });
  it("strings exist and hold the register", () => {
    expect(hi.myPoojas.removeAsk).toBe("क्या आप {name} हटाना चाहते हैं?");
    expect(hi.myPoojas.removeYes).toBe("हाँ, हटाइए");
    expect(hi.myPoojas.removeNo).toBe("नहीं, रहने दीजिए");
    for (const s of [hi.myPoojas.removeAsk, hi.myPoojas.removeYes, hi.myPoojas.removeNo]) {
      expect(s).not.toMatch(/तुम|करो\b/);
    }
  });
});

describe("one add control on empty (canon 27c)", () => {
  it("the footer dashed CTA is gated on a populated list", () => {
    expect(src).toMatch(/poojas\.length > 0 \? \(\s*<div ref=\{addBtnRef\}>/);
  });
});
