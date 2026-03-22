/**
 * Tutorial Translations for Part 0 (S-0.1 to S-0.12)
 * Supports: Hindi, Tamil, Telugu, Bengali, Marathi, Gujarati, Kannada, Malayalam
 */

export type TutorialLanguage = 'Hindi' | 'Tamil' | 'Telugu' | 'Bengali' | 'Marathi' | 'Gujarati' | 'Kannada' | 'Malayalam' | 'English'

/** Safely resolve any language string to a TutorialLanguage key (fallback: Hindi) */
export function getTutorialLang(language?: string): TutorialLanguage {
  const known: TutorialLanguage[] = ['Hindi', 'Tamil', 'Telugu', 'Bengali', 'Marathi', 'Gujarati', 'Kannada', 'Malayalam', 'English']
  return (known.includes(language as TutorialLanguage) ? language : 'Hindi') as TutorialLanguage
}

export interface TutorialTranslations {
  skip: string
  back: string
  next: string
  screens: {
    S01: {
      greeting: string
      welcome: string
      subtitle: string
      moolMantra1: string
      moolMantra2: string
      cta: string
    }
    S02: {
      title: string
      testimonial: string
      subtitle: string
      cta: string
    }
    S03: {
      title: string
      before: string
      after: string
      cta: string
    }
    S04: {
      title: string
      subtitle: string
      card1Title: string
      card1Desc: string
      card2Title: string
      card2Desc: string
      example: string
      cta: string
    }
    S05: {
      title: string
      subtitle: string
      step1: string
      step2: string
      step3: string
      outcome1: string
      outcome2: string
      cta: string
    }
    S06: {
      title: string
      subtitle: string
      cta: string
    }
    S07: {
      title: string
      subtitle: string
      demoText: string
      cta: string
      voiceBadge?: string  // "हाँ" badge text
      speakTypes?: string  // "बोलो → लिखाई हो जाती है"
      whenYouSee?: string  // "जब यह दिखे:"
      listening?: string  // "सुन रहा हूँ..."
      thenSpeak?: string  // "तब बोलिए।"
      successMessage?: string  // "✅ शाबाश! बिल्कुल सही!"
      keyboardFallback?: string  // "अगर बोलने में दिक्कत हो:"
      keyboardAlways?: string  // "⌨️ Keyboard हमेशा नीचे है"
    }
    S08: {
      title: string
      subtitle: string
      smartphone: string
      keypad: string
      family: string
      cta: string
    }
    S09: {
      title: string
      subtitle: string
      cta: string
    }
    S10: {
      title: string
      subtitle: string
      cta: string
    }
    S11: {
      title: string
      heading?: string
      guarantee1: string
      guarantee2: string
      guarantee3: string
      guarantee4: string
      socialProof: string
      cta: string
    }
    S12: {
      title: string
      subtitle: string
      cta: string
      later: string
      progressBadge: string
      voicePrompt: string
      helpQuestion: string
      helpHours: string
    }
  }
}

export const TUTORIAL_TRANSLATIONS: Record<TutorialLanguage, TutorialTranslations> = {
  Hindi: {
    skip: 'Skip करें →',
    back: '← वापस जाएँ',
    next: 'आगे बढ़ें →',
    screens: {
      S01: {
        greeting: 'नमस्ते',
        welcome: 'पंडित जी।',
        subtitle: 'HmarePanditJi पर आपका स्वागत है।',
        moolMantra1: 'App पंडित के लिए है,',
        moolMantra2: 'पंडित App के लिए नहीं।',
        cta: 'जानें (सिर्फ 2 मिनट) →',
      },
      S02: {
        title: 'आपकी कमाई कैसे बढ़ेगी?',
        testimonial: 'पंडित रामेश्वर शर्मा - वाराणसी, UP',
        subtitle: '3 नए तरीकों से यह हुआ:',
        cta: 'और देखें →',
      },
      S03: {
        title: 'अब कोई मोलभाव नहीं।',
        before: '❌ पहले:',
        after: '✅ अब:',
        cta: 'अगला फ़ायदा देखें →',
      },
      S04: {
        title: 'घर बैठे भी कमाई',
        subtitle: '(2 नए तरीके जो आप नहीं जानते)',
        card1Title: 'ऑफलाइन पूजाएं',
        card1Desc: '(पहले से हैं आप)',
        card2Title: 'ऑनलाइन पूजाएं',
        card2Desc: '(नया मौका)',
        example: 'उदाहरण: 20 मिनट = ₹800 आपको',
        cta: 'और देखें →',
      },
      S05: {
        title: 'बिना कुछ किए',
        subtitle: '₹2,000?',
        step1: 'कोई पूजा Book हुई',
        step2: 'आपको Offer आया',
        step3: 'आपने हाँ कहा',
        outcome1: 'मुख्य Pandit ने पूजा की',
        outcome2: 'मुख्य Pandit Cancel किया',
        cta: 'अगला फ़ायदा देखें →',
      },
      S06: {
        title: 'पूजा ख़त्म।',
        subtitle: 'पैसे 2 मिनट में।',
        cta: 'अगला फ़ायदा देखें →',
      },
      S07: {
        title: 'टाइपिंग की ज़रूरत नहीं।',
        subtitle: 'बोलो → लिखाई हो जाती है',
        demoText: 'हाँ या नहीं बोलकर देखें',
        cta: 'अगला फ़ायदा देखें →',
        voiceBadge: 'हाँ',
        speakTypes: 'बोलो → लिखाई हो जाती है',
        whenYouSee: 'जब यह दिखे:',
        listening: 'सुन रहा हूँ...',
        thenSpeak: 'तब बोलिए।',
        successMessage: '✅ शाबाश! बिल्कुल सही!',
        keyboardFallback: 'अगर बोलने में दिक्कत हो:',
        keyboardAlways: '⌨️ Keyboard हमेशा नीचे है',
      },
      S08: {
        title: 'कोई भी Phone,',
        subtitle: 'Platform चलेगा।',
        smartphone: 'Smartphone',
        keypad: 'Keypad Phone',
        family: 'बेटा या परिवार Registration में मदद कर सकते हैं।',
        cta: 'अगला फ़ायदा देखें →',
      },
      S09: {
        title: 'Travel की Tension नहीं।',
        subtitle: 'Double Booking नहीं।',
        cta: 'आगे देखें → (लगभग हो गया!)',
      },
      S10: {
        title: '✅ Verified का मतलब',
        subtitle: 'ज़्यादा Bookings',
        cta: 'आगे देखें → (लगभग हो गया!)',
      },
      S11: {
        title: 'HmarePanditJi की',
        heading: '4 गारंटी',
        guarantee1: 'सम्मान',
        guarantee2: 'सुविधा',
        guarantee3: 'सुरक्षा',
        guarantee4: 'समृद्धि',
        socialProof: '3,00,000+ पंडित पहले से जुड़े हैं',
        cta: 'Registration शुरू करें →',
      },
      S12: {
        title: 'Registration शुरू करें?',
        subtitle: 'बिल्कुल मुफ़्त। 10 मिनट लगेंगे।',
        cta: '✅ हाँ, Registration शुरू करें →',
        later: 'बाद में करूँगा',
        progressBadge: '✓ Tutorial पूरा हुआ',
        voicePrompt: "'हाँ' बोलें या बटन दबाएं",
        helpQuestion: 'कोई सवाल?',
        helpHours: 'सुबह 8 बजे – रात 10 बजे',
      },
    },
  },
  Tamil: {
    skip: 'தவிர் →',
    back: '← திரும்ப',
    next: 'முன்னேறு →',
    screens: {
      S01: {
        greeting: 'வணக்கம்',
        welcome: 'பண்டித் ஜி.',
        subtitle: 'HmarePanditJi இல் உங்களை வரவேற்கிறோம்.',
        moolMantra1: 'ஆப் பண்டித் için உள்ளது,',
        moolMantra2: 'பண்டித் ஆப் için இல்லை.',
        cta: 'அறிய (2 நிமிடங்கள்) →',
      },
      S02: {
        title: 'உங்கள் வருமானம் எப்படி அதிகரிக்கும்?',
        testimonial: 'பண்டித் ரமேஷ் சர்மா - வாராணசி',
        subtitle: '3 புதிய வழிகள்:',
        cta: 'தொடர்ந்து பார்க்க →',
      },
      S03: {
        title: 'இனி பேரம் இல்லை.',
        before: '❌ முன்பு:',
        after: '✅ இப்போது:',
        cta: 'அடுத்த நன்மை பார்க்க →',
      },
      S04: {
        title: 'வீட்டில் இருந்தே சம்பாதிக்க',
        subtitle: '(2 புதிய வழிகள்)',
        card1Title: 'ஆஃப்லைன் பூஜைகள்',
        card1Desc: '(ஏற்கனவே உள்ளது)',
        card2Title: 'ஆன்லைன் பூஜைகள்',
        card2Desc: '(புதிய வாய்ப்பு)',
        example: 'உதாரணம்: 20 நிமிடங்கள் = ₹800',
        cta: 'தொடர்ந்து பார்க்க →',
      },
      S05: {
        title: 'செய்யாமலேயே',
        subtitle: '₹2,000?',
        step1: 'பூஜை புக் ஆனது',
        step2: 'ஆஃபர் வந்தது',
        step3: 'நீங்கள் ஹான் சொன்னீர்கள்',
        outcome1: 'முதன்மை பண்டித் பூஜை செய்தார்',
        outcome2: 'முதன்மை பண்டித் ரத்து செய்தார்',
        cta: 'அடுத்த நன்மை பார்க்க →',
      },
      S06: {
        title: 'பூஜை முடிந்தது.',
        subtitle: '2 நிமிடங்களில் பணம்.',
        cta: 'அடுத்த நன்மை பார்க்க →',
      },
      S07: {
        title: 'டைப்பிங் தேவையில்லை.',
        subtitle: 'பேசுங்கள் → டைப் ஆகிவிடும்',
        demoText: 'ஹான் அல்லது நஹி சொல்லிப் பார்க்கவும்',
        cta: 'அடுத்த நன்மை பார்க்க →',
        voiceBadge: 'ஹான்',
        speakTypes: 'பேசுங்கள் → டைப் ஆகிவிடும்',
        whenYouSee: 'இதைக் கண்டால்:',
        listening: 'கேட்கிறது...',
        thenSpeak: 'பின்பு பேசுங்கள்.',
        successMessage: '✅ நன்று! மிகச் சரி!',
        keyboardFallback: 'பேசுவதில் சிரமம் இருந்தால்:',
        keyboardAlways: '⌨️ கீபோர்டு எப்போதும் கீழே இருக்கும்',
      },
      S08: {
        title: 'எந்த போனும்,',
        subtitle: 'வேலை செய்யும்.',
        smartphone: 'ஸ்மார்ட்போன்',
        keypad: 'கீபேட் போன்',
        family: 'மகன் அல்லது குடும்பம் உதவலாம்.',
        cta: 'அடுத்த நன்மை பார்க்க →',
      },
      S09: {
        title: 'பயண கவலை இல்லை.',
        subtitle: 'இரட்டை புக்கிங் இல்லை.',
        cta: 'தொடர்ந்து பார்க்க → (கிட்டத்தட்ட முடிந்தது!)',
      },
      S10: {
        title: '✅ வெரிஃபைட் என்றால்',
        subtitle: 'அதிக புக்கிங்குகள்',
        cta: 'தொடர்ந்து பார்க்க → (கிட்டத்தட்ட முடிந்தது!)',
      },
      S11: {
        title: 'HmarePanditJi இன்',
        heading: '4 கட்டாயக்கம்',
        guarantee1: 'மரியாதை',
        guarantee2: 'வசதி',
        guarantee3: 'பாதுகாப்பு',
        guarantee4: 'செழிப்பு',
        socialProof: '3,00,000+ பண்டித்கள் இணைந்துள்ளனர்',
        cta: 'ரெஜிஸ்ட்ரேஷன் தொடங்க →',
      },
      S12: {
        title: 'ரெஜிஸ்ட்ரேஷன் தொடங்கவா?',
        subtitle: 'முற்றிலும் இலவசம். 10 நிமிடங்கள்.',
        cta: '✅ ஹான், ரெஜிஸ்ட்ரேஷன் தொடங்க →',
        later: 'பிறகு செய்கிறேன்',
        progressBadge: '✓ டுடோரியல் முடிந்தது',
        voicePrompt: "'ஹான்' சொல்லவும் அல்லது பட்டனை அழுத்தவும்",
        helpQuestion: 'ஏதேனும் கேள்வி?',
        helpHours: 'காலை 8 மணி – இரவு 10 மணி',
      },
    },
  },
  // Add other languages as needed - using Hindi as fallback for now
  Telugu: {
    skip: 'దాటవేయండి →',
    back: '← వెనుకకు',
    next: 'ముందుకు →',
    screens: {
      S01: {
        greeting: 'నమస్కారం',
        welcome: 'పండిట్ జీ.',
        subtitle: 'HmarePanditJi లోకి స్వాగతం.',
        moolMantra1: 'ఆప్ పండిట్ కోసం,',
        moolMantra2: 'పండిట్ ఆప్ కోసం కాదు.',
        cta: 'తెలుసుకోండి (2 నిమిషాలు) →',
      },
      S02: {
        title: 'మీ ఆదాయం ఎలా పెరుగుతుంది?',
        testimonial: 'పండిత్ రమేష్ శర్మ - వారాణసి',
        subtitle: '3 కొత్త మార్గాలు:',
        cta: 'తరువాత చూడండి →',
      },
      S03: {
        title: 'ఇకపై రాయబారం లేదు.',
        before: '❌ ముందు:',
        after: '✅ ఇప్పుడు:',
        cta: 'తరువాత ప్రయోజనం చూడండి →',
      },
      S04: {
        title: 'ఇంట్లోనే సంపాదించండి',
        subtitle: '(2 కొత్త మార్గాలు)',
        card1Title: 'ఆఫ్‌లైన్ పూజలు',
        card1Desc: '(ఇప్పటికే ఉన్నాయి)',
        card2Title: 'ఆన్‌లైన్ పూజలు',
        card2Desc: '(కొత్త అవకాశం)',
        example: 'ఉదాహరణ: 20 నిమిషాలు = ₹800',
        cta: 'తరువాత చూడండి →',
      },
      S05: {
        title: 'ఏమీ చేయకుండానే',
        subtitle: '₹2,000?',
        step1: 'పూజ బుక్ అయింది',
        step2: 'ఆఫర్ వచ్చింది',
        step3: 'మీరు హాన్ అన్నారు',
        outcome1: 'ప్రధాన పండిట్ పూజ చేశారు',
        outcome2: 'ప్రధాన పండిట్ రద్దు చేశారు',
        cta: 'తరువాత ప్రయోజనం చూడండి →',
      },
      S06: {
        title: 'పూజ ముగిసింది.',
        subtitle: '2 నిమిషాల్లో డబ్బు.',
        cta: 'తరువాత ప్రయోజనం చూడండి →',
      },
      S07: {
        title: 'టైపింగ్ అవసరం లేదు.',
        subtitle: 'మాట్లాడండి → టైప్ అవుతుంది',
        demoText: 'హాన్ లేదా నహీ అని చెప్పండి',
        cta: 'తరువాత ప్రయోజనం చూడండి →',
      },
      S08: {
        title: 'ఏ ఫోన్ అయినా,',
        subtitle: 'పనిచేస్తుంది.',
        smartphone: 'స్మార్ట్‌ఫోన్',
        keypad: 'కీప్యాడ్ ఫోన్',
        family: 'కుమారుడు లేదా కుటుంబం సహాయం చేయవచ్చు.',
        cta: 'తరువాత ప్రయోజనం చూడండి →',
      },
      S09: {
        title: 'ప్రయాణ ఆందోళన లేదు.',
        subtitle: 'డబుల్ బుకింగ్ లేదు.',
        cta: 'తరువాత చూడండి → (దాదాపు పూర్తయింది!)',
      },
      S10: {
        title: '✅ వెరిఫైడ్ అంటే',
        subtitle: 'ఎక్కువ బుకింగ్‌లు',
        cta: 'తరువాత చూడండి → (దాదాపు పూర్తయింది!)',
      },
      S11: {
        title: 'HmarePanditJi యొక్క',
        heading: '4 గ్యారంటీలు',
        guarantee1: 'గౌరవం',
        guarantee2: 'సులభతరం',
        guarantee3: 'భద్రత',
        guarantee4: 'సమృద్ధి',
        socialProof: '3,00,000+ పండిట్‌లు ఇప్పటికే చేరారు',
        cta: 'రిజిస్ట్రేషన్ ప్రారంభించండి →',
      },
      S12: {
        title: 'రిజిస్ట్రేషన్ ప్రారంభించాలా?',
        subtitle: 'పూర్తిగా ఉచితం. 10 నిమిషాలు.',
        cta: '✅ హాన్, రిజిస్ట్రేషన్ ప్రారంభించండి →',
        later: 'తర్వాత చేస్తాను',
      },
    },
  },
  Bengali: {
    skip: 'এড়িয়ে যান →',
    back: '← ফিরে যান',
    next: 'এগিয়ে যান →',
    screens: {
      S01: {
        greeting: 'নমস্কার',
        welcome: 'পণ্ডিত জী.',
        subtitle: 'HmarePanditJi এ স্বাগতম.',
        moolMantra1: 'অ্যাপ পণ্ডিতের জন্য,',
        moolMantra2: 'পণ্ডিত অ্যাপের জন্য নয়.',
        cta: 'জানুন (2 মিনিট) →',
      },
      S02: {
        title: 'আপনার আয় কীভাবে বাড়বে?',
        testimonial: 'পণ্ডিত রমেশ শর্মা - বারাণসী',
        subtitle: '3 নতুন উপায়:',
        cta: 'আরও দেখুন →',
      },
      S03: {
        title: 'এখন আর দরদাম নেই.',
        before: '❌ আগে:',
        after: '✅ এখন:',
        cta: 'পরবর্তী সুবিধা দেখুন →',
      },
      S04: {
        title: 'বাড়িতে বসেই উপার্জন',
        subtitle: '(2 নতুন উপায়)',
        card1Title: 'অফলাইন পূজা',
        card1Desc: '(ইতিমধ্যে আছে)',
        card2Title: 'অনলাইন পূজা',
        card2Desc: '(নতুন সুযোগ)',
        example: 'উদাহরণ: 20 মিনিট = ₹800',
        cta: 'আরও দেখুন →',
      },
      S05: {
        title: 'কিছু না করেই',
        subtitle: '₹2,000?',
        step1: 'পূজা বুক হয়েছে',
        step2: 'অফার এসেছে',
        step3: 'আপনি হ্যাঁ বলেছেন',
        outcome1: 'প্রধান পণ্ডিত পূজা করেছেন',
        outcome2: 'প্রধান পণ্ডিত বাতিল করেছেন',
        cta: 'পরবর্তী সুবিধা দেখুন →',
      },
      S06: {
        title: 'পূজা শেষ.',
        subtitle: '2 মিনিটে টাকা.',
        cta: 'পরবর্তী সুবিধা দেখুন →',
      },
      S07: {
        title: 'টাইপিংয়ের প্রয়োজন নেই.',
        subtitle: 'বলুন → টাইপ হয়ে যাবে',
        demoText: 'হ্যাঁ বা না বলে দেখুন',
        cta: 'পরবর্তী সুবিধা দেখুন →',
      },
      S08: {
        title: 'যেকোনো ফোন,',
        subtitle: 'কাজ করবে.',
        smartphone: 'স্মার্টফোন',
        keypad: 'কিপ্যাড ফোন',
        family: 'ছেলে বা পরিবার সাহায্য করতে পারে.',
        cta: 'পরবর্তী সুবিধা দেখুন →',
      },
      S09: {
        title: 'ভ্রমণের চিন্তা নেই.',
        subtitle: 'ডাবল বুকিং নেই.',
        cta: 'এগিয়ে দেখুন → (প্রায় শেষ!)',
      },
      S10: {
        title: '✅ ভেরিফাইড মানে',
        subtitle: 'বেশি বুকিং',
        cta: 'এগিয়ে দেখুন → (প্রায় শেষ!)',
      },
      S11: {
        title: 'HmarePanditJi এর',
        guarantee1: 'সম্মান',
        guarantee2: 'সুবিধা',
        guarantee3: 'নিরাপত্তা',
        guarantee4: 'সমৃদ্ধি',
        socialProof: '3,00,000+ পণ্ডিত ইতিমধ্যে যুক্ত',
        cta: 'রেজিস্ট্রেশন শুরু করুন →',
      },
      S12: {
        title: 'রেজিস্ট্রেশন শুরু করবেন?',
        subtitle: 'সম্পূর্ণ বিনামূল্যে. 10 মিনিট.',
        cta: '✅ হ্যাঁ, রেজিস্ট্রেশন শুরু করুন →',
        later: 'পরে করব',
      },
    },
  },
  // Fallback for other languages - use Hindi
  Marathi: { skip: 'Skip करें →', back: '← मागे', next: 'पुढे →', screens: { S01: { greeting: 'नमस्कार', welcome: 'पंडित जी.', subtitle: 'HmarePanditJi वर स्वागत आहे.', moolMantra1: 'अॅप पंडितांसाठी आहे,', moolMantra2: 'पंडित अॅपसाठी नाहीत.', cta: 'जाणून घ्या (फक्त 2 मिनिटे) →' }, S02: { title: 'तुमची कमाई कशी वाढेल?', testimonial: 'पंडित रमेश शर्मा - वाराणसी', subtitle: '3 नवीन मार्ग:', cta: 'आणखी पहा →' }, S03: { title: 'आता कोणताही मोलभाव नाही.', before: '❌ आधी:', after: '✅ आता:', cta: 'पुढील फायदा पहा →' }, S04: { title: 'घरबसल्या कमवा', subtitle: '(2 नवीन मार्ग)', card1Title: 'ऑफलाइन पूजा', card1Desc: '(आधीपासून आहेत)', card2Title: 'ऑनलाइन पूजा', card2Desc: '(नवीन संधी)', example: 'उदाहरण: 20 मिनिटे = ₹800', cta: 'आणखी पहा →' }, S05: { title: 'काहीही न करता', subtitle: '₹2,000?', step1: 'पूजा बुक झाली', step2: 'ऑफर आली', step3: 'तुम्ही हो म्हटले', outcome1: 'मुख्य पंडिताने पूजा केली', outcome2: 'मुख्य पंडिताने रद्द केले', cta: 'पुढील फायदा पहा →' }, S06: { title: 'पूजा संपली.', subtitle: '2 मिनिटांत पैसे.', cta: 'पुढील फायदा पहा →' }, S07: { title: 'टाइपिंगची गरज नाही.', subtitle: 'बोला → टाइप होईल', demoText: 'हो किंवा नाही म्हणून पहा', cta: 'पुढील फायदा पहा →' }, S08: { title: 'कोणताही फोन,', subtitle: 'काम करेल.', smartphone: 'स्मार्टफोन', keypad: 'कीपॅड फोन', family: 'मुलगा किंवा कुटुंब मदत करू शकते.', cta: 'पुढील फायदा पहा →' }, S09: { title: 'प्रवासाची चिंता नाही.', subtitle: 'डबल बुकिंग नाही.', cta: 'पुढे पहा → (जवळजवळ पूर्ण!)' }, S10: { title: '✅ व्हेरिफाइड म्हणजे', subtitle: 'जास्त बुकिंग', cta: 'पुढे पहा → (जवळजवळ पूर्ण!)' }, S11: { title: 'HmarePanditJi चे', guarantee1: 'सन्मान', guarantee2: 'सुविधा', guarantee3: 'सुरक्षा', guarantee4: 'समृद्धी', socialProof: '3,00,000+ पंडित आधीच जोडलेले आहेत', cta: 'नोंदणी सुरू करा →' }, S12: { title: 'नोंदणी सुरू करायची आहे?', subtitle: 'पूर्णपणे मोफत. 10 मिनिटे.', cta: '✅ हो, नोंदणी सुरू करा →', later: 'नंतर करेन' } } },
  Gujarati: { skip: 'છોડો →', back: '← પાછા', next: 'આગળ →', screens: { S01: { greeting: 'નમસ્તે', welcome: 'પંડિત જી.', subtitle: 'HmarePanditJi માં સ્વાગત છે.', moolMantra1: 'એપ પંડિત માટે છે,', moolMantra2: 'પંડિત એપ માટે નથી.', cta: 'જાણો (ફક્ત 2 મિનિટ) →' }, S02: { title: 'તમારી કમાઈ કેવી રીતે વધશે?', testimonial: 'પંડિત રમેશ શર્મા - વારાણસી', subtitle: '3 નવા માર્ગો:', cta: 'વધુ જુઓ →' }, S03: { title: 'હવે કોઈ મોલભાવ નથી.', before: '❌ પહેલા:', after: '✅ હવે:', cta: 'આગળનો ફાયદો જુઓ →' }, S04: { title: 'ઘરે બેઠા કમાઓ', subtitle: '(2 નવા માર્ગો)', card1Title: 'ઓફલાઇન પૂજા', card1Desc: '(પહેલેથી છે)', card2Title: 'ઓનલાઇન પૂજા', card2Desc: '(નવી તક)', example: 'ઉદાહરણ: 20 મિનિટ = ₹800', cta: 'વધુ જુઓ →' }, S05: { title: 'કંઈ કર્યા વિના', subtitle: '₹2,000?', step1: 'પૂજા બુક થઈ', step2: 'ઓફર આવી', step3: 'તમે હા કહ્યું', outcome1: 'મુખ્ય પંડિતે પૂજા કરી', outcome2: 'મુખ્ય પંડિતે રદ કરી', cta: 'આગળનો ફાયદો જુઓ →' }, S06: { title: 'પૂજા પૂરી.', subtitle: '2 મિનિટમાં પૈસા.', cta: 'આગળનો ફાયદો જુઓ →' }, S07: { title: 'ટાઇપિંગની જરૂર નથી.', subtitle: 'બોલો → ટાઇપ થઈ જશે', demoText: 'હા કે ના બોલીને જુઓ', cta: 'આગળનો ફાયદો જુઓ →' }, S08: { title: 'કોઈપણ ફોન,', subtitle: 'કામ કરશે.', smartphone: 'સ્માર્ટફોન', keypad: 'કીપેડ ફોન', family: 'દીકરો કે પરિવાર મદદ કરી શકે છે.', cta: 'આગળનો ફાયદો જુઓ →' }, S09: { title: 'મુસાફરીની ચિંતા નથી.', subtitle: 'ડબલ બુકિંગ નથી.', cta: 'આગળ જુઓ → (લગભગ પૂર્ણ!)' }, S10: { title: '✅ વેરિફાઇડ એટલે', subtitle: 'વધુ બુકિંગ', cta: 'આગળ જુઓ → (લગભગ પૂર્ણ!)' }, S11: { title: 'HmarePanditJi નું', guarantee1: 'સન્માન', guarantee2: 'સુવિધા', guarantee3: 'સુરક્ષા', guarantee4: 'સમૃદ્ધિ', socialProof: '3,00,000+ પંડિત પહેલેથી જોડાયેલા છે', cta: 'નોંધણી શરૂ કરો →' }, S12: { title: 'નોંધણી શરૂ કરવી છે?', subtitle: 'સંપૂર્ણપણે મફત. 10 મિનિટ.', cta: '✅ હા, નોંધણી શરૂ કરો →', later: 'પછી કરીશ' } } },
  Kannada: { skip: 'ದಾಟಿ →', back: '← ಹಿಂದಕ್ಕೆ', next: 'ಮುಂದೆ →', screens: { S01: { greeting: 'ನಮಸ್ಕಾರ', welcome: 'ಪಂಡಿತ್ ಜಿ.', subtitle: 'HmarePanditJi ಗೆ ಸ್ವಾಗತ.', moolMantra1: 'ಆ್ಯಪ್ ಪಂಡಿತ್‌ಗಾಗಿ,', moolMantra2: 'ಪಂಡಿತ್ ಆ್ಯಪ್‌ಗಾಗಿ ಅಲ್ಲ.', cta: 'ತಿಳಿಯಿರಿ (2 ನಿಮಿಷ) →' }, S02: { title: 'ನಿಮ್ಮ ಆದಾಯ ಹೇಗೆ ಹೆಚ್ಚಾಗುತ್ತದೆ?', testimonial: 'ಪಂಡಿತ್ ರಮೇಶ್ ಶರ್ಮಾ - ವಾರಾಣಸಿ', subtitle: '3 ಹೊಸ ಮಾರ್ಗಗಳು:', cta: 'ಮುಂದುವರಿಯಿರಿ →' }, S03: { title: 'ಇನ್ನು ಮುಂದೆ ಬೇಡಿಕೆ ಇಲ್ಲ.', before: '❌ ಮೊದಲು:', after: '✅ ಈಗ:', cta: 'ಮುಂದಿನ ಪ್ರಯೋಜನ ನೋಡಿ →' }, S04: { title: 'ಮನೆಯಲ್ಲೇ ಸಂಪಾದಿಸಿ', subtitle: '(2 ಹೊಸ ಮಾರ್ಗಗಳು)', card1Title: 'ಆಫ್‌ಲೈನ್ ಪೂಜೆಗಳು', card1Desc: '(ಈಗಾಗಲೇ ಇವೆ)', card2Title: 'ಆನ್‌ಲೈನ್ ಪೂಜೆಗಳು', card2Desc: '(ಹೊಸ ಅವಕಾಶ)', example: 'ಉದಾಹರಣೆ: 20 ನಿಮಿಷ = ₹800', cta: 'ಮುಂದುವರಿಯಿರಿ →' }, S05: { title: 'ಏನೂ ಮಾಡದೆ', subtitle: '₹2,000?', step1: 'ಪೂಜೆ ಬುಕ್ ಆಯಿತು', step2: 'ಆಫರ್ ಬಂತು', step3: 'ನೀವು ಹೌದು ಎಂದಿದ್ದೀರಿ', outcome1: 'ಮುಖ್ಯ ಪಂಡಿತ್ ಪೂಜೆ ಮಾಡಿದರು', outcome2: 'ಮುಖ್ಯ ಪಂಡಿತ್ ರದ್ದುಗೊಳಿಸಿದರು', cta: 'ಮುಂದಿನ ಪ್ರಯೋಜನ ನೋಡಿ →' }, S06: { title: 'ಪೂಜೆ ಮುಗಿಯಿತು.', subtitle: '2 ನಿಮಿಷದಲ್ಲಿ ಹಣ.', cta: 'ಮುಂದಿನ ಪ್ರಯೋಜನ ನೋಡಿ →' }, S07: { title: 'ಟೈಪಿಂಗ್ ಅಗತ್ಯವಿಲ್ಲ.', subtitle: 'ಮಾತನಾಡಿ → ಟೈಪ್ ಆಗುತ್ತದೆ', demoText: 'ಹೌದು ಅಥವಾ ಇಲ್ಲ ಎಂದು ಹೇಳಿ', cta: 'ಮುಂದಿನ ಪ್ರಯೋಜನ ನೋಡಿ →' }, S08: { title: 'ಯಾವುದೇ ಫೋನ್,', subtitle: 'ಕೆಲಸ ಮಾಡುತ್ತದೆ.', smartphone: 'ಸ್ಮಾರ್ಟ್‌ಫೋನ್', keypad: 'ಕೀಪ್ಯಾಡ್ ಫೋನ್', family: 'ಮಗ ಅಥವಾ ಕುಟುಂಬ ಸಹಾಯ ಮಾಡಬಹುದು.', cta: 'ಮುಂದಿನ ಪ್ರಯೋಜನ ನೋಡಿ →' }, S09: { title: 'ಪ್ರಯಾಣದ ಚಿಂತೆ ಇಲ್ಲ.', subtitle: 'ಡಬಲ್ ಬುಕಿಂಗ್ ಇಲ್ಲ.', cta: 'ಮುಂದುವರಿಯಿರಿ → (ಬಹುತೇಕ ಪೂರ್ಣಗೊಂಡಿದೆ!)' }, S10: { title: '✅ ಪರಿಶೀಲಿಸಿದ ಎಂದರೆ', subtitle: 'ಹೆಚ್ಚು ಬುಕಿಂಗ್‌ಗಳು', cta: 'ಮುಂದುವರಿಯಿರಿ → (ಬಹುತೇಕ ಪೂರ್ಣಗೊಂಡಿದೆ!)' }, S11: { title: 'HmarePanditJi ಯ', guarantee1: 'ಗೌರವ', guarantee2: 'ಸುಲಭತೆ', guarantee3: 'ಭದ್ರತೆ', guarantee4: 'ಸಮೃದ್ಧಿ', socialProof: '3,00,000+ ಪಂಡಿತ್‌ಗಳು ಈಗಾಗಲೇ ಸೇರಿದ್ದಾರೆ', cta: 'ನೋಂದಣಿ ಪ್ರಾರಂಭಿಸಿ →' }, S12: { title: 'ನೋಂದಣಿ ಪ್ರಾರಂಭಿಸಬೇಕೇ?', subtitle: 'ಸಂಪೂರ್ಣ ಉಚಿತ. 10 ನಿಮಿಷ.', cta: '✅ ಹೌದು, ನೋಂದಣಿ ಪ್ರಾರಂಭಿಸಿ →', later: 'ನಂತರ ಮಾಡುತ್ತೇನೆ' } } },
  Malayalam: { skip: 'ഒഴിവാക്കുക →', back: '← പിന്നോട്ട്', next: 'മുന്നോട്ട് →', screens: { S01: { greeting: 'നമസ്കാരം', welcome: 'പണ്ഡിത് ജി.', subtitle: 'HmarePanditJi ലേക്ക് സ്വാഗതം.', moolMantra1: 'ആപ്പ് പണ്ഡിതിനുള്ളതാണ്,', moolMantra2: 'പണ്ഡിത് ആപ്പിനുള്ളതല്ല.', cta: 'അറിയുക (2 മിനിറ്റ്) →' }, S02: { title: 'നിങ്ങളുടെ വരുമാനം എങ്ങനെ വർദ്ധിപ്പിക്കും?', testimonial: 'പണ്ഡിത് രമേശ് ശർമ്മ - വാരാണസി', subtitle: '3 പുതിയ വഴികൾ:', cta: 'തുടർന്ന് കാണുക →' }, S03: { title: 'ഇനി വിലപേശൽ ഇല്ല.', before: '❌ മുമ്പ്:', after: '✅ ഇപ്പോൾ:', cta: 'അടുത്ത ഗുണം കാണുക →' }, S04: { title: 'വീട്ടിലിരുന്ന് സമ്പാദിക്കുക', subtitle: '(2 പുതിയ വഴികൾ)', card1Title: 'ഓഫ്‌ലൈൻ പൂജകൾ', card1Desc: '(ഇതിനകം ഉണ്ട്)', card2Title: 'ഓൺലൈൻ പൂജകൾ', card2Desc: '(പുതിയ അവസരം)', example: 'ഉദാഹരണം: 20 മിനിറ്റ് = ₹800', cta: 'തുടർന്ന് കാണുക →' }, S05: { title: 'ഒന്നും ചെയ്യാതെ', subtitle: '₹2,000?', step1: 'പൂജ ബുക്ക് ചെയ്തു', step2: 'ഓഫർ വന്നു', step3: 'നിങ്ങൾ ഹാൻ എന്ന് പറഞ്ഞു', outcome1: 'പ്രധാന പണ്ഡിത് പൂജ നടത്തി', outcome2: 'പ്രധാന പണ്ഡിത് റദ്ദാക്കി', cta: 'അടുത്ത ഗുണം കാണുക →' }, S06: { title: 'പൂജ പൂർത്തിയായി.', subtitle: '2 മിനിറ്റിൽ പണം.', cta: 'അടുത്ത ഗുണം കാണുക →' }, S07: { title: 'ടൈപ്പിംഗ് ആവശ്യമില്ല.', subtitle: 'സംസാരിക്കുക → ടൈപ്പ് ആകും', demoText: 'ഹാൻ അല്ലെങ്കിൽ നഹീ എന്ന് പറഞ്ഞുനോക്കൂ', cta: 'അടുത്ത ഗുണം കാണുക →' }, S08: { title: 'ഏത് ഫോണും,', subtitle: 'പ്രവർത്തിക്കും.', smartphone: 'സ്മാർട്ട്ഫോൺ', keypad: 'കീപാഡ് ഫോൺ', family: 'മകനോ കുടുംബമോ സഹായിക്കാം.', cta: 'അടുത്ത ഗുണം കാണുക →' }, S09: { title: 'യാത്രാ ചിന്തയില്ല.', subtitle: 'ഡബിൾ ബുക്കിംഗ് ഇല്ല.', cta: 'മുന്നോട്ട് കാണുക → (മിക്കവാറും പൂർത്തിയായി!)' }, S10: { title: '✅ വെരിഫൈഡ് എന്നാൽ', subtitle: 'കൂടുതൽ ബുക്കിംഗുകൾ', cta: 'മുന്നോട്ട് കാണുക → (മിക്കവാറും പൂർത്തിയായി!)' }, S11: { title: 'HmarePanditJi യുടെ', guarantee1: 'ബഹുമാനം', guarantee2: 'സൗകര്യം', guarantee3: 'സുരക്ഷ', guarantee4: 'സമൃദ്ധി', socialProof: '3,00,000+ പണ്ഡിതുകൾ ഇതിനകം ചേർന്നിട്ടുണ്ട്', cta: 'രജിസ്‌ട്രേഷൻ ആരംഭിക്കുക →' }, S12: { title: 'രജിസ്‌ട്രേഷൻ ആരംഭിക്കാമോ?', subtitle: 'പൂർണ്ണമായും സൗജന്യം. 10 മിനിറ്റ്.', cta: '✅ ഹാൻ, രജിസ്‌ട്രേഷൻ ആരംഭിക്കുക →', later: 'പിന്നീട് ചെയ്യാം' } } },
  English: {
    skip: 'Skip →', back: '← Back', next: 'Next →', screens: { S01: { greeting: 'Namaste', welcome: 'Pandit Ji.', subtitle: 'Welcome to HmarePanditJi.', moolMantra1: 'App is for Pandit,', moolMantra2: 'Pandit is not for App.', cta: 'Learn (just 2 minutes) →' }, S02: { title: 'How will your income increase?', testimonial: 'Pandit Ramesh Sharma - Varanasi', subtitle: '3 new ways:', cta: 'See more →' }, S03: { title: 'No more bargaining.', before: '❌ Before:', after: '✅ Now:', cta: 'See next benefit →' }, S04: { title: 'Earn from home', subtitle: '(2 new ways)', card1Title: 'Offline Poojas', card1Desc: '(Already have)', card2Title: 'Online Poojas', card2Desc: '(New opportunity)', example: 'Example: 20 minutes = ₹800', cta: 'See more →' }, S05: { title: 'Without doing anything', subtitle: '₹2,000?', step1: 'Pooja was booked', step2: 'Offer came', step3: 'You said Yes', outcome1: 'Main Pandit did the pooja', outcome2: 'Main Pandit cancelled', cta: 'See next benefit →' }, S06: { title: 'Pooja finished.', subtitle: 'Money in 2 minutes.', cta: 'See next benefit →' }, S07: { title: 'No typing needed.', subtitle: 'Speak → It gets typed', demoText: 'Try saying Haan or Nahi', cta: 'See next benefit →' }, S08: { title: 'Any phone,', subtitle: 'Will work.', smartphone: 'Smartphone', keypad: 'Keypad phone', family: 'Son or family can help.', cta: 'See next benefit →' }, S09: { title: 'No travel worry.', subtitle: 'No double booking.', cta: 'Continue → (Almost done!)' }, S10: { title: '✅ Verified means', subtitle: 'More bookings', cta: 'Continue → (Almost done!)' }, S11: { title: 'HmarePanditJi\'s', guarantee1: 'Respect', guarantee2: 'Convenience', guarantee3: 'Security', guarantee4: 'Prosperity', socialProof: '3,00,000+ Pandits already joined', cta: 'Start Registration →' }, S12: { title: 'Start Registration?', subtitle: 'Completely free. 10 minutes.', cta: '✅ Yes, Start Registration →', later: 'I\'ll do it later' } }
  }
}
