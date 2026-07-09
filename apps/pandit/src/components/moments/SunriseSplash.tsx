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

import React, { useEffect, useRef } from "react";
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
  const finish = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    onDone();
  };

  useEffect(() => {
    // D3a AUTO-ADVANCE = max(minimum display, narration end). शिष्य is
    // NEVER cut mid-line by the app: speakAndWait resolves on the line's
    // natural end (or instantly when muted/parked — a no-tap pre-unlock
    // run advances on the visual timer alone). A user tap still skips
    // immediately (barge-in allowed). No timer failsafe races a playing
    // line — speakAndWait always settles, including every finish(false)
    // path in the controller, so this cannot hang.
    // D3c: warm the NEXT phase's lines while the sun rises
    voiceController.prefetch([t("parichay.introOnly"), t("parichay.pressAllow"), t("parichay.granted")]);
    let disposed = false;
    const minDisplay = new Promise<void>((res) => setTimeout(res, 2600));
    const narration = new Promise<boolean>((res) => {
      setTimeout(() => {
        if (disposed) {
          res(false);
          return;
        }
        void voiceController.speakAndWait(t("shishya.intro")).then(res);
      }, 1600);
    });
    void Promise.all([minDisplay, narration]).then(() => {
      if (!disposed) finish();
    });
    return () => {
      disposed = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      onClick={finish}
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

      {/* शिष्य pops center-bottom with one ripple */}
      <div className="pa-splash-orb absolute bottom-8 left-1/2 -translate-x-1/2">
        <ShishyaOrb />
      </div>
    </div>
  );
}

export default SunriseSplash;
