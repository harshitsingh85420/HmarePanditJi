"use client";

// ─────────────────────────────────────────────────────────────
// PopupPointer — guides the eye to the NATIVE browser permission
// popup (mic/location). We cannot highlight browser UI itself; a
// fixed, non-interactive arrow at the top of the viewport plus a
// chandan chip is the maximum possible guidance. Mount the moment
// getUserMedia/geolocation is invoked; unmount when the promise
// settles (either way). Reduced motion: the arrow stands still.
// ─────────────────────────────────────────────────────────────

import React from "react";
import { t } from "@/lib/i18n";

export function PopupPointer() {
  return (
    <div
      className="fixed inset-0 z-40 pointer-events-none flex flex-col items-center pt-3"
      aria-hidden="true"
    >
      <span className="pa-arrow-bounce text-[48px] leading-none text-gold select-none">⬆</span>
      <span className="mt-1 bg-cream border border-saffron-200 shadow-card rounded-full px-4 py-2 text-[18px] font-bold text-temple-600 font-hindi">
        {t("perm.pressAllow")}
      </span>
    </div>
  );
}

export default PopupPointer;
