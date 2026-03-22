/**
 * HmarePanditJi — Complete Voice Script Library
 * All 22 screens (S-0.0.1 through S-0.12) with exact Hindi Devanagari scripts
 * From: HPJ_Voice_System_Complete.md
 */

import type { SupportedLanguage } from '@/lib/onboarding-store'

export interface VoiceScript {
  hindi: string      // Devanagari text (feed to Sarvam TTS)
  roman?: string     // Roman transliteration (developer reference)
  english?: string   // English meaning (developer reference)
  durationSec?: number
}

export interface ScreenVoiceScripts {
  screenId: string
  scripts: {
    main: VoiceScript
    reprompt?: VoiceScript
    onYes?: VoiceScript
    onNo?: VoiceScript
    onTimeout12s?: VoiceScript
    onTimeout24s?: VoiceScript
    onSuccess?: VoiceScript
    onError?: VoiceScript
    [key: string]: VoiceScript | undefined
  }
}

// ─────────────────────────────────────────────────────────────
// PART 0.0: LANGUAGE SELECTION SCREENS (S-0.0.1 to S-0.0.8)
// ─────────────────────────────────────────────────────────────

export const SPLASH_SCREEN: ScreenVoiceScripts = {
  screenId: 'S-0.0.1',
  scripts: {
    main: {
      hindi: '',
      roman: '[SILENT]',
      english: 'No voice on splash screen - phone may be in pocket',
      durationSec: 0,
    },
  },
}

export const LOCATION_PERMISSION_SCREEN: ScreenVoiceScripts = {
  screenId: 'S-0.0.2',
  scripts: {
    main: {
      hindi: 'नमस्ते। मैं आपका शहर जानना चाहता हूँ — ताकि आपकी भाषा अपने आप सेट हो जाए, और आपके शहर की पूजाएं आपको मिलें। आपका पूरा पता किसी को नहीं दिखेगा। क्या आप अनुमति देंगे? हाँ बोलें या नीचे बटन दबाएं।',
      roman: 'Namaste. Main aapka shehar jaanna chahta hoon — taaki aapki bhasha apne aap set ho jaye, aur aapke shehar ki poojayen aapko milin. Aapka poora pata kisi ko nahi dikhega. Kya aap anumati denge? Haan bolein ya neeche button dabayein.',
      english: 'Hello. I want to know your city — so your language sets automatically and you get poojas from your city. Your full address will not be shown to anyone. Will you allow it? Say "yes" or press the button below.',
      durationSec: 8,
    },
    onPermissionGranted: {
      hindi: 'शहर मिल गया। आपके लिए भाषा सेट हो रही है।',
      roman: 'Shehar mil gaya. Aapke liye bhasha set ho rahi hai.',
      durationSec: 2,
    },
    onPermissionDenied: {
      hindi: 'कोई बात नहीं। आप खुद बताइए।',
      roman: 'Koi baat nahi. Aap khud bataiye.',
      durationSec: 2,
    },
    reprompt: {
      hindi: 'कृपया हाँ बोलें या नीचे बटन दबाएं।',
      roman: 'Kripya Haan bolein ya neeche button dabayein.',
      durationSec: 2,
    },
  },
}

export const MANUAL_CITY_SCREEN: ScreenVoiceScripts = {
  screenId: 'S-0.0.2B',
  scripts: {
    main: {
      hindi: 'कोई बात नहीं। बस अपना शहर बताइए। बोल सकते हैं — जैसे वाराणसी या दिल्ली — या नीचे से छू सकते हैं।',
      roman: 'Koi baat nahi. Bas apna shehar bataiye. Bol sakte hain — jaise Varanasi ya Delhi — ya neeche se chhoo sakte hain.',
      durationSec: 5,
    },
    onCityDetected: {
      hindi: '{CITY} — सही है? हाँ बोलें।',
      roman: '{CITY} — sahi hai? Haan bolein.',
      durationSec: 2,
    },
    reprompt: {
      hindi: 'आवाज़ नहीं पहचान पाया। नीचे से अपना शहर चुनें या लिखें।',
      roman: 'Aawaz nahi pehchaan paya. Neeche se apna shehar chunein ya likhein.',
      durationSec: 3,
    },
  },
}

export const LANGUAGE_CONFIRM_SCREEN: ScreenVoiceScripts = {
  screenId: 'S-0.0.3',
  scripts: {
    main: {
      hindi: '{CITY} के हिसाब से हम {LANGUAGE} सेट कर रहे हैं। क्या यह ठीक है? हाँ बोलें या बदलें बोलें।',
      roman: '{CITY} ke hisaab se hum {LANGUAGE} set kar rahe hain. Kya yeh theek hai? Haan bolein ya Badlein bolein.',
      durationSec: 4,
    },
    onYesConfirmed: {
      hindi: 'बहुत अच्छा।',
      roman: 'Bahut achha.',
      durationSec: 1,
    },
    onChangeRequested: {
      hindi: 'ठीक है। आप कौन सी भाषा चाहते हैं?',
      roman: 'Theek hai. Aap kaun si bhasha chahte hain?',
      durationSec: 2,
    },
    reprompt: {
      hindi: 'कृपया हाँ या बदलें बोलें, या नीचे बटन दबाएं।',
      roman: 'Kripya Haan ya Badlein bolein, ya neeche button dabayein.',
      durationSec: 3,
    },
  },
}

export const LANGUAGE_LIST_SCREEN: ScreenVoiceScripts = {
  screenId: 'S-0.0.4',
  scripts: {
    main: {
      hindi: 'कृपया अपनी भाषा का नाम बोलिए। जैसे — भोजपुरी, Tamil, Telugu, Bengali — या नीचे से चुनें।',
      roman: 'Kripya apni bhasha ka naam boliye. Jaise — Bhojpuri, Tamil, Telugu, Bengali — ya neeche se chunein.',
      durationSec: 5,
    },
    onLanguageDetected: {
      hindi: '{LANGUAGE}? सही है?',
      roman: '{LANGUAGE}? Sahi hai?',
      durationSec: 2,
    },
    reprompt: {
      hindi: 'आवाज़ नहीं पहचान पाया। नीचे से भाषा छूकर चुनें।',
      roman: 'Aawaz nahi pehchaan paya. Neeche se bhasha chhookar chunein.',
      durationSec: 3,
    },
    onUnsupported: {
      hindi: 'अभी यह भाषा उपलब्ध नहीं है। सबसे नज़दीकी भाषा — हिंदी या English — चल सकती है।',
      roman: 'Abhi yeh bhasha uplabdh nahi hai. Sabse najdeeki bhasha — Hindi ya English — chal sakti hai.',
      durationSec: 4,
    },
  },
}

export const LANGUAGE_CHOICE_CONFIRM_SCREEN: ScreenVoiceScripts = {
  screenId: 'S-0.0.5',
  scripts: {
    main: {
      hindi: 'आपने {LANGUAGE} कही। सही है? हाँ बोलें या नहीं बोलें।',
      roman: 'Aapne {LANGUAGE} kahi. Sahi hai? Haan bolein ya Nahi bolein.',
      durationSec: 3,
    },
    onYesConfirmed: {
      hindi: 'बहुत अच्छा।',
      roman: 'Bahut achha.',
      durationSec: 1,
    },
    onNoSaid: {
      hindi: 'ठीक है, फिर से चुनते हैं।',
      roman: 'Theek hai, phir se chunte hain.',
      durationSec: 2,
    },
    reprompt: {
      hindi: '{LANGUAGE} — सही है? बटन दबाइए।',
      roman: '{LANGUAGE} — sahi hai? Button dabaiye.',
      durationSec: 2,
    },
  },
}

export const LANGUAGE_SET_SCREEN: ScreenVoiceScripts = {
  screenId: 'S-0.0.6',
  scripts: {
    main: {
      hindi: 'बहुत अच्छा! अब हम आपसे {LANGUAGE} में बात करेंगे।',
      roman: 'Bahut achha! Ab hum aapse {LANGUAGE} mein baat karenge.',
      durationSec: 3,
    },
  },
}

export const HELP_SCREEN: ScreenVoiceScripts = {
  screenId: 'S-0.0.7',
  scripts: {
    main: {
      hindi: 'कोई बात नहीं। हम मदद के लिए यहाँ हैं। हमारी team से बात करें — बिल्कुल मुफ़्त। या नीचे वापस जाएं दबाएं अगर खुद करना हो।',
      roman: 'Koi baat nahi. Hum madad ke liye yahan hain. Humari team se baat karein — bilkul muft. Ya neeche Wapas jaayein dabayein agar khud karna ho.',
      durationSec: 5,
    },
  },
}

export const VOICE_TUTORIAL_SCREEN: ScreenVoiceScripts = {
  screenId: 'S-0.0.8',
  scripts: {
    main: {
      hindi: 'एक छोटी सी बात। यह app आपकी आवाज़ से चलता है। जब यह orange mic दिखे और सुन रहा हूँ लिखा हो — तब बोलिए। अभी कोशिश करिए — हाँ या नहीं बोलिए।',
      roman: 'Ek chhoti si baat. Yeh app aapki aawaz se chalta hai. Jab yeh orange mic dikhe aur sun raha hoon likha ho — tab boliye. Abhi koshish kariye — Haan ya Nahi boliye.',
      durationSec: 8,
    },
    onSuccess: {
      hindi: 'वाह! बिल्कुल सही। आप बहुत अच्छा कर रहे हैं।',
      roman: 'Wah! Bilkul sahi. Aap bahut achha kar rahe hain.',
      durationSec: 3,
    },
    onTimeout: {
      hindi: 'कोई बात नहीं अगर बोलने में दिक्कत हो। नीचे Keyboard भी है। आगे चलें बटन दबाइए।',
      roman: 'Koi baat nahi agar bolne mein dikkat ho. Neeche Keyboard bhi hai. Aage chalein button dabaiye.',
      durationSec: 5,
    },
  },
}

// ─────────────────────────────────────────────────────────────
// PART 0: WELCOME TUTORIAL SCREENS (S-0.1 to S-0.12)
// ─────────────────────────────────────────────────────────────

export const TUTORIAL_SWAGAT: ScreenVoiceScripts = {
  screenId: 'S-0.1',
  scripts: {
    main: {
      hindi: 'नमस्ते पंडित जी। HmarePanditJi पर आपका बहुत-बहुत स्वागत है। यह platform आपके लिए ही बना है। अगले दो मिनट में हम देखेंगे कि यह app आपकी आमदनी में क्या बदलाव ला सकता है। हमारा Mool Mantra याद रखिए — App पंडित के लिए है, पंडित App के लिए नहीं। अगर सीधे Registration करना हो तो Skip बोलें। नहीं तो जानें बोलें।',
      roman: 'Namaste Pandit Ji. HmarePanditJi par aapka bahut-bahut swagat hai. Yeh platform aapke liye hi bana hai. Agle do minute mein hum dekhenge ki yeh app aapki aamdani mein kya badlav la sakta hai. Humara Mool Mantra yaad rakhiye — App Pandit ke liye hai, Pandit App ke liye nahi. Agar seedhe Registration karna ho to Skip bolein. Nahi to Jaanen bolein.',
      durationSec: 18,
    },
  },
}

export const TUTORIAL_INCOME: ScreenVoiceScripts = {
  screenId: 'S-0.2',
  scripts: {
    main: {
      hindi: 'सुनिए, वाराणसी के पंडित रामेश्वर शर्मा जी पहले महीने में अठारह हज़ार रुपये कमाते थे। आज वे तीन नए तरीकों से तिरसठ हज़ार कमा रहे हैं। मैं आपको भी यही तीन तरीके दिखाता हूँ। इन चार tiles में से जो समझना हो उसे छू सकते हैं। या आगे बोलकर सब एक-एक देख सकते हैं।',
      roman: 'Suniye, Varanasi ke Pandit Rameshwar Sharma Ji pehle mahine mein aatharah hazaar rupaye kamate the. Aaj woh teen naye tarikon se tirsath hazaar kama rahe hain. Main aapko bhi yahi teen tarike dikhata hoon. In chaar tiles mein se jo samajhna ho use chhoo sakte hain. Ya Aage bolkar sab ek-ek dekh sakte hain.',
      durationSec: 16,
    },
  },
}

export const TUTORIAL_DAKSHINA: ScreenVoiceScripts = {
  screenId: 'S-0.3',
  scripts: {
    main: {
      hindi: 'कितनी बार ऐसा हुआ है कि आपने दो घंटे की पूजा की — और ग्राहक ने कह दिया, भैया, तीन हज़ार नहीं, दो हज़ार ले लो। आप कुछ नहीं बोल पाए। अब नहीं होगा यह। आप खुद दक्षिणा तय करेंगे — platform कभी नहीं बदलेगी। ग्राहक को booking से पहले ही पता होता है — कितना देना है। मोलभाव खत्म। आगे बोलें।',
      roman: 'Kitni baar aisa hua hai ki aapne do ghante ki pooja ki — aur grahak ne keh diya, Bhaiya, teen hazaar nahi, do hazaar le lo. Aap kuch nahi bol paye. Ab nahi hoga yeh. Aap khud dakshina tay karenge — platform kabhi nahi badlegi. Grahak ko booking se pehle hi pata hota hai — kitna dena hai. Moalbhav khatam. Aage bolein.',
      durationSec: 18,
    },
  },
}

export const TUTORIAL_ONLINE_REVENUE: ScreenVoiceScripts = {
  screenId: 'S-0.4',
  scripts: {
    main: {
      hindi: 'दो बिल्कुल नए तरीके हैं — जो आप शायद अभी तक नहीं जानते। पहला — घर बैठे पूजा। Video call से पूजा कराइए। दुनिया भर के ग्राहक मिलेंगे — NRI भी। एक पूजा में दो हज़ार से पाँच हज़ार रुपये। दूसरा — पंडित से बात। Phone, video, या chat पर धार्मिक सलाह दीजिए। बीस रुपये से पचास रुपये प्रति मिनट। उदाहरण के तौर पर — बीस मिनट की एक call में आठ सौ रुपये सीधे आपको। दोनों मिलाकर — चालीस हज़ार रुपये अलग से हर महीने। आगे बोलें।',
      roman: 'Do bilkul naye tarike hain — jo aap shayad abhi tak nahi jaante. Pehla — Ghar Baithe Pooja. Video call se pooja karaiye. Duniya bhar ke grahak milenge — NRI bhi. Ek pooja mein do hazaar se paanch hazaar rupaye. Doosra — Pandit Se Baat. Phone, video, ya chat par dharmik salah dijiye. Bees rupaye se pachaas rupaye prati minute. Udaaharan ke taur par — bees minute ki ek call mein aath sau rupaye seedhe aapko. Dono milakar — chaalees hazaar rupaye alag se har mahine. Aage bolein.',
      durationSec: 22,
    },
  },
}

export const TUTORIAL_BACKUP: ScreenVoiceScripts = {
  screenId: 'S-0.5',
  scripts: {
    main: {
      hindi: 'यह सुनकर लगेगा — यह कैसे हो सकता है? मैं समझाता हूँ। जब कोई booking होती है जिसमें ग्राहक ने backup protection लिया होता है — आपको offer आता है। क्या आप उस दिन backup पंडित बनेंगे? आप हाँ कहते हैं। उस दिन free रहते हैं। अगर मुख्य पंडित ने पूजा कर ली — भी आपको दो हज़ार रुपये मिलेंगे। अगर मुख्य पंडित cancel किए — तो पूरी booking आपकी और ऊपर से दो हज़ार bonus। यह पैसा ग्राहक ने booking के समय backup protection की extra payment की थी। वही आपको मिलता है। दोनों तरफ से फ़ायदा। आगे बोलें।',
      roman: 'Yeh sunkar lagega — Yeh kaise ho sakta hai? Main samjhata hoon. Jab koi booking hoti hai jisme grahak ne backup protection liya hota hai — aapko offer aata hai. Kya aap us din backup Pandit banenge? Aap haan kehte hain. Us din free rehte hain. Agar mukhya Pandit ne pooja kar li — bhi aapko do hazaar rupaye milenge. Agar mukhya Pandit cancel kiye — to poori booking aapki aur upar se do hazaar bonus. Yeh paisa grahak ne booking ke samay backup protection ki extra payment ki thi. Wohi aapko milta hai. Dono taraf se faayda. Aage bolein.',
      durationSec: 28,
    },
  },
}

export const TUTORIAL_PAYMENT: ScreenVoiceScripts = {
  screenId: 'S-0.6',
  scripts: {
    main: {
      hindi: 'पूजा खत्म हुई। दो मिनट में पैसे बैंक में। कोई इंतज़ार नहीं। कोई कल देंगे नहीं। और देखो — platform का share भी screen पर दिखेगा। छुपा कुछ नहीं। Screen पर देखें — दक्षिणा, platform का हिस्सा, यात्रा भत्ता — सब साफ़। और नीचे लिखा है — आपको कितना मिला। आगे बोलें।',
      roman: 'Pooja khatam hui. Do minute mein paise bank mein. Koi intezaar nahi. Koi kal denge nahi. Aur dekho — platform ka share bhi screen par dikhega. Chhupa kuch nahi. Screen par dekhein — dakshina, platform ka hissa, yatra bhatta — sab saaf. Aur neeche likha hai — aapko kitna mila. Aage bolein.',
      durationSec: 16,
    },
  },
}

export const TUTORIAL_VOICE_NAV: ScreenVoiceScripts = {
  screenId: 'S-0.7',
  scripts: {
    main: {
      hindi: 'यह app आपकी आवाज़ से चलता है। टाइपिंग की कोई ज़रूरत नहीं। अभी कोशिश करिए — हाँ या नहीं बोलिए। Mic अभी सुन रहा है।',
      roman: 'Yeh app aapki aawaz se chalta hai. Typing ki koi zaroorat nahi. Abhi koshish kariye — Haan ya Nahi boliye. Mic abhi sun raha hai.',
      durationSec: 8,
    },
    onSuccess: {
      hindi: 'वाह! बिल्कुल सही। आप perfect कर रहे हैं।',
      roman: 'Wah! Bilkul sahi. Aap perfect kar rahe hain.',
      durationSec: 3,
    },
    onTimeout: {
      hindi: 'कोई बात नहीं। Keyboard से भी चलता है। नीचे Keyboard button हमेशा रहेगा।',
      roman: 'Koi baat nahi. Keyboard se bhi chalta hai. Neeche Keyboard button hamesha rahega.',
      durationSec: 4,
    },
    onHighNoise: {
      hindi: 'शोर ज़्यादा लग रहा है। शांत जगह पर जाकर try करें, या Keyboard use करें।',
      roman: 'Shor zyada lag raha hai. Shaant jagah par jakar try karein, ya Keyboard use karein.',
      durationSec: 4,
    },
  },
}

export const TUTORIAL_DUAL_MODE: ScreenVoiceScripts = {
  screenId: 'S-0.8',
  scripts: {
    main: {
      hindi: 'चाहे आपके पास smartphone हो या keypad phone — दोनों से काम चलेगा। Smartphone वाले को app में सब कुछ मिलेगा — video call, chat, alerts। Keypad phone वाले के पास नई booking आने पर call आएगी — number दबाओ, booking accept करो। और अगर registration में बेटा या परिवार मदद करे — कोई बात नहीं। पूजा आपको मिलेगी। पैसे आपके खाते में। आगे बोलें।',
      roman: 'Chahe aapke paas smartphone ho ya keypad phone — dono se kaam chalega. Smartphone wale ko app mein sab kuch milega — video call, chat, alerts. Keypad phone wale ke paas nayi booking aane par call aayegi — number dabao, booking accept karo. Aur agar registration mein beta ya parivar madad kare — koi baat nahi. Pooja aapko milegi. Paise aapke khate mein. Aage bolein.',
      durationSec: 16,
    },
  },
}

export const TUTORIAL_TRAVEL: ScreenVoiceScripts = {
  screenId: 'S-0.9',
  scripts: {
    main: {
      hindi: 'Booking confirm होते ही — आपकी पसंद के हिसाब से — train हो, bus हो, या cab — पूरी यात्रा की planning platform कर देगा। Hotel से खाने तक। और calendar में जो दिन आप free नहीं हैं — एक बार set करो। Platform उन दिनों किसी को नहीं भेजेगा। Double booking हो ही नहीं सकती। आगे बोलें।',
      roman: 'Booking confirm hote hi — aapki pasand ke hisaab se — train ho, bus ho, ya cab — poori yatra ki planning platform kar dega. Hotel se khaane tak. Aur calendar mein jo din aap free nahi hain — ek baar set karo. Platform un dino kisi ko nahi bhejega. Double booking ho hi nahi sakti. Aage bolein.',
      durationSec: 14,
    },
  },
}

export const TUTORIAL_VIDEO_VERIFY: ScreenVoiceScripts = {
  screenId: 'S-0.10',
  scripts: {
    main: {
      hindi: 'Verified होने का मतलब है — ज़्यादा bookings। Data यह कहता है — Verified पंडितों को तीन गुना ज़्यादा bookings मिलती हैं। इसके लिए हर पूजा के लिए सिर्फ दो मिनट का video देना होगा — एक बार। यह video सिर्फ हमारी admin team देखेगी। Public नहीं होगी। आपकी privacy safe है। बस एक और screen बाकी है। आगे बोलें।',
      roman: 'Verified hone ka matlab hai — zyaada bookings. Data yeh kahta hai — Verified panditon ko teen guna zyaada bookings milti hain. Iske liye har pooja ke liye sirf do minute ka video dena hoga — ek baar. Yeh video sirf humari admin team dekhegi. Public nahi hogi. Aapki privacy safe hai. Bas ek aur screen baaki hai. Aage bolein.',
      durationSec: 16,
    },
  },
}

export const TUTORIAL_GUARANTEES: ScreenVoiceScripts = {
  screenId: 'S-0.11',
  scripts: {
    main: {
      hindi: 'यह रहे HmarePanditJi के चार वादे। एक — सम्मान। Verified badge, izzat बनी रहे, कोई मोलभाव नहीं। दो — सुविधा। आवाज़ से सब काम, यात्रा की planning अपने आप। तीन — सुरक्षा। पैसा तय, तुरंत मिलेगा, कोई धोखा नहीं। चार — समृद्धि। Offline, online, backup — तीन जगह से नया पैसा। तीन लाख से ज़्यादा पंडित पहले से जुड़ चुके हैं। अब Registration की बारी।',
      roman: 'Yeh rahe HmarePanditJi ke chaar vaade. Ek — Samman. Verified badge, izzat bani rahe, koi moalbhav nahi. Do — Suwidha. Aawaz se sab kaam, yatra ki planning apne aap. Teen — Suraksha. Paisa tay, turant milega, koi dhoka nahi. Chaar — Samridhdhi. Offline, online, backup — teen jagah se naya paisa. Teen lakh se zyaada Pandit pehle se jud chuke hain. Ab Registration ki baari.',
      durationSec: 18,
    },
  },
}

export const TUTORIAL_CTA: ScreenVoiceScripts = {
  screenId: 'S-0.12',
  scripts: {
    main: {
      hindi: 'बस इतना था HmarePanditJi का परिचय। अब आप registration शुरू कर सकते हैं — बिल्कुल मुफ़्त, दस मिनट लगेंगे। क्या आप अभी शुरू करना चाहेंगे? हाँ बोलें या नीचे button दबाएं। अगर कोई सवाल हो — screen पर helpline number है — बिल्कुल free।',
      roman: 'Bas itna tha HmarePanditJi ka parichay. Ab aap registration shuru kar sakte hain — bilkul muft, das minute lagenge. Kya aap abhi shuru karna chahenge? Haan bolein ya neeche button dabayein. Agar koi sawaal ho — screen par helpline number hai — bilkul free.',
      durationSec: 14,
    },
    onYes: {
      hindi: 'बहुत अच्छा! अब हम registration शुरू करते हैं।',
      roman: 'Bahut achha! Ab hum registration shuru karte hain.',
      durationSec: 3,
    },
    onLater: {
      hindi: 'ठीक है। जब भी तैयार हों, app खोलें और Registration button दबाएं।',
      roman: 'Theek hai. Jab bhi tayyar hon, app kholein aur Registration button dabayein.',
      durationSec: 4,
    },
    onTimeout: {
      hindi: 'जब भी आप तैयार हों। App यहाँ रहेगा। Screen पर helpline number भी है।',
      roman: 'Jab bhi aap tayyar hon. App yahan rahega. Screen par helpline number bhi hai.',
      durationSec: 4,
    },
  },
}

// ─────────────────────────────────────────────────────────────
// GLOBAL ERROR + REPROMPT SCRIPTS
// ─────────────────────────────────────────────────────────────

export const ERROR_SCRIPTS = {
  sttFailure1: {
    hindi: 'माफ़ कीजिए, फिर से बोलिए — थोड़ा धीरे और साफ़।',
    roman: 'Maaf kijiye, phir se boliye — thoda dheere aur saaf.',
    durationSec: 3,
  } as VoiceScript,
  sttFailure2: {
    hindi: 'आवाज़ समझ नहीं आई। कोई बात नहीं — नीचे button भी है।',
    roman: 'Aawaz samajh nahi aayi. Koi baat nahi — neeche button bhi hai.',
    durationSec: 3,
  } as VoiceScript,
  sttFailure3: {
    hindi: 'Keyboard से जवाब दीजिए। नीचे keyboard button छूइए।',
    roman: 'Keyboard se jawab dijiye. Neeche keyboard button chhoiye.',
    durationSec: 3,
  } as VoiceScript,
  ambientNoiseHigh: {
    hindi: 'शोर बहुत ज़्यादा है। Keyboard try करें या शांत जगह जाएं।',
    roman: 'Shor bahut zyaada hai. Keyboard try karein ya shaant jagah jayein.',
    durationSec: 3,
  } as VoiceScript,
  skipConfirm: {
    hindi: 'ठीक है। सीधे Registration पर ले जाते हैं।',
    roman: 'Theek hai. Seedhe Registration par le jaate hain.',
    durationSec: 2,
  } as VoiceScript,
  languageChangeConfirmed: {
    hindi: '{LANGUAGE} सेट हो गई।',
    roman: '{LANGUAGE} set ho gayi.',
    durationSec: 1.5,
  } as VoiceScript,
}

// ─────────────────────────────────────────────────────────────
// HELPER FUNCTIONS
// ─────────────────────────────────────────────────────────────

/**
 * Replace dynamic placeholders in scripts (e.g., {CITY}, {LANGUAGE})
 */
export function replaceScriptPlaceholders(
  script: VoiceScript,
  replacements: Record<string, string>
): VoiceScript {
  let hindi = script.hindi
  let roman = script.roman
  let english = script.english

  for (const [key, value] of Object.entries(replacements)) {
    hindi = hindi.replace(new RegExp(`{${key}}`, 'g'), value)
    roman = roman?.replace(new RegExp(`{${key}}`, 'g'), value)
    english = english?.replace(new RegExp(`{${key}}`, 'g'), value)
  }

  return {
    hindi,
    roman,
    english,
    durationSec: script.durationSec,
  }
}

/**
 * Get script for a specific screen by ID
 */
export function getScreenScripts(screenId: string): ScreenVoiceScripts | undefined {
  const scripts: ScreenVoiceScripts[] = [
    SPLASH_SCREEN,
    LOCATION_PERMISSION_SCREEN,
    MANUAL_CITY_SCREEN,
    LANGUAGE_CONFIRM_SCREEN,
    LANGUAGE_LIST_SCREEN,
    LANGUAGE_CHOICE_CONFIRM_SCREEN,
    LANGUAGE_SET_SCREEN,
    HELP_SCREEN,
    VOICE_TUTORIAL_SCREEN,
    TUTORIAL_SWAGAT,
    TUTORIAL_INCOME,
    TUTORIAL_DAKSHINA,
    TUTORIAL_ONLINE_REVENUE,
    TUTORIAL_BACKUP,
    TUTORIAL_PAYMENT,
    TUTORIAL_VOICE_NAV,
    TUTORIAL_DUAL_MODE,
    TUTORIAL_TRAVEL,
    TUTORIAL_VIDEO_VERIFY,
    TUTORIAL_GUARANTEES,
    TUTORIAL_CTA,
  ]

  return scripts.find(s => s.screenId === screenId)
}

/**
 * All screen IDs in order for reference
 */
export const ALL_SCREEN_IDS = [
  'S-0.0.1',   // Splash
  'S-0.0.2',   // Location Permission
  'S-0.0.2B',  // Manual City Entry
  'S-0.0.3',   // Language Confirmation
  'S-0.0.4',   // Language Selection List
  'S-0.0.5',   // Language Choice Confirmation
  'S-0.0.6',   // Language Set Celebration
  'S-0.0.7',   // Sahayata (Help)
  'S-0.0.8',   // Voice Micro-Tutorial
  'S-0.1',     // Swagat Welcome
  'S-0.2',     // Income Hook
  'S-0.3',     // Fixed Dakshina
  'S-0.4',     // Online Revenue
  'S-0.5',     // Backup Pandit
  'S-0.6',     // Instant Payment
  'S-0.7',     // Voice Navigation Demo
  'S-0.8',     // Dual Mode
  'S-0.9',     // Travel Calendar
  'S-0.10',    // Video Verification
  'S-0.11',    // 4 Guarantees
  'S-0.12',    // Final Decision CTA
] as const
