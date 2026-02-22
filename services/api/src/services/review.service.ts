import { prisma } from "@hmarepanditji/db";
import { AppError } from "../middleware/errorHandler";
import { parsePagination } from "../utils/helpers";
import { NotificationService } from "./notification.service";
import { getNotificationTemplate } from "./notification-templates";

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

  const revieweeId = booking.panditId;
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
      select: {
        overallRating: true,
        knowledgeRating: true,
        punctualityRating: true,
        communicationRating: true,
        valueForMoneyRating: true,
        comment: true,
        photoUrls: true,
        isAnonymous: true,
        createdAt: true,
        reviewer: {
          select: { name: true, customerProfile: true }, // reviewer relation is just User
        },
      },
    }),
    prisma.review.count({ where: { revieweeId: panditId } }),
  ]);

  return { reviews, total, page, limit };
}
