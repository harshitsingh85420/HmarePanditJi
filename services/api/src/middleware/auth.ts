import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { sendUnauthorized } from "../utils/response";
import { UserRole } from "@hmarepanditji/db";

interface JwtPayload {
  id: string;
  phone: string;
  role: UserRole;
  isPhoneVerified: boolean;
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
    req.user = {
      id: payload.id,
      phone: payload.phone,
      role: payload.role,
      isPhoneVerified: payload.isPhoneVerified,
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

/**
 * Optional authentication — same as authenticate but doesn't fail.
 * Attaches user to req if a valid token is present, otherwise continues as guest.
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
    req.user = {
      id: payload.id,
      phone: payload.phone,
      role: payload.role,
      isPhoneVerified: payload.isPhoneVerified,
    };
  } catch {
    // Token invalid or expired — continue as guest
  }

  next();
}
