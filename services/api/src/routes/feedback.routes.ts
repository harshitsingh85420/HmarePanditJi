import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { prisma } from "@hmarepanditji/db";
import { validate } from "../middleware/validator";
import { sendSuccess } from "../utils/response";

const unansweredSchema = z.object({
  text: z.string().min(1).max(300),
  route: z.string().max(100).optional().default(""),
});

/**
 * S6d — शिष्य brain-miss telemetry. Deliberately UNAUTHENTICATED:
 * entry-flow questions arrive before login. Abuse surface is bounded by
 * the per-route rate limit + the 300-char cap; rows are write-only from
 * the app (curation happens in admin tooling later).
 */
export default async function feedbackRoutes(fastify: FastifyInstance, _opts: unknown) {
  fastify.post(
    "/unanswered",
    {
      preHandler: [validate(unansweredSchema)],
      config: {
        rateLimit: {
          max: 20,
          timeWindow: 60000,
          keyGenerator: (req: FastifyRequest) => req.ip || "0.0.0.0",
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { text, route } = request.body as z.infer<typeof unansweredSchema>;
      await prisma.feedbackUnanswered.create({ data: { text, route } });
      return sendSuccess(reply, { recorded: true }, "recorded", 201);
    },
  );
}
