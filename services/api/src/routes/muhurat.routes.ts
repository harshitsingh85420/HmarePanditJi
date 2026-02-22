import { Router } from "express";
import {
  getMuhuratDates,
  getPujasForDate,
  getSuggestedMuhurat,
  getUpcomingMuhurat,
} from "../controllers/muhurat.controller";

const router: Router = Router();

/** GET /muhurat/dates — auspicious dates by month/year or date range */
router.get("/dates", getMuhuratDates);

/** GET /muhurat/pujas-for-date — all pujas on a specific date */
router.get("/pujas-for-date", getPujasForDate);

/** GET /muhurat/suggest — top upcoming muhurat dates for a puja type */
router.get("/suggest", getSuggestedMuhurat);

/** GET /muhurat/upcoming — next N muhurat dates from today */
router.get("/upcoming", getUpcomingMuhurat);

export default router;
