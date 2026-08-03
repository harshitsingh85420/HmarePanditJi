import assert from "node:assert";
import {
  SAMAGRI_TIERS,
  SAMAGRI_TIER_LABELS_HI,
  SAMAGRI_TIER_LABELS_EN,
  samagriTierLabel,
  isSamagriTier,
} from "@hmarepanditji/types";

// ─────────────────────────────────────────────────────────────────────────────
// THE SAMAGRI TIER VOCABULARY GUARD — born-by-ruling pairing, 2026-08-03.
//
// The pairing this pins has a birth certificate, not a citation: Isj's
// samagri-tiers build order (video-decoupling-design.md §3.1). Before it, the
// repo had THREE tier voices with no shared source — बेसिक/स्टैंडर्ड/प्रीमियम
// (wizard), Basic/Standard/Premium (standalone editor), and the bare
// PackageTier enum. This guard pins the ruled shape: TWO display voices, ONE
// stored value, one mapping in packages/types beside PUJA_LABELS. It imports
// the BUILT package — the same artifact plain node loads on Render — so a
// broken dist fails here, not in prod.
// ─────────────────────────────────────────────────────────────────────────────

// 1. Stored values are exactly the Prisma PackageTier enum's values, in order.
assert.deepStrictEqual(
  [...SAMAGRI_TIERS],
  ["BASIC", "STANDARD", "PREMIUM"],
  "stored tier values must be BASIC/STANDARD/PREMIUM — the PackageTier enum",
);

// 2. The pandit voice is the ruled Devanagari triplet.
assert.deepStrictEqual(
  SAMAGRI_TIER_LABELS_HI,
  { BASIC: "साधारण", STANDARD: "मानक", PREMIUM: "विशेष" },
  "pandit-side labels must be साधारण/मानक/विशेष — the born-by-ruling pairing",
);

// 3. The customer voice is Roman — grades translate; ritual words do not.
assert.deepStrictEqual(
  SAMAGRI_TIER_LABELS_EN,
  { BASIC: "Basic", STANDARD: "Standard", PREMIUM: "Premium" },
  "customer-side labels must be Basic/Standard/Premium",
);

// 4. samagriTierLabel follows pujaLabel's contract — both polarities.
assert.strictEqual(samagriTierLabel("STANDARD", "hi"), "मानक");
assert.strictEqual(samagriTierLabel("STANDARD", "en"), "Standard");
// negative polarity: an unknown value passes through UNTRANSLATED — a guessed
// tier would be a fabricated grade on a customer surface
assert.strictEqual(samagriTierLabel("DELUXE"), "DELUXE");
assert.strictEqual(isSamagriTier("DELUXE"), false);
assert.strictEqual(isSamagriTier("BASIC"), true);

console.log("✅ samagri tier vocabulary guard: 2 display voices, 1 stored value, unknowns pass through");
