import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { bookingDateKey, blockedDateKey } from "./dateKey";

// ─────────────────────────────────────────────────────────────
// ONE DATE-KEY LAW guard (Isj कैलेंडर triage, 2026-07-25).
// The bug class: bookings keyed LOCAL, blocked dates keyed getUTC* —
// near midnight a non-IST device drew ● and ✕ on different days.
// ─────────────────────────────────────────────────────────────

describe("blockedDateKey — the date LITERAL, timezone-proof", () => {
  it("UTC-midnight ISO keys to its own date on EVERY machine", () => {
    expect(blockedDateKey("2026-07-28T00:00:00.000Z")).toBe("2026-07-28");
    // getUTC* also passed this — but LOCAL getters shift it a day west
    // of Greenwich; the slice can never shift anywhere.
  });
  it("a bare date-only string passes through", () => {
    expect(blockedDateKey("2026-07-28")).toBe("2026-07-28");
  });
});

describe("bookingDateKey — the pandit's LOCAL calendar day", () => {
  it("NEAR-MIDNIGHT: one minute past local midnight keys to THAT local day", () => {
    // Built from local components, so this is deterministic on every
    // machine: 2026-07-28 00:01 local. Its ISO form crosses the UTC
    // date line east of Greenwich (27th 18:31Z in IST) — a getUTC*
    // implementation would key it to the 27th and fail here.
    const iso = new Date(2026, 6, 28, 0, 1).toISOString();
    expect(bookingDateKey(iso)).toBe("2026-07-28");
  });
  it("one minute BEFORE local midnight stays on the earlier day", () => {
    const iso = new Date(2026, 6, 27, 23, 59).toISOString();
    expect(bookingDateKey(iso)).toBe("2026-07-27");
  });
});

describe("both sides of the wire use the law", () => {
  const cal = readFileSync(
    join(__dirname, "..", "app/(dashboard-group)/calendar/page.tsx"),
    "utf8",
  );
  it("calendar page imports the single source and has NO getUTC math left", () => {
    expect(cal).toMatch(/import \{ bookingDateKey, blockedDateKey \} from "@\/lib\/dateKey"/);
    expect(cal).not.toMatch(/getUTC/);
  });
  it("the spoken छुट्टी ack ships both ways, queued and awaited", () => {
    expect(cal).toMatch(/await voiceController\.speakAndWait\(ackLine, \{ interrupt: false \}\)/);
    expect(cal).toMatch(/t\("calendar\.unblockedVoice"\)/);
    expect(cal).toMatch(/t\("calendar\.blockedVoice"\)\.replace\("\{date\}"/);
  });
});
