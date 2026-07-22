"use client";

// ─────────────────────────────────────────────────────────────
// S6 — शिष्य's BRAIN v1. Deterministic, curated, safe: 34 question
// intents a real pandit actually asks, loose-matched (Q4 rules) on
// keyword sets. Runs LAST in the transcript pipeline — after fields,
// screen commands, visible options, and the global grammar — so a
// question never shadows an action. Answers are SPOKEN (≤2 sentences,
// warm), never navigate, never mutate state; every answer routes
// through t() like all copy (keys shishya.faq.*).
//
// v1 KNOWN LIMIT: keyword sets match Hindi + Latin transliteration
// only; per-language keyword extensions ride the same table later.
// Money/Aadhaar answers are grounded in repo facts (constants.ts
// ₹12/km; founder 2026-07-21: pandit keeps 100%, platform fee is a
// separate customer-paid charge; tutorial 24h; onboarding
// doneVoice ~1 day verification) — never invented.
// ─────────────────────────────────────────────────────────────

import { t, getActiveLang } from "@/lib/i18n";
import { matchWord } from "@/lib/voiceGrammar";
import { api } from "@/lib/api";

// T4 SYNC CONTRACT: the ids/keywords below mirror the server table in
// services/api/src/lib/shishyaFacts.ts (which also owns the LLM fact
// sheet). Change an intent here → change it there.

/** T4: the server brain — curated re-check + Sarvam LLM under the
 *  fact-sheet prompt + 7d cache. Resolves {source:'miss'} on ANY
 *  failure; never throws. */
export async function askShishyaServer(
  text: string,
): Promise<{ answer?: string; source: string }> {
  const route = typeof window !== "undefined" ? window.location.pathname : "";
  const res = await api("/shishya/ask", {
    method: "POST",
    body: JSON.stringify({ text: text.slice(0, 300), route, lang: getActiveLang() }),
    timeoutMs: 8000,
  });
  if (res.success && res.data) return res.data as { answer?: string; source: string };
  return { source: "miss" };
}

export interface BrainIntent {
  id: string;
  keywords: readonly string[];
  answer: () => string;
}

const intent = (id: string, keywords: readonly string[]): BrainIntent => ({
  id,
  keywords,
  answer: () => t(`shishya.faq.${id}`),
});

// Order matters: more specific asks sit ABOVE broader cousins
// (पैसा-नहीं-आया before पैसा-कब; दाम-बदलना before दक्षिणा-कौन).
export const BRAIN_INTENTS: readonly BrainIntent[] = [
  intent("paymentMissing", ["पैसा नहीं आया", "पैसा नहीं मिला", "पेमेंट नहीं आया", "paisa nahi aaya", "payment nahi"]),
  intent("paymentWhen", ["पैसा कब", "कब मिलेगा पैसा", "पैसे कब", "भुगतान कब", "पेमेंट कब", "paisa kab", "kab milega"]),
  intent("paymentHow", ["पैसा कैसे मिलेगा", "पैसा कैसे आएगा", "पैसा कैसे", "पैसे कैसे", "भुगतान कैसे", "खाते में कैसे", "paisa kaise"]),
  intent("commission", ["कमीशन", "कटौती", "कितना काटते", "कितना काटोगे", "हिस्सा कितना", "commission", "katauti"]),
  intent("changePrice", ["दाम कैसे बदल", "दाम बदलना", "दक्षिणा बदल", "रेट बदल", "कीमत बदल", "daam badal", "rate badal"]),
  intent("dakshinaWho", ["दक्षिणा कौन", "दाम कौन तय", "कीमत कौन", "दक्षिणा कैसे तय", "मोलभाव", "dakshina kaun", "molbhav"]),
  intent("samagriMoney", ["सामग्री का पैसा", "सामग्री के पैसे", "सामान का पैसा", "samagri ka paisa"]),
  intent("samagriPackage", ["सामग्री पैकेज", "पैकेज क्या", "सामग्री क्या होता", "samagri package"]),
  intent("travel", ["यात्रा भत्ता", "किराया कौन", "पेट्रोल", "गाड़ी का खर्च", "आने जाने का", "किलोमीटर", "yatra bhatta", "petrol", "kiraya"]),
  intent("foodAllowance", ["खाने का भत्ता", "भोजन भत्ता", "खाना कौन देगा", "खाने का पैसा", "khane ka"]),
  intent("bookingHow", ["बुकिंग कैसे आएगी", "बुकिंग कैसे मिलेगी", "काम कैसे मिलेगा", "बुकिंग कहाँ से", "booking kaise"]),
  intent("bookingRefuse", ["मना कर सकते", "बुकिंग मना", "अस्वीकार कर सकते", "इनकार कर", "mana kar sakte"]),
  intent("bookingWhere", ["बुकिंग कहाँ देखूँ", "बुकिंग कहाँ है", "मेरी बुकिंग कहाँ", "booking kahan"]),
  intent("earningsWhere", ["कमाई कहाँ", "कमाई कैसे देखूँ", "हिसाब कहाँ", "kamai kahan"]),
  intent("customerCancel", ["ग्राहक ने रद्द", "ग्राहक मना कर", "बुकिंग रद्द हो गई", "cancel kar diya"]),
  intent("calendarHoliday", ["छुट्टी कैसे", "छुट्टी कर", "तारीख़ बंद", "तारीख बंद", "उस दिन नहीं", "chhutti kaise"]),
  intent("onlineOffline", ["ऑनलाइन ऑफलाइन क्या", "ऑनलाइन का मतलब", "ऑफलाइन का मतलब", "हरा बटन क्या", "online ka matlab", "offline ka matlab"]),
  intent("verifyWhy", ["सत्यापन क्यों", "वेरिफिकेशन क्यों", "जांच क्यों", "verification kyu", "satyapan kyu"]),
  intent("verifyHowLong", ["सत्यापन कितना समय", "सत्यापन कब तक", "वेरिफिकेशन कब", "कितने दिन में सत्यापन", "verification kab"]),
  intent("videoVerify", ["वीडियो सत्यापन", "वीडियो कॉल क्यों", "video verification", "video call"]),
  intent("aadhaarSafe", ["आधार सुरक्षित", "आधार क्यों", "आधार माँग", "आधार मांग", "आधार का क्या कर", "aadhaar kyu", "aadhar kyu", "aadhaar surakshit"]),
  intent("appFree", ["ऐप मुफ़्त", "ऐप मुफ्त", "ऐप फ्री", "पैसे लगेंगे क्या", "फीस कितनी", "app free", "fees kitni"]),
  intent("whoseApp", ["ये ऐप किसका", "ऐप किसने बनाया", "कंपनी कौन", "ये ऐप क्या है", "app kiska", "app kya hai"]),
  intent("whoAreYou", ["तुम कौन हो", "आप कौन हो", "तू कौन", "शिष्य कौन", "tum kaun", "aap kaun", "shishya kaun"]),
  intent("changeLanguage", ["भाषा कैसे बदल", "भाषा बदलनी", "दूसरी भाषा", "मराठी में", "bhasha badal"]),
  intent("voiceOff", ["आवाज़ बंद कैसे", "आवाज बंद कैसे", "बोलना बंद", "चुप कैसे कर", "awaz band"]),
  intent("helpPhone", ["फ़ोन नंबर क्या", "फोन नंबर", "किससे बात", "टीम से बात", "बात करनी है", "phone number", "baat karni"]),
  intent("addPooja", ["नई पूजा कैसे", "पूजा कैसे जोड़", "पूजा जोड़नी", "nayi pooja kaise", "pooja jod"]),
  intent("whoSeesProfile", ["प्रोफ़ाइल कौन देख", "प्रोफाइल कौन देख", "ग्राहक क्या देख", "मेरा क्या दिखता", "profile kaun dekh"]),
  intent("rating", ["रेटिंग क्या", "तारे क्या", "सितारे क्या", "स्टार क्या", "rating kya"]),
  intent("fraud", ["धोखा", "फ्रॉड", "भरोसा कैसे", "गारंटी क्या", "विश्वास कैसे", "dhokha", "fraud", "bharosa"]),
  intent("deleteAccount", ["खाता हटा", "खाता बंद कर", "अकाउंट डिलीट", "account delete", "khata band"]),
  intent("otpWhat", ["ओटीपी क्या", "ओटीपी नहीं आया", "otp kya", "otp nahi aaya"]),
  intent("micWhy", ["माइक क्यों", "माइक की अनुमति क्यों", "सुनने की अनुमति", "mic kyu", "mike kyu"]),
];

/** First matching curated intent, or null. Caller guarantees the
 *  transcript already failed fields/commands/options/global grammar. */
export function matchBrainIntent(text: string): BrainIntent | null {
  for (const it of BRAIN_INTENTS) {
    if (matchWord(text, it.keywords)) return it;
  }
  return null;
}

// S6b: "where am I / what is this screen" → the active screen's
// helpLine (registry helpText). Checked AFTER curated intents so
// "ये ऐप क्या है" still gets its specific answer. Every phrase is
// SCREEN-ANCHORED — a bare "क्या करूँ" ("मेरी बकरी बीमार है क्या
// करूँ") must fall through to the honest miss, never get a screen
// explanation it did not ask for.
const SCREEN_CONTEXT = [
  "ये क्या है", "यह क्या है", "ये कौन सी स्क्रीन", "स्क्रीन क्या", "इस स्क्रीन",
  "यहाँ क्या करूँ", "यहाँ क्या करना", "इसमें क्या करना", "अब क्या करूँ",
  "कहाँ हूँ", "कहां हूं", "कहाँ हूं",
  "ye kya hai", "yahan kya karu", "ab kya karu", "kahan hu",
] as const;

export function isScreenContextAsk(text: string): boolean {
  return matchWord(text, SCREEN_CONTEXT) !== null;
}

// S6c: question-shaped = deserves the honest miss (+ telemetry), not
// the terse "समझ नहीं आया". Hindi interrogatives, their Latin forms,
// or a literal question mark.
const QUESTION_RE =
  /क्या|कब|कैसे|क्यों|क्यूँ|कौन|कितन|कहाँ|कहां|\?|(^|[^a-z])(kya|kab|kaise|kyu|kyun|kaun|kitn\w*|kahan)([^a-z]|$)/i;

export function isQuestionShaped(text: string): boolean {
  return QUESTION_RE.test(text.toLowerCase());
}

// S6d: MISS TELEMETRY — the curation queue for brain v2. LocalStorage
// ring (cap 100) + fire-and-forget POST; both must never throw.
const MISS_KEY = "shishya_unanswered";

export function recordUnansweredQuestion(text: string): void {
  const route = typeof window !== "undefined" ? window.location.pathname : "";
  try {
    const raw = localStorage.getItem(MISS_KEY);
    const list: Array<{ text: string; route: string; at: string }> = raw ? JSON.parse(raw) : [];
    list.push({ text: text.slice(0, 300), route, at: new Date().toISOString() });
    while (list.length > 100) list.shift();
    localStorage.setItem(MISS_KEY, JSON.stringify(list));
  } catch { /* telemetry must never break the loop */ }
  void api("/feedback/unanswered", {
    method: "POST",
    body: JSON.stringify({ text: text.slice(0, 300), route }),
  });
}
