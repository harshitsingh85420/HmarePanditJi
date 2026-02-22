/**
 * HmarePanditJi Pricing Utilities
 * All pricing calculations for bookings, refunds, and payouts
 */

import { PRICING, CANCELLATION_POLICY, TRAVEL } from './constants';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface PriceBreakdown {
    dakshinaAmount: number;
    samagriCost: number;
    travelCost: number;
    foodAllowanceAmount: number;
    accommodationCost: number;
    platformFee: number;
    platformFeeGst: number;
    travelServiceFee: number;
    travelServiceFeeGst: number;
    subtotal: number;
    grandTotal: number;
    panditPayout: number;
}

export interface RefundCalculation {
    grandTotal: number;
    refundableAmount: number;
    refundPercent: number;
    policyLabel: string;
    platformFeeRetained: number;
    daysUntilEvent: number;
}

// ─── Calculate Platform Fee ──────────────────────────────────────────────────

/**
 * Calculate 15% platform fee on dakshina amount
 * @param dakshinaAmount - Dakshina (priest fee) in rupees
 * @returns Platform fee amount
 */
export function calculatePlatformFee(dakshinaAmount: number): number {
    return Math.round(dakshinaAmount * (PRICING.PLATFORM_FEE_PERCENT / 100));
}

// ─── Calculate Travel Service Fee ────────────────────────────────────────────

/**
 * Calculate 5% travel service fee on travel cost
 * @param travelCost - Total travel cost in rupees
 * @returns Travel service fee amount
 */
export function calculateTravelServiceFee(travelCost: number): number {
    if (travelCost === 0) return 0;
    return Math.round(travelCost * (PRICING.TRAVEL_SERVICE_FEE_PERCENT / 100));
}

// ─── Calculate GST ───────────────────────────────────────────────────────────

export function calculateGST(amount: number): number {
    return Math.round(amount * (PRICING.GST_PERCENT / 100));
}

// ─── Calculate Food Allowance ────────────────────────────────────────────────

/**
 * Calculate food allowance based on travel days and event days
 * @param travelDays - Number of travel days (calculated from distance)
 * @param eventDays - Number of event days
 * @param includeTravelDays - Whether to include travel days (PLATFORM_ALLOWANCE)
 * @returns Total food allowance
 */
export function calculateFoodAllowance(
    travelDays: number,
    eventDays: number,
    includeTravelDays: boolean
): number {
    const totalDays = includeTravelDays ? travelDays + eventDays : eventDays;
    return totalDays * PRICING.FOOD_ALLOWANCE_PER_DAY;
}

// ─── Calculate Travel Days ───────────────────────────────────────────────────

/**
 * Calculate number of travel days based on distance
 * Assumes max 400km per day
 * @param distanceKm - One-way distance in kilometers
 * @returns Number of travel days (includes return journey)
 */
export function calculateTravelDays(distanceKm: number): number {
    if (distanceKm === 0) return 0;
    const oneWayDays = Math.ceil(distanceKm / TRAVEL.MAX_DRIVE_KM_PER_DAY);
    return oneWayDays * 2; // Round trip
}

// ─── Calculate Self-Drive Cost ───────────────────────────────────────────────

/**
 * Calculate self-drive cost (₹12/km round trip)
 * @param distanceKm - One-way distance
 * @returns Total driving cost
 */
export function calculateSelfDriveCost(distanceKm: number): number {
    const roundTripKm = distanceKm * 2;
    return Math.round(roundTripKm * PRICING.SELF_DRIVE_RATE_PER_KM);
}

// ─── Calculate Train Cost ────────────────────────────────────────────────────

/**
 * Calculate train fare based on distance bands (3AC round trip + local cab)
 * @param distanceKm - One-way distance
 * @returns Total train travel cost
 */
export function calculateTrainCost(distanceKm: number): number {
    let baseFare: number = TRAVEL.TRAIN_FARES.BAND_4.fare;

    if (distanceKm <= TRAVEL.TRAIN_FARES.BAND_1.maxKm) {
        baseFare = TRAVEL.TRAIN_FARES.BAND_1.fare;
    } else if (distanceKm <= TRAVEL.TRAIN_FARES.BAND_2.maxKm) {
        baseFare = TRAVEL.TRAIN_FARES.BAND_2.fare;
    } else if (distanceKm <= TRAVEL.TRAIN_FARES.BAND_3.maxKm) {
        baseFare = TRAVEL.TRAIN_FARES.BAND_3.fare;
    }

    // Add local cab cost at destination
    return baseFare + TRAVEL.LOCAL_CAB_AT_DESTINATION.TRAIN;
}

// ─── Calculate Flight Cost ───────────────────────────────────────────────────

/**
 * Calculate flight fare based on distance bands (economy round trip + cab)
 * @param distanceKm - One-way distance
 * @returns Total flight travel cost
 */
export function calculateFlightCost(distanceKm: number): number {
    let baseFare: number = TRAVEL.FLIGHT_FARES.BAND_4.fare;

    if (distanceKm <= TRAVEL.FLIGHT_FARES.BAND_1.maxKm) {
        baseFare = TRAVEL.FLIGHT_FARES.BAND_1.fare;
    } else if (distanceKm <= TRAVEL.FLIGHT_FARES.BAND_2.maxKm) {
        baseFare = TRAVEL.FLIGHT_FARES.BAND_2.fare;
    } else if (distanceKm <= TRAVEL.FLIGHT_FARES.BAND_3.maxKm) {
        baseFare = TRAVEL.FLIGHT_FARES.BAND_3.fare;
    }

    // Add airport cab cost
    return baseFare + TRAVEL.LOCAL_CAB_AT_DESTINATION.FLIGHT;
}

// ─── Calculate Cab Cost ──────────────────────────────────────────────────────

/**
 * Calculate local cab cost for short distances (<300km)
 * @param distanceKm - One-way distance
 * @returns Total cab cost (round trip)
 */
export function calculateCabCost(distanceKm: number): number {
    if (distanceKm >= 300) {
        throw new Error('Cab mode only available for distances <300km');
    }
    const roundTripKm = distanceKm * 2;
    return Math.round(roundTripKm * TRAVEL.LOCAL_CAB_RATE_PER_KM);
}

// ─── Calculate Complete Price Breakdown ──────────────────────────────────────

/**
 * Calculate complete price breakdown for a booking
 * @param params - All pricing parameters
 * @returns Complete price breakdown
 */
export function calculatePriceBreakdown(params: {
    dakshinaAmount: number;
    samagriCost?: number;
    travelCost?: number;
    foodAllowanceAmount?: number;
    accommodationCost?: number;
}): PriceBreakdown {
    const {
        dakshinaAmount,
        samagriCost = 0,
        travelCost = 0,
        foodAllowanceAmount = 0,
        accommodationCost = 0,
    } = params;

    // Calculate fees
    const platformFee = calculatePlatformFee(dakshinaAmount);
    const platformFeeGst = calculateGST(platformFee);
    const travelServiceFee = calculateTravelServiceFee(travelCost);
    const travelServiceFeeGst = calculateGST(travelServiceFee);

    // Calculate totals
    const subtotal = dakshinaAmount + samagriCost + travelCost + foodAllowanceAmount + accommodationCost;
    const grandTotal = subtotal + platformFee + platformFeeGst + travelServiceFee + travelServiceFeeGst;

    // Calculate pandit payout (dakshina + travel reimbursements, minus platform fee)
    const panditPayout = dakshinaAmount + travelCost + foodAllowanceAmount + accommodationCost;

    return {
        dakshinaAmount,
        samagriCost,
        travelCost,
        foodAllowanceAmount,
        accommodationCost,
        platformFee,
        platformFeeGst,
        travelServiceFee,
        travelServiceFeeGst,
        subtotal,
        grandTotal,
        panditPayout,
    };
}

// ─── Calculate Pandit Payout ─────────────────────────────────────────────────

/**
 * Calculate what pandit receives after puja completion
 * Formula: dakshina + travelCost + foodAllowance + accommodation
 * (Platform fee is deducted from customer payment, not pandit payout)
 */
export function calculatePanditPayout(params: {
    dakshinaAmount: number;
    travelCost?: number;
    foodAllowanceAmount?: number;
    accommodationCost?: number;
}): number {
    const {
        dakshinaAmount,
        travelCost = 0,
        foodAllowanceAmount = 0,
        accommodationCost = 0,
    } = params;

    return dakshinaAmount + travelCost + foodAllowanceAmount + accommodationCost;
}

// ─── Calculate Refund Amount ─────────────────────────────────────────────────

/**
 * Calculate refund amount based on cancellation policy
 * Policy:
 * - >7 days: 90% refund
 * - 3-7 days: 50% refund
 * - <3 days: 20% refund
 * - Same day: 0% refund
 * - Platform fee is non-refundable in all cases
 * 
 * @param grandTotal - Total amount paid
 * @param eventDate - Event date
 * @param cancellationDate - Cancellation request date (defaults to now)
 * @returns Refund calculation details
 */
export function calculateRefundDetailed(
    grandTotal: number,
    eventDate: Date,
    cancellationDate: Date = new Date()
): RefundCalculation {
    // Calculate days until event
    const timeDiff = eventDate.getTime() - cancellationDate.getTime();
    const daysUntilEvent = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

    let refundPercent = 0;
    let policyLabel = '';

    if (daysUntilEvent > 7) {
        refundPercent = CANCELLATION_POLICY.MORE_THAN_7_DAYS.refundPercent;
        policyLabel = CANCELLATION_POLICY.MORE_THAN_7_DAYS.label;
    } else if (daysUntilEvent >= 3) {
        refundPercent = CANCELLATION_POLICY.BETWEEN_3_AND_7_DAYS.refundPercent;
        policyLabel = CANCELLATION_POLICY.BETWEEN_3_AND_7_DAYS.label;
    } else if (daysUntilEvent >= 1) {
        refundPercent = CANCELLATION_POLICY.LESS_THAN_3_DAYS.refundPercent;
        policyLabel = CANCELLATION_POLICY.LESS_THAN_3_DAYS.label;
    } else {
        refundPercent = CANCELLATION_POLICY.SAME_DAY.refundPercent;
        policyLabel = CANCELLATION_POLICY.SAME_DAY.label;
    }

    const refundableAmount = Math.round(grandTotal * (refundPercent / 100));
    const platformFeeRetained = grandTotal - refundableAmount;

    return {
        grandTotal,
        refundableAmount,
        refundPercent,
        policyLabel,
        platformFeeRetained,
        daysUntilEvent,
    };
}

// ─── Format Currency ─────────────────────────────────────────────────────────

/**
 * Format amount in Indian currency format
 * @param amount - Amount in rupees
 * @param showSymbol - Whether to show ₹ symbol
 * @returns Formatted string
 */
export function formatCurrency(amount: number, showSymbol: boolean = true): string {
    const formatted = new Intl.NumberFormat('en-IN', {
        style: showSymbol ? 'currency' : 'decimal',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);

    return formatted;
}

// ─── Calculate Event Duration ────────────────────────────────────────────────

/**
 * Calculate number of days for an event
 * @param eventDate - Start date
 * @param eventEndDate - End date (optional, defaults to same day)
 * @returns Number of event days
 */
export function calculateEventDays(eventDate: Date, eventEndDate?: Date): number {
    if (!eventEndDate) return 1;

    const timeDiff = eventEndDate.getTime() - eventDate.getTime();
    const days = Math.ceil(timeDiff / (1000 * 60 * 60 * 24)) + 1; // +1 to include start day

    return Math.max(1, days);
}

// ─── Validate Pricing ────────────────────────────────────────────────────────

/**
 * Validate that all pricing components are non-negative
 * @param breakdown - Price breakdown to validate
 * @throws Error if any value is negative
 */
export function validatePricing(breakdown: PriceBreakdown): void {
    const fields: (keyof PriceBreakdown)[] = [
        'dakshinaAmount',
        'samagriCost',
        'travelCost',
        'foodAllowanceAmount',
        'accommodationCost',
        'platformFee',
        'platformFeeGst',
        'travelServiceFee',
        'travelServiceFeeGst',
        'grandTotal',
        'panditPayout',
    ];

    for (const field of fields) {
        const value = breakdown[field];
        if (typeof value === 'number' && value < 0) {
            throw new Error(`Invalid pricing: ${field} cannot be negative (got ${value})`);
        }
    }

    // Validate grand total calculation
    const expectedGrandTotal =
        breakdown.dakshinaAmount +
        breakdown.samagriCost +
        breakdown.travelCost +
        breakdown.foodAllowanceAmount +
        breakdown.accommodationCost +
        breakdown.platformFee +
        breakdown.platformFeeGst +
        breakdown.travelServiceFee +
        breakdown.travelServiceFeeGst;

    if (Math.abs(breakdown.grandTotal - expectedGrandTotal) > 1) {
        throw new Error(
            `Invalid pricing: grand total mismatch (expected ${expectedGrandTotal}, got ${breakdown.grandTotal})`
        );
    }
}
