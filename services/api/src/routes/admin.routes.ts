import { Router } from "express";
import { z } from "zod";
import { prisma } from "@hmarepanditji/db";
import { authenticate } from "../middleware/auth";
import { roleGuard } from "../middleware/roleGuard";
import { validate } from "../middleware/validator";
import { sendSuccess, sendPaginated } from "../utils/response";
import { AppError } from "../middleware/errorHandler";
import { initiateRefund } from "../services/payment.service";

const router: Router = Router();

// All admin routes require ADMIN role
router.use(authenticate, roleGuard("ADMIN"));

// ─── Validation schemas ───────────────────────────────────────────────────────

const verifyPanditSchema = z.object({
  isVerified: z.boolean(),
  reason: z.string().max(500).optional(),
});

const updateBookingSchema = z.object({
  status: z
    .enum(["CREATED", "PANDIT_REQUESTED", "CONFIRMED", "TRAVEL_BOOKED", "PANDIT_EN_ROUTE", "PANDIT_ARRIVED", "PUJA_IN_PROGRESS", "COMPLETED", "CANCELLATION_REQUESTED", "CANCELLED", "REFUNDED"])
    .optional(),
  adminNotes: z.string().max(500).optional(),
});

// ─── Routes ───────────────────────────────────────────────────────────────────

/**
 * GET /admin/stats
 * Dashboard statistics: total pandits, customers, bookings, revenue
 */
router.get("/stats", async (_req, res, next) => {
  try {
    const [
      totalPandits,
      verifiedPandits,
      totalCustomers,
      totalBookings,
      pendingBookings,
      revenueStats,
    ] = await Promise.all([
      prisma.pandit.count(),
      prisma.pandit.count({ where: { isVerified: true } }),
      prisma.customer.count(),
      prisma.booking.count(),
      prisma.booking.count({ where: { status: "CREATED" } }),
      prisma.booking.aggregate({
        where: { paymentStatus: "CAPTURED" },
        _sum: { grandTotal: true },
      }),
    ]);

    const totalRevenue = revenueStats._sum.grandTotal ?? 0;

    sendSuccess(res, {
      totalPandits,
      verifiedPandits,
      totalCustomers,
      totalBookings,
      pendingBookings,
      totalRevenue,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /admin/pandits
 * List all pandits with verification status.
 * Query: { isVerified?, isActive?, page?, limit? }
 */
router.get("/pandits", async (req, res, next) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (req.query.isVerified !== undefined) where.isVerified = req.query.isVerified === "true";
    if (req.query.isActive !== undefined) where.isActive = req.query.isActive !== "false";

    const [pandits, total] = await Promise.all([
      prisma.pandit.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { phone: true, email: true, name: true, createdAt: true } },
        },
      }),
      prisma.pandit.count({ where }),
    ]);

    sendPaginated(res, pandits, total, page, limit);
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /admin/pandits/:id/verify
 * Approve or reject a pandit's verification.
 * Body: { isVerified: boolean, reason? }
 */
router.patch(
  "/pandits/:id/verify",
  validate(verifyPanditSchema),
  async (req, res, next) => {
    try {
      const { isVerified, reason } = req.body as z.infer<typeof verifyPanditSchema>;

      const pandit = await prisma.pandit.findUnique({ where: { id: req.params.id } });
      if (!pandit) throw new AppError("Pandit not found", 404, "NOT_FOUND");

      const updated = await prisma.pandit.update({
        where: { id: req.params.id },
        data: { isVerified },
      });

      await prisma.adminLog.create({
        data: {
          adminUserId: req.user!.id,
          action: isVerified ? "PANDIT_VERIFIED" : "PANDIT_REJECTED",
          targetId: req.params.id,
          targetType: "Pandit",
          metadata: { reason: reason ?? null, isVerified } as object,
        },
      });

      sendSuccess(
        res,
        updated,
        isVerified ? "Pandit verified successfully" : "Pandit verification rejected",
      );
    } catch (err) {
      next(err);
    }
  },
);

/**
 * GET /admin/bookings
 * List all bookings with filters.
 * Query: { status?, panditId?, customerId?, from?, to?, page?, limit? }
 */
router.get("/bookings", async (req, res, next) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (req.query.status) where.status = req.query.status;
    if (req.query.panditId) where.panditId = req.query.panditId;
    if (req.query.customerId) where.customerId = req.query.customerId;
    if (req.query.from || req.query.to) {
      where.eventDate = {
        ...(req.query.from && { gte: new Date(req.query.from as string) }),
        ...(req.query.to && { lte: new Date(req.query.to as string) }),
      };
    }

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          pandit: { select: { displayName: true, city: true } },
          customer: {
            include: { user: { select: { phone: true, name: true } } },
          },
          ritual: { select: { name: true, nameHindi: true } },
        },
      }),
      prisma.booking.count({ where }),
    ]);

    sendPaginated(res, bookings, total, page, limit);
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /admin/bookings/:id
 * Admin override on a booking (status, notes).
 * Body: { status?, adminNotes? }
 */
router.patch(
  "/bookings/:id",
  validate(updateBookingSchema),
  async (req, res, next) => {
    try {
      const booking = await prisma.booking.findUnique({ where: { id: req.params.id } });
      if (!booking) throw new AppError("Booking not found", 404, "NOT_FOUND");

      const { status, adminNotes } = req.body as z.infer<typeof updateBookingSchema>;

      const updated = await prisma.booking.update({
        where: { id: req.params.id },
        data: {
          ...(status !== undefined && { status }),
          ...(adminNotes !== undefined && { adminNotes }),
        },
      });

      await prisma.adminLog.create({
        data: {
          adminUserId: req.user!.id,
          action: "BOOKING_UPDATED",
          targetId: req.params.id,
          targetType: "Booking",
          metadata: { status, adminNotes } as object,
        },
      });

      sendSuccess(res, updated, "Booking updated by admin");
    } catch (err) {
      next(err);
    }
  },
);

// ─── Travel Status ───────────────────────────────────────────────────────────

const travelStatusSchema = z.object({
  travelStatus: z.enum(["NOT_REQUIRED", "PENDING", "BOOKED", "IN_TRANSIT", "ARRIVED"]),
  travelBookingRef: z.string().max(100).optional(),
  travelNotes: z.string().max(500).optional(),
});

/**
 * PATCH /admin/bookings/:id/travel-status
 * Update travel status and booking reference for a booking.
 */
router.patch(
  "/bookings/:id/travel-status",
  validate(travelStatusSchema),
  async (req, res, next) => {
    try {
      const booking = await prisma.booking.findUnique({ where: { id: req.params.id } });
      if (!booking) throw new AppError("Booking not found", 404, "NOT_FOUND");
      if (!booking.travelRequired) {
        throw new AppError("This booking does not require travel", 400, "NO_TRAVEL");
      }

      const { travelStatus, travelBookingRef, travelNotes } = req.body;

      const updated = await prisma.booking.update({
        where: { id: req.params.bookingId },
        data: {
          travelStatus,
          ...(travelBookingRef !== undefined && { travelBookingRef }),
          ...(travelNotes !== undefined && { travelNotes }),
          ...(travelStatus === "BOOKED" && { status: "TRAVEL_BOOKED" }),
        },
        include: {
          pandit: { select: { id: true, displayName: true, user: { select: { phone: true } } } },
          customer: { include: { user: { select: { name: true, phone: true } } } },
        },
      });

      // Trigger Notifications
      if (travelStatus === "BOOKED") {
        const pPhone = updated.pandit?.user?.phone;
        const cPhone = updated.customer?.user?.phone;

        const ns = await import("../services/notification.service");

        if (pPhone && updated.pandit) {
          await ns.notifyTravelBookedToPandit({
            panditUserId: updated.pandit!.id,
            panditName: updated.pandit.displayName,
            panditPhone: pPhone,
            bookingNumber: updated.bookingNumber,
            travelMode: updated.travelMode ?? "Transport",
            travelBookingRef: travelBookingRef ?? "See app",
            travelNotes: travelNotes ?? "",
          });
        }

        if (cPhone && updated.customer && updated.customer.user) {
          await ns.notifyTravelBookedToCustomer({
            customerUserId: updated.customer!.id,
            customerName: updated.customer.user.name ?? "Customer",
            customerPhone: cPhone,
            bookingNumber: updated.bookingNumber,
            panditName: updated.pandit!.displayName,
            travelMode: updated.travelMode ?? "Transport",
            travelBookingRef: travelBookingRef ?? "See app",
          });
        }
      }

      await prisma.adminLog.create({
        data: {
          adminUserId: req.user!.id,
          action: "TRAVEL_STATUS_UPDATED",
          targetId: req.params.id,
          targetType: "Booking",
          metadata: { travelStatus, travelBookingRef } as object,
        },
      });

      sendSuccess(res, updated, "Travel status updated");
    } catch (err) {
      next(err);
    }
  },
);

// ─── Travel Queue ────────────────────────────────────────────────────────────

/**
 * GET /admin/travel-queue
 * Get bookings that need travel arrangement by admin.
 * Query: { status?, page?, limit? }
 */
router.get("/travel-queue", async (req, res, next) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const travelStatusFilter = req.query.status as string | undefined;

    const where: Record<string, unknown> = {
      travelRequired: true,
      status: { notIn: ["CANCELLED", "REFUNDED", "CREATED"] },
    };
    if (travelStatusFilter) {
      where.travelStatus = travelStatusFilter;
    }

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        skip,
        take: limit,
        orderBy: { eventDate: "asc" },
        select: {
          id: true,
          bookingNumber: true,
          eventType: true,
          eventDate: true,
          venueCity: true,
          venueAddress: true,
          travelRequired: true,
          travelMode: true,
          travelDistanceKm: true,
          travelStatus: true,
          travelBookingRef: true,
          travelNotes: true,
          travelCost: true,
          status: true,
          pandit: { select: { displayName: true, city: true, id: true } },
          customer: {
            include: { user: { select: { name: true, phone: true } } },
          },
        },
      }),
      prisma.booking.count({ where }),
    ]);

    sendPaginated(res, bookings, total, page, limit);
  } catch (err) {
    next(err);
  }
});

// ─── Payouts ─────────────────────────────────────────────────────────────────

/**
 * GET /admin/payouts
 * Get pending and completed payouts.
 * Query: { status?, page?, limit? }
 */
router.get("/payouts", async (req, res, next) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {
      paymentStatus: "CAPTURED",
      status: { in: ["COMPLETED", "CONFIRMED", "TRAVEL_BOOKED"] },
    };
    if (req.query.status) {
      where.payoutStatus = req.query.status;
    }

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        skip,
        take: limit,
        orderBy: { completedAt: "desc" },
        select: {
          id: true,
          bookingNumber: true,
          eventType: true,
          eventDate: true,
          completedAt: true,
          dakshinaAmount: true,
          travelCost: true,
          foodAllowanceAmount: true,
          panditPayout: true,
          payoutStatus: true,
          payoutReference: true,
          payoutCompletedAt: true,
          grandTotal: true,
          pandit: {
            select: {
              id: true,
              displayName: true,
              city: true,
              bankDetails: true,
            },
          },
        },
      }),
      prisma.booking.count({ where }),
    ]);

    // Aggregate payout stats
    const stats = await prisma.booking.aggregate({
      where: { paymentStatus: "CAPTURED", status: "COMPLETED" },
      _sum: { panditPayout: true, grandTotal: true },
      _count: true,
    });

    const pendingPayoutCount = await prisma.booking.count({
      where: { paymentStatus: "CAPTURED", status: "COMPLETED", payoutStatus: "PENDING" },
    });

    sendSuccess(res, {
      bookings,
      stats: {
        totalPayouts: stats._sum.panditPayout ?? 0,
        totalRevenue: stats._sum.grandTotal ?? 0,
        completedBookings: stats._count,
        pendingPayouts: pendingPayoutCount,
      },
    }, "Success", 200, { page, limit, total, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
});

const markPayoutSchema = z.object({
  payoutReference: z.string().min(1).max(100),
  payoutAmount: z.number().int().min(0).optional(),
});

/**
 * PATCH /admin/payouts/:bookingId
 * Mark a payout as completed for a booking.
 */
router.patch(
  "/payouts/:bookingId",
  validate(markPayoutSchema),
  async (req, res, next) => {
    try {
      const booking = await prisma.booking.findUnique({
        where: { id: req.params.bookingId },
      });
      if (!booking) throw new AppError("Booking not found", 404, "NOT_FOUND");
      if (booking.payoutStatus === "COMPLETED") {
        throw new AppError("Payout already completed", 400, "ALREADY_PAID");
      }

      const updated = await prisma.booking.update({
        where: { id: req.params.bookingId },
        data: {
          payoutStatus: "COMPLETED",
          payoutReference: req.body.payoutReference,
          payoutCompletedAt: new Date(),
          ...(req.body.payoutAmount !== undefined && { panditPayout: req.body.payoutAmount }),
        },
      });

      await prisma.adminLog.create({
        data: {
          adminUserId: req.user!.id,
          action: "PAYOUT_COMPLETED",
          targetId: req.params.bookingId,
          targetType: "Booking",
          metadata: {
            payoutReference: req.body.payoutReference,
            amount: updated.panditPayout,
          } as object,
        },
      });

      sendSuccess(res, updated, "Payout marked as completed");
    } catch (err) {
      next(err);
    }
  },
);

// ─── Cancellations ───────────────────────────────────────────────────────────

/**
 * GET /admin/cancellations
 * Get cancelled bookings and pending cancellation requests.
 * Query: { refundStatus?, page?, limit? }
 */
router.get("/cancellations", async (req, res, next) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {
      status: { in: ["CANCELLED", "REFUNDED"] },
    };
    if (req.query.refundStatus) {
      where.refundStatus = req.query.refundStatus;
    }

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        skip,
        take: limit,
        orderBy: { cancelledAt: "desc" },
        select: {
          id: true,
          bookingNumber: true,
          eventType: true,
          eventDate: true,
          status: true,
          cancelledBy: true,
          cancellationReason: true,
          cancellationRequestedAt: true,
          cancelledAt: true,
          grandTotal: true,
          refundAmount: true,
          refundStatus: true,
          refundReference: true,
          paymentStatus: true,
          pandit: { select: { displayName: true, city: true } },
          customer: {
            include: { user: { select: { name: true, phone: true } } },
          },
        },
      }),
      prisma.booking.count({ where }),
    ]);

    sendPaginated(res, bookings, total, page, limit);
  } catch (err) {
    next(err);
  }
});

const processCancellationSchema = z.object({
  action: z.enum(["approve_refund", "reject_refund", "partial_refund"]),
  refundAmount: z.number().int().min(0).optional(),
  reason: z.string().max(500).optional(),
});

/**
 * PATCH /admin/cancellations/:bookingId
 * Process a cancellation — approve/reject refund.
 */
router.patch(
  "/cancellations/:bookingId",
  validate(processCancellationSchema),
  async (req, res, next) => {
    try {
      const booking = await prisma.booking.findUnique({
        where: { id: req.params.bookingId },
      });
      if (!booking) throw new AppError("Booking not found", 404, "NOT_FOUND");

      const { action, refundAmount, reason } = req.body;

      if (action === "approve_refund") {
        const result = await initiateRefund(req.params.bookingId, reason);

        await prisma.booking.update({
          where: { id: req.params.bookingId },
          data: {
            refundAmount: result.refundAmount,
            refundStatus: "PROCESSING",
            refundReference: result.refundId,
            cancelledAt: booking.cancelledAt ?? new Date(),
          },
        });

        await prisma.adminLog.create({
          data: {
            adminUserId: req.user!.id,
            action: "REFUND_APPROVED",
            targetId: req.params.bookingId,
            targetType: "Booking",
            metadata: { refundAmount: result.refundAmount, refundId: result.refundId } as object,
          },
        });

        return sendSuccess(res, { refundId: result.refundId, refundAmount: result.refundAmount }, "Refund initiated");
      }

      if (action === "partial_refund") {
        if (refundAmount === undefined) {
          throw new AppError("refundAmount required for partial refund", 400, "VALIDATION_ERROR");
        }

        const updated = await prisma.booking.update({
          where: { id: req.params.bookingId },
          data: {
            refundAmount,
            refundStatus: "PROCESSING",
            status: "REFUNDED",
            adminNotes: reason ?? `Partial refund: ₹${refundAmount}`,
            cancelledAt: booking.cancelledAt ?? new Date(),
          },
        });

        await prisma.adminLog.create({
          data: {
            adminUserId: req.user!.id,
            action: "PARTIAL_REFUND",
            targetId: req.params.bookingId,
            targetType: "Booking",
            metadata: { refundAmount, reason } as object,
          },
        });

        return sendSuccess(res, updated, "Partial refund processed");
      }

      // reject_refund
      const updated = await prisma.booking.update({
        where: { id: req.params.bookingId },
        data: {
          refundStatus: "FAILED",
          adminNotes: reason ?? "Refund rejected by admin",
        },
      });

      await prisma.adminLog.create({
        data: {
          adminUserId: req.user!.id,
          action: "REFUND_REJECTED",
          targetId: req.params.bookingId,
          targetType: "Booking",
          metadata: { reason } as object,
        },
      });

      sendSuccess(res, updated, "Refund rejected");
    } catch (err) {
      next(err);
    }
  },
);

export default router;
