import { Router } from "express";
import {
  calculateTravel,
  getTravelDistance,
  getTravelCities,
  batchCalculateTravel,
} from "../controllers/travel.controller";

const router: Router = Router();

/** POST /travel/calculate — Calculate travel costs (single mode or all options) */
router.post("/calculate", calculateTravel);

/** POST /travel/batch-calculate — Calculate travel costs for multiple pandits */
router.post("/batch-calculate", batchCalculateTravel);

/** GET /travel/distance — Get distance between two cities */
router.get("/distance", getTravelDistance);

/** GET /travel/cities — List all cities in distance matrix */
router.get("/cities", getTravelCities);

export default router;
