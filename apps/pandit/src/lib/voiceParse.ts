"use client";

const UNITS: Record<string, number> = {
  "शून्य":0,"एक":1,"ek":1,"दो":2,"do":2,"तीन":3,"teen":3,"चार":4,"char":4,"chaar":4,
  "पांच":5,"पाँच":5,"panch":5,"paanch":5,"छह":6,"छः":6,"chhe":6,"che":6,"सात":7,"saat":7,
  "आठ":8,"aath":8,"नौ":9,"nau":9,"दस":10,"das":10,"ग्यारह":11,"gyarah":11,"बारह":12,"barah":12,
  "तेरह":13,"चौदह":14,"पंद्रह":15,"सोलह":16,"सत्रह":17,"अठारह":18,"उन्नीस":19,
  "बीस":20,"bees":20,"तीस":30,"tees":30,"चालीस":40,"chalis":40,"पचास":50,"pachas":50,
  "साठ":60,"सत्तर":70,"अस्सी":80,"नब्बे":90,
  "इक्कीस":21,"बाईस":22,"तेईस":23,"चौबीस":24,"पच्चीस":25,"छब्बीस":26,"सत्ताईस":27,"अट्ठाईस":28,"उनतीस":29,
  "इकतीस":31,"बत्तीस":32,"पैंतीस":35,"पैंतालीस":45,"पचपन":55,"पैंसठ":65,"पचहत्तर":75,"पचासी":85,"पचानवे":95,
  "इक्यावन":51,"एक सौ":100,
};
const MULTIPLIERS: Record<string, number> = {
  "सौ":100,"sau":100,"so":100,
  "हज़ार":1000,"हजार":1000,"hazar":1000,"hazaar":1000,"hajar":1000,
  "लाख":100000,"lakh":100000,"lac":100000,
};
const HALF_WORDS: Record<string, number> = { "डेढ़":1.5,"डेढ":1.5,"dedh":1.5,"ढाई":2.5,"dhai":2.5,"साढ़े":-1,"sadhe":-1 }; // साढ़े = add 0.5 to NEXT number

export function parseHindiNumber(raw: string): number | null {
  if (!raw) return null;
  const t = raw.toLowerCase()
    .replace(/[₹,।.?!]/g, " ")
    .replace(/रुपये|रुपया|रुपए|rupaye|rupees|rs/g, " ")
    .replace(/\s+/g, " ").trim();
  if (!t) return null;

  // Case 1: pure digits possibly with spaces ("5 100" or "5100")
  const digitsOnly = t.replace(/\s/g, "");
  if (/^\d+$/.test(digitsOnly)) return parseInt(digitsOnly, 10);

  const words = t.split(" ");
  let total = 0;        // completed sections (e.g., lakhs already applied)
  let current = 0;      // running value awaiting a multiplier
  let pendingHalf = 0;  // 0.5 from साढ़े applying to next unit
  for (const w of words) {
    if (HALF_WORDS[w] !== undefined) {
      if (HALF_WORDS[w] === -1) { pendingHalf = 0.5; }
      else { current += HALF_WORDS[w]; }  // डेढ़/ढाई act as a unit value
      continue;
    }
    if (/^\d+$/.test(w)) { current += parseInt(w, 10) + pendingHalf; pendingHalf = 0; continue; }
    if (UNITS[w] !== undefined) { current += UNITS[w] + pendingHalf; pendingHalf = 0; continue; }
    if (MULTIPLIERS[w] !== undefined) {
      const base = current === 0 ? 1 : current;
      const scaled = (base + pendingHalf) * MULTIPLIERS[w]; // साढ़े तीन हज़ार = 3500
      pendingHalf = 0;
      if (MULTIPLIERS[w] >= 1000) { total += scaled; current = 0; }
      else { current = scaled; } // सौ stays in current so "एक सौ पचास"=150, "ग्यारह सौ"=1100
      continue;
    }
    // unknown word: ignore (filler like "करीब", "जी")
  }
  const result = total + current;
  return result > 0 && Number.isInteger(result) ? result : (result > 0 ? Math.round(result) : null);
}

// K2: DIGIT words as Deepgram writes them when a pandit SPEAKS his
// number — hi + transliteration + English word forms, 0-9 only (this is
// a digit-SEQUENCE map, unlike UNITS above which sums amounts). English
// "no" is deliberately absent: it is नहीं, never नौ.
const DIGIT_WORDS: Record<string, string> = {
  "शून्य": "0", "जीरो": "0", "सिफर": "0", "zero": "0", "shunya": "0", "shoonya": "0",
  "एक": "1", "ek": "1", "one": "1",
  "दो": "2", "do": "2", "two": "2",
  "तीन": "3", "teen": "3", "three": "3",
  "चार": "4", "char": "4", "chaar": "4", "four": "4",
  "पांच": "5", "पाँच": "5", "panch": "5", "paanch": "5", "five": "5",
  "छह": "6", "छः": "6", "chhe": "6", "che": "6", "six": "6",
  "सात": "7", "saat": "7", "seven": "7",
  "आठ": "8", "aath": "8", "eight": "8",
  "नौ": "9", "nau": "9", "nine": "9",
};
const DOUBLE_WORDS = ["डबल", "double", "dabal"];

/**
 * K2: rebuild a spoken digit STRING from a transcript — digit words map
 * to digits, "डबल X" doubles the next digit, numeral runs pass through,
 * anything else ("मेरा नंबर…") drops as preamble. Exported for future
 * digit-sequence consumers (OTP itself stays typed-only by A5).
 */
export function spokenDigits(text: string): string {
  const tokens = text
    .toLowerCase()
    .replace(/[,.।()-]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
  let out = "";
  let pendingDouble = false;
  for (const tok of tokens) {
    if (DOUBLE_WORDS.includes(tok)) {
      pendingDouble = true;
      continue;
    }
    const mapped = DIGIT_WORDS[tok] ?? (/^\d+$/.test(tok) ? tok : null);
    if (mapped === null) {
      // filler between डबल and its digit cancels the double
      pendingDouble = false;
      continue;
    }
    out += pendingDouble && mapped.length === 1 ? mapped + mapped : mapped;
    pendingDouble = false;
  }
  return out;
}

/**
 * Normalizes phone numbers: strip spaces/dashes; accept only if exactly 10 digits
 * after removing leading +91, 91, or 0. K2: spoken digit-words ("नौ आठ
 * सात…", "डबल नौ…", mixed words+numerals) rebuild through spokenDigits
 * first — the pandit answers the phone question by VOICE.
 */
export function parsePhoneNumber(text: string): string | null {
  if (!text) return null;

  // Strip spaces, dashes, and parenthetical elements
  let cleaned = text.replace(/[\s\-()]/g, "");

  // K2: any non-digit content → word pre-pass (digit words, डबल X,
  // preamble stripping), then the same 10-digit law below
  if (!/^\+?\d+$/.test(cleaned)) {
    cleaned = spokenDigits(text);
  }

  // Remove leading +91 or 91
  if (cleaned.startsWith("+91")) {
    cleaned = cleaned.slice(3);
  } else if (cleaned.startsWith("91") && cleaned.length > 10) {
    cleaned = cleaned.slice(2);
  } else if (cleaned.startsWith("0") && cleaned.length > 10) {
    cleaned = cleaned.slice(1);
  }

  // Ensure it consists only of 10 digits
  if (/^\d{10}$/.test(cleaned)) {
    return cleaned;
  }

  return null;
}

/**
 * Matches transcript against choices' keywords using case & diacritic insensitive search.
 */
export function matchChoice<T extends { keywords: string[]; value: string }>(
  transcript: string,
  choices: T[]
): T | null {
  if (!transcript) return null;

  // Normalize transcript (remove accents/diacritics if possible, simple lower case)
  const normalizedTranscript = transcript.toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  for (const choice of choices) {
    for (const keyword of choice.keywords) {
      const normalizedKeyword = keyword.toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
      
      if (normalizedTranscript.includes(normalizedKeyword)) {
        return choice;
      }
    }
  }

  return null;
}
