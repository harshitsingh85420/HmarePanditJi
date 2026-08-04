import assert from "node:assert";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { proveMatchers, proveSaw, proveDetects } from "./g2";
import { ALGORITHM } from "../utils/aadhaar";
import {
  encryptPayoutField,
  decryptPayoutField,
  tryDecryptPayoutField,
  isAesCiphertext,
  bankAccountLast4,
  maskUpiId,
  classifyLegacyBankValue,
  classifyLegacyUpiValue,
} from "../utils/payoutCredentials";

// ─────────────────────────────────────────────────────────────
// PAYOUT-CREDENTIAL GUARD — ruled order #2 (Isj, 2026-08-04)
//
// The defect: `bankAccountNumber` had FOUR writers in THREE formats —
// base64 from onboarding.controller.ts (via a function named `encrypt`)
// and readiness.controller.ts, RAW PLAINTEXT from pandit.routes.ts and
// voice.routes.ts. `upiId` was plaintext throughout. Two readers then did
// `slice(-4)` on the stored blob, so a base64 row printed the last four
// characters of BASE64 to the pandit as his own account digits, and to the
// operator as the identity check before money moved by hand.
//
// THE BOUNDARY IS THE WRITER SET, not a directory. §1 below fails the build
// on any write to a credential column that does not go through the helper —
// which is what would have caught all four original writers, two of which
// lived in routes files no security guard reads.
//
// 🔴 THIS GUARD MAY NEVER BE CITED AS MIGRATION PROOF (Isj, ruled verbatim).
//    It reads SOURCE. It cannot see a single row of data. Only the
//    backfill's dry-run count and an after-count of zero non-AES rows prove
//    that stored credentials moved. See §6 for the full list of what these
//    pins cannot prove — written down so this never becomes the next
//    feeLabel /10%/, a guard that keeps passing after its claim went false.
// ─────────────────────────────────────────────────────────────

const GUARD = "payoutCredentials";
const SRC = join(__dirname, "..");
const ROOT = join(SRC, "..", "..", "..");
const read = (...p: string[]) => readFileSync(join(...p), "utf8");

console.log("Running payout-credential guard (writer set + cipher + claim-to-algorithm)…");

// ── 0 · the cipher actually works, and fails closed ──
process.env.ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "a".repeat(64);
const ACC = "1234567890123";
const ct = encryptPayoutField(ACC);
assert.notStrictEqual(ct, ACC, "ciphertext must not equal plaintext");
assert.ok(isAesCiphertext(ct), "ciphertext must be hex of iv+tag+body");
assert.strictEqual(decryptPayoutField(ct), ACC, "round-trip must return the original");
assert.strictEqual(bankAccountLast4(ACC), "0123", "last four must be the trailing digits of the PLAINTEXT");
assert.strictEqual(maskUpiId("ramesh@okhdfc"), "ra•••@okhdfc", "upi mask keeps two leading chars and the handle");

// FAIL-CLOSED: the legacy formats must read as UNREADABLE, never be accepted.
// A decrypt path that takes both formats forever is the half-true guard again.
proveDetects(
  GUARD,
  "a base64 legacy value is UNREADABLE, never silently accepted",
  (v: string) => tryDecryptPayoutField(v) === null,
  Buffer.from(ACC).toString("base64"),
  ct,
);
proveDetects(
  GUARD,
  "a raw plaintext legacy value is UNREADABLE, never silently accepted",
  (v: string) => tryDecryptPayoutField(v) === null,
  ACC,
  ct,
);

// the migration classifier separates the three formats cleanly
assert.strictEqual(classifyLegacyBankValue(ct), "aes");
assert.strictEqual(classifyLegacyBankValue(ACC), "plaintext");
assert.strictEqual(classifyLegacyBankValue(Buffer.from(ACC).toString("base64")), "base64");
assert.strictEqual(classifyLegacyBankValue("नमस्ते"), "unrecoverable");
assert.strictEqual(classifyLegacyUpiValue("ramesh@okhdfc"), "plaintext");
assert.strictEqual(classifyLegacyUpiValue(Buffer.from("ramesh@okhdfc").toString("base64")), "base64");

// ── 1 · THE WRITER-SET PIN — the boundary ──
const WRITER_FILES = [
  ["controllers", "onboarding.controller.ts"],
  ["controllers", "readiness.controller.ts"],
  ["routes", "pandit.routes.ts"],
  ["routes", "voice.routes.ts"],
];
let writes = 0;
for (const parts of WRITER_FILES) {
  const src = read(SRC, ...parts);
  // every assignment to a credential column is either the helper or an explicit null
  for (const m of src.matchAll(/(bankAccountEncrypted|upiIdEncrypted)\s*[:=]\s*([^,;\n]+)/g)) {
    const rhs = m[2].trim();
    // `: true` / `: false` on a String? column can only be a Prisma SELECT
    // flag — a boolean is not assignable to it. Selects are reads, not writes.
    if (rhs === "true" || rhs === "false") continue;
    writes++;
    assert.ok(
      rhs.startsWith("encryptPayoutField(") || rhs === "null",
      `${parts.join("/")}: ${m[1]} is written as \`${rhs}\` — every credential write goes through encryptPayoutField() or is an explicit null`,
    );
  }
  // the dead columns take no WRITES. Two shapes are not writes and are
  // excluded by construction: `: true/false` is a Prisma select flag, and
  // `: z.…` is a request-schema field — the pandit still TYPES a upiId, we
  // simply never store it under that name again.
  for (const m of src.matchAll(/\b(bankAccountNumber|upiId)\s*:\s*([^,;\n]+)/g)) {
    const rhs = m[2].trim();
    if (rhs === "true" || rhs === "false" || rhs.startsWith("z.")) continue;
    assert.fail(
      `${parts.join("/")}: writes the DEAD column ${m[1]} as \`${rhs}\` — those columns are tripwired; the DROP rides the next migration`,
    );
  }
}
proveSaw(GUARD, "credential writes checked across the four writer files", writes);
assert.ok(writes >= 6, "the writer-set pin must actually reach the credential writes it claims to cover");

proveMatchers(GUARD, [
  [
    "a raw credential write bypassing the helper",
    // anchored AT the colon: a trailing \s* before the lookahead can backtrack
    // to zero width, which makes the negative lookahead pass on a clean
    // specimen too — a tautological matcher G2 correctly refuses.
    /(bankAccountEncrypted|upiIdEncrypted)\s*:(?!\s*(?:encryptPayoutField\(|null))/,
    `bankAccountEncrypted: req.body.accountNumber,`,
    `bankAccountEncrypted: encryptPayoutField(req.body.accountNumber),`,
  ],
  [
    "a function named encrypt* that only base64-encodes",
    /function encrypt\w*\([^)]*\)\s*(?::[^{]+)?\{\s*return Buffer\.from\([^)]*\)\.toString\(['"]base64['"]\)/,
    `function encrypt(text: string) {\n    return Buffer.from(text).toString('base64');\n}`,
    `// the base64 encrypt() is dead`,
  ],
  [
    "a masked display sliced off the stored blob instead of the stored column",
    /bankAccount(?:Number|Encrypted)\.slice\(-4\)/,
    `const maskedAcc = p.bankAccountNumber.slice(-4);`,
    `const maskedAcc = p.bankAccountLast4;`,
  ],
]);

// the three defects, absent across the whole API + all three apps
const TREES = [SRC, join(ROOT, "apps", "web"), join(ROOT, "apps", "pandit"), join(ROOT, "apps", "admin")];
function walk(dir: string, out: string[] = []): string[] {
  for (const e of readdirSync(dir)) {
    if (e === "node_modules" || e === ".next" || e === "dist" || e.startsWith(".")) continue;
    const p = join(dir, e);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.tsx?$/.test(e)) out.push(p);
  }
  return out;
}
const allFiles = TREES.flatMap((t) => walk(t));
proveSaw(GUARD, "source files walked for credential defects", allFiles.length);
const stripComments = (s: string) =>
  s.replace(/\/\*[\s\S]*?\*\//g, "").split(/\r?\n/).filter((l) => !l.trim().startsWith("//")).join("\n");

for (const f of allFiles) {
  if (f.endsWith("payoutCredentials.test.ts")) continue;
  const body = stripComments(readFileSync(f, "utf8"));
  assert.ok(
    !/bankAccount(?:Number|Encrypted)\.slice\(-4\)/.test(body),
    `${f.slice(f.indexOf("HmarePanditJi"))}: derives a masked display by slicing the stored credential — the display value is STORED at capture (bankAccountLast4), correct by construction`,
  );
  assert.ok(
    !/function encrypt\w*\([^)]*\)\s*(?::[^{]+)?\{\s*return Buffer\.from\([^)]*\)\.toString\(['"]base64['"]\)/.test(body),
    `${f.slice(f.indexOf("HmarePanditJi"))}: declares an encrypt* function that only base64-encodes — worse than plaintext, because the name reads as protection`,
  );
}

// ── 2 · THE WIRE — the number never rides a response body ──
const panditRoutes = read(SRC, "routes", "pandit.routes.ts");
assert.ok(
  !/bankAccountNumber:\s*updated\.|upiId:\s*updated\./.test(panditRoutes),
  "pandit.routes.ts must not echo the account number or upi id back in a response body — display values only",
);
assert.ok(
  /bankAccountLast4:\s*updated\.bankAccountLast4/.test(panditRoutes),
  "the bank-details response must carry the STORED last four",
);

// exactly ONE decrypt-to-response site, and it is admin-only
const decryptSites = allFiles.filter((f) => {
  if (!f.includes(join("services", "api"))) return false;
  if (/payoutCredentials\.(ts|test\.ts)$/.test(f)) return false;
  const body = stripComments(readFileSync(f, "utf8"));
  return /bankAccountNumber:\s*tryDecryptPayoutField\(|upiId:\s*tryDecryptPayoutField\(/.test(body);
});
proveSaw(GUARD, "sites that decrypt a credential INTO a response", decryptSites.length);
assert.strictEqual(
  decryptSites.length,
  1,
  `exactly ONE admin-only decrypt site is allowed; found ${decryptSites.length}: ${decryptSites.join(", ")}`,
);
assert.ok(decryptSites[0].endsWith("admin.routes.ts"), "the one decrypt site must be the admin payout read");

// ── 3 · THE CLAIM-TO-ALGORITHM PIN ──
// A rendered claim about DATA AT REST must name a mechanism that is really in
// the code — and the declared mechanism is compared to the ONE algorithm
// constant, never to a literal in the copy. That is the anti-feeLabel shape:
// the guard does not assert "the string 256 exists", it asserts "this claim is
// backed by THIS constant, and here is the constant."
//
// SCOPE, stated: this pin covers AT-REST encryption claims only. Transport
// claims (SSL/TLS) are deliberately OUT — they are true-but-unremarkable, and
// the one that matters (/nri's "SSL Secure Checkout", a checkout that does not
// exist) belongs to the /nri item, not to this cipher.
const CLAIM_PATTERN = /\bAES\b|256-bit|bank-grade|military-grade|encrypted|encryption/i;
const DECLARED_CLAIMS: Array<{ claim: string; mechanism: string; why: string }> = [
  {
    claim: "आपकी जानकारी सुरक्षित है · AES-256",
    mechanism: "aes-256-gcm",
    why: "the सत्यापन screen captures BOTH Aadhaar and payout credentials. Until ruled order #2 the payout half was base64, so this canon strip was false beside the very fields it sat over. It is true as of this build.",
  },
  {
    claim: "are encrypted and stored securely",
    mechanism: "aes-256-gcm",
    why: "privacy page, Aadhaar at rest — utils/aadhaar.ts encryptAadhaar",
  },
];
for (const d of DECLARED_CLAIMS) {
  assert.strictEqual(
    d.mechanism,
    ALGORITHM,
    `declared claim "${d.claim}" names ${d.mechanism}, but the ONE algorithm constant is ${ALGORITHM} — the claim and the cipher have drifted`,
  );
}
let claimHits = 0;
// RENDERED surfaces only. The API renders nothing to a human — its
// `ENCRYPTION_KEY` identifiers are mechanism, not claim, and scanning them
// would make this pin fire on the very code that backs the claims.
const DEAD_TREE = join(ROOT, "apps", "web", "src", "app");
for (const f of allFiles.filter((p) => p.includes(join(ROOT, "apps")))) {
  if (/\.test\.tsx?$/.test(f) || f.endsWith("payoutCredentials.ts")) continue;
  // apps/web/src/app is the DEAD tree — Next resolves apps/web/app. Nothing
  // in it renders to a human, so its claims are not claims. (apps/web/src/
  // components IS live and stays in scope.) Its "256-bit SSL encrypted"
  // line is real, and dies with that tree in its own item.
  if (f.startsWith(DEAD_TREE)) continue;
  for (const line of stripComments(readFileSync(f, "utf8")).split(/\r?\n/)) {
    if (!CLAIM_PATTERN.test(line)) continue;
    // identifiers are not claims — only rendered prose is
    if (/aadhaarEncrypted|bankAccountEncrypted|upiIdEncrypted|encryptPayoutField|encryptAadhaar|decrypt/.test(line)) continue;
    claimHits++;
    assert.ok(
      DECLARED_CLAIMS.some((d) => line.includes(d.claim)),
      `${f.slice(f.indexOf("apps") >= 0 ? f.indexOf("apps") : f.indexOf("services"))}: renders an UNDECLARED at-rest security claim → ${line.trim().slice(0, 120)}`,
    );
  }
}
proveSaw(GUARD, "rendered at-rest security claims found and matched to a mechanism", claimHits);

proveDetects(
  GUARD,
  "an undeclared at-rest security claim fails the pin",
  (line: string) =>
    CLAIM_PATTERN.test(line) && !DECLARED_CLAIMS.some((d) => line.includes(d.claim)),
  `<p>Secure 256-bit encrypted checkout</p>`,
  `<p>आपकी जानकारी सुरक्षित है · AES-256</p>`,
);

// ── 4 · the dead env constant stays dead ──
assert.ok(
  !/BACKUP_FEE_PAISE:\s*z\./.test(read(SRC, "config", "env.ts")),
  "BACKUP_FEE_PAISE must stay deleted (ruled order #1)",
);

// ── 5 · the copy is bound to the composition, not to a promise ──
const wizard = read(ROOT, "apps", "web", "app", "booking", "new", "booking-wizard-client.tsx");
assert.ok(
  !/nothing added on top/.test(stripComments(wizard)),
  '"nothing added on top" must stay dead — the #1 walk measured it false against settled-at-booking',
);
assert.ok(
  /settledAtBooking > 0\s*\n?\s*\?/.test(wizard),
  "the second obligation sentence must be conditional on the composition actually containing it",
);

// ── 6 · WHAT THIS GUARD CANNOT PROVE (ledgered verbatim, Isj) ──
//   1. That the ENCRYPTION_KEY is strong or secret. That is ops; the only
//      key property pinned anywhere is the known placeholder refusal
//      (encryption-key-guard.test.ts).
//   2. That stored data was migrated. This guard reads SOURCE and cannot see
//      one row. Only the backfill dry-run's counts and an after-count of zero
//      non-AES rows prove that. THIS GUARD MAY NEVER BE CITED AS MIGRATION
//      PROOF.
//   3. That the database is encrypted at rest at the provider/disk level.
//      That is a Neon setting, not repo state.
//   4. That a decrypted value is never logged or re-echoed downstream. §2
//      pins the known response shapes; a general no-echo pin on every future
//      response body is a separate clause this guard does not yet carry.

console.log(
  "payout-credential guard ✅ — one cipher, writer set closed, no blob-slicing, one admin-only decrypt site, claims matched to the algorithm constant",
);
