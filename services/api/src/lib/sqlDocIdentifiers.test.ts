import assert from "node:assert";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import {
  DELETION_SPARE_COLUMNS,
  REVIEWABLE_DOCUMENT_COLUMNS,
  deletionSpareSqlPredicate,
} from "@hmarepanditji/types";

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
// EXISTENCE IS NOT ENOUGH, and the order overstated what one guard buys.
// Of the eight broken references, only FIVE are non-existent identifiers.
// The three Review joins used columns that all exist:
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

// Aliases that are NOT schema tables: CTEs and temp tables created in the
// script itself. Resolving them is out of scope; they are skipped by name.
const LOCAL_RELATIONS = new Set(["debris"]);

interface Problem { file: string; fence: number; text: string; why: string }
const problems: Problem[] = [];

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
    // the statement's own table: DELETE FROM "X" / UPDATE "X"
    const own = /(?:DELETE\s+FROM|UPDATE)\s+"(\w+)"[^;]*?"?\w*"?\s+IN\s*\(\s*SELECT\s+\w+\s+FROM\s+\w+/i;
    const stmt = sql.slice(0, sql.indexOf(full)).split(";").pop() || "";
    const owner = /(?:DELETE\s+FROM|UPDATE)\s+"(\w+)"/i.exec(stmt)?.[1] || soleTable[0];
    void own;
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

// CRLF. On Windows any editor — or any script that rewrites this doc — can
// save it with \r\n, and `/```sql\n/` then matches NOTHING. The first run of
// this guard against a rewritten file scanned ZERO fences and reported clean.
// A guard that reads nothing must never pass: hence the normalisation AND the
// floor assertions below. The instrument's scope is itself a claim.
const read = (p: string) => readFileSync(p, "utf8").replace(/\r\n/g, "\n");

const DOCS = join(REPO, "docs/review");
let fenceCount = 0;
const files = existsSync(DOCS) ? readdirSync(DOCS).filter((f) => f.endsWith(".md")) : [];
for (const f of files) {
  const md = read(join(DOCS, f));
  let i = 0;
  for (const m of md.matchAll(/```sql\n([\s\S]*?)```/g)) {
    checkFence(f, ++i, m[1]);
    fenceCount++;
  }
}
assert.ok(
  fenceCount >= 6,
  `only found ${fenceCount} SQL fences in docs/review — expected at least 6. The scan is not ` +
    `reaching the documents it claims to check, so "0 bad identifiers" would mean "0 identifiers ` +
    `read". Check line endings and fence markers before trusting a pass.`,
);

assert.deepStrictEqual(
  problems.map((p) => `${p.file} fence#${p.fence}  ${p.text}  — ${p.why}`),
  [],
  "SQL in docs/review references identifiers that do not exist in schema.prisma:\n  " +
    problems.map((p) => `${p.file} fence#${p.fence}  ${p.text}  — ${p.why}`).join("\n  ") +
    "\nThese are hand-run production scripts. An identifier that does not exist means the block " +
    "fails at the console — or worse, a column that exists on a DIFFERENT table means it deletes " +
    "the wrong rows.",
);

// ── 4 · THE PREDICATE IS REGENERATED, NOT PASTED ──────────────
// Honest answer to "is it build-time?": it was NOT. It was generated once and
// pasted, which drifts the day someone adds an identity column — the exact
// failure this whole sequence was about. So it is recomputed HERE, on every
// run, and diffed against the file.
//
// EACH BLOCK DECLARES WHICH SET IT IS. The first version of this check
// sniffed for `aadhaarFrontUrl IS NULL` and assumed DELETION_SPARE — and
// immediately failed on §5, which is REVIEWABLE_DOCUMENTS (4 columns) and is
// SUPPOSED to differ. Both derived sets live in the same file by design, so
// the block states its own contract in a `-- @generated NAME` marker and the
// guard checks it against that named constant. No guessing.
//
// Comparison is on the ORDERED COLUMN SEQUENCE, not on the text: the doc puts
// AND at line-start and pads for alignment, the generator puts AND at
// line-end. Alignment is presentation; the column list is the contract.
const SETS: Record<string, readonly string[]> = {
  DELETION_SPARE_COLUMNS,
  REVIEWABLE_DOCUMENT_COLUMNS,
};

const CLEANUP = join(REPO, "docs/review/prod-cleanup-sql-2026-07-30.md");
let predicateBlocks = 0;
if (existsSync(CLEANUP)) {
  const md = read(CLEANUP);

  // STALE DIST. `@hmarepanditji/types` resolves to dist/, and `pnpm gate` does
  // not rebuild it — so this guard imports the LAST BUILD, not the source. The
  // drift proof passed silently on an edited source until types was rebuilt by
  // hand. A check that reads a stale copy of the thing it is checking is not a
  // check, so the source is read directly and compared to what was imported.
  const SRC = read(join(REPO, "packages/types/src/verification.ts"));
  const evidence = /IDENTITY_EVIDENCE_COLUMNS\s*=\s*\{([\s\S]*?)\n\}\s*as const;/.exec(SRC);
  assert.ok(evidence, "could not read IDENTITY_EVIDENCE_COLUMNS from source — the reader is broken");
  const fromSource = [...evidence[1].matchAll(/"(\w+)"/g)].map((m) => m[1]);
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

  for (const m of md.matchAll(/```sql\n([\s\S]*?)```/g)) {
    const sql = m[1];
    const marks = [...sql.matchAll(/--\s*@generated\s+(\w+)\n([\s\S]*?)--\s*@end/g)];

    // no unmarked block may carry a spare/document predicate — otherwise a new
    // hand-typed copy escapes the check simply by omitting the marker
    if (!marks.length) {
      assert.ok(
        !/p\."aadhaar\w+"\s+IS NULL/.test(sql),
        `a SQL block in prod-cleanup-sql-2026-07-30.md tests identity columns for NULL but carries ` +
          `no "-- @generated <SET>" marker. Mark it DELETION_SPARE_COLUMNS or ` +
          `REVIEWABLE_DOCUMENT_COLUMNS so it is regenerated and diffed like the others.`,
      );
      continue;
    }

    for (const [, setName, body] of marks) {
      const cols = SETS[setName];
      assert.ok(cols, `unknown @generated set "${setName}" — known: ${Object.keys(SETS).join(", ")}`);
      predicateBlocks++;
      const actual = [...body.matchAll(/p\."\w+"\s+IS NULL/g)].map((x) => x[0].replace(/\s+/g, " "));
      const expected = cols.map((c) => `p."${c}" IS NULL`);
      assert.deepStrictEqual(
        actual,
        expected,
        `a @generated ${setName} block in prod-cleanup-sql-2026-07-30.md does not match the ` +
          `constant.\n  expected: ${expected.join(" AND ")}\n  found:    ${actual.join(" AND ")}\n` +
          `Someone changed the constant without regenerating the doc, or hand-edited the doc. ` +
          `Either way the destructive script and the queue's definition of "has identity data" ` +
          `have drifted, and rows carrying identity data can fall into the delete set.`,
      );
    }
  }

  assert.ok(
    predicateBlocks >= 3,
    `expected at least 3 @generated blocks (§1b preview, §3 delete, §5 count) — found ` +
      `${predicateBlocks}. If the preview and the delete do not carry the SAME predicate, the ` +
      `preview is not a preview.`,
  );

  assert.ok(
    /GENERATED from `DELETION_SPARE_COLUMNS`/i.test(md),
    "the cleanup doc no longer states that its spare list is generated — a reader will hand-edit it",
  );
}

console.log(
  `sql-doc-identifier guard ✅ — ${fenceCount} SQL fences across ${files.length} docs, ` +
    `${MODELS.size} models parsed, 0 bad identifiers, spare predicate regenerated and matched in ` +
    `${predicateBlocks} blocks (${DELETION_SPARE_COLUMNS.length} columns)`,
);
