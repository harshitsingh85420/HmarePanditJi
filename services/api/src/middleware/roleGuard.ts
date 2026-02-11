import { Request, Response, NextFunction } from "express";
import { UserRole } from "@hmarepanditji/db";
import { sendForbidden, sendUnauthorized } from "../utils/response";

/**
 * Middleware factory — restricts route to users whose role is in the allowed list.
 * Must be used AFTER authenticate().
 *
 * @example
 *   router.get("/admin/stats", authenticate, roleGuard("ADMIN"), handler)
 *   router.patch("/pandits/me", authenticate, roleGuard("PANDIT"), handler)
 *   router.post("/bookings", authenticate, roleGuard("CUSTOMER", "ADMIN"), handler)
 */
export function roleGuard(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendUnauthorized(res);
      return;
    }

    if (!roles.includes(req.user.role)) {
      sendForbidden(
        res,
        `This action requires one of the following roles: ${roles.join(", ")}`,
      );
      return;
    }

    next();
  };
}
