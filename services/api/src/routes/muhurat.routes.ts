import { Router } from "express";
import { prisma } from "@hmarepanditji/db";
import { sendSuccess } from "../utils/response";
import { AppError } from "../middleware/errorHandler";
import { SUPPORTED_PUJA_TYPES } from "../config/constants";

const router = Router();

/**
 * GET /muhurat/dates
 * Get auspicious muhurat dates for a date range and optional puja type.
 * Query: { from: "YYYY-MM-DD", to: "YYYY-MM-DD", pujaType? }
 * Public.
 */
router.get("/dates", async (req, res, next) => {
  try {
    const { from, to, pujaType } = req.query as {
      from?: string;
      to?: string;
      pujaType?: string;
    };

    if (!from || !to) {
      throw new AppError("Query params 'from' and 'to' are required", 400, "VALIDATION_ERROR");
    }

    const fromDate = new Date(from);
    const toDate = new Date(to);
    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
      throw new AppError("Invalid date format. Use YYYY-MM-DD", 400, "VALIDATION_ERROR");
    }

    toDate.setHours(23, 59, 59, 999);

    const dates = await prisma.muhuratDate.findMany({
      where: {
        date: { gte: fromDate, lte: toDate },
        ...(pujaType ? { pujaType } : {}),
      },
      orderBy: [{ date: "asc" }, { pujaType: "asc" }],
    });

    sendSuccess(res, { dates, total: dates.length });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /muhurat/pujas-for-date
 * Get puja types available for a specific date.
 * Query: { date: "YYYY-MM-DD" }
 * Public.
 */
router.get("/pujas-for-date", async (req, res, next) => {
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
});

/**
 * GET /muhurat/suggest
 * Get suggested muhurat time windows for a puja type on a given date.
 * Query: { pujaType, date: "YYYY-MM-DD" }
 * Public.
 */
router.get("/suggest", async (req, res, next) => {
  try {
    const { pujaType, date } = req.query as { pujaType?: string; date?: string };

    if (!pujaType || !date) {
      throw new AppError("Query params 'pujaType' and 'date' are required", 400, "VALIDATION_ERROR");
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
      where: {
        pujaType,
        date: { gte: startOfDay, lte: endOfDay },
      },
      orderBy: { date: "asc" },
    });

    sendSuccess(res, {
      pujaType,
      date,
      suggestions: entries.map((e) => ({
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
});

export default router;
