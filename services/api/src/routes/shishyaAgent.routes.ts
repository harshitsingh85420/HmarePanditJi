import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import crypto from "crypto";
import { prisma } from "@hmarepanditji/db";
import { optionalAuth } from "../middleware/auth";
import { validate } from "../middleware/validator";
import { sendSuccess } from "../utils/response";
import { cacheGet, cacheSet, checkKeyedRateLimit } from "../lib/redis";
import { env } from "../config/env";
import { buildAgentSystemPrompt, type AgentContext } from "../lib/shishyaAgentPrompt";

const actionSchema = z.object({
  id: z.string().max(60),
  label: z.string().max(120),
  hint: z.string().max(160).optional(),
});

const agentSchema = z.object({
  text: z.string().min(1).max(400),
  lang: z.string().max(8).optional().default("hi"),
  route: z.string().max(100).optional().default(""),
  context: z
    .object({
      screenId: z.string().max(60).optional(),
      screenHelp: z.string().max(400).optional(),
      availableActions: z.array(actionSchema).max(24).optional(),
      userState: z
        .object({
          firstName: z.string().max(60).optional(),
          city: z.string().max(60).optional(),
          readinessStep: z.number().int().min(0).max(5).optional(),
          isBookingReady: z.boolean().optional(),
          pendingBookingsCount: z.number().int().min(0).max(999).optional(),
          isOnline: z.boolean().optional(),
        })
        .optional(),
    })
    .optional()
    .default({}),
  history: z
    .array(z.object({ role: z.enum(["pandit", "shishya"]), text: z.string().max(400) }))
    .max(6)
    .optional()
    .default([]),
});

// Session-1 finding: history-bearing calls run longer on the reasoning
// model — they get 10s; stateless stays 8s.
const LLM_TIMEOUT_MS = 8000;
const LLM_TIMEOUT_HISTORY_MS = 10000;
// cache key carries a PROMPT VERSION (agent:v2:) — bump it with any
// system-prompt change so stale-prompt answers can never serve.
const CACHE_TTL_S = 7 * 24 * 3600;
const HONEST_MISS_HI =
  "क्षमा कीजिए पंडित जी, इसका उत्तर अभी मेरे पास नहीं है — मदद वाले हिस्से से हमारी टीम को फ़ोन कर सकते हैं।";

interface AgentReply {
  say: string;
  act: string | null;
}

/** Extract + validate the strict {say, act} JSON from a model reply.
 *  Tolerates code fences and stray prose around the object. */
function parseAgentJson(raw: string, validActIds: Set<string>): AgentReply | null {
  const m = raw.match(/\{[\s\S]*\}/);
  if (!m) return null;
  try {
    const obj = JSON.parse(m[0]) as { say?: unknown; act?: unknown };
    const say = typeof obj.say === "string" ? obj.say.trim() : "";
    if (!say) return null;
    let act: string | null = typeof obj.act === "string" ? obj.act : null;
    // W2 LAW: act must come from the sent list — anything else → null
    if (act && !validActIds.has(act)) act = null;
    return { say: say.length > 300 ? `${say.slice(0, 297)}…` : say, act };
  } catch {
    return null;
  }
}

/**
 * W2 — शिष्य v3: THE conversational agent. Everything the reflex
 * layer (fields/commands/options/grammar) doesn't claim lands here:
 * questions, statements, complaints, chatter, half-commands. Sarvam
 * chat under the fact-guarded tool prompt; STRICT {say, act} JSON;
 * act only from the client-sent action list (the agent can never
 * invent a tool, and confirm flows run client-side exactly as if the
 * pandit had spoken the command directly).
 */
export default async function shishyaAgentRoutes(fastify: FastifyInstance, _opts: unknown) {
  fastify.post(
    "/agent",
    {
      preHandler: [optionalAuth, validate(agentSchema)],
      config: {
        rateLimit: {
          max: (req: FastifyRequest) => ((req as any).user?.id ? 15 : 30),
          timeWindow: 60000,
          keyGenerator: (req: FastifyRequest) => (req as any).user?.id || req.ip || "0.0.0.0",
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const body = request.body as z.infer<typeof agentSchema>;
      const { text, lang, route, history } = body;
      const ctx = body.context as AgentContext;
      const userId = (request as any).user?.id as string | undefined;

      // W2: 200/day/token — the daily cost ceiling per pandit
      if (userId) {
        const dayOk = await checkKeyedRateLimit("shishya-agent-day", userId, 200, 24 * 3600);
        if (!dayOk) {
          return sendSuccess(reply, {
            say: HONEST_MISS_HI,
            act: null,
            source: "rate-limited-day",
          });
        }
      }

      if (!env.SARVAM_API_KEY) {
        return sendSuccess(reply, { say: HONEST_MISS_HI, act: null, source: "unconfigured" });
      }

      const validActIds = new Set((ctx.availableActions || []).map((a) => a.id));
      const model = process.env.SHISHYA_LLM_MODEL || "sarvam-30b";
      const t0 = Date.now();

      // cache ONLY stateless single-turn exchanges (no history)
      const cacheable = history.length === 0;
      const cacheKey = cacheable
        ? `agent:v4:${lang}:${crypto
            .createHash("sha1")
            .update(`${ctx.screenId || ""}|${text.toLowerCase().replace(/[।.,!?\s]+/g, " ").trim()}`)
            .digest("hex")}`
        : null;
      if (cacheKey) {
        const hit = await cacheGet(cacheKey);
        if (hit) {
          try {
            const parsed = JSON.parse(hit) as AgentReply;
            // cached acts re-validate against THIS request's action list
            if (parsed.act && !validActIds.has(parsed.act)) parsed.act = null;
            return sendSuccess(reply, { ...parsed, source: "agent-cached" });
          } catch { /* fall through to live */ }
        }
      }

      const sysPrompt = buildAgentSystemPrompt(lang, ctx);
      const messages: Array<{ role: string; content: string }> = [
        { role: "system", content: sysPrompt },
        ...history.map((h) => ({
          role: h.role === "pandit" ? "user" : "assistant",
          content: h.text,
        })),
        { role: "user", content: text },
      ];
      // W4e: the model is Hindi-dominant — a buried instruction loses.
      // For lang≠hi a TRAILING system order (recency) in English holds it
      // to the session language.
      if (lang && lang !== "hi") {
        messages.push({
          role: "system",
          content: `CRITICAL: Write the "say" value STRICTLY in the ${lang} language (the pandit's chosen language). Do NOT write it in Hindi. Same warm tone, same facts, but every word of "say" in ${lang}.`,
        });
      }

      const callLlm = async (extraNudge?: string): Promise<string | null> => {
        const msgs = extraNudge
          ? [...messages, { role: "system", content: extraNudge }]
          : messages;
        const res = await fetch("https://api.sarvam.ai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "api-subscription-key": env.SARVAM_API_KEY,
          },
          body: JSON.stringify({ model, temperature: 0.4, max_tokens: 2500, messages: msgs }),
        });
        if (!res.ok) {
          const errBody = await res.text().catch(() => "");
          request.log.warn({ status: res.status, body: errBody.slice(0, 300) }, "shishya agent llm error");
          return null;
        }
        const data = (await res.json()) as { choices?: Array<{ message?: { content?: string | null } }> };
        return data.choices?.[0]?.message?.content?.trim() || null;
      };

      const work = (async (): Promise<AgentReply & { source: string }> => {
        let raw = await callLlm();
        let parsed = raw ? parseAgentJson(raw, validActIds) : null;
        if (raw && !parsed) {
          // one format-reminder retry
          raw = await callLlm('केवल यह JSON लौटाओ, और कुछ नहीं: {"say": "...", "act": null}');
          parsed = raw ? parseAgentJson(raw, validActIds) : null;
        }
        if (!parsed) return { say: HONEST_MISS_HI, act: null, source: "agent-miss" };
        if (cacheKey && !parsed.act) {
          // never cache tool executions — only pure answers
          await cacheSet(cacheKey, JSON.stringify(parsed), CACHE_TTL_S);
        }
        return { ...parsed, source: "agent" };
      })();
      work.catch((err) => request.log.warn({ err }, "shishya agent background fail"));

      const result = await Promise.race([
        work,
        new Promise<AgentReply & { source: string }>((res) =>
          setTimeout(() => res({ say: HONEST_MISS_HI, act: null, source: "agent-timeout" }), history.length > 0 ? LLM_TIMEOUT_HISTORY_MS : LLM_TIMEOUT_MS),
        ),
      ]).catch(() => ({ say: HONEST_MISS_HI, act: null as string | null, source: "agent-error" }));

      const ms = Date.now() - t0;
      // telemetry: fire-and-forget, never blocks the reply
      void prisma.shishyaExchange
        .create({
          data: { text: text.slice(0, 400), say: result.say.slice(0, 400), act: result.act, route, lang, ms, model },
        })
        .catch((err: unknown) => request.log.warn({ err }, "shishya exchange log fail"));

      return sendSuccess(reply, { ...result, ms, model });
    },
  );
}
