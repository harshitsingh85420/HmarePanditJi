/**
 * THE ONE PLACE the notification vocabularies are translated.
 *
 * Same shape, same cure as services/api/src/lib/bookingStatus.ts.
 *
 * Two vocabularies coexist and NEVER overlapped:
 *   WRITTEN  by notify()/sendNotification — 21 distinct values, all specific
 *            events: BOOKING_CREATED, PANDIT_EN_ROUTE, PAYOUT_COMPLETED, …
 *   READ     by the customer notifications screen — 5 broad CATEGORIES:
 *            BOOKING | TRAVEL | STATUS | PAYMENT | REVIEW
 *
 * Zero overlap, so `switch (n.type)` fell to `default` for every row ever
 * written: a grey Info icon on everything, and `getNotificationLink` returning
 * null — **every notification was unclickable**.
 *
 * This was LATENT while two upstream breaks on the same file fired first (the
 * bare `token` localStorage key and the `/api/customers` prefix). Both were
 * fixed during this campaign, so the screen now renders real rows — and this
 * became LIVE. Fixing an upstream break can promote a latent one; that is why
 * it is being closed now rather than left in the queue.
 *
 * The mapping lives HERE, not in the screen, so the pandit app and any future
 * reader get the same answer. A writer emitting a new type without adding it
 * here falls to "SYSTEM", which is honest: a grey icon and no link, rather
 * than a wrong link.
 */

export const NOTIFICATION_CATEGORIES = [
  "BOOKING",
  "TRAVEL",
  "STATUS",
  "PAYMENT",
  "REVIEW",
  "SYSTEM",
] as const;

export type NotificationCategory = (typeof NOTIFICATION_CATEGORIES)[number];

/** Written type → the category a UI should render it as. */
const TYPE_TO_CATEGORY: Record<string, NotificationCategory> = {
  BOOKING_CREATED: "BOOKING",
  BOOKING_CONFIRMED: "BOOKING",
  BOOKING_CONFIRMED_ACK: "BOOKING",
  BOOKING_CANCELLED: "BOOKING",
  CANCELLATION: "BOOKING",
  CANCELLATION_APPROVED: "BOOKING",
  CANCELLATION_REQUESTED: "BOOKING",

  TRAVEL: "TRAVEL",
  TRAVEL_BOOKED: "TRAVEL",

  STATUS_UPDATE: "STATUS",
  PANDIT_EN_ROUTE: "STATUS",
  PANDIT_ARRIVED: "STATUS",
  PUJA_COMPLETED: "STATUS",
  PUJA_COMPLETED_PANDIT: "STATUS",

  PAYMENT_SUCCESS: "PAYMENT",
  PAYOUT: "PAYMENT",
  PAYOUT_COMPLETED: "PAYMENT",

  REVIEW_REMINDER: "REVIEW",

  // Deliberately SYSTEM: no deep link is correct for these.
  GENERAL: "SYSTEM",
  OTP: "SYSTEM",
  SINGLE: "SYSTEM",
  VERIFICATION: "SYSTEM",
  VERIFICATION_APPROVED: "SYSTEM",
  VERIFICATION_REJECTED: "SYSTEM",
};

/**
 * Map a written notification type to a render category.
 * Unknown values return "SYSTEM" — a grey icon and no link, never a wrong link.
 */
export function notificationCategory(type: string | null | undefined): NotificationCategory {
  if (!type) return "SYSTEM";
  return TYPE_TO_CATEGORY[type] ?? "SYSTEM";
}

/** Every type this module knows how to categorise — used by the guard. */
export const KNOWN_NOTIFICATION_TYPES = Object.keys(TYPE_TO_CATEGORY);
