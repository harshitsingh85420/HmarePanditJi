import { FastifyInstance } from "fastify";
import {
  getMuhuratDates,
  getPujasForDate,
  getSuggestedMuhurat,
  getUpcomingMuhurat,
} from "../controllers/muhurat.controller";

export default async function muhuratRoutes(fastify: FastifyInstance, _opts: any) {
  /** GET /muhurat/dates — auspicious dates by month/year or date range */
  fastify.get("/dates", getMuhuratDates);

  /** GET /muhurat/pujas-for-date — all pujas on a specific date */
  fastify.get("/pujas-for-date", getPujasForDate);

  /** GET /muhurat/suggest — top upcoming muhurat dates for a puja type */
  fastify.get("/suggest", getSuggestedMuhurat);

  /** GET /muhurat/upcoming — next N muhurat dates from today */
  fastify.get("/upcoming", getUpcomingMuhurat);
}
