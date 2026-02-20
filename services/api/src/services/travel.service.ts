import { prisma } from "@hmarepanditji/db";
import {
  SELF_DRIVE_RATE_PER_KM,
  FOOD_ALLOWANCE_PER_DAY,
  TRAVEL_SERVICE_FEE_PERCENT,
  GST_PERCENT,
} from "../config/constants";

// ── Types ────────────────────────────────────────────────────────────────────

export type TravelModeType = "SELF_DRIVE" | "TRAIN" | "FLIGHT" | "CAB" | "BUS";
export type FoodArrangementType = "CUSTOMER_PROVIDES" | "PLATFORM_ALLOWANCE";

export interface TravelCalculation {
  mode: TravelModeType;
  distanceKm: number;
  roundTripKm: number;
  baseFare: number;
  localCabCost: number;
  travelDays: number;
  foodAllowanceDays: number;
  foodAllowance: number;
  totalTravelCost: number;
  travelServiceFee: number;
  travelServiceFeeGst: number;
  grandTravelTotal: number;
  estimatedHours: number;
  bestFor: string;
  breakdown: { label: string; amount: number }[];
}

export interface DistanceResult {
  distanceKm: number;
  estimatedDriveHours: number;
}

export interface CalculateAllParams {
  fromCity: string;
  toCity: string;
  eventDays?: number;
  foodArrangement?: FoodArrangementType;
  panditPreferredModes?: TravelModeType[];
  panditMaxDistanceKm?: number;
}

// ── Fare tables ──────────────────────────────────────────────────────────────

const TRAIN_FARES: { maxKm: number; fare: number }[] = [
  { maxKm: 200, fare: 1200 },
  { maxKm: 500, fare: 1800 },
  { maxKm: 1000, fare: 2500 },
  { maxKm: Infinity, fare: 3500 },
];

const FLIGHT_FARES: { maxKm: number; fare: number }[] = [
  { maxKm: 500, fare: 3500 },
  { maxKm: 1000, fare: 4500 },
  { maxKm: 2000, fare: 6000 },
  { maxKm: Infinity, fare: 8000 },
];

function lookupFare(table: typeof TRAIN_FARES, distanceKm: number): number {
  const entry = table.find((t) => distanceKm <= t.maxKm);
  return entry?.fare ?? table[table.length - 1].fare;
}

// ── Feasibility checks ──────────────────────────────────────────────────────

function isModeFeasible(mode: TravelModeType, distanceKm: number): boolean {
  switch (mode) {
    case "SELF_DRIVE":
      return distanceKm <= 2000;
    case "CAB":
      return distanceKm <= 300;
    case "BUS":
      return distanceKm <= 1500;
    case "FLIGHT":
      return distanceKm >= 200;
    case "TRAIN":
      return true;
    default:
      return false;
  }
}

// ── Service functions ────────────────────────────────────────────────────────

function addFeesAndBreakdown(
  mode: TravelModeType,
  distanceKm: number,
  baseFare: number,
  localCabCost: number,
  travelDays: number,
  foodAllowanceDays: number,
  foodAllowance: number,
  estimatedHours: number,
  bestFor: string,
): TravelCalculation {
  const totalTravelCost = baseFare + localCabCost + foodAllowance;
  const travelServiceFee = Math.round(totalTravelCost * (TRAVEL_SERVICE_FEE_PERCENT / 100));
  const travelServiceFeeGst = Math.round(travelServiceFee * (GST_PERCENT / 100));
  const grandTravelTotal = totalTravelCost + travelServiceFee + travelServiceFeeGst;
  const roundTripKm = distanceKm * 2;

  const breakdown: { label: string; amount: number }[] = [
    { label: `Base fare (${mode.replace("_", " ").toLowerCase()})`, amount: baseFare },
  ];
  if (localCabCost > 0) breakdown.push({ label: "Local cab transfers", amount: localCabCost });
  if (foodAllowance > 0) breakdown.push({ label: `Food allowance (${foodAllowanceDays} days × ₹${FOOD_ALLOWANCE_PER_DAY.toLocaleString("en-IN")})`, amount: foodAllowance });
  breakdown.push({ label: `Travel service fee (${TRAVEL_SERVICE_FEE_PERCENT}%)`, amount: travelServiceFee });
  breakdown.push({ label: `GST on travel fee (${GST_PERCENT}%)`, amount: travelServiceFeeGst });

  return {
    mode,
    distanceKm,
    roundTripKm,
    baseFare,
    localCabCost,
    travelDays,
    foodAllowanceDays,
    foodAllowance,
    totalTravelCost,
    travelServiceFee,
    travelServiceFeeGst,
    grandTravelTotal,
    estimatedHours,
    bestFor,
    breakdown,
  };
}

export function calculateSelfDrive(
  distanceKm: number,
  eventDays: number,
  foodArrangement: FoodArrangementType,
): TravelCalculation {
  const roundTripKm = distanceKm * 2;
  const drivingCost = Math.round(roundTripKm * SELF_DRIVE_RATE_PER_KM);
  const travelDays = Math.ceil(distanceKm / 400) * 2;
  const foodAllowanceDays = travelDays + (foodArrangement === "PLATFORM_ALLOWANCE" ? eventDays : 0);
  const foodAllowance = foodAllowanceDays * FOOD_ALLOWANCE_PER_DAY;
  const estimatedHours = Math.round((distanceKm / 60) * 10) / 10;

  return addFeesAndBreakdown(
    "SELF_DRIVE", distanceKm, drivingCost, 0, travelDays,
    foodAllowanceDays, foodAllowance, estimatedHours,
    "Multi-day events, carrying samagri",
  );
}

export function calculateTrain(
  distanceKm: number,
  eventDays: number,
  foodArrangement: FoodArrangementType,
): TravelCalculation {
  const trainFare = lookupFare(TRAIN_FARES, distanceKm) * 2;
  const localCabCost = 1600;
  const travelDays = 2;
  const foodAllowanceDays = travelDays + (foodArrangement === "PLATFORM_ALLOWANCE" ? eventDays : 0);
  const foodAllowance = foodAllowanceDays * FOOD_ALLOWANCE_PER_DAY;
  const estimatedHours = Math.round((distanceKm / 65) * 10) / 10;

  return addFeesAndBreakdown(
    "TRAIN", distanceKm, trainFare, localCabCost, travelDays,
    foodAllowanceDays, foodAllowance, estimatedHours,
    "Budget-conscious, single-day events",
  );
}

export function calculateFlight(
  distanceKm: number,
  eventDays: number,
  foodArrangement: FoodArrangementType,
): TravelCalculation {
  const flightFare = lookupFare(FLIGHT_FARES, distanceKm) * 2;
  const localCabCost = 2400;
  const travelDays = 1;
  const foodAllowanceDays = travelDays + (foodArrangement === "PLATFORM_ALLOWANCE" ? eventDays : 0);
  const foodAllowance = foodAllowanceDays * FOOD_ALLOWANCE_PER_DAY;
  const estimatedHours = Math.round((distanceKm / 700 + 1.5) * 10) / 10;

  return addFeesAndBreakdown(
    "FLIGHT", distanceKm, flightFare, localCabCost, travelDays,
    foodAllowanceDays, foodAllowance, estimatedHours,
    "Urgent bookings, premium customers",
  );
}

export function calculateCab(
  distanceKm: number,
  eventDays: number,
  foodArrangement: FoodArrangementType,
): TravelCalculation {
  const cabFare = Math.round(distanceKm * 15 * 2);
  const travelDays = 1;
  const foodAllowanceDays = travelDays + (foodArrangement === "PLATFORM_ALLOWANCE" ? eventDays : 0);
  const foodAllowance = foodAllowanceDays * FOOD_ALLOWANCE_PER_DAY;
  const estimatedHours = Math.round((distanceKm / 50) * 10) / 10;

  return addFeesAndBreakdown(
    "CAB", distanceKm, cabFare, 0, travelDays,
    foodAllowanceDays, foodAllowance, estimatedHours,
    "Short distances, convenience",
  );
}

export function calculateBus(
  distanceKm: number,
  eventDays: number,
  foodArrangement: FoodArrangementType,
): TravelCalculation {
  const busFare = Math.round(distanceKm * 1.5 * 2);
  const localCabCost = 1200;
  const travelDays = 2;
  const foodAllowanceDays = travelDays + (foodArrangement === "PLATFORM_ALLOWANCE" ? eventDays : 0);
  const foodAllowance = foodAllowanceDays * FOOD_ALLOWANCE_PER_DAY;
  const estimatedHours = Math.round((distanceKm / 45) * 10) / 10;

  return addFeesAndBreakdown(
    "BUS", distanceKm, busFare, localCabCost, travelDays,
    foodAllowanceDays, foodAllowance, estimatedHours,
    "Budget option for shorter routes",
  );
}

// ── Calculator map ──────────────────────────────────────────────────────────

const CALCULATORS: Record<TravelModeType, typeof calculateSelfDrive> = {
  SELF_DRIVE: calculateSelfDrive,
  TRAIN: calculateTrain,
  FLIGHT: calculateFlight,
  CAB: calculateCab,
  BUS: calculateBus,
};

export function calculateForMode(
  mode: TravelModeType,
  distanceKm: number,
  eventDays: number,
  foodArrangement: FoodArrangementType,
): TravelCalculation {
  return CALCULATORS[mode](distanceKm, eventDays, foodArrangement);
}

// ── Database queries ────────────────────────────────────────────────────────

export async function getDistance(
  fromCity: string,
  toCity: string,
): Promise<DistanceResult | null> {
  const record = await prisma.cityDistance.findFirst({
    where: {
      OR: [
        { fromCity, toCity },
        { fromCity: toCity, toCity: fromCity },
      ],
    },
  });

  if (!record) return null;

  return {
    distanceKm: record.distanceKm,
    estimatedDriveHours: record.estimatedDriveHours ?? Math.round((record.distanceKm / 60) * 10) / 10,
  };
}

export async function getCities(): Promise<string[]> {
  const records = await prisma.cityDistance.findMany({
    select: { fromCity: true, toCity: true },
  });
  return [...new Set(records.flatMap((r) => [r.fromCity, r.toCity]))].sort();
}

export async function calculateAllOptions(
  params: CalculateAllParams,
): Promise<{ distanceKm: number; estimatedDriveHours: number; options: TravelCalculation[] }> {
  const distance = await getDistance(params.fromCity, params.toCity);
  if (!distance) {
    return { distanceKm: 0, estimatedDriveHours: 0, options: [] };
  }

  const eventDays = params.eventDays ?? 1;
  const foodArrangement = params.foodArrangement ?? "CUSTOMER_PROVIDES";
  const maxKm = params.panditMaxDistanceKm ?? Infinity;
  const preferredModes = params.panditPreferredModes ??
    (["SELF_DRIVE", "TRAIN", "FLIGHT", "CAB"] as TravelModeType[]);

  if (distance.distanceKm > maxKm) {
    return { ...distance, options: [] };
  }

  const options: TravelCalculation[] = [];

  for (const mode of preferredModes) {
    if (!isModeFeasible(mode, distance.distanceKm)) continue;
    const calc = calculateForMode(mode, distance.distanceKm, eventDays, foodArrangement);
    options.push(calc);
  }

  options.sort((a, b) => a.grandTravelTotal - b.grandTravelTotal);

  return { ...distance, options };
}

// ─── Local Travel Calculation (Prompt 12) ─────────────────────────────────────

export type LocalTravelMode = "2-wheeler" | "4-wheeler" | "public_transport";

export function calculateTravelCosts(distance: number, mode: LocalTravelMode): { estimatedCost: number; durationMinutes: number } {
  let cost = 0;
  let speedKmH = 20; // Default city speed

  switch (mode) {
    case "2-wheeler":
      cost = Math.max(50, 15 * distance);
      speedKmH = 30;
      break;
    case "4-wheeler":
      cost = Math.max(200, 30 * distance);
      speedKmH = 25;
      break;
    case "public_transport":
      cost = 5 + 2 * distance;
      speedKmH = 15; // Slow due to stops
      break;
  }

  // Round to nearest 10
  const estimatedCost = Math.ceil(cost / 10) * 10;

  // Duration
  const durationMinutes = Math.round((distance / speedKmH) * 60);

  return { estimatedCost, durationMinutes };
}
