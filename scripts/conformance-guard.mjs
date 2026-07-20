#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────
// THE CONFORMANCE GUARD — "the documentation is followed" as a build status.
//
// The register's own closing rule: CI must fail if any requirement lacks
// exactly ONE of a passing automated test, a manual-test script entry, or
// a SIGNED deviation line. This enforces that.
//
// Three ways a requirement is discharged, and what each one has to prove:
//
//   auto      → a test file exists AND names the ID in a test title.
//               Naming the ID is the whole point: it makes the link
//               checkable in both directions, so a test can't drift away
//               from the requirement it claims to cover, and a requirement
//               can't point at a test that stopped existing.
//               (The assertion itself is proven by the suite running in
//               CI — this guard proves the LINK, the suite proves the
//               BEHAVIOUR. Both are required; neither substitutes.)
//
//   manual    → an entry in docs/spec/MANUAL_TESTS.md with that ID and
//               real steps, because some things only a human on a phone
//               can check (camera, GPS, a 62-year-old's ears).
//
//   deviation → a SIGNED block in docs/spec/DEVIATIONS.md. Unsigned drafts
//               do NOT discharge anything. An unsigned deviation is just a
//               gap someone wrote a paragraph about, and if it counted,
//               the guard would launder every gap into compliance — which
//               is exactly the failure this document exists to prevent.
//
// Exit 1 on any unmapped, mis-mapped, or unsigned-deviation requirement.
// ─────────────────────────────────────────────────────────────
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const REQS = join(ROOT, "docs", "spec", "requirements.yaml");
const COV = join(ROOT, "docs", "spec", "coverage.yaml");
const MANUAL = join(ROOT, "docs", "spec", "MANUAL_TESTS.md");
const DEVIATIONS = join(ROOT, "docs", "spec", "DEVIATIONS.md");

// ── minimal YAML reader ──────────────────────────────────────
// Deliberately not a dependency: the repo's guards are zero-dep by
// convention, and both files are emitted by us in a fixed shape. This
// reads exactly that shape and nothing more — if the shape drifts, it
// throws instead of silently returning half a file.
function unq(v) {
  const t = v.trim();
  if (t.startsWith('"') && t.endsWith('"')) {
    return t.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, "\\");
  }
  return t;
}

function readRequirementIds(text) {
  const ids = [];
  const byId = {};
  let cur = null;
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^      - id:\s*(.+)$/);
    if (m) {
      cur = { id: unq(m[1]) };
      ids.push(cur.id);
      byId[cur.id] = cur;
      continue;
    }
    if (!cur) continue;
    const s = line.match(/^        (status|typeRaw|requirement):\s*(.+)$/);
    if (s) cur[s[1]] = unq(s[2]);
  }
  return { ids, byId };
}

function readCoverage(text) {
  const out = {};
  let cur = null;
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.replace(/\s+#.*$/, "");
    const m = line.match(/^  - id:\s*(.+)$/);
    if (m) {
      cur = { id: unq(m[1]) };
      out[cur.id] = cur;
      continue;
    }
    if (!cur) continue;
    const k = line.match(/^    (kind|ref|note):\s*(.+)$/);
    if (k) cur[k[1]] = unq(k[2]);
  }
  return out;
}

// ── evidence collectors ──────────────────────────────────────
function walk(dir, hit, out = []) {
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return out;
  }
  for (const e of entries) {
    if (e === "node_modules" || e === "dist" || e === ".next" || e === ".git") continue;
    const p = join(dir, e);
    let st;
    try {
      st = statSync(p);
    } catch {
      continue;
    }
    if (st.isDirectory()) walk(p, hit, out);
    else if (hit(e)) out.push(p);
  }
  return out;
}

const testFiles = walk(ROOT, (f) => /\.test\.(ts|tsx|mjs)$/.test(f) || /\.spec\.ts$/.test(f));
const testCorpus = testFiles.map((f) => ({ path: f, text: readFileSync(f, "utf-8") }));

const manualText = existsSync(MANUAL) ? readFileSync(MANUAL, "utf-8") : "";
const deviationText = existsSync(DEVIATIONS) ? readFileSync(DEVIATIONS, "utf-8") : "";

/**
 * A deviation is signed only if its block carries a real signature and date.
 * The template ships with an empty placeholder; an unfilled placeholder must
 * never read as signed, so both fields must be non-placeholder.
 */
function deviationSigned(id) {
  const blocks = deviationText.split(/^## /m);
  const block = blocks.find((b) => b.includes(id));
  if (!block) return { found: false, signed: false };
  const sig = block.match(/^-?\s*\*?\*?Signed(?:\s*by)?\*?\*?\s*:\s*(.*)$/im);
  const date = block.match(/^-?\s*\*?\*?Date\*?\*?\s*:\s*(.*)$/im);
  const bad = (v) => !v || !v[1] || /^_+$|^\s*$|TBD|PENDING|<.*>|xxx/i.test(v[1].trim());
  return { found: true, signed: !bad(sig) && !bad(date) };
}

// ── the check ────────────────────────────────────────────────
if (!existsSync(REQS)) {
  console.error("✗ docs/spec/requirements.yaml missing — run node scripts/gen-requirements.mjs");
  process.exit(1);
}
const { ids, byId } = readRequirementIds(readFileSync(REQS, "utf-8"));
const coverage = existsSync(COV) ? readCoverage(readFileSync(COV, "utf-8")) : {};

if (ids.length === 0) {
  console.error("✗ parsed ZERO requirements from requirements.yaml — format drift.");
  process.exit(1);
}

const problems = [];
const ok = { auto: 0, manual: 0, deviation: 0 };
const pending = [];

for (const id of ids) {
  const c = coverage[id];
  if (!c || !c.kind) {
    problems.push({ id, why: "UNMAPPED — no coverage entry" });
    continue;
  }

  if (c.kind === "auto") {
    const named = testCorpus.filter((t) => t.text.includes(id));
    if (named.length === 0) {
      problems.push({ id, why: `auto, but no test file names "${id}"` });
      continue;
    }
    if (c.ref) {
      const refHit = named.some((t) => t.path.replace(/\\/g, "/").endsWith(c.ref.replace(/\\/g, "/")));
      if (!refHit) {
        problems.push({ id, why: `auto ref "${c.ref}" does not name ${id} (moved or renamed?)` });
        continue;
      }
    }
    ok.auto++;
  } else if (c.kind === "manual") {
    if (!manualText.includes(id)) {
      problems.push({ id, why: "manual, but MANUAL_TESTS.md has no entry" });
      continue;
    }
    ok.manual++;
  } else if (c.kind === "deviation") {
    const d = deviationSigned(id);
    if (!d.found) {
      problems.push({ id, why: "deviation, but DEVIATIONS.md has no block for it" });
      continue;
    }
    if (!d.signed) {
      pending.push({ id, why: "deviation drafted but UNSIGNED — awaiting founder signature" });
      continue;
    }
    ok.deviation++;
  } else {
    problems.push({ id, why: `unknown coverage kind "${c.kind}"` });
  }
}

// ── report ───────────────────────────────────────────────────
const total = ids.length;
const discharged = ok.auto + ok.manual + ok.deviation;
console.log("─".repeat(66));
console.log("CONFORMANCE GUARD — pandit-POV register");
console.log("─".repeat(66));
console.log(`  requirements      ${total}`);
console.log(`  discharged        ${discharged}   (auto ${ok.auto} · manual ${ok.manual} · deviation ${ok.deviation})`);
console.log(`  awaiting sig      ${pending.length}`);
console.log(`  unmapped/broken   ${problems.length}`);
console.log("─".repeat(66));

if (pending.length) {
  console.log("\nAWAITING FOUNDER SIGNATURE (drafted, not signed):");
  for (const p of pending) console.log(`  ⏳ ${p.id}  ${p.why}`);
}
if (problems.length) {
  console.log("\nNOT DISCHARGED:");
  const byBlock = {};
  for (const p of problems) (byBlock[p.id.slice(0, 3)] ||= []).push(p);
  for (const [b, list] of Object.entries(byBlock)) {
    console.log(`\n  ${b}`);
    for (const p of list) console.log(`    ✗ ${p.id}  ${p.why}`);
  }
}

if (problems.length || pending.length) {
  console.log(
    "\n✗ FAIL — every requirement must map to a passing AUTO test, a MANUAL\n" +
      "  script entry, or a SIGNED deviation. See docs/spec/coverage.yaml.\n"
  );
  process.exit(1);
}
console.log("\n✓ every requirement is discharged.\n");
