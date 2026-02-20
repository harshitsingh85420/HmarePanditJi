/**
 * HmarePanditJi — KYC Admin Routes
 *
 * Admin endpoints for reviewing and managing pandit KYC applications.
 */

import { Router } from "express";
import { z } from "zod";
import { authenticate } from "../middleware/auth";
import { roleGuard } from "../middleware/roleGuard";
import { validate } from "../middleware/validator";
import { sendSuccess } from "../utils/response";
import { getKYCQueue, reviewKYC, getKYCStats } from "../services/kyc.service";

const router: Router = Router();

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

/**
 * GET /admin/kyc/queue
 * Get pending KYC applications for review.
 */
router.get(
    "/queue",
    authenticate,
    roleGuard("ADMIN"),
    async (req, res, next) => {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 20;
            const result = await getKYCQueue(page, limit);
            sendSuccess(res, result, "KYC queue retrieved");
        } catch (err) {
            next(err);
        }
    }
);

/**
 * GET /admin/kyc/stats
 * Get KYC statistics (pending, verified, rejected counts).
 */
router.get(
    "/stats",
    authenticate,
    roleGuard("ADMIN"),
    async (_req, res, next) => {
        try {
            const stats = await getKYCStats();
            sendSuccess(res, stats, "KYC stats retrieved");
        } catch (err) {
            next(err);
        }
    }
);

/**
 * POST /admin/kyc/:panditId/review
 * Approve or reject a pandit's KYC application.
 */
router.post(
    "/:panditId/review",
    authenticate,
    roleGuard("ADMIN"),
    validate(reviewSchema),
    async (req, res, next) => {
        try {
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
            next(err);
        }
    }
);

export default router;
