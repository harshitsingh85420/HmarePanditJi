// ─────────────────────────────────────────────────────────────
// T4 — शिष्य's FACT SHEET + server-side curated table + the LLM
// system prompt. THE MONEY LAW: every rupee/percent/hour figure the
// agent may utter lives HERE and nowhere else; the LLM is ordered to
// answer money/verification/Aadhaar topics ONLY from this sheet.
//
// SYNC CONTRACT: the curated keywords mirror
// apps/pandit/src/lib/shishyaBrain.ts (client-side, instant, i18n'd
// via strings shishya.faq.*). Change an intent THERE → change it HERE.
// (Cross-runtime sharing through packages/utils is deferred — noted in
// the T4 report; the sync comment in both files is the contract.)
// ─────────────────────────────────────────────────────────────

import { PLATFORM_FEE_PERCENT, SELF_DRIVE_RATE_PER_KM } from "../config/constants";

export const APP_FACTS = {
  // SINGLE SOURCE: the commission शिष्य quotes IS the fee the math charges.
  commissionPercent: PLATFORM_FEE_PERCENT, // 10% platform, 90% pandit
  payoutHours: 24, // after पूजा संपन्न, direct to bank/UPI
  selfDriveRatePerKm: SELF_DRIVE_RATE_PER_KM, // ₹12/km round trip (config/constants.ts)
  dakshinaMin: 501,
  dakshinaMax: 500000,
  verificationDays: 1, // "टीम एक दिन में सत्यापन पूरा करेगी"
} as const;

// The sheet injected into the system prompt — plain Hindi lines the
// model may quote. Keep each line self-contained and checkable.
export const FACTS_SHEET_HI = [
  `दक्षिणा पंडित जी खुद तय करते हैं (₹${APP_FACTS.dakshinaMin} से ₹${APP_FACTS.dakshinaMax.toLocaleString("en-IN")}); ग्राहक से कोई मोलभाव नहीं होता।`,
  `दक्षिणा का ${100 - APP_FACTS.commissionPercent}% पंडित जी का है; प्लेटफ़ॉर्म केवल ${APP_FACTS.commissionPercent}% सेवा-शुल्क पूरी दक्षिणा पर लेता है (इसमें बाकी पंडितों की दक्षिणा भी शामिल होती है)।`,
  // AD2 SINGLE-PAYEE LAW: assistant pandits are the main pandit's own —
  // the platform never registers, verifies, pays, or contacts them.
  "सहायक पंडितों का प्रबंध और भुगतान मुख्य पंडित जी स्वयं करते हैं — प्लेटफ़ॉर्म सीधे उनसे लेन-देन नहीं करता। किसी पूजा की कुल दक्षिणा में बाकी पंडितों की दक्षिणा भी शामिल होती है, जो मुख्य पंडित जी उन्हें देते हैं।",
  `पूजा संपन्न होने के ${APP_FACTS.payoutHours} घंटे के अंदर पैसा सीधे पंडित जी के बैंक खाते या यूपीआई में आता है।`,
  `अपनी गाड़ी से जाने पर ₹${APP_FACTS.selfDriveRatePerKm} प्रति किलोमीटर (आना-जाना) यात्रा भत्ता मिलता है; ट्रेन/बस का इंतज़ाम बुकिंग के साथ तय होता है।`,
  "भोजन की दैनिक राशि पंडित जी तैयारी के चौथे चरण में खुद भरते हैं।",
  "सामग्री पंडित जी लाएँ तो उसका दाम भी वही तय करते हैं; वह राशि कमाई में जुड़ती है।",
  `सत्यापन टीम लगभग ${APP_FACTS.verificationDays} दिन में पूरा करती है; आधार केवल सत्यापन के लिए है, सुरक्षित रहता है, किसी ग्राहक को कभी नहीं दिखता।`,
  "ग्राहक का पैसा पहले प्लेटफ़ॉर्म के पास सुरक्षित रहता है और पूजा पूरी होने पर पंडित जी को मिलता है।",
  "ऐप पूरी तरह मुफ़्त है — न जुड़ने का शुल्क, न चलाने का। कोई एडवांस या जमा राशि कभी नहीं माँगी जाती।",
  "हर बुकिंग स्वीकार या अस्वीकार करना पंडित जी के अपने हाथ में है।",
  "किसी भी समस्या के लिए ऐप के मदद वाले हिस्से से टीम को सीधे फ़ोन किया जा सकता है।",
] as const;

export function buildSystemPrompt(lang: string): string {
  return [
    "आप 'शिष्य' हैं — हमारे पंडित जी ऐप के विनम्र सहायक। उपयोगकर्ता पंडित जी हैं — वे आपके गुरु समान हैं; सदा आदर से, गर्मजोशी से बोलें।",
    "",
    "तथ्य-पत्र (यही एकमात्र सत्य है):",
    ...FACTS_SHEET_HI.map((f) => `- ${f}`),
    "",
    "नियम (कभी न तोड़ें):",
    "1. पैसे, कमीशन, भुगतान, सत्यापन या आधार के बारे में केवल ऊपर के तथ्य-पत्र से उत्तर दें। तथ्य-पत्र में उत्तर न हो तो कहें: 'इसके लिए मदद वाले हिस्से से हमारी टीम को फ़ोन कर लीजिए।'",
    "2. कोई भी संख्या, प्रतिशत, राशि या वादा कभी अपने से न गढ़ें।",
    "3. अधिकतम दो छोटे वाक्य। बोलने के लिए लिखें — सूची, तारांकन या अंग्रेज़ी तकनीकी शब्द नहीं।",
    "4. ऐप में कहीं जाने के निर्देश न दें (कोई 'यहाँ दबाइए' नहीं) — बस सवाल का उत्तर दें।",
    "5. चिकित्सा, क़ानूनी या राजनीतिक राय कभी नहीं — विनम्रता से टाल दें ('यह मेरे बस की बात नहीं, पंडित जी')।",
    "6. आपसे पूछें कि आप कौन हैं, तो सच कहें: आप ऐप के सहायक हैं, इंसान नहीं।",
    lang && lang !== "hi"
      ? `7. उत्तर '${lang}' भाषा में दें (वही दो-वाक्य नियम)।`
      : "",
  ]
    .filter(Boolean)
    .join("\n");
}

// Server-side curated table — same ids/keywords as the client
// (shishyaBrain.ts); answers in Hindi. Serves only questions the
// CLIENT's matcher missed (keyword drift) — a cheap second net before
// the LLM spends tokens.
export interface CuratedEntry {
  id: string;
  keywords: readonly string[];
  answer: string;
}

export const CURATED_HI: readonly CuratedEntry[] = [
  { id: "paymentMissing", keywords: ["पैसा नहीं आया", "पैसा नहीं मिला", "पेमेंट नहीं आया", "paisa nahi aaya"], answer: `पूजा पूरी होने के ${APP_FACTS.payoutHours} घंटे बाद भी पैसा न आए, तो मदद वाले हिस्से से हमारी टीम को फ़ोन कीजिए — तुरंत देखा जाएगा।` },
  { id: "paymentHow", keywords: ["पैसा कैसे मिलेगा", "पैसा कैसे आएगा", "पैसा कैसे", "भुगतान कैसे", "paisa kaise"], answer: `आपकी कमाई पूजा संपन्न होने के ${APP_FACTS.payoutHours} घंटे के अंदर सीधे आपके बैंक खाते या यूपीआई में आती है।` },
  { id: "paymentWhen", keywords: ["पैसा कब", "कब मिलेगा पैसा", "भुगतान कब", "पेमेंट कब", "paisa kab"], answer: `पूजा संपन्न होने के ${APP_FACTS.payoutHours} घंटे के अंदर पैसा सीधे आपके बैंक खाते में आ जाता है।` },
  { id: "commission", keywords: ["कमीशन", "कटौती", "कितना काटते", "कितना काटोगे", "commission"], answer: `दक्षिणा का ${100 - APP_FACTS.commissionPercent} प्रतिशत आपका है — प्लेटफ़ॉर्म केवल ${APP_FACTS.commissionPercent} प्रतिशत सेवा-शुल्क लेता है।` },
  { id: "dakshinaWho", keywords: ["दक्षिणा कौन", "दाम कौन तय", "मोलभाव", "dakshina kaun"], answer: "दक्षिणा आप खुद तय करते हैं, पंडित जी — ग्राहक को वही राशि दिखती है और कोई मोलभाव नहीं होता।" },
  { id: "travel", keywords: ["यात्रा भत्ता", "पेट्रोल", "किराया कौन", "किलोमीटर", "yatra bhatta"], answer: `अपनी गाड़ी से जाने पर ₹${APP_FACTS.selfDriveRatePerKm} प्रति किलोमीटर आना-जाना मिलता है; ट्रेन-बस का इंतज़ाम बुकिंग के साथ तय होता है।` },
  { id: "aadhaarSafe", keywords: ["आधार सुरक्षित", "आधार क्यों", "आधार माँग", "aadhaar kyu"], answer: "जी हाँ, आधार पूरी तरह सुरक्षित है — सिर्फ़ सत्यापन के लिए इस्तेमाल होता है और किसी ग्राहक को कभी नहीं दिखता।" },
  { id: "appFree", keywords: ["ऐप मुफ़्त", "ऐप फ्री", "फीस कितनी", "app free"], answer: "ऐप बिल्कुल मुफ़्त है — न जुड़ने का कोई शुल्क, न चलाने का।" },
  { id: "verifyHowLong", keywords: ["सत्यापन कितना समय", "सत्यापन कब तक", "verification kab"], answer: `हमारी टीम आमतौर पर ${APP_FACTS.verificationDays} दिन में सत्यापन पूरा कर देती है — पूरा होते ही आपको सूचना मिलेगी।` },
  { id: "fraud", keywords: ["धोखा", "फ्रॉड", "भरोसा कैसे", "गारंटी", "dhokha"], answer: "ग्राहक का पैसा पहले प्लेटफ़ॉर्म के पास सुरक्षित रहता है और पूजा पूरी होने पर आपको मिलता है — इसीलिए दोनों तरफ़ भरोसा बना रहता है।" },
  // AD2: the team question — single-payee, main pandit manages his own.
  { id: "teamPayout", keywords: ["बाकी पंडित", "सहायक पंडित", "दूसरे पंडित", "टीम को कौन", "team payout", "assistant pandit"], answer: "सहायक पंडितों का प्रबंध और भुगतान आप स्वयं करते हैं, पंडित जी — प्लेटफ़ॉर्म सीधे उनसे लेन-देन नहीं करता। कुल दक्षिणा में उनकी दक्षिणा भी शामिल होती है, जो आप उन्हें देते हैं।" },
] as const;

/** Loose containment match, longest keyword first (mirrors the client
 *  matcher's semantics for Devanagari; Latin needs word boundaries). */
export function matchCurated(text: string): CuratedEntry | null {
  const clean = text.toLowerCase().trim();
  if (!clean) return null;
  for (const entry of CURATED_HI) {
    const byLength = [...entry.keywords].sort((a, b) => b.length - a.length);
    for (const kw of byLength) {
      const k = kw.toLowerCase();
      if (/^[a-z0-9 ]+$/.test(k)) {
        if (new RegExp(`(^|[^a-z0-9])${k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}([^a-z0-9]|$)`).test(clean)) return entry;
      } else if (clean.includes(k)) {
        return entry;
      }
    }
  }
  return null;
}
