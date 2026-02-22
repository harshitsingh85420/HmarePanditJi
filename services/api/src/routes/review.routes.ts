import { Router } from "express";
import { z } from "zod";
import { authenticate } from "../middleware/auth";
import { roleGuard } from "../middleware/roleGuard";
import { validate } from "../middleware/validator";
import { sendSuccess, sendPaginated } from "../utils/response";
import { createReview, getPanditReviews } from "../services/review.service";

const router: Router = Router();

const createReviewSchema = z.object({
  bookingId: z.string().min(1, "bookingId is required"),
  ratings: z.object({
    overall: z.number().int().min(1).max(5),
    knowledge: z.number().int().min(1).max(5).optional(),
    punctuality: z.number().int().min(1).max(5).optional(),
    communication: z.number().int().min(1).max(5).optional(),
    valueForMoney: z.number().int().min(1).max(5).optional(),
  }),
  comment: z.string().max(500).optional(),
  photoUrls: z.array(z.string()).optional(),
  isAnonymous: z.boolean().optional(),
});

/**
 * POST /api/reviews
 * Submit a review after a completed booking.
 */
router.post(
  "/",
  authenticate,
  roleGuard("CUSTOMER"),
  validate(createReviewSchema),
  async (req, res, next) => {
    try {
      const review = await createReview({
        ...req.body,
        reviewerId: req.user!.id,
      });
      sendSuccess(res, review, "Review submitted successfully", 201);
    } catch (err) {
      next(err);
    }
  },
);

/**
 * GET /api/reviews/pandit/:panditId
 * Public list of reviews for a pandit.
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

export default router;
