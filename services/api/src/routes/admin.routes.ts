import { FastifyInstance } from "fastify";
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
import { listPoojaVerifications, approvePoojaVerification, rejectPoojaVerification } from "../controllers/poojaVerification.controller";

export default async function adminRoutes(fastify: FastifyInstance, _opts: any) {
  // All admin routes require ADMIN role
  fastify.addHook('preHandler', async (request, reply) => {
    await authenticate(request as any, reply as any);
    await roleGuard("ADMIN")(request as any, reply as any);
  });

  const updateBookingSchema = z.object({
    status: z
      .enum(["CREATED", "PANDIT_REQUESTED", "CONFIRMED", "TRAVEL_BOOKED", "PANDIT_EN_ROUTE", "PANDIT_ARRIVED", "PUJA_IN_PROGRESS", "COMPLETED", "CANCELLATION_REQUESTED", "CANCELLED", "REFUNDED"])
      .optional(),
    adminNotes: z.string().max(500).optional(),
  });


  // सत्यापन admin review queue — list PENDING, approve(=publish)/reject-with-reason
  fastify.get("/pooja-verifications", listPoojaVerifications);
  fastify.patch("/pooja-verifications/:id/approve", approvePoojaVerification);
  fastify.patch("/pooja-verifications/:id/reject", rejectPoojaVerification);

  fastify.get("/dashboard-stats", getDashboardStats);
  fastify.get("/alerts", getAlerts);
  fastify.get("/activity-feed", getActivityFeed);
  fastify.get("/travel-queue", getTravelQueue);
  fastify.patch("/bookings/:id/travel-calculate", travelCalculate);
  fastify.patch("/bookings/:id/travel-booked", travelBooked);

  fastify.post("/bookings/:id/cancel", async (request: any, reply: any) => {
    const id = request.params.id;
    const booking = await prisma.booking.findUnique({
      where: { id }
    });
    if (!booking) {
      return reply.status(404).send({ success: false, error: { message: "Booking not found" } });
    }

    if (booking.status !== "REQUESTED" && booking.status !== "ACCEPTED") {
      return reply.status(400).send({
        success: false,
        error: { message: `Booking can only be cancelled in REQUESTED or ACCEPTED status. Current status is ${booking.status}.` }
      });
    }

    const updated = await prisma.booking.update({
      where: { id },
      data: {
        status: "CANCELLED"
      }
    });

    return reply.send({ success: true, data: updated });
  });

  // Pandit verification routes
  fastify.get("/pandits", getPanditsAdmin);
  fastify.get("/pandits/:panditId", getPanditAdminDetail);
  fastify.patch("/pandits/:panditId/verify", updatePanditVerification);

  // Exact endpoints requested by ops spec:
  fastify.post("/pandits/:id/approve", async (request: any, reply: any) => {
    const id = request.params.id;
    const pandit = await prisma.panditProfile.findUnique({
      where: { id },
      include: { user: true }
    });
    if (!pandit) {
      return reply.status(404).send({ success: false, error: { message: "Pandit not found" } });
    }

    const updated = await prisma.panditProfile.update({
      where: { id },
      data: {
        // Canonical approved value — the admin verify flow and all
        // customer-facing readers gate on VERIFIED (APPROVED was a stray
        // spelling no read path fully honored).
        verificationStatus: "VERIFIED",
        verifiedAt: new Date(),
        verifiedById: request.user?.id || "admin",
        profileCompletionPercent: 100,
      }
    });

    try {
      const tmpl = getNotificationTemplate("VERIFICATION_APPROVED", {});
      await notificationService.notify({ userId: pandit.userId, type: "VERIFICATION", title: tmpl.title, message: tmpl.message, smsMessage: tmpl.smsMessage });
    } catch (err) {
      console.error("Failed to send verification notification", err);
    }

    return reply.send({ success: true, data: updated });
  });

  fastify.post("/pandits/:id/reject", async (request: any, reply: any) => {
    const id = request.params.id;
    const { reason } = request.body || {};
    if (!reason) {
      return reply.status(400).send({ success: false, error: { message: "Reason is required" } });
    }

    const pandit = await prisma.panditProfile.findUnique({
      where: { id },
      include: { user: true }
    });
    if (!pandit) {
      return reply.status(404).send({ success: false, error: { message: "Pandit not found" } });
    }

    const updated = await prisma.panditProfile.update({
      where: { id },
      data: {
        verificationStatus: "REJECTED",
        rejectionReason: reason,
      }
    });

    try {
      const tmpl = getNotificationTemplate("VERIFICATION_REJECTED", { reason });
      await notificationService.notify({ userId: pandit.userId, type: "VERIFICATION", title: tmpl.title, message: tmpl.message, smsMessage: tmpl.smsMessage });
    } catch (err) {
      console.error("Failed to send verification notification", err);
    }

    return reply.send({ success: true, data: updated });
  });

  fastify.post("/pandits/:id/force-offline", async (request: any, reply: any) => {
    const id = request.params.id;
    const pandit = await prisma.panditProfile.findUnique({
      where: { id }
    });
    if (!pandit) {
      return reply.status(404).send({ success: false, error: { message: "Pandit not found" } });
    }

    const updated = await prisma.panditProfile.update({
      where: { id },
      data: {
        isOnline: false
      }
    });

    return reply.send({ success: true, data: updated });
  });

  fastify.post("/payouts/:id/mark-paid", async (request: any, reply: any) => {
    const id = request.params.id;
    
    // Find Payout by ID or bookingId
    let payout = await prisma.payout.findFirst({
      where: {
        OR: [
          { id },
          { bookingId: id }
        ]
      }
    });

    if (!payout) {
      // If no Payout record exists, let's look up the Booking. If booking is completed, we can create a Payout record.
      const booking = await prisma.booking.findUnique({
        where: { id }
      });
      if (booking) {
        payout = await prisma.payout.create({
          data: {
            bookingId: booking.id,
            panditId: booking.panditId!,
            amount: booking.panditPayout || 0,
            status: "PENDING"
          }
        });
      } else {
        return reply.status(404).send({ success: false, error: { message: "Payout or Booking not found" } });
      }
    }

    // Update Payout status to PAID + paidAt
    const updatedPayout = await prisma.payout.update({
      where: { id: payout.id },
      data: {
        status: "PAID",
        paidAt: new Date()
      }
    });

    // Also update corresponding Booking's payoutStatus and payoutCompletedAt
    await prisma.booking.update({
      where: { id: payout.bookingId },
      data: {
        payoutStatus: "COMPLETED",
        payoutCompletedAt: new Date()
      }
    });

    return reply.send({ success: true, data: updatedPayout });
  });


  // ─── Payouts ─────────────────────────────────────────────────────────────────

  /**
   * GET /admin/payouts
   * Get pending and completed payouts.
   * Query: { status?, page?, limit? }
   */
  fastify.get("/payouts", async (request: any, reply: any) => {
    try {
      const req = request;
      const res = reply;
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
                city: true,
                bankAccountName: true,
                bankAccountNumber: true,
                bankIfscCode: true,
                upiId: true,
                user: { select: { id: true, name: true, phone: true } },
              },
            },
          },
        }),
        prisma.booking.count({ where }),
      ]);

      const mappedBookings = bookings.map(b => {
        const { pandit, ...rest } = b as any;
        return {
          ...rest,
          pandit: pandit ? {
            id: pandit.user?.id,
            name: pandit.user?.name,
            phone: pandit.user?.phone,
            bankAccountName: pandit.bankAccountName,
            bankAccountNumber: pandit.bankAccountNumber,
            bankIfscCode: pandit.bankIfscCode,
            upiId: pandit.upiId,
            panditProfile: { city: pandit.city }
          } : null
        };
      });

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
        bookings: mappedBookings,
        stats: {
          totalPayouts: stats._sum.panditPayout ?? 0,
          totalRevenue: stats._sum.grandTotal ?? 0,
          completedBookings: stats._count,
          pendingPayouts: pendingPayoutCount,
        },
      }, "Success", 200, { page, limit, total, totalPages: Math.ceil(total / limit) });
    } catch (err) {
      throw err;
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
  fastify.patch(
    "/payouts/:payoutId/complete",
    {
      preHandler: [validate(markPayoutSchema)],
    },
    async (request: any, reply: any) => {
      try {
        const req = request;
        const res = reply;
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

        const t1 = getNotificationTemplate("PAYOUT_COMPLETED", { id: booking.id.substring(0, 8).toUpperCase(), amount: booking.panditPayout, transactionRef: req.body.transactionRef });
        // Booking.panditId is the PanditProfile id — resolve the pandit's User
        // id (the Notification.userId FK) or the notify silently fails.
        const payoutPanditUserId = booking.panditId
          ? (await prisma.panditProfile.findUnique({ where: { id: booking.panditId }, select: { userId: true } }))?.userId
          : null;
        if (payoutPanditUserId) {
          await notificationService.notify({ userId: payoutPanditUserId, type: "PAYOUT_COMPLETED", title: t1.title, message: t1.message, smsMessage: t1.smsMessage });
        }
        sendSuccess(res, updated, "Payout marked as completed");
      } catch (err) {
        throw err;
      }
    },
  );

  // ─── Cancellations ───────────────────────────────────────────────────────────

  /**
   * GET /admin/cancellations
   * Get cancelled bookings and pending cancellation requests.
   * Query: { refundStatus?, page?, limit? }
   */
  fastify.get("/cancellations", async (request: any, reply: any) => {
    try {
      const req = request;
      const res = reply;
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
            pandit: { select: { city: true, user: { select: { name: true } } } },
            customer: {
              select: { name: true, phone: true }
            },
          },
        }),
        prisma.booking.count({ where }),
      ]);

      const mappedBookings = bookings.map(b => {
        const { pandit, ...rest } = b as any;
        return {
          ...rest,
          pandit: pandit ? {
            name: pandit.user?.name,
            panditProfile: { city: pandit.city }
          } : null
        };
      });

      sendPaginated(res, mappedBookings, total, page, limit);
    } catch (err) {
      throw err;
    }
  });

  const cancelApproveSchema = z.object({
    refundAmount: z.number().int().min(0),
    overrideReason: z.string().max(500).optional(),
  });

  fastify.post(
    "/bookings/:id/cancel-approve",
    {
      preHandler: [validate(cancelApproveSchema)],
    },
    async (request: any, reply: any) => {
      try {
        const req = request;
        const res = reply;
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


        const t1 = getNotificationTemplate("CANCELLATION_APPROVED", { id: booking.id.substring(0, 8).toUpperCase(), refundAmount: req.body.refundAmount || 0 });
        await notificationService.notify({ userId: booking.customerId, type: "CANCELLATION_APPROVED", title: t1.title, message: t1.message, smsMessage: t1.smsMessage });

        if (booking.panditId) {
          // Booking.panditId is the PanditProfile id — resolve the pandit's
          // User id (the Notification.userId FK) before notifying.
          const cancelPanditUserId = (await prisma.panditProfile.findUnique({ where: { id: booking.panditId }, select: { userId: true } }))?.userId;
          if (cancelPanditUserId) {
            const t2 = getNotificationTemplate("CANCELLATION_APPROVED_PANDIT", { id: booking.id.substring(0, 8).toUpperCase() });
            await notificationService.notify({ userId: cancelPanditUserId, type: "CANCELLATION_APPROVED", title: t2.title, message: t2.message, smsMessage: t2.smsMessage });
          }
        }

        sendSuccess(res, { success: true }, "Cancellation approved");
      } catch (err) {
        throw err;
      }
    },
  );

  const cancelRejectSchema = z.object({
    rejectionReason: z.string().min(1).max(500),
  });

  fastify.post(
    "/bookings/:id/cancel-reject",
    {
      preHandler: [validate(cancelRejectSchema)],
    },
    async (request: any, reply: any) => {
      try {
        const req = request;
        const res = reply;
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
        throw err;
      }
    },
  );

  // ─── All Bookings ────────────────────────────────────────────────────────────
  fastify.get("/bookings", getAllBookingsAdmin);
  fastify.get("/bookings/:bookingId", getBookingAdminDetail);
  fastify.patch("/bookings/:id/status", updateBookingStatusAdmin);
  fastify.patch("/bookings/:id/reassign", reassignPanditAdmin);

  // ─── Support Tickets ─────────────────────────────────────────────────────────
  fastify.get("/support-tickets", getSupportTickets);
  fastify.post("/support-tickets", createSupportTicket);
  fastify.patch("/support-tickets/:id", updateSupportTicket);
}
