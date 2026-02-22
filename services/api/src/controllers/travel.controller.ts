import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { sendSuccess } from "../utils/response";
import { AppError } from "../middleware/errorHandler";
import {
  getDistance,
  getCities,
  calculateAllOptions,
  calculateForMode,
  type TravelModeType,
  type FoodArrangementType,
} from "../services/travel.service";

// Simple in-memory cache for travel calculations
const travelCache = new Map<string, { data: any; expiry: number }>();

const calculateSchema = z.object({
  fromCity: z.string().min(1),
  toCity: z.string().min(1),
  travelMode: z.enum(["SELF_DRIVE", "TRAIN", "FLIGHT", "CAB", "BUS"]).optional(),
  eventDays: z.number().int().min(1).default(1),
  foodArrangement: z.enum(["CUSTOMER_PROVIDES", "PLATFORM_ALLOWANCE"]).default("CUSTOMER_PROVIDES"),
});

/**
 * POST /travel/calculate
 * Calculate travel cost. If travelMode specified, calculate that mode only.
 * Otherwise, calculate all available options.
 */
export async function calculateTravel(req: Request, res: Response, next: NextFunction) {
  try {
    const body = calculateSchema.parse(req.body);

    const distance = await getDistance(body.fromCity, body.toCity);
    if (!distance) {
      throw new AppError(
        `Distance not found between ${body.fromCity} and ${body.toCity}`,
        404,
        "NOT_FOUND",
      );
    }

    if (body.travelMode) {
      const calc = calculateForMode(
        body.travelMode as TravelModeType,
        distance.distanceKm,
        body.eventDays,
        body.foodArrangement as FoodArrangementType,
      );
      sendSuccess(res, {
        distanceKm: distance.distanceKm,
        estimatedDriveHours: distance.estimatedDriveHours,
        options: [calc],
      });
    } else {
      const result = await calculateAllOptions({
        fromCity: body.fromCity,
        toCity: body.toCity,
        eventDays: body.eventDays,
        foodArrangement: body.foodArrangement as FoodArrangementType,
      });
      sendSuccess(res, result);
    }
  } catch (err) {
    next(err);
  }
}

const batchCalculateSchema = z.object({
  requests: z.array(z.object({
    fromCity: z.string().min(1),
    toCity: z.string().min(1),
    panditId: z.string().min(1),
  })).max(20),
  eventDays: z.number().int().min(1).default(1),
  foodArrangement: z.enum(["CUSTOMER_PROVIDES", "PLATFORM_ALLOWANCE"]).default("CUSTOMER_PROVIDES"),
});

/**
 * POST /travel/batch-calculate
 */
export async function batchCalculateTravel(req: Request, res: Response, next: NextFunction) {
  try {
    const body = batchCalculateSchema.parse(req.body);
    const results: Record<string, any> = {};

    await Promise.all(body.requests.map(async (request) => {
      const cacheKey = `travel:${request.fromCity}:${request.toCity}:${body.eventDays}:${body.foodArrangement}`;

      const cached = travelCache.get(cacheKey);
      if (cached && cached.expiry > Date.now()) {
        results[request.panditId] = cached.data;
        return;
      }

      try {
        const options = await calculateAllOptions({
          fromCity: request.fromCity,
          toCity: request.toCity,
          eventDays: body.eventDays,
          foodArrangement: body.foodArrangement as FoodArrangementType,
        });

        // Cache for 30 min
        travelCache.set(cacheKey, {
          data: options.options,
          expiry: Date.now() + 30 * 60 * 1000
        });

        results[request.panditId] = options.options;
      } catch (err) {
        // Distance not found or error calculating, just return empty array
        results[request.panditId] = [];
      }
    }));

    sendSuccess(res, { results });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /travel/distance?from=Delhi&to=Varanasi
 */
export async function getTravelDistance(req: Request, res: Response, next: NextFunction) {
  try {
    const { from, to } = req.query as { from?: string; to?: string };
    if (!from || !to) {
      throw new AppError("Query params 'from' and 'to' are required", 400, "VALIDATION_ERROR");
    }

    const result = await getDistance(from, to);
    if (!result) {
      throw new AppError(`Distance not found between ${from} and ${to}`, 404, "NOT_FOUND");
    }

    sendSuccess(res, {
      fromCity: from,
      toCity: to,
      distanceKm: result.distanceKm,
      estimatedDriveHours: result.estimatedDriveHours,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /travel/cities
 */
export async function getTravelCities(_req: Request, res: Response, next: NextFunction) {
  try {
    const cities = await getCities();
    sendSuccess(res, { cities });
  } catch (err) {
    next(err);
  }
}
