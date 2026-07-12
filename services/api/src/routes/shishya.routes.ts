import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import crypto from "crypto";
import { optionalAuth } from "../middleware/auth";
import { validate } from "../middleware/validator";
import { sendSuccess } from "../utils/response";
import { cacheGet, cacheSet } from "../lib/redis";
import { env } from "../config/env";
import { buildSystemPrompt, matchCurated } from "../lib/shishyaFacts";

const askSchema = z.object({
  text: z.string().min(1).max(300),
  route: z.string().max(100).optional().default(""),
  lang: z.string().max(8).optional().default("hi"),
});

const LLM_TIMEOUT_MS = 6000;
const CACHE_TTL_S = 7 * 24 * 3600;

/**
 * T4 — शिष्य v2: the REAL agent. Pipeline per ask:
 *   1. server curated table (authoritative, free — catches keyword
 *      drift the client matcher missed)
 *   2. Sarvam chat LLM under the fact-sheet system prompt (temp 0.2,
 *      ≤2 Hindi sentences, money/Aadhaar ONLY from the sheet)
 *   3. any failure/timeout → { source: 'miss' } and the client speaks
 *      its honest-miss line.
 * Identical questions answer instantly for 7 days via Redis
 * (brain:<lang>:<sha1(normalized)>).
 */
export default async function shishyaRoutes(fastify: FastifyInstance, _opts: unknown) {
  fastify.post(
    "/ask",
    {
      preHandler: [optionalAuth, validate(askSchema)],
      config: {
        rateLimit: {
          // 10/min with a token, 30/min per bare IP
          max: (req: FastifyRequest) => ((req as any).user?.id ? 10 : 30),
          timeWindow: 60000,
          keyGenerator: (req: FastifyRequest) =>
            (req as any).user?.id || req.ip || "0.0.0.0",
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { text, lang } = request.body as z.infer<typeof askSchema>;
      const normalized = text.toLowerCase().replace(/[।.,!?\s]+/g, " ").trim();

      // 1. curated — authoritative and free
      const curated = matchCurated(normalized);
      if (curated) {
        return sendSuccess(reply, { answer: curated.answer, source: "intent", id: curated.id });
      }

      // 2. cache
      const key = `brain:${lang}:${crypto.createHash("sha1").update(normalized).digest("hex")}`;
      const cached = await cacheGet(key);
      if (cached) {
        return sendSuccess(reply, { answer: cached, source: "llm-cached" });
      }

      // 3. Sarvam chat LLM. MODEL REALITY (probed 2026-07-13): sarvam-m
      // is deprecated (400 names sarvam-30b | sarvam-105b); BOTH are
      // REASONING models — a small max_tokens starves the answer
      // (finish=length, content=null, thinking in reasoning_content;
      // enable_thinking:false is ignored). Full answers need ~2500
      // tokens and land in 5.4-5.9s — brushing the 6s budget. So: the
      // REPLY races a 6s deadline (miss on timeout, honest), but the
      // fetch is NOT aborted — it finishes in the background and warms
      // the cache, so the same question answers instantly next time.
      // reasoning_content is NEVER surfaced (chain-of-thought stays
      // private); only message.content may reach a pandit's ears.
      if (!env.SARVAM_API_KEY) {
        return sendSuccess(reply, { source: "miss", reason: "llm_unconfigured" });
      }
      const llmWork = (async (): Promise<{ answer?: string; reason?: string }> => {
        const res = await fetch("https://api.sarvam.ai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "api-subscription-key": env.SARVAM_API_KEY,
          },
          body: JSON.stringify({
            model: process.env.SHISHYA_LLM_MODEL || "sarvam-30b",
            temperature: 0.2,
            max_tokens: 2500,
            messages: [
              { role: "system", content: buildSystemPrompt(lang) },
              { role: "user", content: text.slice(0, 300) },
            ],
          }),
        });
        if (!res.ok) {
          // model-name discovery channel: 4xx bodies name valid models
          const body = await res.text().catch(() => "");
          request.log.warn({ status: res.status, body: body.slice(0, 300) }, "shishya llm http error");
          return { reason: `llm_http_${res.status}` };
        }
        const data = (await res.json()) as {
          choices?: Array<{ message?: { content?: string | null } }>;
        };
        const answer = data.choices?.[0]?.message?.content?.trim();
        if (!answer) return { reason: "llm_empty" };
        // clip runaways: speakable ≤ ~2 sentences / 240 chars
        const clipped = answer.length > 240 ? `${answer.slice(0, 237)}…` : answer;
        await cacheSet(key, clipped, CACHE_TTL_S);
        return { answer: clipped };
      })();
      // background completion always caches; swallow its errors
      llmWork.catch((err) => request.log.warn({ err }, "shishya llm background fail"));

      const raced: { answer?: string; reason?: string } = await Promise.race([
        llmWork,
        new Promise<{ answer?: string; reason?: string }>((res) =>
          setTimeout(() => res({ reason: "llm_timeout_cache_warming" }), LLM_TIMEOUT_MS),
        ),
      ]).catch(() => ({ reason: "llm_error" }));

      if (raced.answer) {
        return sendSuccess(reply, { answer: raced.answer, source: "llm" });
      }
      return sendSuccess(reply, { source: "miss", reason: raced.reason || "llm_error" });
    },
  );
}
