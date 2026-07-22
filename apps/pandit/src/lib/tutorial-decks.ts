/**
 * TUTORIAL DECKS — the two voice-first slide decks (design "ट्यूटोरियल · Animated").
 *
 *   Deck A "सफलता की पहली सीढ़ी" (A0–A8, 9 slides) — plays AFTER the language
 *     ceremony, BEFORE registration. Motivation / "why this app".
 *   Deck B "App चलाना सीखिए" (B0–B4, 5 slides) — auto-starts on the FIRST
 *     arrival at होम after registration. Teaches the home-screen controls.
 *
 * THIS FILE IS DATA ONLY (no behavior). The DeckPlayer renders each slide's
 * `artboard` (a placeholder until the design bundle lands — see tutorial-
 * artboards.tsx), speaks `say` via the shared voice stack, shows `headline`,
 * and drives the choices on the two `confirm` slides through the F02 confirm
 * ladder. Slide identity is by `id` for progress/analytics ONLY — interactive
 * behavior is keyed by `interactive`/`role` (never by index), same law the
 * existing tutorial guards enforce.
 *
 * LAWS baked into the copy here (guarded by tutorial-decks.test.ts):
 *  · Register: शुद्ध सम्मानजनक हिंदी — आप-forms, -इए imperatives, NO roman words
 *    (the design draft's platform/app/UPI/booking/video → the repo's established
 *     प्लेटफ़ॉर्म/ऐप/यूपीआई/बुकिंग/वीडियो).
 *  · Money (CONFLICT_RULINGS #7): 100% to the pandit — कोई कटौती. No deduction
 *    is ever spoken or shown (A1/A3/B3 affirm पूरी दक्षिणा).
 *  · Truthful-state: nothing about घर बैठे, consultancy, backup fees, instant
 *    bank credit, auto-itinerary, IVR, or a wallet.
 *  · Text cap: headline is 2–4 words; ALL explanation is spoken.
 *
 * SCRIPTS: A0's line is the repo's approved स्वागत (strings.ts voiceIntro).
 * The rest are the design's intent rendered in the app's established register,
 * PROPOSED for Isj's approval — the DeckPlayer reads them as data, so an exact
 * approved wording drops in with a one-line edit each.
 */

/**
 * MERGE-GATE FLAG (Isj 2026-07-22, docs/review/tutorial-merge-gate.md). The
 * new deck-based tutorial (Deck A 9 slides + Deck B 5 slides) is DEFAULT-OFF:
 * production keeps the live 6-slide TutorialV2 until the Claude-Design artboards
 * are ported. Flip to `true` ONLY when every deck slide has a REAL artboard —
 * enforced as a FLAG PROPERTY by tutorial-artboards-ready.test.ts (flag ON ⇒ no
 * slide may resolve to PlaceholderArtboard), so the guard and the flag can never
 * cancel each other. The 9-slide path is still exercised in tests with the flag
 * FORCED on (so an always-off flag is never an unexercised code path).
 */
export const TUTORIAL_DECKS_ENABLED = false;

export type DeckId = "A" | "B";

export interface DeckSlideChoice {
  /** spoken + shown label (Devanagari) */
  label: string;
  /** what picking it means to the flow: keep going, or leave the deck for registration */
  hint: "proceed" | "skip";
}

export interface DeckSlide {
  /** 'A0'..'A8' | 'B0'..'B4' — progress/analytics key ONLY, never a behavior switch */
  id: string;
  deck: DeckId;
  /** 2–4 words; the ONLY on-screen text besides in-mock labels and controls */
  headline: string;
  /** the spoken narration (one ~1-line utterance, plays over the ~7s loop) */
  say: string;
  /** labels the design artboard shows inside the mock (placeholder content until the bundle) */
  inMock: string[];
  /** identity-keyed interactive behavior (Deck-A only): the आवाज़ mic-permission slide */
  interactive?: "mic";
  /** identity-keyed role: 'intro' opens a deck, 'cta' closes Deck A into registration */
  role?: "intro" | "cta";
  /** primary-button label (design text). Defaults to "आगे" when omitted. */
  nextLabel?: string;
  /** the two voice choices on a confirm slide (routed through the F02 confirm ladder) */
  confirm?: [DeckSlideChoice, DeckSlideChoice];
  /**
   * Human description of the reduced-motion STILL / the placeholder frame,
   * until the design artboard replaces it. Never shown to the pandit.
   */
  endState: string;
}

// ─────────────────────────────────────────────────────────────
// DECK A — सफलता की पहली सीढ़ी (pre-registration, 9 slides)
// ─────────────────────────────────────────────────────────────
export const DECK_A: readonly DeckSlide[] = [
  {
    id: "A0",
    deck: "A",
    headline: "हमारे पंडित जी",
    // repo-approved स्वागत (strings.ts voiceIntro) + the design's जानें/स्किप ask.
    say: "नमस्ते पंडित जी। हमारे पंडित जी पर आपका बहुत-बहुत स्वागत है। यह प्लेटफ़ॉर्म आपके लिए ही बना है। हमारा मूल मंत्र याद रखिए — ऐप पंडित जी के लिए है, पंडित जी ऐप के लिए नहीं। आगे जानने के लिए 'जानें' बोलिए, सीधे पंजीकरण के लिए 'स्किप'।",
    inMock: ["हमारे पंडित जी", "🌼 🌸 🌼"],
    role: "intro",
    nextLabel: "जानें",
    confirm: [
      { label: "जानें", hint: "proceed" },
      { label: "स्किप करें", hint: "skip" },
    ],
    endState: "शिष्य orb centred, marigold garland (Toran) above, two-choice pills जानें / स्किप करें resting.",
  },
  {
    id: "A1",
    deck: "A",
    headline: "पूरी कमाई आपकी",
    say: "सबसे पहले आपकी आमदनी। हर पूजा की दक्षिणा आप स्वयं तय कीजिए — और पूरी की पूरी दक्षिणा आपकी। एक भी रुपया नहीं कटेगा।",
    inMock: ["सत्यनारायण कथा", "कल · सुबह 9:00", "दक्षिणा", "₹5,100", "स्वीकार", "पूरी दक्षिणा · कटौती नहीं"],
    endState: "Booking card with स्वीकार tapped → brass coins fall into a purse → ₹5,100 counts up → 'कटौती नहीं' glow.",
  },
  {
    id: "A2",
    deck: "A",
    headline: "मोल-भाव समाप्त",
    say: "दक्षिणा पहले से तय — अब कोई मोल-भाव नहीं। आपका सम्मान और आपका समय, दोनों सुरक्षित।",
    inMock: ["तय दक्षिणा · मोल-भाव समाप्त", "₹5,100 तय", "₹4,000?", "यजमान", "पंडित जी"],
    endState: "Fixed ₹5,100 tag stamped; the yajman's counter-offer ₹4,000? crossed out (✂️ mol-bhav samapt).",
  },
  {
    id: "A3",
    deck: "A",
    headline: "बराबर · पूरी दक्षिणा",
    say: "जो दक्षिणा दिखेगी, पूरी की पूरी वही आपको मिलेगी — और भुगतान सीधे आपके यूपीआई पर।",
    inMock: ["दक्षिणा दिखी", "₹5,100", "आपको मिली", "₹5,100", "बराबर · पूरी दक्षिणा", "यूपीआई 💰"],
    endState: "Two equal ₹5,100 columns (दिखी = मिली) with an equals bar, UPI badge — nothing lost between them.",
  },
  {
    id: "A4",
    deck: "A",
    headline: "आवाज़ से सब कुछ",
    say: "पूरा ऐप आपकी आवाज़ से चलता है — हर उत्तर बोलकर दीजिए। और जब चाहें, कीबोर्ड भी है।",
    inMock: ["बस बोलिए", "पूजा का नाम", "सत्यनारायण कथा"],
    interactive: "mic",
    endState: "Mic pulses → sound waves → the spoken पूजा का नाम lands as a chip in a field → green tick.",
  },
  {
    id: "A5",
    deck: "A",
    headline: "अपना कैलेंडर",
    say: "जिस दिन उपलब्ध न हों, वह दिन बंद कर दीजिए — एक ही दिन दो बुकिंग का ख़तरा समाप्त।",
    inMock: ["अपना कैलेंडर", "जुलाई 2026", "🎙 21 बंद कीजिए", "21 · अनुपलब्ध", "📩 नई बुकिंग"],
    endState: "Calendar; the 21st is voice-closed (● → ✕), a would-be booking on that day is turned away.",
  },
  {
    id: "A6",
    deck: "A",
    headline: "वीडियो सत्यापन",
    say: "हर पूजा के लिए आपका वीडियो सत्यापन — यजमान देखेंगे कि आप प्रमाणित हैं। यही विश्वास आपकी पहचान है।",
    inMock: ["वीडियो सत्यापन", "पं. रमेश शर्मा", "वाराणसी", "✓ प्रमाणित"],
    endState: "Record → upload → a verified stamp settles over पं. रमेश शर्मा's card → trust-shield shimmer.",
  },
  {
    id: "A7",
    deck: "A",
    headline: "चार वचन",
    say: "हमारे चार वचन — सम्मान, सुविधा, सुरक्षा, समृद्धि।",
    inMock: ["चार वचन", "सम्मान", "सुविधा", "सुरक्षा", "समृद्धि"],
    endState: "Four seals (सम्मान · सुविधा · सुरक्षा · समृद्धि) press in one by one, marigolds framing them.",
  },
  {
    id: "A8",
    deck: "A",
    headline: "अब आपकी बारी",
    say: "यह था हमारे पंडित जी का परिचय। क्या आप पंजीकरण शुरू करना चाहेंगे? 'हाँ' बोलिए या 'बाद में'।",
    inMock: ["अब आपकी बारी", "शुरू कीजिए", "बाद में", "🌼 🌸 🌼"],
    role: "cta",
    nextLabel: "शुरू कीजिए",
    confirm: [
      { label: "हाँ", hint: "proceed" },
      { label: "बाद में", hint: "skip" },
    ],
    endState: "Celebration petals; two-choice शुरू कीजिए / बाद में — both roads lead to पंजीकरण, no dead end.",
  },
] as const;

// ─────────────────────────────────────────────────────────────
// DECK B — App चलाना सीखिए (post-registration, first होम, 5 slides)
// ─────────────────────────────────────────────────────────────
export const DECK_B: readonly DeckSlide[] = [
  {
    id: "B0",
    deck: "B",
    headline: "चलिए सीखते हैं",
    say: "चलिए आपको ऐप के ज़रूरी काम दिखाते हैं। कभी भी 'स्किप करें' बोल सकते हैं।",
    inMock: ["परिचय"],
    role: "intro",
    endState: "Dimmed home behind; शिष्य bows in front — 'चलिए सीखते हैं'.",
  },
  {
    id: "B1",
    deck: "B",
    headline: "चालू / बंद",
    say: "इस बटन से बुकिंग लेना चालू या बंद कीजिए।",
    inMock: ["काम शुरू करने के लिए दबाएँ", "ऑनलाइन जाएं", "आप ऑनलाइन हैं"],
    endState: "Spotlight on the real online/offline toggle; it flips ऑफलाइन → 'आप ऑनलाइन हैं', rest dimmed.",
  },
  {
    id: "B2",
    deck: "B",
    headline: "नई बुकिंग विनती",
    say: "नई बुकिंग की सूचना आएगी — विवरण सुनिए, फिर 'स्वीकार' दबाइए।",
    inMock: ["🔔 नई बुकिंग विनती!", "श्री अनिल गुप्ता", "गृह प्रवेश पूजा", "18 जुलाई · सुबह 8:00", "आपको मिलेंगे", "₹5,600", "स्वीकार"],
    endState: "A booking-request card rings in; spotlight the स्वीकार button (press-and-hold hint).",
  },
  {
    id: "B3",
    deck: "B",
    headline: "इस महीने की कमाई",
    say: "रोज़ाना और महीने की आमदनी यहाँ देखिए — हर पूजा की पूरी दक्षिणा, साफ़-साफ़।",
    inMock: ["💰 कमाई", "इस महीने की कमाई", "मिल गया — पूरी दक्षिणा", "नवग्रह शांति", "₹8,100", "सत्यनारायण कथा", "₹5,600", "मुंडन संस्कार", "₹3,500"],
    endState: "Earnings list with each पूजा's FULL dakshina credited (मिल गया — पूरी दक्षिणा), no deduction line.",
  },
  {
    id: "B4",
    deck: "B",
    headline: "हो गया!",
    say: "अब आप बुकिंग लेना शुरू कर सकते हैं। किसी भी समय 'सहायता' से यह ट्यूटोरियल दोबारा देख सकते हैं।",
    inMock: ["समापन", "सहायता", "हो गया! 🙏", "ठीक है"],
    role: "cta",
    nextLabel: "ठीक है",
    endState: "Petals + folded hands; a pointer to 'सहायता' where the tutorial can be replayed.",
  },
] as const;

/** Both decks, keyed by id — the DeckPlayer/flow look up a deck by its letter. */
export const DECKS: Record<DeckId, readonly DeckSlide[]> = {
  A: DECK_A,
  B: DECK_B,
};

export const DECK_A_TOTAL = DECK_A.length; // 9
export const DECK_B_TOTAL = DECK_B.length; // 5
