// ─────────────────────────────────────────────────────────────
// J2 — THE UNIVERSAL VOICE GRAMMAR. One vocabulary for the whole app:
// every yes/no question, every आगे/पीछे navigation, every स्किप and
// फिर-से answers to these lists. Keyword matching is inclusion-based
// (Deepgram transcripts arrive unpunctuated; hi/Hinglish/en variants
// all count). Order matters where words overlap: callers should test
// the more specific intent first (e.g. a field parser before commands,
// NO before YES is not needed — lists are disjoint except "रहने दो",
// which deliberately lives in both NO and SKIP: either reading declines
// the current ask).
//
// P2 GRAMMAR LAW: when the active app language changes, each set gains
// that language's natural words IN ADDITION to the Hindi+English base
// (the base always stays as fallback — "हाँ" works everywhere). The
// exported arrays are rebuilt IN PLACE by setGrammarLanguage(), which
// lib/i18n calls on boot restore and on every activateLanguage — so
// every existing call site (matchAny(t, YES), [...YES] spreads at call
// time) sees the merged vocabulary with zero migration.
// ─────────────────────────────────────────────────────────────

import type { LangCode } from "@/lib/languageDetect";

// Hindi + English base — hand-written, never machine-translated.
const BASE = {
  YES: [
    "हाँ", "हां", "haan", "han", "जी", "जी हाँ", "ठीक है", "theek", "ok",
    "okay", "yes", "सही", "चलो", "आगे बढ़ो", "बढ़ो",
  ],
  NO: ["नहीं", "नही", "nahi", "no", "रहने दो", "मत", "बाद में"],
  NEXT: ["आगे", "आगे बढ़ें", "next", "चलिए"],
  BACK: ["पीछे", "वापस", "back"],
  SKIP: ["स्किप", "छोड़ो", "skip", "रहने दो"],
  REPEAT: ["फिर से", "दोबारा", "सुनाओ", "repeat", "again", "क्या कहा"],
  HELP: ["मदद", "help", "madad", "सहायता"],
  // Q5: STOP = "be quiet NOW" (mid-narration barge) — silence is the
  // ack, the loop keeps listening. Distinct from SLEEP (mic off until
  // touched). चुप moved here from SLEEP: it means hush, not goodnight.
  STOP: ["रुको", "रुकिए", "बस", "चुप", "chup", "stop", "wait", "quiet"],
  SLEEP: ["सो जाओ", "so jao", "sleep"],
} as const;

type GrammarSet = keyof typeof BASE;

// Per-language extensions — short, high-frequency words only, hand-
// written (grammar must be RIGHT; no machine translation). mr also
// carries the Latin transliterations Deepgram tends to romanize
// (ho/nako/pudhe — kept mr-only so their substring surface stays small).
//
// LIVE-STT REACHABILITY (services/api app.ts owns the model map): only
// en/hi get native Deepgram models today. mr's words are Devanagari, so
// they arrive intact through the hi model — fully live. The bn/ta/te/
// kn/gu/pa/ml/or native-script words can't be emitted by the hi model
// yet; they serve the injector/e2e now and go live per language as
// Deepgram support + localized keyword surfaces land.
const EXTENSIONS: Partial<Record<LangCode, Partial<Record<GrammarSet, readonly string[]>>>> = {
  mr: {
    YES: ["हो", "होय", "चालेल", "ho"],
    NO: ["नको", "नाही", "nako"],
    NEXT: ["पुढे", "pudhe"],
    BACK: ["मागे"],
    SKIP: ["सोडा"],
    REPEAT: ["पुन्हा"],
    STOP: ["थांबा"],
    SLEEP: ["झोप जा"],
  },
  bn: {
    YES: ["হ্যাঁ", "ঠিক আছে"],
    NO: ["না"],
    NEXT: ["পরে", "এগিয়ে"],
    BACK: ["পেছনে"],
    SKIP: ["বাদ দিন"],
    REPEAT: ["আবার"],
  },
  ta: {
    YES: ["ஆமாம்", "சரி"],
    NO: ["இல்லை", "வேண்டாம்"],
    NEXT: ["அடுத்து"],
    BACK: ["பின்னால்"],
    SKIP: ["தவிர்"],
    REPEAT: ["மீண்டும்"],
  },
  te: {
    YES: ["అవును", "సరే"],
    NO: ["వద్దు", "కాదు"],
    NEXT: ["తరువాత"],
    BACK: ["వెనక్కి"],
    SKIP: ["దాటవేయి"],
    REPEAT: ["మళ్ళీ"],
  },
  kn: {
    YES: ["ಹೌದು", "ಸರಿ"],
    NO: ["ಬೇಡ", "ಇಲ್ಲ"],
    NEXT: ["ಮುಂದೆ"],
    BACK: ["ಹಿಂದೆ"],
    SKIP: ["ಬಿಡಿ"],
    REPEAT: ["ಮತ್ತೆ"],
  },
  gu: {
    YES: ["હા", "બરાબર"],
    NO: ["ના"],
    NEXT: ["આગળ"],
    BACK: ["પાછળ"],
    SKIP: ["છોડો"],
    REPEAT: ["ફરીથી"],
  },
  pa: {
    YES: ["ਹਾਂ", "ਠੀਕ ਹੈ"],
    NO: ["ਨਹੀਂ"],
    NEXT: ["ਅੱਗੇ"],
    BACK: ["ਪਿੱਛੇ"],
    SKIP: ["ਛੱਡੋ"],
    REPEAT: ["ਫਿਰ ਤੋਂ"],
  },
  ml: {
    YES: ["അതെ", "ശരി"],
    NO: ["വേണ്ട", "അല്ല"],
    NEXT: ["അടുത്തത്"],
    BACK: ["പിന്നിലേക്ക്"],
    SKIP: ["ഒഴിവാക്കുക"],
    REPEAT: ["വീണ്ടും"],
  },
  or: {
    YES: ["ହଁ", "ଠିକ୍ ଅଛି"],
    NO: ["ନାହିଁ"],
    NEXT: ["ଆଗକୁ"],
    BACK: ["ପଛକୁ"],
    SKIP: ["ଛାଡ଼ନ୍ତୁ"],
    REPEAT: ["ପୁଣି"],
  },
  // en: already covered by the base's English words; hi IS the base.
};

// The live, exported sets — contents swap on language change, the array
// references never do (imports stay valid everywhere).
export const YES: string[] = [...BASE.YES];
export const NO: string[] = [...BASE.NO];
export const NEXT: string[] = [...BASE.NEXT];
export const BACK: string[] = [...BASE.BACK];
export const SKIP: string[] = [...BASE.SKIP];
export const REPEAT: string[] = [...BASE.REPEAT];
export const HELP: string[] = [...BASE.HELP];
export const STOP: string[] = [...BASE.STOP];
export const SLEEP: string[] = [...BASE.SLEEP];

const LIVE: Record<GrammarSet, string[]> = { YES, NO, NEXT, BACK, SKIP, REPEAT, HELP, STOP, SLEEP };

/** Rebuild every set as base + the active language's extension. Called
 *  by lib/i18n on boot restore and on every language activation. */
export function setGrammarLanguage(code: LangCode): void {
  const ext = EXTENSIONS[code] ?? {};
  for (const key of Object.keys(LIVE) as GrammarSet[]) {
    LIVE[key].length = 0;
    LIVE[key].push(...BASE[key], ...(ext[key] ?? []));
  }
}

// Q4: politeness fillers stripped from the FRONT of a transcript before
// match evaluation only — "जी हाँ बेटा" and "मैं गाज़ियाबाद से हूँ" must
// match what they mean. Field VALUES always keep the raw transcript.
const LEADING_FILLERS = new Set(["जी", "अरे", "भाई", "मैं", "हूँ", "से"]);

/** Lowercase, de-punctuate, and strip LEADING politeness fillers.
 *  For match evaluation ONLY — never for field values. */
export function normalizeForMatch(transcript: string): string {
  const compact = transcript
    .toLowerCase()
    .replace(/[।.,!?~"']/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const words = compact.split(" ");
  while (words.length > 1 && LEADING_FILLERS.has(words[0])) words.shift();
  return words.join(" ");
}

const LATIN_RE = /^[a-z0-9 ]+$/;
const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Lowercase + de-punctuate WITHOUT the filler strip — matchWord's form.
 *  Containment means a longer transcript can only match MORE, so
 *  stripping the front never enables a matchWord hit; it only loses
 *  keywords that ARE fillers ("जी बेटा" must stay YES via जी). The strip
 *  matters solely for the partial option match (label CONTAINS clean). */
function compactForMatch(transcript: string): string {
  return transcript
    .toLowerCase()
    .replace(/[।.,!?~"']/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** K3c: normalized-containment match that SURFACES the matched keyword.
 *  Q4: longest keyword wins first (हो can never shadow होणार-class
 *  words checked by a longer sibling); Latin keywords match on word
 *  boundaries ("no" never hits "know"); Devanagari stays substring. */
export function matchWord(transcript: string, words: readonly string[]): string | null {
  const clean = compactForMatch(transcript);
  if (!clean) return null;
  const byLength = [...words].sort((a, b) => b.length - a.length);
  for (const w of byLength) {
    const kw = w.toLowerCase();
    if (LATIN_RE.test(kw)) {
      if (new RegExp(`(^|[^a-z0-9])${escapeRe(kw)}([^a-z0-9]|$)`).test(clean)) return w;
    } else if (clean.includes(kw)) {
      return w;
    }
  }
  return null;
}

/** Case-insensitive inclusion match against a keyword list. */
export function matchAny(transcript: string, words: readonly string[]): boolean {
  return matchWord(transcript, words) !== null;
}

/** Convenience: yes/no/none verdict for confirm-style questions. */
export function matchYesNo(transcript: string): "yes" | "no" | null {
  // NO first: "नहीं आगे नहीं" must not YES on the embedded "आगे"
  if (matchAny(transcript, NO)) return "no";
  if (matchAny(transcript, YES)) return "yes";
  return null;
}
