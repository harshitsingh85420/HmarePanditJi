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

// ── ISJ'S 8-SECOND RULE (founder-specified) ───────────────────
// The splash is interactive, not a timer graphic, and never a dead end:
//   · TOUCH within 8s → advance now (the next screen speaks — the first
//     touch also unlocks audio via the controller's global pointerdown).
//   · NO touch by 8s → auto-advance to the next onboarding screen.
// The two spoken lines total ~5s, so 8s never beheads Shishya. The timer
// is armed on mount and cleared on unmount (no double-fire; back-nav to
// the splash remounts and restarts it). Exported for the AUTO test.
export const SPLASH_ADVANCE_MS = 8_000;

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
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // showHint escalates the pill's pulse; the pill itself is ALWAYS visible.
  const [showHint, setShowHint] = useState(false);
  const finish = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    onDone();
  };

  // TOUCH → advance now. The tap is also the audio-unlock gesture (the
  // controller's global pointerdown primes audio), so the NEXT screen
  // speaks on mount. Stop the splash's own line first so it can't bleed
  // over the next screen.
  const handleTap = () => {
    voiceController.stopSpeech("splash:tap-advance");
    finish();
  };

  useEffect(() => {
    // Warm the splash's own lines AND the next screen's, so the first audio
    // after the unlock tap lands from cache (<1s), not a cold ~4s synth.
    voiceController.prefetch([
      t("splash.hello"),
      t("splash.sparshAsk"),
      t("entry.locationVoice"),
      t("pratham.cityVoice"),
    ]);
    let disposed = false;

    // ── ISJ'S 8-SECOND RULE: single unconditional timer ─────────
    // Armed on mount, outside every speech branch. No touch by 8s →
    // auto-advance. Touch cancels it in finish(). Cleared on unmount.
    timerRef.current = setTimeout(() => {
      voiceController.debug("splash: 8s elapsed — auto-advancing");
      if (!disposed) finish();
    }, SPLASH_ADVANCE_MS);

    // ON MOUNT: attempt the app's first words, in order. Autoplay-safe —
    // on a fresh first-ever load the browser blocks pre-gesture audio, so
    // both lines PARK silently and the canon pill carries the ask
    // visually. On any unlocked session they play, hello then sparsh-ask.
    // The attempt never throws and never gates the 8s timer.
    void (async () => {
      const hello = await voiceController.speakAndWait(t("splash.hello"));
      if (disposed) return;
      if (hello.status === "parked") {
        voiceController.debug("splash: hello parked (autoplay law) — pill carries the ask");
        // nudge the pill's pulse so the visual ask is unmistakable
        setTimeout(() => {
          if (!disposed && !doneRef.current) setShowHint(true);
        }, 1200);
        return; // don't queue the second line behind a parked first line
      }
      // audio is live → speak the sparsh ask right after the greeting
      await voiceController.speakAndWait(t("splash.sparshAsk"));
    })();

    return () => {
      disposed = true;
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      onClick={handleTap}
      className="pa-sunrise h-[100dvh] max-w-[430px] mx-auto relative overflow-hidden flex flex-col cursor-pointer"
      style={{ background: CANON_SKY }}
    >
      {/* Canon frame 1 hangs the FULL 58px marigold garland from the top edge
          (canon z-4, count=11) — not the compact header strip. */}
      <div className="absolute top-0 left-0 right-0 z-[4] pa-splash-toran">
        <Toran tone="onSindoor" variant="garland" count={11} />
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
            className="pa-splash-word font-display mx-auto"
            style={{
              fontSize: "40px",
              fontWeight: 900,
              color: "#FFF6E9",
              letterSpacing: "-.5px",
              lineHeight: 1.1,
              textShadow: "0 3px 14px rgba(0,0,0,.35)",
            }}
          >
            {/* canon breaks after the first word: "हमारे" / "पंडित जी" */}
            {(() => {
              const [first, ...rest] = t("welcome.titleShort").split(" ");
              return (
                <>
                  {first}
                  <br />
                  {rest.join(" ")}
                </>
              );
            })()}
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

        {/* शिष्य in his SPEAKING state (canon): a sindoor ribbon above the orb
            carrying "नमस्ते पंडित जी! 🙏" with a little tail, then the orb.
            Canon ribbon: #B23A1A / #FFF6E9 / 15px (14→15 label floor) / r16 /
            0 6px 16px shadow. */}
        <div className="pa-splash-orb mt-[14px] flex flex-col items-center">
          <div
            className="relative font-hindi font-semibold text-center"
            style={{
              maxWidth: 250,
              marginBottom: 9,
              background: "#B23A1A",
              color: "#FFF6E9",
              fontSize: "15px",
              lineHeight: 1.35,
              padding: "9px 15px",
              borderRadius: 16,
              boxShadow: "0 6px 16px rgba(178,58,26,.3)",
            }}
          >
            {t("splash.helloBubble")}
            <span
              className="absolute left-1/2"
              style={{
                bottom: -5,
                transform: "translateX(-50%) rotate(45deg)",
                width: 12,
                height: 12,
                background: "#B23A1A",
                borderRadius: 2,
              }}
              aria-hidden="true"
            />
          </div>
          {/* Canon Shishya is size 82; the shared orb's dock size is 66, so
              scale it up to canon (66 × 1.24 ≈ 82) splash-locally rather than
              threading a numeric size through the shared component. */}
          <div style={{ transform: "scale(1.24)", transformOrigin: "top center" }}>
            <ShishyaOrb showLabel={false} />
          </div>
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
          {t("splash.pill")}
        </span>
      </div>
    </div>
  );
}

export default SunriseSplash;
