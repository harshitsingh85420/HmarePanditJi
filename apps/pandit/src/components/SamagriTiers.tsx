"use client";

import { motion, useReducedMotion } from "framer-motion";

// SamagriTiers — skinned to SamagriTiers.dc.html. Tier tabs (बेसिक/स्टैंडर्ड/
// प्रीमियम, each with its ₹price), then the CUMULATIVE item list: items from
// lower tiers are shown INHERITED (greyed, opacity .72, a "बेसिक से" pill);
// the selected tier's own items are highlighted with a green "नया" pill and
// slide in. Transform/opacity-only; reduced-motion → no slide.
//
// Prices show ONLY when the pandit brings the samagri (supplyMode PANDIT_BRINGS)
// — the anti-fake rule; otherwise the tab shows no ₹.

export type SamagriTier = "BASIC" | "STANDARD" | "PREMIUM";

/**
 * F12-02 — the answer a pandit gives when no company binds for an item (नारियल,
 * फूल-माला). It is a REAL answer, not a blank: the API requires every item to
 * carry a company/brand, and "कोई भी" is how "any company will do" is said out
 * loud. Mirrors SAMAGRI_BRAND_ANY in services/api/src/lib/samagriItem.ts, which
 * is the one place the item shape is defined.
 */
export const SAMAGRI_BRAND_ANY = "कोई भी";

/**
 * F12-02: brand stays OPTIONAL in this type on purpose — it is the shape of an
 * item as READ, and packages saved before F12-02 have no brand. Every WRITE path
 * must fill it (with SAMAGRI_BRAND_ANY when no company binds) or the API 400s.
 */
export interface SamagriItem { emoji?: string; name: string; qty: string; brand?: string }
export interface TierData { tier: SamagriTier; label: string; price: number | null; items: SamagriItem[] }

const ORDER: SamagriTier[] = ["BASIC", "STANDARD", "PREMIUM"];

export function SamagriTiers({
  tiers,
  active,
  onSelect,
  showPrices = true,
}: {
  tiers: TierData[];
  active: SamagriTier;
  onSelect: (t: SamagriTier) => void;
  showPrices?: boolean;
}) {
  const reduce = useReducedMotion();
  const activeIdx = ORDER.indexOf(active);
  const byTier = (t: SamagriTier) => tiers.find((x) => x.tier === t);

  // cumulative rows: every tier up to and including the active one.
  // CANON (SamagriTiers.dc.html): `isNew = i === t && t > 0` — the "नया" pill
  // and its leaf #BFE3CC rule mark what THIS tier ADDS on top of a lower one.
  // At बेसिक there is nothing to add on top of, so canon draws those rows on
  // the plain #EADFCE hairline with no pill. The app was flagging every
  // non-inherited row as नया, which made बेसिक's own list read as an upgrade.
  const rows: Array<{ item: SamagriItem; fromLabel: string; inherited: boolean; isNew: boolean }> = [];
  for (let i = 0; i <= activeIdx; i++) {
    const td = byTier(ORDER[i]);
    if (!td) continue;
    const inherited = i < activeIdx;
    for (const item of td.items) rows.push({ item, fromLabel: td.label, inherited, isNew: !inherited && activeIdx > 0 });
  }

  return (
    <div className="flex flex-col gap-3.5 font-hindi">
      {/* tier tabs */}
      <div className="flex gap-2">
        {ORDER.map((tier) => {
          const td = byTier(tier);
          const isActive = tier === active;
          return (
            <button
              key={tier}
              onClick={() => onSelect(tier)}
              className={`flex-1 py-2.5 px-1.5 rounded-[14px] border-2 flex flex-col items-center gap-0.5 active:scale-[0.97] transition-transform ${
                isActive ? "bg-saffron-500 border-saffron-500 text-chandan" : "bg-card border-saffron-200 text-saffron-700"
              }`}
              aria-pressed={isActive}
            >
              <span className="font-extrabold text-[18px]">{td?.label ?? tier}</span>
              {showPrices && td?.price != null && <span className="font-bold text-[16px] opacity-85">₹{td.price.toLocaleString("en-IN")}</span>}
            </button>
          );
        })}
      </div>

      {/* cumulative item cards */}
      <div className="flex flex-col gap-[9px]">
        {rows.length === 0 && (
          <div className="text-[18px] text-softgrey font-medium py-4 text-center">अभी कोई सामान नहीं जोड़ा</div>
        )}
        {rows.map(({ item, fromLabel, inherited, isNew }, i) => (
          <motion.div
            key={`${fromLabel}-${item.name}-${i}`}
            initial={reduce || inherited ? false : { opacity: 0, x: 22 }}
            animate={{ opacity: inherited ? 0.72 : 1, x: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            // canon's three row states: inherited (#F4EFE6 / #E7DCC9), an
            // ADDITION over a lower tier (leaf #BFE3CC), and a tier's own
            // baseline rows, which sit on the plain #EADFCE hairline.
            className={`flex items-center gap-3 px-3.5 py-3 rounded-[15px] border-[1.5px] ${
              inherited ? "bg-[#F4EFE6] border-sand-200" : isNew ? "bg-card border-[#BFE3CC]" : "bg-card border-sand-100"
            }`}
          >
            <span className="text-[23px] leading-none">{item.emoji ?? "🔸"}</span>
            <div className="flex-1 flex flex-col gap-0.5 min-w-0">
              <span className={`text-[18px] font-bold ${inherited ? "text-softgrey" : "text-temple-700"}`}>{item.name}</span>
              <span className="text-[16px] text-softgrey truncate">
                {item.qty}
                {item.brand ? ` · ${item.brand}` : ""}
              </span>
            </div>
            {inherited ? (
              <span className="text-[14px] font-bold text-softgrey bg-[#EFE8DA] px-2.5 py-1 rounded-full whitespace-nowrap">{fromLabel} से</span>
            ) : isNew ? (
              <span className="text-[14px] font-extrabold text-leaf-700 bg-[#D6EEDE] px-2.5 py-1 rounded-full whitespace-nowrap">नया</span>
            ) : null}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
