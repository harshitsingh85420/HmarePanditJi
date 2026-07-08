"use client";

// ─────────────────────────────────────────────────────────────
// i18n runtime — t(key) over the Hindi source-of-truth `hi` object
// plus an ACTIVE translated bundle fetched from POST /voice/translate
// (Sarvam Mayura, server-side key, Redis-cached).
//
//   • hi (strings.ts) stays the single source of keys and copy
//   • bundle: flat { "section.key": "translated" } for the active
//     language, persisted in localStorage `lang_bundle_<code>` so a
//     reload restores it instantly (then refreshes in background)
//   • ENTRY_GROUPS are fetched BLOCKING on language pick (spinner);
//     every other section streams in lazily — until a key arrives,
//     t() falls back to Hindi (never blank)
//   • numbers/₹ formatting stays en-IN everywhere — this module only
//     substitutes copy, never formats values
// ─────────────────────────────────────────────────────────────

import { hi } from "@/lib/strings";
import { api } from "@/lib/api";
import { LANG_TO_BCP47, type LangCode } from "@/lib/languageDetect";

const LANG_KEY = "hpj_lang_code";
const BUNDLE_PREFIX = "lang_bundle_";
const CHUNK_SIZE = 100;

/** Sections needed before the app may switch language (blocking fetch). */
export const ENTRY_GROUPS: readonly string[] = [
  "voice", "shishya", "coach", "pratham", "entry", "voiceLoop", "nav",
  "common", "welcome", "auth", "tutorial", "language", "permissions",
  "registration",
];

type Dict = Record<string, string>;

let activeLang: LangCode = "hi";
let bundle: Dict = {};
let version = 0;
let initialized = false;
const listeners = new Set<() => void>();

function emit(): void {
  version++;
  listeners.forEach((cb) => cb());
}

function init(): void {
  if (initialized || typeof window === "undefined") return;
  initialized = true;
  try {
    const stored = localStorage.getItem(LANG_KEY) as LangCode | null;
    if (stored && stored !== "hi" && LANG_TO_BCP47[stored]) {
      const raw = localStorage.getItem(BUNDLE_PREFIX + stored);
      if (raw) {
        bundle = JSON.parse(raw) as Dict;
        activeLang = stored;
      }
    }
  } catch {
    activeLang = "hi";
    bundle = {};
  }
}

function resolveHi(key: string): string | undefined {
  let node: unknown = hi;
  for (const part of key.split(".")) {
    if (node && typeof node === "object" && part in (node as Record<string, unknown>)) {
      node = (node as Record<string, unknown>)[part];
    } else {
      return undefined;
    }
  }
  return typeof node === "string" ? node : undefined;
}

/**
 * Translate a dotted key. Active-language bundle first, Hindi source
 * as the guaranteed fallback — a missing key never renders blank.
 */
export function t(key: string): string {
  init();
  if (activeLang !== "hi") {
    const hit = bundle[key];
    if (hit) return hit;
  }
  return resolveHi(key) ?? key;
}

export function getActiveLang(): LangCode {
  init();
  return activeLang;
}

/** BCP-47 tag of the active language — for /api/tts and speechSynthesis. */
export function getActiveBcp47(): string {
  init();
  return LANG_TO_BCP47[activeLang] ?? "hi-IN";
}

/** Subscribe to language/bundle changes (useSyncExternalStore-compatible). */
export function subscribeI18n(cb: () => void): () => void {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

export function getI18nVersion(): number {
  return version;
}

// ── bundle building ──────────────────────────────────────────

function flattenGroup(group: string): Array<{ key: string; text: string }> {
  const root = (hi as Record<string, unknown>)[group];
  if (!root || typeof root !== "object") return [];
  const out: Array<{ key: string; text: string }> = [];
  const walk = (node: Record<string, unknown>, prefix: string) => {
    for (const [k, v] of Object.entries(node)) {
      if (typeof v === "string") out.push({ key: `${prefix}.${k}`, text: v });
      else if (v && typeof v === "object") walk(v as Record<string, unknown>, `${prefix}.${k}`);
    }
  };
  walk(root as Record<string, unknown>, group);
  return out;
}

function lazyGroups(): string[] {
  return Object.keys(hi).filter((g) => !ENTRY_GROUPS.includes(g));
}

function persistBundle(code: LangCode): void {
  try {
    localStorage.setItem(BUNDLE_PREFIX + code, JSON.stringify(bundle));
  } catch {
    /* quota — bundle stays in memory for this session */
  }
}

async function fetchGroups(code: LangCode, groups: readonly string[]): Promise<Dict> {
  const entries = groups.flatMap(flattenGroup);
  const merged: Dict = {};
  for (let i = 0; i < entries.length; i += CHUNK_SIZE) {
    const chunk = entries.slice(i, i + CHUNK_SIZE);
    const res = await api<{ translations: string[] }>("/voice/translate", {
      method: "POST",
      body: JSON.stringify({ texts: chunk.map((e) => e.text), target: code }),
    });
    if (!res.success || !res.data || res.data.translations.length !== chunk.length) {
      throw new Error(res.error?.code || "translate_failed");
    }
    chunk.forEach((e, j) => {
      merged[e.key] = res.data!.translations[j];
    });
  }
  return merged;
}

let lazyFetchRunning = false;

function fetchLazyGroupsInBackground(code: LangCode): void {
  if (lazyFetchRunning) return;
  lazyFetchRunning = true;
  void (async () => {
    // batches of groups (not one request per group — the endpoint is
    // rate-limited) so partial progress lands early; failures are quiet —
    // t() keeps falling back to Hindi for the missing keys
    const groups = lazyGroups();
    const GROUPS_PER_FETCH = 5;
    for (let i = 0; i < groups.length; i += GROUPS_PER_FETCH) {
      if (activeLang !== code) break; // language changed mid-flight
      try {
        const part = await fetchGroups(code, groups.slice(i, i + GROUPS_PER_FETCH));
        Object.assign(bundle, part);
        persistBundle(code);
        emit();
      } catch {
        /* keep Hindi fallback for these groups */
      }
    }
    lazyFetchRunning = false;
  })();
}

/**
 * Switch the app to `code`. Blocks on the ENTRY_GROUPS translations
 * (caller shows the DiyaLoader with the language's own waitLine).
 * Returns false when translation is unavailable — the caller speaks the
 * honesty notice and the app continues in Hindi.
 */
export async function activateLanguage(code: LangCode): Promise<boolean> {
  init();
  if (code === "hi") {
    activeLang = "hi";
    bundle = {};
    try {
      localStorage.setItem(LANG_KEY, "hi");
    } catch { /* noop */ }
    emit();
    return true;
  }
  try {
    const entryPart = await fetchGroups(code, ENTRY_GROUPS);
    bundle = { ...bundle, ...entryPart };
    activeLang = code;
    try {
      localStorage.setItem(LANG_KEY, code);
    } catch { /* noop */ }
    persistBundle(code);
    emit();
    fetchLazyGroupsInBackground(code);
    return true;
  } catch {
    return false;
  }
}

/**
 * App-load refresh: the persisted bundle is used instantly (init);
 * this re-fetches quietly so copy edits and missing groups catch up.
 */
export function refreshBundleInBackground(): void {
  init();
  if (activeLang === "hi") return;
  const code = activeLang;
  void (async () => {
    try {
      const entryPart = await fetchGroups(code, ENTRY_GROUPS);
      if (activeLang !== code) return;
      bundle = { ...bundle, ...entryPart };
      persistBundle(code);
      emit();
    } catch {
      /* offline / unconfigured — stored bundle keeps serving */
    }
    fetchLazyGroupsInBackground(code);
  })();
}
