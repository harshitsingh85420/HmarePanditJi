import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// ─────────────────────────────────────────────────────────────
// RULING #9, SECOND AMENDMENT (Isj 2026-07-24) — ONE control, source-scanned.
// AWAKE: the orb alone; a tap is the PERSISTENT sleep (full muted state that
// parks audio across screens), ANNOUNCED first — speak-then-mute survives via
// muteWithFarewell. ASLEEP: dimmed orb + the जगाइए pill — either wakes.
// The सुला-दें pill is DELETED app-wide; tap-repeat is RETIRED (hear-again
// lives in the voice grammar "फिर से"). S5 mic-release survives every mute.
// History: v1 = tap-repeat + separate सुला-दें control; first amendment made
// the pill a toggle; this amendment collapses to the orb. Each state below is
// pinned so no direction silently regresses.
// ─────────────────────────────────────────────────────────────

const orb = readFileSync(join(__dirname, "ShishyaOrb.tsx"), "utf8");
const vc = readFileSync(join(__dirname, "..", "..", "lib", "voiceController.ts"), "utf8");

describe("ShishyaOrb — Ruling #9 second amendment (one control)", () => {
  it("awake tap = PERSISTENT sleep via muteWithFarewell (announced, never a bare mute)", () => {
    // the handleTap awake branch must route through muteWithFarewell
    const tapIdx = orb.indexOf("const handleTap");
    const tapBody = orb.slice(tapIdx, orb.indexOf("};", tapIdx));
    expect(tapBody).toMatch(/voiceController\.muteWithFarewell\(\)/);
    // and must NOT bare-mute or repeat
    expect(tapBody, "tap must announce, never bare-mute").not.toMatch(/setMuted\(true\)/);
    expect(tapBody, "tap-repeat is retired").not.toMatch(/repeatCurrent/);
  });

  it("asleep tap wakes (setMuted(false)) — both wake paths exist", () => {
    const tapIdx = orb.indexOf("const handleTap");
    const tapBody = orb.slice(tapIdx, orb.indexOf("};", tapIdx));
    expect(tapBody).toMatch(/voiceController\.setMuted\(false\)/); // orb wake
  });

  it("the pill exists ONLY asleep, reads जगाइए, ≥52px, and wakes", () => {
    const ctlIdx = orb.indexOf("export function ShishyaMuteControl");
    const ctl = orb.slice(ctlIdx);
    expect(ctl).toMatch(/if \(!muted\) return null/); // awake → NO pill
    expect(ctl).toMatch(/t\("shishya\.wakeControl"\)/); // जगाइए
    expect(ctl).toMatch(/min-h-\[52px\]/);
    expect(ctl).toMatch(/voiceController\.setMuted\(false\)/);
    // the सुला-दें pill is DELETED app-wide
    expect(orb, "the सुला-दें pill label must not return").not.toMatch(/t\("shishya\.muteControl"\)/);
  });

  it("a11y names the tap's real action per state (awake=सुला दें action, asleep=wake)", () => {
    expect(orb).toMatch(/asleep \? t\("shishya\.a11ySleep"\) : t\("shishya\.a11yMute"\)/);
  });

  it("muteWithFarewell SPEAKS the farewell, THEN mutes (speak-then-mute survives)", () => {
    expect(vc).toMatch(
      /muteWithFarewell\([^)]*\)[\s\S]*?speak\(\s*t\("shishya\.muteFarewell"\),\s*\{[\s\S]*?onEnd:[\s\S]*?this\.setMuted\(true\)/,
    );
  });

  it("PRIVACY (S5): the mute path releases the mic — setMuted(true) calls releaseMicStream", () => {
    expect(vc).toMatch(/if \(v\) \{[\s\S]*?releaseMicStream/);
  });

  it("the VOICE 'सो जाओ' path ALSO speaks-then-mutes (routes through muteWithFarewell)", () => {
    const idx = vc.indexOf("matchAny(clean, SLEEP)");
    expect(idx).toBeGreaterThan(0);
    const body = vc.slice(idx, idx + 500);
    expect(body).toMatch(/muteWithFarewell\(/);
    expect(body, "voice sleep must not bare-mute").not.toMatch(/setMuted\(true\)/);
  });

  it("hear-again survives by VOICE: the replay grammar exists (tap-repeat retired, capability not lost)", () => {
    // the controller keeps a replay path (registerReplay / repeatCurrent) that
    // the global "फिर से" command drives — retiring the tap gesture must not
    // strand the capability.
    expect(vc).toMatch(/registerReplay|repeatCurrent/);
  });
});
