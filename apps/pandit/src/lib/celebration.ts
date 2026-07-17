"use client";

// ─────────────────────────────────────────────────────────────
// Celebration moments (boring-pass E). Two helpers:
//   • celebrationLine() — the completion narration, ROTATED through a set
//     of warm lines so a पूजा-संपन्न never feels canned. Deterministic
//     (a localStorage counter, never Math.random) so it stays SSR-safe.
//   • ringBellAfterSpeech() — the temple bell as a BLESSING: it rings
//     AFTER शिष्य finishes his line, never over it (a bell over speech is a
//     glitch; a bell after it is a blessing). SFX only — WebAudio via
//     playBell, entirely separate from the TTS pipeline, so the one-voice
//     law is untouched; playBell already honours the sound_enabled toggle.
// ─────────────────────────────────────────────────────────────

import { hi } from "./strings";
import { playBell } from "./sounds";
import { voiceController } from "./voiceController";

const ROTATION_KEY = "hpj_celebration_i";

/** One warm completion line, rotating deterministically across visits. */
export function celebrationLine(): string {
  const lines = hi.celebration.completeLines;
  let n = 0;
  try {
    n = parseInt(localStorage.getItem(ROTATION_KEY) || "0", 10) || 0;
  } catch {
    /* localStorage blocked — fall back to the first line */
  }
  const line = lines[((n % lines.length) + lines.length) % lines.length];
  try {
    localStorage.setItem(ROTATION_KEY, String(n + 1));
  } catch {
    /* noop */
  }
  return line;
}

/**
 * Ring the temple bell once शिष्य is NOT speaking — deferring while he is
 * mid-utterance and ringing the moment his line ends. If no line is playing
 * (a short grace), it rings immediately; a failsafe guarantees it never
 * waits forever. Reads voiceController state, never writes it.
 */
export function ringBellAfterSpeech(): void {
  if (typeof window === "undefined") return;

  let sawSpeaking = voiceController.speaking;
  let done = false;
  let unsub: () => void = () => {};

  const finish = () => {
    if (done) return;
    done = true;
    try {
      unsub();
    } catch {
      /* noop */
    }
    clearTimeout(graceTimer);
    clearTimeout(failsafe);
    playBell();
  };

  // Timers initialized BEFORE the subscription registers, so no finish() call
  // site can run before they exist (finish only fires from the subscription
  // or the timers themselves).
  // No line started within the grace window → ring now (nothing to defer to).
  const graceTimer = setTimeout(() => {
    if (!done && !sawSpeaking && !voiceController.speaking) finish();
  }, 600);

  // Never hang on a stuck speaking flag.
  const failsafe = setTimeout(finish, 12000);

  unsub = voiceController.subscribe(() => {
    if (done) return;
    if (voiceController.speaking) {
      sawSpeaking = true;
      return;
    }
    // speaking just went false AND we saw a line play → blessing time
    if (sawSpeaking) finish();
  });
}
