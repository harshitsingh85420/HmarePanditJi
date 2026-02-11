import { prisma } from "@hmarepanditji/db";
import { logger } from "../utils/logger";

// ─── Stub implementations — replace in Sprint 8 ──────────────────────────────

export interface SendNotificationInput {
  userId: string;
  type:
    | "BOOKING_CREATED"
    | "BOOKING_CONFIRMED"
    | "BOOKING_CANCELLED"
    | "PAYMENT_SUCCESS"
    | "REVIEW_REMINDER"
    | "OTP"
    | "GENERAL";
  title: string;
  message: string;
  channel: "SMS" | "WHATSAPP" | "EMAIL" | "IN_APP";
  metadata?: Record<string, unknown>;
}

/**
 * Persist a notification and dispatch via the appropriate channel.
 * TODO sprint 8: integrate Twilio for SMS/WhatsApp
 */
export async function sendNotification(input: SendNotificationInput) {
  const notification = await prisma.notification.create({
    data: {
      userId: input.userId,
      type: input.type,
      title: input.title,
      message: input.message,
      channel: input.channel,
      metadata: input.metadata ?? {},
    },
  });

  logger.info(`Notification [${input.channel}] to user ${input.userId}: ${input.title}`);
  // TODO: dispatch via Twilio / email

  return notification;
}

export async function getUnreadCount(userId: string): Promise<number> {
  return prisma.notification.count({ where: { userId, isRead: false } });
}

export async function markAsRead(notificationId: string, userId: string) {
  return prisma.notification.updateMany({
    where: { id: notificationId, userId },
    data: { isRead: true },
  });
}

export async function markAllAsRead(userId: string) {
  return prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
}
