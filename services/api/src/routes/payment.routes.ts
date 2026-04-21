import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
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

export default async function paymentRoutes(fastify: FastifyInstance, _opts: any) {
  /**
   * POST /payments/create-order
   * Create a Razorpay order for an existing booking.
   */
  fastify.post("/create-order", { preHandler: [authenticate, roleGuard("CUSTOMER")] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const req = request as any;
    const res = reply;
    try {
      const { bookingId } = req.body as { bookingId?: string };
      if (!bookingId) {
        return res.status(400).send({ success: false, message: "bookingId is required" });
      }
      const order = await createRazorpayOrder(bookingId, req.user!.id);
      return sendSuccess(res, order, "Razorpay order created", 201);
    } catch (err) {
      throw err;
    }
  });

  /**
   * POST /payments/verify
   * Verify Razorpay payment signature and mark booking as paid.
   */
  fastify.post("/verify", { preHandler: [authenticate, roleGuard("CUSTOMER")] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const req = request as any;
    const res = reply;
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

      return sendSuccess(res, { booking }, "Payment verified — awaiting pandit acceptance");
    } catch (err) {
      throw err;
    }
  });

  /**
   * POST /payments/webhook
   * Razorpay webhook — raw body required for signature verification.
   * Register this URL in Razorpay dashboard: https://api.hmarepanditji.com/api/v1/payments/webhook
   */
  fastify.post("/webhook", {}, async (request: FastifyRequest, reply: FastifyReply) => {
    const req = request as any;
    const res = reply;
    try {
      const signature = req.headers["x-razorpay-signature"] as string | undefined;
      const rawBody = JSON.stringify(req.body); // express.json() already parsed it

      if (signature && !verifyWebhookSignature(rawBody, signature)) {
        logger.warn("Razorpay webhook: invalid signature");
        return res.status(400).send({ success: false, message: "Invalid webhook signature" });
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
            if (booking && booking.paymentStatus !== "CAPTURED") {
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
              include: { customer: true },
            });
            if (booking?.customer) {
              const { id: userId, phone, name } = booking.customer;
              sendNotification({
                userId,
                type: "GENERAL",
                title: "Payment Failed",
                message:
                  `⚠️ ${name ?? "Customer"} जी, आपकी booking #${booking.bookingNumber} का payment fail हो गया। ` +
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
                refundReference: refund.id as string,
              },
            });
            logger.info(`Webhook: refund.processed for booking ${refund.notes.bookingId}`);
          }
          break;
        }

        default:
          logger.info(`Razorpay webhook: unhandled event ${event.event}`);
      }

      return res.status(200).send({ received: true });
    } catch (err) {
      logger.error("Razorpay webhook error:", err);
      return res.status(200).send({ received: true }); // Always 200 to Razorpay
    }
  });

  /**
   * POST /payments/refund
   * Admin only — initiate a refund based on cancellation policy.
   */
  fastify.post("/refund", { preHandler: [authenticate, roleGuard("ADMIN")] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const req = request as any;
    const res = reply;
    try {
      const { bookingId, reason } = refundSchema.parse(req.body);
      const result = await initiateRefund(bookingId, reason);
      return sendSuccess(res, result, "Refund initiated");
    } catch (err) {
      throw err;
    }
  });
}
