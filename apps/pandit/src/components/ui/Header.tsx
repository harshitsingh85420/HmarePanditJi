"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Toran } from "./Toran";
import { t } from "@/lib/i18n";

function cn(...inputs: (string | undefined | false | null)[]) {
  return twMerge(clsx(inputs));
}

// ─────────────────────────────────────────────────────────────
// HEADER — canon has exactly four top-of-screen treatments and the old
// saffron banner + 14px bead-strip was NONE of them (it appears in zero of
// the 41 artboards — Isj's proof pair, 2026-07-21). This component now
// renders the three canon treatments; "nothing" is simply not mounting it.
//
//   variant="row"     (canon A) — plain back-row on the cream field: a
//     #FFFDF8 shadowed back circle (canon 42px, floored to the 52px tap
//     target) + the title 19/900 #341A13 + an optional right slot (status
//     pill etc). Used by detail/wizard screens (frames 10, 13-16, 18a-d).
//   variant="title"   (canon B) — plain title block: 24/900 #341A13 at
//     padding 8px 18px 4px, optional 15px sub-line (canon 14 → label floor)
//     and an optional right control (frames 11, 12, 19-23, 27).
//     `showBack` here is a NAVIGATION-SAFETY deviation: canon omits the
//     back on these frames, but a screen with no other escape keeps the
//     canon back-circle rather than stranding the pandit (no-dead-ends law).
//   variant="garland" (canon C) — the full 58px hanging marigold Toran,
//     nothing else (frames 1-3, 6, 24).
// ─────────────────────────────────────────────────────────────

export interface HeaderProps {
  variant?: "row" | "title" | "garland";
  title?: React.ReactNode;
  /** variant="title" only: the 15px hint line under the title (canon 14/700 #8A6F5C). */
  sub?: React.ReactNode;
  showBack?: boolean;
  onBack?: () => void;
  rightSlot?: React.ReactNode;
  /** canon frame 7 (OTP) draws a peach unshadowed back circle; default card. */
  backTone?: "card" | "peach";
  className?: string;
}

function BackCircle({ onBack, tone = "card" }: { onBack: () => void; tone?: "card" | "peach" }) {
  return (
    <button
      onClick={onBack}
      aria-label={t("common.back")}
      /* canon: 42px #FFFDF8 circle + 0 2px 8px shadow (A-rows) or 44px
         #FDEEE7 unshadowed (frame 7) — box floored to the 52px tap target. */
      className={`w-[52px] h-[52px] min-h-[52px] min-w-[52px] shrink-0 rounded-full flex items-center justify-center active:scale-90 transition-all focus:outline-none focus:ring-2 focus:ring-saffron-200 ${
        tone === "peach" ? "bg-saffron-50" : "bg-card shadow-card"
      }`}
    >
      <span className="material-symbols-outlined text-[24px] leading-none text-saffron-700" aria-hidden="true">
        arrow_back
      </span>
    </button>
  );
}

export function Header({
  variant = "row",
  title,
  sub,
  showBack = false,
  onBack,
  rightSlot,
  backTone,
  className,
}: HeaderProps) {
  const router = useRouter();
  const handleBack = onBack ?? (() => router.back());

  if (variant === "garland") {
    return (
      <header className={cn("shrink-0", className)}>
        <Toran variant="garland" count={11} />
      </header>
    );
  }

  if (variant === "title") {
    return (
      <header className={cn("sticky top-0 z-30 bg-cream shrink-0", className)}>
        <div className="flex items-center gap-3 px-[18px] pt-2 pb-1">
          {showBack && <BackCircle onBack={handleBack} tone={backTone} />}
          <div className="flex-1 min-w-0">
            <div className="text-[24px] font-black text-temple-700 font-hindi truncate">{title}</div>
            {sub != null && (
              <div className="text-[15px] font-bold text-softgrey font-hindi mt-0.5">{sub}</div>
            )}
          </div>
          {rightSlot}
        </div>
      </header>
    );
  }

  // variant="row" (canon A)
  return (
    <header className={cn("sticky top-0 z-30 bg-cream shrink-0", className)}>
      <div className="flex items-center gap-3 px-4 py-2">
        {showBack && <BackCircle onBack={handleBack} tone={backTone} />}
        <span className="text-[19px] font-black text-temple-700 font-hindi truncate">{title}</span>
        {rightSlot != null && <div className="ml-auto shrink-0">{rightSlot}</div>}
      </div>
    </header>
  );
}

export default Header;
