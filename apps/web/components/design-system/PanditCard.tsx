import React from "react";
import { IdentityVerifiedBadge, SampleVideoLine, NoReviewsYet } from "./Verification";

/* ─────────────────────────────────────────────────────────────
   THE RESULT CARD — two directions, for Isj to pick by eye.

   "The Introduction" (a quoted line from the pandit) is CUT: no field
   exists and ops cannot collect quotes at pilot scale. An empty quote
   is precisely the class of lie this redesign removes.

   WHAT THE LIVE DATA ACTUALLY GIVES US, which is less than the mockup
   assumed — the card is built for the real, sparse, day-one case:

     ✓ name, city, experienceYears, languages, verificationStatus
     ✓ per-ceremony dakshinaAmount, durationHours
     ✗ times-performed — completedBookings is 0 for EVERY pandit, so the
       mockup's "this puja 40+ times" row has nothing behind it. It is
       omitted rather than printed as "0+" (truthful-null: an absent
       fact renders no row, never a fabricated zero).
     ✗ rating / totalReviews — the API returns 4.8/47 and friends while
       the Review table is EMPTY. Fabricated seed. Never rendered; the
       props below do not even carry it.
     ✗ sample video — every pandit is poojaVerified:false, sampleVideoId
       null. The unreviewed state is not an edge case on day one, it is
       the ONLY state.
   ───────────────────────────────────────────────────────────── */

export interface PanditCardData {
  id: string;
  /** As stored. May be Roman ("Pt. Ramesh Sharma") or Devanagari. */
  name: string;
  /** Devanagari form, shown BENEATH the Roman one. Null when the stored
   *  name is already Devanagari — we never print the same string twice. */
  nameAccent?: string | null;
  city: string | null;
  identityVerified: boolean;
  experienceYears: number | null;
  languages: string[];
  /** The chosen ceremony's service, or null when he does not offer it. */
  service: {
    pujaType: string;
    dakshinaAmount: number | null;
    durationHours: number | null;
    sampleReviewed: boolean;
    sampleViewable: boolean;
    sampleDuration?: string | null;
  } | null;
  /** Real completed count for THIS ceremony. 0 renders nothing. */
  timesPerformed: number;
  platformFeePercent: number;
}

const rupee = (n: number) => `₹${n.toLocaleString("en-IN")}`;

function Facts({ d }: { d: PanditCardData }) {
  const bits: string[] = [];
  if (d.experienceYears) bits.push(`${d.experienceYears} yrs experience`);
  // omitted entirely at 0 — see the truthful-null note above
  if (d.timesPerformed > 0) bits.push(`this puja ${d.timesPerformed}+ times`);
  if (d.languages.length) bits.push(d.languages.join(" · "));
  if (d.city) bits.push(d.city);
  if (!bits.length) return null;
  return (
    <div className="hpj-label" style={{ display: "flex", flexWrap: "wrap", gap: "4px 10px", marginTop: 8 }}>
      {bits.map((b) => (
        <span key={b}>{b}</span>
      ))}
    </div>
  );
}

function Price({ d }: { d: PanditCardData }) {
  // NO RATE FOR THIS CEREMONY — a real condition in the live list.
  // It must read as "he doesn't do this one", not as a broken price.
  if (!d.service || d.service.dakshinaAmount == null) {
    return (
      <div style={{ marginTop: 10 }}>
        <span className="hpj-body" style={{ fontWeight: 600 }}>Rate not set for this ceremony</span>
        <span className="hpj-label" style={{ display: "block", marginTop: 2 }}>
          Pandit ji has not listed this puja yet — try another ceremony or another Pandit ji.
        </span>
      </div>
    );
  }
  const fee = Math.round((d.service.dakshinaAmount * d.platformFeePercent) / 100);
  return (
    <div style={{ marginTop: 10 }}>
      <span className="hpj-money">{rupee(d.service.dakshinaAmount)}</span>
      <span className="hpj-label" style={{ display: "block", marginTop: 2 }}>
        Dakshina — goes entirely to Pandit ji
      </span>
      <span className="hpj-label" style={{ display: "block" }}>+ platform fee {rupee(fee)}</span>
    </div>
  );
}

function NameBlock({ d, detail = false }: { d: PanditCardData; detail?: boolean }) {
  return (
    <div style={{ minWidth: 0 }}>
      <div className="hpj-section">{d.name}</div>
      {d.nameAccent ? <div className="hpj-accent-name">{d.nameAccent}</div> : null}
      {d.identityVerified ? (
        <div style={{ marginTop: 6 }}>
          <IdentityVerifiedBadge detail={detail} />
        </div>
      ) : null}
    </div>
  );
}

const CARD: React.CSSProperties = {
  background: "var(--hpj-surface)",
  border: "1px solid var(--hpj-rule)",
  borderRadius: "var(--hpj-r-card)",
  padding: 15,
};

/* ══ DIRECTION A · THE EVIDENCE ═══════════════════════════════
   Video-led: hear him before you read about him. The sample sits at the
   top as the primary object; facts follow. Bets that a voice converts
   better than a CV. */
export function PanditCardEvidence({ d }: { d: PanditCardData }) {
  return (
    <article className="hpj-root" style={CARD}>
      {d.service ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "10px 12px",
            borderRadius: "var(--hpj-r-control)",
            background: "#fff",
            border: "1px solid var(--hpj-rule)",
            marginBottom: 12,
          }}
        >
          <span
            aria-hidden="true"
            style={{
              flex: "none", width: 34, height: 34, borderRadius: "50%",
              background: "var(--hpj-primary)", color: "#fff",
              display: "grid", placeItems: "center",
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>play_arrow</span>
          </span>
          <SampleVideoLine
            reviewed={d.service.sampleReviewed}
            duration={d.service.sampleDuration ?? null}
          />
        </div>
      ) : null}

      <NameBlock d={d} />
      <Facts d={d} />
      <div style={{ marginTop: 8 }}><NoReviewsYet /></div>
      <Price d={d} />
    </article>
  );
}

/* ══ DIRECTION B · THE DOSSIER ════════════════════════════════
   Designed for the screenshot. A brand strip sits INSIDE the crop so a
   forwarded image still says who vouched; rows read as attested facts.
   Bets that the card's real job is to be sent to the family, not just
   tapped. */
export function PanditCardDossier({ d }: { d: PanditCardData }) {
  const Row = ({ icon, children }: { icon: string; children: React.ReactNode }) => (
    <div style={{ display: "flex", gap: 9, alignItems: "flex-start", padding: "7px 0", borderTop: "1px solid var(--hpj-rule)" }}>
      <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: 17, color: "var(--hpj-muted)", flex: "none" }}>
        {icon}
      </span>
      <span className="hpj-body" style={{ minWidth: 0 }}>{children}</span>
    </div>
  );

  const facts: string[] = [];
  if (d.experienceYears) facts.push(`${d.experienceYears} yrs`);
  if (d.timesPerformed > 0) facts.push(`this puja ${d.timesPerformed}+ times`);

  return (
    <article className="hpj-root" style={{ ...CARD, padding: 0, overflow: "hidden" }}>
      {/* brand strip INSIDE the crop — survives a screenshot */}
      <div
        style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "7px 14px", background: "var(--hpj-primary)", color: "#fff",
        }}
      >
        <span style={{ font: "600 12.5px/1 var(--hpj-font)" }}>HmarePanditJi</span>
        <span style={{ font: "500 11px/1 var(--hpj-font)", opacity: 0.85 }}>Delhi-NCR pilot</span>
      </div>

      <div style={{ padding: 15 }}>
        <NameBlock d={d} detail />

        <div style={{ marginTop: 12 }}>
          {d.service ? (
            <Row icon="videocam">
              {d.service.sampleReviewed
                ? "Hear him perform this puja — watched by our team"
                : "Video not reviewed yet — listen and decide"}
              {d.service.sampleDuration ? (
                <span className="hpj-label" style={{ display: "block" }}>Play · {d.service.sampleDuration}</span>
              ) : null}
            </Row>
          ) : null}
          {facts.length ? <Row icon="history">{facts.join(" · ")}</Row> : null}
          {d.city ? <Row icon="location_on">{d.city}</Row> : null}
          {d.languages.length ? <Row icon="translate">{d.languages.join(" · ")}</Row> : null}
          <Row icon="reviews"><NoReviewsYet /></Row>
        </div>

        <Price d={d} />
      </div>
    </article>
  );
}
