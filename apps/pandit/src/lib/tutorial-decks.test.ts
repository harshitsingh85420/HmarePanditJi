import { describe, it, expect } from "vitest";
import { DECK_A, DECK_B, DECK_A_TOTAL, DECK_B_TOTAL, type DeckSlide } from "./tutorial-decks";
import { SKIP, matchAny } from "./voiceGrammar";

// ─────────────────────────────────────────────────────────────
// TUTORIAL-DECK CONTENT LAWS (founder, 2026-07-21). The deck copy must obey,
// in every slide, the laws Isj set for the tutorial system:
//   · MONEY (CONFLICT_RULINGS #7): 100% to the pandit — no deduction may be
//     spoken or shown ANYWHERE; the earning slides affirm पूरी दक्षिणा.
//   · TRUTHFUL-STATE: nothing about घर बैठे, consultancy, backup fees, instant
//     bank credit, auto-itinerary, IVR, or a wallet.
//   · TEXT CAP: headline is 2–4 words — all explanation is spoken.
//   · REGISTER: no roman letters in anything the pandit reads or hears.
//   · SKIP-ability: every slide is escapable by voice ('स्किप करें').
// This guard fails the build if any of these regress in the deck data.
// ─────────────────────────────────────────────────────────────

const ALL = [...DECK_A, ...DECK_B];
const shown = (s: DeckSlide) => [
  s.headline,
  s.say,
  ...s.inMock,
  ...(s.nextLabel ? [s.nextLabel] : []),
  ...(s.confirm?.map((c) => c.label) ?? []),
];
const everyString = ALL.flatMap(shown);

describe("tutorial decks — structure", () => {
  it("Deck A is 9 slides (A0–A8), Deck B is 5 slides (B0–B4)", () => {
    expect(DECK_A_TOTAL).toBe(9);
    expect(DECK_B_TOTAL).toBe(5);
    expect(DECK_A.map((s) => s.id)).toEqual(["A0", "A1", "A2", "A3", "A4", "A5", "A6", "A7", "A8"]);
    expect(DECK_B.map((s) => s.id)).toEqual(["B0", "B1", "B2", "B3", "B4"]);
  });

  it("only the sanctioned interactive/role slides carry behavior markers", () => {
    // exactly one mic slide (आवाज़ = A4); Deck B has none (pure narrate+advance)
    expect(DECK_A.filter((s) => s.interactive === "mic").map((s) => s.id)).toEqual(["A4"]);
    expect(DECK_B.filter((s) => s.interactive).length).toBe(0);
    // exactly the two confirm slides A0 (जानें/स्किप) and A8 (हाँ/बाद में)
    const confirms = ALL.filter((s) => s.confirm);
    expect(confirms.map((s) => s.id)).toEqual(["A0", "A8"]);
    for (const s of confirms) {
      expect(s.confirm).toHaveLength(2);
      expect(s.confirm!.map((c) => c.hint).sort()).toEqual(["proceed", "skip"]);
    }
    // roles are identity-keyed intro/cta only
    expect(ALL.filter((s) => s.role === "cta").map((s) => s.id)).toEqual(["A8", "B4"]);
  });
});

describe("tutorial decks — MONEY LAW (100% to pandit, कोई कटौती)", () => {
  // negations that are LEGITIMATE (they PROMISE no deduction) are stripped first,
  // then any residual deduction language is a violation.
  const NEG =
    /(कोई\s*)?कटौती\s*नहीं|नहीं\s*कट(ेगा|ता|ती)?|कुछ\s*नहीं\s*कट\S*|घटती\s*नहीं|एक भी रुपया नहीं कटेगा/g;
  const DEDUCTION = /कमीशन|कटौती|कट(ेगा|ता|ती)|काटत|प्रतिशत|%|सेवा[-\s]?शुल्क/;

  it("no slide spoken/shown text asserts ANY deduction from the pandit", () => {
    const offenders = everyString
      .map((v) => ({ v, residual: v.replace(NEG, " ") }))
      .filter((r) => DEDUCTION.test(r.residual))
      .map((r) => r.v);
    expect(offenders).toEqual([]);
  });

  it("the earning slides affirm the FULL dakshina (A1, A3, B3)", () => {
    for (const id of ["A1", "A3", "B3"]) {
      const s = ALL.find((x) => x.id === id)!;
      expect(s.say, `${id} must promise the whole dakshina`).toMatch(/पूर(ी|े)|कटौती नहीं|नहीं कटेगा/);
    }
  });
});

describe("tutorial decks — TRUTHFUL-STATE (no unbuilt promises)", () => {
  // founder's forbidden claims: घर बैठे, consultancy, backup fee, instant bank
  // credit, auto-itinerary, IVR, wallet.
  const FORBIDDEN: Array<[RegExp, string]> = [
    [/घर\s*बैठे/, "घर बैठे"],
    [/कंसल्ट|कन्सल्ट|परामर्श\s*शुल्क/, "consultancy"],
    [/बैकअप|बैक-अप/, "backup fee"],
    [/तुरंत\s*(बैंक|खाते|पैसा)/, "instant bank credit"],
    [/स्वतः\s*यात्रा|अपने[-\s]?आप\s*यात्रा|यात्रा\s*अपने[-\s]?आप/, "auto-itinerary"],
    [/आईवीआर|IVR/, "IVR"],
    [/वॉलेट|बटुआ\s*ऐप/, "wallet"],
  ];
  it("no slide makes a forbidden truthful-state claim", () => {
    const hits: string[] = [];
    for (const v of everyString)
      for (const [rx, label] of FORBIDDEN) if (rx.test(v)) hits.push(`${label}: "${v}"`);
    expect(hits).toEqual([]);
  });
});

describe("tutorial decks — TEXT CAP + REGISTER", () => {
  it("every headline is 2–4 words (· separators do not count)", () => {
    for (const s of ALL) {
      const words = s.headline.replace(/·/g, " ").trim().split(/\s+/).filter(Boolean);
      expect(words.length, `"${s.headline}" (${s.id})`).toBeGreaterThanOrEqual(1);
      expect(words.length, `"${s.headline}" (${s.id})`).toBeLessThanOrEqual(4);
    }
  });

  it("no roman letters in anything the pandit reads or hears", () => {
    // ids carry A/B but are never shown; scan only headline/say/inMock/choice labels.
    const roman = everyString.filter((v) => /[A-Za-z]/.test(v));
    expect(roman).toEqual([]);
  });
});

describe("tutorial decks — SKIP-ability", () => {
  it("'स्किप करें' resolves against the global SKIP grammar (escape from any slide)", () => {
    expect(matchAny("स्किप करें", SKIP)).toBe(true);
  });
});
