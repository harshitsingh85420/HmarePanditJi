import { FastifyReply } from "fastify";
import { AppError } from "../middleware/errorHandler";

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    details?: string | Record<string, unknown>;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

export function sendSuccess<T>(
  reply: FastifyReply,
  data: T,
  message = "Success",
  statusCode = 200,
  meta?: ApiResponse["meta"],
): void {
  const body: ApiResponse<T> = { success: true, data, message };
  if (meta) body.meta = meta;
  void reply.code(statusCode).send(body);
}

export function sendCreated<T>(
  reply: FastifyReply,
  data: T,
  message = "Created successfully",
): void {
  sendSuccess(reply, data, message, 201);
}

export function sendError(
  reply: FastifyReply,
  message: string,
  statusCode = 400,
  code = "BAD_REQUEST",
  details?: string | Record<string, unknown>,
): void {
  const body: ApiResponse = {
    success: false,
    message,
    error: { code, details },
  };
  void reply.code(statusCode).send(body);
}

/**
 * Fastify-compatible error creators (throw AppError instead of sending response)
 */
export function createError(
  message: string,
  statusCode = 400,
  code = "BAD_REQUEST",
  details?: string | Record<string, unknown>,
): never {
  throw new AppError(message, statusCode, code);
}

export function throwUnauthorized(
  message = "Unauthorized",
  code = "UNAUTHORIZED",
): never {
  throw new AppError(message, 401, code);
}

export function throwForbidden(
  message = "Forbidden",
  code = "FORBIDDEN",
): never {
  throw new AppError(message, 403, code);
}

/**
 * Legacy Express wrappers (for backward compatibility during migration)
 */
export function sendUnauthorized(
  reply: FastifyReply,
  message = "Unauthorized",
): void {
  sendError(reply, message, 401, "UNAUTHORIZED");
}

export function sendForbidden(
  reply: FastifyReply,
  message = "Forbidden",
): void {
  sendError(reply, message, 403, "FORBIDDEN");
}

export function sendNotFound(
  reply: FastifyReply,
  resource = "Resource",
): void {
  sendError(reply, `${resource} not found`, 404, "NOT_FOUND");
}

export function sendPaginated<T>(
  reply: FastifyReply,
  data: T[],
  total: number,
  page: number,
  limit: number,
  message = "Success",
): void {
  sendSuccess(reply, data, message, 200, {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  });
}
