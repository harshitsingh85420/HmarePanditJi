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
import { t } from "@/lib/i18n";
import { Toast } from "./Toast";

export function ShishyaOrb({
  className = "",
  size = "md",
  showLabel = true,
}: {
  className?: string;
  /** "lg" renders the 120px hero orb (परिचय screen); "md" is the footer dock. */
  size?: "md" | "lg";
  /** Canon frame 1 (splash) hides the name (`name="{{ false }}"`) — the ribbon
      already says who's speaking, so the "शिष्य" caption is redundant there. */
  showLabel?: boolean;
}) {
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
  // J3d: speech ended, STT in flight — 'समझ रहा हूँ' beats dead air
  const processing = useSyncExternalStore(
    voiceController.subscribe,
    () => voiceController.processing,
    () => false,
  );
  const [sleepToast, setSleepToast] = useState(false);

  const asleep = muted;
  // Boring-pass E: gently breathe only when awake and quiet — never over a
  // speaking/listening/processing state (those own their own motion).
  const idle = !asleep && !speaking && !listening && !processing;

  const toggle = () => {
    if (asleep) {
      // wake: greeting, then the controller re-narrates + loop resumes
      voiceController.setMuted(false);
    } else {
      voiceController.setMuted(true);
      setSleepToast(true);
    }
  };

  const large = size === "lg";

  return (
    <div
      className={`relative flex flex-col items-center ${className}`}
      style={{ width: large ? 132 : 78 }}
    >
      {/* Listening / understanding pill floats above the orb */}
      {(listening || processing) && !asleep && (
        <span className="absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap bg-temple-600 text-white text-[12px] font-semibold font-hindi rounded-full px-3 py-1 shadow-card">
          {processing ? t("voiceLoop.understanding") : t("voiceLoop.listening")}
        </span>
      )}

      <button
        onClick={toggle}
        aria-label={asleep ? t("shishya.a11ySleep") : t("shishya.a11yAwake")}
        className={`relative rounded-full flex items-center justify-center transition-all active:scale-95 ${
          large
            ? "w-[120px] h-[120px] min-w-[120px] min-h-[120px]"
            : "w-[66px] h-[66px] min-w-[66px] min-h-[66px]"
        } ${
          asleep
            ? // asleep keeps the grounding shadow but never glows
              "shishya-asleep shishya-orb-ground"
            : listening
            ? // the listen ring animation carries the grounding shadow itself
              "bg-saffron-500 border-4 border-gold shishya-listen-ring"
            : idle
            ? // CANON: idle breathes a GOLD HALO on the orb (this animation
              // includes the grounding shadow in both keyframes)
              "bg-saffron-500 border-4 border-gold shishya-breathe-halo"
            : "bg-saffron-500 border-4 border-gold shishya-orb-ground"
        }`}
      >
        {/* SPEAKING ripples */}
        {speaking && !asleep && (
          <>
            <span className="shishya-ripple" aria-hidden="true" />
            <span className="shishya-ripple shishya-ripple-2" aria-hidden="true" />
          </>
        )}
        {/* CANON: the glyph carries its own drop-shadow so it reads as
            resting IN the orb rather than printed on it. The old idle
            scale-breath moved here → the orb's halo (see className above). */}
        <span
          className={`${large ? "text-[56px]" : "text-[30px]"} leading-none select-none`}
          style={{ filter: "drop-shadow(0 1px 1px rgba(0,0,0,.15))" }}
          aria-hidden="true"
        >
          🙏
        </span>
        {asleep && (
          <span
            className="absolute -top-1 -right-1 text-[16px] leading-none select-none"
            aria-hidden="true"
          >
            💤
          </span>
        )}
      </button>

      {showLabel && (
        <span
          className={`mt-0.5 font-bold font-hindi ${large ? "text-[18px]" : "text-[11px]"} ${asleep ? "text-softgrey" : "text-saffron-500"}`}
        >
          {t("shishya.name")}
        </span>
      )}

      {/* Q8: a sleeping शिष्य can't hear "उठो" (mic off BY DESIGN) — the
          orb itself teaches the wake gesture, persistently. */}
      {asleep && (
        <span className="text-[11px] font-semibold font-hindi text-softgrey leading-none mt-0.5">
          {t("shishya.wakeHint")}
        </span>
      )}

      {sleepToast && (
        <Toast
          message={t("shishya.sleepToast")}
          show={sleepToast}
          onClose={() => setSleepToast(false)}
        />
      )}
    </div>
  );
}

export default ShishyaOrb;
