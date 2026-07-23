import Razorpay from "razorpay";
import crypto from "crypto";
import { prisma, BookingStatus, PaymentStatus } from "@hmarepanditji/db";
import { env } from "../config/env";
import { logger } from "../utils/logger";
import { AppError } from "../middleware/errorHandler";
import { calculatePanditPayout } from "../utils/pricing";
import { NotificationService, notifyNewBookingToPandit } from "./notification.service";
import { getNotificationTemplate } from "./notification-templates";

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
    // FAIL-CLOSED (L-J posture): production must NEVER mint a mock order —
    // a fake order id on a real booking simulates a payment path that does
    // not exist. Dev keeps the mock for local flows without keys.
    if (env.NODE_ENV === "production") {
      logger.error("Razorpay keys NOT configured in production — refusing to create order (fail closed)");
      throw new AppError("भुगतान सेवा अभी उपलब्ध नहीं है — कृपया थोड़ी देर में फिर कोशिश करें।", 503, "PAYMENTS_NOT_CONFIGURED");
    }
    logger.info(`[MOCK] Creating Razorpay order for ₹${input.amount} (non-production only)`);
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
    if (env.NODE_ENV !== "production") {
      logger.warn("[DEV] Falling back to mock Razorpay order after API failure");
      return {
        id: "order_mock_" + Date.now(),
        currency: input.currency || "INR",
        amount: input.amount * 100,
        status: "created",
      };
    }
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
      paymentStatus: "PENDING",
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
    // L-J: a missing webhook secret must FAIL CLOSED in production — never
    // accept an unsigned money-state mutation. (Mirrors the BB2 storage
    // fail-closed posture: dev may accept-all for local testing, prod may not.)
    if (env.NODE_ENV === "production") {
      logger.error("Razorpay webhook secret NOT configured in production — rejecting webhook (fail closed)");
      return false;
    }
    logger.warn("Razorpay webhook secret not configured — dev accept-all (non-production only)");
    return true;
  }

  const expected = crypto
    .createHmac("sha256", env.RAZORPAY_WEBHOOK_SECRET)
    .update(rawBody)
    .digest("hex");

  return expected === signature;
}

// ── Q4 WEBHOOK SELF-REGISTRATION ─────────────────────────────
// The Razorpay dashboard is KYC-gated (no onboarding → no webhook UI), but
// the v1 webhooks API works on test keys. So the SERVER registers its own
// webhook using the creds already in its env — secrets never leave this
// process, never appear in a response, never transit chat/CI. Idempotent:
// an existing registration for the same URL is returned, not duplicated.

const WEBHOOK_EVENTS = ["payment.captured", "payment.failed", "refund.processed"] as const;

/** Non-secret projection of a Razorpay webhook entity (NEVER the secret). */
function sanitizeWebhook(w: Record<string, unknown>) {
  return {
    id: w.id,
    url: w.url,
    active: w.active,
    events: w.events,
    created_at: w.created_at,
  };
}

export async function ensureRazorpayWebhook(webhookUrl: string) {
  if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) {
    throw new AppError("Razorpay keys not configured", 503, "PAYMENTS_NOT_CONFIGURED");
  }
  if (!env.RAZORPAY_WEBHOOK_SECRET) {
    // the webhook would be registered WITHOUT a verifiable secret — the L-J
    // fail-closed route would then reject every delivery. Refuse instead.
    throw new AppError("RAZORPAY_WEBHOOK_SECRET not configured", 503, "WEBHOOK_SECRET_MISSING");
  }

  const auth = Buffer.from(`${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`).toString("base64");
  const headers = { Authorization: `Basic ${auth}`, "Content-Type": "application/json" };

  const listRes = await fetch("https://api.razorpay.com/v1/webhooks?count=20", { headers });
  const listBody = (await listRes.json().catch(() => ({}))) as { items?: Array<Record<string, unknown>>; error?: unknown };
  if (!listRes.ok) {
    throw new AppError(
      `Razorpay webhook LIST failed (${listRes.status}): ${JSON.stringify(listBody?.error ?? listBody)}`,
      502,
      "RZP_WEBHOOK_LIST_FAILED",
    );
  }
  const existing = (listBody.items || []).find((w) => w.url === webhookUrl);
  if (existing) {
    return { action: "exists" as const, webhook: sanitizeWebhook(existing) };
  }

  // Razorpay has shipped both events shapes over time — object map first
  // (documented v1 JSON), plain array as fallback.
  const attempt = async (events: unknown) => {
    const res = await fetch("https://api.razorpay.com/v1/webhooks", {
      method: "POST",
      headers,
      body: JSON.stringify({ url: webhookUrl, secret: env.RAZORPAY_WEBHOOK_SECRET, events }),
    });
    const body = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    return { res, body };
  };

  let { res, body } = await attempt(Object.fromEntries(WEBHOOK_EVENTS.map((e) => [e, true])));
  if (!res.ok) {
    ({ res, body } = await attempt([...WEBHOOK_EVENTS]));
  }
  if (!res.ok) {
    // surface Razorpay's EXACT (non-secret) error — the caller's report needs
    // it verbatim if un-onboarded accounts are API-gated too
    throw new AppError(
      `Razorpay webhook CREATE failed (${res.status}): ${JSON.stringify((body as { error?: unknown })?.error ?? body)}`,
      502,
      "RZP_WEBHOOK_CREATE_FAILED",
    );
  }
  logger.info(`Razorpay webhook registered: ${String(body.id)} → ${webhookUrl}`);
  return { action: "created" as const, webhook: sanitizeWebhook(body) };
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
    // pandit.user carried along for the F19 booking-alert SMS (the phone lives
    // on the User row, not the PanditProfile).
    include: { customer: true, pandit: { include: { user: true } } },
  });

  if (!booking) {
    throw new AppError("Booking not found", 404, "BOOKING_NOT_FOUND");
  }

  if (booking.paymentStatus === "CAPTURED") {
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

  const updated = await prisma.$transaction(async (tx: any) => {
    const updatedBooking = await tx.booking.update({
      where: { id: booking.id },
      data: {
        razorpayPaymentId,
        razorpayOrderId: razorpayOrderId ?? booking.razorpayOrderId,
        paymentStatus: "CAPTURED",
        status: "PANDIT_REQUESTED",
        panditPayout,
      },
    });

    await tx.bookingStatusUpdate.create({
      data: {
        bookingId: booking.id,
        fromStatus: previousStatus,
        toStatus: "PANDIT_REQUESTED",
        updatedById: booking.customerId,
      },
    });

    return updatedBooking;
  });

  // ── Fire-and-forget notifications ──────────────────────────────────────────
  try {
    const notificationService = new NotificationService();
    if (booking.customer) {
      const customerUser = booking.customer;
      const t1 = getNotificationTemplate("PAYMENT_CAPTURED", { id: updated.id.substring(0, 8).toUpperCase(), amount: updated.grandTotal });
      notificationService.notify({ userId: customerUser.id, type: "PAYMENT_CAPTURED", title: t1.title, message: t1.message, smsMessage: t1.smsMessage }).catch((err) => logger.error("notifyPaymentReceivedToCustomer failed:", err));
    }

    if (booking.pandit) {
      // F19 (founder GO, 2026-07-23): the REAL booking-alert SMS. The previous
      // NotificationService.notify path was a code-level stub — it wrote the DB
      // row and never sent anything (the Twilio call was commented out), so a
      // pandit with the app closed NEVER learned a booking arrived. This helper
      // writes the SAME DB row AND sends the SMS via the proven Twilio path
      // (the one OTP uses; stub-logs gracefully when keys are absent).
      // BEST-EFFORT by design: the guaranteed alert is the operator call
      // (docs/review/pilot-ops-runbook.md §2) — the pandit is told "हम आपको
      // फ़ोन करेंगे", never "the app will alert you". Real bookingNumber used
      // (the old template built HPJ-<uuid-fragment>).
      notifyNewBookingToPandit({
        panditUserId: booking.pandit.userId,
        panditName: booking.pandit.fullName || "पंडित",
        bookingNumber: updated.bookingNumber,
        eventType: updated.eventType,
        eventDate: updated.eventDate,
        venueCity: updated.venueCity,
        dakshina: updated.dakshinaAmount,
        travelMode: updated.travelMode ? String(updated.travelMode) : null,
        panditPayout: updated.panditPayout ?? 0,
        panditPhone: booking.pandit.user?.phone ?? "",
      }).catch((err) => logger.error("notifyNewBookingToPandit failed:", err));
    }
  } catch (err) {
    logger.error("Payment notifications failed:", err);
  }

  return updated;
}
