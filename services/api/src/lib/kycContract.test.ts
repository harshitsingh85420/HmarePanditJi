import assert from "node:assert";
import { readFileSync } from "node:fs";
import { join } from "node:path";
// Comments are stripped by the ONE shared implementation. See
// packages/utils/src/code-only.ts for why this is a scanner and not a
// regex, and for the single documented raw-source exception.
// (the /code-only SUBPATH, not the barrel: the barrel re-exports
//  auth-context.tsx, which requires React — unresolvable in bare node+tsx.)
import { codeOnly } from "@hmarepanditji/utils/code-only";
import {
  VERIFICATION_STATUSES,
  KYC_REVIEW_QUEUE_WHERE,
  HAS_REVIEWABLE_DOCUMENTS,
  KYC_REVIEW_QUEUE_STATUSES,
  KYC_NOT_SUBMITTED_STATUSES,
  KYC_APPROVED_STATUSES,
  KYC_SUBMITTED_WRITE_STATUS,
  KYC_APPROVE_WRITE_STATUS,
  KYC_REJECT_WRITE_STATUS,
} from "@hmarepanditji/types";

// ─────────────────────────────────────────────────────────────
// WRITER/READER CONTRACT GUARD — identity (KYC)
// Isj order, 2026-07-27, after the 4th sighting of the class.
//
// THE BREAK THIS EXISTS FOR: the pandit app's R5 submit wrote
// verificationStatus = DOCUMENTS_SUBMITTED. The admin review queue asked
// for status=PENDING. So submitting an Aadhaar REMOVED the pandit from the
// only screen that could review him, and the admin console read three field
// names — documentUrls, kycVideoUrl, aadhaarNumber — that exist nowhere in
// the schema, so an uploaded Aadhaar rendered as "Not Uploaded".
//
// Two apps, two vocabularies, and no build anywhere complained.
//
// THE STANDING SHAPE (section D): every `pandit.<field>` the admin app reads
// off a raw PanditProfile record must be a column that exists in
// schema.prisma. That check is generic — it fails the build on the FIFTH
// break without anyone having to walk into it first.
// ─────────────────────────────────────────────────────────────

console.log("Running KYC writer/reader contract guard...");

const REPO = join(__dirname, "..", "..", "..", "..");

// A guard that scans source must look at CODE, not at prose. Without this the
// comment explaining a dead pattern trips the assertion forbidding it.

const read = (p: string) => codeOnly(readFileSync(join(REPO, p), "utf8"));

const SCHEMA = read("packages/db/prisma/schema.prisma");
const READINESS = read("services/api/src/controllers/readiness.controller.ts");
const KYC_SERVICE = read("services/api/src/services/kyc.service.ts");
const ADMIN_QUEUE = read("apps/admin/src/app/verifications/page.tsx");
const ADMIN_DETAIL = read("apps/admin/src/app/pandits/[panditId]/page.tsx");
const KYC_ROUTES = read("services/api/src/routes/kyc.routes.ts");

// ── A. the vocabulary matches STORAGE ─────────────────────────
const enumBlock = SCHEMA.slice(
  SCHEMA.indexOf("enum VerificationStatus {"),
  SCHEMA.indexOf("}", SCHEMA.indexOf("enum VerificationStatus {")),
);
const prismaValues = enumBlock
  .split("\n")
  .slice(1)
  .map((l) => l.trim())
  .filter((l) => /^[A-Z_]+$/.test(l));

assert.deepStrictEqual(
  [...VERIFICATION_STATUSES].sort(),
  prismaValues.sort(),
  "packages/types VERIFICATION_STATUSES has drifted from the Prisma enum — one of them was changed without the other",
);

// ── B. the semantic sets are coherent ─────────────────────────
for (const set of [KYC_REVIEW_QUEUE_STATUSES, KYC_NOT_SUBMITTED_STATUSES, KYC_APPROVED_STATUSES]) {
  for (const s of set) {
    assert.ok(
      (VERIFICATION_STATUSES as readonly string[]).includes(s),
      `"${s}" is in a semantic set but is not a legal status value`,
    );
  }
}
assert.ok(
  !(KYC_REVIEW_QUEUE_STATUSES as readonly string[]).includes("PENDING"),
  "PENDING is the schema DEFAULT (nothing uploaded). Putting it in the review queue is what let an admin approve an identity with no documents.",
);
assert.ok(
  (KYC_REVIEW_QUEUE_STATUSES as readonly string[]).includes(KYC_SUBMITTED_WRITE_STATUS),
  "the value the pandit app writes on submit must be a member of the review queue — otherwise submitting makes him vanish",
);
assert.ok(
  (KYC_APPROVED_STATUSES as readonly string[]).includes(KYC_APPROVE_WRITE_STATUS),
  "the value an approval writes must read back as approved",
);

// ── C. writer and reader agree, in the actual source ──────────
// WRITER: readiness R5 submit
assert.ok(
  new RegExp(`verificationStatus = "${KYC_SUBMITTED_WRITE_STATUS}"`).test(READINESS),
  "readiness.controller R5 no longer writes the single-source submitted status",
);
// READER: the queue query is built from the shared set, not a hand-typed list
assert.ok(
  /KYC_REVIEW_QUEUE_STATUSES/.test(KYC_SERVICE),
  "kyc.service must build its queue from KYC_REVIEW_QUEUE_STATUSES, not a literal status list",
);
assert.ok(
  !/verificationStatus: \{ in: \["PENDING"/.test(KYC_SERVICE),
  "the KYC queue is asking for PENDING again — submitted pandits will vanish from it",
);
// READER: the admin app calls the queue endpoint that exists
assert.ok(
  /\/admin\/kyc\/queue/.test(ADMIN_QUEUE),
  "the admin verifications screen must call GET /admin/kyc/queue",
);
assert.ok(
  !/admin\/pandits\?status=PENDING/.test(ADMIN_QUEUE),
  "the admin verifications screen is back on the PENDING filter — a submitted pandit will not appear in it",
);
// and that endpoint is actually served
assert.ok(/"\/queue"/.test(KYC_ROUTES), "GET /admin/kyc/queue is no longer registered");
// the queue payload carries the documents a reviewer needs to decide
for (const field of ["aadhaarFrontUrl", "aadhaarBackUrl", "videoKycUrl", "aadhaarLastFour"]) {
  assert.ok(
    KYC_SERVICE.includes(field),
    `the KYC queue payload must carry ${field} — a reviewer cannot approve documents the API never sends`,
  );
  assert.ok(
    ADMIN_QUEUE.includes(field),
    `the admin queue screen must render ${field}`,
  );
}

// ── C2. THE WIDENED QUEUE — one where, single-sourced, both derivations ──
// (Isj ruling, written 2026-07-31.) Reviewable = submitted statuses OR
// PENDING with something a human can LOOK AT. Deep-pinned against BOTH
// sources so the constant cannot drift from either.
assert.deepStrictEqual(
  (KYC_REVIEW_QUEUE_WHERE as any).OR[0],
  { verificationStatus: { in: [...KYC_REVIEW_QUEUE_STATUSES] } },
  "KYC_REVIEW_QUEUE_WHERE arm 1 must be exactly the submitted set",
);
assert.deepStrictEqual(
  (KYC_REVIEW_QUEUE_WHERE as any).OR[1],
  { AND: [{ verificationStatus: "PENDING" }, HAS_REVIEWABLE_DOCUMENTS] },
  "KYC_REVIEW_QUEUE_WHERE arm 2 must be PENDING + HAS_REVIEWABLE_DOCUMENTS (URL columns only)",
);
{
  const sites = (KYC_SERVICE.match(/KYC_REVIEW_QUEUE_WHERE/g) || []).length;
  assert.ok(
    sites >= 2,
    `kyc.service must use KYC_REVIEW_QUEUE_WHERE at BOTH sites (queue + stats), found ${sites} — ` +
      "a counter on a different where shows a number that can never equal the list it opens",
  );
}

// ── D. THE STANDING SHAPE ─────────────────────────────────────
// Every field the admin detail console reads off the raw PanditProfile record
// must be a real column. This is the check that would have caught
// documentUrls / kycVideoUrl / aadhaarNumber the day they were written.
const modelBlock = SCHEMA.slice(
  SCHEMA.indexOf("model PanditProfile {"),
  SCHEMA.indexOf("\n}", SCHEMA.indexOf("model PanditProfile {")),
);
const columns = new Set(
  modelBlock
    .split("\n")
    .slice(1)
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("//") && !l.startsWith("@@"))
    .map((l) => l.split(/\s+/)[0])
    .filter((n) => /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(n)),
);

// fields the API adds to the record on its way out, or React/JS members that
// are not schema columns at all
const NOT_COLUMNS = new Set(["length", "map", "filter", "find", "toString", "replace"]);

const readFields = new Set<string>();
for (const m of ADMIN_DETAIL.matchAll(/\bpandit\??\.([a-zA-Z_][a-zA-Z0-9_]*)/g)) {
  readFields.add(m[1]);
}
assert.ok(readFields.size > 5, "the field scan found almost nothing — the regex has rotted");

const phantom = [...readFields].filter((f) => !columns.has(f) && !NOT_COLUMNS.has(f));
assert.deepStrictEqual(
  phantom,
  [],
  `the admin detail console reads PanditProfile fields that do not exist in schema.prisma: ${phantom.join(", ")}. ` +
    `A field name that is not a column renders as undefined — which looks exactly like "the pandit uploaded nothing".`,
);

// the three specific phantoms stay dead by name
for (const dead of ["documentUrls", "kycVideoUrl", "aadhaarNumber"]) {
  assert.ok(
    !new RegExp(`pandit\\??\\.${dead}\\b`).test(ADMIN_DETAIL),
    `${dead} is not a column — it was one of the three field names that made an uploaded Aadhaar render as "Not Uploaded"`,
  );
}

// ── E. approval is one decision, written one way ──────────────
const ADMIN_ROUTES = read("services/api/src/routes/admin.routes.ts");
// These used to pin the LITERALS ("VERIFIED"/"REJECTED"). That was the weaker
// assertion and, worse, it was the very shape the campaign is removing: it
// would have gone RED the moment the site started importing the shared
// constant — punishing the correct fix. Pin the CONSTANT REFERENCE instead;
// its value is already pinned once, at its declaration in packages/types.
// MOVED, NOT WEAKENED (Isj ruling 2026-07-30 — VERIFIED is an ops action).
// This asserted the approve WRITE lived in admin.routes.ts. It no longer does:
// the value now has exactly ONE writer, lib/verificationWriter.ts, because FOUR
// things could write it before — two admin endpoints the admin UI used for the
// same button, a routed KYC path, and the seed (which is how five unchecked
// people became VERIFIED in production). The contract is unchanged — the shared
// constant, never a per-site literal; only its address moved.
const VERIF_WRITER = read("services/api/src/lib/verificationWriter.ts");
assert.ok(
  !/verificationStatus: KYC_APPROVE_WRITE_STATUS/.test(ADMIN_ROUTES),
  "admin.routes.ts writes the approved status inline again — it must delegate to " +
    "markPanditVerified so the row always carries an author and a timestamp",
);
assert.ok(
  /verificationStatus: KYC_APPROVE_WRITE_STATUS/.test(VERIF_WRITER),
  `the admin approve endpoint must write the shared constant KYC_APPROVE_WRITE_STATUS (= "${KYC_APPROVE_WRITE_STATUS}"), not a per-site literal`,
);
assert.ok(
  /verificationStatus:\s*KYC_REJECT_WRITE_STATUS\b/.test(ADMIN_ROUTES),
  `the admin reject endpoint must write the shared constant KYC_REJECT_WRITE_STATUS (= "${KYC_REJECT_WRITE_STATUS}"), not a per-site literal`,
);
assert.ok(
  !/verificationStatus: "APPROVED"/.test(ADMIN_ROUTES),
  'nothing may WRITE the legacy "APPROVED" spelling — readers gate on VERIFIED',
);

// ── G2 (2026-07-31): matchers proven on the shapes they hunt, observation
// counted. The phantom-field extractor's tainted specimen is one of the
// three real phantoms that made an uploaded Aadhaar render as "Not Uploaded".
import { proveMatchers, proveSaw } from "./g2";
proveSaw("kycContract", "source files read (non-empty)",
  [SCHEMA, READINESS, KYC_SERVICE, ADMIN_QUEUE, ADMIN_DETAIL, KYC_ROUTES, ADMIN_ROUTES, VERIF_WRITER]
    .filter((s) => s.length > 0).length);
proveSaw("kycContract", "Prisma enum values parsed", prismaValues.length);
proveSaw("kycContract", "PanditProfile columns parsed", columns.size);
proveSaw("kycContract", "admin-detail pandit.* field reads extracted", readFields.size);
proveMatchers("kycContract", [
  ["the R5 submit write", new RegExp(`verificationStatus = "${KYC_SUBMITTED_WRITE_STATUS}"`),
    'profile.verificationStatus = "DOCUMENTS_SUBMITTED";'],
  ["the PENDING-queue relapse (submitted pandits vanish)", /verificationStatus: \{ in: \["PENDING"/,
    'where: { verificationStatus: { in: ["PENDING"] } },'],
  ["the admin PENDING-filter relapse", /admin\/pandits\?status=PENDING/,
    'fetch(`${api}/admin/pandits?status=PENDING`)'],
  ["a phantom field read (the original defect)", /\bpandit\??\.([a-zA-Z_][a-zA-Z0-9_]*)/,
    "src={pandit?.documentUrls[0]}"],
  ["the dead phantom by name", /pandit\??\.aadhaarNumber\b/,
    "<td>{pandit?.aadhaarNumber}</td>", "<td>{pandit?.aadhaarLastFour}</td>"],
  ["an inline approve write (single-writer relapse)", /verificationStatus: KYC_APPROVE_WRITE_STATUS/,
    "        verificationStatus: KYC_APPROVE_WRITE_STATUS,"],
  ['the legacy "APPROVED" write', /verificationStatus: "APPROVED"/,
    'data: { verificationStatus: "APPROVED" },'],
]);

console.log("✓ KYC writer/reader contract guard passed");
