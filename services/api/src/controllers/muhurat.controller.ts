import { Request, Response, NextFunction } from "express";
import { prisma } from "@hmarepanditji/db";
import { sendSuccess } from "../utils/response";
import { AppError } from "../middleware/errorHandler";
import { SUPPORTED_PUJA_TYPES } from "../config/constants";

/**
 * GET /muhurat/dates
 * Get auspicious muhurat dates. Supports two query styles:
 *   1. from/to: date range (YYYY-MM-DD)
 *   2. month/year: calendar month (month=1-12, year=YYYY)
 * Optional: pujaType filter
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

    const filter: Record<string, unknown> = pujaType && pujaType !== "all" ? { pujaType } : {};

    const dates = await prisma.muhuratDate.findMany({
      where: {
        date: { gte: fromDate, lte: toDate },
        ...filter,
      },
      orderBy: [{ date: "asc" }, { pujaType: "asc" }],
    });

    sendSuccess(res, { dates, total: dates.length });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /muhurat/pujas-for-date
 * Get all pujas available on a specific date.
 * Query: { date: "YYYY-MM-DD" }
 */
export async function getPujasForDate(req: Request, res: Response, next: NextFunction) {
  try {
    const { date } = req.query as { date?: string };
    if (!date) {
      throw new AppError("Query param 'date' is required", 400, "VALIDATION_ERROR");
    }

    const targetDate = new Date(date);
    if (isNaN(targetDate.getTime())) {
      throw new AppError("Invalid date format. Use YYYY-MM-DD", 400, "VALIDATION_ERROR");
    }

    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const entries = await prisma.muhuratDate.findMany({
      where: { date: { gte: startOfDay, lte: endOfDay } },
      orderBy: { pujaType: "asc" },
    });

    sendSuccess(res, {
      date,
      pujas: entries,
      isAuspicious: entries.length > 0,
    });
  } catch (err) {
    next(err);
  }
}

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

    sendSuccess(res, {
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
    });
  } catch (err) {
    next(err);
  }
}
