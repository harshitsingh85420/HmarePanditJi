import { FastifyRequest, FastifyReply } from "fastify";

declare module "fastify" {
  interface FastifyRequest {
    user: UserPayload | null;
  }
}

export interface UserPayload {
  id: string;
  userId: string;
  phone: string;
  role: string;
  name: string;
  isVerified: boolean;
}

export type FastifyHandler = (
  request: FastifyRequest,
  reply: FastifyReply,
) => Promise<void | unknown>;

export type FastifyMiddleware = (
  request: FastifyRequest,
  reply: FastifyReply,
) => Promise<void>;
