import assert from "node:assert";

// ─────────────────────────────────────────────────────────────
// LAW G2, AS MACHINERY. A matcher must be proven able to match the shape it
// hunts — and the proof must EXECUTE in the suite, not sit in prose.
//
// Why this exists (2026-07-31): across two turns, SIX instruments failed
// silently — CRLF made a scan read zero files and report clean; a stale dist
// kept a drift check green; tsbuildinfo made tsc report success and emit
// nothing; indexOf attributed matches across byte-identical lines to the
// wrong owner; an unanchored count swallowed a prose mention; an audit
// loop's prisma generate died on a bad path and the loop kept going. NOT ONE
// was caught by a green run. All six were caught by deliberately making the
// instrument fail. A guard that cannot demonstrate its own failure is
// decoration.
//
// The pattern is verifiedSingleWriter's mustMatch table, promoted to a
// shared contract. guardOfGuards.test.ts enforces adoption: every guard
// either proves its matchers (this module or an in-file mustMatch loop),
// carries a G2-UNPROVABLE waiver with a reason, or is on the shrinking
// UNPROVEN list — which may never grow.
// ─────────────────────────────────────────────────────────────

/**
 * [what, matcher, taintedSubject, cleanSubject?]
 * The tainted subject is a REAL specimen of the defect the guard hunts —
 * ideally the exact line from the regression that birthed the guard. The
 * optional clean subject proves the matcher is not a tautology.
 */
export type MatcherProof = [string, RegExp, string] | [string, RegExp, string, string];

/**
 * EXECUTION EMISSION. The ratchet's classifier is pattern-based — it matches
 * the marker strings in a file and executes nothing, so a comment containing
 * "proveDetects(" would classify as proven without any control running. The
 * cure: every prove* call EMITS a machine-readable line, and the suite RUNNER
 * asserts that every pattern-proven file actually emitted — membership
 * becomes execution-verified, not asserted. (Each guard runs in its own
 * process, so this line on stdout is the only channel that crosses over.)
 */
function emit(kind: "EXECUTED" | "SAW", guardName: string, detail: string): void {
  console.log(`G2-${kind} guard=${guardName} ${detail}`);
}

/** Prove every regex can see its subject (and ignore a clean one, if given). */
export function proveMatchers(guardName: string, cases: MatcherProof[]): number {
  for (const [what, re, tainted, clean] of cases) {
    assert.ok(
      new RegExp(re.source, re.flags.replace("g", "")).test(tainted),
      `MATCHER BLIND (law G2, ${guardName}): the pattern for "${what}" cannot match its own ` +
        `subject.\n  pattern: ${re}\n  subject: ${JSON.stringify(tainted)}\n` +
        `The guard would report the code clean while the defect stands.`,
    );
    if (clean !== undefined) {
      assert.ok(
        !new RegExp(re.source, re.flags.replace("g", "")).test(clean),
        `MATCHER TAUTOLOGICAL (law G2, ${guardName}): the pattern for "${what}" also fires on a ` +
          `clean specimen.\n  pattern: ${re}\n  clean: ${JSON.stringify(clean)}\n` +
          `A matcher that matches everything proves nothing when it stays quiet.`,
      );
    }
  }
  // fired=true is not decoration — it is REACHABILITY made explicit. This
  // line sits DOWNSTREAM of every fired-assertion above: a control whose
  // matcher does NOT fire on its tainted specimen throws before reaching it,
  // the file exits red, and no emission is printed. An emission therefore
  // certifies a DEMONSTRATION (the guard fired on its planted subject), not
  // merely that a prove* call happened.
  emit("EXECUTED", guardName, `matchers=${cases.length} fired=true`);
  return cases.length;
}

/**
 * THE OBSERVATION MANDATE (Isj, 2026-07-31). Five of seven silent instrument
 * failures shared one shape: the instrument FOUND NOTHING and reported clean —
 * CRLF read zero fences, the drift check read a stale dist, tsc emitted
 * nothing, prisma generate never ran, the @map rename would have dropped a
 * model's column and SKIPPED its checks. A zero finding from an instrument
 * that cannot prove it looked is UNPROVEN, not CLEAN.
 *
 * So a guard states what its subject is and how much of it it saw, and a
 * count of zero fails LOUDLY. Call it once per scanned surface:
 *   proveSaw("payment-money", "source files read", filesRead.length)
 */
export function proveSaw(guardName: string, subject: string, count: number): void {
  assert.ok(
    Number.isFinite(count) && count > 0,
    `SUBJECT NOT OBSERVED (law G2, ${guardName}): "${subject}" count is ${count}. ` +
      `The instrument found nothing to examine — its clean verdict would mean "0 examined", ` +
      `not "0 defects". Fix the scan (paths, line endings, parser) before trusting any pass.`,
  );
  emit("SAW", guardName, `subject=${JSON.stringify(subject)} count=${count}`);
}

/**
 * Prove a detector FUNCTION fires on a planted defect and stays quiet on a
 * clean input. For guards whose check is code, not a single regex — parsers,
 * cross-file joins, counters. `detect` returns true when the defect is seen.
 */
export function proveDetects<T>(
  guardName: string,
  what: string,
  detect: (input: T) => boolean,
  tainted: T,
  clean?: T,
): void {
  assert.ok(
    detect(tainted),
    `DETECTOR BLIND (law G2, ${guardName}): "${what}" did not fire on its own planted subject. ` +
      `The check would pass with the defect standing.`,
  );
  if (clean !== undefined) {
    assert.ok(
      !detect(clean),
      `DETECTOR TAUTOLOGICAL (law G2, ${guardName}): "${what}" fired on a clean specimen.`,
    );
  }
  // downstream of the fired-assertion — see proveMatchers' emission note.
  emit("EXECUTED", guardName, `detector=${JSON.stringify(what)} fired=true`);
}
