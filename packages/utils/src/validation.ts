/**
 * HmarePanditJi Validation Utilities
 * Zod schemas for request validation and data integrity
 */

import { z } from 'zod';
import { VALIDATION_RULES } from './constants';

// ─── Phone Number Validation ─────────────────────────────────────────────────

export const phoneSchema = z
    .string()
    .regex(VALIDATION_RULES.PHONE.regex, VALIDATION_RULES.PHONE.message);

// ─── Email Validation ────────────────────────────────────────────────────────

export const emailSchema = z.string().email('Invalid email address').optional();

// ─── Pincode Validation ──────────────────────────────────────────────────────

export const pincodeSchema = z
    .string()
    .regex(VALIDATION_RULES.PINCODE.regex, VALIDATION_RULES.PINCODE.message);

// ─── IFSC Code Validation ────────────────────────────────────────────────────

export const ifscSchema = z
    .string()
    .regex(VALIDATION_RULES.IFSC.regex, VALIDATION_RULES.IFSC.message);

// ─── PAN Validation ──────────────────────────────────────────────────────────

export const panSchema = z
    .string()
    .regex(VALIDATION_RULES.PAN.regex, VALIDATION_RULES.PAN.message)
    .optional();

// ─── Aadhaar Validation ──────────────────────────────────────────────────────

export const aadhaarSchema = z
    .string()
    .regex(VALIDATION_RULES.AADHAAR.regex, VALIDATION_RULES.AADHAAR.message)
    .optional();

// ─── Auth Schemas ────────────────────────────────────────────────────────────

export const sendOtpSchema = z.object({
    phone: phoneSchema,
});

export const verifyOtpSchema = z.object({
    phone: phoneSchema,
    otp: z.string().length(6, 'OTP must be 6 digits'),
});

export const updateProfileSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').optional(),
    email: emailSchema,
    preferredLanguage: z.enum(['hindi', 'english']).optional(),
});

// ─── Customer Schemas ────────────────────────────────────────────────────────

export const addressSchema = z.object({
    label: z.string().min(1, 'Label is required'),
    fullAddress: z.string().min(10, 'Full address must be at least 10 characters'),
    city: z.string().min(2, 'City is required'),
    state: z.string().min(2, 'State is required'),
    pincode: pincodeSchema,
    landmark: z.string().optional(),
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
    isDefault: z.boolean().optional(),
});

export const createAddressSchema = addressSchema;

export const updateAddressSchema = addressSchema.partial();

// ─── Pandit Schemas ──────────────────────────────────────────────────────────

export const panditProfileSchema = z.object({
    displayName: z.string().min(3, 'Display name must be at least 3 characters'),
    bio: z.string().max(500, 'Bio must not exceed 500 characters').optional(),
    experienceYears: z.number().int().min(0).max(100),
    specializations: z.array(z.string()).min(1, 'At least one specialization required'),
    languages: z.array(z.string()).min(1, 'At least one language required'),
    city: z.string().min(2, 'City is required'),
    state: z.string().min(2, 'State is required'),
    fullAddress: z.string().optional(),
    sect: z.string().optional(),
    gotra: z.string().optional(),
    maxTravelDistance: z.number().int().min(0).max(5000).optional(),
    travelPreferences: z.object({
        maxDistanceKm: z.number().int().min(0).max(5000),
        preferredModes: z.array(z.enum(['SELF_DRIVE', 'TRAIN', 'FLIGHT', 'CAB'])),
        selfDriveRatePerKm: z.number().min(0).optional(),
        vehicleType: z.string().optional(),
        hotelPreference: z.string().optional(),
        advanceNoticeDays: z.number().int().min(0).max(30).optional(),
    }).optional(),
});

export const bankDetailsSchema = z.object({
    bankAccountName: z.string().min(2, 'Account holder name required'),
    bankAccountNumber: z.string().min(8, 'Account number must be at least 8 digits').max(18),
    bankIfscCode: ifscSchema,
    panNumber: panSchema,
});

export const pujaServiceSchema = z.object({
    pujaType: z.string().min(2, 'Puja type required'),
    dakshinaAmount: z
        .number()
        .int()
        .min(VALIDATION_RULES.MIN_DAKSHINA, `Minimum dakshina is ₹${VALIDATION_RULES.MIN_DAKSHINA}`)
        .max(VALIDATION_RULES.MAX_DAKSHINA, `Maximum dakshina is ₹${VALIDATION_RULES.MAX_DAKSHINA}`),
    durationHours: z.number().min(0.5).max(12),
    description: z.string().max(500).optional(),
    includesSamagri: z.boolean().optional(),
    samagriCost: z.number().int().min(0).optional(),
});

export const samagriPackageSchema = z.object({
    packageName: z.enum(['Basic', 'Standard', 'Premium']),
    pujaType: z.string().min(2),
    fixedPrice: z.number().int().min(0),
    items: z.array(
        z.object({
            itemName: z.string(),
            quantity: z.string(),
            qualityNotes: z.string().optional(),
        })
    ),
});

export const blockDateSchema = z.object({
    date: z.coerce.date(),
    reason: z.string().optional(),
    isRecurring: z.boolean().optional(),
    recurringRule: z.string().optional(),
});

// ─── Booking Schemas ─────────────────────────────────────────────────────────

export const createBookingSchema = z.object({
    panditId: z.string().cuid().optional(),
    eventType: z.string().min(2, 'Event type required'),
    eventDate: z.coerce.date(),
    eventEndDate: z.coerce.date().optional(),
    muhuratTime: z.string().optional(),
    muhuratSuggested: z.boolean().optional(),
    venueAddress: z.string().min(10, 'Venue address must be at least 10 characters'),
    venueCity: z.string().min(2, 'Venue city required'),
    venuePincode: pincodeSchema,
    venueLatitude: z.number().min(-90).max(90).optional(),
    venueLongitude: z.number().min(-180).max(180).optional(),
    attendees: z
        .number()
        .int()
        .min(VALIDATION_RULES.MIN_ATTENDEES)
        .max(VALIDATION_RULES.MAX_ATTENDEES)
        .optional(),
    specialInstructions: z.string().max(1000).optional(),
    travelRequired: z.boolean(),
    travelMode: z.enum(['SELF_DRIVE', 'TRAIN', 'FLIGHT', 'CAB', 'BUS']).optional(),
    travelDistanceKm: z.number().min(0).optional(),
    foodArrangement: z.enum(['CUSTOMER_PROVIDES', 'PLATFORM_ALLOWANCE']),
    foodAllowanceDays: z.number().int().min(0).max(30).optional(),
    accommodationArrangement: z.enum(['NOT_NEEDED', 'CUSTOMER_ARRANGES', 'PLATFORM_BOOKS']),
    accommodationNotes: z.string().max(500).optional(),
    samagriPreference: z.enum(['PANDIT_BRINGS', 'CUSTOMER_ARRANGES', 'NEED_HELP']),
    samagriNotes: z.string().max(500).optional(),
});

export const updateBookingStatusSchema = z.object({
    status: z.enum([
        'CREATED',
        'PANDIT_REQUESTED',
        'CONFIRMED',
        'TRAVEL_BOOKED',
        'PANDIT_EN_ROUTE',
        'PANDIT_ARRIVED',
        'PUJA_IN_PROGRESS',
        'COMPLETED',
        'CANCELLATION_REQUESTED',
        'CANCELLED',
        'REFUNDED',
    ]),
    note: z.string().max(500).optional(),
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
});

export const acceptBookingSchema = z.object({
    note: z.string().max(500).optional(),
});

export const rejectBookingSchema = z.object({
    reason: z.string().min(10, 'Rejection reason must be at least 10 characters').max(500),
});

export const cancelBookingSchema = z.object({
    reason: z.string().min(10, 'Cancellation reason must be at least 10 characters').max(1000),
});

// ─── Travel Schemas ──────────────────────────────────────────────────────────

export const calculateTravelSchema = z.object({
    fromCity: z.string().min(2, 'From city required'),
    toCity: z.string().min(2, 'To city required'),
    travelMode: z.enum(['SELF_DRIVE', 'TRAIN', 'FLIGHT', 'CAB']).optional(),
    eventDays: z.number().int().min(1).max(30).optional(),
    foodArrangement: z.enum(['CUSTOMER_PROVIDES', 'PLATFORM_ALLOWANCE']).optional(),
});

export const updateTravelStatusSchema = z.object({
    travelBookingRef: z.string().min(5, 'Travel booking reference required'),
    travelNotes: z.string().max(1000).optional(),
    actualTravelCost: z.number().int().min(0).optional(),
});

// ─── Review Schemas ──────────────────────────────────────────────────────────

export const createReviewSchema = z.object({
    overallRating: z.number().min(1).max(5),
    knowledgeRating: z.number().min(1).max(5).optional(),
    punctualityRating: z.number().min(1).max(5).optional(),
    communicationRating: z.number().min(1).max(5).optional(),
    comment: z.string().max(500).optional(),
    isAnonymous: z.boolean().optional(),
});

// ─── Muhurat Schemas ─────────────────────────────────────────────────────────

export const muhuratQuerySchema = z.object({
    month: z.coerce.number().int().min(1).max(12).optional(),
    year: z.coerce.number().int().min(2024).max(2030).optional(),
    pujaType: z.string().optional(),
});

export const muhuratDateQuerySchema = z.object({
    date: z.coerce.date(),
});

// ─── Search & Filter Schemas ─────────────────────────────────────────────────

export const searchPanditsSchema = z.object({
    pujaType: z.string().optional(),
    city: z.string().optional(),
    date: z.coerce.date().optional(),
    minRating: z.coerce.number().min(0).max(5).optional(),
    maxDistance: z.coerce.number().int().min(0).max(5000).optional(),
    languages: z.array(z.string()).optional(),
    minBudget: z.coerce.number().int().min(0).optional(),
    maxBudget: z.coerce.number().int().min(0).optional(),
    travelMode: z.enum(['SELF_DRIVE', 'TRAIN', 'FLIGHT', 'CAB', 'ANY']).optional(),
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
    sortBy: z.enum(['rating', 'price', 'experience', 'distance']).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
});

// ─── Pagination Schema ───────────────────────────────────────────────────────

export const paginationSchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
});

// ─── Admin Schemas ───────────────────────────────────────────────────────────

export const verifyPanditSchema = z.object({
    verificationStatus: z.enum(['PENDING', 'DOCUMENTS_SUBMITTED', 'VIDEO_KYC_DONE', 'VERIFIED', 'REJECTED']),
    rejectionReason: z.string().max(1000).optional(),
    notes: z.string().max(1000).optional(),
});

export const processPayoutSchema = z.object({
    payoutReference: z.string().min(5, 'Payout reference required'),
    payoutCompletedAt: z.coerce.date().optional(),
    notes: z.string().max(500).optional(),
});

export const processRefundSchema = z.object({
    refundAmount: z.number().int().min(0),
    refundReference: z.string().min(5, 'Refund reference required'),
    notes: z.string().max(500).optional(),
});

// ─── Helper Functions ────────────────────────────────────────────────────────

/**
 * Validate phone number format
 * @param phone - Phone number string
 * @returns True if valid
 */
export function isValidPhone(phone: string): boolean {
    return VALIDATION_RULES.PHONE.regex.test(phone);
}

/**
 * Validate pincode format
 * @param pincode - Pincode string
 * @returns True if valid
 */
export function isValidPincode(pincode: string): boolean {
    return VALIDATION_RULES.PINCODE.regex.test(pincode);
}

/**
 * Validate IFSC code format
 * @param ifsc - IFSC code string
 * @returns True if valid
 */
export function isValidIFSC(ifsc: string): boolean {
    return VALIDATION_RULES.IFSC.regex.test(ifsc);
}

/**
 * Validate PAN format
 * @param pan - PAN string
 * @returns True if valid
 */
export function isValidPAN(pan: string): boolean {
    return VALIDATION_RULES.PAN.regex.test(pan);
}

/**
 * Validate Aadhaar format
 * @param aadhaar - Aadhaar string
 * @returns True if valid
 */
export function isValidAadhaar(aadhaar: string): boolean {
    return VALIDATION_RULES.AADHAAR.regex.test(aadhaar);
}

/**
 * Sanitize user input
 * @param input - User input string
 * @returns Sanitized string
 */
export function sanitizeInput(input: string): string {
    return input.trim().replace(/[<>]/g, '');
}
