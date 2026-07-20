// ─────────────────────────────────────────────────────────────
// F02-07 — THE LISTEN-TIMEOUT FLOOR.
//
// Doc: "Voice listen timeout ≥ 8s; elderly-flagged profiles get 12s
// (edge #3)." A 62-year-old priest needs time to gather the sentence
// before the mic gives up on him; a short window reads as the app
// ignoring him.
//
// This file is the single source of truth for how long a listen may
// run. No live listen path may hardcode its own window
// (listenTimeout.test.ts grep-enforces it).
//
// ── TRUTHFUL-STATE NOTE, READ BEFORE USING THE ELDERLY BRANCH ──
// There is NO elderly flag in this product today. There is no column
// on PanditProfile, no field in any zustand store, no onboarding
// question, and nothing in the API that reports one. The `elderly`
// option below is therefore NEVER set by any live caller:
// listenTimeoutMs() is called with no argument and the 12s branch is
// currently UNREACHABLE at runtime. It exists so that the day the
// product grows a real user attribute, the wiring is one call-site
// away — not so that we can claim the capability now.
//
// (`isElderly` does appear in lib/deepgramSTT.ts, lib/voice-engine.ts
// and lib/hooks/useVoiceCascade.ts — all three are legacy modules with
// no live screen consumers, per lib/oneVoiceOwner.test.ts. They are
// not a flag source; they are dead defaults.)
//
// OPEN QUESTION FOR THE FOUNDER: the whole persona IS elderly. If the
// answer is "every pandit is the elderly case", the honest fix is to
// make 12000 the single value and delete the branch entirely. That is
// a product call, not an engineering one, so it is not made here.
// ─────────────────────────────────────────────────────────────

/** The floor for every listen window. The doc's "≥ 8s". */
export const NORMAL_LISTEN_MS = 8000;

/** The floor for a listener flagged elderly. The doc's "12s". */
export const ELDERLY_LISTEN_MS = 12000;

export interface ListenTimeoutOpts {
  /** No live caller sets this — see the truthful-state note above. */
  elderly?: boolean;
}

/**
 * How long a listen must be allowed to run, at minimum.
 *
 * Callers treat the result as a FLOOR, not as the window itself: a
 * dictation field that already listens longer keeps its longer window.
 */
export function listenTimeoutMs(opts?: ListenTimeoutOpts): number {
  return opts?.elderly ? ELDERLY_LISTEN_MS : NORMAL_LISTEN_MS;
}
