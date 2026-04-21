import { FastifyRequest, FastifyReply } from "fastify";
import { prisma } from "@hmarepanditji/db";
import fs from "fs";
import path from "path";

interface SamagriPackageBody {
    packageName: string;
    pujaType: string;
    fixedPrice: number;
    items: Array<{ itemName: string; quantity: string | number }>;
    isActive?: boolean;
}

// Use a simpler interface that doesn't conflict with FastifyRequest
interface AuthenticatedPanditRequest {
    user: {
        panditId: string;
    };
}

/**
 * GET /api/v1/pandits/:id/samagri-packages
 * Get all active samagri packages for a pandit (optionally filtered by puja type)
 */
export async function getPanditSamagriPackages(request: FastifyRequest, reply: FastifyReply) {
    const params = request.params as Record<string, string>;
    const query = request.query as Record<string, string | undefined>;
    const id = params.id;
    const pujaType = query.pujaType;

    try {
        const where: Record<string, unknown> = {
            panditProfileId: id,
            isActive: true,
        };

        if (pujaType) {
            where.pujaType = pujaType;
        }

        const packages = await prisma.samagriPackage.findMany({
            where,
            orderBy: { fixedPrice: "asc" },
        });

        return reply.send(packages);
    } catch (error) {
        console.error("Error fetching samagri packages:", error);
        return reply.code(500).send({ error: "Failed to fetch samagri packages" });
    }
}

/**
 * POST /api/v1/pandits/me/samagri-packages
 * Create a new samagri package (authenticated pandit only)
 */
export async function createSamagriPackage(request: FastifyRequest, reply: FastifyReply) {
    try {
        const authRequest = request as unknown as unknown as AuthenticatedPanditRequest;
        const panditId = authRequest.user?.panditId;

        if (!panditId) {
            return reply.code(401).send({ error: "Unauthorized - Pandit authentication required" });
        }

        const body = request.body as SamagriPackageBody;
        const { packageName, pujaType, fixedPrice, items } = body;

        // Validation
        if (!packageName || !pujaType || !fixedPrice || !items || !Array.isArray(items)) {
            return reply.code(400).send({
                error: "Missing required fields: packageName, pujaType, fixedPrice, items",
            });
        }

        if (!["Basic", "Standard", "Premium"].includes(packageName)) {
            return reply.code(400).send({
                error: "packageName must be one of: Basic, Standard, Premium",
            });
        }

        if (typeof fixedPrice !== "number" || fixedPrice <= 0) {
            return reply.code(400).send({ error: "fixedPrice must be a positive number" });
        }

        // Validate items structure
        for (const item of items) {
            if (!item.itemName || !item.quantity) {
                return reply.code(400).send({
                    error: "Each item must have itemName and quantity",
                });
            }
        }

        const packageTypeMapping: Record<string, "BASIC" | "STANDARD" | "PREMIUM"> = {
            Basic: "BASIC",
            Standard: "STANDARD",
            Premium: "PREMIUM",
        };

        const samagriPackage = await prisma.samagriPackage.create({
            data: {
                panditProfileId: panditId,
                packageName,
                pujaType,
                fixedPrice,
                items,
                isActive: true,
                packageType: packageTypeMapping[packageName] || "BASIC",
            },
        });

        return reply.code(201).send(samagriPackage);
    } catch (error) {
        console.error("Error creating samagri package:", error);
        return reply.code(500).send({ error: "Failed to create samagri package" });
    }
}

/**
 * PUT /api/v1/pandits/me/samagri-packages/:id
 * Update a samagri package (authenticated pandit only, own packages)
 */
export async function updateSamagriPackage(request: FastifyRequest, reply: FastifyReply) {
    try {
        const authRequest = request as unknown as AuthenticatedPanditRequest;
        const panditId = authRequest.user?.panditId;
        const params = request.params as Record<string, string>;
        const id = params.id;

        if (!panditId) {
            return reply.code(401).send({ error: "Unauthorized" });
        }

        // Check ownership
        const existing = await prisma.samagriPackage.findUnique({
            where: { id },
        });

        if (!existing) {
            return reply.code(404).send({ error: "Samagri package not found" });
        }

        if (existing.panditProfileId !== panditId) {
            return reply.code(403).send({ error: "Forbidden - Not your package" });
        }

        const body = request.body as Partial<SamagriPackageBody>;
        const { packageName, pujaType, fixedPrice, items, isActive } = body;

        const updateData: Record<string, unknown> = {};

        if (packageName !== undefined) {
            if (!["Basic", "Standard", "Premium"].includes(packageName)) {
                return reply.code(400).send({
                    error: "packageName must be one of: Basic, Standard, Premium",
                });
            }
            updateData.packageName = packageName;
        }

        if (pujaType !== undefined) updateData.pujaType = pujaType;
        if (fixedPrice !== undefined) {
            if (typeof fixedPrice !== "number" || fixedPrice <= 0) {
                return reply.code(400).send({ error: "fixedPrice must be a positive number" });
            }
            updateData.fixedPrice = fixedPrice;
        }
        if (items !== undefined) {
            if (!Array.isArray(items)) {
                return reply.code(400).send({ error: "items must be an array" });
            }
            updateData.items = items;
        }
        if (isActive !== undefined) updateData.isActive = isActive;

        const updated = await prisma.samagriPackage.update({
            where: { id },
            data: updateData,
        });

        return reply.send(updated);
    } catch (error) {
        console.error("Error updating samagri package:", error);
        return reply.code(500).send({ error: "Failed to update samagri package" });
    }
}

/**
 * DELETE /api/v1/pandits/me/samagri-packages/:id
 * Delete a samagri package (soft delete - set isActive = false)
 */
export async function deleteSamagriPackage(request: FastifyRequest, reply: FastifyReply) {
    try {
        const authRequest = request as unknown as AuthenticatedPanditRequest;
        const panditId = authRequest.user?.panditId;
        const params = request.params as Record<string, string>;
        const id = params.id;

        if (!panditId) {
            return reply.code(401).send({ error: "Unauthorized" });
        }

        // Check ownership
        const existing = await prisma.samagriPackage.findUnique({
            where: { id },
        });

        if (!existing) {
            return reply.code(404).send({ error: "Samagri package not found" });
        }

        if (existing.panditProfileId !== panditId) {
            return reply.code(403).send({ error: "Forbidden - Not your package" });
        }

        // Soft delete (set isActive = false)
        const deleted = await prisma.samagriPackage.update({
            where: { id },
            data: { isActive: false },
        });

        return reply.send({ message: "Samagri package deleted successfully", package: deleted });
    } catch (error) {
        console.error("Error deleting samagri package:", error);
        return reply.code(500).send({ error: "Failed to delete samagri package" });
    }
}

/**
 * GET /api/v1/pandits/me/samagri-packages
 * Get all samagri packages for the authenticated pandit (including inactive)
 */
export async function getMySamagriPackages(request: FastifyRequest, reply: FastifyReply) {
    try {
        const authRequest = request as unknown as AuthenticatedPanditRequest;
        const panditId = authRequest.user?.panditId;

        if (!panditId) {
            return reply.code(401).send({ error: "Unauthorized" });
        }

        const packages = await prisma.samagriPackage.findMany({
            where: { panditProfileId: panditId },
            orderBy: [{ pujaType: "asc" }, { fixedPrice: "asc" }],
        });

        return reply.send(packages);
    } catch (error) {
        console.error("Error fetching my samagri packages:", error);
        return reply.code(500).send({ error: "Failed to fetch samagri packages" });
    }
}

/**
 * GET /api/v1/samagri/catalog
 * Get samagri catalog based on puja type
 */
export async function getSamagriCatalog(request: FastifyRequest, reply: FastifyReply) {
    try {
        // Basic implementation reading from local JSON
        const catalogPath = path.join(__dirname, "../data/samagri-catalog.json");
        const data = fs.readFileSync(catalogPath, "utf-8");
        const catalog: unknown = JSON.parse(data);

        // Here we could filter by pujaType if the catalog supported it,
        // for Phase 1 we return the general catalog
        return reply.send(catalog);
    } catch (error) {
        console.error("Error fetching samagri catalog:", error);
        return reply.code(500).send({ error: "Failed to fetch samagri catalog" });
    }
}
