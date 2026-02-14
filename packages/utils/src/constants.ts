/**
 * HmarePanditJi Platform Constants
 * All business logic constants in one place
 */

// ─── Pricing Constants ───────────────────────────────────────────────────────

export const PRICING = {
    PLATFORM_FEE_PERCENT: 15, // 15% of dakshina
    TRAVEL_SERVICE_FEE_PERCENT: 5, // 5% of travel cost
    GST_PERCENT: 18, // 18% GST on all service fees
    FOOD_ALLOWANCE_PER_DAY: 1000, // ₹1000 per day
    SELF_DRIVE_RATE_PER_KM: 12, // ₹12 per km
} as const;

// ─── Travel Constants ────────────────────────────────────────────────────────

export const TRAVEL = {
    MAX_DRIVE_KM_PER_DAY: 400, // Maximum driving distance per day
    LOCAL_CAB_RATE_PER_KM: 15, // For distances <300km

    // Train fare bands (3AC, round trip)
    TRAIN_FARES: {
        BAND_1: { maxKm: 200, fare: 1000 }, // 0-200km
        BAND_2: { maxKm: 500, fare: 2400 }, // 200-500km
        BAND_3: { maxKm: 1000, fare: 5000 }, // 500-1000km
        BAND_4: { maxKm: Infinity, fare: 7000 }, // 1000km+
    },

    // Flight fare bands (economy, round trip)
    FLIGHT_FARES: {
        BAND_1: { maxKm: 500, fare: 7000 },  // Up to 500km
        BAND_2: { maxKm: 1000, fare: 9000 }, // 500-1000km
        BAND_3: { maxKm: 1500, fare: 12000 }, // 1000-1500km
        BAND_4: { maxKm: Infinity, fare: 16000 }, // 1500km+
    },

    // Local transport costs
    LOCAL_CAB_AT_DESTINATION: {
        TRAIN: 1600, // Airport pickup + drops
        FLIGHT: 2400, // Airport pickup + drops
    },
} as const;

// ─── Cancellation Policy ─────────────────────────────────────────────────────

export const CANCELLATION_POLICY = {
    MORE_THAN_7_DAYS: { refundPercent: 90, label: '>7 days before' },
    BETWEEN_3_AND_7_DAYS: { refundPercent: 50, label: '3-7 days before' },
    LESS_THAN_3_DAYS: { refundPercent: 20, label: '<3 days before' },
    SAME_DAY: { refundPercent: 0, label: 'Same day' },
    PLATFORM_FEE_NON_REFUNDABLE: true,
} as const;

// ─── Puja Types ──────────────────────────────────────────────────────────────

export const PUJA_TYPES = [
    { value: 'Vivah', label: 'Vivah (Wedding)', category: 'WEDDING' },
    { value: 'Griha Pravesh', label: 'Griha Pravesh (House warming)', category: 'GRIHA' },
    { value: 'Satyanarayan Katha', label: 'Satyanarayan Katha', category: 'PUJA' },
    { value: 'Ganesh Puja', label: 'Ganesh Puja', category: 'PUJA' },
    { value: 'Lakshmi Puja', label: 'Lakshmi Puja', category: 'PUJA' },
    { value: 'Havan', label: 'Havan', category: 'PUJA' },
    { value: 'Mundan', label: 'Mundan (Hair cutting ceremony)', category: 'PUJA' },
    { value: 'Annaprashan', label: 'Annaprashan (First rice)', category: 'PUJA' },
    { value: 'Naamkaran', label: 'Naamkaran (Naming ceremony)', category: 'PUJA' },
    { value: 'Rudrabhishek', label: 'Rudrabhishek', category: 'PUJA' },
    { value: 'Vastu Shanti', label: 'Vastu Shanti', category: 'SHANTI' },
    { value: 'Navgraha Shanti', label: 'Navgraha Shanti', category: 'SHANTI' },
    { value: 'Pitra Puja', label: 'Pitra Puja (Ancestral)', category: 'DEATH_RITES' },
    { value: 'Shradh', label: 'Shradh', category: 'DEATH_RITES' },
    { value: 'Sunderkand Path', label: 'Sunderkand Path', category: 'PUJA' },
] as const;

// ─── Languages ───────────────────────────────────────────────────────────────

export const LANGUAGES = [
    { value: 'Hindi', label: 'Hindi' },
    { value: 'English', label: 'English' },
    { value: 'Sanskrit', label: 'Sanskrit' },
    { value: 'Punjabi', label: 'Punjabi' },
    { value: 'Bengali', label: 'Bengali' },
    { value: 'Marathi', label: 'Marathi' },
    { value: 'Gujarati', label: 'Gujarati' },
    { value: 'Tamil', label: 'Tamil' },
    { value: 'Telugu', label: 'Telugu' },
    { value: 'Kannada', label: 'Kannada' },
    { value: 'Malayalam', label: 'Malayalam' },
    { value: 'Bhojpuri', label: 'Bhojpuri' },
    { value: 'Maithili', label: 'Maithili' },
    { value: 'Awadhi', label: 'Awadhi' },
] as const;

// ─── Major Cities ────────────────────────────────────────────────────────────

export const MAJOR_CITIES = [
    // NCR
    { value: 'Delhi', label: 'Delhi', state: 'Delhi', region: 'NCR' },
    { value: 'Noida', label: 'Noida', state: 'Uttar Pradesh', region: 'NCR' },
    { value: 'Gurgaon', label: 'Gurgaon', state: 'Haryana', region: 'NCR' },
    { value: 'Faridabad', label: 'Faridabad', state: 'Haryana', region: 'NCR' },
    { value: 'Ghaziabad', label: 'Ghaziabad', state: 'Uttar Pradesh', region: 'NCR' },
    { value: 'Greater Noida', label: 'Greater Noida', state: 'Uttar Pradesh', region: 'NCR' },

    // North India
    { value: 'Chandigarh', label: 'Chandigarh', state: 'Chandigarh', region: 'North' },
    { value: 'Jaipur', label: 'Jaipur', state: 'Rajasthan', region: 'North' },
    { value: 'Lucknow', label: 'Lucknow', state: 'Uttar Pradesh', region: 'North' },
    { value: 'Agra', label: 'Agra', state: 'Uttar Pradesh', region: 'North' },
    { value: 'Mathura', label: 'Mathura', state: 'Uttar Pradesh', region: 'North' },
    { value: 'Haridwar', label: 'Haridwar', state: 'Uttarakhand', region: 'North' },
    { value: 'Rishikesh', label: 'Rishikesh', state: 'Uttarakhand', region: 'North' },
    { value: 'Dehradun', label: 'Dehradun', state: 'Uttarakhand', region: 'North' },
    { value: 'Varanasi', label: 'Varanasi', state: 'Uttar Pradesh', region: 'North' },
] as const;

// ─── Booking Status Flow ─────────────────────────────────────────────────────

export const BOOKING_STATUS_FLOW = {
    CREATED: { next: ['PANDIT_REQUESTED', 'CANCELLED'], label: 'Created', color: 'gray' },
    PANDIT_REQUESTED: { next: ['CONFIRMED', 'CREATED'], label: 'Pandit Requested', color: 'blue' },
    CONFIRMED: { next: ['TRAVEL_BOOKED', 'PANDIT_EN_ROUTE', 'CANCELLATION_REQUESTED'], label: 'Confirmed', color: 'green' },
    TRAVEL_BOOKED: { next: ['PANDIT_EN_ROUTE'], label: 'Travel Booked', color: 'green' },
    PANDIT_EN_ROUTE: { next: ['PANDIT_ARRIVED'], label: 'En Route', color: 'blue' },
    PANDIT_ARRIVED: { next: ['PUJA_IN_PROGRESS'], label: 'Arrived', color: 'indigo' },
    PUJA_IN_PROGRESS: { next: ['COMPLETED'], label: 'In Progress', color: 'purple' },
    COMPLETED: { next: [], label: 'Completed', color: 'green' },
    CANCELLATION_REQUESTED: { next: ['CANCELLED'], label: 'Cancellation Requested', color: 'orange' },
    CANCELLED: { next: ['REFUNDED'], label: 'Cancelled', color: 'red' },
    REFUNDED: { next: [], label: 'Refunded', color: 'gray' },
} as const;

// ─── Validation Rules ────────────────────────────────────────────────────────

export const VALIDATION_RULES = {
    PHONE: {
        regex: /^\+91[6-9]\d{9}$/,
        message: 'Invalid Indian phone number (must start with +91)',
    },
    PINCODE: {
        regex: /^[1-9][0-9]{5}$/,
        message: 'Invalid pincode (must be 6 digits)',
    },
    IFSC: {
        regex: /^[A-Z]{4}0[A-Z0-9]{6}$/,
        message: 'Invalid IFSC code',
    },
    PAN: {
        regex: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
        message: 'Invalid PAN number',
    },
    AADHAAR: {
        regex: /^[2-9]{1}[0-9]{11}$/,
        message: 'Invalid Aadhaar number',
    },
    MIN_DAKSHINA: 500,
    MAX_DAKSHINA: 200000,
    MIN_ATTENDEES: 1,
    MAX_ATTENDEES: 5000,
} as const;

// ─── File Upload Limits ──────────────────────────────────────────────────────

export const FILE_UPLOAD = {
    MAX_SIZE_MB: 5,
    ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'],
} as const;

// ─── API Response Messages ───────────────────────────────────────────────────

export const API_MESSAGES = {
    SUCCESS: {
        BOOKING_CREATED: 'Booking created successfully',
        BOOKING_UPDATED: 'Booking updated successfully',
        PAYMENT_SUCCESS: 'Payment processed successfully',
        PROFILE_UPDATED: 'Profile updated successfully',
        DOCUMENTS_UPLOADED: 'Documents uploaded successfully',
    },
    ERROR: {
        UNAUTHORIZED: 'You are not authorized to perform this action',
        BOOKING_NOT_FOUND: 'Booking not found',
        PANDIT_NOT_FOUND: 'Pandit not found',
        INVALID_STATUS_TRANSITION: 'Invalid status transition',
        PAYMENT_FAILED: 'Payment processing failed',
        INSUFFICIENT_BALANCE: 'Insufficient balance',
    },
} as const;

// ─── Notification Templates ──────────────────────────────────────────────────

export const NOTIFICATION_TEMPLATES = {
    BOOKING_CREATED_CUSTOMER: (bookingNumber: string, eventType: string, eventDate: string) =>
        `Namaste! Your ${eventType} booking ${bookingNumber} has been created for ${eventDate}. We're finding the perfect Pandit Ji for you. Track your booking at hmarepanditji.com`,

    NEW_BOOKING_REQUEST_PANDIT: (bookingNumber: string, eventType: string, eventDate: string, earning: number) =>
        `Namaste Pandit Ji! New ${eventType} booking request ${bookingNumber} for ${eventDate}. Your earnings: ₹${earning}. Accept now on your dashboard!`,

    BOOKING_CONFIRMED: (bookingNumber: string, panditName: string, eventDate: string) =>
        `Great news! Pandit ${panditName} has confirmed your booking ${bookingNumber} for ${eventDate}. Details: hmarepanditji.com/bookings/${bookingNumber}`,

    TRAVEL_BOOKED: (bookingNumber: string, travelMode: string, ref: string) =>
        `Travel arranged for booking ${bookingNumber}! Mode: ${travelMode}, Ref: ${ref}. Details shared on WhatsApp.`,

    PANDIT_EN_ROUTE: (panditName: string) =>
        `Pandit ${panditName} Ji is on the way to your venue. Please be ready!`,

    PANDIT_ARRIVED: (panditName: string) =>
        `Pandit ${panditName} Ji has arrived at the venue. Your puja will begin shortly.`,

    PUJA_COMPLETED: (bookingNumber: string) =>
        `Your puja is complete! 🙏 Thank you for choosing HmarePanditJi. Please rate Pandit Ji: hmarepanditji.com/review/${bookingNumber}`,

    PAYMENT_SUCCESS: (amount: number, bookingNumber: string) =>
        `Payment of ₹${amount} received for booking ${bookingNumber}. Receipt: hmarepanditji.com/receipt`,

    PAYOUT_COMPLETED: (amount: number, ref: string) =>
        `Namaste Pandit Ji! ₹${amount} has been credited to your bank account. Ref: ${ref}. Check your dashboard for details.`,

    REVIEW_REMINDER: (bookingNumber: string, panditName: string) =>
        `How was your experience with Pandit ${panditName} Ji? Please rate your puja: hmarepanditji.com/review/${bookingNumber}`,

    CANCELLATION_NOTICE: (bookingNumber: string, refundAmount: number) =>
        `Booking ${bookingNumber} cancelled. Refund of ₹${refundAmount} will be processed in 5-7 business days.`,
} as const;

// ─── Gotra List ──────────────────────────────────────────────────────────────

export const GOTRAS = [
    'Kashyap', 'Bharadwaj', 'Vashishtha', 'Gautam', 'Atri', 'Jamadagni',
    'Vishwamitra', 'Agastya', 'Bhrigu', 'Angiras', 'Pulastya', 'Pulaha',
    'Kratu', 'Marichi', 'Daksha', 'Shandilya', 'Kaushik', 'Garg',
    'Parashar', 'Koundinya', 'Mudgal', 'Haritasa', 'Upamanyu', 'Dhananjaya',
] as const;

// ─── Specialization Categories ───────────────────────────────────────────────

export const SPECIALIZATION_CATEGORIES = {
    WEDDING: ['Vivah', 'Engagement', 'Ring Ceremony'],
    HOME: ['Griha Pravesh', 'Vastu Shanti', 'Bhoomi Puja'],
    FESTIVALS: ['Satyanarayan Katha', 'Ganesh Puja', 'Lakshmi Puja', 'Durga Puja'],
    SAMSKARAS: ['Mundan', 'Annaprashan', 'Naamkaran', 'Thread Ceremony'],
    SHANTI: ['Navgraha Shanti', 'Rudrabhishek', 'Vastu Shanti'],
    ANCESTRAL: ['Pitra Puja', 'Shradh', 'Tarpan'],
} as const;
