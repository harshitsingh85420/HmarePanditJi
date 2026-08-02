"use client";

import React from "react";
import { DesignIcon as Icon } from "./Verification";

// ─────────────────────────────────────────────────────────────
// अतिथि · GUEST MODE
// Source: Claude Design "ग्राहक ऐप · Customer.dc.html", turn 2.
//
// THE LAW: "The paywall is at commitment, not at the door."
//
// So guest mode must never read as a restriction. It reads as an invitation
// with nothing withheld — it says what he CAN do, never what he can't. It is
// persistent and quiet: never a banner, never dismissible-and-nagging.
//
// AND THE PRICE IS NEVER A BARGAINING CHIP: no blur, no "login to see price",
// no teaser range. A guest sees the same ₹5,100 a registered user sees.
// guestMode.test.ts pins that — it is a rule about what must NOT exist, so it
// can only be held by a guard.
// ─────────────────────────────────────────────────────────────

/**
 * 2a (default) — the guest chip in the header, sitting with the search
 * context; it reads as a mode you are in.
 * 2b — the same promise at the thumb.
 *
 * Adopted as a declared default (2a) because on a long results list a fixed
 * bottom element shadows content for the whole scroll, and the doc asks for
 * "quiet". Swapping is one prop — nothing else changes.
 */
export function GuestStrip({ placement = "header" }: { placement?: "header" | "thumb" }) {
  const base =
    "flex items-center gap-2 rounded-[9px] bg-saffron-tint px-3 py-2.5 text-[12px] leading-[1.4] text-saffron";
  if (placement === "thumb") {
    return (
      <div className="sticky bottom-0 z-20 -mx-gutter px-gutter pb-3 pt-2">
        <div className={base}>
          <Icon name="explore" size={17} />
          <span className="font-semibold">Browse everything · account later</span>
        </div>
      </div>
    );
  }
  return (
    <div className={base}>
      <Icon name="explore" size={17} />
      <span className="font-semibold">Browse everything · account later</span>
    </div>
  );
}

// RealPricesNote ("सभी दाम असली हैं") DELETED — ruled kill (a), decide-or-go,
// 2026-08-02: "a platform announcing its own honesty manufactures doubt."
// The comment above it argued the line was "a promise about the absence of a
// dark pattern"; the ruling's answer is that the absence of a dark pattern is
// shown by the prices being real, not said beside them. Any line whose
// subject is the platform's own virtue is noise.

/**
 * THE ONE GATE — shown at "बुक करें", never before.
 *
 * "पंडित जी, तारीख और दाम — सब वैसे ही रहेंगे" is, in the design doc's own
 * words, "the whole trick": everything he chose is preserved through the gate,
 * AND he is told so out loud before he is asked for anything. A gate that
 * silently preserves state is still frightening; only the sentence removes the
 * fear of losing the choice he just made.
 */
export function BookingGatePromise() {
  return (
    <div className="rounded-card bg-cream-tint px-3.5 py-3">
      <div className="text-[13px] font-semibold text-ink">बुकिंग पक्की करने के लिए</div>
      <div className="mt-1 text-[12.5px] leading-[1.5] text-muted">
        पंडित जी, तारीख और दाम — सब वैसे ही रहेंगे
      </div>
    </div>
  );
}

export default GuestStrip;
