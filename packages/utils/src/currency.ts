/**
 * HmarePanditJi Currency Utilities
 * ALL money functions work in PAISE (integers only).
 * 1 rupee = 100 paise. Never use float for money.
 */

// ─── Format Paise to Display ─────────────────────────────────────────────────

/**
 * Convert paise integer to Indian formatted rupee string.
 * Indian format: 1,00,000 (not 100,000)
 *
 * @param paise - Amount in paise (integer)
 * @returns Formatted string like "₹1,500" or "₹1,00,000"
 *
 * @example
 * formatRupees(150000)   // "₹1,500"
 * formatRupees(10000000) // "₹1,00,000"
 * formatRupees(50000)    // "₹500"
 */
export function formatRupees(paise: number): string {
    if (!Number.isInteger(paise)) {
        throw new Error('Amount must be integer paise, got: ' + paise);
    }
    const rupees = Math.floor(paise / 100);
    const intPart = rupees.toString();
    const lastThree = intPart.slice(-3);
    const rest = intPart.slice(0, -3);
    const formatted = rest
        ? rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + lastThree
        : lastThree;
    return '₹' + formatted;
}

/**
 * Convert rupees to paise (integer).
 * ₹500 → 50000 paise
 */
export function rupeesToPaise(rupees: number): number {
    return Math.round(rupees * 100);
}

/**
 * Convert paise to rupees (for calculations only, not display).
 * 50000 paise → 500
 */
export function paiseToRupees(paise: number): number {
    return paise / 100;
}

// ─── GST Calculation ─────────────────────────────────────────────────────────

/**
 * Calculate GST (18%) on amount in paise — returns integer.
 * IMPORTANT: GST EXEMPT for dakshina (priest fee). Only apply to:
 * - Platform service fee
 * - Travel service fee
 * - Samagri service fee
 *
 * @param amountPaise - Taxable amount in paise
 * @param gstPercent - GST percentage, defaults to 18
 * @returns GST amount in paise (integer)
 */
export function calculateGSTPaise(amountPaise: number, gstPercent: number = 18): number {
    return Math.floor(amountPaise * gstPercent / 100);
}

// ─── Invoice Number ──────────────────────────────────────────────────────────

/**
 * Generate GST invoice number: HPJ-2024-00001
 */
export function generateInvoiceNumber(sequenceNum: number): string {
    const year = new Date().getFullYear();
    return `HPJ-${year}-${sequenceNum.toString().padStart(5, '0')}`;
}

// ─── Full Money Breakdown ────────────────────────────────────────────────────

export interface MoneyBreakdownInput {
    dakshinaPaise: number;
    samagriPaise?: number;
    travelPaise?: number;
    foodAllowancePaise?: number;
    accommodationPaise?: number;
    platformCommissionPercent?: number;
    travelServiceFeePercent?: number;
    samagriServiceFeePercent?: number;
    backupFeePaise?: number;
}

export interface MoneyBreakdownResult {
    dakshinaPaise: number;
    samagriPaise: number;
    travelPaise: number;
    foodAllowancePaise: number;
    accommodationPaise: number;
    platformFeePaise: number;
    travelServiceFeePaise: number;
    samagriServiceFeePaise: number;
    backupFeePaise: number;
    gstPaise: number;          // Total GST on all service fees (not dakshina!)
    totalPaise: number;
}

/**
 * Calculate complete money breakdown for a booking.
 * All inputs and outputs in PAISE. Dakshina is GST EXEMPT.
 */
export function calculateMoneyBreakdown(input: MoneyBreakdownInput): MoneyBreakdownResult {
    const {
        dakshinaPaise,
        samagriPaise = 0,
        travelPaise = 0,
        foodAllowancePaise = 0,
        accommodationPaise = 0,
        platformCommissionPercent = 20,
        travelServiceFeePercent = 10,
        samagriServiceFeePercent = 8,
        backupFeePaise = 0,
    } = input;

    // Platform fee on dakshina (subject to GST, but dakshina itself is exempt)
    const platformFeePaise = Math.floor(dakshinaPaise * platformCommissionPercent / 100);
    const travelServiceFeePaise = Math.floor(travelPaise * travelServiceFeePercent / 100);
    const samagriServiceFeePaise = Math.floor(samagriPaise * samagriServiceFeePercent / 100);

    // GST only on service fees, NEVER on dakshina
    const taxablePaise = platformFeePaise + travelServiceFeePaise + samagriServiceFeePaise + backupFeePaise;
    const gstPaise = calculateGSTPaise(taxablePaise);

    const totalPaise =
        dakshinaPaise +
        samagriPaise +
        travelPaise +
        foodAllowancePaise +
        accommodationPaise +
        platformFeePaise +
        travelServiceFeePaise +
        samagriServiceFeePaise +
        backupFeePaise +
        gstPaise;

    return {
        dakshinaPaise,
        samagriPaise,
        travelPaise,
        foodAllowancePaise,
        accommodationPaise,
        platformFeePaise,
        travelServiceFeePaise,
        samagriServiceFeePaise,
        backupFeePaise,
        gstPaise,
        totalPaise,
    };
}
