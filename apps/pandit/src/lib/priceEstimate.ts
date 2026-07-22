// PRICE-HONESTY METER — the computed truth, never a slogan. Every number here
// comes from the ACTUAL server costing rules (services/api/src/config/constants
// SELF_DRIVE_RATE_PER_KM / FOOD_ALLOWANCE_PER_DAY; utils/pricing is the one
// money source). priceEstimate.test greps the server files and FAILS THE BUILD
// if any of these drift — so the meter can never show a figure the server
// wouldn't charge. Rules that DON'T exist in code (hotel / train / flight
// fares) are shown as "बुकिंग पर तय", never invented.
//
// 100% TO PANDIT (founder decision 2026-07-21, CONFLICT_RULINGS #7): the
// pandit keeps the WHOLE dakshina — कोई कटौती नहीं. The platform fee is a
// SEPARATE charge the CUSTOMER pays on top; it never reduces this payout.
// So the meter's "आपको मिलेगा" is dakshina + pass-throughs, at 100%.

export const COSTING = {
  selfDriveRatePerKm: 12, // SELF_DRIVE_RATE_PER_KM
  foodAllowancePerDay: 1000, // FOOD_ALLOWANCE_PER_DAY
  platformFeePct: 0.10, // = PLATFORM_FEE_PERCENT/100 — the CUSTOMER-side fee, on top (guard enforces match); NOT deducted from the pandit
} as const;

// A typical local booking, used only to make the honesty estimate concrete.
const SAMPLE = { distanceKm: 100, days: 1 } as const;

export interface MeterPrefs {
  selfDrive: boolean;
  train: boolean;
  flight: boolean;
  dailyFoodAllowance: number | null; // null → the ₹1000/day default
  stayAtHome: boolean | null; // true घर पर · false होटल · null unset
}

export interface MeterLine {
  label: string;
  amount: number | null; // null = a real cost with NO code rule → shown as a note, not a number
  note?: string;
}

export type DemandLevel = "कम" | "मध्यम" | "ज़्यादा";

export interface MeterResult {
  total: number; // sum of the KNOWN (computed) lines only
  lines: MeterLine[];
  demandLevel: DemandLevel;
}

/** Estimate what a family pays on a SAMPLE booking, computed from the real
 *  costing rules. Unknown-rule costs are surfaced as notes, never numbers. */
export function estimateSampleBooking(prefs: MeterPrefs, dakshina: number): MeterResult {
  const lines: MeterLine[] = [];
  let total = 0;

  lines.push({ label: "दक्षिणा", amount: dakshina });
  total += dakshina;

  // Travel — only self-drive has a per-km rule in code. Flight/train fares are
  // arranged at booking (no rule → no invented number).
  if (prefs.selfDrive) {
    const travel = SAMPLE.distanceKm * 2 * COSTING.selfDriveRatePerKm; // round trip
    lines.push({ label: "यात्रा (अपनी गाड़ी, ~200 कि.मी.)", amount: travel });
    total += travel;
  } else if (prefs.flight) {
    lines.push({ label: "हवाई यात्रा", amount: null, note: "दाम बुकिंग पर तय" });
  } else if (prefs.train) {
    lines.push({ label: "ट्रेन", amount: null, note: "दाम बुकिंग पर तय" });
  }

  const food = (prefs.dailyFoodAllowance ?? COSTING.foodAllowancePerDay) * SAMPLE.days;
  lines.push({ label: "भोजन (1 दिन)", amount: food });
  total += food;

  // Accommodation — घर पर is a real ₹0; a hotel has no code rule (arranged later).
  if (prefs.stayAtHome === true) {
    lines.push({ label: "ठहराव (घर पर)", amount: 0 });
  } else if (prefs.stayAtHome === false) {
    lines.push({ label: "ठहराव (होटल)", amount: null, note: "दाम बुकिंग पर तय" });
  }

  // No fee line on this pandit-facing meter: the platform fee is customer-
  // paid, added on top at checkout, and never reduces the pandit's payout —
  // so the meter shows the pandit's full dakshina + pass-throughs.

  // Demand level for the 3-bar position: more higher-cost prefs → ज़्यादा माँग.
  let score = 0;
  if (prefs.flight) score += 2;
  else if (prefs.train) score += 1;
  if (prefs.stayAtHome === false) score += 2;
  if ((prefs.dailyFoodAllowance ?? COSTING.foodAllowancePerDay) > 1500) score += 1;
  const demandLevel: DemandLevel = score >= 3 ? "ज़्यादा" : score >= 1 ? "मध्यम" : "कम";

  return { total, lines, demandLevel };
}
