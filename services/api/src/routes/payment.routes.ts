import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { roleGuard } from "../middleware/roleGuard";
import { sendSuccess } from "../utils/response";

const router = Router();

/**
 * POST /payments/create-order
 * Create a Razorpay order for a booking.
 * Body: { bookingId }
 * Requires: CUSTOMER
 */
router.post("/create-order", authenticate, roleGuard("CUSTOMER"), (_req, res) => {
  sendSuccess(
    res,
    {
      orderId: "order_stub_123",
      amount: 500000, // paise
      currency: "INR",
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? "",
    },
    "Razorpay order created (stub — sprint 6)",
    201,
  );
});

/**
 * POST /payments/verify
 * Verify Razorpay payment signature after successful payment.
 * Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature }
 */
router.post("/verify", authenticate, roleGuard("CUSTOMER"), (_req, res) => {
  sendSuccess(res, { verified: true }, "Payment verified (stub)");
});

/**
 * POST /payments/webhook
 * Razorpay webhook endpoint — no auth (verified via signature header)
 * Body: Razorpay webhook payload
 */
router.post("/webhook", (_req, res) => {
  // TODO sprint 6: verify X-Razorpay-Signature and process events
  res.status(200).json({ received: true });
});

/**
 * POST /payments/refund
 * Initiate a refund for a cancelled booking.
 * Body: { bookingId }
 * Requires: ADMIN
 */
router.post("/refund", authenticate, roleGuard("ADMIN"), (_req, res) => {
  sendSuccess(res, null, "Refund initiated (stub)");
});

export default router;
