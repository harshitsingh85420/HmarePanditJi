import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { hi } from "./strings";

// ─────────────────────────────────────────────────────────────
// FAQ TRUTH GUARD. The written FAQ (canon frame 23) must never tell the
// pandit something different from what शिष्य says aloud. Founder decision
// 2026-07-21 (CONFLICT_RULINGS #7): the pandit keeps 100% of the dakshina —
// कोई कटौती नहीं; the platform fee is a SEPARATE charge the CUSTOMER pays.
// So the commission answer must promise 100% and NO deduction, and must
// never claim any deduction rate (90/10, 85/15, 80/20). A wrong number
// here is a money lie in writing.
// ─────────────────────────────────────────────────────────────

const src = readFileSync(join(__dirname, "strings.ts"), "utf-8");

describe("FAQ content is truthful and consistent with शिष्य", () => {
  it("the commission answer promises 100% to the pandit — कोई कटौती", () => {
    const commission = hi.faq.items.find((i) => /प्लेटफ़ॉर्म कितना काटता/.test(i.q));
    expect(commission, "the commission question must exist").toBeTruthy();
    expect(commission!.a, "must promise the full 100%").toMatch(/100 प्रतिशत/);
    expect(commission!.a, "must say nothing is deducted").toMatch(/कुछ नहीं काटता|कोई कटौती नहीं|घटती नहीं/);
    // and must NOT reintroduce the old 90/10 deduction language
    expect(commission!.a, "the pandit no longer gets only 90%").not.toMatch(/90 प्रतिशत/);
  });

  it("no FAQ answer claims the dakshina is reduced by any rate", () => {
    for (const item of hi.faq.items) {
      // the pandit keeps 100% — no answer may state a 90/85/80 % share
      expect(item.a, `"${item.q}" must not claim only 90%`).not.toMatch(/90 प्रतिशत/);
      expect(item.a, `"${item.q}" must not claim 15% fee`).not.toMatch(/15 प्रतिशत|15%/);
      expect(item.a, `"${item.q}" must not claim 20% fee`).not.toMatch(/20 प्रतिशत|20%/);
    }
  });

  it("payout timing is stated consistently across answers", () => {
    const payout = hi.faq.items.filter((i) => /घंटे/.test(i.a));
    expect(payout.length, "payout answers must exist").toBeGreaterThan(0);
    // every answer that mentions hours must say the SAME number
    const hours = payout.map((i) => i.a.match(/(\d+)\s*घंटे/)?.[1]);
    expect(new Set(hours).size, `payout hours disagree: ${hours.join(", ")}`).toBe(1);
  });

  it("every item has a real question and answer, and a known group", () => {
    expect(hi.faq.items.length).toBeGreaterThanOrEqual(10);
    for (const item of hi.faq.items) {
      expect(item.q.trim().length, "question must not be empty").toBeGreaterThan(5);
      expect(item.a.trim().length, "answer must not be empty").toBeGreaterThan(10);
      expect(["booking", "money", "verify"]).toContain(item.g);
    }
  });

  it("the rejection answer points at the real दुबारा भेजिए affordance", () => {
    const rejected = hi.faq.items.find((i) => /अस्वीकृत/.test(i.q));
    expect(rejected, "the rejection question must exist").toBeTruthy();
    expect(rejected!.a).toMatch(/दुबारा भेजिए/);
    // and that string must actually exist as the button label
    expect(src).toMatch(/resubmit: "दुबारा भेजिए"/);
  });
});
