import { prisma } from "@hmarepanditji/db";
import crypto from "crypto";
import { env } from "../config/env";
import { AppError } from "../middleware/errorHandler";
import { logger } from "../utils/logger";

// ─── Stub implementations — replace in Sprint 6 ──────────────────────────────

/**
 * Create a Razorpay order for a booking.
 * TODO sprint 6: integrate Razorpay SDK
 */
export async function createRazorpayOrder(bookingId: string, customerId: string) {
  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, customerId },
  });
  if (!booking) throw new AppError("Booking not found", 404, "NOT_FOUND");
  if (booking.paymentStatus === "PAID") {
    throw new AppError("Booking already paid", 400, "ALREADY_PAID");
  }

  // TODO: call Razorpay API to create order
  logger.info(`Creating Razorpay order for booking ${bookingId} (stub)`);

  return {
    orderId: `order_stub_${Date.now()}`,
    amount: 50000, // stub: ₹500 in paise
    currency: "INR",
    key: env.RAZORPAY_KEY_ID,
  };
}

/**
 * Verify Razorpay payment signature.
 */
export function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string,
): boolean {
  const body = `${orderId}|${paymentId}`;
  const expectedSignature = crypto
    .createHmac("sha256", env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest("hex");
  return expectedSignature === signature;
}

/**
 * Process verified payment — update booking status.
 */
export async function processPaymentSuccess(
  bookingId: string,
  paymentId: string,
  orderId: string,
) {
  return prisma.booking.update({
    where: { id: bookingId },
    data: {
      paymentStatus: "PAID",
      paymentId,
      orderId,
      status: "CONFIRMED",
    },
  });
}
