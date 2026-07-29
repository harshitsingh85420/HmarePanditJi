import { prisma } from "@hmarepanditji/db";
import { AppError } from "../middleware/errorHandler";
import { parsePagination } from "../utils/helpers";
import { NotificationService } from "./notification.service";
import { getNotificationTemplate } from "./notification-templates";
import { revieweeUserIdFromProfileId } from "../lib/reviewIdentity";

export interface CreateReviewInput {
  bookingId: string;
  reviewerId: string;
  ratings: {
    overall: number;
    knowledge?: number;
    punctuality?: number;
    communication?: number;
    valueForMoney?: number;
  };
  comment?: string;
  photoUrls?: string[];
  isAnonymous?: boolean;
}

export async function createReview(input: CreateReviewInput) {
  // Verify booking is completed and belongs to customer
  const booking = await prisma.booking.findFirst({
    where: {
      id: input.bookingId,
      customerId: input.reviewerId,
      status: "COMPLETED",
    },
    include: { pandit: true },
  });
  if (!booking) {
    throw new AppError(
      "Booking not found, not completed, or not yours",
      400,
      "REVIEW_INVALID",
    );
  }

  // One review per booking
  const existing = await prisma.review.findUnique({
    where: { bookingId: input.bookingId },
  });
  if (existing) throw new AppError("Review already submitted", 409, "REVIEW_EXISTS");

  // ONE ID LAW (reviewIdentity.ts): Review.revieweeId is a USER id (real
  // FK to User). Booking.panditId is a PanditProfile id — writing it here
  // was rejected by the FK, so NO review could ever be created. Resolve
  // through the single source instead.
  if (!booking.panditId) {
    throw new AppError("No pandit assigned to this booking", 400, "NO_PANDIT");
  }
  const revieweeId = await revieweeUserIdFromProfileId(prisma, booking.panditId);
  if (!revieweeId) {
    throw new AppError("No pandit assigned to this booking", 400, "NO_PANDIT");
  }

  const review = await prisma.review.create({
    data: {
      bookingId: input.bookingId,
      reviewerId: input.reviewerId,
      revieweeId,
      overallRating: input.ratings.overall,
      knowledgeRating: input.ratings.knowledge,
      punctualityRating: input.ratings.punctuality,
      communicationRating: input.ratings.communication,
      valueForMoneyRating: input.ratings.valueForMoney,
      comment: input.comment,
      photoUrls: input.photoUrls || [],
      isAnonymous: input.isAnonymous ?? false,
    },
  });

  // Recalculate pandit's average rating
  const stats = await prisma.review.aggregate({
    where: { revieweeId },
    _avg: { overallRating: true },
    _count: true,
  });

  await prisma.panditProfile.update({
    where: { userId: revieweeId },
    data: {
      rating: stats._avg.overallRating ?? 0,
      totalReviews: stats._count,
    },
  });

  const notificationService = new NotificationService();
  const tmpl = getNotificationTemplate("REVIEW_RECEIVED", { rating: input.ratings.overall, id: input.bookingId.substring(0,8).toUpperCase() });
  await notificationService.notify({ userId: revieweeId, type: "REVIEW_RECEIVED", title: tmpl.title, message: tmpl.message, smsMessage: tmpl.smsMessage });

  return review;
}

// ─────────────────────────────────────────────────────────────
// THE ONE PUBLIC REVIEW PROJECTION.
//
// Isj ruling 2026-07-29. A public reviews list needs: the reviewer's name (or
// "Anonymous"), the rating, the text, the date. Nothing else.
//
// WHAT IT REPLACED. This query selected `isAnonymous: true` AND
// `reviewer: { select: { name: true, customerProfile: true } }` — then returned
// the rows raw. The flag was READ and never APPLIED, so a customer who ticked
// "anonymous" was named to anyone with the URL, with their entire
// customerProfile attached, on a route that registers no `authenticate` hook.
//
// The correct implementation already existed twelve files away, in the TWIN
// route (`pandit.controller.ts` → GET /pandits/:id/reviews), which has always
// done `r.isAnonymous ? "Anonymous" : …`. Two endpoints over one resource, one
// honouring the customer's promise and one not — and the one that did not was
// the public one.
//
// So the projection and the anonymisation now live HERE, once, and BOTH routes
// import them. Sharing the select is the only thing that stops the pair drifting
// apart a third time.
//
// NOT SELECTED, deliberately:
//   · customerProfile — an entire profile object on a public endpoint
//   · reviewer.id / email / phone — a review is not an identity record
//   · photoUrls — customer-uploaded imagery of a private home; a separate
//     consent question from "may my review be shown", and nothing renders it
//   · the four sub-ratings (knowledge/punctuality/communication/value) — per the
//     ruling's "nothing else". They are NOT identity data and the schema still
//     carries them; if a public breakdown is wanted later, add them here and
//     both routes get it at once.
export const PUBLIC_REVIEW_SELECT = {
  id: true,
  overallRating: true,
  comment: true,
  createdAt: true,
  isAnonymous: true, // selected ONLY to be applied by toPublicReview, never sent
  reviewer: { select: { name: true } },
  booking: { select: { eventType: true } },
} as const;

type RawPublicReview = {
  id: string;
  overallRating: number | null;
  comment: string | null;
  createdAt: Date;
  isAnonymous: boolean;
  reviewer: { name: string | null } | null;
  booking: { eventType: string | null } | null;
};

/**
 * Apply the anonymity promise and drop the flag itself.
 *
 * `isAnonymous` must not survive into the response either: shipping
 * `{ reviewerName: "Anonymous", isAnonymous: true }` tells a reader WHICH
 * reviews are hidden, which is a weaker promise than it looks on a pandit with
 * few reviews.
 */
export function toPublicReview(r: RawPublicReview) {
  return {
    id: r.id,
    overallRating: r.overallRating,
    comment: r.comment,
    createdAt: r.createdAt,
    reviewerName: r.isAnonymous ? "Anonymous" : (r.reviewer?.name ?? "Customer"),
    pujaType: r.booking?.eventType ?? "Puja Service",
  };
}

export async function getPanditReviews(
  panditId: string, // actually userId of pandit
  query: Record<string, unknown>,
) {
  const { page, limit, skip } = parsePagination(query);

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where: { revieweeId: panditId },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: PUBLIC_REVIEW_SELECT,
    }),
    prisma.review.count({ where: { revieweeId: panditId } }),
  ]);

  return { reviews: reviews.map(toPublicReview), total, page, limit };
}
