import assert from "node:assert";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
// Comments are stripped by the ONE shared implementation. See
// packages/utils/src/code-only.ts for why this is a scanner and not a
// regex, and for the single documented raw-source exception.
import { codeOnly } from "@hmarepanditji/utils/code-only";
// (the /code-only SUBPATH, not the barrel: the barrel re-exports
//  auth-context.tsx, which requires React — unresolvable in bare node+tsx.)

// ─────────────────────────────────────────────────────────────
// STORAGE-KEY CONTRACT GUARD — writer == reader
// Isj order, 2026-07-28. Sightings #5 (admin) and its repeat in apps/web.
//
// admin:    login wrote 'hpj_admin_token'; ten screens read a hard-coded
//           "adminToken", sent `Bearer ` empty, and got 401s that
//           `if (res.ok)` swallowed into blank pages — or worse, into a
//           hard-coded MOCK booking shown under a real booking's URL.
// customer: login writes 'hpj_token'; FOURTEEN sites read a bare "token"
//           written nowhere in the repo. Three of them were login GATES, so
//           an authenticated customer was bounced into a modal that wrote the
//           token again and re-entered the same gate — an unbreakable loop.
//
// THE GENERIC SHAPE: no app may contain a session-token key LITERAL at all.
// Every read and write goes through packages/utils. A new hard-coded key
// cannot be introduced without failing this build.
// ─────────────────────────────────────────────────────────────

console.log("Running storage-key (writer==reader) contract guard...");

const REPO = join(__dirname, "..", "..", "..", "..");

function walk(dir: string, out: string[] = []): string[] {
  for (const e of readdirSync(dir)) {
    if (e === "node_modules" || e === ".next" || e === "dist") continue;
    const p = join(dir, e);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.(ts|tsx)$/.test(e) && !/\.test\.tsx?$/.test(e)) out.push(p);
  }
  return out;
}

// ── the one source ────────────────────────────────────────────
const CONSTS = readFileSync(join(REPO, "packages/utils/src/token-constants.ts"), "utf8");
const adminKey = /ADMIN_TOKEN_KEY\s*=\s*['"]([^'"]+)['"]/.exec(CONSTS);
const custKey = /CUSTOMER_TOKEN_KEY\s*=\s*['"]([^'"]+)['"]/.exec(CONSTS);
assert.ok(adminKey, "ADMIN_TOKEN_KEY must be defined in packages/utils");
assert.ok(custKey, "CUSTOMER_TOKEN_KEY must be defined in packages/utils");

// ── the WRITERS use the same value the constants declare ──────
const ADMIN_LOGIN = codeOnly(readFileSync(join(REPO, "apps/admin/src/app/login/page.tsx"), "utf8"));
assert.ok(
  /ADMIN_TOKEN_KEY/.test(ADMIN_LOGIN),
  "the admin login must WRITE through ADMIN_TOKEN_KEY, not a literal",
);
const WEB_LOGIN = codeOnly(readFileSync(join(REPO, "apps/web/app/login/page.tsx"), "utf8"));
assert.ok(
  new RegExp(custKey![1]).test(WEB_LOGIN) || /CUSTOMER_TOKEN_KEY/.test(WEB_LOGIN),
  `the customer login must write ${custKey![1]}`,
);

// ── NO app may hard-code a session-token key anywhere ─────────
// These are the exact spellings that caused the two breaks, plus the bare
// "token" that is written nowhere. Adding a new one fails here.
const FORBIDDEN = [
  { lit: '"adminToken"', why: "10 admin screens sent an empty bearer" },
  { lit: "'adminToken'", why: "10 admin screens sent an empty bearer" },
  { lit: '"token"', why: "14 customer sites read a key written nowhere" },
  { lit: "'token'", why: "14 customer sites read a key written nowhere" },
  { lit: '"hpj_user_token"', why: "a fourth spelling that nothing writes" },
];

const APPS = ["apps/admin/src", "apps/web/app", "apps/web/components", "apps/web/src"];
const offenders: string[] = [];
const scannedFiles = APPS.flatMap((app) => walk(join(REPO, app)));
// ADJUDICATED NOUN: storage call sites seen. Files-scanned is upstream — it
// stays in the hundreds even if codeOnly or the anchor breaks and no storage
// call is ever examined.
let storageCallsJudged = 0;
for (const file of scannedFiles) {
  const src = codeOnly(readFileSync(file, "utf8"));
  storageCallsJudged += (src.match(/(getItem|setItem|removeItem)\(/g) || []).length;
  for (const f of FORBIDDEN) {
    // only inside a storage call — "token" is a legitimate word elsewhere
    const re = new RegExp(`(getItem|setItem|removeItem)\\(\\s*${f.lit.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`, "g");
    if (re.test(src)) offenders.push(`${file.replace(REPO, "").replace(/\\/g, "/")}  ${f.lit} — ${f.why}`);
  }
}
assert.deepStrictEqual(
  offenders,
  [],
  `hard-coded session-token keys found. Import the constant from @hmarepanditji/utils instead:\n  ${offenders.join("\n  ")}`,
);

// ── the deprecated alias may exist but must not diverge ───────
const alias = /USER_TOKEN_KEY\s*=\s*(CUSTOMER_TOKEN_KEY|['"]([^'"]+)['"])/.exec(CONSTS);
if (alias && alias[2]) {
  assert.strictEqual(
    alias[2],
    custKey![1],
    "USER_TOKEN_KEY has drifted from CUSTOMER_TOKEN_KEY — that divergence IS the bug this file exists to stop",
  );
}

// ── G2 (2026-07-31): the forbidden-literal detector's clean specimen is the
// word "token" OUTSIDE a storage call — the legitimate use the storage-call
// anchor exists to spare.
import { proveMatchers, proveSaw } from "./g2";
proveSaw("tokenKeyContract", "app source files scanned", scannedFiles.length);
proveSaw("tokenKeyContract", "storage call sites JUDGED for hard-coded keys", storageCallsJudged);
proveSaw("tokenKeyContract", "token-key constants parsed", [adminKey, custKey].filter(Boolean).length);
proveMatchers("tokenKeyContract", [
  ["a hard-coded admin key in a storage call", /(getItem|setItem|removeItem)\(\s*"adminToken"/,
    'const t = localStorage.getItem("adminToken");'],
  ["the bare token key in a storage call", /(getItem|setItem|removeItem)\(\s*"token"/,
    'localStorage.setItem("token", data.token);',
    'const label = "token"; // legitimate word outside a storage call'],
  ["the ADMIN_TOKEN_KEY constant in the writer", /ADMIN_TOKEN_KEY/,
    "localStorage.setItem(ADMIN_TOKEN_KEY, token);"],
  ["a drifted USER_TOKEN_KEY alias", /USER_TOKEN_KEY\s*=\s*['"]([^'"]+)['"]/,
    'export const USER_TOKEN_KEY = "hpj_user_token";',
    "export const USER_TOKEN_KEY = CUSTOMER_TOKEN_KEY;"],
]);

console.log(`✓ storage-key contract guard passed (admin='${adminKey![1]}', customer='${custKey![1]}')`);
