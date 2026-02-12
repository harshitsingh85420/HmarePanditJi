import { Router } from "express";
import { z } from "zod";
import { prisma } from "@hmarepanditji/db";
import { authenticate } from "../middleware/auth";
import { roleGuard } from "../middleware/roleGuard";
import { validate } from "../middleware/validator";
import { sendSuccess, sendPaginated } from "../utils/response";
import { listPandits, getPanditById } from "../services/pandit.service";
import { AppError } from "../middleware/errorHandler";

const router = Router();

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
          select: { phone: true, email: true, fullName: true, avatarUrl: true, createdAt: true },
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

// ─── Public routes ────────────────────────────────────────────────────────────

/**
 * GET /pandits
 * Public list with search + filter.
 * Query: { city?, category?, minRating?, page?, limit?, search?, maxDistanceKm?, lat?, lng?, onlineOnly?, sort? }
 */
router.get("/", async (req, res, next) => {
  try {
    const { pandits, total, page, limit } = await listPandits({
      city:            req.query.city as string | undefined,
      category:        req.query.category as string | undefined,
      minRating:       req.query.minRating    ? Number(req.query.minRating)    : undefined,
      search:          req.query.search as string | undefined,
      page:            req.query.page         ? Number(req.query.page)         : undefined,
      limit:           req.query.limit        ? Number(req.query.limit)        : undefined,
      maxDistanceKm:   req.query.maxDistanceKm ? Number(req.query.maxDistanceKm) : undefined,
      lat:             req.query.lat          ? Number(req.query.lat)          : undefined,
      lng:             req.query.lng          ? Number(req.query.lng)          : undefined,
      onlineOnly:      req.query.onlineOnly === "true",
      sort:            req.query.sort as string | undefined,
    });
    sendPaginated(res, pandits, total, page, limit);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /pandits/:id/availability
 * Public: check if pandit is available on a given date (no double-booking)
 * Query: { date: "YYYY-MM-DD" }
 */
router.get("/:id/availability", async (req, res, next) => {
  try {
    const { date } = req.query as { date?: string };
    if (!date) throw new AppError("Query param 'date' is required (YYYY-MM-DD)", 400, "VALIDATION_ERROR");

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
        status: { in: ["PENDING", "CONFIRMED", "IN_PROGRESS"] },
      },
    });

    sendSuccess(res, {
      panditId: req.params.id,
      date,
      available: !conflict,
    });
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
