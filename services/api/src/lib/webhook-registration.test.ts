import assert from "node:assert";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// ─────────────────────────────────────────────────────────────
// Q4 WEBHOOK SELF-REGISTRATION GUARD. BUILD-FAILING.
// POST /payments/admin/webhook lets the server register its own Razorpay
// webhook (the dashboard is KYC-gated). Laws pinned here:
//   1) ADMIN-gated — never CUSTOMER/PANDIT/anonymous.
//   2) URL pinned to OUR API host — an admin token must not be able to
//      point payment webhooks at an arbitrary target.
//   3) The webhook secret comes ONLY from env and NEVER appears in any
//      response (sanitized projection).
//   4) Registration refuses to proceed without RAZORPAY_WEBHOOK_SECRET —
//      an unverifiable webhook would be rejected by the L-J route anyway.
// ─────────────────────────────────────────────────────────────

const API_SRC = join(__dirname, "..");
const read = (rel: string) => readFileSync(join(API_SRC, rel), "utf8");

console.log("Running webhook-registration guard (Q4)…");

const routes = read("routes/payment.routes.ts");
const service = read("services/payment.service.ts");

// 1) admin-gated route
assert.ok(
  /fastify\.post\("\/admin\/webhook",\s*\{\s*preHandler:\s*\[authenticate,\s*roleGuard\("ADMIN"\)\]/.test(routes),
  "/payments/admin/webhook must be authenticate + roleGuard(ADMIN)",
);

// 2) URL pinned to our API host, and the pin is checked before registering
assert.ok(
  /hmarepanditji-api\\\.onrender\\\.com/.test(routes) && /WEBHOOK_URL_INVALID/.test(routes),
  "webhook URL must be pinned to the HmarePanditJi API host (WEBHOOK_URL_INVALID)",
);

// 3) secret only from env; responses use the sanitized projection
assert.ok(
  /secret:\s*env\.RAZORPAY_WEBHOOK_SECRET/.test(service),
  "registration must send the env webhook secret (no other source)",
);
assert.ok(
  /function sanitizeWebhook/.test(service) && /sanitizeWebhook\(existing\)/.test(service) && /sanitizeWebhook\(body\)/.test(service),
  "every returned webhook must pass the sanitized (non-secret) projection",
);
assert.ok(
  !/secret:\s*w\.secret|webhook\.secret/.test(service),
  "the webhook secret must never be echoed back",
);

// 4) fail-closed without the secret
assert.ok(
  /WEBHOOK_SECRET_MISSING/.test(service),
  "registration must refuse when RAZORPAY_WEBHOOK_SECRET is unset",
);

console.log("webhook-registration guard: ADMIN-gated + host-pinned + secret-sanitized ✅");
