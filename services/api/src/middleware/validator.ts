import { FastifyRequest, FastifyReply } from "fastify";
import { ZodSchema, ZodError } from "zod";

type ValidateTarget = "body" | "query" | "params";

/**
 * Fastify preHandler hook factory — validates request body/query/params against a Zod schema.
 * On failure, throws ZodError which is caught by errorHandler.
 *
 * @example
 *   fastify.post("/auth/request-otp", { preHandler: validate(requestOtpSchema) }, handler)
 *   fastify.get("/pandits", { preHandler: validate(listPanditsSchema, "query") }, handler)
 */
export function validate(schema: ZodSchema, target: ValidateTarget = "body") {
  return async (request: FastifyRequest, _reply: FastifyReply): Promise<void> => {
    try {
      const parsed = schema.parse(request[target]);
      // Replace raw input with the parsed (coerced + stripped) value
      (request as any)[target] = parsed;
    } catch (err) {
      if (err instanceof ZodError) {
        throw err;
      }
      throw err;
    }
  };
}
