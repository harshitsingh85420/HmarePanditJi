"use client";

// उत्सव (full screen, with a way onward) — canon frames 35 (पूजा संपन्न) and
// 36 (प्रमाणित हुए). Same moment family as CelebrationOverlay; this one is
// used where the pandit must be handed somewhere next, so it keeps its CTA.
//
// CANON LITERALS (design/canon/हमारे पंडित जी.dc.html, frames 35 & 36):
//   screen bg   radial-gradient(120% 70% at 50% 34%,#FFE9C4,#FFF9EE 62%)  ← money
//               radial-gradient(120% 70% at 50% 34%,#FFF0D6,#FFF9EE 62%)  ← plain
//   badge       130×130, radius 50%, linear-gradient(150deg,#E7B54A,#B8860B),
//               shadow 0 12px 30px rgba(184,134,11,.4), glyph 74px #FFF6E9
//   headline    30/900 #7A250E                       (margin-top 20/22)
//   message     17/600 #8A6F5C                       (margin-top 8)
//   money pill  #E4F3E9 fill, 2px #BFE3CC border, radius 999px,
//               padding 9px 20px, 19/900 #155C34     (margin-top 14)
//   ornament    petals bursting from 38%/40% along --bx/--by
//
// LAW OVER CANON: the 17px message is raised to 18px (18sp body floor).
// The CTA is not in the canon frame — this screen is a hand-off, so the
// button stays; it is the shared xl Button (52px+ target).
//
// A11Y/A12: petals + stamp are transform/opacity only and are dropped under
// prefers-reduced-motion, with the badge resting at the canon stamped angle.

import React from "react";
import { Button } from "../ui/Button";
import { MoneyCount } from "./MoneyCount";

export interface CelebrationScreenProps {
  emoji: string;
  title: string;
  message: string;
  amount?: number;
  ctaLabel: string;
  onCta: () => void;
}

type Petal = { bx: string; by: string; size: number; dur: number; delay: number; glyph: string };

/** canon frame 35 — five petals, money moment */
const BURST_MONEY: Petal[] = [
  { bx: "-95px", by: "-65px", size: 20, dur: 2.0, delay: -0.2, glyph: "🪙" },
  { bx: "95px", by: "-55px", size: 18, dur: 2.0, delay: -0.6, glyph: "🌸" },
  { bx: "-115px", by: "45px", size: 16, dur: 2.2, delay: -0.9, glyph: "🌼" },
  { bx: "115px", by: "45px", size: 20, dur: 2.2, delay: -1.2, glyph: "🪙" },
  { bx: "0px", by: "-95px", size: 18, dur: 2.1, delay: -1.5, glyph: "🌸" },
];

/** canon frame 36 — four petals */
const BURST_PLAIN: Petal[] = [
  { bx: "-100px", by: "-65px", size: 20, dur: 2.0, delay: -0.15, glyph: "🌼" },
  { bx: "100px", by: "-60px", size: 18, dur: 2.0, delay: -0.55, glyph: "🌸" },
  { bx: "-118px", by: "45px", size: 16, dur: 2.2, delay: -0.95, glyph: "🌼" },
  { bx: "118px", by: "48px", size: 20, dur: 2.2, delay: -1.35, glyph: "🌸" },
];

export function CelebrationScreen({
  emoji,
  title,
  message,
  amount,
  ctaLabel,
  onCta,
}: CelebrationScreenProps) {
  const hasMoney = typeof amount === "number" && amount > 0;
  const burst = hasMoney ? BURST_MONEY : BURST_PLAIN;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col overflow-hidden"
      style={{
        background: hasMoney
          ? "radial-gradient(120% 70% at 50% 34%,#FFE9C4,#FFF9EE 62%)"
          : "radial-gradient(120% 70% at 50% 34%,#FFF0D6,#FFF9EE 62%)",
      }}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes pa-cel-burst {
          0%   { transform: translate(0,0) scale(.4) rotate(0deg); opacity: 1; }
          100% { transform: translate(var(--bx),var(--by)) scale(1.1) rotate(180deg); opacity: 0; }
        }
        /* canon g-stamp, held at its rest pose rather than looping to
           opacity 0 — a screen must not blink its badge away. */
        @keyframes pa-cel-stamp {
          0%   { transform: scale(2.6) rotate(-24deg); opacity: 0; }
          100% { transform: scale(1) rotate(-8deg); opacity: 1; }
        }
        .pa-cel-petal { position: absolute; animation-name: pa-cel-burst;
          animation-timing-function: ease-out; animation-iteration-count: infinite;
          pointer-events: none; user-select: none; }
        .pa-cel-badge { transform: rotate(-8deg);
          animation: pa-cel-stamp .54s cubic-bezier(.2,.8,.3,1) backwards; }
        @media (prefers-reduced-motion: reduce) {
          .pa-cel-petal { display: none !important; }
          .pa-cel-badge { animation: none !important; }
        }
      `,
        }}
      />

      <div className="relative flex flex-1 flex-col items-center justify-center p-6 text-center">
        {/* ornament — petals burst from the badge, canon offsets */}
        <div
          className={`absolute left-1/2 h-0 w-0 ${hasMoney ? "top-[38%]" : "top-[40%]"}`}
          aria-hidden="true"
        >
          {burst.map((p, i) => (
            <span
              key={i}
              className="pa-cel-petal"
              style={
                {
                  "--bx": p.bx,
                  "--by": p.by,
                  fontSize: `${p.size}px`,
                  animationDuration: `${p.dur}s`,
                  animationDelay: `${p.delay}s`,
                } as React.CSSProperties
              }
            >
              {p.glyph}
            </span>
          ))}
        </div>

        <span
          className="pa-cel-badge relative z-[2] flex h-[130px] w-[130px] items-center justify-center rounded-full text-[74px] leading-none text-chandan"
          style={{
            background: "linear-gradient(150deg,#E7B54A,#B8860B)",
            boxShadow: "0 12px 30px rgba(184,134,11,.4)",
          }}
          role="img"
          aria-hidden="true"
        >
          {emoji}
        </span>

        <div className="relative z-[2] mt-[22px]">
          <h2 className="text-[30px] font-black font-hindi leading-snug text-saffron-700">
            {title}
          </h2>

          {/* canon 17px → 18px body floor */}
          <p className="mx-auto mt-2 max-w-[300px] text-[18px] font-semibold font-hindi leading-snug text-softgrey">
            {message}
          </p>

          {hasMoney && (
            <div className="mt-[14px] inline-block rounded-full border-2 border-leafpale bg-leaf-100 px-5 py-[9px]">
              <MoneyCount
                target={amount as number}
                className="text-[19px] font-black font-hindi text-leaf-700"
              />
            </div>
          )}
        </div>
      </div>

      {/* Hand-off — not in the canon frame, but this screen must lead onward */}
      <div className="w-full px-6 pb-safe">
        <Button variant="primary" size="xl" fullWidth onClick={onCta}>
          {ctaLabel}
        </Button>
      </div>
    </div>
  );
}

export default CelebrationScreen;
