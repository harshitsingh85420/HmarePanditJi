import assert from "node:assert";
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { codeOnly } from "@hmarepanditji/utils/code-only";

// ─────────────────────────────────────────────────────────────
// THE RAZORPAY MOCK PATH MUST NOT EXIST IN A PRODUCTION BUILD.
// Isj order, 2026-07-29 — harden now, ruling on the bypass separate.
//
// It used to open on `razorpayKey === "rzp_test_mock"` alone. A magic string is
// a weak lock anywhere; in THIS repo it is a bad one, because this campaign
// proved the codebase carried FOUR different values of one env var under TWO
// incompatible contracts. A bypass whose only lock is a string comparison is
// one env edit away from being unlocked, and nothing would fail.
//
// THE UNREACHABILITY PATTERN, applied to a bundle: `process.env.NODE_ENV` is
// statically substituted at build time, so `NODE_ENV !== "production" && …`
// makes the whole branch DEAD CODE that the minifier removes. In a production
// bundle the mock does not exist to be reached — setting the magic value in
// prod cannot revive it. That is stronger than "the condition is false".
//
// BOTH DIRECTIONS ARE ASSERTED:
//   · prod  — the branch is gated so the build can eliminate it
//   · dev   — the mock is still available, because local flows without
//             Razorpay keys depend on it
// ─────────────────────────────────────────────────────────────

console.log("Running Razorpay mock-gate guard...");

const REPO = join(__dirname, "..", "..", "..", "..");
const CHECKOUT = "apps/web/src/components/RazorpayCheckout.tsx";
const src = codeOnly(readFileSync(join(REPO, CHECKOUT), "utf8"));

const MAGIC = "rzp_test_mock";

// ── 1. every use of the magic string is NODE_ENV-gated ────────
const uses = [...src.matchAll(new RegExp(`[^\\n]*${MAGIC}[^\\n]*`, "g"))].map((m) => m[0]);
assert.ok(uses.length > 0, `"${MAGIC}" not found in ${CHECKOUT} — the reader has rotted`);
for (const line of uses) {
  assert.ok(
    /process\.env\.NODE_ENV\s*!==\s*["']production["']/.test(line),
    `this use of "${MAGIC}" is not gated on NODE_ENV, so it SHIPS in the production bundle and\n` +
      `the mock is one env value away from being reachable in prod:\n    ${line.trim()}\n` +
      `Gate it: process.env.NODE_ENV !== "production" && razorpayKey === "${MAGIC}"`,
  );
}

// ── 2. the branch still calls the REAL verify, never a shortcut ──
// The mock must skip the Razorpay MODAL, never the server's verification.
// If it ever calls onSuccess directly it would mark a booking paid client-side.
const mockAt = src.indexOf(MAGIC);
const branch = src.slice(mockAt, mockAt + 700);
assert.ok(
  /verify\(/.test(branch),
  "the mock branch must call verify() — the server's HMAC check is what makes this safe. " +
    "A mock that calls onSuccess directly would mark a booking paid without any verification.",
);
assert.ok(
  !/onSuccess\s*\(/.test(branch),
  "the mock branch calls onSuccess directly, bypassing the server's signature check entirely",
);

// ── 3. the SERVER never trusts the client — no dev bypass there ──
const PAY = codeOnly(readFileSync(join(REPO, "services/api/src/services/payment.service.ts"), "utf8"));
const verifyFn = PAY.slice(PAY.indexOf("paymentId: string,"), PAY.indexOf("export async function initiateRefund"));
assert.ok(
  /createHmac\("sha256"/.test(verifyFn),
  "signature verification must be a real HMAC",
);
assert.ok(
  !/NODE_ENV/.test(verifyFn),
  "the signature verifier must have NO environment branch — a dev bypass on the SERVER would " +
    "make the client gate irrelevant, because the client is not the thing being trusted",
);
assert.ok(
  /if \(!env\.RAZORPAY_KEY_SECRET\)[\s\S]{0,120}return false/.test(verifyFn),
  "a missing secret must FAIL CLOSED (return false), never accept",
);

// ── 4. the verify ROUTE enforces the result before crediting ──
const ROUTES = codeOnly(readFileSync(join(REPO, "services/api/src/routes/payment.routes.ts"), "utf8"));
const vIdx = ROUTES.indexOf("verifyRazorpaySignature(");
const pIdx = ROUTES.indexOf("processPaymentSuccess(");
assert.ok(vIdx > -1 && pIdx > vIdx, "the signature must be verified BEFORE processPaymentSuccess");
assert.ok(
  /if \(!isValid\)[\s\S]{0,160}throw new AppError/.test(ROUTES),
  "an invalid signature must throw before the booking is credited",
);

// ── 5. if a production bundle exists, the string must be ABSENT ──
// This is the proof that the gate is UNREACHABILITY and not merely a false
// condition: the minifier should have removed the branch entirely.
const NEXT = join(REPO, "apps/web/.next");
if (existsSync(NEXT)) {
  const walk = (d: string, out: string[] = []): string[] => {
    for (const e of readdirSync(d)) {
      const p = join(d, e);
      if (statSync(p).isDirectory()) walk(p, out);
      else if (e.endsWith(".js")) out.push(p);
    }
    return out;
  };
  const chunks = walk(join(NEXT, "static")).filter((f) => existsSync(f));
  const leaked = chunks.filter((f) => readFileSync(f, "utf8").includes(MAGIC));
  if (leaked.length && process.env.NODE_ENV === "production") {
    assert.fail(
      `"${MAGIC}" survives in ${leaked.length} production chunk(s) — the branch was not eliminated:\n  ` +
        leaked.slice(0, 3).map((f) => f.replace(REPO, "")).join("\n  "),
    );
  }
  console.log(
    `  (built bundle present: ${chunks.length} chunks scanned, ${leaked.length} contain the dev string` +
      `${leaked.length ? " — expected in a dev build" : ""})`,
  );
}

// ── G2 (2026-07-31): the ungated-use detector's clean specimen is the
// correctly-gated line, one operator apart — a sloppy pattern passes both.
import { proveMatchers, proveSaw } from "./g2";
proveSaw("razorpayMockGate", "source files read (non-empty)",
  [src, PAY, ROUTES].filter((s) => s.length > 0).length);
proveSaw("razorpayMockGate", "magic-string uses found and judged", uses.length);
proveSaw("razorpayMockGate", "verifier function body extracted (chars)", verifyFn.length);
proveMatchers("razorpayMockGate", [
  ["the NODE_ENV gate on a mock use", /process\.env\.NODE_ENV\s*!==\s*["']production["']/,
    'if (process.env.NODE_ENV !== "production" && razorpayKey === "rzp_test_mock") {',
    'if (razorpayKey === "rzp_test_mock") {'],
  ["a direct onSuccess call (client-side paid)", /onSuccess\s*\(/,
    "      onSuccess(mockPaymentId);", "      await verify(mockPaymentId);"],
  ["the real HMAC", /createHmac\("sha256"/, 'crypto.createHmac("sha256", secret)'],
  ["a NODE_ENV branch inside the server verifier", /NODE_ENV/,
    'if (process.env.NODE_ENV !== "production") return true;'],
  ["fail-closed on a missing secret", /if \(!env\.RAZORPAY_KEY_SECRET\)[\s\S]{0,120}return false/,
    "if (!env.RAZORPAY_KEY_SECRET) {\n    return false;\n  }"],
  ["the invalid-signature throw before crediting", /if \(!isValid\)[\s\S]{0,160}throw new AppError/,
    'if (!isValid) {\n      throw new AppError("Invalid signature", 400);'],
]);

console.log(
  `✓ Razorpay mock-gate guard passed (${uses.length} use(s) NODE_ENV-gated; mock still calls the real ` +
    `verify; server HMAC has no env branch and fails closed; route enforces before crediting)`,
);
