import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { authenticate } from "../middleware/auth";
import { roleGuard } from "../middleware/roleGuard";
import { validate } from "../middleware/validator";
import { sendSuccess, sendPaginated } from "../utils/response";
import { createReview, getPanditReviews } from "../services/review.service";

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

export default async function reviewRoutes(fastify: FastifyInstance, _opts: any) {
  /**
   * POST /api/reviews
   * Submit a review after a completed booking.
   */
  fastify.post(
    "/",
    { preHandler: [authenticate, roleGuard("CUSTOMER"), validate(createReviewSchema)] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const req = request as any;
      const res = reply;
      try {
        const review = await createReview({
          ...req.body,
          reviewerId: req.user!.id,
        });
        return sendSuccess(res, review, "Review submitted successfully", 201);
      } catch (err) {
        throw err;
      }
    },
  );

  /**
   * GET /api/v1/reviews/pandit/:panditId
   *
   * DELIBERATELY PUBLIC — Isj ruling 2026-07-29. A customer choosing a pandit
   * must be able to read his reviews before creating an account; the twin route
   * GET /pandits/:id/reviews is already in PUBLIC_PANDIT_READS (app.ts) for
   * exactly that reason. The `{}` below is therefore INTENTIONAL and not an
   * oversight, which is the whole reason this comment exists: it read as an
   * oversight for as long as it was one.
   *
   * WHAT MAKES IT SAFE IS THE PROJECTION, NOT THE ROUTE. Everything this returns
   * comes from PUBLIC_REVIEW_SELECT + toPublicReview (review.service.ts), which
   * apply the customer's `isAnonymous` promise and drop the flag itself. Before
   * that, this route shipped the reviewer's real name and entire customerProfile
   * to anyone with the URL, anonymous reviews included.
   *
   * DO NOT widen the projection here. Widen it in review.service.ts, where the
   * twin sees the change too.
   */
  fastify.get("/pandit/:panditId", {}, async (request: FastifyRequest, reply: FastifyReply) => {
    const req = request as any;
    const res = reply;
    try {
      const { reviews, total, page, limit } = await getPanditReviews(
        req.params.panditId,
        req.query as Record<string, unknown>,
      );
      return sendPaginated(res, reviews, total, page, limit);
    } catch (err) {
      throw err;
    }
  });
}
