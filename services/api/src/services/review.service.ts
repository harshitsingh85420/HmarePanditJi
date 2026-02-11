import { prisma } from "@hmarepanditji/db";
import { AppError } from "../middleware/errorHandler";
import { parsePagination } from "../utils/helpers";

// ─── Stub implementations — replace in Sprint 7 ──────────────────────────────

export interface CreateReviewInput {
  bookingId: string;
  customerId: string;
  overallRating: number;
  ritualKnowledge?: number;
  punctuality?: number;
  communication?: number;
  comment?: string;
  isAnonymous?: boolean;
}

export async function createReview(input: CreateReviewInput) {
  // Verify booking is completed and belongs to customer
  const booking = await prisma.booking.findFirst({
    where: {
      id: input.bookingId,
      customerId: input.customerId,
      status: "COMPLETED",
    },
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

  const review = await prisma.review.create({
    data: {
      bookingId: input.bookingId,
      customerId: input.customerId,
      panditId: booking.panditId,
      overallRating: input.overallRating,
      ritualKnowledge: input.ritualKnowledge,
      punctuality: input.punctuality,
      communication: input.communication,
      comment: input.comment,
      isAnonymous: input.isAnonymous ?? false,
    },
  });

  // Recalculate pandit's average rating
  const stats = await prisma.review.aggregate({
    where: { panditId: booking.panditId },
    _avg: { overallRating: true },
    _count: true,
  });

  await prisma.pandit.update({
    where: { id: booking.panditId },
    data: {
      averageRating: stats._avg.overallRating ?? 0,
      totalReviews: stats._count,
    },
  });

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
        ritualKnowledge: true,
        punctuality: true,
        communication: true,
        comment: true,
        isAnonymous: true,
        createdAt: true,
        customer: {
          select: {
            user: {
              select: { fullName: true, avatarUrl: true },
            },
          },
        },
      },
    }),
    prisma.review.count({ where: { panditId } }),
  ]);

  return { reviews, total, page, limit };
}
