import { Router } from "express";
import { z } from "zod";
import { prisma } from "@hmarepanditji/db";
import { authenticate } from "../middleware/auth";
import { roleGuard } from "../middleware/roleGuard";
import { validate } from "../middleware/validator";
import { sendSuccess, sendPaginated } from "../utils/response";
import { AppError } from "../middleware/errorHandler";

const router = Router();

// All admin routes require ADMIN role
router.use(authenticate, roleGuard("ADMIN"));

// ─── Validation schemas ───────────────────────────────────────────────────────

const verifyPanditSchema = z.object({
  isVerified: z.boolean(),
  reason: z.string().max(500).optional(),
});

const updateBookingSchema = z.object({
  status: z
    .enum(["PENDING", "CONFIRMED", "IN_PROGRESS", "COMPLETED", "CANCELLED", "REFUNDED"])
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
      paidBookings,
    ] = await Promise.all([
      prisma.pandit.count(),
      prisma.pandit.count({ where: { isVerified: true } }),
      prisma.customer.count(),
      prisma.booking.count(),
      prisma.booking.count({ where: { status: "PENDING" } }),
      prisma.booking.findMany({
        where: { paymentStatus: "PAID" },
        select: { pricing: true },
      }),
    ]);

    // Sum pricing.total from JSON field across all paid bookings
    const totalRevenue = (paidBookings as Array<{ pricing: unknown }>).reduce((sum, b) => {
      const pricing = b.pricing as Record<string, number> | null;
      return sum + (pricing?.total ?? 0);
    }, 0);

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
          user: { select: { phone: true, email: true, fullName: true, createdAt: true } },
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
            include: { user: { select: { phone: true, fullName: true } } },
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

export default router;
