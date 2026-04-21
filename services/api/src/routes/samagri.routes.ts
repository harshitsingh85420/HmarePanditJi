import { FastifyInstance } from "fastify";
import {
    getSamagriCatalog,
    getPanditSamagriPackages,
    createSamagriPackage,
    updateSamagriPackage,
    deleteSamagriPackage,
    getMySamagriPackages,
} from "../controllers/samagri.controller";
import { authenticate } from "../middleware/auth";

export default async function samagriRoutes(fastify: FastifyInstance, _opts: any) {
    /**
     * Public route - Get samagri catalog
     */
    fastify.get("/samagri/catalog", getSamagriCatalog);

    /**
     * Public route - Get samagri packages for a specific pandit
     * Used by customers to see what packages a pandit offers
     */
    fastify.get("/pandits/:id/samagri-packages", getPanditSamagriPackages);

    /**
     * Protected routes - Pandit managing their own packages
     * Requires authentication
     */
    fastify.get("/pandits/me/samagri-packages", { preHandler: [authenticate] }, getMySamagriPackages);
    fastify.post("/pandits/me/samagri-packages", { preHandler: [authenticate] }, createSamagriPackage);
    fastify.put("/pandits/me/samagri-packages/:id", { preHandler: [authenticate] }, updateSamagriPackage);
    fastify.delete("/pandits/me/samagri-packages/:id", { preHandler: [authenticate] }, deleteSamagriPackage);
}
