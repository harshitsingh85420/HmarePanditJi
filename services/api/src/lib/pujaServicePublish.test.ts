import assert from "node:assert";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { proveMatchers, proveSaw, proveDetects } from "./g2";
import { PUJA_TYPES, PUJA_LABELS_HI, PUJA_LABELS_EN, isPujaType, CUSTOM_PUJA_REQUEST } from "@hmarepanditji/types";

// ─────────────────────────────────────────────────────────────
// TRACK 2A / OPTION A — THE PUBLISH LAW.
//
// The customer's price AND the pujaType filter both hang off PujaService.
// Before this batch that table had NO live writer: the पूजा जोड़िए wizard wrote
// PoojaConfig + PoojaVerification, the customer read PujaService, and only the
// seed ever populated it. Every real pandit was therefore visible,
// unfilterable, and advertised at "Starting from ₹0".
//
// Option A makes the wizard write what the reader reads. That is only safe
// while ONE invariant holds:
//
//     isActive:true is reachable ONLY through admin approval.
//
// If a wizard write could publish, Option A would have handed every pandit a
// self-serve route onto the customer's search results with no review at all.
//
// A SOURCE guard, deliberately: the property is "which code paths may write
// this field", which is a statement about all paths — a behavioural test can
// prove approve() publishes, but never that the wizard doesn't.
// ─────────────────────────────────────────────────────────────

const GUARD = "pujaServicePublish";
const CTRL = join(__dirname, "..", "controllers");
const poojaCtrl = readFileSync(join(CTRL, "poojaVerification.controller.ts"), "utf8");
const authCtrl = readFileSync(join(CTRL, "auth.controller.ts"), "utf8");

proveSaw(GUARD, "controller sources read (non-empty)", [poojaCtrl, authCtrl].filter((s) => s.length > 2000).length);

/** Slice a named export's body up to the next top-level export. */
function fnBody(src: string, name: string): string {
  const start = src.indexOf(`export const ${name}`);
  assert.ok(start >= 0, `${name} not found — the guard is aimed at a symbol that no longer exists`);
  const next = src.indexOf("\nexport const ", start + 10);
  return src.slice(start, next > 0 ? next : src.length);
}

/** Every PujaService write call in a source, with enough tail to see its clauses. */
function pujaServiceWrites(src: string): string[] {
  const out: string[] = [];
  const re = /(?:tx|prisma)\.pujaService\.(?:upsert|update|updateMany|create|createMany)\(/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(src))) out.push(src.slice(m.index, m.index + 420));
  return out;
}

const CREATE_UNPUBLISHED = /create:\s*\{[^}]*isActive:\s*false/;
const UPDATE_TOUCHES_FLAG = /update:\s*\{[^}]*isActive/;
const PUBLISHES = /isActive:\s*true/;

// ── G2: every matcher proven able to see the defect, and to stay quiet ──
proveMatchers(GUARD, [
  [
    "a create clause that ships a pooja published",
    CREATE_UNPUBLISHED,
    `create: { panditProfileId: p, pujaType: t, dakshinaAmount: 1, isActive: false }`,
    `create: { panditProfileId: p, pujaType: t, dakshinaAmount: 1, isActive: true }`,
  ],
  [
    "an update clause that touches the publish flag",
    UPDATE_TOUCHES_FLAG,
    `update: { dakshinaAmount: 1, isActive: true }`,
    `update: { dakshinaAmount: 1 }`,
  ],
  [
    "a publishing write anywhere",
    PUBLISHES,
    `data: { isActive: true }`,
    `data: { isActive: false }`,
  ],
]);

// The write-extractor is code, not a regex — prove it too.
proveDetects(
  GUARD,
  "the PujaService write extractor sees a planted write",
  (s: string) => pujaServiceWrites(s).length === 1,
  `await tx.pujaService.upsert({ where: w, update: {}, create: { isActive: false } });`,
  `await tx.poojaConfig.upsert({ where: w, update: {}, create: {} });`,
);

// ── 1 · the wizard creates UNPUBLISHED, and never touches the flag on update ──
{
  const save = fnBody(poojaCtrl, "savePoojaConfig");
  proveSaw(GUARD, "savePoojaConfig body chars", save.length);
  assert.ok(save.includes("pujaService.upsert"), "savePoojaConfig must write the customer-readable table (Option A)");
  assert.ok(
    CREATE_UNPUBLISHED.test(save),
    "a newly added pooja must be created isActive:false — otherwise the wizard publishes to search with no review",
  );
  assert.ok(
    !UPDATE_TOUCHES_FLAG.test(save),
    "re-saving a price must not touch isActive — it could publish an unapproved pooja or un-publish an approved one",
  );
}

// ── 2 · the dakshina mirror never publishes ──
{
  const rate = fnBody(authCtrl, "upsertDakshinaRate");
  proveSaw(GUARD, "upsertDakshinaRate body chars", rate.length);
  assert.ok(rate.includes("pujaService.upsert"), "the rate write must mirror the price into PujaService");
  assert.ok(CREATE_UNPUBLISHED.test(rate), "a mirrored row starts unpublished");
  assert.ok(!UPDATE_TOUCHES_FLAG.test(rate), "editing a rate must never publish");
}

// ── 3 · EXACTLY ONE path sets true, and it is the approval ──
{
  const allWrites = [...pujaServiceWrites(poojaCtrl), ...pujaServiceWrites(authCtrl)];
  proveSaw(GUARD, "PujaService write sites found across both controllers", allWrites.length);
  const publishing = allWrites.filter((b) => PUBLISHES.test(b));
  assert.deepStrictEqual(
    publishing.length,
    1,
    `exactly one code path may publish a pooja; found ${publishing.length}`,
  );
  const approve = fnBody(poojaCtrl, "approvePoojaVerification");
  assert.ok(
    /pujaService\.updateMany[\s\S]{0,240}isActive:\s*true/.test(approve),
    "the one publishing path must be admin approval",
  );
  assert.ok(
    /prisma\.\$transaction/.test(approve),
    "approval must be atomic — a half-approved pooja is a lie in one of two tables",
  );
}

// ── 4 · rejection un-publishes (symmetry) ──
{
  const reject = fnBody(poojaCtrl, "rejectPoojaVerification");
  assert.ok(
    /pujaService\.updateMany[\s\S]{0,240}isActive:\s*false/.test(reject),
    "rejection must un-publish — otherwise an approved-then-rejected pooja stays bookable",
  );
}

// ── 5 · the canonical vocabulary ──
{
  proveSaw(GUARD, "canonical puja types", PUJA_TYPES.length);
  assert.strictEqual(PUJA_TYPES.length, 8, "the canon promises 8 ceremonies");
  for (const t of PUJA_TYPES) {
    assert.ok(PUJA_LABELS_HI[t], `${t} has no Devanagari label`);
    assert.ok(PUJA_LABELS_EN[t], `${t} has no Roman label`);
  }
  // Ritual vocabulary stays ROMAN, never translated — the canon's language
  // ruling: "translating it is demeaning and wrong".
  const translated = /house\s?warming|wedding|naming ceremony|tonsure|last rites/i;
  for (const t of PUJA_TYPES) {
    assert.ok(!translated.test(PUJA_LABELS_EN[t]), `${t} was translated into English instead of romanised`);
  }
  // A custom pooja is a REQUEST and never a stored type.
  assert.ok(!isPujaType(CUSTOM_PUJA_REQUEST), "REQUEST must never be a canonical puja value");
}

// ── 6 · THE BACKFILL'S INLINED COPY MUST NOT DRIFT ──
// The runbook script cannot import the workspace package (plain node, no pnpm
// resolver — ERR_MODULE_NOT_FOUND before line one), so it carries its own copy
// of the 8 keys. A duplicated constant is only safe while something couples it
// back; this is that coupling.
{
  const backfillPath = join(__dirname, "..", "..", "..", "..", "packages", "db", "scripts", "backfill-pujaservice.mjs");
  const backfill = readFileSync(backfillPath, "utf8");
  proveSaw(GUARD, "backfill script chars read", backfill.length);

  /** Parse the inlined `const PUJA_TYPES = [ ... ]` array as text. */
  const parseInlined = (src) => {
    const m = /const PUJA_TYPES\s*=\s*\[([\s\S]*?)\]/.exec(src);
    if (!m) return null;
    return m[1].split(",").map((s) => s.trim().replace(/^["']|["']$/g, "")).filter(Boolean);
  };

  const inlined = parseInlined(backfill);
  assert.ok(inlined, "the backfill's inlined PUJA_TYPES array could not be parsed — the guard has gone blind");
  proveSaw(GUARD, "inlined puja types parsed from the backfill", inlined.length);
  assert.deepStrictEqual(
    inlined,
    [...PUJA_TYPES],
    "the backfill's inlined vocabulary has DRIFTED from packages/types — one of the two was edited alone",
  );

  // G2: prove the comparison can see a planted drift, and stays quiet on a match.
  proveDetects(
    GUARD,
    "the inlined-copy comparison catches a dropped key",
    (src) => {
      const got = parseInlined(src);
      return !got || got.length !== PUJA_TYPES.length || got.some((v, i) => v !== PUJA_TYPES[i]);
    },
    `const PUJA_TYPES = [\n  "SATYANARAYAN",\n  "GRIHA_PRAVESH",\n];`,
    `const PUJA_TYPES = [\n${PUJA_TYPES.map((t) => `  "${t}",`).join("\n")}\n];`,
  );
}

// The old conventions must not validate — accepting them re-opens the schism.
proveDetects(
  GUARD,
  "isPujaType rejects the superseded title-case and lowercase conventions",
  (v: string) => !isPujaType(v),
  "Griha Pravesh",
  "GRIHA_PRAVESH",
);
proveDetects(
  GUARD,
  "isPujaType rejects the shared-types lowercase_snake convention",
  (v: string) => !isPujaType(v),
  "griha_pravesh",
  "GRIHA_PRAVESH",
);

console.log(
  `puja-service publish guard ✅ — 1 publishing path (admin approval, transactional), wizard+mirror create unpublished, rejection un-publishes, ${PUJA_TYPES.length} canonical types with both scripts`,
);
