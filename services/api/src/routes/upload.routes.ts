import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { authenticate } from "../middleware/auth";
import { roleGuard } from "../middleware/roleGuard";
import { handleUpload } from "../controllers/upload.controller";

export default async function uploadRoutes(fastify: FastifyInstance, _opts: any) {
    const preHandlers = [authenticate, roleGuard("PANDIT")];
    fastify.post("/:type", { preHandler: preHandlers }, handleUpload);
    fastify.post("/", { preHandler: preHandlers }, handleUpload);
}
