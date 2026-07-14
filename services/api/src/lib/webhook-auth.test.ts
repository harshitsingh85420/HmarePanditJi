import assert from "node:assert";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// ─────────────────────────────────────────────────────────────
// LAW L-J — MONEY-PATH WEBHOOK AUTH (SM-SEC). BUILD-FAILING GUARD.
// The Razorpay webhook mutates payment state (marks a booking PAID →
// PANDIT_REQUESTED, or REFUNDED). Two fail-OPEN holes let anyone forge that:
//   1) route: `if (signature && !verify)` skipped verification entirely when
//      the x-razorpay-signature header was ABSENT — an unsigned payload was
//      processed.
//   2) service: verifyWebhookSignature returned TRUE when the webhook secret
//      was unset ("accept all payloads") — fail-open even in production.
// LAW: a webhook must carry a VALID signature, verified against the RAW body,
// and a missing secret fails CLOSED in production. This guard fails the build
// if either hole is reintroduced.
// ─────────────────────────────────────────────────────────────

const API_SRC = join(__dirname, "..");
const read = (rel: string) => readFileSync(join(API_SRC, rel), "utf8");

console.log("Running webhook-auth guard (L-J money-path)…");

const routes = read("routes/payment.routes.ts");
const service = read("services/payment.service.ts");
const app = read("app.ts");

// 1) the webhook route must REQUIRE a signature (reject when absent) and must
//    NOT contain the old presence-gated bypass.
assert.ok(
  /if\s*\(\s*!signature\s*\|\|\s*!verifyWebhookSignature\s*\(/.test(routes),
  "webhook must reject a missing OR invalid signature (fail closed)",
);
assert.ok(
  !/if\s*\(\s*signature\s*&&\s*!verifyWebhookSignature/.test(routes),
  "the presence-gated bypass `if (signature && !verify)` must be gone",
);
// it must verify against the RAW body, not a re-serialized object only.
assert.ok(/rawBody/.test(routes), "webhook must verify against the raw body");

// 2) the raw body is preserved by the content-type parser for verification.
assert.ok(
  /\(req as any\)\.rawBody\s*=\s*s/.test(app),
  "the JSON content-type parser must preserve req.rawBody for signature verification",
);

// 3) a missing webhook secret fails CLOSED in production.
{
  const idx = service.indexOf("verifyWebhookSignature");
  assert.ok(idx > 0, "verifyWebhookSignature must exist");
  const body = service.slice(idx, idx + 700);
  assert.ok(
    /NODE_ENV\s*===\s*"production"/.test(body) && /return false/.test(body),
    "missing webhook secret must return false (reject) in production, not accept-all",
  );
}

// self-check: the guard regexes catch the known-bad patterns.
assert.ok(/if\s*\(\s*signature\s*&&\s*!verifyWebhookSignature/.test('if (signature && !verifyWebhookSignature(a,b))'), "self-check: bypass regex");

console.log("webhook-auth guard: signature required + raw-body verified + prod fail-closed ✅");
