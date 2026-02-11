import { prisma } from "@hmarepanditji/db";
import { generateBookingNumber } from "../utils/helpers";
import { AppError } from "../middleware/errorHandler";

// ─── Stub implementations — replace in Sprint 5 ──────────────────────────────

export interface CreateBookingInput {
  customerId: string;
  panditId: string;
  ritualId: string;
  eventDate: Date;
  eventTime?: string;
  muhurat?: string;
  venueAddress: Record<string, unknown>;
  specialRequirements?: string;
  numberOfAttendees?: number;
  pricing: Record<string, unknown>;
}

export async function createBooking(input: CreateBookingInput) {
  // Verify pandit exists and is active
  const pandit = await prisma.pandit.findFirst({
    where: { id: input.panditId, isVerified: true, isActive: true },
  });
  if (!pandit) throw new AppError("Pandit not available", 400, "PANDIT_UNAVAILABLE");

  // Verify ritual exists
  const ritual = await prisma.ritual.findFirst({
    where: { id: input.ritualId, isActive: true },
  });
  if (!ritual) throw new AppError("Ritual not found", 404, "NOT_FOUND");

  const booking = await prisma.booking.create({
    data: {
      bookingNumber: generateBookingNumber(),
      customerId: input.customerId,
      panditId: input.panditId,
      ritualId: input.ritualId,
      eventDate: input.eventDate,
      eventTime: input.eventTime,
      muhurat: input.muhurat,
      venueAddress: input.venueAddress,
      specialRequirements: input.specialRequirements,
      numberOfAttendees: input.numberOfAttendees,
      pricing: input.pricing,
      status: "PENDING",
      paymentStatus: "PENDING",
    },
    include: { pandit: true, ritual: true },
  });

  // TODO sprint 5: send notification to pandit
  return booking;
}

export async function getBookingById(id: string, requesterId: string, requesterRole: string) {
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

  // Access control: owner customer, assigned pandit, or admin
  const isOwner =
    booking.customer.userId === requesterId ||
    booking.pandit.userId === requesterId ||
    requesterRole === "ADMIN";

  if (!isOwner) throw new AppError("Access denied", 403, "FORBIDDEN");

  return booking;
}
