"use client";

// A1 — permanent on-device voice diagnostics (?voicedebug=1).
// Phones have no console: voiceController writes every speak → route →
// status → play/fallback/voice decision into a ring buffer this panel
// renders. Flag-gated (zero UI without it) and session-sticky so SPA
// navigation keeps the panel alive while walking the flow.

import React, { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { voiceController } from "@/lib/voiceController";

const FLAG_KEY = "hpj_voicedebug";

export function useVoiceDebugFlag(): boolean {
  const [on, setOn] = useState(false);
  useEffect(() => {
    try {
      const q = new URLSearchParams(window.location.search);
      if (q.get("voicedebug") === "1") sessionStorage.setItem(FLAG_KEY, "1");
      if (q.get("voicedebug") === "0") sessionStorage.removeItem(FLAG_KEY);
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
  const boxRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    boxRef.current?.scrollTo({ top: boxRef.current.scrollHeight });
  }, [lines]);

  return (
    <div
      ref={boxRef}
      className="fixed inset-x-0 bottom-0 z-[90] max-h-[40%] overflow-y-auto bg-black/85 text-green-200 font-mono text-[11px] leading-[1.5] px-2 py-1"
      aria-hidden="true"
    >
      <div className="text-green-400 font-bold sticky top-0 bg-black/85">🔊 voicedebug ({lines.length})</div>
      {lines.map((line, i) => (
        <div key={i} className="whitespace-pre-wrap break-all">{line}</div>
      ))}
    </div>
  );
}

export default VoiceDebugPanel;
