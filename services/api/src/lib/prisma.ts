/**
 * Prisma client singleton — re-exports from the shared @hmarepanditji/db package.
 *
 * Usage:
 *   import { prisma } from "../lib/prisma";
 *
 * The actual singleton lives in packages/db/src/index.ts.
 * This file provides a convenient local import path for the API service.
 */
export { prisma, PrismaClient } from "@hmarepanditji/db";
export type { Prisma } from "@hmarepanditji/db";
