import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { sendSuccess } from "../utils/response";

const router = Router();

// All notification routes require authentication
router.use(authenticate);

/**
 * GET /notifications/my
 * List notifications for the authenticated user.
 * Query: { isRead?, page?, limit? }
 */
router.get("/my", (_req, res) => {
  sendSuccess(res, [], "Notifications (stub — sprint 8)");
});

/**
 * GET /notifications/unread-count
 * Count of unread notifications for the authenticated user
 */
router.get("/unread-count", (_req, res) => {
  sendSuccess(res, { count: 0 }, "Unread count (stub)");
});

/**
 * PATCH /notifications/:id/read
 * Mark a single notification as read
 */
router.patch("/:id/read", (req, res) => {
  sendSuccess(res, { id: req.params.id }, "Notification marked as read (stub)");
});

/**
 * PATCH /notifications/read-all
 * Mark all notifications as read for the authenticated user
 */
router.patch("/read-all", (_req, res) => {
  sendSuccess(res, null, "All notifications marked as read (stub)");
});

export default router;
