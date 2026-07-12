import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { VOICE_PROFILE } from "./voiceProfile";

// U1 ONE-VOICE LAW, grep-enforced: no file but voiceProfile.ts may
// hardcode शिष्य's speaker or pace. This test FAILS on divergence.
const SRC = join(__dirname, "..");
const read = (rel: string) => readFileSync(join(SRC, rel), "utf-8");

describe("voiceProfile - one-voice law", () => {
  it("profile is the canonical aditya @ 1.15", () => {
    expect(VOICE_PROFILE.speaker).toBe("aditya");
    expect(VOICE_PROFILE.pace).toBe(1.15);
  });

  it("client pace comes ONLY from the profile (no localStorage knob, no literal)", () => {
    const src = read("lib/sarvam-tts.ts");
    expect(src).toContain("VOICE_PROFILE.pace");
    expect(src).not.toContain('localStorage.getItem("voice_pace")');
  });

  it("/api/tts defaults come from the profile, not literals", () => {
    const src = read("app/api/tts/route.ts");
    expect(src).toContain("VOICE_PROFILE.speaker");
    expect(src).toContain("VOICE_PROFILE.pace");
    // no bare hardcoded speaker default left behind
    expect(src).not.toMatch(/\?\?\s*'aditya'/);
    expect(src).not.toMatch(/\?\?\s*'1\.15'/);
  });

  it("/api/tts testifies its ground truth via the x-voice header", () => {
    expect(read("app/api/tts/route.ts")).toContain("x-voice");
  });

  it("controller telemetry line exists (the founder's-phone testimony)", () => {
    const src = read("lib/voiceController.ts");
    expect(src).toContain("voice: sarvam:");
    expect(src).toContain("voice: webspeech:");
    expect(src).toContain("voice: silent(");
  });

  it("services/api voice route pace default matches the profile (sync contract)", () => {
    const apiSrc = readFileSync(
      join(SRC, "..", "..", "..", "services", "api", "src", "routes", "voice.routes.ts"),
      "utf-8",
    );
    const m = apiSrc.match(/SARVAM_TTS_PACE \?\? "([\d.]+)"/);
    expect(m, "api voice route env-pace default present").toBeTruthy();
    expect(Number(m![1])).toBe(VOICE_PROFILE.pace);
  });
});
