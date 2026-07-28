"use client";

import React from "react";

// ─────────────────────────────────────────────────────────────
// दो सत्यापन · THE TWO VERIFICATIONS
// Source: Claude Design "ग्राहक ऐप · Customer.dc.html" — foundation panel 3.
//
// THE LAW: these two things are NOT the same claim and must never be able to
// collapse into one tick.
//
//   पहचान सत्यापित   THE PERSON.    Aadhaar checked by a human.
//                    Filled GREEN PILL, beside the NAME.
//   इस पूजा का वीडियो  THIS ONE POOJA. He filmed himself performing it and we
//                    reviewed it. OUTLINED SAFFRON RECTANGLE, beside the RATE —
//                    a property of the offering, not of the man.
//
// Different shape, different colour, different icon. Green is reserved for
// verified identity alone; it is never a generic "success" colour anywhere in
// this app.
//
// This mirrors a real defect found in the pandit app the same week: a single
// `verificationStatus === "VERIFIED"` condition was drawing BOTH the identity
// seal and the per-pooja tick, so a pooja still awaiting its own video review
// wore a green tick with nothing behind it. Two claims, two components, two
// data sources — enforced here by the type.
// ─────────────────────────────────────────────────────────────

/** What we actually know about a pandit's per-pooja video for ONE pooja. */
export type PoojaVideoState = "verified" | "pending" | "none";

function Icon({ name, size = 17, filled = false, className = "" }: { name: string; size?: number; filled?: boolean; className?: string }) {
  return (
    <span
      className={`material-symbols-outlined ${className}`}
      style={{ fontSize: size, lineHeight: 1, fontVariationSettings: filled ? "'FILL' 1" : undefined }}
      aria-hidden="true"
    >
      {name}
    </span>
  );
}

/**
 * THE PERSON — identity verified. Filled green pill.
 * Renders NOTHING when identity is not verified: an absent claim is honest,
 * a greyed-out claim invites the reader to assume it is coming.
 */
export function IdentityVerifiedPill({ verified, short = false }: { verified: boolean; short?: boolean }) {
  if (!verified) return null;
  return (
    <span className="inline-flex items-center gap-1.5 rounded-pill bg-tulsi-tint px-2.5 py-1 text-[12px] font-semibold text-tulsi">
      <Icon name="verified_user" size={15} filled />
      {short ? "पहचान" : "पहचान सत्यापित"}
    </span>
  );
}

/**
 * THIS ONE POOJA — the verification video. Outlined saffron rectangle when
 * verified; neutral tint when the video is in review; nothing at all when the
 * pandit never submitted one (no claim, no shape).
 *
 * NO TIME PROMISE on the pending state, ever. "जाँच में" says what is true;
 * it never says when it will end.
 */
export function PoojaVideoBadge({
  state,
  duration,
  onWatch,
}: {
  state: PoojaVideoState;
  duration?: string;
  onWatch?: () => void;
}) {
  if (state === "none") return null;

  if (state === "pending") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-chip bg-cream-tint px-3 py-1.5 text-[12.5px] font-semibold text-muted">
        <Icon name="hourglass_empty" size={17} />
        इस पूजा का वीडियो जाँच में
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-chip border-[1.5px] border-saffron-hair bg-white px-3 py-1.5 text-[12.5px] font-semibold text-saffron">
      <Icon name="videocam" size={17} />
      इस पूजा का वीडियो सत्यापित
      {onWatch && (
        <button onClick={onWatch} className="underline underline-offset-2">
          देखें{duration ? ` · ${duration}` : ""}
        </button>
      )}
    </span>
  );
}

/**
 * पैसा · ONE NUMBER.
 * The dakshina is the whole price. No fee line, no service charge, no surge —
 * the number on the card is the number the pandit receives (Ruling #7:
 * 100% of dakshina to the pandit; the platform fee is charged customer-side
 * and is never folded into this figure).
 *
 * Samagri and travel are settled directly with the pandit and are NEVER
 * added here and NEVER estimated.
 */
export function Dakshina({
  amount,
  align = "left",
  showNote = true,
}: {
  amount: number | null | undefined;
  align?: "left" | "right";
  showNote?: boolean;
}) {
  // TRUTHFUL-NULL: no invented ₹0, no "from ₹—". If we do not have his rate,
  // we say so rather than printing a number he never set.
  if (amount === null || amount === undefined || !Number.isFinite(amount) || amount <= 0) {
    return (
      <div className={align === "right" ? "text-right" : ""}>
        <div className="text-[13px] font-medium text-muted">दक्षिणा तय नहीं</div>
      </div>
    );
  }
  return (
    <div className={align === "right" ? "text-right" : ""}>
      <div className="tabular text-money font-semibold leading-none text-ink">
        ₹{amount.toLocaleString("en-IN")}
      </div>
      <div className="micro-label mt-1">दक्षिणा</div>
      {showNote && (
        <div className="micro-label mt-0.5 normal-case tracking-normal text-[11px]">
          ऑनलाइन · paid online
        </div>
      )}
    </div>
  );
}

/**
 * The money footnote that belongs with any dakshina figure on a decision
 * screen. Kept separate so it appears once per screen, not once per card.
 */
export function MoneyNote() {
  return (
    <div className="flex items-start gap-2.5 border-t border-dashed border-hairline pt-3">
      <Icon name="handshake" size={18} className="text-muted" />
      <div className="text-[13px] leading-[1.5] text-muted">
        सामग्री व यात्रा — पंडित जी से सीधे
        <span className="block text-[12px]">
          Samagri &amp; travel settled directly with the pandit. Never added here, never estimated.
        </span>
      </div>
    </div>
  );
}

/**
 * No stars anywhere until real reviews exist. This platform is new and says
 * so, rather than printing an empty five-star row that reads as zero.
 */
export function NoReviewsNotice() {
  return (
    <div className="flex items-center gap-2.5 rounded-card bg-cream-tint px-3.5 py-3">
      <Icon name="reviews" size={19} className="text-muted" />
      <div className="text-[13px] leading-[1.45] text-muted">
        अभी कोई समीक्षा नहीं — यह मंच नया है
        <span className="block text-[12px]">No stars anywhere until real reviews exist.</span>
      </div>
    </div>
  );
}

export { Icon as DesignIcon };
