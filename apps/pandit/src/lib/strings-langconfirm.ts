// Native-language strings for the language-confirm step of the entry flow.
// Each language speaks FOR ITSELF: the confirm question, its two button
// labels, and the v1 coming-soon line (spoken when a non-Hindi language is
// chosen; the app then continues in Hindi). Short, warm, simple sentences.

import type { LangCode } from "./languageDetect";

export interface LangConfirmStrings {
  confirmQuestion: string;
  yesLabel: string;
  otherLabel: string;
  comingSoonLine: string;
}

export const LANG_CONFIRM: Record<LangCode, LangConfirmStrings> = {
  hi: {
    confirmQuestion: "क्या आप हिन्दी में बात करना चाहेंगे?",
    yesLabel: "हाँ, हिन्दी ठीक है",
    otherLabel: "दूसरी भाषा चुनें",
    comingSoonLine: "हिन्दी तैयार है — चलिए शुरू करें।",
  },
  mr: {
    confirmQuestion: "तुम्हाला मराठीत बोलायला आवडेल का?",
    yesLabel: "हो, मराठी चालेल",
    otherLabel: "दुसरी भाषा निवडा",
    comingSoonLine: "मराठी लवकरच येत आहे। तोपर्यंत आपण हिन्दीत बोलू।",
  },
  bn: {
    confirmQuestion: "আপনি কি বাংলায় কথা বলতে চান?",
    yesLabel: "হ্যাঁ, বাংলা ঠিক আছে",
    otherLabel: "অন্য ভাষা বেছে নিন",
    comingSoonLine: "বাংলা শীঘ্রই আসছে। ততদিন আমরা হিন্দিতে কথা বলব।",
  },
  ta: {
    confirmQuestion: "நீங்கள் தமிழில் பேச விரும்புகிறீர்களா?",
    yesLabel: "ஆம், தமிழ் சரி",
    otherLabel: "வேறு மொழி தேர்வு",
    comingSoonLine: "தமிழ் விரைவில் வருகிறது. அதுவரை இந்தியில் பேசுவோம்.",
  },
  te: {
    confirmQuestion: "మీరు తెలుగులో మాట్లాడాలనుకుంటున్నారా?",
    yesLabel: "అవును, తెలుగు సరే",
    otherLabel: "వేరే భాష ఎంచుకోండి",
    comingSoonLine: "తెలుగు త్వరలో వస్తుంది. అప్పటివరకు హిందీలో మాట్లాడుకుందాం.",
  },
  kn: {
    confirmQuestion: "ನೀವು ಕನ್ನಡದಲ್ಲಿ ಮಾತನಾಡಲು ಬಯಸುವಿರಾ?",
    yesLabel: "ಹೌದು, ಕನ್ನಡ ಸರಿ",
    otherLabel: "ಬೇರೆ ಭಾಷೆ ಆರಿಸಿ",
    comingSoonLine: "ಕನ್ನಡ ಶೀಘ್ರದಲ್ಲೇ ಬರುತ್ತಿದೆ. ಅಲ್ಲಿಯವರೆಗೆ ಹಿಂದಿಯಲ್ಲಿ ಮಾತನಾಡೋಣ.",
  },
  gu: {
    confirmQuestion: "શું તમે ગુજરાતીમાં વાત કરવા માંગો છો?",
    yesLabel: "હા, ગુજરાતી બરાબર છે",
    otherLabel: "બીજી ભાષા પસંદ કરો",
    comingSoonLine: "ગુજરાતી જલ્દી આવી રહી છે. ત્યાં સુધી આપણે હિન્દીમાં વાત કરીશું.",
  },
  pa: {
    confirmQuestion: "ਕੀ ਤੁਸੀਂ ਪੰਜਾਬੀ ਵਿੱਚ ਗੱਲ ਕਰਨਾ ਚਾਹੋਗੇ?",
    yesLabel: "ਹਾਂ, ਪੰਜਾਬੀ ਠੀਕ ਹੈ",
    otherLabel: "ਹੋਰ ਭਾਸ਼ਾ ਚੁਣੋ",
    comingSoonLine: "ਪੰਜਾਬੀ ਜਲਦੀ ਆ ਰਹੀ ਹੈ। ਉਦੋਂ ਤੱਕ ਅਸੀਂ ਹਿੰਦੀ ਵਿੱਚ ਗੱਲ ਕਰਾਂਗੇ।",
  },
  ml: {
    confirmQuestion: "നിങ്ങൾ മലയാളത്തിൽ സംസാരിക്കാൻ ആഗ്രഹിക്കുന്നുവോ?",
    yesLabel: "അതെ, മലയാളം മതി",
    otherLabel: "മറ്റൊരു ഭാഷ തിരഞ്ഞെടുക്കുക",
    comingSoonLine: "മലയാളം ഉടൻ വരുന്നു. അതുവരെ നമുക്ക് ഹിന്ദിയിൽ സംസാരിക്കാം.",
  },
  or: {
    confirmQuestion: "ଆପଣ ଓଡ଼ିଆରେ କଥା ହେବାକୁ ଚାହାଁନ୍ତି କି?",
    yesLabel: "ହଁ, ଓଡ଼ିଆ ଠିକ୍ ଅଛି",
    otherLabel: "ଅନ୍ୟ ଭାଷା ବାଛନ୍ତୁ",
    comingSoonLine: "ଓଡ଼ିଆ ଶୀଘ୍ର ଆସୁଛି। ସେ ପର୍ଯ୍ୟନ୍ତ ଆମେ ହିନ୍ଦୀରେ କଥା ହେବା।",
  },
  en: {
    confirmQuestion: "Would you like to continue in English?",
    yesLabel: "Yes, English is fine",
    otherLabel: "Choose another language",
    comingSoonLine: "English is coming soon. Until then, we will continue in Hindi.",
  },
};
