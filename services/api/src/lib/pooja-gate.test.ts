import assert from "node:assert";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// BUILD-FAILING GUARD — the सत्यापन trust promise, server-enforced ON THE
// CUSTOMER-CALLED CREATE PATH. createBooking() must reject a booking whose
// poojaType has no APPROVED (latest-version) PoojaVerification for that pandit,
// BEFORE the booking row is created. If a future edit removes or reorders the
// gate, the build fails.
console.log("Running pooja-gate guard (सत्यापन booking gate)…");

const svc = readFileSync(join(__dirname, "..", "services", "booking.service.ts"), "utf8");

const gateIdx = svc.indexOf("poojaVerification.findFirst");
const createIdx = svc.indexOf("prisma.booking.create");
assert.ok(gateIdx > 0, "createBooking must query PoojaVerification (the सत्यापन gate)");
assert.ok(createIdx > 0, "createBooking must create the booking");
assert.ok(gateIdx < createIdx, "the सत्यापन gate must run BEFORE the booking is created");
assert.ok(/orderBy:\s*\{\s*version:\s*"desc"\s*\}/.test(svc), "gate must evaluate the LATEST version");
assert.ok(/status\s*!==\s*"APPROVED"/.test(svc), "gate must reject unless the latest verification is APPROVED");
assert.ok(/POOJA_NOT_VERIFIED/.test(svc), "gate must throw POOJA_NOT_VERIFIED");

console.log("pooja-gate guard: booking creation gated on an APPROVED latest PoojaVerification ✅");
