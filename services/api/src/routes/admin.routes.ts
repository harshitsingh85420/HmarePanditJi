import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { roleGuard } from "../middleware/roleGuard";
import { sendSuccess, sendPaginated } from "../utils/response";

const router = Router();

// All admin routes require ADMIN role
router.use(authenticate, roleGuard("ADMIN"));

/**
 * GET /admin/stats
 * Dashboard statistics: total pandits, customers, bookings, revenue
 */
router.get("/stats", (_req, res) => {
  sendSuccess(
    res,
    {
      totalPandits: 0,
      verifiedPandits: 0,
      totalCustomers: 0,
      totalBookings: 0,
      pendingBookings: 0,
      totalRevenue: 0,
    },
    "Admin stats (stub — sprint 8)",
  );
});

/**
 * GET /admin/pandits
 * List all pandits with verification status.
 * Query: { isVerified?, isActive?, page?, limit? }
 */
router.get("/pandits", (_req, res) => {
  sendPaginated(res, [], 0, 1, 20, "Admin pandits list (stub)");
});

/**
 * PATCH /admin/pandits/:id/verify
 * Approve or reject a pandit's verification.
 * Body: { isVerified: boolean, reason? }
 */
router.patch("/pandits/:id/verify", (req, res) => {
  sendSuccess(
    res,
    { id: req.params.id },
    "Pandit verification updated (stub)",
  );
});

/**
 * GET /admin/bookings
 * List all bookings with filters.
 * Query: { status?, panditId?, customerId?, from?, to?, page?, limit? }
 */
router.get("/bookings", (_req, res) => {
  sendPaginated(res, [], 0, 1, 20, "Admin bookings list (stub)");
});

/**
 * PATCH /admin/bookings/:id
 * Admin override on a booking (status, notes).
 * Body: { status?, adminNotes? }
 */
router.patch("/bookings/:id", (req, res) => {
  sendSuccess(res, { id: req.params.id }, "Booking updated by admin (stub)");
});

export default router;
