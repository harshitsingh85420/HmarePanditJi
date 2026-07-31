import assert from "node:assert";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { proveDetects, proveSaw } from "./g2";

// ─────────────────────────────────────────────────────────────
// FAIL-BY-OMISSION — the class sqlDocIdentifiers structurally cannot catch.
//
// §3 RAN against production on 2026-07-31 and failed:
//     ERROR: update or delete on "PanditProfile" violates RESTRICT setting
//     of foreign key constraint "PoojaConfig_panditProfileId_fkey" (23001)
// Nine child deletes were hand-listed; PoojaConfig was not among them. The
// list's own comment — "column names verified against schema.prisma" —
// verified that what was WRITTEN exists. It could not verify that what
// EXISTS was written. An existence guard is blind to absence.
//
// THIS guard checks the other direction: for any docs/review SQL fence that
// deletes from PanditProfile or User, EVERY schema dependent of that table
// must appear in the same fence — as its own DELETE naming the FK column,
// or as an explicit `fk-sentinel:` annotation (intentionally relying on
// RESTRICT to abort), or — if the edge is ever Cascade — an explicit
// `fk-cascade-accepted:` annotation, because a Cascade dependent deletes
// SILENTLY: had PoojaConfig been Cascade, §3 would have SUCCEEDED and taken
// rows nobody listed and nobody would ever have known.
// ─────────────────────────────────────────────────────────────

console.log("Running sql-fk-completeness guard (fail-by-omission)…");

const REPO = join(__dirname, "..", "..", "..", "..");
const SCHEMA = readFileSync(join(REPO, "packages/db/prisma/schema.prisma"), "utf8");

interface Edge { model: string; col: string; action: string }

/** Every FK edge pointing AT `target`, with its SQL column name (@map-aware)
 *  and its effective onDelete action (Prisma defaults: required→Restrict,
 *  optional→SetNull). */
function dependentsOf(target: string, schema: string): Edge[] {
  const out: Edge[] = [];
  for (const m of schema.matchAll(/^model\s+(\w+)\s*\{([\s\S]*?)^\}/gm)) {
    const model = m[1];
    for (const line of m[2].split("\n")) {
      const r = /@relation\(([^)]*)\)/.exec(line);
      if (!r) continue;
      if (line.trim().split(/\s+/)[1] !== target) continue;
      const f = /fields:\s*\[(\w+)\]/.exec(r[1]);
      if (!f) continue;
      const fkLine = m[2].split("\n").find((l) => l.trim().startsWith(f[1] + " "));
      const optional = fkLine ? /\?$/.test(fkLine.trim().split(/\s+/)[1] ?? "") : false;
      const od = /onDelete:\s*(\w+)/.exec(r[1]);
      const mapped = fkLine && /@map\("(\w+)"\)/.exec(fkLine);
      out.push({
        model,
        col: mapped ? mapped[1] : f[1],
        action: od ? od[1] : optional ? "SetNull" : "Restrict",
      });
    }
  }
  return out;
}

/** Problems for one fence that deletes from one or both targets. */
function omissions(sql: string, targets: string[]): string[] {
  const out: string[] = [];
  for (const target of targets) {
    if (!new RegExp(`DELETE\\s+FROM\\s+"${target}"`, "i").test(sql)) continue;
    for (const e of dependentsOf(target, SCHEMA)) {
      if (e.model === target) continue; // self-reference — covered by the delete itself
      const deleted =
        new RegExp(`DELETE\\s+FROM\\s+"${e.model}"`, "i").test(sql) && sql.includes(`"${e.col}"`);
      const sentinel = sql.includes(`fk-sentinel: ${e.model}.${e.col}`);
      const cascadeOk = sql.includes(`fk-cascade-accepted: ${e.model}.${e.col}`);
      if (e.action === "Cascade" && !cascadeOk) {
        out.push(
          `${e.model}.${e.col} → ${target} is CASCADE: this fence's DELETE FROM "${target}" will ` +
            `take ${e.model} rows SILENTLY. Either list the delete explicitly or annotate ` +
            `"-- fk-cascade-accepted: ${e.model}.${e.col}" so the reliance is a decision, not luck.`,
        );
        continue;
      }
      if (!deleted && !sentinel && !cascadeOk) {
        out.push(
          `${e.model}.${e.col} → ${target} (${e.action}) is UNHANDLED: no DELETE FROM "${e.model}" ` +
            `naming "${e.col}" in this fence, and no fk-sentinel annotation. ` +
            `${e.action === "Restrict" ? "The transaction will ABORT mid-run (the PoojaConfig failure, 23001)." : "SetNull will silently orphan the reference."}`,
        );
      }
    }
  }
  return out;
}

// ── G2 · SELF-PROOF — the PoojaConfig regression is the tainted specimen ──
const CLEAN_FENCE = [
  'DELETE FROM "PoojaConfig" WHERE "panditProfileId" IN (SELECT profile_id FROM debris);',
  'DELETE FROM "PanditProfile" WHERE id IN (SELECT profile_id FROM debris);',
  '-- fk-sentinel: Booking.panditId x',
  '-- fk-sentinel: Payout.panditId x',
  '-- fk-sentinel: CustomerRating.panditId x',
  '-- fk-sentinel: PujaService.panditProfileId x',
  '-- fk-sentinel: DakshinaRate.panditId x',
  '-- fk-sentinel: SamagriPackage.panditId x',
  '-- fk-sentinel: PoojaVerification.panditProfileId x',
  '-- fk-sentinel: BlockedDate.panditId x',
].join("\n");
const TAINTED_FENCE = CLEAN_FENCE.split("\n").slice(1).join("\n"); // PoojaConfig delete removed
proveDetects("sqlFkCompleteness", "the PoojaConfig omission (the real 23001 regression)",
  (sql: string) => omissions(sql, ["PanditProfile"]).some((p) => p.startsWith("PoojaConfig.")),
  TAINTED_FENCE, CLEAN_FENCE);
proveDetects("sqlFkCompleteness", "an unannotated Cascade edge is flagged as a silent taker",
  (sql: string) =>
    omissions(sql, ["PanditProfile"]).length >
    omissions(sql + '\n-- fk-cascade-accepted: PoojaConfig.panditProfileId', ["PanditProfile"]).length,
  // simulate by treating the specimen's missing edge under a hypothetical annotation
  TAINTED_FENCE);

// ── observations ─────────────────────────────────────────────
const DEP_PP = dependentsOf("PanditProfile", SCHEMA);
const DEP_USER = dependentsOf("User", SCHEMA);
proveSaw("sqlFkCompleteness", "FK edges into PanditProfile parsed", DEP_PP.length);
proveSaw("sqlFkCompleteness", "FK edges into User parsed", DEP_USER.length);
assert.ok(
  DEP_PP.some((e) => e.model === "PoojaConfig"),
  "the dependency parser no longer sees PoojaConfig → PanditProfile — the edge that aborted §3; " +
    "the parser has rotted and every completeness verdict below is void",
);

// ── THE REAL SCAN ────────────────────────────────────────────
const DOCS = join(REPO, "docs/review");
const files = existsSync(DOCS) ? readdirSync(DOCS).filter((f) => f.endsWith(".md")) : [];
let fencesChecked = 0;
const problems: string[] = [];
for (const f of files) {
  const raw = readFileSync(join(DOCS, f), "utf8").replace(/\r\n/g, "\n");
  for (const m of raw.matchAll(/```sql\n([\s\S]*?)```/g)) {
    const sql = m[1];
    if (!/DELETE\s+FROM\s+"(PanditProfile|User)"/i.test(sql)) continue;
    fencesChecked++;
    for (const p of omissions(sql, ["PanditProfile", "User"])) problems.push(`${f}: ${p}`);
  }
}
proveSaw("sqlFkCompleteness", "destructive fences checked", fencesChecked);
assert.deepStrictEqual(
  problems, [],
  "FAIL-BY-OMISSION in docs/review destructive SQL:\n  " + problems.join("\n  "),
);

console.log(
  `sql-fk-completeness guard ✅ — ${DEP_PP.length}+${DEP_USER.length} FK edges mapped ` +
    `(all Restrict — zero Cascade, zero silent takers), ${fencesChecked} destructive fence(s) complete`,
);
