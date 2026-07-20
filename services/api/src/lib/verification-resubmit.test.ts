import assert from "node:assert";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// ─────────────────────────────────────────────────────────────
// RESUBMIT GATE GUARD (pilot-critical). A pandit whose verification video
// is REJECTED must have a path back — and only that path. Laws pinned:
//   AUTH       — the route is authenticate + roleGuard("PANDIT").
//   OWNERSHIP  — the row is keyed on the profile resolved FROM THE TOKEN,
//                never from client input, so one pandit can never write a
//                verification against another's profile.
//   TRANSITION — a new version may be created only for a first submission
//                or after a REJECTION. PENDING would double-queue; APPROVED
//                would silently un-publish a live bookable puja, because
//                the booking gate requires the LATEST row to be APPROVED.
//   HISTORY    — resubmit CREATES a new version, never mutates the old row.
// ─────────────────────────────────────────────────────────────

const API_SRC = join(__dirname, "..");
const read = (rel: string) => readFileSync(join(API_SRC, rel), "utf8");

console.log("Running verification-resubmit guard (REJECTED -> PENDING only)…");

const ctrl = read("controllers/poojaVerification.controller.ts");
const app = read("app.ts");

// AUTH: pandit-gated route
assert.ok(
  /pandit\/pooja-verification`,\s*\{\s*preHandler:\s*\[authenticate,\s*roleGuard\("PANDIT"\)\]/.test(app),
  "submit route must be authenticate + roleGuard(PANDIT)",
);

// OWNERSHIP: profile comes from the token's userId, and the row is written
// against THAT profile id — never a client-supplied profile/pandit id.
assert.ok(
  /const userId = \(request as any\)\.user\?\.id;[\s\S]{0,200}panditProfile\.findUnique\(\{\s*where:\s*\{\s*userId\s*\}/.test(ctrl),
  "profile must be resolved from the authenticated userId",
);
assert.ok(
  /panditProfileId:\s*profile\.id/.test(ctrl),
  "the new row must be keyed on the token-resolved profile.id",
);
assert.ok(
  !/panditProfileId:\s*b\.|panditProfileId:\s*body\./.test(ctrl),
  "panditProfileId must never come from the request body",
);

// TRANSITION: only a first submission or a REJECTED latest may proceed.
assert.ok(
  /if \(latest && latest\.status !== "REJECTED"\)/.test(ctrl),
  "must block a new version unless there is no latest row or it is REJECTED",
);
assert.ok(
  /VERIFICATION_NOT_RESUBMITTABLE/.test(ctrl),
  "blocked resubmits must fail with VERIFICATION_NOT_RESUBMITTABLE",
);
assert.ok(
  /status:\s*true/.test(ctrl),
  "the latest-row lookup must select status (otherwise the gate cannot read it)",
);

// HISTORY: create a new version; never update an existing verification here.
assert.ok(
  /poojaVerification\.create\(/.test(ctrl),
  "resubmit must CREATE a new version row",
);
assert.ok(
  /version:\s*\(latest\?\.version \?\? 0\) \+ 1/.test(ctrl),
  "the new row must be latest.version + 1",
);
assert.ok(
  /status:\s*"PENDING"/.test(ctrl),
  "a resubmitted verification must land PENDING (re-enters the admin queue)",
);

console.log("verification-resubmit guard: auth + ownership + REJECTED-only + history ✅");
