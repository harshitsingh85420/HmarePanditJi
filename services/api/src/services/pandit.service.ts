import { prisma } from "@hmarepanditji/db";
import { parsePagination } from "../utils/helpers";
import { AppError } from "../middleware/errorHandler";

// ─── Stub implementations — replace in Sprint 4 ──────────────────────────────

export interface ListPanditsQuery {
  city?: string;
  category?: string;
  minRating?: number;
  search?: string;
  page?: number;
  limit?: number;
}

export async function listPandits(query: ListPanditsQuery) {
  const { page, limit, skip } = parsePagination(query);

  const where = {
    isVerified: true,
    isActive: true,
    ...(query.city ? { city: { contains: query.city, mode: "insensitive" as const } } : {}),
    ...(query.minRating ? { averageRating: { gte: query.minRating } } : {}),
    ...(query.search
      ? {
          OR: [
            { displayName: { contains: query.search, mode: "insensitive" as const } },
            { bio: { contains: query.search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [pandits, total] = await Promise.all([
    prisma.pandit.findMany({
      where,
      skip,
      take: limit,
      select: {
        id: true,
        displayName: true,
        city: true,
        state: true,
        averageRating: true,
        totalReviews: true,
        experienceYears: true,
        specializations: true,
        languages: true,
        profilePhotoUrl: true,
        basePricing: true,
      },
      orderBy: { averageRating: "desc" },
    }),
    prisma.pandit.count({ where }),
  ]);

  return { pandits, total, page, limit };
}

export async function getPanditById(id: string) {
  const pandit = await prisma.pandit.findUnique({
    where: { id },
    include: {
      user: { select: { phone: true, createdAt: true } },
      reviews: {
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          overallRating: true,
          comment: true,
          isAnonymous: true,
          createdAt: true,
          customer: { select: { user: { select: { fullName: true, avatarUrl: true } } } },
        },
      },
    },
  });

  if (!pandit) throw new AppError("Pandit not found", 404, "NOT_FOUND");
  return pandit;
}
