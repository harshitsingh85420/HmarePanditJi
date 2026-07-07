// 2026 festival dates verified against Drik Panchang (New Delhi).
// 2026 has an Adhik Maas (17 May – 15 Jun), which pushes the Shravan-onward
// festivals ~19 days later than 2025 — do not "correct" these back.

export interface Festival {
  date: string; // YYYY-MM-DD (local)
  name: string;
  emoji: string;
  daysBefore?: number; // show banner this many days ahead (default 0 = day only)
}

export const FESTIVALS_2026: Festival[] = [
  { date: "2026-07-29", name: "गुरु पूर्णिमा", emoji: "🌕" },
  { date: "2026-08-28", name: "रक्षाबंधन", emoji: "🪢", daysBefore: 7 },
  { date: "2026-09-04", name: "जन्माष्टमी", emoji: "🦚" },
  { date: "2026-09-14", name: "गणेश चतुर्थी", emoji: "🐘" },
  { date: "2026-10-11", name: "नवरात्रि प्रारंभ", emoji: "🔱" },
  { date: "2026-10-20", name: "दशहरा", emoji: "🏹" },
  { date: "2026-11-08", name: "दिवाली", emoji: "🪔" },
];

/** The festival active today (today within [date - daysBefore, date]), if any. */
export function getActiveFestival(today: Date = new Date()): Festival | null {
  const midnight = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const DAY = 24 * 60 * 60 * 1000;
  for (const f of FESTIVALS_2026) {
    const [y, m, d] = f.date.split("-").map(Number);
    const fest = new Date(y, m - 1, d).getTime();
    const from = fest - (f.daysBefore ?? 0) * DAY;
    if (midnight >= from && midnight <= fest) return f;
  }
  return null;
}

/** True only on the exact festival day (for the header diya accent). */
export function isFestivalDay(today: Date = new Date()): boolean {
  const f = getActiveFestival(today);
  if (!f) return false;
  const [y, m, d] = f.date.split("-").map(Number);
  return (
    today.getFullYear() === y && today.getMonth() === m - 1 && today.getDate() === d
  );
}
