import assert from "node:assert";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// ─────────────────────────────────────────────────────────────
// BUILD-FAILING GUARD (DPDP consent-before-capture): the Aadhaar number's
// encrypted form + last-four must NEVER be persisted without RECORDING the
// pandit's consent (aadhaarConsentAt) in the SAME submit, and the consent gate
// must run BEFORE capture. An unrecorded consent checkbox is a false affordance
// — no consent, no capture. This fails the build if capture could happen
// without a preceding consent gate + a consent-timestamp write.
// ─────────────────────────────────────────────────────────────
const src = readFileSync(
  join(__dirname, "..", "controllers", "readiness.controller.ts"),
  "utf8",
);

console.log("Running aadhaar-consent guard (DPDP consent-before-capture)…");

const gate = src.search(/aadhaarConsent\s*!==\s*true/);
const consentWrite = src.search(/update\.aadhaarConsentAt\s*=/);
const encWrite = src.search(/update\.aadhaarEncrypted\s*=/);
const lastFourWrite = src.search(/update\.aadhaarLastFour\s*=/);

assert.ok(gate >= 0, "a consent gate (aadhaarConsent !== true → reject) must exist");
assert.ok(consentWrite >= 0, "consent must be RECORDED (update.aadhaarConsentAt = …)");
assert.ok(encWrite >= 0, "aadhaar number must be encrypted (update.aadhaarEncrypted = …)");
assert.ok(lastFourWrite >= 0, "aadhaar last-four must be stored (update.aadhaarLastFour = …)");

// the consent gate must precede BOTH captures, and the consent timestamp too
assert.ok(gate < encWrite, "consent gate must run BEFORE aadhaarEncrypted is written");
assert.ok(gate < lastFourWrite, "consent gate must run BEFORE aadhaarLastFour is written");
assert.ok(consentWrite < encWrite, "aadhaarConsentAt must be written alongside/ before the encrypted capture");

// the consent gate must REJECT the submit (badRequest), not just compute
assert.ok(
  /aadhaarConsent\s*!==\s*true[\s\S]{0,160}badRequest/.test(src),
  "the consent gate must reject the submit (badRequest) when consent is not given",
);

console.log("aadhaar-consent guard: no Aadhaar capture without a preceding recorded consent ✅");
