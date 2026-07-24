export const hi = {
  voice: {
    on: "आवाज़ चालू कीजिए",
    off: "आवाज़ बंद कीजिए",
    unavailable: "आवाज़ उपलब्ध नहीं — पाठ पढ़िए",
    tapToHear: "आवाज़ के लिए स्क्रीन को एक बार स्पर्श कीजिए",
    // U1b: Sarvam hiccup after it worked — silence + this toast, never
    // the robot voice mid-session
    hiccup: "आवाज़ में रुकावट है",
    // V2b: mic resurrection failed — one honest line, tap restarts
    micStuck: "माइक रुक गया है — स्क्रीन स्पर्श कर फिर शुरू कीजिए",
    // L8: storage blocked (private mode / locked device) — one honest line
    storageBlocked: "इस डिवाइस पर सेव नहीं हो पा रहा — बाकी सब वैसे ही चलेगा",
  },
  shishya: {
    name: "शिष्य",
    wake: "जी पंडित जी, मैं फिर हाज़िर हूँ।",
    sleepToast: "शिष्य विश्राम कर रहा हूँ। जगाने के लिए मुझे स्पर्श कर लीजिएगा।",
    wakeHint: "स्पर्श कर जगाइए",
    a11yAwake: "शिष्य को सुलाइए",
    a11ySleep: "शिष्य को जगाइए",
    intro: "नमस्ते पंडित जी! मैं शिष्य हूँ — आपका सहायक।",
    aboutTitle: "शिष्य के बारे में",
    aboutLine1: "शिष्य आपका सहायक है — हर स्क्रीन पर बोलकर समझाता है और आपकी बात सुनता है।",
    aboutLine2: "उसे दबाकर कभी भी सुला सकते हैं — ऐप फिर सामान्य रूप से चलेगा।",
    // S6c: the honest miss — spoken ONLY for question-shaped asks the
    // brain cannot answer; never for ordinary unmatched noise.
    honestMiss:
      "क्षमा कीजिए पंडित जी, इसका उत्तर अभी मेरे पास नहीं है — मदद वाले हिस्से से हमारी टीम को फ़ोन कर सकते हैं।",
    // T4/X3: a filler spoken once when the brain takes >600ms. Rotated
    // through variants so back-to-back questions don't repeat the same
    // line — the wait feels like a person thinking, not a loop.
    thinking: "एक क्षण, सोच रहा हूँ…",
    thinking2: "जी, देखता हूँ…",
    thinking3: "बस अभी बताता हूँ…",
    // S6a: शिष्य's curated answers — ≤2 sentences, warm, SPOKEN. Money
    // and Aadhaar lines are grounded in repo facts, never invented.
    faq: {
      paymentMissing:
        "पूजा पूरी होने के 24 घंटे बाद भी पैसा न आए, तो मदद वाले हिस्से से हमारी टीम को फ़ोन कीजिए — तुरंत देखा जाएगा।",
      paymentWhen:
        "पूजा संपन्न होने के 24 घंटे के अंदर पैसा सीधे आपके बैंक खाते में आ जाता है।",
      paymentHow:
        "आपकी कमाई सीधे आपके बैंक खाते या यूपीआई में आती है — वही जो आपने तैयारी में भरा है।",
      commission:
        "दक्षिणा का पूरा 100 प्रतिशत आपका है — कोई कटौती नहीं। प्लेटफ़ॉर्म का शुल्क अलग से यजमान देता है, आपकी दक्षिणा में से कुछ नहीं कटता।",
      changePrice:
        "मेरी पूजाएँ वाले हिस्से में जाकर किसी भी पूजा की दक्षिणा कभी भी बदल सकते हैं।",
      dakshinaWho:
        "दक्षिणा आप खुद तय करते हैं, पंडित जी — ग्राहक को वही राशि दिखती है और कोई मोलभाव नहीं होता।",
      samagriMoney:
        "अगर सामग्री आप लाते हैं तो उसका दाम भी आप ही तय करते हैं — वह राशि आपकी कमाई में जुड़कर मिलती है।",
      samagriPackage:
        "सामग्री पैकेज यानी पूजा का पूरा सामान आपकी ओर से — आप हर पूजा के लिए अपना पैकेज और उसका दाम खुद बनाते हैं।",
      travel:
        "अपनी गाड़ी से जाने पर 12 रुपये प्रति किलोमीटर आना-जाना मिलता है; ट्रेन या बस का इंतज़ाम बुकिंग के साथ तय होता है।",
      foodAllowance:
        "भोजन की अपनी दैनिक राशि आप तैयारी के चौथे चरण में खुद भरते हैं — वही बुकिंग के साथ जुड़ती है।",
      bookingHow:
        "जब कोई परिवार आपको बुक करता है, तो घंटी बजती है और होम पर बुकिंग दिखती है — आप स्वीकार कीजिए, बस।",
      bookingRefuse:
        "जी हाँ — हर बुकिंग स्वीकार या अस्वीकार करना पूरी तरह आपके हाथ में है।",
      bookingWhere:
        "नीचे बुकिंग वाले बटन से आपकी सारी बुकिंग दिखती हैं — नई, आने वाली और पूरी हुई।",
      earningsWhere:
        "नीचे कमाई वाले बटन से आपकी पूरी कमाई और आने वाली राशि दिखती है।",
      customerCancel:
        "ग्राहक के रद्द करने पर आपको तुरंत सूचना मिलती है; भुगतान से जुड़े नियम के लिए मदद से टीम से पूछ लीजिए।",
      calendarHoliday:
        "कैलेंडर में उस दिन को दबाइए — वह दिन बंद हो जाएगा और उस दिन कोई बुकिंग नहीं आएगी।",
      onlineOffline:
        "ऑनलाइन मतलब आप बुकिंग लेने को तैयार हैं; ऑफलाइन मतलब अभी आराम। होम का बड़ा बटन दबाकर बदल सकते हैं।",
      verifyWhy:
        "सत्यापन से ग्राहकों का भरोसा बनता है — प्रमाणित पंडित जी को ही बुकिंग मिलती है।",
      verifyHowLong:
        "हमारी टीम आमतौर पर एक दिन में सत्यापन पूरा कर देती है — पूरा होते ही आपको सूचना मिलेगी।",
      videoVerify:
        "वीडियो सत्यापन में हमारी टीम एक छोटे से कॉल पर आपसे मिलती है — बस पहचान पक्की करने के लिए।",
      aadhaarSafe:
        "जी हाँ, आधार पूरी तरह सुरक्षित है — सिर्फ़ सत्यापन के लिए इस्तेमाल होता है और किसी ग्राहक को कभी नहीं दिखता।",
      appFree:
        "ऐप बिल्कुल मुफ़्त है — न जुड़ने का कोई शुल्क, न चलाने का।",
      whoseApp:
        "यह हमारे पंडित जी ऐप है — पंडितों के लिए बना प्लेटफ़ॉर्म, जहाँ परिवार आपको सीधे बुक करते हैं।",
      whoAreYou:
        "मैं शिष्य हूँ, पंडित जी — आपका अपना सहायक। हर स्क्रीन पर बोलकर समझाता हूँ और आपकी बात सुनता हूँ।",
      changeLanguage:
        "सेटिंग में भाषा वाला हिस्सा दबाइए — बारह भाषाओं में से अपनी चुन लीजिए।",
      voiceOff:
        "नीचे मुझ पर यानी शिष्य पर एक बार स्पर्श कर दीजिए, या 'सो जाओ' बोल दीजिए — मैं चुप हो जाऊँगा।",
      helpPhone:
        "मदद वाले हिस्से में फ़ोन का बटन है — दबाते ही सीधे हमारी टीम से बात होगी।",
      addPooja:
        "मेरी पूजाएँ वाले हिस्से में नई पूजा जोड़िए दबाइए — पूजा चुनिए और अपनी दक्षिणा भर दीजिए।",
      whoSeesProfile:
        "ग्राहक को आपका नाम, शहर, पूजाएँ, दक्षिणा और रेटिंग दिखती है — आधार या बैंक की जानकारी कभी नहीं।",
      rating:
        "पूजा के बाद परिवार आपको पाँच तक तारे देता है — अच्छी रेटिंग से और बुकिंग मिलती हैं।",
      fraud:
        "ग्राहक का पैसा पहले प्लेटफ़ॉर्म के पास सुरक्षित रहता है और पूजा पूरी होने पर आपको मिलता है — इसीलिए दोनों तरफ़ भरोसा बना रहता है।",
      deleteAccount:
        "खाता बंद करवाने के लिए मदद वाले हिस्से से हमारी टीम को फ़ोन कर दीजिए — वे तुरंत कर देंगे।",
      otpWhat:
        "ओटीपी आपके मोबाइल पर आया छह अंकों का कोड है — न आए तो 'दोबारा भेजिए' दबा दीजिए।",
      micWhy:
        "माइक की अनुमति से आप हर काम बोलकर कर पाते हैं — न देना चाहें तो ऐप स्पर्श से भी पूरा चलता है।",
    },
  },
  coach: {
    tryIt: "आज़माइए →",
    gotIt: "समझा",
  },
  // T1: splash-only lines. The pre-tap hint ATTEMPT is audible only for
  // sessions where audio is already unlocked (returning users) — fresh
  // loads park it by browser autoplay law and show the chip instead.
  splash: {
    tapHintVoice: "नमस्ते पंडित जी! आगे बढ़ने के लिए स्पर्श कीजिए।",
    // Canon frame 1 — the app's FIRST WORDS. Shishya's speaking bubble carries
    // "नमस्ते पंडित जी! 🙏"; spoken these two lines in order, on mount (autoplay
    // -safe attempt), then again on the first unlock. Emoji stripped for TTS.
    hello: "नमस्ते पंडित जी!",
    sparshAsk: "आगे बढ़ने के लिए स्पर्श कीजिए।",
    // the say-bubble text (canon keeps the 🙏)
    helloBubble: "नमस्ते पंडित जी! 🙏",
    // canon's own pill copy (short) — NOT the long tapHint
    // FOUNDER REGISTER LAW: Isj specced स्पर्श कीजिए — the written word
    // matches the spoken "आगे बढ़ने के लिए स्पर्श कीजिए।"
    pill: "स्पर्श कीजिए",
  },
  // प्रथम आरती — the festive entry flow (splash → tutorial)
  pratham: {
    // Mockup frame 1 tagline (three-word blessing beats a sentence)
    splashTagline: "सेवा · सम्मान · समृद्धि",
    tapHint: "नमस्ते पंडित जी 🙏 आगे बढ़ने के लिए स्पर्श कीजिए",
    // canon frame 2 breaks the heading after सेवा — render whitespace-pre-line
    locationTitle: "आप कहाँ सेवा\nदेते हैं?",
    locationWhy: "आपके शहर की पूजाएँ और आपकी भाषा — बस इसीलिए।",
    locationAllow: "अनुमति दीजिए",
    locationManual: "शहर खुद चुनिए",
    // canon say-ribbons (frames 2/3): शिष्य's written+spoken line
    locationSay: "आप कहाँ पूजा कराते हैं?",
    languageSay: "कौन सी भाषा पसंद है?",
    locationChecking: "शहर पहचाना जा रहा है…",
    locationVoice: "आप कहाँ सेवा देते हैं? नीचे अनुमति दीजिए दबाइए — या शहर खुद चुन लीजिए।",
    locationError: "शहर पहचानने में समस्या हुई। कृपया खुद चुनिए।",
    cityTitle: "अपना शहर चुनिए",
    cityInputLabel: "अपना शहर लिखिए…",
    cityGo: "यही शहर चुनिए",
    cityVoice: "अपना शहर चुनिए — नीचे बड़े शहरों में से दबाइए, या नाम लिख दीजिए।",
    langListTitle: "अपनी भाषा चुनिए",
    langListVoice: "अपनी भाषा चुनिए। एक बार छूने पर मैं नाम बोलूँगा, दोबारा छूने पर वही भाषा पक्की हो जाएगी।",
    langTapAgain: "पक्का करने के लिए दोबारा स्पर्श कीजिए",
    practiceListening: "सुन रहा हूँ… बोलिए — नमस्ते",
    practiceSay: "बोलिए — नमस्ते",
    stepOf: "चरण {n} / 7",
  },
  // Phase-entry narrations — spoken BEFORE any browser popup appears
  entry: {
    locationVoice:
      "पंडित जी, अब हम आपकी लोकेशन लेंगे — ताकि आपके आस-पास की बुकिंग आप तक पहुँचें। नीचे 'अनुमति दें' दबाइए।",
    locationTapHint: "बहुत अच्छा — अब नीचे का बटन एक बार दबा दीजिए।",
  },
  // शिष्य का परिचय — he introduces himself and earns the mic (PARICHAY)
  parichay: {
    title: "मैं शिष्य हूँ 🙏",
    body: "आपका अपना सहायक — मैं बोलूँगा, और आपकी बात भी सुनूँगा।",
    // Mockup frame 4: static mic-ask card + lock reassurance (UI text,
    // never spoken — the voice ladder owns its own lines)
    micCardLine: "मुझे सुनने के लिए माइक की अनुमति चाहिए",
    safeLine: "आपकी आवाज़ सुरक्षित है",
    allowBtn: "🎤 बात करने की अनुमति दीजिए",
    voice:
      "नमस्ते पंडित जी! मैं आपका शिष्य हूँ, और मैं आपसे बात करना चाहता हूँ। नीचे चमकता बटन दबाइए — फिर ऊपर 'अनुमति दें' दबा दीजिए।",
    granted: "धन्यवाद पंडित जी! अब मैं आपकी हर बात सुन सकता हूँ।",
    tryIt: "कुछ भी बोलकर देखिए — जैसे, नमस्ते।",
    heard: "वाह! मैंने सुन लिया। चलिए आगे बढ़ते हैं।",
    moveOn: "कोई बात नहीं — चलिए आगे बढ़ते हैं।",
    denied:
      "कोई बात नहीं — आप स्पर्श से और लिखकर भी सब कर सकते हैं। कभी भी सेटिंग से माइक चालू कर सकते हैं।",
    dismissed: "कोई बात नहीं — एक बार फिर बटन दबाइए और ऊपर 'अनुमति दें' दबाइए।",
    introOnly: "नमस्ते पंडित जी! मैं आपका शिष्य हूँ, और मैं आपसे बात करना चाहता हूँ।",
    pressAllow: "ऊपर 'अनुमति दें' दबा दीजिए।",
    alreadyGranted: "नमस्ते पंडित जी! मैं आपका शिष्य हूँ — और मैं आपको सुन भी सकता हूँ!",
    askAgainBtn: "🎤 फिर से पूछिए",
    startBtn: "🙏 बात शुरू कीजिए",
    // F2 dead-end fix (founder P0, 2026-07-23): a PERSISTENT forward path for the
    // pandit who won't touch the mic popup — voice is optional, never a gate.
    skipVoice: "बिना आवाज़ के आगे बढ़िए",
    // canon frame 4 say-ribbon (written + spoken travel together)
    say: "मैं शिष्य हूँ — आपका सहायक 🙏",
  },
  // Native-popup guidance — the arrow + chip + spoken line shown WHILE a
  // browser permission prompt (mic/location) is on screen
  perm: {
    pressAllow: "यहाँ ऊपर 'अनुमति दें' / 'Allow' दबाइए",
    pressAllowVoice: "अब ऊपर एक सवाल आया है — 'अनुमति दें' या 'Allow' दबा दीजिए।",
  },
  voiceLoop: {
    listening: "सुन रहा हूँ…",
    understanding: "समझ रहा हूँ…",
    sorryOnce: "माफ़ कीजिए, समझ नहीं आया — फिर बोलिए या नीचे लिख दीजिए",
    // F02-02/03/04: the three rungs, doc wording exact. Each is spoken AND
    // shown as written text (the walk proved voice-only fails when TTS parks).
    rung1: "माफ़ कीजिये, कृपया फिर से बोलिए।",
    rung2: "कृपया धीरे और साफ़ बोलिए।",
    rung3: "कोई बात नहीं — नीचे लिख दीजिए, या ‘सहायता चाहिए’ दबाकर हमसे बात कीजिए।",
    helpBtn: "सहायता चाहिए",
    unmatched: "समझ नहीं आया — फिर बोलिए",
    ack: "बहुत अच्छा।",
    confirmAsk: "आपने कहा {value}। सही है? हाँ या नहीं बोलिए।",
    confirmRepeat: "सही है? हाँ या नहीं बोलिए।",
    confirmSure: "क्या आप निश्चित हैं? हाँ या नहीं बोलिए।",
  },
  nav: {
    home: "होम",
    bookings: "बुकिंग",
    earnings: "कमाई",
    calendar: "कैलेंडर",
  },
  // S6b: every screen's helpLine — spoken on "मदद" AND on the
  // screen-context ask ("ये स्क्रीन क्या है / क्या करूँ मैं").
  help: {
    location: "यह लोकेशन वाली स्क्रीन है — नीचे अनुमति दीजिए दबाइए ताकि आस-पास की बुकिंग मिलें, या शहर खुद चुन लीजिए।",
    manualCity: "यहाँ अपना शहर चुनना है — बड़े शहरों में से दबाइए या नाम बोल दीजिए।",
    languageConfirm: "यहाँ अपनी भाषा पक्की करनी है — हाँ बोलिए, या दूसरी भाषा चुन लीजिए।",
    languageList: "यह भाषा चुनने की स्क्रीन है — अपनी भाषा का नाम बोलिए या तिल पर दो बार छुइए।",
    tutorial: "यह ऐप की सैर है — हर पन्ने पर मैं समझाता हूँ; आगे बढ़ने के लिए हाँ बोलिए।",
    login: "यह लॉगिन स्क्रीन है — अपना मोबाइल नंबर बोलिए या लिखिए, फिर ओटीपी आएगा।",
    otp: "यहाँ मोबाइल पर आया छह अंकों का ओटीपी लिखना है — न आया हो तो भेजो बोलिए।",
    registration: "यह रजिस्ट्रेशन है — अपना नाम और शहर बताइए, फिर खाता बनाइए।",
    readiness: "यह बुकिंग की तैयारी है — पाँच छोटे चरण; हर चरण भरकर आगे बोलिए।",
    samagriEditor: "यहाँ इस पूजा का सामग्री पैकेज बनाना है — सामान और दाम भरकर सेव कीजिए; पीछे बोलकर लौट सकते हैं।",
    celebration: "बधाई की स्क्रीन है — होम बोलिए और काम शुरू कीजिए।",
    home: "यह आपका होम है — ऊपर ऑनलाइन-ऑफलाइन का बटन, बीच में आज की बुकिंग, नीचे बुकिंग-कमाई-कैलेंडर।",
    bookings: "यह बुकिंग की सूची है — नई, आने वाली और पूरी हुई बुकिंग यहाँ दिखती हैं।",
    earnings: "यह कमाई की स्क्रीन है — इस महीने की कमाई और आने वाली राशि यहाँ दिखती है।",
    calendar: "यह कैलेंडर है — किसी दिन को दबाकर छुट्टी कर सकते हैं।",
    myPoojas: "यह आपकी पूजाओं की सूची है — नई पूजा जोड़ सकते हैं और दक्षिणा बदल सकते हैं।",
  },
  common: {
    next: "आगे बढ़िए",
    back: "पीछे जाइए",
    yes: "हाँ",
    no: "नहीं",
    skip: "स्किप कीजिए",
    submit: "जमा कीजिए",
    save: "सेव कीजिए",
    listen: "🔊 सुनिए",
    help: "मदद",
    // Mockup frame 28 wording
    loading: "एक क्षण…",
    error: "कुछ गड़बड़ हो गई। दोबारा कोशिश कीजिए।",
  },
  errors: {
    apiBaseMissing: "ऐप कॉन्फ़िगरेशन अधूरी है — टीम को बताइए",
    // Walk पP0 #5: a raw fetch error ("Failed to fetch") is English and
    // frightening on a money/Aadhaar step. Never surface err.message.
    network: "इंटरनेट टूट गया — आपकी बात सुरक्षित है, जुड़ते ही फिर भेजेंगे।",
  },
  welcome: {
    title: "हमारे पंडित जी में आपका स्वागत है",
    titleShort: "हमारे पंडित जी",
    voiceIntro: "नमस्ते पंडित जी। हमारे पंडित जी पर आपका बहुत-बहुत स्वागत है। यह प्लेटफ़ॉर्म आपके लिए ही बना है। हमारा मूल मंत्र याद रखिए: ऐप पंडित के लिए है, पंडित ऐप के लिए नहीं।",
    startBtn: "शुरू कीजिए",
  },
  auth: {
    unifiedTitle: "लॉगिन / रजिस्ट्रेशन",
    unifiedSub: "नंबर डालिए — खाता होगा तो लॉगिन, नहीं तो नया बनेगा।",
    reviewTutorial: "📖 ट्यूटोरियल फिर देखिए",
    reviewTutorialVoice: "और ट्यूटोरियल दोबारा देखना हो तो नीचे का बटन दबाइए।",
    webotpVoice: "मैसेज आते ही OTP अपने आप भर जाएगा — नीचे 'Allow' आए तो उसे दबा दीजिए।",
    phoneLabel: "अपना मोबाइल नंबर डालिए",
    phoneVoice: "पंडित जी, कृपया अपना दस अंकों का मोबाइल नंबर डालिए और आगे बढ़िए बटन दबाइए।",
    // canon frame 7 header title (OTP stays roman — canon writes it roman)
    otpTitle: "OTP सत्यापन",
    otpLabel: "OTP डालिए",
    // Mockup frame 7: "+91 … पर भेजा गया" under the heading
    otpSentTo: "+91 {phone} पर भेजा गया",
    otpVoice: "आपके मोबाइल पर छह अंकों का ओटीपी भेजा गया है। कृपया वह नंबर यहाँ डालिए।",
    otpResend: "ओटीपी दोबारा भेजिए",
    returningTitle: "वापसी पर स्वागत, पंडित जी",
    returningShishya: "ओटीपी डालिए, आपका खाता तैयार है।",
    newAccountTitle: "नया खाता बन रहा है",
    newAccountShishya: "ओटीपी डालिए, फिर दो मिनट का रजिस्ट्रेशन।",
    reauthForBooking: "पंडित जी, सुरक्षा के लिए दोबारा ओटीपी लगेगा — फिर सीधे आपकी बुकिंग खुलेगी।",
    rateLimited: "बहुत बार कोशिश हुई — 10 मिनट बाद फिर से कोशिश कीजिए।",
    waking: "सर्वर जग रहा है, बस कुछ पल…",
    slowServer: "सर्वर बहुत धीमा है — थोड़ी देर बाद फिर कोशिश कीजिए।",
  },
  onboarding: {
    step1Title: "आपका नाम",
    step1Voice: "पंडित जी, कृपया अपना पूरा नाम लिखिए।",
    step2Title: "आपका शहर",
    step2Voice: "आप किस शहर में रहते हैं? नीचे लिखिए या सूची से चुनिए।",
    step3Title: "आपकी विशेषज्ञता",
    step3Voice: "आप कौन-कौन सी पूजा करवाते हैं? जितनी पूजा आप करते हैं, उन सब पर टैप कीजिए।",
    step4Title: "अनुभव और टीम",
    step4Voice: "आपको कितने साल का अनुभव है? और आपके साथ कितने लोगों की टीम है?",
    step5Title: "दक्षिणा तय कीजिए",
    step5Voice: "हर पूजा के लिए अपनी दक्षिणा खुद तय कीजिए। ग्राहक को यही राशि दिखेगी। कोई मोलभाव नहीं होगा।",
    step6Title: "आधार अपलोड कीजिए",
    step6Voice: "सत्यापन के लिए अपने आधार कार्ड की फोटो अपलोड कीजिए। यह ग्राहकों का भरोसा बढ़ाता है।",
    step7Title: "बैंक जानकारी",
    step7Voice: "आपकी कमाई सीधे आपके खाते में आएगी। बैंक खाता या यूपीआई में से एक ज़रूर भरिए।",
    doneTitle: "बधाई हो!",
    doneVoice: "बधाई हो पंडित जी! आपकी प्रोफ़ाइल बन गई है। हमारी टीम एक दिन में सत्यापन पूरा करेगी। सत्यापन के बाद आपको बुकिंग मिलनी शुरू हो जाएंगी।",
    experienceLabel: "अनुभव (साल)",
    teamLabel: "टीम के सदस्य",
    dakshinaHint: "ग्राहक को दिखेगा: ₹",
    aadhaarLabel: "📷 आधार की फोटो लीजिए या चुनिए",
    bankTab: "बैंक खाता",
    upiTab: "UPI",
    accName: "खाता धारक का नाम",
    accNumber: "खाता संख्या",
    accNumberConfirm: "खाता संख्या दोबारा दर्ज कीजिए",
    ifscCode: "IFSC कोड",
    upiIdLabel: "UPI आईडी",
    homeBtn: "होम पर जाइए",
    nameError: "नाम कम से कम 3 वर्णों का होना चाहिए",
    cityError: "शहर का नाम आवश्यक है",
    specError: "कम से कम एक पूजा का चयन कीजिए",
    // F11-04: each pooja has its OWN floor (api lib/dakshinaFloor.ts), so this
    // local pre-check must not promise that ₹501 is enough. It states the
    // absolute lowest; the server replies with the exact figure for that pooja.
    dakshinaError: "दक्षिणा कम से कम ₹501 होनी चाहिए (₹5,00,000 से ज़्यादा नहीं) — कुछ पूजाओं के लिए इससे ज़्यादा ज़रूरी है",
    aadhaarError: "आधार कार्ड की फोटो आवश्यक है",
    paymentError: "बैंक खाता या UPI की सही जानकारी दर्ज कीजिए",
    accMismatch: "दोनों खाता संख्या मेल खानी चाहिए",
    stepIndicator: "चरण",
    specializations: {
      SATYANARAYAN: "सत्यनारायण कथा",
      GRIHA_PRAVESH: "गृह प्रवेश",
      VIVAH: "विवाह",
      MUNDAN: "मुंडन",
      NAAMKARAN: "नामकरण",
      HAVAN: "हवन",
      RUDRABHISHEK: "रुद्राभिषेक",
      SHRADH: "श्राद्ध / पिंडदान",
    },
  },
  // FLOW C — minimal registration (account only; readiness comes later)
  registration: {
    titleNew: "रजिस्ट्रेशन",
    titleComplete: "प्रोफ़ाइल पूरी कीजिए",
    // Mockup frame 6 hero pair
    heroTitle: "बस दो बातें बताइए",
    // canon frame 6 say-ribbon
    say: "बाकी सब मैं देख लूँगा 🙏",
    heroSub: "बोलकर या टाइप करके — जैसे आसान लगे",
    voiceNew: "पंडित जी, बस अपना नाम बताइए — और आपका खाता बन जाएगा। शहर हमने पहचान लिया है, चाहें तो बदल लीजिए।",
    voiceComplete: "पंडित जी, बस अपना नाम बताइए — आपकी प्रोफ़ाइल पूरी हो जाएगी।",
    cityLabel: "आपका शहर",
    // canon frame 6 shows EXAMPLE values in the field cards
    namePlaceholder: "पं. रमेश शर्मा",
    cityPlaceholder: "वाराणसी",
    createBtn: "खाता बनाइए",
    completeBtn: "प्रोफ़ाइल पूरी कीजिए",
    celebrationTitle: "खाता बन गया!",
    celebrationVoice: "बधाई हो पंडित जी! आपका खाता बन गया। होम पर चलिए — वहीं से बुकिंग की तैयारी शुरू होगी।",
  },
  // FLOW E — booking-readiness wizard (R1..R5)
  readiness: {
    title: "बुकिंग की तैयारी",
    stepOf: "कदम {n} / 5",
    exitBtn: "बाद में पूरा कीजिए",
    finishBtn: "पूरा कीजिए",
    r1Title: "पूजाएँ और दक्षिणा",
    r1Voice: "पंडित जी, आप कौन-कौन सी पूजा करवाते हैं? पूजा चुनिए, फिर हर पूजा की दक्षिणा भरिए। ग्राहक को यही राशि दिखेगी — कोई मोलभाव नहीं।",
    r1SpecLabel: "अपनी पूजाएँ चुनिए",
    r1DakshinaLabel: "हर पूजा की दक्षिणा",
    r2Title: "पूजा सामग्री",
    r2Question: "क्या आप पूजा का सामान खुद ला सकते हैं?",
    r2NoInfo: "कोई बात नहीं — सामान ग्राहक/प्लेटफ़ॉर्म का रहेगा",
    r2BuilderHint: "हर पूजा के लिए सामग्री सूची और कम से कम एक पैकेज की कीमत भरिए",
    r2PujaDone: "✓ पूरा हुआ",
    r2PujaPending: "कीमत भरना बाकी",
    r2Error: "हर पूजा के लिए कम से कम एक पैकेज की कीमत भरिए",
    r3Title: "यात्रा",
    r3Voice: "अब यात्रा की बात, पंडित जी। जो-जो आपको ठीक लगे, बस वही चालू कीजिए — बाकी बंद रहने दीजिए।",
    ownVehicle: "🏍️ खुद जाऊँगा",
    ownVehicleKm: "कितनी दूर तक?",
    ownVehicleRate: "₹12/किमी (आना-जाना)",
    kmUnit: "{km} किमी",
    train: "🚂 ट्रेन",
    trainSleeper: "स्लीपर",
    train3ac: "3AC",
    train2ac: "2AC",
    bus: "🚌 बस",
    busAc: "AC",
    busNonAc: "Non-AC",
    flight: "✈️ फ्लाइट",
    flightEconomy: "इकोनॉमी",
    exclusionsLabel: "यात्रा में परहेज़?",
    exclNoFlight: "हवाई जहाज़ नहीं",
    exclNoNight: "रात की यात्रा नहीं",
    exclNone: "कोई नहीं",
    localCabQ: "लोकल कैब/ऑटो ठीक है?",
    r4Title: "भोजन व ठहराव",
    r4Voice: "पंडित जी, अब भोजन और ठहरने की पसंद बताइए — ताकि यात्रा वाली पूजा में आपका पूरा ध्यान रखा जाए।",
    dietaryLabel: "भोजन",
    dietAny: "🍽️ कुछ भी",
    dietPureVeg: "🥗 शुद्ध शाकाहारी",
    dietJain: "🍽️ जैन भोजन",
    dietVegan: "🌱 वीगन",
    hotelFoodQ: "होटल का खाना चलेगा?",
    allergiesLabel: "कोई एलर्जी? (ज़रूरी नहीं)",
    allergiesPlaceholder: "जैसे मूँगफली",
    allowanceLabel: "प्रतिदिन भोजन भत्ता",
    allowancePlaceholder: "जैसे ₹1,000",
    allowanceNote: "यह भत्ता तभी मिलता है जब ग्राहक भोजन नहीं देते।",
    stayQ: "ग्राहक के घर रुक सकते हैं?",
    hotelTierLabel: "होटल का दर्जा",
    sharedRoomQ: "साझा कमरा चलेगा?",
    dharamshalaQ: "🛕 धर्मशाला में रुकना ठीक है?",
    advanceNoticeQ: "बाहर की पूजा — कितने दिन पहले बताना होगा?",
    aadhaarBackLabel: "आधार का पिछला हिस्सा भी डालिए",
    aadhaarBackError: "आधार का पिछला हिस्सा भी डालिए।",
    aadhaarNumberLabel: "आधार नंबर (12 अंक)",
    aadhaarNumberError: "आधार नंबर 12 अंकों का होना चाहिए।",
    aadhaarConsentLabel: "मैं सहमति देता हूँ कि सत्यापन के लिए मेरा आधार सुरक्षित रूप से रखा जाए।",
    aadhaarConsentError: "आगे बढ़ने के लिए सहमति देना ज़रूरी है।",
    hotelBudget: "साधारण · ₹1000–1500",
    hotel3Star: "अच्छा · ₹2000–3000",
    hotel4Star: "बढ़िया · 4-स्टार+",
    r5Title: "भुगतान और सत्यापन",
    r5Voice: "आख़िरी कदम, पंडित जी। आपकी कमाई सीधे आपके खाते में आएगी — बैंक खाता या यूपीआई भरिए, और सत्यापन के लिए आधार की फोटो दीजिए।",
    saveError: "सेव नहीं हो पाया — दोबारा कोशिश कीजिए।",
    readyCelebrationTitle: "अब आप बुकिंग के लिए तैयार हैं!",
    readyCelebrationVoice: "बधाई हो पंडित जी! अब आप बुकिंग के लिए तैयार हैं। सत्यापन पूरा होते ही ऑनलाइन जाकर बुकिंग लेना शुरू कीजिए।",
  },
  home: {
    todayBookings: "आज की बुकिंग",
    noBookings: "आज कोई बुकिंग नहीं है",
    goOnline: "🟢 ऑनलाइन जाइए",
    goOffline: "🔴 ऑफलाइन जाइए",
    onlineVoice: "आप अब ऑनलाइन हैं। नई बुकिंग मिल सकती हैं।",
    offlineVoice: "आप अब ऑफलाइन हैं। कोई नई बुकिंग नहीं आएगी।",
    monthEarnings: "इस महीने की कमाई",
    pendingLabel: "आना बाकी",
    pendingVerification: "आपकी प्रोफ़ाइल सत्यापन में है। जल्द पूरा होगा।",
    rejectedTitle: "प्रोफ़ाइल में सुधार चाहिए",
    resubmit: "दोबारा जमा कीजिए",
    samagriLink: "🛍️ सामग्री पैकेज",
    readinessHero: "🚩 बुकिंग पाने की तैयारी कीजिए — 5 छोटे कदम",
    readinessProgress: "{n}/5 पूरे",
    readinessHeroVoice: "पंडित जी, बुकिंग पाने के लिए बस पाँच छोटे कदम बाकी हैं। नीचे लाल झंडे वाला कार्ड दबाइए — मैं साथ-साथ चलूँगा।",
    toggleOnline: "🟢 आप ऑनलाइन हैं — बुकिंग चालू",
    toggleOnlineSub: "बंद करने के लिए दबाइए",
    toggleOffline: "🔴 आप ऑफलाइन हैं",
    toggleOfflineSub: "चालू करने के लिए दबाइए",
  },
  samagri: {
    title: "सामग्री पैकेज",
    itemNamePlaceholder: "सामग्री का नाम",
    qtyPlaceholder: "मात्रा",
    pickPuja: "पूजा का चयन कीजिए",
    addItem: "नई सामग्री जोड़िए",
    itemsCount: "सामग्री",
    saved: "सेव हो गया! आपकी सामग्री सूची सेव हो गई।",
    priceError: "कम से कम एक पैकेज की कीमत डालिए",
  },
  booking: {
    bookingStatus: "बुकिंग स्थिति",
    customerNameLabel: "यजमान का नाम",
    callCustomer: "📞 ग्राहक को फ़ोन कीजिए",
    pujaJourney: "पूजा यात्रा",
    pujaFinishedTitle: "पूजा संपन्न!",
    payoutSoon: "जल्द ही आपके खाते में आएगा",
    goToHome: "होम पर जाइए",
    completed: "पूर्ण",
    confirmCompleteTitle: "क्या आप वाकई संपन्न करना चाहते हैं?",
    left: "घर से निकले",
    started: "पूजा शुरू की",
    arrived: "स्थान पर पहुँचे",
    statusAccepted: "स्वीकृत",
    statusCompleted: "संपन्न",
    statusEnRoute: "यात्रा में",
    yajman: "यजमान",
    detailsTitle: "बुकिंग विवरण",
    requestTitle: "बुकिंग अनुरोध",
    newRequest: "नई बुकिंग आई है!",
    // canon frame 9 say-ribbon
    requestSay: "एक नई बुकिंग आई है! 🔔",
    viewNewBooking: "नई बुकिंग देखिए →",
    tapToView: "देखने के लिए दबाइए",
    accept: "स्वीकार कीजिए",
    reject: "अस्वीकार कीजिए",
    earningsTitle: "आपकी कमाई का हिसाब",
    dakshina: "दक्षिणा",
    // MONEY-TRUTH (founder 2026-07-21): the platform fee is customer-paid, on
    // TOP of the dakshina — it is NEVER a deduction from the pandit. On a
    // pandit-facing breakdown the fee is not the pandit's concern, so this
    // label reads as an informational note, not a "you lose" line. Rate is
    // PLATFORM_FEE_PERCENT (feeLabel guard keeps the number in sync).
    platformFee: "प्लेटफ़ॉर्म शुल्क — यजमान देता है (10%)",
    youGet: "आपको मिलेगा",
    travel: "यात्रा भत्ता",
    food: "भोजन भत्ता",
    samagri: "सामग्री कमाई",
    total: "कुल",
    acceptedVoice: "बधाई हो! बुकिंग स्वीकार हो गई। पूरी जानकारी बुकिंग सेक्शन में देखिए।",
    imHere: "मैं पहुँच गया",
    journeyLeftVoice: "ठीक है, आप निकल गए हैं। यजमान को सूचना भेज दी गई है।",
    journeyArrivedVoice: "आप पहुँच गए हैं। पूजा शुरू करने पर अगला बटन दबाइए।",
    journeyStartedVoice: "पूजा शुरू हो गई। संपन्न होने पर हरा बटन दबाइए।",
    pujaComplete: "🙏 पूजा संपन्न हुई",
    completeVoice: "पूजा संपन्न। आपकी राशि जल्द ही आपके खाते में भेजी जाएगी। धन्यवाद पंडित जी।",
  },
  earnings: {
    title: "कमाई",
    today: "आज",
    thisWeek: "इस हफ़्ते",
    thisMonth: "इस महीने",
    // Mockup frame 19 section labels — shorter, same meaning (आना बाकी
    // also mirrors the home hero's pending row wording)
    pendingPayout: "आना बाकी",
    paid: "मिल गया",
    introVoice: "यहाँ आपकी सारी कमाई का हिसाब है। आने वाली राशि दो से तीन दिन में आपके खाते में पहुँचती है।",
    processing: "प्रोसेस में",
    noPending: "कोई आने वाली राशि नहीं",
    noPaid: "अभी तक कोई राशि नहीं मिली",
    paidBanner: "आपके खाते में भेज दिए गए",
    paidVoice: "पंडित जी, {amount} रुपये आपके खाते में भेज दिए गए हैं। धन्यवाद।",
  },
  welcomeFlow: {
    welcome: "नमस्ते पंडित जी! हमारे पंडित जी में आपका हार्दिक स्वागत है। शुरू करने के लिए नीचे बटन दबाइए।",
    homepage: "पंडित जी, यह ऐप आपके लिए बना है। नए ग्राहक और नई आमदनी — शुरू करने के लिए बटन दबाइए।",
    identity: "पंडित जी, यहाँ अपनी पहचान की जानकारी दीजिए।",
    locationPermission: "पंडित जी, ग्राहक आपके पास के इलाके से मिलें, इसके लिए लोकेशन की अनुमति दीजिए।",
    manualCity: "कोई बात नहीं पंडित जी। अपना शहर बोलकर बताइए, या सूची से चुनिए।",
    help: "यह मदद की स्क्रीन है। यहाँ आपके हर सवाल का जवाब है। ज़रूरत हो तो हमें फ़ोन भी कर सकते हैं।",
    voiceTutorial: "आइए पंडित जी, हम आपको बताते हैं कि यह ऐप बोलकर कैसे चलता है।",
    emergency: "यह आपातकालीन स्क्रीन है। ज़रूरत पड़ने पर यहाँ से तुरंत मदद मिलेगी।",
    emergencySos: "घबराइए नहीं पंडित जी। नीचे बड़ा लाल बटन दबाते ही आप सीधे हमारी सहायता टीम से फ़ोन पर जुड़ जाएँगे — वे आपकी मदद करेंगे।",
    resume: "स्वागत है पंडित जी! चलिए वहीं से शुरू कीजिए जहाँ आपने छोड़ा था।",
  },
  language: {
    choice: "पंडित जी, आप किस भाषा में बात करना चाहेंगे? भाषा का नाम बोलिए या उस पर टैप कीजिए।",
    list: "यहाँ सभी भाषाओं की सूची है। अपनी भाषा पर टैप कीजिए।",
    confirm: "क्या यही आपकी भाषा है? हाँ या नहीं बोलिए।",
    set: "बहुत बढ़िया! आपकी भाषा सेट हो गई है।",
  },
  permissions: {
    mic: "पंडित जी, बोलकर जवाब देने के लिए माइक की अनुमति चाहिए। अनुमति दीजिए बटन दबाइए।",
    micDenied: "माफ़ कीजिए पंडित जी, माइक की अनुमति नहीं मिली। कोई बात नहीं — आप स्पर्श से भी ऐप चला सकते हैं, और मैं बोलकर आपको सब समझाता रहूँगा।",
    location: "ग्राहक आपके इलाके से मिलें, इसके लिए लोकेशन की अनुमति दीजिए।",
    notifications: "नई बुकिंग की सूचना तुरंत मिले, इसके लिए नोटिफिकेशन की अनुमति दीजिए।",
  },
  bookingsList: {
    title: "मेरी बुकिंग",
    intro: "यह आपकी बुकिंग की सूची है। नई, आने वाली या पूरी हुई बुकिंग — बोलकर बताइए कौन सी देखनी है।",
  },
  settingsScreen: {
    intro: "यह सेटिंग की स्क्रीन है। यहाँ से आप आवाज़ चालू या बंद कर सकते हैं।",
    voiceOff: "ठीक है, अब आप लिखकर जवाब देंगे। आवाज़ फिर से चालू करने के लिए यहीं आइए।",
    voiceOn: "आवाज़ फिर से चालू हो गई है। स्वागत है पंडित जी!",
    soundLabel: "घंटी की आवाज़",
    soundDesc: "नई बुकिंग और शुभ अवसरों पर मधुर घंटी बजेगी",
    soundOff: "ठीक है, अब घंटी नहीं बजेगी।",
    soundOn: "घंटी की आवाज़ चालू हो गई है।",
  },
  tutorial: {
    skip: "स्किप कीजिए",
    submit: "जमा कीजिए",
    next: "आगे",
    slide1Title: "स्वागत",
    slide1: "नमस्ते पंडित जी! मैं शिष्य हूँ — आपका सहायक। यह ऐप आपके लिए बना है, और मैं हर कदम पर आपके साथ बोलूँगा, सुनूँगा, और मदद करूँगा। चलिए दो मिनट में सब समझाता हूँ।",
    slide2Title: "कमाई की कहानी",
    slide2: "पंडित रमेश जी पहले महीने में अठारह हज़ार कमाते थे। ऐप से जुड़कर अब त्रेसठ हज़ार कमाते हैं — ज़्यादा बुकिंग, यात्रा भत्ता, और सामग्री की कमाई मिलाकर। आपकी दक्षिणा आप खुद तय करेंगे, कोई मोलभाव नहीं।",
    slide3Title: "शिष्य को सुलाना-जगाना",
    slide3: "नीचे यह मैं हूँ — शिष्य। मुझे दबाइए, मैं सो जाऊँगा और ऐप सामान्य हो जाएगा। दोबारा दबाइए — मैं जाग जाऊँगा। आज़माइए!",
    slide4Title: "बोलिए या लिखिए",
    slide4: "इस ऐप में हर सवाल का जवाब आप बोलकर दे सकते हैं — या नीचे दिख रहे खाने में लिख सकते हैं। जो आपको आसान लगे। बोलेंगे तो मैं दोहराकर पूछूँगा — सही है या नहीं।",
    slide5Title: "माइक की आज्ञा + अभ्यास",
    slide5: "बोलकर जवाब देने के लिए माइक की अनुमति चाहिए। अनुमति दीजिए, फिर बोलिए — नमस्ते।",
    slide5Practice: "वाह! आपने बोलकर जवाब दिया।",
    slide5Denied: "कोई बात नहीं, आप लिखकर भी सब कर सकते हैं।",
    slide5Button: "माइक की अनुमति दीजिए",
    slide5Blocked: "ब्राउज़र की सेटिंग में माइक चालू कीजिए",
    slide5Retry: "फिर कोशिश कीजिए",
    slide5Again: "एक बार फिर बोलकर देखिए…",
    slide6Title: "बुकिंग कैसे आएगी",
    // TRUTHFUL-STATE (founder F19 ruling, 2026-07-23): the CALL is the promise —
    // the bell rings only while the app is open, so the narration never implies
    // an automatic alert. "हम आपको फ़ोन करेंगे" is what actually happens
    // (pilot-ops-runbook.md §2, operator-call procedure).
    slide6: "जब कोई परिवार आपको बुक करेगा, हम आपको फ़ोन करेंगे। और जब ऐप खुला होगा, ऐसी घंटी बजेगी और मैं बोलकर बताऊँगा — नई बुकिंग आई है। साथ में पूरा हिसाब दिखेगा: दक्षिणा, यात्रा भत्ता, भोजन भत्ता।",
    slide7Title: "स्वीकार से संपन्न तक",
    slide7: "बुकिंग पसंद आए तो स्वीकार कीजिए बटन दबाइए — या बस बोलिए, स्वीकार। पूजा के दिन हर पड़ाव पर एक बटन दबाते जाइए, और अंत में — पूजा संपन्न।",
    slide8Title: "पैसा कब और कैसे",
    slide8: "पूजा संपन्न होते ही आपकी राशि पक्की हो जाती है, और चौबीस घंटे के अंदर सीधे आपके बैंक खाते में आ जाती है। कमाई वाले हिस्से में आप हर पाई का हिसाब देख सकते हैं।",
    slide9Title: "सामग्री से अतिरिक्त कमाई",
    slide9: "आप अपनी पूजा-सामग्री का फिक्स दाम तय कर सकते हैं। परिवार आपका पैकेज चुनेगा तो वह कमाई भी आपकी।",
    slide10Title: "कैलेंडर — आपकी मर्ज़ी",
    slide10: "जिस दिन आप उपलब्ध नहीं — कैलेंडर में उस तारीख़ को स्पर्श कर बंद कर दीजिए। उस दिन कोई बुकिंग नहीं आएगी। ऑनलाइन-ऑफलाइन बटन से आप कभी भी बुकिंग रोक सकते हैं।",
    slide11Title: "चार पक्के वादे",
    slide11: "हमारे चार वादे: दक्षिणा आप तय करेंगे। पैसा चौबीस घंटे में। यात्रा का इंतज़ाम हमारा। और किसी भी दिक्कत में — एक फ़ोन पर मदद।",
    slide12Title: "सत्यापन = सम्मान",
    slide12: "भरोसे के लिए हम आधार और एक छोटा वीडियो सत्यापन करेंगे। सत्यापित पंडित जी को परिवार ज़्यादा बुक करते हैं — यह आपका सम्मान बढ़ाता है।",
    slide13Title: "मदद हमेशा पास",
    slide13: "कभी भी अटक जाइए — मदद वाले हिस्से में हमारा नंबर है। सीधे बात कीजिए, ऐप की टीम आपके साथ है।",
    slideHomeTourTitle: "होम स्क्रीन की सैर",
    slideHomeTour: "यह आपका होम है। हरा बटन — बुकिंग चालू-बंद। बीच में आज की बुकिंग। नीचे की पट्टी से कमाई, कैलेंडर, बुकिंग — सब एक छुअन पर।",
    tourStep1Title: "बुकिंग चालू-बंद",
    tourStep1: "हरा बटन दबाकर बुकिंग लेना शुरू या बंद कीजिए।",
    tourStep2Title: "आज की बुकिंग",
    tourStep2: "आज की पूजा यहाँ दिखेगी — समय और जगह के साथ।",
    tourStep3Title: "कमाई की पट्टी",
    tourStep3: "नीचे की पट्टी से कमाई, कैलेंडर, बुकिंग — सब एक छुअन पर।",
    slidePoojasTitle: "अपनी पूजाएँ बढ़ाइए",
    slidePoojas: "आगे चलकर नई पूजा जोड़नी हो — प्रोफ़ाइल में जाइए, मेरी पूजाएँ, और नई पूजा जोड़िए दबाइए। दक्षिणा तय कीजिए, बस। सत्यापन के बाद वह पूजा भी बुक होने लगेगी।",
    rewatchNote: "यह पाठ आप कभी भी मदद वाले हिस्से से दोबारा देख सकते हैं।",
    // ── canon on-screen captions (frames 5a-5f) — canon shows CAPTIONS,
    // never the narration paragraph; explanation is voice-only. Register
    // law applied where canon copy was casual (छूकर→स्पर्श, करें→कीजिए).
    capKamai: "आपकी कमाई",
    capBooking: "नई बुकिंग आई! 🔔",
    capSleep: "स्पर्श कर जगाइए",
    subSleep: "आराम के समय वह सो जाता है",
    capMic: "बस बोलिए 🎤",
    capVerify: "✓ प्रमाणित",
    subVerify: "एक छोटा वीडियो, और भरोसा तैयार",
    capWelcome: "अब आपकी बारी! 🎉",
    subWelcome: "शिष्य हर कदम आपके साथ है 🙏",
    slide14Title: "शुरू कीजिए?",
    slide14: "सब समझ गए? बस दो मिनट का रजिस्ट्रेशन बाकी है — नाम, शहर, आपकी पूजाएँ और दक्षिणा। शुरू कीजिए?",
    // canon frame 5f CTA "शुरू करें" → register law "शुरू कीजिए"
    registerNow: "शुरू कीजिए",
    later: "बाद में",
    laterLine: "कोई बात नहीं पंडित जी। जब मन बने, नीचे बटन दबाकर पंजीकरण कीजिए। हम यहीं हैं।",
    advanceAsk: "आगे बढ़िए? 'हाँ' बोलिए।",
  },
  support: {
    phone: "+918934095599",
    callLabel: "📞 सहायता को फ़ोन कीजिए",
  },
  offline: {
    banner: "इंटरनेट नहीं है — जुड़ते ही सब ठीक",
    actionBlocked: "इंटरनेट नहीं है — कृपया थोड़ी देर में कोशिश कीजिए",
  },
  settingsRows: {
    viewProfile: "प्रोफ़ाइल",
    language: "भाषा",
    helpRow: "मदद व सहायता",
    logout: "लॉगआउट",
    logoutConfirm: "क्या आप वाकई लॉगआउट करना चाहते हैं?",
  },
  helpScreen: {
    title: "सहायता",
    // canon frame 23 say-ribbon
    say: "मैं यहीं हूँ, बेझिझक बताइए 🙏",
    call: "📞 फ़ोन कीजिए",
    rewatchTutorial: "🔁 ट्यूटोरियल फिर देखिए",
    emergency: "🆘 आपातकाल",
  },
  // Boring-pass E: पूजा-संपन्न completion narration, rotated so it never
  // feels canned (see lib/celebration.ts).
  celebration: {
    completeLines: [
      "पूजा संपन्न! आपकी राशि जल्द ही आपके खाते में आ जाएगी। धन्यवाद पंडित जी।",
      "बहुत सुंदर पूजा हुई! आपकी दक्षिणा शीघ्र ही आपके खाते में पहुँचेगी।",
      "शुभ कार्य संपन्न! आपकी राशि जल्द आपके खाते में — धन्यवाद पंडित जी।",
      "पूजा पूरी हुई, पंडित जी। यजमान प्रसन्न होंगे, और आपकी राशि सुरक्षित है।",
      "पूजा संपन्न हुई! आपकी मेहनत का फल जल्द ही आपके खाते में आएगा।",
    ],
  },
  myPoojas: {
    title: "मेरी पूजाएँ",
    intro: "यहाँ आपकी पूजाएँ हैं। दाम बदलने के लिए दक्षिणा पर स्पर्श कीजिए। नई पूजा जोड़ने के लिए नीचे का बटन दबाइए।",
    addBtn: "+ नई पूजा जोड़िए",
    verified: "✓ प्रमाणित",
    pendingVerify: "सत्यापन बाकी",
    rejected: "अस्वीकृत",
    rejectedReasonPrefix: "कारण:",
    // Canon frame 21: the way back after a rejection (pilot-critical)
    resubmit: "दुबारा भेजिए",
    removeBlocked: "इस पूजा की बुकिंग चल रही है — अभी हटा नहीं सकते",
    pickPooja: "कौन सी पूजा जोड़िए?",
    dakshinaLabel: "दक्षिणा तय कीजिए",
    dakshinaPrompt: "इस पूजा की दक्षिणा कितनी होगी? बोलिए या लिखिए।",
    saveBtn: "सेव कीजिए",
    removed: "पूजा हटा दी गई",
    added: "पूजा जुड़ गई — सत्यापन के बाद बुक होने लगेगी",
    editPrompt: "नई दक्षिणा बोलिए या लिखिए।",
  },
  profileView: {
    pujasVerified: "प्रमाणित पूजाएँ",
    title: "मेरी प्रोफ़ाइल",
    pujas: "आपकी पूजाएँ",
    dakshina: "दक्षिणा",
    editNote: "बदलाव के लिए सहायता को फ़ोन कीजिए",
  },
  homeSummary: {
    none: "आज कोई बुकिंग नहीं है।",
    one: "आज एक बुकिंग है, {time} बजे।",
    many: "आज {count} बुकिंग हैं।",
    tomorrow: "कल की बुकिंग",
  },
  bookingsSummary: {
    none: "अभी कोई नई बुकिंग नहीं है।",
    counts: "{count} नई बुकिंग हैं।",
    today: "आज",
    tomorrowHdr: "कल",
    thisWeek: "इस हफ़्ते",
    later: "बाद में",
  },
  bookingDetailExtra: {
    showRoute: "🗺 रास्ता दिखाइए",
  },
  festival: {
    greeting: "की हार्दिक शुभकामनाएं",
    hint: "इस समय बुकिंग बढ़ जाती हैं — ऑनलाइन रहें!",
  },
  milestones: {
    title: "आपकी प्रगति",
    nextLabel: "अगला पड़ाव:",
    FIRST_BOOKING: "🥇 पहली बुकिंग पूरी! शुभ शुरुआत, पंडित जी।",
    BOOKINGS_5: "🌟 5 पूजाएँ संपन्न!",
    BOOKINGS_11: "🌺 11 पूजाएँ संपन्न!",
    BOOKINGS_21: "🏵️ 21 पूजाएँ!",
    BOOKINGS_51: "👑 51 पूजाएँ — आप वरिष्ठ पंडित हैं!",
    EARNED_11K: "💰 ₹11,000 की कमाई पार!",
    EARNED_51K: "💰 ₹51,000 पार!",
    EARNED_1L: "🎉 ₹1 लाख की कमाई — बधाई हो!",
    PROFILE_COMPLETE: "✅ प्रोफ़ाइल पूर्ण!",
  },
  empty: {
    todayNoBookingsTitle: "आज कोई बुकिंग नहीं",
    todayNoBookingsHint: "ऑनलाइन रहें — नई बुकिंग की सूचना घंटी बजाकर मिलेगी",
    // Mockup frame 27: empty states speak in शिष्य's warm first person
    noBookingsYetTitle: "अभी कोई बुकिंग नहीं",
    noBookingsYetHint: "मैं नज़र रखे हूँ — आते ही आपको बता दूँगा 🙏",
    noPayoutsTitle: "कमाई यहाँ दिखेगी",
    noPayoutsHint: "पहली पूजा का इंतज़ार है — दीया जल रहा है 🪔",
    noPoojasCta: "पहली पूजा जोड़िए",
    noPoojasTitle: "अभी कोई पूजा नहीं जोड़ी",
    noPoojasHint: "पहली पूजा जोड़िए — मैं हर कदम बताऊँगा 🙏",
    calendarEmptyTitle: "इस महीने अभी कोई बुकिंग नहीं",
  },
  // Canon frame 23 "सामान्य सवाल · बुकिंग · पैसे · सत्यापन". Static content,
  // no CMS. ONE TRUTH: every answer mirrors services/api shishyaFacts
  // CURATED_HI — the FAQ must never tell the pandit something different
  // from what शिष्य says out loud. Founder 2026-07-21: the pandit keeps 100%
  // of the dakshina; the platform fee is customer-paid and separate (faq
  // guard pins the 100%/कोई-कटौती truth).
  faq: {
    title: "सामान्य सवाल",
    subtitle: "बुकिंग · पैसे · सत्यापन",
    groupBooking: "बुकिंग",
    groupMoney: "पैसे",
    groupVerify: "सत्यापन",
    items: [
      { g: "booking", q: "दक्षिणा कौन तय करता है?", a: "दक्षिणा आप खुद तय करते हैं, पंडित जी — ग्राहक को वही राशि दिखती है और कोई मोलभाव नहीं होता।" },
      { g: "booking", q: "नई बुकिंग कैसे पता चलेगी?", a: "नई बुकिंग आते ही घंटी बजेगी और बुकिंग वाले हिस्से में दिखेगी। आप हाँ या ना, दोनों कह सकते हैं।" },
      { g: "booking", q: "सहायक पंडितों का भुगतान कौन करता है?", a: "सहायक पंडितों का प्रबंध और भुगतान आप स्वयं करते हैं, पंडित जी। कुल दक्षिणा में उनकी दक्षिणा भी शामिल होती है, जो आप उन्हें देते हैं।" },
      { g: "money", q: "पैसा कब और कैसे मिलेगा?", a: "पूजा संपन्न होने के 48 घंटे के अंदर पैसा सीधे आपके बैंक खाते या यूपीआई में आ जाता है।" },
      { g: "money", q: "प्लेटफ़ॉर्म कितना काटता है?", a: "दक्षिणा में से कुछ नहीं काटता — पूरा 100 प्रतिशत आपका है। प्लेटफ़ॉर्म का शुल्क अलग से यजमान देता है, आपकी दक्षिणा घटती नहीं।" },
      { g: "money", q: "यात्रा का ख़र्च कौन देता है?", a: "अपनी गाड़ी से जाने पर ₹12 प्रति किलोमीटर आना-जाना मिलता है; ट्रेन-बस का इंतज़ाम बुकिंग के साथ तय होता है।" },
      { g: "money", q: "पैसा न आए तो क्या कीजिए?", a: "पूजा पूरी होने के 48 घंटे बाद भी पैसा न आए, तो मदद वाले हिस्से से हमारी टीम को फ़ोन कीजिए — तुरंत देखा जाएगा।" },
      { g: "money", q: "क्या ऐप का कोई शुल्क है?", a: "ऐप बिल्कुल मुफ़्त है — न जुड़ने का कोई शुल्क, न चलाने का।" },
      { g: "verify", q: "सत्यापन में कितना समय लगता है?", a: "हमारी टीम आमतौर पर 2 दिन में सत्यापन पूरा कर देती है — पूरा होते ही आपको सूचना मिलेगी।" },
      { g: "verify", q: "आधार क्यों माँगते हैं? सुरक्षित है?", a: "जी हाँ, आधार पूरी तरह सुरक्षित है — सिर्फ़ सत्यापन के लिए इस्तेमाल होता है और किसी ग्राहक को कभी नहीं दिखता।" },
      { g: "verify", q: "पूजा अस्वीकृत हो जाए तो?", a: "कोई बात नहीं। कारण वहीं लिखा मिलेगा — 'दुबारा भेजिए' दबाकर नया वीडियो भेज दीजिए, जाँच फिर से होगी।" },
      { g: "verify", q: "भरोसा कैसे रहेगा?", a: "ग्राहक का पैसा पहले प्लेटफ़ॉर्म के पास सुरक्षित रहता है और पूजा पूरी होने पर आपको मिलता है — इसीलिए दोनों तरफ़ भरोसा बना रहता है।" },
    ],
  },
  calendar: {
    title: "कैलेंडर",
    blockVoice: "जिस दिन खाली नहीं हैं, वह तारीख़ दबाकर छुट्टी लगाइए।",
    // Mockup frame 20 vocabulary — छुट्टी/खाली (warmer than बंद/खुला)
    hint: "तारीख दबाकर छुट्टी लगाइए",
    blocked: "छुट्टी",
    available: "खाली",
    booking: "बुकिंग",
  },
  status: {
    requested: "🔔 नई",
    accepted: "📅 स्वीकृत",
    inProgress: "🚗 चालू",
    completed: "✅ पूर्ण",
    cancelled: "✖ रद्द",
  },
  greetings: {
    morning: "🌅 सुप्रभात",
    afternoon: "☀️ नमस्ते",
    evening: "🌆 शुभ संध्या",
    night: "🌙 शुभ रात्रि",
    suffix: "जी",
    shloka1: "शुभ लाभ आपके साथ हो",
    shloka2: "सर्वे भवन्तु सुखिनः",
    shloka3: "आपका दिन मंगलमय हो",
  },
  settings: {
    title: "सेटिंग्स",
    voiceInputLabel: "आवाज़ से जवाब देना",
    voiceInputDesc: "चालू करने पर आप बोलकर भी फ़ील्ड भर सकते हैं",
  },
} as const;
