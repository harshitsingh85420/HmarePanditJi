import { Request, Response, NextFunction } from "express";
import { prisma } from "@hmarepanditji/db";
import { sendSuccess } from "../utils/response";
import { AppError } from "../middleware/errorHandler";
import { SUPPORTED_PUJA_TYPES } from "../config/constants";

const cacheTTL = 3600 * 1000; // 1 hour
const datesCache = new Map<string, { data: any; expiry: number }>();
const pujasForDateCache = new Map<string, { data: any; expiry: number }>();
const upcomingCache = new Map<string, { data: any; expiry: number }>();

/**
 * GET /muhurat/dates
 * Get auspicious muhurat dates.
 * Query: ?month=M&year=Y&pujaType=X
 * Groups by date, counts pujas, returns { dates: [{ date, count, pujaTypes: string[] }] }
 */
export async function getMuhuratDates(req: Request, res: Response, next: NextFunction) {
  try {
    const { from, to, month, year, pujaType } = req.query as {
      from?: string;
      to?: string;
      month?: string;
      year?: string;
      pujaType?: string;
    };

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
    if (cached && cached.expiry > Date.now()) {
      return sendSuccess(res, { dates: cached.data });
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

    const result = Array.from(groupedMap.values()).map(g => ({
      date: g.date,
      count: g.count,
      pujaTypes: Array.from(g.pujaTypes),
    }));

    datesCache.set(cacheKey, { data: result, expiry: Date.now() + cacheTTL });

    sendSuccess(res, { dates: result });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /muhurat/upcoming
 * Get next N muhurat dates from today
 * Query: ?limit=10&pujaType=Vivah
 */
export async function getUpcomingMuhurat(req: Request, res: Response, next: NextFunction) {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const pujaType = req.query.pujaType as string;

    const cacheKey = `${limit}_${pujaType || "all"}`;
    const cached = upcomingCache.get(cacheKey);
    if (cached && cached.expiry > Date.now()) {
      return sendSuccess(res, { dates: cached.data });
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

    const result = dates.map(d => ({
      ...d,
      date: d.date.toISOString().split("T")[0],
    }));

    upcomingCache.set(cacheKey, { data: result, expiry: Date.now() + cacheTTL });

    sendSuccess(res, { dates: result });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /muhurat/pujas-for-date
 * Get all pujas available on a specific date.
 * Query: ?date=2026-03-15&pujaType=Vivah
 */
export async function getPujasForDate(req: Request, res: Response, next: NextFunction) {
  try {
    const { date, pujaType } = req.query as { date?: string; pujaType?: string };
    if (!date) {
      throw new AppError("Query param 'date' is required", 400, "VALIDATION_ERROR");
    }

    const cacheKey = `${date}_${pujaType || "all"}`;
    const cached = pujasForDateCache.get(cacheKey);
    if (cached && cached.expiry > Date.now()) {
      return sendSuccess(res, { muhurats: cached.data });
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

    pujasForDateCache.set(cacheKey, { data: entries, expiry: Date.now() + cacheTTL });

    sendSuccess(res, { muhurats: entries });
  } catch (err) {
    next(err);
  }
}

const suggestedCache = new Map<string, { data: any; expiry: number }>();

/**
 * GET /muhurat/suggest
 * Given a pujaType and optional date range, return top suggested muhurat dates.
 * Query: { pujaType, from?: "YYYY-MM-DD", to?: "YYYY-MM-DD" }
 * If no range given, returns next 5 upcoming dates from today.
 */
export async function getSuggestedMuhurat(req: Request, res: Response, next: NextFunction) {
  try {
    const { pujaType, from, to } = req.query as {
      pujaType?: string;
      from?: string;
      to?: string;
    };

    if (!pujaType) {
      throw new AppError("Query param 'pujaType' is required", 400, "VALIDATION_ERROR");
    }

    const cacheKey = `${pujaType}_${from || "null"}_${to || "null"}`;
    const cached = suggestedCache.get(cacheKey);
    if (cached && cached.expiry > Date.now()) {
      return sendSuccess(res, cached.data);
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
      suggestions: entries.map((e) => ({
        id: e.id,
        date: e.date,
        timeWindow: e.timeWindow,
        significance: e.significance,
        source: e.source,
      })),
      hasMuhurat: entries.length > 0,
      supportedPujaTypes: SUPPORTED_PUJA_TYPES,
    };

    suggestedCache.set(cacheKey, { data: responseData, expiry: Date.now() + cacheTTL });

    sendSuccess(res, responseData);
  } catch (err) {
    next(err);
  }
}
