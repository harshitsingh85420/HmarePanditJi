import { FastifyRequest, FastifyReply } from "fastify";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { throwUnauthorized, throwForbidden } from "../utils/response";

export type Role = "CUSTOMER" | "PANDIT" | "ADMIN";

export interface JwtPayload {
  id?: string;
  userId?: string;
  phone: string;
  role: Role;
  isVerified: boolean;
  name?: string;
}

export interface UserPayload {
  id: string;
  phone: string;
  role: Role;
  isVerified: boolean;
  name?: string;
}

// Extend FastifyRequest to include user
declare module "fastify" {
  interface FastifyRequest {
    user: UserPayload | null;
  }
}

/**
 * Fastify authentication hook - returns user payload or throws
 */
export async function authenticate(
  request: FastifyRequest,
  _reply: FastifyReply,
): Promise<void> {
  const authHeader = request.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    throwUnauthorized("Missing or invalid Authorization header");
  }

  const token = authHeader.slice(7);

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    const resolvedUserId = payload.id || payload.userId;
    if (!resolvedUserId) {
      throwUnauthorized("Invalid token payload");
    }
    request.user = {
      id: resolvedUserId,
      phone: payload.phone,
      role: payload.role,
      isVerified: payload.isVerified,
      name: payload.name,
    };
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      throwUnauthorized("Token expired");
    } else {
      throwUnauthorized("Invalid token");
    }
  }
}

/**
 * Spec alias — same as authenticate
 */
export const authenticateToken = authenticate;

/**
 * Optional authentication — fails silently for guest mode
 */
export async function optionalAuth(
  request: FastifyRequest,
  _reply: FastifyReply,
): Promise<void> {
  const authHeader = request.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    request.user = null;
    return;
  }

  const token = authHeader.slice(7);

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    const resolvedUserId = payload.id || payload.userId;
    if (!resolvedUserId) {
      request.user = null;
      return;
    }
    request.user = {
      id: resolvedUserId,
      phone: payload.phone,
      role: payload.role,
      isVerified: payload.isVerified,
      name: payload.name,
    };
  } catch {
    // Token invalid or expired — continue as guest
    request.user = null;
  }
}
