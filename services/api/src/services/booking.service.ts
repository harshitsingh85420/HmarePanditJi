import {
  prisma,
  BookingStatus,
  TravelStatus,
  FoodArrangement,
  SamagriPreference,
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
  panditPayout: number;       // dakshina (travel reimbursed separately)
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
  const panditPayout = dakshina; // travel & accommodation reimbursed outside platform
  return { dakshina, travelCost: travelCost || undefined, platformFee, travelServiceFee, gstAmount, grandTotal, panditPayout };
}

export interface CreateBookingInput {
  customerId: string;
  panditId: string;
  ritualId: string;
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
  accommodationArrangement?: string;
  // Samagri
  samagriPreference?: SamagriPreference;
  samagriNotes?: string;
  // Financials (auto-calculated if not provided)
  platformFee?: number;
  travelServiceFee?: number;
  grandTotal?: number;
  panditPayout?: number;
}

// ─── Service functions ────────────────────────────────────────────────────────

export async function createBooking(input: CreateBookingInput) {
  // Verify pandit exists and is active
  const pandit = await prisma.pandit.findFirst({
    where: { id: input.panditId, isActive: true },
  });
  if (!pandit) throw new AppError("Pandit not available", 400, "PANDIT_UNAVAILABLE");

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

  // Verify ritual exists and is active
  const ritual = await prisma.ritual.findFirst({
    where: { id: input.ritualId, isActive: true },
  });
  if (!ritual) throw new AppError("Ritual not found", 404, "NOT_FOUND");

  // Auto-calculate financials when not explicitly provided
  const fin = calculateBookingFinancials(input.dakshinaAmount, input.travelCost ?? 0);

  const booking = await prisma.booking.create({
    data: {
      bookingNumber: generateBookingNumber(),
      customerId: input.customerId,
      panditId: input.panditId,
      ritualId: input.ritualId,
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
      travelMode: input.travelMode,
      travelCost: input.travelCost ?? 0,
      travelRequired: !!input.travelMode,
      travelStatus: input.travelMode ? TravelStatus.PENDING : TravelStatus.NOT_REQUIRED,
      foodArrangement: input.foodArrangement ?? FoodArrangement.CUSTOMER_PROVIDES,
      foodAllowanceDays: input.foodAllowanceDays ?? 0,
      accommodationArrangement: input.accommodationArrangement as never ?? "NOT_NEEDED",
      // Samagri
      samagriPreference: input.samagriPreference ?? SamagriPreference.CUSTOMER_ARRANGES,
      samagriNotes: input.samagriNotes,
      // Financials
      platformFee: input.platformFee ?? fin.platformFee,
      travelServiceFee: input.travelServiceFee ?? fin.travelServiceFee ?? 0,
      platformFeeGst: Math.round((input.platformFee ?? fin.platformFee) * 0.18),
      travelServiceFeeGst: Math.round((input.travelServiceFee ?? fin.travelServiceFee ?? 0) * 0.18),
      grandTotal: input.grandTotal ?? fin.grandTotal,
      panditPayout: input.panditPayout ?? fin.panditPayout,
      status: BookingStatus.CREATED,
      paymentStatus: "PENDING",
    },
    include: {
      pandit: { include: { user: true } },
      ritual: true,
    },
  });

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
      customer: { include: { user: true } },
      pandit: { include: { user: true } },
      ritual: true,
      review: true,
    },
  });

  if (!booking) throw new AppError("Booking not found", 404, "NOT_FOUND");

  const isOwner =
    booking.customer.userId === requesterId ||
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
  const skip = (page - 1) * limit;
  const statusFilter = status ? { status: status as BookingStatus } : {};

  if (role === "CUSTOMER") {
    const customer = await prisma.customer.findUnique({ where: { userId } });
    if (!customer) return { bookings: [], total: 0 };

    const [bookings, total] = await prisma.$transaction([
      prisma.booking.findMany({
        where: { customerId: customer.id, ...statusFilter },
        include: { pandit: { include: { user: true } }, ritual: true },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.booking.count({ where: { customerId: customer.id, ...statusFilter } }),
    ]);
    return { bookings, total };
  }

  if (role === "PANDIT") {
    const pandit = await prisma.pandit.findUnique({ where: { userId } });
    if (!pandit) return { bookings: [], total: 0 };

    const [bookings, total] = await prisma.$transaction([
      prisma.booking.findMany({
        where: { panditId: pandit.id, ...statusFilter },
        include: { customer: { include: { user: true } }, ritual: true },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.booking.count({ where: { panditId: pandit.id, ...statusFilter } }),
    ]);
    return { bookings, total };
  }

  return { bookings: [], total: 0 };
}
