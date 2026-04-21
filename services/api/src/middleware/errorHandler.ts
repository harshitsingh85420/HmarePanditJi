import { FastifyRequest, FastifyReply } from "fastify";
import { ZodError } from "zod";
import { logger } from "../utils/logger";

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code: string = "INTERNAL_ERROR",
  ) {
    super(message);
    this.name = "AppError";
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Fastify error handler — catches AppError, ZodError, and generic errors
 */
export async function errorHandler(
  error: Error,
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  // Zod validation errors
  if (error instanceof ZodError) {
    return reply.code(422).send({
      success: false,
      message: "Validation failed",
      error: {
        code: "VALIDATION_ERROR",
        details: error.flatten().fieldErrors,
      },
    });
  }

  // Known application errors
  if (error instanceof AppError) {
    return reply.code(error.statusCode).send({
      success: false,
      message: error.message,
      error: { code: error.code },
    });
  }

  // Unexpected errors
  logger.error("Unhandled error", { message: error.message, stack: error.stack });

  const statusCode = (error as any).statusCode || 500;
  return reply.code(statusCode).send({
    success: false,
    message: error.message || "Internal Server Error",
    error: { code: "INTERNAL_ERROR" },
  });
}

/**
 * Fastify 404 handler
 */
export async function notFoundHandler(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  return reply.code(404).send({
    success: false,
    message: "Route not found",
    error: { code: "NOT_FOUND" },
  });
}
