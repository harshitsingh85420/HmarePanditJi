import { FastifyInstance } from "fastify";
import {
    getSamagriCatalog,
    getMySamagriPackages,
} from "../controllers/samagri.controller";
import { authenticate } from "../middleware/auth";

export default async function samagriRoutes(fastify: FastifyInstance, _opts: any) {
    /**
     * Public route - Get samagri catalog
     */
    fastify.get("/samagri/catalog", getSamagriCatalog);

    // GET /pandits/:id/samagri-packages and POST/PUT/DELETE /pandits/me/samagri-packages
    // are owned by pandit.routes.ts (registered at prefix /pandits); duplicating them
    // here crashed Fastify with FST_ERR_DUPLICATED_ROUTE.
    fastify.get("/pandits/me/samagri-packages", { preHandler: [authenticate] }, getMySamagriPackages);
}
