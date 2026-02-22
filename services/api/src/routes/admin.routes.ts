// @ts-nocheck
import { Router } from "express";
import { z } from "zod";
import { prisma } from "@hmarepanditji/db";
import { authenticate } from "../middleware/auth";
import { roleGuard } from "../middleware/roleGuard";
import { validate } from "../middleware/validator";
import { sendSuccess, sendPaginated } from "../utils/response";
import { AppError } from "../middleware/errorHandler";
import { initiateRefund } from "../services/payment.service";
import { NotificationService } from "../services/notification.service";
import { getNotificationTemplate } from "../services/notification-templates";
const notificationService = new NotificationService();
import {
  getDashboardStats,
  getAlerts,
  getActivityFeed,
  getTravelQueue,
  travelCalculate,
  travelBooked,
  getPanditsAdmin,
  getPanditAdminDetail,
  updatePanditVerification,
  getAllBookingsAdmin,
  getBookingAdminDetail,
  updateBookingStatusAdmin,
  reassignPanditAdmin,
  getSupportTickets,
  createSupportTicket,
  updateSupportTicket
} from "../controllers/admin.controller";

const router: Router = Router();

// All admin routes require ADMIN role
router.use(authenticate, roleGuard("ADMIN"));

const updateBookingSchema = z.object({
  status: z
    .enum(["CREATED", "PANDIT_REQUESTED", "CONFIRMED", "TRAVEL_BOOKED", "PANDIT_EN_ROUTE", "PANDIT_ARRIVED", "PUJA_IN_PROGRESS", "COMPLETED", "CANCELLATION_REQUESTED", "CANCELLED", "REFUNDED"])
    .optional(),
  adminNotes: z.string().max(500).optional(),
});


router.get("/dashboard-stats", getDashboardStats);
router.get("/alerts", getAlerts);
router.get("/activity-feed", getActivityFeed);
router.get("/travel-queue", getTravelQueue);
router.patch("/bookings/:id/travel-calculate", travelCalculate);
router.patch("/bookings/:id/travel-booked", travelBooked);

// Pandit verification routes
router.get("/pandits", getPanditsAdmin);
router.get("/pandits/:panditId", getPanditAdminDetail);
router.patch("/pandits/:panditId/verify", updatePanditVerification);


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
              name: true,
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
  transactionRef: z.string().min(1).max(100),
  paymentMethod: z.string().optional(),
  paymentDate: z.string().optional(),
  notes: z.string().optional(),
});

/**
 * PATCH /admin/payouts/:payoutId/complete
 * Mark a payout as completed for a booking.
 */
router.patch(
  "/payouts/:payoutId/complete",
  validate(markPayoutSchema),
  async (req, res, next) => {
    try {
      const booking = await prisma.booking.findUnique({
        where: { id: req.params.payoutId },
      });
      if (!booking) throw new AppError("Booking not found", 404, "NOT_FOUND");
      if (booking.payoutStatus === "COMPLETED") {
        throw new AppError("Payout already completed", 400, "ALREADY_PAID");
      }

      const updated = await prisma.booking.update({
        where: { id: req.params.payoutId },
        data: {
          payoutStatus: "COMPLETED",
          payoutReference: req.body.transactionRef,
          payoutCompletedAt: req.body.paymentDate ? new Date(req.body.paymentDate) : new Date(),
          adminNotes: (booking.adminNotes ? booking.adminNotes + "\n" : "") + (req.body.notes || ""),
        },
      });

      const t1 = getNotificationTemplate("PAYOUT_COMPLETED", { id: booking.id.substring(0,8).toUpperCase(), amount: booking.panditPayout, transactionRef: req.body.transactionRef });
      await notificationService.notify({ userId: booking.panditId!, type: "PAYOUT_COMPLETED", title: t1.title, message: t1.message, smsMessage: t1.smsMessage });
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
      status: { in: ["CANCELLATION_REQUESTED", "CANCELLED", "REFUNDED"] },
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
          pandit: { select: { name: true, city: true } },
          customer: {
            select: { name: true, phone: true }
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

const cancelApproveSchema = z.object({
  refundAmount: z.number().int().min(0),
  overrideReason: z.string().max(500).optional(),
});

router.post(
  "/bookings/:id/cancel-approve",
  validate(cancelApproveSchema),
  async (req, res, next) => {
    try {
      const booking = await prisma.booking.findUnique({
        where: { id: req.params.id },
      });
      if (!booking) throw new AppError("Booking not found", 404, "NOT_FOUND");

      let result;
      if (booking.paymentStatus === "CAPTURED") {
        result = await initiateRefund(req.params.id, req.body.overrideReason);
      }

      await prisma.booking.update({
        where: { id: req.params.id },
        data: {
          status: "CANCELLED",
          refundAmount: req.body.refundAmount,
          refundStatus: "PROCESSING",
          refundReference: result?.refundId,
          cancelledAt: new Date(),
          adminNotes: (booking.adminNotes ? booking.adminNotes + "\n" : "") + (req.body.overrideReason || "")
        },
      });

      
      const t1 = getNotificationTemplate("CANCELLATION_APPROVED", { id: booking.id.substring(0,8).toUpperCase(), refundAmount: req.body.refundAmount || 0 });
      await notificationService.notify({ userId: booking.customerId, type: "CANCELLATION_APPROVED", title: t1.title, message: t1.message, smsMessage: t1.smsMessage });

      if (booking.panditId) {
        const t2 = getNotificationTemplate("CANCELLATION_APPROVED_PANDIT", { id: booking.id.substring(0,8).toUpperCase() });
        await notificationService.notify({ userId: booking.panditId, type: "CANCELLATION_APPROVED", title: t2.title, message: t2.message, smsMessage: t2.smsMessage });
      }

      sendSuccess(res, { success: true }, "Cancellation approved");
    } catch (err) {
      next(err);
    }
  },
);

const cancelRejectSchema = z.object({
  rejectionReason: z.string().min(1).max(500),
});

router.post(
  "/bookings/:id/cancel-reject",
  validate(cancelRejectSchema),
  async (req, res, next) => {
    try {
      const booking = await prisma.booking.findUnique({
        where: { id: req.params.id },
      });
      if (!booking) throw new AppError("Booking not found", 404, "NOT_FOUND");

      const updated = await prisma.booking.update({
        where: { id: req.params.id },
        data: {
          status: "CONFIRMED",
          adminNotes: (booking.adminNotes ? booking.adminNotes + "\n" : "") + `Cancellation Rejected: ${req.body.rejectionReason}`,
        },
      });

      sendSuccess(res, updated, "Cancellation rejected");
    } catch (err) {
      next(err);
    }
  },
);

// ─── All Bookings ────────────────────────────────────────────────────────────
router.get("/bookings", getAllBookingsAdmin);
router.get("/bookings/:bookingId", getBookingAdminDetail);
router.patch("/bookings/:id/status", updateBookingStatusAdmin);
router.patch("/bookings/:id/reassign", reassignPanditAdmin);

// ─── Support Tickets ─────────────────────────────────────────────────────────
router.get("/support-tickets", getSupportTickets);
router.post("/support-tickets", createSupportTicket);
router.patch("/support-tickets/:id", updateSupportTicket);

export default router;
