import assert from "node:assert";
// L1 — BUILD-FAILING EXACTLY-ONCE GUARD. Every mutating api() call in the
// pandit app must go through mutateOnce() (or be on the exempt allowlist:
// /auth, /shishya, /feedback). A future screen adding a raw money-write
// (readiness save, dakshina edit, online toggle, calendar block, upload…)
// fails the build here. Audit logic lives in scripts/mutate-idempotency.mjs.
// @ts-ignore -- plain JS audit script, no type decls
import { audit } from "../../scripts/mutate-idempotency.mjs";

console.log("Running exactly-once guard (L1): raw api() mutations vs mutateOnce…");

const { violations, wrapped } = audit();

if (violations.length) {
  console.error(`\n${violations.length} raw api() mutation(s) bypass mutateOnce (double-tap/voice+tap can double-fire):`);
  for (const v of violations) {
    console.error(`  ${v.method.padEnd(6)} ${v.path}   [${v.file}:${v.line}]`);
  }
  console.error("\nFix: route these through mutateOnce(actionKey, path, opts) from @/lib/mutate.");
}

assert.strictEqual(
  violations.length,
  0,
  `${violations.length} raw api() mutation(s) bypass the exactly-once wrapper — wrap them in mutateOnce`,
);
assert.ok(wrapped >= 15, `expected >=15 mutateOnce writes (sanity), found ${wrapped}`);

console.log(`exactly-once guard: ${wrapped} mutateOnce writes, 0 raw-api mutations ✅`);
