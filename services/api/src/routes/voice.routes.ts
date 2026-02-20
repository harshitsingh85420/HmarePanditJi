/**
 * HmarePanditJi — Voice-First Registration Routes
 *
 * Handles the multi-step pandit registration with voice guidance.
 * Every step returns a Bhashini voice prompt.
 */

import { Router } from "express";
import { z } from "zod";
import { authenticate } from "../middleware/auth";
import { roleGuard } from "../middleware/roleGuard";
import { validate } from "../middleware/validator";
import { sendSuccess } from "../utils/response";
import { getRegistrationVoicePrompt, textToSpeech, speechToText } from "../services/bhashini.service";
import { submitAadhaar, submitVideoKYC } from "../services/kyc.service";
import { prisma } from "@hmarepanditji/db";
import { logger } from "../utils/logger";

const router: Router = Router();

// ── Schemas ───────────────────────────────────────────────────────────────────

const stepSchema = z.object({
    step: z.string().min(1),
    language: z.enum(["hi", "en"]).optional().default("hi"),
});

const profileStepSchema = z.object({
    displayName: z.string().min(2).max(100),
    experienceYears: z.number().int().min(0).max(100),
    specializations: z.array(z.string()).min(1),
    languages: z.array(z.string()).min(1),
    city: z.string().min(2),
    state: z.string().min(2),
    sect: z.string().optional(),
    gotra: z.string().optional(),
    bio: z.string().max(500).optional(),
});

const aadhaarStepSchema = z.object({
    aadhaarNumber: z.string().regex(/^\d{12}$/, "Aadhaar must be 12 digits"),
});

const bankStepSchema = z.object({
    bankAccountName: z.string().min(2),
    bankAccountNumber: z.string().min(8).max(18),
    bankIfscCode: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Invalid IFSC code"),
});

const videoKycSchema = z.object({
    videoUrl: z.string().url("Valid video URL required"),
});

const voiceInputSchema = z.object({
    audioBase64: z.string().min(1, "Audio content required"),
    language: z.enum(["hi", "en"]).optional().default("hi"),
});

const ttsSchema = z.object({
    text: z.string().min(1).max(5000),
    language: z.enum(["hi", "en", "bn", "ta", "te", "mr"]).optional().default("hi"),
});

// ── Routes ────────────────────────────────────────────────────────────────────

/**
 * GET /voice/prompt/:step
 * Get voice prompt for a registration step (Bhashini TTS).
 */
router.get("/prompt/:step", async (req, res, next) => {
    try {
        const { step } = req.params;
        const language = (req.query.language as string) || "hi";
        const result = await getRegistrationVoicePrompt(step, language);
        sendSuccess(res, result, `Voice prompt for step: ${step}`);
    } catch (err) {
        next(err);
    }
});

/**
 * POST /voice/tts
 * Convert arbitrary text to speech (for screen reader / voice button).
 * Master Rule #9: Every Pandit app screen has a voice button.
 */
router.post("/tts", validate(ttsSchema), async (req, res, next) => {
    try {
        const { text, language } = req.body as z.infer<typeof ttsSchema>;
        const audio = await textToSpeech(text, language);
        sendSuccess(res, { audio, text, language }, "Text-to-speech generated");
    } catch (err) {
        next(err);
    }
});

/**
 * POST /voice/stt
 * Convert speech audio to text (Bhashini STT).
 */
router.post("/stt", validate(voiceInputSchema), async (req, res, next) => {
    try {
        const { audioBase64, language } = req.body as z.infer<typeof voiceInputSchema>;
        const transcript = await speechToText(audioBase64, language);
        sendSuccess(res, { transcript, language }, "Speech-to-text completed");
    } catch (err) {
        next(err);
    }
});

/**
 * POST /voice/register/profile
 * Step: Submit pandit profile details.
 */
router.post(
    "/register/profile",
    authenticate,
    roleGuard("PANDIT"),
    validate(profileStepSchema),
    async (req, res, next) => {
        try {
            const data = req.body as z.infer<typeof profileStepSchema>;
            const userId = req.user!.id;

            // Upsert pandit profile
            const pandit = await prisma.pandit.upsert({
                where: { userId },
                create: {
                    userId,
                    displayName: data.displayName,
                    experienceYears: data.experienceYears,
                    specializations: data.specializations,
                    languages: data.languages,
                    city: data.city,
                    state: data.state,
                    location: data.city,
                    sect: data.sect,
                    gotra: data.gotra,
                    bio: data.bio,
                },
                update: {
                    displayName: data.displayName,
                    experienceYears: data.experienceYears,
                    specializations: data.specializations,
                    languages: data.languages,
                    city: data.city,
                    state: data.state,
                    location: data.city,
                    sect: data.sect,
                    gotra: data.gotra,
                    bio: data.bio,
                },
            });

            // Get next step voice prompt
            const voicePrompt = await getRegistrationVoicePrompt("aadhaar", "hi");

            sendSuccess(
                res,
                {
                    panditId: pandit.id,
                    nextStep: "aadhaar",
                    voicePrompt,
                },
                "Profile saved. Next: Aadhaar verification."
            );
        } catch (err) {
            next(err);
        }
    }
);

/**
 * POST /voice/register/aadhaar
 * Step: Submit Aadhaar (encrypted with AES-256).
 */
router.post(
    "/register/aadhaar",
    authenticate,
    roleGuard("PANDIT"),
    validate(aadhaarStepSchema),
    async (req, res, next) => {
        try {
            const { aadhaarNumber } = req.body as z.infer<typeof aadhaarStepSchema>;
            const result = await submitAadhaar(req.user!.id, aadhaarNumber);

            const voicePrompt = await getRegistrationVoicePrompt("documents", "hi");

            sendSuccess(
                res,
                {
                    aadhaarLastFour: result.aadhaarLastFour,
                    nextStep: "documents",
                    voicePrompt,
                },
                "Aadhaar submitted securely."
            );
        } catch (err) {
            next(err);
        }
    }
);

/**
 * POST /voice/register/bank
 * Step: Submit bank details.
 */
router.post(
    "/register/bank",
    authenticate,
    roleGuard("PANDIT"),
    validate(bankStepSchema),
    async (req, res, next) => {
        try {
            const data = req.body as z.infer<typeof bankStepSchema>;
            const userId = req.user!.id;

            await prisma.pandit.update({
                where: { userId },
                data: {
                    bankAccountName: data.bankAccountName,
                    bankAccountNumber: data.bankAccountNumber,
                    bankIfscCode: data.bankIfscCode,
                    bankAccountAdded: true,
                },
            });

            const voicePrompt = await getRegistrationVoicePrompt("video_kyc", "hi");

            sendSuccess(
                res,
                {
                    nextStep: "video_kyc",
                    voicePrompt,
                },
                "Bank details saved."
            );
        } catch (err) {
            next(err);
        }
    }
);

/**
 * POST /voice/register/video-kyc
 * Step: Submit video KYC.
 */
router.post(
    "/register/video-kyc",
    authenticate,
    roleGuard("PANDIT"),
    validate(videoKycSchema),
    async (req, res, next) => {
        try {
            const { videoUrl } = req.body as z.infer<typeof videoKycSchema>;
            await submitVideoKYC(req.user!.id, videoUrl);

            const voicePrompt = await getRegistrationVoicePrompt("complete", "hi");

            sendSuccess(
                res,
                {
                    status: "submitted_for_review",
                    nextStep: "complete",
                    voicePrompt,
                },
                "Video KYC submitted. Your application is under review."
            );
        } catch (err) {
            next(err);
        }
    }
);

export default router;
