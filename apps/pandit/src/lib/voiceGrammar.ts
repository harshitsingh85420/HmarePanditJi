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
// ─────────────────────────────────────────────────────────────

export const YES = [
  "हाँ", "हां", "haan", "han", "जी", "जी हाँ", "ठीक है", "theek", "ok",
  "yes", "सही", "चलो", "आगे बढ़ो", "बढ़ो",
] as const;

export const NO = [
  "नहीं", "नही", "nahi", "no", "रहने दो", "मत", "बाद में",
] as const;

export const NEXT = ["आगे", "आगे बढ़ें", "next", "चलिए"] as const;

export const BACK = ["पीछे", "वापस", "back"] as const;

export const SKIP = ["स्किप", "छोड़ो", "skip", "रहने दो"] as const;

export const REPEAT = ["फिर से", "दोबारा", "सुनाओ", "repeat", "क्या कहा"] as const;

export const HELP = ["मदद", "help", "madad", "सहायता"] as const;

export const SLEEP = ["सो जाओ", "चुप", "so jao", "chup"] as const;

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
