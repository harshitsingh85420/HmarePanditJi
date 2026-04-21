import { FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { AppError } from "../middleware/errorHandler";
import {
  getDistance,
  getCities,
  calculateAllOptions,
  calculateForMode,
  type TravelModeType,
  type FoodArrangementType,
  type TravelCalculation,
  type DistanceResult,
} from "../services/travel.service";

// Simple in-memory cache for travel calculations with size limit
const MAX_CACHE_SIZE = 500;
const travelCache = new Map<string, { data: TravelCalculation[]; expiry: number }>();

function cleanupExpiredCache() {
  const now = Date.now();
  for (const [key, entry] of travelCache.entries()) {
    if (entry.expiry <= now) {
      travelCache.delete(key);
    }
  }
}

function setTravelCache(key: string, value: { data: TravelCalculation[]; expiry: number }) {
  // Evict expired entries first
  cleanupExpiredCache();
  // If still at capacity, evict oldest (first inserted)
  if (travelCache.size >= MAX_CACHE_SIZE) {
    const oldestKey = travelCache.keys().next().value;
    if (oldestKey !== undefined) {
      travelCache.delete(oldestKey);
    }
  }
  travelCache.set(key, value);
}

interface SuccessResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

function successBody<T>(data: T): SuccessResponse<T> {
  return { success: true, data, message: "Success" };
}

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
export async function calculateTravel(request: FastifyRequest, reply: FastifyReply) {
  try {
    const body = calculateSchema.parse(request.body);

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
      return reply.send(successBody({
        distanceKm: distance.distanceKm,
        estimatedDriveHours: distance.estimatedDriveHours,
        options: [calc],
      }));
    } else {
      const result = await calculateAllOptions({
        fromCity: body.fromCity,
        toCity: body.toCity,
        eventDays: body.eventDays,
        foodArrangement: body.foodArrangement as FoodArrangementType,
      });
      return reply.send(successBody(result));
    }
  } catch (err) {
    throw err;
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
export async function batchCalculateTravel(request: FastifyRequest, reply: FastifyReply) {
  try {
    const body = batchCalculateSchema.parse(request.body);
    const results: Record<string, TravelCalculation[]> = {};

    await Promise.all(body.requests.map(async (requestItem) => {
      const cacheKey = `travel:${requestItem.fromCity}:${requestItem.toCity}:${body.eventDays}:${body.foodArrangement}`;

      const cached = travelCache.get(cacheKey);
      if (cached && cached.expiry > Date.now()) {
        results[requestItem.panditId] = cached.data;
        return;
      }

      try {
        const options = await calculateAllOptions({
          fromCity: requestItem.fromCity,
          toCity: requestItem.toCity,
          eventDays: body.eventDays,
          foodArrangement: body.foodArrangement as FoodArrangementType,
        });

        // Cache for 30 min (bounded by MAX_CACHE_SIZE)
        setTravelCache(cacheKey, {
          data: options.options,
          expiry: Date.now() + 30 * 60 * 1000
        });

        results[requestItem.panditId] = options.options;
      } catch (err) {
        // Distance not found or error calculating, just return empty array
        results[requestItem.panditId] = [];
      }
    }));

    return reply.send(successBody({ results }));
  } catch (err) {
    throw err;
  }
}

/**
 * GET /travel/distance?from=Delhi&to=Varanasi
 */
export async function getTravelDistance(request: FastifyRequest, reply: FastifyReply) {
  try {
    const query = request.query as Record<string, string | undefined>;
    const from = query.from;
    const to = query.to;
    if (!from || !to) {
      throw new AppError("Query params 'from' and 'to' are required", 400, "VALIDATION_ERROR");
    }

    const result = await getDistance(from, to);
    if (!result) {
      throw new AppError(`Distance not found between ${from} and ${to}`, 404, "NOT_FOUND");
    }

    return reply.send(successBody({
      fromCity: from,
      toCity: to,
      distanceKm: result.distanceKm,
      estimatedDriveHours: result.estimatedDriveHours,
    }));
  } catch (err) {
    throw err;
  }
}

/**
 * GET /travel/cities
 */
export async function getTravelCities(_request: FastifyRequest, reply: FastifyReply) {
  try {
    const cities = await getCities();
    return reply.send(successBody({ cities }));
  } catch (err) {
    throw err;
  }
}
