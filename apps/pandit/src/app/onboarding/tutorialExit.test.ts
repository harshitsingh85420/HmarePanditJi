import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// ─────────────────────────────────────────────────────────────
// TRAVERSAL FIXES (Isj order 2026-07-27, from the round-trip walk).
//
// 1. "छोड़िए ›" must EXIT the deck. It used to call
//    onSlideChange(TUTORIAL_TOTAL) — a jump to the LAST SLIDE, which is one
//    more slide, not a way out. The label is the promise.
//
// 2. पीछे on रजिस्ट्रेशन must not throw a token-holding, OTP-verified pandit
//    back into onboarding content. Same resume-rule refusal as होम.
// ─────────────────────────────────────────────────────────────

const SRC = (p: string) => readFileSync(join(__dirname, p), "utf8");
const TUTORIAL = SRC("TutorialV2.tsx");
const ORCHESTRATOR = SRC("page.tsx");

describe("छोड़िए exits the deck", () => {
  it("no skip handler jumps to the last slide", () => {
    expect(TUTORIAL).not.toMatch(/skipToCta/);
    // the exit must not be expressed as a slide change at all
    expect(TUTORIAL).not.toMatch(/onSkip=\{\(\) => onSlideChange\(/);
    expect(TUTORIAL).toMatch(/const exitTutorial = \(\) => onRegister\(\)/);
  });

  it("every onSkip is wired to the exit, not to a navigation within the deck", () => {
    const skips = TUTORIAL.match(/onSkip=\{[^}]+\}/g) || [];
    expect(skips.length, "the deck must still offer a skip control").toBeGreaterThan(0);
    for (const s of skips) {
      expect(s, `${s} does not exit the deck`).toMatch(/exitTutorial/);
    }
  });
});

describe("पीछे on रजिस्ट्रेशन refuses re-entry to onboarding", () => {
  it("the back handler checks for a token before returning to the tutorial", () => {
    const at = ORCHESTRATOR.indexOf("<RegistrationScreen");
    expect(at, "the registration screen must still be mounted here").toBeGreaterThan(-1);
    const block = ORCHESTRATOR.slice(at, at + 1400);
    expect(block, "back must gate on the token").toMatch(/if \(getToken\(\)\)/);
    // …and say so rather than silently doing nothing
    expect(block).toMatch(/regBackBlocked/);
    // the tutorial return is still there for the no-token case, but only after the gate
    const gateAt = block.indexOf("if (getToken())");
    const tutorialAt = block.indexOf('store.setPhase("TUTORIAL")');
    expect(tutorialAt, "the no-token fallback must survive").toBeGreaterThan(-1);
    expect(tutorialAt).toBeGreaterThan(gateAt);
  });
});
