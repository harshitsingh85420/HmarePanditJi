"use client";

// ─────────────────────────────────────────────────────────────
// प्रथम आरती — Sunrise splash (D0). Full-screen sunrise gradient
// (the ONE hero-exception to the flat-fill rule) with a staged
// ~2.4s CSS sequence: diya → ॐ rises → wordmark → toran drops →
// marigold petals drift → शिष्य pops in and speaks his intro.
// Auto-advances after 2.6s; any tap skips. Reduced motion shows
// the fully-composed static scene (all animations use `backwards`
// fill, so animation:none leaves everything visible in place).
// ─────────────────────────────────────────────────────────────

import React, { useEffect, useRef, useState } from "react";
import { t } from "@/lib/i18n";
import { Toran } from "@/components/ui/Toran";
import { ShishyaOrb } from "@/components/ui/ShishyaOrb";
import { voiceController } from "@/lib/voiceController";

const PETALS = [
  { left: "8%", delay: 1.2, duration: 3.4 },
  { left: "24%", delay: 1.6, duration: 3.0 },
  { left: "42%", delay: 1.35, duration: 3.6 },
  { left: "58%", delay: 1.9, duration: 3.2 },
  { left: "74%", delay: 1.5, duration: 3.5 },
  { left: "90%", delay: 2.1, duration: 3.1 },
];

export function SunriseSplash({ onDone }: { onDone: () => void }) {
  const doneRef = useRef(false);
  // parked = welcome queued behind the first-gesture unlock: a human has
  // not touched the app — NO timer may advance the splash.
  const parkedRef = useRef(false);
  const firstTapRef = useRef(false);
  const [showHint, setShowHint] = useState(false);
  const finish = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    onDone();
  };

  // First tap on a parked splash: the pointerdown unlocks (controller)
  // and flushes the parked welcome — advance when IT ends. A second tap
  // (or any tap when not parked) advances immediately (barge-in law).
  //
  // G2: the flush's 2.5s failsafe once BEHEADED a playing welcome — the
  // flush's speaking→true emit can fire in the timer task BETWEEN
  // pointerdown and click, before this subscription exists, so the
  // failsafe judged "no playback" against a line that was mid-air.
  // Now: (a) sawSpeaking is SEEDED from the live state (late-subscriber
  // safe), (b) the controller's playback-start event cancels the
  // failsafe the moment the flushed utterance actually sounds, and
  // (c) a firing failsafe DEFERS while the flush is still in flight
  // (slow TTS) — it advances only when nothing started and nothing is
  // in progress.
  const handleTap = () => {
    if (parkedRef.current && !firstTapRef.current) {
      firstTapRef.current = true;
      setShowHint(false);
      let failsafe: ReturnType<typeof setTimeout> | null = null;
      let cleaned = false;
      const cleanup = () => {
        if (cleaned) return;
        cleaned = true;
        offStart();
        unsub();
        if (failsafe) clearTimeout(failsafe);
        failsafe = null;
      };
      const offStart = voiceController.onPlaybackStart(() => {
        voiceController.debug("splash: flush started — failsafe cancelled");
        if (failsafe) clearTimeout(failsafe);
        failsafe = null;
      });
      // natural-end watcher — seeded so a pre-subscription speaking=true
      // transition (timer-vs-click task ordering) is never missed
      let sawSpeaking = voiceController.speaking;
      const unsub = voiceController.subscribe(() => {
        if (voiceController.speaking) sawSpeaking = true;
        else if (sawSpeaking) {
          cleanup();
          finish();
        }
      });
      // flush never started (TTS dead) → don't strand the pandit
      failsafe = setTimeout(() => {
        if (voiceController.speaking || sawSpeaking) {
          // slow TTS: the flush is in flight — playback start / natural
          // end owns advancing; the timer must never behead the line
          voiceController.debug("splash: failsafe deferred — flush in flight");
          return;
        }
        voiceController.debug("splash: flush failsafe fired (no playback)");
        cleanup();
        finish();
      }, 2500);
      return;
    }
    finish();
  };

  useEffect(() => {
    // D3a AUTO-ADVANCE = max(minimum display, narration end). शिष्य is
    // NEVER cut mid-line by the app: speakAndWait resolves on the line's
    // natural end (or instantly when muted/parked — a no-tap pre-unlock
    // run advances on the visual timer alone). A user tap still skips
    // immediately (barge-in allowed). No timer failsafe races a playing
    // line — speakAndWait always settles, including every finish(false)
    // path in the controller, so this cannot hang.
    // D3c: warm the NEXT phase's lines while the sun rises (N2 order:
    // LOCATION follows the splash now, then the city picker)
    voiceController.prefetch([t("entry.locationVoice"), t("pratham.cityVoice")]);
    let disposed = false;
    const mountedAt = performance.now();
    const minDisplay = new Promise<void>((res) => setTimeout(res, 2600));
    void (async () => {
      await new Promise((r) => setTimeout(r, 1600));
      if (disposed) return;
      const { status } = await voiceController.speakAndWait(t("shishya.intro"));
      if (disposed) return;
      if (status === "ended" || status === "muted") {
        // SPLASH LAW: auto-advance ONLY on ended|muted AND ≥2.6s shown
        await minDisplay;
        if (!disposed) finish();
      } else if (status === "parked") {
        // no human gesture yet → stay indefinitely; gentle hint at 2.5s
        parkedRef.current = true;
        const hintIn = Math.max(0, 2500 - (performance.now() - mountedAt));
        setTimeout(() => {
          if (!disposed && !doneRef.current && !firstTapRef.current) setShowHint(true);
        }, hintIn);
      } else if (status === "failed") {
        // speech impossible this session — visual timer may advance
        await minDisplay;
        if (!disposed) finish();
      }
      // 'interrupted' = a user tap already handled navigation (barge-in)
    })();
    return () => {
      disposed = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      onClick={handleTap}
      className="pa-sunrise h-[100dvh] max-w-[430px] mx-auto relative overflow-hidden flex flex-col items-center justify-center cursor-pointer"
    >
      {/* Toran scallop drops in from the top edge */}
      <div className="absolute top-0 left-0 right-0 pa-splash-toran">
        <Toran tone="onSindoor" />
      </div>

      {/* Marigold petals drift down */}
      {PETALS.map((p, i) => (
        <span
          key={i}
          className="pa-petal"
          style={{ left: p.left, animationDelay: `${p.delay}s`, animationDuration: `${p.duration}s` }}
          aria-hidden="true"
        >
          🌼
        </span>
      ))}

      {/* ॐ rises above the diya */}
      <span
        className="pa-splash-om text-[40px] leading-none text-[#FFE8D2] select-none"
        aria-hidden="true"
      >
        ॐ
      </span>

      {/* Diya with flicker + warm halo */}
      <div className="pa-splash-diya relative mt-2 flex items-center justify-center">
        <span
          className="pa-diya-halo absolute w-[130px] h-[130px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(231,181,74,0.55) 0%, transparent 70%)" }}
          aria-hidden="true"
        />
        <span className="pa-diya-flame relative text-[72px] leading-none select-none" aria-hidden="true">
          🪔
        </span>
      </div>

      {/* Wordmark */}
      <h1
        className="pa-splash-word font-display text-[34px] text-white mt-5 text-center leading-tight"
        style={{ textShadow: "0 2px 12px rgba(231,181,74,0.6)" }}
      >
        {t("welcome.titleShort")}
      </h1>
      <p className="pa-splash-word text-[16px] text-[#FFE8D2]/90 font-hindi mt-1 px-8 text-center">
        {t("pratham.splashTagline")}
      </p>

      {/* Parked welcome: gentle first-tap hint (chandan chip, soft pulse) */}
      {showHint && (
        <span className="pa-tap-hint absolute bottom-28 left-1/2 -translate-x-1/2 bg-cream border border-saffron-200 shadow-card rounded-full px-5 py-2.5 text-[18px] font-bold text-temple-600 font-hindi whitespace-nowrap">
          {t("pratham.tapHint")}
        </span>
      )}

      {/* शिष्य pops center-bottom with one ripple */}
      <div className="pa-splash-orb absolute bottom-8 left-1/2 -translate-x-1/2">
        <ShishyaOrb />
      </div>
    </div>
  );
}

export default SunriseSplash;
