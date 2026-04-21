import { FastifyRequest, FastifyReply } from "fastify";
import { prisma } from "@hmarepanditji/db";
import { AppError } from "../middleware/errorHandler";
import { SUPPORTED_PUJA_TYPES } from "../config/constants";

// Bounded TTL cache with size limit to prevent memory leaks
class BoundedTTLCache<T> {
  private store = new Map<string, { data: T; expiry: number }>();
  constructor(private maxSize: number, private defaultTTL: number) { }

  get(key: string): T | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (entry.expiry <= Date.now()) {
      this.store.delete(key);
      return undefined;
    }
    return entry.data;
  }

  set(key: string, data: T, ttl?: number) {
    // Evict expired entries first
    const now = Date.now();
    for (const [k, v] of this.store.entries()) {
      if (v.expiry <= now) this.store.delete(k);
    }
    // If still at capacity, evict oldest
    if (this.store.size >= this.maxSize) {
      const oldest = this.store.keys().next().value;
      if (oldest !== undefined) this.store.delete(oldest);
    }
    this.store.set(key, { data, expiry: now + (ttl ?? this.defaultTTL) });
  }
}

const CACHE_TTL = 3600 * 1000; // 1 hour
const MAX_CACHE_SIZE = 200; // per-cache entry limit

interface MuhuratDateGroup {
  date: string;
  count: number;
  pujaTypes: string[];
}

interface MuhuratDateEntry {
  date: string;
  pujaType: string | null;
  timeWindow: string | null;
  significance: string | null;
}

const datesCache = new BoundedTTLCache<MuhuratDateGroup[]>(MAX_CACHE_SIZE, CACHE_TTL);
const pujasForDateCache = new BoundedTTLCache<MuhuratDateEntry[]>(MAX_CACHE_SIZE, CACHE_TTL);
const upcomingCache = new BoundedTTLCache<MuhuratDateEntry[]>(MAX_CACHE_SIZE, CACHE_TTL);

function successBody<T>(data: T): { success: boolean; data: T; message: string } {
  return { success: true, data, message: "Success" };
}

/**
 * GET /muhurat/dates
 * Get auspicious muhurat dates.
 * Query: ?month=M&year=Y&pujaType=X
 * Groups by date, counts pujas, returns { dates: [{ date, count, pujaTypes: string[] }] }
 */
export async function getMuhuratDates(request: FastifyRequest, reply: FastifyReply) {
  try {
    const query = request.query as Record<string, string | undefined>;
    const from = query.from;
    const to = query.to;
    const month = query.month;
    const year = query.year;
    const pujaType = query.pujaType;

    let fromDate: Date;
    let toDate: Date;

    if (month && year) {
      const m = parseInt(month, 10);
      const y = parseInt(year, 10);
      if (isNaN(m) || isNaN(y) || m < 1 || m > 12) {
        throw new AppError("Invalid month/year. month=1-12, year=YYYY", 400, "VALIDATION_ERROR");
      }
      fromDate = new Date(y, m - 1, 1);
      toDate = new Date(y, m, 0, 23, 59, 59, 999);
    } else if (from && to) {
      fromDate = new Date(from);
      toDate = new Date(to);
      if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
        throw new AppError("Invalid date format. Use YYYY-MM-DD", 400, "VALIDATION_ERROR");
      }
      toDate.setHours(23, 59, 59, 999);
    } else {
      throw new AppError(
        "Provide either 'month' & 'year' or 'from' & 'to' query params",
        400,
        "VALIDATION_ERROR",
      );
    }

    const cacheKey = `${fromDate.toISOString()}_${toDate.toISOString()}_${pujaType || "all"}`;
    const cached = datesCache.get(cacheKey);
    if (cached !== undefined) {
      return reply.send(successBody({ dates: cached }));
    }

    const filter: Record<string, unknown> = pujaType && pujaType !== "all" ? { pujaType } : {};

    const dates = await prisma.muhuratDate.findMany({
      where: {
        date: { gte: fromDate, lte: toDate },
        ...filter,
      },
      orderBy: [{ date: "asc" }, { pujaType: "asc" }],
    });

    const groupedMap = new Map<string, { date: string; count: number; pujaTypes: Set<string> }>();

    for (const d of dates) {
      const dString = d.date.toISOString().split("T")[0];
      if (!groupedMap.has(dString)) {
        groupedMap.set(dString, { date: dString, count: 0, pujaTypes: new Set() });
      }
      const group = groupedMap.get(dString)!;
      group.count += 1;
      group.pujaTypes.add(d.pujaType);
    }

    const result = Array.from(groupedMap.values()).map((g) => ({
      date: g.date,
      count: g.count,
      pujaTypes: Array.from(g.pujaTypes),
    }));

    datesCache.set(cacheKey, result);

    return reply.send(successBody({ dates: result }));
  } catch (err) {
    throw err;
  }
}

/**
 * GET /muhurat/upcoming
 * Get next N muhurat dates from today
 * Query: ?limit=10&pujaType=Vivah
 */
export async function getUpcomingMuhurat(request: FastifyRequest, reply: FastifyReply) {
  try {
    const query = request.query as Record<string, string | undefined>;
    const limit = parseInt(query.limit || "10");
    const pujaType = query.pujaType;

    const cacheKey = `${limit}_${pujaType || "all"}`;
    const cached = upcomingCache.get(cacheKey);
    if (cached !== undefined) {
      return reply.send(successBody({ dates: cached }));
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const filter: Record<string, unknown> = pujaType && pujaType !== "all" ? { pujaType } : {};

    const dates = await prisma.muhuratDate.findMany({
      where: { date: { gte: today }, ...filter },
      orderBy: { date: "asc" },
      take: limit,
      select: { date: true, pujaType: true, timeWindow: true, significance: true }
    });

    const result = dates.map((d: { date: Date; pujaType: string | null; timeWindow: string | null; significance: string | null }): { date: string; pujaType: string | null; timeWindow: string | null; significance: string | null } => ({
      ...d,
      date: d.date.toISOString().split("T")[0],
    }));

    upcomingCache.set(cacheKey, result);

    return reply.send(successBody({ dates: result }));
  } catch (err) {
    throw err;
  }
}

/**
 * GET /muhurat/pujas-for-date
 * Get all pujas available on a specific date.
 * Query: ?date=2026-03-15&pujaType=Vivah
 */
export async function getPujasForDate(request: FastifyRequest, reply: FastifyReply) {
  try {
    const query = request.query as Record<string, string | undefined>;
    const date = query.date;
    const pujaType = query.pujaType;
    if (!date) {
      throw new AppError("Query param 'date' is required", 400, "VALIDATION_ERROR");
    }

    const cacheKey = `${date}_${pujaType || "all"}`;
    const cached = pujasForDateCache.get(cacheKey);
    if (cached !== undefined) {
      return reply.send(successBody({ muhurats: cached }));
    }

    const targetDate = new Date(date);
    if (isNaN(targetDate.getTime())) {
      throw new AppError("Invalid date format. Use YYYY-MM-DD", 400, "VALIDATION_ERROR");
    }

    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const filter: Record<string, unknown> = pujaType && pujaType !== "all" ? { pujaType } : {};

    const entries = await prisma.muhuratDate.findMany({
      where: { date: { gte: startOfDay, lte: endOfDay }, ...filter },
      orderBy: { pujaType: "asc" },
      select: { pujaType: true, timeWindow: true, significance: true, source: true }
    });

    pujasForDateCache.set(cacheKey, entries as any);

    return reply.send(successBody({ muhurats: entries }));
  } catch (err) {
    throw err;
  }
}

interface SuggestedMuhuratResponse {
  pujaType: string;
  suggestions: Array<{
    id: string;
    date: Date;
    timeWindow: string | null;
    significance: string | null;
    source: string | null;
  }>;
  hasMuhurat: boolean;
  supportedPujaTypes: string[];
}

const suggestedCache = new BoundedTTLCache<SuggestedMuhuratResponse>(MAX_CACHE_SIZE, CACHE_TTL);

/**
 * GET /muhurat/suggest
 * Given a pujaType and optional date range, return top suggested muhurat dates.
 * Query: { pujaType, from?: "YYYY-MM-DD", to?: "YYYY-MM-DD" }
 * If no range given, returns next 5 upcoming dates from today.
 */
export async function getSuggestedMuhurat(request: FastifyRequest, reply: FastifyReply) {
  try {
    const query = request.query as Record<string, string | undefined>;
    const pujaType = query.pujaType;
    const from = query.from;
    const to = query.to;

    if (!pujaType) {
      throw new AppError("Query param 'pujaType' is required", 400, "VALIDATION_ERROR");
    }

    const cacheKey = `${pujaType}_${from || "null"}_${to || "null"}`;
    const cached = suggestedCache.get(cacheKey);
    if (cached !== undefined) {
      return reply.send(successBody(cached));
    }

    let fromDate: Date;
    let toDate: Date | undefined;

    if (from) {
      fromDate = new Date(from);
      if (isNaN(fromDate.getTime())) {
        throw new AppError("Invalid 'from' date format. Use YYYY-MM-DD", 400, "VALIDATION_ERROR");
      }
    } else {
      fromDate = new Date();
      fromDate.setHours(0, 0, 0, 0);
    }

    if (to) {
      toDate = new Date(to);
      if (isNaN(toDate.getTime())) {
        throw new AppError("Invalid 'to' date format. Use YYYY-MM-DD", 400, "VALIDATION_ERROR");
      }
      toDate.setHours(23, 59, 59, 999);
    }

    const entries = await prisma.muhuratDate.findMany({
      where: {
        pujaType,
        date: {
          gte: fromDate,
          ...(toDate ? { lte: toDate } : {}),
        },
      },
      orderBy: { date: "asc" },
      take: 5,
    });

    const responseData = {
      pujaType,
      suggestions: entries.map((e: { id: string; date: Date; timeWindow: string | null; significance: string | null; source: string | null }): { id: string; date: Date; timeWindow: string | null; significance: string | null; source: string | null } => ({
        id: e.id,
        date: e.date,
        timeWindow: e.timeWindow,
        significance: e.significance,
        source: e.source,
      })),
      hasMuhurat: entries.length > 0,
      supportedPujaTypes: SUPPORTED_PUJA_TYPES,
    };

    suggestedCache.set(cacheKey, responseData as any);

    return reply.send(successBody(responseData));
  } catch (err) {
    throw err;
  }
}
