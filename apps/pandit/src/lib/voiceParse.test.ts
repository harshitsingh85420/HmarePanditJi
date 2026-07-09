import { describe, it, expect } from "vitest";
import { parseHindiNumber, parsePhoneNumber, spokenDigits } from "./voiceParse";

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

// K2 — the pandit SPEAKS his number; Deepgram writes words. Phone mode
// must map digit-words (and डबल X) to digits before the 10-digit law.
describe("voiceParse - parsePhoneNumber hindi digit-words (K2)", () => {
  const cases: Array<[string, string | null]> = [
    // pure digit forms keep working exactly as before
    ["9876543210", "9876543210"],
    ["98765 43210", "9876543210"],
    ["+91 98765-43210", "9876543210"],
    ["0 9876543210", "9876543210"],
    ["98765", null],
    // the reported defect: नौ ×10
    ["नौ नौ नौ नौ नौ नौ नौ नौ नौ नौ", "9999999999"],
    // full word ladder
    ["नौ आठ सात छह पांच चार तीन दो एक शून्य", "9876543210"],
    // डबल X doubles the next digit (word or numeral)
    ["डबल नौ डबल नौ डबल नौ डबल नौ डबल नौ", "9999999999"],
    ["डबल 9 आठ सात छह पांच चार तीन दो एक", "9987654321"],
    // mixed words + digits in one utterance
    ["नौ नौ 9 8 सात 6 पांच 4 तीन 2", "9998765432"],
    // preamble words drop, digits survive
    ["मेरा नंबर नौ आठ सात छह पांच चार तीन दो एक शून्य है", "9876543210"],
    // 9 digits is not a phone number
    ["नौ नौ नौ नौ नौ नौ नौ नौ नौ", null],
    // transliterated words count too
    ["nau aath saat chhe paanch char teen do ek shunya", "9876543210"],
  ];

  cases.forEach(([input, expected]) => {
    it(`should parse "${input}" as ${expected}`, () => {
      expect(parsePhoneNumber(input)).toBe(expected);
    });
  });

  it("exports the digit-word mapper for future use (OTP stays typed-only)", () => {
    expect(spokenDigits("नौ आठ सात")).toBe("987");
    expect(spokenDigits("डबल नौ")).toBe("99");
    // 'no' (English) must NOT read as नौ
    expect(spokenDigits("no")).toBe("");
  });
});
