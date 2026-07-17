import assert from "node:assert";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// ─────────────────────────────────────────────────────────────
// TRUST-PROXY GUARD. The API runs behind Render's proxy: without
// trustProxy, request.ip is the proxy address for EVERY client, which
// collapses the per-IP rate limiter into one shared 100/min bucket for
// the whole platform (found live: a single session 429'd POST /bookings).
// The limiter's keyGenerator uses request.ip — trustProxy must stay on.
// ─────────────────────────────────────────────────────────────

console.log("Running trust-proxy guard (shared rate-limit bucket)…");

const app = readFileSync(join(__dirname, "..", "app.ts"), "utf8");

assert.ok(/trustProxy:\s*true/.test(app), "Fastify must be created with trustProxy: true");
// the limiter still keys on request.ip — meaningful only WITH trustProxy
assert.ok(/keyGenerator.*request\.ip/s.test(app), "rate limiter must key on request.ip (per-client with trustProxy)");

console.log("trust-proxy guard: per-client rate-limit buckets restored ✅");
