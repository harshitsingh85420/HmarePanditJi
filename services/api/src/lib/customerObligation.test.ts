import assert from "node:assert";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { proveMatchers, proveSaw, proveDetects } from "./g2";

// ─────────────────────────────────────────────────────────────
// THE CUSTOMER-OBLIGATION COMPOSITION PIN
// (Isj, ruled order #1, 2026-08-04)
//
// A customer's money obligation is stated in the booking wizard by exactly
// TWO expressions:
//
//   payNow           — what we charge her online (mirrors the server's
//                      grandTotal; the display=charge chain is pinned
//                      separately by payment-money + displayChargeBoundary)
//   settledAtBooking — what we tell her she owes IN CASH, at the ceremony,
//                      to the pandit
//
// THE LAW: both expressions carry a DECLARED addend list. Any new term fails
// the build until it is declared here.
//
// WHY THIS SHAPE, AND NOT A DIRECTORY WALK. Three priced-but-undelivered
// add-ons (₹499 consultation, ₹9,999 backup, ₹500 visarjan) reached customers
// for months. The guard that banned their promises existed — and read
// apps/web/app/page.tsx alone, so the landing page was scrubbed and the
// CHECKOUT was never walked. The ruled cure is that the boundary is not a
// directory: it is these two lines. A future add-on control may live anywhere
// in any tree, but it cannot reach a customer's obligation without editing one
// of them, and editing one without declaring the addend turns the build red.
//
//   A GUARD PROVES ONLY THE TREE IT WALKS — so this one walks the arithmetic
//   instead, which has no tree.
//
// Also pinned here: BACKUP_FEE_PAISE stays deleted. It was a validated,
// production-parsed env constant holding ₹500 for the same product the UI
// priced at ₹9,999, read by nothing.
// ─────────────────────────────────────────────────────────────

const GUARD = "customerObligation";
const SRC = join(__dirname, "..");
const WIZARD = join(SRC, "..", "..", "..", "apps", "web", "app", "booking", "new", "booking-wizard-client.tsx");
const wizard = readFileSync(WIZARD, "utf8");
const envSrc = readFileSync(join(SRC, "config", "env.ts"), "utf8");

console.log("Running customer-obligation guard (composition pin on payNow + settledAtBooking)…");

proveSaw(GUARD, "wizard + env sources read (non-empty)", [wizard, envSrc].filter((s) => s.length > 500).length);

// ── the parser: read an assignment's right-hand side as a list of addends ──
function addendsOf(src: string, name: string): string[] {
  const m = new RegExp(`const ${name} = ([^;]+);`).exec(src);
  assert.ok(m, `the wizard must declare ${name} as a single const expression — the obligation must be readable in one place`);
  return m![1]
    .split("+")
    .map((t) => t.replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

// ── 1 · WHAT WE CHARGE ──
// Declared: dakshina (the pandit's, 100% of it — Ruling #7), the platform fee
// charged to the CUSTOMER on top, and the two real pass-throughs.
const PAY_NOW_DECLARED = ["form.dakshina", "platformFee", "effectiveTravelCost", "foodAllowance"];
assert.deepStrictEqual(
  addendsOf(wizard, "payNow"),
  PAY_NOW_DECLARED,
  "payNow carries an UNDECLARED addend — every term the customer is charged must be declared in this guard",
);

// ── 2 · WHAT WE TELL HER SHE OWES IN CASH ──
// Declared: samagri (handed to the pandit directly) and platform-booked
// accommodation. NOTHING ELSE. This is the line the three dead add-ons moved.
const SETTLED_DECLARED = ["samagriCost", "accommodationCost"];
assert.deepStrictEqual(
  addendsOf(wizard, "settledAtBooking"),
  SETTLED_DECLARED,
  "settledAtBooking carries an UNDECLARED addend — a cash obligation stated to a yajman must name a service that exists",
);

// ── 3 · THE THREE DEAD SIBLINGS STAY DEAD IN THE ARITHMETIC ──
proveMatchers(GUARD, [
  [
    "an add-on cost term returning to the obligation math",
    /const addonCost\s*=/,
    `const addonCost =\n    (addons.backup ? 9999 : 0);`,
    `// RECOMMENDED ADD-ONS — THE WHOLE SECTION IS DEAD.`,
  ],
  [
    "add-on state returning to the wizard",
    /useState\(\{\s*backup:/,
    `const [addons, setAddons] = useState({\n    backup: false,\n  });`,
    `const [familyInput, setFamilyInput] = useState("");`,
  ],
  [
    "the backup fee env constant returning",
    /BACKUP_FEE_PAISE:\s*z\./,
    `  BACKUP_FEE_PAISE: z.coerce.number().default(50000),`,
    `  // BACKUP_FEE_PAISE DELETED with the ₹9,999 control`,
  ],
]);
assert.ok(!/const addonCost\s*=/.test(wizard), "addonCost must stay dead — the obligation takes no undeclared term");
assert.ok(!/useState\(\{\s*backup:/.test(wizard), "the add-ons state must stay dead");
assert.ok(!/BACKUP_FEE_PAISE:\s*z\./.test(envSrc), "BACKUP_FEE_PAISE must stay deleted — a third price for a service with no fulfilment path");

// ── 4 · THE DETECTOR, both polarities ──
// The point of the pin is that it fires on a term nobody declared, not on one
// specific dead feature. Prove it with a NEW, unrelated addend.
proveDetects(
  GUARD,
  "an undeclared addend in settledAtBooking fails the pin",
  (src: string) => {
    try {
      assert.deepStrictEqual(addendsOf(src, "settledAtBooking"), SETTLED_DECLARED);
      return false;
    } catch {
      return true;
    }
  },
  `const settledAtBooking = samagriCost + garlandCost + accommodationCost;`, // fires: undeclared
  `const settledAtBooking = samagriCost + accommodationCost;`, // quiet: exactly as declared
);
proveDetects(
  GUARD,
  "an undeclared addend in payNow fails the pin",
  (src: string) => {
    try {
      assert.deepStrictEqual(addendsOf(src, "payNow"), PAY_NOW_DECLARED);
      return false;
    } catch {
      return true;
    }
  },
  `const payNow = form.dakshina + platformFee + effectiveTravelCost + foodAllowance + convenienceFee;`,
  `const payNow = form.dakshina + platformFee + effectiveTravelCost + foodAllowance;`,
);

console.log(
  "customer-obligation guard ✅ — payNow and settledAtBooking carry only declared addends; the three add-ons and BACKUP_FEE_PAISE stay dead",
);
