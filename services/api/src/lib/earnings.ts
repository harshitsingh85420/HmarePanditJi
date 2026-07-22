import { PLATFORM_FEE_PERCENT } from "../config/constants";

/**
 * Read the pandit's earnings from a booking's STORED financial columns — the
 * authoritative record of what the pandit is owed. Founder decision 2026-07-22:
 * display and payout paths NEVER recompute. `panditPayout`/`platformFee`/
 * `grandTotal` were frozen at booking-CREATION time, so an old 90/10 booking
 * keeps its historical numbers (showing/paying 100% on it would be a lie about
 * money already in the pandit's hand — truthful-state applies to history too).
 *
 * NULL/ZERO SAFETY: a booking written before the panditPayout column existed
 * (null/≤0) falls back to the current-model value (dakshina + pass-throughs)
 * AND sets `storedPayoutMissing` so callers/logs can SURFACE the anomaly —
 * never silently recompute.
 */
export function earningsFromStored(booking: {
  dakshinaAmount?: number | null;
  travelCost?: number | null;
  foodAllowanceAmount?: number | null;
  accommodationCost?: number | null;
  panditPayout?: number | null;
  platformFee?: number | null;
}): { platformFee: number; dakshinaNet: number; totalToPandit: number; storedPayoutMissing: boolean } {
  const dakshina = booking.dakshinaAmount ?? 0;
  const passThroughs =
    (booking.travelCost ?? 0) + (booking.foodAllowanceAmount ?? 0) + (booking.accommodationCost ?? 0);
  const stored = booking.panditPayout;
  const storedPayoutMissing = stored == null || stored <= 0;
  const totalToPandit = storedPayoutMissing ? dakshina + passThroughs : stored;
  const platformFee = booking.platformFee ?? 0;
  const dakshinaNet = Math.max(0, totalToPandit - passThroughs);
  return { platformFee, dakshinaNet, totalToPandit, storedPayoutMissing };
}

/**
 * CREATION-TIME ONLY. Computes a NEW booking's earnings from the dakshina at
 * the moment of booking. Must NEVER be called from a read/display or payout
 * path — use earningsFromStored there (guarded by displayReadsStored.test.ts).
 */
export function computeEarnings(booking: {
  dakshina?: number;
  travel?: number;
  food?: number;
  samagri?: number;
  dakshinaAmount?: number;
  travelAmount?: number;
  foodAllowance?: number;
  samagriAmount?: number;
}) {
  const dakshinaVal = booking.dakshina ?? booking.dakshinaAmount ?? 0;
  const travelVal = booking.travel ?? booking.travelAmount ?? 0;
  const foodVal = booking.food ?? booking.foodAllowance ?? 0;
  const samagriVal = booking.samagri ?? booking.samagriAmount ?? 0;

  // Founder decision 2026-07-21 (CONFLICT_RULINGS #7): the pandit keeps the
  // FULL dakshina — कोई कटौती नहीं. `platformFee` is the SEPARATE customer-paid
  // fee (informational here); it NEVER reduces what the pandit receives.
  const platformFee = Math.round(dakshinaVal * PLATFORM_FEE_PERCENT / 100);
  const dakshinaNet = dakshinaVal; // 100% to the pandit — no deduction
  const totalToPandit = dakshinaNet + travelVal + foodVal + samagriVal;

  return {
    platformFee, // customer-side fee, for reference — not subtracted above
    dakshinaNet,
    totalToPandit,
  };
}
