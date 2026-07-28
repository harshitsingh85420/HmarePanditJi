"use client";

import { hi } from "./strings";
import { getToken, clearToken } from "@/lib/safeStorage";
import { voiceController } from "./voiceController";

// L10 — SESSION INTEGRITY. A 401 means the token is dead (expired: the
// 7d JWT outlived by the 30d cookie, or revoked). Route to re-auth
// DETERMINISTICALLY and exactly once — clear the dead token and signal a
// top-level listener to send the pandit to /login?next=<where he was>.
// CRUCIALLY this fires ONLY on 401, never on a 5xx / timeout / network
// error, so a Render cold-start 502 can never eject a pandit holding a
// valid token (the old home screen did exactly that on any /auth/me
// failure). Auth endpoints' own 401s (wrong OTP) are excluded.
let sessionExpiredSignaled = false;
function signalSessionExpired(): void {
  if (sessionExpiredSignaled) return;
  sessionExpiredSignaled = true;
  clearToken();
  try {
    const next = typeof window !== "undefined" ? window.location.pathname + window.location.search : "/";
    window.dispatchEvent(new CustomEvent("hpj-session-expired", { detail: { next } }));
  } catch {
    /* noop */
  }
}

// F2: resolve and FREEZE the API base ONCE. The localhost fallback is
// dev-only — in a deployed build a missing NEXT_PUBLIC_API_URL used to
// silently fall back to http://localhost:3001, which an https page
// blocks as mixed content BEFORE any request leaves the browser
// (err:network in <100ms, zero entries in the network tool — the exact
// live-QA signature). A connect-src CSP miss (middleware.ts) produces
// the SAME signature with a correct base — the controller's
// securitypolicyviolation listener logs 'CSP BLOCK: …' to tell the two
// apart. Deployed-with-empty-base now surfaces loudly instead of
// guessing.
// G1: the server registers everything under /api/v1 (services/api
// constants.ts) while /health lives at the ORIGIN root. The env var is
// an ORIGIN forever — the client owns the prefix: trim trailing
// slashes, append API_PREFIX unless it is already there. A bare
// https://…onrender.com and a full …/api/v1 value now resolve
// identically instead of 404ing every auth call.
export const API_PREFIX = "/api/v1";
const RAW_BASE = (process.env.NEXT_PUBLIC_API_URL || "").trim();
const TRIMMED_BASE = (
  RAW_BASE || (process.env.NODE_ENV === "development" ? "http://localhost:3001" : "")
).replace(/\/+$/, "");
/** Origin (no prefix) — root /health lives here. */
export const API_ORIGIN: string = TRIMMED_BASE.endsWith(API_PREFIX)
  ? TRIMMED_BASE.slice(0, -API_PREFIX.length)
  : TRIMMED_BASE;
/** Prefixed base — every /api/v1 route call goes through this. */
export const API_BASE: string = TRIMMED_BASE === "" ? "" : `${API_ORIGIN}${API_PREFIX}`;
export const API_BASE_MISSING = API_BASE === "";

/**
 * THE ERROR ENVELOPE — one normaliser, because the API speaks three dialects.
 *
 * THE BREAK (census, 2026-07-28): this file read
 *     error: json.error || { message: json.message || hi.common.error }
 * The server's AppError path sends `{ success:false, message:<Hindi>, error:{code} }`
 * — the human-readable message is TOP-LEVEL. Because `json.error` is a truthy
 * object, `||` short-circuited and THREW THE HINDI AWAY, leaving
 * `error.message` undefined and the generic fallback in its place.
 *
 * A pandit hitting the permanent 409 "यह पूजा पहले से जाँच में है" was told
 * "पूजा भेजी नहीं जा सकी — कृपया दोबारा कोशिश कीजिए" and retried forever. That is a
 * direct hit on the persona law: he is told to try again at a wall.
 *
 * The three shapes the API actually sends:
 *   1. { message: "<Hindi>", error: { code } }   AppError / validation
 *   2. { error: "<bare string>" }                89 controller sites
 *   3. { message: "<text>" }                     unexpected-error path
 * normalizeApiError() understands all three. Nothing else may build an
 * ApiResponse error — apiErrorEnvelope.test.ts fails the build if the raw
 * `json.error ||` pattern comes back.
 */
export function normalizeApiError(
  json: { message?: unknown; error?: unknown },
  fallback: string,
): { code?: string; message: string } {
  const err = json?.error;
  // shape 2 — the controllers that send a bare string
  if (typeof err === "string" && err.trim()) return { message: err };
  const obj = (err && typeof err === "object" ? err : {}) as { code?: string; message?: unknown };
  // the human message may live on error.message OR top-level message; prefer
  // whichever is actually present rather than short-circuiting on the object
  const message =
    (typeof obj.message === "string" && obj.message.trim() && obj.message) ||
    (typeof json?.message === "string" && json.message.trim() && json.message) ||
    fallback;
  return obj.code ? { code: obj.code, message: String(message) } : { message: String(message) };
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  /** Always built by normalizeApiError — never hand-assembled. */
  error?: {
    code?: string;
    message: string;
  };
  /** HTTP status on failure — lets callers distinguish 401 (re-auth) from
   *  5xx/timeout (retry), instead of force-logging-out on any failure. */
  status?: number;
}

export async function api<T = any>(
  path: string,
  options: RequestInit & { timeoutMs?: number } = {}
): Promise<ApiResponse<T>> {
  if (API_BASE_MISSING) {
    voiceController.debug("API BASE MISSING");
    return {
      success: false,
      error: { code: "config", message: hi.errors.apiBaseMissing },
    };
  }
  const { timeoutMs, ...fetchOptions } = options;
  const token = getToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const url = `${API_BASE}${path}`;
  // F2: every auth request logs its FULL final url — the panel must show
  // exactly what the browser was asked to fetch, not a relative path.
  if (path.startsWith("/auth")) {
    voiceController.debug(`api→ ${options.method || "GET"} ${url}`);
  }

  // D1: Render cold starts exceed 60s — auth calls pass timeoutMs: 75000
  // so the request outlives the wake-up instead of dying silently.
  const ctrl = timeoutMs ? new AbortController() : null;
  const timer = ctrl ? setTimeout(() => ctrl.abort(), timeoutMs) : null;
  try {
    const res = await fetch(url, {
      ...fetchOptions,
      headers,
      ...(ctrl ? { signal: ctrl.signal } : {}),
    });

    const json = await res.json();
    if (!res.ok) {
      // L10: 401 → dead session → deterministic re-auth (once). NOT on 5xx.
      if (res.status === 401 && !path.startsWith("/auth")) {
        signalSessionExpired();
      }
      return {
        success: false,
        // was: json.error || { message: json.message || … } — the `||`
        // short-circuited on the truthy {code} object and discarded the
        // server's Hindi. See normalizeApiError above.
        error: normalizeApiError(json, hi.common.error),
        status: res.status,
      };
    }

    return {
      success: true,
      data: json.data,
    };
  } catch (err: any) {
    const aborted = err?.name === "AbortError";
    // F2: err:network alone diagnoses nothing — record the real error
    // name+message against the full url it happened on.
    voiceController.debug(`api ✗ ${url} → ${err?.name || "?"}: ${err?.message || err}`);
    return {
      success: false,
      error: {
        code: aborted ? "timeout" : "network",
        // Walk पP0 #5: NEVER surface err.message — it is English ("Failed to
        // fetch") and lands on money/Aadhaar steps. The real error name+message
        // is already recorded above via voiceController.debug for diagnostics.
        message: aborted ? hi.auth.slowServer : hi.errors.network,
      },
    };
  } finally {
    if (timer) clearTimeout(timer);
  }
}

// F2b: reachability verdict for the debug panel — one ping per page load
// when ?voicedebug=1 is active. A status (even 404) proves the request
// left the browser and came back; an error name means it never did.
let pinged = false;
export async function pingApiHealth(): Promise<void> {
  if (pinged) return;
  pinged = true;
  voiceController.debug(`navigator.onLine=${typeof navigator !== "undefined" ? navigator.onLine : "?"}`);
  if (API_BASE_MISSING) {
    voiceController.debug("API BASE MISSING");
    return;
  }
  const started = performance.now();
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 8000);
  // G1: /health lives at the ORIGIN root, not under /api/v1
  const healthUrl = `${API_ORIGIN}/health`;
  try {
    const res = await fetch(healthUrl, { signal: ctrl.signal });
    voiceController.debug(
      `api ping: ${healthUrl} → ${res.status} in ${Math.round(performance.now() - started)}ms`,
    );
  } catch (err: any) {
    voiceController.debug(
      `api ping: ${healthUrl} → ${err?.name || "?"} in ${Math.round(performance.now() - started)}ms`,
    );
  } finally {
    clearTimeout(timer);
  }
}
