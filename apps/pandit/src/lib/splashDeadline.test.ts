import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// ─────────────────────────────────────────────────────────────
// D0-L SPLASH DEADLINE LAW — BUILD-FAILING GUARD.
//
// THE INVARIANT: the front door always lets the pandit in. No phase
// transition on the splash may be gated on a voice outcome — voice may
// bring the advance FORWARD, never hold it back.
//
// WHY THIS EXISTS (the live bug it kills): a fresh load CANNOT play
// audio until the first gesture (Chrome/Safari autoplay policy), so both
// splash speakAndWait() calls returned 'parked' and the component took
// its parked branch — which waited for a tap INDEFINITELY. The founder's
// incognito window sat on the splash forever and never reached the
// rebuilt 6-scene tutorial four phases behind it. The post-tap flush
// failsafe had the mirror defect: on seeing a flush in flight it
// deferred and returned WITHOUT re-arming, so a lost playback-end event
// stranded the splash forever too — on exactly the machines where audio
// WORKS, which is why it never reproduced in a headless pane.
//
// ENFORCEMENT: SunriseSplash arms two mount-time deadlines that live
// outside every voice/park/tap branch and are cleared only on unmount.
// A future edit that deletes them, makes them conditional, or lets them
// drift to infinity fails the build here.
// ─────────────────────────────────────────────────────────────

const SPLASH = join(__dirname, "..", "components", "moments", "SunriseSplash.tsx");
const src = readFileSync(SPLASH, "utf8");

// the effect body: everything from the mount effect to its cleanup
const effect = src.slice(src.indexOf("useEffect(() => {"));

// Comments are PROSE, not code. This file's comments discuss speakAndWait
// at length, and an offset check against raw text matches the word in a
// comment instead of the call — the same false-positive that has bitten
// the dialableTel and oneVoiceOwner guards. Order assertions run against
// code only.
const stripComments = (s: string) =>
  s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/[^\n]*/g, "$1");
const effectCode = stripComments(effect);

describe("D0-L splash deadline law", () => {
  it("declares both deadlines as finite module-level constants", () => {
    const noPlayback = /export const SPLASH_NO_PLAYBACK_MS = ([\d_]+)/.exec(src);
    const absolute = /export const SPLASH_ABSOLUTE_MS = ([\d_]+)/.exec(src);
    expect(noPlayback, "SPLASH_NO_PLAYBACK_MS must exist").toBeTruthy();
    expect(absolute, "SPLASH_ABSOLUTE_MS must exist").toBeTruthy();

    const ms = (m: RegExpExecArray) => Number(m[1].replace(/_/g, ""));
    // finite, and bounded by human patience — an unbounded front door is
    // the defect this law exists to prevent
    expect(ms(noPlayback!)).toBeGreaterThan(2600); // must outlast minDisplay
    expect(ms(noPlayback!)).toBeLessThanOrEqual(15_000);
    expect(ms(absolute!)).toBeGreaterThan(ms(noPlayback!));
    expect(ms(absolute!)).toBeLessThanOrEqual(60_000);
  });

  it("arms both deadlines unconditionally on mount", () => {
    expect(effect).toMatch(/setTimeout\([\s\S]{0,800}?SPLASH_NO_PLAYBACK_MS\)/);
    expect(effect).toMatch(/setTimeout\([\s\S]{0,800}?SPLASH_ABSOLUTE_MS\)/);
  });

  it("clears both deadlines on unmount (no timer outlives the screen)", () => {
    const cleanup = effect.slice(effect.lastIndexOf("return () => {"));
    expect(cleanup).toMatch(/clearTimeout\(noPlaybackDeadline\)/);
    expect(cleanup).toMatch(/clearTimeout\(absoluteDeadline\)/);
  });

  it("arms the deadlines BEFORE the first speak attempt — voice can never preempt them", () => {
    const armedAt = effectCode.indexOf("SPLASH_NO_PLAYBACK_MS");
    const firstSpeak = effectCode.indexOf("speakAndWait");
    expect(armedAt).toBeGreaterThan(-1);
    expect(firstSpeak).toBeGreaterThan(-1);
    expect(
      armedAt,
      "deadlines must be armed before any speakAndWait — otherwise a hanging " +
        "await parks the front door before the guard timer ever exists",
    ).toBeLessThan(firstSpeak);
  });

  it("keeps the absolute backstop free of any voice condition", () => {
    // the no-playback timer MAY consult playback state (it must not behead
    // शिष्य mid-line); the absolute backstop MAY NOT — it is the last resort
    // when a playback-end event is lost, which is precisely when voice state
    // is untrustworthy.
    const start = effect.indexOf("const absoluteDeadline");
    const body = effect.slice(start, effect.indexOf("SPLASH_ABSOLUTE_MS", start));
    expect(body).not.toMatch(/voiceController\.speaking|everPlayed|status ===|parkedRef/);
    expect(body).toMatch(/finish\(\)/);
  });
});
