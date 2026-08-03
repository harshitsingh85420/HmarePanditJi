import { FastifyRequest, FastifyReply } from "fastify";
import { prisma } from "@hmarepanditji/db";
import fs from "fs";
import path from "path";

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
            panditId: id,
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

// createSamagriPackage / updateSamagriPackage / deleteSamagriPackage lived
// here — the second write family's handlers, NEVER ROUTED anywhere
// (samagri.routes imports only the two reads). KILLED with the
// /pandits/me/samagri-packages write routes (R-S6, ruled 2026-08-03):
// the tier-shaped writer in auth.controller (saveSamagriPackages) is THE
// ONE write path — single-implementation law.

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
            where: { panditId },
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
/* F-J4-12 · RULED 2026-08-01 (Isj) — THE CATALOG IS IMPORTED, NOT READ.
   ─────────────────────────────────────────────────────────────────────
   This did:
       const catalogPath = path.join(__dirname, "../data/samagri-catalog.json");
       const data = fs.readFileSync(catalogPath, "utf-8");
   The file exists at services/api/src/data/samagri-catalog.json — and the
   build is a bare `tsc`, which does NOT copy .json into outDir for files it
   only sees at runtime. So dist/data/ never existed and this endpoint
   returned 500 on EVERY call in production, permanently. It is why the
   customer-facing सामग्री surface had no honest data source at all.

   BUILD OUTPUT IS NOT THE SOURCE TREE — third member of that family, after
   the stale dist and the deleted 308 shim's premise. Code that reaches for
   a file at runtime is making a claim about the DEPLOYED layout, and
   nothing type-checks that claim.

   The narrow fix, using what the build already supports: `resolveJsonModule`
   is already enabled, so a static import makes the JSON a MODULE — tsc emits
   it into dist as part of compilation, and the runtime file read (and its
   whole failure mode) disappears. No copy step, no cross-platform shell,
   no change to the build command. */
import samagriCatalog from "../data/samagri-catalog.json";

export async function getSamagriCatalog(request: FastifyRequest, reply: FastifyReply) {
    // No try/catch around a constant: there is nothing left that can throw.
    // A 500 here would have been a lie about the catalogue's existence.
    return reply.send(samagriCatalog);
}
