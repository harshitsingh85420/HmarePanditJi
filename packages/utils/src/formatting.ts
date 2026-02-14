/**
 * HmarePanditJi Formatting Utilities
 * Format dates, times, currency, phone numbers, etc.
 */

// ─── Date & Time Formatting ──────────────────────────────────────────────────

/**
 * Format date in Indian format (DD/MM/YYYY)
 * @param date - Date object or ISO string
 * @returns Formatted date string
 */
export function formatDate(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    }).format(d);
}

/**
 * Format date in verbose format (15 March 2026, Monday)
 * @param date - Date object or ISO string
 * @returns Verbose date string
 */
export function formatDateVerbose(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        weekday: 'long',
    }).format(d);
}

/**
 * Format time in 12-hour format
 * @param date - Date object or ISO string
 * @returns Time string (e.g., "10:30 AM")
 */
export function formatTime(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('en-IN', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    }).format(d);
}

/**
 * Format datetime (DD/MM/YYYY, HH:MM AM/PM)
 * @param date - Date object or ISO string
 * @returns Formatted datetime string
 */
export function formatDateTime(date: Date | string): string {
    return `${formatDate(date)}, ${formatTime(date)}`;
}

/**
 * Format relative time (e.g., "2 hours ago", "in 3 days")
 * @param date - Date object or ISO string
 * @returns Relative time string
 */
export function formatRelativeTime(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffMs = d.getTime() - now.getTime();
    const diffSec = Math.round(diffMs / 1000);
    const diffMin = Math.round(diffSec / 60);
    const diffHour = Math.round(diffMin / 60);
    const diffDay = Math.round(diffHour / 24);

    if (Math.abs(diffSec) < 60) {
        return 'just now';
    } else if (Math.abs(diffMin) < 60) {
        return diffMin > 0 ? `in ${diffMin} minutes` : `${Math.abs(diffMin)} minutes ago`;
    } else if (Math.abs(diffHour) < 24) {
        return diffHour > 0 ? `in ${diffHour} hours` : `${Math.abs(diffHour)} hours ago`;
    } else if (Math.abs(diffDay) < 7) {
        return diffDay > 0 ? `in ${diffDay} days` : `${Math.abs(diffDay)} days ago`;
    } else {
        return formatDate(d);
    }
}

// ─── Currency Formatting ─────────────────────────────────────────────────────

/**
 * Format amount in Indian Rupees with ₹ symbol
 * @param amount - Amount in rupees
 * @param options - Formatting options
 * @returns Formatted currency string
 */
export function formatCurrency(
    amount: number,
    options: {
        showSymbol?: boolean;
        showDecimals?: boolean;
        compact?: boolean;
    } = {}
): string {
    const { showSymbol = true, showDecimals = false, compact = false } = options;

    if (compact && amount >= 100000) {
        const lakhs = amount / 100000;
        return showSymbol
            ? `₹${lakhs.toFixed(2)}L`
            : `${lakhs.toFixed(2)}L`;
    }

    const formatted = new Intl.NumberFormat('en-IN', {
        style: showSymbol ? 'currency' : 'decimal',
        currency: 'INR',
        minimumFractionDigits: showDecimals ? 2 : 0,
        maximumFractionDigits: showDecimals ? 2 : 0,
    }).format(amount);

    return formatted;
}

// ─── Phone Number Formatting ─────────────────────────────────────────────────

/**
 * Format phone number for display (+91 98100 12345)
 * @param phone - Phone number with country code
 * @returns Formatted phone number
 */
export function formatPhoneNumber(phone: string): string {
    // Remove all non-digits
    const digits = phone.replace(/\D/g, '');

    // Check if it starts with 91 (India)
    if (digits.startsWith('91') && digits.length === 12) {
        const countryCode = digits.slice(0, 2);
        const part1 = digits.slice(2, 7);
        const part2 = digits.slice(7, 12);
        return `+${countryCode} ${part1} ${part2}`;
    }

    // Return as-is if not matching expected format
    return phone;
}

/**
 * Mask phone number for privacy (shows last 4 digits)
 * @param phone - Phone number
 * @returns Masked phone number (+91 XXXXX 2345)
 */
export function maskPhoneNumber(phone: string): string {
    const digits = phone.replace(/\D/g, '');

    if (digits.startsWith('91') && digits.length === 12) {
        const last4 = digits.slice(-4);
        return `+91 XXXXX ${last4}`;
    }

    return 'XXXXX XXXX';
}

// ─── Name Formatting ─────────────────────────────────────────────────────────

/**
 * Format name with proper capitalization
 * @param name - Name string
 * @returns Properly capitalized name
 */
export function formatName(name: string): string {
    return name
        .toLowerCase()
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

/**
 * Get initials from name
 * @param name - Full name
 * @returns Initials (max 2 letters)
 */
export function getInitials(name: string): string {
    const words = name.trim().split(/\s+/);
    if (words.length === 1) {
        return words[0].charAt(0).toUpperCase();
    }
    return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
}

// ─── Address Formatting ──────────────────────────────────────────────────────

/**
 * Format address for display
 * @param address - Address components
 * @returns Formatted address string
 */
export function formatAddress(address: {
    fullAddress?: string;
    city?: string;
    state?: string;
    pincode?: string;
}): string {
    const parts = [
        address.fullAddress,
        address.city,
        address.state,
        address.pincode,
    ].filter(Boolean);

    return parts.join(', ');
}

// ─── Distance Formatting ─────────────────────────────────────────────────────

/**
 * Format distance with appropriate unit
 * @param distanceKm - Distance in kilometers
 * @returns Formatted distance string
 */
export function formatDistance(distanceKm: number): string {
    if (distanceKm < 1) {
        return `${Math.round(distanceKm * 1000)} m`;
    } else if (distanceKm < 100) {
        return `${distanceKm.toFixed(1)} km`;
    } else {
        return `${Math.round(distanceKm)} km`;
    }
}

// ─── Duration Formatting ─────────────────────────────────────────────────────

/**
 * Format duration in hours
 * @param hours - Duration in hours (can be decimal)
 * @returns Formatted duration string
 */
export function formatDuration(hours: number): string {
    if (hours < 1) {
        return `${Math.round(hours * 60)} mins`;
    } else if (hours % 1 === 0) {
        return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
    } else {
        const h = Math.floor(hours);
        const m = Math.round((hours - h) * 60);
        return `${h}h ${m}m`;
    }
}

// ─── Rating Formatting ───────────────────────────────────────────────────────

/**
 * Format rating with star emoji
 * @param rating - Rating value (0-5)
 * @param showValue - Whether to show numeric value
 * @returns Formatted rating string
 */
export function formatRating(rating: number, showValue: boolean = true): string {
    const stars = '⭐'.repeat(Math.round(rating));
    return showValue ? `${rating.toFixed(1)} ${stars}` : stars;
}

// ─── File Size Formatting ────────────────────────────────────────────────────

/**
 * Format file size in human-readable format
 * @param bytes - Size in bytes
 * @returns Formatted size string
 */
export function formatFileSize(bytes: number): string {
    if (bytes < 1024) {
        return `${bytes} B`;
    } else if (bytes < 1024 * 1024) {
        return `${(bytes / 1024).toFixed(1)} KB`;
    } else if (bytes < 1024 * 1024 * 1024) {
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    } else {
        return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
    }
}

// ─── Truncate Text ───────────────────────────────────────────────────────────

/**
 * Truncate text to specified length
 * @param text - Text to truncate
 * @param maxLength - Maximum length
 * @param suffix - Suffix to add (default: "...")
 * @returns Truncated text
 */
export function truncateText(text: string, maxLength: number, suffix: string = '...'): string {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength - suffix.length) + suffix;
}

// ─── Pluralize ───────────────────────────────────────────────────────────────

/**
 * Pluralize a word based on count
 * @param count - Count
 * @param singular - Singular form
 * @param plural - Plural form (optional, adds 's' by default)
 * @returns Pluralized string with count
 */
export function pluralize(count: number, singular: string, plural?: string): string {
    const word = count === 1 ? singular : (plural || `${singular}s`);
    return `${count} ${word}`;
}

// ─── Sanitize Filename ───────────────────────────────────────────────────────

/**
 * Sanitize filename by removing special characters
 * @param filename - Original filename
 * @returns Sanitized filename
 */
export function sanitizeFilename(filename: string): string {
    return filename
        .replace(/[^a-zA-Z0-9._-]/g, '_')
        .replace(/_{2,}/g, '_')
        .toLowerCase();
}

// ─── Generate Slug ───────────────────────────────────────────────────────────

/**
 * Generate URL-friendly slug from text
 * @param text - Text to slugify
 * @returns URL-safe slug
 */
export function generateSlug(text: string): string {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
}
