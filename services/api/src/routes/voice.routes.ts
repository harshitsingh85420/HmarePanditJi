/**
 * HmarePanditJi — Voice-First Registration Routes
 *
 * Handles the multi-step pandit registration with voice guidance.
 * Every step returns a Bhashini voice prompt.
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { authenticate, optionalAuth } from "../middleware/auth";
import { roleGuard } from "../middleware/roleGuard";
import { validate } from "../middleware/validator";
import { sendSuccess } from "../utils/response";
import { cacheGetMany, cacheSet, checkKeyedRateLimit } from "../lib/redis";
import { getRegistrationVoicePrompt, textToSpeech, speechToText } from "../services/bhashini.service";
import { maskBrandTokens, unmaskBrandTokens } from "../lib/brandTokens";
import crypto from "crypto";
import { env } from "../config/env";
import { isStorageConfigured, objectExists, getObjectBuffer, putObject } from "../lib/storage";
import { submitAadhaar, submitVideoKYC } from "../services/kyc.service";
import { prisma } from "@hmarepanditji/db";
import { logger } from "../utils/logger";

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
    // D4: speech pace (0.5–2.0, default env SARVAM_TTS_PACE → 1.15).
    pace: z.number().min(0.5).max(2).optional(),
});

// The pandit app's 11 UI language codes → Sarvam Translate (Mayura) codes.
const APP_LANG_CODES = ["hi", "mr", "bn", "ta", "te", "kn", "gu", "pa", "ml", "or", "en"] as const;
const LANG_TO_SARVAM: Record<(typeof APP_LANG_CODES)[number], string> = {
    hi: "hi-IN", mr: "mr-IN", bn: "bn-IN", ta: "ta-IN", te: "te-IN",
    kn: "kn-IN", gu: "gu-IN", pa: "pa-IN", ml: "ml-IN", or: "od-IN", en: "en-IN",
};

const translateSchema = z.object({
    texts: z.array(z.string().min(1).max(2000)).min(1).max(200),
    target: z.enum(APP_LANG_CODES),
});

const TRANSLATE_CACHE_TTL_SECONDS = 30 * 24 * 60 * 60; // 30 days

// ── Routes ────────────────────────────────────────────────────────────────────

export default async function voiceRoutes(fastify: FastifyInstance, _opts: any) {
    /**
     * GET /voice/prompt/:step
     * Get voice prompt for a registration step (Bhashini TTS).
     */
    fastify.get("/prompt/:step", async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const req = request as any;
            const res = reply;
            const { step } = req.params;
            const language = (req.query as any).language || "hi";
            const result = await getRegistrationVoicePrompt(step, language);
            sendSuccess(res, result, `Voice prompt for step: ${step}`);
        } catch (err) {
            throw err;
        }
    });

    /**
     * POST /voice/tts
     * Convert arbitrary text to speech (for screen reader / voice button).
     * Master Rule #9: Every Pandit app screen has a voice button.
     */
    fastify.post("/tts", { preHandler: [validate(ttsSchema)] }, async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const req = request as any;
            const res = reply;
            const { text, language, pace: paceRaw } = req.body as z.infer<typeof ttsSchema>;
            const envPace = Number.parseFloat(process.env.SARVAM_TTS_PACE ?? "1.15");
            const pace = Math.min(2, Math.max(0.5, paceRaw ?? (Number.isFinite(envPace) ? envPace : 1.15)));

            // R2-backed audio cache. Hash EVERY parameter that affects the
            // audio: provider, serviceId (pipeline), language, and the
            // normalized text. Long dynamic texts are not cached.
            // Y3: no gender token — the female voice is gone; the store
            // name is bumped (bhashini2) so any legacy female-audio object
            // can never be served.
            const normalizedText = text.trim();
            const serviceId = env.BHASHINI_PIPELINE_ID || "ai4bharat/indic-tts-coqui-hindi";
            const cacheable = isStorageConfigured() && normalizedText.length <= 500;
            const cacheKey = "tts/" + crypto
                .createHash("sha256")
                .update(`bhashini2|${serviceId}|${language}|${pace}|${normalizedText}`)
                .digest("hex") + ".mp3";

            if (cacheable && (await objectExists(cacheKey))) {
                const cached = await getObjectBuffer(cacheKey);
                res.header("x-tts-cache", "hit");
                sendSuccess(res, { audio: cached.toString("base64"), text, language }, "Text-to-speech generated");
                return;
            }

            const audio = await textToSpeech(text, language, pace);

            if (cacheable && audio) {
                try {
                    await putObject(cacheKey, Buffer.from(audio, "base64"), "audio/wav");
                } catch (err) {
                    fastify.log.error({ err }, "[tts-cache] put failed — responding without cache");
                }
            }

            res.header("x-tts-cache", "miss");
            sendSuccess(res, { audio, text, language }, "Text-to-speech generated");
        } catch (err) {
            throw err;
        }
    });

    /**
     * POST /voice/translate
     * Batch-translate Hindi source strings to one of the app's 11 UI
     * languages via Sarvam Mayura. Auth optional (entry flow runs
     * pre-login); rate-limited 20/min per IP+token. Per-text Redis cache
     * trans:<target>:<sha1(text)> (TTL 30d) is consulted before Sarvam and
     * written through after.
     * L3: for the EN target only, brand tokens (शिष्य, हमारे पंडित जी,
     * HmarePanditJi) never reach Sarvam — maskBrandTokens swaps them to
     * ⟦Sn⟧ placeholders and unmaskBrandTokens restores them after.
     * LIVE-VERIFIED CONSTRAINT: Mayura preserves ⟦Sn⟧ only when the
     * target is en — for mr/bn/te/ta it translates the placeholder
     * content itself (⟦S3⟧ → "⟦तृतीय श्रेणी⟧"), which would corrupt those
     * bundles. Regional targets therefore translate unmasked (their
     * pre-existing behavior) and keep their warm trans: cache; en uses
     * its own trans2: namespace (masking changed its results).
     */
    fastify.post(
        "/translate",
        { preHandler: [optionalAuth, validate(translateSchema)] },
        async (request: FastifyRequest, reply: FastifyReply) => {
            const { texts, target } = request.body as z.infer<typeof translateSchema>;

            const forwarded = (request.headers["x-forwarded-for"] as string | undefined)?.split(",")[0]?.trim();
            const ip = forwarded || request.ip || "unknown";
            const userId = (request as any).user?.id || "anon";
            const allowed = await checkKeyedRateLimit("translate", `${ip}:${userId}`, 20, 60);
            if (!allowed) {
                return reply.status(429).send({
                    success: false,
                    error: { code: "rate_limit_exceeded", message: "Too many translation requests — try again in a minute." },
                });
            }

            // Hindi is the source language — echo without spending anything.
            if (target === "hi") {
                sendSuccess(reply, { translations: texts }, "Translations ready");
                return;
            }

            if (!env.SARVAM_API_KEY || env.SARVAM_API_KEY.length < 10) {
                return reply.status(501).send({
                    success: false,
                    error: { code: "translate_unconfigured", message: "Translation not configured — SARVAM_API_KEY missing." },
                });
            }

            const mask = target === "en";
            const keys = texts.map(
                (text) => `${mask ? "trans2" : "trans"}:${target}:` + crypto.createHash("sha1").update(text).digest("hex"),
            );
            const cached = await cacheGetMany(keys);
            const translations: Array<string | null> = [...cached];
            const missIndices = translations
                .map((v, i) => (v === null ? i : -1))
                .filter((i) => i >= 0);

            // Sarvam's translate API takes ONE `input` per call (the
            // `inputs` array shape is not accepted) — so a "batch" here is
            // a bounded-concurrency window of single-text calls. Sarvam's
            // own per-minute quota answers 429 — back off and retry; the
            // write-through cache means any aborted run resumes from where
            // it stopped on the next request.
            const sleep = (ms: number) => new Promise<void>((res) => setTimeout(res, ms));
            const translateOne = async (idx: number): Promise<void> => {
                // A text that is ENTIRELY brand tokens (e.g. shishya.name =
                // "शिष्य") has nothing translatable left once masked — echo
                // it verbatim instead of asking Sarvam to translate "⟦S3⟧".
                if (mask && maskBrandTokens(texts[idx]).replace(/⟦S\d+⟧/g, "").trim() === "") {
                    translations[idx] = texts[idx];
                    await cacheSet(keys[idx], texts[idx], TRANSLATE_CACHE_TTL_SECONDS);
                    return;
                }
                for (let attempt = 0; ; attempt++) {
                    const upstream = await fetch("https://api.sarvam.ai/translate", {
                        method: "POST",
                        headers: {
                            "api-subscription-key": env.SARVAM_API_KEY,
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            input: mask ? maskBrandTokens(texts[idx]) : texts[idx],
                            source_language_code: "hi-IN",
                            target_language_code: LANG_TO_SARVAM[target],
                            model: "mayura:v1",
                        }),
                    });
                    if (upstream.status === 429 && attempt < 3) {
                        // Sarvam's quota is minute-windowed — short backoffs
                        // can't outlast it. 5s → 15s → 45s rides it out; the
                        // write-through cache makes this a one-time seed per
                        // language.
                        await sleep([5000, 15000, 45000][attempt]);
                        continue;
                    }
                    if (!upstream.ok) {
                        const detail = await upstream.text().catch(() => "");
                        throw new Error(`Sarvam upstream ${upstream.status}: ${detail.slice(0, 300)}`);
                    }
                    const data = (await upstream.json()) as { translated_text?: string; translated_texts?: string[] };
                    const translatedRaw = data.translated_text ?? data.translated_texts?.[0];
                    if (!translatedRaw) throw new Error("Sarvam upstream returned no text");
                    const translated = mask ? unmaskBrandTokens(translatedRaw) : translatedRaw;
                    translations[idx] = translated;
                    await cacheSet(keys[idx], translated, TRANSLATE_CACHE_TTL_SECONDS);
                    return;
                }
            };

            let sarvamCalls = 0;
            const CONCURRENCY = 3;
            try {
                for (let i = 0; i < missIndices.length; i += CONCURRENCY) {
                    const window = missIndices.slice(i, i + CONCURRENCY);
                    sarvamCalls += window.length;
                    await Promise.all(window.map(translateOne));
                }
            } catch (err) {
                logger.error(`[translate] ${(err as Error).message}`);
                return reply.status(502).send({
                    success: false,
                    error: { code: "VOICE_SERVICE_ERROR", message: "Translation upstream failed." },
                });
            }

            // Cache proof lives in the logs: a warm second run shows
            // cacheHits=texts.length and sarvamCalls=0.
            logger.info(
                `[translate] target=${target} texts=${texts.length} cacheHits=${texts.length - missIndices.length} sarvamCalls=${sarvamCalls}`,
            );
            sendSuccess(reply, { translations }, "Translations ready");
        },
    );

    /**
     * POST /voice/stt
     * Convert speech audio to text (Bhashini STT).
     */
    fastify.post("/stt", { preHandler: [validate(voiceInputSchema)] }, async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const req = request as any;
            const res = reply;
            const { audioBase64, language } = req.body as z.infer<typeof voiceInputSchema>;
            const transcript = await speechToText(audioBase64, language);
            sendSuccess(res, { transcript, language }, "Speech-to-text completed");
        } catch (err) {
            throw err;
        }
    });

    /**
     * POST /voice/register/profile
     * Step: Submit pandit profile details.
     */
    fastify.post(
        "/register/profile",
        {
            preHandler: [authenticate, roleGuard("PANDIT"), validate(profileStepSchema)],
        },
        async (request: FastifyRequest, reply: FastifyReply) => {
            try {
                const req = request as any;
                const res = reply;
                const data = req.body as z.infer<typeof profileStepSchema>;
                const userId = req.user!.id;

                // Upsert pandit profile
                const pandit = await prisma.panditProfile.upsert({
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
                throw err;
            }
        }
    );

    /**
     * POST /voice/register/aadhaar
     * Step: Submit Aadhaar (encrypted with AES-256).
     */
    fastify.post(
        "/register/aadhaar",
        {
            preHandler: [authenticate, roleGuard("PANDIT"), validate(aadhaarStepSchema)],
        },
        async (request: FastifyRequest, reply: FastifyReply) => {
            try {
                const req = request as any;
                const res = reply;
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
                throw err;
            }
        }
    );

    /**
     * POST /voice/register/bank
     * Step: Submit bank details.
     */
    fastify.post(
        "/register/bank",
        {
            preHandler: [authenticate, roleGuard("PANDIT"), validate(bankStepSchema)],
        },
        async (request: FastifyRequest, reply: FastifyReply) => {
            try {
                const req = request as any;
                const res = reply;
                const data = req.body as z.infer<typeof bankStepSchema>;
                const userId = req.user!.id;

                await prisma.panditProfile.update({
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
                throw err;
            }
        }
    );

    /**
     * POST /voice/register/video-kyc
     * Step: Submit video KYC.
     */
    fastify.post(
        "/register/video-kyc",
        {
            preHandler: [authenticate, roleGuard("PANDIT"), validate(videoKycSchema)],
        },
        async (request: FastifyRequest, reply: FastifyReply) => {
            try {
                const req = request as any;
                const res = reply;
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
                throw err;
            }
        }
    );
}
