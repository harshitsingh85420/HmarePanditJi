import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import { env } from "./config/env";
import { API_PREFIX, ALLOWED_ORIGINS } from "./config/constants";
import { generalLimiter } from "./middleware/rateLimiter";
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

const app: express.Application = express();

// ── Security ──────────────────────────────────────────────────────────────────
app.use(helmet());

// ── CORS ──────────────────────────────────────────────────────────────────────
const allowedOrigins = [
  ...ALLOWED_ORIGINS,
  env.WEB_URL,
  env.PANDIT_URL,
  env.ADMIN_URL,
].filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// ── Logging ───────────────────────────────────────────────────────────────────
if (env.NODE_ENV !== "test") {
  app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));
}

// ── Body Parsing ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// ── Rate Limiting ─────────────────────────────────────────────────────────────
app.use(generalLimiter);

// ── Health Check (no versioning, no auth) ────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});

// ── API Root ──────────────────────────────────────────────────────────────────
app.get(API_PREFIX, (_req, res) => {
  res.json({
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
      },
    },
  });
});

// ── Routes ────────────────────────────────────────────────────────────────────
app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/customers`, customerRoutes);
app.use(`${API_PREFIX}/pandits`, panditRoutes);
app.use(`${API_PREFIX}/rituals`, ritualRoutes);
app.use(`${API_PREFIX}/bookings`, bookingRoutes);
app.use(`${API_PREFIX}/payments`, paymentRoutes);
app.use(`${API_PREFIX}/reviews`, reviewRoutes);
app.use(`${API_PREFIX}/admin`, adminRoutes);
app.use(`${API_PREFIX}/notifications`, notificationRoutes);
app.use(`${API_PREFIX}/travel`, travelRoutes);
app.use(`${API_PREFIX}/muhurat`, muhuratRoutes);
app.use(API_PREFIX, samagriRoutes);

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use(notFoundHandler);

// ── Global Error Handler ──────────────────────────────────────────────────────
app.use(errorHandler);

export default app;
