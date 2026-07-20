import Fastify, { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import fastifyCors from "@fastify/cors";
import fastifyHelmet from "@fastify/helmet";
import fastifyMultipart from "@fastify/multipart";
import fastifyRateLimit from "@fastify/rate-limit";
import fastifyStatic from "@fastify/static";
import fastifyCookie from "@fastify/cookie";
import { join } from "path";

import { env } from "./config/env";
import { API_PREFIX, ALLOWED_ORIGINS } from "./config/constants";
import { generalLimiterConfig } from "./middleware/rateLimiter";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";

import authRoutes from "./routes/auth.routes";
import customerRoutes from "./routes/customer.routes";
import panditRoutes from "./routes/pandit.routes";
import ritualRoutes from "./routes/ritual.routes";
import bookingRoutes from "./routes/booking.routes";
import paymentRoutes from "./routes/payment.routes";
import reviewRoutes from "./routes/review.routes";
import adminRoutes from "./routes/admin.routes";
import notificationRoutes from "./routes/notification.routes";
import travelRoutes from "./routes/travel.routes";
import muhuratRoutes from "./routes/muhurat.routes";
import samagriRoutes from "./routes/samagri.routes";
import voiceRoutes from "./routes/voice.routes";
import feedbackRoutes from "./routes/feedback.routes";
import shishyaRoutes from "./routes/shishya.routes";
import shishyaAgentRoutes from "./routes/shishyaAgent.routes";
import kycRoutes from "./routes/kyc.routes";
import onboardingRoutes from "./routes/onboarding.routes";
import uploadRoutes from "./routes/upload.routes";
import aiRoutes from "./routes/ai.routes";
import { submitOnboarding } from "./controllers/onboarding.controller";
import { getReadiness, patchReadiness } from "./controllers/readiness.controller";
import { presignFile } from "./controllers/upload.controller";
import { submitPoojaVerification, getMyPoojaVerifications, savePoojaConfig, getPoojaConfigs } from "./controllers/poojaVerification.controller";
import { isStorageConfigured } from "./lib/storage";
import { authenticate, optionalAuth } from "./middleware/auth";
import { roleGuard } from "./middleware/roleGuard";
import {
  getSamagriPackages,
  saveSamagriPackages,
  patchPanditStatus,
  getPanditBookings,
  getPanditBookingById,
  getPanditEarningsSummary,
  getPanditStats,
  acceptBooking,
  rejectBooking,
  postBookingJourney,
  completeBooking,
  getPanditPayouts,
  markMilestonesSeen,
  patchPanditProfile,
  upsertDakshinaRate,
  removeSpecialization,
  getBlockedDates,
  createBlockedDate,
  deleteBlockedDate
} from "./controllers/auth.controller";

const app: FastifyInstance = Fastify({
  logger: {
    level: env.NODE_ENV === "production" ? "info" : "debug",
    transport:
      env.NODE_ENV === "development"
        ? {
          target: "pino-pretty",
          options: {
            translateTime: "HH:MM:ss Z",
            ignore: "pid,hostname",
          },
        }
        : undefined,
  },
  bodyLimit: 10 * 1024 * 1024, // 10mb
  // Render terminates TLS at its proxy — without trustProxy request.ip is
  // the PROXY's address for every client, so the per-IP rate limiter put
  // the ENTIRE platform in ONE 100/min bucket (live P-PAY E2E: a single
  // session's combined app traffic 429'd POST /bookings). X-Forwarded-For
  // is proxy-controlled on Render, so trusting it is safe here.
  trustProxy: true,
});

// ── Register Plugins ──────────────────────────────────────────────────────────

// Security headers (replaces helmet)
app.register(fastifyHelmet, {
  contentSecurityPolicy: env.NODE_ENV === "development" ? false : undefined,
});

// CORS
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "").split(",").map(s => s.trim()).filter(Boolean);
app.register(fastifyCors, {
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) cb(null, true);
    else cb(new Error("Not allowed by CORS"), false);
  },
  credentials: true,
});

// Rate limiting (replaces express-rate-limit)
app.register(fastifyRateLimit, {
  max: generalLimiterConfig.max,
  timeWindow: generalLimiterConfig.windowMs,
  keyGenerator: (request: FastifyRequest) => request.ip || "0.0.0.0",
  errorResponseBuilder: (
    request: FastifyRequest,
    context: { after: string },
  ) => ({
    statusCode: 429,
    error: "Too Many Requests",
    message: "Rate limit exceeded. Please try again later.",
    retryAfter: context.after,
  }),
});

// Multipart/form-data (replaces multer)
app.register(fastifyMultipart, {
  limits: {
    fileSize: 10 * 1024 * 1024, // 10mb
  },
});

// EMPTY-BODY FIX (Phase-4 finding): the client's api() sets
// `Content-Type: application/json` on EVERY request, but action POSTs like
// booking accept/reject/complete, logout, milestones/seen send NO body.
// Fastify's default JSON parser then 400s with "Body cannot be empty" —
// so a real pandit could never accept/reject/complete a booking (the same
// invisible-to-code-reading class as BB1/CM-1). Parse an empty json body
// as {} instead of throwing.
app.addContentTypeParser("application/json", { parseAs: "string" }, (req, body, done) => {
  const s = (body as string) ?? "";
  // L-J: preserve the raw JSON bytes so a signature-verified webhook
  // (Razorpay) can validate against EXACTLY what was signed, not a
  // re-serialized object whose key order/whitespace may differ.
  (req as any).rawBody = s;
  if (s.trim() === "") {
    done(null, {});
    return;
  }
  try {
    done(null, JSON.parse(s));
  } catch (err) {
    (err as { statusCode?: number }).statusCode = 400;
    done(err as Error, undefined);
  }
});

// Cookie support (for HttpOnly session tokens)
app.register(fastifyCookie, {
  secret: env.JWT_SECRET,
});

// ── Health Check (no versioning, no auth) ────────────────────────────────────
app.get("/health", async () => ({
  ok: true,
  uptime: process.uptime(),
  timestamp: new Date().toISOString(),
}));

app.get("/api/health", async () => ({
  ok: true,
  uptime: process.uptime(),
  timestamp: new Date().toISOString(),
}));

// ── G1: BARE-ORIGIN FORGIVENESS ──────────────────────────────────────────────
// Every route lives under API_PREFIX, but a client configured with the
// bare origin (the live-QA 404) used to dead-end. 308 preserves method
// and body, so an unprefixed POST /auth/otp/send lands on its /api/v1
// twin transparently. Wildcards only — no collision with real routes.
const redirectToPrefixed = async (request: FastifyRequest, reply: FastifyReply) => {
  return reply.redirect(308, `${API_PREFIX}${request.url}`);
};
app.all("/auth/*", redirectToPrefixed);
app.all("/pandit/*", redirectToPrefixed);
app.all("/pandits/*", redirectToPrefixed);
app.all("/voice/*", redirectToPrefixed);

// ── API Root ──────────────────────────────────────────────────────────────────
app.get(API_PREFIX, async (_request: FastifyRequest, reply: FastifyReply) => {
  return reply.send({
    success: true,
    data: {
      name: "HmarePanditJi API",
      version: "0.1.0",
      prefix: API_PREFIX,
      description:
        "India's first platform for booking verified Hindu priests — Delhi-NCR Phase 1",
      routes: {
        auth: `${API_PREFIX}/auth`,
        customers: `${API_PREFIX}/customers`,
        pandits: `${API_PREFIX}/pandits`,
        rituals: `${API_PREFIX}/rituals`,
        bookings: `${API_PREFIX}/bookings`,
        payments: `${API_PREFIX}/payments`,
        reviews: `${API_PREFIX}/reviews`,
        admin: `${API_PREFIX}/admin`,
        notifications: `${API_PREFIX}/notifications`,
        travel: `${API_PREFIX}/travel`,
        muhurat: `${API_PREFIX}/muhurat`,
        samagri: `${API_PREFIX}/samagri`,
        voice: `${API_PREFIX}/voice`,
        ai: `${API_PREFIX}/ai`,
        kyc: `${API_PREFIX}/admin/kyc`,
      },
    },
  });
});

// ─────────────────────────────────────────────────────────────
// SCOPED PUBLIC READ — exactly one unauthenticated route.
//
// The customer's pandit-detail page is a logged-out SSR render, so
// GET /pandits/:id must be reachable with no token. Everything else
// under /pandit* stays authenticated + PANDIT-role-gated.
//
// Matched on Fastify's OWN route template (request.routeOptions.url),
// not on the raw URL. That distinction is the whole safety property
// here: a path-prefix or single-segment regex would also match sibling
// routes like /pandits/samagri-packages, /pandits/me, /pandits/bookings,
// /pandits/calendar, /pandits/dashboard-summary and
// /pandits/pending-requests — all of which are private pandit data and
// all of which are one segment deep, exactly like an id. Keying off the
// resolved template means those match their own patterns and can never
// be mistaken for :id, no matter what a future id looks like.
//
// The response body for this route is pinned by
// services/api/src/lib/public-pandit-projection.test.ts. That guard is
// what makes this exemption safe: it fails the build if the projection
// stops being an allow-list, or if any bank / Aadhaar / geo / phone
// field re-enters it. Do not weaken one without reverting the other.
// ─────────────────────────────────────────────────────────────
const PUBLIC_PANDIT_READS = new Set<string>([`${API_PREFIX}/pandits/:id`]);

export function isPublicPanditRead(method: string, routeTemplate: string | undefined): boolean {
  return method === "GET" && !!routeTemplate && PUBLIC_PANDIT_READS.has(routeTemplate);
}

// Enforce role PANDIT on all /pandit/* or /pandits/* routes
app.addHook("preHandler", async (request, reply) => {
  const url = request.url;
  if (url.startsWith(`${API_PREFIX}/pandits`) || url.startsWith(`${API_PREFIX}/pandit`)) {
    if (isPublicPanditRead(request.method, request.routeOptions?.url)) return;
    await authenticate(request, reply);
    await roleGuard("PANDIT")(request, reply);
  }
});

// ── Routes ────────────────────────────────────────────────────────────────────
app.post(`${API_PREFIX}/pandit/onboarding`, { preHandler: [authenticate, roleGuard("PANDIT")] }, submitOnboarding);
app.post(`${API_PREFIX}/pandits/onboarding`, { preHandler: [authenticate, roleGuard("PANDIT")] }, submitOnboarding);
app.get(`${API_PREFIX}/pandit/samagri-packages`, { preHandler: [authenticate, roleGuard("PANDIT")] }, getSamagriPackages);
app.post(`${API_PREFIX}/pandit/samagri-packages`, { preHandler: [authenticate, roleGuard("PANDIT")] }, saveSamagriPackages);
app.get(`${API_PREFIX}/pandits/samagri-packages`, { preHandler: [authenticate, roleGuard("PANDIT")] }, getSamagriPackages);
app.post(`${API_PREFIX}/pandits/samagri-packages`, { preHandler: [authenticate, roleGuard("PANDIT")] }, saveSamagriPackages);

// Booking-readiness wizard (resumable; readinessStep persisted server-side)
app.get(`${API_PREFIX}/pandit/readiness`, { preHandler: [authenticate, roleGuard("PANDIT")] }, getReadiness);
app.patch(`${API_PREFIX}/pandit/readiness`, { preHandler: [authenticate, roleGuard("PANDIT")] }, patchReadiness);

// Singular paths
app.patch(`${API_PREFIX}/pandit/status`, { preHandler: [authenticate, roleGuard("PANDIT")] }, patchPanditStatus);
app.get(`${API_PREFIX}/pandit/bookings`, { preHandler: [authenticate, roleGuard("PANDIT")] }, getPanditBookings);
app.get(`${API_PREFIX}/pandit/bookings/:id`, { preHandler: [authenticate, roleGuard("PANDIT")] }, getPanditBookingById);
app.post(`${API_PREFIX}/pandit/bookings/:id/accept`, { preHandler: [authenticate, roleGuard("PANDIT")] }, acceptBooking);
app.post(`${API_PREFIX}/pandit/bookings/:id/reject`, { preHandler: [authenticate, roleGuard("PANDIT")] }, rejectBooking);
// Alias: "decline" is the plugin's name for the same action — register it here
// so a client using either verb can never 404 on this money-path step.
app.post(`${API_PREFIX}/pandit/bookings/:id/decline`, { preHandler: [authenticate, roleGuard("PANDIT")] }, rejectBooking);
app.post(`${API_PREFIX}/pandit/bookings/:id/journey`, { preHandler: [authenticate, roleGuard("PANDIT")] }, postBookingJourney);
app.post(`${API_PREFIX}/pandit/bookings/:id/complete`, { preHandler: [authenticate, roleGuard("PANDIT")] }, completeBooking);
app.get(`${API_PREFIX}/pandit/earnings/summary`, { preHandler: [authenticate, roleGuard("PANDIT")] }, getPanditEarningsSummary);
app.get(`${API_PREFIX}/pandit/stats`, { preHandler: [authenticate, roleGuard("PANDIT")] }, getPanditStats);
app.get(`${API_PREFIX}/pandit/payouts`, { preHandler: [authenticate, roleGuard("PANDIT")] }, getPanditPayouts);
app.post(`${API_PREFIX}/pandit/milestones/seen`, { preHandler: [authenticate, roleGuard("PANDIT")] }, markMilestonesSeen);
app.patch(`${API_PREFIX}/pandit/profile`, { preHandler: [authenticate, roleGuard("PANDIT")] }, patchPanditProfile);
app.post(`${API_PREFIX}/pandit/dakshina-rates`, { preHandler: [authenticate, roleGuard("PANDIT")] }, upsertDakshinaRate);
app.delete(`${API_PREFIX}/pandit/specializations/:poojaType`, { preHandler: [authenticate, roleGuard("PANDIT")] }, removeSpecialization);
app.get(`${API_PREFIX}/pandit/blocked-dates`, { preHandler: [authenticate, roleGuard("PANDIT")] }, getBlockedDates);
app.post(`${API_PREFIX}/pandit/blocked-dates`, { preHandler: [authenticate, roleGuard("PANDIT")] }, createBlockedDate);
app.delete(`${API_PREFIX}/pandit/blocked-dates/:date`, { preHandler: [authenticate, roleGuard("PANDIT")] }, deleteBlockedDate);
// सत्यापन: per-puja video verification (submit / re-submit + my badges)
app.post(`${API_PREFIX}/pandit/pooja-verification`, { preHandler: [authenticate, roleGuard("PANDIT")] }, submitPoojaVerification);
app.get(`${API_PREFIX}/pandit/pooja-verifications`, { preHandler: [authenticate, roleGuard("PANDIT")] }, getMyPoojaVerifications);
app.post(`${API_PREFIX}/pandit/pooja-config`, { preHandler: [authenticate, roleGuard("PANDIT")] }, savePoojaConfig);
app.get(`${API_PREFIX}/pandit/pooja-configs`, { preHandler: [authenticate, roleGuard("PANDIT")] }, getPoojaConfigs);

const handleSTT = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const file = await request.file();
    if (!file) {
      return reply.send({ success: false, error: { code: "stt_failed" } });
    }

    const { DEEPGRAM_API_KEY } = env;
    if (!DEEPGRAM_API_KEY || DEEPGRAM_API_KEY.length < 10) {
      request.log.error("Deepgram is not configured");
      return reply.send({ success: false, error: { code: "stt_failed" } });
    }

    const audioBuffer = await file.toBuffer();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    // J3c: command-mode transcriptions (1-3 word answers) skip
    // smart_format — measurably faster, and formatting adds nothing to
    // "हाँ"/"आगे". Field dictation keeps it.
    const q = request.query as { mode?: string; language?: string } | undefined;
    const mode = q?.mode;
    const smartFormat = mode === "command" ? "false" : "true";
    // L4/P2: the client sends the active language code for every non-hi
    // language; this set decides which get a NATIVE Deepgram model.
    // - en: native (English keywords exist throughout the app).
    // - ta is DELIBERATELY withheld even though nova-2 supports it: the
    //   ta model emits Tamil script, but every screen-command keyword
    //   (language tiles, tutorial commands) is Devanagari/Latin — routing
    //   ta natively would kill those matches. ta stays on the hi model
    //   (base Hindi grammar keeps working) until keyword surfaces are
    //   localized per language.
    // - mr/bn/te/kn/gu/pa/ml/or: no nova-2 model — hi fallback. mr's
    //   grammar extensions are Devanagari, so they arrive intact through
    //   the hi model; the other scripts wait on Deepgram support.
    const NOVA2_NATIVE = new Set(["en", "hi"]);
    const sttLanguage = q?.language && NOVA2_NATIVE.has(q.language) ? q.language : "hi";

    try {
      const response = await fetch(
        `https://api.deepgram.com/v1/listen?model=nova-2&language=${sttLanguage}&smart_format=${smartFormat}&punctuate=false`,
        {
          method: "POST",
          headers: {
            Authorization: `Token ${DEEPGRAM_API_KEY}`,
            "Content-Type": file.mimetype,
          },
          body: audioBuffer,
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        request.log.error(`Deepgram STT API error: ${response.status} ${errorText}`);
        return reply.send({ success: false, error: { code: "stt_failed" } });
      }

      const data = (await response.json()) as any;
      const transcript = data.results?.channels?.[0]?.alternatives?.[0]?.transcript || "";
      const confidence = data.results?.channels?.[0]?.alternatives?.[0]?.confidence || 0;

      return reply.send({
        success: true,
        data: {
          transcript,
          confidence,
        },
      });
    } catch (err: any) {
      clearTimeout(timeoutId);
      request.log.error(`Deepgram STT call failed or timed out: ${err.message || err}`);
      return reply.send({ success: false, error: { code: "stt_failed" } });
    }
  } catch (err: any) {
    request.log.error(`STT route exception: ${err.message || err}`);
    return reply.send({ success: false, error: { code: "stt_failed" } });
  }
};

// PARICHAY: the entry flow converses BEFORE login (शिष्य earns the mic on
// the परिचय screen, location answers हाँ/नहीं by voice) — so STT accepts
// anonymous callers. Abuse stays bounded by the same 30/min limiter,
// keyed per-user when authenticated and per-IP when anonymous.
const sttRouteConfig = {
  config: {
    rateLimit: {
      max: 30,
      timeWindow: 60000,
      keyGenerator: (request: FastifyRequest) => {
        return (request as any).user?.id || request.ip || "0.0.0.0";
      },
    },
  },
  preHandler: [optionalAuth],
};

app.post("/api/stt", sttRouteConfig, handleSTT);
app.post(`${API_PREFIX}/stt`, sttRouteConfig, handleSTT);

// Plural /pandits/* equivalents are served by the panditRoutes plugin (registered
// below with prefix /pandits); registering them here too crashed Fastify with
// FST_ERR_DUPLICATED_ROUTE. The pandit app only calls the singular /pandit/* paths.

app.register(authRoutes, { prefix: `${API_PREFIX}/auth` });
app.register(customerRoutes, { prefix: `${API_PREFIX}/customers` });
app.register(panditRoutes, { prefix: `${API_PREFIX}/pandits` });
app.register(ritualRoutes, { prefix: `${API_PREFIX}/rituals` });
app.register(bookingRoutes, { prefix: `${API_PREFIX}/bookings` });
app.register(paymentRoutes, { prefix: `${API_PREFIX}/payments` });
app.register(reviewRoutes, { prefix: `${API_PREFIX}/reviews` });
app.register(adminRoutes, { prefix: `${API_PREFIX}/admin` });
app.register(notificationRoutes, { prefix: `${API_PREFIX}/notifications` });
app.register(travelRoutes, { prefix: `${API_PREFIX}/travel` });
app.register(muhuratRoutes, { prefix: `${API_PREFIX}/muhurat` });
app.register(samagriRoutes, { prefix: API_PREFIX });
app.register(voiceRoutes, { prefix: `${API_PREFIX}/voice` });
app.register(feedbackRoutes, { prefix: `${API_PREFIX}/feedback` });
app.register(shishyaRoutes, { prefix: `${API_PREFIX}/shishya` });
app.register(shishyaAgentRoutes, { prefix: `${API_PREFIX}/shishya` });
app.register(kycRoutes, { prefix: `${API_PREFIX}/admin/kyc` });
app.register(onboardingRoutes, { prefix: `${API_PREFIX}/pandits/onboarding` });
app.register(uploadRoutes, { prefix: `${API_PREFIX}/upload` });
app.get(`${API_PREFIX}/files/presign`, { preHandler: [authenticate] }, presignFile);
app.register(aiRoutes, { prefix: `${API_PREFIX}/ai` });

// Serve uploaded files off local disk ONLY in the dev fallback. In production
// R2 is authoritative and files are served via short-lived presigned URLs — the
// static route's root (public/uploads) does not exist there, and registering it
// is what logged the "public/uploads directory not found" warning (the
// disk-fallback tell). Skip it whenever object storage is configured. (BB2)
if (!isStorageConfigured()) {
  app.register(fastifyStatic, {
    root: join(process.cwd(), "public/uploads"),
    prefix: "/uploads",
  });
}

// ── 404 Handler ───────────────────────────────────────────────────────────────
app.setNotFoundHandler(notFoundHandler);

// ── Global Error Handler ──────────────────────────────────────────────────────
app.setErrorHandler(errorHandler);

export default app;
