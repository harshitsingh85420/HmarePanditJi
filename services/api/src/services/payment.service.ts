import Razorpay from "razorpay";
import crypto from "crypto";
import { prisma, BookingStatus, PaymentStatus } from "@hmarepanditji/db";
import { env } from "../config/env";
import { logger } from "../utils/logger";
import { AppError } from "../middleware/errorHandler";
import { calculatePanditPayout } from "../utils/pricing";
import {
  notifyNewBookingToPandit,
  notifyPaymentReceivedToCustomer,
} from "./notification.service";

let razorpayInstance: Razorpay | null = null;

function getRazorpay() {
  if (!razorpayInstance) {
    if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) {
      logger.warn("Razorpay keys not configured. Payment formatting will fail.");
      return null;
    }
    razorpayInstance = new Razorpay({
      key_id: env.RAZORPAY_KEY_ID,
      key_secret: env.RAZORPAY_KEY_SECRET,
    });
  }
  return razorpayInstance;
}

export interface CreateOrderInput {
  amount: number; // in INR
  currency?: string;
  receipt: string;
  notes?: Record<string, string>;
}

/**
 * Low-level helper that talks to Razorpay API (or logs in mock mode).
 * Amount is in rupees; this function converts to paise.
 */
export async function createOrder(input: CreateOrderInput) {
  const rzp = getRazorpay();
  if (!rzp) {
    // Mock for development if keys missing
    logger.info(`[MOCK] Creating Razorpay order for ₹${input.amount}`);
    return {
      id: "order_mock_" + Date.now(),
      currency: input.currency || "INR",
      amount: input.amount * 100,
      status: "created",
    };
  }

  // Razorpay expects amount in paise
  const options = {
    amount: Math.round(input.amount * 100),
    currency: input.currency || "INR",
    receipt: input.receipt,
    notes: input.notes,
  };

  try {
    const order = await rzp.orders.create(options);
    return order;
  } catch (error) {
    logger.error("Razorpay Create Order Failed:", error);
    throw new Error("Payment initialization failed");
  }
}

export function verifySignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  if (!env.RAZORPAY_KEY_SECRET) {
    logger.warn("Cannot verify signature without RAZORPAY_KEY_SECRET");
    return false;
  }

  const generatedSignature = crypto
    .createHmac("sha256", env.RAZORPAY_KEY_SECRET)
    .update(orderId + "|" + paymentId)
    .digest("hex");

  return generatedSignature === signature;
}

export async function initiateRefund(bookingId: string, reason?: string) {
  const rzp = getRazorpay();
  if (!rzp) {
    logger.info(`[MOCK] Refund initiated for ${bookingId}`);
    return { refundId: "rf_" + Date.now(), refundAmount: 0 };
  }

  logger.info(`[Payment] Refund requested for ${bookingId}. Reason: ${reason}`);
  // Phase 1: manual refunds handled by ops team; we just log intent.
  // In future, use rzp.payments.refund(...) here.
  return { refundId: "rf_" + Date.now(), refundAmount: 0 };
}

// ─── High-level helpers used by routes ──────────────────────────────────────────

/**
 * Create a Razorpay order for a given booking.
 * - Verifies booking & customer ownership.
 * - Uses booking.grandTotal as source of truth for amount.
 * - Persists razorpayOrderId and keeps paymentStatus=PENDING.
 */
export async function createRazorpayOrder(bookingId: string, customerId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { customer: true, pandit: true },
  });

  if (!booking) {
    throw new AppError("Booking not found", 404, "BOOKING_NOT_FOUND");
  }

  if (booking.customerId !== customerId) {
    throw new AppError("You are not allowed to pay for this booking", 403, "FORBIDDEN");
  }

  if (booking.paymentStatus === "CAPTURED") {
    // Idempotent behaviour — return existing order info if already paid.
    return {
      orderId: booking.razorpayOrderId,
      amount: booking.grandTotal * 100,
      currency: "INR",
      keyId: env.RAZORPAY_KEY_ID,
      bookingNumber: booking.bookingNumber,
    };
  }

  const amountInRupees = booking.grandTotal || booking.dakshinaAmount;
  if (!amountInRupees || amountInRupees <= 0) {
    throw new AppError("Invalid booking amount", 400, "INVALID_AMOUNT");
  }

  const order = await createOrder({
    amount: amountInRupees,
    currency: "INR",
    receipt: booking.bookingNumber,
    notes: {
      bookingId: booking.id,
      customerId: booking.customerId,
      panditId: booking.panditId ?? "",
    },
  });

  await prisma.booking.update({
    where: { id: booking.id },
    data: {
      razorpayOrderId: order.id,
      paymentStatus: PaymentStatus.PENDING,
    },
  });

  return {
    orderId: order.id,
    amount: order.amount, // paise
    currency: order.currency,
    keyId: env.RAZORPAY_KEY_ID,
    bookingNumber: booking.bookingNumber,
  };
}

/** Thin wrapper for signature verification used by routes. */
export function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string,
): boolean {
  return verifySignature(orderId, paymentId, signature);
}

/**
 * Verify Razorpay webhook signature using RAZORPAY_WEBHOOK_SECRET.
 * If secret is not configured, treat as mock mode and accept all payloads.
 */
export function verifyWebhookSignature(rawBody: string, signature: string): boolean {
  if (!env.RAZORPAY_WEBHOOK_SECRET) {
    logger.warn("Razorpay webhook secret not configured — skipping signature verification");
    return true;
  }

  const expected = crypto
    .createHmac("sha256", env.RAZORPAY_WEBHOOK_SECRET)
    .update(rawBody)
    .digest("hex");

  return expected === signature;
}

/**
 * Mark a booking as paid after a successful Razorpay charge.
 * - Updates paymentStatus to CAPTURED and status → PANDIT_REQUESTED.
 * - Recalculates panditPayout based on latest financial columns.
 * - Creates a BookingStatusUpdate record.
 * - Triggers SMS notifications to customer & pandit.
 */
export async function processPaymentSuccess(
  bookingId: string,
  razorpayPaymentId: string,
  razorpayOrderId?: string,
) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { customer: true, pandit: true },
  });

  if (!booking) {
    throw new AppError("Booking not found", 404, "BOOKING_NOT_FOUND");
  }

  if (booking.paymentStatus === PaymentStatus.CAPTURED) {
    // Idempotent — return existing booking.
    return booking;
  }

  const previousStatus = booking.status;

  // Compute pandit payout using current financial fields
  const panditPayout = calculatePanditPayout({
    dakshinaAmount: booking.dakshinaAmount,
    platformFee: booking.platformFee,
    travelCost: booking.travelCost,
    foodAllowanceAmount: booking.foodAllowanceAmount,
    accommodationCost: booking.accommodationCost,
  });

  const updated = await prisma.$transaction(async (tx) => {
    const updatedBooking = await tx.booking.update({
      where: { id: booking.id },
      data: {
        razorpayPaymentId,
        razorpayOrderId: razorpayOrderId ?? booking.razorpayOrderId,
        paymentStatus: PaymentStatus.CAPTURED,
        status: BookingStatus.PANDIT_REQUESTED,
        panditPayout,
      },
    });

    await tx.bookingStatusUpdate.create({
      data: {
        bookingId: booking.id,
        fromStatus: previousStatus,
        toStatus: BookingStatus.PANDIT_REQUESTED,
        updatedById: booking.customerId,
      },
    });

    return updatedBooking;
  });

  // ── Fire-and-forget notifications ──────────────────────────────────────────
  try {
    if (booking.customer) {
      const customerUser = booking.customer;
      if (customerUser.phone) {
        notifyPaymentReceivedToCustomer({
          customerUserId: customerUser.id,
          customerName: customerUser.name ?? customerUser.phone,
          amount: updated.grandTotal,
          bookingNumber: updated.bookingNumber,
          customerPhone: customerUser.phone,
        }).catch((err) => logger.error("notifyPaymentReceivedToCustomer failed:", err));
      }
    }

    if (booking.pandit) {
      const panditUser = booking.pandit;
      if (panditUser.phone) {
        notifyNewBookingToPandit({
          panditUserId: panditUser.id,
          panditName: panditUser.name ?? panditUser.phone,
          bookingNumber: updated.bookingNumber,
          eventType: updated.eventType,
          eventDate: updated.eventDate,
          venueCity: updated.venueCity,
          dakshina: updated.dakshinaAmount,
          travelMode: updated.travelMode ?? null,
          panditPayout: updated.panditPayout,
          panditPhone: panditUser.phone,
        }).catch((err) => logger.error("notifyNewBookingToPandit failed:", err));
      }
    }
  } catch (err) {
    logger.error("Payment notifications failed:", err);
  }

  return updated;
}
