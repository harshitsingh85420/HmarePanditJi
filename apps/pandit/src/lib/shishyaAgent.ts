"use client";

// ─────────────────────────────────────────────────────────────
// W3 — शिष्य v3 CLIENT: the conversational-agent integration.
// The controller's reflex layers (fields → commands → options →
// global grammar, all <5ms) stay untouched; EVERYTHING they don't
// claim flows here → POST /shishya/agent (Sarvam LLM under the
// fact-guarded tool prompt, strict {say, act} JSON).
//
//   • 6-turn memory ring, client-held (server stays stateless);
//     reset on सो-जाओ/mute and after 10 minutes of silence.
//   • userState snapshot: screens push what they already know
//     (setAgentUserState) — the agent sees what the pandit sees.
//   • kill switch NEXT_PUBLIC_SHISHYA_MODE=reflex-only restores the
//     pre-v3 behavior (curated server /ask for questions only).
// ─────────────────────────────────────────────────────────────

import { api } from "@/lib/api";
import { getActiveLang } from "@/lib/i18n";
import type { ActionCategory } from "@/lib/shishyaPuppet";

export type ShishyaMode = "agent" | "reflex-only";
/** Build-time kill switch — default is the full agent. */
export const SHISHYA_MODE: ShishyaMode =
  process.env.NEXT_PUBLIC_SHISHYA_MODE === "reflex-only" ? "reflex-only" : "agent";

export interface AgentAction {
  id: string;
  label: string;
  hint?: string;
  /** Guide Mode: the action's taxonomy. A money/identity action is a terminal
   *  press the agent may LOCATE (A1) but never complete — buildAgentActions
   *  already omits it from the actable tool list via the ONE shared forbidden
   *  set (shishyaPuppet.isForbiddenCategory). */
  category?: ActionCategory;
}

export interface AgentUserState {
  firstName?: string;
  city?: string;
  readinessStep?: number;
  isBookingReady?: boolean;
  pendingBookingsCount?: number;
  isOnline?: boolean;
}

export interface AgentTurn {
  role: "pandit" | "shishya";
  text: string;
}

export interface AgentResult {
  say?: string;
  act?: string | null;
  source: string;
  ms?: number;
}

const HISTORY_MAX = 6; // messages, matching the server schema cap
const IDLE_RESET_MS = 10 * 60 * 1000;

let history: AgentTurn[] = [];
let lastExchangeAt = 0;
let userState: AgentUserState = {};

// panel-line sink — the controller wires its debug() in at init so
// history resets show up in the voicedebug panel
let debugSink: (line: string) => void = () => {};
export function setAgentDebugSink(fn: (line: string) => void): void {
  debugSink = fn;
}

export function resetAgentHistory(reason: string): void {
  if (history.length) debugSink(`agent: history reset (${reason})`);
  history = [];
  lastExchangeAt = 0;
}

export function getAgentHistory(): readonly AgentTurn[] {
  return history.slice();
}

/** Screens push the state they already render — merged, never fetched. */
export function setAgentUserState(patch: AgentUserState): void {
  userState = { ...userState, ...patch };
}

/**
 * One agent exchange. Applies the 10-minute idle reset, sends the
 * ring + context, and on success appends BOTH turns to the ring.
 * Resolves {source:'miss'} on any failure — never throws.
 */
export async function askShishyaAgent(
  text: string,
  ctx: { screenId?: string; screenHelp?: string; availableActions?: AgentAction[] },
): Promise<AgentResult> {
  const now = Date.now();
  if (lastExchangeAt && now - lastExchangeAt > IDLE_RESET_MS) {
    resetAgentHistory("idle>10min");
  }
  const route = typeof window !== "undefined" ? window.location.pathname : "";
  const res = await api("/shishya/agent", {
    method: "POST",
    body: JSON.stringify({
      text: text.slice(0, 400),
      lang: getActiveLang(),
      route,
      context: {
        screenId: ctx.screenId,
        screenHelp: ctx.screenHelp ? ctx.screenHelp.slice(0, 400) : undefined,
        availableActions: ctx.availableActions,
        userState,
      },
      history: history.slice(-HISTORY_MAX),
    }),
    // server races the LLM at 8s (10s with history) — leave headroom
    timeoutMs: 14000,
  });
  if (res.success && res.data) {
    const d = res.data as AgentResult;
    // Only REAL answers enter the ring — a timeout/miss honest-line is
    // not a conversation turn, and storing it would poison every later
    // exchange (the model reads itself "not knowing") while silently
    // disabling the stateless cache.
    if (d.say && (d.source === "agent" || d.source === "agent-cached")) {
      history.push(
        { role: "pandit", text: text.slice(0, 400) },
        { role: "shishya", text: d.say.slice(0, 400) },
      );
      if (history.length > HISTORY_MAX) history = history.slice(-HISTORY_MAX);
      lastExchangeAt = now;
    }
    return d;
  }
  return { source: "miss" };
}

// QA/founder debugging: read-only peek at the ring + mode from the
// console (same spirit as window.__hpjVoice)
try {
  if (typeof window !== "undefined") {
    (window as unknown as Record<string, unknown>).__hpjShishyaAgent = {
      mode: SHISHYA_MODE,
      getHistory: getAgentHistory,
      reset: resetAgentHistory,
    };
  }
} catch {
  /* noop */
}
