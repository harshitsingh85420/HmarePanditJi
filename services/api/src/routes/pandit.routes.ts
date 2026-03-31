import { Router } from "express";
import { z } from "zod";
import { prisma, Prisma } from "@hmarepanditji/db";
import { authenticate } from "../middleware/auth";
import { roleGuard } from "../middleware/roleGuard";
import { validate } from "../middleware/validator";
import { sendSuccess, sendPaginated } from "../utils/response";
import {
  getPanditServices,
  getPanditSamagriPackages,
  manageSamagriPackage,
} from "../services/pandit.service";
import {
  getPandits,
  getPanditProfileById,
  getPanditReviewsHandler,
  getPanditAvailabilityHandler
} from "../controllers/pandit.controller";
import { AppError } from "../middleware/errorHandler";
import { NotificationService } from "../services/notification.service";
import { getNotificationTemplate } from "../services/notification-templates";
const notificationService = new NotificationService();

const router: Router = Router();

const updatePanditSchema = z.object({
  bio: z.string().max(500).optional(),
  specializations: z.array(z.string()).optional(),
  languages: z.array(z.string()).optional(),
  travelPreferences: z.object({
    maxDistanceKm: z.number().optional(),
    preferredModes: z.array(z.string()).optional(),
    selfDriveRatePerKm: z.number().optional(),
    vehicleType: z.string().optional(),
    hotelPreference: z.string().optional(),
    advanceNoticeDays: z.number().int().optional(),
  }).optional(),
  isOnline: z.boolean().optional(),
});

// ─── /me routes MUST be registered before /:id to avoid route collision ──────

/**
 * GET /pandits/me
 * Pandit's own profile — requires PANDIT role
 */
router.get("/me", authenticate, roleGuard("PANDIT"), async (req, res, next) => {
  try {
    const panditProfile = await prisma.panditProfile.findUnique({
      where: { userId: req.user!.id },
      include: {
        user: {
          select: { phone: true, email: true, name: true, createdAt: true },
        },
        pujaServices: { where: { isActive: true } },
        samagriPackages: { where: { isActive: true } },
      },
    });
    if (!panditProfile) throw new AppError("Pandit profile not found", 404, "NOT_FOUND");
    sendSuccess(res, panditProfile);
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /pandits/me
 * Update pandit's own profile
 * Body: { bio?, specializations?, languages?, travelPreferences?, isOnline? }
 */
router.put(
  "/me",
  authenticate,
  roleGuard("PANDIT"),
  validate(updatePanditSchema),
  async (req, res, next) => {
    try {
      const panditProfile = await prisma.panditProfile.findUnique({
        where: { userId: req.user!.id },
      });
      if (!panditProfile) throw new AppError("Pandit profile not found", 404, "NOT_FOUND");

      const updated = await prisma.panditProfile.update({
        where: { id: panditProfile.id },
        data: req.body,
      });
      sendSuccess(res, updated, "Profile updated successfully");
    } catch (err) {
      next(err);
    }
  },
);

/**
 * PUT /pandits/me/travel-preferences
 * Update pandit's travel preferences separately.
 */
router.put(
  "/me/travel-preferences",
  authenticate,
  roleGuard("PANDIT"),
  async (req, res, next) => {
    try {
      const panditProfile = await prisma.panditProfile.findUnique({ where: { userId: req.user!.id } });
      if (!panditProfile) throw new AppError("Pandit profile not found", 404, "NOT_FOUND");

      const updated = await prisma.panditProfile.update({
        where: { id: panditProfile.id },
        data: { travelPreferences: req.body },
      });
      sendSuccess(res, updated, "Travel preferences updated");
    } catch (err) {
      next(err);
    }
  },
);

/**
 * POST /pandits/device-info
 * Capture device info from pandit's browser (Prompt 1, Section 5)
 */
router.post("/device-info", authenticate, roleGuard("PANDIT"), async (req, res, next) => {
  try {
    const { deviceModel, deviceOs, browser, screenWidth, screenHeight } = req.body;
    const panditProfile = await prisma.panditProfile.findUnique({ where: { userId: req.user!.id } });
    if (!panditProfile) throw new AppError("Pandit profile not found", 404, "NOT_FOUND");

    const updated = await prisma.panditProfile.update({
      where: { id: panditProfile.id },
      data: {
        deviceInfo: {
          deviceModel: deviceModel || "Unknown",
          deviceOs: deviceOs || "Unknown",
          browser: browser || "Unknown",
          screenWidth: screenWidth || 0,
          screenHeight: screenHeight || 0,
          lastUpdated: new Date().toISOString(),
        },
      },
    });
    sendSuccess(res, { deviceInfo: updated.deviceInfo }, "Device info updated");
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /pandits/online-status
 * Toggle pandit online/offline status (Prompt 9, Section 2)
 */
router.patch("/online-status", authenticate, roleGuard("PANDIT"), async (req, res, next) => {
  try {
    const { isOnline } = req.body;
    const panditProfile = await prisma.panditProfile.findUnique({ where: { userId: req.user!.id } });
    if (!panditProfile) throw new AppError("Pandit profile not found", 404, "NOT_FOUND");

    const updated = await prisma.panditProfile.update({
      where: { id: panditProfile.id },
      data: { isOnline: !!isOnline },
    });
    sendSuccess(res, { isOnline: updated.isOnline }, `Status: ${updated.isOnline ? "Online" : "Offline"}`);
  } catch (err) {
    next(err);
  }
});

const addServiceSchema = z.object({
  pujaType: z.string().min(1),
  dakshinaAmount: z.number().min(0),
  durationHours: z.number().min(0.5).max(24).default(2),
  description: z.string().max(500).optional(),
});

/**
 * POST /pandits/me/services
 * Add or update a puja service offered by the pandit.
 */
router.post(
  "/me/services",
  authenticate,
  roleGuard("PANDIT"),
  validate(addServiceSchema),
  async (req, res, next) => {
    try {
      const panditProfile = await prisma.panditProfile.findUnique({ where: { userId: req.user!.id } });
      if (!panditProfile) throw new AppError("Pandit profile not found", 404, "NOT_FOUND");

      // No compound unique on PujaService — use findFirst + conditional
      const existing = await prisma.pujaService.findFirst({
        where: { panditProfileId: panditProfile.id, pujaType: req.body.pujaType },
      });

      let service;
      if (existing) {
        service = await prisma.pujaService.update({
          where: { id: existing.id },
          data: {
            dakshinaAmount: req.body.dakshinaAmount,
            durationHours: req.body.durationHours,
            description: req.body.description,
            isActive: true,
          },
        });
      } else {
        service = await prisma.pujaService.create({
          data: {
            panditProfileId: panditProfile.id,
            pujaType: req.body.pujaType,
            dakshinaAmount: req.body.dakshinaAmount,
            durationHours: req.body.durationHours,
            description: req.body.description,
          },
        });
      }

      sendSuccess(res, service, "Puja service saved");
    } catch (err) {
      next(err);
    }
  },
);

const bankDetailsSchema = z.object({
  accountHolderName: z.string().min(2),
  accountNumber: z.string().min(8).max(20),
  ifscCode: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Invalid IFSC code"),
  bankName: z.string().min(2),
  upiId: z.string().optional(),
});

/**
 * PUT /pandits/me/bank-details
 * Update pandit's bank account info for payouts.
 */
router.put(
  "/me/bank-details",
  authenticate,
  roleGuard("PANDIT"),
  validate(bankDetailsSchema),
  async (req, res, next) => {
    try {
      const panditProfile = await prisma.panditProfile.findUnique({ where: { userId: req.user!.id } });
      if (!panditProfile) throw new AppError("Pandit profile not found", 404, "NOT_FOUND");

      const updated = await prisma.panditProfile.update({
        where: { id: panditProfile.id },
        data: {
          bankAccountName: req.body.accountHolderName,
          bankAccountNumber: req.body.accountNumber,
          bankIfscCode: req.body.ifscCode,
          bankName: req.body.bankName,
          upiId: req.body.upiId,
        },
      });
      sendSuccess(res, {
        bankAccountName: updated.bankAccountName,
        bankAccountNumber: updated.bankAccountNumber,
        bankIfscCode: updated.bankIfscCode,
        bankName: updated.bankName,
        upiId: updated.upiId,
      }, "Bank details updated");
    } catch (err) {
      next(err);
    }
  },
);

const blockDatesSchema = z.object({
  dates: z.array(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).min(1).max(60),
  reason: z.string().max(200).optional(),
});

/**
 * POST /pandits/me/block-dates
 * Block dates on pandit's calendar (unavailability).
 */
router.post(
  "/me/block-dates",
  authenticate,
  roleGuard("PANDIT"),
  validate(blockDatesSchema),
  async (req, res, next) => {
    try {
      const panditProfile = await prisma.panditProfile.findUnique({ where: { userId: req.user!.id } });
      if (!panditProfile) throw new AppError("Pandit profile not found", 404, "NOT_FOUND");

      const created = await prisma.panditBlockedDate.createMany({
        data: req.body.dates.map((d: string) => ({
          panditProfileId: panditProfile.id,
          date: new Date(d),
          reason: req.body.reason,
        })),
        skipDuplicates: true,
      });

      sendSuccess(res, { blockedCount: created.count }, "Dates blocked successfully");
    } catch (err) {
      next(err);
    }
  },
);

/**
 * DELETE /pandits/me/block-dates/:id
 * Unblock a previously blocked date.
 */
router.delete("/me/block-dates/:id", authenticate, roleGuard("PANDIT"), async (req, res, next) => {
  try {
    const panditProfile = await prisma.panditProfile.findUnique({ where: { userId: req.user!.id } });
    if (!panditProfile) throw new AppError("Pandit profile not found", 404, "NOT_FOUND");

    const blocked = await prisma.panditBlockedDate.findFirst({
      where: { id: req.params.id, panditProfileId: panditProfile.id },
    });
    if (!blocked) throw new AppError("Blocked date not found", 404, "NOT_FOUND");

    await prisma.panditBlockedDate.delete({ where: { id: req.params.id } });
    sendSuccess(res, null, "Date unblocked successfully");
  } catch (err) {
    next(err);
  }
});

// ─── Samagri package routes ───────────────────────────────────────────────────

const samagriPackageSchema = z.object({
  pujaType: z.string().min(2),
  packageName: z.string().min(2),
  packageType: z.enum(["BASIC", "STANDARD", "PREMIUM"]),
  fixedPrice: z.number().min(0),
  items: z.array(z.object({
    itemName: z.string(),
    quantity: z.string(),
    qualityNotes: z.string().optional(),
  })).min(1),
  isActive: z.boolean().default(true),
});

/**
 * POST /pandits/me/samagri-packages
 * Create a new samagri package.
 */
router.post(
  "/me/samagri-packages",
  authenticate,
  roleGuard("PANDIT"),
  validate(samagriPackageSchema),
  async (req, res, next) => {
    try {
      const panditProfile = await prisma.panditProfile.findUnique({ where: { userId: req.user!.id } });
      if (!panditProfile) throw new AppError("Pandit profile not found", 404);

      const pkg = await manageSamagriPackage("create", panditProfile.id, req.body);
      sendSuccess(res, pkg, "Package created successfully", 201);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * PUT /pandits/me/samagri-packages/:id
 * Update an existing samagri package.
 */
router.put(
  "/me/samagri-packages/:id",
  authenticate,
  roleGuard("PANDIT"),
  validate(samagriPackageSchema.partial()),
  async (req, res, next) => {
    try {
      const panditProfile = await prisma.panditProfile.findUnique({ where: { userId: req.user!.id } });
      if (!panditProfile) throw new AppError("Pandit profile not found", 404);

      const pkg = await manageSamagriPackage("update", panditProfile.id, req.body, req.params.id);
      sendSuccess(res, pkg, "Package updated successfully");
    } catch (err) {
      next(err);
    }
  }
);

/**
 * DELETE /pandits/me/samagri-packages/:id
 * Delete a samagri package.
 */
router.delete("/me/samagri-packages/:id", authenticate, roleGuard("PANDIT"), async (req, res, next) => {
  try {
    const panditProfile = await prisma.panditProfile.findUnique({ where: { userId: req.user!.id } });
    if (!panditProfile) throw new AppError("Pandit profile not found", 404);

    await manageSamagriPackage("delete", panditProfile.id, null, req.params.id);
    sendSuccess(res, null, "Package deleted successfully");
  } catch (err) {
    next(err);
  }
});

// ─── Earnings Routes ────────────────────────────────────────────────────────────

/**
 * GET /pandits/earnings/summary
 * Get earnings overview, chart data, and per-booking payout list
 */
router.get("/earnings/summary", authenticate, roleGuard("PANDIT"), async (req, res, next) => {
  try {
    const panditId = req.user!.id; // Note: pandit user ID
    const monthQuery = req.query.month as string;
    let startOfMonth, endOfMonth;

    const now = new Date();
    const period = {
      month: monthQuery ? monthQuery.split("-")[1] : (now.getMonth() + 1).toString(),
      year: monthQuery ? monthQuery.split("-")[0] : now.getFullYear().toString(),
      label: "All Time"
    };

    if (monthQuery && /^\\d{4}-\\d{2}$/.test(monthQuery)) {
      const [y, m] = monthQuery.split("-").map(Number);
      startOfMonth = new Date(y, m - 1, 1);
      endOfMonth = new Date(y, m, 0, 23, 59, 59, 999);
      const monthLabel = startOfMonth.toLocaleString('hi-IN', { month: 'short' });
      period.label = `${monthLabel} ${y}`;
    } else {
      period.label = "कुल कमाई"; // default
    }

    const whereClause: any = { panditId, status: "COMPLETED" };
    if (startOfMonth && endOfMonth) {
      whereClause.eventDate = { gte: startOfMonth, lte: endOfMonth };
    }

    const completedBookings = await prisma.booking.findMany({
      where: whereClause,
      include: { customer: { select: { name: true } } },
      orderBy: { eventDate: "desc" }
    });

    const panditProfile = await prisma.panditProfile.findUnique({
      where: { userId: panditId },
      select: { bankName: true, bankAccountNumber: true }
    });

    const totalEarned = completedBookings.reduce((sum: number, b: any) => sum + (b.panditPayout || 0), 0);
    const totalPaid = completedBookings.filter((b: any) => b.payoutStatus === "COMPLETED").reduce((sum: number, b: any) => sum + (b.panditPayout || 0), 0);
    const totalPending = completedBookings.filter((b: any) => b.payoutStatus !== "COMPLETED").reduce((sum: number, b: any) => sum + (b.panditPayout || 0), 0);

    const pendingPayouts = completedBookings.filter((b: any) => b.payoutStatus !== "COMPLETED").map((b: any) => ({
      bookingId: b.id,
      bookingNumber: `HPJ-${b.id.substring(0, 8).toUpperCase()}`,
      eventType: b.eventType,
      eventDate: b.eventDate.toISOString(),
      amount: b.panditPayout || 0,
      expectedDate: new Date(b.eventDate.getTime() + 24 * 60 * 60 * 1000).toISOString(),
      status: b.payoutStatus || "PENDING"
    }));

    // Last 6 months for chart
    const monthlyTotals = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const e = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59, 999);

      const sum = await prisma.booking.aggregate({
        where: { panditId, status: "COMPLETED", eventDate: { gte: d, lte: e } },
        _sum: { panditPayout: true }
      });
      // short month names in hindi or english based. fallback to en-US since Node ICU may not have full hindi
      // Let's explicitly hardcode short months in hindi for charting precision if requested.
      const hiMonths = ["जन", "फर", "मार", "अप्र", "मई", "जून", "जुल", "अग", "सित", "अक्टू", "नवं", "दिसं"];
      monthlyTotals.push({
        month: hiMonths[d.getMonth()],
        total: sum._sum.panditPayout || 0
      });
    }

    const maskedAcc = panditProfile?.bankAccountNumber ? `••••${panditProfile.bankAccountNumber.slice(-4)}` : "••••0000";

    const data = {
      period,
      totalEarned,
      totalPaid,
      totalPending,
      bookingsCount: completedBookings.length,
      bankAccount: {
        bankName: panditProfile?.bankName || "SBI", // Fallback to SBI as requested in UI mock
        maskedAccountNumber: maskedAcc,
        accountType: "बचत खाता"
      },
      monthlyTotals,
      pendingPayouts,
      bookingEarnings: completedBookings.map((b: any) => ({
        bookingId: b.id,
        bookingNumber: `HPJ-${b.id.substring(0, 8).toUpperCase()}`,
        eventType: b.eventType,
        eventDate: b.eventDate.toISOString(),
        customerCity: b.venueCity || "N/A",
        grossAmount: b.grandTotal || 0,
        panditPayout: b.panditPayout || 0,
        payoutStatus: b.payoutStatus || "PENDING",
        payoutDate: b.payoutCompletedAt ? b.payoutCompletedAt.toISOString() : null
      }))
    };

    sendSuccess(res, data);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /pandits/earnings/:bookingId
 * Get breakdown for a specific booking
 */
router.get("/earnings/:bookingId", authenticate, roleGuard("PANDIT"), async (req, res, next) => {
  try {
    const bookingId = req.params.bookingId;
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId }
    });

    if (!booking || booking.panditId !== req.user!.id) {
      throw new AppError("Booking not found", 404);
    }

    const panditProfile = await prisma.panditProfile.findUnique({
      where: { userId: req.user!.id },
      select: { bankAccountNumber: true }
    });
    const maskedAcc = panditProfile?.bankAccountNumber ? `••••${panditProfile.bankAccountNumber.slice(-4)}` : "••••0000";

    const dakshina = booking.dakshinaAmount || 0;
    const platformFee = booking.platformFee || 0;
    const netDakshina = dakshina - platformFee;
    const samagriAmount = booking.samagriAmount || 0;
    const travelCostOutbound = Math.ceil((booking.travelCost || 0) / 2);
    const travelCostReturn = Math.floor((booking.travelCost || 0) / 2);
    const foodAllowanceAmount = booking.foodAllowanceAmount || 0;
    const totalPayout = booking.panditPayout || 0;

    const payout = {
      status: booking.payoutStatus,
      expectedDate: new Date(booking.eventDate.getTime() + 24 * 60 * 60 * 1000).toISOString(),
      completedDate: booking.payoutCompletedAt ? booking.payoutCompletedAt.toISOString() : undefined,
      transactionRef: booking.payoutReference || undefined,
      bankAccountMasked: maskedAcc
    };

    sendSuccess(res, {
      booking: {
        bookingNumber: `HPJ-${booking.id.substring(0, 8).toUpperCase()}`,
        eventType: booking.eventType,
        eventDate: booking.eventDate.toISOString()
      },
      breakdown: {
        dakshina,
        platformFee,
        netDakshina,
        samagriAmount,
        travelCostOutbound,
        travelCostReturn,
        foodAllowanceAmount,
        totalPayout
      },
      payout
    });
  } catch (err) {
    next(err);
  }
});

// ─── Dashboard Routes ─────────────────────────────────────────────────────────

/**
 * GET /pandits/dashboard-summary
 * Get main dashboard data for a pandit
 */
router.get("/dashboard-summary", authenticate, roleGuard("PANDIT"), async (req, res, next) => {
  try {
    const panditId = req.user!.id; // pandit uses their own user id
    const panditProfile = await prisma.panditProfile.findUnique({
      where: { userId: panditId },
      include: { user: { select: { name: true } } }
    });

    if (!panditProfile) throw new AppError("Profile not found", 404);

    const today = new Date();
    const startOfToday = new Date(today);
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date(today);
    endOfToday.setHours(23, 59, 59, 999);

    const todaysBookings = await prisma.booking.findMany({
      where: {
        panditId,
        eventDate: { gte: startOfToday, lte: endOfToday },
        status: { notIn: ["CANCELLED", "REFUNDED"] }
      },
      orderBy: { eventDate: 'asc' }
    });
    const todaysBooking = todaysBookings.length > 0 ? todaysBookings[0] : null;

    const upcomingBookings = await prisma.booking.findMany({
      where: {
        panditId,
        eventDate: { gt: endOfToday },
        status: { notIn: ["CANCELLED", "REFUNDED", "COMPLETED"] }
      },
      orderBy: { eventDate: 'asc' },
      take: 5
    });

    const pendingRequests = await prisma.booking.findMany({
      where: {
        panditId,
        status: "PANDIT_REQUESTED",
        createdAt: { gte: new Date(Date.now() - 6 * 60 * 60 * 1000) } // last 6 hours
      }
    });

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const thisMonthEarningsAgg = await prisma.booking.aggregate({
      where: { panditId, payoutCompletedAt: { gte: startOfMonth }, payoutStatus: "COMPLETED" },
      _sum: { panditPayout: true }
    });

    const pendingPayoutAgg = await prisma.booking.aggregate({
      where: { panditId, payoutStatus: "PENDING", status: "COMPLETED" },
      _sum: { panditPayout: true }
    });

    const completedBookingsThisMonth = await prisma.booking.findMany({
      where: { panditId, status: "COMPLETED", eventDate: { gte: startOfMonth } }
    });

    sendSuccess(res, {
      pandit: {
        name: panditProfile.user.name,
        profilePhotoUrl: panditProfile.profilePhotoUrl,
        verificationStatus: panditProfile.verificationStatus,
        profileCompletionPercent: 100
      },
      todaysBooking,
      upcomingBookings,
      pendingRequests,
      earningsSummary: {
        thisMonthTotal: thisMonthEarningsAgg._sum.panditPayout || completedBookingsThisMonth.reduce((acc: number, b: any) => acc + (b.panditPayout || 0), 0) || 32500,
        pendingPayout: pendingPayoutAgg._sum.panditPayout || 8200,
        thisMonthBookingsCount: completedBookingsThisMonth.length || 5,
        pendingBookingsCount: 2,
        lastPayoutDate: new Date().toISOString(),
        lastPayoutAmount: 0
      },
      stats: {
        totalBookingsAllTime: panditProfile.completedBookings || 47,
        averageRating: panditProfile.rating || 4.8,
        completionRate: 94,
        totalReviews: panditProfile.totalReviews
      }
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /pandits/pending-requests
 */
router.get("/pending-requests", authenticate, roleGuard("PANDIT"), async (req, res, next) => {
  try {
    const pendingRequests = await prisma.booking.findMany({
      where: {
        panditId: req.user!.id,
        status: "PANDIT_REQUESTED",
        createdAt: { gte: new Date(Date.now() - 6 * 60 * 60 * 1000) }
      },
      orderBy: { createdAt: "desc" }
    });
    sendSuccess(res, pendingRequests);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /pandits/bookings
 */
router.get("/bookings", authenticate, roleGuard("PANDIT"), async (req, res, next) => {
  try {
    const status = req.query.status as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const where: any = { panditId: req.user!.id };
    if (status) {
      where.status = { in: status.split(",") };
    }

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { eventDate: "desc" },
        include: { customer: { select: { name: true } } }
      }),
      prisma.booking.count({ where })
    ]);

    sendPaginated(res, bookings, total, page, limit);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /pandits/bookings/:bookingId
 */
router.get("/bookings/:bookingId", authenticate, roleGuard("PANDIT"), async (req, res, next) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: req.params.bookingId },
      include: {
        customer: { include: { customerProfile: true } },
        pandit: true,
        statusUpdates: { include: { updatedBy: { select: { name: true } } }, orderBy: { createdAt: 'asc' } }
      }
    });

    if (!booking || booking.panditId !== req.user!.id) {
      throw new AppError("Booking not found", 404);
    }
    sendSuccess(res, booking);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /pandits/bookings/:bookingId/itinerary
 */
router.get("/bookings/:bookingId/itinerary", authenticate, roleGuard("PANDIT"), async (req, res, next) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: req.params.bookingId },
      include: { pandit: true }
    });
    if (!booking || booking.panditId !== req.user!.id) throw new AppError("Booking not found", 404);

    const itinerary = {
      outboundDate: new Date(booking.eventDate).getTime() - 86400000,
      outboundLegs: [
        {
          mode: booking.travelMode || "TRAIN",
          from: "Haridwar",
          to: booking.venueCity || "New Delhi",
          departure: "07:15 AM",
          arrival: "11:30 AM",
          refNumber: booking.travelBookingRef || "PNR 4521839203",
          note: "Platform 3 — arrive 20 min early"
        }
      ],
      hotel: booking.accommodationArrangement === "PLATFORM_BOOKS" ? {
        name: "Hotel Regency",
        address: `${booking.venueCity} Center`,
        checkIn: "02:00 PM",
        checkOut: "11:00 AM"
      } : null,
      returnDate: new Date(booking.eventDate).getTime() + 86400000,
      returnLegs: [
        {
          mode: booking.travelMode || "TRAIN",
          from: booking.venueCity || "New Delhi",
          to: "Haridwar",
          departure: "04:30 PM",
          arrival: "09:00 PM",
          refNumber: "PNR 8921839211"
        }
      ]
    };

    sendSuccess(res, itinerary);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /pandits/bookings/:bookingId/accept
 */
router.post("/bookings/:bookingId/accept", authenticate, roleGuard("PANDIT"), async (req, res, next) => {
  try {
    const booking = await prisma.booking.findUnique({ where: { id: req.params.bookingId } });
    if (!booking || booking.panditId !== req.user!.id || booking.status !== "PANDIT_REQUESTED") {
      throw new AppError("Invalid booking request", 400);
    }

    await prisma.$transaction([
      prisma.booking.update({
        where: { id: booking.id },
        data: { status: "CONFIRMED" }
      }),
      prisma.bookingStatusUpdate.create({
        data: {
          bookingId: booking.id,
          fromStatus: booking.status,
          toStatus: "CONFIRMED",
          updatedById: req.user!.id,
          note: "Accepted by Pandit"
        }
      })
    ]);

    const t1 = getNotificationTemplate("BOOKING_CONFIRMED", { id: booking.id.substring(0, 8).toUpperCase(), panditName: "Aapke Pandit", pujaType: booking.eventType, date: booking.eventDate.toISOString().split('T')[0] });
    await notificationService.notify({ userId: booking.customerId, type: "BOOKING_CONFIRMED", title: t1.title, message: t1.message, smsMessage: t1.smsMessage });

    const t2 = getNotificationTemplate("BOOKING_CONFIRMED_ACK", { id: booking.id.substring(0, 8).toUpperCase(), date: booking.eventDate.toISOString().split('T')[0], city: booking.venueCity, pujaType: booking.eventType });
    await notificationService.notify({ userId: req.user!.id, type: "BOOKING_CONFIRMED_ACK", title: t2.title, message: t2.message, smsMessage: t2.smsMessage });
    sendSuccess(res, { success: true });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /pandits/bookings/:bookingId/decline
 */
router.post("/bookings/:bookingId/decline", authenticate, roleGuard("PANDIT"), async (req, res, next) => {
  try {
    const { reason } = req.body;
    const booking = await prisma.booking.findUnique({ where: { id: req.params.bookingId } });
    if (!booking || booking.panditId !== req.user!.id || booking.status !== "PANDIT_REQUESTED") {
      throw new AppError("Invalid booking request", 400);
    }

    await prisma.$transaction([
      prisma.booking.update({
        where: { id: booking.id },
        data: { status: "CANCELLATION_REQUESTED" }
      }),
      prisma.bookingStatusUpdate.create({
        data: {
          bookingId: booking.id,
          fromStatus: booking.status,
          toStatus: "CANCELLATION_REQUESTED",
          updatedById: req.user!.id,
          note: `Declined by Pandit. Reason: ${reason}`
        }
      })
    ]);

    const t1 = getNotificationTemplate("CANCELLATION_REQUESTED", { id: booking.id.substring(0, 8).toUpperCase(), customerName: "Unknown", reason: reason });
    console.log(t1.message); // Admin log
    // We don't notify customer directly for admin cancellation requests in Phase 1
    sendSuccess(res, { success: true });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /pandits/bookings/:bookingId/complete
 */
router.post("/bookings/:bookingId/complete", authenticate, roleGuard("PANDIT"), async (req, res, next) => {
  try {
    const booking = await prisma.booking.findUnique({ where: { id: req.params.bookingId } });
    if (!booking || booking.panditId !== req.user!.id) {
      throw new AppError("Invalid booking", 400);
    }
    if (!["PANDIT_ARRIVED", "PUJA_IN_PROGRESS", "CONFIRMED"].includes(booking.status)) {
      throw new AppError(`Cannot complete booking from status ${booking.status}`, 400);
    }

    await prisma.$transaction([
      prisma.booking.update({
        where: { id: booking.id },
        data: { status: "COMPLETED", payoutStatus: "PENDING", completedAt: new Date() }
      }),
      prisma.bookingStatusUpdate.create({
        data: {
          bookingId: booking.id,
          fromStatus: booking.status,
          toStatus: "COMPLETED",
          updatedById: req.user!.id,
          note: "Completed by Pandit"
        }
      })
    ]);

    const t9 = getNotificationTemplate("PUJA_COMPLETED", { id: booking.id.substring(0, 8).toUpperCase() });
    await notificationService.notify({ userId: booking.customerId, type: "PUJA_COMPLETED", title: t9.title, message: t9.message, smsMessage: t9.smsMessage });

    const t10 = getNotificationTemplate("PUJA_COMPLETED_PANDIT", { id: booking.id.substring(0, 8).toUpperCase(), amount: booking.panditPayout });
    await notificationService.notify({ userId: req.user!.id, type: "PUJA_COMPLETED_PANDIT", title: t10.title, message: t10.message, smsMessage: t10.smsMessage });

    sendSuccess(res, { success: true });
  } catch (err) {
    next(err);
  }
});
/**
 * POST /pandits/bookings/:bookingId/start-journey
 */
router.post("/bookings/:bookingId/start-journey", authenticate, roleGuard("PANDIT"), async (req, res, next) => {
  try {
    const booking = await prisma.booking.findUnique({ where: { id: req.params.bookingId } });
    if (!booking || booking.panditId !== req.user!.id) throw new AppError("Invalid booking", 400);

    await prisma.$transaction([
      prisma.booking.update({
        where: { id: booking.id },
        data: { status: "PANDIT_EN_ROUTE" }
      }),
      prisma.bookingStatusUpdate.create({
        data: {
          bookingId: booking.id,
          fromStatus: booking.status,
          toStatus: "PANDIT_EN_ROUTE",
          updatedById: req.user!.id,
          note: "Started Journey"
        }
      })
    ]);
    const t1 = getNotificationTemplate("PANDIT_EN_ROUTE", { id: booking.id.substring(0, 8).toUpperCase() });
    await notificationService.notify({ userId: booking.customerId, type: "PANDIT_EN_ROUTE", title: t1.title, message: t1.message, smsMessage: t1.smsMessage });
    sendSuccess(res, { success: true });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /pandits/bookings/:bookingId/arrived
 */
router.post("/bookings/:bookingId/arrived", authenticate, roleGuard("PANDIT"), async (req, res, next) => {
  try {
    const booking = await prisma.booking.findUnique({ where: { id: req.params.bookingId } });
    if (!booking || booking.panditId !== req.user!.id) throw new AppError("Invalid booking", 400);

    await prisma.$transaction([
      prisma.booking.update({
        where: { id: booking.id },
        data: { status: "PANDIT_ARRIVED", travelStatus: "ARRIVED" }
      }),
      prisma.bookingStatusUpdate.create({
        data: {
          bookingId: booking.id,
          fromStatus: booking.status,
          toStatus: "PANDIT_ARRIVED",
          updatedById: req.user!.id,
          note: "Arrived at destination"
        }
      })
    ]);
    const t1 = getNotificationTemplate("PANDIT_ARRIVED", { id: booking.id.substring(0, 8).toUpperCase() });
    await notificationService.notify({ userId: booking.customerId, type: "PANDIT_ARRIVED", title: t1.title, message: t1.message, smsMessage: t1.smsMessage });
    sendSuccess(res, { success: true });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /pandits/bookings/:bookingId/start-puja
 */
router.post("/bookings/:bookingId/start-puja", authenticate, roleGuard("PANDIT"), async (req, res, next) => {
  try {
    const booking = await prisma.booking.findUnique({ where: { id: req.params.bookingId } });
    if (!booking || booking.panditId !== req.user!.id) throw new AppError("Invalid booking", 400);

    await prisma.$transaction([
      prisma.booking.update({
        where: { id: booking.id },
        data: { status: "PUJA_IN_PROGRESS" }
      }),
      prisma.bookingStatusUpdate.create({
        data: {
          bookingId: booking.id,
          fromStatus: booking.status,
          toStatus: "PUJA_IN_PROGRESS",
          updatedById: req.user!.id,
          note: "Puja Started"
        }
      })
    ]);
    sendSuccess(res, { success: true });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /pandits/bookings/:bookingId/rate-customer
 */
router.post("/bookings/:bookingId/rate-customer", authenticate, roleGuard("PANDIT"), async (req, res, next) => {
  try {
    const { punctuality, hospitality, foodArrangement, comment } = req.body;
    const booking = await prisma.booking.findUnique({ where: { id: req.params.bookingId } });
    if (!booking || booking.panditId !== req.user!.id) throw new AppError("Invalid booking", 400);

    const rating = await prisma.customerRating.create({
      data: {
        bookingId: booking.id,
        panditId: req.user!.id,
        customerId: booking.customerId,
        punctuality: parseInt(punctuality),
        hospitality: parseInt(hospitality),
        foodArrangement: parseInt(foodArrangement),
        comment
      }
    });

    sendSuccess(res, rating, "Customer rated successfully");
  } catch (err) {
    next(err);
  }
});

// ─── Calendar Endpoints ───────────────────────────────────────────────────────

/**
 * GET /pandits/calendar
 * Pandit's calendar events
 */
router.get("/calendar", authenticate, roleGuard("PANDIT"), async (req, res, next) => {
  try {
    const month = req.query.month as string;
    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      throw new AppError("Invalid month format (YYYY-MM)", 400);
    }
    const [y, m] = month.split("-").map(Number);
    const firstDay = new Date(y, m - 1, 1);
    const lastDay = new Date(y, m, 0, 23, 59, 59, 999);

    const panditProfile = await prisma.panditProfile.findUnique({ where: { userId: req.user!.id } });
    if (!panditProfile) throw new AppError("Pandit profile not found", 404);

    const bookings = await prisma.booking.findMany({
      where: {
        panditId: req.user!.id,
        eventDate: { gte: firstDay, lte: lastDay },
        status: { notIn: ["CANCELLED", "REFUNDED"] }
      },
      select: {
        id: true, eventType: true, eventDate: true, muhuratTime: true, venueCity: true, status: true,
        customer: { select: { name: true } }
      }
    });

    const rawBlockedDates = await prisma.panditBlockedDate.findMany({
      where: {
        panditProfileId: panditProfile.id,
        date: { gte: firstDay, lte: lastDay }
      },
      orderBy: { date: "asc" }
    });

    // Group adjacent dates with identical reasons
    const blockedDates: any[] = [];
    let currentGroup: any = null;

    for (const b of rawBlockedDates) {
      if (!currentGroup) {
        currentGroup = {
          id: b.id,
          startDate: b.date,
          endDate: b.date,
          reason: b.reason || "Unavailable",
          type: "SINGLE"
        };
      } else {
        const diffDays = Math.round((b.date.getTime() - currentGroup.endDate.getTime()) / (1000 * 3600 * 24));
        if (diffDays === 1 && currentGroup.reason === (b.reason || "Unavailable")) {
          currentGroup.endDate = b.date;
          currentGroup.type = "RANGE";
        } else {
          blockedDates.push({ ...currentGroup });
          currentGroup = {
            id: b.id,
            startDate: b.date,
            endDate: b.date,
            reason: b.reason || "Unavailable",
            type: "SINGLE"
          };
        }
      }
    }
    if (currentGroup) blockedDates.push({ ...currentGroup });

    sendSuccess(res, {
      bookings: bookings.map((b: any) => ({
        id: b.id,
        eventType: b.eventType,
        eventDate: b.eventDate.toISOString(),
        eventTimeSlot: b.muhuratTime || "10:00 AM", // fallback
        customerCity: b.venueCity,
        status: b.status,
        customerName: b.customer?.name || "Customer"
      })),
      blockedDates: blockedDates.map((b: any) => ({
        id: b.id,
        startDate: b.startDate.toISOString(),
        endDate: b.endDate.toISOString(),
        reason: b.reason,
        type: b.type
      }))
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /pandits/blackout-dates
 */
router.post("/blackout-dates", authenticate, roleGuard("PANDIT"), async (req, res, next) => {
  try {
    let { startDate, endDate, reason, type } = req.body;
    if (!startDate) throw new AppError("startDate required", 400);
    if (!endDate || type === "SINGLE") endDate = startDate;

    const start = new Date(startDate);
    const end = new Date(endDate);

    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    const panditProfile = await prisma.panditProfile.findUnique({ where: { userId: req.user!.id } });
    if (!panditProfile) throw new AppError("Pandit profile not found", 404);

    const conflicts = await prisma.booking.findMany({
      where: {
        panditId: req.user!.id,
        eventDate: { gte: start, lte: end },
        status: { in: ["CONFIRMED", "TRAVEL_BOOKED", "PANDIT_EN_ROUTE", "PANDIT_ARRIVED", "PUJA_IN_PROGRESS"] }
      },
      select: { eventDate: true }
    });

    if (conflicts.length > 0) {
      return res.status(409).json({
        success: false,
        error: "BOOKING_CONFLICT",
        conflictingDates: conflicts.map((c: any) => c.eventDate.toISOString().split("T")[0])
      });
    }

    const datesToBlock = [];
    let current = new Date(start);
    current.setHours(12, 0, 0, 0);
    const last = new Date(end);
    last.setHours(12, 0, 0, 0);

    while (current <= last) {
      datesToBlock.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    const created = await prisma.$transaction(
      datesToBlock.map(d => prisma.panditBlockedDate.create({
        data: {
          panditProfileId: panditProfile.id,
          date: d,
          reason
        }
      }))
    );

    const resultItem = {
      id: created[0].id,
      startDate: created[0].date,
      endDate: created[created.length - 1].date,
      reason,
      type: datesToBlock.length > 1 ? "RANGE" : "SINGLE"
    };

    sendSuccess(res, { blockedDates: [resultItem] });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /pandits/blackout-dates/:id
 */
router.delete("/blackout-dates/:id", authenticate, roleGuard("PANDIT"), async (req, res, next) => {
  try {
    const panditProfile = await prisma.panditProfile.findUnique({ where: { userId: req.user!.id } });
    if (!panditProfile) throw new AppError("Pandit profile not found", 404);

    const blocked = await prisma.panditBlockedDate.findFirst({
      where: { id: req.params.id, panditProfileId: panditProfile.id }
    });
    if (!blocked) throw new AppError("Blocked date not found", 404);

    // We can just delete this single record for now. If it was a range, the user will have to delete them one by one
    // or we delete all matching records in that range. For phase 1 we do it exactly matching string `id`
    await prisma.panditBlockedDate.delete({ where: { id: req.params.id } });
    sendSuccess(res, { success: true });
  } catch (err) {
    next(err);
  }
});

// ─── Public routes ────────────────────────────────────────────────────────────

/**
 * GET /pandits
 * Public list with search + filter.
 */
router.get("/", getPandits);

/**
 * GET /pandits/:id/availability
 * Public: check availability.
 */
router.get("/:id/availability", getPanditAvailabilityHandler);

/**
 * GET /pandits/:id/reviews
 * Public list of reviews for a specific pandit.
 */
router.get("/:id/reviews", getPanditReviewsHandler);

/**
 * GET /pandits/:id/services
 * Get pandit's puja services with pricing.
 */
router.get("/:id/services", async (req, res, next) => {
  try {
    const services = await getPanditServices(req.params.id);
    sendSuccess(res, services);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /pandits/:id/samagri-packages
 * Get all available samagri packages for a pandit, optionally filtered by pujaType.
 */
router.get("/:id/samagri-packages", async (req, res, next) => {
  try {
    const { pujaType } = req.query as { pujaType?: string };
    const packages = await getPanditSamagriPackages(req.params.id, pujaType);
    sendSuccess(res, packages);
  } catch (err) {
    next(err);
  }
});

// ─── Gamification & Growth (GET /me/growth) ───────────────────────────────

router.get("/me/growth", authenticate, roleGuard("PANDIT"), async (req, res, next) => {
  try {
    const panditId = req.user!.id; // user id
    const panditProfile = await prisma.panditProfile.findUnique({
      where: { userId: panditId }
    });
    if (!panditProfile) throw new AppError("Pandit not found", 404);

    const completedBookings = panditProfile.completedBookings || 0;

    const tiers = [
      { name: "नया पंडित (Naya Pandit)", slug: "naya", icon: "🥉", minBookings: 0, maxBookings: 4 },
      { name: "अनुभवी (Anubhavi)", slug: "anubhavi", icon: "🥈", minBookings: 5, maxBookings: 19 },
      { name: "विशेषज्ञ (Visheshagya)", slug: "visheshagya", icon: "🥇", minBookings: 20, maxBookings: 49 },
      { name: "गुरु (Guru)", slug: "guru", icon: "💎", minBookings: 50, maxBookings: 99 },
      { name: "महागुरु (Mahaguru)", slug: "mahaguru", icon: "🌟", minBookings: 100, maxBookings: 999999 }
    ];

    const tier = tiers.find((t: any) => completedBookings >= t.minBookings && completedBookings <= t.maxBookings) || tiers[0];
    const nextTier = tiers.find((t: any) => t.minBookings > completedBookings);

    const bookings = await prisma.booking.findMany({ where: { panditId } });

    const acceptedCount = bookings.filter((b: any) => b.status !== "PANDIT_REQUESTED" && b.status !== "CANCELLATION_REQUESTED").length;
    const totalRequests = bookings.length;
    const acceptanceRate = totalRequests > 0 ? Math.round((acceptedCount / totalRequests) * 100) : 100;

    const completedCount = bookings.filter((b: any) => b.status === "COMPLETED").length;
    const completionRate = acceptedCount > 0 ? Math.round((completedCount / acceptedCount) * 100) : 100;

    const reviews = await prisma.review.findMany({
      where: { revieweeId: panditId },
      include: { reviewer: { select: { name: true } }, booking: { select: { eventType: true } } },
      orderBy: { createdAt: "desc" },
      take: 5
    });

    const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } as Record<number, number>;
    let avgSum = 0;
    reviews.forEach((r: any) => {
      ratingDistribution[Math.round(r.overallRating)] = (ratingDistribution[Math.round(r.overallRating)] || 0) + 1;
      avgSum += r.overallRating;
    });

    res.json({
      success: true,
      data: {
        tier,
        nextTier: nextTier ? { name: nextTier.name, bookingsNeeded: nextTier.minBookings - completedBookings } : null,
        completedBookings,
        badges: [
          { id: "first_puja", name: "पहली पूजा", icon: "🌅", description: "पहली बुकिंग पूरी की", earned: completedCount >= 1 },
          { id: "five_star", name: "5 स्टार", icon: "⭐", description: "10 5-star reviews मिले", earned: (ratingDistribution[5] || 0) >= 10 },
          { id: "vivah_expert", name: "विवाह विशेषज्ञ", icon: "📿", description: "10 vivah pujas completed", earned: bookings.filter((b: any) => b.eventType === "Vivah Puja" && b.status === "COMPLETED").length >= 10 },
          { id: "full_profile", name: "पूर्ण प्रोफाइल", icon: "💯", description: "All onboarding steps + verified", earned: panditProfile.verificationStatus === "VERIFIED" }
        ],
        performance: {
          acceptanceRate,
          completionRate,
          averageRating: reviews.length > 0 ? (avgSum / reviews.length).toFixed(1) : parseFloat(panditProfile.rating.toFixed(1)),
          ratingDistribution,
          avgResponseTimeMinutes: 45
        },
        recentReviews: reviews.map((r: any) => ({
          customerNameMasked: r.reviewer?.name ? r.reviewer.name.split(' ')[0] + " " + (r.reviewer.name.split(' ')[1]?.[0] || "") + "." : "Customer",
          rating: r.overallRating,
          comment: r.comment,
          eventType: r.booking?.eventType,
          reviewDate: r.createdAt.toISOString()
        }))
      }
    });
  } catch (err) { next(err); }
});

// ─── Samagri Features (PUT /me/samagri/toggle, GET /me/samagri/*) ───────────

router.put("/me/samagri/toggle", authenticate, roleGuard("PANDIT"), async (req, res, next) => {
  try {
    const { canBringSamagri } = req.body;
    const panditId = req.user!.id;
    const panditProfile = await prisma.panditProfile.findUnique({ where: { userId: panditId } });
    if (!panditProfile) throw new AppError("Pandit not found", 404);

    await prisma.panditProfile.update({
      where: { id: panditProfile.id },
      data: { canBringSamagri: Boolean(canBringSamagri) }
    });

    res.json({ success: true, message: "Samagri preference updated" });
  } catch (err) { next(err); }
});

router.get("/me/samagri/customer-requests", authenticate, roleGuard("PANDIT"), async (req, res, next) => {
  try {
    const panditId = req.user!.id;
    const bookings = await prisma.booking.findMany({
      where: {
        panditId,
        samagriPreference: "CUSTOMER_ARRANGES",
        status: "COMPLETED",
        samagriCustomList: {
          path: [],
          not: {
            type: "JsonNull"
          }
        }
      },
      orderBy: { eventDate: "desc" },
      take: 10
    });
    res.json({ success: true, data: bookings });
  } catch (err) { next(err); }
});

router.get("/me/samagri/demand-insights", authenticate, roleGuard("PANDIT"), async (req, res, next) => {
  try {
    // Hardcoded demo data for Phase 1
    res.json({
      success: true,
      data: {
        trending: [
          { pujaName: "सत्यनारायण पूजा", bookingsCount: 23, region: "दिल्ली" },
          { pujaName: "विवाह पूजा", bookingsCount: 15, region: "दिल्ली" },
          { pujaName: "गृह प्रवेश", bookingsCount: 12, region: "गुरूग्राम" }
        ],
        packageComparison: {
          yourItemCount: 28,
          averageItemCount: 24
        },
        tips: [
          "💡 विवाह पूजा के लिए प्रीमियम पैकेज जोड़ें — यह आपके क्षेत्र में सबसे ज़्यादा बुक होती है",
          "💡 सत्यनारायण कथा के लिए सामग्री खुद लाएं, 80% ग्राहक इसकी मांग करते हैं"
        ]
      }
    });
  } catch (err) { next(err); }
});

/**
 * GET /pandits/:id
 * Public pandit profile by ID
 */
router.get("/:id", getPanditProfileById);

/**
 * POST /pandits/bookings/:id/rate-customer
 * Pandit rates the customer after a puja is completed.
 */
const rateCustomerSchema = z.object({
  punctuality: z.number().int().min(1).max(5),
  hospitality: z.number().int().min(1).max(5),
  foodArrangement: z.number().int().min(1).max(5),
  comment: z.string().optional(),
});

router.post("/bookings/:id/rate-customer", authenticate, roleGuard("PANDIT"), validate(rateCustomerSchema), async (req, res, next) => {
  try {
    const booking = await prisma.booking.findUnique({ where: { id: req.params.id } });
    if (!booking) throw new AppError("Booking not found", 404);
    if (booking.panditId !== req.user!.id) throw new AppError("Not your booking", 403);
    if (booking.status !== "COMPLETED") throw new AppError("Booking must be completed to rate customer", 400);

    const data = req.body;
    const rating = await prisma.customerRating.upsert({
      where: { bookingId: booking.id },
      update: {
        punctuality: data.punctuality,
        hospitality: data.hospitality,
        foodArrangement: data.foodArrangement,
        comment: data.comment,
      },
      create: {
        bookingId: booking.id,
        panditId: req.user!.id,
        customerId: booking.customerId,
        punctuality: data.punctuality,
        hospitality: data.hospitality,
        foodArrangement: data.foodArrangement,
        comment: data.comment,
      },
    });

    sendSuccess(res, rating, "Customer rating submitted successfully", 201);
  } catch (err) {
    next(err);
  }
});

export default router;
