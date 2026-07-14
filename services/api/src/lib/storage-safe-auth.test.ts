import assert from "node:assert";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

// ─────────────────────────────────────────────────────────────
// L8 + L10 — BUILD-FAILING STORAGE-SAFE-AUTH GUARD (scans the pandit app).
//   L8: the auth token must NEVER be touched via raw localStorage — a
//       storage throw (private mode / locked WebView) would make api()
//       reject and brick the front door. All token access funnels through
//       lib/safeStorage.ts. And api.ts — which every request passes
//       through — must not read storage directly at all.
//   L10: api.ts must carry the 401 → dead-session interceptor so an
//       expired token routes to re-auth deterministically (and NOT on 5xx).
// A future edit that reads the token raw, or drops the 401 branch, fails
// the build here.
// ─────────────────────────────────────────────────────────────

const PANDIT_SRC = join(__dirname, "..", "..", "..", "..", "apps", "pandit", "src");
const norm = (p: string) => p.split("\\").join("/");

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    const st = statSync(p);
    if (st.isDirectory()) {
      if (entry === "node_modules" || entry === ".next") continue;
      walk(p, out);
    } else if (/\.(tsx?|jsx?)$/.test(entry) && !/\.(test|spec)\.(tsx?|jsx?)$/.test(entry)) {
      out.push(p);
    }
  }
  return out;
}

console.log("Running storage-safe-auth guard (L8/L10)…");

// L8a: token never accessed via raw localStorage/sessionStorage (except safeStorage.ts)
const TOKEN_RAW = /(localStorage|sessionStorage)\s*\.\s*(getItem|setItem|removeItem)\s*\(\s*[`"']pandit_token/;
const tokenViolations: string[] = [];
let apiTsRawStorage = false;
let apiTsHas401 = false;

for (const file of walk(PANDIT_SRC)) {
  const n = norm(file);
  const text = readFileSync(file, "utf8");
  if (n.endsWith("/lib/safeStorage.ts")) continue; // the sanctioned accessor
  text.split("\n").forEach((line, i) => {
    if (TOKEN_RAW.test(line)) tokenViolations.push(`${n.replace(norm(PANDIT_SRC), "src")}:${i + 1}  ${line.trim()}`);
  });
  if (n.endsWith("/lib/api.ts")) {
    // L8b: api.ts must not touch raw storage at all
    if (/\blocalStorage\b|\bsessionStorage\b/.test(text)) apiTsRawStorage = true;
    // L10: the 401 interceptor must exist
    if (/status\s*===\s*401/.test(text) && /signalSessionExpired/.test(text)) apiTsHas401 = true;
  }
}

if (tokenViolations.length) {
  console.error(`\nL8: ${tokenViolations.length} raw pandit_token storage access(es) — use getToken/setToken/clearToken:`);
  for (const v of tokenViolations) console.error("  " + v);
}
assert.strictEqual(tokenViolations.length, 0, "auth token accessed via raw storage — route through @/lib/safeStorage");
assert.ok(!apiTsRawStorage, "L8: api.ts reads raw localStorage/sessionStorage — a storage throw would brick every request; use safeStorage");
assert.ok(apiTsHas401, "L10: api.ts is missing the 401 → signalSessionExpired interceptor");

// self-checks
assert.ok(TOKEN_RAW.test('localStorage.getItem("pandit_token")'), "guard regex must catch the known raw pattern");

console.log("storage-safe-auth guard: token via safeStorage, api.ts storage-clean, 401 interceptor present ✅");
