import assert from "node:assert";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  DAKSHINA_FLOOR_BASE,
  DAKSHINA_FLOOR_BY_POOJA_TYPE,
  canonicalisePoojaType,
  resolveDakshinaFloor,
  formatRupees,
  checkDakshinaFloor,
} from "./dakshinaFloor";
import { APP_FACTS } from "./shishyaFacts";

// ─────────────────────────────────────────────────────────────────────────────
// CONFORMANCE GUARD — F11-04: minimum floor price per pooja type (edge F11-2,
// anti race-to-bottom).
//
// Register line: docs/pandit-pov-conformance-register.md
//   F11-04 | Minimum floor price per pooja type enforced | AUTO (api validation)
//
// This guard pins the MECHANISM, not the placeholder numbers. It deliberately
// does NOT assert "SATYANARAYAN === 1101" — those values await founder sign-off
// and must be changeable without a test edit. What it DOES assert is everything
// that would make the mechanism a lie if it broke:
//   1. every canonical pooja type has a floor, and no floor is below the
//      platform-wide minimum शिष्य quotes (APP_FACTS.dakshinaMin);
//   2. an unrecognised pooja falls back to the BASE floor — never a guessed
//      higher one, because a too-high floor blocks a real pandit's real price;
//   3. the free-text Devanagari name the wizard actually POSTs resolves to the
//      same floor as the canonical id the readiness screen POSTs;
//   4. the rejection message NAMES the minimum in Devanagari (a 62-year-old
//      cannot act on "invalid");
//   5. BOTH server write paths call the check — a floor enforced on one of two
//      write paths is not enforced at all;
//   6. the old silent `Math.max(0, …)` CLAMP is gone from the config path. That
//      clamp is the actual bug: a mis-heard "ग्यारह सौ" → 11 was saved as ₹11
//      and the pandit was never told.
// ─────────────────────────────────────────────────────────────────────────────

console.log("Running F11-04 dakshina-floor guard (minimum price per pooja type)…");

const CANONICAL = [
  "SATYANARAYAN",
  "GRIHA_PRAVESH",
  "VIVAH",
  "MUNDAN",
  "NAAMKARAN",
  "HAVAN",
  "RUDRABHISHEK",
  "SHRADH",
] as const;

// ── 1. F11-04: the table covers every canonical pooja, and never dips below the
//       platform minimum that शिष्य tells the pandit about.
{
  for (const id of CANONICAL) {
    const floor = DAKSHINA_FLOOR_BY_POOJA_TYPE[id];
    assert.ok(typeof floor === "number" && Number.isInteger(floor), `F11-04: ${id} needs an integer floor`);
    assert.ok(
      floor >= APP_FACTS.dakshinaMin,
      `F11-04: ${id} floor ${floor} is BELOW the platform minimum ₹${APP_FACTS.dakshinaMin} that शिष्य quotes — the app would contradict itself`,
    );
  }
  assert.strictEqual(
    DAKSHINA_FLOOR_BASE,
    APP_FACTS.dakshinaMin,
    "F11-04: the base floor must BE the platform minimum, not a second number that can drift",
  );
}

// ── 2. F11-04: unknown / missing pooja types fall back to BASE, never higher.
{
  assert.strictEqual(resolveDakshinaFloor("कोई अनजान पूजा"), DAKSHINA_FLOOR_BASE);
  assert.strictEqual(resolveDakshinaFloor(""), DAKSHINA_FLOOR_BASE);
  assert.strictEqual(resolveDakshinaFloor(undefined), DAKSHINA_FLOOR_BASE);
  assert.strictEqual(canonicalisePoojaType("कोई अनजान पूजा"), null);
}

// ── 3. F11-04: THE TWO-VOCABULARY TRAP. /pandit/dakshina-rates posts the
//       canonical id; /pandit/pooja-config posts the pandit's SPOKEN name. Both
//       must land on the same floor or the floor is bypassable by wording.
{
  assert.strictEqual(canonicalisePoojaType("SATYANARAYAN"), "SATYANARAYAN");
  assert.strictEqual(canonicalisePoojaType("सत्यनारायण कथा"), "SATYANARAYAN");
  assert.strictEqual(
    resolveDakshinaFloor("सत्यनारायण कथा"),
    resolveDakshinaFloor("SATYANARAYAN"),
    "F11-04: the spoken name and the canonical id must resolve to the SAME floor",
  );
  assert.strictEqual(canonicalisePoojaType("गृह प्रवेश"), "GRIHA_PRAVESH");
  assert.strictEqual(canonicalisePoojaType("गृहप्रवेश"), "GRIHA_PRAVESH");
  assert.strictEqual(canonicalisePoojaType("griha pravesh"), "GRIHA_PRAVESH"); // "griha pravesh" → GRIHA_PRAVESH
  assert.strictEqual(canonicalisePoojaType("  विवाह  "), "VIVAH");
  assert.strictEqual(canonicalisePoojaType("श्राद्ध / पिंडदान"), "SHRADH");
}

// ── 4. F11-04: the check accepts at/above the floor and rejects below it,
//       including the non-numeric and negative cases.
{
  const floor = resolveDakshinaFloor("सत्यनारायण कथा");
  assert.strictEqual(checkDakshinaFloor("सत्यनारायण कथा", floor).ok, true, "F11-04: exactly the floor is allowed");
  assert.strictEqual(checkDakshinaFloor("सत्यनारायण कथा", floor + 1).ok, true);
  assert.strictEqual(checkDakshinaFloor("सत्यनारायण कथा", floor - 1).ok, false);
  assert.strictEqual(checkDakshinaFloor("सत्यनारायण कथा", 11).ok, false, "F11-04: the mis-heard ₹11 must be rejected");
  assert.strictEqual(checkDakshinaFloor("सत्यनारायण कथा", 0).ok, false);
  assert.strictEqual(checkDakshinaFloor("सत्यनारायण कथा", -5).ok, false);
  assert.strictEqual(checkDakshinaFloor("सत्यनारायण कथा", undefined).ok, false);
  assert.strictEqual(checkDakshinaFloor("सत्यनारायण कथा", "1101" as unknown).ok, false, "F11-04: a string amount is not a price");
  assert.strictEqual(checkDakshinaFloor("सत्यनारायण कथा", NaN).ok, false);
}

// ── 5. F11-04: THE MESSAGE MUST BE ACTIONABLE. A 62-year-old priest who cannot
//       read fluently needs the NUMBER, in Devanagari, not the word "invalid".
{
  const res = checkDakshinaFloor("सत्यनारायण कथा", 11);
  assert.strictEqual(res.ok, false);
  const msg = (res as { message: string }).message;
  assert.ok(/[ऀ-ॿ]/.test(msg), "F11-04: the rejection message must be Devanagari");
  assert.ok(
    msg.includes(formatRupees(res.floor)),
    `F11-04: the message must NAME the minimum (₹${formatRupees(res.floor)}), not just say the price is wrong — got: ${msg}`,
  );
  assert.ok(msg.includes("कम से कम"), "F11-04: the message must say 'at least', so the fix is obvious");
  assert.ok(!/invalid|error|Invalid/.test(msg), "F11-04: no English error-speak in the pandit-facing message");
  // Indian digit grouping is done locally so the string is ICU-independent.
  assert.strictEqual(formatRupees(501), "501");
  assert.strictEqual(formatRupees(1101), "1,101");
  assert.strictEqual(formatRupees(250000), "2,50,000");
}

// ── 6. F11-04: WIRING. Both dakshina write paths must route through the check,
//       and the silent clamp must be gone. Grepped, because a floor that only
//       exists in a lib nobody calls is worse than none.
{
  const read = (p: string) => readFileSync(join(__dirname, "..", p), "utf8");

  const poojaCtl = read("controllers/poojaVerification.controller.ts");
  assert.ok(
    /checkDakshinaFloor\(\s*b\.poojaType\s*,\s*b\.dakshinaAmount\s*\)/.test(poojaCtl),
    "F11-04: savePoojaConfig (/pandit/pooja-config) must call checkDakshinaFloor",
  );
  assert.ok(
    !/Math\.max\(0,\s*b\.dakshinaAmount/.test(poojaCtl),
    "F11-04: the silent Math.max(0, dakshinaAmount) CLAMP must not come back — it saved a mis-heard ₹11 without telling anyone",
  );

  const authCtl = read("controllers/auth.controller.ts");
  assert.ok(
    /checkDakshinaFloor\(\s*pujaType\s*,\s*amount\s*\)/.test(authCtl),
    "F11-04: upsertDakshinaRate (/pandit/dakshina-rates) must call checkDakshinaFloor — a floor on one of two write paths is not a floor",
  );

  const readinessCtl = read("controllers/readiness.controller.ts");
  assert.ok(
    /checkDakshinaFloor\(/.test(readinessCtl),
    "F11-04: readiness step-1 re-validation must use the same table",
  );
  assert.ok(
    !/amount\s*<\s*501/.test(readinessCtl),
    "F11-04: the second hardcoded 501 must be gone — one table, one floor",
  );

  // TRUTHFUL-STATE: the wizard must not discard the pooja-config response and
  // march on to the ✓ screen after the server refused the price.
  const wizard = readFileSync(
    join(__dirname, "..", "..", "..", "..", "apps", "pandit", "src", "app", "(dashboard-group)", "my-poojas", "add", "page.tsx"),
    "utf8",
  );
  assert.ok(
    /const cfg = await mutateOnce\(`config:/.test(wizard),
    "F11-04: the wizard must CAPTURE the pooja-config response",
  );
  assert.ok(
    /if \(!cfg\.success\)/.test(wizard),
    "F11-04: the wizard must stop on a rejected dakshina instead of showing the ✓ screen",
  );
  assert.ok(
    /sayError\(cfg\.error\?\.message/.test(wizard),
    "F11-04: the server's floor message must be the one the pandit SEES and HEARS",
  );
}

// ── 7. F11-04 / TRUTHFUL-STATE: शिष्य must not promise a flat ₹501 minimum that
//       the API now rejects for some poojas.
{
  const facts = readFileSync(join(__dirname, "shishyaFacts.ts"), "utf8");
  assert.ok(
    /हर पूजा की अपनी कम-से-कम दक्षिणा/.test(facts),
    "F11-04: the fact sheet must say the minimum is PER POOJA, or शिष्य quotes a number the API refuses",
  );
}

console.log("F11-04 dakshina-floor guard: per-pooja floors enforced on every write path ✅");
