import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// ─────────────────────────────────────────────────────────────
// IDENTITY LAW (founder, Option A). The tutorial's interactive behavior —
// आवाज़ mic practice, सो जाओ/जागो mute gate, नई बुकिंग temple bell, स्वागत
// register CTA — must be keyed by an IDENTITY MARKER on the slide
// (SlideDef.interactive / .role), NEVER by the slide's index. Position-
// keyed behavior silently breaks on any reorder (BB1's lesson). This guard
// FAILS THE BUILD if an interactive check ever regresses to a slide index.
// ─────────────────────────────────────────────────────────────
const src = readFileSync(
  join(__dirname, "TutorialV2.tsx"),
  "utf-8",
);

describe("Tutorial — interactivity keyed by identity, not position", () => {
  it("SlideDef declares the identity markers", () => {
    expect(src).toMatch(/interactive\?:\s*"mic"\s*\|\s*"mute"/);
    expect(src).toMatch(/role\?:\s*"bell"\s*\|\s*"cta"/);
  });

  it("keys mic / mute / bell / cta behavior off those markers", () => {
    expect(src).toMatch(/interactive === "mic"/);
    expect(src).toMatch(/interactive === "mute"/);
    expect(src).toMatch(/role === "bell"/);
    expect(src).toMatch(/role === "cta"/);
  });

  it("never keys interactive behavior off a slide index", () => {
    // idx === 0 (the first slide has no Back) is inherently positional and
    // reorder-invariant, so it is the ONE allowed index comparison. ANY
    // other numeric idx comparison is exactly the fragility this law kills.
    const offenders = src.match(/\bidx\s*(?:===|!==)\s*(?!0\b)\d+/g) || [];
    expect(offenders).toEqual([]);
    // and no TUTORIAL_TOTAL-relative CTA position check either
    expect(src).not.toMatch(/idx\s*===\s*TUTORIAL_TOTAL\s*-\s*1/);
  });

  it("the interactive slides still wire their proven voice behavior", () => {
    // mic slide: askMic → getUserMedia + practice-resolution + e2e bypass
    expect(src).toContain("const askMic");
    expect(src).toContain("getUserMedia({ audio: true })");
    expect(src).toMatch(/voiceController\.e2e/);
    // mute slide: the mute→unmute gate that unlocks Next
    expect(src).toMatch(/nextDisabled = isMute && !gateOpen/);
  });
});
