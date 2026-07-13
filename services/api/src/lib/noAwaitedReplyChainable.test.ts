import assert from "node:assert";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

// ─────────────────────────────────────────────────────────────
// CM-1 — BUILD-FAILING HANDLER-TERMINATION GUARD.
// LAW: a Fastify handler must NEVER `await` a reply-CHAINABLE method
// (setCookie / cookie / header / headers / code / status / type /
// redirect). Those return the `reply` object; `await reply` only
// settles once the response is SENT, but sending is blocked by that
// very await → self-deadlock. This shipped in verifyOtp + adminLogin
// and hung EVERY customer and admin login (http 000, ≥30s) on warm
// production — a real customer could never authenticate or book.
// One enforcement point: this grep. If a future handler awaits a
// reply-chainable, the build fails here. Same spirit as the one-voice
// and route-audit guards.
// ─────────────────────────────────────────────────────────────

const SRC = join(__dirname, "..");
// reply-chainable methods that return the reply (awaiting them deadlocks).
// `send`/`sendFile` are NOT chainable-returning in the deadlock sense and
// are legitimately awaited elsewhere, so they are intentionally excluded.
const AWAIT_REPLY_CHAINABLE = /await\s+reply\s*\.\s*(setCookie|cookie|clearCookie|header|headers|code|status|type|redirect)\b/;

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    const st = statSync(p);
    if (st.isDirectory()) {
      if (entry === "node_modules" || entry === "dist") continue;
      walk(p, out);
    } else if (/\.(ts|js|mjs)$/.test(entry) && !/\.test\.(ts|js)$/.test(entry)) {
      out.push(p);
    }
  }
  return out;
}

console.log("Running handler-termination guard (CM-1): no awaited reply-chainable...");

const violations: string[] = [];
for (const file of walk(SRC)) {
  const lines = readFileSync(file, "utf8").split("\n");
  lines.forEach((line, i) => {
    if (AWAIT_REPLY_CHAINABLE.test(line)) {
      violations.push(`${file.replace(SRC, "src")}:${i + 1}  ${line.trim()}`);
    }
  });
}

if (violations.length) {
  console.error(`\n${violations.length} awaited reply-chainable(s) — each DEADLOCKS the response:`);
  for (const v of violations) console.error("  " + v);
  console.error("\nFix: drop the `await` — these methods are synchronous and return the reply.");
}

assert.strictEqual(
  violations.length,
  0,
  `${violations.length} awaited reply-chainable(s) would hang the request forever (CM-1 class) — remove the await`,
);

// self-check: the guard's own regex must actually match the known-bad form
assert.ok(
  AWAIT_REPLY_CHAINABLE.test('await reply.setCookie("hpj_token", token, OPTS);'),
  "guard regex must match the known CM-1 deadlock pattern",
);

console.log("handler-termination guard: 0 awaited reply-chainables ✅");
