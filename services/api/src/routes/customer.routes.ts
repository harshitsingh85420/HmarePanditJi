import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { roleGuard } from "../middleware/roleGuard";
import { sendSuccess } from "../utils/response";

const router = Router();

// All customer routes require authentication
router.use(authenticate);

/**
 * GET /customers/me
 * Get the authenticated customer's profile
 */
router.get("/me", roleGuard("CUSTOMER"), (_req, res) => {
  sendSuccess(res, null, "Customer profile (stub — sprint 3)");
});

/**
 * PUT /customers/me
 * Update the authenticated customer's profile
 * Body: { fullName?, gotra?, dateOfBirth?, gender? }
 */
router.put("/me", roleGuard("CUSTOMER"), (_req, res) => {
  sendSuccess(res, null, "Customer profile updated (stub)");
});

/**
 * GET /customers/me/addresses
 * List all saved addresses
 */
router.get("/me/addresses", roleGuard("CUSTOMER"), (_req, res) => {
  sendSuccess(res, [], "Customer addresses (stub)");
});

/**
 * POST /customers/me/addresses
 * Add a new address
 * Body: { label, addressLine1, city, state, postalCode, isPrimary? }
 */
router.post("/me/addresses", roleGuard("CUSTOMER"), (_req, res) => {
  sendSuccess(res, null, "Address added (stub)", 201);
});

/**
 * DELETE /customers/me/addresses/:addressId
 * Delete a saved address
 */
router.delete("/me/addresses/:addressId", roleGuard("CUSTOMER"), (_req, res) => {
  sendSuccess(res, null, "Address deleted (stub)");
});

export default router;
