import { FastifyRequest, FastifyReply } from "fastify";
import { throwForbidden, throwUnauthorized } from "../utils/response";

type Role = "CUSTOMER" | "PANDIT" | "ADMIN";

/**
 * Fastify preHandler hook factory — restricts route to users whose role is in the allowed list.
 * Must be used AFTER authenticate().
 *
 * @example
 *   fastify.get("/admin/stats", { preHandler: [authenticate, requireRole("ADMIN")] }, handler)
 *   fastify.patch("/pandits/me", { preHandler: [authenticate, requireRole("PANDIT")] }, handler)
 */
export function requireRole(...roles: Role[]) {
  return async (request: FastifyRequest, _reply: FastifyReply): Promise<void> => {
    const req = request as any;
    if (!req.user) {
      throwUnauthorized();
    }

    if (!roles.includes(req.user.role)) {
      throwForbidden(
        `This action requires one of the following roles: ${roles.join(", ")}`,
      );
    }
  };
}

/**
 * Alias for backward compatibility with route imports
 */
export const roleGuard = requireRole;
