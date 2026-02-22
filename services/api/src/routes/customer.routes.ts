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

const updateAddressSchema = z.object({
  label: z.string().optional(),
  fullAddress: z.string().optional(),
  landmark: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().regex(/^\d{6}$/, "Invalid pincode").optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  isDefault: z.boolean().optional(),
});

const updateFamilySchema = z.object({
  gotra: z.string().optional(),
  kulDevata: z.string().optional().nullable(),
  familyMembers: z.array(z.object({
    id: z.string().optional(),
    name: z.string(),
    relation: z.string(),
    dob: z.string().optional().nullable(),
    nakshatra: z.string().optional().nullable(),
    rashi: z.string().optional().nullable()
  })).optional()
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
router.put(
  "/me/addresses/:addressId",
  roleGuard("CUSTOMER"),
  validate(updateAddressSchema),
  async (req, res, next) => {
    try {
      const customerProfile = await prisma.customerProfile.findUnique({ where: { userId: req.user!.id } });
      if (!customerProfile) throw new AppError("Customer profile not found", 404, "NOT_FOUND");

      const data = req.body as z.infer<typeof updateAddressSchema>;

      if (data.isDefault) {
        await prisma.address.updateMany({
          where: { customerProfileId: customerProfile.id, isDefault: true },
          data: { isDefault: false },
        });
      }

      await prisma.address.updateMany({
        where: { id: req.params.addressId, customerProfileId: customerProfile.id },
        data,
      });

      sendSuccess(res, null, "Address updated successfully");
    } catch (err) {
      next(err);
    }
  }
);

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
      include: {
        pandit: {
          select: {
            id: true,
            name: true,
            isVerified: true,
            panditProfile: {
              select: {
                profilePhotoUrl: true,
                rating: true,
                totalReviews: true,
                location: true,
                specializations: true,
                experienceYears: true,
                verificationStatus: true
              }
            }
          }
        }
      }
    });

    sendSuccess(res, favorites);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /customers/me/favorites
 * Add a pandit to favorites.
 */
router.post("/me/favorites", roleGuard("CUSTOMER"), async (req, res, next) => {
  try {
    const { panditId } = req.body;
    const customerId = req.user!.id;

    const existing = await prisma.favoritePandit.findUnique({
      where: {
        customerId_panditId: { customerId, panditId }
      }
    });

    if (!existing) {
      await prisma.favoritePandit.create({
        data: { customerId, panditId }
      });
    }

    sendSuccess(res, { isFavorited: true });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /customers/me/favorites/:panditId
 * Remove a pandit from favorites
 */
router.delete("/me/favorites/:panditId", roleGuard("CUSTOMER"), async (req, res, next) => {
  try {
    const panditId = req.params.panditId;
    const customerId = req.user!.id;

    await prisma.favoritePandit.deleteMany({
      where: { customerId, panditId }
    });

    sendSuccess(res, { isFavorited: false });
  } catch (err) {
    next(err);
  }
});

// ─── Family & Gotra ─────────────────────────────────────────────────────────

/**
 * GET /customers/me/family
 */
router.get("/me/family", roleGuard("CUSTOMER"), async (req, res, next) => {
  try {
    const customerProfile = await prisma.customerProfile.findUnique({ where: { userId: req.user!.id } });
    const members = await prisma.familyMember.findMany({ where: { userId: req.user!.id } });
    sendSuccess(res, {
      gotra: customerProfile?.gotra || null,
      familyMembers: members
    });
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /customers/me/family
 */
router.put("/me/family", roleGuard("CUSTOMER"), validate(updateFamilySchema), async (req, res, next) => {
  try {
    const { gotra, familyMembers } = req.body;
    if (gotra !== undefined) {
      await prisma.customerProfile.upsert({
        where: { userId: req.user!.id },
        create: { userId: req.user!.id, gotra },
        update: { gotra }
      });
    }

    if (familyMembers) {
      await prisma.familyMember.deleteMany({
        where: { userId: req.user!.id }
      });
      if (familyMembers.length > 0) {
        await prisma.familyMember.createMany({
          data: familyMembers.map((m: any) => ({
            userId: req.user!.id,
            name: m.name,
            relation: m.relation,
            dob: m.dob ? new Date(m.dob) : null,
            nakshatra: m.nakshatra || null,
            rashi: m.rashi || null,
          }))
        });
      }
    }

    sendSuccess(res, null, "Family info updated successfully");
  } catch (err) {
    next(err);
  }
});

export default router;
