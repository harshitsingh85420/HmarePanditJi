// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from "vitest";

vi.mock("@/lib/api", () => ({
  api: vi.fn(async () => ({ success: true })),
}));

import {
  matchBrainIntent,
  isScreenContextAsk,
  isQuestionShaped,
  recordUnansweredQuestion,
  BRAIN_INTENTS,
} from "./shishyaBrain";
import { api } from "@/lib/api";

describe("shishyaBrain - S6 intent matching", () => {
  // 10 representative questions — incl. the verbatim Ramesh-run ask
  const cases: Array<[string, string]> = [
    ["पैसा कब मिलेगा", "paymentWhen"],
    ["अरे बेटा ये बताओ कमीशन कितना काटोगे", "commission"],
    ["दक्षिणा कौन तय करेगा जी", "dakshinaWho"],
    ["यात्रा भत्ता मिलेगा क्या", "travel"],
    ["आधार क्यों माँग रहे हो भाई", "aadhaarSafe"],
    ["बुकिंग मना कर सकते हैं क्या", "bookingRefuse"],
    ["सत्यापन कितना समय लेगा", "verifyHowLong"],
    ["तुम कौन हो बेटा", "whoAreYou"],
    ["ये ऐप किसका है", "whoseApp"],
    ["पैसा नहीं आया तो क्या करूँ", "paymentMissing"],
  ];
  cases.forEach(([q, id]) => {
    it(`"${q}" → intent [${id}]`, () => {
      const hit = matchBrainIntent(q);
      expect(hit?.id).toBe(id);
    });
  });

  it("every intent answer resolves to a non-empty Hindi string", () => {
    expect(BRAIN_INTENTS.length).toBeGreaterThanOrEqual(30);
    for (const it2 of BRAIN_INTENTS) {
      const a = it2.answer();
      expect(a.length).toBeGreaterThan(10);
      // never the raw key (t() falls back to the key on a miss)
      expect(a).not.toContain("shishya.faq");
    }
  });

  it("screen-context asks are detected", () => {
    expect(isScreenContextAsk("ये स्क्रीन क्या है")).toBe(true);
    expect(isScreenContextAsk("मैं कहाँ हूँ बेटा")).toBe(true);
    expect(isScreenContextAsk("आगे बढ़ो")).toBe(false);
  });

  it("non-question gibberish is NOT question-shaped (keeps the short miss)", () => {
    expect(isQuestionShaped("रामा शामा डामा")).toBe(false);
    expect(matchBrainIntent("रामा शामा डामा")).toBeNull();
  });

  it("question-shaped unknown → no intent, but question-shaped (honest miss path)", () => {
    const q = "मेरी बकरी बीमार है क्या करूँ";
    expect(matchBrainIntent(q)).toBeNull();
    expect(isQuestionShaped(q)).toBe(true);
  });

  it("english 'no' never reads as a question word", () => {
    expect(isQuestionShaped("no")).toBe(false);
  });
});

describe("shishyaBrain - S6d miss telemetry", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.mocked(api).mockClear();
  });

  it("records to localStorage (cap 100) and fires the POST", () => {
    recordUnansweredQuestion("मेरी बकरी बीमार है क्या करूँ");
    const list = JSON.parse(localStorage.getItem("shishya_unanswered") || "[]");
    expect(list).toHaveLength(1);
    expect(list[0].text).toContain("बकरी");
    expect(api).toHaveBeenCalledWith(
      "/feedback/unanswered",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("caps the local queue at 100", () => {
    for (let i = 0; i < 120; i++) recordUnansweredQuestion(`सवाल ${i} क्या`);
    const list = JSON.parse(localStorage.getItem("shishya_unanswered") || "[]");
    expect(list).toHaveLength(100);
    expect(list[0].text).toContain("सवाल 20");
  });
});
