"use client";

// ─────────────────────────────────────────────────────────────
// शिष्य — Pandit ji's devoted disciple, the ONE voice control.
// The ONE voice control; lives in the FOOTER (nav center-dock or the
// footer bar's orb slot), never the header. All narration is his voice.
// States (from voiceController): AWAKE · SPEAKING (gold ripples) ·
// LISTENING (gold ring + "सुन रहा हूँ…" pill) · ASLEEP (grayscale + 💤).
// ─────────────────────────────────────────────────────────────

import React, { useState, useSyncExternalStore } from "react";
import { voiceController } from "@/lib/voiceController";
import { hi } from "@/lib/strings";
import { Toast } from "./Toast";

export function ShishyaOrb({ className = "" }: { className?: string }) {
  const muted = useSyncExternalStore(
    voiceController.subscribe,
    () => voiceController.muted,
    () => false,
  );
  const speaking = useSyncExternalStore(
    voiceController.subscribe,
    () => voiceController.speaking,
    () => false,
  );
  const listening = useSyncExternalStore(
    voiceController.subscribe,
    () => voiceController.listening,
    () => false,
  );
  const [sleepToast, setSleepToast] = useState(false);

  const asleep = muted;

  const toggle = () => {
    if (asleep) {
      // wake: greeting, then the controller re-narrates + loop resumes
      voiceController.setMuted(false);
    } else {
      voiceController.setMuted(true);
      setSleepToast(true);
    }
  };

  return (
    <div className={`relative flex flex-col items-center ${className}`} style={{ width: 78 }}>
      {/* Listening pill floats above the orb */}
      {listening && !asleep && (
        <span className="absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap bg-temple-600 text-white text-[12px] font-semibold font-hindi rounded-full px-3 py-1 shadow-card">
          {hi.voiceLoop.listening}
        </span>
      )}

      <button
        onClick={toggle}
        aria-label={asleep ? hi.shishya.a11ySleep : hi.shishya.a11yAwake}
        className={`relative w-[66px] h-[66px] min-w-[66px] min-h-[66px] rounded-full flex items-center justify-center transition-all active:scale-95 ${
          asleep
            ? "shishya-asleep"
            : listening
            ? "bg-saffron-500 border-4 border-gold shishya-listen-ring"
            : "bg-saffron-500 border-4 border-gold"
        }`}
      >
        {/* SPEAKING ripples */}
        {speaking && !asleep && (
          <>
            <span className="shishya-ripple" aria-hidden="true" />
            <span className="shishya-ripple shishya-ripple-2" aria-hidden="true" />
          </>
        )}
        <span className="text-[30px] leading-none select-none" aria-hidden="true">🙏</span>
        {asleep && (
          <span
            className="absolute -top-1 -right-1 text-[16px] leading-none select-none"
            aria-hidden="true"
          >
            💤
          </span>
        )}
      </button>

      <span
        className={`mt-0.5 text-[11px] font-bold font-hindi ${asleep ? "text-softgrey" : "text-saffron-500"}`}
      >
        {hi.shishya.name}
      </span>

      {sleepToast && (
        <Toast
          message={hi.shishya.sleepToast}
          show={sleepToast}
          onClose={() => setSleepToast(false)}
        />
      )}
    </div>
  );
}

export default ShishyaOrb;
