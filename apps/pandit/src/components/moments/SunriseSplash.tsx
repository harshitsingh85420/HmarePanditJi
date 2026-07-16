"use client";

// ─────────────────────────────────────────────────────────────
// प्रथम आरती — Sunrise splash (D0). Full-screen sunrise gradient
// (the ONE hero-exception to the flat-fill rule) with a staged
// ~2.4s CSS sequence: diya → ॐ rises → wordmark → toran drops →
// marigold petals drift → शिष्य pops in and speaks his intro.
// Any tap skips. Auto-advance is bounded by the D0-L deadline law
// below — a fresh load CANNOT speak (autoplay policy), so it parks and
// the ≥2.6s narration-end path never runs; the deadlines, not the
// narration, are what guarantee the pandit always gets in. Reduced motion shows
// the fully-composed static scene (all animations use `backwards`
// fill, so animation:none leaves everything visible in place).
// ─────────────────────────────────────────────────────────────

import React, { useEffect, useRef, useState } from "react";
import { t } from "@/lib/i18n";
import { Toran } from "@/components/ui/Toran";
import { ShishyaOrb } from "@/components/ui/ShishyaOrb";
import { voiceController } from "@/lib/voiceController";

// ── D0-L SPLASH DEADLINE LAW ──────────────────────────────────
// The front door may NEVER be a dead end. Voice may only bring the
// advance FORWARD, never hold it back. Two bounds, both armed on mount
// and living OUTSIDE every voice/park/tap branch:
//   NO_PLAYBACK — nothing has ever sounded (a fresh load parks by
//     platform law, and the pandit may never tap). Advance.
//   ABSOLUTE — a backstop for a lost playback-end event: audio started,
//     so no timer may behead शिष्य mid-line, but the advance can never
//     depend forever on an event that may never arrive.
// Exported so the guard test can assert both exist and are finite.
export const SPLASH_NO_PLAYBACK_MS = 9_000;
export const SPLASH_ABSOLUTE_MS = 30_000;

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
    // V2d: the WELCOME synthesizes while the sun rises — the tap then
    // hits the TTS cache and first audio lands <1s instead of ~4.4s.
    voiceController.prefetch([
      t("shishya.intro"),
      t("splash.tapHintVoice"),
      t("entry.locationVoice"),
      t("pratham.cityVoice"),
    ]);
    let disposed = false;
    const mountedAt = performance.now();
    const minDisplay = new Promise<void>((res) => setTimeout(res, 2600));

    // ── D0-L SPLASH DEADLINE LAW — enforcement point ────────────
    // Armed unconditionally, before any speak() is attempted, and
    // cleared only on unmount. Nothing below this line — not the park
    // branch, not the tap handler, not a subscriber — can disarm it.
    let everPlayed = voiceController.speaking;
    const offDeadlineWatch = voiceController.onPlaybackStart(() => {
      everPlayed = true;
    });
    const noPlaybackDeadline = setTimeout(() => {
      // audio is sounding → the natural end owns the advance (शिष्य is
      // never cut mid-line); the absolute backstop below still stands
      if (everPlayed || voiceController.speaking) return;
      voiceController.debug("splash: no-playback deadline — advancing");
      if (!disposed) finish();
    }, SPLASH_NO_PLAYBACK_MS);
    const absoluteDeadline = setTimeout(() => {
      voiceController.debug("splash: absolute deadline — advancing");
      if (!disposed) finish();
    }, SPLASH_ABSOLUTE_MS);
    void (async () => {
      // ── T1 PLATFORM LAW (permanent) ─────────────────────────
      // Browsers FORBID audio before the first user gesture of a page
      // session (Chrome/Safari autoplay policy). A fresh splash
      // CANNOT speak, no matter what we call — speech parks until the
      // unlock tap. This attempt below is the MAXIMUM LEGAL version:
      // it IS audible for returning-unlocked sessions and any load
      // where a prior gesture already unlocked audio; on fresh loads
      // it parks by platform law, the enlarged hint chip carries the
      // message visually, and the flushed welcome opens with
      // "नमस्ते पंडित जी!" the instant the pandit touches. Do NOT
      // re-flag the silent fresh splash as a defect.
      const hintAttempt = await voiceController.speakAndWait(t("splash.tapHintVoice"));
      if (hintAttempt.status === "parked") {
        voiceController.debug("splash: pre-tap hint parked (platform law)");
      }
      if (disposed) return;
      await new Promise((r) => setTimeout(r, hintAttempt.status === "ended" ? 400 : 1600));
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
      clearTimeout(noPlaybackDeadline);
      clearTimeout(absoluteDeadline);
      offDeadlineWatch();
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
        /* T1: the chip IS the greeting a fresh load cannot speak — 18px,
           strong pulse, wraps inside 360px instead of clipping.
           -translate-x-1/2 stays as the reduced-motion fallback; the
           animation's own transform takes over while pulsing. */
        <span className="pa-tap-hint absolute bottom-28 left-1/2 -translate-x-1/2 bg-cream border-2 border-saffron-300 shadow-card rounded-full px-5 py-2.5 text-[18px] font-bold text-temple-600 font-hindi text-center max-w-[92vw]">
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
