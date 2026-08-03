import assert from "node:assert";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { proveMatchers, proveSaw, proveDetects } from "./g2";
import { PUJA_TYPES, PUJA_LABELS_HI, PUJA_LABELS_EN, isPujaType, CUSTOM_PUJA_REQUEST } from "@hmarepanditji/types";

// ─────────────────────────────────────────────────────────────
// THE LISTING LAW — REFINED TWICE BY RULING, AND THIS HEADER KEEPS THE
// LINEAGE: Track 2A said "only admin approval publishes"; Isj's सही
// (2026-08-03 am) inverted it — "the declaration lists"; his items-gate
// ruling (2026-08-03 pm) refined it to its standing form:
//
//   ITEMS ARE THE POOJA'S DEFINITION — NO LIST, NO LISTING.
//
// A pooja is VISIBLE iff its definition exists (an active BASIC samagri
// row with ≥1 item — basic-suffices, ruled). Prices are the pandit's own
// deal and flip nothing; video is trust and flips nothing; Aadhaar stays
// the business door (F-B3-1).
//
// THE FOUR CLAUSES:
//   1 · CREATES FOLLOW THE PREDICATE — every declaration create sets
//       isActive to the hasPoojaDefinition() answer, never a literal true
//       (an unconditional true is now the defect: it would list an
//       undefined pooja). Schema default stays FALSE.
//   2 · THE FLIP HAS ONE OWNER — saveSamagriPackages, BOTH directions:
//       items land → publish; items clear → unpublish. No other write may
//       touch the flag outside a create.
//   3 · VIDEO VERDICTS NEVER TOUCH LISTING — approve/reject write
//       PoojaVerification.status and nothing else.
//   4 · PRICE EDITS NEVER TOUCH LISTING — no update clause carries the flag.
//
// A SOURCE guard, deliberately: the property is "which code paths may write
// this field", which is a statement about all paths.
// ─────────────────────────────────────────────────────────────

const GUARD = "pujaServicePublish";
const CTRL = join(__dirname, "..", "controllers");
const poojaCtrl = readFileSync(join(CTRL, "poojaVerification.controller.ts"), "utf8");
const authCtrl = readFileSync(join(CTRL, "auth.controller.ts"), "utf8");
// pandit.routes.ts holds the dead-but-MOUNTED POST /pandits/me/services — a
// writer no app calls but any authenticated pandit could curl. Its update
// wrote isActive:true and its create leaned on the Prisma @default(true), so
// the "only approval publishes" law was breachable from a terminal. Scanned.
const panditRoutes = readFileSync(join(__dirname, "..", "routes", "pandit.routes.ts"), "utf8");

proveSaw(GUARD, "publish-law sources read (non-empty)", [poojaCtrl, authCtrl, panditRoutes].filter((s) => s.length > 2000).length);

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

// BOTH create shapes: an upsert's `create:` clause AND a bare
// `.create({ data: { ... } })` — the /me/services writer uses the second.
// A GATED create carries the predicate's answer (a hasDefinition-family
// identifier), never a literal.
const CREATE_GATED = /create\(?:?\s*\{\s*(?:data:\s*\{)?[^}]*isActive:\s*\w*[hH]asDefinition/;
const CREATE_UNCONDITIONAL = /create\(?:?\s*\{\s*(?:data:\s*\{)?[^}]*isActive:\s*true/;
const UPDATE_TOUCHES_FLAG = /update:\s*\{[^}]*isActive/;
const TOUCHES_FLAG = /isActive:/;
// THE ONE FLIP OWNER's signature: updateMany writing the predicate's answer
const FLIP_OWNER = /updateMany\(\s*\{[^]*?data:\s*\{\s*isActive:\s*hasDefinition\s*\}/;

// ── G2: every matcher proven able to see the defect, and to stay quiet ──
proveMatchers(GUARD, [
  [
    "a GATED create (clause 1 — isActive follows the predicate)",
    CREATE_GATED,
    `create: { panditProfileId: p, pujaType: t, dakshinaAmount: 1, isActive: hasDefinition }`,
    `create: { panditProfileId: p, pujaType: t, dakshinaAmount: 1, isActive: true }`,
  ],
  [
    "the bare .create({ data: … }) gated shape (the /me/services writer)",
    CREATE_GATED,
    `prisma.pujaService.create({ data: { pujaType: t, isActive: svcHasDefinition, } });`,
    `prisma.pujaService.create({ data: { pujaType: t, isActive: true, } });`,
  ],
  [
    "an UNCONDITIONAL-true create — the returning defect this law now hunts",
    CREATE_UNCONDITIONAL,
    `create: { pujaType: t, isActive: true }`,
    `create: { pujaType: t, isActive: hasDefinition }`,
  ],
  [
    "an update clause that touches the publish flag",
    UPDATE_TOUCHES_FLAG,
    `update: { dakshinaAmount: 1, isActive: true }`,
    `update: { dakshinaAmount: 1 }`,
  ],
  [
    "any write that touches the listing flag (clauses 2-4 hunt these)",
    TOUCHES_FLAG,
    `data: { isActive: true }`,
    `data: { status: "APPROVED" }`,
  ],
  [
    "the flip owner's both-direction updateMany (clause 2)",
    FLIP_OWNER,
    `await prisma.pujaService.updateMany({ where: { panditProfileId: p, pujaType, isActive: !hasDefinition }, data: { isActive: hasDefinition } });`,
    `await prisma.pujaService.updateMany({ where: { panditProfileId: p }, data: { dakshinaAmount: 1 } });`,
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

// ── 1 · CLAUSE 1: the declaration creates follow THE PREDICATE ──
{
  const save = fnBody(poojaCtrl, "savePoojaConfig");
  proveSaw(GUARD, "savePoojaConfig body chars", save.length);
  assert.ok(save.includes("pujaService.upsert"), "savePoojaConfig must write the customer-readable table (Option A)");
  assert.ok(
    CREATE_GATED.test(save),
    "a declared pooja must be created isActive: hasDefinition — NO LIST, NO LISTING; " +
      "an unconditional true would list an undefined pooja",
  );
  assert.ok(!CREATE_UNCONDITIONAL.test(save), "savePoojaConfig carries an unconditional isActive:true create — the pre-items-gate law returning");
  assert.ok(
    !UPDATE_TOUCHES_FLAG.test(save),
    "re-saving a price must not touch isActive — price edits never list or unlist",
  );
}

// ── 2 · the dakshina mirror follows the predicate too ──
{
  const rate = fnBody(authCtrl, "upsertDakshinaRate");
  proveSaw(GUARD, "upsertDakshinaRate body chars", rate.length);
  assert.ok(rate.includes("pujaService.upsert"), "the rate write must mirror the price into PujaService");
  assert.ok(
    CREATE_GATED.test(rate),
    "the mirrored row's create follows hasPoojaDefinition — a rate is a deal, not a definition",
  );
  assert.ok(!CREATE_UNCONDITIONAL.test(rate), "the mirror carries an unconditional isActive:true create");
  assert.ok(!UPDATE_TOUCHES_FLAG.test(rate), "editing a rate must never touch the listing flag");
}

// ── 2b · CLAUSE 2: THE FLIP HAS ONE OWNER — saveSamagriPackages, both directions ──
{
  const samagri = fnBody(authCtrl, "saveSamagriPackages");
  proveSaw(GUARD, "saveSamagriPackages body chars", samagri.length);
  assert.ok(
    FLIP_OWNER.test(samagri),
    "saveSamagriPackages must own the flip: updateMany writing isActive: hasDefinition — " +
      "items land → publish, items clear → unpublish, one owner, both directions",
  );
  // and the flip's where-clause targets only rows whose state DIFFERS —
  // the write is a transition, not a blanket stamp
  assert.ok(
    /isActive:\s*!hasDefinition/.test(samagri),
    "the flip must target rows where isActive !== hasDefinition — a transition, not a stamp",
  );
}

// ── 3 · CLAUSES 2-3: video verdicts NEVER touch the listing; the flag is
//        written only inside gated creates or by the one flip owner ──
{
  const allWrites = [...pujaServiceWrites(poojaCtrl), ...pujaServiceWrites(authCtrl), ...pujaServiceWrites(panditRoutes)];
  proveSaw(GUARD, "PujaService write sites found across all three writer files", allWrites.length);
  for (const blk of allWrites) {
    if (TOUCHES_FLAG.test(blk)) {
      assert.ok(
        CREATE_GATED.test(blk) || FLIP_OWNER.test(blk) || /isActive:\s*!hasDefinition/.test(blk),
        `a PujaService write touches isActive outside a gated create or the flip owner:\n${blk.slice(0, 200)}\n` +
          "Only a declaration create (predicate-gated) or saveSamagriPackages' flip may set the flag. " +
          "No verdict, no mirror update, no admin path.",
      );
    }
  }
  const approve = fnBody(poojaCtrl, "approvePoojaVerification");
  const reject = fnBody(poojaCtrl, "rejectPoojaVerification");
  assert.ok(
    pujaServiceWrites(approve).length === 0,
    "APPROVE WRITES THE VIDEO VERDICT AND NOTHING ELSE — the pooja was listed at submit; " +
      "flipping the listing here is the superseded Track 2A coupling",
  );
  assert.ok(
    pujaServiceWrites(reject).length === 0,
    "REJECTING A VIDEO MUST NOT UNLIST A BOOKABLE POOJA — the verdict is about the video alone",
  );
  // the verdicts still write the verification status, or they are dead controls
  assert.ok(/status:\s*"APPROVED"/.test(approve), "approve must still write the APPROVED verdict");
  assert.ok(/status:\s*"REJECTED"/.test(reject), "reject must still write the REJECTED verdict");
}

// ── 4b · the mounted-but-dead endpoint follows the same clauses ──
// POST /pandits/me/services: update must never touch the flag; create lists
// explicitly. The schema default is FALSE now — the safe polarity.
{
  const routeWrites = pujaServiceWrites(panditRoutes);
  proveSaw(GUARD, "PujaService writes in pandit.routes.ts", routeWrites.length);
  // Classify by the block's OWN opening call (first ~30 chars): a 420-char
  // update block can swallow the START of the next create call, so
  // `blk.includes(".create(")` tagged one block as both and judged the
  // update's tail by the create's rule. The method name sits at the head.
  for (const blk of routeWrites) {
    const head = blk.slice(0, 32);
    if (head.includes(".update(")) {
      assert.ok(!/isActive/.test(blk.slice(0, 260)), "the /me/services update touches isActive — a curl could publish or un-publish");
    }
    if (head.includes(".create(")) {
      assert.ok(
        /isActive:\s*svcHasDefinition/.test(blk),
        "the /me/services create must follow the predicate (isActive: svcHasDefinition) — " +
          "NO LIST, NO LISTING; the default stays FALSE so a forgotten field unpublishes",
      );
    }
  }
}

// ── 4c · THE DEFAULT IS FALSE, AND W6 STAYS CLOSED ──
// The old @default(true) let any writer that FORGOT the field publish — the
// standing proof was onboardingStep2: mounted, caller-less, deleteMany +
// createMany without the flag, publishing ₹0 rows and erasing reviewed ones.
{
  const schema = readFileSync(join(__dirname, "..", "..", "..", "..", "packages", "db", "prisma", "schema.prisma"), "utf8");
  proveSaw(GUARD, "schema.prisma chars read", schema.length);
  assert.ok(
    /isActive\s+Boolean\s+@default\(false\)/.test(schema),
    "PujaService.isActive must default FALSE — a forgotten field must unpublish, not publish",
  );
  const onboarding = readFileSync(join(CTRL, "onboarding.controller.ts"), "utf8");
  proveSaw(GUARD, "onboarding controller chars read", onboarding.length);
  assert.ok(
    pujaServiceWrites(onboarding).length === 0,
    "W6 HAS REOPENED: onboarding.controller.ts writes PujaService again — the caller-less " +
      "publish hole this law closed on 2026-08-03",
  );
}

// ── 5b · THE OWNER'S READ IS NEVER FILTERED BY THE CUSTOMER FLAG ──
// HIDING THE OWNER'S OWN TRUTH IS THE MIRROR OF FABRICATING IT. /auth/me and
// /pandits/me filtered pujaServices on isActive:true, so a pandit who priced
// गृह प्रवेश at ₹1,101 read ₹0 on मेरी पूजाएँ seconds later — the customer-
// visibility flag applied to the author of the data. The owner-read files may
// not carry a where-clause on their own pujaServices include; the customer
// reads (pandit.controller/pandit.service) keep theirs, and are not scanned.
{
  const OWNER_FILTER = /pujaServices:\s*\{\s*where:/;
  proveMatchers(GUARD, [
    [
      "an owner read filtering services by the customer flag",
      OWNER_FILTER,
      `pujaServices: { where: { isActive: true } },`,
      `pujaServices: true,`,
    ],
  ]);
  assert.ok(!OWNER_FILTER.test(authCtrl), "/auth/me filters the pandit's own services — his price reads as ₹0 on his own screen");
  assert.ok(!OWNER_FILTER.test(panditRoutes), "/pandits/me filters the pandit's own services — same ₹0, second door");
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

// ── 7 · THE WIZARD HOLDS NO PUJA STRING LITERALS ──
// The add-pooja wizard used to BE the fourth vocabulary: its step 1 was a
// free-text field and the submit posted `poojaType: d.name`, so whatever a
// pandit typed became the stored type. The picker fixes that only while the
// labels keep coming from ONE place.
{
  const wizPath = join(__dirname, "..", "..", "..", "..", "apps", "pandit", "src", "app", "(dashboard-group)", "my-poojas", "add", "page.tsx");
  const wizRaw = readFileSync(wizPath, "utf8");
  // STRIP COMMENTS BEFORE JUDGING CODE. This guard failed on its first run
  // against a correct file: the only `poojaType: d.name` left in the wizard
  // was inside the doc comment EXPLAINING the old defect. A grep over source
  // cannot tell code from commentary — the same lesson the compiled-output
  // sweep taught, met again by the author of the guard, one file later.
  const stripComments = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
  const wiz = stripComments(wizRaw);
  proveSaw(GUARD, "add-pooja wizard chars read (comments stripped)", wiz.length);

  assert.ok(
    /from ["']@hmarepanditji\/types["']/.test(wiz),
    "the wizard must source its vocabulary from packages/types, not its own strings",
  );
  assert.ok(
    /PUJA_TYPES/.test(wiz) && /PUJA_LABELS_HI/.test(wiz),
    "the wizard must render the canonical list and its labels",
  );
  assert.ok(
    /matchPujaFromSpeech/.test(wiz),
    "voice-first must survive: the transcript is matched, not merely typed",
  );
  // The submit must never post the free-text name as the TYPE again.
  assert.ok(
    !/poojaType:\s*d\.name\b/.test(wiz),
    "the submit posted the typed text as the type — this is the fourth-vocabulary defect returning",
  );
  assert.ok(
    /poojaType:\s*d\.pujaType\s*\?\?\s*d\.name/.test(wiz),
    "the submit must send the canonical value when one was picked",
  );

  proveDetects(
    GUARD,
    "the free-text-as-type detector fires on the original defect",
    (s: string) => /poojaType:\s*d\.name\b/.test(s),
    `body: JSON.stringify({ poojaType: d.name, teamSize: d.teamSize })`,
    `body: JSON.stringify({ poojaType: d.pujaType ?? d.name, teamSize: d.teamSize })`,
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
  `puja-service LISTING guard ✅ — NO LIST NO LISTING (creates follow the predicate, one flip owner ` +
    `both directions), video verdicts touch no listing flag, default false, W6 closed, owner reads ` +
    `unfiltered, 8 canonical types`,
);
