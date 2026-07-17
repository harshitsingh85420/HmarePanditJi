import assert from "node:assert";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// ─────────────────────────────────────────────────────────────
// API-BASE NORMALIZATION GUARD (money-path adjacent). The web wizard's
// booking + create-order calls ride API_BASE from auth-context. The
// deployed NEXT_PUBLIC_API_URL carries NO /api/v1 path and only /auth/*
// has a legacy 308 redirect — a raw base 404s POST /bookings (found live
// in the P-PAY E2E). API_BASE must therefore be normalized to end with
// /api/v1 regardless of the env var's shape.
// ─────────────────────────────────────────────────────────────

console.log("Running api-base-normalized guard (web money-path)…");

const ctx = readFileSync(
  join(__dirname, "..", "..", "..", "..", "apps", "web", "src", "context", "auth-context.tsx"),
  "utf8",
);

assert.ok(
  /endsWith\("\/api\/v1"\)/.test(ctx),
  "API_BASE must check for the /api/v1 suffix",
);
assert.ok(
  /\$\{RAW_API_URL\}\/api\/v1/.test(ctx),
  "API_BASE must append /api/v1 when the env var lacks it",
);
assert.ok(
  !/export const API_BASE =\s*process\.env\.NEXT_PUBLIC_API_URL \?\?/.test(ctx),
  "the raw un-normalized export must not come back",
);

console.log("api-base-normalized guard: API_BASE always ends in /api/v1 ✅");
