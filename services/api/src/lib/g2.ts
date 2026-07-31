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
  return cases.length;
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
}
