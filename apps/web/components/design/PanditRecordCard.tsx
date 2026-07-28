"use client";

import React from "react";
import { DesignIcon as Icon, PoojaVideoState } from "./Verification";

// ─────────────────────────────────────────────────────────────
// 1c · अभिलेख — THE RECORD
// Source: Claude Design "ग्राहक ऐप · Customer.dc.html", option 1c.
// Chosen (Isj, 2026-07-28) over 1a परिचय and 1b प्रमाण because the pilot's
// pandits mostly have no portrait and no reviewed pooja video yet: 1a would
// render a column of monograms and 1b a wall of grey "जाँच में" panels. The
// doc's own note — "survives weak photos, and 6 cards fit where 3 did" — is
// exactly the property this data needs.
//
// TRUTHFUL-NULL, applied per row: every row renders only when its fact is
// known. An absent row is honest; a row printed with a dash or a zero is the
// app inventing a claim. This is the same law the pandit app runs under, and
// it is why the per-pooja count is optional — the design doc itself flagged
// "the count of past poojas feels like a claim — soften it", and we do not
// have per-pooja completion data, so we simply do not assert it.
// ─────────────────────────────────────────────────────────────

export interface PanditRecord {
  id: string;
  /** Devanagari display name — rendered in the serif. */
  name: string;
  /** Roman transliteration, if we have one. Never machine-generated. */
  romanName?: string;
  photoUrl?: string;
  /** THE PERSON: Aadhaar checked by a human. */
  identityVerified: boolean;
  /** THIS ONE POOJA: the verification video for the pooja being searched. */
  poojaVideo: PoojaVideoState;
  poojaVideoDuration?: string;
  experienceYears?: number;
  /** Only pass this when a REAL per-pooja count exists. Never estimate it. */
  poojaCount?: number;
  locality?: string;
  city?: string;
  distanceKm?: number;
  /** His rate for this pooja. null/0 → "दक्षिणा तय नहीं", never a fake ₹0. */
  dakshina?: number | null;
}

function Monogram({ name }: { name: string }) {
  // First Devanagari cluster of his name — the pilot fallback for a pandit
  // who has not uploaded a photograph.
  const ch = (name || "").replace(/^पं\.?\s*/, "").trim().charAt(0) || "🙏";
  return (
    <span className="flex h-[54px] w-[54px] flex-none items-center justify-center rounded-full border border-hairline bg-saffron-tint font-devanagari text-[20px] font-semibold text-saffron">
      {ch}
    </span>
  );
}

function Row({
  icon,
  iconClass,
  filled,
  label,
  labelClass = "text-ink",
  value,
  valueNode,
}: {
  icon: string;
  iconClass: string;
  filled?: boolean;
  label: string;
  labelClass?: string;
  value?: string;
  valueNode?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2.5 border-t border-hairline-soft py-2.5">
      <Icon name={icon} size={18} filled={filled} className={iconClass} />
      <span className={`flex-1 text-[13.5px] font-medium ${labelClass}`}>{label}</span>
      {valueNode ?? (value ? <span className="text-[11.5px] font-medium text-muted">{value}</span> : null)}
    </div>
  );
}

export function PanditRecordCard({
  pandit,
  onOpenProfile,
  onWatchVideo,
}: {
  pandit: PanditRecord;
  onOpenProfile?: () => void;
  onWatchVideo?: () => void;
}) {
  const {
    name,
    romanName,
    photoUrl,
    identityVerified,
    poojaVideo,
    poojaVideoDuration,
    experienceYears,
    poojaCount,
    locality,
    city,
    distanceKm,
    dakshina,
  } = pandit;

  const hasDakshina = typeof dakshina === "number" && Number.isFinite(dakshina) && dakshina > 0;
  const place = [locality, city].filter(Boolean).join(", ");

  return (
    <article className="rounded-panel border border-hairline bg-white px-4 py-[15px]">
      {/* name + the one number */}
      <div className="flex items-center gap-3">
        {photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photoUrl}
            alt=""
            className="h-[54px] w-[54px] flex-none rounded-full border border-hairline object-cover"
          />
        ) : (
          <Monogram name={name} />
        )}

        <div className="min-w-0 flex-1">
          <div className="truncate font-devanagari text-[19px] font-semibold leading-[1.25] text-ink">
            {name}
          </div>
          {romanName && <div className="micro-label mt-0.5 truncate">{romanName}</div>}
        </div>

        <div className="flex-none text-right">
          {hasDakshina ? (
            <>
              <div className="tabular text-[22px] font-semibold leading-none text-ink">
                ₹{(dakshina as number).toLocaleString("en-IN")}
              </div>
              <div className="micro-label mt-[3px]">दक्षिणा</div>
            </>
          ) : (
            <div className="text-[12.5px] font-medium text-muted">दक्षिणा तय नहीं</div>
          )}
        </div>
      </div>

      {/* ── THE RECORD · संरचनात्मक जगह (structural room, turn 2) ──
          Five numbered slots in a fixed order. The card must be able to grow a
          travel/logistics line later WITHOUT being rebuilt — and must not hint
          at it now. So slot 5 is a SPEC, not a ghost element: at pilot it
          renders nothing at all, no placeholder, no dimmed row, no "coming
          soon". A reserved slot that draws something is just a promise.

            slot 1  person    पहचान
            slot 2  offering  इस पूजा का वीडियो
            slot 3  record    अनुभव · यह पूजा
            slot 4  place     क्षेत्र · दूरी      (in scope: ONE city)
            slot 5  reserved  renders nothing

          SCOPE LAW: distance within one city is in scope. Travel BETWEEN
          cities is not, and nothing here may imply it — hence the plain
          "आपसे N कि.मी." and no mode-of-travel, fare, or route language
          anywhere on this card. */}
      <div className="mt-3.5 flex flex-col">
        {/* THE PERSON — green only when a human actually checked his Aadhaar */}
        {identityVerified ? (
          <Row
            icon="verified_user"
            iconClass="text-tulsi"
            filled
            label="पहचान सत्यापित"
            value="आधार · मानव जाँच"
          />
        ) : (
          <Row
            icon="person"
            iconClass="text-placeholder"
            label="पहचान जाँच बाकी"
            labelClass="text-muted"
          />
        )}

        {/* THIS ONE POOJA — omitted entirely when he never submitted a video,
            because an absent claim is honest and a greyed one is not */}
        {poojaVideo === "verified" && (
          <Row
            icon="videocam"
            iconClass="text-saffron"
            label="इस पूजा का वीडियो"
            valueNode={
              <button
                onClick={onWatchVideo}
                className="text-[11.5px] font-semibold text-saffron underline underline-offset-2"
              >
                देखें{poojaVideoDuration ? ` · ${poojaVideoDuration}` : ""}
              </button>
            }
          />
        )}
        {poojaVideo === "pending" && (
          <Row
            icon="hourglass_empty"
            iconClass="text-placeholder"
            label="इस पूजा का वीडियो"
            labelClass="text-muted"
            value="जाँच में"
          />
        )}

        {/* experience — the per-pooja count appears ONLY if it is real */}
        {typeof experienceYears === "number" && experienceYears > 0 && (
          <Row
            icon="history"
            iconClass="text-muted"
            label={`${experienceYears} वर्ष अनुभव`}
            valueNode={
              typeof poojaCount === "number" && poojaCount > 0 ? (
                <span className="tabular text-[11.5px] font-medium text-muted">
                  यह पूजा {poojaCount}+ बार
                </span>
              ) : null
            }
          />
        )}

        {place && (
          <Row
            icon="location_on"
            iconClass="text-muted"
            label={place}
            labelClass="text-ink font-devanagari"
            value={
              typeof distanceKm === "number" && distanceKm > 0
                ? `आपसे ${Math.round(distanceKm)} कि.मी.`
                : undefined
            }
          />
        )}
        {/* slot 5 — RESERVED. Renders nothing at pilot, by design. When the
            logistics line arrives it is inserted HERE and no other row moves. */}
      </div>

      <button
        onClick={onOpenProfile}
        className="mt-3 min-h-[46px] w-full rounded-[11px] border-[1.5px] border-saffron-hair bg-white text-[14.5px] font-semibold text-saffron transition-colors hover:bg-saffron-tint"
      >
        प्रोफ़ाइल देखें
      </button>
    </article>
  );
}

export default PanditRecordCard;
