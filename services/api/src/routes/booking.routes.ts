import { Router } from "express";
import { z } from "zod";
import { prisma } from "@hmarepanditji/db";
import { authenticate } from "../middleware/auth";
import { roleGuard } from "../middleware/roleGuard";
import { sendSuccess, sendPaginated } from "../utils/response";
import { createBooking, getBookingById, listMyBookings } from "../services/booking.service";
import { createRazorpayOrder } from "../services/payment.service";
import { parsePagination } from "../utils/helpers";

const router = Router();

// All booking routes require authentication
router.use(authenticate);

// ── Validation ────────────────────────────────────────────────────────────────

const createBookingSchema = z.object({
  panditId: z.string().min(1),
  ritualId: z.string().min(1),
  eventDate: z.string().datetime(),
  eventTime: z.string().optional(),
  muhurat: z.string().optional(),
  venueAddress: z.object({
    addressLine1: z.string().min(1, "Address is required"),
    addressLine2: z.string().optional(),
    landmark: z.string().optional(),
    city: z.string().min(1, "City is required"),
    state: z.string().default("Delhi"),
    postalCode: z.string().length(6, "Enter a valid 6-digit PIN code"),
  }),
  specialRequirements: z.string().optional(),
  numberOfAttendees: z.number().int().positive().max(500).optional(),
  pricing: z.object({
    dakshina: z.number().positive(),
    platformFee: z.number().nonnegative(),
    total: z.number().positive(),
  }),
});

// ── Routes ────────────────────────────────────────────────────────────────────

/**
 * POST /bookings
 * Create a new booking + Razorpay order.
 */
router.post("/", roleGuard("CUSTOMER"), async (req, res, next) => {
  try {
    const body = createBookingSchema.parse(req.body);

    // Get or create Customer record for this user
    let customer = await prisma.customer.findUnique({
      where: { userId: req.user!.id },
    });
    if (!customer) {
      customer = await prisma.customer.create({
        data: { userId: req.user!.id },
      });
    }

    const booking = await createBooking({
      customerId: customer.id,
      panditId: body.panditId,
      ritualId: body.ritualId,
      eventDate: new Date(body.eventDate),
      eventTime: body.eventTime,
      muhurat: body.muhurat,
      venueAddress: body.venueAddress as Record<string, unknown>,
      specialRequirements: body.specialRequirements,
      numberOfAttendees: body.numberOfAttendees,
      pricing: body.pricing as Record<string, unknown>,
    });

    const order = await createRazorpayOrder(booking.id, customer.id);

    sendSuccess(res, { booking, order }, "Booking created", 201);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /bookings/my
 * List bookings for the authenticated user.
 */
router.get("/my", async (req, res, next) => {
  try {
    const { page, limit } = parsePagination(req.query as Record<string, unknown>);
    const status = typeof req.query.status === "string" ? req.query.status : undefined;
    const { bookings, total } = await listMyBookings(
      req.user!.id,
      req.user!.role,
      status,
      page,
      limit,
    );
    sendPaginated(res, bookings as unknown[], total, page, limit, "My bookings");
  } catch (err) {
    next(err);
  }
});

/**
 * GET /bookings/:id
 * Get a single booking by ID.
 */
router.get("/:id", async (req, res, next) => {
  try {
    const booking = await getBookingById(req.params.id, req.user!.id, req.user!.role);
    sendSuccess(res, { booking }, "Booking detail");
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /bookings/:id/status
 * Pandit: CONFIRMED | CANCELLED. Admin: any status.
 */
router.patch("/:id/status", roleGuard("PANDIT", "ADMIN"), async (req, res, next) => {
  try {
    const { status, reason } = req.body as { status: string; reason?: string };
    if (!status) {
      res.status(400).json({ success: false, message: "status is required" });
      return;
    }
    const booking = await prisma.booking.update({
      where: { id: req.params.id },
      data: {
        status: status as never,
        ...(reason ? { panditRejectedReason: reason } : {}),
        ...(status === "CONFIRMED" ? { panditAcceptedAt: new Date() } : {}),
      },
    });
    sendSuccess(res, { booking }, "Booking status updated");
  } catch (err) {
    next(err);
  }
});

/**
 * POST /bookings/:id/cancel
 * Cancel a booking.
 */
router.post("/:id/cancel", roleGuard("CUSTOMER", "ADMIN"), async (req, res, next) => {
  try {
    const { reason } = req.body as { reason?: string };
    const booking = await prisma.booking.update({
      where: { id: req.params.id },
      data: {
        status: "CANCELLED",
        cancelledAt: new Date(),
        cancellationReason: reason,
      },
    });
    sendSuccess(res, { booking }, "Booking cancelled");
  } catch (err) {
    next(err);
  }
});

export default router;
