import { FastifyInstance } from "fastify";
import {
  calculateTravel,
  getTravelDistance,
  getTravelCities,
  batchCalculateTravel,
} from "../controllers/travel.controller";

export default async function travelRoutes(fastify: FastifyInstance, _opts: any) {
  /** POST /travel/calculate — Calculate travel costs (single mode or all options) */
  fastify.post("/calculate", calculateTravel);

  /** POST /travel/batch-calculate — Calculate travel costs for multiple pandits */
  fastify.post("/batch-calculate", batchCalculateTravel);

  /** GET /travel/distance — Get distance between two cities */
  fastify.get("/distance", getTravelDistance);

  /** GET /travel/cities — List all cities in distance matrix */
  fastify.get("/cities", getTravelCities);
}
