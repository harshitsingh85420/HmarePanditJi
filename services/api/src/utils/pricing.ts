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

/** PLATFORM_FEE_PERCENT of dakshina — charged to the CUSTOMER on top of the
    dakshina; never deducted from the pandit's payout (founder 2026-07-21). */
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
  // ── FOUNDER DECISION (2026-07-21): 100% TO PANDIT, SEPARATE CUSTOMER FEE ──
  // The पंडित जी receives the WHOLE dakshina — कोई कटौती नहीं. Platform
  // revenue is a SEPARATE platform fee (PLATFORM_FEE_PERCENT of dakshina)
  // charged to the CUSTOMER, added ON TOP of the dakshina — it NEVER reduces
  // the pandit's payout. This supersedes both the doc's 15% and the shipped
  // 90/10 model (see CONFLICT_RULINGS #7). Conservation:
  //     grandTotal (customer pays) = dakshina + platformFee + pass-throughs
  //     panditPayout (pandit gets) = dakshina + pass-throughs
  //     platformFee = grandTotal − panditPayout   (never touches payout)
  // GST on the fee is a platform-side concern (remitted out of the fee); the
  // customer sees दक्षिणा + प्लेटफ़ॉर्म शुल्क, no separate tax line.
  const travelServiceFee = 0; // ONE customer fee — no second travel charge
  const platformFeeGst = 0; // fee is GST-inclusive; no separate customer tax line
  const travelServiceFeeGst = 0;

  // Customer pays: dakshina + the platform fee (ON TOP) + all pass-throughs
  const grandTotal =
    dakshinaAmount +
    platformFee +
    travelCost +
    foodAllowanceAmount +
    accommodationCost;

  // Pandit receives: the FULL dakshina (100%) + all pass-throughs. The
  // platform fee is customer-paid and is NEVER subtracted here.
  const panditPayout = dakshinaAmount + travelCost + foodAllowanceAmount + accommodationCost;

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
 * Amount the pandit receives: the FULL dakshina (100%) + all pass-throughs.
 * The platform fee is customer-paid and is NEVER subtracted (founder decision
 * 2026-07-21, CONFLICT_RULINGS #7). `platformFee` is accepted for signature
 * compatibility but intentionally ignored — the payout must never depend on it.
 */
export function calculatePanditPayout(booking: {
  dakshinaAmount: number;
  platformFee: number;
  travelCost: number;
  foodAllowanceAmount: number;
  accommodationCost: number;
}): number {
  return (
    booking.dakshinaAmount +
    booking.travelCost +
    booking.foodAllowanceAmount +
    booking.accommodationCost
  );
}
