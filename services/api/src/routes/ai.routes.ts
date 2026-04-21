/**
 * HmarePanditJi — AI Services Proxy Routes
 *
 * Server-side proxy for external AI APIs:
 * - DeepSeek (Chat completions)
 * - Sarvam AI (Text-to-Speech)
 * - Deepgram (Speech-to-Text)
 *
 * These routes keep API keys on the server and never expose them to clients.
 * All requests are authenticated and rate-limited.
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { authenticate } from "../middleware/auth";
import { validate } from "../middleware/validator";
import { sendSuccess } from "../utils/response";
import { AppError } from "../middleware/errorHandler";
import { env } from "../config/env";

// ── Schemas ───────────────────────────────────────────────────────────────────

const deepseekChatSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(["user", "assistant", "system"]),
      content: z.string(),
    })
  ),
  model: z.string().optional().default("deepseek-chat"),
  temperature: z.number().min(0).max(2).optional().default(0.7),
  max_tokens: z.number().int().min(1).max(8192).optional().default(1024),
  top_p: z.number().min(0).max(1).optional().default(1),
});

const sarvamTTSSchema = z.object({
  text: z.string().min(1).max(5000),
  languageCode: z.string().optional().default("hi-IN"),
  speaker: z.string().optional().default("meera"),
  pace: z.number().min(0.5).max(2).optional().default(0.82),
});

const deepgramSTTSchema = z.object({
  audioBase64: z.string().min(1, "Audio content required"),
  language: z.string().optional().default("hi-IN"),
  model: z.string().optional().default("nova-2"),
});

// ── Routes ────────────────────────────────────────────────────────────────────

export default async function aiServicesRoutes(fastify: FastifyInstance, _opts: any) {
  // ─── DeepSeek Chat ────────────────────────────────────────────────────────

  fastify.post(
    "/deepseek/chat",
    {
      preHandler: [authenticate, validate(deepseekChatSchema)],
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { DEEPSEEK_API_KEY } = env;

      if (!DEEPSEEK_API_KEY || DEEPSEEK_API_KEY.length < 10) {
        throw new AppError("DeepSeek API is not configured", 503, "SERVICE_UNAVAILABLE");
      }

      const req = request as any;
      const { messages, model, temperature, max_tokens, top_p } = req.body;

      try {
        const response = await fetch("https://api.deepseek.com/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
          },
          body: JSON.stringify({
            model,
            messages,
            temperature,
            max_tokens,
            top_p,
            stream: false,
          }),
        });

        if (!response.ok) {
          const error = await response.text();
          throw new AppError(
            `DeepSeek API error: ${response.status}`,
            response.status,
            "AI_SERVICE_ERROR"
          );
        }

        const data = await response.json();
        sendSuccess(reply, data, "Chat completion successful");
      } catch (err) {
        if (err instanceof AppError) throw err;
        throw new AppError("Failed to call DeepSeek API", 500, "AI_SERVICE_ERROR");
      }
    }
  );

  // ─── Sarvam TTS ───────────────────────────────────────────────────────────

  fastify.post(
    "/sarvam/tts",
    {
      preHandler: [authenticate, validate(sarvamTTSSchema)],
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { SARVAM_API_KEY } = env;

      if (!SARVAM_API_KEY || SARVAM_API_KEY.length < 10) {
        throw new AppError("Sarvam AI is not configured", 503, "SERVICE_UNAVAILABLE");
      }

      const req = request as any;
      const { text, languageCode, speaker, pace } = req.body;

      try {
        const response = await fetch("https://api.sarvam.ai/tts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "API-Subscription-Key": SARVAM_API_KEY,
          },
          body: JSON.stringify({
            inputs: [text],
            target_language_code: languageCode,
            speaker: speaker,
            pace: pace,
          }),
        });

        if (!response.ok) {
          const error = await response.text();
          throw new AppError(
            `Sarvam TTS API error: ${response.status}`,
            response.status,
            "VOICE_SERVICE_ERROR"
          );
        }

        const data = await response.json();
        sendSuccess(reply, data, "Text-to-speech generated successfully");
      } catch (err) {
        if (err instanceof AppError) throw err;
        throw new AppError("Failed to call Sarvam TTS API", 500, "VOICE_SERVICE_ERROR");
      }
    }
  );

  // ─── Deepgram STT ─────────────────────────────────────────────────────────

  fastify.post(
    "/deepgram/stt",
    {
      preHandler: [authenticate, validate(deepgramSTTSchema)],
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { DEEPGRAM_API_KEY } = env;

      if (!DEEPGRAM_API_KEY || DEEPGRAM_API_KEY.length < 10) {
        throw new AppError("Deepgram is not configured", 503, "SERVICE_UNAVAILABLE");
      }

      const req = request as any;
      const { audioBase64, language, model } = req.body;

      try {
        // Convert base64 to binary
        const audioBuffer = Buffer.from(audioBase64, "base64");

        const response = await fetch(
          `https://api.deepgram.com/v1/listen?model=${model}&language=${language}&smart_format=true&interim_results=true&utterance_end_ms=1000`,
          {
            method: "POST",
            headers: {
              Authorization: `Token ${DEEPGRAM_API_KEY}`,
              "Content-Type": "audio/wav",
            },
            body: audioBuffer,
          }
        );

        if (!response.ok) {
          const error = await response.text();
          throw new AppError(
            `Deepgram STT API error: ${response.status}`,
            response.status,
            "VOICE_SERVICE_ERROR"
          );
        }

        const data = await response.json();
        sendSuccess(reply, data, "Speech-to-text completed successfully");
      } catch (err) {
        if (err instanceof AppError) throw err;
        throw new AppError("Failed to call Deepgram STT API", 500, "VOICE_SERVICE_ERROR");
      }
    }
  );

  // ─── Health Check ─────────────────────────────────────────────────────────

  fastify.get("/health", async (request: FastifyRequest, reply: FastifyReply) => {
    sendSuccess(reply, {
      deepseek: !!env.DEEPSEEK_API_KEY,
      sarvam: !!env.SARVAM_API_KEY,
      deepgram: !!env.DEEPGRAM_API_KEY,
    }, "AI services health status");
  });
}
