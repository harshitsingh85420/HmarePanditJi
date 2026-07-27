// ─────────────────────────────────────────────────────────────
// ONE DATE-KEY LAW (Isj कैलेंडर triage, 2026-07-25). The calendar's two
// data sources keyed two different ways — bookings via LOCAL getters,
// blocked dates via getUTC* — so near midnight a non-IST device could
// draw a booking's ● and its date's ✕ on DIFFERENT days. The law:
//   • bookingDateKey — a real event TIMESTAMP keys to the pandit's
//     LOCAL calendar day (an 8pm-UTC event on the 27th IS the 28th in
//     IST — the day he actually serves).
//   • blockedDateKey — the server stores a DATE, not a moment: the
//     UTC-midnight ISO of the chosen "YYYY-MM-DD". Its key is the date
//     LITERAL itself (string slice) — immune to every timezone. The
//     old getUTC* read was right only east of Greenwich by luck; local
//     getters would have shifted it a day west of Greenwich.
// Both sides of the wire use these — no other date-key math may exist
// on the calendar (guarded: no getUTC in calendar/page.tsx).
// ─────────────────────────────────────────────────────────────

export function bookingDateKey(iso: string): string {
  const d = new Date(iso);
  const m = (d.getMonth() + 1).toString().padStart(2, "0");
  const day = d.getDate().toString().padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

export function blockedDateKey(isoOrDateOnly: string): string {
  return isoOrDateOnly.slice(0, 10);
}
