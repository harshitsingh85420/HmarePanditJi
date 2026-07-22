import { PLATFORM_FEE_PERCENT } from "../config/constants";

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
