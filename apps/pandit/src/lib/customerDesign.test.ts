import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
// Comments are stripped by the ONE shared implementation. See
// packages/utils/src/code-only.ts for why this is a scanner and not a
// regex, and for the single documented raw-source exception.
import { codeOnly } from "@hmarepanditji/utils/code-only";
// (the /code-only SUBPATH, not the barrel: the barrel re-exports
//  auth-context.tsx, which requires React — unresolvable in bare node+tsx.)

// ─────────────────────────────────────────────────────────────
// ग्राहक ऐप — the rules that are about what must NOT exist.
//
// A promise that a dark pattern is absent cannot be proven by looking at the
// screen — the screen looks fine right up until someone adds the blur. These
// only hold as guards.
//
// REWRITTEN FOR THE RULED STATE, 2026-08-02 (batch 3). Five assertions here
// pinned the SUPERSEDED surface — the Devanagari guest strip, RealPricesNote,
// the 1c card's "आपसे X कि.मी." row and slot-5 reservation — and went red the
// moment the rulings landed (decide-or-go kills a/b, English-first, the 4b
// rebuild). A GUARD THAT PINS YESTERDAY'S COPY REPORTS TODAY'S RULING AS A
// DEFECT: same class as the fee-disclosure matcher that welded a money law to
// a script. Each check below asserts the LAW, phrased against the ruled
// surface; where a ruling KILLED a string, the guard now asserts its ABSENCE,
// so the kill cannot quietly regress.
// ─────────────────────────────────────────────────────────────

const WEB = join(__dirname, "..", "..", "..", "..", "apps", "web");

const read = (p: string) => codeOnly(readFileSync(join(WEB, p), "utf8"));

// moved out of the condemned src tree by the /search migration (Ruling 2,
// 2026-08-02) — this test found the move because it reads the file by path
const SEARCH = read("app/search/search-client.tsx");
const CARD = read("components/design/PanditRecordCard.tsx");
const GUEST = read("components/design/GuestMode.tsx");

describe("अतिथि · the paywall is at commitment, not at the door", () => {
  it("guest mode says what he CAN do, never what he can't", () => {
    // English-first (canon turn 4); the strip is an instruction
    expect(GUEST).toMatch(/Browse everything · account later/);
    // no restriction language anywhere in the guest surface
    for (const forbidden of ["लॉगिन करें देखने के लिए", "sign in to view", "login to see"]) {
      expect(GUEST.toLowerCase()).not.toContain(forbidden.toLowerCase());
    }
  });

  it("the price is never a bargaining chip — no blur, no teaser, no gate", () => {
    // the money figure must not be wrapped in any auth condition
    const priceBlock = CARD.slice(CARD.indexOf("hasDakshina ?"), CARD.indexOf("Rate not set"));
    expect(priceBlock.length).toBeGreaterThan(0);
    expect(priceBlock).not.toMatch(/isAuthenticated|token|login/i);
    expect(priceBlock).not.toMatch(/blur/i);
  });

  it('the self-praise line stays DEAD — "सभी दाम असली हैं" was a ruled kill', () => {
    // decide-or-go kill (a): a platform announcing its own honesty
    // manufactures doubt. The kill holds only if its regression fails here.
    expect(GUEST).not.toMatch(/सभी दाम असली हैं/);
    expect(SEARCH).not.toMatch(/RealPricesNote/);
    expect(SEARCH).not.toMatch(/सभी दाम असली हैं/);
  });

  it("the gate names what is preserved — the sentence IS the trick", () => {
    expect(GUEST).toMatch(/पंडित जी, तारीख और दाम — सब वैसे ही रहेंगे/);
  });
});

describe("the identity badge is a door, not a badge (ruled 2026-08-02)", () => {
  it("no customer card carries an Aadhaar / identity-verified claim", () => {
    // LISTED MEANS AADHAAR-PASSED: every listed pandit passed identity by
    // definition (F-B3-1 enforces the boundary), so the badge differentiates
    // nothing. Customer-side verification vocabulary is PUJA verification.
    for (const doorWord of ["पहचान सत्यापित", "Identity verified", "Aadhaar checked", "identityVerified"]) {
      expect(CARD).not.toContain(doorWord);
    }
  });

  it("the card promises only what the filter can keep", () => {
    // chips read ACTIVE PujaService rows — the column ?pujaType= filters on —
    // never raw specializations. The read lives in the ONE shared mapper
    // (F-B3-5 extracted it so home and search cannot diverge again).
    const MAPPER = read("components/design/mapPandit.ts");
    expect(CARD).toMatch(/services/);
    expect(CARD).not.toMatch(/specializations/);
    expect(MAPPER).toMatch(/pujaServices/);
    expect(MAPPER).not.toMatch(/specializations:/);
  });
});

describe("संरचनात्मक जगह · structural room", () => {
  it("no placeholder, dimmed row, or coming-soon anywhere in the card", () => {
    expect(CARD).not.toMatch(/coming soon|जल्द आ रहा|अभी उपलब्ध नहीं/i);
  });

  it("the honesty-ladder: same-city and km only downstream of a MEASUREMENT", () => {
    // Re-ruled 2026-08-03 after "In your city" rendered to a founder who was
    // not in that city. The ladder: matrix km → "~X km away"; measured
    // equality → "In your city"; anything else → the TRUE city name.
    // The specimen: with NO vantage the card must fall through to `city`.
    const ladder = CARD.match(/\{sameCity === true[\s\S]{0,260}?: city\}/);
    expect(ladder, "the ladder must end at the TRUE city — the unknown case may never claim proximity").toBeTruthy();
    // "In your city" appears ONLY inside the strict-equality branch
    const idx = CARD.indexOf('"In your city"');
    expect(idx).toBeGreaterThan(-1);
    expect(CARD.slice(idx - 120, idx)).toMatch(/sameCity === true/);
    // a kilometre renders ONLY from the numeric wire fact (the matrix), and
    // is approximate by its own punctuation — never false precision
    const km = CARD.indexOf("km away");
    expect(km).toBeGreaterThan(-1);
    expect(CARD.slice(km - 200, km)).toMatch(/typeof distanceKm === "number" && distanceKm > 0/);
    // fares, routes and modes of travel stay out of scope
    for (const outOfScope of ["किराया", "यात्रा शुल्क", "train", "flight", "रेल", "उड़ान", "travel fare"]) {
      expect(CARD.toLowerCase()).not.toContain(outOfScope.toLowerCase());
    }
    // and the card can never COMPUTE a distance itself — no coordinates, no
    // haversine, no math but the wire's own number
    expect(CARD).not.toMatch(/haversine|latitude|longitude|Math\.(sin|cos|asin|sqrt)/);
  });
});

describe("बिना समीक्षा भरोसा · trust with zero reviews", () => {
  it("admits the absence rather than hiding it", () => {
    // the honest absence survives translation — English-first per the canon
    expect(CARD + SEARCH).toMatch(/No reviews yet/);
  });

  it("no stars are ever rendered while there are no reviews", () => {
    expect(CARD).not.toMatch(/★|☆|star_rate|starRating/i);
  });

  it("specificity beats superlatives — no uncheckable claims", () => {
    for (const s of ["best pandit", "top rated", "top-rated", "most trusted", "number 1 pandit"]) {
      expect(SEARCH.toLowerCase()).not.toContain(s);
      expect(CARD.toLowerCase()).not.toContain(s);
    }
  });
});

describe("दो सत्यापन stay two", () => {
  it("green is reserved for verification truth and is never a success colour", () => {
    const tw = read("tailwind.config.ts");
    expect(tw).not.toMatch(/success:/);
    expect(tw).toMatch(/tulsi/);
  });

  it("the green tick appears ONLY on a pooja OUR review approved", () => {
    // the card's one green use is the poojaVerified chip — the DIFFERENTIATOR
    const chipBlock = CARD.slice(CARD.indexOf("poojaVerified"), CARD.indexOf("attested rows") > 0 ? CARD.indexOf("attested rows") : undefined);
    expect(CARD).toMatch(/poojaVerified\s*\?\s*"bg-tulsi-tint text-tulsi"/);
    expect(chipBlock.length).toBeGreaterThan(0);
  });

  it("the video line never promises a review date", () => {
    expect(CARD).not.toMatch(/\d+\s*(दिन|घंटे|days|hours)/);
  });
});
