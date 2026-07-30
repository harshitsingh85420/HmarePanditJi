import assert from "node:assert";
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { codeOnly } from "@hmarepanditji/utils/code-only";

// ─────────────────────────────────────────────────────────────
// VERIFIED IS AN OPS ACTION, NOT A STATE.
//
//   "Aadhaar — ops looks at it. VERIFIED comes from ME marking it.
//    Never automatically."  — Isj, 2026-07-30
//
// That sentence has two consequences this guard enforces:
//   1. ONE WRITER. Only lib/verificationWriter.ts may set the value.
//      Before this, FOUR things could: two admin endpoints the admin UI
//      used for the same button, a third routed KYC path, and the seed
//      — which is how five people nobody checked became VERIFIED in
//      production.
//   2. AN AUTHOR. If it is his action, the row records whose and when.
//
// And the companion rule, because the seed was only half the mechanism:
//   3. NO FABRICATED FALLBACK. Where no review exists, the API returns
//      nothing — not zero, not a stored scalar. Two read paths used to
//      prefer the seeded rating EXACTLY when reality was empty, and a
//      cluster of literals (`|| 4.8`, `|| 47`, `: 45`, `: 94`) did the
//      same with no seed at all.
// ─────────────────────────────────────────────────────────────

console.log("Running verified-single-writer guard…");

const REPO = join(__dirname, "..", "..", "..", "..");
const read = (p: string) => codeOnly(readFileSync(join(REPO, p), "utf8"));

// ── 1. THE WRITER EXISTS AND DEMANDS AN AUTHOR ────────────────
const WRITER_PATH = "services/api/src/lib/verificationWriter.ts";
assert.ok(existsSync(join(REPO, WRITER_PATH)), "the single writer module is gone");
const WRITER = read(WRITER_PATH);
assert.ok(
  /verificationStatus: KYC_APPROVE_WRITE_STATUS/.test(WRITER),
  "the single writer no longer writes the approved status",
);
assert.ok(
  /verifiedById: adminUserId/.test(WRITER) && /verifiedAt: new Date\(\)/.test(WRITER),
  "the writer must record WHO and WHEN in the same statement as the claim — a trust claim with no " +
    "accountable author is a rumour",
);
assert.ok(
  /throw new VerificationAuthorMissing\(\)/.test(WRITER),
  "the writer no longer refuses an absent admin id. It must FAIL CLOSED: an unauthored " +
    'verification looks identical to a real one and cannot be traced. The old inline path defaulted ' +
    'to the literal "admin", a non-id in an id column.',
);

// ── 2. NOBODY ELSE WRITES IT ──────────────────────────────────
// Enumerated across the whole repo, not a curated list of files.
function walk(dir: string, out: string[] = []): string[] {
  if (!existsSync(dir)) return out;
  for (const e of readdirSync(dir)) {
    if (["node_modules", ".next", "dist", ".git", "coverage"].includes(e)) continue;
    const p = join(dir, e);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.(ts|tsx|mjs|js)$/.test(e)) out.push(p);
  }
  return out;
}
// A WRITE is `verificationStatus:` inside a prisma data payload, or an
// assignment to it. Filters (`where.verificationStatus = "PENDING"`) and
// reads are not writes — the distinction is the direction of the data.
const offenders: string[] = [];
// SCAN SCOPE — WIDENED after a live row refuted the first enumeration.
// This loop covered services/api/src and packages/db only. A FIFTH writer sat
// in services/api/scripts/stage-pilot-fixtures.mjs, upserting VERIFIED straight
// through Prisma, and produced a sixth verified pandit in production that the
// enumeration reported as impossible. A guard that scans a curated set of
// directories proves nothing about the directory it was not pointed at — the
// same shape as auditing PUBLIC_PANDIT_READS instead of the route table.
const SCAN_ROOTS = ["services/api/src", "services/api/scripts", "packages/db", "scripts", "apps/web/scripts", "apps/pandit/scripts"];
for (const f of SCAN_ROOTS.flatMap((r) => walk(join(REPO, r)))) {
  const rel = f.replace(REPO, "").replace(/\\/g, "/");
  if (rel.includes("verificationWriter.ts")) continue;
  if (/\.test\.ts$/.test(rel)) continue;
  const src = codeOnly(readFileSync(f, "utf8"));
  // A FILE THAT CANNOT REACH THE DATABASE CANNOT WRITE THE COLUMN.
  // Widening the scan to scripts/ surfaced seven hits that are Playwright
  // route-mock fixtures — plain objects fulfilling a fake HTTP response so a
  // headless browser renders the verified state. They hold ZERO Prisma
  // references and never touch a row. They are excluded by CAPABILITY, not by
  // filename: the moment one of them starts talking to the database it is
  // scanned again. Whitelisting the noisy names would have been the wrong fix.
  if (!/PrismaClient|@hmarepanditji\/db|prisma\./.test(src)) continue;
  for (const m of src.matchAll(/verificationStatus:\s*([^,\n}]+)/g)) {
    const val = m[1].trim();
    // approved-value writes only; PENDING / DOCUMENTS_SUBMITTED / REJECTED
    // are other people's legitimate transitions
    if (/KYC_APPROVE_WRITE_STATUS|["']VERIFIED["']|VerificationStatus\.VERIFIED/.test(val)) {
      // a `where:` clause reading VERIFIED is a filter, not a write
      const before = src.slice(Math.max(0, (m.index ?? 0) - 120), m.index ?? 0);
      if (/where:\s*\{[^}]*$|count\(|findMany\(|findUnique\(|findFirst\(/.test(before)) continue;
      offenders.push(`${rel}:${src.slice(0, m.index).split("\n").length}  →  ${val.slice(0, 60)}`);
    }
  }
}
assert.deepStrictEqual(
  offenders,
  [],
  "these write the VERIFIED value outside lib/verificationWriter.ts:\n  " +
    offenders.join("\n  ") +
    "\nVERIFIED is an ops action with one author. A second writer is a second way for the platform " +
    "to claim it checked someone's Aadhaar when it did not.",
);

// ── 3. THE SEED CLAIMS NOTHING ────────────────────────────────
const SEED = read("packages/db/prisma/seed.ts");
assert.ok(
  !/VerificationStatus\.VERIFIED/.test(SEED.replace(/===\s*VerificationStatus\.VERIFIED/g, "")),
  "seed.ts assigns VERIFIED again. Five seeded VERIFIED rows are how the product came to claim it " +
    "had checked the Aadhaar of five people it had never met.",
);
assert.ok(
  !/rating:\s*[1-9]/.test(SEED),
  "seed.ts writes a non-zero rating again — 4.8/47 against an empty Review table is the third " +
    "instance of fabricated data reaching a trust surface",
);

// ── 4. THE SEED BOUNDARY, FAIL-CLOSED ─────────────────────────
assert.ok(
  /function assertLocalDatabase\(\)/.test(SEED) && /assertLocalDatabase\(\);/.test(SEED),
  "the local-database boundary is gone from seed.ts",
);
for (const [what, re] of [
  ["absent URL refuses", /if \(!raw\) \{[\s\S]{0,200}throw new Error/],
  ["unparseable URL refuses", /catch \{[\s\S]{0,200}could not be parsed/],
  ["the override names the host", /ack === host/],
] as const) {
  assert.ok(re.test(SEED), `seed boundary: ${what} — no longer true`);
}

// ── 5. NO FABRICATED FALLBACK ON A RATING ─────────────────────
const CTRL = read("services/api/src/controllers/pandit.controller.ts");
const ROUTES = read("services/api/src/routes/pandit.routes.ts");
assert.ok(
  !/overallRating \?\? pandit\.rating/.test(CTRL),
  "pandit.controller falls back to the stored rating again. The `??` fires exactly when the review " +
    "count is zero — it is an instruction to show the fabricated value precisely when the true " +
    "answer is 'none'.",
);
assert.ok(
  /aggregations\._count > 0 \? aggregations\._avg\.overallRating : null/.test(CTRL),
  "pandit.controller no longer returns null for a pandit with no reviews",
);
for (const [what, re] of [
  ["|| 4.8", /\|\|\s*4\.8/],
  ["|| 47", /\|\|\s*47\b/],
  ["completionRate: 94", /completionRate:\s*94\b/],
  ["avgResponseTimeMinutes: 45", /avgResponseTimeMinutes:\s*45\b/],
  ["rating fallback to stored scalar", /:\s*parseFloat\(panditProfile\.rating/],
] as const) {
  assert.ok(!re.test(ROUTES), `pandit.routes reintroduced the fabricated literal ${what}`);
}

// ── PROVE-TO-FAIL (law G2) ───────────────────────────────────
const mustMatch: Array<[string, RegExp, string]> = [
  ["a seed VERIFIED assignment (the regression)", /VerificationStatus\.VERIFIED/,
    "    verificationStatus: VerificationStatus.VERIFIED,"],
  ["a seeded rating (the regression)", /rating:\s*[1-9]/, "    rating: 4.8, totalReviews: 47,"],
  ["the ?? fallback (the regression)", /overallRating \?\? pandit\.rating/,
    "  avgRating: aggregations._avg.overallRating ?? pandit.rating ?? 0,"],
  ["|| 4.8 (the regression)", /\|\|\s*4\.8/, "  averageRating: panditProfile.rating || 4.8,"],
  ["avgResponseTimeMinutes 45 (the regression)", /avgResponseTimeMinutes:\s*45\b/,
    "  avgResponseTimeMinutes: 45"],
  ["the author demand, as written", /throw new VerificationAuthorMissing\(\)/,
    "    throw new VerificationAuthorMissing();"],
  ["a second writer (the regression)", /verificationStatus:\s*KYC_APPROVE_WRITE_STATUS/,
    "        verificationStatus: KYC_APPROVE_WRITE_STATUS,"],
];
for (const [what, re, subject] of mustMatch) {
  assert.ok(
    re.test(subject),
    `MATCHER BLIND (law G2): the pattern for "${what}" cannot match its real subject.\n` +
      `  pattern: ${re}\n  subject: ${subject}`,
  );
}
// The write-vs-filter distinction is the subtle one — prove BOTH halves.
const filterLine = 'const n = await prisma.panditProfile.count({ where: { verificationStatus: "VERIFIED" } });';
const writeLine = '  await prisma.panditProfile.update({ data: { verificationStatus: "VERIFIED" } });';
assert.ok(
  /where:\s*\{[^}]*$|count\(/.test(filterLine.slice(0, filterLine.indexOf("verificationStatus:"))),
  "MATCHER BLIND: a COUNT filter would be misread as a write, and the guard would fail correct code",
);
assert.ok(
  !/where:\s*\{[^}]*$|count\(|findMany\(/.test(writeLine.slice(0, writeLine.indexOf("verificationStatus:"))),
  "MATCHER BLIND: a real update payload would be excused as a filter — the offender scan would " +
    "miss exactly what it exists to catch",
);

console.log(
  `verified-single-writer guard ✅ — one writer with a mandatory author, ${offenders.length} rogue ` +
    `writers, seed claims nothing, boundary fail-closed, 5 fabricated literals barred, ` +
    `${mustMatch.length + 2} matchers proven able to fail`,
);
