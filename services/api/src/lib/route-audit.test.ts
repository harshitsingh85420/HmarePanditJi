import assert from "node:assert";
// BB1d — BUILD-FAILING ROUTE GUARD. Cross-checks every backend API call in
// apps/{pandit,admin,web} against the Fastify route table. If a future edit
// mistypes a path, points at the wrong method, or drops the /api/v1 prefix,
// this test fails and the silent 404 never ships. Same spirit as the one-voice
// grep test. The audit logic itself lives in scripts/route-audit.mjs.
// @ts-ignore -- plain JS audit script (scripts/route-audit.mjs), no type decls
import { audit } from "../../scripts/route-audit.mjs";

console.log("Running route-audit guard (BB1d): client calls vs API route table...");

const { mismatches, backend, routes } = audit();

if (mismatches.length) {
  console.error(`\n${mismatches.length} client→API route mismatch(es):`);
  for (const m of mismatches) {
    console.error(`  [${m.app}] ${m.method} ${m.logical}  (${m.file}:${m.line})  — ${m.reason}`);
  }
}

assert.strictEqual(
  mismatches.length,
  0,
  `${mismatches.length} client→API route mismatch(es) would ship a silent 404 — fix the call sites above`,
);
assert.ok(routes.length > 100, "route table parsed (sanity)");
assert.ok(backend.length > 50, "client backend calls parsed (sanity)");

console.log(`route-audit: ${backend.length} backend calls vs ${routes.length} routes — 0 mismatches ✅`);
