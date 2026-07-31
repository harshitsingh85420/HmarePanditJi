import assert from "node:assert";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import {
  DELETION_SPARE_COLUMNS,
  REVIEWABLE_DOCUMENT_COLUMNS,
  deletionSpareSqlPredicate,
} from "@hmarepanditji/types";
import { proveDetects } from "./g2";

// ─────────────────────────────────────────────────────────────
// SQL IN docs/ IS CODE. IT GETS CHECKED LIKE CODE.
//
// docs/review/prod-cleanup-sql-2026-07-30.md is a DESTRUCTIVE production
// script — DELETEs against a live database, run by hand in the Neon web
// console. It carried EIGHT wrong identifiers:
//
//   · p."aadhaarNumber" ×3          — no such column, ANYWHERE
//   · PoojaVerification."panditId"  — the column is panditProfileId
//   · PujaService."panditId"        — same
//   · three Review joins on a profile id — revieweeId is a USER id
//
// All eight were found by eye and fixed by eye — by the same eye that had
// missed all eight the first time. Nothing mechanical had ever read that
// file. This guard is the mechanism.
//
// NOTE THE SHAPE OF THE HARDEST ONE. `panditId` IS a real column — on
// DakshinaRate, BlockedDate, SamagriPackage, Booking and Payout. A check
// that merely asks "is this a column somewhere?" passes it happily. Only a
// TABLE-QUALIFIED check catches it, so this guard resolves aliases back to
// their tables before judging any column.
//
// G2 IS EXECUTABLE HERE (see the SELF-PROOF section): every failure class
// this guard hunts — and every failure class the guard ITSELF exhibited
// (CRLF-reads-nothing, indexOf misattribution, inline-mention counting) —
// runs as a planted specimen through the guard's own code path on every
// suite run. The manual flip-proofs of 2026-07-31 are machinery now.
// ─────────────────────────────────────────────────────────────

console.log("Running sql-doc-identifier guard…");

const REPO = join(__dirname, "..", "..", "..", "..");
const SCHEMA = readFileSync(join(REPO, "packages/db/prisma/schema.prisma"), "utf8");

// ── the schema, as { Model: Set<field> } ──────────────────────
const MODELS = new Map<string, Set<string>>();
for (const m of SCHEMA.matchAll(/^model\s+(\w+)\s*\{([\s\S]*?)^\}/gm)) {
  const fields = new Set<string>();
  for (const line of m[2].split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("//") || t.startsWith("@@")) continue;
    const name = t.split(/\s+/)[0];
    if (/^[A-Za-z_]\w*$/.test(name)) fields.add(name);
  }
  MODELS.set(m[1], fields);
}
assert.ok(MODELS.size > 10, `only parsed ${MODELS.size} models — the schema parser is broken`);

// ── ID SPACES ────────────────────────────────────────────────
// EXISTENCE IS NOT ENOUGH. Of the eight broken references, only FIVE are
// non-existent identifiers. The three Review joins used columns that all
// exist:
//
//     WHERE r."revieweeId" = p.id
//
// `revieweeId` is a real column on Review and `id` is a real column on
// PanditProfile. Postgres runs it happily and returns zero rows forever —
// a silent wrong answer, which is worse than the loud failure of a typo.
// It is wrong because revieweeId holds a **User** id and p.id is a
// **PanditProfile** id: two different id spaces compared as if they were one.
//
// The schema states every id space out loud in @relation(references: [id]),
// so that class IS mechanically checkable. This map is how.
const ID_SPACE = new Map<string, string>(); // "Model.column" → the model whose id it holds
for (const m of SCHEMA.matchAll(/^model\s+(\w+)\s*\{([\s\S]*?)^\}/gm)) {
  const model = m[1];
  ID_SPACE.set(`${model}.id`, model);
  for (const r of m[2].matchAll(/^\s*\w+\s+(\w+)[\[\]?\s]*@relation\(([^)]*)\)/gm)) {
    const target = r[1];
    const f = /fields:\s*\[(\w+)\]/.exec(r[2]);
    const ref = /references:\s*\[(\w+)\]/.exec(r[2]);
    if (f && ref && ref[1] === "id" && MODELS.has(target)) {
      ID_SPACE.set(`${model}.${f[1]}`, target);
    }
  }
}
assert.ok(
  ID_SPACE.get("Review.revieweeId") === "User",
  "the id-space map did not learn that Review.revieweeId holds a User id — the @relation parser " +
    "is broken, and the exact defect this check exists for would pass unnoticed",
);
// The trickiest field in the schema: panditId is PROFILE-space on five models
// and USER-space on this one. The chat paste of Block 2 hedged its delete
// across both spaces because nobody knew which — the map must know.
assert.ok(
  ID_SPACE.get("FavoritePandit.panditId") === "User",
  "the id-space map did not learn that FavoritePandit.panditId holds a User id",
);
assert.ok(
  ID_SPACE.get("Booking.panditId") === "PanditProfile",
  "the id-space map did not learn that Booking.panditId holds a PanditProfile id",
);

// Aliases that are NOT schema tables: CTEs and temp tables created in the
// script itself. Resolving them is out of scope; they are skipped by name.
const LOCAL_RELATIONS = new Set(["debris"]);

interface Problem { file: string; fence: number; text: string; why: string }
const problems: Problem[] = [];

// ── FENCE EXTRACTION, as a function so G2 can aim at it ──────
// CRLF: on Windows any editor — or any script that rewrites a doc — can save
// it with \r\n, and /```sql\n/ then matches NOTHING. The first run of this
// guard against a rewritten file scanned ZERO fences and printed a pass:
// "0 bad identifiers" meaning "0 identifiers read". Normalisation lives here
// so both the real scan and the self-proof exercise the same path.
function extractFences(raw: string): string[] {
  const md = raw.replace(/\r\n/g, "\n");
  return [...md.matchAll(/```sql\n([\s\S]*?)```/g)].map((m) => m[1]);
}

// Line-start only: the ledger's PROSE mentions "```sql" mid-sentence when
// talking about this very guard, and an unanchored match counted those as
// openers — a floor that failed on any file describing the guard. A fence
// opener is at column 0 of its own line; an inline mention never is.
function countOpeners(raw: string): number {
  return (raw.match(/(?:^|\r?\n)```sql/g) || []).length;
}

function checkFence(file: string, idx: number, sql: string) {
  // alias → table, from FROM/JOIN/UPDATE/DELETE FROM/INSERT INTO
  const alias = new Map<string, string>();
  const rels: string[] = [];
  for (const m of sql.matchAll(/\b(?:FROM|JOIN|UPDATE|INTO)\s+"(\w+)"(?:\s+(?:AS\s+)?(\w+))?/gi)) {
    const [, table, as] = m;
    rels.push(table);
    alias.set(as || table, table);
    alias.set(table, table);
  }
  // CTE / temp-table names declared here are local, not schema tables
  for (const m of sql.matchAll(/(?:WITH|CREATE\s+TEMP\s+TABLE)\s+(\w+)\s+AS/gi)) {
    LOCAL_RELATIONS.add(m[1]);
  }

  // 1 · every relation named must be a real model
  for (const t of rels) {
    if (LOCAL_RELATIONS.has(t)) continue;
    if (!MODELS.has(t)) {
      problems.push({ file, fence: idx, text: `"${t}"`, why: `no model named ${t} in schema.prisma` });
    }
  }

  // 2 · every qualified column must exist ON ITS OWN TABLE
  for (const m of sql.matchAll(/(\w+)\."(\w+)"/g)) {
    const [, qual, col] = m;
    if (LOCAL_RELATIONS.has(qual)) continue;
    const table = alias.get(qual);
    if (!table) continue;            // unresolvable qualifier — not this guard's job
    if (LOCAL_RELATIONS.has(table)) continue;
    const fields = MODELS.get(table);
    if (!fields) continue;           // already reported as a bad relation above
    if (!fields.has(col)) {
      problems.push({
        file, fence: idx, text: `${qual}."${col}"`,
        why: `${table} has no column ${col}` +
          ([...MODELS].some(([, f]) => f.has(col))
            ? ` (it exists on another model — this is the panditId shape)`
            : ` (no model has it at all)`),
      });
    }
  }

  // 3 · every id-to-id comparison must be WITHIN ONE ID SPACE
  const spaceOf = (qual: string, col: string): string | undefined => {
    const table = alias.get(qual);
    return table ? ID_SPACE.get(`${table}.${col}`) : undefined;
  };
  for (const m of sql.matchAll(/(\w+)\.(?:"(\w+)"|(id))\s*=\s*(\w+)\.(?:"(\w+)"|(id))/g)) {
    const [full, lq, lc1, lc2, rq, rc1, rc2] = m;
    const left = spaceOf(lq, lc1 || lc2);
    const right = spaceOf(rq, rc1 || rc2);
    if (!left || !right || left === right) continue; // unknown on either side → not judged
    problems.push({
      file, fence: idx, text: full.replace(/\s+/g, " "),
      why: `id-space mismatch — ${alias.get(lq)}.${lc1 || lc2} holds a ${left} id, but ` +
        `${alias.get(rq)}.${rc1 || rc2} holds a ${right} id. Both columns exist, so this RUNS and ` +
        `silently matches nothing`,
    });
  }

  // 4 · THE DELETE LEG. `WHERE "x" IN (SELECT c FROM debris)` is where a wrong
  // id does its damage: it does not fail, it deletes the wrong rows. The temp
  // table's own columns carry id spaces too — `SELECT p.id AS profile_id,
  // p."userId" AS user_id` says so plainly — so learn them and check the IN.
  const tempSpace = new Map<string, string>(); // "debris.profile_id" → PanditProfile
  for (const t of sql.matchAll(/CREATE\s+TEMP\s+TABLE\s+(\w+)\s+AS\s+SELECT([\s\S]*?)FROM\s+"(\w+)"\s+(\w+)/gi)) {
    const [, temp, cols, srcTable, srcAlias] = t;
    for (const c of cols.matchAll(/(\w+)\.(?:"(\w+)"|(id))\s+AS\s+(\w+)/g)) {
      const [, q, c1, c2, out] = c;
      const table = q === srcAlias ? srcTable : alias.get(q);
      const space = table ? ID_SPACE.get(`${table}.${c1 || c2}`) : undefined;
      if (space) tempSpace.set(`${temp}.${out}`, space);
    }
  }
  const soleTable = [...new Set(rels.filter((t) => !LOCAL_RELATIONS.has(t) && MODELS.has(t)))];
  for (const m of sql.matchAll(/"(\w+)"\s+IN\s*\(\s*SELECT\s+(\w+)\s+FROM\s+(\w+)\s*\)/gi)) {
    const [full, col, tempCol, temp] = m;
    const right = tempSpace.get(`${temp}.${tempCol}`);
    if (!right) continue;
    // the statement's own table: DELETE FROM "X" / UPDATE "X".
    // m.index, NEVER sql.indexOf(full): four DELETE lines carry the byte-
    // identical substring `"panditId" IN (SELECT profile_id FROM debris)`,
    // and indexOf attributed every one of them to the FIRST line — so a
    // FavoritePandit flip resolved its owner as SamagriPackage (profile-
    // space, passes) and the G2 flip did not fire. The match knows where it
    // is; asking indexOf to rediscover it re-introduces ambiguity. The
    // self-proof below pins this with byte-identical specimen lines.
    const stmt = sql.slice(0, m.index).split(";").pop() || "";
    const owner = /(?:DELETE\s+FROM|UPDATE)\s+"(\w+)"/i.exec(stmt)?.[1] || soleTable[0];
    if (!owner) continue;
    const left = ID_SPACE.get(`${owner}.${col}`);
    if (!left || left === right) continue;
    problems.push({
      file, fence: idx, text: full.replace(/\s+/g, " "),
      why: `id-space mismatch in a DELETE/UPDATE — ${owner}.${col} holds a ${left} id, but ` +
        `${temp}.${tempCol} holds a ${right} id. This does not fail; it matches the wrong rows`,
    });
  }

  // 5 · unqualified quoted columns in SET / WHERE on a single-table statement
  const single = rels.filter((t) => !LOCAL_RELATIONS.has(t));
  if (new Set(single).size === 1) {
    const fields = MODELS.get(single[0]);
    if (fields) {
      for (const m of sql.matchAll(/(?:SET|WHERE|AND|OR|,)\s+"(\w+)"\s*(?:=|>|<|IS|NOT|IN)/gi)) {
        const col = m[1];
        if (!fields.has(col)) {
          problems.push({ file, fence: idx, text: `"${col}"`, why: `${single[0]} has no column ${col}` });
        }
      }
    }
  }
}

// ─────────────────────────────────────────────────────────────
// SELF-PROOF (law G2, executable). Planted specimens of every failure class
// run through the guard's OWN functions before the real scan. Each detect()
// call leaves the problems array exactly as it found it.
// ─────────────────────────────────────────────────────────────
const detectInSql = (sql: string): boolean => {
  const before = problems.length;
  checkFence("g2-specimen", 0, sql);
  const fired = problems.length > before;
  problems.length = before;
  return fired;
};

proveDetects("sqlDocIdentifiers", "a column no model has (aadhaarNumber, the original defect)",
  detectInSql,
  'SELECT p."aadhaarNumber" FROM "PanditProfile" p',
  'SELECT p."aadhaarLastFour" FROM "PanditProfile" p');

proveDetects("sqlDocIdentifiers", "a column that exists on ANOTHER model (the panditId shape)",
  detectInSql,
  'SELECT pv."panditId" FROM "PoojaVerification" pv',
  'SELECT pv."panditProfileId" FROM "PoojaVerification" pv');

proveDetects("sqlDocIdentifiers", "a relation that is not a model",
  detectInSql,
  'SELECT x.id FROM "PanditProfil" x',
  'SELECT x.id FROM "PanditProfile" x');

proveDetects("sqlDocIdentifiers", "a cross-space id equality (revieweeId = profile id) — runs, matches nothing",
  detectInSql,
  'SELECT 1 FROM "Review" r JOIN "PanditProfile" p ON r."revieweeId" = p.id',
  'SELECT 1 FROM "Review" r JOIN "PanditProfile" p ON r."revieweeId" = p."userId"');

// The DELETE leg + owner attribution, pinned with BYTE-IDENTICAL lines: the
// clean SamagriPackage delete precedes the tainted FavoritePandit delete and
// both carry the same IN-substring. Exactly ONE problem, naming
// FavoritePandit — anything else means owner attribution regressed to
// first-occurrence again.
{
  const specimen = [
    'CREATE TEMP TABLE debris AS',
    'SELECT p.id AS profile_id, p."userId" AS user_id',
    'FROM "PanditProfile" p;',
    'DELETE FROM "SamagriPackage" WHERE "panditId" IN (SELECT profile_id FROM debris);',
    'DELETE FROM "FavoritePandit" WHERE "panditId" IN (SELECT profile_id FROM debris);',
  ].join("\n");
  const before = problems.length;
  checkFence("g2-specimen", 0, specimen);
  const fired = problems.slice(before);
  problems.length = before;
  assert.strictEqual(
    fired.length, 1,
    `DETECTOR MISCOUNTED (law G2): the byte-identical-lines specimen must yield exactly 1 ` +
      `problem (the FavoritePandit line), got ${fired.length}:\n  ` +
      fired.map((p) => `${p.text} — ${p.why}`).join("\n  "),
  );
  assert.ok(
    fired[0].why.includes("FavoritePandit.panditId"),
    `DETECTOR MISATTRIBUTED (law G2): the problem must name FavoritePandit.panditId (User-space), ` +
      `got: ${fired[0].why}\nOwner attribution has regressed to first-occurrence (the indexOf bug).`,
  );
}

// The reading pipeline itself: CRLF must not blind the fence extractor, and
// the opener counter must see line-start fences but not prose mentions.
proveDetects("sqlDocIdentifiers", "fence extraction under CRLF (the read-nothing hole)",
  (raw: string) => extractFences(raw).length === 1,
  'prose\r\n```sql\r\nSELECT 1;\r\n```\r\n');
proveDetects("sqlDocIdentifiers", "opener counting: line-start yes, inline prose mention no",
  (raw: string) => countOpeners(raw) === 1,
  'text\n```sql\nSELECT 1;\n```',
  'the guard parses every ```sql fence in docs');

// ─────────────────────────────────────────────────────────────
// THE REAL SCAN
// ─────────────────────────────────────────────────────────────
const DOCS = join(REPO, "docs/review");
let fenceCount = 0;
const files = existsSync(DOCS) ? readdirSync(DOCS).filter((f) => f.endsWith(".md")) : [];
assert.ok(files.length > 0, "docs/review contains no .md files — the scan reached nothing");
for (const f of files) {
  const raw = readFileSync(join(DOCS, f), "utf8"); // raw on purpose — see countOpeners
  const fences = extractFences(raw);
  fences.forEach((sql, i) => checkFence(f, i + 1, sql));
  fenceCount += fences.length;
  // THE FLOOR IS DERIVED, NOT DECLARED. `fenceCount >= 6` was true the day it
  // was written and wrong the day a doc is added or removed. The property
  // actually wanted is per-file: every line-start opener in the RAW text must
  // correspond to a parsed fence, else fail naming the file.
  const openers = countOpeners(raw);
  if (openers > 0) {
    assert.strictEqual(
      fences.length, openers,
      `${f}: ${openers} \`\`\`sql opener(s) at line start in raw text, ${fences.length} fences ` +
        `parsed. One or more fences is invisible to the guard — line endings, an unclosed fence ` +
        `swallowing the next, or a parser regression. A guard that reads nothing must never ` +
        `report clean.`,
    );
  }
}

assert.deepStrictEqual(
  problems.map((p) => `${p.file} fence#${p.fence}  ${p.text}  — ${p.why}`),
  [],
  "SQL in docs/review references identifiers that do not exist in schema.prisma:\n  " +
    problems.map((p) => `${p.file} fence#${p.fence}  ${p.text}  — ${p.why}`).join("\n  ") +
    "\nThese are hand-run production scripts. An identifier that does not exist means the block " +
    "fails at the console — or worse, a column that exists on a DIFFERENT table means it deletes " +
    "the wrong rows.",
);

// ── THE PREDICATE IS REGENERATED, NOT PASTED ─────────────────
// It was pasted once. That drifts the day someone adds an identity column,
// which is the exact failure this whole sequence was about. Each SQL block
// declares its own contract in a `-- @generated NAME` marker and the guard
// regenerates from that named constant and diffs. Markers exist because the
// first version sniffed for `aadhaarFrontUrl IS NULL` and assumed
// DELETION_SPARE — and immediately failed on §5, which is
// REVIEWABLE_DOCUMENT_COLUMNS (4 columns) and is SUPPOSED to differ.
// Comparison is on the ORDERED COLUMN SEQUENCE, not the text: alignment is
// presentation; the column list is the contract.
const SETS: Record<string, readonly string[]> = {
  DELETION_SPARE_COLUMNS,
  REVIEWABLE_DOCUMENT_COLUMNS,
};

function generatedBlockProblems(md: string): string[] {
  const out: string[] = [];
  let blocks = 0;
  for (const sql of extractFences(md)) {
    const marks = [...sql.matchAll(/--\s*@generated\s+(\w+)\n([\s\S]*?)--\s*@end/g)];
    if (!marks.length) {
      // no unmarked block may carry a spare/document predicate — otherwise a
      // new hand-typed copy escapes the check simply by omitting the marker
      if (/p\."aadhaar\w+"\s+IS NULL/.test(sql)) {
        out.push(
          `a SQL block tests identity columns for NULL but carries no "-- @generated <SET>" ` +
            `marker. Mark it DELETION_SPARE_COLUMNS or REVIEWABLE_DOCUMENT_COLUMNS so it is ` +
            `regenerated and diffed like the others.`,
        );
      }
      continue;
    }
    for (const [, setName, body] of marks) {
      const cols = SETS[setName];
      if (!cols) { out.push(`unknown @generated set "${setName}" — known: ${Object.keys(SETS).join(", ")}`); continue; }
      blocks++;
      const actual = [...body.matchAll(/p\."\w+"\s+IS NULL/g)].map((x) => x[0].replace(/\s+/g, " "));
      const expected = cols.map((c) => `p."${c}" IS NULL`);
      if (JSON.stringify(actual) !== JSON.stringify(expected)) {
        out.push(
          `a @generated ${setName} block does not match the constant.\n  expected: ` +
            `${expected.join(" AND ")}\n  found:    ${actual.join(" AND ")}\nSomeone changed the ` +
            `constant without regenerating the doc, or hand-edited the doc — the destructive ` +
            `script and the queue's definition of "has identity data" have drifted.`,
        );
      }
    }
  }
  if (blocks < 3) {
    out.push(
      `expected at least 3 @generated blocks (§1b preview, §3 delete, §5 count) — found ` +
        `${blocks}. If the preview and the delete do not carry the SAME predicate, the preview ` +
        `is not a preview.`,
    );
  }
  return out;
}

// G2 for the block checker: a drifted block must be seen, an unmarked
// identity block must be seen, and the clean shape must pass.
{
  const mk = (body: string) => "```sql\n" + body + "\n```\n";
  const spare = DELETION_SPARE_COLUMNS.map((c) => `  AND p."${c}" IS NULL`).join("\n");
  const reviewable = REVIEWABLE_DOCUMENT_COLUMNS.map((c) => `  AND p."${c}" IS NULL`).join("\n");
  const clean =
    mk(`SELECT 1 WHERE 1=1\n-- @generated DELETION_SPARE_COLUMNS\n${spare}\n-- @end`) +
    mk(`SELECT 1 WHERE 1=1\n-- @generated DELETION_SPARE_COLUMNS\n${spare}\n-- @end`) +
    mk(`SELECT 1 WHERE 1=1\n-- @generated REVIEWABLE_DOCUMENT_COLUMNS\n${reviewable}\n-- @end`);
  const drifted = clean.replace(`  AND p."${DELETION_SPARE_COLUMNS[0]}" IS NULL\n`, "");
  const unmarked = clean + mk(`SELECT 1 WHERE p."aadhaarFrontUrl" IS NULL`);
  proveDetects("sqlDocIdentifiers", "a @generated block that drifted from its constant",
    (md: string) => generatedBlockProblems(md).length > 0, drifted, clean);
  proveDetects("sqlDocIdentifiers", "an identity-column block with no @generated marker",
    (md: string) => generatedBlockProblems(md).length > 0, unmarked, clean);
}

const CLEANUP = join(REPO, "docs/review/prod-cleanup-sql-2026-07-30.md");
assert.ok(
  existsSync(CLEANUP),
  "docs/review/prod-cleanup-sql-2026-07-30.md is missing — if it was renamed, update this guard " +
    "in the same commit; a silently-vanished target disarms every check above",
);
{
  // STALE DIST. `@hmarepanditji/types` resolves to dist/, and a check that
  // reads a stale copy of the thing it is checking is not a check — the
  // source is read directly and compared to what was imported.
  const SRC = readFileSync(join(REPO, "packages/types/src/verification.ts"), "utf8").replace(/\r\n/g, "\n");
  const evidence = /IDENTITY_EVIDENCE_COLUMNS\s*=\s*\{([\s\S]*?)\n\}\s*as const;/.exec(SRC);
  assert.ok(evidence, "could not read IDENTITY_EVIDENCE_COLUMNS from source — the reader is broken");
  const fromSource = [...evidence![1].matchAll(/"(\w+)"/g)].map((m) => m[1]);
  assert.deepStrictEqual(
    [...DELETION_SPARE_COLUMNS],
    fromSource,
    "the IMPORTED DELETION_SPARE_COLUMNS does not match packages/types/src/verification.ts. The " +
      "types package's dist/ is stale: run `pnpm --filter @hmarepanditji/types build`. Until then " +
      "every guard importing @hmarepanditji/types is testing the previous build, not the code.",
  );

  // sanity: the generator and the constant agree before anything is compared
  assert.deepStrictEqual(
    deletionSpareSqlPredicate("p").split(/\s*AND\s*/).map((s) => s.trim()).filter(Boolean),
    DELETION_SPARE_COLUMNS.map((c) => `p."${c}" IS NULL`),
    "deletionSpareSqlPredicate() no longer emits DELETION_SPARE_COLUMNS",
  );

  const md = readFileSync(CLEANUP, "utf8");
  const blockProblems = generatedBlockProblems(md);
  assert.deepStrictEqual(blockProblems, [],
    "prod-cleanup-sql-2026-07-30.md @generated blocks:\n" + blockProblems.join("\n"));

  assert.ok(
    /GENERATED from `DELETION_SPARE_COLUMNS`/i.test(md.replace(/\r\n/g, "\n")),
    "the cleanup doc no longer states that its spare list is generated — a reader will hand-edit it",
  );
}

console.log(
  `sql-doc-identifier guard ✅ — ${fenceCount} SQL fences across ${files.length} docs, ` +
    `${MODELS.size} models parsed, 0 bad identifiers, spare predicate regenerated and matched, ` +
    `9 planted specimens caught (G2 executable)`,
);
