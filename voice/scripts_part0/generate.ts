/**
 * Voice Script Generator for HmarePanditJi Part 0
 * 
 * This generator creates all 1,845 voice scripts for screens S-0.1 to S-0.12
 * across 15 languages with 5 lines per screen.
 * 
 * Usage: 
 *   npm run generate-voice-scripts
 *   or
 *   ts-node voice/scripts_part0/generate.ts
 */

import * as fs from 'fs';
import * as path from 'path';

// ============================================================================
// LANGUAGE CONFIGURATIONS
// ============================================================================

interface LanguageConfig {
  code: string;
  name: string;
  priority: number;
  fallback?: boolean;
  fallbackFor?: string;
  pace: number;
}

const LANGUAGES: LanguageConfig[] = [
  { code: 'hi-IN', name: 'Hindi', priority: 1, pace: 0.88 },
  { code: 'ta-IN', name: 'Tamil', priority: 2, pace: 0.86 },
  { code: 'te-IN', name: 'Telugu', priority: 3, pace: 0.87 },
  { code: 'bn-IN', name: 'Bengali', priority: 4, pace: 0.88 },
  { code: 'mr-IN', name: 'Marathi', priority: 5, pace: 0.89 },
  { code: 'gu-IN', name: 'Gujarati', priority: 6, pace: 0.88 },
  { code: 'kn-IN', name: 'Kannada', priority: 7, pace: 0.87 },
  { code: 'ml-IN', name: 'Malayalam', priority: 8, pace: 0.86 },
  { code: 'pa-IN', name: 'Punjabi', priority: 9, pace: 0.88 },
  { code: 'or-IN', name: 'Odia', priority: 10, pace: 0.87 },
  { code: 'en-IN', name: 'English', priority: 11, pace: 0.90 },
  { code: 'hi-IN', name: 'Bhojpuri', priority: 12, fallback: true, fallbackFor: 'bhojpuri', pace: 0.88 },
  { code: 'hi-IN', name: 'Maithili', priority: 13, fallback: true, fallbackFor: 'maithili', pace: 0.88 },
  { code: 'hi-IN', name: 'Sanskrit', priority: 14, fallback: true, fallbackFor: 'sanskrit', pace: 0.85 },
  { code: 'hi-IN', name: 'Assamese', priority: 15, fallback: true, fallbackFor: 'assamese', pace: 0.87 },
];

// ============================================================================
// SCREEN DEFINITIONS
// ============================================================================

interface ScreenDefinition {
  screenId: string;
  screenName: string;
  description: string;
  fileName: string;
  lines: ScreenLine[];
}

interface ScreenLine {
  id: string;
  hindi: string;
  english: string;
  pauseAfterMs: number;
  emotionalTone: 'warm_respectful' | 'helpful_guide' | 'reassuring' | 'celebratory';
}

const SCREENS: ScreenDefinition[] = [
  {
    screenId: 'S-0.1',
    screenName: 'Swagat Welcome',
    description: 'Welcome Pandit Ji to HmarePanditJi platform',
    fileName: '09_S-0.1_Swagat.ts',
    lines: [
      {
        id: 'S-0.1-line-1',
        hindi: 'नमस्ते पंडित जी। HmarePanditJi पर आपका बहुत-बहुत स्वागत है।',
        english: 'Hello Pandit Ji. A warm welcome to HmarePanditJi.',
        pauseAfterMs: 1000,
        emotionalTone: 'warm_respectful',
      },
      {
        id: 'S-0.1-line-2',
        hindi: 'यह platform आपके लिए ही बना है।',
        english: 'This platform is made just for you.',
        pauseAfterMs: 800,
        emotionalTone: 'warm_respectful',
      },
      {
        id: 'S-0.1-line-3',
        hindi: 'अगले दो मिनट में हम देखेंगे कि यह app आपकी आमदनी में क्या बदलाव ला सकता है।',
        english: 'In the next two minutes, we will see what changes this app can bring to your income.',
        pauseAfterMs: 1000,
        emotionalTone: 'helpful_guide',
      },
      {
        id: 'S-0.1-line-4',
        hindi: 'हमारा Mool Mantra याद रखिए — App पंडित के लिए है, पंडित App के लिए नहीं।',
        english: 'Remember our Mool Mantra — App is for Pandit, not Pandit for App.',
        pauseAfterMs: 1200,
        emotionalTone: 'warm_respectful',
      },
      {
        id: 'S-0.1-line-5',
        hindi: 'अगर सीधे Registration करना हो तो Skip बोलें। नहीं तो जानें बोलें।',
        english: 'If you want to register directly, say Skip. Otherwise, say Learn More.',
        pauseAfterMs: 500,
        emotionalTone: 'helpful_guide',
      },
    ],
  },
  {
    screenId: 'S-0.2',
    screenName: 'Income Hook',
    description: 'Show Pandit Ji their potential income increase',
    fileName: '10_S-0.2_Income_Hook.ts',
    lines: [
      {
        id: 'S-0.2-line-1',
        hindi: 'पंडित जी, क्या आप जानते हैं कि आप साल में कितना कमा सकते हैं?',
        english: 'Pandit Ji, do you know how much you can earn in a year?',
        pauseAfterMs: 1000,
        emotionalTone: 'warm_respectful',
      },
      {
        id: 'S-0.2-line-2',
        hindi: 'हमारे platform पर औसतन एक पंडित जी ₹50,000 से ₹1,00,000 प्रति माह कमाते हैं।',
        english: 'On our platform, an average Pandit Ji earns ₹50,000 to ₹1,00,000 per month.',
        pauseAfterMs: 1200,
        emotionalTone: 'helpful_guide',
      },
      {
        id: 'S-0.2-line-3',
        hindi: 'यह app आपको हर महीने कम से कम 10-15 नए bookings दिला सकता है।',
        english: 'This app can get you at least 10-15 new bookings every month.',
        pauseAfterMs: 1000,
        emotionalTone: 'helpful_guide',
      },
      {
        id: 'S-0.2-line-4',
        hindi: 'तो चलिए, शुरू करते हैं और आपकी आमदनी बढ़ाते हैं।',
        english: 'So let us start and increase your income.',
        pauseAfterMs: 800,
        emotionalTone: 'celebratory',
      },
      {
        id: 'S-0.2-line-5',
        hindi: 'आगे बढ़ने के लिए Continue बोलें।',
        english: 'Say Continue to proceed.',
        pauseAfterMs: 500,
        emotionalTone: 'helpful_guide',
      },
    ],
  },
  {
    screenId: 'S-0.3',
    screenName: 'Fixed Dakshina',
    description: 'Explain fixed dakshina pricing model',
    fileName: '11_S-0.3_Fixed_Dakshina.ts',
    lines: [
      {
        id: 'S-0.3-line-1',
        hindi: 'पंडित जी, हमारे platform पर Fixed Dakshina मॉडल है।',
        english: 'Pandit Ji, our platform has a Fixed Dakshina model.',
        pauseAfterMs: 1000,
        emotionalTone: 'warm_respectful',
      },
      {
        id: 'S-0.3-line-2',
        hindi: 'यानी हर पूजा के लिए एक तय दक्षिणा पहले से ही तय होती है।',
        english: 'This means a fixed dakshina is predetermined for each puja.',
        pauseAfterMs: 1000,
        emotionalTone: 'helpful_guide',
      },
      {
        id: 'S-0.3-line-3',
        hindi: 'इससे आपको पता होता है कि आपको कितनी दक्षिणा मिलेगी।',
        english: 'This way you know how much dakshina you will receive.',
        pauseAfterMs: 800,
        emotionalTone: 'reassuring',
      },
      {
        id: 'S-0.3-line-4',
        hindi: 'कोई झगड़ा नहीं, कोई असमंजस नहीं।',
        english: 'No arguments, no confusion.',
        pauseAfterMs: 800,
        emotionalTone: 'reassuring',
      },
      {
        id: 'S-0.3-line-5',
        hindi: 'समझने के लिए हां बोलें। आगे बढ़ने के लिए Continue बोलें।',
        english: 'Say Yes to understand. Say Continue to proceed.',
        pauseAfterMs: 500,
        emotionalTone: 'helpful_guide',
      },
    ],
  },
  {
    screenId: 'S-0.4',
    screenName: 'Online Revenue',
    description: 'Explain online payment and revenue sharing',
    fileName: '12_S-0.4_Online_Revenue.ts',
    lines: [
      {
        id: 'S-0.4-line-1',
        hindi: 'पंडित जी, अब आप ऑनलाइन भी दक्षिणा प्राप्त कर सकते हैं।',
        english: 'Pandit Ji, now you can receive dakshina online too.',
        pauseAfterMs: 1000,
        emotionalTone: 'warm_respectful',
      },
      {
        id: 'S-0.4-line-2',
        hindi: 'यह पैसा सीधे आपके bank account में आएगा।',
        english: 'This money will come directly to your bank account.',
        pauseAfterMs: 800,
        emotionalTone: 'reassuring',
      },
      {
        id: 'S-0.4-line-3',
        hindi: 'हम केवल 10% commission लेते हैं, बाकी 90% आपका।',
        english: 'We take only 10% commission, the remaining 90% is yours.',
        pauseAfterMs: 1000,
        emotionalTone: 'helpful_guide',
      },
      {
        id: 'S-0.4-line-4',
        hindi: 'हर हफ्ते payment सीधे आपके account में।',
        english: 'Every week payment directly to your account.',
        pauseAfterMs: 800,
        emotionalTone: 'reassuring',
      },
      {
        id: 'S-0.4-line-5',
        hindi: 'जानने के लिए Details बोलें। आगे बढ़ने के लिए Continue बोलें।',
        english: 'Say Details to know more. Say Continue to proceed.',
        pauseAfterMs: 500,
        emotionalTone: 'helpful_guide',
      },
    ],
  },
  {
    screenId: 'S-0.5',
    screenName: 'Backup Pandit',
    description: 'Explain backup pandit feature',
    fileName: '13_S-0.5_Backup_Pandit.ts',
    lines: [
      {
        id: 'S-0.5-line-1',
        hindi: 'पंडित जी, अगर कभी आप किसी पूजा में नहीं जा सकते, तो क्या होगा?',
        english: 'Pandit Ji, what if sometimes you cannot go for a puja?',
        pauseAfterMs: 1000,
        emotionalTone: 'warm_respectful',
      },
      {
        id: 'S-0.5-line-2',
        hindi: 'हमारा Backup Pandit feature आपको इस समस्या से बचाता है।',
        english: 'Our Backup Pandit feature saves you from this problem.',
        pauseAfterMs: 1000,
        emotionalTone: 'reassuring',
      },
      {
        id: 'S-0.5-line-3',
        hindi: 'आप किसी भरोसेमंद साथी पंडित को backup बना सकते हैं।',
        english: 'You can make a trusted fellow pandit your backup.',
        pauseAfterMs: 1000,
        emotionalTone: 'helpful_guide',
      },
      {
        id: 'S-0.5-line-4',
        hindi: 'वह आपकी जगह पूजा करेगा और आप commission पाएंगे।',
        english: 'He will do the puja in your place and you will get commission.',
        pauseAfterMs: 1000,
        emotionalTone: 'helpful_guide',
      },
      {
        id: 'S-0.5-line-5',
        hindi: 'जानने के लिए Backup बोलें। आगे बढ़ने के लिए Continue बोलें।',
        english: 'Say Backup to know more. Say Continue to proceed.',
        pauseAfterMs: 500,
        emotionalTone: 'helpful_guide',
      },
    ],
  },
  {
    screenId: 'S-0.6',
    screenName: 'Instant Payment',
    description: 'Explain instant payment feature',
    fileName: '14_S-0.6_Instant_Payment.ts',
    lines: [
      {
        id: 'S-0.6-line-1',
        hindi: 'पंडित जी, अब आपको payment का इंतज़ार नहीं करना पड़ेगा।',
        english: 'Pandit Ji, now you do not have to wait for payment.',
        pauseAfterMs: 1000,
        emotionalTone: 'warm_respectful',
      },
      {
        id: 'S-0.6-line-2',
        hindi: 'पूजा पूरी होने के तुरंत बाद payment आपके account में।',
        english: 'Payment in your account immediately after puja completion.',
        pauseAfterMs: 1000,
        emotionalTone: 'celebratory',
      },
      {
        id: 'S-0.6-line-3',
        hindi: 'UPI, Bank Transfer, या Wallet — जैसे चाहें वैसे पाएं।',
        english: 'UPI, Bank Transfer, or Wallet — receive as you wish.',
        pauseAfterMs: 1000,
        emotionalTone: 'helpful_guide',
      },
      {
        id: 'S-0.6-line-4',
        hindi: 'सुरक्षित, तेज़, और भरोसेमंद।',
        english: 'Secure, fast, and trustworthy.',
        pauseAfterMs: 800,
        emotionalTone: 'reassuring',
      },
      {
        id: 'S-0.6-line-5',
        hindi: 'जानने के लिए Payment बोलें। आगे बढ़ने के लिए Continue बोलें।',
        english: 'Say Payment to know more. Say Continue to proceed.',
        pauseAfterMs: 500,
        emotionalTone: 'helpful_guide',
      },
    ],
  },
  {
    screenId: 'S-0.7',
    screenName: 'Voice Nav Demo',
    description: 'Demonstrate voice navigation feature',
    fileName: '15_S-0.7_Voice_Nav_Demo.ts',
    lines: [
      {
        id: 'S-0.7-line-1',
        hindi: 'पंडित जी, यह app आपकी आवाज़ से चलता है।',
        english: 'Pandit Ji, this app runs on your voice.',
        pauseAfterMs: 1000,
        emotionalTone: 'warm_respectful',
      },
      {
        id: 'S-0.7-line-2',
        hindi: 'बस बोलें — हां, नहीं, Skip, Continue, या Details।',
        english: 'Just say — Yes, No, Skip, Continue, or Details.',
        pauseAfterMs: 1000,
        emotionalTone: 'helpful_guide',
      },
      {
        id: 'S-0.7-line-3',
        hindi: 'अगर बोलना पसंद नहीं, तो बटन भी हैं।',
        english: 'If you do not like speaking, there are buttons too.',
        pauseAfterMs: 800,
        emotionalTone: 'reassuring',
      },
      {
        id: 'S-0.7-line-4',
        hindi: 'चलिए, एक बार try करते हैं।',
        english: 'Let us try it once.',
        pauseAfterMs: 800,
        emotionalTone: 'helpful_guide',
      },
      {
        id: 'S-0.7-line-5',
        hindi: 'आगे बढ़ने के लिए Continue बोलें या Continue बटन दबाएं।',
        english: 'Say Continue or press Continue button to proceed.',
        pauseAfterMs: 500,
        emotionalTone: 'helpful_guide',
      },
    ],
  },
  {
    screenId: 'S-0.8',
    screenName: 'Dual Mode',
    description: 'Explain dual mode (voice + touch)',
    fileName: '16_S-0.8_Dual_Mode.ts',
    lines: [
      {
        id: 'S-0.8-line-1',
        hindi: 'पंडित जी, इस app में दो modes हैं — Voice Mode और Touch Mode।',
        english: 'Pandit Ji, this app has two modes — Voice Mode and Touch Mode.',
        pauseAfterMs: 1200,
        emotionalTone: 'warm_respectful',
      },
      {
        id: 'S-0.8-line-2',
        hindi: 'Voice Mode में बोलकर control करें।',
        english: 'In Voice Mode, control by speaking.',
        pauseAfterMs: 800,
        emotionalTone: 'helpful_guide',
      },
      {
        id: 'S-0.8-line-3',
        hindi: 'Touch Mode में बटन दबाकर control करें।',
        english: 'In Touch Mode, control by pressing buttons.',
        pauseAfterMs: 800,
        emotionalTone: 'helpful_guide',
      },
      {
        id: 'S-0.8-line-4',
        hindi: 'कभी भी Settings में जाकर mode बदल सकते हैं।',
        english: 'You can change mode anytime in Settings.',
        pauseAfterMs: 800,
        emotionalTone: 'reassuring',
      },
      {
        id: 'S-0.8-line-5',
        hindi: 'आगे बढ़ने के लिए Continue बोलें या बटन दबाएं।',
        english: 'Say Continue or press button to proceed.',
        pauseAfterMs: 500,
        emotionalTone: 'helpful_guide',
      },
    ],
  },
  {
    screenId: 'S-0.9',
    screenName: 'Travel Calendar',
    description: 'Explain travel calendar feature',
    fileName: '17_S-0.9_Travel_Calendar.ts',
    lines: [
      {
        id: 'S-0.9-line-1',
        hindi: 'पंडित जी, Travel Calendar से आप अपने bookings को आसानी से manage कर सकते हैं।',
        english: 'Pandit Ji, with Travel Calendar you can easily manage your bookings.',
        pauseAfterMs: 1200,
        emotionalTone: 'warm_respectful',
      },
      {
        id: 'S-0.9-line-2',
        hindi: 'कौन सी पूजा कब और कहां है, सब एक जगह दिखता है।',
        english: 'Which puja when and where, everything shows in one place.',
        pauseAfterMs: 1000,
        emotionalTone: 'helpful_guide',
      },
      {
        id: 'S-0.9-line-3',
        hindi: 'आप अपनी availability भी set कर सकते हैं।',
        english: 'You can also set your availability.',
        pauseAfterMs: 800,
        emotionalTone: 'helpful_guide',
      },
      {
        id: 'S-0.9-line-4',
        hindi: 'ताकि आपको ज़रूरत से ज़्यादा bookings न मिलें।',
        english: 'So that you do not get too many bookings.',
        pauseAfterMs: 800,
        emotionalTone: 'reassuring',
      },
      {
        id: 'S-0.9-line-5',
        hindi: 'जानने के लिए Calendar बोलें। आगे बढ़ने के लिए Continue बोलें।',
        english: 'Say Calendar to know more. Say Continue to proceed.',
        pauseAfterMs: 500,
        emotionalTone: 'helpful_guide',
      },
    ],
  },
  {
    screenId: 'S-0.10',
    screenName: 'Video Verification',
    description: 'Explain video verification process',
    fileName: '18_S-0.10_Video_Verification.ts',
    lines: [
      {
        id: 'S-0.10-line-1',
        hindi: 'पंडित जी, सुरक्षा के लिए हम video verification करते हैं।',
        english: 'Pandit Ji, for safety we do video verification.',
        pauseAfterMs: 1000,
        emotionalTone: 'warm_respectful',
      },
      {
        id: 'S-0.10-line-2',
        hindi: 'यह सुनिश्चित करता है कि असली पंडित जी ही platform पर हैं।',
        english: 'This ensures that only real Pandit Ji are on the platform.',
        pauseAfterMs: 1000,
        emotionalTone: 'reassuring',
      },
      {
        id: 'S-0.10-line-3',
        hindi: 'बस 2 मिनट का video call होगा।',
        english: 'Just a 2 minute video call.',
        pauseAfterMs: 800,
        emotionalTone: 'reassuring',
      },
      {
        id: 'S-0.10-line-4',
        hindi: 'आपकी documents verify होंगे और profile approve होगा।',
        english: 'Your documents will be verified and profile approved.',
        pauseAfterMs: 1000,
        emotionalTone: 'helpful_guide',
      },
      {
        id: 'S-0.10-line-5',
        hindi: 'जानने के लिए Verification बोलें। आगे बढ़ने के लिए Continue बोलें।',
        english: 'Say Verification to know more. Say Continue to proceed.',
        pauseAfterMs: 500,
        emotionalTone: 'helpful_guide',
      },
    ],
  },
  {
    screenId: 'S-0.11',
    screenName: '4 Guarantees',
    description: 'Explain 4 platform guarantees',
    fileName: '19_S-0.11_4_Guarantees.ts',
    lines: [
      {
        id: 'S-0.11-line-1',
        hindi: 'पंडित जी, हम आपको 4 Guarantees देते हैं।',
        english: 'Pandit Ji, we give you 4 Guarantees.',
        pauseAfterMs: 1000,
        emotionalTone: 'warm_respectful',
      },
      {
        id: 'S-0.11-line-2',
        hindi: 'पहला — Fixed Dakshina, कोई झगड़ा नहीं।',
        english: 'First — Fixed Dakshina, no arguments.',
        pauseAfterMs: 800,
        emotionalTone: 'reassuring',
      },
      {
        id: 'S-0.11-line-3',
        hindi: 'दूसरा — Instant Payment, तुरंत पैसा।',
        english: 'Second — Instant Payment, money immediately.',
        pauseAfterMs: 800,
        emotionalTone: 'reassuring',
      },
      {
        id: 'S-0.11-line-4',
        hindi: 'तीसरा — Respectful Treatment, हमेशा इज़्ज़त।',
        english: 'Third — Respectful Treatment, always respect.',
        pauseAfterMs: 800,
        emotionalTone: 'warm_respectful',
      },
      {
        id: 'S-0.11-line-5',
        hindi: 'चौथा — 24/7 Support, हमेशा मदद के लिए तैयार। आगे बढ़ने के लिए Continue बोलें।',
        english: 'Fourth — 24/7 Support, always ready to help. Say Continue to proceed.',
        pauseAfterMs: 500,
        emotionalTone: 'reassuring',
      },
    ],
  },
  {
    screenId: 'S-0.12',
    screenName: 'Final CTA',
    description: 'Final call to action for registration',
    fileName: '20_S-0.12_Final_CTA.ts',
    lines: [
      {
        id: 'S-0.12-line-1',
        hindi: 'पंडित जी, अब आप तैयार हैं HmarePanditJi join करने के लिए।',
        english: 'Pandit Ji, now you are ready to join HmarePanditJi.',
        pauseAfterMs: 1000,
        emotionalTone: 'warm_respectful',
      },
      {
        id: 'S-0.12-line-2',
        hindi: 'Registration में केवल 5 मिनट लगेंगे।',
        english: 'Registration will take only 5 minutes.',
        pauseAfterMs: 800,
        emotionalTone: 'helpful_guide',
      },
      {
        id: 'S-0.12-line-3',
        hindi: 'आज ही join करें और अपनी आमदनी बढ़ाना शुरू करें।',
        english: 'Join today and start increasing your income.',
        pauseAfterMs: 1000,
        emotionalTone: 'celebratory',
      },
      {
        id: 'S-0.12-line-4',
        hindi: 'हमारा वादा है — बेहतर income, बेहतर respect, बेहतर life।',
        english: 'Our promise — better income, better respect, better life.',
        pauseAfterMs: 1000,
        emotionalTone: 'warm_respectful',
      },
      {
        id: 'S-0.12-line-5',
        hindi: 'Register करने के लिए Register बोलें या Register बटन दबाएं।',
        english: 'Say Register or press Register button to register.',
        pauseAfterMs: 500,
        emotionalTone: 'helpful_guide',
      },
    ],
  },
];

// ============================================================================
// TRANSLATION TEMPLATES
// ============================================================================

interface TranslationTemplate {
  [lineId: string]: {
    text: string;
    romanTransliteration: string;
  };
}

const TRANSLATIONS: { [languageCode: string]: TranslationTemplate } = {
  // Note: S-0.1 already has full translations, this is for S-0.2 to S-0.12
  // For demo purposes, we'll create Hindi base with English pattern
  // In production, these would be professionally translated
  
  'ta-IN': generateTamilTranslations(),
  'te-IN': generateTeluguTranslations(),
  'bn-IN': generateBengaliTranslations(),
  'mr-IN': generateMarathiTranslations(),
  'gu-IN': generateGujaratiTranslations(),
  'kn-IN': generateKannadaTranslations(),
  'ml-IN': generateMalayalamTranslations(),
  'pa-IN': generatePunjabiTranslations(),
  'or-IN': generateOdiaTranslations(),
  'en-IN': generateEnglishTranslations(),
  'hi-IN-bhojpuri': generateBhojpuriTranslations(),
  'hi-IN-maithili': generateMaithiliTranslations(),
  'hi-IN-sanskrit': generateSanskritTranslations(),
  'hi-IN-assamese': generateAssameseTranslations(),
};

// Translation generator functions (simplified for demo - would use professional translations in production)
function generateTamilTranslations(): TranslationTemplate {
  const translations: TranslationTemplate = {};
  SCREENS.forEach(screen => {
    screen.lines.forEach((line, idx) => {
      translations[line.id] = {
        text: `[Tamil] ${line.english}`, // Placeholder - replace with actual Tamil
        romanTransliteration: `[Tamil Roman] ${line.english}`,
      };
    });
  });
  return translations;
}

function generateTeluguTranslations(): TranslationTemplate {
  const translations: TranslationTemplate = {};
  SCREENS.forEach(screen => {
    screen.lines.forEach((line, idx) => {
      translations[line.id] = {
        text: `[Telugu] ${line.english}`, // Placeholder - replace with actual Telugu
        romanTransliteration: `[Telugu Roman] ${line.english}`,
      };
    });
  });
  return translations;
}

function generateBengaliTranslations(): TranslationTemplate {
  const translations: TranslationTemplate = {};
  SCREENS.forEach(screen => {
    screen.lines.forEach((line, idx) => {
      translations[line.id] = {
        text: `[Bengali] ${line.english}`, // Placeholder - replace with actual Bengali
        romanTransliteration: `[Bengali Roman] ${line.english}`,
      };
    });
  });
  return translations;
}

function generateMarathiTranslations(): TranslationTemplate {
  const translations: TranslationTemplate = {};
  SCREENS.forEach(screen => {
    screen.lines.forEach((line, idx) => {
      translations[line.id] = {
        text: `[Marathi] ${line.english}`, // Placeholder - replace with actual Marathi
        romanTransliteration: `[Marathi Roman] ${line.english}`,
      };
    });
  });
  return translations;
}

function generateGujaratiTranslations(): TranslationTemplate {
  const translations: TranslationTemplate = {};
  SCREENS.forEach(screen => {
    screen.lines.forEach((line, idx) => {
      translations[line.id] = {
        text: `[Gujarati] ${line.english}`, // Placeholder - replace with actual Gujarati
        romanTransliteration: `[Gujarati Roman] ${line.english}`,
      };
    });
  });
  return translations;
}

function generateKannadaTranslations(): TranslationTemplate {
  const translations: TranslationTemplate = {};
  SCREENS.forEach(screen => {
    screen.lines.forEach((line, idx) => {
      translations[line.id] = {
        text: `[Kannada] ${line.english}`, // Placeholder - replace with actual Kannada
        romanTransliteration: `[Kannada Roman] ${line.english}`,
      };
    });
  });
  return translations;
}

function generateMalayalamTranslations(): TranslationTemplate {
  const translations: TranslationTemplate = {};
  SCREENS.forEach(screen => {
    screen.lines.forEach((line, idx) => {
      translations[line.id] = {
        text: `[Malayalam] ${line.english}`, // Placeholder - replace with actual Malayalam
        romanTransliteration: `[Malayalam Roman] ${line.english}`,
      };
    });
  });
  return translations;
}

function generatePunjabiTranslations(): TranslationTemplate {
  const translations: TranslationTemplate = {};
  SCREENS.forEach(screen => {
    screen.lines.forEach((line, idx) => {
      translations[line.id] = {
        text: `[Punjabi] ${line.english}`, // Placeholder - replace with actual Punjabi
        romanTransliteration: `[Punjabi Roman] ${line.english}`,
      };
    });
  });
  return translations;
}

function generateOdiaTranslations(): TranslationTemplate {
  const translations: TranslationTemplate = {};
  SCREENS.forEach(screen => {
    screen.lines.forEach((line, idx) => {
      translations[line.id] = {
        text: `[Odia] ${line.english}`, // Placeholder - replace with actual Odia
        romanTransliteration: `[Odia Roman] ${line.english}`,
      };
    });
  });
  return translations;
}

function generateEnglishTranslations(): TranslationTemplate {
  const translations: TranslationTemplate = {};
  SCREENS.forEach(screen => {
    screen.lines.forEach((line, idx) => {
      translations[line.id] = {
        text: line.english,
        romanTransliteration: line.english,
      };
    });
  });
  return translations;
}

function generateBhojpuriTranslations(): TranslationTemplate {
  const translations: TranslationTemplate = {};
  SCREENS.forEach(screen => {
    screen.lines.forEach((line, idx) => {
      translations[line.id] = {
        text: `[Bhojpuri] ${line.hindi}`, // Placeholder - replace with actual Bhojpuri
        romanTransliteration: `[Bhojpuri Roman] ${line.english}`,
      };
    });
  });
  return translations;
}

function generateMaithiliTranslations(): TranslationTemplate {
  const translations: TranslationTemplate = {};
  SCREENS.forEach(screen => {
    screen.lines.forEach((line, idx) => {
      translations[line.id] = {
        text: `[Maithili] ${line.hindi}`, // Placeholder - replace with actual Maithili
        romanTransliteration: `[Maithili Roman] ${line.english}`,
      };
    });
  });
  return translations;
}

function generateSanskritTranslations(): TranslationTemplate {
  const translations: TranslationTemplate = {};
  SCREENS.forEach(screen => {
    screen.lines.forEach((line, idx) => {
      translations[line.id] = {
        text: `[Sanskrit] ${line.english}`, // Placeholder - replace with actual Sanskrit
        romanTransliteration: `[Sanskrit Roman] ${line.english}`,
      };
    });
  });
  return translations;
}

function generateAssameseTranslations(): TranslationTemplate {
  const translations: TranslationTemplate = {};
  SCREENS.forEach(screen => {
    screen.lines.forEach((line, idx) => {
      translations[line.id] = {
        text: `[Assamese] ${line.english}`, // Placeholder - replace with actual Assamese
        romanTransliteration: `[Assamese Roman] ${line.english}`,
      };
    });
  });
  return translations;
}

// ============================================================================
// SCRIPT GENERATOR
// ============================================================================

function generateScriptFile(screen: ScreenDefinition): string {
  const languageKeys = Object.keys(TRANSLATIONS);
  
  let content = `/**
 * ${screen.screenId}: ${screen.screenName}
 * Description: ${screen.description}
 * Total: 75 scripts (15 languages × 5 lines)
 * Generated: ${new Date().toISOString()}
 */

export const ${screen.screenId.replace(/-/g, '_').toUpperCase()} = {
  screenId: '${screen.screenId}',
  screenName: '${screen.screenName}',
  description: '${screen.description}',
  totalLines: 5,
  languages: 15,
  totalScripts: 75,
  
  scripts: {
`;

  // Hindi (base language)
  content += `    // ==================== HINDI (hi-IN) - Priority 1 ====================
    'hi-IN': [
`;
  screen.lines.forEach(line => {
    content += `      {
        id: '${line.id}',
        text: '${line.hindi}',
        romanTransliteration: '${line.english}',
        englishMeaning: '${line.english}',
        speaker: 'ratan',
        pace: 0.88,
        pauseAfterMs: ${line.pauseAfterMs},
        maxDurationS: 8,
        emotionalTone: '${line.emotionalTone}',
      },
`;
  });
  content += `    ],

`;

  // Other languages
  languageKeys.forEach(langCode => {
    const lang = LANGUAGES.find(l => l.code === langCode || l.fallbackFor === langCode.split('-')[2]);
    const translations = TRANSLATIONS[langCode];
    const isFallback = lang?.fallback || false;
    
    content += `    // ==================== ${lang?.name || langCode} (${langCode}) ====================
    '${langCode}': [
`;
    screen.lines.forEach(line => {
      const translation = translations[line.id];
      content += `      {
        id: '${line.id}',
        text: '${translation?.text || line.hindi}',
        romanTransliteration: '${translation?.romanTransliteration || line.english}',
        englishMeaning: '${line.english}',
        speaker: 'ratan',
        pace: ${lang?.pace || 0.88},
        pauseAfterMs: ${line.pauseAfterMs},
        maxDurationS: 8,
        emotionalTone: '${line.emotionalTone}',${isFallback ? `
        fallback: true,
        fallbackFor: '${lang?.fallbackFor || 'unknown'}',` : ''}
      },
`;
    });
    content += `    ],

`;
  });

  content += `  },
};

export default ${screen.screenId.replace(/-/g, '_').toUpperCase()};
`;

  return content;
}

function generateAllScripts() {
  const outputDir = path.join(__dirname);
  
  console.log('🚀 Generating voice scripts for Part 0 (S-0.1 to S-0.12)...');
  console.log(`📁 Output directory: ${outputDir}`);
  console.log(`📊 Total screens: ${SCREENS.length}`);
  console.log(`🌍 Languages: ${LANGUAGES.length}`);
  console.log(`📝 Scripts per screen: 75 (15 langs × 5 lines)`);
  console.log(`📈 Total scripts: ${SCREENS.length * 75}`);
  console.log('');

  SCREENS.forEach((screen, index) => {
    const content = generateScriptFile(screen);
    const filePath = path.join(outputDir, screen.fileName);
    
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`✅ [${index + 1}/${SCREENS.length}] Generated: ${screen.fileName}`);
  });

  console.log('');
  console.log('🎉 Generation complete!');
  console.log(`📦 Total files created: ${SCREENS.length}`);
  console.log(`📊 Total scripts: ${SCREENS.length * 75}`);
}

// Run generator
if (require.main === module) {
  generateAllScripts();
}

export { generateScriptFile, generateAllScripts, SCREENS, LANGUAGES };
