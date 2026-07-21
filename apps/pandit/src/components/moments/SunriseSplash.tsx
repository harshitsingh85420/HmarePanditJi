"use client";

// ─────────────────────────────────────────────────────────────
// प्रथम आरती — Sunrise splash (D0). Full-screen sunrise gradient
// (the ONE hero-exception to the flat-fill rule) with a staged
// ~2.4s CSS sequence: diya → wordmark → toran drops → marigold
// petals drift → शिष्य pops in and speaks his intro.
// Canon frame 0 has NO ॐ glyph — the brass Diya is the hero mark — and
// the tap pill is permanent, not a parked-only chip.
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
import { Diya } from "@/components/ui/Diya";
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

// Canon frame 0 petal fall: five blooms, mixed 🌼/🌸, mixed sizes, at the
// canon's own left offsets and drift durations.
const PETALS = [
  { left: "12%", glyph: "🌼", size: 20, delay: 1.2, duration: 3.5 },
  { left: "34%", glyph: "🌸", size: 16, delay: 1.6, duration: 4.2 },
  { left: "58%", glyph: "🌼", size: 22, delay: 1.35, duration: 3.2 },
  { left: "70%", glyph: "🌼", size: 18, delay: 2.1, duration: 3.9 },
  { left: "80%", glyph: "🌸", size: 15, delay: 1.5, duration: 4.5 },
];

// Canon frame 0 sky: ratri-violet → deep sindoor → sindoor → genda.
// (globals.css `.pa-sunrise` still carries the older 4-stop ramp that ends
// in chandan — see sharedNeeded; this literal is the canon value.)
const CANON_SKY =
  "linear-gradient(180deg,#2A1B3D 0%,#5E1C0A 38%,#B23A1A 68%,#F2A02C 100%)";

// Canon wordmark shimmer: the tagline is gold gradient text, clipped.
const CANON_TAGLINE_GOLD =
  "linear-gradient(90deg,#E7B54A 20%,#FFF6DE 50%,#E7B54A 80%)";

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
      className="pa-sunrise h-[100dvh] max-w-[430px] mx-auto relative overflow-hidden flex flex-col cursor-pointer"
      style={{ background: CANON_SKY }}
    >
      {/* Toran garland drops in from the top edge (canon z-4) */}
      <div className="absolute top-0 left-0 right-0 z-[4] pa-splash-toran">
        <Toran tone="onSindoor" />
      </div>

      {/* Marigold petals drift down */}
      {PETALS.map((p, i) => (
        <span
          key={i}
          className="pa-petal"
          style={{
            left: p.left,
            fontSize: `${p.size}px`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
          aria-hidden="true"
        >
          {p.glyph}
        </span>
      ))}

      {/* Canon centre column: diya → wordmark+tagline → शिष्य, gap 20, pad 24 */}
      <div className="relative z-[3] flex-1 flex flex-col items-center justify-center gap-5 p-6">
        {/* The real brass lamp at canon's size 104 — not the flat 🪔 glyph */}
        <div className="pa-splash-diya flex items-center justify-center">
          <Diya size={104} lit />
        </div>

        <div className="text-center mt-1">
          {/* canon: 40/900 · #FFF6E9 · -.5px · lh 1.1 · shadow 0 3px 14px rgba(0,0,0,.35)
              max-w forces the canon's two-line break without hardcoding a <br> */}
          <h1
            className="pa-splash-word font-display max-w-[220px] mx-auto"
            style={{
              fontSize: "40px",
              fontWeight: 900,
              color: "#FFF6E9",
              letterSpacing: "-.5px",
              lineHeight: 1.1,
              textShadow: "0 3px 14px rgba(0,0,0,.35)",
            }}
          >
            {t("welcome.titleShort")}
          </h1>
          {/* canon: gold gradient text, 800, letter-spacing 3px, mt 12
              (canon size 16px → held at 18px by the body-text floor) */}
          <p
            className="pa-splash-word font-hindi inline-block"
            style={{
              marginTop: "12px",
              fontSize: "18px",
              fontWeight: 800,
              letterSpacing: "3px",
              backgroundImage: CANON_TAGLINE_GOLD,
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              WebkitTextFillColor: "transparent",
              color: "transparent",
            }}
          >
            {t("pratham.splashTagline")}
          </p>
        </div>

        {/* शिष्य sits in the column under the wordmark (canon mt 14) */}
        <div className="pa-splash-orb mt-[14px]">
          <ShishyaOrb />
        </div>
      </div>

      {/* Canon tap pill — ALWAYS on screen (a tap always advances, so this is
          truthful): chandan chip, sindoor text, 999px, 0 8px 22px shadow.
          `showHint` no longer gates VISIBILITY, only the stronger pulse the
          parked-welcome path escalates to. */}
      <div className="relative z-[3] flex justify-center px-7 pb-[30px]">
        <span
          className={`${showHint ? "pa-tap-hint " : ""}inline-flex items-center justify-center gap-2.5 rounded-full font-hindi text-center max-w-[92vw] min-h-[52px]`}
          style={{
            background: "#FFF6E9",
            color: "#B23A1A",
            fontSize: "19px",
            fontWeight: 800,
            padding: "15px 30px",
            boxShadow: "0 8px 22px rgba(0,0,0,.28)",
          }}
        >
          <span
            className="material-symbols-outlined shrink-0"
            style={{ fontSize: "24px" }}
            aria-hidden="true"
          >
            touch_app
          </span>
          {t("pratham.tapHint")}
        </span>
      </div>
    </div>
  );
}

export default SunriseSplash;
