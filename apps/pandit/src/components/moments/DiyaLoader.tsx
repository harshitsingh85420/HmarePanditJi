"use client";

import React from "react";
import { t } from "../../lib/i18n";
import { Diya } from "../ui/Diya";

export function DiyaLoader({ message, inline = false }: { message?: string; inline?: boolean } = {}) {
  if (inline) {
    // D1: compact waiting row (server waking) — no overlay, sits in flow
    return (
      <div className="flex items-center justify-center gap-3 px-4 py-2" role="status">
        {/* PHASE 1 beauty: the real canon lamp, not the 🪔 glyph */}
        <Diya size={30} />
        <span className="t-body font-semibold text-temple-600 font-hindi animate-pulse motion-reduce:animate-none">
          {message ?? t("common.loading")}
        </span>
      </div>
    );
  }
  return (
    <div className="fixed inset-0 z-50 bg-cream flex flex-col items-center justify-center gap-4">
      {/* PHASE 1 beauty: the canon brass lamp replaces the 🪔 glyph. The
          flame carries its own flicker/core/glow, so the old whole-emoji
          opacity pulse (which read as the lamp blinking) is retired. */}
      <div role="img" aria-label="loading">
        <Diya size={56} />
      </div>
      {/* Mockup frame 28: एक क्षण… 24/900 saffron-700 */}
      <p className="text-[24px] font-black text-saffron-700 font-hindi animate-pulse motion-reduce:animate-none">
        {message ?? t("common.loading")}
      </p>
    </div>
  );
}

export default DiyaLoader;
