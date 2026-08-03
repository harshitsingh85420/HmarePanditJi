"use client";

import React from "react";
import { PUJA_LABELS_EN, isPujaType } from "@hmarepanditji/types";

// ─────────────────────────────────────────────────────────────
// 4b · THE DOSSIER — batch 3, the first true mockup-match of Track 1.
// Source: docs/review/canon-cards/card-4b.html ("designed for the screenshot:
// brand strip inside the crop, attested rows, share on the card. His mother
// reads it without ever opening the app.")
//
// FOUR RULINGS COMPOSE ON THIS CARD, and where they contradict the artboard
// the RULING wins — each deviation named:
//
// 1. THE IDENTITY PILL IS KILLED. The artboard draws "Identity verified —
//    Aadhaar checked"; the same-day ruling (LISTED MEANS AADHAAR-PASSED — a
//    universal precondition is a door, not a badge) deletes it from customer
//    surfaces. Its slot now carries the DIFFERENTIATOR: per-pooja chips.
// 2. THE CARD MAY ONLY PROMISE WHAT THE FILTER CAN KEEP. The chips read
//    ACTIVE PujaService rows (what ?pujaType= can find), never raw
//    specializations — what you see is what search returns.
// 3. CITY, NOT KILOMETRES. No honest distance is computable on this surface
//    (no customer location exists here), and a TRUE city beats a FABRICATED
//    distance — fabricated-not-empty applies to kilometres too.
// 4. ENGLISH-FIRST. Roman name leads; the Devanagari sits beneath as the
//    canon's sanctioned accent — the previous card had them INVERTED.
//
// TWO MONEY DEVIATIONS FROM THE ARTBOARD, DECLARED: 4b prints "+ fee ₹210" —
// a 10% computed at the render site is A SECOND IMPLEMENTATION OF THE FEE
// MATH (money one-source law), so the wizard discloses the fee FROM THE
// SERVER at the moment it is charged. And 4b's "Goes entirely to Pandit ji"
// is RECURRING-GENERAL (ruled 2026-08-03): IF IT RECURS ON EVERY PROFILE, IT
// IS GENERAL — it belongs on the main/general page, said once; the card's
// money row shows the NUMBER. The booking review step already carries the
// platform-level promise where the fee is actually charged.
//
// TRUTHFUL-NULL, unchanged from 1c: a row renders only when its fact is
// known. Both pilot pandits have experienceYears 0 and languages [] — those
// rows are ABSENT, not zero-filled.
// ─────────────────────────────────────────────────────────────

export interface PanditRecordService {
  pujaType: string;
  poojaVerified: boolean;
  dakshinaAmount: number | null;
}

export interface PanditRecord {
  id: string;
  /** Display name as stored. Roman leads on the card. */
  name: string;
  /** Devanagari form, if we have one distinct from `name`. Never invented. */
  devanagariName?: string;
  photoUrl?: string;
  /** ACTIVE services — what the filter can keep. Never specializations. */
  services: PanditRecordService[];
  /** THE FILTER'S ECHO (ruled 2026-08-03): when the surface was reached via a
   *  filtered search, the customer already chose the pooja — the card may
   *  show THAT one chip beside the count, because it answers her exact
   *  question and cannot become a list at any n. Canonical pujaType or absent. */
  filterEcho?: string;
  /** The searched pooja's video state, resolved by the caller. */
  poojaVideo: "verified" | "pending" | "none";
  experienceYears?: number;
  city?: string;
  /** TRUE only when a REAL same-city computation exists — a SERVER-measured
   *  cityKey equality between a KNOWN vantage (her chosen city, or her
   *  geolocation's nearest served city) and the pandit's. Never guessed:
   *  no vantage → null → the true city renders. */
  sameCity?: boolean | null;
  /** the CityDistance matrix's km for (vantage, pandit-city), or null when
   *  no vantage exists or the matrix does not carry the pair. The ONLY
   *  source a printed kilometre may have. */
  distanceKm?: number | null;
  /** His rate for this pooja. null → honest absence, never a fake ₹0. */
  dakshina?: number | null;
  languages?: string[];
}

function Monogram({ name }: { name: string }) {
  // first cluster of the name, either script — the honest fallback for a
  // pandit with no photograph. Never a stock face.
  const ch = (name || "").replace(/^(पं|Pt)\.?\s*/i, "").trim().charAt(0) || "P";
  return (
    <span className="flex h-[76px] w-[76px] flex-none items-center justify-center rounded-xl border border-hairline bg-cream-warm text-[26px] font-semibold text-saffron">
      {ch}
    </span>
  );
}

const chipLabel = (t: string): string => (isPujaType(t) ? PUJA_LABELS_EN[t] : t);

export function PanditRecordCard({
  pandit,
  onOpenProfile,
  onWatchVideo,
}: {
  pandit: PanditRecord;
  onOpenProfile?: () => void;
  onWatchVideo?: () => void;
}) {
  const { name, devanagariName, photoUrl, services, filterEcho, poojaVideo, experienceYears, city, sameCity, distanceKm, dakshina, languages } = pandit;
  const hasDakshina = typeof dakshina === "number" && Number.isFinite(dakshina) && dakshina > 0;
  // THE CHIP LIST IS DEAD (ruled 2026-08-03): "Griha Pravesh" works at n=1 and
  // breaks at n=8 — the card is a SUMMARY, the profile is the DETAIL. What
  // survives: the COUNT, and at most the FILTER'S ECHO — the one chip that
  // answers the question the customer herself asked.
  const echo = filterEcho && services.find((s) => s.pujaType === filterEcho);
  // THE POOJA-VERIFIED COUNT: the count of video-approved poojas — the
  // differentiator, counted. Renders ONLY at >= 1: a zero count renders
  // NOTHING, because "0 poojas verified" is the zero-wearing-verified defect
  // ("0 verified ratings") reborn, and an absence is not a score.
  const verifiedCount = services.filter((s) => s.poojaVerified).length;
  // share renders only where the platform can actually share — a share button
  // that opens nothing is a dead control wearing the canon's icon
  const canShare = typeof navigator !== "undefined" && typeof navigator.share === "function";

  return (
    <article className="overflow-hidden rounded-panel border border-hairline bg-white">
      {/* ── the brand strip — inside the screenshot's crop, per 4b ── */}
      <div className="flex items-center justify-between bg-well px-3.5 py-2">
        <span className="text-[12px] font-semibold text-cream">HmarePanditJi</span>
        {/* C3's one ruled breach: the pilot label takes the darker tertiary */}
        <span className="text-[10px] font-medium uppercase tracking-micro text-placeholder">
          Delhi-NCR pilot
        </span>
      </div>

      {/* ── identity block: photo · Roman name · Devanagari accent ── */}
      <div className="flex gap-3 px-3.5 pb-3 pt-3.5">
        {photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photoUrl}
            alt=""
            className="h-[76px] w-[76px] flex-none rounded-xl border border-hairline object-cover"
          />
        ) : (
          <Monogram name={devanagariName || name} />
        )}
        <div className="min-w-0 flex-1">
          <div className="truncate text-[18px] font-semibold leading-[1.2] text-ink">{name}</div>
          {devanagariName && devanagariName !== name && (
            <div className="mt-0.5 truncate font-devanagari text-[13px] leading-[1.2] text-muted">
              {devanagariName}
            </div>
          )}
          {/* THE TRUST LINE — the SUMMARY: a count, and at most the filter's
              echo. WHICH poojas is the profile's job. The Devanagari accent is
              DROPPED here (ruled): the count is numeric and language-neutral,
              and a translated repeat of the same words is a stutter, not an
              accent. */}
          {(echo || verifiedCount >= 1) && (
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              {echo && (
                <span
                  className={`inline-flex items-center gap-1 rounded-pill px-2.5 py-1 text-[11px] font-semibold ${
                    echo.poojaVerified
                      ? "bg-tulsi-tint text-tulsi"
                      : "border border-hairline bg-cream text-ink"
                  }`}
                >
                  {echo.poojaVerified && (
                    <span className="material-symbols-outlined text-[12px]" aria-hidden="true">
                      check
                    </span>
                  )}
                  {chipLabel(echo.pujaType)}
                </span>
              )}
              {verifiedCount >= 1 && (
                <span className="text-[11px] font-semibold text-tulsi">
                  {verifiedCount} {verifiedCount === 1 ? "pooja" : "poojas"} verified
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── attested rows — only the facts we hold ── */}
      <div className="mx-3.5 border-t border-hairline-soft">
        {poojaVideo !== "none" && (
          <div className="flex items-center gap-2.5 border-b border-hairline-soft py-2.5">
            <span className="material-symbols-outlined text-[17px] text-saffron" aria-hidden="true">
              videocam
            </span>
            <span className="flex-1 text-[13px] font-medium text-ink">
              Hear him perform this puja
            </span>
            {onWatchVideo && (
              <button
                onClick={onWatchVideo}
                className="text-[11.5px] font-semibold text-saffron underline underline-offset-2"
              >
                Play
              </button>
            )}
          </div>
        )}
        {(experienceYears ?? 0) > 0 && (
          <div className="flex items-center gap-2.5 border-b border-hairline-soft py-2.5">
            <span className="material-symbols-outlined text-[17px] text-muted" aria-hidden="true">
              history
            </span>
            <span className="flex-1 text-[13px] font-medium text-ink">
              {experienceYears} yrs experience
            </span>
          </div>
        )}
        {city && (
          <div className="flex items-center gap-2.5 border-b border-hairline-soft py-2.5">
            <span className="material-symbols-outlined text-[17px] text-muted" aria-hidden="true">
              location_on
            </span>
            {/* THE HONESTY-LADDER (re-ruled 2026-08-03 after "In your city"
                rendered to a founder who was not in that city):
                  1. matrix km measured        → "~X km away"
                  2. vantage KNOWN and equal   → "In your city"
                  3. vantage known, no pair    → the TRUE city
                  4. no vantage at all         → the TRUE city
                NEVER the same-city line without a measured equality —
                a fabricated "near you" is exactly as false as fabricated
                kilometres. sameCity/distanceKm arrive SERVER-measured;
                this component cannot invent either. */}
            <span className="flex-1 text-[13px] font-medium text-ink">
              {sameCity === true
                ? "In your city"
                : typeof distanceKm === "number" && distanceKm > 0
                  ? `~${Math.round(distanceKm)} km away`
                  : city}
            </span>
          </div>
        )}
        {(languages?.length ?? 0) > 0 && (
          <div className="flex items-center gap-2.5 py-2.5">
            <span className="material-symbols-outlined text-[17px] text-muted" aria-hidden="true">
              translate
            </span>
            <span className="flex-1 text-[13px] font-medium text-ink">{languages!.join(" · ")}</span>
          </div>
        )}
      </div>

      {/* ── the money footer ── */}
      <div className="flex items-center justify-between gap-2.5 border-t border-hairline bg-cream px-3.5 py-3">
        <div className="min-w-0">
          {hasDakshina ? (
            <>
              {/* MONEY FLOOR: the price at 22px tabular, never below it */}
              <div className="tabular text-[22px] font-semibold leading-none text-ink">
                ₹{(dakshina as number).toLocaleString("en-IN")}{" "}
                <span className="text-[11.5px] font-normal text-muted">Dakshina</span>
              </div>
            </>
          ) : (
            <div className="text-[12.5px] font-medium text-muted">
              Rate not set for this ceremony
            </div>
          )}
        </div>
        <div className="flex flex-none gap-2">
          {canShare && (
            <button
              onClick={() =>
                navigator
                  .share({
                    title: name,
                    text: `${name} — HmarePanditJi`,
                    url: typeof location !== "undefined" ? `${location.origin}/pandit/${pandit.id}` : undefined,
                  })
                  .catch(() => {})
              }
              aria-label="Share this Pandit ji with family"
              className="flex min-h-cta w-[52px] items-center justify-center rounded-control border-[1.5px] border-hairline bg-white text-saffron"
            >
              <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
                ios_share
              </span>
            </button>
          )}
          <button
            onClick={onOpenProfile}
            className="min-h-cta rounded-control bg-saffron px-5 text-[14.5px] font-semibold text-white"
          >
            View
          </button>
        </div>
      </div>
    </article>
  );
}
