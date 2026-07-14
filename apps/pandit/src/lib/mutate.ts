"use client";

import { api, type ApiResponse } from "@/lib/api";

// ─────────────────────────────────────────────────────────────
// L1 — EXACTLY-ONCE ACTIONS. THE single client enforcement point for
// every state-changing call (booking accept/reject/complete, readiness
// save, dakshina edit, uploads). Two guarantees:
//
//   1) SINGLE IN-FLIGHT per actionKey — a second call with the same key
//      while the first is pending returns the SAME promise. Double-tap,
//      voice-command-plus-tap, and impatient triple-taps can never fire
//      two network requests.
//   2) IDEMPOTENCY-KEY header — stable per action identity (e.g.
//      "accept:<bookingId>") so a user-initiated RETRY after a lost
//      response reuses the key; the server dedupes (or the action is
//      an atomic state transition that is naturally idempotent).
//
// A raw api() POST that changes server state MUST go through here. The
// mutate-idempotency guard test greps for direct api() mutations on the
// money paths and FAILS the build if one bypasses this wrapper.
// ─────────────────────────────────────────────────────────────

const inFlight = new Map<string, Promise<unknown>>();

export interface MutateOptions extends RequestInit {
  timeoutMs?: number;
}

/**
 * Generic single-in-flight dedupe for ANY state-changing async action —
 * including ones that cannot go through api() (e.g. a multipart FormData
 * upload, which api() would break by forcing Content-Type: application/json).
 * A second call with the same key while the first is pending returns the
 * SAME promise, so a double-tap / voice+tap can never fire twice.
 */
export function once<T>(actionKey: string, fn: () => Promise<T>): Promise<T> {
  const existing = inFlight.get(actionKey);
  if (existing) return existing as Promise<T>;
  const p = Promise.resolve()
    .then(fn)
    .finally(() => {
      inFlight.delete(actionKey);
    });
  inFlight.set(actionKey, p);
  return p;
}

/**
 * Run a state-changing request exactly once.
 * @param actionKey stable identity of the intent, e.g. `accept:${bookingId}`.
 *        It is both the in-flight dedupe key AND the Idempotency-Key.
 */
export function mutateOnce<T = unknown>(
  actionKey: string,
  path: string,
  options: MutateOptions = {},
): Promise<ApiResponse<T>> {
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
    "Idempotency-Key": actionKey,
  };
  return once(actionKey, () => api<T>(path, { ...options, headers }));
}

/** True while a mutation with this key is in flight (for UI disabling). */
export function isMutating(actionKey: string): boolean {
  return inFlight.has(actionKey);
}
