import { Response } from "express";

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
  res: Response,
  data: T,
  message = "Success",
  statusCode = 200,
  meta?: ApiResponse["meta"],
): Response {
  const body: ApiResponse<T> = { success: true, data, message };
  if (meta) body.meta = meta;
  return res.status(statusCode).json(body);
}

export function sendCreated<T>(
  res: Response,
  data: T,
  message = "Created successfully",
): Response {
  return sendSuccess(res, data, message, 201);
}

export function sendError(
  res: Response,
  message: string,
  statusCode = 400,
  code = "BAD_REQUEST",
  details?: string | Record<string, unknown>,
): Response {
  const body: ApiResponse = {
    success: false,
    message,
    error: { code, details },
  };
  return res.status(statusCode).json(body);
}

export function sendUnauthorized(
  res: Response,
  message = "Unauthorized",
): Response {
  return sendError(res, message, 401, "UNAUTHORIZED");
}

export function sendForbidden(
  res: Response,
  message = "Forbidden",
): Response {
  return sendError(res, message, 403, "FORBIDDEN");
}

export function sendNotFound(
  res: Response,
  resource = "Resource",
): Response {
  return sendError(res, `${resource} not found`, 404, "NOT_FOUND");
}

export function sendPaginated<T>(
  res: Response,
  data: T[],
  total: number,
  page: number,
  limit: number,
  message = "Success",
): Response {
  return sendSuccess(res, data, message, 200, {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  });
}
