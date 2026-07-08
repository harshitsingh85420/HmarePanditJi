"use client";

// ─────────────────────────────────────────────────────────────
// X3 — STALE-DRAFT PURGE. Logout / account-switch / forced 401
// logout must wipe every trace of the previous user so the next
// account starts with ZERO defaults ("name never prefilled").
//
// WIPED (user-scoped):
//   localStorage  pandit_token             auth token
//   localStorage  onboarding_draft         old 7-step wizard draft (legacy)
//   localStorage  hpj-registration         registration store (phone/otp/name)
//   localStorage  hpj-navigation           navigation history
//   localStorage  hpj_pandit_onboarding_v1 legacy onboarding persistence
//   localStorage  hpj-onboarding-cache-v1  legacy onboarding cache
//   localStorage  lastSeenPaidAt           earnings watermark
//   localStorage  tip_seen_*               coach-tip one-shots (per account UX)
//   sessionStorage hpj_returning_incomplete / hpj_lang_return
//   cookie        hpj_token                middleware auth cookie
//   + in-memory zustand resets (persist would re-write them otherwise)
//
// PRESERVED (install-scoped — the entry phases run once per INSTALL,
// not once per account): the 'hpj-onboarding' store (languageConfirmed,
// tutorialCompleted, detectedCity — the city-from-detection prefill
// exception — mic/tutorial flags), 'mic_permission_granted',
// 'voice_master'/'voice_enabled'/'voice_input_enabled', 'sound_enabled',
// 'language-preference', 'hpj_preferred_language'.
// Its PHASE is pointed back at AUTH so the machine never resumes into
// another user's registration.
// ─────────────────────────────────────────────────────────────

import { useOnboardingStore } from "@/stores/onboardingStore";
import { useRegistrationStore } from "@/stores/registrationStore";
import { useNavigationStore } from "@/stores/navigationStore";

const USER_KEYS = [
  "pandit_token",
  "onboarding_draft",
  "hpj-registration",
  "hpj-navigation",
  "hpj_pandit_onboarding_v1",
  "hpj-onboarding-cache-v1",
  "lastSeenPaidAt",
];

const USER_KEY_PREFIXES = ["tip_seen_"];

const SESSION_KEYS = ["hpj_returning_incomplete", "hpj_lang_return"];

/** Returns the list of cleared keys (for logging/verification). */
export function purgeUserData(): string[] {
  if (typeof window === "undefined") return [];
  const cleared: string[] = [];

  // Reset in-memory zustand FIRST — their persist middleware re-writes the
  // storage key on every set(), so resets must land before the removeItem
  // sweep or the keys reappear (with defaults) right after being cleared.
  try {
    useRegistrationStore.getState().reset();
    useNavigationStore.getState().clearHistory();
    // install-level flags stay; only the machine's position is user-scoped
    useOnboardingStore.getState().setPhase("AUTH");
  } catch {
    /* noop */
  }

  try {
    // enumerate first — removing while iterating shifts indices
    const allKeys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k) allKeys.push(k);
    }
    for (const k of allKeys) {
      if (USER_KEYS.includes(k) || USER_KEY_PREFIXES.some((p) => k.startsWith(p))) {
        localStorage.removeItem(k);
        cleared.push(k);
      }
    }
  } catch {
    /* noop */
  }

  try {
    for (const k of SESSION_KEYS) {
      if (sessionStorage.getItem(k) !== null) {
        sessionStorage.removeItem(k);
        cleared.push(`session:${k}`);
      }
    }
  } catch {
    /* noop */
  }

  // middleware gates on this cookie — clear it on EVERY logout path
  try {
    document.cookie = "hpj_token=; Max-Age=0; path=/";
    cleared.push("cookie:hpj_token");
  } catch {
    /* noop */
  }

  return cleared;
}

export default purgeUserData;
