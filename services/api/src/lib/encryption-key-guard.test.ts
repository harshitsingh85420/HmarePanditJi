import assert from "node:assert";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { isInsecureEncryptionKey, PLACEHOLDER_ENCRYPTION_KEY } from "../config/env";
import { encryptAadhaar, decryptAadhaar, getAadhaarLastFour } from "../utils/aadhaar";

// ─────────────────────────────────────────────────────────────
// AADHAAR ENCRYPTION-KEY GUARD (build-failing).
// The repo ships a PUBLIC placeholder ENCRYPTION_KEY as the zod default so
// local dev works. If production ever boots on it, real Aadhaar numbers are
// AES-"encrypted" under a key anyone can read from git — a silent, severe
// leak. LAW: production must FATAL-crash at boot on a missing / short /
// placeholder key (env.ts), and the encryption path itself must refuse it
// (aadhaar.ts). Dev keeps the placeholder. Same fail-fast spirit as the R2
// storage prod guard (BB2). This guard fails the build if either the boot
// check or the encryption-path check is removed, or the predicate weakens.
// ─────────────────────────────────────────────────────────────

console.log("Running Aadhaar encryption-key guard…");

// 1. the security predicate: the public placeholder + missing/short keys are insecure
assert.strictEqual(isInsecureEncryptionKey(PLACEHOLDER_ENCRYPTION_KEY), true, "placeholder must be flagged insecure");
assert.strictEqual(isInsecureEncryptionKey(undefined), true, "missing key must be flagged insecure");
assert.strictEqual(isInsecureEncryptionKey(""), true, "empty key must be flagged insecure");
assert.strictEqual(isInsecureEncryptionKey("abc"), true, "short key must be flagged insecure");
// a real openssl rand -hex 32 (64 hex chars, not the placeholder) is secure
assert.strictEqual(
  isInsecureEncryptionKey("f".repeat(64)),
  false,
  "a real 64-hex key must be accepted",
);

// 2. env.ts FATAL-crashes production on an insecure key (boot-time refuse-to-start)
const envSrc = readFileSync(join(__dirname, "..", "config", "env.ts"), "utf8");
assert.ok(
  /NODE_ENV\s*===\s*["']production["']/.test(envSrc) &&
    /isInsecureEncryptionKey\(env\.ENCRYPTION_KEY\)/.test(envSrc) &&
    /process\.exit\(1\)/.test(envSrc),
  "env.ts must process.exit(1) in production when ENCRYPTION_KEY is insecure (boot-time fatal)",
);

// 3. aadhaar.ts encryption path refuses the placeholder in production (defense in depth)
const aadhaarSrc = readFileSync(join(__dirname, "..", "utils", "aadhaar.ts"), "utf8");
assert.ok(
  /NODE_ENV\s*===\s*['"]production['"]/.test(aadhaarSrc) &&
    /PLACEHOLDER_ENCRYPTION_KEY|isInsecureEncryptionKey/.test(aadhaarSrc) &&
    /throw new Error/.test(aadhaarSrc),
  "aadhaar.ts getEncryptionKey must refuse the placeholder key in production",
);

// 4. DEV round-trip still works on the placeholder (we must not have broken dev)
const AADHAAR = "123456789012";
const enc = encryptAadhaar(AADHAAR);
assert.notStrictEqual(enc, AADHAAR, "ciphertext must not equal plaintext");
assert.strictEqual(decryptAadhaar(enc), AADHAAR, "dev round-trip must decrypt back to the original");
assert.strictEqual(getAadhaarLastFour(AADHAAR), "9012", "last-four must be the trailing 4 digits");

console.log("Aadhaar encryption-key guard: prod refuses placeholder, dev round-trip intact ✅");
