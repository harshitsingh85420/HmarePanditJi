"use client";

import React from "react";
import { t } from "../../lib/i18n";
import { Diya } from "../ui/Diya";

// ─────────────────────────────────────────────────────────────
// प्रतीक्षा — canon artboard 28 ("प्रतीक्षा · Loading").
//
// Canon's loading screen is not "a lamp on cream". It is four layers:
//   1. a radial SCREEN wash — radial-gradient(120% 60% at 50% 42%,
//      #FFF3DE,#FFF9EE 60%) — the light pools behind the lamp
//   2. a 150×150 KINDLE halo, rgba(242,160,44,.28) → transparent 70%,
//      breathing on g-kindle 1.6s BEHIND the lamp
//   3. the brass Diya at size 92 (the app was drawing it at 56)
//   4. "एक क्षण…" 24/900 #7A250E over three 11px TWINKLE dots
//      (#B23A1A / #D95F38 / #F2A02C, 1.1s, staggered .2s / .4s)
// The text itself does NOT pulse in canon — the dots carry the motion.
//
// Every animation is transform/opacity only and the whole set is switched
// off under prefers-reduced-motion, where the composition rests fully lit
// and fully opaque. Nothing here changes height, so there is no shift.
// ─────────────────────────────────────────────────────────────

const LOADER_CSS = `
@keyframes pa-load-kindle {
  0%,100% { transform: scale(.7) translateY(4px); opacity: .55; }
  50%     { transform: scale(1.12) translateY(-2px); opacity: 1; }
}
@keyframes pa-load-twinkle {
  0%,100% { transform: scale(.7); opacity: .4; }
  50%     { transform: scale(1.15); opacity: 1; }
}
.pa-load-kindle { animation: pa-load-kindle 1.6s ease-in-out infinite; }
.pa-load-dot    { animation: pa-load-twinkle 1.1s ease-in-out infinite; }
@media (prefers-reduced-motion: reduce) {
  .pa-load-kindle, .pa-load-dot { animation: none; }
}
`;

/** canon dot row: 11px, gap 7px, the three sindoor→genda stops */
const DOTS = [
  { color: "#B23A1A", delay: "0s" },
  { color: "#D95F38", delay: ".2s" },
  { color: "#F2A02C", delay: ".4s" },
];

export function DiyaLoader({ message, inline = false }: { message?: string; inline?: boolean } = {}) {
  if (inline) {
    // D1: compact waiting row (server waking) — no overlay, sits in flow.
    // Not a canon frame; it keeps the 18sp body floor rather than canon's
    // small label sizes.
    return (
      <div className="flex items-center justify-center gap-3 px-4 py-2" role="status">
        <Diya size={30} />
        <span className="t-body font-semibold text-temple-600 font-hindi animate-pulse motion-reduce:animate-none">
          {message ?? t("common.loading")}
        </span>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 p-6"
      style={{
        // canon screen wash — the light pools at 50% 42%, behind the lamp
        background: "radial-gradient(120% 60% at 50% 42%,#FFF3DE,#FFF9EE 60%)",
      }}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <style>{LOADER_CSS}</style>

      {/* lamp + kindle halo. The halo is a bare absolute child of a
          centring flex box, exactly as canon has it, so its static
          position centres it and `transform` stays free for the animation. */}
      <div className="relative flex items-center justify-center">
        <span
          aria-hidden="true"
          className="pa-load-kindle absolute rounded-full pointer-events-none"
          style={{
            width: 150,
            height: 150,
            background: "radial-gradient(circle, rgba(242,160,44,.28), transparent 70%)",
          }}
        />
        <Diya size={92} />
      </div>

      <div className="text-center">
        <p className="text-[24px] font-black text-saffron-700 font-hindi">
          {message ?? t("common.loading")}
        </p>
        <div className="mt-3 flex justify-center gap-[7px]" aria-hidden="true">
          {DOTS.map((d) => (
            <span
              key={d.color}
              className="pa-load-dot rounded-full"
              style={{
                width: 11,
                height: 11,
                background: d.color,
                animationDelay: d.delay,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default DiyaLoader;
