// ============================================
// HmarePanditJi — Shared TypeScript Types
// ============================================

// --- Auth / User ---
export type UserRole = "customer" | "pandit" | "admin";

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

// --- Pandit ---
export type PanditStatus = "pending" | "verified" | "rejected" | "suspended";

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

// --- Puja / Service ---
export type PujaCategory =
  | "griha_pravesh"
  | "satyanarayan"
  | "wedding"
  | "mundan"
  | "namkaran"
  | "havan"
  | "pitra_dosh"
  | "vastu"
  | "sundarkand"
  | "akhanda_path"
  | "other";

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

// --- Booking ---
export type BookingStatus =
  | "pending"
  | "confirmed"
  | "in_progress"
  | "completed"
  | "cancelled";

export type PaymentStatus = "pending" | "paid" | "refunded" | "failed";

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

// --- Address ---
export interface Address {
  line1: string;
  line2?: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  lat?: number;
  lng?: number;
}

// --- API Response ---
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

// --- Notifications ---
export type NotificationType =
  | "booking_confirmed"
  | "booking_cancelled"
  | "payment_received"
  | "pandit_assigned"
  | "reminder";

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: Date;
}
