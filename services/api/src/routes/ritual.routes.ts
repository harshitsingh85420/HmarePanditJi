import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { prisma } from "@hmarepanditji/db";
import { sendSuccess } from "../utils/response";
import { AppError } from "../middleware/errorHandler";

export default async function ritualRoutes(fastify: FastifyInstance, _opts: any) {
  /**
   * GET /rituals
   * Public list of all active rituals.
   * Query: { category?, isActive? }
   */
  fastify.get("/", async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const req = request as any;
      const res = reply;
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
      throw err;
    }
  });

  /**
   * GET /rituals/:id
   * Public ritual detail
   */
  fastify.get("/:id", async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const req = request as any;
      const res = reply;
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
      throw err;
    }
  });
}
