const fs = require('fs');
const path = require('path');

function replaceInFile(filePath, replacements) {
    if (!fs.existsSync(filePath)) {
        console.log(`File not found: ${filePath}`);
        return;
    }
    let content = fs.readFileSync(filePath, 'utf-8');
    let originalContent = content;

    for (const { search, replace } of replacements) {
        if (typeof search === 'string') {
            content = content.replace(search, replace);
        } else {
            content = content.replace(search, replace);
        }
    }

    if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf-8');
        console.log(`Updated ${filePath}`);
    } else {
        console.log(`No changes made to ${filePath}`);
    }
}

const SRC = path.join(__dirname, 'services/api/src');

// 1. admin.routes.ts (completePayout, cancelApprove)
replaceInFile(path.join(SRC, 'routes/admin.routes.ts'), [
    {
        search: `import { initiateRefund } from "../services/payment.service";`,
        replace: `import { initiateRefund } from "../services/payment.service";
import { NotificationService } from "../services/notification.service";
import { getNotificationTemplate } from "../services/notification-templates";
const notificationService = new NotificationService();`
    },
    {
        search: `sendSuccess(res, updated, "Payout marked as completed");`,
        replace: `const t1 = getNotificationTemplate("PAYOUT_COMPLETED", { id: booking.id.substring(0,8).toUpperCase(), amount: booking.panditPayout, transactionRef: req.body.transactionRef });
      await notificationService.notify({ userId: booking.panditId!, type: "PAYOUT_COMPLETED", title: t1.title, message: t1.message, smsMessage: t1.smsMessage });
      sendSuccess(res, updated, "Payout marked as completed");`
    },
    {
        search: `sendSuccess(res, { success: true }, "Cancellation approved");`,
        replace: `
      const t1 = getNotificationTemplate("CANCELLATION_APPROVED", { id: booking.id.substring(0,8).toUpperCase(), refundAmount: req.body.refundAmount || 0 });
      await notificationService.notify({ userId: booking.customerId, type: "CANCELLATION_APPROVED", title: t1.title, message: t1.message, smsMessage: t1.smsMessage });

      if (booking.panditId) {
        const t2 = getNotificationTemplate("CANCELLATION_APPROVED_PANDIT", { id: booking.id.substring(0,8).toUpperCase() });
        await notificationService.notify({ userId: booking.panditId, type: "CANCELLATION_APPROVED", title: t2.title, message: t2.message, smsMessage: t2.smsMessage });
      }

      sendSuccess(res, { success: true }, "Cancellation approved");`
    }
]);

// 2. admin.controller.ts (travelBooked, updatePanditVerification)
replaceInFile(path.join(SRC, 'controllers/admin.controller.ts'), [
    {
        search: `const ns = await import("../services/notification.service");
            if (updated.pandit?.phone) {
                await ns.notifyTravelBookedToPandit({
                    panditUserId: updated.pandit.id,
                    panditName: updated.pandit.name ?? "Pandit",
                    panditPhone: updated.pandit.phone,
                    bookingNumber: updated.bookingNumber,
                    travelMode: updated.travelMode ?? "Transport",
                    travelBookingRef: updated.travelBookingRef ?? "See app",
                    travelNotes: updated.travelNotes ?? "",
                });
            }

            if (updated.customer?.phone) {
                await ns.notifyTravelBookedToCustomer({
                    customerUserId: updated.customer.id,
                    customerName: updated.customer.name ?? "Customer",
                    customerPhone: updated.customer.phone,
                    bookingNumber: updated.bookingNumber,
                    panditName: updated.pandit?.name ?? "Pandit",
                    travelMode: updated.travelMode ?? "Transport",
                    travelBookingRef: updated.travelBookingRef ?? "See app",
                });
            }`,
        replace: `const { NotificationService } = await import("../services/notification.service");
            const { getNotificationTemplate } = await import("../services/notification-templates");
            const ns = new NotificationService();

            if (updated.pandit?.id) {
                const pInfo = getNotificationTemplate("TRAVEL_BOOKED_PANDIT", {
                    id: updated.id.substring(0,8).toUpperCase(),
                    mode: updated.travelMode ?? "Transport",
                    details: updated.travelNotes ?? "N/A",
                    reference: updated.travelBookingRef ?? "See app"
                });
                await ns.notify({ userId: updated.pandit.id, type: "TRAVEL_BOOKED", title: pInfo.title, message: pInfo.message, smsMessage: pInfo.smsMessage });
            }

            if (updated.customer?.id) {
                const cInfo = getNotificationTemplate("TRAVEL_BOOKED", {
                    id: updated.id.substring(0,8).toUpperCase(),
                    travelMode: updated.travelMode ?? "Transport",
                    details: updated.travelNotes ?? "N/A"
                });
                await ns.notify({ userId: updated.customer.id, type: "TRAVEL_BOOKED", title: cInfo.title, message: cInfo.message, smsMessage: cInfo.smsMessage });
            }`
    },
    {
        search: `const ns = await import("../services/notification.service");
            const panditInfo = {
                userId: pandit.userId,
                name: pandit.user?.name || "Pandit",
                phone: pandit.user?.phone || ""
            };

            if (action === "APPROVE") {
                await ns.notifyVerificationApproved(panditInfo);
            } else if (action === "REJECT") {
                await ns.notifyVerificationRejected({ ...panditInfo, reason: reason || "Unknown" });
            } else if (action === "REQUEST_INFO") {
                const requestedText = requestedDocuments?.join(", ") || "Additional documents";
                await ns.notifyVerificationInfoRequested({ ...panditInfo, requestedText });
            }`,
        replace: `const { NotificationService } = await import("../services/notification.service");
            const { getNotificationTemplate } = await import("../services/notification-templates");
            const ns = new NotificationService();

            if (action === "APPROVE") {
                const tmpl = getNotificationTemplate("VERIFICATION_APPROVED", {});
                await ns.notify({ userId: pandit.userId, type: "VERIFICATION", title: tmpl.title, message: tmpl.message, smsMessage: tmpl.smsMessage });
            } else if (action === "REJECT") {
                const tmpl = getNotificationTemplate("VERIFICATION_REJECTED", { reason: reason || "Unknown" });
                await ns.notify({ userId: pandit.userId, type: "VERIFICATION", title: tmpl.title, message: tmpl.message, smsMessage: tmpl.smsMessage });
            } else if (action === "REQUEST_INFO") {
                // not explicitly listed in new templates, but we can reuse or just send standard
                await ns.notify({ userId: pandit.userId, type: "VERIFICATION", title: "Info Requested", message: "Additional Info needed: " + (requestedDocuments?.join(", ") || "") });
            }`
    }
]);

// 3. review.service.ts (createReview)
replaceInFile(path.join(SRC, 'services/review.service.ts'), [
    {
        search: `import { parsePagination } from "../utils/helpers";`,
        replace: `import { parsePagination } from "../utils/helpers";
import { NotificationService } from "./notification.service";
import { getNotificationTemplate } from "./notification-templates";`
    },
    {
        search: `return review;\n}`,
        replace: `const notificationService = new NotificationService();
  const tmpl = getNotificationTemplate("REVIEW_RECEIVED", { rating: input.ratings.overall, id: input.bookingId.substring(0,8).toUpperCase() });
  await notificationService.notify({ userId: revieweeId, type: "REVIEW_RECEIVED", title: tmpl.title, message: tmpl.message, smsMessage: tmpl.smsMessage });

  return review;
}`
    }
]);

