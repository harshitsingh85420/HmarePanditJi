import {
  PLATFORM_FEE_PERCENT,
  TRAVEL_SERVICE_FEE_PERCENT,
  GST_PERCENT,
  FOOD_ALLOWANCE_PER_DAY,
} from "../config/constants";

export interface PriceBreakdown {
  dakshinaAmount: number;
  travelCost: number;
  foodAllowanceAmount: number;
  accommodationCost: number;
  platformFee: number;
  travelServiceFee: number;
  platformFeeGst: number;
  travelServiceFeeGst: number;
  grandTotal: number;
  panditPayout: number;
}

/** PLATFORM_FEE_PERCENT of dakshina — collected by platform */
export function calculatePlatformFee(dakshinaAmount: number): number {
  return Math.round(dakshinaAmount * (PLATFORM_FEE_PERCENT / 100));
}

/** TRAVEL_SERVICE_FEE_PERCENT of travel cost — collected by platform */
export function calculateTravelServiceFee(travelCost: number): number {
  if (travelCost <= 0) return 0;
  return Math.round(travelCost * (TRAVEL_SERVICE_FEE_PERCENT / 100));
}

/** GST_PERCENT on a given amount */
export function calculateGst(amount: number): number {
  return Math.round(amount * (GST_PERCENT / 100));
}

/**
 * Food allowance: ₹1,000 × applicable days
 * travelDays = number of travel days (pandit not at home)
 * pujaDays = number of days for the puja itself
 * customerProvidesMeals = true → no allowance
 */
export function calculateFoodAllowance(
  travelDays: number,
  pujaDays: number,
  customerProvidesMeals: boolean,
): number {
  if (customerProvidesMeals) return 0;
  const totalDays = travelDays + pujaDays;
  return totalDays * FOOD_ALLOWANCE_PER_DAY;
}

/**
 * Full price breakdown from first principles.
 * Note: GST applies only to platform fees, NOT to dakshina (religious service exempt).
 */
export function calculateGrandTotal(params: {
  dakshinaAmount: number;
  travelCost?: number;
  foodAllowanceAmount?: number;
  accommodationCost?: number;
}): PriceBreakdown {
  const dakshinaAmount = params.dakshinaAmount;
  const travelCost = params.travelCost ?? 0;
  const foodAllowanceAmount = params.foodAllowanceAmount ?? 0;
  const accommodationCost = params.accommodationCost ?? 0;

  const platformFee = calculatePlatformFee(dakshinaAmount);
  // ── FOUNDER DECISION: SINGLE-SIDED FEE ─────────────────────────────────
  // The dakshina IS the price. The customer pays exactly the dakshina plus
  // pass-throughs they opted into (travel / food / accommodation) — nothing
  // added on top. The platform's ONE commission (PLATFORM_FEE_PERCENT of
  // dakshina) is deducted from the pandit's payout; it is GST-inclusive
  // (the platform remits tax out of its own fee — the customer sees no tax
  // line). The old model double-charged: +10% on the customer AND −10% from
  // the pandit. शिष्य's promise — "दक्षिणा का 90% आपका, प्लेटफ़ॉर्म 10%" —
  // is now exactly the whole story.
  const travelServiceFee = 0; // ONE commission — no second customer-side charge
  const platformFeeGst = 0; // commission is GST-inclusive; no customer tax line
  const travelServiceFeeGst = 0;

  const grandTotal =
    dakshinaAmount +
    travelCost +
    foodAllowanceAmount +
    accommodationCost;

  // Pandit receives: dakshina minus the ONE fee, plus all pass-throughs
  const panditPayout = dakshinaAmount - platformFee + travelCost + foodAllowanceAmount + accommodationCost;

  return {
    dakshinaAmount,
    travelCost,
    foodAllowanceAmount,
    accommodationCost,
    platformFee,
    travelServiceFee,
    platformFeeGst,
    travelServiceFeeGst,
    grandTotal,
    panditPayout,
  };
}

/**
 * Refund policy:
 * > 7 days before event: 90% refund
 * 3–7 days before: 50% refund
 * 1–3 days before: 20% refund
 * Same day or after: 0% refund
 */
export function calculateRefundAmount(
  grandTotal: number,
  daysBeforeEvent: number,
): number {
  if (daysBeforeEvent > 7) return Math.round(grandTotal * 0.9);
  if (daysBeforeEvent >= 3) return Math.round(grandTotal * 0.5);
  if (daysBeforeEvent >= 1) return Math.round(grandTotal * 0.2);
  return 0;
}

/**
 * Net amount pandit receives after platform deductions.
 */
export function calculatePanditPayout(booking: {
  dakshinaAmount: number;
  platformFee: number;
  travelCost: number;
  foodAllowanceAmount: number;
  accommodationCost: number;
}): number {
  return (
    booking.dakshinaAmount -
    booking.platformFee +
    booking.travelCost +
    booking.foodAllowanceAmount +
    booking.accommodationCost
  );
}
