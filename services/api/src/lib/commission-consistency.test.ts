import assert from "node:assert";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { PLATFORM_FEE_PERCENT } from "../config/constants";
import { APP_FACTS } from "./shishyaFacts";

// BUILD-FAILING GUARD — the commission शिष्य QUOTES must equal the commission the
// fee math CHARGES. This was a live trust bug: calculateBookingFinancials took
// 15% while shishyaFacts told pandits 10%. Now both read the ONE constant
// (PLATFORM_FEE_PERCENT); this guard fails the build if either reintroduces a
// hardcoded number or they ever disagree.
console.log("Running commission-consistency guard…");

const SRC = join(__dirname, "..");
const read = (rel: string) => readFileSync(join(SRC, rel), "utf8");

// 1. the facts sheet value IS the fee-math constant (same runtime value)
assert.strictEqual(
  APP_FACTS.commissionPercent,
  PLATFORM_FEE_PERCENT,
  `shishyaFacts.commissionPercent (${APP_FACTS.commissionPercent}) must equal PLATFORM_FEE_PERCENT (${PLATFORM_FEE_PERCENT})`,
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
for (const [rel, txt] of [["services/booking.service.ts", bookingSvc], ["utils/pricing.ts", pricing]] as const) {
  assert.ok(!/dakshina\w*\s*\*\s*0\.\d+/.test(txt), `raw decimal commission literal in ${rel} — use the constant`);
}

// 3. the facts sheet reads the constant — no literal commissionPercent
const facts = read("lib/shishyaFacts.ts");
assert.ok(
  /commissionPercent:\s*PLATFORM_FEE_PERCENT/.test(facts),
  "shishyaFacts.commissionPercent must read PLATFORM_FEE_PERCENT, not a literal",
);

// 4. the earnings display (pandit payout) must use the SAME constant — no third source
const earnings = read("lib/earnings.ts");
assert.ok(
  /dakshinaVal\s*\*\s*PLATFORM_FEE_PERCENT\s*\/\s*100/.test(earnings),
  "computeEarnings must compute the platform fee from PLATFORM_FEE_PERCENT",
);
for (const [rel, txt] of [["services/booking.service.ts", bookingSvc], ["lib/earnings.ts", earnings]] as const) {
  assert.ok(!/dakshina\w*\s*\*\s*0\.\d+/.test(txt), `raw decimal commission literal in ${rel} — use PLATFORM_FEE_PERCENT`);
}

console.log(`commission-consistency guard: fee math + facts sheet both = ${PLATFORM_FEE_PERCENT}% (single source) ✅`);
