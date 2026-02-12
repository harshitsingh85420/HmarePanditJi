import { prisma } from "@hmarepanditji/db";
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
  const platformFee      = Math.round(dakshina * 0.15);
  const travelServiceFee = travelCost > 0 ? Math.round(travelCost * 0.05) : undefined;
  const taxableAmount    = platformFee + (travelServiceFee ?? 0);
  const gstAmount        = Math.round(taxableAmount * 0.18);
  const grandTotal       = dakshina + travelCost + platformFee + (travelServiceFee ?? 0) + gstAmount;
  const panditPayout     = dakshina; // travel & accommodation reimbursed outside platform
  return { dakshina, travelCost: travelCost || undefined, platformFee, travelServiceFee, gstAmount, grandTotal, panditPayout };
}

export interface CreateBookingInput {
  customerId: string;
  panditId: string;
  ritualId: string;
  eventDate: Date;
  eventTime?: string;
  muhurat?: string;
  muhuratSuggested?: string;
  venueAddress: Record<string, unknown>;
  specialRequirements?: string;
  numberOfAttendees?: number;
  pricing: Record<string, unknown>;
  // Travel & logistics
  travelMode?: string;
  travelCost?: number;
  foodArrangement?: string;
  foodAllowance?: number;
  accommodationPref?: string;
  // Samagri
  samagriPreference?: string;
  samagriNotes?: string;
  // Financials (auto-calculated if not provided)
  platformFee?: number;
  travelServiceFee?: number;
  gstAmount?: number;
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

  // Check pandit availability: no CONFIRMED or PENDING booking on same calendar day
  const dayStart = new Date(input.eventDate);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayEnd.getDate() + 1);

  const conflict = await prisma.booking.findFirst({
    where: {
      panditId: input.panditId,
      status: { in: ["CONFIRMED", "PENDING"] },
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
  const dakshina = (input.pricing as Record<string, number>).dakshina ?? 0;
  const fin = calculateBookingFinancials(dakshina, input.travelCost ?? 0);

  const booking = await prisma.booking.create({
    data: {
      bookingNumber: generateBookingNumber(),
      customerId: input.customerId,
      panditId: input.panditId,
      ritualId: input.ritualId,
      eventDate: input.eventDate,
      eventTime: input.eventTime,
      muhurat: input.muhurat,
      muhuratSuggested: input.muhuratSuggested,
      venueAddress: input.venueAddress as never,
      specialRequirements: input.specialRequirements,
      numberOfAttendees: input.numberOfAttendees,
      pricing: input.pricing as never,
      // Travel & logistics
      travelMode: input.travelMode,
      travelCost: input.travelCost,
      foodArrangement: input.foodArrangement,
      foodAllowance: input.foodAllowance,
      accommodationPref: input.accommodationPref,
      travelStatus: input.travelMode ? "PENDING" : "NOT_NEEDED",
      // Samagri
      samagriPreference: input.samagriPreference,
      samagriNotes: input.samagriNotes,
      // Financials
      platformFee:      input.platformFee      ?? fin.platformFee,
      travelServiceFee: input.travelServiceFee ?? fin.travelServiceFee,
      gstAmount:        input.gstAmount        ?? fin.gstAmount,
      grandTotal:       input.grandTotal       ?? fin.grandTotal,
      panditPayout:     input.panditPayout     ?? fin.panditPayout,
      status: "PENDING",
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
    booking.pandit.userId === requesterId ||
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
  const statusFilter = status ? { status: status as never } : {};

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
