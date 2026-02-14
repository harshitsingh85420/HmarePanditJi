/**
 * HmarePanditJi Utils Package
 * Centralized utilities for pricing, formatting, validation, and constants
 */

// Constants
export * from './constants';

// Pricing utilities
export * from './pricing';

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

// Validation schemas
export * from './validation';
