// Static Hindi calendar labels for the PanchangStrip.
// v1 deliberately does NOT compute a real tithi (no lunar math, no API) —
// pass one in via `tithi` when a source for it exists.

const HINDI_WEEKDAYS = [
  "रविवार",
  "सोमवार",
  "मंगलवार",
  "बुधवार",
  "गुरुवार",
  "शुक्रवार",
  "शनिवार",
] as const;

const HINDI_MONTHS = [
  "जनवरी",
  "फ़रवरी",
  "मार्च",
  "अप्रैल",
  "मई",
  "जून",
  "जुलाई",
  "अगस्त",
  "सितंबर",
  "अक्टूबर",
  "नवंबर",
  "दिसंबर",
] as const;

export interface PanchangInfo {
  hindiWeekday: string;
  hindiDate: string; // e.g. "29 जुलाई"
  tithi: string; // empty in v1
}

export function getPanchang(date: Date = new Date(), tithi = ""): PanchangInfo {
  return {
    hindiWeekday: HINDI_WEEKDAYS[date.getDay()],
    hindiDate: `${date.getDate()} ${HINDI_MONTHS[date.getMonth()]}`,
    tithi,
  };
}
