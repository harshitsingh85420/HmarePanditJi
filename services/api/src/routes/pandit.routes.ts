import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { roleGuard } from "../middleware/roleGuard";
import { sendSuccess, sendPaginated } from "../utils/response";

const router = Router();

/**
 * GET /pandits
 * Public list with search + filter.
 * Query: { city?, category?, minRating?, page?, limit?, search? }
 */
router.get("/", (_req, res) => {
  sendPaginated(res, [], 0, 1, 20, "Pandits list (stub — sprint 4)");
});

/**
 * GET /pandits/:id
 * Public pandit profile by ID
 */
router.get("/:id", (req, res) => {
  sendSuccess(res, { id: req.params.id }, "Pandit detail (stub)");
});

/**
 * GET /pandits/me
 * Pandit's own profile — requires PANDIT role
 */
router.get("/me", authenticate, roleGuard("PANDIT"), (_req, res) => {
  sendSuccess(res, null, "Pandit own profile (stub)");
});

/**
 * PUT /pandits/me
 * Update pandit's own profile
 * Body: { bio?, specializations?, languages?, availableDays?, basePricing? }
 */
router.put("/me", authenticate, roleGuard("PANDIT"), (_req, res) => {
  sendSuccess(res, null, "Pandit profile updated (stub)");
});

/**
 * GET /pandits/:id/availability
 * Public: get pandit's available slots for a given date
 * Query: { date: "YYYY-MM-DD" }
 */
router.get("/:id/availability", (req, res) => {
  sendSuccess(res, { panditId: req.params.id, slots: [] }, "Availability (stub)");
});

export default router;
