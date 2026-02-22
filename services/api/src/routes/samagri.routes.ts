import { Router } from "express";
import {
    getSamagriCatalog,
    getPanditSamagriPackages,
    createSamagriPackage,
    updateSamagriPackage,
    deleteSamagriPackage,
    getMySamagriPackages,
} from "../controllers/samagri.controller";
import { authenticate } from "../middleware/auth";

const router: Router = Router();

/**
 * Public route - Get samagri catalog
 */
router.get("/samagri/catalog", getSamagriCatalog);

/**
 * Public route - Get samagri packages for a specific pandit
 * Used by customers to see what packages a pandit offers
 */
router.get("/pandits/:id/samagri-packages", getPanditSamagriPackages);

/**
 * Protected routes - Pandit managing their own packages
 * Requires authentication
 */
router.get("/pandits/me/samagri-packages", authenticate, getMySamagriPackages);
router.post("/pandits/me/samagri-packages", authenticate, createSamagriPackage);
router.put("/pandits/me/samagri-packages/:id", authenticate, updateSamagriPackage);
router.delete("/pandits/me/samagri-packages/:id", authenticate, deleteSamagriPackage);

export default router;
