import React from "react";

/* ─────────────────────────────────────────────────────────────
   MONEY — TWO ZONES, ONE SEAM.

   The single most important honesty surface in the product. Two kinds
   of money exist and a customer must never confuse them:

     PAY NOW (white)      Dakshina + platform fee. Charged online.
     ON THE DAY (cream)   Samagri. Handed to Pandit ji. NEVER charged
                          online, and we never touch it.

   A dashed rule is the seam. The closing line — "Nothing else will be
   asked of you" — is the anti-ambush promise, printed rather than
   implied, because the fear it answers ("what will they add at the
   door?") is the reason people distrust this category at all.

   MODEL: the pandit receives 100% of the dakshina; the platform fee is
   charged to the CUSTOMER on top (Ruling #7). The copy states this
   plainly — "goes entirely to Pandit ji — we take nothing from it" —
   because it is true and it is the strongest thing we can say.

   Every figure here is SERVER-supplied. This component computes nothing
   beyond the total it is handed; display must equal charge.
   ───────────────────────────────────────────────────────────── */

export interface MoneyTwoZoneProps {
  dakshina: number;
  platformFee: number;
  /** Server's grandTotal. Passed in, never derived here. */
  totalNow: number;
  /** Omit entirely when the customer arranges samagri himself. */
  samagri?: { label: string; amount: number } | null;
}

const rupee = (n: number) => `₹${n.toLocaleString("en-IN")}`;

function Row({
  label,
  sub,
  amount,
  strong = false,
}: {
  label: string;
  sub?: string;
  amount: number;
  strong?: boolean;
}) {
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "baseline", padding: "9px 0" }}>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span className={strong ? "hpj-section" : "hpj-body"} style={{ display: "block" }}>
          {label}
        </span>
        {sub ? <span className="hpj-label" style={{ display: "block", marginTop: 2 }}>{sub}</span> : null}
      </span>
      <span
        className={strong ? "hpj-money" : "hpj-body"}
        style={{ fontVariantNumeric: "tabular-nums", fontWeight: 600, flex: "none" }}
      >
        {rupee(amount)}
      </span>
    </div>
  );
}

export function MoneyTwoZone({ dakshina, platformFee, totalNow, samagri }: MoneyTwoZoneProps) {
  return (
    <div className="hpj-root" style={{ borderRadius: "var(--hpj-r-card)", overflow: "hidden", border: "1px solid var(--hpj-rule)" }}>
      {/* ── ZONE 1 · online, white ─────────────────────────── */}
      <div style={{ background: "#fff", padding: "14px 16px 12px" }}>
        <div className="hpj-micro" style={{ marginBottom: 4 }}>Pay now — online</div>
        <Row
          label="Dakshina"
          sub="Goes entirely to Pandit ji — we take nothing from it"
          amount={dakshina}
        />
        <div style={{ borderTop: "1px solid var(--hpj-rule)" }} />
        <Row label="Platform fee" sub="Pays for verification and support" amount={platformFee} />
        <div style={{ borderTop: "1px solid var(--hpj-rule)" }} />
        <Row label="Total now" amount={totalNow} strong />
      </div>

      {/* ── THE SEAM ───────────────────────────────────────── */}
      {samagri ? (
        <>
          <div style={{ borderTop: "1.5px dashed var(--hpj-rule-strong)" }} />
          {/* ── ZONE 2 · on the day, cream ─────────────────── */}
          <div style={{ background: "var(--hpj-settle-field)", padding: "14px 16px" }}>
            <div className="hpj-micro" style={{ marginBottom: 4 }}>Settle directly on the day</div>
            <Row label={samagri.label} amount={samagri.amount} />
            <span className="hpj-label" style={{ display: "block", marginTop: 2 }}>
              You chose this package — hand it to Pandit ji on the day, never paid online.{" "}
              <strong style={{ color: "var(--hpj-ink)" }}>Nothing else will be asked of you.</strong>
            </span>
          </div>
        </>
      ) : null}
    </div>
  );
}
