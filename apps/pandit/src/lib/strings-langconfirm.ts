// Native-language strings for the language steps of the entry flow.
// Each language speaks FOR ITSELF: the confirm question, its two button
// labels, the "one moment" wait line shown while its translation bundle
// downloads, the spoken confirmation once the switch succeeds, and the
// honesty notice spoken when translation is unavailable (the app then
// continues in Hindi). These are the ONLY hardcoded per-language lines —
// everything else flows through t() and the Sarvam-translated bundle.

import type { LangCode } from "./languageDetect";

export interface LangConfirmStrings {
  confirmQuestion: string;
  yesLabel: string;
  otherLabel: string;
  /** Shown under the DiyaLoader while the language bundle downloads. */
  waitLine: string;
  /** Spoken (in the chosen language) once the switch succeeds. */
  confirmedLine: string;
  /** Honesty rule: spoken when translation is unavailable; app stays Hindi. */
  fallbackNotice: string;
}

export const LANG_CONFIRM: Record<LangCode, LangConfirmStrings> = {
  hi: {
    confirmQuestion: "हमने आपके क्षेत्र की भाषा हिन्दी पहचानी — इसी में चलें या बदलें?",
    yesLabel: "हाँ, हिन्दी ठीक है",
    // FOUNDER REGISTER LAW: a user-facing button command → -इए form
    otherLabel: "दूसरी भाषा चुनिए",
    waitLine: "एक क्षण…",
    confirmedLine: "हिन्दी तैयार है — चलिए शुरू करें।",
    fallbackNotice: "अनुवाद अभी उपलब्ध नहीं — हिंदी में चलते हैं।",
  },
  mr: {
    confirmQuestion: "तुम्हाला मराठीत बोलायला आवडेल का?",
    yesLabel: "हो, मराठी चालेल",
    otherLabel: "दुसरी भाषा निवडा",
    waitLine: "एक क्षण थांबा…",
    confirmedLine: "छान! आता आपण मराठीत बोलू.",
    fallbackNotice: "भाषांतर सध्या उपलब्ध नाही — आपण हिंदीत पुढे जाऊ.",
  },
  bn: {
    confirmQuestion: "আপনি কি বাংলায় কথা বলতে চান?",
    yesLabel: "হ্যাঁ, বাংলা ঠিক আছে",
    otherLabel: "অন্য ভাষা বেছে নিন",
    waitLine: "এক মুহূর্ত…",
    confirmedLine: "চমৎকার! এখন আমরা বাংলায় কথা বলব।",
    fallbackNotice: "অনুবাদ এখন উপলব্ধ নেই — আমরা হিন্দিতে চালিয়ে যাব।",
  },
  ta: {
    confirmQuestion: "நீங்கள் தமிழில் பேச விரும்புகிறீர்களா?",
    yesLabel: "ஆம், தமிழ் சரி",
    otherLabel: "வேறு மொழி தேர்வு",
    waitLine: "ஒரு கணம்…",
    confirmedLine: "அருமை! இனி நாம் தமிழில் பேசுவோம்.",
    fallbackNotice: "மொழிபெயர்ப்பு இப்போது கிடைக்கவில்லை — இந்தியில் தொடர்வோம்.",
  },
  te: {
    confirmQuestion: "మీరు తెలుగులో మాట్లాడాలనుకుంటున్నారా?",
    yesLabel: "అవును, తెలుగు సరే",
    otherLabel: "వేరే భాష ఎంచుకోండి",
    waitLine: "ఒక్క క్షణం…",
    confirmedLine: "చాలా బాగుంది! ఇప్పుడు మనం తెలుగులో మాట్లాడుకుందాం.",
    fallbackNotice: "అనువాదం ప్రస్తుతం అందుబాటులో లేదు — హిందీలో కొనసాగుదాం.",
  },
  kn: {
    confirmQuestion: "ನೀವು ಕನ್ನಡದಲ್ಲಿ ಮಾತನಾಡಲು ಬಯಸುವಿರಾ?",
    yesLabel: "ಹೌದು, ಕನ್ನಡ ಸರಿ",
    otherLabel: "ಬೇರೆ ಭಾಷೆ ಆರಿಸಿ",
    waitLine: "ಒಂದು ಕ್ಷಣ…",
    confirmedLine: "ಚೆನ್ನಾಗಿದೆ! ಇನ್ನು ನಾವು ಕನ್ನಡದಲ್ಲಿ ಮಾತನಾಡೋಣ.",
    fallbackNotice: "ಅನುವಾದ ಸದ್ಯ ಲಭ್ಯವಿಲ್ಲ — ಹಿಂದಿಯಲ್ಲಿ ಮುಂದುವರಿಯೋಣ.",
  },
  gu: {
    confirmQuestion: "શું તમે ગુજરાતીમાં વાત કરવા માંગો છો?",
    yesLabel: "હા, ગુજરાતી બરાબર છે",
    otherLabel: "બીજી ભાષા પસંદ કરો",
    waitLine: "એક ક્ષણ…",
    confirmedLine: "સરસ! હવે આપણે ગુજરાતીમાં વાત કરીશું.",
    fallbackNotice: "અનુવાદ હમણાં ઉપલબ્ધ નથી — આપણે હિન્દીમાં આગળ વધીશું.",
  },
  pa: {
    confirmQuestion: "ਕੀ ਤੁਸੀਂ ਪੰਜਾਬੀ ਵਿੱਚ ਗੱਲ ਕਰਨਾ ਚਾਹੋਗੇ?",
    yesLabel: "ਹਾਂ, ਪੰਜਾਬੀ ਠੀਕ ਹੈ",
    otherLabel: "ਹੋਰ ਭਾਸ਼ਾ ਚੁਣੋ",
    waitLine: "ਇੱਕ ਪਲ…",
    confirmedLine: "ਵਧੀਆ! ਹੁਣ ਅਸੀਂ ਪੰਜਾਬੀ ਵਿੱਚ ਗੱਲ ਕਰਾਂਗੇ।",
    fallbackNotice: "ਅਨੁਵਾਦ ਹੁਣੇ ਉਪਲਬਧ ਨਹੀਂ — ਅਸੀਂ ਹਿੰਦੀ ਵਿੱਚ ਜਾਰੀ ਰੱਖਾਂਗੇ।",
  },
  ml: {
    confirmQuestion: "നിങ്ങൾ മലയാളത്തിൽ സംസാരിക്കാൻ ആഗ്രഹിക്കുന്നുവോ?",
    yesLabel: "അതെ, മലയാളം മതി",
    otherLabel: "മറ്റൊരു ഭാഷ തിരഞ്ഞെടുക്കുക",
    waitLine: "ഒരു നിമിഷം…",
    confirmedLine: "കൊള്ളാം! ഇനി നമുക്ക് മലയാളത്തിൽ സംസാരിക്കാം.",
    fallbackNotice: "വിവർത്തനം ഇപ്പോൾ ലഭ്യമല്ല — നമുക്ക് ഹിന്ദിയിൽ തുടരാം.",
  },
  or: {
    confirmQuestion: "ଆପଣ ଓଡ଼ିଆରେ କଥା ହେବାକୁ ଚାହାଁନ୍ତି କି?",
    yesLabel: "ହଁ, ଓଡ଼ିଆ ଠିକ୍ ଅଛି",
    otherLabel: "ଅନ୍ୟ ଭାଷା ବାଛନ୍ତୁ",
    waitLine: "ଗୋଟିଏ ମୁହୂର୍ତ୍ତ…",
    confirmedLine: "ବହୁତ ଭଲ! ଏବେ ଆମେ ଓଡ଼ିଆରେ କଥା ହେବା।",
    fallbackNotice: "ଅନୁବାଦ ବର୍ତ୍ତମାନ ଉପଲବ୍ଧ ନାହିଁ — ଆମେ ହିନ୍ଦୀରେ ଆଗକୁ ବଢ଼ିବା।",
  },
  en: {
    confirmQuestion: "Would you like to continue in English?",
    yesLabel: "Yes, English is fine",
    otherLabel: "Choose another language",
    waitLine: "One moment…",
    confirmedLine: "Great! We will continue in English.",
    fallbackNotice: "Translation is not available right now — we will continue in Hindi.",
  },
};
