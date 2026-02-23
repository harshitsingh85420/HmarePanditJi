import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { sendUnauthorized, sendForbidden } from "../utils/response";
import { Role } from "@hmarepanditji/db";

interface JwtPayload {
  id?: string;
  userId?: string;
  phone: string;
  role: Role;
  isVerified: boolean;
  name?: string;
}

export function authenticate(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    sendUnauthorized(res, "Missing or invalid Authorization header");
    return;
  }

  const token = authHeader.slice(7);

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    const resolvedUserId = payload.id || payload.userId;
    if (!resolvedUserId) {
      sendUnauthorized(res, "Invalid token payload");
      return;
    }
    req.user = {
      id: resolvedUserId,
      phone: payload.phone,
      role: payload.role,
      isVerified: payload.isVerified,
      name: payload.name,
    };
    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      sendUnauthorized(res, "Token expired");
    } else {
      sendUnauthorized(res, "Invalid token");
    }
  }
}

/** Spec alias — same as authenticate */
export const authenticateToken = authenticate;

/**
 * Middleware factory — restricts route to users whose role is in the allowed list.
 * Must be used AFTER authenticate() / authenticateToken().
 */
export function requireRole(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendUnauthorized(res);
      return;
    }
    if (!roles.includes(req.user.role)) {
      sendForbidden(
        res,
        `Insufficient permissions. Required roles: ${roles.join(", ")}`,
      );
      return;
    }
    next();
  };
}

/**
 * Optional authentication — same as authenticate but on failure just sets
 * req.user = undefined and calls next(). Never returns an error.
 * Guest mode depends on this.
 */
export function optionalAuth(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    next();
    return;
  }

  const token = authHeader.slice(7);

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    const resolvedUserId = payload.id || payload.userId;
    if (!resolvedUserId) {
      next();
      return;
    }
    req.user = {
      id: resolvedUserId,
      phone: payload.phone,
      role: payload.role,
      isVerified: payload.isVerified,
      name: payload.name,
    };
  } catch {
    // Token invalid or expired — continue as guest
  }

  next();
}
