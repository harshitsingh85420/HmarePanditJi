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

// Booking number utilities
export * from './bookingNumber';

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
  submitReviewSchema,
  muhuratQuerySchema,
  panditSearchSchema,
  paginationSchema,
  idParamSchema,
  dateRangeSchema,
  ratingSchema,
  isValidPhone,
  isValidIFSC,
  isValidPAN,
  sanitizeInput,
} from './validation';
