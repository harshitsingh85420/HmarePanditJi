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
import kycRoutes from "./routes/kyc.routes";
import onboardingRoutes from "./routes/onboarding.routes";
import uploadRoutes from "./routes/upload.routes";
import aiRoutes from "./routes/ai.routes";

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

// CORS (replaces cors)
const allowedOrigins = [
  ...ALLOWED_ORIGINS,
  env.WEB_URL,
  env.PANDIT_URL,
  env.ADMIN_URL,
].filter(Boolean);

app.register(fastifyCors, {
  origin: allowedOrigins,
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
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
app.get("/health", async (_request: FastifyRequest, reply: FastifyReply) => {
  return reply.send({ status: "ok", timestamp: new Date(), version: "1.0.0" });
});

app.get("/api/health", async (_request: FastifyRequest, reply: FastifyReply) => {
  return reply.send({ status: "ok", timestamp: new Date(), version: "1.0.0" });
});

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

// ── Routes ────────────────────────────────────────────────────────────────────
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
app.register(kycRoutes, { prefix: `${API_PREFIX}/admin/kyc` });
app.register(onboardingRoutes, { prefix: `${API_PREFIX}/pandits/onboarding` });
app.register(uploadRoutes, { prefix: `${API_PREFIX}/upload` });
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
