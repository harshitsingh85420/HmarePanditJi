import { BOOKING } from "../config/constants";

/**
 * Generate a booking number in format HPJ-2026-XXXXX
 * Uses prefix from constants + current year + random 5-digit number.
 */
export function generateBookingNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(10000 + Math.random() * 90000);
  return `${BOOKING.NUMBER_PREFIX}-${year}-${random}`;
}
