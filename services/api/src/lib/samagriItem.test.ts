import assert from "node:assert";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  SAMAGRI_BRAND_ANY,
  samagriItemSchema,
  validateSamagriItems,
  readSamagriItems,
  toPanditAppItems,
  isBrandBinding,
} from "./samagriItem";

// ─────────────────────────────────────────────────────────────────────────────
// CONFORMANCE GUARD — F12-02: every samagri item carries quantity + company/brand.
//
// Register line: docs/pandit-pov-conformance-register.md
//   F12-02 | **Every item carries quantity + company/brand name** | AUTO (schema)
//
// SamagriPackage.items is a Json column, so this is a shape + validation change
// and NO PRISMA MIGRATION EXISTS to lean on. That makes the guard the only thing
// standing between "brand is required" and "brand is a comment in a .prisma file".
//
// What this guard pins:
//   1. brand is REQUIRED ON WRITE — an item without one is rejected, in every
//      alias vocabulary the codebase actually posts;
//   2. brand is OPTIONAL ON READ — a legacy row written before F12-02 has no
//      brand key at all, and reading it must NOT throw and must NOT invent one;
//   3. the rejection message is actionable Devanagari that NAMES the item and
//      offers "कोई भी" — a 62-year-old cannot act on "validation failed";
//   4. "कोई भी" is a valid answer but is NOT a binding company (F12-04 must not
//      promise "वही कंपनी का सामान लाना होगा" about an item with no company);
//   5. EVERY server write path resolves through this one module. A rule enforced
//      on three of four write paths is not enforced — the fourth is the bypass.
//      Before this change the LIVE pandit-app path (auth.controller
//      saveSamagriPackages) validated nothing at all and stored raw `any`.
//   6. the field list is defined ONCE — the router's zod schema must not re-type
//      it, which is exactly how brand went missing from three paths.
// ─────────────────────────────────────────────────────────────────────────────

console.log("Running F12-02 samagri-item guard (quantity + company/brand on every item)…");

const API_SRC = join(__dirname, "..");
const REPO_ROOT = join(__dirname, "..", "..", "..", "..");

// ── 1. F12-02: a well-formed item passes, in BOTH vocabularies that exist in
//       this codebase. Storage says { itemName, quantity }; the pandit app says
//       { name, qty }. Both are already persisted, so both must normalise.
{
  const canonical = validateSamagriItems([{ itemName: "देसी घी", quantity: "500 ग्राम", brand: "अमूल" }]);
  assert.strictEqual(canonical.ok, true, "F12-02: a complete canonical item must be accepted");
  assert.deepStrictEqual((canonical as { items: unknown[] }).items, [
    { itemName: "देसी घी", quantity: "500 ग्राम", brand: "अमूल" },
  ]);

  const appVocab = validateSamagriItems([{ name: "देसी घी", qty: "500 ग्राम", brand: "अमूल" }]);
  assert.strictEqual(appVocab.ok, true, "F12-02: the pandit app's { name, qty } vocabulary must be accepted");
  assert.deepStrictEqual(
    (appVocab as { items: unknown[] }).items,
    (canonical as { items: unknown[] }).items,
    "F12-02: both vocabularies must normalise to the SAME canonical item, or the shape is still duplicated",
  );

  // "company" is the other spelling of the same field.
  const companyAlias = validateSamagriItems([{ name: "रोली", qty: "1 पैकेट", company: "पतंजलि" }]);
  assert.strictEqual(companyAlias.ok, true);
  assert.strictEqual((companyAlias as { items: Array<{ brand: string }> }).items[0].brand, "पतंजलि");

  // A voice-entered quantity arrives as a number; it is still a quantity.
  const numericQty = validateSamagriItems([{ name: "नारियल", qty: 2, brand: SAMAGRI_BRAND_ANY }]);
  assert.strictEqual(numericQty.ok, true, "F12-02: a numeric quantity from voice entry must be accepted");
  assert.strictEqual((numericQty as { items: Array<{ quantity: string }> }).items[0].quantity, "2");

  // qualityNotes is a pre-existing optional field and must survive.
  const withNotes = validateSamagriItems([
    { itemName: "घी", quantity: "500g", brand: "अमूल", qualityNotes: "गाय का" },
  ]);
  assert.strictEqual((withNotes as { items: Array<{ qualityNotes?: string }> }).items[0].qualityNotes, "गाय का");
}

// ── 2. F12-02 THE REQUIREMENT ITSELF: no brand, no write. This is the assertion
//       the whole item exists for — if it goes green with brand missing, F12-02
//       is unbuilt no matter what the register says.
{
  const noBrand = validateSamagriItems([{ itemName: "देसी घी", quantity: "500 ग्राम" }]);
  assert.strictEqual(noBrand.ok, false, "F12-02: an item with NO company/brand must be REJECTED on write");

  const blankBrand = validateSamagriItems([{ itemName: "देसी घी", quantity: "500 ग्राम", brand: "   " }]);
  assert.strictEqual(blankBrand.ok, false, "F12-02: whitespace is not a company name");

  const nullBrand = validateSamagriItems([{ itemName: "देसी घी", quantity: "500 ग्राम", brand: null }]);
  assert.strictEqual(nullBrand.ok, false, "F12-02: an explicit null brand must be rejected too");

  // Quantity is the other half of the requirement — "quantity + brand".
  const noQty = validateSamagriItems([{ itemName: "देसी घी", brand: "अमूल" }]);
  assert.strictEqual(noQty.ok, false, "F12-02: an item with no quantity must be rejected");

  const noName = validateSamagriItems([{ quantity: "500 ग्राम", brand: "अमूल" }]);
  assert.strictEqual(noName.ok, false, "F12-02: an item with no name must be rejected");

  // One bad item in a good list fails the WHOLE list — a partially-branded
  // package is exactly the state F12-02 forbids.
  const mixed = validateSamagriItems([
    { itemName: "घी", quantity: "500g", brand: "अमूल" },
    { itemName: "रोली", quantity: "1 पैकेट" },
  ]);
  assert.strictEqual(mixed.ok, false, "F12-02: one unbranded item must reject the entire list");

  // Junk must not slip through as "an object".
  assert.strictEqual(validateSamagriItems("not an array").ok, false);
  assert.strictEqual(validateSamagriItems(null).ok, false);
  assert.strictEqual(validateSamagriItems([null]).ok, false);
  assert.strictEqual(validateSamagriItems([["घी", "500g"]]).ok, false);
}

// ── 3. F12-02: the rejection must be ACTIONABLE. A 62-year-old priest needs to
//       know WHICH item and WHAT to say, in Devanagari.
{
  const res = validateSamagriItems([{ itemName: "देसी घी", quantity: "500 ग्राम" }]);
  assert.strictEqual(res.ok, false);
  const msg = (res as { message: string }).message;
  assert.ok(/[ऀ-ॿ]/.test(msg), "F12-02: the rejection message must be Devanagari");
  assert.ok(msg.includes("देसी घी"), "F12-02: the message must NAME the offending item");
  assert.ok(msg.includes("कंपनी"), "F12-02: the message must say what is missing — the company");
  assert.ok(
    msg.includes(SAMAGRI_BRAND_ANY),
    'F12-02: the message must offer "कोई भी", or the pandit is trapped on items that have no brand',
  );
}

// ── 4. F12-02 THE COMPATIBILITY DECISION: required-on-write, OPTIONAL-ON-READ.
//       Rows written before this change have no brand key. There is no migration
//       (Json column) and no honest backfill (we do not know which company he
//       meant). Reading such a row must not crash and must not invent one.
{
  const legacy = [
    { itemName: "देसी घी", quantity: "500 ग्राम" },
    { name: "रोली", qty: "1 पैकेट" }, // legacy in the OTHER vocabulary
  ];
  const read = readSamagriItems(legacy);
  assert.strictEqual(read.length, 2, "F12-02: a legacy row must still LOAD");
  assert.strictEqual(read[0].brand, null, "F12-02: a missing brand reads as null — never a guessed company");
  assert.strictEqual(read[1].brand, null);
  assert.strictEqual(read[0].itemName, "देसी घी");
  assert.strictEqual(read[1].itemName, "रोली");

  // …and the read must never throw, whatever garbage the Json column holds.
  for (const junk of [null, undefined, 42, "x", {}, [null], [[]], [{ nope: 1 }]]) {
    assert.doesNotThrow(() => readSamagriItems(junk), `F12-02: reading ${JSON.stringify(junk)} must not throw`);
  }
  assert.deepStrictEqual(readSamagriItems([{ nope: 1 }]), [], "F12-02: an unreadable item is dropped, not thrown on");

  // The boundary mapper the pandit app reads through must preserve the null.
  const wire = toPanditAppItems(read);
  assert.deepStrictEqual(wire[0], { name: "देसी घी", qty: "500 ग्राम", brand: null });
}

// ── 5. F12-02 / F12-04 / TRUTHFUL-STATE: "कोई भी" is a valid ANSWER but is not a
//       BINDING company. F12-04 promises the customer must bring "जिस कंपनी का
//       नाम बताया है, वही कंपनी का सामान" — that promise must not be made about
//       an item where no company was named.
{
  const anyBrand = validateSamagriItems([{ itemName: "नारियल", quantity: "2", brand: SAMAGRI_BRAND_ANY }]);
  assert.strictEqual(anyBrand.ok, true, 'F12-02: "कोई भी" must be an accepted answer, not a rejected blank');

  assert.strictEqual(isBrandBinding("अमूल"), true, "F12-02: a named company binds");
  assert.strictEqual(isBrandBinding(SAMAGRI_BRAND_ANY), false, 'F12-02: "कोई भी" must NOT bind the customer');
  assert.strictEqual(isBrandBinding(null), false, "F12-02: a legacy item with no company must NOT bind");
  assert.strictEqual(isBrandBinding(undefined), false);
  assert.strictEqual(isBrandBinding("  "), false);
}

// ── 6. F12-02: the zod mirror used by the router must agree with the runtime
//       validator. If they can disagree, the shape is duplicated again.
{
  assert.strictEqual(samagriItemSchema.safeParse({ name: "घी", qty: "500g", brand: "अमूल" }).success, true);
  assert.strictEqual(
    samagriItemSchema.safeParse({ itemName: "घी", quantity: "500g" }).success,
    false,
    "F12-02: the router's zod schema must reject a brandless item too, not just the controller",
  );
  assert.strictEqual(samagriItemSchema.safeParse({ itemName: "घी", brand: "अमूल" }).success, false);
  assert.strictEqual(samagriItemSchema.safeParse({ quantity: "500g", brand: "अमूल" }).success, false);
}

// ── 7. F12-02: EVERY SERVER WRITE PATH RESOLVES THROUGH THIS MODULE. Enforcing
//       on some paths is not enforcing — the unguarded one is simply the way in.
{
  const paths: Array<[string, string]> = [
    ["controllers/samagri.controller.ts", "POST/PUT /pandits/me/samagri-packages"],
    ["services/pandit.service.ts", "manageSamagriPackage (create + update)"],
    ["controllers/auth.controller.ts", "POST /pandit/samagri-packages — the LIVE pandit-app path"],
    ["controllers/onboarding.controller.ts", "onboarding step 4"],
  ];
  for (const [rel, what] of paths) {
    const src = readFileSync(join(API_SRC, rel), "utf8");
    assert.ok(
      /validateSamagriItems\(/.test(src),
      `F12-02: ${what} (${rel}) must validate items through lib/samagriItem — an unguarded write path is the bypass`,
    );
  }

  // The live path's old failure mode, pinned so it cannot come back: it wrote
  // the request body straight into the Json column with no validation at all.
  const authCtl = readFileSync(join(API_SRC, "controllers", "auth.controller.ts"), "utf8");
  assert.ok(
    !/items:\s*items\s+as\s+any/.test(authCtl),
    "F12-02: saveSamagriPackages must not write raw `items as any` — that is the hole this closes",
  );

  // The router must not re-declare the field list; ONE definition is the point.
  const routes = readFileSync(join(API_SRC, "routes", "pandit.routes.ts"), "utf8");
  assert.ok(
    /z\.array\(samagriItemSchema\)/.test(routes),
    "F12-02: the router must reuse samagriItemSchema instead of retyping { itemName, quantity, … }",
  );
  assert.ok(
    !/itemName:\s*z\.string\(\)/.test(routes),
    "F12-02: the router's hand-typed item shape must be gone — one definition, one file",
  );
}

// ── 8. F12-02: the CLIENT must actually be able to supply a brand. A server that
//       requires a field no screen collects is not a built requirement — it is a
//       pandit who can no longer save his samagri.
{
  const editor = readFileSync(
    join(REPO_ROOT, "apps", "pandit", "src", "components", "SamagriPackageEditor.tsx"),
    "utf8",
  );
  assert.ok(/SAMAGRI_BRAND_ANY/.test(editor), "F12-02: the samagri editor must know about कोई भी");
  assert.ok(
    /handleBrandChange/.test(editor),
    "F12-02: the samagri editor must let the pandit EDIT the company per item",
  );
  assert.ok(
    /brand: \(it\.brand \|\| ""\)\.trim\(\) \|\| SAMAGRI_BRAND_ANY/.test(editor),
    "F12-02: the editor must send a brand for every item — a cleared box means कोई भी, not omitted",
  );

  const wizard = readFileSync(
    join(REPO_ROOT, "apps", "pandit", "src", "app", "(dashboard-group)", "my-poojas", "add", "page.tsx"),
    "utf8",
  );
  assert.ok(
    /brand: brand\.trim\(\) \|\| SAMAGRI_BRAND_ANY/.test(wizard),
    "F12-02: the पूजा जोड़ें wizard must not drop a blank कंपनी with `|| undefined` — the API now rejects that",
  );

  // The documented shape in the schema must match what is enforced.
  const schema = readFileSync(join(REPO_ROOT, "packages", "db", "prisma", "schema.prisma"), "utf8");
  assert.ok(
    /brand: string.*qualityNotes\?: string/.test(schema),
    "F12-02: schema.prisma must document brand in the items shape, or the doc lies about the column",
  );
}

console.log("F12-02 samagri-item guard: quantity + company/brand required on every write path ✅");
