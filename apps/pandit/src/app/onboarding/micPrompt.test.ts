import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// Z2 / U4 ONE-PROMPT LAW, grep-enforced. परिचय (ParichayScreen) is the
// single designed mic-prompt moment. The tutorial's आवाज़ practice must never
// re-prompt when permission is already granted — it seeds its state
// synchronously from the stored grant and its askMic short-circuits to
// practice before any getUserMedia. This test FAILS if a future edit
// re-opens a second prompt path in the tutorial.
//
// Ruling #8 / approach C: that machinery now lives in the ONE shared
// MicPracticeArtboard (TutorialV2 and ARTBOARDS['A4'] both consume it), so
// these assertions read that file — UNCHANGED text, moved source.
const SRC = join(__dirname, "..", "..");
const read = (rel: string) => readFileSync(join(SRC, rel), "utf-8");

describe("Z2 — one mic prompt (परिचय), tutorial never re-asks", () => {
  it("slide 5 seeds micPerm synchronously from the stored grant", () => {
    const src = read("components/tutorial/MicPracticeArtboard.tsx");
    // useState initializer reads the stored grant → no ask-button flash
    expect(src).toMatch(/useState<[^>]*>\(\s*\(\)\s*=>\s*\{[\s\S]*?mic_permission_granted/);
  });

  it("slide 5 askMic short-circuits to practice BEFORE any getUserMedia when granted", () => {
    const src = read("components/tutorial/MicPracticeArtboard.tsx");
    const askMicIdx = src.indexOf("const askMic");
    expect(askMicIdx).toBeGreaterThan(0);
    const guardIdx = src.indexOf('micPerm === "granted"', askMicIdx);
    const gumIdx = src.indexOf("getUserMedia({ audio: true })", askMicIdx);
    expect(guardIdx).toBeGreaterThan(0);
    expect(gumIdx).toBeGreaterThan(0);
    // the granted guard must appear before the prompt-capable getUserMedia
    expect(guardIdx).toBeLessThan(gumIdx);
  });

  it("परिचय remains a prompt path (the one designed moment)", () => {
    const src = read("app/onboarding/screens/ParichayScreen.tsx");
    expect(src).toContain("getUserMedia({ audio: true })");
  });
});
