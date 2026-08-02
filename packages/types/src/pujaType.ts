// ─────────────────────────────────────────────────────────────
// THE CANONICAL PUJA VOCABULARY — Track 2A / Option A, deliverable 1.
//
// WHY THIS FILE EXISTS. There was never an enum. `PujaService.pujaType`,
// `DakshinaRate.pujaType`, `PoojaConfig.poojaType` and
// `PoojaVerification.poojaType` are all bare `String`, and the schema's own
// comments documented TWO conventions without reconciling them:
//
//     PujaService.pujaType   String   // "Vivah", "Griha Pravesh" etc.
//     DakshinaRate.pujaType  String   // e.g. "SATYANARAYAN"
//
// So the pandit side wrote SCREAMING_SNAKE and the customer side expected
// title-case display strings. BRIDGING THE TABLES WITHOUT BRIDGING THE VALUES
// would have moved the schism one table to the right: a wizard writing
// "SATYANARAYAN" into a filter that matches "Satyanarayan Katha" is still a
// pandit nobody can find.
//
// The 8 keys below are not invented here — they are the vocabulary the pandit
// app has always shown (apps/pandit/src/lib/strings.ts `specializations`), and
// they are also exactly the "8 ceremonies" the customer canon's Home promises.
// This file makes that de-facto list the ONE list, so nobody re-types a string.
//
// A TS union over a `String` column, deliberately — NOT a Prisma enum. Adding a
// puja stays a code change rather than a migration, which is what makes the
// अन्य→REQUEST promotion path below cheap enough to actually use.
//
// 🔴 AND THERE WAS A THIRD CONVENTION, FOUND WHILE WRITING THIS FILE.
// `./index.ts:85` already exports a `PujaType` union in lowercase_snake —
// 'satyanarayan', 'griha_pravesh', 'namkaran' — with values the pandit app has
// never had ('annaprashan', 'katha', 'ganesh_puja') and one that is spelled
// differently from the stored value ('namkaran' vs NAAMKARAN). It types
// interfaces but nothing writes through it, so the DB never saw those strings.
//
// So the count was THREE: SCREAMING_SNAKE (what is actually stored),
// Title-Case (what PujaService's own comment claimed), and lowercase_snake
// (what the shared types declared). The type layer was not merely absent —
// IT DISAGREED WITH THE DATA IT DESCRIBED.
//
// This file is named CanonicalPujaType rather than PujaType ON PURPOSE:
// silently redefining a name other modules already import would be the same
// mistake in a new place. The legacy union stays until its consumers are
// migrated deliberately — reader and writer never change together.
// ─────────────────────────────────────────────────────────────

/** The canonical stored value. This is what goes in every *Type column. */
export const PUJA_TYPES = [
  "SATYANARAYAN",
  "GRIHA_PRAVESH",
  "VIVAH",
  "MUNDAN",
  "NAAMKARAN",
  "HAVAN",
  "RUDRABHISHEK",
  "SHRADH",
] as const;

export type CanonicalPujaType = (typeof PUJA_TYPES)[number];

/** Pandit app — Devanagari. The interface he acts in. */
export const PUJA_LABELS_HI: Record<CanonicalPujaType, string> = {
  SATYANARAYAN: "सत्यनारायण कथा",
  GRIHA_PRAVESH: "गृह प्रवेश",
  VIVAH: "विवाह",
  MUNDAN: "मुंडन",
  NAAMKARAN: "नामकरण",
  HAVAN: "हवन",
  RUDRABHISHEK: "रुद्राभिषेक",
  SHRADH: "श्राद्ध / पिंडदान",
};

/**
 * Customer app — ROMAN, not English. The canon's language ruling: the
 * interface reads in English everywhere a customer must act, but ritual
 * vocabulary stays Sanskrit/Hindi in Roman script, "because translating it is
 * demeaning and wrong". So: "Griha Pravesh", never "Housewarming".
 */
export const PUJA_LABELS_EN: Record<CanonicalPujaType, string> = {
  SATYANARAYAN: "Satyanarayan Katha",
  GRIHA_PRAVESH: "Griha Pravesh",
  VIVAH: "Vivah",
  MUNDAN: "Mundan",
  NAAMKARAN: "Naamkaran",
  HAVAN: "Havan",
  RUDRABHISHEK: "Rudrabhishek",
  SHRADH: "Shradh / Pind Daan",
};

/**
 * THE CUSTOM-PUJA REQUEST VALUE (अन्य → REQUEST, ruled).
 *
 * A custom pooja is a REQUEST, not a puja. It lives on PoojaVerification
 * (which already carries `poojaName` + `poojaDescription`) and is NEVER
 * written into a *Type column, because a value outside PUJA_TYPES cannot be
 * filtered, searched, or priced — it would be a pandit the customer app can
 * render but never find.
 *
 * THE PROMOTION PATH IS THE GOVERNANCE, AND IT STARTS NOW RATHER THAN LATER:
 * repeated requests for the same pooja are the evidence that promotes it into
 * PUJA_TYPES above — a code change, one line, reviewed like any other. The
 * vocabulary grows from what pandits actually ask for, and it grows
 * deliberately, which is why nothing auto-creates a type.
 */
export const CUSTOM_PUJA_REQUEST = "REQUEST" as const;

export function isPujaType(v: unknown): v is CanonicalPujaType {
  return typeof v === "string" && (PUJA_TYPES as readonly string[]).includes(v);
}

/** Label for a stored value, in the app's own script. Unknown → the raw value. */
export function pujaLabel(v: string, script: "hi" | "en" = "hi"): string {
  if (!isPujaType(v)) return v;
  return script === "hi" ? PUJA_LABELS_HI[v] : PUJA_LABELS_EN[v];
}

/**
 * VOICE-FIRST MATCHING. A 62-year-old speaks his pooja; typing is the
 * fallback, not the design. This maps a spoken transcript onto a canonical
 * value so the picker can be driven by voice.
 *
 * CONTAINMENT OVER \s+-SPLIT TOKENS — the script-agnostic method already
 * proven in detectIntent, and chosen here for a reason this campaign paid
 * for: `\b` word boundaries DO NOT WORK ON DEVANAGARI (instrument-lies-first
 * member one — /\btum\b/ silently matched nothing). Containment needs no
 * boundary concept at all, so it behaves the same in either script.
 *
 * A transcript matches when it contains ANY significant token of a label:
 * "सत्यनारायण कथा करवाता हूँ" contains "सत्यनारायण" → SATYANARAYAN. Single
 * characters and the "/" separator in "श्राद्ध / पिंडदान" are not tokens —
 * matching on those would fire on almost anything.
 *
 * No match returns null, and the caller routes to अन्य with the transcript
 * preserved as the request name. NOTHING IS GUESSED: a near-miss becomes a
 * REQUEST an admin reads, never a silently coerced canonical value.
 */
export function matchPujaFromSpeech(transcript: string): CanonicalPujaType | null {
  const said = (transcript || "").trim();
  if (!said) return null;
  for (const type of PUJA_TYPES) {
    const tokens = PUJA_LABELS_HI[type]
      .split(/\s+/)
      .filter((tok) => tok.length > 1 && tok !== "/");
    if (tokens.some((tok) => said.includes(tok))) return type;
  }
  return null;
}
