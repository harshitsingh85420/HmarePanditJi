import assert from "node:assert";
import { proveMatchers } from "./g2";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { codeOnly } from "@hmarepanditji/utils/code-only";

// ─────────────────────────────────────────────────────────────
// A SESSION MUST SURVIVE A RELOAD.
//
// WHAT HAPPENED. apps/web's auth context bootstrapped on an HttpOnly cookie
// and, on success, set the USER and never the TOKEN. `setAccessToken` was
// called only inside login(), so after any reload `accessToken` was null.
// Every customer screen gates on `if (!accessToken) return;` — silent, no
// retry — so the entire authenticated customer app rendered its EMPTY STATE.
//
// Three independent reasons it could never have worked:
//   · the token was never restored on boot;
//   · there was no cookie (vercel.app app, onrender.com API — third-party);
//   · the API reads an Authorization HEADER and does not accept cookies.
// Verified live 2026-07-29: /auth/me with credentials:"include" → 401
// "Missing or invalid Authorization header"; with a Bearer header → 200.
//
// WHY THE EXISTING GUARD PASSED THROUGHOUT. storage-key.test.ts asserts the
// writer and reader use the same KEY STRING. Both did — 'hpj_token'. They
// disagreed about the MECHANISM (localStorage vs cookie), and a string
// comparison cannot see that. This guard asserts the BEHAVIOUR instead.
// ─────────────────────────────────────────────────────────────

console.log("Running session-survives-reload guard…");

const REPO = join(__dirname, "..", "..", "..", "..");
const read = (p: string) => codeOnly(readFileSync(join(REPO, p), "utf8"));

const CTX_PATH = "apps/web/src/context/auth-context.tsx";
const CTX = read(CTX_PATH);

// ── 1. THE BOOT PATH RESTORES THE TOKEN ──────────────────────
// The whole bug in one assertion: a boot that sets the user but not the token.
const bootIdx = CTX.indexOf("async function boot()");
assert.ok(bootIdx > 0, "the auth bootstrap is gone — this guard has lost its subject");
const boot = CTX.slice(bootIdx, CTX.indexOf("boot();", bootIdx));

// `setAccessToken(stored)` — the RESTORE, not merely any call to the setter.
//
// THIS MATCHER WAS BLIND ON ITS FIRST DRAFT and the revert proof caught it. It
// read `/setAccessToken\(/`, which also matches the `setAccessToken(null)` in
// the 401 branch a few lines below — inside the same boot body. Commenting out
// the restore therefore left the guard GREEN: the call that CLEARS the token
// was being counted as evidence that the token is restored.
//
// Law G2 inside the guard written to enforce law G2. The synthetic pre-fix
// fixture in the prove-to-fail section below did not catch it either, because
// that fixture happened to contain no setter call at all — which is why the
// proof that matters is reverting the REAL file, not asserting on a mock of it.
assert.ok(
  /setAccessToken\(stored\)/.test(boot),
  `${CTX_PATH}'s bootstrap never restores the STORED token (setAccessToken(stored)). The token is ` +
    `then set ONLY inside login(), so accessToken is null after every reload, deep link and fresh ` +
    `navigation — and every screen that does \`if (!accessToken) return;\` silently renders its ` +
    `empty state.`,
);
assert.ok(
  /localStorage\.getItem\(CUSTOMER_TOKEN_KEY\)/.test(boot),
  "the bootstrap does not READ the stored token. It must read the same key the login writes, " +
    "through the shared constant — not a literal, and not a cookie.",
);

// ── 2. IT VALIDATES WITH THE HEADER THE SERVER ACTUALLY REQUIRES ──
assert.ok(
  /Authorization: `Bearer \$\{stored\}`/.test(boot),
  "the bootstrap does not send an Authorization header. Verified live: the API answers 401 " +
    '"Missing or invalid Authorization header" to a cookie-only /auth/me and 200 to a Bearer one.',
);
assert.ok(
  !/credentials:\s*["']include["']/.test(boot),
  "the bootstrap still uses credentials:'include'. That mechanism cannot work — the cookie is " +
    "third-party between vercel.app and onrender.com, and the server does not read cookies anyway.",
);

// ── 3. THE WRITE AND THE READ ARE ONE MODULE, ONE CONSTANT ───
assert.ok(
  /localStorage\.setItem\(CUSTOMER_TOKEN_KEY/.test(CTX),
  "login() does not persist the token. If only the login PAGE writes it, the context and the page " +
    "are a writer/reader pair again — which is how this drifted in the first place.",
);
assert.ok(
  /localStorage\.removeItem\(CUSTOMER_TOKEN_KEY/.test(CTX),
  "logout() does not clear the stored token — the next boot would restore the session the " +
    "customer just ended",
);
const LOGIN_PAGE = read("apps/web/app/login/page.tsx");
assert.ok(
  !/localStorage\.setItem\("hpj_token"/.test(LOGIN_PAGE),
  'apps/web/app/login/page.tsx hardcodes "hpj_token" again. Use CUSTOMER_TOKEN_KEY: a literal is ' +
    "how a writer and a reader drift apart with no guard noticing.",
);

// ── 4. THE THIRD CONTEXT STAYS DELETED ───────────────────────
// Unreachability, not correction: a corrected duplicate is still a duplicate
// somebody can import by mistake.
assert.ok(
  !existsSync(join(REPO, "packages/utils/src/auth-context.tsx")),
  "packages/utils/src/auth-context.tsx is back. It was a THIRD auth implementation with zero " +
    "importers, and its existence is what forced this package's barrel to require React.",
);
const BARREL = read("packages/utils/src/index.ts");
assert.ok(
  !/export \* from '\.\/auth-context'/.test(BARREL),
  "the utils barrel exports auth-context again",
);

// ── 5. "NO DATA" AND "NO SESSION" MUST BE DISTINGUISHABLE ────
// The sibling assertion Isj asked for. A screen that returns early on a missing
// token, and then renders the same empty state it shows for a genuinely empty
// list, has collapsed two different truths into one sentence.
const SCREENS = [
  "apps/web/app/dashboard/bookings/page.tsx",
];
for (const s of SCREENS) {
  const src = read(s);
  if (!/if \(!accessToken\) return;/.test(src)) continue;
  // TIGHTENED. The first version accepted the mere PRESENCE of `authLoading`
  // anywhere in the file — and passed on the page as it then stood, which
  // rendered one empty state for both truths. Same granularity bug as the
  // per-file verification-naming guard: a file-level match standing in for an
  // element-level fact. Assert the BRANCH, not a vocabulary.
  assert.ok(
    /\)\s*:\s*!accessToken \?/.test(src) || /!accessToken \?\s*\(/.test(src),
    `${s} has no render branch keyed on a MISSING SESSION. It returns early when accessToken is ` +
      `absent, leaving bookings empty, and then falls into the "no bookings" state — telling a ` +
      `customer who owns a booking that he has none. The two must render differently.`,
  );
  // …and the session branch must not reuse the no-data words.
  const sessIdx = src.search(/!accessToken \?/);
  const sessBranch = src.slice(sessIdx, sessIdx + 700);
  assert.ok(
    !/कोई बुकिंग नहीं|haven't made any bookings/.test(sessBranch),
    `${s}'s missing-session branch reuses the "no bookings" copy. Rendering a different branch ` +
      `with the same sentence collapses the distinction again.`,
  );
}

// ── PROVE-TO-FAIL (law G2) ───────────────────────────────────
// Each matcher is shown able to match the REAL shape it hunts — for the
// negatives, the verbatim text of the code that was just removed.
const mustMatch: Array<[string, RegExp, string]> = [
  ["the boot restore, as written", /setAccessToken\(/, "        setAccessToken(stored);"],
  ["the stored read, as written", /localStorage\.getItem\(CUSTOMER_TOKEN_KEY\)/,
    "        const stored = localStorage.getItem(CUSTOMER_TOKEN_KEY);"],
  ["the Bearer header, as written", /Authorization: `Bearer \$\{stored\}`/,
    "          headers: { Authorization: `Bearer ${stored}` },"],
  ["the cookie bootstrap (the regression), verbatim", /credentials:\s*["']include["']/,
    '          credentials: "include", // CRITICAL: sends cookies'],
  ["the hardcoded key (the regression), verbatim", /localStorage\.setItem\("hpj_token"/,
    '      localStorage.setItem("hpj_token", token);'],
  ["the barrel export (the regression), verbatim", /export \* from '\.\/auth-context'/,
    "export * from './auth-context';"],
];
proveMatchers("sessionSurvivesReload", mustMatch);
// And the headline assertion must FAIL on the real pre-fix boot body.
const preFixBoot = `async function boot() {
        const res = await fetch(\`\${API_BASE}/auth/me\`, {
          credentials: "include",
        });
        if (res.ok) { setUserState(me); }
      }`;
assert.ok(
  !/setAccessToken\(/.test(preFixBoot),
  "MATCHER BLIND: the headline check passes the ACTUAL pre-fix bootstrap — the one that set the " +
    "user and never the token. It would have stayed green through the entire outage.",
);

console.log(
  `session-survives-reload guard ✅ — boot restores + validates with Bearer, write/read share one ` +
    `constant in one module, the third context stays deleted, ` +
    `${mustMatch.length + 1} matchers proven able to fail`,
);
