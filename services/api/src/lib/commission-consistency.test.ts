import assert from "node:assert";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { PLATFORM_FEE_PERCENT } from "../config/constants";
import { APP_FACTS } from "./shishyaFacts";
import { calculateGrandTotal } from "../utils/pricing";
import { computeEarnings } from "./earnings";

// BUILD-FAILING GUARD — the money model, pinned. Founder decision 2026-07-21
// (CONFLICT_RULINGS #7): the pandit keeps 100% of the dakshina; the platform
// fee (PLATFORM_FEE_PERCENT) is a SEPARATE charge the CUSTOMER pays on top and
// NEVER reduces the payout. This guard fails the build if:
//   · शिष्य's quoted fee rate ever disagrees with the fee math (single source)
//   · a raw decimal fee literal reappears
//   · the pandit payout is ever reduced by the fee (the property that matters)
//   · conservation breaks: customer pays = payout + fee.
console.log("Running commission-consistency guard…");

const SRC = join(__dirname, "..");
const read = (rel: string) => readFileSync(join(SRC, rel), "utf8");

// 1. SINGLE SOURCE: the fee rate शिष्य quotes IS the rate the math charges.
assert.strictEqual(
  APP_FACTS.platformFeePercent,
  PLATFORM_FEE_PERCENT,
  `shishyaFacts.platformFeePercent (${APP_FACTS.platformFeePercent}) must equal PLATFORM_FEE_PERCENT (${PLATFORM_FEE_PERCENT})`,
);

// 2. the fee math lives in ONE place (utils/pricing, reading the constant);
//    booking.service DELEGATES to it and computes no fee arithmetic of its own.
const bookingSvc = read("services/booking.service.ts");
const pricing = read("utils/pricing.ts");
assert.ok(
  /\*\s*\(PLATFORM_FEE_PERCENT\s*\/\s*100\)/.test(pricing),
  "utils/pricing must compute the platform fee from PLATFORM_FEE_PERCENT/100",
);
assert.ok(
  /calculateGrandTotal\(/.test(bookingSvc),
  "calculateBookingFinancials must DELEGATE to pricing.calculateGrandTotal (one money source)",
);

// 3. the facts sheet reads the constant — no literal
const facts = read("lib/shishyaFacts.ts");
assert.ok(
  /platformFeePercent:\s*PLATFORM_FEE_PERCENT/.test(facts),
  "shishyaFacts.platformFeePercent must read PLATFORM_FEE_PERCENT, not a literal",
);

// 4. THE PROPERTY THAT MATTERS — the pandit payout is NEVER reduced by the fee.
//    Pinned structurally: the payout expression must not subtract platformFee.
assert.ok(
  !/panditPayout\s*=\s*[^;]*-\s*\w*[Pp]latformFee/.test(pricing),
  "REGRESSION: panditPayout subtracts the platform fee — the pandit must keep 100% (fee is customer-paid)",
);

// 5. RUNTIME conservation — proven on real scenarios (each assertion can fail).
const SCENARIOS = [
  { dakshina: 5000, travel: 0, food: 0, acc: 0 },
  { dakshina: 11000, travel: 1200, food: 1000, acc: 500 },
  { dakshina: 501, travel: 0, food: 0, acc: 0 },
];
for (const s of SCENARIOS) {
  const b = calculateGrandTotal({
    dakshinaAmount: s.dakshina,
    travelCost: s.travel,
    foodAllowanceAmount: s.food,
    accommodationCost: s.acc,
  });
  const fee = Math.round((s.dakshina * PLATFORM_FEE_PERCENT) / 100);
  const passThroughs = s.travel + s.food + s.acc;

  // pandit receives the FULL dakshina + pass-throughs — fee never subtracted
  assert.strictEqual(
    b.panditPayout,
    s.dakshina + passThroughs,
    `payout must be 100% dakshina + pass-throughs (got ${b.panditPayout}, dakshina ${s.dakshina})`,
  );
  // customer pays the dakshina + the platform fee ON TOP + pass-throughs
  assert.strictEqual(
    b.grandTotal,
    s.dakshina + fee + passThroughs,
    `customer total must be dakshina + platformFee + pass-throughs (got ${b.grandTotal})`,
  );
  // NEW CONSERVATION: what the customer pays minus what the pandit gets IS the fee
  assert.strictEqual(
    b.grandTotal - b.panditPayout,
    fee,
    `conservation broken: grandTotal − panditPayout (${b.grandTotal - b.panditPayout}) must equal the platform fee (${fee})`,
  );
  // the pandit's dakshina is untouched by the fee
  assert.ok(
    b.panditPayout >= s.dakshina,
    "the pandit must never receive less than the full dakshina",
  );
}

// 6. earnings display: the pandit's dakshina is 100% — dakshinaNet is the FULL amount
const e = computeEarnings({ dakshina: 5000 });
assert.strictEqual(e.dakshinaNet, 5000, "computeEarnings.dakshinaNet must be the FULL dakshina (100%), not 90%");
assert.strictEqual(e.totalToPandit, 5000, "computeEarnings.totalToPandit must not be reduced by the fee");

console.log(
  `commission-consistency guard: 100% to pandit, ${PLATFORM_FEE_PERCENT}% customer-side fee on top, conservation (customer = payout + fee) holds ✅`,
);
