import { Router } from "express";
import {
  calculateTravel,
  getTravelDistance,
  getTravelCities,
} from "../controllers/travel.controller";

const router = Router();

/** POST /travel/calculate — Calculate travel costs (single mode or all options) */
router.post("/calculate", calculateTravel);

/** GET /travel/distance — Get distance between two cities */
router.get("/distance", getTravelDistance);

/** GET /travel/cities — List all cities in distance matrix */
router.get("/cities", getTravelCities);

export default router;
