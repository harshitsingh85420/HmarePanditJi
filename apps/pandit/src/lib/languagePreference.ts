// ─────────────────────────────────────────────────────────────
// LANGUAGE PREFERENCE — who decides what language the app speaks.
//
// THE RULES, in priority order:
//   1. An EXPLICIT choice (settings भाषा row) wins forever. It is never
//      overridden by detection, on this run or any later one.
//   2. Otherwise, detection may set the default ONCE, on first run only,
//      from the state the location step already resolves.
//   3. Otherwise — no choice, no detection, permission denied, unknown
//      state, or a mapped language that is not enabled — हिन्दी.
//
// Two separate keys, deliberately: `chosen` records that a HUMAN decided,
// `detected` records that we guessed. Collapsing them into one key would
// make a guess indistinguishable from a decision, and detection would
// eventually stomp a real choice — the exact bug rule 1 exists to prevent.
// ─────────────────────────────────────────────────────────────

import { DEFAULT_LANGUAGE, isEnabled, languageForState } from "./languages";

const CHOSEN_KEY = "hpj_lang_chosen";     // set ONLY by an explicit pick
const DETECTED_KEY = "hpj_lang_detected"; // set at most once, by detection

const read = (k: string): string | null => {
  try {
    return localStorage.getItem(k);
  } catch {
    return null;
  }
};
const write = (k: string, v: string): void => {
  try {
    localStorage.setItem(k, v);
  } catch {
    /* private mode — the app still runs, just without memory */
  }
};

/** The language the app should render and speak right now. */
export function activeLanguage(): string {
  const chosen = read(CHOSEN_KEY);
  if (chosen && isEnabled(chosen)) return chosen;

  const detected = read(DETECTED_KEY);
  if (detected && isEnabled(detected)) return detected;

  return DEFAULT_LANGUAGE;
}

/** True once a human has picked — detection must never run again after this. */
export function hasExplicitChoice(): boolean {
  const chosen = read(CHOSEN_KEY);
  return !!chosen && isEnabled(chosen);
}

/**
 * Record an explicit human choice. Permanent, and beats detection forever.
 * Ignores languages that are not enabled, so a stale deep link or an old
 * stored value can never select something the app cannot speak.
 */
export function chooseLanguage(code: string): boolean {
  if (!isEnabled(code)) return false;
  write(CHOSEN_KEY, code);
  return true;
}

/**
 * Offer a detected state. Applies ONLY if no explicit choice exists AND
 * detection has not already run — detection gets exactly one chance, so a
 * pandit who travels does not find his app changing language under him.
 * Returns the language now active.
 */
export function applyDetectedState(state: string | null | undefined): string {
  if (hasExplicitChoice()) return activeLanguage();
  if (read(DETECTED_KEY)) return activeLanguage();

  const lang = languageForState(state); // already downgrades to hi when needed
  write(DETECTED_KEY, lang);
  return lang;
}

/** Permission denied / no location at all → Hindi, and detection is spent. */
export function applyNoLocation(): string {
  if (hasExplicitChoice()) return activeLanguage();
  if (!read(DETECTED_KEY)) write(DETECTED_KEY, DEFAULT_LANGUAGE);
  return activeLanguage();
}
