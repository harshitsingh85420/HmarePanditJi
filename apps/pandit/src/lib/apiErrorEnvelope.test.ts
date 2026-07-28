import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { normalizeApiError } from "./api";

// ─────────────────────────────────────────────────────────────
// THE PANDIT MUST HEAR WHAT THE SERVER SAID.
// Isj order, 2026-07-28, from the hand-written-interface census.
//
// THE BREAK: api.ts read `json.error || { message: json.message || fallback }`.
// The AppError path sends { message: "<Hindi>", error: { code } }, so the
// truthy `{code}` object won the `||` and the Hindi was discarded. A pandit
// hitting the permanent 409 "यह पूजा पहले से जाँच में है" was told
// "…कृपया दोबारा कोशिश कीजिए" — try again — and retried forever, at a wall.
//
// GUARDED IN BOTH DIRECTIONS (the new law, after three guard-authoring bugs):
//   proven-to-fail — each server dialect asserted to produce the RIGHT text,
//                    so a regression to the fallback goes red;
//   proven-to-pass — correct code stays green, including the shapes that
//                    legitimately have no message and MUST use the fallback.
// ─────────────────────────────────────────────────────────────

const FALLBACK = "कुछ गड़बड़ हुई";

describe("normalizeApiError understands every dialect the API speaks", () => {
  it("shape 1 — AppError: message top-level, error carries only a code", () => {
    const e = normalizeApiError(
      { message: "यह पूजा पहले से जाँच में है", error: { code: "CONFLICT" } },
      FALLBACK,
    );
    // THE regression that shipped: this used to be the fallback
    expect(e.message).toBe("यह पूजा पहले से जाँच में है");
    expect(e.message).not.toBe(FALLBACK);
    expect(e.code).toBe("CONFLICT");
  });

  it("shape 2 — the 89 controller sites that send a bare string", () => {
    const e = normalizeApiError({ error: "बुकिंग नहीं मिली" }, FALLBACK);
    expect(e.message).toBe("बुकिंग नहीं मिली");
  });

  it("shape 3 — message only, no error object", () => {
    const e = normalizeApiError({ message: "सत्र समाप्त" }, FALLBACK);
    expect(e.message).toBe("सत्र समाप्त");
  });

  it("error.message wins when the server does send one there", () => {
    const e = normalizeApiError({ error: { code: "X", message: "विशेष संदेश" } }, FALLBACK);
    expect(e.message).toBe("विशेष संदेश");
  });

  // ── proven-to-pass: the cases that SHOULD fall back ──
  it("falls back only when there is genuinely nothing to say", () => {
    expect(normalizeApiError({}, FALLBACK).message).toBe(FALLBACK);
    expect(normalizeApiError({ error: {} }, FALLBACK).message).toBe(FALLBACK);
    expect(normalizeApiError({ error: { code: "E" } }, FALLBACK).message).toBe(FALLBACK);
    expect(normalizeApiError({ message: "   " }, FALLBACK).message).toBe(FALLBACK);
    expect(normalizeApiError({ error: "  " }, FALLBACK).message).toBe(FALLBACK);
  });

  it("never returns a non-string message, whatever the server sends", () => {
    for (const junk of [{ message: 42 }, { error: { message: null } }, { error: 7 }]) {
      const e = normalizeApiError(junk as never, FALLBACK);
      expect(typeof e.message).toBe("string");
      expect(e.message.length).toBeGreaterThan(0);
    }
  });
});

describe("the short-circuit cannot come back", () => {
  it("api.ts builds its error ONLY through the normaliser", () => {
    const src = readFileSync(join(__dirname, "api.ts"), "utf8")
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .split("\n")
      .filter((l) => !/^\s*(\/\/|\*)/.test(l))
      .join("\n");
    expect(src).toMatch(/error:\s*normalizeApiError\(/);
    // the exact pattern that discarded the Hindi
    expect(src).not.toMatch(/error:\s*json\.error\s*\|\|/);
  });
});
