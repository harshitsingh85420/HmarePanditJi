import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// ─────────────────────────────────────────────────────────────
// DECK-PLAYER BEHAVIOUR GUARD (source-scan, like tutorialIdentity.test.ts).
// The DeckPlayer must, for EVERY slide, keep the founder-mandated behaviours:
//   · skip-by-voice from any slide — the SKIP grammar is registered in BOTH
//     command branches (confirm slides AND normal slides);
//   · reduced-motion — it reads useReduced() and hands `reduced` to the artboard
//     (which renders its static end-state);
//   · a silent pause between slides before narration;
//   · it stays STANDALONE — it must not import TutorialV2 (whose guarded
//     mic/mute machinery is onboarding-only).
// Fails the build if any of these regress.
// ─────────────────────────────────────────────────────────────

const src = readFileSync(join(__dirname, "DeckPlayer.tsx"), "utf8");

describe("DeckPlayer — mandated behaviours", () => {
  it("registers voice commands via useVoiceCommands", () => {
    expect(src).toMatch(/useVoiceCommands\(/);
  });

  it("SKIP grammar is registered on BOTH the confirm and the normal command branch", () => {
    // every command array spreads ...SKIP so 'स्किप करें' escapes from any slide
    const skipUses = src.match(/\.\.\.SKIP/g) ?? [];
    expect(skipUses.length, "SKIP must appear in both command branches").toBeGreaterThanOrEqual(2);
    expect(src).toMatch(/import\s*\{[^}]*\bSKIP\b[^}]*\}\s*from\s*["']@\/lib\/voiceGrammar["']/);
  });

  it("honours reduced-motion — reads useReduced and passes `reduced` to the artboard", () => {
    expect(src).toMatch(/useReduced\(\)/);
    expect(src).toMatch(/reduced=\{reduced\}/);
  });

  it("has a silent pause between slides before narration", () => {
    expect(src).toMatch(/SILENT_PAUSE_MS/);
    expect(src).toMatch(/setTimeout\(\(\)\s*=>\s*setArmed\(true\)/);
  });

  it("stays standalone — never imports TutorialV2 (guarded onboarding machinery)", () => {
    // a prose comment may mention it; forbid an actual import / JSX use.
    expect(src).not.toMatch(/import[^\n]*TutorialV2|<\s*TutorialV2\b/);
  });

  it("drives the shared canon chrome + the drop-in artboard registry", () => {
    expect(src).toMatch(/TutorialShell/);
    expect(src).toMatch(/getArtboard\(/);
  });
});
