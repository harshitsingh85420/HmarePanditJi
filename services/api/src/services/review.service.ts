import { prisma } from "@hmarepanditji/db";
import { AppError } from "../middleware/errorHandler";
import { parsePagination } from "../utils/helpers";

export interface CreateReviewInput {
  bookingId: string;
  reviewerId: string;
  overallRating: number;
  knowledgeRating?: number;
  punctualityRating?: number;
  communicationRating?: number;
  comment?: string;
  isAnonymous?: boolean;
}

export async function createReview(input: CreateReviewInput) {
  // Verify booking is completed and belongs to customer
  const booking = await prisma.booking.findFirst({
    where: {
      id: input.bookingId,
      customer: { userId: input.reviewerId },
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

  const revieweeId = booking.pandit?.userId;
  if (!revieweeId) {
    throw new AppError("No pandit assigned to this booking", 400, "NO_PANDIT");
  }

  const review = await prisma.review.create({
    data: {
      bookingId: input.bookingId,
      reviewerId: input.reviewerId,
      revieweeId,
      panditId: booking.panditId ?? undefined,
      overallRating: input.overallRating,
      knowledgeRating: input.knowledgeRating,
      punctualityRating: input.punctualityRating,
      communicationRating: input.communicationRating,
      comment: input.comment,
      isAnonymous: input.isAnonymous ?? false,
    },
  });

  // Recalculate pandit's average rating
  if (booking.panditId) {
    const stats = await prisma.review.aggregate({
      where: { panditId: booking.panditId },
      _avg: { overallRating: true },
      _count: true,
    });

    await prisma.pandit.update({
      where: { id: booking.panditId },
      data: {
        averageRating: stats._avg.overallRating ?? 0,
        rating: stats._avg.overallRating ?? 0,
        totalReviews: stats._count,
      },
    });
  }

  return review;
}

export async function getPanditReviews(
  panditId: string,
  query: Record<string, unknown>,
) {
  const { page, limit, skip } = parsePagination(query);

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where: { panditId },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        overallRating: true,
        knowledgeRating: true,
        punctualityRating: true,
        communicationRating: true,
        comment: true,
        isAnonymous: true,
        createdAt: true,
        reviewer: {
          select: { name: true, avatarUrl: true },
        },
      },
    }),
    prisma.review.count({ where: { panditId } }),
  ]);

  return { reviews, total, page, limit };
}
