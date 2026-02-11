import { Router } from "express";
import { z } from "zod";
import { authenticate } from "../middleware/auth";
import { roleGuard } from "../middleware/roleGuard";
import { sendSuccess } from "../utils/response";
import {
  createRazorpayOrder,
  verifyRazorpaySignature,
  processPaymentSuccess,
} from "../services/payment.service";
import { AppError } from "../middleware/errorHandler";

const router = Router();

// ── Validation ────────────────────────────────────────────────────────────────

const verifySchema = z.object({
  bookingId: z.string().min(1),
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
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
    const { prisma } = await import("@hmarepanditji/db");
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
 * Verify Razorpay payment and mark booking as paid.
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
 * Razorpay webhook (no auth, verified via X-Razorpay-Signature).
 */
router.post("/webhook", (_req, res) => {
  // TODO: verify X-Razorpay-Signature and process payment.captured events
  res.status(200).json({ received: true });
});

/**
 * POST /payments/refund
 * Admin only.
 */
router.post("/refund", authenticate, roleGuard("ADMIN"), (_req, res) => {
  sendSuccess(res, null, "Refund initiated (stub)");
});

export default router;
