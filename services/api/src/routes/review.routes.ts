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
   * GET /api/reviews/pandit/:panditId
   * Public list of reviews for a pandit.
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
