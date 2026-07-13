// ─────────────────────────────────────────────────────────────
// U1 — THE ONE-VOICE LAW. शिष्य has exactly ONE voice and ONE speed,
// everywhere, always. This file is the single source of truth; no
// other file may hardcode speaker or pace (voiceProfile.test.ts
// grep-enforces it). The /api/tts route and the client both consume
// this; env vars may still override on the server for ops emergencies,
// but the per-utterance 'voice:' telemetry line exposes any divergence
// the moment it happens.
//
// FALLBACK_POLICY (U1b): the robot voice (speechSynthesis) is DEMOTED
// to total-outage mode. Once Sarvam has succeeded even once in a
// session, a Sarvam failure means: retry ×2 (500ms, 1500ms) → still
// failing → SILENT (text remains on screen) + one "आवाज़ में रुकावट
// है" toast + a panel line. speechSynthesis may speak ONLY when Sarvam
// has NEVER succeeded this session (true outage / keyless dev). The
// founder's phone must never hear the voice change mid-session.
// ─────────────────────────────────────────────────────────────

export const VOICE_PROFILE = {
  speaker: "aditya", // Sarvam bulbul:v3 male — शिष्य's one voice
  pace: 1.15, // brisk but clear for elderly Hindi ears
} as const;

// Y4/Z1: bump when the voice or pace changes so the client audio cache
// key changes with it — a legacy entry can never replay the old voice OR
// a stale pace. Bumped 2→3 with the Z1 pace law (server pace is now
// strictly VOICE_PROFILE.pace, no env drift) to flush any cached blob
// that was synthesized at a drifted pace.
export const VOICE_PROFILE_VERSION = 3 as const;

export const FALLBACK_POLICY = "sarvam-retry2-then-silent; webspeech only if sarvam never succeeded this session" as const;
