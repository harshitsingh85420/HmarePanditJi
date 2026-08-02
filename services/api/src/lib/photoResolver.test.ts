import assert from "node:assert";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { codeOnly } from "@hmarepanditji/utils/code-only";
import { proveMatchers, proveSaw, proveDetects } from "./g2.js";

// ─────────────────────────────────────────────────────────────
// PHOTO-RESOLVER GUARD — ruling 1 of the photo order (2026-08-02).
//
// GET /pandits/:id/photo is the ONE public door to a pandit's photo bytes.
// The column was already public in both projections but held a bare R2 key
// nobody unauthenticated could resolve; this route resolves it — which makes
// it a BOUNDARY, and boundaries get probe-style guards (the F-B3-1 pattern:
// the specimen is the request an attacker would actually send).
//
// THE LAWS PINNED HERE:
//   1. VERIFIED-ONLY, AS A LITERAL IN THE QUERY — not a post-fetch if(), not
//      a default. A PENDING pandit's photo is a 404 to the world. This is the
//      other half of the lifecycle boundary: PHOTO RIDES IDENTITY'S PREDICATE
//      is only safe while a PENDING pandit's photo has no public surface.
//   2. 404 ON NULL — clients render the initial. No placeholder faces.
//   3. REDIRECT, NEVER PROXY — the key never leaves the server, and the
//      Cache-Control lifetime must be shorter than the presign TTL, or a
//      cached redirect outlives the URL it points to and serves 403s.
// ─────────────────────────────────────────────────────────────

const GUARD = "photoResolver";
const REPO = join(dirname(fileURLToPath(import.meta.url)), "../../../..");
const src = codeOnly(readFileSync(join(REPO, "services/api/src/routes/pandit.routes.ts"), "utf8"));
proveSaw(GUARD, "pandit.routes.ts bytes read (comments stripped)", src.length);

// isolate the photo route so assertions cannot accidentally pass on some other
// route's code
const start = src.indexOf('fastify.get("/:id/photo"');
assert.ok(start > -1, "the public photo resolver GET /pandits/:id/photo must exist");
// The window is bounded by the NEXT route registration, not by a fixed char
// count — a fixed 1400 overflowed the first time a comment grew inside the
// route, and a window that silently truncates its subject reports the tail
// of the route as ABSENT (the fixed-lookback class, again).
const nextRoute = src.indexOf("fastify.", start + 10);
const routeSrc = src.slice(start, nextRoute > start ? nextRoute : start + 3000);
assert.ok(routeSrc.includes("redirect"), "the route window must reach the route's own exit");
proveSaw(GUARD, "photo-route window chars", routeSrc.length);

// ── 1 · VERIFIED-ONLY, IN THE QUERY ITSELF ────────────────────
const VERIFIED_IN_WHERE = /where:\s*\{[^}]*verificationStatus:\s*["']VERIFIED["']/;
proveMatchers(GUARD, [
  [
    "the VERIFIED literal inside the where clause",
    VERIFIED_IN_WHERE,
    'where: { userId: id, verificationStatus: "VERIFIED" },',
    "where: { userId: id },",
  ],
  [
    "a proxy that streams the bytes instead of redirecting",
    /getObjectBuffer|\.send\(\s*buffer|pipe\(/,
    "const buf = await getObjectBuffer(key); reply.send(buf);",
    "return reply.redirect(url, 302);",
  ],
]);
assert.ok(
  VERIFIED_IN_WHERE.test(routeSrc),
  "the photo route must pin verificationStatus: \"VERIFIED\" INSIDE the Prisma where — a " +
    "post-fetch if() is a check someone can refactor away from the data it guards, and a " +
    "PENDING pandit's photo must be a 404 to the world. This is the probe: " +
    "GET /pandits/{pending-id}/photo -> 404.",
);

// ── 2 · 404 ON NULL, NO PLACEHOLDER ───────────────────────────
assert.ok(
  /if\s*\(\s*!profile\s*\|\|\s*!profile\.profilePhotoUrl\s*\)/.test(routeSrc),
  "the route must 404 when the profile is missing OR the photo is null — one combined branch, " +
    "so an unverified pandit and a photoless one are indistinguishable from outside.",
);
assert.ok(
  !/default-avatar|ui-avatars|placeholder/i.test(routeSrc),
  "the route must never serve a placeholder face — 404 is the contract; clients render the initial.",
);

// ── 3 · REDIRECT WITH A CACHE LIFETIME UNDER THE PRESIGN TTL ──
assert.ok(/redirect\(\s*url\s*,\s*302\s*\)/.test(routeSrc), "the route must 302, not proxy — the key never leaves the server");

// THE CORP OVERRIDE — measured defect, 2026-08-02. Helmet stamps
// Cross-Origin-Resource-Policy: same-origin on every response, and a browser
// refuses to EMBED a cross-origin resource that carries it: every customer
// <img> fired onerror while curl returned the bytes. A server-side probe can
// never see this class — the response is correct in every way except the one
// only a rendering engine checks. The route must declare cross-origin.
proveMatchers(GUARD, [
  [
    "the CORP cross-origin declaration",
    /Cross-Origin-Resource-Policy["']\s*,\s*["']cross-origin["']/,
    'reply.header("Cross-Origin-Resource-Policy", "cross-origin");',
    'reply.header("Cache-Control", "public, max-age=300");',
  ],
]);
assert.ok(
  /Cross-Origin-Resource-Policy["']\s*,\s*["']cross-origin["']/.test(routeSrc),
  "the photo route must set Cross-Origin-Resource-Policy: cross-origin — helmet's same-origin " +
    "default blocks the exact embedding this endpoint exists for, and curl cannot see it break.",
);
const ttl = Number((routeSrc.match(/getPresignedGetUrl\([^,]+,\s*(\d+)\s*\)/) ?? [])[1]);
const cacheAges = [...routeSrc.matchAll(/max-age=(\d+)/g)].map((m) => Number(m[1]));
proveSaw(GUARD, "presign TTL parsed (seconds)", ttl);
proveSaw(GUARD, "Cache-Control max-age directives found", cacheAges.length);
for (const age of cacheAges) {
  assert.ok(
    age < ttl,
    `a Cache-Control max-age of ${age}s meets a presign TTL of ${ttl}s — a cached redirect that ` +
      `outlives its target serves 403s that look like broken photos. The cache must always die first.`,
  );
}

proveDetects(
  GUARD,
  "a cache lifetime that outlives the presigned URL",
  (pair: { age: number; ttl: number }) => pair.age >= pair.ttl,
  { age: 900, ttl: 900 }, // tainted: equal is already too long
  { age: 300, ttl: 900 },
);

// ── 4 · THE WRITE PATH REFUSES FOREIGN AND SIBLING KEYS ───────
// PUT /pandits/me/photo is the one writer; its key check is what stops an
// aadhaar key being published as a photo through the resolver above.
const putStart = src.indexOf('"/me/photo"');
assert.ok(putStart > -1, "PUT /pandits/me/photo must exist — it is the one writer of profilePhotoUrl");
const putSrc = src.slice(putStart, putStart + 1200);
proveSaw(GUARD, "photo write-route window chars", putSrc.length);
assert.ok(
  /canPresign\(\s*["']PANDIT["']\s*,\s*userId\s*,\s*key\s*\)/.test(putSrc),
  "the write path must run the key through canPresign — the same ownership predicate as the read path",
);
assert.ok(
  /startsWith\(\s*`uploads\/\$\{userId\}\/profile-photo`\s*\)/.test(putSrc),
  "the write path must pin the KIND prefix: an aadhaar key saved as a photo would publish an " +
    "identity document to every customer surface the moment the resolver serves it. startsWith, " +
    "not equality — F-J7-2/B versions the key once the profile leaves PENDING.",
);

// the kind-prefix predicate, executed against the keys that matter
const kindOk = (userId: string, key: string) => key.startsWith(`uploads/${userId}/profile-photo`);
assert.ok(kindOk("u1", "uploads/u1/profile-photo"), "the draft photo key must pass");
assert.ok(kindOk("u1", "uploads/u1/profile-photo-r1785678956"), "the versioned photo key must pass (Shape B)");
assert.ok(!kindOk("u1", "uploads/u1/aadhaar-front"), "an aadhaar key must be refused");
assert.ok(!kindOk("u1", "uploads/u2/profile-photo"), "a foreign photo key must be refused");
assert.ok(!kindOk("u1", "https://evil.example/face.jpg"), "an http value must be refused — the legacy passthrough is not a write format");
proveDetects(
  GUARD,
  "a sibling-kind key smuggled into the photo column",
  (key: string) => !kindOk("u1", key),
  "uploads/u1/aadhaar-front",
  "uploads/u1/profile-photo-r1785678956",
);

console.log(
  `photo-resolver guard ✅ — VERIFIED pinned inside the where, 404 on null with no placeholder, ` +
    `302 redirect with cache (${cacheAges.join("s, ")}s) < presign TTL (${ttl}s), write path refuses ` +
    `foreign/sibling/http keys and accepts the Shape B versioned key`,
);
