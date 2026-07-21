// ─────────────────────────────────────────────────────────────────────────────
// F11-04 — MINIMUM FLOOR PRICE PER POOJA TYPE (edge F11-2, anti race-to-bottom).
//
// WHY. Dakshina is pandit-set. With no server floor, one pandit undercutting to
// ₹1 drags the whole marketplace down and — worse for the persona — a 62-year-old
// who mis-speaks "ग्यारह सौ" and gets "11" saves ₹11 for a full katha with no one
// telling him. Client-side checks exist (readiness R1 blocks < ₹501) but the API
// accepted anything ≥ 0, so any other surface, a stale bundle, or curl bypassed it.
//
// ⚠️  THE NUMBERS BELOW ARE PLACEHOLDERS AWAITING FOUNDER SIGN-OFF. ⚠️
// We do NOT have market-rate data (that is exactly why register item F11-03,
// "market-rate benchmark per city tier", is still ❌/DEVIATION-candidate). What is
// being shipped here is the MECHANISM — one auditable table, enforced on every
// server write path, with an actionable Devanagari message. The VALUES are
// deliberately conservative and derived, not researched:
//
//   * BASE (₹501) is not invented. It is the platform-wide minimum that is
//     ALREADY live in three places — readiness.controller step-1 validation,
//     APP_FACTS.dakshinaMin (what शिष्य tells the pandit), and the R1 error
//     string. This table keeps it as the default so nothing regresses.
//   * HALF_DAY / FULL_DAY are small multiples of BASE, rounded to शगुन amounts
//     (…01). They are a shape to argue with, not a claim about the market.
//
// ERRING LOW IS THE SAFE DIRECTION. A floor set too HIGH blocks a real pandit
// from a price he is entitled to charge — an unrecoverable failure for him. A
// floor set too LOW merely makes the guard weak. So these sit near the existing
// ₹501 base until Isj replaces them with real numbers.
//
// TO REVISE: change ONLY this file. Every write path resolves through
// resolveDakshinaFloor(); there are no magic numbers at the call sites.
// If any floor is ever raised above APP_FACTS.dakshinaMin for a pooja शिष्य
// discusses, APP_FACTS/FACTS_SHEET_HI must be revisited too — otherwise the
// assistant quotes a minimum the API rejects.
//
// NOT DECIDED HERE (deliberately, to avoid inventing policy):
//   * The floor does NOT scale with teamSize. A 5-pandit विवाह arguably needs a
//     higher floor than a solo one; that is a pricing decision, not a bug fix.
//   * No upper bound is added (the existing ₹5,00,000 ceiling lives in the
//     readiness path only). Out of scope for F11-04, which is a floor.
// ─────────────────────────────────────────────────────────────────────────────

import { APP_FACTS } from "./shishyaFacts";

/**
 * Platform-wide floor — the number already live in readiness.controller and
 * quoted to the pandit by शिष्य. Every unrecognised pooja falls back to this.
 */
export const DAKSHINA_FLOOR_BASE = APP_FACTS.dakshinaMin; // ₹501

/** PLACEHOLDER tier — pooja that typically occupies a morning. Needs sign-off. */
export const DAKSHINA_FLOOR_HALF_DAY = 1101;

/** PLACEHOLDER tier — pooja that typically occupies a full day. Needs sign-off. */
export const DAKSHINA_FLOOR_FULL_DAY = 2101;

/** The eight canonical pooja ids (mirrors SPEC_LIST in the pandit readiness screen). */
export type CanonicalPoojaType =
  | "SATYANARAYAN"
  | "GRIHA_PRAVESH"
  | "VIVAH"
  | "MUNDAN"
  | "NAAMKARAN"
  | "HAVAN"
  | "RUDRABHISHEK"
  | "SHRADH";

/**
 * THE FLOOR TABLE — the single auditable source of minimum dakshina.
 * PLACEHOLDER VALUES: see the header. Mechanism is shipped; numbers await Isj.
 */
export const DAKSHINA_FLOOR_BY_POOJA_TYPE: Readonly<Record<CanonicalPoojaType, number>> = {
  SATYANARAYAN: DAKSHINA_FLOOR_HALF_DAY,
  GRIHA_PRAVESH: DAKSHINA_FLOOR_HALF_DAY,
  VIVAH: DAKSHINA_FLOOR_FULL_DAY,
  MUNDAN: DAKSHINA_FLOOR_BASE,
  NAAMKARAN: DAKSHINA_FLOOR_BASE,
  HAVAN: DAKSHINA_FLOOR_HALF_DAY,
  RUDRABHISHEK: DAKSHINA_FLOOR_HALF_DAY,
  SHRADH: DAKSHINA_FLOOR_HALF_DAY,
};

/**
 * Devanagari keywords per canonical id. Needed because the two write paths do
 * NOT agree on what a "pooja type" is:
 *   /pandit/dakshina-rates  → the canonical id ("SATYANARAYAN")   [readiness R1]
 *   /pandit/pooja-config    → the pandit's SPOKEN name ("सत्यनारायण कथा") [wizard]
 * A pandit may also say a synonym. Anything we cannot recognise gets the BASE
 * floor — never a guessed higher one, because guessing high blocks real work.
 */
const POOJA_TYPE_KEYWORDS: Readonly<Record<CanonicalPoojaType, readonly string[]>> = {
  SATYANARAYAN: ["सत्यनारायण"],
  GRIHA_PRAVESH: ["गृह प्रवेश", "गृहप्रवेश"],
  VIVAH: ["विवाह", "शादी"],
  MUNDAN: ["मुंडन", "मुण्डन"],
  NAAMKARAN: ["नामकरण"],
  HAVAN: ["हवन", "यज्ञ"],
  RUDRABHISHEK: ["रुद्राभिषेक", "अभिषेक"],
  SHRADH: ["श्राद्ध", "पिंडदान", "पिण्डदान"],
};

/**
 * Map a raw poojaType (canonical id OR free-text Devanagari name) to a canonical
 * id, or null when unrecognised. Never throws.
 */
export function canonicalisePoojaType(poojaType: string | undefined | null): CanonicalPoojaType | null {
  if (!poojaType) return null;
  const raw = String(poojaType).trim();
  if (!raw) return null;

  const asId = raw.toUpperCase().replace(/[\s-]+/g, "_");
  if (asId in DAKSHINA_FLOOR_BY_POOJA_TYPE) return asId as CanonicalPoojaType;

  for (const [id, words] of Object.entries(POOJA_TYPE_KEYWORDS) as Array<[CanonicalPoojaType, readonly string[]]>) {
    if (words.some((w) => raw.includes(w))) return id;
  }
  return null;
}

/** The minimum dakshina (whole rupees) allowed for this pooja type. */
export function resolveDakshinaFloor(poojaType: string | undefined | null): number {
  const id = canonicalisePoojaType(poojaType);
  return id ? DAKSHINA_FLOOR_BY_POOJA_TYPE[id] : DAKSHINA_FLOOR_BASE;
}

/**
 * Indian digit grouping, done locally rather than via toLocaleString("en-IN") so
 * the message is byte-identical on any runtime regardless of ICU build.
 * 501 → "501", 1101 → "1,101", 250000 → "2,50,000".
 */
export function formatRupees(n: number): string {
  const s = String(Math.round(Math.abs(n)));
  if (s.length <= 3) return s;
  const last3 = s.slice(-3);
  const rest = s.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ",");
  return `${rest},${last3}`;
}

/**
 * The message a 62-year-old priest can ACT on: it names the minimum and tells
 * him what to do, instead of saying "invalid". Also echoes what he entered so a
 * speech mis-recognition ("ग्यारह सौ" → 11) is visibly the cause.
 */
export function dakshinaFloorMessage(floor: number, attempted: number): string {
  return (
    `इस पूजा की दक्षिणा कम से कम ₹${formatRupees(floor)} होनी चाहिए। ` +
    `आपने ₹${formatRupees(attempted)} भरा है — कृपया ₹${formatRupees(floor)} या उससे ज़्यादा रखिए।`
  );
}

export type DakshinaFloorCheck =
  | { ok: true; floor: number }
  | { ok: false; floor: number; message: string };

/**
 * THE ONE CHECK every server write path calls. Non-numeric / negative amounts
 * fail the same way — a missing amount is below any floor.
 */
export function checkDakshinaFloor(poojaType: string | undefined | null, amount: unknown): DakshinaFloorCheck {
  const floor = resolveDakshinaFloor(poojaType);
  const n = typeof amount === "number" && Number.isFinite(amount) ? Math.round(amount) : NaN;
  if (!Number.isFinite(n) || n < floor) {
    return { ok: false, floor, message: dakshinaFloorMessage(floor, Number.isFinite(n) ? n : 0) };
  }
  return { ok: true, floor };
}
