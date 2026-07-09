"use client";

// A1 — permanent on-device voice diagnostics (?voicedebug=1).
// Phones have no console: voiceController writes every speak → route →
// status → play/fallback/voice decision into a ring buffer this panel
// renders. Flag-gated (zero UI without it) and session-sticky so SPA
// navigation keeps the panel alive while walking the flow.
//
// F3: the panel must NEVER eat the app's clicks. The container is
// pointer-events-none; only the chip / header controls re-enable them.
// Default is a collapsed 56px chip bottom-right; the expanded sheet sits
// ABOVE the footer-CTA zone and caps at 40vh.

import React, { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { voiceController } from "@/lib/voiceController";
import { API_BASE, API_BASE_MISSING, pingApiHealth } from "@/lib/api";

const FLAG_KEY = "hpj_voicedebug";

// Captured at module-eval — BEFORE any router.replace / dev reload can
// strip the query string (the mount effect can run after a redirect).
const INITIAL_SEARCH = typeof window !== "undefined" ? window.location.search : "";

function readFlag(search: string): void {
  try {
    const q = new URLSearchParams(search);
    if (q.get("voicedebug") === "1") sessionStorage.setItem(FLAG_KEY, "1");
    // dev diagnostics: expose the controller for on-device probing
    // (prefetch/cache tests from the console) while the panel is active
    if (sessionStorage.getItem(FLAG_KEY) === "1") {
      (window as unknown as { __hpjVoice?: unknown }).__hpjVoice = voiceController;
    }
    if (q.get("voicedebug") === "0") sessionStorage.removeItem(FLAG_KEY);
  } catch {
    /* noop */
  }
}

export function useVoiceDebugFlag(): boolean {
  const [on, setOn] = useState(false);
  useEffect(() => {
    try {
      readFlag(INITIAL_SEARCH);
      readFlag(window.location.search);
      setOn(sessionStorage.getItem(FLAG_KEY) === "1");
    } catch {
      setOn(false);
    }
  }, []);
  return on;
}

export function VoiceDebugPanel() {
  const lines = useSyncExternalStore(
    voiceController.subscribeDebug,
    voiceController.getDebugLines,
    voiceController.getDebugLines,
  );
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    boxRef.current?.scrollTo({ top: boxRef.current.scrollHeight });
  }, [lines, open]);

  // F2b: one reachability verdict per page load, straight into the log
  useEffect(() => {
    void pingApiHealth();
  }, []);

  return (
    <div className="fixed inset-0 z-[90] pointer-events-none" aria-hidden="true">
      {open ? (
        // TOP-anchored: footer variants differ in height (Parichay's
        // mic-deny recovery stack is ~180px tall), so no bottom anchor is
        // safely "above the footer zone" — the top edge always is.
        <div className="absolute inset-x-0 top-0 max-h-[40vh] flex flex-col bg-black/85 text-green-200 font-mono text-[11px] leading-[1.5] pointer-events-auto">
          <div className="flex items-center gap-2 px-2 py-1 bg-black/85 text-green-400 font-bold shrink-0">
            <span className="flex-1 truncate">
              🔊 voicedebug ({lines.length})
              {voiceController.e2e ? " · ⚙E2E" : ""}
              {" · api: "}
              {API_BASE_MISSING ? "MISSING" : API_BASE}
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="px-3 py-1 text-green-300 border border-green-700 rounded"
            >
              ✕
            </button>
          </div>
          <div ref={boxRef} className="overflow-y-auto px-2 pb-1">
            {lines.map((line, i) => (
              <div key={i} className="whitespace-pre-wrap break-all">{line}</div>
            ))}
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          // bottom-40 (160px): clears the footer-CTA zone (0-96px), the
          // Toast / home error-banner band (96-158px) and the orb's
          // "सुन रहा हूँ…" listening pill (~106-136px).
          className="absolute bottom-40 right-3 w-14 h-14 rounded-full bg-black/80 text-green-300 font-mono text-[12px] leading-tight pointer-events-auto shadow-card flex flex-col items-center justify-center"
        >
          <span>🐞</span>
          <span>{lines.length}</span>
        </button>
      )}
    </div>
  );
}

export default VoiceDebugPanel;
