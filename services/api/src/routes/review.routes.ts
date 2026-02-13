import { Router } from "express";
import { z } from "zod";
import { prisma } from "@hmarepanditji/db";
import { authenticate } from "../middleware/auth";
import { roleGuard } from "../middleware/roleGuard";
import { validate } from "../middleware/validator";
import { sendSuccess, sendPaginated } from "../utils/response";
import { createReview, getPanditReviews } from "../services/review.service";
import { AppError } from "../middleware/errorHandler";

const router = Router();

const createReviewSchema = z.object({
  bookingId: z.string().min(1, "bookingId is required"),
  overallRating: z.number().int().min(1).max(5),
  ritualKnowledge: z.number().int().min(1).max(5).optional(),
  punctuality: z.number().int().min(1).max(5).optional(),
  communication: z.number().int().min(1).max(5).optional(),
  comment: z.string().max(500).optional(),
  isAnonymous: z.boolean().optional(),
});

/**
 * POST /reviews
 * Submit a review after a completed booking.
 * Body: { bookingId, overallRating, ritualKnowledge?, punctuality?, communication?, comment?, isAnonymous? }
 * Requires: CUSTOMER
 */
router.post(
  "/",
  authenticate,
  roleGuard("CUSTOMER"),
  validate(createReviewSchema),
  async (req, res, next) => {
    try {
      // Resolve Customer record from JWT user id
      const customer = await prisma.customer.findUnique({
        where: { userId: req.user!.id },
      });
      if (!customer) {
        throw new AppError("Customer profile not found", 404, "NOT_FOUND");
      }

      const review = await createReview({
        ...req.body,
        customerId: customer.id,
      });
      sendSuccess(res, review, "Review submitted successfully", 201);
    } catch (err) {
      next(err);
    }
  },
);

/**
 * GET /reviews/pandit/:panditId
 * Public list of reviews for a pandit.
 * Query: { page?, limit? }
 */
router.get("/pandit/:panditId", async (req, res, next) => {
  try {
    const { reviews, total, page, limit } = await getPanditReviews(
      req.params.panditId,
      req.query as Record<string, unknown>,
    );
    sendPaginated(res, reviews, total, page, limit);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /reviews/booking/:bookingId
 * Get the review for a specific booking (public).
 */
router.get("/booking/:bookingId", async (_req, res) => {
  res.status(501).json({ success: true, message: "Not implemented yet", endpoint: "GET /reviews/booking/:bookingId" });
});

export default router;
