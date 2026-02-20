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

export async function notifyBookingCreatedToCustomer(
  booking: { customerUserId: string, customerName: string, bookingNumber: string, eventType: string, eventDate: Date, customerPhone: string }
): Promise<void> {
  const dateStr = dateFormatter.format(booking.eventDate);
  const message = `🙏 Namaste ${booking.customerName}! Aapki booking #${booking.bookingNumber} create ho gayi hai. ${booking.eventType} ke liye ${dateStr} ko. Pandit Ji ko notify kar diya hai. – HmarePanditJi`;

  await sendNotification({
    userId: booking.customerUserId,
    type: "BOOKING_CREATED",
    title: "Booking Created",
    message,
    channel: "SMS",
    phone: booking.customerPhone,
  });
}

export async function notifyNewBookingToPandit(
  booking: { panditUserId: string, panditName: string, bookingNumber: string, eventType: string, eventDate: Date, venueCity: string, dakshina: number, travelMode: string | null, panditPayout: number, panditPhone: string }
): Promise<void> {
  const dateStr = dateFormatter.format(booking.eventDate);
  const travelMode = booking.travelMode ?? "Local";
  const message = `🔔 ${booking.panditName} Ji, nayi booking! #${booking.bookingNumber} – ${booking.eventType}, ${dateStr}, ${booking.venueCity}. Dakshina: ₹${booking.dakshina}. Travel: ${travelMode}. Aapki net earning: ₹${booking.panditPayout}. App mein jaake Accept/Reject karein. – HmarePanditJi`;

  await sendNotification({
    userId: booking.panditUserId,
    type: "BOOKING_CREATED",
    title: "New Booking Request",
    message,
    channel: "SMS",
    phone: booking.panditPhone,
  });
}

export async function notifyBookingConfirmedToCustomer(
  booking: { customerUserId: string, customerName: string, bookingNumber: string, panditName: string, eventType: string, eventDate: Date, customerPhone: string }
): Promise<void> {
  const dateStr = dateFormatter.format(booking.eventDate);
  const message = `✅ ${booking.customerName} Ji, booking #${booking.bookingNumber} confirmed! ${booking.panditName} Ji aapki ${booking.eventType} ke liye ${dateStr} ko available hain. Travel details jald update karenge. – HmarePanditJi`;

  await sendNotification({
    userId: booking.customerUserId,
    type: "BOOKING_CONFIRMED",
    title: "Booking Confirmed",
    message,
    channel: "SMS",
    phone: booking.customerPhone,
  });
}

export async function notifyBookingConfirmedToPandit(
  booking: { panditUserId: string, panditName: string, bookingNumber: string, eventType: string, eventDate: Date, venueCity: string, customerName: string, panditPhone: string }
): Promise<void> {
  const dateStr = dateFormatter.format(booking.eventDate);
  const message = `✅ ${booking.panditName} Ji, booking #${booking.bookingNumber} confirmed. ${booking.eventType}, ${dateStr}, ${booking.venueCity}. Customer: ${booking.customerName}. Travel details jald milenge. – HmarePanditJi`;

  await sendNotification({
    userId: booking.panditUserId,
    type: "BOOKING_CONFIRMED",
    title: "Booking Confirmed",
    message,
    channel: "SMS",
    phone: booking.panditPhone,
  });
}

export async function notifyTravelBookedToPandit(
  booking: { panditUserId: string, panditName: string, bookingNumber: string, travelMode: string, travelBookingRef: string, travelNotes: string, panditPhone: string }
): Promise<void> {
  const message = `🚆 ${booking.panditName} Ji, travel booked! Booking #${booking.bookingNumber}. ${booking.travelMode}: ${booking.travelBookingRef}. ${booking.travelNotes}. Puri details app mein dekhein. – HmarePanditJi`;

  await sendNotification({
    userId: booking.panditUserId,
    type: "GENERAL",
    title: "Travel Booked",
    message,
    channel: "SMS",
    phone: booking.panditPhone,
  });
}

export async function notifyTravelBookedToCustomer(
  booking: { customerUserId: string, customerName: string, bookingNumber: string, panditName: string, travelMode: string, travelBookingRef: string, customerPhone: string }
): Promise<void> {
  const message = `🚆 ${booking.customerName} Ji, travel arranged! Pandit ${booking.panditName} Ji ka travel book ho gaya hai – ${booking.travelMode}. Ref: ${booking.travelBookingRef}. Booking #${booking.bookingNumber}. – HmarePanditJi`;

  await sendNotification({
    userId: booking.customerUserId,
    type: "GENERAL",
    title: "Travel Arranged",
    message,
    channel: "SMS",
    phone: booking.customerPhone,
  });
}

export async function notifyStatusUpdateToCustomer(
  booking: { customerUserId: string, customerName: string, bookingNumber: string, panditName: string, statusMessage: string, customerPhone: string }
): Promise<void> {
  const message = `📍 Update: Pandit ${booking.panditName} Ji – ${booking.statusMessage}. Booking #${booking.bookingNumber}. – HmarePanditJi`;

  await sendNotification({
    userId: booking.customerUserId,
    type: "GENERAL",
    title: "Status Update",
    message,
    channel: "SMS",
    phone: booking.customerPhone,
  });
}

export async function notifyPaymentReceivedToCustomer(
  booking: { customerUserId: string, customerName: string, amount: number, bookingNumber: string, customerPhone: string }
): Promise<void> {
  const message = `💰 ${booking.customerName} Ji, payment ₹${booking.amount} received for booking #${booking.bookingNumber}. Invoice aapke dashboard mein available hai. – HmarePanditJi`;

  await sendNotification({
    userId: booking.customerUserId,
    type: "PAYMENT_SUCCESS",
    title: "Payment Received",
    message,
    channel: "SMS",
    phone: booking.customerPhone,
  });
}

export async function notifyReviewReminderToCustomer(
  booking: { customerUserId: string, customerName: string, bookingNumber: string, panditName: string, eventType: string, reviewLink: string, customerPhone: string }
): Promise<void> {
  const message = `🙏 ${booking.customerName} Ji, aapki ${booking.eventType} kaisi rahi? Pandit ${booking.panditName} Ji ke liye review dein: ${booking.reviewLink}. Booking #${booking.bookingNumber}. – HmarePanditJi`;

  await sendNotification({
    userId: booking.customerUserId,
    type: "REVIEW_REMINDER",
    title: "Review Your Experience",
    message,
    channel: "SMS",
    phone: booking.customerPhone,
  });
}

export async function notifyCancellationToAffected(
  booking: { userId: string, name: string, bookingNumber: string, reason: string, refundAmount: number, refundPercent: number, phone: string }
): Promise<void> {
  const message = `❌ ${booking.name} Ji, booking #${booking.bookingNumber} cancel ho gayi hai. Reason: ${booking.reason}. Refund: ₹${booking.refundAmount} (${booking.refundPercent}%). – HmarePanditJi`;

  await sendNotification({
    userId: booking.userId,
    type: "BOOKING_CANCELLED",
    title: "Booking Cancelled",
    message,
    channel: "SMS",
    phone: booking.phone,
  });
}

export async function notifyPayoutCompletedToPandit(
  booking: { panditUserId: string, panditName: string, payoutAmount: number, bookingNumber: string, payoutReference: string, panditPhone: string }
): Promise<void> {
  const message = `💰 ${booking.panditName} Ji, aapka payment ₹${booking.payoutAmount} transfer ho gaya hai. Booking #${booking.bookingNumber}. Bank mein 1-2 din mein aayega. Ref: ${booking.payoutReference}. – HmarePanditJi`;

  await sendNotification({
    userId: booking.panditUserId,
    type: "GENERAL",
    title: "Payout Completed",
    message,
    channel: "SMS",
    phone: booking.panditPhone,
  });
}

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
