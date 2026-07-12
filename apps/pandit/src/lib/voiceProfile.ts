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

export const FALLBACK_POLICY = "sarvam-retry2-then-silent; webspeech only if sarvam never succeeded this session" as const;
