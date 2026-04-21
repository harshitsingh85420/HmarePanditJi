import { FastifyInstance } from "fastify";
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

export default async function onboardingRoutes(fastify: FastifyInstance, _opts: any) {
    const authPreHandler = [authenticate, roleGuard("PANDIT")];

    fastify.post("/step1", { preHandler: authPreHandler }, onboardingStep1);
    fastify.post("/step2", { preHandler: authPreHandler }, onboardingStep2);
    fastify.post("/step3", { preHandler: authPreHandler }, onboardingStep3);
    fastify.post("/step4", { preHandler: authPreHandler }, onboardingStep4);
    fastify.post("/step5", { preHandler: authPreHandler }, onboardingStep5);
    fastify.post("/complete", { preHandler: authPreHandler }, onboardingComplete);
}
