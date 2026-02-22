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
import { AppError } from "../middleware/errorHandler";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BookingFinancials {
  dakshina: number;
  travelCost?: number;
  platformFee: number;        // 15% of dakshina
  travelServiceFee?: number;  // 5% of travelCost
  gstAmount: number;          // 18% GST on platformFee + travelServiceFee
  grandTotal: number;         // customer pays
  panditPayout: number;       // dakshina - platformFee (travel reimbursed separately)
}

/** Calculate all derived fee columns from first principles. */
export function calculateBookingFinancials(
  dakshina: number,
  travelCost = 0,
): BookingFinancials {
  const platformFee = Math.round(dakshina * 0.15);
  const travelServiceFee = travelCost > 0 ? Math.round(travelCost * 0.05) : undefined;
  const taxableAmount = platformFee + (travelServiceFee ?? 0);
  const gstAmount = Math.round(taxableAmount * 0.18);
  const grandTotal = dakshina + travelCost + platformFee + (travelServiceFee ?? 0) + gstAmount;
  const panditPayout = dakshina - platformFee;
  return { dakshina, travelCost: travelCost || undefined, platformFee, travelServiceFee, gstAmount, grandTotal, panditPayout };
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
  foodArrangement?: FoodArrangement;
  foodAllowanceDays?: number;
  accommodationArrangement?: AccommodationArrangement | string;
  // Samagri
  samagriPreference?: SamagriPreference;
  samagriNotes?: string;
  samagriAmount?: number;
  // Financials (auto-calculated if not provided)
  platformFee?: number;
  travelServiceFee?: number;
  grandTotal?: number;
  panditPayout?: number;
}

// ─── Service functions ────────────────────────────────────────────────────────

export async function createBooking(input: CreateBookingInput) {
  // Verify pandit's User account is active and they have a pandit profile
  const panditUser = await prisma.user.findFirst({
    where: { id: input.panditId, role: "PANDIT", isActive: true },
    include: { panditProfile: true },
  });
  if (!panditUser?.panditProfile) {
    throw new AppError("Pandit not available", 400, "PANDIT_UNAVAILABLE");
  }

  // Check pandit availability: no CONFIRMED or CREATED booking on same calendar day
  const dayStart = new Date(input.eventDate);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayEnd.getDate() + 1);

  const conflict = await prisma.booking.findFirst({
    where: {
      panditId: input.panditId,
      status: { in: [BookingStatus.CONFIRMED, BookingStatus.CREATED] },
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

  // Auto-calculate financials
  const fin = calculateBookingFinancials(input.dakshinaAmount, input.travelCost ?? 0);
  const foodAllowanceDays = input.foodAllowanceDays ?? 0;
  const foodAllowanceAmount = foodAllowanceDays * 1000;

  const booking = await prisma.booking.create({
    data: {
      bookingNumber: generateBookingNumber(),
      customerId: input.customerId,
      panditId: input.panditId,
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
      // Travel & logistics
      travelMode: input.travelMode as TravelMode | undefined,
      travelCost: input.travelCost ?? 0,
      travelRequired: !!input.travelMode,
      travelStatus: input.travelMode ? TravelStatus.PENDING : TravelStatus.NOT_REQUIRED,
      foodArrangement: input.foodArrangement ?? FoodArrangement.CUSTOMER_PROVIDES,
      foodAllowanceDays,
      foodAllowanceAmount,
      accommodationArrangement: (input.accommodationArrangement as AccommodationArrangement) ?? AccommodationArrangement.NOT_NEEDED,
      // Samagri
      samagriPreference: input.samagriPreference ?? SamagriPreference.CUSTOMER_ARRANGES,
      samagriAmount: input.samagriAmount ?? 0,
      samagriNotes: input.samagriNotes,
      // Financials
      platformFee: input.platformFee ?? fin.platformFee,
      platformFeeGst: Math.round((input.platformFee ?? fin.platformFee) * 0.18),
      travelServiceFee: input.travelServiceFee ?? fin.travelServiceFee ?? 0,
      travelServiceFeeGst: Math.round((input.travelServiceFee ?? fin.travelServiceFee ?? 0) * 0.18),
      grandTotal: input.grandTotal ?? fin.grandTotal,
      panditPayout: input.panditPayout ?? fin.panditPayout,
      status: BookingStatus.CREATED,
      paymentStatus: "PENDING",
    },
    include: {
      pandit: true,
    },
  });


  const notificationService = new (require('./notification.service').NotificationService)();
  const getTemplate = require('./notification-templates').getNotificationTemplate;

  // Template 1 -> Customer
  const t1 = getTemplate("BOOKING_CREATED", { id: booking.id.substring(0, 8).toUpperCase(), pujaType: input.eventType, date: input.eventDate.toISOString().split('T')[0] });
  await notificationService.notify({
    userId: input.customerId,
    type: "BOOKING_CREATED",
    title: t1.title,
    message: t1.message,
    smsMessage: t1.smsMessage
  });

  // Template 2 -> Pandit
  if (input.panditId) {
    const p1 = getTemplate("NEW_BOOKING_REQUEST", { pujaType: input.eventType, date: input.eventDate.toISOString().split('T')[0], city: input.venueCity, amount: booking.panditPayout || input.dakshinaAmount });
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
      pandit: true,    // pandit IS the User
      review: true,
      statusUpdates: { orderBy: { createdAt: "desc" }, take: 10 },
    },
  });

  if (!booking) throw new AppError("Booking not found", 404, "NOT_FOUND");

  const isOwner =
    booking.customerId === requesterId ||
    booking.panditId === requesterId ||
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
      statusFilter = { status: { in: ["CREATED", "PANDIT_REQUESTED", "CONFIRMED", "TRAVEL_BOOKED", "PANDIT_EN_ROUTE", "PANDIT_ARRIVED", "PUJA_IN_PROGRESS"] as BookingStatus[] } };
    } else if (status === "COMPLETED") {
      statusFilter = { status: "COMPLETED" as BookingStatus };
    } else if (status === "CANCELLED") {
      statusFilter = { status: { in: ["CANCELLATION_REQUESTED", "CANCELLED", "REFUNDED"] as BookingStatus[] } };
    } else {
      statusFilter = { status: status as BookingStatus };
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
    // panditId on Booking IS the User's ID
    const [bookings, total] = await prisma.$transaction([
      prisma.booking.findMany({
        where: { panditId: userId, ...statusFilter },
        include: { customer: true },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.booking.count({ where: { panditId: userId, ...statusFilter } }),
    ]);
    return { bookings, total };
  }

  return { bookings: [], total: 0 };
}
