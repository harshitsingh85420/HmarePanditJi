"use client";

// ─────────────────────────────────────────────────────────────
// CEREMONY GUIDE ★ — Track 1, batch 2b. A NEW route.
//
// The canon marks this screen with a star and describes it exactly:
//   "Ceremony guide ★ — how long · how many sit · what to keep ready ·
//    who brings supplies · flat/havan notes"
// It sits in "I · Discover — no account", after Home and Choose-a-ceremony.
//
// THERE IS NO ARTBOARD FOR IT — as with Home. But the distinction that makes
// this buildable and Home not: Home has a LEGACY SHAPE, so re-laying it out
// would silently overwrite decisions someone already made. This route has no
// shape at all, so building it from the canon's description is CONSTRUCTION ON
// LICENSED GROUND, not a silent re-layout. Nothing is being overwritten.
//
// WHAT WE ACTUALLY HAVE, MEASURED (GET /rituals, 10 rows):
//   · how long .............. REAL (Ritual.durationHours)
//   · price range ........... REAL (basePriceMin/Max)
//   · how many sit .......... NO FIELD EXISTS
//   · what to keep ready .... no per-ceremony samagri (the catalogue is
//                             platform-wide; packages are per-PANDIT)
//   · who brings supplies ... per-pandit (PoojaConfig.supplyMode), not per
//                             ceremony — it is HIS choice, not the rite's
//   · flat/havan notes ...... NO FIELD EXISTS
// Four of the canon's five promises have no data behind them. They render as
// HONEST ABSENCE — never a placeholder shaped like data. The canon cut muhurat
// for exactly this reason; a guide that invents "20 people sit" would be the
// same defect wearing a helpful face.
// ─────────────────────────────────────────────────────────────

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { resolveApiBase } from "@hmarepanditji/utils";
import { PUJA_TYPES, PUJA_LABELS_EN, PUJA_LABELS_HI } from "@hmarepanditji/types";
import { SurfaceState } from "../../components/design-system/SurfaceState";

const API_BASE = resolveApiBase(
  process.env.NEXT_PUBLIC_API_URL,
  process.env.NODE_ENV === "development",
).base;

interface Ritual {
  name: string;
  nameHindi?: string | null;
  durationHours?: number | null;
  basePriceMin?: number | null;
  basePriceMax?: number | null;
}

/** The canon's five promises, and whether the platform can keep each one. */
const UNKNOWN_LINES = [
  "How many people can sit",
  "What to keep ready",
  "Who brings the samagri",
  "Flat / havan notes",
];

export default function CeremonyGuidePage() {
  const [rituals, setRituals] = useState<Ritual[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = React.useCallback(() => {
    setLoading(true);
    setFailed(false);
    fetch(`${API_BASE}/rituals`)
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.json();
      })
      .then((j) => {
        // TWIN-ENVELOPE CLASS (F-J4-3): this API has shipped both
        // `data: [...]` and `data: { rituals: [...] }`. Read both rather than
        // guess — a wrong guess here renders an empty guide over live rows.
        const rows: Ritual[] = Array.isArray(j?.data) ? j.data : (j?.data?.rituals ?? []);
        setRituals(rows);
        setLoading(false);
      })
      .catch(() => {
        // ERROR ≠ EMPTY. A failed fetch must never render as "no ceremonies".
        setFailed(true);
        setLoading(false);
      });
  }, []);

  useEffect(() => { load(); }, [load]);

  /** EXACT name match only — never fuzzy. A near-name is a reconciliation for
   *  a human, not a mapping for a program: coercing "Satyanarayan Puja" onto
   *  SATYANARAYAN is the silent value-guessing the vocabulary work exists to
   *  stop. An unmatched ceremony says so out loud. */
  const ritualFor = (label: string) => rituals?.find((r) => r.name === label) ?? null;

  return (
    <main className="hpj-root mx-auto w-full max-w-[720px] px-4 py-8">
      <header className="mb-6">
        <h1 className="text-display font-bold text-ink">Ceremony guide</h1>
        <p className="mt-2 text-body text-muted">
          What each ceremony involves — how long it runs and what it usually costs.
          Written plainly, so you know what you are booking before you book it.
        </p>
      </header>

      {loading ? (
        <SurfaceState kind="loading" subject="ceremonies" />
      ) : failed ? (
        <SurfaceState kind="error" subject="the ceremony guide" onRetry={load} />
      ) : (
        <div className="flex flex-col gap-4">
          {PUJA_TYPES.map((t) => {
            const label = PUJA_LABELS_EN[t];
            const r = ritualFor(label);
            return (
              <section
                key={t}
                className="rounded-card border border-hairline bg-cream p-4"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <div className="min-w-0">
                    {/* Roman leads; Devanagari beneath — the canon's accent. */}
                    <h2 className="text-section font-semibold text-ink">{label}</h2>
                    <p className="font-devanagari text-label text-muted">
                      {r?.nameHindi || PUJA_LABELS_HI[t]}
                    </p>
                  </div>
                  {/* MONEY FLOOR (C1 default): a price never renders below
                      14.5px. text-body is 14.5px; text-label/micro are barred
                      from carrying prices. */}
                  {r?.basePriceMin != null ? (
                    <p className="shrink-0 text-body font-semibold text-ink tabular">
                      ₹{r.basePriceMin.toLocaleString("en-IN")}
                      {r.basePriceMax != null ? `–₹${r.basePriceMax.toLocaleString("en-IN")}` : ""}
                    </p>
                  ) : null}
                </div>

                <dl className="mt-3 flex flex-col gap-1.5">
                  <div className="flex gap-2">
                    <dt className="text-label text-muted w-40 shrink-0">How long</dt>
                    <dd className="text-body text-ink">
                      {r?.durationHours != null
                        ? `about ${r.durationHours} ${r.durationHours === 1 ? "hour" : "hours"}`
                        : "Not recorded yet"}
                    </dd>
                  </div>
                  {/* THE HONEST ABSENCES. The canon promises these four; the
                      platform holds none of them. Saying "Not recorded yet" is
                      the whole point — a guide that invented them would be the
                      muhurat calendar again. */}
                  {UNKNOWN_LINES.map((k) => (
                    <div key={k} className="flex gap-2">
                      <dt className="text-label text-muted w-40 shrink-0">{k}</dt>
                      <dd className="text-body text-muted">Not recorded yet</dd>
                    </div>
                  ))}
                </dl>

                {!r && (
                  <p className="mt-3 rounded-panel bg-cream-warm px-3 py-2 text-label text-muted">
                    We do not have the details for this ceremony yet — you can still
                    book a Pandit ji for it.
                  </p>
                )}

                <Link
                  href={`/search?pujaType=${encodeURIComponent(t)}`}
                  className="mt-4 inline-flex min-h-cta items-center rounded-control bg-saffron px-5 text-body font-semibold text-white"
                >
                  Find a Pandit ji for {label}
                </Link>
              </section>
            );
          })}
        </div>
      )}
    </main>
  );
}
