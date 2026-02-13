import { Router } from "express";
import { z } from "zod";
import { prisma } from "@hmarepanditji/db";
import { authenticate } from "../middleware/auth";
import { roleGuard } from "../middleware/roleGuard";
import { validate } from "../middleware/validator";
import { sendSuccess, sendPaginated } from "../utils/response";
import {
  listPandits,
  getPanditById,
  getPanditReviews,
  getPanditServices,
  getPanditAvailability,
} from "../services/pandit.service";
import { AppError } from "../middleware/errorHandler";

const router: Router = Router();

const updatePanditSchema = z.object({
  bio: z.string().max(500).optional(),
  specializations: z.array(z.string()).optional(),
  languages: z.array(z.string()).optional(),
  availableDays: z.array(z.string()).optional(),
  basePricing: z.record(z.unknown()).optional(),
  displayName: z.string().min(2).optional(),
  // Travel preferences
  maxTravelDistance: z.number().int().min(0).max(5000).optional(),
  isOnline: z.boolean().optional(),
  travelPreferences: z.object({
    maxDistance: z.number().optional(),
    preferredModes: z.array(z.string()).optional(),
    selfDriveRate: z.number().optional(),   // ₹/km
    vehicleType: z.string().optional(),
    hotelPref: z.enum(["budget", "standard", "premium"]).optional(),
    advanceNotice: z.number().int().optional(), // days
  }).optional(),
});

// ─── /me routes MUST be registered before /:id to avoid route collision ──────

/**
 * GET /pandits/me
 * Pandit's own profile — requires PANDIT role
 */
router.get("/me", authenticate, roleGuard("PANDIT"), async (req, res, next) => {
  try {
    const pandit = await prisma.pandit.findUnique({
      where: { userId: req.user!.id },
      include: {
        user: {
          select: { phone: true, email: true, name: true, avatarUrl: true, createdAt: true },
        },
      },
    });
    if (!pandit) throw new AppError("Pandit profile not found", 404, "NOT_FOUND");
    sendSuccess(res, pandit);
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /pandits/me
 * Update pandit's own profile
 * Body: { bio?, specializations?, languages?, availableDays?, basePricing?, displayName? }
 */
router.put(
  "/me",
  authenticate,
  roleGuard("PANDIT"),
  validate(updatePanditSchema),
  async (req, res, next) => {
    try {
      const pandit = await prisma.pandit.findUnique({
        where: { userId: req.user!.id },
      });
      if (!pandit) throw new AppError("Pandit profile not found", 404, "NOT_FOUND");

      const updated = await prisma.pandit.update({
        where: { id: pandit.id },
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
      const pandit = await prisma.pandit.findUnique({ where: { userId: req.user!.id } });
      if (!pandit) throw new AppError("Pandit profile not found", 404, "NOT_FOUND");

      const updated = await prisma.pandit.update({
        where: { id: pandit.id },
        data: {
          travelPreferences: req.body,
          maxTravelDistance: req.body.maxDistance ?? pandit.maxTravelDistance,
        },
      });
      sendSuccess(res, updated, "Travel preferences updated");
    } catch (err) {
      next(err);
    }
  },
);

const addServiceSchema = z.object({
  pujaType: z.string().min(1),
  dakshinaAmount: z.number().min(0),
  durationHours: z.number().min(0.5).max(24).default(2),
  description: z.string().max(500).optional(),
  includesSamagri: z.boolean().default(false),
  samagriCost: z.number().min(0).default(0),
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
      const pandit = await prisma.pandit.findUnique({ where: { userId: req.user!.id } });
      if (!pandit) throw new AppError("Pandit profile not found", 404, "NOT_FOUND");

      const service = await prisma.pujaService.upsert({
        where: {
          panditId_pujaType: { panditId: pandit.id, pujaType: req.body.pujaType },
        },
        update: {
          dakshinaAmount: req.body.dakshinaAmount,
          durationHours: req.body.durationHours,
          description: req.body.description,
          includesSamagri: req.body.includesSamagri,
          samagriCost: req.body.samagriCost,
          isActive: true,
        },
        create: {
          panditId: pandit.id,
          pujaType: req.body.pujaType,
          dakshinaAmount: req.body.dakshinaAmount,
          durationHours: req.body.durationHours,
          description: req.body.description,
          includesSamagri: req.body.includesSamagri,
          samagriCost: req.body.samagriCost,
        },
      });
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
      const pandit = await prisma.pandit.findUnique({ where: { userId: req.user!.id } });
      if (!pandit) throw new AppError("Pandit profile not found", 404, "NOT_FOUND");

      const updated = await prisma.pandit.update({
        where: { id: pandit.id },
        data: { bankDetails: req.body },
      });
      sendSuccess(res, { bankDetails: updated.bankDetails }, "Bank details updated");
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
      const pandit = await prisma.pandit.findUnique({ where: { userId: req.user!.id } });
      if (!pandit) throw new AppError("Pandit profile not found", 404, "NOT_FOUND");

      const created = await prisma.panditBlockedDate.createMany({
        data: req.body.dates.map((d: string) => ({
          panditId: pandit.id,
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
    const pandit = await prisma.pandit.findUnique({ where: { userId: req.user!.id } });
    if (!pandit) throw new AppError("Pandit profile not found", 404, "NOT_FOUND");

    const blocked = await prisma.panditBlockedDate.findFirst({
      where: { id: req.params.id, panditId: pandit.id },
    });
    if (!blocked) throw new AppError("Blocked date not found", 404, "NOT_FOUND");

    await prisma.panditBlockedDate.delete({ where: { id: req.params.id } });
    sendSuccess(res, null, "Date unblocked successfully");
  } catch (err) {
    next(err);
  }
});

// ─── Public routes ────────────────────────────────────────────────────────────

/**
 * GET /pandits
 * Public list with search + filter.
 * Query: { city?, category?, minRating?, page?, limit?, search?, maxDistanceKm?, lat?, lng?, onlineOnly?, sort? }
 */
router.get("/", async (req, res, next) => {
  try {
    const { pandits, total, page, limit } = await listPandits({
      city: req.query.city as string | undefined,
      category: req.query.category as string | undefined,
      ritual: req.query.ritual as string | undefined,
      minRating: req.query.minRating ? Number(req.query.minRating) : undefined,
      search: req.query.search as string | undefined,
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      maxDistanceKm: req.query.maxDistanceKm ? Number(req.query.maxDistanceKm) : undefined,
      lat: req.query.lat ? Number(req.query.lat) : undefined,
      lng: req.query.lng ? Number(req.query.lng) : undefined,
      onlineOnly: req.query.onlineOnly === "true",
      sort: req.query.sort as string | undefined,
      languages: req.query.languages as string | undefined,
      minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
      maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
      travel: req.query.travel as string | undefined,
    });
    sendPaginated(res, pandits, total, page, limit);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /pandits/:id/availability
 * Public: check availability.
 * - With ?date=YYYY-MM-DD → single-day availability check
 * - With ?month=M&year=YYYY → full month calendar with booked/blocked/available status
 */
router.get("/:id/availability", async (req, res, next) => {
  try {
    const { date, month, year } = req.query as { date?: string; month?: string; year?: string };

    // Month calendar mode
    if (month && year) {
      const m = Number(month);
      const y = Number(year);
      if (m < 1 || m > 12 || y < 2020 || y > 2100) {
        throw new AppError("Invalid month/year values", 400, "VALIDATION_ERROR");
      }
      const calendar = await getPanditAvailability(req.params.id, m, y);
      return sendSuccess(res, calendar);
    }

    // Single date mode
    if (!date) throw new AppError("Query param 'date' (YYYY-MM-DD) or 'month' + 'year' required", 400, "VALIDATION_ERROR");

    const targetDate = new Date(date);
    if (isNaN(targetDate.getTime())) {
      throw new AppError("Invalid date format. Use YYYY-MM-DD", 400, "VALIDATION_ERROR");
    }

    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const conflict = await prisma.booking.findFirst({
      where: {
        panditId: req.params.id,
        eventDate: { gte: startOfDay, lte: endOfDay },
        status: { in: ["CONFIRMED", "TRAVEL_BOOKED", "PANDIT_EN_ROUTE", "PANDIT_ARRIVED", "PUJA_IN_PROGRESS"] },
      },
    });

    const blocked = await prisma.panditBlockedDate.findFirst({
      where: {
        panditId: req.params.id,
        date: { gte: startOfDay, lte: endOfDay },
      },
    });

    sendSuccess(res, {
      panditId: req.params.id,
      date,
      available: !conflict && !blocked,
      reason: conflict ? "booked" : blocked ? "blocked" : undefined,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /pandits/:id/reviews
 * Public list of reviews for a specific pandit.
 * Query: { page?, limit? }
 */
router.get("/:id/reviews", async (req, res, next) => {
  try {
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    const result = await getPanditReviews(req.params.id, page, limit);
    sendSuccess(res, {
      reviews: result.reviews,
      summary: result.summary,
    }, "Success", 200, {
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: Math.ceil(result.total / result.limit),
    });
  } catch (err) {
    next(err);
  }
});

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
 * GET /pandits/:id
 * Public pandit profile by ID
 */
router.get("/:id", async (req, res, next) => {
  try {
    const pandit = await getPanditById(req.params.id);
    sendSuccess(res, pandit);
  } catch (err) {
    next(err);
  }
});

export default router;
