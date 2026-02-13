import { prisma } from "@hmarepanditji/db";
import { parsePagination } from "../utils/helpers";
import { AppError } from "../middleware/errorHandler";

// ── Types ────────────────────────────────────────────────────────────────────

export interface ListPanditsQuery {
  city?: string;
  category?: string;
  ritual?: string;
  minRating?: number;
  search?: string;
  page?: number;
  limit?: number;
  maxDistanceKm?: number;
  lat?: number;
  lng?: number;
  onlineOnly?: boolean;
  sort?: string;
  languages?: string;
  minPrice?: number;
  maxPrice?: number;
  travel?: string;
}

// ── List pandits with search + filters ───────────────────────────────────────

export async function listPandits(query: ListPanditsQuery) {
  const { page, limit, skip } = parsePagination(query as Record<string, unknown>);

  const pujaType = query.ritual || query.category;

  // Build where clause
  const conditions: Record<string, unknown>[] = [
    { isVerified: true },
    { isActive: true },
  ];

  if (query.onlineOnly) conditions.push({ isOnline: true });
  if (query.city) conditions.push({ city: { contains: query.city, mode: "insensitive" as const } });
  if (query.minRating) conditions.push({ averageRating: { gte: query.minRating } });
  if (query.maxDistanceKm) conditions.push({ maxTravelDistance: { gte: query.maxDistanceKm } });

  if (query.languages) {
    conditions.push({ languages: { hasSome: query.languages.split(",").map((l) => l.trim()) } });
  }

  if (query.search) {
    conditions.push({
      OR: [
        { displayName: { contains: query.search, mode: "insensitive" as const } },
        { bio: { contains: query.search, mode: "insensitive" as const } },
      ],
    });
  }

  // Puja type + price filter via PujaService relation
  if (pujaType) {
    const serviceFilter: Record<string, unknown> = { pujaType, isActive: true };
    if (query.minPrice) serviceFilter.dakshinaAmount = { gte: query.minPrice };
    if (query.maxPrice) {
      serviceFilter.dakshinaAmount = {
        ...(serviceFilter.dakshinaAmount as object ?? {}),
        lte: query.maxPrice,
      };
    }
    conditions.push({ pujaServices: { some: serviceFilter } });
  }

  const where = { AND: conditions };

  // Sort order
  const orderByMap: Record<string, object> = {
    rating_desc: { averageRating: "desc" },
    reviews_desc: { totalReviews: "desc" },
    best_match: { averageRating: "desc" },
    price_asc: { averageRating: "asc" },
    price_desc: { averageRating: "desc" },
    distance_asc: { city: "asc" },
  };
  const orderBy = orderByMap[query.sort ?? ""] ?? { averageRating: "desc" };

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
        maxTravelDistance: true,
        isOnline: true,
        isVerified: true,
        travelPreferences: true,
        completedBookings: true,
        pujaServices: {
          where: { isActive: true },
          select: {
            pujaType: true,
            dakshinaAmount: true,
            durationHours: true,
          },
        },
      },
      orderBy: orderBy as never,
    }),
    prisma.pandit.count({ where }),
  ]);

  return { pandits, total, page, limit };
}

// ── Get pandit by ID ─────────────────────────────────────────────────────────

export async function getPanditById(id: string) {
  const pandit = await prisma.pandit.findUnique({
    where: { id },
    include: {
      user: { select: { phone: true, createdAt: true } },
      pujaServices: {
        where: { isActive: true },
        orderBy: { pujaType: "asc" },
      },
      reviews: {
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          overallRating: true,
          knowledgeRating: true,
          punctualityRating: true,
          communicationRating: true,
          comment: true,
          isAnonymous: true,
          createdAt: true,
          reviewer: { select: { name: true, avatarUrl: true } },
          booking: { select: { eventType: true } },
        },
      },
    },
  });

  if (!pandit) throw new AppError("Pandit not found", 404, "NOT_FOUND");
  return pandit;
}

// ── Get pandit reviews (paginated) ───────────────────────────────────────────

export async function getPanditReviews(panditId: string, page = 1, limit = 10) {
  const skip = (page - 1) * limit;

  const pandit = await prisma.pandit.findUnique({ where: { id: panditId }, select: { id: true } });
  if (!pandit) throw new AppError("Pandit not found", 404, "NOT_FOUND");

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where: { panditId },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        overallRating: true,
        knowledgeRating: true,
        punctualityRating: true,
        communicationRating: true,
        comment: true,
        isAnonymous: true,
        createdAt: true,
        reviewer: { select: { name: true, avatarUrl: true } },
        booking: { select: { eventType: true } },
      },
    }),
    prisma.review.count({ where: { panditId } }),
  ]);

  const allRatings = await prisma.review.aggregate({
    where: { panditId },
    _avg: {
      overallRating: true,
      knowledgeRating: true,
      punctualityRating: true,
      communicationRating: true,
    },
    _count: true,
  });

  const distribution = await Promise.all(
    [5, 4, 3, 2, 1].map(async (star) => ({
      star,
      count: await prisma.review.count({ where: { panditId, overallRating: star } }),
    })),
  );

  return {
    reviews: reviews.map((r) => ({
      ...r,
      reviewerName: r.isAnonymous ? "Anonymous" : (r.reviewer?.name ?? "Customer"),
      reviewerAvatar: r.isAnonymous ? null : r.reviewer?.avatarUrl,
      ceremony: r.booking?.eventType ?? "Ceremony",
    })),
    total,
    page,
    limit,
    summary: {
      averageRating: allRatings._avg.overallRating ?? 0,
      averageKnowledge: allRatings._avg.knowledgeRating ?? 0,
      averagePunctuality: allRatings._avg.punctualityRating ?? 0,
      averageCommunication: allRatings._avg.communicationRating ?? 0,
      totalReviews: allRatings._count,
      distribution,
    },
  };
}

// ── Get pandit services ──────────────────────────────────────────────────────

export async function getPanditServices(panditId: string) {
  const pandit = await prisma.pandit.findUnique({ where: { id: panditId }, select: { id: true } });
  if (!pandit) throw new AppError("Pandit not found", 404, "NOT_FOUND");

  return prisma.pujaService.findMany({
    where: { panditId, isActive: true },
    orderBy: { pujaType: "asc" },
  });
}

// ── Get pandit availability (month calendar) ─────────────────────────────────

export async function getPanditAvailability(panditId: string, month: number, year: number) {
  const pandit = await prisma.pandit.findUnique({ where: { id: panditId }, select: { id: true } });
  if (!pandit) throw new AppError("Pandit not found", 404, "NOT_FOUND");

  const startOfMonth = new Date(year, month - 1, 1);
  const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

  const [bookings, blockedDates] = await Promise.all([
    prisma.booking.findMany({
      where: {
        panditId,
        eventDate: { gte: startOfMonth, lte: endOfMonth },
        status: { in: ["CONFIRMED", "TRAVEL_BOOKED", "PANDIT_EN_ROUTE", "PANDIT_ARRIVED", "PUJA_IN_PROGRESS"] },
      },
      select: { eventDate: true, eventType: true, id: true },
    }),
    prisma.panditBlockedDate.findMany({
      where: { panditId, date: { gte: startOfMonth, lte: endOfMonth } },
      select: { id: true, date: true, reason: true },
    }),
  ]);

  const daysInMonth = new Date(year, month, 0).getDate();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dates: { date: string; status: "available" | "booked" | "blocked"; bookings?: { id: string; eventType: string }[] }[] = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

    const dayBookings = bookings.filter((b) => {
      const bd = new Date(b.eventDate);
      return bd.getDate() === day && bd.getMonth() === month - 1 && bd.getFullYear() === year;
    });

    const dayBlocked = blockedDates.filter((b) => {
      const bd = new Date(b.date);
      return bd.getDate() === day && bd.getMonth() === month - 1 && bd.getFullYear() === year;
    });

    if (dayBookings.length > 0) {
      dates.push({
        date: dateStr,
        status: "booked",
        bookings: dayBookings.map((b) => ({ id: b.id, eventType: b.eventType })),
      });
    } else if (dayBlocked.length > 0) {
      dates.push({ date: dateStr, status: "blocked" });
    } else {
      dates.push({ date: dateStr, status: "available" });
    }
  }

  return { panditId, month, year, dates };
}
