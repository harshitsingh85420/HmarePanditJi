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
import kycRoutes from "./routes/kyc.routes";
import onboardingRoutes from "./routes/onboarding.routes";
import uploadRoutes from "./routes/upload.routes";
import aiRoutes from "./routes/ai.routes";
import { submitOnboarding } from "./controllers/onboarding.controller";
import { getReadiness, patchReadiness } from "./controllers/readiness.controller";
import { presignFile } from "./controllers/upload.controller";
import { authenticate, optionalAuth } from "./middleware/auth";
import { roleGuard } from "./middleware/roleGuard";
import {
  getSamagriPackages,
  saveSamagriPackages,
  patchPanditStatus,
  getPanditBookings,
  getPanditBookingById,
  getPanditEarningsSummary,
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

// Enforce role PANDIT on all /pandit/* or /pandits/* routes
app.addHook("preHandler", async (request, reply) => {
  const url = request.url;
  if (url.startsWith(`${API_PREFIX}/pandits`) || url.startsWith(`${API_PREFIX}/pandit`)) {
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
app.post(`${API_PREFIX}/pandit/bookings/:id/journey`, { preHandler: [authenticate, roleGuard("PANDIT")] }, postBookingJourney);
app.post(`${API_PREFIX}/pandit/bookings/:id/complete`, { preHandler: [authenticate, roleGuard("PANDIT")] }, completeBooking);
app.get(`${API_PREFIX}/pandit/earnings/summary`, { preHandler: [authenticate, roleGuard("PANDIT")] }, getPanditEarningsSummary);
app.get(`${API_PREFIX}/pandit/payouts`, { preHandler: [authenticate, roleGuard("PANDIT")] }, getPanditPayouts);
app.post(`${API_PREFIX}/pandit/milestones/seen`, { preHandler: [authenticate, roleGuard("PANDIT")] }, markMilestonesSeen);
app.patch(`${API_PREFIX}/pandit/profile`, { preHandler: [authenticate, roleGuard("PANDIT")] }, patchPanditProfile);
app.post(`${API_PREFIX}/pandit/dakshina-rates`, { preHandler: [authenticate, roleGuard("PANDIT")] }, upsertDakshinaRate);
app.delete(`${API_PREFIX}/pandit/specializations/:poojaType`, { preHandler: [authenticate, roleGuard("PANDIT")] }, removeSpecialization);
app.get(`${API_PREFIX}/pandit/blocked-dates`, { preHandler: [authenticate, roleGuard("PANDIT")] }, getBlockedDates);
app.post(`${API_PREFIX}/pandit/blocked-dates`, { preHandler: [authenticate, roleGuard("PANDIT")] }, createBlockedDate);
app.delete(`${API_PREFIX}/pandit/blocked-dates/:date`, { preHandler: [authenticate, roleGuard("PANDIT")] }, deleteBlockedDate);

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
app.register(kycRoutes, { prefix: `${API_PREFIX}/admin/kyc` });
app.register(onboardingRoutes, { prefix: `${API_PREFIX}/pandits/onboarding` });
app.register(uploadRoutes, { prefix: `${API_PREFIX}/upload` });
app.get(`${API_PREFIX}/files/presign`, { preHandler: [authenticate] }, presignFile);
app.register(aiRoutes, { prefix: `${API_PREFIX}/ai` });

// Serve uploaded files statically (replaces express.static)
app.register(fastifyStatic, {
  root: join(process.cwd(), "public/uploads"),
  prefix: "/uploads",
});

// ── 404 Handler ───────────────────────────────────────────────────────────────
app.setNotFoundHandler(notFoundHandler);

// ── Global Error Handler ──────────────────────────────────────────────────────
app.setErrorHandler(errorHandler);

export default app;
