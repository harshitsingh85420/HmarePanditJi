/**
 * HmarePanditJi — KYC Admin Routes
 *
 * Admin endpoints for reviewing and managing pandit KYC applications.
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { authenticate } from "../middleware/auth";
import { roleGuard } from "../middleware/roleGuard";
import { validate } from "../middleware/validator";
import { sendSuccess } from "../utils/response";
import { getKYCQueue, reviewKYC, getKYCStats } from "../services/kyc.service";

// ── Schemas ───────────────────────────────────────────────────────────────────

const reviewSchema = z.object({
    decision: z.enum(["approve", "reject"]),
    notes: z.string().max(1000).optional(),
});

const queueQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(20),
});

// ── Routes ────────────────────────────────────────────────────────────────────

export default async function kycRoutes(fastify: FastifyInstance, _opts: any) {
    /**
     * GET /admin/kyc/queue
     * Get pending KYC applications for review.
     */
    fastify.get(
        "/queue",
        {
            preHandler: [authenticate, roleGuard("ADMIN")],
        },
        async (request: FastifyRequest, reply: FastifyReply) => {
            try {
                const req = request as any;
                const res = reply;
                const page = parseInt((req.query as any).page as string) || 1;
                const limit = parseInt((req.query as any).limit as string) || 20;
                const result = await getKYCQueue(page, limit);
                sendSuccess(res, result, "KYC queue retrieved");
            } catch (err) {
                throw err;
            }
        }
    );

    /**
     * GET /admin/kyc/stats
     * Get KYC statistics (pending, verified, rejected counts).
     */
    fastify.get(
        "/stats",
        {
            preHandler: [authenticate, roleGuard("ADMIN")],
        },
        async (_request: FastifyRequest, reply: FastifyReply) => {
            try {
                const res = reply;
                const stats = await getKYCStats();
                sendSuccess(res, stats, "KYC stats retrieved");
            } catch (err) {
                throw err;
            }
        }
    );

    /**
     * POST /admin/kyc/:panditId/review
     * Approve or reject a pandit's KYC application.
     */
    fastify.post(
        "/:panditId/review",
        {
            preHandler: [authenticate, roleGuard("ADMIN"), validate(reviewSchema)],
        },
        async (request: FastifyRequest, reply: FastifyReply) => {
            try {
                const req = request as any;
                const res = reply;
                const { panditId } = req.params;
                const { decision, notes } = req.body as z.infer<typeof reviewSchema>;
                const adminUserId = req.user!.id;

                const result = await reviewKYC(panditId, adminUserId, decision, notes);
                sendSuccess(
                    res,
                    result,
                    `KYC ${decision === "approve" ? "approved" : "rejected"} successfully`
                );
            } catch (err) {
                throw err;
            }
        }
    );
}
