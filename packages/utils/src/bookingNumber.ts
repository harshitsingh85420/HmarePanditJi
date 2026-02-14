/**
 * HmarePanditJi Booking Number Generator
 * Generates unique booking numbers in format: HPJ-YYYY-XXXXX
 */

/**
 * Generate a booking number
 * Format: HPJ-2026-00001
 * @param sequence - Sequential number (from database counter or random)
 * @param year - Year (defaults to current year)
 * @returns Formatted booking number
 */
export function generateBookingNumber(sequence: number, year?: number): string {
    const currentYear = year || new Date().getFullYear();
    const paddedSequence = String(sequence).padStart(5, '0');
    return `HPJ-${currentYear}-${paddedSequence}`;
}

/**
 * Generate a random booking number (for testing/seeding)
 * @returns Random booking number
 */
export function generateRandomBookingNumber(): string {
    const randomSequence = Math.floor(10000 + Math.random() * 90000);
    return generateBookingNumber(randomSequence);
}

/**
 * Parse a booking number into its components
 * @param bookingNumber - Booking number string
 * @returns Parsed components or null if invalid
 */
export function parseBookingNumber(bookingNumber: string): {
    prefix: string;
    year: number;
    sequence: number;
} | null {
    const match = bookingNumber.match(/^HPJ-(\d{4})-(\d{5})$/);

    if (!match) return null;

    return {
        prefix: 'HPJ',
        year: parseInt(match[1], 10),
        sequence: parseInt(match[2], 10),
    };
}

/**
 * Validate a booking number format
 * @param bookingNumber - Booking number to validate
 * @returns True if valid format
 */
export function isValidBookingNumber(bookingNumber: string): boolean {
    return /^HPJ-\d{4}-\d{5}$/.test(bookingNumber);
}
