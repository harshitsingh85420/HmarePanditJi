import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { roleGuard } from "../middleware/roleGuard";
import { sendSuccess } from "../utils/response";

const router = Router();

/**
 * POST /reviews
 * Submit a review after a completed booking.
 * Body: { bookingId, overallRating, ritualKnowledge?, punctuality?, communication?, comment?, isAnonymous? }
 * Requires: CUSTOMER
 */
router.post("/", authenticate, roleGuard("CUSTOMER"), (_req, res) => {
  sendSuccess(res, null, "Review submitted (stub — sprint 7)", 201);
});

/**
 * GET /reviews/pandit/:panditId
 * Public list of reviews for a pandit.
 * Query: { page?, limit? }
 */
router.get("/pandit/:panditId", (req, res) => {
  sendSuccess(
    res,
    { panditId: req.params.panditId, reviews: [], total: 0 },
    "Pandit reviews (stub)",
  );
});

export default router;
