import { describe, it, expect } from "vitest";
import { parseHindiNumber } from "./voiceParse";

describe("voiceParse - parseHindiNumber mandatory tests", () => {
  const cases: Array<[string, number | null]> = [
    ["पाँच हज़ार एक सौ", 5100],
    ["पांच हजार", 5000],
    ["ग्यारह सौ", 1100],
    ["डेढ़ हज़ार", 1500],
    ["ढाई हज़ार", 2500],
    ["साढ़े तीन हज़ार", 3500],
    ["पचास", 50],
    ["5 हज़ार", 5000],
    ["5100", 5100],
    ["एक लाख", 100000],
    ["एक लाख इक्यावन हज़ार", 151000],
    ["₹2,100 रुपये", 2100],
    ["करीब पाँच सौ जी", 500],
    ["इक्कीस सौ", 2100],
    ["कुछ नहीं", null]
  ];

  cases.forEach(([input, expected]) => {
    it(`should parse "${input}" as ${expected}`, () => {
      expect(parseHindiNumber(input)).toBe(expected);
    });
  });
});
