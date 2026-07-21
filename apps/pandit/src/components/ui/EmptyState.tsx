"use client";

import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: (string | undefined | false | null)[]) {
  return twMerge(clsx(inputs));
}

export interface EmptyStateProps {
  /** 52px glyph centred in the canon 110px #FDEEE7 medallion (frame 39) */
  emoji?: string;
  /**
   * A DRAWN ornament (शिष्य orb, दीया…) rendered in place of the emoji
   * medallion — canon frames 37/38 put the live components here, and the
   * drawn-not-emoji law prefers them wherever one exists. When both are
   * given, the ornament wins.
   */
  ornament?: React.ReactNode;
  title: string;
  hint: string;
  /**
   * Optional primary action, canon frame 39 (खाली अवस्था · पूजाएँ). Only the
   * pujas empty state carries a CTA in the artboards; bookings and earnings
   * (frames 37/38) are ornament + copy only, so this stays optional and is
   * never rendered unless a caller genuinely has an action to offer.
   */
  action?: { label: string; onClick: () => void };
  className?: string;
}

/**
 * CANON frames 37 / 38 / 39 — "खाली अवस्था".
 *
 * All three share one centred column: ornament, then a 22/900 sindoor-700
 * title, then a 17/600 dhoop hint. Canon's literals, read from
 * design/canon/हमारे पंडित जी.dc.html:
 *
 *   column     flex col · align+justify center · gap:20px · padding:24px
 *   ornament   110px circle, border-radius:50%, background:#FDEEE7,
 *              emoji centred at font-size:52px            (frame 39)
 *   title      font-size:22px; font-weight:900; color:#7A250E
 *   hint       font-size:17px; font-weight:600; color:#8A6F5C;
 *              margin-top:10px; line-height:1.5; max-width:270-280px
 *   CTA        width:100%; min-height:64px; border-radius:18px;
 *              background:#B23A1A; color:#FFF6E9; font-size:21px;
 *              font-weight:800; gap:9px;
 *              box-shadow:0 6px 16px rgba(178,58,26,.3)
 *
 * Frames 37/38 substitute the शिष्य orb and the दीया for the emoji medallion;
 * those are shared components this file does not own — the medallion is the
 * emoji-bearing ornament canon draws, so it is what an emoji renders into.
 *
 * LAW OVERRIDE: the hint is 18px here, not canon's 17px — the 18sp body floor
 * outranks the artboard. Every other value above is canon-literal.
 */
export function EmptyState({
  emoji,
  ornament,
  title,
  hint,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex w-full flex-col items-center justify-center gap-5 p-6 text-center",
        className
      )}
    >
      {ornament ?? (
        /* canon: 110px disc, 50% radius, #FDEEE7 fill, 52px glyph */
        <div
          className="flex h-[110px] w-[110px] shrink-0 select-none items-center justify-center rounded-full bg-saffron-50 text-[52px] leading-none"
          role="img"
          aria-hidden="true"
        >
          {emoji}
        </div>
      )}

      <div>
        <div className="font-hindi text-[22px] font-black text-saffron-700">
          {title}
        </div>
        <p className="mt-[10px] max-w-[280px] font-hindi text-[18px] font-semibold leading-[1.5] text-softgrey">
          {hint}
        </p>
      </div>

      {action ? (
        <button
          type="button"
          onClick={action.onClick}
          className="flex w-full min-h-[64px] items-center justify-center gap-[9px] rounded-cta bg-saffron-500 font-hindi text-[21px] font-extrabold text-chandan shadow-btn transition-transform active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100"
        >
          {/* canon draws Material `add_circle` at 26px here — never the ➕
              emoji (drawn-not-emoji law) */}
          <span
            aria-hidden="true"
            className="material-symbols-outlined text-[26px] leading-none"
          >
            add_circle
          </span>
          {action.label}
        </button>
      ) : null}
    </div>
  );
}
