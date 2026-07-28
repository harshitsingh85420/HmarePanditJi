import assert from "node:assert";
import { codeOnly } from "./code-only";

// ─────────────────────────────────────────────────────────────
// The comment-stripper's own guard. Ten guards are about to depend on this
// function; if it is wrong, every one of them fails silently in the SAFE
// direction — a vacuous pass — which is the worst possible failure for a guard.
//
// The cases below are the six real sightings that produced the tool, plus the
// trap that made a regex implementation unacceptable.
// ─────────────────────────────────────────────────────────────

console.log("Running codeOnly() self-guard...");

const eq = (actual: string, expected: string, msg: string) =>
  assert.strictEqual(actual.replace(/ +$/gm, ""), expected.replace(/ +$/gm, ""), msg);

// ── 1. THE URL TRAP — the reason this is a scanner, not a regex ──
{
  const src = 'const API = "http://localhost:3001/api/v1"; // the base';
  const got = codeOnly(src);
  assert.ok(
    got.includes('"http://localhost:3001/api/v1"'),
    `a URL inside a string was mangled — this is the trap that makes regex strippers wrong:\n  ${got}`,
  );
  assert.ok(!got.includes("the base"), "the trailing comment survived");
}

// ── 2. TRAILING comments — no hand-rolled copy handled these ──
{
  const got = codeOnly('const k = "hpj_token"; // was getItem("token")');
  assert.ok(got.includes('"hpj_token"'), "the asserted literal was destroyed");
  assert.ok(!got.includes("getItem"), "a trailing comment's forbidden pattern survived — sighting #6 exactly");
}

// ── 3. LINE NUMBERS PRESERVED — all ten copies shifted them ──
{
  const src = ["// header", "const a = 1;", "/* block", "   spans */", "const b = 2;"].join("\n");
  const got = codeOnly(src);
  assert.strictEqual(got.split("\n").length, src.split("\n").length, "line count changed — file:line references would be wrong");
  assert.strictEqual(got.split("\n")[4], "const b = 2;", "line 5 is no longer line 5");
}

// ── 4. JSX block comments ──
{
  const got = codeOnly("<div>{/* RESERVED slot 5 */}</div>");
  assert.ok(!got.includes("RESERVED"), "a {/* JSX */} comment survived");
}

// ── 5. REGEX literals containing // are not comments ──
{
  const got = codeOnly("const re = /https:\\/\\//g; const x = 1;");
  assert.ok(got.includes("const x = 1;"), `a regex literal ate the rest of the line:\n  ${got}`);
}

// ── 6. TEMPLATE literals: contents kept, but comments INSIDE ${} stripped ──
{
  const got = codeOnly("const u = `${base /* drop me */}/api/v1`;");
  assert.ok(got.includes("/api/v1"), "template text was destroyed");
  assert.ok(!got.includes("drop me"), "a comment inside an interpolation survived");
}

// ── 7. strings:"blank" blanks contents but keeps the quotes ──
{
  const got = codeOnly('const label = "दक्षिणा — प्लेटफ़ॉर्म से";', { strings: "blank" });
  assert.ok(!got.includes("दक्षिणा"), "string contents were not blanked");
  assert.ok(got.includes('const label = "'), "the code around the string was damaged");
}

// ── 8. hash mode for .env / .yml ──
{
  const src = 'NEXT_PUBLIC_API_URL="http://localhost:8080"   # ORIGIN only — client appends /api/v1';
  const kept = codeOnly(src);
  assert.ok(kept.includes("/api/v1"), "hash mode must be OFF by default");
  const stripped = codeOnly(src, { hash: true });
  assert.ok(!stripped.includes("ORIGIN only"), "hash comment survived with hash:true");
  assert.ok(stripped.includes("localhost:8080"), "hash mode ate the value");
}

// ── 9. THE SIGHTING-#6 REGRESSION, verbatim ──
// A file that was FIXED, carrying a comment that records the old broken code.
// The scout grep reported it as still broken. codeOnly must see it as fixed.
{
  const fixedFile = [
    "// These calls used to hardcode `/api/customers/...`, which is wrong under",
    "// every committed env value. They now go through resolveApiBase().",
    'import { resolveApiBase } from "@hmarepanditji/utils";',
    "const { base } = resolveApiBase(process.env.NEXT_PUBLIC_API_URL, false);",
  ].join("\n");
  assert.ok(fixedFile.includes("/api/customers"), "precondition: the raw file DOES contain the pattern");
  assert.ok(
    !codeOnly(fixedFile).includes("/api/customers"),
    "codeOnly still sees the fixed file as broken — the tool does not solve the class it was built for",
  );
}

// ── 10. a guard's own deny-list prose must not convict the guard ──
{
  const guardSrc = [
    "// Forbidden: localStorage.getItem(\"adminToken\") — use ADMIN_TOKEN_KEY.",
    'assert.ok(!src.includes("adminToken"));',
  ].join("\n");
  const got = codeOnly(guardSrc, { strings: "blank" });
  assert.ok(!got.includes("adminToken"), "the guard's explanatory comment still contains the pattern it forbids");
}

console.log("✓ codeOnly() self-guard passed (10 cases incl. the URL trap and the sighting-#6 regression)");
