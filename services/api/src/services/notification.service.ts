import twilio from "twilio";
import { prisma } from "@hmarepanditji/db";
import { env } from "../config/env";
import { logger } from "../utils/logger";

// ─── Twilio singleton ─────────────────────────────────────────────────────────

let _twilio: ReturnType<typeof twilio> | null = null;

function getTwilio() {
  if (!env.TWILIO_ACCOUNT_SID || !env.TWILIO_AUTH_TOKEN) return null;
  if (!_twilio) {
    _twilio = twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN);
  }
  return _twilio;
}

// ─── Rate limiter (in-memory: max 10 SMS / phone / day) ──────────────────────

const smsRateMap = new Map<string, { count: number; date: string }>();
const SMS_DAILY_LIMIT = 10;

function checkSmsRateLimit(phone: string): boolean {
  const today = new Date().toISOString().slice(0, 10);
  const entry = smsRateMap.get(phone);
  if (!entry || entry.date !== today) {
    smsRateMap.set(phone, { count: 1, date: today });
    return true;
  }
  if (entry.count >= SMS_DAILY_LIMIT) return false;
  entry.count++;
  return true;
}

// ─── Normalize phone to E.164 ─────────────────────────────────────────────────

function toE164(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("91") && digits.length === 12) return `+${digits}`;
  if (digits.length === 10) return `+91${digits}`;
  return `+${digits}`;
}

// ─── Channel dispatchers ──────────────────────────────────────────────────────

async function sendSms(to: string, body: string): Promise<void> {
  const client = getTwilio();
  if (!client || !env.TWILIO_PHONE_NUMBER) {
    logger.info(`[SMS-STUB] to=${to}: ${body.slice(0, 80)}…`);
    return;
  }
  const e164 = toE164(to);
  if (!checkSmsRateLimit(e164)) {
    logger.warn(`[SMS] Rate limit exceeded for ${e164}, skipping`);
    return;
  }
  await client.messages.create({ body, from: env.TWILIO_PHONE_NUMBER, to: e164 });
}

async function sendWhatsApp(to: string, body: string): Promise<void> {
  const client = getTwilio();
  if (!client || !env.TWILIO_WHATSAPP_NUMBER) {
    logger.info(`[WA-STUB] to=${to}: ${body.slice(0, 80)}…`);
    return;
  }
  const e164 = toE164(to);
  await client.messages.create({
    body,
    from: `whatsapp:${env.TWILIO_WHATSAPP_NUMBER}`,
    to: `whatsapp:${e164}`,
  });
}

// ─── Core sendNotification ────────────────────────────────────────────────────

export interface SendNotificationInput {
  userId: string;
  type:
    | "BOOKING_CREATED"
    | "BOOKING_CONFIRMED"
    | "BOOKING_CANCELLED"
    | "PAYMENT_SUCCESS"
    | "REVIEW_REMINDER"
    | "OTP"
    | "GENERAL";
  title: string;
  message: string;
  channel: "SMS" | "WHATSAPP" | "EMAIL" | "IN_APP";
  /** Required for SMS / WHATSAPP channels */
  phone?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Persist a notification to DB and dispatch via the appropriate channel.
 * Uses Promise.allSettled so SMS failures don't block the response.
 */
export async function sendNotification(input: SendNotificationInput): Promise<void> {
  const dbPromise = prisma.notification
    .create({
      data: {
        userId: input.userId,
        type: input.type,
        title: input.title,
        message: input.message,
        channel: input.channel,
        metadata: (input.metadata ?? {}) as object,
      },
    })
    .catch((err) => logger.error("Failed to save notification to DB:", err));

  let dispatchPromise: Promise<void> = Promise.resolve();
  if (input.phone) {
    if (input.channel === "SMS") {
      dispatchPromise = sendSms(input.phone, input.message).catch((err) =>
        logger.error(`[SMS] Failed for ${input.phone}:`, err),
      );
    } else if (input.channel === "WHATSAPP") {
      dispatchPromise = sendWhatsApp(input.phone, input.message).catch((err) =>
        logger.error(`[WA] Failed for ${input.phone}:`, err),
      );
    }
  }

  await Promise.allSettled([dbPromise, dispatchPromise]);
}

// ─── Template helpers ─────────────────────────────────────────────────────────

const dateFormatter = new Intl.DateTimeFormat("en-IN", { dateStyle: "long" });

/** Send OTP via SMS */
export async function notifyOtp(phone: string, userId: string, otp: string): Promise<void> {
  const message = `[HmarePanditJi] आपका OTP: ${otp}. 10 min में expire होगा। Share न करें। 🙏`;
  await sendNotification({ userId, type: "OTP", title: "Your OTP", message, channel: "SMS", phone });
}

/** Notify customer — booking confirmed (payment received, awaiting pandit) */
export async function notifyBookingConfirmed(booking: {
  customerUserId: string;
  customerPhone: string;
  customerName: string;
  bookingNumber: string;
  ritualName: string;
  eventDate: Date;
  panditName: string;
  amount: number;
}): Promise<void> {
  const dateStr = dateFormatter.format(booking.eventDate);
  const message =
    `🙏 बधाई हो ${booking.customerName} जी! आपकी बुकिंग #${booking.bookingNumber} confirm हो गई।\n` +
    `📋 ${booking.ritualName}\n` +
    `📅 ${dateStr}\n` +
    `👳 पंडित ${booking.panditName}\n` +
    `💰 ₹${booking.amount}\n` +
    `हमारी team जल्द ही आपसे संपर्क करेगी।\n— HmarePanditJi`;
  await sendNotification({
    userId: booking.customerUserId,
    type: "BOOKING_CONFIRMED",
    title: `Booking #${booking.bookingNumber} Confirmed`,
    message,
    channel: "SMS",
    phone: booking.customerPhone,
    metadata: { bookingNumber: booking.bookingNumber },
  });
}

/** Notify pandit — new booking assigned */
export async function notifyNewBooking(booking: {
  panditUserId: string;
  panditPhone: string;
  bookingNumber: string;
  ritualName: string;
  eventDate: Date;
  eventTime?: string | null;
  city: string;
  dakshina: number;
}): Promise<void> {
  const dateStr = dateFormatter.format(booking.eventDate);
  const timeStr = booking.eventTime ?? "";
  const message =
    `🔔 नई बुकिंग! #${booking.bookingNumber}\n` +
    `📋 ${booking.ritualName}\n` +
    `📅 ${dateStr} | ${timeStr}\n` +
    `📍 ${booking.city}\n` +
    `💰 ₹${booking.dakshina}\n` +
    `App par details dekhein aur Accept/Reject karein।\n— HmarePanditJi`;
  await sendNotification({
    userId: booking.panditUserId,
    type: "BOOKING_CREATED",
    title: `New Booking #${booking.bookingNumber}`,
    message,
    channel: "SMS",
    phone: booking.panditPhone,
    metadata: { bookingNumber: booking.bookingNumber },
  });
}

/** Notify customer — pandit accepted their booking */
export async function notifyBookingAccepted(booking: {
  customerUserId: string;
  customerPhone: string;
  customerName: string;
  bookingNumber: string;
  panditName: string;
  eventDate: Date;
}): Promise<void> {
  const dateStr = dateFormatter.format(booking.eventDate);
  const message =
    `✅ ${booking.customerName} जी, पंडित ${booking.panditName} ने आपकी बुकिंग #${booking.bookingNumber} accept कर ली है! \n` +
    `📅 ${dateStr} ko mil rahe hain।\n— HmarePanditJi 🙏`;
  await sendNotification({
    userId: booking.customerUserId,
    type: "BOOKING_CONFIRMED",
    title: `Booking #${booking.bookingNumber} Accepted`,
    message,
    channel: "SMS",
    phone: booking.customerPhone,
    metadata: { bookingNumber: booking.bookingNumber },
  });
}

/** Notify customer — pandit rejected their booking */
export async function notifyBookingRejected(booking: {
  customerUserId: string;
  customerPhone: string;
  customerName: string;
  bookingNumber: string;
  panditName: string;
  eventDate: Date;
}): Promise<void> {
  const dateStr = dateFormatter.format(booking.eventDate);
  const message =
    `⚠️ ${booking.customerName} जी, पंडित ${booking.panditName} ${dateStr} ko available nahi hain।\n` +
    `Hum aapko alternative Pandit ji suggest karenge। Chinta na karein!\n— HmarePanditJi`;
  await sendNotification({
    userId: booking.customerUserId,
    type: "BOOKING_CANCELLED",
    title: `Booking #${booking.bookingNumber} Rejected`,
    message,
    channel: "SMS",
    phone: booking.customerPhone,
    metadata: { bookingNumber: booking.bookingNumber },
  });
}

/** Notify pandit — booking was cancelled by customer */
export async function notifyBookingCancelledToPandit(booking: {
  panditUserId: string;
  panditPhone: string;
  bookingNumber: string;
  reason?: string | null;
}): Promise<void> {
  const message =
    `❌ Booking #${booking.bookingNumber} cancel ho gayi hai।\n` +
    `Reason: ${booking.reason ?? "N/A"}\n— HmarePanditJi`;
  await sendNotification({
    userId: booking.panditUserId,
    type: "BOOKING_CANCELLED",
    title: `Booking #${booking.bookingNumber} Cancelled`,
    message,
    channel: "SMS",
    phone: booking.panditPhone,
    metadata: { bookingNumber: booking.bookingNumber },
  });
}

/** Notify customer — payment successful */
export async function notifyPaymentSuccess(booking: {
  customerUserId: string;
  customerPhone: string;
  bookingNumber: string;
  amount: number;
  receiptUrl?: string;
}): Promise<void> {
  const receiptUrl = booking.receiptUrl ?? `${env.WEB_URL}/bookings`;
  const message =
    `💰 Payment successful! ₹${booking.amount} received for booking #${booking.bookingNumber}।\n` +
    `Receipt: ${receiptUrl}\n— HmarePanditJi`;
  await sendNotification({
    userId: booking.customerUserId,
    type: "PAYMENT_SUCCESS",
    title: `Payment Confirmed — #${booking.bookingNumber}`,
    message,
    channel: "SMS",
    phone: booking.customerPhone,
    metadata: { bookingNumber: booking.bookingNumber, amount: booking.amount },
  });
}

/** Notify customer — review reminder 24h after event */
export async function notifyReviewReminder(booking: {
  customerUserId: string;
  customerPhone: string;
  customerName: string;
  panditName: string;
  ritualName: string;
  bookingId: string;
}): Promise<void> {
  const reviewUrl = `${env.WEB_URL}/bookings/${booking.bookingId}/review`;
  const message =
    `🙏 ${booking.customerName} जी, ${booking.ritualName} kaisi rahi?\n` +
    `Pandit ${booking.panditName} ko rate karein: ${reviewUrl}\n` +
    `Aapki feedback bahut mahatvapoorn hai!\n— HmarePanditJi`;
  await sendNotification({
    userId: booking.customerUserId,
    type: "REVIEW_REMINDER",
    title: "How was your experience?",
    message,
    channel: "SMS",
    phone: booking.customerPhone,
    metadata: { panditName: booking.panditName, bookingId: booking.bookingId },
  });
}

// ─── In-app helpers ───────────────────────────────────────────────────────────

export async function getUnreadCount(userId: string): Promise<number> {
  return prisma.notification.count({ where: { userId, isRead: false } });
}

export async function markAsRead(notificationId: string, userId: string) {
  return prisma.notification.updateMany({
    where: { id: notificationId, userId },
    data: { isRead: true },
  });
}

export async function markAllAsRead(userId: string) {
  return prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
}
