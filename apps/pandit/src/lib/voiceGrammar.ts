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
    "yes", "सही", "चलो", "आगे बढ़ो", "बढ़ो",
  ],
  NO: ["नहीं", "नही", "nahi", "no", "रहने दो", "मत", "बाद में"],
  NEXT: ["आगे", "आगे बढ़ें", "next", "चलिए"],
  BACK: ["पीछे", "वापस", "back"],
  SKIP: ["स्किप", "छोड़ो", "skip", "रहने दो"],
  REPEAT: ["फिर से", "दोबारा", "सुनाओ", "repeat", "again", "क्या कहा"],
  HELP: ["मदद", "help", "madad", "सहायता"],
  SLEEP: ["सो जाओ", "चुप", "so jao", "chup", "sleep", "quiet"],
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
export const SLEEP: string[] = [...BASE.SLEEP];

const LIVE: Record<GrammarSet, string[]> = { YES, NO, NEXT, BACK, SKIP, REPEAT, HELP, SLEEP };

/** Rebuild every set as base + the active language's extension. Called
 *  by lib/i18n on boot restore and on every language activation. */
export function setGrammarLanguage(code: LangCode): void {
  const ext = EXTENSIONS[code] ?? {};
  for (const key of Object.keys(LIVE) as GrammarSet[]) {
    LIVE[key].length = 0;
    LIVE[key].push(...BASE[key], ...(ext[key] ?? []));
  }
}

/** K3c: inclusion match that SURFACES the matched keyword — logs and
 *  telemetry must name the word that actually hit, not keywords[0]. */
export function matchWord(transcript: string, words: readonly string[]): string | null {
  const clean = transcript.toLowerCase().trim();
  if (!clean) return null;
  for (const w of words) {
    if (clean.includes(w.toLowerCase())) return w;
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
