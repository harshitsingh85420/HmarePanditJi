import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { roleGuard } from "../middleware/roleGuard";
import {
    onboardingStep1,
    onboardingStep2,
    onboardingStep3,
    onboardingStep4,
    onboardingStep5,
    onboardingComplete
} from "../controllers/onboarding.controller";

const router: Router = Router();

router.use(authenticate, roleGuard("PANDIT"));

router.post("/step1", onboardingStep1);
router.post("/step2", onboardingStep2);
router.post("/step3", onboardingStep3);
router.post("/step4", onboardingStep4);
router.post("/step5", onboardingStep5);
router.post("/complete", onboardingComplete);

export default router;
