"use client";

// ─────────────────────────────────────────────────────────────
// L8 — STORAGE-SAFE AUTH. Raw localStorage THROWS in real environments:
// Safari "block all cookies", a DOM-storage-disabled Android WebView,
// enterprise-locked devices, private mode. When the auth-token read did
// that, api() rejected and every unwrapped `await api()` died — the
// splash veil froze, or the pandit sat on the OTP screen with a correct
// code and zero feedback (a dead front door). LAW: all token access —
// and any storage a boot/auth path depends on — funnels through here,
// which try/catches, returns a safe sentinel, and states the loss ONCE
// so the app stays fully touch-operable instead of hanging.
// The guard (safeStorage.test.ts) fails the build if the token is ever
// touched via raw localStorage, or if api.ts reads storage directly.
// ─────────────────────────────────────────────────────────────

const TOKEN_KEY = "pandit_token";
let blockedAnnounced = false;

function announceBlockedOnce(): void {
  if (blockedAnnounced) return;
  blockedAnnounced = true;
  try {
    window.dispatchEvent(new CustomEvent("hpj-storage-blocked"));
  } catch {
    /* even dispatch can be unavailable — nothing more we can do */
  }
}

/** True once a storage operation has thrown this session. */
export function isStorageBlocked(): boolean {
  return blockedAnnounced;
}

/** Read a key; returns null on any storage failure (never throws). */
export function safeGet(key: string): string | null {
  try {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(key);
  } catch {
    announceBlockedOnce();
    return null;
  }
}

/** Write a key; returns false on any storage failure (never throws). */
export function safeSet(key: string, value: string): boolean {
  try {
    if (typeof window === "undefined") return false;
    window.localStorage.setItem(key, value);
    return true;
  } catch {
    announceBlockedOnce();
    return false;
  }
}

/** Remove a key; swallows any storage failure (never throws). */
export function safeRemove(key: string): void {
  try {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(key);
  } catch {
    announceBlockedOnce();
  }
}

// ── the auth token: the one value every request + boot gate depends on ──
export function getToken(): string | null {
  return safeGet(TOKEN_KEY);
}
export function setToken(token: string): boolean {
  return safeSet(TOKEN_KEY, token);
}
export function clearToken(): void {
  safeRemove(TOKEN_KEY);
}
