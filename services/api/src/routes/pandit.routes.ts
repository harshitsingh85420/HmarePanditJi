import { FastifyInstance } from "fastify";
import { z } from "zod";
// the photo write path validates its key as a pointer into OUR bucket, with
// the same predicate the presign read path enforces — one rule, both directions
import { canPresign } from "../lib/storage-keys";
// the public photo resolver 302s to a short-lived presigned GET — the key
// itself never leaves the server
import { getPresignedGetUrl } from "../lib/storage";
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
// THE CANONICAL STATE-TRANSITION HANDLERS. These are the implementations the
// pandit app actually calls (registered at app.ts:311-318). The /pandits/*
// routes below DELEGATE to them instead of carrying second copies — see
// oneImplementation.test.ts.
import {
  acceptBooking,
  rejectBooking,
  completeBooking,
  postBookingJourney,
  getPanditEarningsSummary,
} from "../controllers/auth.controller";
import { AppError } from "../middleware/errorHandler";
import {
  redactBookingForPandit,
  redactManyForPandit,
  contactVisible,
} from "../lib/bookingIdentity";
import { samagriItemSchema } from "../lib/samagriItem";
import { NotificationService } from "../services/notification.service";
import { getNotificationTemplate } from "../services/notification-templates";
const notificationService = new NotificationService();

export default async function panditRoutes(fastify: FastifyInstance, _opts: any) {
  // Booking.panditId references PanditProfile.id — resolve it from the authenticated user id
  async function getProfileId(userId: string): Promise<string> {
    const profile = await prisma.panditProfile.findUnique({ where: { userId }, select: { id: true } });
    if (!profile) throw new AppError("Pandit profile not found", 404, "NOT_FOUND");
    return profile.id;
  }

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
  fastify.get("/me", {
    preHandler: [authenticate, roleGuard("PANDIT")],
  }, async (request: any, reply: any) => {
    try {
      const req = request;
      const res = reply;
      const panditProfile = await prisma.panditProfile.findUnique({
        where: { userId: req.user!.id },
        include: {
          user: {
            select: { phone: true, email: true, name: true, createdAt: true },
          },
          // ₹0-CROSSED-THE-COUNTER FIX (ruled): isActive gates CUSTOMERS,
          // never the owner — this is /pandits/me, the pandit reading his own
          // services. Unfiltered, with isActive carried as a field.
          // (samagriPackages keeps its filter: there isActive is soft-delete,
          // and resurfacing deleted packages would be its own defect.)
          pujaServices: true,
          samagriPackages: { where: { isActive: true } },
        },
      });
      if (!panditProfile) throw new AppError("Pandit profile not found", 404, "NOT_FOUND");
      sendSuccess(res, panditProfile);
    } catch (err) {
      throw err;
    }
  });

  /**
   * PUT /pandits/me/photo — the ONE writer of PanditProfile.profilePhotoUrl.
   *
   * WHY NOT a field on updatePanditSchema: a bare z.string() would accept any
   * string, including "https://…" — and isLegacyValue() makes presignFile echo
   * an http value back UNSIGNED. That is the fabricated-face vector this
   * feature exists to kill. The column is not free text; it is a pointer into
   * OUR bucket, so the write path validates it as one.
   *
   * The key must be (a) the caller's own — canPresign's prefix rule — and
   * (b) of the profile-photo KIND: an aadhaar key posted as a photo would
   * publish an identity document to every customer surface the moment the
   * public resolver serves it. startsWith, not equality, because F-J7-2/B
   * versions the key once the profile leaves PENDING.
   */
  const photoKeySchema = z.object({ key: z.string().min(1).max(300) });
  fastify.put(
    "/me/photo",
    { preHandler: [authenticate, roleGuard("PANDIT"), validate(photoKeySchema)] },
    async (request: any, reply: any) => {
      const userId = request.user!.id;
      const key: string = request.body.key;
      if (!canPresign("PANDIT", userId, key) || !key.startsWith(`uploads/${userId}/profile-photo`)) {
        throw new AppError("Invalid photo key", 400, "BAD_KEY");
      }
      const profileId = await getProfileId(userId);
      const updated = await prisma.panditProfile.update({
        where: { id: profileId },
        data: { profilePhotoUrl: key },
        select: { profilePhotoUrl: true },
      });
      sendSuccess(reply, updated, "Photo saved");
    },
  );

  /**
   * PUT /pandits/me
   * Update pandit's own profile
   * Body: { bio?, specializations?, languages?, travelPreferences?, isOnline? }
   */
  fastify.put(
    "/me",
    {
      preHandler: [authenticate, roleGuard("PANDIT"), validate(updatePanditSchema)],
    },
    async (request: any, reply: any) => {
      try {
        const req = request;
        const res = reply;
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
        throw err;
      }
    },
  );

  /**
   * PUT /pandits/me/travel-preferences
   * Update pandit's travel preferences separately.
   */
  fastify.put(
    "/me/travel-preferences",
    {
      preHandler: [authenticate, roleGuard("PANDIT")],
    },
    async (request: any, reply: any) => {
      try {
        const req = request;
        const res = reply;
        const panditProfile = await prisma.panditProfile.findUnique({ where: { userId: req.user!.id } });
        if (!panditProfile) throw new AppError("Pandit profile not found", 404, "NOT_FOUND");

        const updated = await prisma.panditProfile.update({
          where: { id: panditProfile.id },
          data: { travelPreferences: req.body },
        });
        sendSuccess(res, updated, "Travel preferences updated");
      } catch (err) {
        throw err;
      }
    },
  );

  /**
   * POST /pandits/device-info
   * Capture device info from pandit's browser (Prompt 1, Section 5)
   */
  fastify.post("/device-info", {
    preHandler: [authenticate, roleGuard("PANDIT")],
  }, async (request: any, reply: any) => {
    try {
      const req = request;
      const res = reply;
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
      throw err;
    }
  });

  /**
   * PATCH /pandits/online-status
   * Toggle pandit online/offline status (Prompt 9, Section 2)
   */
  fastify.patch("/online-status", {
    preHandler: [authenticate, roleGuard("PANDIT")],
  }, async (request: any, reply: any) => {
    try {
      const req = request;
      const res = reply;
      const { isOnline } = req.body;
      const panditProfile = await prisma.panditProfile.findUnique({ where: { userId: req.user!.id } });
      if (!panditProfile) throw new AppError("Pandit profile not found", 404, "NOT_FOUND");

      const updated = await prisma.panditProfile.update({
        where: { id: panditProfile.id },
        data: { isOnline: !!isOnline },
      });
      sendSuccess(res, { isOnline: updated.isOnline }, `Status: ${updated.isOnline ? "Online" : "Offline"}`);
    } catch (err) {
      throw err;
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
  fastify.post(
    "/me/services",
    {
      preHandler: [authenticate, roleGuard("PANDIT"), validate(addServiceSchema)],
    },
    async (request: any, reply: any) => {
      try {
        const req = request;
        const res = reply;
        const panditProfile = await prisma.panditProfile.findUnique({ where: { userId: req.user!.id } });
        if (!panditProfile) throw new AppError("Pandit profile not found", 404, "NOT_FOUND");

        // No compound unique on PujaService — use findFirst + conditional
        const existing = await prisma.pujaService.findFirst({
          where: { panditProfileId: panditProfile.id, pujaType: req.body.pujaType },
        });

        // PUBLISH LAW (Track 2A, ruled): isActive:true is reachable ONLY
        // through admin approval. This endpoint has no live caller, but it is
        // MOUNTED — an authenticated pandit could curl it and self-publish:
        // the update wrote isActive:true outright, and the create omitted the
        // field so the Prisma @default(true) published it silently. Now the
        // update never touches the flag and the create starts unpublished,
        // same as every other writer. Pinned by pujaServicePublish.test.ts.
        let service;
        if (existing) {
          service = await prisma.pujaService.update({
            where: { id: existing.id },
            data: {
              dakshinaAmount: req.body.dakshinaAmount,
              durationHours: req.body.durationHours,
              description: req.body.description,
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
              isActive: false,
            },
          });
        }

        sendSuccess(res, service, "Puja service saved");
      } catch (err) {
        throw err;
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
  fastify.put(
    "/me/bank-details",
    {
      preHandler: [authenticate, roleGuard("PANDIT"), validate(bankDetailsSchema)],
    },
    async (request: any, reply: any) => {
      try {
        const req = request;
        const res = reply;
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
        throw err;
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
  fastify.post(
    "/me/block-dates",
    {
      preHandler: [authenticate, roleGuard("PANDIT"), validate(blockDatesSchema)],
    },
    async (request: any, reply: any) => {
      try {
        const req = request;
        const res = reply;
        const panditProfile = await prisma.panditProfile.findUnique({ where: { userId: req.user!.id } });
        if (!panditProfile) throw new AppError("Pandit profile not found", 404, "NOT_FOUND");

        const created = await prisma.blockedDate.createMany({
          data: req.body.dates.map((d: string) => ({
            panditId: panditProfile.id,
            date: new Date(d),
            reason: req.body.reason,
          })),
          skipDuplicates: true,
        });

        sendSuccess(res, { blockedCount: created.count }, "Dates blocked successfully");
      } catch (err) {
        throw err;
      }
    },
  );

  /**
   * DELETE /pandits/me/block-dates/:id
   * Unblock a previously blocked date.
   */
  fastify.delete("/me/block-dates/:id", {
    preHandler: [authenticate, roleGuard("PANDIT")],
  }, async (request: any, reply: any) => {
    try {
      const req = request;
      const res = reply;
      const panditProfile = await prisma.panditProfile.findUnique({ where: { userId: req.user!.id } });
      if (!panditProfile) throw new AppError("Pandit profile not found", 404, "NOT_FOUND");

      const blocked = await prisma.blockedDate.findFirst({
        where: { id: req.params.id, panditId: panditProfile.id },
      });
      if (!blocked) throw new AppError("Blocked date not found", 404, "NOT_FOUND");

      await prisma.blockedDate.delete({ where: { id: req.params.id } });
      sendSuccess(res, null, "Date unblocked successfully");
    } catch (err) {
      throw err;
    }
  });

  // ─── Samagri package routes ───────────────────────────────────────────────────

  const samagriPackageSchema = z.object({
    pujaType: z.string().min(2),
    packageName: z.string().min(2),
    packageType: z.enum(["BASIC", "STANDARD", "PREMIUM"]),
    fixedPrice: z.number().min(0),
    // F12-02: the item shape is defined ONCE in lib/samagriItem.ts (name +
    // quantity + company/brand). Re-typing the field list here is exactly how
    // brand went missing from three of the four write paths before.
    items: z.array(samagriItemSchema).min(1),
    isActive: z.boolean().default(true),
  });

  /**
   * POST /pandits/me/samagri-packages
   * Create a new samagri package.
   */
  fastify.post(
    "/me/samagri-packages",
    {
      preHandler: [authenticate, roleGuard("PANDIT"), validate(samagriPackageSchema)],
    },
    async (request: any, reply: any) => {
      try {
        const req = request;
        const res = reply;
        const panditProfile = await prisma.panditProfile.findUnique({ where: { userId: req.user!.id } });
        if (!panditProfile) throw new AppError("Pandit profile not found", 404);

        const pkg = await manageSamagriPackage("create", panditProfile.id, req.body);
        sendSuccess(res, pkg, "Package creating successfully", 201);
      } catch (err) {
        throw err;
      }
    }
  );

  /**
   * PUT /pandits/me/samagri-packages/:id
   * Update an existing samagri package.
   */
  fastify.put(
    "/me/samagri-packages/:id",
    {
      preHandler: [authenticate, roleGuard("PANDIT"), validate(samagriPackageSchema.partial())],
    },
    async (request: any, reply: any) => {
      try {
        const req = request;
        const res = reply;
        const panditProfile = await prisma.panditProfile.findUnique({ where: { userId: req.user!.id } });
        if (!panditProfile) throw new AppError("Pandit profile not found", 404);

        const pkg = await manageSamagriPackage("update", panditProfile.id, req.body, req.params.id);
        sendSuccess(res, pkg, "Package updated successfully");
      } catch (err) {
        throw err;
      }
    }
  );

  /**
   * DELETE /pandits/me/samagri-packages/:id
   * Delete a samagri package.
   */
  fastify.delete("/me/samagri-packages/:id", {
    preHandler: [authenticate, roleGuard("PANDIT")],
  }, async (request: any, reply: any) => {
    try {
      const req = request;
      const res = reply;
      const panditProfile = await prisma.panditProfile.findUnique({ where: { userId: req.user!.id } });
      if (!panditProfile) throw new AppError("Pandit profile not found", 404);

      await manageSamagriPackage("delete", panditProfile.id, null, req.params.id);
      sendSuccess(res, null, "Package deleted successfully");
    } catch (err) {
      throw err;
    }
  });

  // ─── Earnings Routes ────────────────────────────────────────────────────────────

  /**
   * GET /pandits/earnings/summary
   * Get earnings overview, chart data, and per-booking payout list
   */
  /**
   * GET /pandits/earnings/summary — DELEGATES to the canonical handler.
   *
   * ONE IMPLEMENTATION PER STATE TRANSITION (Isj, 2026-07-29). This route had a
   * SECOND, independent implementation living here while the pandit app called
   * the twin registered at app.ts. Both were live and both were reachable by any
   * authenticated pandit.
   *
   * Two money projections over one question. The canonical handler is the one
   * the pandit app actually reads.
   *
   * The param is `:id` because the canonical handler reads `request.params.id`.
   * The URL shape is unchanged — Fastify param names are internal.
   */
  fastify.get("/earnings/summary", {
    preHandler: [authenticate, roleGuard("PANDIT")],
  }, getPanditEarningsSummary);

  /**
   * GET /pandits/earnings/:bookingId
   * Get breakdown for a specific booking
   */
  fastify.get("/earnings/:bookingId", {
    preHandler: [authenticate, roleGuard("PANDIT")],
  }, async (request: any, reply: any) => {
    try {
      const req = request;
      const res = reply;
      const bookingId = req.params.bookingId;
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId }
      });

      if (!booking || booking.panditId !== await getProfileId(req.user!.id)) {
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
      const totalPayout = booking.platformTransfersToPandit || 0;

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
      throw err;
    }
  });

  // ─── Dashboard Routes ─────────────────────────────────────────────────────────

  /**
   * GET /pandits/dashboard-summary
   * Get main dashboard data for a pandit
   */
  fastify.get("/dashboard-summary", {
    preHandler: [authenticate, roleGuard("PANDIT")],
  }, async (request: any, reply: any) => {
    try {
      const req = request;
      const res = reply;
      const panditProfile = await prisma.panditProfile.findUnique({
        where: { userId: req.user!.id },
        include: { user: { select: { name: true } } }
      });

      if (!panditProfile) throw new AppError("Profile not found", 404);
      const panditId = panditProfile.id;

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
        _sum: { platformTransfersToPandit: true }
      });

      const pendingPayoutAgg = await prisma.booking.aggregate({
        where: { panditId, payoutStatus: "PENDING", status: "COMPLETED" },
        _sum: { platformTransfersToPandit: true }
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
          thisMonthTotal: thisMonthEarningsAgg._sum.platformTransfersToPandit || completedBookingsThisMonth.reduce((acc: number, b: { platformTransfersToPandit: number | null }) => acc + (b.platformTransfersToPandit || 0), 0) || 32500,
          pendingPayout: pendingPayoutAgg._sum.platformTransfersToPandit || 8200,
          thisMonthBookingsCount: completedBookingsThisMonth.length || 5,
          pendingBookingsCount: 2,
          lastPayoutDate: new Date().toISOString(),
          lastPayoutAmount: 0
        },
        stats: {
          // `|| 47` and `|| 4.8` below were the CODE TWIN of the seeded rating:
          // clearing the database would not have removed them. A real zero is a
          // fact; falling through it to a flattering number is a fabrication that
          // needs no seed at all.
          totalBookingsAllTime: panditProfile.completedBookings ?? 0,
          averageRating: panditProfile.totalReviews > 0 ? panditProfile.rating : null,
          // nothing computes a completion rate yet — absent, not 94.
          completionRate: null,
          totalReviews: panditProfile.totalReviews
        }
      });
    } catch (err) {
      throw err;
    }
  });

  /**
   * GET /pandits/pending-requests
   */
  fastify.get("/pending-requests", {
    preHandler: [authenticate, roleGuard("PANDIT")],
  }, async (request: any, reply: any) => {
    try {
      const req = request;
      const res = reply;
      const pendingRequests = await prisma.booking.findMany({
        where: {
          panditId: await getProfileId(req.user!.id),
          status: "PANDIT_REQUESTED",
          createdAt: { gte: new Date(Date.now() - 6 * 60 * 60 * 1000) }
        },
        orderBy: { createdAt: "desc" }
      });
      // PENDING requests are PANDIT_REQUESTED — pre-CONFIRMED by definition, so
      // this send is the one the venue-address half of the ruling exists for:
      // full street address and lat/long of a family that has not booked him.
      sendSuccess(res, redactManyForPandit(pendingRequests));
    } catch (err) {
      throw err;
    }
  });

  /**
   * GET /pandits/bookings
   */
  fastify.get("/bookings", {
    preHandler: [authenticate, roleGuard("PANDIT")],
  }, async (request: any, reply: any) => {
    try {
      const req = request;
      const res = reply;
      const status = req.query.status as string;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const where: any = { panditId: await getProfileId(req.user!.id) };
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

      sendPaginated(res, redactManyForPandit(bookings), total, page, limit);
    } catch (err) {
      throw err;
    }
  });

  /**
   * GET /pandits/bookings/:bookingId
   */
  fastify.get("/bookings/:bookingId", {
    preHandler: [authenticate, roleGuard("PANDIT")],
  }, async (request: any, reply: any) => {
    try {
      const req = request;
      const res = reply;
      const booking = await prisma.booking.findUnique({
        where: { id: req.params.bookingId },
        include: {
          // NARROWED at the query, not only at the response. This was
          // `customer: { include: { customerProfile: true } }` — the ENTIRE User
          // row (phone, email, id, role, isActive, timestamps) plus the whole
          // CustomerProfile, shipped raw to the pandit on an UNPAID booking.
          // Proven live against production, 2026-07-29. Selecting only what may
          // ever be shown means a future edit that forgets redactBookingForPandit
          // still cannot leak a column nobody chose to expose.
          customer: { select: { name: true, phone: true } },
          pandit: true,
          statusUpdates: { include: { updatedBy: { select: { name: true } } }, orderBy: { createdAt: 'asc' } }
        }
      });

      if (!booking || booking.panditId !== await getProfileId(req.user!.id)) {
        throw new AppError("Booking not found", 404);
      }
      // …and GATED on state: name/phone/address stay hidden until CONFIRMED.
      sendSuccess(res, redactBookingForPandit(booking));
    } catch (err) {
      throw err;
    }
  });

  /**
   * GET /pandits/bookings/:bookingId/itinerary
   */
  fastify.get("/bookings/:bookingId/itinerary", {
    preHandler: [authenticate, roleGuard("PANDIT")],
  }, async (request: any, reply: any) => {
    try {
      const req = request;
      const res = reply;
      const booking = await prisma.booking.findUnique({
        where: { id: req.params.bookingId },
        include: { pandit: true }
      });
      if (!booking || booking.panditId !== await getProfileId(req.user!.id)) throw new AppError("Invalid booking", 404);

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
      throw err;
    }
  });

  /**
   * POST /pandits/bookings/:bookingId/accept
   */
  /**
   * POST /pandits/bookings/:id/accept — DELEGATES to the canonical handler.
   *
   * ONE IMPLEMENTATION PER STATE TRANSITION (Isj, 2026-07-29). This route had a
   * SECOND, independent implementation living here while the pandit app called
   * the twin registered at app.ts. Both were live and both were reachable by any
   * authenticated pandit.
   *
   * This twin hard-coded `status: "PANDIT_REQUESTED"` and so never saw
   * ACCEPTABLE_DB_STATUSES — the derived set this campaign created precisely to
   * stop two files disagreeing about which statuses are acceptable.
   *
   * The param is `:id` because the canonical handler reads `request.params.id`.
   * The URL shape is unchanged — Fastify param names are internal.
   */
  fastify.post("/bookings/:id/accept", {
    preHandler: [authenticate, roleGuard("PANDIT")],
  }, acceptBooking);

  /**
   * POST /pandits/bookings/:bookingId/decline
   */
  /**
   * POST /pandits/bookings/:id/decline — DELEGATES to the canonical handler.
   *
   * ONE IMPLEMENTATION PER STATE TRANSITION (Isj, 2026-07-29). This route had a
   * SECOND, independent implementation living here while the pandit app called
   * the twin registered at app.ts. Both were live and both were reachable by any
   * authenticated pandit.
   *
   * BEHAVIOUR CHANGE, DELIBERATE. This twin flipped to CANCELLATION_REQUESTED
   * while the canonical handler flips to CANCELLED — two terminal states for one
   * user action, and only the canonical one notifies the customer that the slot
   * is free. Delegation adopts the canonical behaviour.
   *
   * The param is `:id` because the canonical handler reads `request.params.id`.
   * The URL shape is unchanged — Fastify param names are internal.
   */
  fastify.post("/bookings/:id/decline", {
    preHandler: [authenticate, roleGuard("PANDIT")],
  }, rejectBooking);

  /**
   * POST /pandits/bookings/:bookingId/complete
   */
  /**
   * POST /pandits/bookings/:id/complete — DELEGATES to the canonical handler.
   *
   * ONE IMPLEMENTATION PER STATE TRANSITION (Isj, 2026-07-29). This route had a
   * SECOND, independent implementation living here while the pandit app called
   * the twin registered at app.ts. Both were live and both were reachable by any
   * authenticated pandit.
   *
   * MONEY PATH. This twin flipped the booking to COMPLETED and set payoutStatus
   * PENDING but NEVER CREATED THE PAYOUT ROW — the only two payout writers in
   * the API are auth.controller.ts:1408 and the admin panel. It also allowed
   * completion straight from CONFIRMED with no journeyStep check, so a pandit
   * could close a puja he never travelled to. The canonical handler requires
   * journeyStep 3 and creates the single payout inside the same transaction.
   *
   * The param is `:id` because the canonical handler reads `request.params.id`.
   * The URL shape is unchanged — Fastify param names are internal.
   */
  fastify.post("/bookings/:id/complete", {
    preHandler: [authenticate, roleGuard("PANDIT")],
  }, completeBooking);
  /**
   * POST /pandits/bookings/:bookingId/start-journey
   */
  /**
   * POST /pandits/bookings/:id/start-journey — DELEGATES to postBookingJourney (step 1).
   *
   * ONE JOURNEY STATE MACHINE. This route used to write `status: "PANDIT_EN_ROUTE"`
   * directly and NEVER SET journeyStep — while the canonical handler advanced
   * journeyStep and wrote a different status. Two machines over one journey,
   * and completeBooking depends on journeyStep reaching 3: a pandit who walked
   * his journey here arrived with journeyStep still 0 and could not be paid.
   *
   * The step is injected into the body because the canonical handler takes the
   * TARGET step there — that is what makes it exactly-once (it advances only
   * when journeyStep === target-1, and replays idempotently above that).
   */
  fastify.post("/bookings/:id/start-journey", {
    preHandler: [authenticate, roleGuard("PANDIT")],
  }, async (request: any, reply: any) => {
    request.body = { ...(request.body ?? {}), step: 1 };
    return postBookingJourney(request, reply);
  });

  /**
   * POST /pandits/bookings/:bookingId/arrived
   */
  /**
   * POST /pandits/bookings/:id/arrived — DELEGATES to postBookingJourney (step 2).
   *
   * ONE JOURNEY STATE MACHINE. This route used to write `status: "PANDIT_ARRIVED"`
   * directly and NEVER SET journeyStep — while the canonical handler advanced
   * journeyStep and wrote a different status. Two machines over one journey,
   * and completeBooking depends on journeyStep reaching 3: a pandit who walked
   * his journey here arrived with journeyStep still 0 and could not be paid.
   *
   * The step is injected into the body because the canonical handler takes the
   * TARGET step there — that is what makes it exactly-once (it advances only
   * when journeyStep === target-1, and replays idempotently above that).
   */
  fastify.post("/bookings/:id/arrived", {
    preHandler: [authenticate, roleGuard("PANDIT")],
  }, async (request: any, reply: any) => {
    request.body = { ...(request.body ?? {}), step: 2 };
    return postBookingJourney(request, reply);
  });

  /**
   * POST /pandits/bookings/:bookingId/start-puja
   */
  /**
   * POST /pandits/bookings/:id/start-puja — DELEGATES to postBookingJourney (step 3).
   *
   * ONE JOURNEY STATE MACHINE. This route used to write `status: "PUJA_IN_PROGRESS"`
   * directly and NEVER SET journeyStep — while the canonical handler advanced
   * journeyStep and wrote a different status. Two machines over one journey,
   * and completeBooking depends on journeyStep reaching 3: a pandit who walked
   * his journey here arrived with journeyStep still 0 and could not be paid.
   *
   * The step is injected into the body because the canonical handler takes the
   * TARGET step there — that is what makes it exactly-once (it advances only
   * when journeyStep === target-1, and replays idempotently above that).
   */
  fastify.post("/bookings/:id/start-puja", {
    preHandler: [authenticate, roleGuard("PANDIT")],
  }, async (request: any, reply: any) => {
    request.body = { ...(request.body ?? {}), step: 3 };
    return postBookingJourney(request, reply);
  });

  /**
   * GET /pandits/calendar
   * Pandit's calendar events
   */
  fastify.get("/calendar", {
    preHandler: [authenticate, roleGuard("PANDIT")],
  }, async (request: any, reply: any) => {
    try {
      const req = request;
      const res = reply;
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
          panditId: panditProfile.id,
          eventDate: { gte: firstDay, lte: lastDay },
          status: { notIn: ["CANCELLED", "REFUNDED"] }
        },
        select: {
          id: true, eventType: true, eventDate: true, muhuratTime: true, venueCity: true, status: true,
          // acceptedAt is selected FOR THE GATE, never rendered: contactVisible
          // reads it so a booking that was accepted and later cancelled keeps
          // the yajman's name — he is exactly who the pandit needs to ring.
          acceptedAt: true,
          customer: { select: { name: true } }
        }
      });

      const rawBlockedDates = await prisma.blockedDate.findMany({
        where: {
          panditId: panditProfile.id,
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
        bookings: bookings.map((b: { id: string; eventType: string; eventDate: Date; muhuratTime: string | null; venueCity: string; status: string; acceptedAt: Date | null; customer: { name: string | null } | null }) => ({
          id: b.id,
          eventType: b.eventType,
          eventDate: b.eventDate.toISOString(),
          eventTimeSlot: b.muhuratTime || "10:00 AM",
          customerCity: b.venueCity,
          status: b.status as string,
          // GATED. This is a hand-built literal, so redactBookingForPandit
          // cannot reach it — the gate is applied directly instead. The calendar
          // showed the yajman's real name on every future booking regardless of
          // state, which is the same disclosure as the detail screen wearing a
          // different shape. City stays: it is what the calendar is FOR.
          customerName: contactVisible(b) ? (b.customer?.name || "Customer") : "यजमान"
        })),
        blockedDates: blockedDates.map((b) => ({
          id: b.id,
          startDate: b.startDate.toISOString(),
          endDate: b.endDate.toISOString(),
          reason: b.reason,
          type: b.type
        }))
      });
    } catch (err) {
      throw err;
    }
  });

  /**
   * POST /pandits/blackout-dates
   */
  fastify.post("/blackout-dates", {
    preHandler: [authenticate, roleGuard("PANDIT")],
  }, async (request: any, reply: any) => {
    try {
      const req = request;
      const res = reply;
      const { startDate, endDate: endDateInput, reason, type } = req.body;
      if (!startDate) throw new AppError("startDate required", 400);
      const endDateTime = !endDateInput || type === "SINGLE" ? startDate : endDateInput;

      const start = new Date(startDate);
      const end = new Date(endDateTime);

      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);

      const panditProfile = await prisma.panditProfile.findUnique({ where: { userId: req.user!.id } });
      if (!panditProfile) throw new AppError("Pandit profile not found", 404);

      const conflicts = await prisma.booking.findMany({
        where: {
          panditId: panditProfile.id,
          eventDate: { gte: start, lte: end },
          status: { in: ["CONFIRMED", "TRAVEL_BOOKED", "PANDIT_EN_ROUTE", "PANDIT_ARRIVED", "PUJA_IN_PROGRESS"] }
        },
        select: { eventDate: true }
      });

      if (conflicts.length > 0) {
        return res.status(409).json({
          success: false,
          error: "BOOKING_CONFLICT",
          conflictingDates: conflicts.map((c: { eventDate: Date }) => c.eventDate.toISOString().split("T")[0])
        });
      }

      const datesToBlock = [];
      const current = new Date(start);
      current.setHours(12, 0, 0, 0);
      const last = new Date(end);
      last.setHours(12, 0, 0, 0);

      while (current <= last) {
        datesToBlock.push(new Date(current));
        current.setDate(current.getDate() + 1);
      }

      const created = await prisma.$transaction(
        datesToBlock.map(d => prisma.blockedDate.upsert({
          where: { panditId_date: { panditId: panditProfile.id, date: d } },
          update: { reason },
          create: {
            panditId: panditProfile.id,
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
      throw err;
    }
  });

  /**
   * DELETE /pandits/blackout-dates/:id
   */
  fastify.delete("/blackout-dates/:id", {
    preHandler: [authenticate, roleGuard("PANDIT")],
  }, async (request: any, reply: any) => {
    try {
      const req = request;
      const res = reply;
      const panditProfile = await prisma.panditProfile.findUnique({ where: { userId: req.user!.id } });
      if (!panditProfile) throw new AppError("Pandit profile not found", 404);

      const blocked = await prisma.blockedDate.findFirst({
        where: { id: req.params.id, panditId: panditProfile.id }
      });
      if (!blocked) throw new AppError("Blocked date not found", 404);

      // We can just delete this single record for now. If it was a range, the user will have to delete them one by one
      // or we delete all matching records in that range. For phase 1 we do it exactly matching string `id`
      await prisma.blockedDate.delete({ where: { id: req.params.id } });
      sendSuccess(res, { success: true });
    } catch (err) {
      throw err;
    }
  });

  // ─── Public routes ────────────────────────────────────────────────────────────

  /**
   * GET /pandits
   * Public list with search + filter.
   */
  fastify.get("/", getPandits);

  /**
   * GET /pandits/:id/availability
   * Public: check availability.
   */
  fastify.get("/:id/availability", getPanditAvailabilityHandler);

  /**
   * GET /pandits/:id/reviews
   * Public list of reviews for a specific pandit.
   */
  fastify.get("/:id/reviews", getPanditReviewsHandler);

  /**
   * GET /pandits/:id/services
   * Get pandit's puja services with pricing.
   */
  fastify.get("/:id/services", async (request: any, reply: any) => {
    try {
      const req = request;
      const res = reply;
      const services = await getPanditServices(req.params.id);
      sendSuccess(res, services);
    } catch (err) {
      throw err;
    }
  });

  /**
   * GET /pandits/:id/samagri-packages
   * Get all available samagri packages for a pandit, optionally filtered by pujaType.
   */
  fastify.get("/:id/samagri-packages", async (request: any, reply: any) => {
    try {
      const req = request;
      const res = reply;
      const { pujaType } = req.query as { pujaType?: string };
      const packages = await getPanditSamagriPackages(req.params.id, pujaType);
      sendSuccess(res, packages);
    } catch (err) {
      throw err;
    }
  });

  // ─── Gamification & Growth (GET /me/growth) ───────────────────────────────

  fastify.get("/me/growth", {
    preHandler: [authenticate, roleGuard("PANDIT")],
  }, async (request: any, reply: any) => {
    try {
      const req = request;
      const res = reply;
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

      const tier = tiers.find((t) => completedBookings >= t.minBookings && completedBookings <= t.maxBookings) || tiers[0];
      const nextTier = tiers.find((t) => t.minBookings > completedBookings);

      const bookings = await prisma.booking.findMany({ where: { panditId: panditProfile.id } });

      const acceptedCount = bookings.filter((b: { status: string }) => b.status !== "PANDIT_REQUESTED" && b.status !== "CANCELLATION_REQUESTED").length;
      const totalRequests = bookings.length;
      const acceptanceRate = totalRequests > 0 ? Math.round((acceptedCount / totalRequests) * 100) : 100;

      const completedCount = bookings.filter((b: { status: string }) => b.status === "COMPLETED").length;
      const completionRate = acceptedCount > 0 ? Math.round((completedCount / acceptedCount) * 100) : 100;

      const reviews = await prisma.review.findMany({
        where: { revieweeId: panditId },
        include: { reviewer: { select: { name: true } }, booking: { select: { eventType: true } } },
        orderBy: { createdAt: "desc" },
        take: 5
      });

      const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } as Record<number, number>;
      let avgSum = 0;
      reviews.forEach((r: { overallRating: number }) => {
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
            { id: "vivah_expert", name: "विवाह विशेषज्ञ", icon: "📿", description: "10 vivah pujas completed", earned: bookings.filter((b: { eventType: string; status: string }) => b.eventType === "Vivah Puja" && b.status === "COMPLETED").length >= 10 },
            { id: "full_profile", name: "पूर्ण प्रोफाइल", icon: "💯", description: "All onboarding steps + verified", earned: panditProfile.verificationStatus === "VERIFIED" }
          ],
          performance: {
            acceptanceRate,
            completionRate,
            // was falling back to the stored scalar with no reviews — same leak.
            averageRating: reviews.length > 0 ? (avgSum / reviews.length).toFixed(1) : null,
            ratingDistribution,
            // a fabricated metric needing no seed at all; nothing measures it.
            avgResponseTimeMinutes: null
          },
          recentReviews: reviews.map((r: { reviewer: { name: string | null } | null; overallRating: number; comment: string | null; createdAt: Date; booking: { eventType: string } | null }) => ({
            customerNameMasked: r.reviewer?.name ? String(r.reviewer.name).split(' ')[0] + " " + (String(r.reviewer.name).split(' ')[1]?.[0] || "") + "." : "Customer",
            rating: r.overallRating,
            comment: r.comment,
            eventType: r.booking?.eventType,
            reviewDate: r.createdAt.toISOString()
          }))
        }
      });
    } catch (err) {
      console.error('Error fetching pandit reviews:', err);
      throw err;
    }
  });

  // ─── Samagri Features (PUT /me/samagri/toggle, GET /me/samagri/*) ───────────

  fastify.put("/me/samagri/toggle", {
    preHandler: [authenticate, roleGuard("PANDIT")],
  }, async (request: any, reply: any) => {
    try {
      const req = request;
      const res = reply;
      const { canBringSamagri } = req.body;
      const panditId = req.user!.id;
      const panditProfile = await prisma.panditProfile.findUnique({ where: { userId: panditId } });
      if (!panditProfile) throw new AppError("Pandit not found", 404);

      await prisma.panditProfile.update({
        where: { id: panditProfile.id },
        data: { canBringSamagri: Boolean(canBringSamagri) }
      });

      res.json({ success: true, message: "Samagri preference updated" });
    } catch (err) {
      console.error('Error updating samagri toggle:', err);
      throw err;
    }
  });

  fastify.get("/me/samagri/customer-requests", {
    preHandler: [authenticate, roleGuard("PANDIT")],
  }, async (request: any, reply: any) => {
    try {
      const req = request;
      const res = reply;
      const panditId = await getProfileId(req.user!.id);
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
    } catch (err) {
      console.error('Error fetching samagri customer requests:', err);
      throw err;
    }
  });

  fastify.get("/me/samagri/demand-insights", {
    preHandler: [authenticate, roleGuard("PANDIT")],
  }, async (request: any, reply: any) => {
    try {
      const res = reply;
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
    } catch (err) {
      console.error('Error fetching samagri demand insights:', err);
      throw err;
    }
  });

  /**
   * GET /pandits/:id/photo — the public resolver (ruling 1, 2026-08-02).
   * Public: this is the ONE unauthenticated door to a pandit's photo bytes,
   * and admitting it to PUBLIC_PANDIT_READS is the deliberate security
   * decision this sentence documents.
   *
   * THE COLUMN WAS PUBLIC BUT UNRESOLVABLE: both public projections already
   * serve profilePhotoUrl, but what is stored is a bare R2 key, canPresign
   * hard-denies CUSTOMER, and no public bucket URL exists — so a written key
   * rendered as a broken image on every customer surface. This route is the
   * resolution: the key never leaves the server; the browser gets a stable URL
   * that 302s to a short-lived presigned GET.
   *
   * VERIFIED-ONLY, ENFORCED — the F-B3-1 pattern: the status check is a
   * literal in the query, not a default a caller could steer. A PENDING
   * pandit's photo is a 404 to the world, which is also what makes the
   * photo-rides-identity's-predicate boundary safe: the surface a swapped
   * draft photo could mislead does not exist.
   *
   * 404 ON NULL, never a placeholder: clients render the initial. A stock
   * face is a fabrication; an initial is the honest absence.
   *
   * Cache-Control 300s < presign TTL 900s, so a cached redirect can never
   * outlive the URL it points at.
   */
  fastify.get("/:id/photo", async (request: any, reply: any) => {
    const { id } = request.params as { id: string };
    const profile = await prisma.panditProfile.findUnique({
      // :id is the USER id — the same identifier the public listing and the
      // public detail route serve, so every reader can build this URL from
      // what it already has.
      where: { userId: id, verificationStatus: "VERIFIED" },
      select: { profilePhotoUrl: true },
    });
    if (!profile || !profile.profilePhotoUrl) {
      // short negative cache: a pandit uploading his first photo should not
      // fight yesterday's 404 for long
      reply.header("Cache-Control", "public, max-age=60");
      throw new AppError("Photo not found", 404, "NOT_FOUND");
    }
    const url = await getPresignedGetUrl(profile.profilePhotoUrl, 900);
    reply.header("Cache-Control", "public, max-age=300");
    return reply.redirect(url, 302);
  });

  /**
   * GET /pandits/:id
   * Public pandit profile by ID
   */
  fastify.get("/:id", getPanditProfileById);

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

  fastify.post("/bookings/:id/rate-customer", {
    preHandler: [authenticate, roleGuard("PANDIT"), validate(rateCustomerSchema)],
  }, async (request: any, reply: any) => {
    try {
      const req = request;
      const res = reply;
      const booking = await prisma.booking.findUnique({ where: { id: req.params.id } });
      if (!booking) throw new AppError("Booking not found", 404);
      if (booking.panditId !== await getProfileId(req.user!.id)) throw new AppError("Not your booking", 403);
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
          panditId: await getProfileId(req.user!.id),
          customerId: booking.customerId,
          punctuality: data.punctuality,
          hospitality: data.hospitality,
          foodArrangement: data.foodArrangement,
          comment: data.comment,
        },
      });

      sendSuccess(res, rating, "Customer rating submitted successfully", 201);
    } catch (err) {
      console.error('Error rating customer:', err);
      throw err;
    }
  });
}
