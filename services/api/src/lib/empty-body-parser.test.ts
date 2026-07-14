import assert from "node:assert";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// PHASE-4 FINDING GUARD. The client's api() sets Content-Type:
// application/json on EVERY request, but action POSTs (booking
// accept/reject/complete, logout, milestones/seen) send NO body. Without
// a custom parser Fastify 400s them with "Body cannot be empty" — so a
// real pandit could never accept/reject/complete a booking (invisible to
// code reading; only forcing the flow live caught it). app.ts must parse
// an empty json body as {}. This guard fails the build if that parser is
// removed.

const appTs = readFileSync(join(__dirname, "..", "app.ts"), "utf8");

console.log("Running empty-json-body parser guard (Phase-4)…");

assert.ok(
  /addContentTypeParser\(\s*["']application\/json["']/.test(appTs),
  "app.ts must register a custom application/json content-type parser (empty-body fix)",
);
assert.ok(
  /done\(null,\s*\{\}\)/.test(appTs),
  "the json parser must resolve an EMPTY body to {} (else bodyless action POSTs 400 'Body cannot be empty')",
);

console.log("empty-json-body parser guard: present ✅");
