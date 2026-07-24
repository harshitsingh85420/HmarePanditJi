import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { hi } from "@/lib/strings";

// ─────────────────────────────────────────────────────────────
// NO ONBOARDING SCREEN MAY HAVE ZERO FORWARD PATHS (founder P0, 2026-07-23).
// The पP0 walk found परिचय (onboarding screen 5) STRANDABLE: a pandit who
// dismissed the mic permission popup saw only "फिर से पूछिए" (re-ask) — no way
// forward — for exactly the persona who refuses permission popups. Doc F2: voice
// is optional; a visible "बिना आवाज़ के आगे बढ़िए" must always be present.
//
// This guard pins the fix on परिचय (the screen that actually dead-ended): a
// PERSISTENT skip, rendered UNCONDITIONALLY (not inside a `stage === …` gate),
// that calls advance() (parichayDone → onDone). Proven-to-fail: wrap the skip in
// a stage conditional, or delete it, and this turns red.
// ─────────────────────────────────────────────────────────────

const src = readFileSync(join(__dirname, "ParichayScreen.tsx"), "utf-8");

describe("परिचय — a forward path always exists (F2, no dead end)", () => {
  it("has the skip string, register-clean Devanagari", () => {
    expect(hi.parichay.skipVoice).toBe("बिना आवाज़ के आगे बढ़िए");
    // no roman letters in the user-facing skip label
    expect(hi.parichay.skipVoice).not.toMatch(/[A-Za-z]/);
  });

  it("renders a skip control that calls advance()", () => {
    // the skip button binds the forward function (advance → parichayDone → onDone)
    expect(src).toMatch(/onClick=\{advance\}[\s\S]{0,200}parichay\.skipVoice/);
  });

  it("the skip is UNCONDITIONAL — not gated on any stage", () => {
    // the stage-conditional footer closes before the persistent skip renders,
    // so the skip is a top-level sibling shown on EVERY stage.
    const footerClose = src.indexOf("</footer>");
    const skipIdx = src.indexOf('parichay.skipVoice');
    expect(footerClose).toBeGreaterThan(0);
    expect(skipIdx).toBeGreaterThan(footerClose);
    // and there is no `stage ===` gate between the footer close and the skip —
    // i.e., the skip is not wrapped in a new stage conditional.
    const between = src.slice(footerClose, skipIdx);
    expect(between).not.toMatch(/stage\s*===/);
  });

  it("advance() is the forward exit (sets parichayDone + calls onDone)", () => {
    expect(src).toMatch(/const advance = \(\) => \{[\s\S]*?setParichayDone\(true\)[\s\S]*?onDone\(\)/);
  });
});
