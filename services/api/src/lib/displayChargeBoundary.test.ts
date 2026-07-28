import assert from "node:assert";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// ─────────────────────────────────────────────────────────────
// DISPLAY = CHARGE, AT THE BOUNDARY.
// Isj order, 2026-07-28.
//
// THE GUARD GAP: a guard literally named display=charge could not answer a
// display≠charge question, because it pins the SERVER's internal consistency —
// that grandTotal and the payout come from one money source — and never
// compares the CLIENT's preview composition against the server's charged
// composition. A guard on one side of a boundary cannot see the boundary.
//
// THIRD INSTANCE OF THE CLASS:
//   · a 15% rate survived in packages/utils because the money guards watched
//     only services/api;
//   · the money guards verify CONSERVATION, not TRUTH — ₹800 of invented
//     travel conserves perfectly;
//   · display=charge watched only the server.
// New guards go on BOUNDARIES by default.
//
// WHAT THIS ASSERTS: the components in the customer's pay-now preview and the
// components in the server's charged total are the same set — except where a
// server-side component is PROVABLY ZERO at the booking call site, which is
// the honest reason accommodation is absent from the preview today.
// ─────────────────────────────────────────────────────────────

console.log("Running display=charge BOUNDARY guard...");

const REPO = join(__dirname, "..", "..", "..", "..");
const stripComments = (s: string) =>
  s
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .split("\n")
    .filter((l) => !/^\s*(\/\/|\*)/.test(l))
    .join("\n");
const read = (p: string) => stripComments(readFileSync(join(REPO, p), "utf8"));

/** Component tokens, normalised so the two sides compare by meaning. */
const CANON: Record<string, string> = {
  dakshinaamount: "dakshina",
  dakshina: "dakshina",
  platformfee: "platformFee",
  travelcost: "travel",
  effectivetravelcost: "travel",
  foodallowanceamount: "food",
  foodallowance: "food",
  accommodationcost: "accommodation",
  samagriamount: "samagri",
  samagricost: "samagri",
};
const canon = (t: string) => CANON[t.toLowerCase().replace(/^form\./, "")] ?? null;

function componentsOf(expr: string): Set<string> {
  const out = new Set<string>();
  for (const raw of expr.split("+")) {
    const t = raw.replace(/[^A-Za-z.]/g, "").trim();
    const c = canon(t);
    if (c) out.add(c);
  }
  return out;
}

const sorted = (s: Set<string>) => [...s].sort();

// ── SERVER: what grandTotal is composed of ────────────────────
const PRICING = read("services/api/src/utils/pricing.ts");
const gtAt = PRICING.indexOf("const grandTotal =");
assert.ok(gtAt > -1, "calculateGrandTotal's grandTotal expression not found");
const serverSet = componentsOf(PRICING.slice(PRICING.indexOf("=", gtAt) + 1, PRICING.indexOf(";", gtAt)));

// ── CLIENT: what the pay-now preview is composed of ───────────
const WIZARD = read("apps/web/app/booking/new/booking-wizard-client.tsx");
const pnAt = WIZARD.indexOf("const payNow =");
assert.ok(pnAt > -1, "the wizard's payNow expression not found");
const clientSet = componentsOf(WIZARD.slice(WIZARD.indexOf("=", pnAt) + 1, WIZARD.indexOf(";", pnAt)));

assert.ok(serverSet.size >= 3, `only ${serverSet.size} server components parsed — the extractor has rotted`);
assert.ok(clientSet.size >= 3, `only ${clientSet.size} client components parsed — the extractor has rotted`);

// ── THE BOUNDARY ──────────────────────────────────────────────
// A component may sit in the server's EXPRESSION and not in the preview ONLY
// if the booking path provably passes zero for it. That is exactly why
// accommodation is absent today: calculateGrandTotal can include it, but
// createBooking hard-codes 0, so it is never charged and the preview is right
// to omit it. Anything else is a real display≠charge break.
const BOOKING_SVC = read("services/api/src/services/booking.service.ts");
const PROVABLY_ZERO_AT_CALLSITE: Record<string, RegExp> = {
  accommodation:
    /calculateBookingFinancials\(\s*input\.dakshinaAmount,\s*input\.travelCost \?\? 0,\s*foodAllowanceAmount,\s*0\s*\)/,
};

const clientOnly = [...clientSet].filter((c) => !serverSet.has(c)).sort();
assert.deepStrictEqual(
  clientOnly,
  [],
  `The pay-now preview charges components the server does NOT: ${clientOnly.join(", ")}. ` +
    `The customer would be shown MORE than he is charged.`,
);

for (const c of [...serverSet].filter((x) => !clientSet.has(x))) {
  const proof = PROVABLY_ZERO_AT_CALLSITE[c];
  assert.ok(
    proof,
    `"${c}" is in the server's grandTotal but NOT in the customer's pay-now preview, and nothing ` +
      `proves it is zero — the number he agrees to is not the number he pays.\n` +
      `  preview: ${sorted(clientSet).join(" + ")}\n` +
      `  server:  ${sorted(serverSet).join(" + ")}`,
  );
  assert.ok(
    proof.test(BOOKING_SVC),
    `"${c}" is omitted from the preview because the booking path passed 0 for it — but that call ` +
      `site has CHANGED. Either charge it in the preview too, or keep passing 0.`,
  );
}

// ── directly-settled amounts appear in NEITHER total, and ARE shown ──
// Samagri and accommodation are settled with the pandit at booking (Isj
// ruling). The customer must still be TOLD he owes them, which is what
// settledAtBooking does — computing it and not rendering it would hide the
// amount due at the door.
for (const direct of ["samagri", "accommodation"]) {
  assert.ok(
    !clientSet.has(direct),
    `${direct} is inside the customer's pay-now but is settled directly with the pandit`,
  );
}
assert.ok(/const settledAtBooking\s*=/.test(WIZARD), "the wizard must group directly-settled amounts under settledAtBooking");
assert.ok(/settledAtBooking > 0 &&/.test(WIZARD), "settledAtBooking must be RENDERED — computing and not showing it hides money owed at the door");

console.log(
  `✓ display=charge boundary guard passed (preview: ${sorted(clientSet).join(" + ")}; server adds only provably-zero components)`,
);
