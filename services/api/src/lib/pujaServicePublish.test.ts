import assert from "node:assert";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { proveMatchers, proveSaw, proveDetects } from "./g2";
import { PUJA_TYPES, PUJA_LABELS_HI, PUJA_LABELS_EN, isPujaType, CUSTOM_PUJA_REQUEST } from "@hmarepanditji/types";

// ─────────────────────────────────────────────────────────────
// THE LISTING LAW — INVERTED BY RULING (Isj's सही, 2026-08-03).
//
// THIS FILE USED TO ASSERT THE OPPOSITE and that is the point of saying it
// here: under Track 2A, "isActive:true is reachable ONLY through admin
// approval" — the wizard created rows false and approval published. Isj's
// confirmed model decouples VIDEO from LISTING: a pooja is LISTED AND
// BOOKABLE the moment the pandit declares he performs it; video approval is
// a trust verdict with its own lifecycle (PoojaVerification.status) and the
// badge means "verified and shown in video", specifically. Aadhaar stays the
// business door — F-B3-1 gates the LISTING at VERIFIED.
//
// THE THREE CLAUSES:
//   1 · SUBMIT PUBLISHES — every pandit-declaration create sets isActive:TRUE
//       explicitly (the schema default is now FALSE, so a forgotten field
//       UNpublishes — the polarity that closed W6).
//   2 · ONLY THE PANDIT UNLISTS — no admin path, no verdict, no mirror update
//       may touch the flag. (No unlist endpoint exists yet; until it does,
//       ZERO writers may flip the flag in either direction after create.)
//   3 · VIDEO VERDICTS NEVER TOUCH LISTING — approve/reject write
//       PoojaVerification.status and nothing else.
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
// `.create({ data: { ... } })` — the /me/services writer uses the second, and
// a classifier that only knew the first convicted a correct declaration.
const CREATE_PUBLISHED = /create\(?:?\s*\{\s*(?:data:\s*\{)?[^}]*isActive:\s*true/;
const UPDATE_TOUCHES_FLAG = /update:\s*\{[^}]*isActive/;
const TOUCHES_FLAG = /isActive:/;

// ── G2: every matcher proven able to see the defect, and to stay quiet ──
proveMatchers(GUARD, [
  [
    "a create clause that LISTS on declaration (clause 1)",
    CREATE_PUBLISHED,
    `create: { panditProfileId: p, pujaType: t, dakshinaAmount: 1, isActive: true }`,
    `create: { panditProfileId: p, pujaType: t, dakshinaAmount: 1, isActive: false }`,
  ],
  [
    "the bare .create({ data: … }) declaration shape (the /me/services writer)",
    CREATE_PUBLISHED,
    `prisma.pujaService.create({ data: { pujaType: t, isActive: true, } });`,
    `prisma.pujaService.create({ data: { pujaType: t, isActive: false, } });`,
  ],
  [
    "an update clause that touches the publish flag",
    UPDATE_TOUCHES_FLAG,
    `update: { dakshinaAmount: 1, isActive: true }`,
    `update: { dakshinaAmount: 1 }`,
  ],
  [
    "any write that touches the listing flag (clauses 2-3 hunt these)",
    TOUCHES_FLAG,
    `data: { isActive: true }`,
    `data: { status: "APPROVED" }`,
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

// ── 1 · CLAUSE 1: the wizard LISTS on declaration, and never touches the flag on update ──
{
  const save = fnBody(poojaCtrl, "savePoojaConfig");
  proveSaw(GUARD, "savePoojaConfig body chars", save.length);
  assert.ok(save.includes("pujaService.upsert"), "savePoojaConfig must write the customer-readable table (Option A)");
  assert.ok(
    CREATE_PUBLISHED.test(save),
    "a declared pooja must be created isActive:TRUE — submit publishes (Isj's सही); a false create " +
      "is now a STUCK row, because no path flips false→true any more",
  );
  assert.ok(
    !UPDATE_TOUCHES_FLAG.test(save),
    "re-saving a price must not touch isActive — it must never re-list a pooja the pandit himself unlisted",
  );
}

// ── 2 · the dakshina mirror never publishes ──
{
  const rate = fnBody(authCtrl, "upsertDakshinaRate");
  proveSaw(GUARD, "upsertDakshinaRate body chars", rate.length);
  assert.ok(rate.includes("pujaService.upsert"), "the rate write must mirror the price into PujaService");
  assert.ok(
    CREATE_PUBLISHED.test(rate),
    "setting a rate IS declaring the pooja (the readiness path) — the mirrored row lists on create, " +
      "or it is stuck invisible forever",
  );
  assert.ok(!UPDATE_TOUCHES_FLAG.test(rate), "editing a rate must never touch the listing flag");
}

// ── 3 · CLAUSES 2-3: video verdicts NEVER touch the listing; the flag is
//        written ONLY inside declaration creates ──
{
  const allWrites = [...pujaServiceWrites(poojaCtrl), ...pujaServiceWrites(authCtrl), ...pujaServiceWrites(panditRoutes)];
  proveSaw(GUARD, "PujaService write sites found across all three writer files", allWrites.length);
  for (const blk of allWrites) {
    if (TOUCHES_FLAG.test(blk)) {
      assert.ok(
        CREATE_PUBLISHED.test(blk),
        `a PujaService write touches isActive outside a declaration create:\n${blk.slice(0, 200)}\n` +
          "Only the pandit's own declaration may set the flag (true, on create). " +
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
      assert.ok(/isActive:\s*true/.test(blk), "the /me/services create must set isActive:TRUE explicitly — a declaration lists, and the default is now FALSE (a forgotten field must unpublish, not publish)");
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
  `puja-service LISTING guard ✅ — submit publishes (all declaration creates list), video verdicts ` +
    `touch no listing flag, default false, W6 closed, owner reads unfiltered, 8 canonical types`,
);
