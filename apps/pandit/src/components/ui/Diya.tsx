"use client";

import React from "react";

// ─────────────────────────────────────────────────────────────
// DIYA — the real brass lamp, ported from design/canon/Diya.dc.html.
//
// PHASE 1 (beauty pass). The app drew diyas as the 🪔 EMOJI: one flat
// glyph, no depth, no flame life, and it renders differently on every
// Android skin. Canon draws an actual lamp:
//   · brass body with a top-lit gradient, an inset highlight and a
//     grounded drop shadow (it sits ON the surface, not next to it)
//   · a spout at the right, rotated -8deg
//   · a flame with FOUR stops (#B23A1A → #F2A02C → #FFD98A → #FFF6DE)
//     and a warm bloom, over a white-hot inner core
//   · a breathing glow behind everything
// Flicker/core/glow run on slightly different curves so the flame never
// looks like it is pulsing on a single timer.
//
// A12: every animation is transform/opacity only, and the whole set is
// disabled under prefers-reduced-motion (canon does the same) — the
// composed, fully-lit lamp stays readable when still.
//
// Size is driven by ONE `size` prop (canon's own scale = size/58), so a
// caller can never change the layout box by accident.
// ─────────────────────────────────────────────────────────────

export interface DiyaProps {
  /** rendered width in px of the lamp body (canon default 44) */
  size?: number;
  /** unlit draws the cold wick instead of the flame */
  lit?: boolean;
  className?: string;
}

export function Diya({ size = 44, lit = true, className }: DiyaProps) {
  const scale = size / 58;

  return (
    <span
      className={`pa-diya inline-block relative ${className ?? ""}`}
      style={{
        width: 64 * scale,
        height: 76 * scale,
        // scale the canon geometry as a unit — no per-part maths, so the
        // proportions can never drift between sizes
        ["--dy-scale" as string]: String(scale),
      }}
      aria-hidden="true"
    >
      <span
        className="absolute left-0 bottom-0 origin-bottom-left"
        style={{ width: 64, height: 76, transform: `scale(${scale})` }}
      >
        {lit ? (
          <>
            {/* breathing glow */}
            <span
              className="pa-cdiya-glow absolute rounded-full pointer-events-none"
              style={{
                bottom: 20,
                left: "50%",
                width: 80,
                height: 80,
                background:
                  "radial-gradient(circle, rgba(242,160,44,.55) 0%, rgba(242,160,44,0) 68%)",
              }}
            />
            {/* flame */}
            <span
              className="pa-cdiya-flame absolute"
              style={{
                bottom: 30,
                left: "50%",
                width: 18,
                height: 33,
                borderRadius: "50% 50% 48% 48% / 62% 62% 40% 40%",
                background:
                  "linear-gradient(to top,#B23A1A 0%,#F2A02C 42%,#FFD98A 76%,#FFF6DE 100%)",
                boxShadow: "0 0 15px rgba(242,160,44,.85)",
                transformOrigin: "bottom center",
              }}
            />
            {/* white-hot core */}
            <span
              className="pa-cdiya-core absolute"
              style={{
                bottom: 31,
                left: "50%",
                width: 7,
                height: 15,
                borderRadius: "50%",
                background: "linear-gradient(to top,#FFEFC4,#fff)",
                transformOrigin: "bottom center",
              }}
            />
          </>
        ) : (
          // cold wick
          <span
            className="absolute"
            style={{
              bottom: 31,
              left: "50%",
              width: 5,
              height: 11,
              borderRadius: "50%",
              background: "#8A6F5C",
              transform: "translateX(-50%)",
            }}
          />
        )}

        {/* brass body — gradient + inset highlight + grounded shadow */}
        <span
          className="absolute"
          style={{
            bottom: 6,
            left: "50%",
            transform: "translateX(-50%)",
            width: 58,
            height: 27,
            background: "linear-gradient(#F3CE74,#B8860B 58%,#7d5c0f)",
            borderRadius: "6px 6px 42px 42px / 6px 6px 36px 36px",
            boxShadow:
              "inset 0 3px 5px rgba(255,255,255,.45), 0 5px 9px rgba(90,46,32,.32)",
          }}
        />
        {/* spout */}
        <span
          className="absolute"
          style={{
            bottom: 9,
            left: "calc(50% + 20px)",
            width: 16,
            height: 11,
            background: "linear-gradient(#F3CE74,#B8860B)",
            borderRadius: "0 60% 62% 0",
            transform: "rotate(-8deg)",
          }}
        />
      </span>
    </span>
  );
}

export default Diya;
