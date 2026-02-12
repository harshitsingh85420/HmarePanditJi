import { Router } from "express";
import { z } from "zod";
import { prisma } from "@hmarepanditji/db";
import { sendSuccess } from "../utils/response";
import { AppError } from "../middleware/errorHandler";
import {
  SELF_DRIVE_RATE_PER_KM,
  FOOD_ALLOWANCE_PER_DAY,
} from "../config/constants";

const router = Router();

const calculateSchema = z.object({
  fromCity: z.string().min(1),
  toCity: z.string().min(1),
  mode: z.enum(["SELF_DRIVE", "TRAIN", "FLIGHT", "CAB", "BUS"]),
  travelDays: z.number().int().min(1).default(1),
  pujaDays: z.number().int().min(1).default(1),
  customerProvidesMeals: z.boolean().default(true),
});

/**
 * POST /travel/calculate
 * Calculate travel cost for a route + mode.
 * Public.
 */
router.post("/calculate", async (req, res, next) => {
  try {
    const body = calculateSchema.parse(req.body);

    const distanceRecord = await prisma.cityDistance.findFirst({
      where: {
        OR: [
          { fromCity: body.fromCity, toCity: body.toCity },
          { fromCity: body.toCity, toCity: body.fromCity },
        ],
      },
    });

    if (!distanceRecord) {
      throw new AppError(
        `Distance not found between ${body.fromCity} and ${body.toCity}`,
        404,
        "NOT_FOUND",
      );
    }

    const distanceKm = distanceRecord.distanceKm;

    // Estimate travel cost by mode
    let travelCost = 0;
    switch (body.mode) {
      case "SELF_DRIVE":
        travelCost = Math.round(distanceKm * SELF_DRIVE_RATE_PER_KM * 2); // round trip
        break;
      case "TRAIN":
        travelCost = Math.round(distanceKm * 2.5); // approx 2AC fare
        break;
      case "FLIGHT":
        travelCost = distanceKm < 500 ? 4500 : 7500; // flat band
        break;
      case "CAB":
        travelCost = Math.round(distanceKm * 15 * 2); // round trip
        break;
      case "BUS":
        travelCost = Math.round(distanceKm * 1.5);
        break;
    }

    const foodAllowance = body.customerProvidesMeals
      ? 0
      : (body.travelDays + body.pujaDays) * FOOD_ALLOWANCE_PER_DAY;

    sendSuccess(res, {
      fromCity: body.fromCity,
      toCity: body.toCity,
      distanceKm,
      estimatedDriveHours: distanceRecord.estimatedDriveHours,
      mode: body.mode,
      travelCost,
      foodAllowance,
      totalLogisticsCost: travelCost + foodAllowance,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /travel/distance
 * Get distance between two cities.
 * Query: { from, to }
 * Public.
 */
router.get("/distance", async (req, res, next) => {
  try {
    const { from, to } = req.query as { from?: string; to?: string };
    if (!from || !to) {
      throw new AppError("Query params 'from' and 'to' are required", 400, "VALIDATION_ERROR");
    }

    const record = await prisma.cityDistance.findFirst({
      where: {
        OR: [
          { fromCity: from, toCity: to },
          { fromCity: to, toCity: from },
        ],
      },
    });

    if (!record) {
      throw new AppError(`Distance not found between ${from} and ${to}`, 404, "NOT_FOUND");
    }

    sendSuccess(res, {
      fromCity: from,
      toCity: to,
      distanceKm: record.distanceKm,
      estimatedDriveHours: record.estimatedDriveHours,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /travel/cities
 * Get list of all cities in the distance matrix.
 * Public.
 */
router.get("/cities", async (_req, res, next) => {
  try {
    const records = await prisma.cityDistance.findMany({
      select: { fromCity: true, toCity: true },
    });

    const cities = [...new Set(records.flatMap((r) => [r.fromCity, r.toCity]))].sort();
    sendSuccess(res, { cities });
  } catch (err) {
    next(err);
  }
});

export default router;
