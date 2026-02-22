import { Router } from "express";
import { z } from "zod";
import { prisma } from "@hmarepanditji/db";
import { authenticate } from "../middleware/auth";
import { roleGuard } from "../middleware/roleGuard";
import { validate } from "../middleware/validator";
import { sendSuccess } from "../utils/response";
import { AppError } from "../middleware/errorHandler";

const router: Router = Router();

// All customer routes require authentication
router.use(authenticate);

// ─── Validation schemas ───────────────────────────────────────────────────────

const updateCustomerSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  email: z.string().email().optional().nullable(),
  gotra: z.string().max(100).optional(),
  preferredLanguages: z.array(z.string()).optional(),
});

const addAddressSchema = z.object({
  label: z.string().default("Home"),
  fullAddress: z.string().min(5, "Address is required"),
  landmark: z.string().optional(),
  city: z.string().min(2),
  state: z.string().min(2).default("Delhi"),
  pincode: z.string().regex(/^\d{6}$/, "Invalid pincode"),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  isDefault: z.boolean().optional(),
});

// ─── Routes ───────────────────────────────────────────────────────────────────

/**
 * GET /customers/me
 * Get the authenticated customer's profile (with addresses)
 */
router.get("/me", roleGuard("CUSTOMER"), async (req, res, next) => {
  try {
    const customerProfile = await prisma.customerProfile.findUnique({
      where: { userId: req.user!.id },
      include: {
        user: {
          select: {
            id: true,
            phone: true,
            email: true,
            name: true,
            role: true,
            isVerified: true,
            createdAt: true,
          },
        },
        addresses: { orderBy: { isDefault: "desc" } },
      },
    });

    if (!customerProfile) throw new AppError("Customer profile not found", 404, "NOT_FOUND");
    sendSuccess(res, customerProfile);
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /customers/me
 * Update the authenticated customer's profile
 * Body: { name?, email?, gotra?, preferredLanguages? }
 */
router.put(
  "/me",
  roleGuard("CUSTOMER"),
  validate(updateCustomerSchema),
  async (req, res, next) => {
    try {
      const { name, email, gotra, preferredLanguages } = req.body as z.infer<
        typeof updateCustomerSchema
      >;

      // Update User fields (name, email)
      const userUpdate: Record<string, unknown> = {};
      if (name !== undefined) userUpdate.name = name;
      if (email !== undefined) userUpdate.email = email;

      const profileUpdate: Record<string, unknown> = {};
      if (gotra !== undefined) profileUpdate.gotra = gotra;
      if (preferredLanguages !== undefined) profileUpdate.preferredLanguages = preferredLanguages;

      const [user, customerProfile] = await prisma.$transaction([
        prisma.user.update({ where: { id: req.user!.id }, data: userUpdate }),
        prisma.customerProfile.upsert({
          where: { userId: req.user!.id },
          create: {
            userId: req.user!.id,
            ...(gotra !== undefined && { gotra }),
            ...(preferredLanguages !== undefined && { preferredLanguages }),
          },
          update: profileUpdate,
        }),
      ]);

      sendSuccess(res, { ...customerProfile, user }, "Profile updated successfully");
    } catch (err) {
      next(err);
    }
  },
);

/**
 * GET /customers/me/addresses
 * List all saved addresses (default first)
 */
router.get("/me/addresses", roleGuard("CUSTOMER"), async (req, res, next) => {
  try {
    const customerProfile = await prisma.customerProfile.findUnique({ where: { userId: req.user!.id } });
    if (!customerProfile) throw new AppError("Customer profile not found", 404, "NOT_FOUND");

    const addresses = await prisma.address.findMany({
      where: { customerProfileId: customerProfile.id },
      orderBy: { isDefault: "desc" },
    });

    sendSuccess(res, addresses);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /customers/me/addresses
 * Add a new address. If isDefault=true, demote all others first.
 * Body: { label, fullAddress, landmark?, city, state, pincode, isDefault? }
 */
router.post(
  "/me/addresses",
  roleGuard("CUSTOMER"),
  validate(addAddressSchema),
  async (req, res, next) => {
    try {
      const customerProfile = await prisma.customerProfile.findUnique({ where: { userId: req.user!.id } });
      if (!customerProfile) throw new AppError("Customer profile not found", 404, "NOT_FOUND");

      const data = req.body as z.infer<typeof addAddressSchema>;

      // If new address is default, demote all existing default addresses
      if (data.isDefault) {
        await prisma.address.updateMany({
          where: { customerProfileId: customerProfile.id, isDefault: true },
          data: { isDefault: false },
        });
      }

      const address = await prisma.address.create({
        data: { ...data, customerProfileId: customerProfile.id },
      });

      sendSuccess(res, address, "Address added successfully", 201);
    } catch (err) {
      next(err);
    }
  },
);

/**
 * PUT /customers/me/addresses/:addressId
 * Update an existing address.
 */
router.put("/me/addresses/:addressId", roleGuard("CUSTOMER"), async (_req, res) => {
  res.status(501).json({ success: true, message: "Not implemented yet", endpoint: "PUT /customers/me/addresses/:addressId" });
});

/**
 * DELETE /customers/me/addresses/:addressId
 * Delete a saved address (only own addresses)
 */
router.delete("/me/addresses/:addressId", roleGuard("CUSTOMER"), async (req, res, next) => {
  try {
    const customerProfile = await prisma.customerProfile.findUnique({ where: { userId: req.user!.id } });
    if (!customerProfile) throw new AppError("Customer profile not found", 404, "NOT_FOUND");

    const address = await prisma.address.findFirst({
      where: { id: req.params.addressId, customerProfileId: customerProfile.id },
    });
    if (!address) throw new AppError("Address not found", 404, "NOT_FOUND");

    await prisma.address.delete({ where: { id: address.id } });
    sendSuccess(res, null, "Address deleted successfully");
  } catch (err) {
    next(err);
  }
});

// ─── Favorites ───────────────────────────────────────────────────────────────

/**
 * GET /customers/me/favorites
 * Get customer's favorite pandits.
 */
router.get("/me/favorites", roleGuard("CUSTOMER"), async (req, res, next) => {
  try {
    const favorites = await prisma.favoritePandit.findMany({
      where: { customerId: req.user!.id },
      select: { panditId: true }
    });

    const favoriteIds = favorites.map((f) => f.panditId);
    sendSuccess(res, favoriteIds);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /customers/me/favorites/:panditId
 * Toggle a pandit in favorites.
 */
router.post("/me/favorites/:panditId", roleGuard("CUSTOMER"), async (req, res, next) => {
  try {
    const panditId = req.params.panditId;
    const customerId = req.user!.id;

    const existing = await prisma.favoritePandit.findUnique({
      where: {
        customerId_panditId: { customerId, panditId }
      }
    });

    if (existing) {
      await prisma.favoritePandit.delete({
        where: { id: existing.id }
      });
      sendSuccess(res, { isFavorited: false });
    } else {
      await prisma.favoritePandit.create({
        data: { customerId, panditId }
      });
      sendSuccess(res, { isFavorited: true });
    }
  } catch (err) {
    next(err);
  }
});

export default router;
