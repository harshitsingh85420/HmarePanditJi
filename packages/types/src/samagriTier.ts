// ─────────────────────────────────────────────────────────────
// THE SAMAGRI TIER VOCABULARY — born by ruling, 2026-08-03.
//
// This pairing has a birth certificate, not a citation. The design report
// (docs/review/video-decoupling-design.md §3.0) proved the "ledgered
// साधारण/मानक/विशेष pairing" existed NOWHERE — the only साधारण triplet in
// the repo was a hotel grade, and code showed बेसिक/स्टैंडर्ड/प्रीमियम in
// the wizard beside English Basic/Standard/Premium in the standalone
// editor: two display voices with no shared source. Isj's build order of
// 2026-08-03 IS the ruling that created this pairing.
//
// TWO DISPLAY VOICES, ONE STORED VALUE — pujaLabel's proven pattern:
// stored BASIC/STANDARD/PREMIUM (already the `PackageTier` enum on
// `SamagriPackage`, keyed @@unique(panditId, pujaType, tier)); the pandit
// acts in Devanagari (साधारण/मानक/विशेष); the customer reads Roman
// (Basic/Standard/Premium — tier names are GRADES, not ritual vocabulary,
// so unlike "Samagri" itself they translate without demeaning anything).
//
// THE CUMULATIVE LAW rides with the vocabulary (F12-01, registered):
// मानक ⊇ साधारण, विशेष ⊇ मानक — and therefore prices must be monotonic,
// साधारण ≤ मानक ≤ विशेष: cumulative items cannot cost less.
// ─────────────────────────────────────────────────────────────

/** The canonical stored value — matches the Prisma `PackageTier` enum. */
export const SAMAGRI_TIERS = ["BASIC", "STANDARD", "PREMIUM"] as const;

export type SamagriTierKey = (typeof SAMAGRI_TIERS)[number];

/** Pandit app — Devanagari. The interface he acts in. */
export const SAMAGRI_TIER_LABELS_HI: Record<SamagriTierKey, string> = {
  BASIC: "साधारण",
  STANDARD: "मानक",
  PREMIUM: "विशेष",
};

/** Customer app — Roman. Grades, not ritual words. */
export const SAMAGRI_TIER_LABELS_EN: Record<SamagriTierKey, string> = {
  BASIC: "Basic",
  STANDARD: "Standard",
  PREMIUM: "Premium",
};

export function isSamagriTier(v: unknown): v is SamagriTierKey {
  return typeof v === "string" && (SAMAGRI_TIERS as readonly string[]).includes(v);
}

/** Label for a stored value, in the app's own script. Unknown → the raw value. */
export function samagriTierLabel(v: string, script: "hi" | "en" = "hi"): string {
  if (!isSamagriTier(v)) return v;
  return script === "hi" ? SAMAGRI_TIER_LABELS_HI[v] : SAMAGRI_TIER_LABELS_EN[v];
}
