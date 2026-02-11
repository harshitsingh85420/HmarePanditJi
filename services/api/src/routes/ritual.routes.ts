import { Router } from "express";
import { sendSuccess } from "../utils/response";

const router = Router();

/**
 * GET /rituals
 * Public list of all active rituals.
 * Query: { category?, isActive? }
 */
router.get("/", (_req, res) => {
  sendSuccess(res, [], "Rituals list (stub — sprint 4)");
});

/**
 * GET /rituals/:id
 * Public ritual detail
 */
router.get("/:id", (req, res) => {
  sendSuccess(res, { id: req.params.id }, "Ritual detail (stub)");
});

export default router;
