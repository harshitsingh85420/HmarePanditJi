import { FastifyInstance } from "fastify";
import { prisma } from "@hmarepanditji/db";
import { authenticate } from "../middleware/auth";
import { sendSuccess, sendPaginated } from "../utils/response";
import { getUnreadCount, markAsRead, markAllAsRead } from "../services/notification.service";
import { parsePagination } from "../utils/helpers";

export default async function notificationRoutes(fastify: FastifyInstance, _opts: any) {
  // All notification routes require authentication
  fastify.addHook('preHandler', authenticate);

  /**
   * GET /notifications/my
   * List notifications for the authenticated user, paginated, newest first.
   * Query: { isRead?: "true"|"false", page?, limit? }
   */
  fastify.get("/my", async (request: any, reply: any) => {
    try {
      const req = request;
      const res = reply;
      const { page, limit } = parsePagination(req.query as Record<string, unknown>);
      const isReadParam = req.query.isRead;
      const isRead =
        isReadParam === "true" ? true : isReadParam === "false" ? false : undefined;

      const where = {
        userId: req.user!.id,
        ...(isRead !== undefined ? { isRead } : {}),
      };

      const [notifications, total] = await Promise.all([
        prisma.notification.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.notification.count({ where }),
      ]);

      sendPaginated(res, notifications, total, page, limit, "Notifications");
    } catch (err) {
      throw err;
    }
  });

  /**
   * GET /notifications/unread-count
   * Count of unread notifications for the authenticated user.
   */
  fastify.get("/unread-count", async (request: any, reply: any) => {
    try {
      const req = request;
      const res = reply;
      const count = await getUnreadCount(req.user!.id);
      sendSuccess(res, { count }, "Unread notification count");
    } catch (err) {
      throw err;
    }
  });

  /**
   * PATCH /notifications/read-all
   * Mark all notifications as read for the authenticated user.
   * Must be registered BEFORE /:id/read to avoid route shadowing.
   */
  fastify.patch("/read-all", async (request: any, reply: any) => {
    try {
      const req = request;
      const res = reply;
      await markAllAsRead(req.user!.id);
      sendSuccess(res, null, "All notifications marked as read");
    } catch (err) {
      throw err;
    }
  });

  /**
   * PATCH /notifications/:id/read
   * Mark a single notification as read.
   */
  fastify.patch("/:id/read", async (request: any, reply: any) => {
    try {
      const req = request;
      const res = reply;
      await markAsRead(req.params.id, req.user!.id);
      sendSuccess(res, { id: req.params.id }, "Notification marked as read");
    } catch (err) {
      throw err;
    }
  });
}
