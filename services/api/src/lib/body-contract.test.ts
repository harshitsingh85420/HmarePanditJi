import assert from "node:assert";
// L9 — BUILD-FAILING BODY-CONTRACT GUARD. route-audit (BB1d) checks
// method+path; this checks BODY SHAPE. It parses createBookingSchema's
// required keys and asserts every client create-booking body supplies them.
// The web app shipped a nested {ritualId, venueAddress:object, pricing}
// body that 400'd on Zod — no customer could book. Audit lives in
// scripts/body-contract.mjs.
// @ts-ignore -- plain JS audit script
import { audit } from "../../scripts/body-contract.mjs";

console.log("Running body-contract guard (L9): client body shapes vs Zod schemas…");

const { violations, checked } = audit();

if (violations.length) {
  console.error(`\n${violations.length} client↔server body-contract violation(s):`);
  for (const v of violations) {
    if (v.missing) {
      console.error(`  ${v.contract}  [${v.file}]  MISSING required keys: ${v.missing.join(", ")}`);
      console.error(`     required: ${v.required.join(", ")}`);
      console.error(`     sent:     ${v.sent.join(", ")}`);
    } else {
      console.error(`  ${v.contract}: ${v.reason}`);
    }
  }
}

assert.strictEqual(violations.length, 0, `${violations.length} body-contract violation(s) — a real client submit would 400 on Zod`);
assert.ok(checked >= 1, "expected at least one client create-booking body checked (regex sanity)");

console.log(`body-contract guard: ${checked} client body/ies checked, 0 violations ✅`);
