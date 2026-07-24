import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// ─────────────────────────────────────────────────────────────
// RULING #9 — orb gesture split (source-scan guard). A TAP never silences
// (awake=repeat, asleep=wake); the mute is a SEPARATE, VISIBLE, ≥52px labelled
// control that SPEAKS a farewell to completion, THEN mutes; and every mute
// preserves the S5 mic-release (privacy). Fails the build if any regress.
// ─────────────────────────────────────────────────────────────

const orb = readFileSync(join(__dirname, "ShishyaOrb.tsx"), "utf8");
const vc = readFileSync(join(__dirname, "..", "..", "lib", "voiceController.ts"), "utf8");

describe("ShishyaOrb — Ruling #9 gesture split", () => {
  it("a TAP never mutes: awake tap repeats, asleep tap wakes", () => {
    expect(orb).toMatch(/voiceController\.repeatCurrent\(\)/); // awake → repeat
    expect(orb).toMatch(/voiceController\.setMuted\(false\)/); // asleep → wake
    expect(orb, "the orb must never mute on tap").not.toMatch(/setMuted\(true\)/);
  });

  it("mute is a VISIBLE, labelled ≥52px control via muteWithFarewell", () => {
    expect(orb).toMatch(/voiceController\.muteWithFarewell\(\)/);
    expect(orb).toMatch(/t\("shishya\.muteControl"\)/); // the visible 'सुला दें' label
    expect(orb).toMatch(/min-h-\[52px\]/); // ≥52px tap target
  });

  // Ruling #9 AMENDED (Isj 2026-07-24): the pill is a TOGGLE — one element
  // owns the one concept. Asleep it reads जगाइए and WAKES (mirrors the orb's
  // tap-asleep path); awake it reads सुला दें and speak-then-mutes. Both
  // states pinned so neither direction can silently vanish again.
  it("AMENDED: the pill toggles — asleep state reads जगाइए and wakes via setMuted(false)", () => {
    expect(orb).toMatch(/t\("shishya\.wakeControl"\)/); // the जगाइए label exists
    // ONE onClick owns both directions: muted → wake, else → speak-then-mute
    expect(orb).toMatch(/muted \? voiceController\.setMuted\(false\) : voiceController\.muteWithFarewell\(\)/);
    // and the control no longer self-hides while muted (the old asymmetry)
    expect(orb).not.toMatch(/if \(muted\) return null/);
    // a11y names the current action in each state
    expect(orb).toMatch(/muted \? t\("shishya\.a11yWakeControl"\) : t\("shishya\.a11yMute"\)/);
  });

  it("muteWithFarewell SPEAKS the farewell, THEN mutes (speak-then-mute)", () => {
    expect(vc).toMatch(
      /muteWithFarewell\([^)]*\)[\s\S]*?speak\(\s*t\("shishya\.muteFarewell"\),\s*\{[\s\S]*?onEnd:[\s\S]*?this\.setMuted\(true\)/,
    );
  });

  it("PRIVACY (S5): the mute path releases the mic — setMuted(true) calls releaseMicStream", () => {
    expect(vc).toMatch(/if \(v\) \{[\s\S]*?releaseMicStream/);
  });

  it("the VOICE 'सो जाओ' path ALSO speaks-then-mutes (routes through muteWithFarewell)", () => {
    // he spoke a command — silence-back = "it didn't hear me". Both entry points
    // (control + voice) go through muteWithFarewell, never a bare setMuted(true).
    const idx = vc.indexOf("matchAny(clean, SLEEP)");
    expect(idx).toBeGreaterThan(0);
    const body = vc.slice(idx, idx + 500);
    expect(body).toMatch(/muteWithFarewell\(/);
    expect(body, "voice sleep must not bare-mute").not.toMatch(/setMuted\(true\)/);
  });

  it("repeatCurrent re-narrates via replayFn and never mutes", () => {
    const idx = vc.indexOf("repeatCurrent(): void");
    expect(idx).toBeGreaterThan(0);
    // bound to repeatCurrent's own body — the next `/**` is muteWithFarewell's
    // doc comment (which legitimately mentions setMuted).
    const body = vc.slice(idx, vc.indexOf("/**", idx));
    expect(body).toMatch(/replayFn/);
    expect(body, "repeat must never mute").not.toMatch(/setMuted/);
  });
});
