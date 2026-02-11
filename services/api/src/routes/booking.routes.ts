import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { roleGuard } from "../middleware/roleGuard";
import { sendSuccess, sendPaginated } from "../utils/response";

const router = Router();

// All booking routes require authentication
router.use(authenticate);

/**
 * POST /bookings
 * Create a new booking.
 * Body: { panditId, ritualId, eventDate, eventTime, venueAddress, specialRequirements? }
 */
router.post("/", roleGuard("CUSTOMER"), (_req, res) => {
  sendSuccess(
    res,
    { bookingNumber: "HPJ-2024-00001" },
    "Booking created (stub — sprint 5)",
    201,
  );
});

/**
 * GET /bookings/my
 * List bookings for the authenticated user (customer or pandit).
 * Query: { status?, page?, limit? }
 */
router.get("/my", (_req, res) => {
  sendPaginated(res, [], 0, 1, 20, "My bookings (stub)");
});

/**
 * GET /bookings/:id
 * Get a single booking by ID. Accessible by owner customer, pandit, or admin.
 */
router.get("/:id", (req, res) => {
  sendSuccess(res, { id: req.params.id }, "Booking detail (stub)");
});

/**
 * PATCH /bookings/:id/status
 * Pandit: CONFIRMED | REJECTED. Admin: any status.
 * Body: { status, reason? }
 */
router.patch(
  "/:id/status",
  roleGuard("PANDIT", "ADMIN"),
  (req, res) => {
    sendSuccess(res, { id: req.params.id }, "Booking status updated (stub)");
  },
);

/**
 * POST /bookings/:id/cancel
 * Cancel a booking. Customer or Admin only.
 * Body: { reason }
 */
router.post("/:id/cancel", roleGuard("CUSTOMER", "ADMIN"), (req, res) => {
  sendSuccess(res, { id: req.params.id }, "Booking cancelled (stub)");
});

export default router;
