/**
 * Onboarding Translations
 * Complete translations for all onboarding screens in both native and Latin scripts
 * 
 * Usage:
 * - Native script: translations[language].native[key]
 * - Latin script: translations[language].latin[key]
 */

import type { SupportedLanguage } from './onboarding-store';

export type ScriptPreference = 'native' | 'latin';

export interface LanguageTranslations {
  native: Record<string, string>;
  latin: Record<string, string>;
}

export const ONBOARDING_TRANSLATIONS: Record<SupportedLanguage, LanguageTranslations> = {
  Hindi: {
    native: {
      // Common
      welcome: 'नमस्ते',
      continue: 'जारी रखें',
      back: 'वापस',
      skip: 'छोड़ें',
      next: 'आगे',
      yes: 'हाँ',
      no: 'नहीं',
      
      // Location Permission
      locationTitle: 'लोकेशन अनुमति',
      locationDesc: 'हमें आपकी लोकेशन की आवश्यकता है ताकि हम आपकी भाषा का पता लगा सकें',
      allowLocation: 'लोकेशन की अनुमति दें',
      chooseManually: 'मैं हाथ से चुनूँगा',
      
      // Language Confirm
      languageDetected: 'भाषा का पता चला',
      detectedCity: 'शहर',
      isThisCorrect: 'क्या यह सही है?',
      changeLanguage: 'भाषा बदलें',
      
      // Script Choice
      scriptChoiceTitle: 'आप कैसे पढ़ना चाहेंगे?',
      pureLanguage: 'शुद्ध',
      pureLanguageDesc: 'मूल लिपि में सब कुछ',
      languagePlusEnglish: '+ English',
      languagePlusEnglishDesc: 'अंग्रेजी अक्षरों में',
      or: 'या',
      
      // Tutorial
      swagatTitle: 'स्वागत है',
      swagatDesc: 'हमारे परिवार में आपका स्वागत है',
    },
    latin: {
      // Common
      welcome: 'Namaste',
      continue: 'Jaari rakhein',
      back: 'Waapas',
      skip: 'Chhodein',
      next: 'Aage',
      yes: 'Haan',
      no: 'Nahin',
      
      // Location Permission
      locationTitle: 'Location Anumati',
      locationDesc: 'Humein aapki location ki aavashyakta hai taaki hum aapki bhasha ka pata laga sakein',
      allowLocation: 'Location ki anumati dein',
      chooseManually: 'Main haath se chunoonga',
      
      // Language Confirm
      languageDetected: 'Bhasha ka pata chala',
      detectedCity: 'Shehar',
      isThisCorrect: 'Kya yeh sahi hai?',
      changeLanguage: 'Bhasha badlein',
      
      // Script Choice
      scriptChoiceTitle: 'Aap kaise padhna chahenge?',
      pureLanguage: 'Shuddh',
      pureLanguageDesc: 'Mool lipi mein sab kuch',
      languagePlusEnglish: '+ English',
      languagePlusEnglishDesc: 'Angrezi aksharon mein',
      or: 'YA',
      
      // Tutorial
      swagatTitle: 'Swaagat hai',
      swagatDesc: 'Hamaare parivaar mein aapka swaagat hai',
    },
  },
  
  Tamil: {
    native: {
      // Common
      welcome: 'வணக்கம்',
      continue: 'தொடரவும்',
      back: 'பின்',
      skip: 'தவிர்',
      next: 'அடுத்து',
      yes: 'ஆம்',
      no: 'இல்லை',
      
      // Location Permission
      locationTitle: 'இட அனுமதி',
      locationDesc: 'உங்கள் மொழியைக் கண்டறிய உங்கள் இடம் தேவை',
      allowLocation: 'இட அனுமதி அளிக்கவும்',
      chooseManually: 'நானே தேர்ந்தெடுப்பேன்',
      
      // Language Confirm
      languageDetected: 'மொழி கண்டறியப்பட்டது',
      detectedCity: 'நகரம்',
      isThisCorrect: 'இது சரியா?',
      changeLanguage: 'மொழி மாற்றவும்',
      
      // Script Choice
      scriptChoiceTitle: 'நீங்கள் எப்படிப் படிக்க விரும்புகிறீர்கள்?',
      pureLanguage: 'தமிழ்',
      pureLanguageDesc: 'தமிழ் ஸ்கிரிப்டில் எல்லாம்',
      languagePlusEnglish: '+ English',
      languagePlusEnglishDesc: 'ஆங்கில எழுத்துக்களில்',
      or: 'அல்லது',
      
      // Tutorial
      swagatTitle: 'வரவேற்பு',
      swagatDesc: 'எங்கள் குடும்பத்தில் உங்களை வரவேற்கிறோம்',
    },
    latin: {
      // Common
      welcome: 'Vanakkam',
      continue: 'Thodaravum',
      back: 'Pin',
      skip: 'Thavir',
      next: 'Aduthu',
      yes: 'Aam',
      no: 'Illai',
      
      // Location Permission
      locationTitle: 'Ida Anumathi',
      locationDesc: 'Ungal mozhiyai kandariya ungal idam thevai',
      allowLocation: 'Ida anumathi alikkavum',
      chooseManually: 'Naane therndeduppen',
      
      // Language Confirm
      languageDetected: 'Mozhi kandariyappattathu',
      detectedCity: 'Nagaram',
      isThisCorrect: 'Idhu sariya?',
      changeLanguage: 'Mozhi maatravum',
      
      // Script Choice
      scriptChoiceTitle: 'Neer eppadi padikka virumbureergal?',
      pureLanguage: 'Tamil',
      pureLanguageDesc: 'Tamil scriptil ellam',
      languagePlusEnglish: '+ English',
      languagePlusEnglishDesc: 'Aangila ezhuthukkalil',
      or: 'Allathu',
      
      // Tutorial
      swagatTitle: 'Varavetpu',
      swagatDesc: 'Engal kudumbathil ungalaivaraverkirom',
    },
  },
  
  Telugu: {
    native: {
      // Common
      welcome: 'నమస్కారం',
      continue: 'కొనసాగించు',
      back: 'వెనుక',
      skip: 'దాటు',
      next: 'తర్వాత',
      yes: 'అవును',
      no: 'కాదు',
      
      // Location Permission
      locationTitle: 'స్థానం అనుమతి',
      locationDesc: 'మీ భాషను కనుగొనడానికి మీ స్థానం అవసరం',
      allowLocation: 'స్థానం అనుమతి ఇవ్వండి',
      chooseManually: 'నేను ఎంచుకుంటాను',
      
      // Language Confirm
      languageDetected: 'భాష కనుగొనబడింది',
      detectedCity: 'నగరం',
      isThisCorrect: 'ఇది సరైనదా?',
      changeLanguage: 'భాష మార్చు',
      
      // Script Choice
      scriptChoiceTitle: 'మీరు ఎలా చదవాలనుకుంటున్నారు?',
      pureLanguage: 'తెలుగు',
      pureLanguageDesc: 'తెలుగు లిపిలో అన్నీ',
      languagePlusEnglish: '+ English',
      languagePlusEnglishDesc: 'ఇంగ్లీష్ అక్షరాలలో',
      or: 'లేదా',
      
      // Tutorial
      swagatTitle: 'స్వాగతం',
      swagatDesc: 'మా కుటుంబంలో మీకు స్వాగతం',
    },
    latin: {
      // Common
      welcome: 'Namaskaram',
      continue: 'Konasaaiginchu',
      back: 'Venuka',
      skip: 'Daatu',
      next: 'Tarvaata',
      yes: 'Avunu',
      no: 'Kaadu',
      
      // Location Permission
      locationTitle: 'Sthanam Anumathi',
      locationDesc: 'Mee bhashanu kanugonadaniki mee sthanam avasaram',
      allowLocation: 'Sthanam anumathi ivvandi',
      chooseManually: 'Nenu enchukuntanu',
      
      // Language Confirm
      languageDetected: 'Bhasha kanugonabadindi',
      detectedCity: 'Nagaram',
      isThisCorrect: 'Idi sarainadaa?',
      changeLanguage: 'Bhasha maarchu',
      
      // Script Choice
      scriptChoiceTitle: 'Meeru ela chadavalanukuntunnaru?',
      pureLanguage: 'Telugu',
      pureLanguageDesc: 'Telugu lipilo anni',
      languagePlusEnglish: '+ English',
      languagePlusEnglishDesc: 'English aksharaalalo',
      or: 'Leda',
      
      // Tutorial
      swagatTitle: 'Swaagatam',
      swagatDesc: 'Maa kutumbamlo meeku swaagatam',
    },
  },
  
  Bengali: {
    native: {
      // Common
      welcome: 'নমস্কার',
      continue: 'চালিয়ে যান',
      back: 'পিছনে',
      skip: 'এড়িয়ে যান',
      next: 'পরবর্তী',
      yes: 'হ্যাঁ',
      no: 'না',
      
      // Location Permission
      locationTitle: 'অবস্থান অনুমতি',
      locationDesc: 'আপনার ভাষা খুঁজে পেতে আপনার অবস্থান প্রয়োজন',
      allowLocation: 'অবস্থান অনুমতি দিন',
      chooseManually: 'আমি নিজে বেছে নেব',
      
      // Language Confirm
      languageDetected: 'ভাষা শনাক্ত হয়েছে',
      detectedCity: 'শহর',
      isThisCorrect: 'এটা কি ঠিক?',
      changeLanguage: 'ভাষা পরিবর্তন',
      
      // Script Choice
      scriptChoiceTitle: 'আপনি কীভাবে পড়তে চান?',
      pureLanguage: 'বাংলা',
      pureLanguageDesc: 'বাংলা লিপিতে সবকিছু',
      languagePlusEnglish: '+ English',
      languagePlusEnglishDesc: 'ইংরেজি অক্ষরে',
      or: 'অথবা',
      
      // Tutorial
      swagatTitle: 'স্বাগতম',
      swagatDesc: 'আমাদের পরিবারে আপনাকে স্বাগতম',
    },
    latin: {
      // Common
      welcome: 'Nomoshkar',
      continue: 'Chaliye jaan',
      back: 'Pichhone',
      skip: 'Eriye jaan',
      next: 'Poroborti',
      yes: 'Hyaan',
      no: 'Naa',
      
      // Location Permission
      locationTitle: 'Obosthan Anumoti',
      locationDesc: 'Aponar bhasha khuuje pete aponar obosthan proyojon',
      allowLocation: 'Obosthan anumoti din',
      chooseManually: 'Aami nije beche nebo',
      
      // Language Confirm
      languageDetected: 'Bhasha shonakto hoyeche',
      detectedCity: 'Shohor',
      isThisCorrect: 'Eta ki thik?',
      changeLanguage: 'Bhasha poriborton',
      
      // Script Choice
      scriptChoiceTitle: 'Apni kivabe porte chan?',
      pureLanguage: 'Bangla',
      pureLanguageDesc: 'Bangla lipite shobkichu',
      languagePlusEnglish: '+ English',
      languagePlusEnglishDesc: 'Ingreji okkhore',
      or: 'Othoba',
      
      // Tutorial
      swagatTitle: 'Swaagotom',
      swagatDesc: 'Aamader poribare apnake swaagotom',
    },
  },
  
  Kannada: {
    native: {
      // Common
      welcome: 'ನಮಸ್ಕಾರ',
      continue: 'ಮುಂದುವರಿಸಿ',
      back: 'ಹಿಂದೆ',
      skip: 'ಬಿಟ್ಟುಬಿಡಿ',
      next: 'ಮುಂದೆ',
      yes: 'ಹೌದು',
      no: 'ಇಲ್ಲ',
      
      // Location Permission
      locationTitle: 'ಸ್ಥಳ ಅನುಮತಿ',
      locationDesc: 'ನಿಮ್ಮ ಭಾಷೆಯನ್ನು ಕಂಡುಹಿಡಿಯಲು ನಿಮ್ಮ ಸ್ಥಳ ಅಗತ್ಯ',
      allowLocation: 'ಸ್ಥಳ ಅನುಮತಿ ನೀಡಿ',
      chooseManually: 'ನಾನು ಆಯ್ಕೆ ಮಾಡುತ್ತೇನೆ',
      
      // Language Confirm
      languageDetected: 'ಭಾಷೆ ಪತ್ತೆಯಾಗಿದೆ',
      detectedCity: 'ನಗರ',
      isThisCorrect: 'ಇದು ಸರಿಯೇ?',
      changeLanguage: 'ಭಾಷೆ ಬದಲಾಯಿಸಿ',
      
      // Script Choice
      scriptChoiceTitle: 'ನೀವು ಹೇಗೆ ಓದಲು ಬಯಸುತ್ತೀರಿ?',
      pureLanguage: 'ಕನ್ನಡ',
      pureLanguageDesc: 'ಕನ್ನಡ ಲಿಪಿಯಲ್ಲಿ ಎಲ್ಲವೂ',
      languagePlusEnglish: '+ English',
      languagePlusEnglishDesc: 'ಇಂಗ್ಲಿಷ್ ಅಕ್ಷರಗಳಲ್ಲಿ',
      or: 'ಅಥವಾ',
      
      // Tutorial
      swagatTitle: 'ಸ್ವಾಗತ',
      swagatDesc: 'ನಮ್ಮ ಕುಟುಂಬದಲ್ಲಿ ನಿಮಗೆ ಸ್ವಾಗತ',
    },
    latin: {
      // Common
      welcome: 'Namaskaara',
      continue: 'Munduvarisi',
      back: 'Hinde',
      skip: 'Bittubidi',
      next: 'Munde',
      yes: 'Houdu',
      no: 'Illa',
      
      // Location Permission
      locationTitle: 'Sthala Anumati',
      locationDesc: 'Nimma bhashheyannu kanduhidiyalu nimma sthala agatya',
      allowLocation: 'Sthala anumati needi',
      chooseManually: 'Naanu aayke maduttene',
      
      // Language Confirm
      languageDetected: 'Bhashe pattiyagide',
      detectedCity: 'Nagara',
      isThisCorrect: 'Idu sariye?',
      changeLanguage: 'Bhashe badalaayisi',
      
      // Script Choice
      scriptChoiceTitle: 'Neevu hege odalu bayasuttiri?',
      pureLanguage: 'Kannada',
      pureLanguageDesc: 'Kannada lipiyalli ellavoo',
      languagePlusEnglish: '+ English',
      languagePlusEnglishDesc: 'English aksharagallu',
      or: 'Athava',
      
      // Tutorial
      swagatTitle: 'Swaagata',
      swagatDesc: 'Namma kutumbadalli nimage swaagata',
    },
  },
  
  Malayalam: {
    native: {
      // Common
      welcome: 'നമസ്കാരം',
      continue: 'തുടരുക',
      back: 'പിന്നോട്ട്',
      skip: 'ഒഴിവാക്കുക',
      next: 'അടുത്തത്',
      yes: 'അതെ',
      no: 'അല്ല',
      
      // Location Permission
      locationTitle: 'സ്ഥലം അനുമതി',
      locationDesc: 'നിങ്ങളുടെ ഭാഷ കണ്ടെത്താൻ നിങ്ങളുടെ സ്ഥലം ആവശ്യമാണ്',
      allowLocation: 'സ്ഥലം അനുമതി നൽകുക',
      chooseManually: 'ഞാൻ തിരഞ്ഞെടുക്കും',
      
      // Language Confirm
      languageDetected: 'ഭാഷ കണ്ടെത്തി',
      detectedCity: 'നഗരം',
      isThisCorrect: 'ഇത് ശരിയാണോ?',
      changeLanguage: 'ഭാഷ മാറ്റുക',
      
      // Script Choice
      scriptChoiceTitle: 'നിങ്ങൾ എങ്ങനെ വായിക്കാൻ ആഗ്രഹിക്കുന്നു?',
      pureLanguage: 'മലയാളം',
      pureLanguageDesc: 'മലയാളം ലിപിയിൽ എല്ലാം',
      languagePlusEnglish: '+ English',
      languagePlusEnglishDesc: 'ഇംഗ്ലീഷ് അക്ഷരങ്ങളിൽ',
      or: 'അല്ലെങ്കിൽ',
      
      // Tutorial
      swagatTitle: 'സ്വാഗതം',
      swagatDesc: 'ഞങ്ങളുടെ കുടുംബത്തിലേക്ക് സ്വാഗതം',
    },
    latin: {
      // Common
      welcome: 'Namaskaaram',
      continue: 'Thudaruka',
      back: 'Pinnottu',
      skip: 'Ozhivaakkuka',
      next: 'Aduthathu',
      yes: 'Athe',
      no: 'Alla',
      
      // Location Permission
      locationTitle: 'Sthalam Anumathi',
      locationDesc: 'Ningalude bhasha kandethaan ningalude sthalam aavashyam aanu',
      allowLocation: 'Sthalam anumathi nalkuka',
      chooseManually: 'Njaan thiranjedukkum',
      
      // Language Confirm
      languageDetected: 'Bhasha kandethi',
      detectedCity: 'Nagaram',
      isThisCorrect: 'Ithu shariyaano?',
      changeLanguage: 'Bhasha maattuka',
      
      // Script Choice
      scriptChoiceTitle: 'Ningal engane vaayikkaan aagrahikkunnu?',
      pureLanguage: 'Malayalam',
      pureLanguageDesc: 'Malayalam lipiyil ellam',
      languagePlusEnglish: '+ English',
      languagePlusEnglishDesc: 'English aksharangalil',
      or: 'Allenkil',
      
      // Tutorial
      swagatTitle: 'Swaagatham',
      swagatDesc: 'Engalude kudumbathilekku swaagatham',
    },
  },
  
  Marathi: {
    native: {
      // Common
      welcome: 'नमस्कार',
      continue: 'चालू ठेवा',
      back: 'मागे',
      skip: 'वगळा',
      next: 'पुढे',
      yes: 'हो',
      no: 'नाही',
      
      // Location Permission
      locationTitle: 'स्थान परवानगी',
      locationDesc: 'तुमची भाषा शोधण्यासाठी तुमचे स्थान आवश्यक आहे',
      allowLocation: 'स्थान परवानगी द्या',
      chooseManually: 'मी निवडेन',
      
      // Language Confirm
      languageDetected: 'भाषा आढळली',
      detectedCity: 'शहर',
      isThisCorrect: 'हे बरोबर आहे का?',
      changeLanguage: 'भाषा बदला',
      
      // Script Choice
      scriptChoiceTitle: 'तुम्ही कसे वाचू इच्छिता?',
      pureLanguage: 'मराठी',
      pureLanguageDesc: 'मराठी लिपीत सर्व काही',
      languagePlusEnglish: '+ English',
      languagePlusEnglishDesc: 'इंग्रजी अक्षरांमध्ये',
      or: 'किंवा',
      
      // Tutorial
      swagatTitle: 'स्वागत',
      swagatDesc: 'आमच्या कुटुंबात तुमचे स्वागत',
    },
    latin: {
      // Common
      welcome: 'Namaskaar',
      continue: 'Chaalu theva',
      back: 'Maage',
      skip: 'Vagala',
      next: 'Pudhe',
      yes: 'Ho',
      no: 'Naahi',
      
      // Location Permission
      locationTitle: 'Sthaan Parvaanagi',
      locationDesc: 'Tumchi bhaasha shodhnyasaathi tumche sthaan aavashyak aahe',
      allowLocation: 'Sthaan parvaanagi dyaa',
      chooseManually: 'Mi nivaden',
      
      // Language Confirm
      languageDetected: 'Bhaasha aadhaali',
      detectedCity: 'Shehar',
      isThisCorrect: 'He barobar aahe kaa?',
      changeLanguage: 'Bhaasha badlaa',
      
      // Script Choice
      scriptChoiceTitle: 'Tumhi kase vaachu ichhita?',
      pureLanguage: 'Marathi',
      pureLanguageDesc: 'Marathi lipiit sarva kaahi',
      languagePlusEnglish: '+ English',
      languagePlusEnglishDesc: 'Ingraji aksharaam madhye',
      or: 'Kinva',
      
      // Tutorial
      swagatTitle: 'Swaagat',
      swagatDesc: 'Aamachya kutumbaat tumche swaagat',
    },
  },
  
  Gujarati: {
    native: {
      // Common
      welcome: 'નમસ્તે',
      continue: 'ચાલુ રાખો',
      back: 'પાછા',
      skip: 'છોડો',
      next: 'આગળ',
      yes: 'હા',
      no: 'ના',
      
      // Location Permission
      locationTitle: 'સ્થાન પરવાનગી',
      locationDesc: 'તમારી ભાષા શોધવા માટે તમારું સ્થાન જરૂરી છે',
      allowLocation: 'સ્થાન પરવાનગી આપો',
      chooseManually: 'હું પસંદ કરીશ',
      
      // Language Confirm
      languageDetected: 'ભાષા મળી',
      detectedCity: 'શહેર',
      isThisCorrect: 'શું આ સાચું છે?',
      changeLanguage: 'ભાષા બદલો',
      
      // Script Choice
      scriptChoiceTitle: 'તમે કેવી રીતે વાંચવા માંગો છો?',
      pureLanguage: 'ગુજરાતી',
      pureLanguageDesc: 'ગુજરાતી લિપિમાં બધું',
      languagePlusEnglish: '+ English',
      languagePlusEnglishDesc: 'અંગ્રેજી અક્ષરોમાં',
      or: 'અથવા',
      
      // Tutorial
      swagatTitle: 'સ્વાગત',
      swagatDesc: 'અમારા કુટુંબમાં તમારું સ્વાગત',
    },
    latin: {
      // Common
      welcome: 'Namaste',
      continue: 'Chaalu raakho',
      back: 'Paachha',
      skip: 'Chhodo',
      next: 'Aagal',
      yes: 'Haa',
      no: 'Naa',
      
      // Location Permission
      locationTitle: 'Sthaan Parvaanagi',
      locationDesc: 'Tamaari bhaasha shodhava maate tamaaru sthaan jaroori che',
      allowLocation: 'Sthaan parvaanagi aapo',
      chooseManually: 'Hu pasand karish',
      
      // Language Confirm
      languageDetected: 'Bhaasha malyu',
      detectedCity: 'Shehar',
      isThisCorrect: 'Shu sa saachu che?',
      changeLanguage: 'Bhaasha badalo',
      
      // Script Choice
      scriptChoiceTitle: 'Tame kevi rite vaanchava maango cho?',
      pureLanguage: 'Gujarati',
      pureLanguageDesc: 'Gujarati lipima badhu',
      languagePlusEnglish: '+ English',
      languagePlusEnglishDesc: 'Angreji aksharo ma',
      or: 'Athava',
      
      // Tutorial
      swagatTitle: 'Swaagat',
      swagatDesc: 'Amaara kutumb ma tamaaru swaagat',
    },
  },
  
  Punjabi: {
    native: {
      // Common
      welcome: 'ਸਤ ਸ੍ਰੀ ਅਕਾਲ',
      continue: 'ਜਾਰੀ ਰੱਖੋ',
      back: 'ਵਾਪਸ',
      skip: 'ਛੱਡੋ',
      next: 'ਅੱਗੇ',
      yes: 'ਹਾਂ',
      no: 'ਨਹੀਂ',
      
      // Location Permission
      locationTitle: 'ਸਥਾਨ ਇਜਾਜ਼ਤ',
      locationDesc: 'ਤੁਹਾਡੀ ਭਾਸ਼ਾ ਲੱਭਣ ਲਈ ਤੁਹਾਡਾ ਸਥਾਨ ਲੋੜੀਂਦਾ ਹੈ',
      allowLocation: 'ਸਥਾਨ ਇਜਾਜ਼ਤ ਦਿਓ',
      chooseManually: 'ਮੈਂ ਚੁਣਾਂਗਾ',
      
      // Language Confirm
      languageDetected: 'ਭਾਸ਼ਾ ਲੱਭੀ',
      detectedCity: 'ਸ਼ਹਿਰ',
      isThisCorrect: 'ਕੀ ਇਹ ਸਹੀ ਹੈ?',
      changeLanguage: 'ਭਾਸ਼ਾ ਬਦਲੋ',
      
      // Script Choice
      scriptChoiceTitle: 'ਤੁਸੀਂ ਕਿਵੇਂ ਪੜ੍ਹਨਾ ਚਾਹੁੰਦੇ ਹੋ?',
      pureLanguage: 'ਪੰਜਾਬੀ',
      pureLanguageDesc: 'ਪੰਜਾਬੀ ਲਿਪੀ ਵਿੱਚ ਸਭ ਕੁਝ',
      languagePlusEnglish: '+ English',
      languagePlusEnglishDesc: 'ਅੰਗਰੇਜ਼ੀ ਅੱਖਰਾਂ ਵਿੱਚ',
      or: 'ਜਾਂ',
      
      // Tutorial
      swagatTitle: 'ਸਵਾਗਤ',
      swagatDesc: 'ਸਾਡੇ ਪਰਿਵਾਰ ਵਿੱਚ ਤੁਹਾਡਾ ਸਵਾਗਤ',
    },
    latin: {
      // Common
      welcome: 'Sat Sri Akaal',
      continue: 'Jaari rakho',
      back: 'Waapas',
      skip: 'Chhaddo',
      next: 'Agge',
      yes: 'Haan',
      no: 'Nahin',
      
      // Location Permission
      locationTitle: 'Sthaan Ijaazat',
      locationDesc: 'Tuhaadi bhaasha labhan lai tuhadaa sthaan lorinda hai',
      allowLocation: 'Sthaan ijaazat dio',
      chooseManually: 'Main chunaanga',
      
      // Language Confirm
      languageDetected: 'Bhaasha labhi',
      detectedCity: 'Shehar',
      isThisCorrect: 'Ki eh sahi hai?',
      changeLanguage: 'Bhaasha badlo',
      
      // Script Choice
      scriptChoiceTitle: 'Tusii kiven padhna chaahunde ho?',
      pureLanguage: 'Punjabi',
      pureLanguageDesc: 'Punjabi lipi vich sabh kuch',
      languagePlusEnglish: '+ English',
      languagePlusEnglishDesc: 'Angrezi akkhraan vich',
      or: 'Jaan',
      
      // Tutorial
      swagatTitle: 'Swaagat',
      swagatDesc: 'Saade parivaar vich tuhadaa swaagat',
    },
  },
  
  Odia: {
    native: {
      // Common
      welcome: 'ନମସ୍କାର',
      continue: 'ଜାରି ରଖନ୍ତୁ',
      back: 'ପଛକୁ',
      skip: 'ଛାଡ଼ନ୍ତୁ',
      next: 'ପରବର୍ତ୍ତୀ',
      yes: 'ହଁ',
      no: 'ନାହିଁ',
      
      // Location Permission
      locationTitle: 'ସ୍ଥାନ ଅନୁମତି',
      locationDesc: 'ଆପଣଙ୍କ ଭାଷା ଖୋଜିବା ପାଇଁ ଆପଣଙ୍କ ସ୍ଥାନ ଆବଶ୍ୟକ',
      allowLocation: 'ସ୍ଥାନ ଅନୁମତି ଦିଅନ୍ତୁ',
      chooseManually: 'ମୁଁ ବାଛିବି',
      
      // Language Confirm
      languageDetected: 'ଭାଷା ମିଳିଲା',
      detectedCity: 'ସହର',
      isThisCorrect: 'ଏହା ସଠିକ୍ କି?',
      changeLanguage: 'ଭାଷା ପରିବର୍ତ୍ତନ',
      
      // Script Choice
      scriptChoiceTitle: 'ଆପଣ କେମିତି ପଢ଼ିବାକୁ ଚାହାଁନ୍ତି?',
      pureLanguage: 'ଓଡ଼ିଆ',
      pureLanguageDesc: 'ଓଡ଼ିଆ ଲିପିରେ ସମସ୍ତ',
      languagePlusEnglish: '+ English',
      languagePlusEnglishDesc: 'ଇଂରାଜୀ ଅକ୍ଷରରେ',
      or: 'କିମ୍ବା',
      
      // Tutorial
      swagatTitle: 'ସ୍ୱାଗତ',
      swagatDesc: 'ଆମ ପରିବାରକୁ ଆପଣଙ୍କୁ ସ୍ୱାଗତ',
    },
    latin: {
      // Common
      welcome: 'Namaskaara',
      continue: 'Jaari rakhaantu',
      back: 'Pachhaku',
      skip: 'Chhaadantu',
      next: 'Parabartti',
      yes: 'Han',
      no: 'Naahi',
      
      // Location Permission
      locationTitle: 'Sthaana Anumati',
      locationDesc: 'Aapanka bhaasha khojiba paain aapanka sthaana aabashyaka',
      allowLocation: 'Sthaana anumati diaantu',
      chooseManually: 'Mun baanchibi',
      
      // Language Confirm
      languageDetected: 'Bhaasha milila',
      detectedCity: 'Sahara',
      isThisCorrect: 'Ehaa sahi ka?',
      changeLanguage: 'Bhaasha paribartana',
      
      // Script Choice
      scriptChoiceTitle: 'Aapana kemiti padhibaku chaahaanti?',
      pureLanguage: 'Odia',
      pureLanguageDesc: 'Odia lipire samasta',
      languagePlusEnglish: '+ English',
      languagePlusEnglishDesc: 'Inghraaji akshyara re',
      or: 'Kimbaa',
      
      // Tutorial
      swagatTitle: 'Swaagata',
      swagatDesc: 'Ama paribaaraku aapanku swaagata',
    },
  },
  
  Sanskrit: {
    native: {
      // Common
      welcome: 'नमस्कार',
      continue: 'चालयन्तु',
      back: 'पश्चात्',
      skip: 'परित्यज्यतु',
      next: 'अग्रिम',
      yes: 'अस्तु',
      no: 'न',
      
      // Location Permission
      locationTitle: 'स्थान अनुमति',
      locationDesc: 'त्वदीयां भाषां ज्ञातुं तव स्थानम् आवश्यकम्',
      allowLocation: 'स्थान अनुमतिं ददातु',
      chooseManually: 'अहं वरिष्यामि',
      
      // Language Confirm
      languageDetected: 'भाषा लब्धा',
      detectedCity: 'नगरम्',
      isThisCorrect: 'एतत् सत्यम् अस्ति?',
      changeLanguage: 'भाषां परिवर्तय',
      
      // Script Choice
      scriptChoiceTitle: 'कथं पठितुम् इच्छसि?',
      pureLanguage: 'संस्कृत',
      pureLanguageDesc: 'संस्कृत लिप्यां सर्वम्',
      languagePlusEnglish: '+ English',
      languagePlusEnglishDesc: 'आङ्ग्ल अक्षरेषु',
      or: 'अथवा',
      
      // Tutorial
      swagatTitle: 'स्वागतम्',
      swagatDesc: 'अस्माकं कुटुम्बे तव स्वागतम्',
    },
    latin: {
      // Common
      welcome: 'Namaskaara',
      continue: 'Chaalayantu',
      back: 'Pashchaat',
      skip: 'Parityajyatu',
      next: 'Agrima',
      yes: 'Astu',
      no: 'Na',
      
      // Location Permission
      locationTitle: 'Sthaana Anumati',
      locationDesc: 'Tvadeeyam bhaashaam gyaatum tava sthaanam aavashyakam',
      allowLocation: 'Sthaana anumati dadaatu',
      chooseManually: 'Aham varishyaami',
      
      // Language Confirm
      languageDetected: 'Bhaasha labdhaa',
      detectedCity: 'Nagaram',
      isThisCorrect: 'Etat satyam asti?',
      changeLanguage: 'Bhaashaam parivartaya',
      
      // Script Choice
      scriptChoiceTitle: 'Katham pathitum ichchhasi?',
      pureLanguage: 'Sanskrit',
      pureLanguageDesc: 'Sanskrit lipyaam sarvam',
      languagePlusEnglish: '+ English',
      languagePlusEnglishDesc: 'Aangla akshare shu',
      or: 'Athavaa',
      
      // Tutorial
      swagatTitle: 'Swaagatam',
      swagatDesc: 'Asmaakan kutumbe tava swaagatam',
    },
  },
  
  Bhojpuri: {
    native: {
      // Common
      welcome: 'नमस्ते',
      continue: 'चालू रखी',
      back: 'पाछू',
      skip: 'छोड़ी',
      next: 'आगे',
      yes: 'हाँ',
      no: 'ना',
      
      // Location Permission
      locationTitle: 'जगह अनुमति',
      locationDesc: 'तोर भाषा ढूँढे खातिर तोर जगह चाहीं',
      allowLocation: 'जगह अनुमति दी',
      chooseManually: 'हम चुनब',
      
      // Language Confirm
      languageDetected: 'भाषा मिलल',
      detectedCity: 'शहर',
      isThisCorrect: 'ई सही बा?',
      changeLanguage: 'भाषा बदली',
      
      // Script Choice
      scriptChoiceTitle: 'तू कइसे पढ़ी चाहत बा?',
      pureLanguage: 'भोजपुरी',
      pureLanguageDesc: 'भोजपुरी लिपि में सब',
      languagePlusEnglish: '+ English',
      languagePlusEnglishDesc: 'अंग्रेजी अक्षर में',
      or: 'या',
      
      // Tutorial
      swagatTitle: 'स्वागत',
      swagatDesc: 'हमार परिवार में तोर स्वागत',
    },
    latin: {
      // Common
      welcome: 'Namaste',
      continue: 'Chaalu rakhi',
      back: 'Paachhu',
      skip: 'Chhodi',
      next: 'Aage',
      yes: 'Haan',
      no: 'Naa',
      
      // Location Permission
      locationTitle: 'Jagah Anumati',
      locationDesc: 'Tor bhaasha dhoondhe khaatir tor jagah chaahi',
      allowLocation: 'Jagah anumati di',
      chooseManually: 'Ham chunab',
      
      // Language Confirm
      languageDetected: 'Bhaasha milal',
      detectedCity: 'Shehar',
      isThisCorrect: 'E sahi baa?',
      changeLanguage: 'Bhaasha badli',
      
      // Script Choice
      scriptChoiceTitle: 'Tu kaise padhi chaahat baa?',
      pureLanguage: 'Bhojpuri',
      pureLanguageDesc: 'Bhojpuri lipi mein sab',
      languagePlusEnglish: '+ English',
      languagePlusEnglishDesc: 'Angreji akshar mein',
      or: 'Yaa',
      
      // Tutorial
      swagatTitle: 'Swaagat',
      swagatDesc: 'Hamaar parivaar mein tor swaagat',
    },
  },
  
  Maithili: {
    native: {
      // Common
      welcome: 'नमस्कार',
      continue: 'चालू राखी',
      back: 'पाछू',
      skip: 'छोड़ी',
      next: 'आगाँ',
      yes: 'हाँ',
      no: 'नहि',
      
      // Location Permission
      locationTitle: 'स्थान अनुमति',
      locationDesc: 'अहाँक भाषा खोजबाक लेल अहाँक स्थान चाही',
      allowLocation: 'स्थान अनुमति दियौ',
      chooseManually: 'हम चुनब',
      
      // Language Confirm
      languageDetected: 'भाषा भेटल',
      detectedCity: 'शहर',
      isThisCorrect: 'ई सही अछि?',
      changeLanguage: 'भाषा बदलू',
      
      // Script Choice
      scriptChoiceTitle: 'अहाँ केना पढ़ब चाहैत छी?',
      pureLanguage: 'मैथिली',
      pureLanguageDesc: 'मैथिली लिपि में सब',
      languagePlusEnglish: '+ English',
      languagePlusEnglishDesc: 'अंग्रेजी अक्षर में',
      or: 'वा',
      
      // Tutorial
      swagatTitle: 'स्वागत',
      swagatDesc: 'हमर परिवार में अहाँक स्वागत',
    },
    latin: {
      // Common
      welcome: 'Namaskaar',
      continue: 'Chaalu raakhi',
      back: 'Paachhu',
      skip: 'Chhodi',
      next: 'Aagaan',
      yes: 'Haan',
      no: 'Nahi',
      
      // Location Permission
      locationTitle: 'Sthaan Anumati',
      locationDesc: 'Aahaank bhaasha khojabaak lel aahaank sthaan chaahi',
      allowLocation: 'Sthaan anumati diyau',
      chooseManually: 'Ham chunab',
      
      // Language Confirm
      languageDetected: 'Bhaasha bhetal',
      detectedCity: 'Shehar',
      isThisCorrect: 'E sahi achhi?',
      changeLanguage: 'Bhaasha badalu',
      
      // Script Choice
      scriptChoiceTitle: 'Aahaan kena padhab chaahait chhi?',
      pureLanguage: 'Maithili',
      pureLanguageDesc: 'Maithili lipi mein sab',
      languagePlusEnglish: '+ English',
      languagePlusEnglishDesc: 'Angreji akshar mein',
      or: 'Vaa',
      
      // Tutorial
      swagatTitle: 'Swaagat',
      swagatDesc: 'Hamr parivaar mein aahaank swaagat',
    },
  },
  
  Assamese: {
    native: {
      // Common
      welcome: 'নমস্কাৰ',
      continue: 'অব্যাহত ৰাখক',
      back: 'পিছলৈ',
      skip: 'এৰাই চলক',
      next: 'পৰৱৰ্তী',
      yes: 'হয়',
      no: 'নহয়',
      
      // Location Permission
      locationTitle: 'অৱস্থান অনুমতি',
      locationDesc: 'আপোনাৰ ভাষা বিচাৰিবলৈ আপোনাৰ অৱস্থানৰ প্ৰয়োজন',
      allowLocation: 'অৱস্থান অনুমতি দিয়ক',
      chooseManually: 'মই বাছি লম',
      
      // Language Confirm
      languageDetected: 'ভাষা পোৱা গল',
      detectedCity: 'চহৰ',
      isThisCorrect: 'এইটো শুনে?',
      changeLanguage: 'ভাষা সলনি কৰক',
      
      // Script Choice
      scriptChoiceTitle: 'আপুনি কেনেকৈ পঢ়িব বিচাৰে?',
      pureLanguage: 'অসমীয়া',
      pureLanguageDesc: 'অসমীয়া লিপিত সকলো',
      languagePlusEnglish: '+ English',
      languagePlusEnglishDesc: 'ইংৰাজী আখৰত',
      or: 'নে',
      
      // Tutorial
      swagatTitle: 'আদৰণি',
      swagatDesc: 'আমাৰ পৰিয়াললৈ আপোনাক আদৰণি',
    },
    latin: {
      // Common
      welcome: 'Nomoskaara',
      continue: 'Obyaahoto raakho',
      back: 'Pichholoi',
      skip: 'Eraai cholok',
      next: 'Poroborti',
      yes: 'Hoy',
      no: 'Nofoy',
      
      // Location Permission
      locationTitle: 'Owosthaan Anumoti',
      locationDesc: 'Aapunaar bhaasha bichaaribole aapunaar owosthaanor proyojon',
      allowLocation: 'Owosthaan anumoti diyok',
      chooseManually: 'Moi baachi lom',
      
      // Language Confirm
      languageDetected: 'Bhaasha puwa gol',
      detectedCity: 'Sohor',
      isThisCorrect: 'Eitu xune?',
      changeLanguage: 'Bhaasha soloni korok',
      
      // Script Choice
      scriptChoiceTitle: 'Aapuni kenekei porhib bichare?',
      pureLanguage: 'Axomiya',
      pureLanguageDesc: 'Axomiya lipit xokol',
      languagePlusEnglish: '+ English',
      languagePlusEnglishDesc: 'Ingraji akhorot',
      or: 'Ne',
      
      // Tutorial
      swagatTitle: 'Adoroni',
      swagatDesc: 'Amaar poriyaloloi aapunaak adoroni',
    },
  },
  
  English: {
    native: {
      // Common
      welcome: 'Welcome',
      continue: 'Continue',
      back: 'Back',
      skip: 'Skip',
      next: 'Next',
      yes: 'Yes',
      no: 'No',
      
      // Location Permission
      locationTitle: 'Location Permission',
      locationDesc: 'We need your location to detect your language',
      allowLocation: 'Allow Location',
      chooseManually: 'Choose Manually',
      
      // Language Confirm
      languageDetected: 'Language Detected',
      detectedCity: 'City',
      isThisCorrect: 'Is this correct?',
      changeLanguage: 'Change Language',
      
      // Script Choice
      scriptChoiceTitle: 'How would you like to read?',
      pureLanguage: 'Pure',
      pureLanguageDesc: 'Everything in native script',
      languagePlusEnglish: '+ English',
      languagePlusEnglishDesc: 'In English letters',
      or: 'OR',
      
      // Tutorial
      swagatTitle: 'Welcome',
      swagatDesc: 'Welcome to our family',
    },
    latin: {
      // Common - same as native for English
      welcome: 'Welcome',
      continue: 'Continue',
      back: 'Back',
      skip: 'Skip',
      next: 'Next',
      yes: 'Yes',
      no: 'No',
      
      // Location Permission
      locationTitle: 'Location Permission',
      locationDesc: 'We need your location to detect your language',
      allowLocation: 'Allow Location',
      chooseManually: 'Choose Manually',
      
      // Language Confirm
      languageDetected: 'Language Detected',
      detectedCity: 'City',
      isThisCorrect: 'Is this correct?',
      changeLanguage: 'Change Language',
      
      // Script Choice
      scriptChoiceTitle: 'How would you like to read?',
      pureLanguage: 'Pure',
      pureLanguageDesc: 'Everything in native script',
      languagePlusEnglish: '+ English',
      languagePlusEnglishDesc: 'In English letters',
      or: 'OR',
      
      // Tutorial
      swagatTitle: 'Welcome',
      swagatDesc: 'Welcome to our family',
    },
  },
};

// Helper function to get translation with script preference
export function getTranslation(
  language: SupportedLanguage,
  key: string,
  scriptPreference: ScriptPreference = 'native'
): string {
  const translations = ONBOARDING_TRANSLATIONS[language];
  if (!translations) {
    console.warn(`No translations found for language: ${language}`);
    return key;
  }
  
  const scriptTranslations = translations[scriptPreference];
  if (!scriptTranslations) {
    console.warn(`No ${scriptPreference} translations found for language: ${language}`);
    return key;
  }
  
  return scriptTranslations[key] || translations.native[key] || key;
}

// Helper function to get all translations for a language with script preference
export function getLanguageTranslations(
  language: SupportedLanguage,
  scriptPreference: ScriptPreference = 'native'
): Record<string, string> {
  const translations = ONBOARDING_TRANSLATIONS[language];
  if (!translations) {
    console.warn(`No translations found for language: ${language}`);
    return {};
  }
  
  return translations[scriptPreference] || translations.native;
}
