import { Router } from "express";
import { prisma } from "@hmarepanditji/db";
import { sendSuccess } from "../utils/response";
import { AppError } from "../middleware/errorHandler";

const router: Router = Router();

/**
 * GET /rituals
 * Public list of all active rituals.
 * Query: { category?, isActive? }
 */
router.get("/", async (req, res, next) => {
  try {
    const { category, isActive } = req.query as {
      category?: string;
      isActive?: string;
    };

    const where: Record<string, unknown> = {};

    // Filter by category if provided
    if (category) where.category = category;

    // Default to active only; allow ?isActive=false to fetch inactive (admin use)
    where.isActive = isActive === "false" ? false : true;

    const rituals = await prisma.ritual.findMany({
      where,
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        nameHindi: true,
        description: true,
        descriptionHindi: true,
        category: true,
        basePriceMin: true,
        basePriceMax: true,
        durationHours: true,
        isActive: true,
        iconUrl: true,
      },
    });

    sendSuccess(res, rituals);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /rituals/:id
 * Public ritual detail
 */
router.get("/:id", async (req, res, next) => {
  try {
    const ritual = await prisma.ritual.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        name: true,
        nameHindi: true,
        description: true,
        descriptionHindi: true,
        category: true,
        basePriceMin: true,
        basePriceMax: true,
        durationHours: true,
        isActive: true,
        iconUrl: true,
        createdAt: true,
      },
    });

    if (!ritual) throw new AppError("Ritual not found", 404, "NOT_FOUND");
    sendSuccess(res, ritual);
  } catch (err) {
    next(err);
  }
});

export default router;
