import { Router } from "express";
import { z } from "zod";
import { authenticate } from "../middleware/auth";
import { roleGuard } from "../middleware/roleGuard";
import { sendSuccess } from "../utils/response";
import {
  createRazorpayOrder,
  verifyRazorpaySignature,
  processPaymentSuccess,
  verifyWebhookSignature,
  initiateRefund,
} from "../services/payment.service";
import { AppError } from "../middleware/errorHandler";
import { prisma } from "@hmarepanditji/db";
import { logger } from "../utils/logger";
import { sendNotification } from "../services/notification.service";

const router = Router();

// ── Validation ────────────────────────────────────────────────────────────────

const verifySchema = z.object({
  bookingId: z.string().min(1),
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
});

const refundSchema = z.object({
  bookingId: z.string().min(1),
  reason: z.string().optional(),
});

// ── Routes ────────────────────────────────────────────────────────────────────

/**
 * POST /payments/create-order
 * Create a Razorpay order for an existing booking.
 */
router.post("/create-order", authenticate, roleGuard("CUSTOMER"), async (req, res, next) => {
  try {
    const { bookingId } = req.body as { bookingId?: string };
    if (!bookingId) {
      res.status(400).json({ success: false, message: "bookingId is required" });
      return;
    }
    const customer = await prisma.customer.findUnique({
      where: { userId: req.user!.id },
    });
    if (!customer) {
      res.status(404).json({ success: false, message: "Customer not found" });
      return;
    }
    const order = await createRazorpayOrder(bookingId, customer.id);
    sendSuccess(res, order, "Razorpay order created", 201);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /payments/verify
 * Verify Razorpay payment signature and mark booking as paid.
 */
router.post("/verify", authenticate, roleGuard("CUSTOMER"), async (req, res, next) => {
  try {
    const body = verifySchema.parse(req.body);

    const isValid = verifyRazorpaySignature(
      body.razorpay_order_id,
      body.razorpay_payment_id,
      body.razorpay_signature,
    );
    if (!isValid) {
      throw new AppError("Payment signature verification failed", 400, "PAYMENT_INVALID");
    }

    const booking = await processPaymentSuccess(
      body.bookingId,
      body.razorpay_payment_id,
      body.razorpay_order_id,
    );

    sendSuccess(res, { booking }, "Payment verified — awaiting pandit acceptance");
  } catch (err) {
    next(err);
  }
});

/**
 * POST /payments/webhook
 * Razorpay webhook — raw body required for signature verification.
 * Register this URL in Razorpay dashboard: https://api.hmarepanditji.com/api/v1/payments/webhook
 */
router.post("/webhook", async (req, res) => {
  try {
    const signature = req.headers["x-razorpay-signature"] as string | undefined;
    const rawBody = JSON.stringify(req.body); // express.json() already parsed it

    if (signature && !verifyWebhookSignature(rawBody, signature)) {
      logger.warn("Razorpay webhook: invalid signature");
      res.status(400).json({ success: false, message: "Invalid webhook signature" });
      return;
    }

    const event = req.body as { event?: string; payload?: Record<string, unknown> };
    logger.info(`Razorpay webhook event: ${event.event}`);

    switch (event.event) {
      case "payment.captured": {
        const payment = (event.payload as any)?.payment?.entity;
        if (payment?.notes?.bookingId) {
          const booking = await prisma.booking.findUnique({
            where: { id: payment.notes.bookingId as string },
          });
          if (booking && booking.paymentStatus !== "PAID") {
            await processPaymentSuccess(
              payment.notes.bookingId as string,
              payment.id as string,
              payment.order_id as string,
            );
            logger.info(`Webhook: payment.captured processed for booking ${payment.notes.bookingId}`);
          }
        }
        break;
      }

      case "payment.failed": {
        const payment = (event.payload as any)?.payment?.entity;
        if (payment?.notes?.bookingId) {
          await prisma.booking.updateMany({
            where: {
              id: payment.notes.bookingId as string,
              paymentStatus: "PENDING",
            },
            data: { paymentStatus: "FAILED" },
          });
          logger.info(`Webhook: payment.failed for booking ${payment.notes.bookingId}`);
          // Notify customer via SMS (non-blocking)
          const booking = await prisma.booking.findUnique({
            where: { id: payment.notes.bookingId as string },
            include: {
              customer: { include: { user: { select: { id: true, phone: true, fullName: true } } } },
            },
          });
          if (booking?.customer?.user) {
            const { id: userId, phone, fullName } = booking.customer.user;
            sendNotification({
              userId,
              type: "GENERAL",
              title: "Payment Failed",
              message:
                `⚠️ ${fullName ?? "Customer"} जी, आपकी booking #${booking.bookingNumber} का payment fail हो गया। ` +
                `Kripya dobara try karein ya support se contact karein। — HmarePanditJi`,
              channel: "SMS",
              phone,
              metadata: { bookingNumber: booking.bookingNumber },
            }).catch((err) => logger.error("Failed to send payment.failed SMS:", err));
          }
        }
        break;
      }

      case "refund.processed": {
        const refund = (event.payload as any)?.refund?.entity;
        if (refund?.notes?.bookingId) {
          await prisma.booking.updateMany({
            where: { id: refund.notes.bookingId as string },
            data: {
              paymentStatus: "REFUNDED",
              status: "REFUNDED",
              refundId: refund.id as string,
            },
          });
          logger.info(`Webhook: refund.processed for booking ${refund.notes.bookingId}`);
        }
        break;
      }

      default:
        logger.info(`Razorpay webhook: unhandled event ${event.event}`);
    }

    res.status(200).json({ received: true });
  } catch (err) {
    logger.error("Razorpay webhook error:", err);
    res.status(200).json({ received: true }); // Always 200 to Razorpay
  }
});

/**
 * POST /payments/refund
 * Admin only — initiate a refund based on cancellation policy.
 */
router.post("/refund", authenticate, roleGuard("ADMIN"), async (req, res, next) => {
  try {
    const { bookingId, reason } = refundSchema.parse(req.body);
    const result = await initiateRefund(bookingId, reason);
    sendSuccess(res, result, "Refund initiated");
  } catch (err) {
    next(err);
  }
});

export default router;
