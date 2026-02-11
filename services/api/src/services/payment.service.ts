import { prisma } from "@hmarepanditji/db";
import crypto from "crypto";
import { env } from "../config/env";
import { AppError } from "../middleware/errorHandler";
import { logger } from "../utils/logger";

// ─── Razorpay order creation ───────────────────────────────────────────────────

export async function createRazorpayOrder(bookingId: string, customerId: string) {
  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, customerId },
  });
  if (!booking) throw new AppError("Booking not found", 404, "NOT_FOUND");
  if (booking.paymentStatus === "PAID") {
    throw new AppError("Booking already paid", 400, "ALREADY_PAID");
  }

  const pricing = booking.pricing as Record<string, number>;
  const total = pricing?.total ?? 5100;
  const amountPaise = Math.round(total * 100);

  // Dev mode: no Razorpay key configured — return mock order
  if (!env.RAZORPAY_KEY_ID) {
    const mockOrderId = `order_dev_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    logger.info(`[DEV] Mock Razorpay order ${mockOrderId} for booking ${bookingId}, amount ₹${total}`);

    await prisma.booking.update({
      where: { id: bookingId },
      data: { orderId: mockOrderId },
    });

    return {
      orderId: mockOrderId,
      amount: amountPaise,
      currency: "INR",
      key: "rzp_test_mock",
    };
  }

  // TODO: real Razorpay SDK integration
  const orderId = `order_${Date.now()}`;
  return {
    orderId,
    amount: amountPaise,
    currency: "INR",
    key: env.RAZORPAY_KEY_ID,
  };
}

// ─── Signature verification ───────────────────────────────────────────────────

export function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string,
): boolean {
  // Dev mode: skip signature check when key secret not configured
  if (!env.RAZORPAY_KEY_SECRET) {
    return true;
  }
  const body = `${orderId}|${paymentId}`;
  const expectedSignature = crypto
    .createHmac("sha256", env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest("hex");
  return expectedSignature === signature;
}

// ─── Process successful payment ───────────────────────────────────────────────

export async function processPaymentSuccess(
  bookingId: string,
  paymentId: string,
  orderId: string,
) {
  const booking = await prisma.booking.update({
    where: { id: bookingId },
    data: {
      paymentStatus: "PAID",
      paymentId,
      orderId,
      // status stays PENDING — awaiting pandit acceptance
    },
    include: {
      pandit: { include: { user: true } },
      ritual: true,
    },
  });

  // TODO: trigger SMS/WhatsApp notification to pandit
  logger.info(
    `[NOTIFY] Booking ${booking.bookingNumber} paid — notify pandit ${booking.pandit.displayName}`,
  );

  return booking;
}
