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
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
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
    const customer = await prisma.customer.findUnique({
      where: { userId: req.user!.id },
      include: {
        user: {
          select: {
            id: true,
            phone: true,
            email: true,
            name: true,
            avatarUrl: true,
            preferredLanguage: true,
            profileCompleted: true,
            createdAt: true,
          },
        },
        addresses: { orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }] },
      },
    });

    if (!customer) throw new AppError("Customer profile not found", 404, "NOT_FOUND");
    sendSuccess(res, customer);
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /customers/me
 * Update the authenticated customer's profile
 * Body: { name?, email?, gotra?, gender? }
 */
router.put(
  "/me",
  roleGuard("CUSTOMER"),
  validate(updateCustomerSchema),
  async (req, res, next) => {
    try {
      const { name, email, gotra, gender } = req.body as z.infer<
        typeof updateCustomerSchema
      >;

      // Update User fields (name, email) + profileCompleted flag
      const userUpdate: Record<string, unknown> = {};
      if (name !== undefined) { userUpdate.name = name; userUpdate.profileCompleted = true; }
      if (email !== undefined) userUpdate.email = email;

      const [user, customer] = await prisma.$transaction([
        prisma.user.update({ where: { id: req.user!.id }, data: userUpdate }),
        prisma.customer.upsert({
          where: { userId: req.user!.id },
          create: {
            userId: req.user!.id,
            gotra: gotra,
            gender: gender,
          },
          update: {
            ...(gotra !== undefined && { gotra }),
            ...(gender !== undefined && { gender }),
          },
        }),
      ]);

      sendSuccess(res, { ...customer, user }, "Profile updated successfully");
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
    const customer = await prisma.customer.findUnique({ where: { userId: req.user!.id } });
    if (!customer) throw new AppError("Customer profile not found", 404, "NOT_FOUND");

    const addresses = await prisma.address.findMany({
      where: { customerId: customer.id },
      orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
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
      const customer = await prisma.customer.findUnique({ where: { userId: req.user!.id } });
      if (!customer) throw new AppError("Customer profile not found", 404, "NOT_FOUND");

      const data = req.body as z.infer<typeof addAddressSchema>;

      // If new address is default, demote all existing default addresses
      if (data.isDefault) {
        await prisma.address.updateMany({
          where: { customerId: customer.id, isDefault: true },
          data: { isDefault: false },
        });
      }

      const address = await prisma.address.create({
        data: { ...data, customerId: customer.id },
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
    const customer = await prisma.customer.findUnique({ where: { userId: req.user!.id } });
    if (!customer) throw new AppError("Customer profile not found", 404, "NOT_FOUND");

    const address = await prisma.address.findFirst({
      where: { id: req.params.addressId, customerId: customer.id },
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
router.get("/me/favorites", roleGuard("CUSTOMER"), async (_req, res) => {
  res.status(501).json({ success: true, message: "Not implemented yet", endpoint: "GET /customers/me/favorites" });
});

/**
 * POST /customers/me/favorites
 * Add a pandit to favorites.
 * Body: { panditId }
 */
router.post("/me/favorites", roleGuard("CUSTOMER"), async (_req, res) => {
  res.status(501).json({ success: true, message: "Not implemented yet", endpoint: "POST /customers/me/favorites" });
});

/**
 * DELETE /customers/me/favorites/:panditId
 * Remove a pandit from favorites.
 */
router.delete("/me/favorites/:panditId", roleGuard("CUSTOMER"), async (_req, res) => {
  res.status(501).json({ success: true, message: "Not implemented yet", endpoint: "DELETE /customers/me/favorites/:panditId" });
});

export default router;
