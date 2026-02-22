/**
 * HmarePanditJi Utils Package
 * Centralized utilities for pricing, formatting, validation, and constants
 */

// Constants
export * from './constants';

// Pricing utilities
export * from './pricing';

// Currency utilities (paise-based)
export * from './currency';

// India-specific validators — enhanced versions with Verhoeff checksum
export {
  isValidIndianPhone,
  isValidAadhaar,     // Verhoeff-based, supersedes simple regex version
  isValidPincode,     // Same logic, supersedes validation.ts version
  isValidGST,
  isValidPujaType,
  isValidTravelMode,
  VALID_PUJA_TYPES,
  VALID_TRAVEL_MODES,
} from './indianValidators';

// Booking number utilities (explicit to avoid generateBookingNumber conflict)
export {
  generateBookingNumber as generateSequentialBookingNumber,
  generateRandomBookingNumber,
  parseBookingNumber,
  isValidBookingNumber,
} from './bookingNumber';

// Formatting utilities (excluding formatCurrency which comes from pricing)
export {
  formatDate,
  formatDateVerbose,
  formatTime,
  formatDateTime,
  formatRelativeTime,
  formatPhoneNumber,
  maskPhoneNumber,
  formatName,
  getInitials,
  formatAddress,
  formatDistance,
  formatDuration,
  formatRating,
  formatFileSize,
  truncateText,
  pluralize,
  sanitizeFilename,
  generateSlug,
} from './formatting';

// ─── SPEC-REQUIRED CONSTANTS ─────────────────────────────────────────────────
export const CONSTANTS = {
  PLATFORM_FEE_PERCENT: 15,
  TRAVEL_SERVICE_FEE_PERCENT: 5,
  GST_PERCENT: 18,
  FOOD_ALLOWANCE_PER_DAY: 1000,
  SELF_DRIVE_RATE_PER_KM: 12,
  MAX_SELF_DRIVE_KM_PER_DAY: 400,
  SUPPORTED_PUJA_TYPES: ['Vivah', 'Griha Pravesh', 'Satyanarayan Puja', 'Mundan', 'Namkaran', 'Annaprashan', 'Upanayana', 'Shradh', 'Havan', 'Navratri Puja', 'Ganesh Puja', 'Durga Puja'],
  SUPPORTED_CITIES: ['Delhi', 'Noida', 'Gurgaon', 'Faridabad', 'Ghaziabad', 'Greater Noida', 'Mathura', 'Agra', 'Jaipur', 'Haridwar', 'Varanasi', 'Lucknow', 'Chandigarh', 'Dehradun', 'Rishikesh', 'Mumbai', 'Pune', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Bhopal', 'Ujjain'],
  SUPPORTED_LANGUAGES: ['Hindi', 'Sanskrit', 'English', 'Bengali', 'Tamil', 'Telugu', 'Maithili', 'Bhojpuri', 'Marathi', 'Gujarati', 'Kannada'],
} as const;

// ─── SPEC-REQUIRED FUNCTIONS ─────────────────────────────────────────────────

export function calculatePricing(params: {
  dakshinaAmount: number;
  samagriAmount: number;
  travelCost: number;
  foodAllowanceDays: number;
  accommodationCost: number;
}): {
  dakshinaAmount: number; samagriAmount: number; travelCost: number;
  foodAllowanceDays: number; accommodationCost: number;
  foodAllowanceAmount: number; platformFee: number; platformFeeGst: number;
  travelServiceFee: number; travelServiceFeeGst: number;
  grandTotal: number; panditPayout: number;
} {
  const foodAllowanceAmount = params.foodAllowanceDays * CONSTANTS.FOOD_ALLOWANCE_PER_DAY;
  const platformFee = Math.round(params.dakshinaAmount * CONSTANTS.PLATFORM_FEE_PERCENT / 100);
  const platformFeeGst = Math.round(platformFee * CONSTANTS.GST_PERCENT / 100);
  const travelServiceFee = Math.round(params.travelCost * CONSTANTS.TRAVEL_SERVICE_FEE_PERCENT / 100);
  const travelServiceFeeGst = Math.round(travelServiceFee * CONSTANTS.GST_PERCENT / 100);
  const grandTotal = params.dakshinaAmount + params.samagriAmount + params.travelCost
    + foodAllowanceAmount + params.accommodationCost
    + platformFee + platformFeeGst + travelServiceFee + travelServiceFeeGst;
  const panditPayout = params.dakshinaAmount - platformFee + params.travelCost
    + foodAllowanceAmount + params.samagriAmount;
  return { ...params, foodAllowanceAmount, platformFee, platformFeeGst, travelServiceFee, travelServiceFeeGst, grandTotal, panditPayout };
}

export function calculateRefundAmount(grandTotal: number, daysBeforeEvent: number): number {
  // Policy: >7 days = 90% refund, 3-7 days = 50%, <3 days = 20%, same day = 0%
  if (daysBeforeEvent > 7) return Math.round(grandTotal * 0.9);
  if (daysBeforeEvent >= 3) return Math.round(grandTotal * 0.5);
  if (daysBeforeEvent >= 1) return Math.round(grandTotal * 0.2);
  return 0;
}

export function generateBookingNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `HPJ-${year}-${random}`;
}

/** Returns the absolute number of calendar days between two dates. */
export function daysBetween(date1: Date | string, date2: Date | string): number {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  d1.setHours(0, 0, 0, 0);
  d2.setHours(0, 0, 0, 0);
  return Math.abs(Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24)));
}

/**
 * Calculates food allowance days for a booking.
 * Rule: if travelDistanceKm > 100, return 1 day (outstation); otherwise 0.
 * Multi-day events add extra days based on event duration.
 */
export function calculateFoodAllowanceDays(
  travelRequired: boolean,
  travelDistanceKm: number,
  eventDays = 1,
): number {
  if (!travelRequired || travelDistanceKm <= 100) return 0;
  // 1 day for outstation travel to + return, plus event days minus 1 (pandit stays on-site)
  return 1 + Math.max(0, eventDays - 1);
}

// Validation schemas — explicit exports to avoid isValidAadhaar/isValidPincode conflicts
export {
  phoneSchema,
  emailSchema,
  pincodeSchema,
  ifscSchema,
  panSchema,
  aadhaarSchema,
  sendOtpSchema,
  verifyOtpSchema,
  updateProfileSchema,
  addressSchema,
  createAddressSchema,
  updateAddressSchema,
  panditProfileSchema,
  pujaServiceSchema,
  createBookingSchema,
  updateBookingStatusSchema,
  calculateTravelSchema,
  muhuratQuerySchema,
  paginationSchema,
  isValidPhone,
  isValidIFSC,
  isValidPAN,
  sanitizeInput,
} from './validation';

// Auth Context
export * from './auth-context';
