// ─────────────────────────────────────────────────────────────
// MIC-GRANT RECORD — single source (P0, Isj 2026-07-25).
// voiceController.micGranted() gates the ENTIRE listen loop on
// localStorage "mic_permission_granted" === "true". PAGE 5 found the
// browser-pre-granted short-circuit (tutorial आवाज़ slide) never wrote it —
// a pre-granted pandit exited onboarding with voice input dead. Every
// granted/denied classification now routes through THESE two writers
// (no surface may call localStorage.setItem on the key directly —
// micGrantRecord.test.tsx pins that), and the mount reconciler repairs
// users already affected before the fix.
// ─────────────────────────────────────────────────────────────

export const MIC_GRANTED_KEY = "mic_permission_granted";

/** THE writer for a granted classification — every path lands here. */
export function recordMicGranted(): void {
  try {
    localStorage.setItem(MIC_GRANTED_KEY, "true");
  } catch { /* storage unavailable — the query hint still works this session */ }
}

/** THE writer for a denied classification. */
export function recordMicDenied(): void {
  try {
    localStorage.setItem(MIC_GRANTED_KEY, "false");
  } catch { /* noop */ }
}

/**
 * Mount reconciler for already-affected users: the browser says granted
 * but the record is ABSENT (never written by the short-circuit era) →
 * write it. A recorded "false" is deliberate (user denied) and is NOT
 * overridden here.
 */
export async function reconcileMicGrant(): Promise<boolean> {
  try {
    if (typeof window === "undefined") return false;
    if (localStorage.getItem(MIC_GRANTED_KEY) !== null) return false;
    const status = await navigator.permissions?.query?.({ name: "microphone" as PermissionName });
    if (status?.state === "granted") {
      recordMicGranted();
      return true;
    }
  } catch { /* permissions API unavailable — nothing to reconcile */ }
  return false;
}
