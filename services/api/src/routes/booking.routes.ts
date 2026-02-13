import { Router } from "express";
import { z } from "zod";
import { prisma } from "@hmarepanditji/db";
import { authenticate } from "../middleware/auth";
import { roleGuard } from "../middleware/roleGuard";
import { sendSuccess, sendPaginated } from "../utils/response";
import { createBooking, getBookingById, listMyBookings, calculateBookingFinancials } from "../services/booking.service";
import { createRazorpayOrder } from "../services/payment.service";
import { parsePagination } from "../utils/helpers";
import {
  notifyBookingAccepted,
  notifyBookingRejected,
  notifyBookingCancelledToPandit,
} from "../services/notification.service";
import { logger } from "../utils/logger";

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
  muhuratSuggested: z.string().optional(),
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
    platformFee: z.number().nonnegative().optional(),
    total: z.number().positive().optional(),
  }),
  // Travel & logistics
  travelMode: z.enum(["self_drive", "train", "flight"]).optional(),
  travelCost: z.number().nonnegative().optional(),
  foodArrangement: z.enum(["customer_provides", "platform_allowance"]).optional(),
  foodAllowance: z.number().nonnegative().optional(),
  accommodationPref: z.enum(["customer_arranges", "platform_helps"]).optional(),
  // Samagri
  samagriPreference: z.enum(["pandit_brings", "customer_arranges", "need_help"]).optional(),
  samagriNotes: z.string().max(500).optional(),
});

// ── Financials endpoint schema ─────────────────────────────────────────────

const calculateFinancialsSchema = z.object({
  dakshina: z.number().positive(),
  travelCost: z.number().nonnegative().optional(),
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
      muhuratSuggested: body.muhuratSuggested,
      venueAddress: body.venueAddress as Record<string, unknown>,
      specialRequirements: body.specialRequirements,
      numberOfAttendees: body.numberOfAttendees,
      pricing: body.pricing as Record<string, unknown>,
      travelMode: body.travelMode,
      travelCost: body.travelCost,
      foodArrangement: body.foodArrangement,
      foodAllowance: body.foodAllowance,
      accommodationPref: body.accommodationPref,
      samagriPreference: body.samagriPreference,
      samagriNotes: body.samagriNotes,
    });

    const order = await createRazorpayOrder(booking.id, customer.id);

    sendSuccess(res, { booking, order }, "Booking created", 201);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /bookings/calculate-fees
 * Returns a fee breakdown (platformFee, travelServiceFee, gstAmount, grandTotal, panditPayout)
 * given a dakshina amount and optional travelCost. No auth required.
 */
router.post("/calculate-fees", async (req, res, next) => {
  try {
    const { dakshina, travelCost } = calculateFinancialsSchema.parse(req.body);
    const financials = calculateBookingFinancials(dakshina, travelCost ?? 0);
    sendSuccess(res, { financials }, "Fee breakdown calculated");
  } catch (err) {
    next(err);
  }
});

/**
 * GET /bookings/pandit/my
 * List bookings assigned to the authenticated pandit.
 * Query: { status?, page?, limit? }
 */
router.get("/pandit/my", roleGuard("PANDIT"), async (req, res, next) => {
  try {
    const { page, limit } = parsePagination(req.query as Record<string, unknown>);
    const status = typeof req.query.status === "string" ? req.query.status : undefined;
    const { bookings, total } = await listMyBookings(
      req.user!.id,
      "PANDIT",
      status,
      page,
      limit,
    );
    sendPaginated(res, bookings as unknown[], total, page, limit, "Pandit bookings");
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
 * PATCH /bookings/:id/accept
 * Pandit accepts a booking.
 */
router.patch("/:id/accept", roleGuard("PANDIT"), async (req, res, next) => {
  try {
    const pandit = await prisma.pandit.findUnique({ where: { userId: req.user!.id } });
    if (!pandit) return res.status(404).json({ success: false, message: "Pandit not found" });

    const existing = await prisma.booking.findUnique({
      where: { id: req.params.id },
      include: { customer: { include: { user: true } } },
    });
    if (!existing) return res.status(404).json({ success: false, message: "Booking not found" });
    if (existing.panditId !== pandit.id) return res.status(403).json({ success: false, message: "Not your booking" });
    if (existing.status !== "PENDING") return res.status(400).json({ success: false, message: `Cannot accept booking in ${existing.status} status` });

    const booking = await prisma.booking.update({
      where: { id: req.params.id },
      data: { status: "CONFIRMED", panditAcceptedAt: new Date() },
    });

    // Notify customer (non-blocking)
    const customerPhone = existing.customer.user.phone;
    const customerName = existing.customer.user.fullName ?? existing.customer.user.phone;
    if (customerPhone) {
      notifyBookingAccepted({
        customerUserId: existing.customer.userId,
        customerPhone,
        customerName,
        bookingNumber: existing.bookingNumber,
        panditName: pandit.displayName,
        eventDate: existing.eventDate,
      }).catch((err) => logger.error("notifyBookingAccepted failed:", err));
    }

    sendSuccess(res, { booking }, "Booking accepted");
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /bookings/:id/reject
 * Pandit rejects a booking.
 * Body: { reason?: string }
 */
router.patch("/:id/reject", roleGuard("PANDIT"), async (req, res, next) => {
  try {
    const pandit = await prisma.pandit.findUnique({ where: { userId: req.user!.id } });
    if (!pandit) return res.status(404).json({ success: false, message: "Pandit not found" });

    const existing = await prisma.booking.findUnique({
      where: { id: req.params.id },
      include: { customer: { include: { user: true } } },
    });
    if (!existing) return res.status(404).json({ success: false, message: "Booking not found" });
    if (existing.panditId !== pandit.id) return res.status(403).json({ success: false, message: "Not your booking" });
    if (existing.status !== "PENDING") return res.status(400).json({ success: false, message: `Cannot reject booking in ${existing.status} status` });

    const { reason } = req.body as { reason?: string };

    const booking = await prisma.booking.update({
      where: { id: req.params.id },
      data: {
        status: "CANCELLED",
        panditRejectedReason: reason ?? "Pandit declined",
        cancelledAt: new Date(),
        cancelledBy: "PANDIT",
      },
    });

    // Notify customer (non-blocking)
    const customerPhone = existing.customer.user.phone;
    const customerName = existing.customer.user.fullName ?? existing.customer.user.phone;
    if (customerPhone) {
      notifyBookingRejected({
        customerUserId: existing.customer.userId,
        customerPhone,
        customerName,
        bookingNumber: existing.bookingNumber,
        panditName: pandit.displayName,
        eventDate: existing.eventDate,
      }).catch((err) => logger.error("notifyBookingRejected failed:", err));
    }

    sendSuccess(res, { booking }, "Booking rejected");
  } catch (err) {
    next(err);
  }
});

const statusUpdateSchema = z.object({
  status: z.enum([
    "TRAVEL_BOOKED",
    "PANDIT_EN_ROUTE",
    "PANDIT_ARRIVED",
    "PUJA_IN_PROGRESS",
    "COMPLETED",
  ]),
  note: z.string().max(500).optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

/**
 * POST /bookings/:id/status-update
 * Pandit updates booking progress (e.g. "I'm on my way", "I've arrived").
 * Body: { status, note?, latitude?, longitude? }
 */
router.post("/:id/status-update", roleGuard("PANDIT"), async (req, res, next) => {
  try {
    const body = statusUpdateSchema.parse(req.body);

    const pandit = await prisma.pandit.findUnique({ where: { userId: req.user!.id } });
    if (!pandit) return res.status(404).json({ success: false, message: "Pandit not found" });

    const existing = await prisma.booking.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ success: false, message: "Booking not found" });
    if (existing.panditId !== pandit.id) return res.status(403).json({ success: false, message: "Not your booking" });

    // Update booking status
    const updateData: Record<string, unknown> = { status: body.status };
    if (body.status === "COMPLETED") updateData.completedAt = new Date();

    const booking = await prisma.booking.update({
      where: { id: req.params.id },
      data: updateData as never,
    });

    // Create status update record
    await prisma.bookingStatusUpdate.create({
      data: {
        bookingId: req.params.id,
        fromStatus: existing.status as never,
        toStatus: body.status as never,
        note: body.note,
        latitude: body.latitude,
        longitude: body.longitude,
        updatedBy: req.user!.id,
      },
    });

    sendSuccess(res, { booking }, `Status updated to ${body.status}`);
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

    // Fetch full booking for notification context
    const existing = await prisma.booking.findUnique({
      where: { id: req.params.id },
      include: {
        customer: { include: { user: true } },
        pandit: { include: { user: true } },
        ritual: true,
      },
    });

    const booking = await prisma.booking.update({
      where: { id: req.params.id },
      data: {
        status: status as never,
        ...(reason ? { panditRejectedReason: reason } : {}),
        ...(status === "CONFIRMED" ? { panditAcceptedAt: new Date() } : {}),
      },
    });

    // Fire notifications (non-blocking)
    if (existing) {
      const customerPhone = existing.customer.user.phone;
      const customerName = existing.customer.user.fullName ?? existing.customer.user.phone;
      const panditName = existing.pandit.displayName;

      if (status === "CONFIRMED" && customerPhone) {
        notifyBookingAccepted({
          customerUserId: existing.customer.userId,
          customerPhone,
          customerName,
          bookingNumber: existing.bookingNumber,
          panditName,
          eventDate: existing.eventDate,
        }).catch((err) => logger.error("notifyBookingAccepted failed:", err));
      } else if (status === "CANCELLED" && customerPhone) {
        notifyBookingRejected({
          customerUserId: existing.customer.userId,
          customerPhone,
          customerName,
          bookingNumber: existing.bookingNumber,
          panditName,
          eventDate: existing.eventDate,
        }).catch((err) => logger.error("notifyBookingRejected failed:", err));
      }
    }

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

    // Fetch full booking for notification context
    const existing = await prisma.booking.findUnique({
      where: { id: req.params.id },
      include: { pandit: { include: { user: true } } },
    });

    const booking = await prisma.booking.update({
      where: { id: req.params.id },
      data: {
        status: "CANCELLED",
        cancelledAt: new Date(),
        cancellationReason: reason,
      },
    });

    // Notify pandit (non-blocking)
    if (existing) {
      const panditPhone = existing.pandit.user.phone;
      if (panditPhone) {
        notifyBookingCancelledToPandit({
          panditUserId: existing.pandit.userId,
          panditPhone,
          bookingNumber: existing.bookingNumber,
          reason,
        }).catch((err) => logger.error("notifyBookingCancelledToPandit failed:", err));
      }
    }

    sendSuccess(res, { booking }, "Booking cancelled");
  } catch (err) {
    next(err);
  }
});

export default router;
