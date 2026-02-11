import dotenv from "dotenv";
dotenv.config({ path: "../../.env" });

import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

const app = express();
const PORT = process.env.API_PORT || 4000;

// ── Security ──────────────────────────────────────────────────────────────────
app.use(helmet());

// ── CORS ──────────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: [
      process.env.WEB_URL || "http://localhost:3000",
      process.env.PANDIT_URL || "http://localhost:3001",
      process.env.ADMIN_URL || "http://localhost:3002",
    ],
    credentials: true,
  }),
);

// ── Logging ───────────────────────────────────────────────────────────────────
app.use(morgan("dev"));

// ── Body Parsing ──────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Health Check ──────────────────────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({
    success: true,
    message: "HmarePanditJi API is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    version: "0.1.0",
  });
});

// ── API Root ──────────────────────────────────────────────────────────────────
app.get("/api", (_req, res) => {
  res.json({
    success: true,
    data: {
      name: "HmarePanditJi API",
      version: "0.1.0",
      description:
        "India's first platform for booking verified Hindu priests (Pandits) — Delhi-NCR Phase 1",
      endpoints: {
        health: "GET /health",
        api: "GET /api",
        auth: "/api/auth/*",
        pandits: "/api/pandits/*",
        bookings: "/api/bookings/*",
      },
    },
  });
});

// ── Auth routes stub ──────────────────────────────────────────────────────────
app.post("/api/auth/send-otp", (_req, res) => {
  res.json({ success: true, message: "OTP sent (stub)" });
});

app.post("/api/auth/verify-otp", (_req, res) => {
  res.json({ success: true, message: "OTP verified (stub)", token: "jwt-stub" });
});

// ── Pandit routes stub ────────────────────────────────────────────────────────
app.get("/api/pandits", (_req, res) => {
  res.json({ success: true, data: [], total: 0, page: 1, limit: 20, totalPages: 0 });
});

app.get("/api/pandits/:id", (req, res) => {
  res.json({ success: true, data: { id: req.params.id } });
});

// ── Booking routes stub ───────────────────────────────────────────────────────
app.get("/api/bookings", (_req, res) => {
  res.json({ success: true, data: [], total: 0, page: 1, limit: 20, totalPages: 0 });
});

app.post("/api/bookings", (_req, res) => {
  res.status(201).json({ success: true, message: "Booking created (stub)" });
});

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, error: "Route not found" });
});

// ── Error Handler ─────────────────────────────────────────────────────────────
app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    console.error("[Error]", err.message);
    res.status(500).json({
      success: false,
      error:
        process.env.NODE_ENV === "production"
          ? "Internal server error"
          : err.message,
    });
  },
);

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`
  ────────────────────────────────────
   HmarePanditJi API  v0.1.0
  ────────────────────────────────────
   Port   : ${PORT}
   Env    : ${process.env.NODE_ENV || "development"}
   Health : http://localhost:${PORT}/health
  ────────────────────────────────────
  `);
});

export default app;
