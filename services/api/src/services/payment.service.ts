import Razorpay from "razorpay";
import crypto from "crypto";
import { prisma } from "@hmarepanditji/db";
import { env } from "../config/env";
import { AppError } from "../middleware/errorHandler";
import { logger } from "../utils/logger";

// ─── Razorpay singleton (lazy-init when keys are set) ─────────────────────────

let _razorpay: Razorpay | null = null;

function getRazorpay(): Razorpay {
  if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) {
    throw new AppError("Razorpay keys not configured", 503, "RAZORPAY_NOT_CONFIGURED");
  }
  if (!_razorpay) {
    _razorpay = new Razorpay({
      key_id: env.RAZORPAY_KEY_ID,
      key_secret: env.RAZORPAY_KEY_SECRET,
    });
  }
  return _razorpay;
}

// ─── Create Razorpay Order ────────────────────────────────────────────────────

export async function createRazorpayOrder(bookingId: string, customerId: string) {
  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, customerId },
    include: {
      customer: { include: { user: true } },
      pandit: true,
      ritual: true,
    },
  });
  if (!booking) throw new AppError("Booking not found", 404, "NOT_FOUND");
  if (booking.paymentStatus === "PAID") {
    throw new AppError("Booking already paid", 400, "ALREADY_PAID");
  }

  const pricing = booking.pricing as Record<string, number>;
  const total = pricing?.total ?? 5100;
  const amountPaise = Math.round(total * 100);

  // Dev mode: no Razorpay keys configured → return mock order
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

  // Production: create real Razorpay order
  const razorpay = getRazorpay();
  const order = await (razorpay.orders.create as Function)({
    amount: amountPaise,
    currency: "INR",
    receipt: booking.bookingNumber,
    notes: {
      bookingId: booking.id,
      customerName: booking.customer.user.fullName ?? "Customer",
      panditName: booking.pandit.displayName,
      ceremony: booking.ritual.name,
    },
  });

  await prisma.booking.update({
    where: { id: bookingId },
    data: { orderId: order.id },
  });

  return {
    orderId: order.id,
    amount: amountPaise,
    currency: "INR",
    key: env.RAZORPAY_KEY_ID,
  };
}

// ─── Verify Razorpay Signature ────────────────────────────────────────────────

export function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string,
): boolean {
  // Dev mode: skip when key secret not configured
  if (!env.RAZORPAY_KEY_SECRET) return true;

  const body = `${orderId}|${paymentId}`;
  const expected = crypto
    .createHmac("sha256", env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest("hex");
  return expected === signature;
}

// ─── Verify Webhook Signature ─────────────────────────────────────────────────

export function verifyWebhookSignature(rawBody: string, signature: string): boolean {
  if (!env.RAZORPAY_WEBHOOK_SECRET) return true; // Dev mode

  const expected = crypto
    .createHmac("sha256", env.RAZORPAY_WEBHOOK_SECRET)
    .update(rawBody)
    .digest("hex");
  return expected === signature;
}

// ─── Process Successful Payment ───────────────────────────────────────────────

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
      customer: { include: { user: true } },
      ritual: true,
    },
  });

  // TODO: trigger SMS/WhatsApp via Twilio to pandit + customer
  logger.info(
    `[NOTIFY] Booking ${booking.bookingNumber} paid — notify pandit ${booking.pandit.displayName}`,
  );

  return booking;
}

// ─── Initiate Refund ──────────────────────────────────────────────────────────

export async function initiateRefund(bookingId: string, reason?: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
  });

  if (!booking) throw new AppError("Booking not found", 404, "NOT_FOUND");
  if (booking.paymentStatus !== "PAID") {
    throw new AppError("Booking is not eligible for refund", 400, "NOT_REFUNDABLE");
  }
  if (!booking.paymentId) {
    throw new AppError("No payment ID on record", 400, "NO_PAYMENT_ID");
  }

  const pricing = booking.pricing as Record<string, number>;
  const totalPaid = pricing?.total ?? 0;
  const platformFee = pricing?.platformFee ?? 0;

  // Refund policy based on days until event
  const now = new Date();
  const event = new Date(booking.eventDate);
  const daysUntilEvent = Math.floor((event.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  let refundAmount: number;
  let refundNote: string;

  if (daysUntilEvent > 7) {
    refundAmount = totalPaid;
    refundNote = "100% refund (>7 days notice)";
  } else if (daysUntilEvent >= 3) {
    refundAmount = Math.round(totalPaid * 0.5);
    refundNote = "50% refund (3-7 days notice)";
  } else {
    // < 3 days: only platform fee refunded
    refundAmount = platformFee;
    refundNote = "Platform fee refund only (<3 days notice)";
  }

  const refundAmountPaise = Math.round(refundAmount * 100);
  const noteText = reason ? `${refundNote}. Reason: ${reason}` : refundNote;

  // Dev mode: mock refund
  if (!env.RAZORPAY_KEY_ID) {
    const mockRefundId = `refund_dev_${Date.now()}`;
    logger.info(`[DEV] Mock refund ${mockRefundId} for booking ${bookingId} — ₹${refundAmount}`);

    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: "REFUNDED",
        paymentStatus: "REFUNDED",
        refundId: mockRefundId,
        adminNotes: noteText,
      },
    });

    return { refundId: mockRefundId, refundAmount };
  }

  // Production: call Razorpay refund API
  const razorpay = getRazorpay();
  const refund = await (razorpay.payments.refund as Function)(booking.paymentId, {
    amount: refundAmountPaise,
    notes: { reason: noteText, bookingId },
  });

  await prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: "REFUNDED",
      paymentStatus: "REFUNDED",
      refundId: refund.id,
      adminNotes: `${noteText}. Razorpay refund ID: ${refund.id}`,
    },
  });

  logger.info(`Refund ${refund.id} initiated for booking ${booking.bookingNumber} — ₹${refundAmount}`);

  return { refundId: refund.id, refundAmount };
}
