import { prisma } from "@hmarepanditji/db";
import { NotificationService } from "../services/notification.service";
import { getNotificationTemplate } from "../services/notification-templates";
import { logger } from "../utils/logger";

export function startReviewReminderJob() {
    const notificationService = new NotificationService();

    // Run every hour (3600000 ms)
    setInterval(async () => {
        try {
            logger.info("[CRON] Running Review Reminder Job");

            const now = new Date();
            const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            const oneDayAndOneHourAgo = new Date(now.getTime() - 25 * 60 * 60 * 1000);

            const bookingsToRemind = await prisma.booking.findMany({
                where: {
                    status: "COMPLETED",
                    completedAt: {
                        lt: oneDayAgo,
                        gt: oneDayAndOneHourAgo
                    },
                    review: null // No review exists for this booking
                }
            });

            for (const booking of bookingsToRemind) {
                const t1 = getNotificationTemplate("REVIEW_REMINDER", { id: booking.id.substring(0, 8).toUpperCase() });
                await notificationService.notify({
                    userId: booking.customerId,
                    type: "REVIEW_REMINDER",
                    title: t1.title,
                    message: t1.message,
                    smsMessage: t1.smsMessage
                });
                logger.info(`[CRON] Sent review reminder to customer for booking ${booking.id}`);
            }
        } catch (err) {
            logger.error("[CRON] Error in Review Reminder Job:", err);
        }
    }, 3600000); // 1 hour
}
