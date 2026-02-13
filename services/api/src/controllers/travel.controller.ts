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
