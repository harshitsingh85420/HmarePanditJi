import React from "react";

/* ─────────────────────────────────────────────────────────────
   THE TWO CLAIMS — and they are NOT the same claim.

   PAGE 16's ruling, and the design's own restatement of it:

     "'Verified' is a word the platform may only say about identity.
      The word never touches a video."

   · IdentityVerified — OUR claim. A human on our team checked an
     Aadhaar. It earns the green pill, and green appears nowhere else
     in the product.
   · SampleVideo — THE FAMILY'S judgement. We either watched it or we
     did not, and we say which. Neither state blocks booking, and the
     UNREVIEWED state is drawn in the SAME SHAPE as the reviewed one,
     because on day one every video is unreviewed. Drawn as a warning
     it would libel every pandit on the platform at launch.

   A customer-facing surface may never render a bare "Verified" — the
   two verifications are different promises and a customer who conflates
   them was misled by us, not by himself.
   ───────────────────────────────────────────────────────────── */

export function IdentityVerifiedBadge({ detail = false }: { detail?: boolean }) {
  return (
    <span
      className="hpj-label"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "3px 9px",
        borderRadius: "var(--hpj-r-chip)",
        background: "var(--hpj-verified-field)",
        color: "var(--hpj-verified)",
        fontWeight: 600,
        whiteSpace: "nowrap",
      }}
    >
      <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: 15 }}>
        verified_user
      </span>
      {/* NAMES WHICH VERIFICATION. Never the bare word. */}
      {detail ? "Identity verified — Aadhaar checked" : "Identity verified"}
    </span>
  );
}

/**
 * The sample video line.
 *
 * `reviewed` is the ops team's state, not a quality score. The copy for
 * FALSE is deliberately an invitation, not a caveat: the family is being
 * trusted to judge, which is the whole reason the booking gate was
 * removed.
 */
export function SampleVideoLine({
  reviewed,
  duration,
  compact = false,
}: {
  reviewed: boolean;
  duration?: string | null;
  compact?: boolean;
}) {
  return (
    <span style={{ display: "inline-flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
      <span
        className="hpj-body"
        style={{ display: "inline-flex", alignItems: "center", gap: 6, fontWeight: 600 }}
      >
        <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: 17, color: "var(--hpj-primary)" }}>
          videocam
        </span>
        Hear him perform this puja
        {duration ? <span className="hpj-label">· {duration}</span> : null}
      </span>
      <span className="hpj-label" style={{ lineHeight: 1.4 }}>
        {reviewed
          ? "Watched by our team"
          : "We haven't reviewed this video yet — listen and decide for yourself"}
      </span>
    </span>
  );
}

/**
 * DAY ONE HAS NO REVIEWS, AND WE SAY SO.
 *
 * The live API currently returns a `rating` and `totalReviews` on every
 * pandit (4.8/47, 4.7/15 …) while the Review table is EMPTY and every
 * pandit has completedBookings = 0. Those numbers are seed fabrication.
 * Rendering them would re-create exactly the class this redesign exists
 * to delete, so no component here accepts a rating prop at all — the
 * absence is structural, not a matter of remembering.
 */
export function NoReviewsYet() {
  return <span className="hpj-label">No reviews yet — we&rsquo;re new</span>;
}
