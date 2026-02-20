// ============================================
// HmarePanditJi — Shared TypeScript Types
// Package: @hmarepanditji/types (was @hpj/shared-types)
// ============================================

// ─── ENUMS ───────────────────────────────────────────
export type UserType = 'customer' | 'pandit' | 'admin';
export type UserRole = 'customer' | 'pandit' | 'admin';

export type UserStatus =
  | 'pending'      // Just registered, OTP verified
  | 'active'       // KYC approved (pandits) or profile complete (customers)
  | 'suspended'    // Admin action
  | 'rejected';    // KYC rejected

export type VerificationStatus =
  | 'not_started'
  | 'pending'
  | 'under_review'
  | 'verified'
  | 'rejected';

export type BookingStatus =
  | 'draft'           // Customer building booking, not submitted
  | 'requested'       // Submitted, waiting pandit acceptance
  | 'confirmed'       // Pandit accepted + payment done
  | 'pandit_en_route' // Pandit started travel
  | 'pandit_arrived'  // Pandit reached venue
  | 'in_progress'     // Puja started
  | 'completed'       // Puja done, awaiting review
  | 'cancelled'       // By customer or pandit
  | 'refunded';       // Money returned

export type TravelMode =
  | 'self_drive'
  | 'cab'
  | 'bike'
  | 'bus'
  | 'train'
  | 'flight';

export type SamagriChoice = 'pandit_package' | 'custom_list' | 'self_arranged';

export type PackageTier = 'basic' | 'standard' | 'premium';

export type PujaType =
  | 'vivah'           // Wedding
  | 'griha_pravesh'   // House warming
  | 'satyanarayan'    // Satyanarayan katha
  | 'mundan'          // First haircut ceremony
  | 'annaprashan'     // First rice feeding
  | 'namkaran'        // Naming ceremony
  | 'shradh'          // Death anniversary
  | 'rudrabhishek'    // Shiva abhishek
  | 'katha'           // Religious discourse
  | 'ganesh_puja'
  | 'durga_puja'
  | 'lakshmi_puja'
  | 'navgrah_puja'
  | 'vastu_puja'
  | 'havan'
  | 'kundali_puja'
  | 'sai_puja'
  | 'pitru_paksha';

export type PaymentStatus = 'pending' | 'captured' | 'failed' | 'refunded';
export type PayoutStatus = 'pending' | 'processing' | 'processed' | 'failed';

export type NotificationType =
  | 'booking_request'
  | 'booking_confirmed'
  | 'booking_cancelled'
  | 'payment_received'
  | 'payout_processed'
  | 'kyc_approved'
  | 'backup_triggered'
  | 'pandit_en_route'
  | 'puja_completed'
  | 'review_reminder'
  | 'otp'
  | 'general';

// ─── MONEY UTILITY TYPES ─────────────────────────────
// All amounts are in PAISE (integer). Never float. 1 rupee = 100 paise.
export interface MoneyBreakdown {
  dakshinaPaise: number;
  samagriPaise: number;
  travelPaise: number;
  foodAllowancePaise: number;
  accommodationPaise: number;
  platformFeePaise: number;
  travelServiceFeePaise: number;
  samagriServiceFeePaise: number;
  backupFeePaise: number;
  gstPaise: number;
  totalPaise: number;
}

// ─── USER TYPES ──────────────────────────────────────
export interface BaseUser {
  id: string;
  phone: string;
  email?: string;
  fullName: string;
  userType: UserType;
  status: UserStatus;
  preferredLanguage: string;  // 'hi' | 'en' | 'bn' | 'ta' | 'te' | 'mr'
  profilePhotoUrl?: string;
  fcmToken?: string;
  createdAt: Date;
}

export interface User {
  id: string;
  phone: string;
  name: string;
  email?: string;
  role: UserRole;
  avatarUrl?: string;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthTokenPayload {
  userId: string;
  role: UserRole;
  phone: string;
  iat: number;
  exp: number;
}

export interface CustomerProfile {
  userId: string;
  gotra?: string;
  familyName?: string;
  familyMembers: FamilyMember[];
  savedAddresses: Address[];
  rating: number;
  totalBookings: number;
}

export interface FamilyMember {
  name: string;
  relation: string;
  gotra?: string;
  dateOfBirth?: string;
}

export interface PanditProfile {
  userId: string;
  verificationStatus: VerificationStatus;
  yearsExperience: number;
  bioText?: string;
  bioAudioUrl?: string;         // Recorded voice bio in Hindi
  specializations: PujaType[];
  languagesSpoken: string[];
  gotraExpertise: string[];
  sect?: string;                // e.g., 'shaiva', 'vaishnava'
  deviceOs?: 'android' | 'ios';
  deviceModel?: string;
  rating: number;
  totalReviews: number;
  completedBookings: number;
  totalEarningsPaise: number;
  isOnline: boolean;
  verifiedBadges: string[];     // ['Vedic Verified', 'Travel Expert', etc.]
}

export interface Pandit {
  id: string;
  userId: string;
  displayName: string;
  bio?: string;
  photoUrl?: string;
  languages: string[];
  specializations: string[];
  experienceYears: number;
  rating: number;
  totalBookings: number;
  pricePerPuja: number;
  status: PanditStatus;
  address: Address;
  createdAt: Date;
  updatedAt: Date;
}

export type PanditStatus = 'pending' | 'verified' | 'rejected' | 'suspended';

export interface TravelPreferences {
  panditId: string;
  maxDistanceKm: number;
  selfDriveEnabled: boolean;
  selfDriveMaxKm: number;
  selfDriveRatePaisePerKm: number;
  vehicleType?: 'car' | 'bike';
  availableModes: TravelMode[];
  modeDistanceRanges: ModeDistanceRange[];
  hotelPreference?: 'budget' | 'comfort' | 'any';
  advanceNoticeDays: number;
  blackoutDates: string[];      // ISO date strings e.g. "2024-10-15"
}

export interface ModeDistanceRange {
  mode: TravelMode;
  minKm: number;
  maxKm: number;
}

export interface Address {
  label?: string;               // 'Home', 'Office', etc.
  line1: string;
  line2?: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  lat?: number;
  lng?: number;
}

// ─── BOOKING TYPES ───────────────────────────────────
export interface BookingRequest {
  customerId: string;
  panditId: string;
  pujaType: PujaType;
  eventDate: string;            // ISO date string
  muhuratTime: string;          // "HH:MM" 24hr format
  eventDurationDays: number;
  venue: Address;
  samagriChoice: SamagriChoice;
  selectedPackageId?: string;
  customSamagriItems?: CustomSamagriItem[];
  selectedTravelMode?: TravelMode;
  foodByCustomer: boolean;
  accommodationByPlatform: boolean;
  backupEnabled: boolean;
  specialInstructions?: string;
  regionalRitualVariant?: string;
}

export interface CustomSamagriItem {
  itemId: string;
  quantity: number;
  unit: string;
}

export interface Booking {
  id: string;
  bookingNumber: string;
  customerId: string;
  panditId: string;
  pujaServiceId: string;
  scheduledDate: Date;
  scheduledTime: string;
  address: Address;
  specialInstructions?: string;
  totalAmount: number;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ─── PUJA / SERVICE ──────────────────────────────────
export type PujaCategory =
  | 'griha_pravesh'
  | 'satyanarayan'
  | 'wedding'
  | 'mundan'
  | 'namkaran'
  | 'havan'
  | 'pitra_dosh'
  | 'vastu'
  | 'sundarkand'
  | 'akhanda_path'
  | 'other';

export interface PujaService {
  id: string;
  name: string;
  nameHindi: string;
  category: PujaCategory;
  description: string;
  durationMinutes: number;
  basePrice: number;
  imageUrl?: string;
  isActive: boolean;
}

// ─── REVIEW TYPES ────────────────────────────────────
export interface Review {
  id: string;
  bookingId: string;
  reviewerId: string;
  revieweeId: string;
  knowledgeStars: number;    // 1-5
  punctualityStars: number;
  behaviorStars: number;
  overallStars: number;
  comment?: string;
  photoUrls: string[];
  isVerified: boolean;
  panditReply?: string;
  createdAt: Date;
}

// ─── API Response ────────────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ─── Notification ────────────────────────────────────
export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: Date;
}

// ─── Voice Registration Types ────────────────────────
export interface VoicePrompt {
  text: string;
  language: string;
}

export interface RegistrationStepResponse {
  success: boolean;
  nextStep: number;
  voicePrompt: VoicePrompt;
  continueByVoiceQuestion: string;
  data: Record<string, unknown>;
}

// ─── KYC Types ───────────────────────────────────────
export interface KYCSession {
  id: string;
  panditId: string;
  videoUrl?: string;
  status: 'pending' | 'under_review' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewedAt?: Date;
  notes?: string;
  attemptNumber: number;
  createdAt: Date;
}

export interface KYCQueueItem {
  kycSessionId: string;
  panditId: string;
  panditName: string;
  panditPhone: string;
  videoUrl?: string;
  documents: KYCDocument[];
  aadhaarLastFour?: string;
  specializations: string[];
  submittedAt: string;
  attemptNumber: number;
}

export interface KYCDocument {
  docType: string;
  url: string;
  verified: boolean;
}
