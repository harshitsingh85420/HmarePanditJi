import { BOOKING } from "../config/constants";

/**
 * Generate a booking number in format HPJ-YYYY-NNNNN
 */
export function generateBookingNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(10000 + Math.random() * 90000);
  return `${BOOKING.NUMBER_PREFIX}-${year}-${random}`;
}

/**
 * Parse pagination query params with safe defaults
 */
export function parsePagination(
  query: Record<string, unknown>,
  defaultLimit = 20,
): { page: number; limit: number; skip: number } {
  const page = Math.max(1, parseInt(String(query.page ?? "1"), 10) || 1);
  const limit = Math.min(
    100,
    Math.max(1, parseInt(String(query.limit ?? String(defaultLimit)), 10) || defaultLimit),
  );
  return { page, limit, skip: (page - 1) * limit };
}

/**
 * Mask a phone number for logging: +91XXXXXXXX89
 */
export function maskPhone(phone: string): string {
  if (phone.length < 6) return "***";
  return phone.slice(0, 3) + "*".repeat(phone.length - 5) + phone.slice(-2);
}

/**
 * Strip +91 prefix and return 10-digit number
 */
export function normalizePhone(phone: string): string {
  return phone.replace(/^\+91/, "").replace(/\s/g, "");
}

/**
 * Add +91 prefix if not present
 */
export function formatPhoneE164(phone: string): string {
  const digits = normalizePhone(phone);
  return digits.startsWith("+") ? digits : `+91${digits}`;
}

/**
 * Sleep for ms milliseconds (useful in tests / retries)
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
