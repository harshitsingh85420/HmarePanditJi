/**
 * P2 GRAMMAR LAW — every language's natural yes/no/nav words work when
 * that language is active, and the Hindi+English base ALWAYS works.
 */

import { describe, it, expect, afterEach } from "vitest";
import {
  YES, NO, NEXT, BACK, SKIP, REPEAT, STOP, SLEEP,
  setGrammarLanguage, matchYesNo, matchAny, matchWord, normalizeForMatch,
} from "@/lib/voiceGrammar";
import type { LangCode } from "@/lib/languageDetect";

// one native probe word per set, per language (from the hand-written
// extensions; en probes the base's English words, hi the Hindi base)
const PROBES: Record<LangCode, { yes: string; no: string; next: string; back: string; skip: string; repeat: string }> = {
  hi: { yes: "हाँ", no: "नहीं", next: "आगे", back: "पीछे", skip: "स्किप", repeat: "फिर से" },
  en: { yes: "yes", no: "no", next: "next", back: "back", skip: "skip", repeat: "repeat" },
  mr: { yes: "हो", no: "नको", next: "पुढे", back: "मागे", skip: "सोडा", repeat: "पुन्हा" },
  bn: { yes: "হ্যাঁ", no: "না", next: "এগিয়ে", back: "পেছনে", skip: "বাদ দিন", repeat: "আবার" },
  ta: { yes: "ஆமாம்", no: "வேண்டாம்", next: "அடுத்து", back: "பின்னால்", skip: "தவிர்", repeat: "மீண்டும்" },
  te: { yes: "అవును", no: "వద్దు", next: "తరువాత", back: "వెనక్కి", skip: "దాటవేయి", repeat: "మళ్ళీ" },
  kn: { yes: "ಹೌದು", no: "ಬೇಡ", next: "ಮುಂದೆ", back: "ಹಿಂದೆ", skip: "ಬಿಡಿ", repeat: "ಮತ್ತೆ" },
  gu: { yes: "હા", no: "ના", next: "આગળ", back: "પાછળ", skip: "છોડો", repeat: "ફરીથી" },
  pa: { yes: "ਹਾਂ", no: "ਨਹੀਂ", next: "ਅੱਗੇ", back: "ਪਿੱਛੇ", skip: "ਛੱਡੋ", repeat: "ਫਿਰ ਤੋਂ" },
  ml: { yes: "അതെ", no: "വേണ്ട", next: "അടുത്തത്", back: "പിന്നിലേക്ക്", skip: "ഒഴിവാക്കുക", repeat: "വീണ്ടും" },
  or: { yes: "ହଁ", no: "ନାହିଁ", next: "ଆଗକୁ", back: "ପଛକୁ", skip: "ଛାଡ଼ନ୍ତୁ", repeat: "ପୁଣି" },
};

const ALL: LangCode[] = ["hi", "en", "mr", "bn", "ta", "te", "kn", "gu", "pa", "ml", "or"];

afterEach(() => setGrammarLanguage("hi"));

describe("P2 — native grammar per active language", () => {
  for (const code of ALL) {
    it(`${code}: native YES advances, native NO declines, base always works`, () => {
      setGrammarLanguage(code);
      const p = PROBES[code];
      expect(matchYesNo(p.yes)).toBe("yes");
      expect(matchYesNo(p.no)).toBe("no");
      expect(matchAny(p.next, NEXT)).toBe(true);
      expect(matchAny(p.back, BACK)).toBe(true);
      expect(matchAny(p.skip, SKIP)).toBe(true);
      expect(matchAny(p.repeat, REPEAT)).toBe(true);
      // FALLBACK LAW: the Hindi base works in EVERY language
      expect(matchYesNo("हाँ")).toBe("yes");
      expect(matchYesNo("नहीं")).toBe("no");
      expect(matchAny("आगे", NEXT)).toBe(true);
      // and the English base too
      expect(matchYesNo("yes")).toBe("yes");
    });
  }

  it("switching back to hi removes the extension words", () => {
    setGrammarLanguage("mr");
    expect(matchAny("पुढे", NEXT)).toBe(true);
    setGrammarLanguage("hi");
    expect(matchAny("पुढे", NEXT)).toBe(false);
    expect(YES).toContain("हाँ");
    expect(NO).toContain("नहीं");
    expect(SKIP).toContain("skip");
  });

  it("mr Latin transliterations hit (Deepgram romanization)", () => {
    setGrammarLanguage("mr");
    expect(matchYesNo("nako")).toBe("no");
    expect(matchAny("pudhe", NEXT)).toBe(true);
  });
});

describe("Q4 — loose matching (the exact Ramesh phrases)", () => {
  it("मैं गाज़ियाबाद से हूँ → गाज़ियाबाद (keyword found inside the sentence)", () => {
    expect(matchWord("मैं गाज़ियाबाद से हूँ", ["गाज़ियाबाद"])).toBe("गाज़ियाबाद");
    // leading fillers stripped only for evaluation
    expect(normalizeForMatch("मैं गाज़ियाबाद से हूँ")).toBe("गाज़ियाबाद से हूँ");
  });

  it("हाँ जी बेटा → YES", () => {
    expect(matchYesNo("हाँ जी बेटा")).toBe("yes");
    expect(matchYesNo("जी हाँ")).toBe("yes");
  });

  it("असं होणार नाही still NO in Marathi (हो-class regression guard)", () => {
    setGrammarLanguage("mr");
    expect(matchYesNo("असं होणार नाही")).toBe("no");
    expect(matchYesNo("हो")).toBe("yes");
  });

  it("बाद में करूंगा → बाद में (declines)", () => {
    expect(matchYesNo("बाद में करूंगा")).toBe("no");
    expect(matchWord("बाद में करूंगा", NO)).toBe("बाद में");
  });

  it("Latin keywords are word-boundary aware", () => {
    expect(matchWord("i know this", ["no"])).toBe(null);
    setGrammarLanguage("mr");
    expect(matchWord("hollow sound", ["ho"])).toBe(null);
    expect(matchWord("ho chalel", ["ho"])).toBe("ho");
  });
});

describe("Q5 — STOP grammar, distinct from SLEEP", () => {
  it("रुको रुको / बस / stop hit STOP", () => {
    expect(matchAny("रुको रुको", STOP)).toBe(true);
    expect(matchAny("बस बस", STOP)).toBe(true);
    expect(matchAny("stop", STOP)).toBe(true);
    expect(matchAny("चुप", STOP)).toBe(true);
  });

  it("mr थांबा joins STOP; सो जाओ stays SLEEP-only", () => {
    setGrammarLanguage("mr");
    expect(matchAny("थांबा", STOP)).toBe(true);
    expect(matchAny("सो जाओ", SLEEP)).toBe(true);
    expect(matchAny("सो जाओ", STOP)).toBe(false);
    expect(matchAny("चुप", SLEEP)).toBe(false);
  });
});
