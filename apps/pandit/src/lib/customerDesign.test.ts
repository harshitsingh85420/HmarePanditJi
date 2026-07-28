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
// ग्राहक ऐप — the rules from turn 2 that are about what must NOT exist.
//
// A promise that a dark pattern is absent cannot be proven by looking at the
// screen — the screen looks fine right up until someone adds the blur. These
// only hold as guards.
// ─────────────────────────────────────────────────────────────

const WEB = join(__dirname, "..", "..", "..", "..", "apps", "web");

// A guard that scans source must look at CODE, not at prose. Without this the
// comment explaining a forbidden pattern trips the assertion forbidding it —
// which is exactly how this file first failed. (Same cure as
// services/api/src/lib/kycContract.test.ts.)

const read = (p: string) => codeOnly(readFileSync(join(WEB, p), "utf8"));
/**
 * RAW_SOURCE_REQUIRED — the ONE documented exception to codeOnly().
 * See packages/utils/src/code-only.ts, where the rule and this exception are
 * written down together. Slot 5 is RESERVED and renders nothing; the only
 * artifact pinning that intent IS a comment, so stripping comments here would
 * delete the subject under test and pass vacuously forever.
 * Every other read in this file goes through `read` (= codeOnly).
 */
const readRaw = (p: string) => readFileSync(join(WEB, p), "utf8");

const SEARCH = read("src/app/search/search-client.tsx");
const CARD = read("components/design/PanditRecordCard.tsx");
const GUEST = read("components/design/GuestMode.tsx");
const VERIF = read("components/design/Verification.tsx");

describe("अतिथि · the paywall is at commitment, not at the door", () => {
  it("guest mode says what he CAN do, never what he can't", () => {
    expect(GUEST).toMatch(/पूरा मंच देखिए · खाता बाद में/);
    // no restriction language anywhere in the guest surface
    for (const forbidden of ["लॉगिन करें देखने के लिए", "sign in to view", "login to see"]) {
      expect(GUEST.toLowerCase()).not.toContain(forbidden.toLowerCase());
    }
  });

  it("the price is never a bargaining chip — no blur, no teaser, no gate", () => {
    // the money figure must not be wrapped in any auth condition
    const priceBlock = CARD.slice(CARD.indexOf("hasDakshina ?"), CARD.indexOf("दक्षिणा तय नहीं"));
    expect(priceBlock).not.toMatch(/isAuthenticated|user\b|token|login/i);
    expect(priceBlock).not.toMatch(/blur/i);
    // and the search screen states the promise out loud
    expect(SEARCH).toMatch(/RealPricesNote/);
    expect(GUEST).toMatch(/सभी दाम असली हैं/);
  });

  it("the gate names what is preserved — the sentence IS the trick", () => {
    expect(GUEST).toMatch(/पंडित जी, तारीख और दाम — सब वैसे ही रहेंगे/);
  });
});

describe("संरचनात्मक जगह · structural room", () => {
  it("slot 5 is reserved and renders NOTHING at pilot", () => {
    // Slot 5 renders nothing, so the ONLY trace it can leave is the spec
    // itself. That is the point: "the slot is a spec, not a ghost element."
    // Asserting on raw source keeps the reservation from being quietly
    // deleted by someone who sees a comment and no code.
    expect(readRaw("components/design/PanditRecordCard.tsx")).toMatch(/slot 5 — RESERVED/);
    // a reserved slot that draws something is a promise; there must be no
    // placeholder, dimmed row, or "coming soon" anywhere in the card
    expect(CARD).not.toMatch(/coming soon|जल्द आ रहा|अभी उपलब्ध नहीं/i);
  });

  it("nothing implies travel BETWEEN cities — only distance within one", () => {
    // distance is in scope; fares, routes and modes of travel are not
    for (const outOfScope of ["किराया", "यात्रा शुल्क", "train", "flight", "रेल", "उड़ान", "travel fare"]) {
      expect(CARD.toLowerCase()).not.toContain(outOfScope.toLowerCase());
    }
    // distance within one city is the ONLY spatial claim the card makes
    expect(CARD).toMatch(/आपसे/);
    expect(CARD).toMatch(/कि\.मी\./);
  });
});

describe("बिना समीक्षा भरोसा · trust with zero reviews", () => {
  it("admits the absence rather than hiding it", () => {
    expect(VERIF).toMatch(/अभी कोई समीक्षा नहीं/);
    expect(SEARCH).toMatch(/NoReviewsNotice/);
  });

  it("no stars are ever rendered while there are no reviews", () => {
    expect(CARD).not.toMatch(/★|☆|star_rate|rating/i);
  });

  it("specificity beats superlatives — no uncheckable claims", () => {
    // NB: no bare "#1" here — it matches hex colours like #1a140d and makes
    // the guard cry wolf. Match phrases a human would actually write.
    for (const s of ["best pandit", "top rated", "top-rated", "most trusted", "number 1 pandit"]) {
      expect(SEARCH.toLowerCase()).not.toContain(s);
      expect(CARD.toLowerCase()).not.toContain(s);
    }
  });
});

describe("दो सत्यापन stay two", () => {
  it("green is reserved for verified identity and is never a success colour", () => {
    const tw = read("tailwind.config.ts");
    expect(tw).not.toMatch(/success:/);
    expect(tw).toMatch(/tulsi/);
  });

  it("the pooja video badge is a separate component from the identity pill", () => {
    expect(VERIF).toMatch(/export function IdentityVerifiedPill/);
    expect(VERIF).toMatch(/export function PoojaVideoBadge/);
    // and the pending state never promises a date
    const pending = VERIF.slice(VERIF.indexOf('state === "pending"'));
    expect(pending).not.toMatch(/\d+\s*(दिन|घंटे|days|hours)/);
  });
});
