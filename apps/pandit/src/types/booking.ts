// ── Shared Booking TypeScript types ──────────────────────────────────────────

export type BookingStatus =
    | "PANDIT_REQUESTED"
    | "CONFIRMED"
    | "PANDIT_EN_ROUTE"
    | "PANDIT_ARRIVED"
    | "PUJA_STARTED"
    | "PUJA_COMPLETED"
    | "COMPLETED"
    | "CANCELLED"
    | "REFUNDED"
    | "EXPIRED";

export type SamagriChoice = "PANDIT_PACKAGE" | "PLATFORM_LIST";

export type PayoutStatus = "PENDING" | "PROCESSING" | "PAID" | "FAILED";

export interface Customer {
    id: string;
    name: string;
    phone?: string;
    rating?: number;
    profilePhotoUrl?: string;
}

export interface VenueAddress {
    line1?: string;
    line2?: string;
    city: string;
    state: string;
    pincode?: string;
    landmark?: string;
    latitude?: number;
    longitude?: number;
}

export interface SamagriPackageInfo {
    tier: "BASIC" | "STANDARD" | "PREMIUM";
    name: string;
    price: number;
    items: { name: string; quantity: string; qualityNote?: string }[];
}

export interface TravelItineraryDay {
    dayNumber: number;
    date: string;
    label: string; // e.g. "Travel Day", "Puja Day", "Return Day"
    activities: {
        time: string;
        description: string;
        type: "travel" | "puja" | "rest" | "meal" | "checkin";
    }[];
    foodAllowance: number; // ₹ per day (typically ₹1000)
}

export interface EarningsBreakdown {
    dakshinaAmount: number;
    platformFee: number;
    netDakshina: number;
    samagriEarnings: number;
    travelReimbursement: number;
    foodAllowance: number;
    totalEarning: number;
}

export interface PendingBookingRequest {
    id: string;
    bookingNumber: string;
    eventType: string;
    eventDate: string;
    eventTimeSlot?: string;
    venueCity: string;
    venueArea?: string;
    createdAt: string;
    estimatedEarning?: number;
    customer?: Customer;
    samagriChoice?: SamagriChoice;
    samagriPackage?: SamagriPackageInfo;
    attendees?: number;
    specialInstructions?: string;
}

export interface Booking {
    id: string;
    bookingNumber: string;
    status: BookingStatus;
    eventType: string;
    eventDate: string;
    eventTimeSlot?: string;
    muhuratDateTime?: string;
    venueAddress?: VenueAddress;
    venueCity?: string;
    customer?: Customer;
    attendees?: number;
    specialInstructions?: string;
    samagriChoice?: SamagriChoice;
    samagriPackage?: SamagriPackageInfo;
    earningsBreakdown?: EarningsBreakdown;
    earningsScenarioA?: EarningsBreakdown; // Pandit Package scenario
    earningsScenarioB?: EarningsBreakdown; // Platform List scenario
    travelItinerary?: TravelItineraryDay[];
    travelMode?: string;
    travelDocuments?: TravelDocument[];
    hotelDetails?: string;
    foodAllowancePerDay?: number;
    totalFoodAllowance?: number;
    dakshinaAmount?: number;
    panditPayout?: number;
    payoutStatus?: PayoutStatus;
    createdAt?: string;
    updatedAt?: string;
}

export interface TravelDocument {
    id: string;
    name: string;
    type: "TICKET" | "HOTEL" | "CAB" | "FOOD_RECEIPT" | "BOOKING_SUMMARY";
    url: string;
    uploadedAt?: string;
}

export interface DashboardData {
    pandit: {
        name: string;
        verificationStatus: string;
        profileCompletionPercent: number;
        isOnline: boolean;
    };
    todaysBooking: Booking | null;
    upcomingBookings: Booking[];
    pendingRequests: PendingBookingRequest[];
    earningsSummary: {
        thisMonthTotal: number;
        pendingPayout: number;
        lastPayoutAmount: number;
        lastPayoutDate: string;
        bookingCount?: number;
    };
    stats: {
        totalBookingsAllTime: number;
        averageRating: number;
        completionRate: number;
        totalReviews: number;
    };
}

export interface BookingStatusUpdate {
    bookingId: string;
    action:
    | "accept"
    | "decline"
    | "start-journey"
    | "hotel-arrived"
    | "venue-arrived"
    | "puja-started"
    | "puja-completed"
    | "return";
    reason?: string;
    timestamp?: string;
}
