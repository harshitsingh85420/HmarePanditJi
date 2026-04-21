import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { authenticate } from "../middleware/auth";
import { roleGuard } from "../middleware/roleGuard";
import { handleUpload } from "../controllers/upload.controller";

export default async function uploadRoutes(fastify: FastifyInstance, _opts: any) {
    fastify.post("/:type", {
        preHandler: [
            authenticate,
            roleGuard("PANDIT"),
        ],
    }, handleUpload);
}
