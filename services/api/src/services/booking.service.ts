import {
  prisma,
  BookingStatus,
  TravelStatus,
  FoodArrangement,
  SamagriPreference,
  TravelMode,
  AccommodationArrangement,
} from "@hmarepanditji/db";
import { generateBookingNumber } from "../utils/helpers";
import { FOOD_ALLOWANCE_PER_DAY } from "../config/constants";
import { calculateGrandTotal } from "../utils/pricing";
import { AppError } from "../middleware/errorHandler";
import { NotificationService } from "./notification.service";
import { getNotificationTemplate } from "./notification-templates";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BookingFinancials {
  dakshina: number;
  travelCost?: number;
  foodAllowanceAmount: number;   // days × FOOD_ALLOWANCE_PER_DAY — charged AND paid out
  accommodationCost: number;     // charged AND paid out (0 until platform-booked stays)
  platformFee: number;           // PLATFORM_FEE_PERCENT of dakshina (single source: utils/pricing)
  travelServiceFee?: number;     // TRAVEL_SERVICE_FEE_PERCENT of travelCost
  platformFeeGst: number;        // GST_PERCENT on platformFee
  travelServiceFeeGst: number;   // GST_PERCENT on travelServiceFee
  gstAmount: number;             // total GST (both fees)
  grandTotal: number;            // customer pays — includes food + accommodation
  panditPayout: number;          // dakshina − platformFee + travel + food + accommodation
}

/**
 * Calculate all derived fee columns — a thin DELEGATE over the ONE money
 * source, utils/pricing.calculateGrandTotal. MONEY-CONSERVATION LAW: the
 * customer's grandTotal and the pandit's payout come from the SAME breakdown,
 * so payout can never exceed what was collected (the old local math here
 * excluded food/accommodation from the charge while processPaymentSuccess
 * included them in the payout — the platform silently ate the difference).
 */
export function calculateBookingFinancials(
  dakshina: number,
  travelCost = 0,
  foodAllowanceAmount = 0,
  accommodationCost = 0,
): BookingFinancials {
  const b = calculateGrandTotal({ dakshinaAmount: dakshina, travelCost, foodAllowanceAmount, accommodationCost });
  return {
    dakshina: b.dakshinaAmount,
    travelCost: b.travelCost || undefined,
    foodAllowanceAmount: b.foodAllowanceAmount,
    accommodationCost: b.accommodationCost,
    platformFee: b.platformFee,
    travelServiceFee: b.travelServiceFee || undefined,
    platformFeeGst: b.platformFeeGst,
    travelServiceFeeGst: b.travelServiceFeeGst,
    gstAmount: b.platformFeeGst + b.travelServiceFeeGst,
    grandTotal: b.grandTotal,
    panditPayout: b.panditPayout,
  };
}

export interface CreateBookingInput {
  customerId: string;      // User.id of the customer
  panditId: string;        // User.id of the pandit
  eventDate: Date;
  eventType: string;
  muhuratTime?: string;
  muhuratSuggested?: boolean;
  venueAddress: string;
  venueCity: string;
  venuePincode: string;
  venueLatitude?: number;
  venueLongitude?: number;
  specialInstructions?: string;
  attendees?: number;
  dakshinaAmount: number;
  // Travel & logistics
  travelMode?: string;
  travelCost?: number;
  foodArrangement?: string;
  foodAllowanceDays?: number;
  accommodationArrangement?: string;
  // Samagri
  samagriPreference?: string;
  samagriNotes?: string;
  samagriAmount?: number;
  // Financials (auto-calculated if not provided)
  // MONEY LAW: no caller may supply financial columns — every fee, total and
  // payout is derived server-side from the ONE money source (utils/pricing).
  // The old optional platformFee/travelServiceFee/grandTotal/panditPayout
  // overrides were an unloaded gun (no caller used them, zod stripped them
  // from the API) — removed so they can never be loaded.
}

// ─── Service functions ────────────────────────────────────────────────────────

export async function createBooking(input: CreateBookingInput) {
  // Verify pandit's User account is active and they have a pandit profile
  const panditUser = await prisma.user.findFirst({
    where: { id: input.panditId, role: "PANDIT", isActive: true },
    include: { pandit: true },
  });
  if (!panditUser?.pandit) {
    throw new AppError("Pandit not available", 400, "PANDIT_UNAVAILABLE");
  }

  const panditProfileId = panditUser.pandit.id;

  // सत्यापन GATE (server-enforced, ON THE CUSTOMER-CALLED CREATE PATH): the
  // pandit must have an APPROVED PoojaVerification (its LATEST version) for this
  // poojaType, or booking creation is rejected. Unverified pujas are not
  // bookable — this IS the trust promise. A re-submit resets the latest version
  // to PENDING, so it becomes unbookable again until re-approved.
  const latestVerification = await prisma.poojaVerification.findFirst({
    where: { panditProfileId, poojaType: input.eventType },
    orderBy: { version: "desc" },
    select: { status: true },
  });
  if (latestVerification?.status !== "APPROVED") {
    throw new AppError(
      "यह पूजा अभी प्रमाणित नहीं है — पंडित जी को पहले वीडियो सत्यापन पूरा करना होगा।",
      400,
      "POOJA_NOT_VERIFIED",
    );
  }

  // Check pandit availability: no CONFIRMED or CREATED booking on same calendar day
  const dayStart = new Date(input.eventDate);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayEnd.getDate() + 1);

  const conflict = await prisma.booking.findFirst({
    where: {
      panditId: panditProfileId,
      status: { in: ["CONFIRMED", "CREATED"] },
      eventDate: { gte: dayStart, lt: dayEnd },
    },
  });
  if (conflict) {
    throw new AppError(
      "Pandit is not available on the selected date",
      400,
      "DATE_UNAVAILABLE",
    );
  }

  // Auto-calculate financials — food allowance is part of the CHARGE (it is
  // paid out to the pandit, so the customer must have paid it in: conservation).
  const foodAllowanceDays = input.foodAllowanceDays ?? 0;
  const foodAllowanceAmount = foodAllowanceDays * FOOD_ALLOWANCE_PER_DAY;
  const fin = calculateBookingFinancials(input.dakshinaAmount, input.travelCost ?? 0, foodAllowanceAmount, 0);

  const booking = await prisma.booking.create({
    data: {
      bookingNumber: generateBookingNumber(),
      customerId: input.customerId,
      panditId: panditProfileId,
      eventDate: input.eventDate,
      eventType: input.eventType,
      muhuratTime: input.muhuratTime,
      muhuratSuggested: input.muhuratSuggested ?? false,
      venueAddress: input.venueAddress,
      venueCity: input.venueCity,
      venuePincode: input.venuePincode,
      venueLatitude: input.venueLatitude,
      venueLongitude: input.venueLongitude,
      specialInstructions: input.specialInstructions,
      attendees: input.attendees,
      dakshinaAmount: input.dakshinaAmount,
      // Travel & logistics. travelMode is normalized to the REAL enum —
      // the web wizard historically sent "LOCAL" for no-travel bookings,
      // which is not a TravelMode value and 500'd prisma.booking.create
      // (every local booking failed). Anything outside the enum means
      // "no travel": mode null, not required.
      travelMode: (["SELF_DRIVE", "TRAIN", "FLIGHT", "CAB", "BUS"].includes(input.travelMode ?? "")
        ? input.travelMode
        : null) as any,
      travelCost: input.travelCost ?? 0,
      travelRequired: ["SELF_DRIVE", "TRAIN", "FLIGHT", "CAB", "BUS"].includes(input.travelMode ?? ""),
      travelStatus: ["SELF_DRIVE", "TRAIN", "FLIGHT", "CAB", "BUS"].includes(input.travelMode ?? "")
        ? "PENDING"
        : "NOT_REQUIRED",
      foodArrangement: (input.foodArrangement ?? "CUSTOMER_PROVIDES") as any,
      foodAllowanceDays,
      foodAllowanceAmount,
      accommodationArrangement: (input.accommodationArrangement ?? "NOT_NEEDED") as any,
      // Samagri
      samagriPreference: (input.samagriPreference ?? "CUSTOMER_ARRANGES") as any,
      samagriAmount: input.samagriAmount ?? 0,
      samagriNotes: input.samagriNotes,
      // Financials — ONLY from the single money source (no caller overrides)
      platformFee: fin.platformFee,
      platformFeeGst: fin.platformFeeGst,
      travelServiceFee: fin.travelServiceFee ?? 0,
      travelServiceFeeGst: fin.travelServiceFeeGst,
      grandTotal: fin.grandTotal,
      panditPayout: fin.panditPayout,
      status: "CREATED",
      paymentStatus: "PENDING",
    },
    include: {
      pandit: true,
    },
  });


  const notificationService = new NotificationService();

  // Template 1 -> Customer
  const t1 = getNotificationTemplate("BOOKING_CREATED", { id: booking.id.substring(0, 8).toUpperCase(), pujaType: input.eventType, date: input.eventDate.toISOString().split('T')[0] });
  await notificationService.notify({
    userId: input.customerId,
    type: "BOOKING_CREATED",
    title: t1.title,
    message: t1.message,
    smsMessage: t1.smsMessage
  });

  // Template 2 -> Pandit
  if (input.panditId) {
    const p1 = getNotificationTemplate("NEW_BOOKING_REQUEST", { pujaType: input.eventType, date: input.eventDate.toISOString().split('T')[0], city: input.venueCity, amount: booking.panditPayout || input.dakshinaAmount });
    await notificationService.notify({
      userId: input.panditId,
      type: "NEW_BOOKING_REQUEST",
      title: p1.title,
      message: p1.message,
      smsMessage: p1.smsMessage
    });
  }
  return booking;
}

export async function getBookingById(
  id: string,
  requesterId: string,
  requesterRole: string,
) {
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      customer: true,  // customer IS the User
      pandit: { include: { user: true } },  // pandit is the PanditProfile
      review: true,
      statusUpdates: { orderBy: { createdAt: "desc" }, take: 10 },
    },
  });

  if (!booking) throw new AppError("Booking not found", 404, "NOT_FOUND");

  const isOwner =
    booking.customerId === requesterId ||
    booking.pandit?.userId === requesterId ||
    requesterRole === "ADMIN";

  if (!isOwner) throw new AppError("Access denied", 403, "FORBIDDEN");

  return booking;
}

export async function listMyBookings(
  userId: string,
  role: string,
  status?: string,
  page = 1,
  limit = 20,
) {
  let statusFilter: any = {};
  if (status) {
    if (status === "UPCOMING") {
      statusFilter = { status: { in: ["CREATED", "PANDIT_REQUESTED", "CONFIRMED", "TRAVEL_BOOKED", "PANDIT_EN_ROUTE", "PANDIT_ARRIVED", "PUJA_IN_PROGRESS"] } };
    } else if (status === "COMPLETED") {
      statusFilter = { status: "COMPLETED" };
    } else if (status === "CANCELLED") {
      statusFilter = { status: { in: ["CANCELLATION_REQUESTED", "CANCELLED", "REFUNDED"] } };
    } else {
      statusFilter = { status: status };
    }
  }

  const skip = (page - 1) * limit;

  if (role === "CUSTOMER") {
    // In new schema, customerId on Booking IS the User's ID
    const [bookings, total] = await prisma.$transaction([
      prisma.booking.findMany({
        where: { customerId: userId, ...statusFilter },
        include: { pandit: true },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.booking.count({ where: { customerId: userId, ...statusFilter } }),
    ]);
    return { bookings, total };
  }

  if (role === "PANDIT") {
    // Booking.panditId is the PanditProfile.id — resolve it from the user id
    const profile = await prisma.panditProfile.findUnique({ where: { userId }, select: { id: true } });
    if (!profile) return { bookings: [], total: 0 };
    const [bookings, total] = await prisma.$transaction([
      prisma.booking.findMany({
        where: { panditId: profile.id, ...statusFilter },
        include: { customer: true },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.booking.count({ where: { panditId: profile.id, ...statusFilter } }),
    ]);
    return { bookings, total };
  }

  return { bookings: [], total: 0 };
}
