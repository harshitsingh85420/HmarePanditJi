"use client";

import React from "react";
import { t } from "@/lib/i18n";
import { getActiveFestival, type Festival } from "@/lib/festivals2026";

export interface FestivalBannerProps {
  /** Force a specific festival (used by /design); default resolves from today. */
  festival?: Festival | null;
}

export function FestivalBanner({ festival }: FestivalBannerProps) {
  const f = festival !== undefined ? festival : getActiveFestival();
  if (!f) return null;
  return (
    // CANON card vocabulary (frame 12's surfaces): the 22px raised radius on
    // a 1.5px sand hairline over canon's warm peach tile gradient, lifted by
    // the 6px/16px surface shadow rather than sitting flat on the cream.
    // LAW > CANON: the hint line is 18px, not the 16px `t-hint`.
    <div className="w-full rounded-surface bg-tile-peach border-[1.5px] border-sand shadow-surface px-4 py-3 flex items-center gap-4">
      <span className="text-[40px] leading-none select-none" role="img" aria-hidden="true">
        {f.emoji}
      </span>
      <div className="flex flex-col">
        <span className="text-[18px] font-bold text-temple-600 font-hindi leading-snug">
          {f.name} {t("festival.greeting")}
        </span>
        <span className="text-[18px] text-softgrey font-hindi leading-snug">{t("festival.hint")}</span>
      </div>
    </div>
  );
}

export default FestivalBanner;
