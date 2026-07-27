// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";

// ─────────────────────────────────────────────────────────────
// P0 GUARD (PAGE 13 walk, 2026-07-25): the Idempotency-Key header must
// be ISO-8859-1-safe. A raw Devanagari actionKey made fetch THROW
// before the network — every Hindi-keyed mutation (dakshina save,
// pooja delete, the add-wizard submit chain) died client-side with the
// generic toast while ASCII-keyed paths (accept, calendar dates)
// worked, hiding the class. Pins:
//   1. a Devanagari key produces a header fetch accepts (printable
//      ASCII only after escaping);
//   2. ASCII keys pass through BYTE-IDENTICAL (accept:<id> semantics
//      untouched — the fix is a no-op for every working path);
//   3. the mutation fires end-to-end with a Hindi key (the actual
//      repro: it used to throw before dispatch).
// ─────────────────────────────────────────────────────────────

const captured: Array<{ url: string; headers: Record<string, string> }> = [];

beforeEach(() => {
  captured.length = 0;
  vi.resetModules();
  vi.doMock("@/lib/api", () => ({
    api: vi.fn(async (path: string, options?: { headers?: Record<string, string> }) => {
      // real fetch rejects non-ISO-8859-1 header values — simulate it
      for (const v of Object.values(options?.headers ?? {})) {
        // eslint-disable-next-line no-control-regex
        if (/[^\x00-\xFF]/.test(v)) throw new TypeError("String contains non ISO-8859-1 code point.");
      }
      captured.push({ url: path, headers: options?.headers ?? {} });
      return { success: true, data: { ok: true } };
    }),
  }));
});

describe("mutateOnce Idempotency-Key — ISO-8859-1 law", () => {
  it("a Devanagari actionKey no longer throws and sends an ASCII-safe header", async () => {
    const { mutateOnce } = await import("@/lib/mutate");
    const res = await mutateOnce("dakshina:सत्यनारायण कथा", "/pandit/dakshina-rates", {
      method: "POST",
      body: "{}",
    });
    expect(res.success).toBe(true);
    const key = captured[0].headers["Idempotency-Key"];
    // eslint-disable-next-line no-control-regex
    expect(key).toMatch(/^[\x20-\x7E]+$/); // printable ASCII only
    expect(key).toContain("dakshina:"); // the ASCII prefix survives verbatim
  });
  it("ASCII keys pass through byte-identical (accept/complete untouched)", async () => {
    const { mutateOnce } = await import("@/lib/mutate");
    await mutateOnce("accept:bk_123", "/pandit/bookings/bk_123/accept", { method: "POST" });
    await mutateOnce("block-date:2026-07-29", "/pandit/blocked-dates", { method: "POST", body: "{}" });
    expect(captured[0].headers["Idempotency-Key"]).toBe("accept:bk_123");
    expect(captured[1].headers["Idempotency-Key"]).toBe("block-date:2026-07-29");
  });
  it("the escaped form is deterministic (same action → same idempotency key)", async () => {
    const { mutateOnce } = await import("@/lib/mutate");
    await mutateOnce("remove-pooja:गृह प्रवेश", "/pandit/specializations/a", { method: "DELETE" });
    const first = captured[0].headers["Idempotency-Key"];
    vi.resetModules(); // fresh in-flight map, second "session"
    const { mutateOnce: again } = await import("@/lib/mutate");
    await again("remove-pooja:गृह प्रवेश", "/pandit/specializations/a", { method: "DELETE" });
    expect(captured[1].headers["Idempotency-Key"]).toBe(first);
  });
});
