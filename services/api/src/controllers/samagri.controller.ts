import { Request, Response } from "express";
import { prisma } from "@hmarepanditji/db";

/**
 * GET /api/v1/pandits/:id/samagri-packages
 * Get all active samagri packages for a pandit (optionally filtered by puja type)
 */
export async function getPanditSamagriPackages(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const { pujaType } = req.query;

        const where: any = {
            panditId: id,
            isActive: true,
        };

        if (pujaType) {
            where.pujaType = pujaType as string;
        }

        const packages = await prisma.samagriPackage.findMany({
            where,
            orderBy: { fixedPrice: "asc" },
        });

        res.json(packages);
    } catch (error) {
        console.error("Error fetching samagri packages:", error);
        res.status(500).json({ error: "Failed to fetch samagri packages" });
    }
}

/**
 * POST /api/v1/pandits/me/samagri-packages
 * Create a new samagri package (authenticated pandit only)
 */
export async function createSamagriPackage(req: Request, res: Response) {
    try {
        const panditId = (req as any).user?.panditId;

        if (!panditId) {
            return res.status(401).json({ error: "Unauthorized - Pandit authentication required" });
        }

        const { packageName, pujaType, fixedPrice, items } = req.body;

        // Validation
        if (!packageName || !pujaType || !fixedPrice || !items || !Array.isArray(items)) {
            return res.status(400).json({
                error: "Missing required fields: packageName, pujaType, fixedPrice, items",
            });
        }

        if (!["Basic", "Standard", "Premium"].includes(packageName)) {
            return res.status(400).json({
                error: "packageName must be one of: Basic, Standard, Premium",
            });
        }

        if (typeof fixedPrice !== "number" || fixedPrice <= 0) {
            return res.status(400).json({ error: "fixedPrice must be a positive number" });
        }

        // Validate items structure
        for (const item of items) {
            if (!item.itemName || !item.quantity) {
                return res.status(400).json({
                    error: "Each item must have itemName and quantity",
                });
            }
        }

        const samagriPackage = await prisma.samagriPackage.create({
            data: {
                panditId,
                packageName,
                pujaType,
                fixedPrice,
                items,
                isActive: true,
            },
        });

        res.status(201).json(samagriPackage);
    } catch (error) {
        console.error("Error creating samagri package:", error);
        res.status(500).json({ error: "Failed to create samagri package" });
    }
}

/**
 * PUT /api/v1/pandits/me/samagri-packages/:id
 * Update a samagri package (authenticated pandit only, own packages)
 */
export async function updateSamagriPackage(req: Request, res: Response) {
    try {
        const panditId = (req as any).user?.panditId;
        const { id } = req.params;

        if (!panditId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        // Check ownership
        const existing = await prisma.samagriPackage.findUnique({
            where: { id },
        });

        if (!existing) {
            return res.status(404).json({ error: "Samagri package not found" });
        }

        if (existing.panditId !== panditId) {
            return res.status(403).json({ error: "Forbidden - Not your package" });
        }

        const { packageName, pujaType, fixedPrice, items, isActive } = req.body;

        const updateData: any = {};

        if (packageName !== undefined) {
            if (!["Basic", "Standard", "Premium"].includes(packageName)) {
                return res.status(400).json({
                    error: "packageName must be one of: Basic, Standard, Premium",
                });
            }
            updateData.packageName = packageName;
        }

        if (pujaType !== undefined) updateData.pujaType = pujaType;
        if (fixedPrice !== undefined) {
            if (typeof fixedPrice !== "number" || fixedPrice <= 0) {
                return res.status(400).json({ error: "fixedPrice must be a positive number" });
            }
            updateData.fixedPrice = fixedPrice;
        }
        if (items !== undefined) {
            if (!Array.isArray(items)) {
                return res.status(400).json({ error: "items must be an array" });
            }
            updateData.items = items;
        }
        if (isActive !== undefined) updateData.isActive = isActive;

        const updated = await prisma.samagriPackage.update({
            where: { id },
            data: updateData,
        });

        res.json(updated);
    } catch (error) {
        console.error("Error updating samagri package:", error);
        res.status(500).json({ error: "Failed to update samagri package" });
    }
}

/**
 * DELETE /api/v1/pandits/me/samagri-packages/:id
 * Delete a samagri package (soft delete - set isActive = false)
 */
export async function deleteSamagriPackage(req: Request, res: Response) {
    try {
        const panditId = (req as any).user?.panditId;
        const { id } = req.params;

        if (!panditId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        // Check ownership
        const existing = await prisma.samagriPackage.findUnique({
            where: { id },
        });

        if (!existing) {
            return res.status(404).json({ error: "Samagri package not found" });
        }

        if (existing.panditId !== panditId) {
            return res.status(403).json({ error: "Forbidden - Not your package" });
        }

        // Soft delete (set isActive = false)
        const deleted = await prisma.samagriPackage.update({
            where: { id },
            data: { isActive: false },
        });

        res.json({ message: "Samagri package deleted successfully", package: deleted });
    } catch (error) {
        console.error("Error deleting samagri package:", error);
        res.status(500).json({ error: "Failed to delete samagri package" });
    }
}

/**
 * GET /api/v1/pandits/me/samagri-packages
 * Get all samagri packages for the authenticated pandit (including inactive)
 */
export async function getMySamagriPackages(req: Request, res: Response) {
    try {
        const panditId = (req as any).user?.panditId;

        if (!panditId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const packages = await prisma.samagriPackage.findMany({
            where: { panditId },
            orderBy: [{ pujaType: "asc" }, { fixedPrice: "asc" }],
        });

        res.json(packages);
    } catch (error) {
        console.error("Error fetching my samagri packages:", error);
        res.status(500).json({ error: "Failed to fetch samagri packages" });
    }
}
