# THE PANDIT WALK — Isj's phone-in-hand tour

**Walker:** पंडित रामेश्वर शास्त्री, 64, वाराणसी · Samsung A12 · Devanagari-only · suspicious of documents & money.
**Walked:** `main` @ `2ff8d0f` (production state). In-flight `fix/canon-exact` deltas noted inline where they change a screen.
**Report-only — no app code was changed and nothing was committed to produce this.**

**Screenshots:** the in-app screenshot harness is dead this session, so each screen links its **canon artboard frame** in `design/canon/हमारे पंडित जी.dc.html` as the visual reference (open that file, find the titled frame). Honest substitute, not a live capture.

**Totals:** 69 screens · 11 पP0 · 59 पP1 · 71 पP2.

Severity: **पP0** he abandons / gets stuck / misunderstands money · **पP1** confused, needs his grandson · **पP2** friction.

---

## How to walk this (pilot login)

Base URL: **hmarepanditji-pandit.vercel.app** · Pilot login where auth-gated: **9876500050 / 123456**. Strip the `(group)` segments from routes below to get the real path. Where a screen needs state (e.g. "a REQUESTED booking"), the how-to-reach line says so.

## Journey 1 · पहली बार खोलना → भाषा → परिचय → माइक

### स्प्लैश / सबसे पहली बार खोलना (SunriseSplash)

- **Route:** `/onboarding (phase SPLASH) — root / भी यहीं भेजता है`
- **How to reach:** Fresh install / cleared storage, no token. Real URL: hmarepanditji-pandit.vercel.app/ (redirects to /onboarding). No login needed — this is frame one.
- **Visual (canon):** frame 1 (splash) in `design/canon/हमारे पंडित जी.dc.html`

**रामेश्वर का पल:** दीया जला, ॐ ऊपर उठा, 'हमारे पंडित जी' लिखा दिखा — सुंदर है। पर कोई आवाज़ नहीं आई। मैं रुका रहा… शिष्य कब बोलेगा? फ़ोन खराब तो नहीं? मैंने कुछ नहीं छुआ क्योंकि किसी ने कहा ही नहीं कि छूना है।

**Findings:**

- **पP2 _(F02-01)_ · **NEEDS ISJ ON DEVICE**** — पहली बार खोलने पर स्क्रीन बिलकुल चुप है — कोई आवाज़ नहीं। मैं आवाज़ का इंतज़ार करता हूँ, पर लगभग ढाई सेकंड तक न आवाज़, न कोई लिखा हुआ इशारा कि आगे क्या करूँ।
  - *Why it fails:* ब्राउज़र autoplay law के कारण बिना छुए कोई TTS नहीं बज सकता — speakAndWait 'parked' हो जाता है (SunriseSplash.tsx:170-189)। tapHint chip केवल 2500ms पर दिखता है (showHint setTimeout, line 186-189)। तब तक रामेश्वर के लिए स्क्रीन एक चुप, बंद-सा फ़ोन है — 'शिष्य कहाँ है?'
  - *Fix:* tapHint chip 'नमस्ते पंडित जी 🙏 आगे बढ़ने के लिए स्पर्श करें' (strings.ts:123) को frame-one पर, ढाई सेकंड बाद नहीं, तुरंत दिखाओ — और दीया/orb पर हल्की 'छूने के लिए' धड़कन डालो ताकि बिना आवाज़ के भी अगला कदम 3 सेकंड में साफ़ हो।

**✅ CHECK FOR ISJ:** छूने के बाद 'नमस्ते पंडित जी!' greeting असली A12 पर ~1 सेकंड में, गर्मजोशी से, बिना कटे बजता है — हाँ या नहीं?

---

### लोकेशन अनुमति (LocationPermissionScreen)

- **Route:** `/onboarding (phase LOCATION_PERMISSION)`
- **How to reach:** Splash के बाद अपने-आप। कोई login नहीं। 'अनुमति दें' दबाने पर native geolocation popup आता है।
- **Visual (canon):** frame 2 (location) in `design/canon/हमारे पंडित जी.dc.html`

**रामेश्वर का पल:** 'आप कहाँ सेवा देते हैं?' — यह मुझे समझ आया, अच्छा लगा। नीचे 'अनुमति दें' बड़ा बटन है। मैंने दबाया… और ऊपर एक छोटा-सा डिब्बा खुला जिसमें अंग्रेज़ी में कुछ लिखा है और दो बटन हैं। मुझे नहीं पता कौन-सा दबाऊँ।

**Findings:**

- **पP1 _(F03-02)_ · **NEEDS ISJ ON DEVICE**** — 'अनुमति दें' दबाते ही जो native geolocation popup आता है वह पूरा अंग्रेज़ी में है ('Allow'/'Block'/'While using the app')। मैं एक भी शब्द नहीं पढ़ सकता।
  - *Why it fails:* यह OS का popup है, app इसे देवनागरी नहीं कर सकती। App केवल PopupPointer तीर (line 245) और आवाज़ perm.pressAllowVoice "…'अनुमति दें' या 'Allow' दबाइए" (strings.ts:176) से मदद करती है। अगर TTS चुप रहा तो रामेश्वर एक अंग्रेज़ी popup के सामने अकेला — कौन-सा बटन 'हाँ' है, पता नहीं। यही इस पूरे प्रवाह की सबसे बड़ी दीवार है।
  - *Fix:* आवाज़ हमेशा बजे और दोहराए, और popup को अंग्रेज़ी शब्द से नहीं बल्कि जगह/रंग से बताए: 'ऊपर बाईं तरफ़ वाला पहला बटन दबाइए'। PopupPointer तीर को उसी बटन पर मोटा और धड़कता रखें।

**✅ CHECK FOR ISJ:** असली A12 Chrome पर PopupPointer तीर + हिंदी आवाज़ मिलकर अंग्रेज़ी 'Allow' बटन को बिना पढ़े साफ़ पहचनवा देते हैं — हाँ या नहीं?

---

### पहचाना गया शहर — पुष्टि (LocationPermissionScreen — detected sub-state)

- **Route:** `/onboarding (phase LOCATION_PERMISSION, detected!=null)`
- **How to reach:** Location screen पर 'अनुमति दें' → native popup में Allow → reverse-geocode सफल → यह पुष्टि-कार्ड दिखता है। (asli device par GPS chahiye.)
- **Visual (canon):** frame 2 (location — city confirm) in `design/canon/हमारे पंडित जी.dc.html`

**रामेश्वर का पल:** एक कार्ड आया जिसमें बड़े अक्षरों में लिखा है — पर यह देवनागरी नहीं, अंग्रेज़ी के अक्षर हैं। शिष्य ने पूछा 'क्या आप यहाँ हैं?' मैंने कहा 'हाँ'… कुछ नहीं हुआ। फिर 'हाँ, हाँ' — फिर भी कुछ नहीं। यह क्या है?

**Findings:**

- **पP0 _(F03-02)_** — शिष्य आवाज़ से पूछता है 'क्या आप X में हैं?' — एक हाँ/नहीं सवाल — पर मैं आवाज़ से 'हाँ' कहूँ तो कुछ नहीं होता। सिर्फ़ उँगली से '✓ यही सही है' दबाने पर आगे बढ़ता है।
  - *Why it fails:* इस detected sub-view में registered voice commands वही पुराने हैं: हाँ → allow-बटन को pulse करना, नहीं → onDenied (lines 60-72)। पर allow-बटन इस view में render ही नहीं होता; और '✓ यही सही है'/'जगह बदलें' बटनों (lines 166-188) पर कोई voice command नहीं है। यानी आवाज़ से पूछा गया सवाल आवाज़ से जवाब देने पर मरा हुआ है — रामेश्वर 'हाँ' बोलता रहेगा, फँसा रहेगा।
  - *Fix:* इस sub-state पर voice commands जोड़ें: यही/सही/हाँ/ठीक → onGranted(detected.city, detected.state); बदलो/नहीं/जगह बदलें → onDenied। हर आवाज़-से-पूछे सवाल का आवाज़-जवाब चलना चाहिए (edge #4)।
- **पP1 _(F03-02)_** — पहचाना हुआ शहर अंग्रेज़ी अक्षरों में दिखता है (जैसे 'Varanasi', 'Uttar Pradesh') — मैं पढ़ ही नहीं सकता, इसलिए बता नहीं सकता कि सही शहर है या ग़लत।
  - *Why it fails:* city/state सीधे nominatim से आते हैं (data.address.city, line 95) और वैसे ही कार्ड में छपते हैं (lines 157-161) — कोई देवनागरी अनुवाद नहीं। edge #1 कहता है सुझाव दिखे और पुष्टि हो, पर देवनागरी-only पंडित के लिए Latin नाम 'दिखाना' न दिखाने जैसा है।
  - *Fix:* geocoded शहर/राज्य को कार्ड में छापने से पहले देवनागरी में लिप्यंतरित/मैप करें (वाराणसी / उत्तर प्रदेश)। कभी Latin जगह-नाम न दिखाएँ; आवाज़ भी 'क्या आप वाराणसी में हैं?' सही उच्चारण से बोले।

**✅ CHECK FOR ISJ:** detected-city कार्ड पर 'हाँ'/'यही सही है' बोलने से आगे बढ़ता है या चुपचाप कुछ नहीं होता — असली आवाज़ पर टेस्ट करें: बढ़ता है, हाँ या नहीं?

---

### शहर खुद चुनें (ManualCityScreen)

- **Route:** `/onboarding (phase MANUAL_CITY)`
- **How to reach:** Location screen पर 'शहर खुद चुनें' दबाएँ, या native geolocation popup को Block/dismiss करें → onDenied → यह screen।
- **Visual (canon):** frame 2 (location — manual) in `design/canon/हमारे पंडित जी.dc.html`

**रामेश्वर का पल:** 'अपना शहर चुनें' — ठीक। पर नीचे जो पाँच शहर लिखे हैं — दिल्ली, नोएडा, गुरुग्राम… इनमें मेरा वाराणसी नहीं है। ऊपर एक खाली डिब्बा है 'अपना शहर लिखें' — पर मैंने कभी लिखा नहीं, न मुझे टाइप करना आता है। मैं वाराणसी बोलूँ तो?

**Findings:**

- **पP0 _(F03-03)_** — अपना शहर (वाराणसी) मैं आवाज़ से चुन ही नहीं सकता — बोलने पर कुछ नहीं होता — और cityVoice कहता है 'नाम लिख दीजिए', यानी टाइप करो। मैं टाइप नहीं कर सकता। कोई रास्ता नहीं बचता।
  - *Why it fails:* voice commands केवल उन्हीं 5 NCR शहरों के लिए हैं (CITY_SPOKEN, lines 28-52); 'वाराणसी' किसी keyword में नहीं, तो STT मैच नहीं होगा। cityVoice narration (strings.ts:134) खुद 'नाम लिख दीजिए' कहकर टाइपिंग मानकर चलता है — जो रामेश्वर के लिए दीवार है। सूची में शहर नहीं + बोलकर नहीं चुन सकता + टाइप नहीं कर सकता = dead end।
  - *Fix:* कोई भी शहर बोलने दें: 'अपना शहर बोलिए' → STT → 'आपने कहा वाराणसी — सही है?' पुष्टि-लूप → चयन। कभी टाइपिंग अनिवार्य न करें; keyboard केवल fallback हो, पहला रास्ता नहीं।
- **पP1 _(F03-03)_** — पाँच 'लोकप्रिय' शहर सिर्फ़ दिल्ली-NCR के हैं (दिल्ली, नोएडा, गुरुग्राम, गाज़ियाबाद, फ़रीदाबाद) — काशी के पंडित का शहर इनमें नहीं। मुझे मजबूरन टाइप करना पड़ेगा।
  - *Why it fails:* POPULAR_CITIES hardcoded NCR सूची है (ManualCityScreen.tsx:27), detected region से नहीं जुड़ी। दूसरे इलाके के पंडित के लिए ये पाँच कार्ड बेकार हैं और उसे उस टेक्स्ट-फ़ील्ड में धकेलते हैं जो वह इस्तेमाल नहीं कर सकता।
  - *Fix:* detected राज्य/इलाके के हिसाब से शहर दिखाएँ, या तीर्थ-शहरों की सूची (वाराणसी/प्रयागराज/अयोध्या/मथुरा…) रखें; और फ़ील्ड को आवाज़-से-भरने योग्य बनाएँ।

**✅ CHECK FOR ISJ:** इस screen पर 'वाराणसी' (सूची में न होने वाला शहर) बोलने पर app उसे पकड़कर पुष्टि करती है या चुप रह जाती है — असली आवाज़ पर: पकड़ती है, हाँ या नहीं?

---

### भाषा पुष्टि (LangConfirmScreen2)

- **Route:** `/onboarding (phase LANGUAGE_CONFIRM)`
- **How to reach:** शहर पहचानने/चुनने के बाद अपने-आप। languageConfirmed झूठ हो तभी दिखता है (पहली बार)।
- **Visual (canon):** frame 3 (language) in `design/canon/हमारे पंडित जी.dc.html`

**रामेश्वर का पल:** बड़ा-सा 'हिन्दी' लिखा एक चौकोर दिखा — मेरी अपनी भाषा! शिष्य ने हिन्दी में ही पूछा 'इसी में चलें या बदलें?' नीचे बड़ा नारंगी बटन 'हाँ, हिन्दी ठीक है'। यह मुझे अच्छा लगा — यहाँ मैं फँसा नहीं।

**✅ CHECK FOR ISJ:** पुष्टि-लाइन (हिन्दी confirmQuestion) असली device पर गर्म, स्पष्ट आवाज़ में बजती है और 'हाँ' बोलने पर सचमुच आगे बढ़ती है — हाँ या नहीं?

---

### भाषा सूची (LanguageListScreen)

- **Route:** `/onboarding (phase LANGUAGE_LIST)`
- **How to reach:** भाषा-पुष्टि पर 'दूसरी भाषा चुनें' दबाएँ (या बोलें), या settings→भाषा से।
- **Visual (canon):** frame 3 (language) in `design/canon/हमारे पंडित जी.dc.html`

**रामेश्वर का पल:** 11 भाषाएँ बड़े-बड़े नामों में — हिन्दी, मराठी, बंगाली… यह पढ़ लिया मैंने। हर नाम के नीचे कुछ छोटे अंग्रेज़ी अक्षर भी हैं जो मैं नहीं पढ़ पाता, पर ऊपर का बड़ा नाम साफ़ है, तो काम चल जाता है।

**Findings:**

- **पP2 _(F03-03)_** — हर भाषा-टाइल के नीचे अंग्रेज़ी में उपशीर्षक है ('Marathi', 'Bengali', 'Tamil'…) — मेरे लिए बेकार अक्षर। सिर्फ़ अंग्रेज़ी वाली टाइल का उपशीर्षक देवनागरी ('अंग्रेज़ी') है।
  - *Why it fails:* line 148 `{tile.subtitle ?? tile.lang}` — subtitle सिर्फ़ English टाइल के पास है (line 52), बाक़ी सब पर tile.lang यानी Latin नाम छपता है। देवनागरी-only पाठक के लिए यह शोर है (block नहीं करता क्योंकि ऊपर 26px देवनागरी नाम साफ़ है)।
  - *Fix:* उपशीर्षक देवनागरी में दें या हटाएँ (जैसे 'आपकी भाषा' या कुछ नहीं); कभी Latin भाषा-नाम न दिखाएँ।

**✅ CHECK FOR ISJ:** दो-टैप रस्म (पहला टैप नाम बोले, दूसरा चुने) असली उँगली से 104px टाइल पर आराम से चलती है, और पहला टैप नाम सही भाषा में बोलता है — हाँ या नहीं?

---

### परिचय / माइक अनुमति (ParichayScreen)

- **Route:** `/onboarding (phase PARICHAY)`
- **How to reach:** भाषा पक्की होने के बाद अपने-आप (languageConfirmed && !parichayDone)। mount होते ही Meet-style native mic popup अपने-आप खुलता है।
- **Visual (canon):** frame 4 (parichay) in `design/canon/हमारे पंडित जी.dc.html`

**रामेश्वर का पल:** एक गोल 'शिष्य' चमका, बोला 'नमस्ते पंडित जी! मैं आपका शिष्य हूँ…' — बहुत अच्छा लगा, कोई अपना बोल रहा है। तभी ऊपर एक अंग्रेज़ी डिब्बा अपने-आप खुल गया — माइक माँग रहा है शायद? नीचे 🎤 और 'आपकी आवाज़ सुरक्षित है' 🔒 लिखा है, इससे थोड़ा भरोसा हुआ।

**Findings:**

- **पP1 _(NEW-REQ candidate)_ · **NEEDS ISJ ON DEVICE**** — माइक का native popup ('Allow'/'Block' microphone) फिर से पूरा अंग्रेज़ी में अपने-आप खुलता है। शिष्य साथ-साथ बोलता है और तीर दिखाता है, पर popup के शब्द मैं नहीं पढ़ सकता।
  - *Why it fails:* getUserMedia mount पर auto-fire होता है (ParichayScreen.tsx:125-167), PopupPointer (line 383) और pressAllow आवाज़ 'ऊपर अनुमति दें दबा दीजिए' (strings.ts:167) मदद करती है — पर popup खुद OS का अंग्रेज़ी है। TTS चुप हुआ तो वही दीवार जैसी location पर थी।
  - *Fix:* location जैसी ही guidance: अंग्रेज़ी शब्द नहीं, जगह/रंग से बताओ ('ऊपर पहला बटन दबाइए'); आवाज़ हमेशा बजे और तीर उसी बटन पर मोटा रहे। पहली बार माइक-मांग का 'क्यों' (आपकी आवाज़ सुनने के लिए) पहले बोलें — जो यह करती है, अच्छा है।
- **पP1 _(NEW-REQ candidate)_** — अगर माइक ब्राउज़र-स्तर पर deny हो गया, तो recovery कार्ड कहता है 'ब्राउज़र की सेटिंग में माइक चालू करें' — यह मुझसे नहीं होगा, मुझे नहीं पता ब्राउज़र सेटिंग क्या है।
  - *Why it fails:* denied path slide5Blocked 'ब्राउज़र की सेटिंग में माइक चालू करें' (strings.ts:537) दिखाता है (ParichayScreen.tsx:344-355) — यह एक तकनीकी काम है जो रामेश्वर की पहुँच से बाहर है। एक ghost 'आगे बढ़ें' आगे तो ले जाता है पर पूरी app आवाज़-पहले है, और अब वह छूने-भर पर छूट जाता है जो वह ठीक से नहीं कर सकता।
  - *Fix:* browser-settings निर्देश की जगह बड़ा 'फिर से पूछें' re-prompt दें; और सचमुच deny होने पर मानव-कॉलबैक ('हम आपको फ़ोन करके मदद करेंगे') — कभी सेटिंग-निर्देश पर अकेला न छोड़ें।
- **पP2 _(NEW-REQ candidate)_** — माइक मना होने पर आश्वासन-लाइन कहती है 'आप छूकर और लिखकर भी सब कर सकते हैं' — पर मैं लिख नहीं सकता, यह झूठा दिलासा है।
  - *Why it fails:* parichay.denied (strings.ts:163-164) 'छूकर और लिखकर' का वादा करती है, जबकि यह app आवाज़-पहले है और रामेश्वर टाइप नहीं कर सकता — deny के बाद यह भरोसा असल में खोखला है।
  - *Fix:* 'लिखकर' हटाएँ; माइक बंद हो तो सहायता/कॉलबैक की ओर ले जाएँ, न कि खुद-टाइप करने की ओर।

**✅ CHECK FOR ISJ:** शिष्य की intro आवाज़ (introOnly) असली A12 पर गर्म और भरोसा-जगाने वाली लगती है, और popup तीर के साथ मिलकर माइक-मांग समझ आती है — हाँ या नहीं?

---

### पंजीकरण जारी रखें (resume/page.tsx) — अनाथ स्क्रीन

- **Route:** `/resume`
- **How to reach:** सामान्य first-open प्रवाह इस तक नहीं ले जाता। केवल design catalog (/design) में सूचीबद्ध है; root / → /onboarding भेजता है, कोई user-flow /resume से लिंक नहीं करता।
- **Visual (canon):** frame no canon frame in `design/canon/हमारे पंडित जी.dc.html`
- **⚠ UNREACHABLE IN PROD:** सामान्य first-open journey (splash→location→language→parichay) इस स्क्रीन तक कभी नहीं पहुँचती — root /onboarding को forward करता है और कोई प्रवाह /resume से link नहीं करता; केवल /design catalog में references है। यानी यह जीवित उत्पादन में मृत/अनाथ है — यह अपने-आप में एक finding है (मृत अंग्रेज़ी कोड जो गलती से खुल सकता है)। — *this is itself a finding.*

**रामेश्वर का पल:** यह स्क्रीन अगर कभी खुल गई तो मेरे लिए पूरी तरह अंग्रेज़ी की दीवार है — 'Mobile Number', 'OTP Verification', नीचे 'Session ID' — एक भी शब्द नहीं पढ़ पाता, और डिज़ाइन भी बाक़ी app जैसा त्योहारी नहीं।

**Findings:**

- **पP1 _(NEW-REQ candidate)_** — पूरी स्क्रीन अंग्रेज़ी लेबलों से भरी है: 'Mobile Number', 'OTP Verification', 'Profile Details', fallback 'Registration'/'Complete', और सबसे नीचे 'Session ID: …'।
  - *Why it fails:* STEP_LABELS.title अंग्रेज़ी में hardcoded (resume/page.tsx:13-27), footer 'Session ID:' (line 230), और material-symbols आइकन + surface-* पुराने design tokens — festive kit नहीं। देवनागरी-only पंडित के लिए हर शब्द दीवार। subtitle में देवनागरी है पर title अंग्रेज़ी में प्रमुख है।
  - *Fix:* या तो यह अनाथ route हटाएँ, या festive kit में देवनागरी-प्रथम बनाएँ (title = 'मोबाइल नंबर'/'OTP सत्यापन' की जगह 'फ़ोन नंबर की पुष्टि' आदि); 'Session ID' कभी उपयोगकर्ता को न दिखाएँ।

**✅ CHECK FOR ISJ:** क्या यह /resume route उत्पादन में किसी भी user-tappable रास्ते से खुलती है — हाँ या नहीं? (नहीं है, तो इसे हटाना ही ठीक; हाँ है, तो P0 अंग्रेज़ी-दीवार।)

---

## Journey 2 · पंजीकरण → OTP → अनुमतियाँ

### लॉगिन — मोबाइल नंबर (step 1)

- **Route:** `/login`
- **How to reach:** Open app cold as a new install → splash → location → language → परिचय → tutorial CTA → lands here. Direct: /login (or /login?next=/onboarding from the tutorial). No auth needed. Pilot number 9876500050 / OTP 123456.
- **Visual (canon):** frame registration/6 (login-phone card) in `design/canon/हमारे पंडित जी.dc.html`

**रामेश्वर का पल:** सबसे ऊपर मोटे अक्षरों में लिखा है 'लॉगिन / रजिस्ट्रेशन'। मैं अक्षर तो पढ़ लेता हूँ पर ये 'लॉगिन' क्या बला है? नीचे एक डिब्बे में 'XXXXXXXXXX' लिखा है — क्या मुझे X-X-X भरना है? मैं रुक जाता हूँ, शिष्य की आवाज़ का इंतज़ार करता हूँ।

**Findings:**

- **पP2 _(NEW-REQ candidate)_** — स्क्रीन का सबसे ऊपर का शीर्षक 'लॉगिन / रजिस्ट्रेशन' है — देवनागरी में लिखा अंग्रेज़ी शब्द, मुझे इसका मतलब नहीं पता।
  - *Why it fails:* Header title = auth.unifiedTitle 'लॉगिन / रजिस्ट्रेशन' (strings.ts:238). पहली ही स्क्रीन का सबसे बड़ा शब्द ऐसा है जिसे रामेश्वर पढ़ तो लेता है पर अर्थ नहीं जानता — यह jargon-in-Devanagari है।
  - *Fix:* शीर्षक बदलें: 'यहाँ से शुरू करें' या 'अपना नंबर डालिए'। 'लॉगिन/रजिस्ट्रेशन' कहीं न दिखे — नीचे की उपशीर्षक 'नंबर डालिए…' पहले से साफ़ है।
- **पP2 _(NEW-REQ candidate)_** — नंबर के डिब्बे में placeholder 'XXXXXXXXXX' है — दस अंग्रेज़ी X। मुझे लगा शायद X भरना है।
  - *Why it fails:* login/page.tsx placeholder="XXXXXXXXXX" (phone VoiceField). Latin X's किसी देवनागरी-पाठक के लिए भ्रामक हैं — यह न संख्या है न शब्द।
  - *Fix:* placeholder हटाएँ या देवनागरी संकेत दें: 'यहाँ १० अंक का मोबाइल नंबर'। मुख्य मार्गदर्शन शिष्य की आवाज़ से रखें।
- **पP2 _(F02-01)_** — आगे बढ़ने का बटन 'आगे बढ़ें' है और नंबर बोलकर भी भरा जा सकता है — यह अच्छा है, कोई अटकाव नहीं।
  - *Why it fails:* POSITIVE (no defect): common.next='आगे बढ़ें' (strings.ts:215) देवनागरी; phone VoiceField mode='phone' mic-capable (VoiceField.tsx voiceCapable), parsePhoneNumber से नंबर बोलकर भरता है। यह वही है जो रामेश्वर के लिए सही है।
  - *Fix:* कोई बदलाव आवश्यक नहीं — बस सुनिश्चित करें step-1 पर mount होते ही शिष्य prompt बोले (नीचे checkForIsj देखें)।

**✅ CHECK FOR ISJ:** जैसे ही लॉगिन स्क्रीन (step 1) खुलती है, क्या शिष्य ~2 सेकंड में 'नंबर डालिए…' बोलकर मार्ग दिखाता है, या स्क्रीन चुप रहती है? (page पर step-1 का कोई useScreenVoice/Narrate नहीं — narration केवल VoiceField के loop पर निर्भर है)

---

### लॉगिन — OTP (step 2)

- **Route:** `/login (step=2 after नंबर भेजो)`
- **How to reach:** Step 1 पर सही 10-अंक नंबर डालकर 'आगे बढ़ें' → /auth/otp/send सफल → step 2। OTP dev mode में कोड 123456। WebOTP autofill तभी जब असली SMS आए।
- **Visual (canon):** frame OTP/7 in `design/canon/हमारे पंडित जी.dc.html`

**रामेश्वर का पल:** सबसे बड़े मोटे अक्षरों में लिखा है 'OTP डालिए' — 'O','T','P' तीन अंग्रेज़ी अक्षर! मुझे नहीं पता ये क्या है। नीचे छह खाली डिब्बे हैं। शिष्य 'ओटीपी' बोलता है पर आँखें 'OTP' देखती हैं — दोनों जुड़ते नहीं। और यहाँ बोलकर नहीं भर सकता, टाइप करना है — जो मैंने कभी नहीं किया।

**Findings:**

- **पP1 _(NEW-REQ candidate)_** — स्क्रीन का सबसे बड़ा शीर्षक 'OTP डालिए' है — 'OTP' रोमन अक्षरों में। मैं इसे पढ़ ही नहीं सकता।
  - *Why it fails:* auth.otpLabel='OTP डालिए' (strings.ts:245), OtpBoxes में 26px black h2। शिष्य आवाज़ में 'ओटीपी' (otpVoice:248) बोलता है पर स्क्रीन Latin 'OTP' दिखाती है — कान-आँख का बेमेल। अगर आवाज़ चूक जाए/mic बंद हो तो मुख्य शीर्षक अपठनीय Latin रह जाता है।
  - *Fix:* 'OTP डालिए' → 'ओटीपी डालिए' (देवनागरी), ठीक वैसे जैसे आवाज़ बोलती है। पूरे app से Latin 'OTP' हटाएँ।
- **पP1 _(NEW-REQ candidate)_ · **NEEDS ISJ ON DEVICE**** — जब app SMS अपने-आप भरने की कोशिश करता है तो शिष्य बोलता है 'SMS आते ही OTP अपने आप भर जाएगा — नीचे Allow आए तो उसे दबा दीजिए' — और ब्राउज़र का 'Allow' बटन भी अंग्रेज़ी में।
  - *Why it fails:* auth.webotpVoice (strings.ts:242) एक ही वाक्य में 'SMS','OTP','Allow' — तीन अंग्रेज़ी शब्द बोले जाते हैं, और WebOTP का native prompt अंग्रेज़ी 'Allow' दिखाता है जिसे रामेश्वर पढ़ नहीं सकता।
  - *Fix:* वाक्य बदलें: 'मैसेज आते ही नंबर अपने-आप भर जाएगा — नीचे हरा बटन दिखे तो दबा दीजिए।' 'SMS/OTP/Allow' न बोलें; native prompt की भाषा localized रहने दें।
- **पP1 _(F02-05)_ · **NEEDS ISJ ON DEVICE**** — OTP यहाँ बोलकर नहीं भर सकता — छह अंक छोटे डिब्बों में टाइप करने हैं। मैंने ज़िंदगी में कभी टाइप नहीं किया, और अगर autofill न चले तो मैं यहीं फँस जाता हूँ। कोई 'सहायता' बटन भी नहीं।
  - *Why it fails:* OTP mode टाइप-only by law (A5): VoiceField voiceCapable=false for mode='otp'; कोई voice dictation नहीं। अगर WebOTP autofill fail हुआ (patchy Jio/असमर्थित device) तो 48px डिब्बों में मोटी उँगलियों से 6 अंक टाइप करना ही एकमात्र रास्ता — और कोई keyboard-help/सहायता escape नहीं (cf F02-05 जो failure पर keyboard+सहायता माँगता है)।
  - *Fix:* OTP स्क्रीन पर एक बड़ा 'सहायता चाहिए' बटन जोड़ें जो call-support से जुड़े; autofill न चले तो शिष्य कहे 'मैसेज में आया छह अंक का नंबर एक-एक करके छू कर भरिए, या मदद के लिए यह बटन दबाइए।'
- **पP2 _(NEW-REQ candidate)_** — वापसी पर 'ओटीपी डालिए, आपका खाता तैयार है' / नए पर 'ओटीपी डालिए, फिर दो मिनट का रजिस्ट्रेशन' बोला जाता है — 'रजिस्ट्रेशन' फिर अंग्रेज़ी शब्द।
  - *Why it fails:* auth.newAccountShishya (strings.ts:253) में 'रजिस्ट्रेशन'। बोली में भी jargon।
  - *Fix:* 'फिर दो मिनट में आपका परिचय पूरा' — 'रजिस्ट्रेशन' शब्द हटाएँ।

**✅ CHECK FOR ISJ:** क्या step-2 पर mount होते ही शिष्य की एक ही narration (स्वागत + 'छह अंकों का ओटीपी…') गरमाहट से चलती है और 'ओटीपी' शब्द को स्पष्ट/गर्म ढंग से बोलती है — कट या रुखा नहीं?

---

### रजिस्ट्रेशन — नाम + शहर (FLOW C)

- **Route:** `/onboarding (phase=REGISTRATION)`
- **How to reach:** OTP सफल पर अगर profileComplete=false → login /onboarding पर भेजता है, orchestrator token देखकर REGISTRATION phase render करता है। State: valid token + अधूरी profile (नया pandit)। पिछली location phase से detectedCity prefill होता है।
- **Visual (canon):** frame registration/6 in `design/canon/हमारे पंडित जी.dc.html`

**रामेश्वर का पल:** ऊपर लिखा है 'रजिस्ट्रेशन' — फिर वही अंग्रेज़ी शब्द। पर नीचे बड़े साफ़ अक्षरों में 'बस दो बातें बताइए' — यह मुझे भाया। दो डिब्बे: 🙏 नाम, 🏙️ शहर। शहर पहले से भरा दिख रहा है। मैं नाम बोल देता हूँ, यह आसान लगा।

**Findings:**

- **पP2 _(NEW-REQ candidate)_** — शीर्षक (Header) 'रजिस्ट्रेशन' है — अंग्रेज़ी शब्द; नई profile पूरी करने पर 'प्रोफ़ाइल पूरी करें' — 'प्रोफ़ाइल' भी अंग्रेज़ी।
  - *Why it fails:* registration.titleNew='रजिस्ट्रेशन' (strings.ts:309), titleComplete/completeBtn='प्रोफ़ाइल पूरी करें' (310/319)। header का शब्द रामेश्वर के लिए अर्थहीन।
  - *Fix:* titleNew='आपका परिचय' या 'बस दो बातें'; 'रजिस्ट्रेशन'/'प्रोफ़ाइल' शब्द हटाएँ।
- **पP2 _(F01-01)_** — बाकी स्क्रीन बहुत अच्छी है — 'बस दो बातें बताइए', दोनों field बोलकर भरे जा सकते हैं, शहर पहले से भरा है, कोई पैसा/दस्तावेज़ नहीं माँगा। मुझे डर नहीं लगा।
  - *Why it fails:* POSITIVE: heroTitle='बस दो बातें बताइए' (312) देवनागरी; name/city VoiceField mode='text' mic-capable; FLOW C केवल account बनाता है (no aadhaar/bank/dakshina) — रामेश्वर के 'पैसे तो नहीं माँग रहा?' डर का सही उत्तर।
  - *Fix:* कोई बदलाव आवश्यक नहीं — केवल header शब्द ठीक करें।

**✅ CHECK FOR ISJ:** क्या mount पर शिष्य 'पंडित जी, बस अपना नाम बताइए…' गरमाहट और अपनेपन से बोलता है, और 'खाता बनाएँ' बटन उसी क्षण चमकता (highlight) है?

---

### खाता बन गया — celebration-lite

- **Route:** `/onboarding (REGISTRATION → showDone) → /home`
- **How to reach:** RegistrationScreen पर नाम+शहर भरकर 'खाता बनाएँ' → /pandit/onboarding POST सफल → CelebrationLite, फिर auto /home।
- **Visual (canon):** frame celebration/26 in `design/canon/हमारे पंडित जी.dc.html`

**रामेश्वर का पल:** बड़ा 🎉 और 'खाता बन गया!' — मुझे खुशी हुई, समझ आ गया कि हो गया। नीचे 'होम पर जाएं' लिखा है — 'होम' क्या? पर बटन एक ही है तो दबा देता हूँ।

**Findings:**

- **पP2 _(NEW-REQ candidate)_** — 'होम पर जाएं' बटन — 'होम' अंग्रेज़ी शब्द।
  - *Why it fails:* onboarding.homeBtn='होम पर जाएं' (strings.ts:287) — 'होम' Latin-origin jargon।
  - *Fix:* 'मुख्य पन्ने पर जाएँ' या 'आगे चलिए'।
- **पP2 _(F01-01)_** — 'खाता बन गया!' सबसे बड़ा (36px) और बधाई आवाज़ में — साफ़ और गर्म। अच्छा।
  - *Why it fails:* POSITIVE: celebrationTitle 36px (321), celebrationVoice बधाई line; auto-advance narration खत्म होने का इंतज़ार करता है (poll, 5.4s cap) — आवाज़ बीच में नहीं कटती।
  - *Fix:* कोई बदलाव नहीं।

**✅ CHECK FOR ISJ:** क्या बधाई की आवाज़ पूरी बजने के बाद ही स्क्रीन /home पर जाती है (बीच में नहीं कटती), और स्वर उत्सव जैसा गर्म है?

---

### लोकेशन अनुमति

- **Route:** `/onboarding (phase=LOCATION_PERMISSION)`
- **How to reach:** नया install: splash → तुरंत LOCATION_PERMISSION (N2 order)। कोई auth नहीं। असली browser geolocation prompt यहाँ बटन दबाने पर आता है।
- **Visual (canon):** frame location/2 in `design/canon/हमारे पंडित जी.dc.html`

**रामेश्वर का पल:** 🛕📍 चित्र, बड़े अक्षरों में 'आप कहाँ सेवा देते हैं?' और नीचे छोटे में कारण 'आपके शहर की पूजाएँ और आपकी भाषा — बस इसीलिए।' — मुझे कारण बताया, अच्छा लगा, डर कम हुआ। 'अनुमति दें' बटन साफ़ है। पर जब browser का popup आया तो उसमें अंग्रेज़ी बटन थे।

**Findings:**

- **पP1 _(NEW-REQ candidate)_ · **NEEDS ISJ ON DEVICE**** — popup आते समय शिष्य बोलता है 'ऊपर एक सवाल आया है — अनुमति दें या Allow दबा दीजिए' — 'Allow' अंग्रेज़ी, और native popup के बटन भी अंग्रेज़ी हो सकते हैं।
  - *Why it fails:* perm.pressAllowVoice (strings.ts:176) में 'Allow'; native geolocation prompt की भाषा device-locale पर निर्भर — अंग्रेज़ी 'Allow'/'Block' दिख सकते हैं जिन्हें रामेश्वर पढ़ नहीं सकता।
  - *Fix:* 'Allow' शब्द हटाएँ — 'ऊपर आया सवाल — हरे/पहले बटन को दबा दीजिए।' साथ में PopupPointer तीर पहले से है, उसी पर ज़ोर दें।
- **पP2 _(F03-01)_** — अनुमति क्यों चाहिए यह देवनागरी में लिखा और बोला गया, और 'शहर खुद चुनें' का सहज विकल्प भी है — यह बहुत अच्छा है, मुझे धोखे का डर नहीं लगा।
  - *Why it fails:* POSITIVE: pratham.locationWhy (125) + entry.locationVoice (129) WHY बताते हैं; locationManual 'शहर खुद चुनें' escape मौजूद। रामेश्वर के 'क्यों माँग रहा?' डर का सही उत्तर।
  - *Fix:* कोई बदलाव नहीं — केवल 'Allow' शब्द हटाएँ।

**✅ CHECK FOR ISJ:** रामेश्वर के हिन्दी-locale Samsung A12 Chrome पर असली geolocation popup का बटन 'अनुमति दें' (देवनागरी) दिखता है या अंग्रेज़ी 'Allow'?

---

### लोकेशन — शहर की पुष्टि (detected-city confirm)

- **Route:** `/onboarding (LOCATION_PERMISSION, detected sub-state)`
- **How to reach:** 'अनुमति दें' → geolocation grant → Nominatim reverse-geocode सफल → detected city का confirm कार्ड। State: असली coordinates + नेटवर्क (reverse-geocode के लिए)।
- **Visual (canon):** frame location/2 in `design/canon/हमारे पंडित जी.dc.html`

**रामेश्वर का पल:** बड़े केसरी अक्षरों में मेरा शहर दिख रहा है — पर यह 'Varanasi' रोमन में लिखा है क्या? मैं तो 'वाराणसी' पढ़ना चाहता हूँ। शिष्य पूछता है 'क्या आप … में हैं?' नीचे '✓ यही सही है' और 'जगह बदलें'।

**Findings:**

- **पP1 _(NEW-REQ candidate)_ · **NEEDS ISJ ON DEVICE**** — मेरे अपने शहर का नाम — स्क्रीन का सबसे बड़ा केसरी शब्द (22px) — रोमन अक्षरों में दिख सकता है ('Varanasi'), जिसे मैं पढ़ नहीं सकता।
  - *Why it fails:* LocationPermissionScreen reverse-geocode fetch में accept-language header नहीं है ('https://nominatim.openstreetmap.org/reverse?lat…&format=json')। Nominatim default में स्थान का नाम अक्सर Latin/local script में लौटाता है — detected.city फिर 22px black में render होता है। रामेश्वर को अपना ही शहर अपठनीय Latin में दिखेगा।
  - *Fix:* URL में '&accept-language=hi' जोड़ें ताकि Nominatim 'वाराणसी' (देवनागरी) लौटाए। fallback में यदि Latin ही आए तो शिष्य नाम बोलकर पुष्टि माँगे।
- **पP2 _(F03-01)_** — पुष्टि आवाज़ में 'क्या आप … में हैं?' और दोनों बटन देवनागरी ('यही सही है' / 'जगह बदलें') — गलत शहर चुपचाप स्वीकार नहीं होता। अच्छा।
  - *Why it fails:* POSITIVE: detected-city SHOW-and-confirm pattern; 'जगह बदलें' → manual picker escape। silent wrong-city से बचाव।
  - *Fix:* कोई बदलाव नहीं — केवल शहर का नाम देवनागरी में लाएँ।

**✅ CHECK FOR ISJ:** रामेश्वर के असली coordinates (वाराणसी) पर Nominatim बिना accept-language के 'वाराणसी' लौटाता है या 'Varanasi' (Latin)?

---

### ट्यूटोरियल स्लाइड 5 — माइक अनुमति + अभ्यास

- **Route:** `/onboarding (phase=TUTORIAL, slide 5)`
- **How to reach:** location → language → परिचय → TUTORIAL; slide 5 पर mic माँगा जाता है (कोई अलग mic phase नहीं)। असली getUserMedia prompt बटन दबाने पर।
- **Visual (canon):** frame tutorial/5-10 in `design/canon/हमारे पंडित जी.dc.html`

**रामेश्वर का पल:** 'माइक की आज्ञा + अभ्यास' — 'माइक' शब्द तो सुना है। शिष्य समझाता है 'बोलकर जवाब देने के लिए माइक की अनुमति चाहिए… फिर बोलिए नमस्ते।' मुझे कारण पता चल गया। बड़ा बटन 'माइक की अनुमति दें' दबाता हूँ।

**Findings:**

- **पP1 _(NEW-REQ candidate)_ · **NEEDS ISJ ON DEVICE**** — popup के समय फिर वही 'Allow' वाली आवाज़ (pressAllowVoice) और native mic-popup के अंग्रेज़ी बटन।
  - *Why it fails:* askMic() → voiceController.speak(perm.pressAllowVoice) जिसमें 'Allow' (strings.ts:176); getUserMedia native prompt device-locale पर — अंग्रेज़ी हो सकता है।
  - *Fix:* वही fix जैसे location — 'Allow' शब्द हटाएँ, 'ऊपर आए बटन को दबाइए' कहें।
- **पP2 _(F02-01)_** — mic क्यों चाहिए — देवनागरी में साफ़ बोला और लिखा गया, और अभ्यास ('नमस्ते बोलिए') भी है — डरावना नहीं। अच्छा।
  - *Why it fails:* POSITIVE: tutorial.slide5 narration (533) WHY बताता है; slide5Button='माइक की अनुमति दें' (536) देवनागरी। रामेश्वर के लिए सही ढंग से समझाया गया।
  - *Fix:* कोई बदलाव नहीं।

**✅ CHECK FOR ISJ:** क्या native mic prompt रामेश्वर के device पर देवनागरी में आता है, और अभ्यास के बाद 'वाह! आपने बोलकर जवाब दिया' गर्म लगता है?

---

### ट्यूटोरियल स्लाइड 5 — माइक अस्वीकृत (mic-denied)

- **Route:** `/onboarding (TUTORIAL slide 5, micState=denied)`
- **How to reach:** slide 5 पर 'माइक की अनुमति दें' → native prompt में Deny/Block → permissions.query 'denied' पुष्टि → denied UI। (dismiss होने पर idle पर लौटता है, denied नहीं।)
- **Visual (canon):** frame tutorial/5-10 in `design/canon/हमारे पंडित जी.dc.html`

**रामेश्वर का पल:** मैंने गलती से मना कर दिया। शिष्य कहता है 'कोई बात नहीं, आप लिखकर भी सब कर सकते हैं।' — पर मैं तो लिख ही नहीं सकता! और नीचे 'ब्राउज़र की सेटिंग में माइक चालू करें' — 'ब्राउज़र'? 'सेटिंग'? मुझे नहीं पता वो कहाँ है। एक 'फिर कोशिश करें' बटन है, उसे दबाता हूँ।

**Findings:**

- **पP1 _(F02-11)_** — मना करने पर शिष्य कहता है 'आप लिखकर भी सब कर सकते हैं' — पर टाइप करना ही वह एक चीज़ है जो मैं नहीं कर सकता। यह झूठी तसल्ली है।
  - *Why it fails:* tutorial.slide5Denied='कोई बात नहीं, आप लिखकर भी सब कर सकते हैं।' (strings.ts:535)। रामेश्वर illiterate-in-forms, voice-only है — 'लिखकर करो' उसके लिए soft dead-end/false reassurance है, जबकि app का पूरा वादा आवाज़ का है।
  - *Fix:* line बदलें: 'कोई बात नहीं पंडित जी — मैं बोलकर आपको सब समझाता रहूँगा। आवाज़ से जवाब देने के लिए यह बड़ा बटन दबाकर माइक फिर चालू कीजिए।' टाइप को बराबर रास्ता न बताएँ; retry को प्रमुख रखें।
- **पP1 _(F02-05)_ · **NEEDS ISJ ON DEVICE**** — 'ब्राउज़र की सेटिंग में माइक चालू करें' — 'ब्राउज़र'/'सेटिंग' अंग्रेज़ी, और वहाँ जाना मेरे बस का नहीं।
  - *Why it fails:* tutorial.slide5Blocked (strings.ts:537) jargon ('ब्राउज़र','सेटिंग') + एक ऐसा काम माँगता है (browser settings navigate) जो 64-वर्षीय voice-only pandit नहीं कर सकता।
  - *Fix:* jargon हटाएँ; एक-टैप re-request दें या शिष्य बोलकर step-by-step कहे। हार्ड-deny पर 'फिर कोशिश करें' अक्सर OS द्वारा फिर से prompt नहीं करता — इसलिए support/मदद escape भी दें।
- **पP2 _(F02-05)_** — 'फिर कोशिश करें' retry बटन मौजूद है — यह पूरी तरह dead-end नहीं, recovery है। अच्छा।
  - *Why it fails:* POSITIVE: micState='denied' branch में slide5Retry बटन (TutorialV2.tsx:573) askMic फिर चलाता है। task का सवाल 'dead end या recovery?' → recovery है (पर ऊपर की दो कमियों के साथ)।
  - *Fix:* retry रखें; बस उसे बड़ा/प्रमुख बनाएँ और 'टाइप करो' सुझाव के ऊपर रखें।

**✅ CHECK FOR ISJ:** हार्ड-deny के बाद रामेश्वर के Samsung A12 Chrome पर क्या 'फिर कोशिश करें' दबाने से native mic prompt दोबारा आता है, या OS उसे चुपचाप ब्लॉक कर देता है (जिससे retry झूठा हो जाए)?

---

### मृत (registration) रीडायरेक्ट स्टब्स + गुम नोटिफिकेशन-अनुमति

- **Route:** `/(registration)/{mobile,otp,complete,profile} और /(registration)/permissions/{location,mic,mic-denied,notifications}`
- **How to reach:** अब live flow से कोई इन पर नहीं भेजता — केवल पुराना bookmark/link या पुरानी resume-state इन तक ले जाती है। हर page 'return null' render करके client-side router.replace करता है।
- **Visual (canon):** frame no canon frame in `design/canon/हमारे पंडित जी.dc.html`
- **⚠ UNREACHABLE IN PROD:** ये (registration)/* routes live flow से unreachable हैं — केवल पुराने bookmark/resume-state से; notifications ceremony screen पूरी तरह हट चुका है (कोई live caller नहीं)। — *this is itself a finding.*

**रामेश्वर का पल:** पुराने लिंक से खुला तो सफ़ेद खाली स्क्रीन — न दीया, न आवाज़, न कुछ। पटरी वाला Jio धीमा है, कई पल कुछ नहीं होता। मुझे लगा app टूट गया, बंद करने का मन हुआ। फिर अचानक कोई और स्क्रीन आ गई।

**Findings:**

- **पP1 _(NEW-REQ candidate)_** — नोटिफिकेशन-अनुमति का बोला-गया 'क्यों' वाला ceremony अब कहीं live नहीं है — केवल एक अनाथ string और dead redirect बचा है।
  - *Why it fails:* permissions.notifications string ('नई बुकिंग की सूचना… अनुमति दें' strings.ts) और /permissions/notifications अब dead stub हैं; useNotificationPermission.requestPermission का कोई live caller नहीं (grep), और firebase.ts:43 सीधे Notification.requestPermission() कर सकता है — यानी अगर अनुमति माँगी भी गई तो बिना देवनागरी 'क्यों', बिना आवाज़ के। रामेश्वर का 'बिना कारण क्यों माँग रहा?' डर सीधे ट्रिगर होगा।
  - *Fix:* नोटिफिकेशन अनुमति को एक देवनागरी+आवाज़ ceremony के पीछे रखें ('नई बुकिंग की सूचना तुरंत मिले — इसीलिए') इससे पहले कि native prompt आए; कभी mount पर चुपचाप न माँगें।
- **पP2 _(NEW-REQ candidate)_** — पुराने registration/permissions लिंक खुलने पर पहले एक खाली, चुप, सफ़ेद स्क्रीन दिखती है (कोई splash/आवाज़ नहीं) जब तक JS redirect न कर दे।
  - *Why it fails:* सभी (registration)/* pages 'return null' फिर useEffect में router.replace (mobile/otp/profile/… सब redirect-only stubs)। Fast-3G/patchy Jio पर यह blank+silent gap रामेश्वर को 'टूट गया' जैसा लगता है — जहाँ आवाज़ की अपेक्षा है वहाँ मौन।
  - *Fix:* redirect के दौरान null की जगह SunriseSplash/DiyaLoader दिखाएँ ताकि मौन-सफ़ेद कभी न दिखे; या इन dead routes को हटाकर server-side redirect करें।

**✅ CHECK FOR ISJ:** क्या prod में कोई भी live रास्ता (या firebase init) रामेश्वर के सामने बिना बोले-गए 'क्यों' के native notification-permission prompt ला सकता है?

---

## Journey 3 · आधार/पहचान → तैयारी विज़ार्ड

### परिचय / "क्या आप पंडित हैं?" gate

- **Route:** `/identity`
- **How to reach:** Unauthenticated entry, reached after language pick, before /login. No state needed. File: apps/pandit/src/app/(auth)/identity/page.tsx. NOTE despite the folder name "identity", NO Aadhaar is collected here — this is only a referral/are-you-a-pandit gate that routes to /login. Aadhaar lives only in readiness R5.
- **Visual (canon):** frame parichay = 4 in `design/canon/हमारे पंडित जी.dc.html`

**रामेश्वर का पल:** एक दीया जल रहा है, सुंदर लग रहा है। नीचे अंग्रेज़ी में कुछ लिखा है — 'HmarePanditJi' — मैं पढ़ नहीं पाता, यह क्या है? बीच में बड़ा माइक का गोल बटन है, नीचे लिखा 'माइक दबाएँ'। मैं दबाता हूँ और बोलता हूँ 'हाँ मैं पंडित हूँ' — पर कुछ नहीं होता। मैं समझ नहीं पा रहा मुझे क्या करना है।

**Findings:**

- **पP1 _(NEW-REQ candidate)_** — माइक दबाकर बोला 'हाँ मैं पंडित हूँ', कुछ नहीं हुआ — बटन सिर्फ़ सवाल दोबारा पढ़ता है, मेरा जवाब नहीं लेता
  - *Why it fails:* The card says 'उत्तर देने के लिए माइक दबाएँ' but handleVoiceInput only re-speaks the question; isListening is hard-coded false and there is NO capture. The ONLY real confirm is the footer CTA. A voice-only man taps the mic, speaks his answer, and the app does nothing — a dead end that contradicts its own instruction.
  - *Fix:* या तो माइक से सच में जवाब सुनो (हाँ→CTA चलाओ), या माइक हटाकर पिल बदलो: 'नीचे बड़ा नारंगी बटन दबाएँ' और तीर से CTA की ओर इशारा। बटन और उसका लेबल कभी झूठ न बोलें।
- **पP2 _(NEW-REQ candidate)_** — दीये के नीचे अंग्रेज़ी अक्षर 'HmarePanditJi' — मैं पढ़ नहीं सकता
  - *Why it fails:* identity/page.tsx renders 'HmarePanditJi आपके लिए है' — the brand token stays in Latin script, a meaningless wall right under the hero for a Devanagari-only reader.
  - *Fix:* देवनागरी में लिखो: 'हमारे पंडित जी — आपके लिए है'। कोई भी लैटिन शब्द स्क्रीन पर न रहे।
- **पP2 _(NEW-REQ candidate)_ · **NEEDS ISJ ON DEVICE**** — आवाज़ में अंग्रेज़ी शब्द 'app' — 'यह app केवल पंडितों के लिए बना है'
  - *Why it fails:* The mount narration text embeds the Latin word 'app'. Sarvam TTS may mangle/spell it, breaking the warm greeting on the very first spoken line.
  - *Fix:* 'यह सेवा केवल पंडितों के लिए बनी है' बोलो — कोई अंग्रेज़ी शब्द TTS को न दो।

**✅ CHECK FOR ISJ:** क्या असली फ़ोन पर स्वागत-आवाज़ गर्म लगती है और 'app' शब्द ठीक-से बोला जाता है (टूटा-फूटा नहीं)?

---

### तैयारी HUB (5 दीये + area rows)

- **Route:** `/readiness/hub`
- **How to reach:** Pilot login 9876500050 / 123456. Reads /pandit/readiness snapshot. BUT grep shows nothing in the live app links to /readiness/hub — home, bookings and voice-nav all push /readiness (the linear wizard). This route is an unlinked evaluation alternative.
- **Visual (canon):** frame readiness hub = 12 in `design/canon/हमारे पंडित जी.dc.html`
- **⚠ UNREACHABLE IN PROD:** In prod Rameshwar never lands here — home/bookings/voice-nav all route to /readiness (linear wizard). The HUB shape has no inbound link, so it is dead for the pilot. — *this is itself a finding.*

**रामेश्वर का पल:** पाँच दीये ऊपर, नीचे पाँच पंक्तियाँ। एक पंक्ति नारंगी चमक रही है 'अभी करें', बाकी धुँधली 'बाकी'। आवाज़ बोली 'आपकी तैयारी शून्य बटा पाँच है'। समझ आया — पर मैं यहाँ पहुँचता ही नहीं।

**Findings:**

- **पP2 _(NEW-REQ candidate)_** — '0/5 दीये जल गए' बहुत छोटा — बिना चश्मे धुँधला
  - *Why it fails:* hub/page.tsx line 97: caption is text-[13px], below the 15px caption floor at arm's length for a 64-yr-old.
  - *Fix:* कम-से-कम 16px मोटा।

**✅ CHECK FOR ISJ:** क्या 13px कैप्शन असली A12 स्क्रीन पर बिना चश्मे पढ़ा जा सकता है?

---

### R1 — पूजाएँ + दक्षिणा (wizard step 1)

- **Route:** `/readiness?step=1`
- **How to reach:** Login 9876500050/123456 → home → tap red-flag 'बुकिंग पाने की तैयारी' card, or say 'तैयारी शुरू करो'. Lands at readinessStep+1. New pilot pandit (readinessStep=0) sees step 1.
- **Visual (canon):** frame price-meter/dakshina = 17 in `design/canon/हमारे पंडित जी.dc.html`

**रामेश्वर का पल:** आठ पूजाओं के बड़े कार्ड। आवाज़ ने कहा 'पूजा चुनिए, फिर दक्षिणा भरिए, ग्राहक को यही राशि दिखेगी, मोलभाव नहीं'। अच्छा लगा। मैंने सत्यनारायण दबाया, नीचे खाना खुला जिसमें '501 - 500000' लिखा है। बोलकर भर सकता हूँ — ठीक है।

**Findings:**

- **पP2 _(F11-02)_** — मेरी दक्षिणा राशि छोटी — ऊपर बड़े पूजा कार्ड (100px) छाए, मेरा पैसा नीचे छोटे खाने में
  - *Why it fails:* StepR1: puja tiles are h-100px with 28px emoji; the dakshina VoiceField value is text-[20px] below the fold. His money — the point of this step — is not the biggest thing on the screen. If TTS drops, the amount reads as secondary.
  - *Fix:* चुनी पूजा की दक्षिणा को बड़ा (28-31px मोटा हरा ₹) दिखाओ, पूजा के नाम से बड़ा।
- **पP2 _(F11-01)_** — राशि खाने में '501 - 500000' — यह सीमा है या मुझे यही भरना है? भ्रम
  - *Why it fails:* StepR1 VoiceField placeholder is the raw range '501 - 500000'; a first-time form-user may read it as an instruction to type that literal string.
  - *Fix:* प्लेसहोल्डर शब्दों में: 'जैसे ₹2,100'; सीमा अलग छोटी पंक्ति/आवाज़ में।

**✅ CHECK FOR ISJ:** क्या दक्षिणा बोलने पर 'आपने कहा ₹2100 — सही है?' पुष्टि-लूप असली फ़ोन पर साफ़ सुनाई देकर सही मान पकड़ता है?

---

### R2 — पूजा सामग्री (हाँ/नहीं + package rows)

- **Route:** `/readiness?step=2`
- **How to reach:** Complete R1 (≥1 puja, dakshina 501-500000) → auto-advances; or deep-link ?step=2 if readinessStep≥1.
- **Visual (canon):** frame no canon frame in `design/canon/हमारे पंडित जी.dc.html`

**रामेश्वर का पल:** एक सवाल — 'क्या आप पूजा का सामान खुद ला सकते हैं?' बड़े हाँ/नहीं बटन। मैंने 'हाँ' बोला — नीचे हर पूजा के कार्ड 'कीमत भरना बाकी'। एक दबाया तो नया पन्ना खुल गया, यह अचानक बड़ा काम आ गया।

**Findings:**

- **पP1 _(NEW-REQ candidate)_** — 'हाँ' कहा तो हर पूजा के लिए पैकेज बनाना पड़ गया — मुझे पहले बताया ही नहीं
  - *Why it fails:* saveR2 blocks advance until every spec has samagriTiersByPuja>0, opening the complex SamagriPackageEditor sub-screen. The leap from a simple हाँ/नहीं to 'build a priced package per puja' is a cognitive cliff with no spoken warning of scope before he answers हाँ.
  - *Fix:* 'हाँ' से पहले आवाज़ बताए: 'हाँ कहेंगे तो हर पूजा के सामान की एक कीमत भरनी होगी — मैं साथ हूँ'।

**✅ CHECK FOR ISJ:** क्या शोरगुल वाले मंदिर में हाँ/नहीं आवाज़-आदेश पहली बार में पकड़े जाते हैं?

---

### R3 — यात्रा (toggles + price-honesty meter)

- **Route:** `/readiness?step=3`
- **How to reach:** Complete R2 → step 3. Deep-link ?step=3 if readinessStep≥2.
- **Visual (canon):** frame travel = 15 in `design/canon/हमारे पंडित जी.dc.html`

**रामेश्वर का पल:** गाड़ी, ट्रेन, बस, हवाई जहाज़ के बड़े emoji और चालू/बंद बटन — अच्छा है। पर 'बस' के नीचे 'Non-AC', ट्रेन में '3AC','2AC' — ये क्या हैं? सबसे नीचे एक बड़ा हरा ₹ नंबर नाच रहा है — यह पैसा कहाँ से? मेरी दक्षिणा तो मैंने अलग भरी थी।

**Findings:**

- **पP2 _(NEW-REQ candidate)_** — 'Non-AC', '3AC', '2AC' अंग्रेज़ी में — कौन-सा डिब्बा है पढ़ नहीं सकता
  - *Why it fails:* strings busNonAc='Non-AC', train3ac='3AC', train2ac='2AC' render as Latin chips in StepR3. No Devanagari.
  - *Fix:* 'बिना-एसी', 'एसी-3 शयनयान', 'एसी-2' — देवनागरी में।
- **पP2 _(F11-01)_** — सबसे बड़ा हरा पैसा '₹…' किसका है? यह मेरी दक्षिणा नहीं — डर लगा कि हिसाब गड़बड़ है
  - *Why it fails:* PriceHonestyMeter is called with hardcoded dakshina={2100} (page.tsx line 1097). The 31px green ₹ 'एक बुकिंग का अनुमान' is the biggest money on the screen but computed from a fake ₹2100 base, not the pandit's actual R1 dakshina. A suspicion-primed elder sees a wrong, prominent money figure; the meter has no voice explaining it is a sample.
  - *Fix:* मीटर में उसकी असली दक्षिणा भेजो (2100 हार्ड-कोड मत करो), या साफ़ लिखो/बोलो 'यह सिर्फ़ एक उदाहरण है'।
- **पP2 _(NEW-REQ candidate)_** — 'अपनी माँग चुनिए — घटाकर देखिए' माँग-बार — यह क्या मशीन है? कोई आवाज़ नहीं बताती
  - *Why it fails:* The demand-lever meter is an abstract interactive with no Narrate tied to it; a voice-only elder cannot parse levers/bars silently. It sits on an otherwise-simple travel-toggle step — extra cognitive load with no spoken guide.
  - *Fix:* मीटर पर छोटा आवाज़-संकेत 'यह सिर्फ़ दिखाने के लिए है — ज़्यादा सुविधा माँगेंगे तो ग्राहक को ज़्यादा दाम', या तैयारी-प्रवाह से अलग रखो।

**✅ CHECK FOR ISJ:** क्या बड़ा नाचता हरा ₹ नंबर पंडित को अपनी दक्षिणा समझाकर डरा देता है, या 'अनुमान' शब्द से वह समझ जाता है?

---

### R4 — भोजन व ठहराव

- **Route:** `/readiness?step=4`
- **How to reach:** Complete R3 → step 4. Deep-link ?step=4 if readinessStep≥3.
- **Visual (canon):** frame food = 14 / stay = 16 in `design/canon/हमारे पंडित जी.dc.html`

**रामेश्वर का पल:** भोजन, एलर्जी, भत्ता, घर रुकना, धर्मशाला, होटल, साझा कमरा, कितने दिन — एक ही पन्ने पर बहुत सारे सवाल, मैं थक गया। भत्ते के नीचे 'यह भत्ता तभी मिलता है जब ग्राहक भोजन नहीं देते' — ठीक समझाया। फिर वही बड़ा हरा ₹।

**Findings:**

- **पP1 _(NEW-REQ candidate)_** — एक ही स्क्रीन पर सात-आठ सवाल — बहुत लंबा, मैं भूल जाता हूँ कहाँ था
  - *Why it fails:* StepR4 stacks dietary + hotelFoodOk + allergies + allowance + stayHome + dharamshala + hotelTier + sharedRoom + advanceNotice in one scroll. Only step-entry narration speaks; individual non-VoiceField questions are silent. Overwhelming for a voice-first elder.
  - *Fix:* ठहराव को अलग उप-चरण में तोड़ो (canon भी food=14 और stay=16 अलग रखता है), हर सवाल पर आवाज़-संकेत।
- **पP2 _(F11-01)_** — नीचे फिर वही बड़ा हरा ₹ नंबर — किसका पैसा?
  - *Why it fails:* Same PriceHonestyMeter with hardcoded dakshina={2100} (line 1224) repeats on R4 — same wrong-base prominent money concern as R3.
  - *Fix:* R3 जैसा ही — असली दक्षिणा भेजो या 'उदाहरण' स्पष्ट करो।

**✅ CHECK FOR ISJ:** क्या इतने सारे सवालों के बीच शिष्य की आवाज़ हर सवाल पर मार्गदर्शन देती है, या बीच के सवाल चुप रहते हैं?

---

### R5 — भुगतान + सत्यापन (आधार फ़ोटो + नंबर + सहमति + बैंक/UPI) — highest-distrust screen

- **Route:** `/readiness?step=5`
- **How to reach:** Complete R4 → step 5, OR rejected-KYC resubmit deep-links ?step=5. Login 9876500050/123456; readinessStep≥4 to reach honestly.
- **Visual (canon):** frame aadhaar = 13 / verification = 16 in `design/canon/हमारे पंडित जी.dc.html`

**रामेश्वर का पल:** आवाज़ ने कहा 'आख़िरी कदम, आपकी कमाई सीधे आपके खाते में आएगी, सत्यापन के लिए आधार की फोटो दें' — थोड़ा भरोसा हुआ। पर स्क्रीन पर 'आधार अपलोड करें' (अपलोड?), फिर आधार फ़ोटो, नंबर, चौकोर टिक-बॉक्स, नीचे 'IFSC कोड', 'UPI' अंग्रेज़ी में। मुझसे आधार और बैंक दोनों माँगे जा रहे — अगर आवाज़ बंद हो जाए तो स्क्रीन पर सिर्फ़ एक छोटा 'सुरक्षित' का टुकड़ा, कोई कारण नहीं। मन कहता है ऐप बंद कर दूँ।

**Findings:**

- **पP0 _(F05-02)_** — आधार और बैंक दोनों माँगे — क्यों? कारण सिर्फ़ आवाज़ में है; आवाज़ बंद/नेट धीमा हो तो स्क्रीन पर कोई भरोसा-वाक्य नहीं, बस 13px '🔒 सुरक्षित' टुकड़ा
  - *Why it fails:* The why-reassurance ('कमाई सीधे खाते में', 'सत्यापन के लिए') lives ONLY in r5Voice via Narrate (the code comment at line 1254 admits it). Narrate returns null — no on-screen caption. On patchy Jio (this persona's exact condition) Sarvam TTS is the first thing to fail; the suspicious elder is then left with an Aadhaar+bank demand and only a 13px chip — a document ask with NO readable reassurance of WHY → abandonment on the trust-critical screen.
  - *Fix:* आधार कार्ड के ऊपर एक स्थायी बड़ी देवनागरी पंक्ति छापो: 'आधार सिर्फ़ यह पक्का करने को कि आप असली पंडित हैं — परिवार आप पर भरोसा करेगा। आपकी कमाई सीधे इसी बैंक खाते में आएगी।' आवाज़ पर निर्भर मत रहो।
- **पP1 _(F36-01)_** — 'IFSC कोड' और 'UPI' अंग्रेज़ी अक्षरों में — मैं पढ़ नहीं सकता, यह क्या माँग रहा है
  - *Why it fails:* onboarding.ifscCode='IFSC कोड', upiTab='UPI', upiIdLabel='UPI आईडी' render Latin 'IFSC'/'UPI' in StepR5 (lines 1347,1395,1411). paymentError ('...या UPI की सही जानकारी...') is also SPOKEN via sayError, so TTS reads the Latin token too. Placeholders 'SBIN0001234','example@upi' are Latin.
  - *Fix:* 'IFSC कोड' → देवनागरी 'बैंक शाखा कोड' + 'यह आपकी पासबुक/चेक पर छपी होती है'। 'UPI' → 'यूपीआई'। त्रुटि-संदेश में भी 'यूपीआई'।
- **पP1 _(F36-01)_ · **NEEDS ISJ ON DEVICE**** — बैंक खाता संख्या, IFSC — ये खाने चुप हैं, आवाज़ से नहीं भर सकता, मुझे टाइप करना है (मैं कभी फ़ॉर्म नहीं भरता)
  - *Why it fails:* By design (A5) bank/IFSC/UPI are typed-only <input> with no mic; onFocus speaks 'लिखकर भरें'. Correct for security, but for a WhatsApp-voice-only man a mandatory typed 9-18 digit account number + IFSC + confirm is a genuine wall with no voice escape — he can be stuck at the finish line.
  - *Fix:* टाइप अनिवार्य है तो शिष्य कदम-दर-कदम बोले 'अब खाता नंबर टाइप कीजिए, पासबुक देखकर', और एक बड़ा 'मदद / पोते को बुलाएँ' विकल्प दो — dead-end न बने।
- **पP2 _(F05-02)_** — शीर्षक 'आधार अपलोड करें' — 'अपलोड' क्या है?
  - *Why it fails:* onboarding.step6Title='आधार अपलोड करें' (line 1258). 'अपलोड' is English jargon in Devanagari; the row below already says 'फ़ोटो लें', so the jargon heading is redundant and confusing.
  - *Fix:* शीर्षक 'आधार कार्ड की फ़ोटो दिखाइए'; 'अपलोड' हटाओ।
- **पP2 _(F05-02)_** — सहमति का टिक-बॉक्स छोटा, वाक्य छोटे अक्षरों में — अंगूठा चूकता है, पढ़ना कठिन
  - *Why it fails:* Consent checkbox w-6 h-6 (24px) inside a min-h-[44px] label — tap target 44px, under the 52px floor; consent sentence text-[15px] (line 1319), at the body floor for a long line without glasses; trust chip text-[13px] (line 1260), below the caption floor.
  - *Fix:* टिक-पंक्ति ऊंचाई ≥56px, बॉक्स ≥28px; सहमति-वाक्य ≥17px; ट्रस्ट-चिप ≥15px; सहमति आवाज़ में पढ़कर 'हाँ' से टिक होने दो।
- **पP2 _(F05-02)_ · **NEEDS ISJ ON DEVICE**** — फ़ोटो लेने पर फ़ोन का अपना चुनाव-पर्दा अंग्रेज़ी में (Camera/Files/Gallery)
  - *Why it fails:* The file input is accept="image/*" with NO capture attribute (lines 1267,1286), so Android shows its own English picker between 'फ़ोटो लें' and the actual capture — an English wall outside app control at the worst moment.
  - *Fix:* capture="environment" जोड़ो ताकि सीधे कैमरा खुले।

**✅ CHECK FOR ISJ:** पैची Jio पर अगर r5Voice (आधार क्यों चाहिए) की आवाज़ नहीं चलती, तो क्या स्क्रीन पर पढ़ने लायक कोई कारण बचता है — या शक्की पंडित यहीं ऐप बंद कर देगा?

---

### R5 पूरा → उत्सव (celebration)

- **Route:** `/readiness (showCelebration state)`
- **How to reach:** saveR5 succeeds (valid Aadhaar front+back+12-digit+consent + valid bank/UPI) → setShowCelebration(true). Not reachable without passing R5 validation.
- **Visual (canon):** frame celebration = 26 in `design/canon/हमारे पंडित जी.dc.html`

**रामेश्वर का पल:** 🚩 झंडा, 'अब आप बुकिंग के लिए तैयार हैं!' आवाज़ ने बधाई दी। अच्छा लगा, मैंने कर लिया। एक बड़ा 'होम पर जाएं' बटन — पर छोटे में लिखा 'सत्यापन में है, जल्द पूरा होगा' — तो मैं तैयार हूँ या नहीं?

**Findings:**

- **पP2 _(NEW-REQ candidate)_** — शीर्षक 'तैयार हैं' पर नीचे 'सत्यापन में है, जल्द पूरा होगा' — दुविधा
  - *Why it fails:* CelebrationScreen title=readyCelebrationTitle 'अब आप बुकिंग के लिए तैयार हैं!' but message=home.pendingVerification 'आपकी प्रोफ़ाइल सत्यापन में है। जल्द पूरा होगा।' — headline says done, body says still-pending (GO ONLINE stays admin-gated). Mildly contradictory for a literal reader.
  - *Fix:* शीर्षक ईमानदार करो: 'तैयारी पूरी! अब हम आपका सत्यापन कर रहे हैं — जल्द ऑनलाइन जा सकेंगे।' एक सुर।

**✅ CHECK FOR ISJ:** क्या बधाई-आवाज़ असली फ़ोन पर गर्म लगती है, और शीर्षक बनाम उप-पंक्ति का अंतर पंडित को भ्रमित नहीं करता?

---

## Journey 4 · पूजा जोड़ें → दक्षिणा → सामग्री → वीडियो → प्रतीक्षा

### मेरी पूजाएँ (list)

- **Route:** `/my-poojas`
- **How to reach:** Pilot login 9876500050 / 123456 → from /settings tap मेरी पूजाएँ (this page's back also goes /settings). Shows the pandit's specializations with 3-state सत्यापन badges. To see the REJECTED resubmit row you need a pooja-verification row with status REJECTED for this pandit (admin/seed step on /pandit/pooja-verifications).
- **Visual (canon):** frame 21 (my-poojas) in `design/canon/हमारे पंडित जी.dc.html`

**रामेश्वर का पल:** मेरी पूजाएँ दिखती हैं, हर एक पर एक हरी या पीली लिखाई। दाईं तरफ़ लाल गोल में एक ✖ है। नीचे बड़ा सा ₹ का अंक — शिष्य ने कहा था दाम बदलने को उस पर छूना है, ठीक। पर वो लाल ✖ किसलिए है? मैं उसे छू दूँ तो?

**Findings:**

- **पP1 _(NEW-REQ candidate)_** — लाल ✖ छूते ही पूजा तुरंत हट जाती है — न कोई 'पक्का?' न शिष्य की चेतावनी। मेरी मोटी उंगली ग़लती से दब गई तो मेरी पूजा ग़ायब।
  - *Why it fails:* removePooja() fires immediately on tap (page.tsx:232) with no confirm dialog and no spoken warning — only a silent toast after. A destructive, hard-to-undo action sits one mis-tap away for a man with thick fingers and no glasses. He can silently lose a specialization (and its bookings visibility).
  - *Fix:* ✖ पर पहले शिष्य बोले: '<पूजा> हटानी है? पक्का?' और एक हाँ/नहीं पुष्टि-कार्ड दिखे। बिना बोली-पुष्टि के कभी न हटे। बटन को 52px+ करें और लेबल 'हटाएँ' साथ रखें, अकेला ✖ नहीं।
- **पP2 _(F09-01)_ · **NEEDS ISJ ON DEVICE**** — स्थिति की लिखाई (✓ प्रमाणित / सत्यापन बाकी / अस्वीकृत) बहुत छोटी और पतली है — बिना चश्मे मुझे मुश्किल से दिखती है।
  - *Why it fails:* statusLabel is text-[13px] (page.tsx:229) — below the 15px caption floor. The one line that tells him whether a pooja is live or still waiting is the hardest to read.
  - *Fix:* स्थिति-पंक्ति कम से कम 15px, और रंग के साथ एक बड़ा आइकन (✓/⏳/✗) 18px रखें ताकि दूर से भी पढ़ी जाए।

**✅ CHECK FOR ISJ:** Arm's length, temple daylight, no glasses — can he tell a सत्यापन-बाकी card apart from a प्रमाणित one at a glance, and does the 13px status line read at all?

---

### पूजा जोड़ें · चरण 1: नाम + विवरण

- **Route:** `/my-poojas/add (step 0)`
- **How to reach:** From /my-poojas tap '+ नई पूजा जोड़ें' (footer) or say 'नई पूजा'. This is the LIVE 7-step wizard (add/page.tsx). Step 0 of 7.
- **Visual (canon):** frame 18a (add-puja name step) in `design/canon/हमारे पंडित जी.dc.html`

**रामेश्वर का पल:** शिष्य बोलता है 'कौन सी पूजा जोड़ें? नाम बोलिए।' अच्छा, मैं बोल दूँ — 'सत्यनारायण कथा'। दूसरा ख़ाना कह रहा है दो शब्दों में बताओ पूजा क्या है। ठीक, ये मैं कर सकता हूँ, बोलना आता है मुझे।

**Findings:**

- **पP1 _(F08-01)_** — मुझसे पूजा का नाम खुला बुलवाया जा रहा है। मैंने जो बोला वही नाम बन गया — किसी सूची से नहीं चुना।
  - *Why it fails:* Doc F08-01 requires a voice pooja-SELECTION loop (system names common poojas one-by-one, हाँ/नहीं, ends 'कोई और पूजा?'). The wizard instead free-captures d.name by voice (add/page.tsx:136). A free-spoken name may not match the samagri/booking catalog pujaType, so downstream a customer may never find or price this pooja. Register marks F08-01 'missing'.
  - *Fix:* पहले शिष्य आम पूजाओं के नाम एक-एक बोले ('सत्यनारायण कथा? हाँ या नहीं…') और चुनवाए; 'कोई और' पर ही खुला नाम बुलवाएँ। इससे नाम कैटलॉग से मिलता है।

**✅ CHECK FOR ISJ:** Does the नाम VoiceField reliably capture a spoken 'सत्यनारायण कथा' in a noisy courtyard over patchy Jio, or does it drop/garble so he can't get past step 0?

---

### पूजा जोड़ें · चरण 2: सामग्री (तीन स्तर)

- **Route:** `/my-poojas/add (step 1)`
- **How to reach:** Advance from step 0 with a non-empty name via 'आगे — सामग्री'. Renders SamagriTiers + an add-item card.
- **Visual (canon):** frame 18b / 17 (samagri tiers) in `design/canon/हमारे पंडित जी.dc.html`

**रामेश्वर का पल:** बेसिक, स्टैंडर्ड, प्रीमियम — तीन डिब्बे। शिष्य कहता है हर स्तर में सामान जोड़ो। सामान का नाम तो बोल दूँ… पर नीचे दो और ख़ाने हैं 'मात्रा' और 'कंपनी' — इन पर छूने से नीचे वो अक्षरों वाला पट्टा (कीबोर्ड) खुल गया। मुझे टाइप करना नहीं आता। मैं सिर्फ़ बोलना जानता हूँ।

**Findings:**

- **पP1 _(F12-01)_** — मात्रा और कंपनी के ख़ाने बोलकर नहीं भरते — कीबोर्ड से टाइप करना पड़ता है, जो मुझे बिल्कुल नहीं आता।
  - *Why it fails:* qty and brand are raw <input> keyboard fields (add/page.tsx:169-170), NOT VoiceField. A WhatsApp-voice-only user hits a keyboard he cannot use. Name is voice, but the moment he wants quantity or the promised brand/company he is stranded — a silent dead end mid-step.
  - *Fix:* मात्रा और कंपनी को भी VoiceField बनाएँ (बोलकर भरें), और शिष्य बोले 'अब मात्रा बोलिए', 'कंपनी का नाम बोलिए'। कीबोर्ड वैकल्पिक रहे, अनिवार्य नहीं।

**✅ CHECK FOR ISJ:** On the device, does tapping मात्रा/कंपनी pop the system keyboard with no voice mic at all — confirming he has zero voice route for those two fields?

---

### पूजा जोड़ें · चरण 3: आपूर्ति (सामान कौन लाएगा)

- **Route:** `/my-poojas/add (step 2)`
- **How to reach:** Advance from सामग्री via 'आगे — आपूर्ति'. Three big option cards + voice options.
- **Visual (canon):** frame 18c (supply mode) in `design/canon/हमारे पंडित जी.dc.html`

**रामेश्वर का पल:** शिष्य पूछता है सामान कौन लाएगा। तीन बड़े कार्ड — 'हाँ, मैं लाऊँगा', 'प्लेटफ़ॉर्म बेचे', 'सिर्फ़ सूची'। मैं बोल दूँ 'हाँ मैं लाऊँगा'। नीचे लिखा है 'तीनों स्तर के दाम आप तय करें' — अच्छा, तो अब मुझसे दाम पूछे जाएँगे?

**Findings:**

- **पP1 _(F12-04)_** — 'हाँ, मैं लाऊँगा' चुनने पर वादा है 'तीनों स्तर के दाम आप तय करें' — पर पूरे विज़ार्ड में कहीं दाम पूछा ही नहीं जाता। मेरा दाम शून्य चला जाता है।
  - *Why it fails:* The card promises the pandit sets tier prices, and submit sends price: d.prices[tier] for PANDIT_BRINGS (add/page.tsx:84) — but d.prices has NO setter anywhere in the wizard (only init to null at :46). So every tier price submits as null/0. He is told he'll price his samagri and never gets the chance — a money promise the flow silently breaks.
  - *Fix:* जब 'हाँ, मैं लाऊँगा' चुने, सामग्री चरण में हर स्तर के लिए एक बोलकर-भरने वाला दाम-ख़ाना दिखे (₹ बेसिक/स्टैंडर्ड/प्रीमियम), और शिष्य दाम पूछे व दोहराकर पुष्टि करे — बचे-खुचे /samagri संपादक की तरह।
- **पP2 _(F12-04)_ · **NEEDS ISJ ON DEVICE**** — कार्ड के नीचे की छोटी लाइन (उप-शीर्षक) बहुत छोटी है।
  - *Why it fails:* Option sub-label is text-[13px] (add/page.tsx:190) — below the 15px caption floor; the line that explains each choice is the least legible.
  - *Fix:* उप-शीर्षक 15px+ करें।

**✅ CHECK FOR ISJ:** Does शिष्य actually speak each of the three supply choices aloud (useVoiceOptions), so a non-reader knows what he is picking before he taps?

---

### पूजा जोड़ें · चरण 4: टीम (कितने पंडित)

- **Route:** `/my-poojas/add (step 3)`
- **How to reach:** Advance via 'आगे — टीम'. Number buttons 1-5, voice labels 'N पंडित'.
- **Visual (canon):** frame no canon frame in `design/canon/हमारे पंडित जी.dc.html`

**रामेश्वर का पल:** बड़ा सा दो-आदमी वाला चित्र। '1 2 3 4 5' के बड़े बटन। शिष्य कहता है आप मुख्य पंडित होंगे। मैं '2 पंडित' बोल दूँ। नीचे लिखा '2 पंडित (आप सहित)'। ये मुझे समझ आया, ठीक लगा।

**Findings:**

- **पP2 _(F10-01)_** — यह चरण साफ़ है — बड़े बटन, बोलने का साथ, 'आप सहित' समझ आता है। कोई दीवार नहीं।
  - *Why it fails:* No defect. teamSize buttons are 56px, voice labels are 'N पंडित' (not bare digits, pinning F10-03), and the count-includes-self line (F10-01) is present. Recorded to show the screen was walked, not skipped.
  - *Fix:* कोई बदलाव नहीं चाहिए। (52px+ टारगेट, बोली-लेबल, देवनागरी — सब ठीक।)

**✅ CHECK FOR ISJ:** Do the 56px number buttons feel comfortably tappable with a thick finger, no accidental neighbour hits?

---

### पूजा जोड़ें · चरण 5: दक्षिणा

- **Route:** `/my-poojas/add (step 4)`
- **How to reach:** Advance via 'आगे — दक्षिणा'. VoiceField money.
- **Visual (canon):** frame 17 (price-meter) / 18 dakshina in `design/canon/हमारे पंडित जी.dc.html`

**रामेश्वर का पल:** शिष्य कहता है 'कुल दक्षिणा कितनी? इसमें बाकी पंडितों की भी शामिल है।' अच्छा, तो पूरा जोड़कर बोलूँ। मैं '5000' बोल दूँ। यही तो मेरी कमाई है — दिखना बड़ा चाहिए।

**Findings:**

- **पP2 _(F11-01)_ · **NEEDS ISJ ON DEVICE**** — यह मेरा पैसा है, पर यह पक्का नहीं कि बोला हुआ ₹5000 स्क्रीन पर सबसे बड़ी चीज़ बनकर दिखे — ऊपर के शीर्षक और चित्र इससे बड़े न हो जाएँ।
  - *Why it fails:* The dakshina VoiceField (add/page.tsx:239) sets the amount, but the persona rule 'money must be the biggest thing on its screen' can only be confirmed by seeing VoiceField's rendered amount size against the 16px heading. If the typed amount renders small, his single most important number is not dominant.
  - *Fix:* दर्ज दक्षिणा को स्क्रीन का सबसे बड़ा अंक बनाएँ (कम से कम 32px, गाढ़ा), और शिष्य राशि दोहराकर 'पाँच हज़ार रुपये, सही?' पूछे (F11-02 पुष्टि-लूप)।

**✅ CHECK FOR ISJ:** After he speaks '5000', is the ₹5000 the single largest element on the screen, and does शिष्य read it back for confirmation?

---

### पूजा जोड़ें · चरण 6: वीडियो (सत्यापन)

- **Route:** `/my-poojas/add (step 5)`
- **How to reach:** Advance via 'आगे — वीडियो'. YouTube-link input + WhatsApp help button + consent checkbox. Submit CTA 'पूजा भेजें' is gated on videoUrl && consent.
- **Visual (canon):** frame 13 (aadhaar/verification) / 18d (video) in `design/canon/हमारे पंडित जी.dc.html`

**रामेश्वर का पल:** शिष्य कहता है 'दो मिनट का वीडियो चाहिए… यूट्यूब लिंक यहाँ टाइप कीजिए।' यूट्यूब क्या? लिंक क्या? नीचे ख़ाने में अंग्रेज़ी अक्षर 'https://youtu.be' — ये तो दीवार है, मुझे कुछ समझ नहीं आता, न टाइप करना आता है। नीचे हरा बटन 'भेज दीजिए, हम लगा देंगे' — हाँ! ये मैं कर सकता हूँ, व्हाट्सएप। मैं वीडियो भेज देता हूँ। अब? नीचे का बटन दबता ही नहीं…

**Findings:**

- **पP0 _(F08-06)_** — जो एक रास्ता मैं समझ सका — 'भेज दीजिए, हम लगा देंगे' (व्हाट्सएप) — उससे भेजने के बाद भी नीचे का 'पूजा भेजें' बटन दबता ही नहीं। मैं यहीं फँस गया, आगे नहीं बढ़ पाया।
  - *Why it fails:* Submit is disabled unless d.videoUrl && d.consent (add/page.tsx:107). The WhatsApp path (:268) never sets d.videoUrl. So the ONLY route a WhatsApp-voice-only pandit can use leaves the submit button permanently disabled — he sends his video, returns, and stares at a dead grey button with no voice telling him why. Total abandonment. This is the show-stopper of the whole journey.
  - *Fix:* व्हाट्सएप से भेजने पर विज़ार्ड को एक 'व्हाट्सएप से भेजा' अवस्था में ले जाएँ जो सत्यापन को PENDING कर दे (videoUrl के बिना submit की अनुमति दे, provider='WHATSAPP'), और शिष्य बोले 'वीडियो व्हाट्सएप पर आ गया, अब भेजें दबाइए' — बटन सक्रिय हो।
- **पP0 _(F08-02)_** — 'यूट्यूब लिंक टाइप कीजिए' और ख़ाने में अंग्रेज़ी 'https://youtu.be/…' — मेरे लिए ये पूरी दीवार है। न यूट्यूब पता, न टाइप आता, न मेरे पास कोई लिंक है।
  - *Why it fails:* The primary/default video path demands typing a Latin-script URL (placeholder 'https://youtu.be/…', add/page.tsx:255) — untypable and unreadable for him. Doc F08-02 requires in-app 'नया रिकॉर्ड करें' / 'गैलरी से' paths; both are absent. 'यूट्यूब' is a brand/jargon word he does not know even transliterated. The register itself flags this as deviation F08-06.
  - *Fix:* पहला और सबसे बड़ा विकल्प 'अभी रिकॉर्ड करें' (कैमरा) और 'व्हाट्सएप पर भेजें' हो; यूट्यूब लिंक को छोटे 'जानकारों के लिए' विकल्प में छिपाएँ। शिष्य पहले यही दो रास्ते बोले।
- **पP1 _(F08-04)_ · **NEEDS ISJ ON DEVICE**** — एक ख़ाने पर निशान (✓) लगाने को कहा गया है 'यह वीडियो मेरा है, सत्यापन के लिए सहमति…' — पर शिष्य ने बोलकर नहीं समझाया कि क्यों, और 'सत्यापन' का मतलब मुझे साफ़ नहीं। बिना समझे मैं डरता हूँ कि कहीं पैसे या कुछ न फँसा दे।
  - *Why it fails:* The consent checkbox (add/page.tsx:272) is required to submit but has NO spoken narration explaining WHY consent is needed or what सत्यापन means. A document/permission-style ask with no voice reassurance triggers his cheat-suspicion; a non-reader can't parse the written line and may refuse to tick, blocking submit.
  - *Fix:* शिष्य बोले 'यह पक्का करने के लिए कि वीडियो आपका ही है — नीचे हरे ख़ाने को छूकर हाँ कहें, कोई पैसा नहीं लगता।' और चेकबॉक्स 52px+ हो।

**✅ CHECK FOR ISJ:** After he taps 'भेज दीजिए, हम लगा देंगे' and returns from WhatsApp, is 'पूजा भेजें' still disabled with no spoken cue — i.e. is he genuinely trapped on this screen?

---

### पूजा जोड़ें · चरण 7: प्रतीक्षा में

- **Route:** `/my-poojas/add (step 6)`
- **How to reach:** Reached ONLY after submit() succeeds, which requires a non-empty videoUrl + consent. In practice Rameshwar rarely reaches it because of the video dead-end above. To reach it in testing, paste a valid YouTube URL and tick consent, then 'पूजा भेजें'.
- **Visual (canon):** frame 18e (waiting) / 28 (loading) in `design/canon/हमारे पंडित जी.dc.html`

**रामेश्वर का पल:** बड़े हाथ जोड़े 🙏। लिखा 'सत्यनारायण कथा भेज दी गई', पीला बिल्ला '⏳ प्रतीक्षा में'। शिष्य कहता है जाँच के लिए भेज दी, स्वीकृत होते ही सूचना मिलेगी। अच्छा लगा — पर कब? कितने दिन? ये नहीं बताया।

**Findings:**

- **पP2 _(NEW-REQ candidate)_** — बताया कि 'स्वीकृत होते ही सूचना मिलेगी' पर कब — दो घंटे, दो दिन? — नहीं बताया, तो मैं बार-बार खोलकर देखता रहूँगा।
  - *Why it fails:* StepDone narration (add/page.tsx:286) and badge give status but no timeframe. For an anxious non-reader, 'as soon as approved' with no 'how long' means uncertainty and repeated app-opening. Not a doc requirement but a real trust gap.
  - *Fix:* शिष्य एक अनुमान जोड़े: 'आमतौर पर एक-दो दिन में। स्वीकृत होते ही आपको बताएँगे — आपको बार-बार देखने की ज़रूरत नहीं।'

**✅ CHECK FOR ISJ:** Does शिष्य's closing line sound warm and reassuring (not clipped), so he leaves the screen calm rather than anxious about timing?

---

### पूजा जोड़ें (5-चरण नक़ल) — add5

- **Route:** `/my-poojas/add5`
- **How to reach:** NOT linked from any UI — /my-poojas and its voice command both push /my-poojas/add. Reachable only by typing the URL directly. This is the merged 5-step candidate (add5/page.tsx), left on main alongside the live 7-step wizard.
- **Visual (canon):** frame 18 (add-puja, canon '5 चरण') in `design/canon/हमारे पंडित जी.dc.html`
- **⚠ UNREACHABLE IN PROD:** add5 is reachable only by manually typing /my-poojas/add5 — no button, footer, or voice command links to it. In normal pilot use Rameshwar never lands here; it is dead-but-shipped duplication, which is itself the finding. — *this is itself a finding.*

**रामेश्वर का पल:** (इस पते तक मैं कभी नहीं पहुँचता — कोई बटन यहाँ नहीं ले जाता। पर अगर किसी दिन ले गया तो वही अटकाव: व्हाट्सएप से वीडियो भेजो, फिर बटन दबता नहीं।)

**Findings:**

- **पP2 _(NEW-REQ candidate)_** — एक ही काम 'पूजा जोड़ें' के दो अलग रास्ते कोड में पड़े हैं — 7-चरण (add) जो असल में चलता है, और 5-चरण (add5) जो किसी बटन से नहीं जुड़ा। कौन-सा सही है, किसमें सुधार जाए — भ्रम।
  - *Why it fails:* Two routes to one task exist on main (add/page.tsx 7-step is LIVE, add5/page.tsx 5-step is orphaned but reachable by URL). Task #20 'promote add5→add' is marked done, yet add/ is still the 7-step shape and add5/ still ships. Divergent duplication: a fix to one silently misses the other, and add5 carries the SAME video dead-end and the SAME missing price-setter.
  - *Fix:* एक को असल बनाएँ (canon 5-चरण को /add पर promote करें) और दूसरे को हटाएँ, ताकि सुधार एक ही जगह हों और अटकाव एक ही बार ठीक हो।

**✅ CHECK FOR ISJ:** Confirm on device that /my-poojas' add button and 'नई पूजा' voice command both land on the 7-step /add (never add5), so add5 is truly dead in prod.

---

### सामग्री पैकेज (standalone editor)

- **Route:** `/samagri`
- **How to reach:** Pilot login → from /home (this page's back goes /home, so it is entered from a home tile/link). Pick a पूजा card, then the shared SamagriPackageEditor opens with default items + tier price fields. Separate from the add-wizard's samagri step.
- **Visual (canon):** frame 17 (samagri) / no exact frame in `design/canon/हमारे पंडित जी.dc.html`

**रामेश्वर का पल:** पूजा चुनी, सामान की सूची खुली — नाम बोलकर, मात्रा बोलकर भर सकता हूँ, अच्छा। पर नीचे तीन दाम-ख़ानों पर अंग्रेज़ी लिखी है 'Basic', 'Standard', 'Premium' — ये तीन शब्द मुझे बिलकुल नहीं पढ़ने आते। कौन-सा ख़ाना किसका है, मैं कैसे जानूँ?

**Findings:**

- **पP1 _(F12-02)_** — तीन दाम-ख़ानों के लेबल अंग्रेज़ी में हैं — 'Basic', 'Standard', 'Premium' — ये तीन दीवारें हैं, मुझे पता ही नहीं चलता कौन-से स्तर का दाम कहाँ डालूँ।
  - *Why it fails:* SamagriPackageEditor renders VoiceField label="Basic"/"Standard"/"Premium" (SamagriPackageEditor.tsx:222,233,244) as visible on-screen English. The wizard uses बेसिक/स्टैंडर्ड/प्रीमियम everywhere else — here the label reverts to Latin. A Devanagari-only pandit cannot tell the three price boxes apart.
  - *Fix:* लेबल देवनागरी करें — 'बेसिक', 'स्टैंडर्ड', 'प्रीमियम' (जैसा TIER_LABEL में पहले से है), और शिष्य हर ख़ाने से पहले बोले 'बेसिक पैकेज का दाम बोलिए'।
- **पP2 _(F12-01)_** — यही सामग्री मैं पूजा-जोड़ने वाले विज़ार्ड में भी भरता हूँ — दो अलग जगह एक ही काम। किधर भरूँ, समझ नहीं आता।
  - *Why it fails:* Samagri can be set both inside the add wizard (StepSamagri) and again on this standalone /samagri screen via a different editor with a different item/price model. Two divergent samagri paths risk conflicting data and confuse a user who was just walked through samagri in the wizard.
  - *Fix:* एक ही सामग्री-संपादक दोनों जगह इस्तेमाल हो (विज़ार्ड इसी SamagriPackageEditor को reuse करे), ताकि दाम-सेटर भी विज़ार्ड में आ जाए और नक़ल ख़त्म हो।

**✅ CHECK FOR ISJ:** On device, do the on-screen tier price labels actually show 'Basic/Standard/Premium' in Latin (not Devanagari), confirming the English wall?

---

## Journey 5 · होम → बुकिंग → स्वीकार → संपन्न → उत्सव

### होम — पहली लोडिंग (DiyaLoader)

- **Route:** `/home (loading state)`
- **How to reach:** pilot login 9876500050 / 123456 → lands on /home; the DiyaLoader shows for the ~2-5s while /auth/me + bookings + earnings + stats fetch (page.tsx loadData, 5 sequential api calls). On Fast-3G this diya screen lingers several seconds.
- **Visual (canon):** frame 28 (loading) in `design/canon/हमारे पंडित जी.dc.html`

**रामेश्वर का पल:** स्क्रीन पर एक दीया घूम रहा है, नीचे हिंदी में कुछ लिखा है। मैं इंतज़ार करता हूँ — शिष्य कुछ नहीं बोलता। चश्मा नहीं है, पता नहीं रुका है या टूट गया है।

**Findings:**

- **पP2 _(NEW-REQ candidate)_ · **NEEDS ISJ ON DEVICE**** — दीया घूमता रहता है पर शिष्य की कोई आवाज़ नहीं — मौन प्रतीक्षा
  - *Why it fails:* 5 api कॉल क्रम से चलती हैं (auth/me → bookings today → all → earnings → muhurat → stats); patchy Jio पर यह कई सेकंड है। इस मौन में रामेश्वर को नहीं पता ऐप ज़िंदा है या अटक गया — उसकी आदत WhatsApp की है जहाँ कुछ न हो तो वह मान लेता है टूट गया।
  - *Fix:* लोडर पर एक छोटी शिष्य-लाइन बोलें, जैसे "एक पल पंडित जी, आपका पन्ना खुल रहा है…" — या दृश्य टेक्स्ट को स्पष्ट "खुल रहा है…" रखें, जो अभी हिंदी में है वह अच्छा है पर आवाज़ जोड़ें।

**✅ CHECK FOR ISJ:** asli phone par: Fast-3G par yeh diya-loader itni der ruke ki Rameshwar ko lage app atak gaya — kya bina awaaz ke woh 5 second se zyada mौन rehta hai?

---

### होम — मुख्य डैशबोर्ड (booking-ready, ऑफलाइन)

- **Route:** `/home`
- **How to reach:** pilot login 9876500050 / 123456. panditProfile.isBookingReady=true और verificationStatus=APPROVED चाहिए ताकि GO ONLINE पिल दिखे (वरना तैयारी hero दिखता है)। आज/कल की बुकिंग देखने के लिए seed में एक today + एक tomorrow eventDate वाली booking चाहिए।
- **Visual (canon):** frame 8/12 (home) in `design/canon/हमारे पंडित जी.dc.html`

**रामेश्वर का पल:** सबसे ऊपर "नमस्ते, रामेश्वर जी" — अच्छा लगा। नीचे बड़े हरे अक्षरों में इस महीने की कमाई का पैसा — मेरी आँख वहीं जाती है, यही मुझे चाहिए। एक बड़ा हरा बटन "ऑनलाइन जाएं" — शिष्य ने बोला भी। पर आज की बुकिंग में समय "09:00 AM" लिखा है — यह AM क्या है? दायें ऊपर एक चक्का सा चिन्ह है, पता नहीं क्या करेगा।

**Findings:**

- **पP1 _(NEW-REQ candidate)_** — आज/कल की बुकिंग पंक्ति में समय "09:00 AM" / "05:30 PM" — अंग्रेज़ी AM/PM
  - *Why it fails:* formatTime() en-US hour12 फ़ॉर्मैट देता है (HomeView L118-125), जो 28px बड़े अक्षरों में सबसे ऊपर दिखता है (L388) और कल की सूची में भी (L419)। रामेश्वर सिर्फ़ देवनागरी पढ़ता है — AM/PM एक दीवार है, उसे नहीं पता सुबह है या शाम। विडंबना: ठीक ऊपर "अगली बुकिंग" hero में formatTimeHindi "सुबह 9:00" सही है, पर सूची में नहीं।
  - *Fix:* आज/कल की सूची में भी formatTimeHindi लगाएं ("सुबह 9:00", "शाम 5:30") जो इसी फ़ाइल में पहले से मौजूद है (L128-135)। en-US formatTime को narration-only रखें, दृश्य पर कभी नहीं।
- **पP2 _(NEW-REQ candidate)_** — 3-स्टैट पंक्ति के लेबल रेटिंग/पूर्णता/बुकिंग सिर्फ़ 13px
  - *Why it fails:* text-[13px] (HomeView L341, L347, L353) — 15px कैप्शन फ़्लोर से नीचे। बिना चश्मे, हाथ की दूरी पर रामेश्वर इन्हें पढ़ ही नहीं पाएगा; अंक (22px) दिखेगा पर किसका अंक है यह गायब।
  - *Fix:* लेबल कम-से-कम 15px करें (text-[15px])। अगर जगह की तंगी है तो एक स्टैट कम दिखाएँ पर लेबल पढ़ने-लायक रखें।
- **पP2 _(NEW-REQ candidate)_** — दायें-ऊपर ⚙️ सेटिंग बटन — सिर्फ़ आइकन, कोई देवनागरी नहीं, aria-label "Settings" अंग्रेज़ी
  - *Why it fails:* HomeHeaderRightSlot (L137-145) में सिर्फ़ ⚙️ इमोजी और अंग्रेज़ी aria-label। रामेश्वर ने सिर्फ़ WhatsApp voice चलाया है — गियर-चक्का उसके लिए अज्ञात चिन्ह है, वह दबाने से डरेगा ("कहीं कुछ बिगड़ न जाए")।
  - *Fix:* आइकन के साथ छोटा देवनागरी लेबल "सेटिंग" दिखाएँ, या शिष्य के welcome-line में एक बार बताएँ "ऊपर चक्का दबाकर सेटिंग खोल सकते हैं"।

**✅ CHECK FOR ISJ:** asli phone par arm's-length par: kya "इस महीने की कमाई" ka ₹ number sach me screen ki sabse pehli cheez hai jahan aankh jaati hai, ya bada hara GO ONLINE pill pehle dhyaan kheenchta hai?

---

### होम — नई बुकिंग विनती बैनर (poll से)

- **Route:** `/home (newRequestBooking state)`
- **How to reach:** होम पर रहते हुए admin/seed से एक नई REQUESTED booking बनाएँ; 30s के भीतर poll (page.tsx L161-197) उसे पकड़ता है, playBell() बजाता है, शिष्य बोलता है, और केसरी बैनर उतरता है।
- **Visual (canon):** frame 9/13 (booking-request entry) in `design/canon/हमारे पंडित जी.dc.html`

**रामेश्वर का पल:** अचानक घंटी बजी — शिष्य बोला "नई बुकिंग आई है!" — केसरी पट्टी ऊपर आई, बड़े सफ़ेद अक्षरों में "नई बुकिंग देखें →"। यह मुझे समझ आया, मेरा हाथ वहीं जाता है। अच्छा लगा कि किसी ने आवाज़ दी।

**Findings:**

- **पP2 _(NEW-REQ candidate)_** — नई बुकिंग सिर्फ़ 30-सेकंड poll पर मिलती है — बैनर आने में 30s तक का मौन अंतराल
  - *Why it fails:* setInterval(runPoll, 30000) (page.tsx L190)। बुकिंग सर्वर पर आते ही घंटी/आवाज़ नहीं — रामेश्वर स्क्रीन देखता रह सकता है और आधे मिनट तक कुछ नहीं होता। जब बजती है तब अच्छा है, पर देरी में वह सोच सकता है कोई काम नहीं आ रहा और ऐप बंद कर दे।
  - *Fix:* poll अंतराल घटाएँ (जैसे 10s) या push/SSE जोड़ें ताकि विनती लगभग तुरंत घंटी बजाए; और होम पर एक स्थिर देवनागरी लाइन रखें "नई बुकिंग आते ही घंटी बजेगी" ताकि मौन भरोसेमंद लगे (empty-state hint में यह पहले से है, dashboard पर भी दिखे)।

**✅ CHECK FOR ISJ:** asli phone par: jab nayi booking aati hai, kya playBell + शिष्य ki "नई बुकिंग आई है!" awaaz shor-bhare mandir aangan me itni sunayi deti hai ki Rameshwar chook na jaaye?

---

### बुकिंग सूची (नई विनती / चालू / पूरी हुई)

- **Route:** `/bookings`
- **How to reach:** होम के नीचे-नेव से या "बुकिंग खोलो" बोलकर। टैब देखने के लिए seed में एक REQUESTED (नई विनती), एक ACCEPTED/IN_PROGRESS (चालू), एक COMPLETED (पूरी हुई) booking चाहिए।
- **Visual (canon):** frame 11 (booking-list) in `design/canon/हमारे पंडित जी.dc.html`

**रामेश्वर का पल:** तीन टैब — "नई विनती", "चालू", "पूरी हुई" — हिंदी में, समझ आया। हर बुकिंग में पूजा का नाम और दायें ₹ में पैसा। नई विनती में "जवाब दें ›" लिखा है, ठीक है। पर तारीख की पंक्ति में फिर वही "09:00 AM" और नीचे कोई अंग्रेज़ी कोड "HPJ-2381" — यह क्या है?

**Findings:**

- **पP1 _(NEW-REQ candidate)_** — पंक्ति की तारीख-पंक्ति में समय "09:00 AM" — अंग्रेज़ी AM/PM
  - *Why it fails:* formatTime() en-US hour12 (bookings/page.tsx L130-137) पंक्ति की लाइन में लगता है (L253): "18 जुलाई · 09:00 AM · वाराणसी"। AM/PM रामेश्वर के लिए अपठनीय — कब जाना है यह अधूरा रहता है।
  - *Fix:* समय को देवनागरी daypart में दिखाएँ ("सुबह 9:00") — home की formatTimeHindi जैसा एक साझा helper बनाकर दोनों जगह लगाएँ।
- **पP2 _(NEW-REQ candidate)_** — हर पंक्ति में bookingNumber "HPJ-XXXX" जैसा अंग्रेज़ी/अल्फ़ान्यूमेरिक कोड
  - *Why it fails:* L257 में b.bookingNumber font-mono दिखता है। रामेश्वर इसे पढ़ नहीं सकता; उसे लगेगा कोई काम का नंबर है जो वह चूक रहा है, या शक होगा।
  - *Fix:* कोड को और दबा दें (छोटा, हल्का) या हटा दें — पंडित को reference कोड की ज़रूरत नहीं; ज़रूरत हो तो "बुकिंग सं." जैसा देवनागरी उपसर्ग लगाएँ।

**✅ CHECK FOR ISJ:** asli phone par thick-finger se: kya poori booking-card (row) tap karne par aasani se khulti hai, ya "जवाब दें ›" ke chhote text par hi tap register hota hai?

---

### बुकिंग विनती — स्वीकार / अस्वीकार

- **Route:** `/bookings/[id]/request`
- **How to reach:** एक REQUESTED booking का request पेज। seed: status=REQUESTED, dakshinaAmount/travelAmount/foodAllowance भरे हों ताकि earnings table पूरी दिखे। होम बैनर या सूची की "जवाब दें" से पहुँचें।
- **Visual (canon):** frame 9/13 (booking-request) in `design/canon/हमारे पंडित जी.dc.html`

**रामेश्वर का पल:** 🔔 "नई बुकिंग विनती!" — शिष्य ने पूजा और कुल कमाई बोल दी, अच्छा। नीचे कमाई का हिसाब — दक्षिणा, फिर लाल में "−₹500 प्लेटफ़ॉर्म शुल्क"। मेरा माथा ठनका — यह मेरा पैसा काट रहा है? "प्लेटफ़ॉर्म" क्या होता है? किसी ने बताया नहीं क्यों काटा। नीचे बड़ा हरा "स्वीकार करें" — मैं दबाता हूँ… और सीधे स्वीकार हो गया, पूछा तक नहीं।

**Findings:**

- **पP1 _(NEW-REQ candidate)_** — लाल में "−₹ प्लेटफ़ॉर्म शुल्क (10%)" कटौती — बिना किसी बोली गई वजह के; "प्लेटफ़ॉर्म" शब्द अपरिचित
  - *Why it fails:* L278-283 में platformFee text-danger "−₹X" दिखता है; string "प्लेटफ़ॉर्म शुल्क (10%)" (strings L453)। voiceIntro सिर्फ़ कुल कमाई बोलता है (L176), कटौती की वजह कभी नहीं बोलता। रामेश्वर पैसे को लेकर सशंकित है — लाल घटाव + "प्लेटफ़ॉर्म" जैसा विदेशी शब्द उसे यही सोचने पर मजबूर करता है कि ऐप उसका पैसा छीन रहा है, वह ऐप बंद कर सकता है।
  - *Fix:* शिष्य एक भरोसा-लाइन बोले: "₹X ऐप की सेवा का हिस्सा है, बाक़ी पूरा आपका।" और लेबल को सरल करें: "ऐप सेवा शुल्क (10%)" — "प्लेटफ़ॉर्म" शब्द हटाएँ। घटाव के बगल में एक छोटा "क्यों?" जो बोलकर समझाए।
- **पP1 _(F02-06)_** — हरे "स्वीकार करें" बटन को टैप करने पर कोई पुष्टि नहीं — सीधे स्वीकार; जबकि अस्वीकार पर "पक्का?" डायलॉग है
  - *Why it fails:* handleAccept (L119) tap पर तुरंत POST करता है (L349-356)। सिर्फ़ voice-path पर confirmText "…पक्का?" है (L182), tap पर नहीं। अस्वीकार पर पूरा confirm-dialog है (L361-393)। रामेश्वर के मोटे हाथ "अभी नहीं" के ठीक बगल वाले हरे बटन को ग़लती से दबा सकते हैं — बुकिंग कमिट हो जाती है, कोई undo नहीं। जोखिम-भरे अस्वीकार को तो पूछा जाता है, पर कमिट करने वाले स्वीकार को नहीं — उल्टा।
  - *Fix:* स्वीकार पर भी एक हल्का पुष्टि-कदम रखें ("आप यह पूजा स्वीकार कर रहे हैं — पक्का?" हाँ/नहीं), बिलकुल reject जैसा — या accept के बाद 60s का बोला-हुआ undo ("वापस करो") दें। no-silent-acceptance।
- **पP2 _(NEW-REQ candidate)_** — अस्वीकार बटन का लेबल "अभी नहीं" पर काम स्थायी अस्वीकार
  - *Why it fails:* L340-348 बटन "अभी नहीं" (=बाद में देख लूँगा) दिखाता है पर वह अस्वीकार-confirm खोलता है जो कहता है "वाकई अस्वीकार करना चाहते हैं?"। रामेश्वर "अभी नहीं" सोचकर दबाएगा कि बाद में तय करूँगा — पर यह मना करने का रास्ता है, भ्रम।
  - *Fix:* या तो बटन-लेबल को कोमल-पर-सही रखें ("अभी नहीं" ठीक है) पर उसके बाद का प्रश्न भी वही टोन दे ("क्या यह बुकिंग नहीं लेनी?"), या बटन को "मना करें" कर दें ताकि लेबल और परिणाम मेल खाएँ।
- **पP2 _(NEW-REQ candidate)_** — "अभी जवाब दें" urgency चिप सिर्फ़ 13px
  - *Why it fails:* L221 का text-[13px] चिप 15px कैप्शन-फ़्लोर से नीचे — बिना चश्मे अपठनीय।
  - *Fix:* चिप टेक्स्ट 15px+ करें।

**✅ CHECK FOR ISJ:** asli phone par TTS: kya voiceIntro "नई बुकिंग। {puja} की बुकिंग। कुल कमाई {X} रुपये।" garmजोशी se, saaf devanagari uchcharan me bolta hai — ya robotic lagta hai?

---

### स्वीकार-उत्सव overlay

- **Route:** `/bookings/[id]/request (showAccepted state)`
- **How to reach:** request पेज पर स्वीकार करने के बाद तुरंत CelebrationOverlay आता है, फिर 3.2s में या tap पर /bookings/[id] पर जाता है।
- **Visual (canon):** frame 26 (celebration) in `design/canon/हमारे पंडित जी.dc.html`

**रामेश्वर का पल:** बड़ा हरा ✓, फूल गिरते हुए, "बुकिंग स्वीकार! 🎉" और "…की पूजा अब आपकी है" — मन खुश हुआ। नीचे ₹ में मेरी कमाई भी दिखी, पर शीर्षक से छोटी। शिष्य ने बधाई भी बोली — अच्छा लगा।

**Findings:**

- **पP2 _(NEW-REQ candidate)_** — कमाई का ₹ (24px) शीर्षक (30px) से छोटा — पैसा उत्सव का हीरो नहीं
  - *Why it fails:* CelebrationOverlay में title 30px (L95) और amount 24px (L99-102)। यह पैसे का पल है, पर रामेश्वर की आँख पहले शीर्षक पर जाती है; जो रक़म उसे मिलेगी वह दूसरे दर्जे पर। "मेरा पैसा कहाँ है" — दिखता तो है पर सबसे बड़ा नहीं।
  - *Fix:* accept-celebration पर कमाई की रक़म को शीर्षक जितना या बड़ा (28-34px) करें, ताकि स्वीकार का सबसे बड़ा इनाम पैसा दिखे।

**✅ CHECK FOR ISJ:** asli phone par: kya petals-drift + badge scale-spring animation aur shishya ki बधाई-line milkar sach me utsav-jaisा joyful lagti hai (na ki jaldi-jaldi nikal jaane wali flash)?

---

### बुकिंग विवरण — यात्रा टाइमलाइन

- **Route:** `/bookings/[id]`
- **How to reach:** स्वीकार के बाद यहीं आता है। seed भिन्न sub-states: status=ACCEPTED journeyStep=0 (घर से निकले बटन), =1 (पहुँचे), =2 (शुरू), =3 (पूजा संपन्न बटन)। कॉल/रास्ता के लिए customer.phone और venueAddress भरे हों।
- **Visual (canon):** frame 10/14 (booking-detail) in `design/canon/हमारे पंडित जी.dc.html`

**रामेश्वर का पल:** ऊपर "बुकिंग स्थिति: स्वीकृत" — हिंदी में, अच्छा। ग्राहक का नाम, बड़े बटन "📞 फ़ोन करें" और "🗺️ रास्ता दिखाएं"। नीचे यात्रा की सीढ़ी — स्वीकृत ✅, फिर केसरी बटन "घर से निकले"। शिष्य ने बस "बुकिंग विवरण" बोला, पर अभी मुझे क्या करना है यह नहीं बताया — बटन खुद ही देख कर समझा।

**Findings:**

- **पP2 _(NEW-REQ candidate)_** — स्क्रीन-आगमन पर शिष्य अगला काम नहीं बताता — सिर्फ़ "बुकिंग विवरण। {पूजा}।"
  - *Why it fails:* screenVoiceText = "बुकिंग विवरण। {puja}।" (L226) — यह वर्तमान यात्रा-कदम ("निकलने पर केसरी बटन दबाएँ") को नहीं बोलता। journey-कदम की आवाज़ सिर्फ़ काम के बाद बजती है (L143-150)। पहली-बार वाले रामेश्वर के लिए मार्गदर्शन पतला — वह केसरी बटन देख कर अनुमान लगाता है, पर मौन में झिझक सकता है।
  - *Fix:* screenVoiceText में वर्तमान journeyStep के अनुसार अगला काम जोड़ें: step0 → "घर से निकलने पर नीचे केसरी बटन दबाइए", step3 → "पूजा पूरी होने पर हरा बटन दबाइए"।

**✅ CHECK FOR ISJ:** asli phone par: kya "🗺️ रास्ता दिखाएं" geo: link Samsung Galaxy A12 par sach me maps app kholta hai (na ki blank/त्रुटि), taaki Rameshwar ko yajman ka ghar mil jaaye?

---

### पूजा-संपन्न सफलता स्क्रीन

- **Route:** `/bookings/[id] (showSuccessScreen state)`
- **How to reach:** journeyStep=3 वाली ACCEPTED booking पर "🙏 पूजा संपन्न हुई" → confirm हाँ → यह पूर्ण-स्क्रीन उत्सव। ringBellAfterSpeech घंटी बजाता है।
- **Visual (canon):** frame 26 (celebration / puja-sampann) in `design/canon/हमारे पंडित जी.dc.html`

**रामेश्वर का पल:** पूरी स्क्रीन पर बहुत बड़ा 🙏, फिर "पूजा संपन्न!", "आपकी सेवा सफल रही" — शिष्य बोला और घंटी बजी, मन भर आया। पर जो पैसा मैंने कमाया वह छोटे अक्षरों में नीचे — मेरी आँख पहले हाथ-जोड़े चिन्ह और शीर्षक पर जाती है। मेरी मेहनत का पैसा सबसे बड़ा क्यों नहीं?

**Findings:**

- **पP1 _(NEW-REQ candidate)_** — कमाई का ₹ सिर्फ़ 19px — 120px 🙏 इमोजी और 30px शीर्षक के सामने दब गया; काम-के-अंत का पैसा हीरो नहीं
  - *Why it fails:* success स्क्रीन में 🙏 120px (L237), शीर्षक 30px (L238-240), पर "₹X जल्द ही आपके खाते में आएगा" सिर्फ़ 19px (L242-244)। यह पूरी यात्रा का भुगतान-पल है — "मेरा पैसा कहाँ है" का सीधा जवाब — पर रक़म तीसरी-सबसे-छोटी चीज़ है। रामेश्वर को उसकी कमाई प्रमुखता से नहीं दिखती; भरोसा और खुशी कमज़ोर होती है।
  - *Fix:* कमाई की रक़म को स्क्रीन की सबसे बड़ी टेक्स्ट-चीज़ बनाएँ (34-40px, leaf-700, MoneyCount एनिमेशन)। 🙏 छोटा करें या रक़म के ऊपर रखें; "जल्द ही आपके खाते में आएगा" उपशीर्षक रहे।
- **पP2 _(NEW-REQ candidate)_** — "होम पर जाएं" में "होम" — अंग्रेज़ी शब्द का देवनागरी लिप्यंतरण
  - *Why it fails:* strings goToHome="होम पर जाएं" (L431), बटन L247-253। "होम" अंग्रेज़ी "home" है; रामेश्वर देवनागरी अक्षर पढ़ लेगा पर अर्थ अपरिचित — अन्य जगह "मुख्य पन्ना"/"घर" जैसा शब्द बेहतर।
  - *Fix:* "मुख्य पन्ने पर जाएं" या "घर स्क्रीन पर जाएं" करें — "होम" शब्द से बचें।

**✅ CHECK FOR ISJ:** asli phone par: kya ringBellAfterSpeech ki ghanti sach me shishya ki completion-line KHATAM hone ke BAAD bajti hai (blessing) — na ki uski awaaz ke ऊपर (glitch jaisा)?

---

## Journey 6 · कमाई → 'मेरा पैसा कहाँ है'

### कमाई — लोड होते समय (DiyaLoader)

- **Route:** `/earnings`
- **How to reach:** pilot login 9876500050 / 123456 → होम → नीचे 'कमाई' टैब दबाएँ। यह अवस्था तब दिखती है जब तीन API (earnings/summary, payouts?PENDING, payouts?PAID) एक साथ लोड हो रहे हों — Fast-3G/patchy Jio पर कई सेकंड। localStorage खाली रखें।
- **Visual (canon):** frame 28 (loading) in `design/canon/हमारे पंडित जी.dc.html`

**रामेश्वर का पल:** मैंने 'कमाई' दबाया — मेरा सबसे बड़ा सवाल यही है, मेरा पैसा कहाँ है। पर अभी सिर्फ़ एक दीया घूम रहा है, चुप्पी है। शिष्य कुछ नहीं बोल रहा। जियो धीमा है, मैं इंतज़ार करता हूँ और सोचता हूँ — कहीं अटक तो नहीं गया?

**Findings:**

- **पP2 _(NEW-REQ candidate)_** — पैसे की स्क्रीन खुलते ही घूमता दीया, पूरी चुप्पी — शिष्य एक शब्द नहीं बोलता जब तक तीनों API लोड न हों।
  - *Why it fails:* earnings/page.tsx:106-108 लोडिंग में सिर्फ़ <DiyaLoader/> लौटाता है; Narrate/DashboardVoiceNav तभी माउंट होते हैं जब loading=false (line 124-126)। धीमे नेटवर्क पर वह पैसे की स्क्रीन पर कई सेकंड मौन में बैठा रहता है — जहाँ उसे सबसे ज़्यादा भरोसे की आवाज़ चाहिए।
  - *Fix:* DiyaLoader के साथ एक हल्की आवाज़/लाइन तुरंत बजे — जैसे 'एक पल पंडित जी, आपकी कमाई का हिसाब ला रहा हूँ' — ताकि पैसे की स्क्रीन कभी चुप न मिले।

**✅ CHECK FOR ISJ:** Fast-3G पर असली फ़ोन पर — क्या दीया-लोडर तीन सेकंड से ज़्यादा चुप रहता है, इतना कि रामेश्वर को लगे स्क्रीन अटक गई?

---

### कमाई — खाली (कोई payout नहीं)

- **Route:** `/earnings`
- **How to reach:** pilot login → कमाई टैब। यह अवस्था तब जब pandit के कोई PENDING और कोई PAID payout न हों (नया/कोई पूजा पूरी नहीं की pandit)। seed: payouts खाली रखें।
- **Visual (canon):** frame 27 (empty) / 19 (earnings) in `design/canon/हमारे पंडित जी.dc.html`

**रामेश्वर का पल:** स्क्रीन पर एक सिक्का 🪙 और लिखा है 'कमाई यहाँ दिखेगी', 'पहली पूजा का इंतज़ार है — दीया जल रहा है'। ऊपर बड़ा हरा कार्ड ₹० दिखा रहा है। ठीक है, समझ गया — अभी कुछ नहीं कमाया। यह वाला हिस्सा साफ़ है।

**Findings:**

- **पP2 _(NEW-REQ candidate)_** — खाली स्क्रीन पर शिष्य बोलता है 'आने वाली राशि दो से तीन दिन में आपके खाते में पहुँचती है' — जबकि अभी कोई राशि है ही नहीं।
  - *Why it fails:* introVoice (strings.ts:476) हर बार माउंट पर बजता है, चाहे payout सूची खाली हो (earnings/page.tsx:125)। खाली अवस्था में यह लाइन झूठी-सी लगती है और भरोसे को हल्का हिला सकती है — 'कौन-सी राशि? मेरा तो कुछ नहीं है।'
  - *Fix:* खाली अवस्था के लिए अलग introVoice — 'अभी कोई कमाई नहीं है पंडित जी; पहली पूजा पूरी होते ही यहाँ पैसा दिखेगा।' भरी सूची पर ही '2-3 दिन में खाते में' वाली लाइन बजे।

**✅ CHECK FOR ISJ:** असली कान पर — खाली कमाई स्क्रीन पर '2-3 दिन में आपके खाते में' सुनकर क्या रामेश्वर उलझता है कि कौन-सा पैसा आ रहा है?

---

### कमाई — भरी हुई (मिल गया + आना बाकी सूची)

- **Route:** `/earnings`
- **How to reach:** pilot login → कमाई टैब। चाहिए कम-से-कम एक PAID और एक PENDING payout। seed/admin: /pandit/payouts में एक status=PAID (paidAt पुराना, ताकि 'ताज़ा भुगतान' बैनर न चले) और एक status=PENDING पंक्ति बनाएँ; earnings/summary में month>0, pendingPayout>0।
- **Visual (canon):** frame 19 (earnings) in `design/canon/हमारे पंडित जी.dc.html`

**रामेश्वर का पल:** ऊपर बड़ा हरा कार्ड — 'इस महीने की कमाई' और नीचे मोटे सफ़ेद अंकों में रकम, यह सबसे बड़ी चीज़ है, अच्छा लगा। नीचे '💰 मिल गया' में हरी रकमें, फिर '⏳ आना बाकी'। पर मेरा असली सवाल — जो पैसा बचा है, बाकी है, वो कब आएगा? — उसकी रकम सबसे छोटी लिखी है, और कहीं यह नहीं लिखा 'दो-तीन दिन में', न यह कि पैसा कैसे आएगा।

**Findings:**

- **पP1 _(F35-02)_** — जो पैसा उसे मिलना बाकी है ('आना बाकी') उसकी कुल रकम सबसे छोटे अक्षरों (15px) में है — 'मिल गया' की पंक्तियों की रकम (18px) और महीने के हीरो (46px) से छोटी।
  - *Why it fails:* earnings/page.tsx:196-197 — 'आना बाकी' का MoneyCount text-[15px] है, जबकि यही वह चिंता का पैसा है जिसे वह ढूँढ़ने आया ('मेरा बाकी पैसा कहाँ है')। स्क्रीन का सबसे अहम अनुत्तरित सवाल सबसे छोटे फ़ॉन्ट में दबा है।
  - *Fix:* 'आना बाकी' की कुल रकम को कम-से-कम 'मिल गया' पंक्तियों जितना बड़ा (18-22px, brassdark) करें, अलग कार्ड में — ताकि 'कितना पैसा अभी आना है' एक नज़र में सबसे साफ़ दिखे।
- **पP1 _(NEW-REQ candidate)_** — स्क्रीन पर कहीं नहीं लिखा कि पैसा कब (2-3 दिन) और कैसे (UPI/बैंक में) आएगा — यह जानकारी सिर्फ़ शुरू में एक बार शिष्य की आवाज़ में बजती है।
  - *Why it fails:* 'कब मिलेगा' का उत्तर केवल introVoice (strings.ts:476) में है; दिखने वाला टेक्स्ट सिर्फ़ 'आना बाकी'/'मिल गया' है (earnings/page.tsx:164-198)। TTS चूक गया या शोर में सुनाई न दिया, तो स्क्रीन उसके सबसे बड़े सवाल — कब और कैसे — का कोई लिखित जवाब नहीं देती। 'कैसे' (UPI/बैंक, संस्थापक द्वारा मैनुअल) कहीं भी नहीं, न आवाज़ में न स्क्रीन पर।
  - *Fix:* 'आना बाकी' कार्ड के नीचे स्थायी देवनागरी पंक्ति — 'पूजा के बाद 2-3 दिन में सीधे आपके बैंक/UPI में आ जाता है' — लिखी हुई दिखे, सिर्फ़ आवाज़ में नहीं।
- **पP1 _(NEW-REQ candidate)_** — पैसे के आने का समय पूरे ऐप में अलग-अलग बताया गया है — कमाई की आवाज़ '2-3 दिन', FAQ '48 घंटे', बुकिंग पूरी होने पर 'जल्द ही'।
  - *Why it fails:* introVoice='दो से तीन दिन' (strings.ts:476) बनाम faq money='48 घंटे के अंदर' (strings.ts:693) बनाम completeVoice='जल्द ही' (strings.ts:465)। पैसे को लेकर शक्की पंडित को अलग-अलग समय सुनकर लगेगा कि कोई पक्का जवाब नहीं — भरोसा टूटता है।
  - *Fix:* एक ही समय-वाक्य तय करें (जैसे '48 घंटे') और तीनों जगह — कमाई-आवाज़, FAQ, पूजा-पूर्ण-आवाज़ — बिल्कुल वही शब्द रखें।
- **पP2 _(NEW-REQ candidate)_ · **NEEDS ISJ ON DEVICE**** — 'मिल गया' बनाम 'आना बाकी' का फ़र्क़ सिर्फ़ छोटे 15px शीर्षक, इमोजी (💰/⏳) और हल्के हरे/सुनहरे रंग से है — बिना चश्मे के दो ₹ सूचियों में अंतर करना कठिन।
  - *Why it fails:* earnings/page.tsx:164 व 195 — दोनों सूचियों की पंक्तियाँ लगभग एक जैसी (18px रकम), भेद केवल रंग व 15px हेडर। 64-वर्षीय बिना चश्मे, आर्म-लेंथ पर हरी-बनाम-पीतल रकम में फ़र्क़ नहीं पकड़ पाता — कौन-सा पैसा उसके हाथ आ गया, कौन-सा अभी नहीं, यह गड़बड़ा सकता है।
  - *Fix:* हर पंक्ति पर छोटा देवनागरी टैग जोड़ें — 'मिल गया ✓' / 'आना बाकी ⏳' — रकम के पास, ताकि रंग पर निर्भरता न रहे।

**✅ CHECK FOR ISJ:** असली फ़ोन पर आर्म-लेंथ, बिना चश्मे — क्या रामेश्वर 'मिल गया' की हरी रकम और 'आना बाकी' की पीतल रकम में सिर्फ़ रंग से फ़र्क़ पकड़ पाता है?

---

### कमाई — 'ताज़ा भुगतान' बैनर (payout moment)

- **Route:** `/earnings`
- **How to reach:** pilot login → कमाई टैब, पर एक PAID payout जिसका paidAt, localStorage 'lastSeenPaidAt' से नया हो (localStorage साफ़ करें या पुराना मान रखें)। seed: admin से एक payout PENDING→PAID अभी-अभी करें, फिर स्क्रीन खोलें।
- **Visual (canon):** frame 26 (celebration) / 19 in `design/canon/हमारे पंडित जी.dc.html`

**रामेश्वर का पल:** जैसे ही स्क्रीन खुली, घंटी बजी 🔔, ऊपर 🙏 के साथ बड़े हरे अंकों में रकम चढ़ी और शिष्य बोला — 'पंडित जी, इतने रुपये आपके खाते में भेज दिए गए हैं, धन्यवाद।' यह अच्छा लगा, यही तो सुनना था। मेरा पैसा आ गया, साफ़-साफ़ बताया गया।

**Findings:**

- **पP2 _(NEW-REQ candidate)_ · **NEEDS ISJ ON DEVICE**** — यह पल सही बना है — बड़ी रकम (26px), 🙏, घंटी, और साफ़ देवनागरी आवाज़ 'आपके खाते में भेज दिए गए हैं'। कोई अंग्रेज़ी नहीं, पैसा सबसे बड़ा। कोई P0/P1 दोष नहीं।
  - *Why it fails:* earnings/page.tsx:130-140 + paidVoice (strings.ts:481) — रकम MoneyCount 26px, बैनर देवनागरी, playChime। यह सकारात्मक पुष्टि है; केवल दर्ज कर रहा हूँ कि यह सही है।
  - *Fix:* कोई बदलाव ज़रूरी नहीं। छोटी बात: बैनर में यह भी जुड़ सकता है कि 'किस पूजा का' पैसा आया, ताकि वह मिलान कर सके।

**✅ CHECK FOR ISJ:** असली स्पीकर पर — क्या paidVoice की गर्माहट और घंटी सचमुच 'आपका पैसा आ गया' वाली खुशी और भरोसा जगाती है (यांत्रिक नहीं लगती)?

---

### मेरी प्रोफ़ाइल (profile-view, दक्षिणा दिखती है)

- **Route:** `/profile-view`
- **How to reach:** pilot login → सेटिंग → प्रोफ़ाइल पंक्ति (या सीधे /profile-view; बॉटम-नैव में प्रोफ़ाइल टैब नहीं)। दिखने के लिए /auth/me में panditProfile चाहिए, दक्षिणा तालिका के लिए dakshinaRates या pujaServices चाहिए। स्टैट कार्ड /pandit/stats से।
- **Visual (canon):** frame 24 (profile) in `design/canon/हमारे पंडित जी.dc.html`

**रामेश्वर का पल:** शिष्य ने सिर्फ़ इतना कहा — 'मेरी प्रोफ़ाइल' — और चुप। मेरा नाम, फ़ोटो का पहला अक्षर, शहर, फिर मेरी दक्षिणा की सूची ₹ के साथ दिख रही है। मैंने दक्षिणा की रकम पर उँगली रखी कि बदल दूँ — कुछ नहीं हुआ। कोई नहीं बता रहा यह बदलेगा कैसे। नीचे बहुत छोटा-सा लिखा है 'बदलाव के लिए सहायता को फ़ोन करें', वो मुझे दिखा ही नहीं।

**Findings:**

- **पP1 _(F02-06)_** — इस स्क्रीन पर शिष्य सिर्फ़ शीर्षक 'मेरी प्रोफ़ाइल' बोलकर चुप हो जाता है — न बताता है यह स्क्रीन क्या है, न कि दक्षिणा यहाँ बदली नहीं जा सकती।
  - *Why it fails:* profile-view/page.tsx:74 पर Narrate text सिर्फ़ profileView.title है, और यहाँ DashboardVoiceNav बिल्कुल नहीं (earnings/calendar से अलग)। कोई helpLine नहीं, कोई voice-command रजिस्ट्री नहीं, दोबारा सुनने का कोई तरीक़ा नहीं। पैसे (दक्षिणा) वाली स्क्रीन लगभग मौन है — रामेश्वर लटका रह जाता है 'अब क्या करूँ?'।
  - *Fix:* profile-view पर भी DashboardVoiceNav + भरी हुई Narrate जोड़ें — 'पंडित जी, यह आपकी प्रोफ़ाइल है जो ग्राहक देखते हैं; आपकी दक्षिणा यहाँ दिखती है, बदलने के लिए नीचे सहायता को फ़ोन कीजिए।'
- **पP1 _(NEW-REQ candidate)_** — दक्षिणा की रकमें दिखती हैं पर छूने पर कुछ नहीं होता — कहीं (न आवाज़, न दिखने में) यह नहीं बताया कि यह स्क्रीन सिर्फ़-देखने की है।
  - *Why it fails:* profile-view/page.tsx:166-180 दक्षिणा तालिका पढ़ने-भर की है; बदलाव का एकमात्र संकेत सबसे नीचे 16px की हल्की-धूसर अंडरलाइन लाइन 'बदलाव के लिए सहायता को फ़ोन करें' (line 182-187) है। पैसे को लेकर शक्की पंडित रकम पर टैप करता है, कुछ नहीं होता, और उसे यह मूक-अंत लगता है — 'मेरी दक्षिणा फँस गई, बदल ही नहीं सकता'।
  - *Fix:* दक्षिणा कार्ड के शीर्ष पर स्पष्ट देवनागरी पंक्ति — 'दक्षिणा बदलनी हो तो 🛕 मेरी पूजाएँ में जाएँ या सहायता को फ़ोन करें' — और रकम पर टैप करने पर वही बात आवाज़ में बोले, बजाय चुप रहने के।
- **पP2 _(NEW-REQ candidate)_ · **NEEDS ISJ ON DEVICE**** — तीन स्टैट कार्ड ('पूजाएँ', 'बुकिंग', 'साल अनुभव') के लेबल 13px में हैं — काया-मानक 15px से नीचे।
  - *Why it fails:* profile-view/page.tsx:122,128,134 — लेबल text-[13px]। बिना चश्मे रामेश्वर के लिए यह पढ़ने की सीमा से नीचे है; बड़ी संख्या तो दिखती है पर वह किस चीज़ की गिनती है, वह लेबल धुँधला है।
  - *Fix:* स्टैट लेबल 15px+ करें (नंबर 24px के साथ अनुपात बना रहेगा)।

**✅ CHECK FOR ISJ:** असली फ़ोन पर — क्या रामेश्वर बिना सुने समझ पाता है कि प्रोफ़ाइल सिर्फ़-देखने की है, या वह दक्षिणा रकम पर टैप करके अटक जाता है क्योंकि कुछ नहीं बोलता?

---

### मेरा कैलेंडर (दिन दबाकर छुट्टी लगाना)

- **Route:** `/calendar`
- **How to reach:** pilot login → कमाई/होम → नीचे 'कैलेंडर' टैब। ग्रिड हमेशा दिखता है। बुकिंग-वाले दिन (● नारंगी) देखने के लिए ACCEPTED/IN_PROGRESS बुकिंग seed करें; छुट्टी टॉगल के लिए किसी भविष्य के दिन पर दबाएँ (POST /pandit/blocked-dates)।
- **Visual (canon):** frame 20 (calendar) in `design/canon/हमारे पंडित जी.dc.html`

**रामेश्वर का पल:** ऊपर लिखा 'तारीख दबाकर छुट्टी लगाएँ'। महीना दिख रहा है, ऊपर र सो मं बु गु शु श — ये अकेले अक्षर क्या हैं? मैंने एक तारीख़ पर दबाया अगले हफ़्ते की — डिब्बा हल्का धूसर हुआ, कोई नन्हा ✕ आया, पर शिष्य कुछ नहीं बोला। लगा दी छुट्टी या नहीं? मेरी मोटी उँगली से बग़ल का डिब्बा भी दब सकता था। अगर ग़लत दिन बंद हो गया तो उस दिन की बुकिंग-कमाई चली जाएगी।

**Findings:**

- **पP1 _(NEW-REQ candidate)_ · **NEEDS ISJ ON DEVICE**** — दिन के डिब्बे 48×48px हैं — काया-मानक 52px से छोटे — और ग़लत दिन दबने का सीधा असर पैसे पर है (ग़लत छुट्टी = उस दिन बुकिंग बंद = कमाई गई)।
  - *Why it fails:* calendar/page.tsx:276,285 — बटन w-12 h-12 (48px), minWidth/minHeight 48px। मोटी उँगली, बिना चश्मे, शोरगुल — पास-पास के 48px डिब्बों में मिस-टैप आसान, और मिस-टैप गलत दिन को छुट्टी कर देता है जिससे आमदनी का नुक़सान।
  - *Fix:* दिन-डिब्बे कम-से-कम 52-56px करें, बीच का अंतर बढ़ाएँ ताकि मोटी उँगली से भी सही डिब्बा दबे।
- **पP1 _(F02-06)_** — किसी दिन को छुट्टी लगाने/हटाने पर सफलता की कोई आवाज़ नहीं — शिष्य केवल गड़बड़ी पर बोलता है, सही होने पर चुप।
  - *Why it fails:* calendar/page.tsx:152-200 — सफल POST/DELETE पर कोई speak() नहीं; केवल error पर toast+speak (line 194-199)। एकमात्र दृश्य पुष्टि 9px का ✕ और हल्का धूसर रंग है (line 293-295)। पैसे को प्रभावित करने वाली कार्रवाई के बाद मौन — शक्की पंडित को यक़ीन नहीं होता कि हुआ या नहीं; यह 'no silent acceptance' नियम का उल्लंघन है।
  - *Fix:* सफल टॉगल पर आवाज़ में पुष्टि — 'ठीक है पंडित जी, [तारीख़] को छुट्टी लगा दी' / '...छुट्टी हटा दी' — और एक साफ़ देवनागरी टोस्ट।
- **पP2 _(NEW-REQ candidate)_ · **NEEDS ISJ ON DEVICE**** — हर दिन की स्थिति (बुकिंग ● / छुट्टी ✕) सिर्फ़ 9px के नन्हे चिह्न और हल्के रंग-भेद से दिखती है — आर्म-लेंथ पर पहचानना असंभव।
  - *Why it fails:* calendar/page.tsx:290-295 — ● और ✕ text-[9px]; अंतर मुख्यतः बैकग्राउंड रंग (नारंगी/धूसर/क्रीम) पर। 64-वर्षीय बिना चश्मे यह भेद नहीं पकड़ पाता — कौन-सा दिन बुक है, कौन बंद, कौन खाली, गड्डमड्ड हो जाता है।
  - *Fix:* स्थिति-चिह्न बड़े करें (कम-से-कम 12-14px) और रंग के साथ-साथ अलग आकार/इमोजी (जैसे बुकिंग 🔔, छुट्टी 🚫) दें ताकि रंग पर निर्भरता न रहे।
- **पP2 _(NEW-REQ candidate)_ · **NEEDS ISJ ON DEVICE**** — सप्ताह-शीर्ष 12px के अकेले अक्षर (र सो मं बु गु शु श), निर्देश-पंक्ति 14px, लेजेंड 13px — सभी 15px लेबल-मानक से नीचे।
  - *Why it fails:* calendar/page.tsx:251 (weekday text-[12px]), :212 (hint text-[14px]), :303 (legend text-[13px])। अकेले अक्षर 'श' बनाम 'शु' रामेश्वर के लिए वैसे भी उलझाऊ, और 12-14px उसकी पढ़ने की सीमा से नीचे।
  - *Fix:* सप्ताह-शीर्ष कम-से-कम 15px, दो-अक्षरी (रवि, सोम...) या स्पष्ट; hint व legend 15-16px।
- **पP2 _(NEW-REQ candidate)_** — छुट्टी टॉगल के बीच फ़ोन-कॉल/नेटवर्क-ड्रॉप आ जाए तो — optimistic UI पहले बदल देता है, फिर POST। कॉल के बाद उसे पता नहीं चलेगा सर्वर पर लगा या नहीं।
  - *Why it fails:* calendar/page.tsx:171-199 — पहले setBlockedDates (दिखने में बदल जाता है), फिर mutateOnce। अगर वह टैप के तुरंत बाद कॉल उठा ले और ऐप बैकग्राउंड/ड्रॉप हो, तो दृश्य 'छुट्टी लगी' दिखेगा पर सर्वर-पुष्टि अनिश्चित; लौटने पर सफलता की कोई आवाज़ न होने से (ऊपर वाला दोष) वह भरोसा नहीं कर पाता।
  - *Fix:* सफल-पुष्टि आवाज़ (ऊपर) के अलावा, लौटने पर स्थिति सर्वर से ताज़ा दिखे; ड्रॉप की सूरत में साफ़ देवनागरी में बताए 'छुट्टी अभी लगी नहीं — दोबारा दबाएँ'।

**✅ CHECK FOR ISJ:** असली फ़ोन पर, मोटी उँगली से — क्या 48px डिब्बे में रामेश्वर बिना बग़ल का दिन छुए सही तारीख़ दबा पाता है, और क्या छुट्टी लगने पर उसे यक़ीन होता है कि लग गई?

---

## Journey 7 · SOS · मदद · सेटिंग · किनारे के हालात

### SOS / आपातकालीन सहायता (the reachable one)

- **Route:** `/emergency-sos`
- **How to reach:** Pilot login 9876500050 / 123456 → on होम say "मदद" (voice command, home/page.tsx:332) OR settings → मदद → tap the red "🆘 आपातकाल" button (help/page.tsx:117) → /emergency-sos. No direct URL button on any core screen.
- **Visual (canon):** frame 25 (sos) in `design/canon/हमारे पंडित जी.dc.html`

**रामेश्वर का पल:** स्क्रीन खुली — बीच में बड़ा नारंगी गोल बटन, ऊपर 🆘, नीचे 'सहायता बुलाएँ'। एक आवाज़ कहती है 'घबराएँ नहीं… बीच का लाल बटन दबाकर रखें।' मैं जैसे बाकी हर बटन दबाता हूँ वैसे दबाता हूँ — उँगली हटते ही कुछ नहीं होता। बटन के नीचे बहुत छोटे अक्षर हैं जो मुझे इस रोशनी में दिखते ही नहीं।

**Findings:**

- **पP0 _(NEW-REQ candidate)_** — यह अकेली असली SOS स्क्रीन किसी भी मुख्य पन्ने (होम/बुकिंग/कमाई/कैलेंडर/सेटिंग्स) से एक बटन में नहीं खुलती — घबराहट में मुझे 'मदद' बोलकर या सेटिंग से जाकर, फिर लाल आपातकाल दबाना पड़ता है।
  - *Why it fails:* Emergency reachable only 2-3 hops deep and largely via the VOICE command "मदद" on home (home/page.tsx:332). The one floating global SOS widget is orphaned (see next screen), so core screens have no visible panic button. A 64-year-old in genuine distress cannot navigate multiple screens.
  - *Fix:* मुख्य हर स्क्रीन पर ऊपर/किनारे एक स्थायी लाल '🆘 मदद' बटन (≥56px) जो सीधे /emergency-sos खोले — बिना आवाज़ की ज़रूरत के।
- **पP1 _(NEW-REQ candidate)_ · **NEEDS ISJ ON DEVICE**** — बटन एक बार दबाने से कुछ नहीं होता — इसे 'दबाकर रखना' पड़ता है (1.2 सेकंड)। यह तरीक़ा मैंने ज़िंदगी में कभी इस्तेमाल नहीं किया; बाकी पूरे ऐप में हर बटन एक ही छुअन से चलता है।
  - *Why it fails:* Long-press hold-to-fire (HOLD_MS=1200, EmergencySOS.tsx:16, startHold) is inconsistent with every other one-tap control in the app and is an unfamiliar gesture for an elderly WhatsApp-voice-only user. Taught only by the spoken line; if TTS fails or he taps as usual, nothing fires in an emergency.
  - *Fix:* आपात बटन को एक-छुअन रखें (सुरक्षा > accidental-tap का डर यहाँ उल्टा है), या दबाते ही स्पष्ट आवाज़ 'दबाए रखिए…' चले और भरता घेरा बहुत बड़ा/साफ़ हो।
- **पP1 _(NEW-REQ candidate)_ · **NEEDS ISJ ON DEVICE**** — बटन के नीचे लिखा 'दबाकर रखें' इतना छोटा है कि बिना चश्मे, धूप में मुझे पढ़ा ही नहीं जाता — और यही अकेला लिखित इशारा है कि बटन दबाकर रखना है।
  - *Why it fails:* The "दबाकर रखें" caption is text-[14px] (EmergencySOS.tsx, below the button) — under the 15px label floor. It is the only WRITTEN cue for the hold gesture.
  - *Fix:* इशारे का लेबल ≥18px, बोल्ड, ज़्यादा कंट्रास्ट में; और भरते घेरे को और स्पष्ट बनाएँ ताकि दबाव 'काम कर रहा है' दिखे।

**✅ CHECK FOR ISJ:** On the real A12 in courtyard glare: does the spoken line 'बीच का लाल बटन दबाकर रखें' clearly land as HOLD (not tap), and does the white fill-ring visibly grow over the 1.2s so he can SEE the hold registering?

---

### SOS floating button + /emergency (the worse, English-laden version)

- **Route:** `/emergency`
- **How to reach:** Would appear via the bottom-right floating 'SOS' widget (EmergencySOSFloating.tsx) — but that widget is mounted ONLY by GlobalOverlayProvider/AppOverlays and app/(public) + app/dashboard layouts, none of which wrap the pilot (dashboard-group)/(auth) pandit routes. Those providers are imported nowhere in app/.
- **Visual (canon):** frame 25 (sos) in `design/canon/हमारे पंडित जी.dc.html`
- **⚠ UNREACHABLE IN PROD:** The floating SOS (the only thing that router.push('/emergency')) is rendered by EmergencySOSFloating, which the pilot pandit layouts — (dashboard-group)/layout.tsx (only NetworkBanner+children) and (auth)/layout.tsx — do NOT mount; GlobalOverlayProvider/AppOverlays are imported nowhere under app/. So on the live pandit screens neither this button nor /emergency is reachable today. It remains a live English landmine if ever re-wired, and it duplicates/diverges from the good /emergency-sos. — *this is itself a finding.*

**रामेश्वर का पल:** (अगर यह दिखे तो) नीचे दाएँ कोने में एक लाल गोल चीज़ है जिस पर तीन अंग्रेज़ी अक्षर 'SOS' लिखे हैं — मुझे नहीं पता यह क्या है, न मैं इसे पढ़ सकता हूँ। दबाता हूँ तो बटन बदल जाता है और दूसरा डिब्बा निकल आता है, फिर दुबारा दबाना पड़ता है।

**Findings:**

- **पP0 _(NEW-REQ candidate)_** — आपात बटन पर आराम की हालत में सिर्फ़ 'SOS' — तीन अंग्रेज़ी अक्षर — लिखे हैं। 🆘 चित्र तभी आता है जब मैं एक बार दबा दूँ। मैं तो पहली बार में यह पढ़ ही नहीं सकता कि यह मदद का बटन है।
  - *Why it fails:* EmergencySOSFloating.tsx:83 renders literal 'SOS' (English) as the resting label; 🆘 only appears after the first tap. English wall on the single safety control.
  - *Fix:* आराम की हालत में ही बड़ा 🆘 + देवनागरी 'मदद' दिखे; 'SOS' शब्द कहीं न हो।
- **पP1 _(NEW-REQ candidate)_** — एक बार दबाने पर बटन खुलता है और दूसरा बटन निकलता है; असली मदद के लिए मुझे दुबारा दबाना पड़ता है। घबराहट में मैं एक ही बार दबाकर छोड़ दूँगा और सोचूँगा हो गया।
  - *Why it fails:* Two-tap: onClick={isExpanded ? handleSOSPress : handleExpand} (EmergencySOSFloating.tsx:79) — first tap only expands, target changes between taps, second tap navigates. Under panic the affordance shifts.
  - *Fix:* एक ही निर्णायक क्रिया — एक दबाव सीधे मदद कॉल/स्क्रीन पर ले जाए।
- **पP1 _(NEW-REQ candidate)_** — आवाज़ खुद अंग्रेज़ी शब्द बोलती है — 'SOS बटन दबाया गया…' — और जगह न मिलने पर 'कृपया location permissions चेक करें' और 'Location supported नहीं है' — यह मेरे लिए बकवास है।
  - *Why it fails:* EmergencySOSFloating.tsx:20 speaks 'SOS बटन दबाया गया…'; (auth)/emergency/page.tsx geolocation-error paths speak 'कृपया location permissions चेक करें।' and 'Location supported नहीं है।' — शिष्य pronounces English 'SOS'/'location permissions'/'Location supported' aloud, exactly when he most needs to be reassured.
  - *Fix:* सारी बोली-लिखी पंक्तियाँ शुद्ध देवनागरी: 'मदद का बटन दबाया…', 'आपकी जगह नहीं मिल पाई, कोई बात नहीं — कॉल पर बता दीजिएगा'।

**✅ CHECK FOR ISJ:** Is the floating 'SOS' button actually rendered anywhere in the live pilot pandit build (open /home and /settings on device and look bottom-right)? If yes, it is the English one he'll find first.

---

### मदद hub (Help)

- **Route:** `/help`
- **How to reach:** Pilot login → होम say 'मदद' (home/page.tsx:332) or /settings → मदद row → /help. Auth-gated.
- **Visual (canon):** frame 23 (help) in `design/canon/हमारे पंडित जी.dc.html`

**रामेश्वर का पल:** 🤝 का बड़ा चित्र, 'कैसे मदद करें?' मोटे अक्षरों में — यह मुझे भला लगता है। नीचे कतार में डिब्बे: ट्यूटोरियल फिर देखें ▶️, हरा 'सहायता को कॉल करें · सुबह 8 – रात 10 · मुफ़्त', सामान्य सवाल ❓, और एक डिब्बा जिस पर 'WhatsApp' अंग्रेज़ी में लिखा है। सबसे नीचे लाल '🆘 आपातकाल'।

**Findings:**

- **पP2 _(NEW-REQ candidate)_** — एक डिब्बे पर 'WhatsApp पर पूछें' — 'WhatsApp' अंग्रेज़ी में लिखा है। हरे चित्र वाला ऐप मैं पहचानता हूँ पर यह लिखा शब्द नहीं पढ़ पाता।
  - *Why it fails:* help/page.tsx WhatsApp row title 'WhatsApp पर पूछें' — English word. Softened by the 💬 tile + Devanagari 'पर पूछें', so friction not a dead-end.
  - *Fix:* 'हरे ऐप पर संदेश भेजें' या WhatsApp का असली हरा आइकन + देवनागरी उपशीर्षक।
- **पP2 _(F02-11)_** — कॉल वाला डिब्बा हमेशा 'सुबह 8 – रात 10' दिखाता है, पर अगर मैं रात 11 बजे दबाऊँ तो कुछ नहीं बताता कि अभी बंद है और कब कॉल आएगा।
  - *Why it fails:* Off-hours support path (F02-11) not implemented — the tel: link fires regardless of hours; no expected-callback-time or async WhatsApp fallback when outside 8–10.
  - *Fix:* समय के बाहर टैप पर देवनागरी में 'अभी टीम आराम पर है — सुबह 8 बजे कॉल कीजिए, या हरे ऐप पर लिख छोड़िए, जवाब आएगा' दिखाएँ/बोलें।

**✅ CHECK FOR ISJ:** Does शिष्य's opening line 'कैसे मदद करें? हमारी टीम तैयार है।' actually play warmly on entry, so a lost pandit immediately hears a human offer of help?

---

### सामान्य सवाल (FAQ)

- **Route:** `/help/faq`
- **How to reach:** Pilot login → /help → tap 'सामान्य सवाल' (help/page.tsx router.push('/help/faq')).
- **Visual (canon):** frame 23 (help) in `design/canon/हमारे पंडित जी.dc.html`

**रामेश्वर का पल:** 'सामान्य सवाल' — तीन ढेर: बुकिंग 📿, पैसे 💰, सत्यापन ✅। सवाल पर दबाता हूँ तो नीचे जवाब खुलता है। 'पैसा कब और कैसे मिलेगा?' दबाया — लिखा '48 घंटे के अंदर'। पर ट्यूटोरियल में शिष्य ने साफ़ '24 घंटे' कहा था। तो कब आएगा मेरा पैसा — 24 या 48?

**Findings:**

- **पP1 _(NEW-REQ candidate)_** — मेरे सबसे बड़े सवाल — पैसा कब आएगा — का जवाब ऐप में दो जगह दो अलग हैं। FAQ कहती है '48 घंटे', पर ट्यूटोरियल और शिष्य की बोली '24 घंटे' कहती है। मैं भरोसा किस पर करूँ?
  - *Why it fails:* faq item (strings.ts, money 'पैसा कब और कैसे मिलेगा?') answers '48 घंटे' while tutorial slide8 and shishyaFacts CURATED paymentWhen say '24 घंटे'. The faq.ts header comment claims 'every answer mirrors shishyaFacts CURATED_HI' — it does NOT. His single most anxious question ('मेरा पैसा कहाँ है / कब') gets contradictory answers.
  - *Fix:* एक ही सच्चाई — पूरे ऐप में payout समय एक जगह से आए (24 या 48, तय करके सब जगह वही)। FAQ, ट्यूटोरियल slide8, shishyaFacts एक स्रोत से बंधें।

**✅ CHECK FOR ISJ:** At arm's length in courtyard glare, is the 17px question text and 16px answer body comfortably readable, or does he have to lean in / give up?

---

### सेटिंग्स (Settings)

- **Route:** `/settings`
- **How to reach:** Pilot login → होम say 'सेटिंग' (home/page.tsx:336) or bottom-nav has no settings tab, so reached by voice or a home affordance → /settings. Auth-gated.
- **Visual (canon):** frame 22 (settings) in `design/canon/हमारे पंडित जी.dc.html`

**रामेश्वर का पल:** ऊपर 'सेटिंग्स' — यह शब्द मुझे अटपटा लगता है, अक्षर हिंदी के पर मतलब पकड़ में नहीं आता। कतार में: प्रोफ़ाइल देखें 👤, मेरी पूजाएँ 🛕, भाषा 🌐 (हिन्दी), घंटी की आवाज़ का एक गोल स्विच, और सबसे नीचे लाल डिब्बा 'लॉगआउट' 🚪 — मुझे नहीं पता 'लॉगआउट' मुझसे क्या करवाएगा।

**Findings:**

- **पP1 _(NEW-REQ candidate)_** — सबसे नीचे लाल डिब्बे पर 'लॉगआउट' लिखा है — यह अंग्रेज़ी शब्द है, बस हिंदी अक्षरों में। मुझे नहीं पता यह मुझे ऐप से बाहर कर देगा; उत्सुकता में दबा दूँ तो मेरा खाता बंद हो जाए।
  - *Why it fails:* settingsRows.logout = 'लॉगआउट' — English 'logout' transliterated, no meaning to a Devanagari-only elder. Tapping opens a confirm sheet but the button that wipes his session (purgeUserData clears drafts/stores) is labelled with a word he can't decode.
  - *Fix:* 'ऐप से बाहर निकलें' — शुद्ध देवनागरी, और पुष्टि पंक्ति भी वही शब्द इस्तेमाल करे।
- **पP2 _(NEW-REQ candidate)_ · **NEEDS ISJ ON DEVICE**** — पन्ने का शीर्षक 'सेटिंग्स' — अंग्रेज़ी 'settings' हिंदी में लिखा; अक्षर पढ़ लेता हूँ पर शब्द कुछ कहता नहीं।
  - *Why it fails:* settings.title = 'सेटिंग्स' is transliterated English. He can sound it out but it carries no meaning.
  - *Fix:* 'मेरी पसंद' या 'व्यवस्था'।
- **पP2 _(NEW-REQ candidate)_** — घंटी की आवाज़ के आगे एक गोल फिसलने वाला स्विच है — यह चीज़ मैंने पहले कभी नहीं छुई; देखकर पता नहीं चलता अभी चालू है या बंद।
  - *Why it fails:* Toggle switch UI is unfamiliar to a WhatsApp-voice-only user; no on/off WORD beside it, only the घंटी label. Current state not readable at a glance (only spoken after he flips it).
  - *Fix:* स्विच के आगे शब्द में 'चालू'/'बंद' दिखाएँ; या दो बड़े देवनागरी बटन।

**✅ CHECK FOR ISJ:** Does 'सेटिंग्स' read as a meaningful word to a Devanagari-only elder, or as unreadable English-in-Hindi-letters that makes him unsure he's on the right screen?

---

### आवाज़ दो-तीन बार फेल (VoiceField loop) — cross-cutting (a)

- **Route:** `/readiness (any step field) · /my-poojas/add (step 0 नाम)`
- **How to reach:** Pilot login → open any voice field (readiness step 1 or add-puja नाम). Speak something the parser rejects, or stay silent in noise, 2-3 times. Behaviour lives in VoiceField.tsx + voiceFieldMachine.ts.
- **Visual (canon):** frame no canon frame in `design/canon/हमारे पंडित जी.dc.html`

**रामेश्वर का पल:** मैं बोलता हूँ — समझ नहीं आया। शिष्य कहता है 'माफ़ कीजिए, समझ नहीं आया — फिर बोलें या नीचे लिख दें।' मैं फिर बोलता हूँ — अब कुछ नहीं कहता। तीसरी बार भी चुप। सुनहरा घेरा चमकता रहता है पर कोई मदद नहीं, कोई 'सहायता' बटन नहीं। लिखना मुझे आता नहीं। मैं फँस गया — शायद ऐप ख़राब है।

**Findings:**

- **पP0 _(F02-04)_ · **NEEDS ISJ ON DEVICE**** — पहली गलती पर एक बार माफ़ी बोलता है, फिर दूसरी-तीसरी-हर बार बिल्कुल चुप रहता है — न कोई नई बात, न लिखने का पन्ना खुलता है, न 'सहायता चाहिए' बटन आता है। जो बोल नहीं सकता, वह यहीं मर जाता है।
  - *Why it fails:* voiceFieldMachine.ts (LISTENING TRANSCRIPT branch): effects = n===1 ? ['SPEAK_SORRY_ONCE'] : ['START_LISTEN']. After ONE apology every further failure is a silent re-arm. Directly violates F02-04 (failure 3 → fallback line + keyboard auto-opens + 'सहायता चाहिए' button to support path) and F02-03 (distinct failure-2 line).
  - *Fix:* फेल-2 पर अलग पंक्ति 'कृपया धीरे और साफ़ बोलिए'; फेल-3 पर आवाज़ 'कोई बात नहीं, नीचे लिख दीजिए या मदद बुलाइए' + कीबोर्ड अपने-आप खुले + बड़ा लाल 'सहायता चाहिए' बटन जो सीधे टीम को कॉल लगाए।
- **पP0 _(F02-12)_** — अटके हुए खाने पर 'सहायता' या किसी इंसान को कॉल करने का कोई रास्ता नहीं उभरता। इकलौता बचाव है 'नीचे लिख दें' — पर मैंने कभी फ़ॉर्म नहीं भरा, अंग्रेज़ी कीबोर्ड मेरे लिए दीवार है।
  - *Why it fails:* The only fallback the field ever offers is typing ('नीचे लिख दें' in sorryOnce). The keyboard is never PROMINENTLY offered from the 2nd failure and no support/call escape ever surfaces on a stuck field. Violates F02-12 (keyboard offered prominently from 2nd failure).
  - *Fix:* दूसरी फेल से ही कीबोर्ड बड़े रूप में सामने आए + हमेशा एक 'सहायता को कॉल करें' बटन खाने के नीचे रहे।
- **पP1 _(F02-08)_ · **NEEDS ISJ ON DEVICE**** — शोरगुल वाले मंदिर में मेरी आवाज़ अक्सर पकड़ में नहीं आती — तब ऐप बिना कुछ बोले हमेशा के लिए सुनता रहता है। मुझे पता ही नहीं चलता कि यह टूट गया है या मेरा इंतज़ार कर रहा है।
  - *Why it fails:* voiceFieldMachine.ts STT_FAILED branch: returns ['START_LISTEN'] with NO message ever — a silence/mic timeout in a noisy courtyard produces an endless silent listen. F02-08 (high ambient noise → proactively suggest keyboard) is missing.
  - *Fix:* लगातार STT फेल पर देवनागरी में 'शोर ज़्यादा है — नीचे लिखकर बता दीजिए' बोलें और कीबोर्ड उभारें।

**✅ CHECK FOR ISJ:** On the real device: after the 2nd and 3rd failed utterance, is the app truly silent (no spoken line, no keyboard, no new button) leaving him only the pulsing gold ring — i.e. a dead end for a man who cannot type?

---

### बीच काम में फ़ोन आना (draft persistence) — cross-cutting (b)

- **Route:** `/my-poojas/add · /readiness`
- **How to reach:** Pilot login → start add-puja (नई पूजा जोड़ें) or readiness; part-fill a step; take a phone call (background the tab), return. add-puja code: my-poojas/add/page.tsx; readiness: readiness/page.tsx.
- **Visual (canon):** frame no canon frame in `design/canon/हमारे पंडित जी.dc.html`

**रामेश्वर का पल:** पूजा जोड़ते बीच में फ़ोन बज उठा। मैंने उठाया, बात की, वापस आया — पूजा जोड़ें वाला काम अब भी वहीं था, अच्छा हुआ। पर तैयारी वाले पन्ने पर आधार का नंबर आधा भरा था; फ़ोन के बाद वह खाली मिला।

**Findings:**

- **पP1 _(F02-10)_ · **NEEDS ISJ ON DEVICE**** — तैयारी (readiness) में मेरा आधे-भरा चरण — आधार नंबर, बैंक की जानकारी, दक्षिणा — फ़ोन के बाद अगर फ़ोन की मेमोरी ने पन्ना बंद कर दिया तो ग़ायब। पूजा जोड़ें वाला हिस्सा तो बच जाता है, पर तैयारी नहीं।
  - *Why it fails:* add-puja persists to localStorage on every change (add/page.tsx DRAFT_KEY, useEffect on [d]) — correct. But readiness holds all step input in in-memory useState with NO localStorage draft; it relies only on per-step SERVER save (patchStep). If Android A12 (low RAM) kills the backgrounded tab during a call, unsaved within-step fields are lost; server has only the last COMPLETED step.
  - *Fix:* readiness भी हर बदलाव पर localStorage में draft रखे (add-puja जैसा), और वापसी पर वही चरण भरा हुआ लौटाए।
- **पP2 _(NEW-REQ candidate)_ · **NEEDS ISJ ON DEVICE**** — जब फ़ोन के लिए पन्ना छिपता है, तब मेरी भरी हुई बातें कहीं तुरंत सुरक्षित नहीं होतीं।
  - *Why it fails:* No visibilitychange/pagehide flush exists for wizard state (grep: only wakelock/voiceController use those events). Nothing snapshots in-progress readiness fields when the page hides for a call.
  - *Fix:* visibilitychange='hidden' पर मौजूदा फ़ॉर्म-state को localStorage में तुरंत सहेजें।

**✅ CHECK FOR ISJ:** On a real low-RAM A12: background readiness for a 2-minute call and return — is a half-typed आधार number still there, or blank?

---

### सेव करते समय नेटवर्क गिरना (network drop mid-save) — cross-cutting (c)

- **Route:** `/readiness (save step) · /my-poojas/add (पूजा भेजें)`
- **How to reach:** Pilot login → fill a readiness step or the add-puja final step; drop the network (throttle/airplane) exactly as you tap आगे / पूजा भेजें. Save path: mutate.ts → api.ts; readiness sayError; add-puja submit.
- **Visual (canon):** frame no canon frame in `design/canon/हमारे पंडित जी.dc.html`

**रामेश्वर का पल:** तैयारी का चरण भरकर 'आगे' कहा। जियो का सिग्नल गिर गया। शिष्य ने बोला — 'Failed to fetch' — यह क्या है? अंग्रेज़ी में कुछ बोला और लाल में लिख भी दिया। मैं डर गया — मेरा भरा हुआ चला गया? पैसे की जानकारी वाला काम बिगड़ गया?

**Findings:**

- **पP0 _(F02-10)_ · **NEEDS ISJ ON DEVICE**** — नेटवर्क गिरते ही शिष्य ने अंग्रेज़ी 'Failed to fetch' बोल दिया और लाल में लिख भी दिया — यह मेरे लिए बिल्कुल बकवास है, और डरावना क्योंकि यह पैसे/आधार वाला चरण था।
  - *Why it fails:* readiness patchStep/saveR1..R5 call sayError(res.error?.message ...) which SPEAKS AND SHOWS the message (Q6 SPOKEN-ERROR LAW). On a network drop api.ts returns error.message = err.message = the browser's English 'Failed to fetch' (catch: message = aborted ? slowServer : err.message || common.error). So शिष्य literally pronounces 'Failed to fetch' aloud.
  - *Fix:* api.ts के network/timeout दोनों रास्ते हमेशा देवनागरी संदेश लौटाएँ ('इंटरनेट टूट गया — आपकी बात सुरक्षित है, जुड़ते ही फिर भेजेंगे'); कभी err.message (अंग्रेज़ी) न बोलें/दिखाएँ।
- **पP1 _(F02-10)_** — पूजा जोड़ें के आख़िरी 'पूजा भेजें' पर नेटवर्क गिरा — घूमता चक्र रुक गया और बस… कुछ नहीं। न कोई गलती बोली, न कोई 'दुबारा भेजें'। पता ही नहीं गया या नहीं।
  - *Why it fails:* add/page.tsx submit(): only `if (res.success) { …; go(6) }` — a failed res just runs setSubmitting(false) with NO error UI, NO voice, NO retry. Silent dead-end at the final submit.
  - *Fix:* res.success न होने पर देवनागरी में बोलें/दिखाएँ 'अभी नहीं भेजा जा सका — नेटवर्क देखिए' और एक बड़ा 'दुबारा भेजें' बटन दें।
- **पP1 _(F02-10)_** — कहीं भी 'सहेज रहे हैं…' जैसा भरोसा नहीं दिखता, और 'इंटरनेट नहीं है' वाली पट्टी अक्सर आती ही नहीं जब जियो बीच में लड़खड़ाता है।
  - *Why it fails:* No local buffer / 'सहेज रहे हैं…' / reconnect-retry anywhere. OfflineBanner shows only when navigator.onLine===false, but a patchy-Jio mid-request drop typically keeps onLine===true, so the banner never appears and the English error path fires instead. Violates F02-10 (buffer locally, show 'सहेज रहे हैं…', retry on reconnect — input never silently lost).
  - *Fix:* सेव को स्थानीय बफ़र + 'सहेज रहे हैं…' + दोबारा-जुड़ते ही अपने-आप retry दें; नाकाम रहने पर भी input कभी न मिटे।

**✅ CHECK FOR ISJ:** Drop the network mid-save on a real device: does शिष्य actually pronounce the English 'Failed to fetch' aloud, and how alarming does the TTS make it sound to an elderly ear?

---

## Screens the completeness critic caught as missed

### होमपेज / भूमिका-चयन (dual-mode landing) — पूरी तरह छूटी

- **Route:** `/homepage (real: hmarepanditji-pandit.vercel.app/homepage)`
- **How to reach:** Type the /homepage path directly. It is ORPHANED in prod: root / does router.replace('/onboarding'), and nothing links to /homepage except the /design catalog. So a real pandit never sees it — but it is a shipped, indexable route.
- **Visual (canon):** frame no canon frame (F1 dual-mode entry, not in the 41 artboards) in `design/canon/हमारे पंडित जी.dc.html`
- **⚠ UNREACHABLE IN PROD:** Effectively unreachable: root forwards straight to /onboarding and no in-app link points here. The spec (F01-01) demands this dual-CTA homepage as the FIRST screen with 'no intermediate screen' to the pandit flow — but the built app skips it entirely and boots into /onboarding. So the canonical entry screen is both un-walked AND not wired as the real front door. — *this is itself a finding.*

**रामेश्वर का पल:** मैं WhatsApp से आया लिंक खोलता हूँ — दो डिब्बे दिखते हैं। ऊपर वाला नीला 'मुझे पंडित चाहिए', नीचे वाला 'क्या आप एक पंडित हैं?'. पर बटन पर अंग्रेज़ी में लिखा है 'Pandit Ke Roop Mein Judein', 'Find verified priests', 'Joining free', 'Login' — मैं इनमें से कुछ नहीं पढ़ पाता।

**Findings:**

- **पP1 _(F01-01)_ · **NEEDS ISJ ON DEVICE**** — बटन और उपशीर्षक अंग्रेज़ी में — 'Pandit Ke Roop Mein Judein 🪔', 'Find verified priests for your rituals', 'Joining free', 'Login'
  - *Why it fails:* The whole product premise is a voice-first, Devanagari-only pandit who cannot read English. The single most important CTA label and the help/login links are Latin-script. F01-02 also requires the two CTAs be strongly differentiated at 360px — needs a real eye.
  - *Fix:* Translate every string to Devanagari (button, subtitles, 'Login'→'पहले से खाता है? दाखिल हों', 'Joining free'→'जुड़ना मुफ़्त'). Keep the Narrate voice line.
- **पP1 _(F01-01)_** — यह स्क्रीन प्रोड में पहुँची ही नहीं जा सकती — root सीधे /onboarding भेज देता है
  - *Why it fails:* Spec F01-01 says the public homepage with two CTAs is the entry and the pandit CTA lands in the voice flow with no intermediate screen. The app instead makes /onboarding the front door and leaves /homepage as dead code — so the canonical dual-mode entry is unshipped.
  - *Fix:* Decide: either wire root → /homepage (and homepage's pandit CTA → /onboarding), or formally delete /homepage so it isn't a shipped English-laden orphan.

**✅ CHECK FOR ISJ:** At 360px in sunlight, can a non-reader instantly tell which of the two cards is 'I am a pandit' without reading any Latin text — yes/no?

---

### रेफरल निमंत्रण लैंडिंग — 3 उप-अवस्थाएँ (loading / valid / invalid) — पूरी तरह छूटी

- **Route:** `/referral/[code] (real: /referral/ABC123)`
- **How to reach:** Open the deep link /referral/<code> (this is the invite link a pandit gets over WhatsApp). VALID state needs a real code that /api/referral/validate returns valid:true for (seed a referral in DB). INVALID state = any code that fails or is <6 chars — shows the error + manual-entry form. LOADING = the brief spinner while POST /api/referral/validate is in flight (stretch it on Fast-3G).
- **Visual (canon):** frame no canon frame in `design/canon/हमारे पंडित जी.dc.html`

**रामेश्वर का पल:** बेटे ने कहा 'पापा, यह लिंक खोलो, ₹100 मिलेंगे'. खुलते ही एक गोल घूमता चक्र और नीचे अंग्रेज़ी 'Validating referral code...'. फिर 🎁 और लिखा '₹100 का welcome bonus', 'First booking पर 10% discount' — आधा हिंदी आधा अंग्रेज़ी।

**Findings:**

- **पP1 _(F01-04)_** — लोडिंग अवस्था का एकमात्र पाठ अंग्रेज़ी में — 'Validating referral code...'
  - *Why it fails:* First thing the invited pandit sees is a spinner with an English-only caption and no voice. If validation stalls on 3G he stares at untranslatable text.
  - *Fix:* Replace with Devanagari 'कोड जाँच रहे हैं…' and speak it; reuse DiyaLoader for visual consistency.
- **पP1 _(F01-04)_** — लाभ-सूची में मिश्रित लिपि — '₹100 का welcome bonus', 'First booking पर 10% discount', 'Referrer को ₹50 मिलेंगे'
  - *Why it fails:* Money/benefit lines — the exact reason he opened the link — are half-English. A voice-first non-reader cannot verify what he's promised.
  - *Fix:* Fully Devanagari-ise: 'welcome bonus'→'स्वागत बोनस', 'First booking पर 10% discount'→'पहली बुकिंग पर 10% छूट', 'Referrer को ₹50'→'बुलाने वाले को ₹50'.
- **पP2 _(F01-04)_ · **NEEDS ISJ ON DEVICE**** — पुराने डिज़ाइन-टोकन (surface-base, saffron, text-primary, error-red) — बाकी ऐप के canon टोकन नहीं
  - *Why it fails:* This screen predates the canon re-skin (it uses saffron/text-primary classes, not primary-container/on-surface). It will look visibly off-brand next to /onboarding and /home — a distrust cue on the very first invited touch.
  - *Fix:* Port to canon tokens and the standard card/button shapes used across onboarding.
- **पP2 _(F01-06)_** — पहले-से-पंजीकृत नंबर के लिए login-बनाम-registration भेद नहीं (F01-06)
  - *Why it fails:* Spec F01-06: an already-registered number that opens an invite must get a LOGIN link, not the registration path. This landing always pushes /identity → registration; it never detects an existing account, so a re-invited pandit is sent to sign up again.
  - *Fix:* Have /api/referral/validate (or a follow-up check) flag known numbers and branch the CTA to /login.

**✅ CHECK FOR ISJ:** On the valid-invite screen, does the TTS speak the referrer's actual name warmly and pronounceably (not a garbled 'Pandit Ji' fallback) — yes/no?

---

### वैश्विक 404 — 'पृष्ठ नहीं मिला' — छूटी

- **Route:** `(any unknown path, e.g. /xyz) → not-found.tsx`
- **How to reach:** Navigate to any path that doesn't exist (e.g. /booking mistype). Next.js renders app/not-found.tsx.
- **Visual (canon):** frame no canon frame in `design/canon/हमारे पंडित जी.dc.html`

**रामेश्वर का पल:** मैंने गलती से कोई पुराना लिंक दबाया — 🙏 और बड़े अक्षरों में 'पृष्ठ नहीं मिला', नीचे अंग्रेज़ी लाइन भी, और एक 'होम पेज पर जाएं' बटन। आवाज़ बोली 'क्षमा करें, यह पृष्ठ नहीं मिला।'

**Findings:**

- **पP2 _(F02-09)_** — होम बटन '/' पर भेजता है जो तुरंत /onboarding पर replace कर देता है — पंजीकृत पंडित को स्प्लैश/resume-चक्र में डाल सकता है
  - *Why it fails:* handleGoHome does router.push('/'), and root always router.replace('/onboarding'). A logged-in pandit who hits a 404 is bounced through the onboarding orchestrator's resume check instead of landing on /home directly — a jarring detour for the confused elderly user this screen is meant to rescue.
  - *Fix:* Push to /home when a token exists, else '/'.
- **पP2 _(F02-09)_** — मिश्रित लिपि — अंग्रेज़ी लाइन 'Sorry, the page you are looking for was not found.' और support@ ईमेल
  - *Why it fails:* A non-reader gets an English sentence and an email address as the only 'help' — he can neither read nor use email. Uses legacy tokens (surface-base/saffron) too.
  - *Fix:* Drop or shrink the English line; swap the email for the tel: support number used elsewhere.

**✅ CHECK FOR ISJ:** Does the 'पृष्ठ नहीं मिला' voice line actually fire on mount, and is the single home button within easy thumb reach on a 360×740 screen — yes/no?

---

### रूट एरर-बाउंड्री — 'कुछ गलत हो गया' (error.tsx) — छूटी

- **Route:** `(thrown error in any dashboard route) → error.tsx`
- **How to reach:** Trigger a client-side exception in any (dashboard-group) page (e.g. an API shape the component doesn't guard). Hard to force in prod on purpose — needs a component throw; devs can throw in a page to capture it.
- **Visual (canon):** frame no canon frame in `design/canon/हमारे पंडित जी.dc.html`

**रामेश्वर का पल:** पूजा की सूची खुलते ही अचानक 🙏 और 'कुछ गलत हो गया', दो बटन — 'पुनः प्रयास करें' और 'सहायता से संपर्क करें'। आवाज़ ने माफ़ी माँगी।

**Findings:**

- **पP1 _(F02-11)_** — 'सहायता से संपर्क करें' बटन कुछ नहीं खोलता — सिर्फ़ ईमेल पता बोल देता है
  - *Why it fails:* handleContactHelp only speaks 'support@hmarepanditji.com' and does not dial or open the support path. For a distressed non-reader who can't use email, the help button is a dead end — it neither calls the number nor opens /help.
  - *Fix:* Wire the help button to tel:+91… (the real support number) or router.push('/help'), matching the support wiring elsewhere.
- **पP2 _(F02-11)_** — मिश्रित लिपि — 'Something went wrong. Please try again.' अंग्रेज़ी में
  - *Why it fails:* Bilingual error text leaves an English fallback line the target user can't read; legacy saffron tokens.
  - *Fix:* Devanagari-only body; keep the retry/help affordances.

**✅ CHECK FOR ISJ:** When the boundary catches, does the retry button actually re-render the failed screen (not loop straight back into the error) — yes/no?

---

### जड़-स्तर क्रैश — 'गंभीर त्रुटि' (global-error.tsx) — छूटी, और नकली फ़ोन नंबर बग

- **Route:** `(root-level unhandled error) → global-error.tsx`
- **How to reach:** A crash in the root layout/render tree escalates to app/global-error.tsx (the last-resort handler).
- **Visual (canon):** frame no canon frame in `design/canon/हमारे पंडित जी.dc.html`

**रामेश्वर का पल:** पूरी स्क्रीन सफ़ेद, ⚠️ और 'गंभीर त्रुटि'। घबराकर मैं नीचे दिया फ़ोन नंबर देखता हूँ — '+91 12345 67890' — बेटे को बोलता हूँ यह मिलाओ, पर यह तो नकली नंबर है।

**Findings:**

- **पP0 _(F02-11)_** — संकट-स्क्रीन पर दिखने वाला फ़ोन नंबर नकली/placeholder है — पाठ '+91 12345 67890' पर लिंक tel:+918934095599
  - *Why it fails:* The visible text is the classic placeholder '12345 67890' while the tel: href is a different real-looking number (+918934095599). A panicked pandit reads the on-screen digits aloud to a family member and dials a non-existent number — the one moment support matters most, the number is wrong AND inconsistent with the href.
  - *Fix:* Show the single real support number as both the visible text and the tel: href (match homepage/error.tsx). Never render '12345 67890'.
- **पP2 _(F02-11)_** — मिश्रित लिपि — 'A critical error has occurred. Please refresh the page.'
  - *Why it fails:* English fallback sentence on the most stressful screen; the two buttons ('रीफ्रेश'/'पुनः प्रयास') are fine but the body isn't fully readable to the target user.
  - *Fix:* Devanagari-only body.

**✅ CHECK FOR ISJ:** Is the phone number shown on screen a number a family member can actually call and reach HmarePanditJi support — yes/no?

---

### वैश्विक रूट-लोडर (loading.tsx / PageLoading) — छूटी

- **Route:** `(shown on every route transition via Suspense) → loading.tsx`
- **How to reach:** Throttle to Fast-3G and tap any bottom-nav item (home↔bookings↔earnings); the Suspense boundary paints PageLoading during the transition.
- **Visual (canon):** frame loading = 28 in `design/canon/हमारे पंडित जी.dc.html`

**रामेश्वर का पल:** नीचे 'कमाई' दबाया — एक पल के लिए बीच में लोडर आया, फिर कमाई खुली।

**Findings:**

- **पP2 _(F02-10)_ · **NEEDS ISJ ON DEVICE**** — रूट-संक्रमण लोडर की जाँच नहीं हुई — Fast-3G पर यह बार-बार, हर टैब बदलने पर दिखेगा
  - *Why it fails:* On the mandated Fast-3G pass this global loader is the dominant between-screen experience, yet it was never captured. If PageLoading differs visually from the DiyaLoader used elsewhere, the pandit sees two different 'waiting' looks and may think the app froze.
  - *Fix:* Confirm PageLoading matches the DiyaLoader visual language and shows within ~200ms so transitions never look dead.

**✅ CHECK FOR ISJ:** On Fast-3G, does the transition loader appear alive (spinning/animating) for the whole wait rather than flashing a frozen frame — yes/no?

---

### AUTH हैंडऑफ़ — अकेला धड़कता 🪔 दीया (onboarding AUTH phase)

- **Route:** `/onboarding (phase=AUTH, just before redirect to /login)`
- **How to reach:** Complete the tutorial to its CTA WITHOUT a token (fresh install, tap रजिस्ट्रेशन). The orchestrator sets phase=AUTH and paints a bare pulsing diya for one frame, then router.push('/login?next=/onboarding').
- **Visual (canon):** frame no canon frame in `design/canon/हमारे पंडित जी.dc.html`

**रामेश्वर का पल:** ट्यूटोरियल के आख़िर में 'शुरू करें' दबाया — स्क्रीन खाली, बीच में सिर्फ़ एक धड़कता दीया, कोई शब्द नहीं। पल भर को लगा ऐप अटक गया।

**Findings:**

- **पP2 _(F02-10)_ · **NEEDS ISJ ON DEVICE**** — AUTH अवस्था एक निःशब्द, बिना-पाठ धड़कता दीया दिखाती है — अगर /login राउंड-ट्रिप धीमा हो तो पंडित खाली स्क्रीन पर बैठा रहता है
  - *Why it fails:* The AUTH branch renders only a pulsing 🪔 with no caption and no voice line (onboarding lines 467-473). It relies on the /login redirect firing immediately; on a slow network the redirect lags and the pandit sees a wordless, silent screen with no cue that anything is happening — the app's own X1 rule ('never a blank/silent wait') is violated here.
  - *Fix:* Add a Devanagari caption + short voice line ('एक पल… आपको आगे ले जा रहे हैं') to the AUTH holding screen, or route to /login synchronously.

**✅ CHECK FOR ISJ:** During the login handoff on a real device, does the lone diya ever look stuck/dead with no word spoken before /login appears — yes/no?

---

### भाषा-स्विच का blocking DiyaLoader + अनुवाद-विफलता सूचना (onboarding)

- **Route:** `/onboarding (LANGUAGE_CONFIRM / LANGUAGE_LIST → switching state)`
- **How to reach:** On the language confirm/list screen pick a NON-Hindi language (e.g. Marathi/Tamil). activateLanguage() blocks with a full-screen DiyaLoader showing that language's own waitLine while the entry bundle downloads. Force the FAILURE sub-state by throttling/killing the bundle request — app stays Hindi and speaks the fallbackNotice.
- **Visual (canon):** frame no canon frame (variant of loading=28) in `design/canon/हमारे पंडित जी.dc.html`

**रामेश्वर का पल:** मैंने मराठी चुनी — पूरी स्क्रीन पर दीया और मराठी में 'थांबा…'. तीन-चार सेकंड कुछ नहीं हुआ। एक बार तो हिंदी में ही रह गई और आवाज़ ने माफ़ी माँगी।

**Findings:**

- **पP1 _(F03-01)_ · **NEEDS ISJ ON DEVICE**** — non-Hindi भाषा चुनने पर blocking बंडल-डाउनलोड — Fast-3G पर कई सेकंड की रुकावट, जिसे walk ने पकड़ा नहीं
  - *Why it fails:* runLanguageSwitch does a blocking activateLanguage fetch behind a full-screen DiyaLoader. Every non-Hindi pandit (Marathi/Tamil/Telugu/etc — most of the target base) hits this multi-second block on first entry, and on the mandated Fast-3G pass it could be very long. It was never walked, so nobody judged whether the wait feels broken.
  - *Fix:* Capture this state on Fast-3G; ensure the waitLine is spoken and a timeout path exists so a stalled download can't hang the ceremony.
- **पP1 _(F03-01)_ · **NEEDS ISJ ON DEVICE**** — अनुवाद-बंडल विफल → ऐप हिंदी में रहता है और लक्ष्य-भाषा में fallbackNotice बोलता है — यह विफलता-अवस्था अनदेखी
  - *Why it fails:* When activateLanguage returns false the app silently stays in Hindi and only speaks a fallbackNotice in the chosen tongue (onboarding lines 160-164). A Tamil-only pandit who never hears/understands that one line is then dropped into a Hindi UI with no visible notice — a real dead-end that was never walked.
  - *Fix:* Add a persistent visible (not voice-only) notice + a retry affordance when the bundle fails, in the target language's script if any is cached.

**✅ CHECK FOR ISJ:** On Fast-3G, picking Marathi/Tamil — is that language's wait line actually spoken and does the loader ever feel hung (no progress, no timeout) — yes/no?

---

### होम — छूटी उप-अवस्थाएँ: ऑनलाइन (हरा), सत्यापन-अस्वीकृत बैनर, मील-का-पत्थर उत्सव

- **Route:** `/home (real: /home)`
- **How to reach:** Pilot login 9876500050 / 123456 (needs a complete/verified profile). ONLINE: tap the go-online toggle → green dot + glow + 'परिवार अब आपको बुला सकते हैं ✓'. REJECTED: needs a profile whose verificationStatus is REJECTED with a rejectionReason (admin/seed step) → red ❌ banner + 'फिर से जमा करें' → /readiness?step=5. MILESTONE: needs a milestone row in the /home API response → celebration overlay.
- **Visual (canon):** frame home = 8/12 in `design/canon/हमारे पंडित जी.dc.html`

**रामेश्वर का पल:** मैंने बड़ा बटन दबाया — दीया हरा हो गया, चमक आई, लिखा 'परिवार अब आपको बुला सकते हैं ✓'. दूसरे दिन खोला तो ऊपर लाल ❌ 'आपकी जानकारी अस्वीकृत' — दिल बैठ गया।

**Findings:**

- **पP1 _(F13-01)_ · **NEEDS ISJ ON DEVICE**** — ऑनलाइन अवस्था (isOnline=true) walk में कभी नहीं देखी गई — यही ऐप का असली काम-करता रूप है
  - *Why it fails:* The team only captured the offline dashboard. Online is the entire point: green dot with glow, 'परिवार अब आपको बुला सकते हैं ✓', and a voice announce. If the green/off distinction is weak in glare, the pandit can't tell whether he's actually accepting bookings — a revenue-losing ambiguity that was never eyeballed.
  - *Fix:* Walk the online state; verify the on/off dot contrast and the toggle's confirming voice line on a real screen.
- **पP1 _(F13-01)_ · **NEEDS ISJ ON DEVICE**** — सत्यापन-अस्वीकृत बैनर (rejectionReason + 'फिर से जमा करें' → /readiness?step=5) — सबसे भावनात्मक होम अवस्था, अनदेखी
  - *Why it fails:* HomeView renders a red ❌ 'अस्वीकृत' card with the ops rejection reason and a resubmit button when verificationStatus is REJECTED. This is the highest-distrust moment on home (his livelihood was refused) and it was never walked — nobody checked whether the reason text is readable, whether the voice softens the blow, or whether resubmit lands on the right R5 field.
  - *Fix:* Walk the rejected state with a real rejectionReason; ensure the reason is Devanagari and the resubmit CTA reaches the exact failing R5 item.
- **पP2 _(F13-01)_ · **NEEDS ISJ ON DEVICE**** — मील-का-पत्थर उत्सव overlay (celebratingMilestone) होम पर — अनदेखा
  - *Why it fails:* Crossing a milestone triggers a celebration overlay on home (celebratingMilestone state). It was never walked, so its timing/dismissal and whether it blocks a fresh booking banner underneath are unverified.
  - *Fix:* Walk a milestone trigger; confirm the overlay auto-dismisses and never hides an incoming-request banner.

**✅ CHECK FOR ISJ:** After tapping online, does the green glow + 'परिवार अब बुला सकते हैं' read as unmistakably ON versus the offline grey state in bright glare — yes/no?

---

### पहली-बार कोच-टिप overlays (FirstUseTip) — cross-cutting first-open gating, हर सतह पर छूटा

- **Route:** `/home /bookings /bookings/[id] /calendar /earnings /my-poojas (first visit each)`
- **How to reach:** With a CLEAN localStorage (fresh install / cleared tip state), visit each surface for the first time. A one-time coach bubble points at the key control: homeGoOnline (online toggle), bookingsTabs, detailRoute, calendarBlock, earningsPending, myPoojasAdd. Re-visits never show it — so a normal logged-in walk misses all six.
- **Visual (canon):** frame no canon frame in `design/canon/हमारे पंडित जी.dc.html`

**रामेश्वर का पल:** पहली बार होम खुला — बड़े बटन के ऊपर एक बुलबुला निकला जो बता रहा था कहाँ दबाना है। कमाई और कैलेंडर पर भी पहली बार ऐसा ही इशारा आया।

**Findings:**

- **पP1 _(F02-01)_ · **NEEDS ISJ ON DEVICE**** — छह सतहों पर एक-बार-दिखने वाले FirstUseTip कोच-बुलबुले किसी भी स्क्रीन पर walk नहीं हुए — यह exactly वह 'first-open-once gating' है जो कवर होना था
  - *Why it fails:* FirstUseTip renders once per surface keyed on stored state, then never again. The walk logged-in as an existing pilot, so every one of these first-run coach overlays (the pandit's actual first impression of each screen) was invisible to the team. Their placement/arrow-target, dismissal, and whether they occlude the very control they point at are all unverified.
  - *Fix:* Do one fresh-install pass with cleared tip state across all six surfaces; verify each bubble points at the right ref, is Devanagari, and dismisses on first tap without blocking the control.

**✅ CHECK FOR ISJ:** On first visit to home, does the coach bubble clearly point at the go-online button (not float detached) and dismiss cleanly on the first tap — yes/no?

---

### पहली-बार स्वागत-वाक्य (once-per-install welcome script) — cross-cutting gating, अपुष्ट

- **Route:** `/onboarding (first-ever open, SPLASH→)`
- **How to reach:** TRUE first-ever open on a device that has never run the app (no stored 'welcome spoken' flag). Spec F02-01: the welcome script 'नमस्ते पंडित जी… यह ऐप पूरी तरह आपकी आवाज़ से चलेगा…' must speak ONCE, not on every open. Clearing storage and reopening is the only way to observe it.
- **Visual (canon):** frame splash = 1 in `design/canon/हमारे पंडित जी.dc.html`

**रामेश्वर का पल:** जीवन में पहली बार ऐप खोला — एक गर्म आवाज़ ने कहा 'नमस्ते पंडित जी… यह ऐप आपकी आवाज़ से चलेगा…'. दूसरी बार खोला तो वह लंबा स्वागत दुबारा नहीं आना चाहिए।

**Findings:**

- **पP2 _(F02-01)_ · **NEEDS ISJ ON DEVICE**** — 'once, not on every open' स्वागत-वाक्य की एक-बारगी वाली शर्त walk में सत्यापित नहीं — गलत होने पर हर बार लंबा भाषण बजेगा
  - *Why it fails:* F02-01 requires the full welcome script exactly once per install. The walk started from an already-onboarded pilot, so nobody confirmed (a) it fires on the genuine first open, and (b) it does NOT replay on every subsequent open. A regression here means every daily launch replays a 10-second speech the pandit can't skip — the most annoying possible failure.
  - *Fix:* Fresh-install pass to confirm the welcome fires once; reopen to confirm it's suppressed thereafter.

**✅ CHECK FOR ISJ:** On the very first open does the warm welcome line play, and on the second open is it correctly silent — yes/no?

---

### ट्यूटोरियल स्लाइड 1,2,4,5,6 — माइक-स्लाइड को छोड़ बाकी सब छूटीं (incl. 'शुरू करें' CTA)

- **Route:** `/onboarding (phase=TUTORIAL, slides 1-6; mic is slide 3)`
- **How to reach:** In onboarding reach TUTORIAL and swipe through all six slides: 1 कमाई (SceneKamai), 2 नई बुकिंग (SceneBooking, temple-bell on mount), 3 आवाज़/mic (the only one walked), 4 सो जाओ/जागो (SceneSleep — interactive mute voice-practice), 5 सत्यापन (SceneVerify), 6 CTA (SceneWelcome — asks 'शुरू करें?' and holds the रजिस्ट्रेशन button).
- **Visual (canon):** frame tutorial = 5-10 in `design/canon/हमारे पंडित जी.dc.html`

**रामेश्वर का पल:** सीखने वाली स्लाइडें चलीं — कमाई का दृश्य, फिर घंटी बजी 'नई बुकिंग', फिर आवाज़ वाली, फिर 'सो जाओ' बोलकर अभ्यास, फिर सत्यापन, और आख़िर में 'शुरू करें?' — बड़ा बटन।

**Findings:**

- **पP1 _(F02-01)_ · **NEEDS ISJ ON DEVICE**** — CTA स्लाइड (6, SceneWelcome — 'शुरू करें?' + रजिस्ट्रेशन बटन) walk में नहीं देखी — यही असली रूपांतरण-बिंदु है
  - *Why it fails:* The final tutorial slide is where the pandit is asked 'शुरू करें?' by voice and taps the register CTA that fires goto('AUTH'). It's the single most important slide (the whole tutorial exists to reach it) and it was never walked — its voice prompt warmth, button tappability, and the हाँ/शुरू voice command wiring are unverified.
  - *Fix:* Walk slide 6; verify the spoken 'शुरू करें?' lands and both tap and voice ('हाँ'/'शुरू') advance to AUTH.
- **पP2 _(F02-01)_ · **NEEDS ISJ ON DEVICE**** — 'सो जाओ/जागो' अभ्यास स्लाइड (4, interactive mute) — आवाज़-आदेश का हाथों-हाथ अभ्यास — अनदेखी
  - *Why it fails:* Slide 4 spotlights the real शिष्य orb and has the pandit practice the सो जाओ/जागो mute command — a core interaction he'll use daily. Whether the practice actually recognizes his spoken command (TTS + STT round-trip) can only be judged live, and it wasn't.
  - *Fix:* Walk slide 4; confirm सो जाओ/जागो practice recognizes real speech and the orb responds.
- **पP2 _(F02-01)_ · **NEEDS ISJ ON DEVICE**** — स्लाइड 1 (कमाई), 2 (नई बुकिंग + मंदिर-घंटी), 5 (सत्यापन) की animated स्लाइडें अनदेखी
  - *Why it fails:* These animated founder-feature slides (SceneKamai/SceneBooking/SceneVerify) carry the temple-bell one-shot and the value pitch. Their animation smoothness, bell timing, and narration sync were never eyeballed on a real device.
  - *Fix:* Walk slides 1,2,5; check animation smoothness at 360×740 and that the temple bell fires once on slide 2.

**✅ CHECK FOR ISJ:** On the final slide does the spoken 'शुरू करें?' sound warm and does the register button feel comfortably tappable with a thumb — yes/no?

---

## One-page checklist — walk the whole app in ~30 minutes

Tick the box after you answer the yes/no. Hand the sheet back.

| # | Route | The one question | ☐ |
|---|---|---|---|
| 1 | `/onboarding (phase SPLASH) — root / भी यहीं भेजता है` | छूने के बाद 'नमस्ते पंडित जी!' greeting असली A12 पर ~1 सेकंड में, गर्मजोशी से, बिना कटे बजता है — हाँ या नहीं? | ☐ |
| 2 | `/onboarding (phase LOCATION_PERMISSION)` | असली A12 Chrome पर PopupPointer तीर + हिंदी आवाज़ मिलकर अंग्रेज़ी 'Allow' बटन को बिना पढ़े साफ़ पहचनवा देते हैं — हाँ या नहीं? | ☐ |
| 3 | `/onboarding (phase LOCATION_PERMISSION, detected!=null)` | detected-city कार्ड पर 'हाँ'/'यही सही है' बोलने से आगे बढ़ता है या चुपचाप कुछ नहीं होता — असली आवाज़ पर टेस्ट करें: बढ़ता है, हाँ या नहीं? | ☐ |
| 4 | `/onboarding (phase MANUAL_CITY)` | इस screen पर 'वाराणसी' (सूची में न होने वाला शहर) बोलने पर app उसे पकड़कर पुष्टि करती है या चुप रह जाती है — असली आवाज़ पर: पकड़ती है, हाँ या नहीं? | ☐ |
| 5 | `/onboarding (phase LANGUAGE_CONFIRM)` | पुष्टि-लाइन (हिन्दी confirmQuestion) असली device पर गर्म, स्पष्ट आवाज़ में बजती है और 'हाँ' बोलने पर सचमुच आगे बढ़ती है — हाँ या नहीं? | ☐ |
| 6 | `/onboarding (phase LANGUAGE_LIST)` | दो-टैप रस्म (पहला टैप नाम बोले, दूसरा चुने) असली उँगली से 104px टाइल पर आराम से चलती है, और पहला टैप नाम सही भाषा में बोलता है — हाँ या नहीं? | ☐ |
| 7 | `/onboarding (phase PARICHAY)` | शिष्य की intro आवाज़ (introOnly) असली A12 पर गर्म और भरोसा-जगाने वाली लगती है, और popup तीर के साथ मिलकर माइक-मांग समझ आती है — हाँ या नहीं? | ☐ |
| 8 | `/resume` | क्या यह /resume route उत्पादन में किसी भी user-tappable रास्ते से खुलती है — हाँ या नहीं? (नहीं है, तो इसे हटाना ही ठीक; हाँ है, तो P0 अंग्रेज़ी-दीवार।) | ☐ |
| 9 | `/login` | जैसे ही लॉगिन स्क्रीन (step 1) खुलती है, क्या शिष्य ~2 सेकंड में 'नंबर डालिए…' बोलकर मार्ग दिखाता है, या स्क्रीन चुप रहती है? (page पर step-1 का कोई useScreenVoice/Narrate नहीं — narration केवल VoiceField के loop पर निर्भर है) | ☐ |
| 10 | `/login (step=2 after नंबर भेजो)` | क्या step-2 पर mount होते ही शिष्य की एक ही narration (स्वागत + 'छह अंकों का ओटीपी…') गरमाहट से चलती है और 'ओटीपी' शब्द को स्पष्ट/गर्म ढंग से बोलती है — कट या रुखा नहीं? | ☐ |
| 11 | `/onboarding (phase=REGISTRATION)` | क्या mount पर शिष्य 'पंडित जी, बस अपना नाम बताइए…' गरमाहट और अपनेपन से बोलता है, और 'खाता बनाएँ' बटन उसी क्षण चमकता (highlight) है? | ☐ |
| 12 | `/onboarding (REGISTRATION → showDone) → /home` | क्या बधाई की आवाज़ पूरी बजने के बाद ही स्क्रीन /home पर जाती है (बीच में नहीं कटती), और स्वर उत्सव जैसा गर्म है? | ☐ |
| 13 | `/onboarding (phase=LOCATION_PERMISSION)` | रामेश्वर के हिन्दी-locale Samsung A12 Chrome पर असली geolocation popup का बटन 'अनुमति दें' (देवनागरी) दिखता है या अंग्रेज़ी 'Allow'? | ☐ |
| 14 | `/onboarding (LOCATION_PERMISSION, detected sub-state)` | रामेश्वर के असली coordinates (वाराणसी) पर Nominatim बिना accept-language के 'वाराणसी' लौटाता है या 'Varanasi' (Latin)? | ☐ |
| 15 | `/onboarding (phase=TUTORIAL, slide 5)` | क्या native mic prompt रामेश्वर के device पर देवनागरी में आता है, और अभ्यास के बाद 'वाह! आपने बोलकर जवाब दिया' गर्म लगता है? | ☐ |
| 16 | `/onboarding (TUTORIAL slide 5, micState=denied)` | हार्ड-deny के बाद रामेश्वर के Samsung A12 Chrome पर क्या 'फिर कोशिश करें' दबाने से native mic prompt दोबारा आता है, या OS उसे चुपचाप ब्लॉक कर देता है (जिससे retry झूठा हो जाए)? | ☐ |
| 17 | `/(registration)/{mobile,otp,complete,profile} और /(registration)/permissions/{location,mic,mic-denied,notifications}` | क्या prod में कोई भी live रास्ता (या firebase init) रामेश्वर के सामने बिना बोले-गए 'क्यों' के native notification-permission prompt ला सकता है? | ☐ |
| 18 | `/identity` | क्या असली फ़ोन पर स्वागत-आवाज़ गर्म लगती है और 'app' शब्द ठीक-से बोला जाता है (टूटा-फूटा नहीं)? | ☐ |
| 19 | `/readiness/hub` | क्या 13px कैप्शन असली A12 स्क्रीन पर बिना चश्मे पढ़ा जा सकता है? | ☐ |
| 20 | `/readiness?step=1` | क्या दक्षिणा बोलने पर 'आपने कहा ₹2100 — सही है?' पुष्टि-लूप असली फ़ोन पर साफ़ सुनाई देकर सही मान पकड़ता है? | ☐ |
| 21 | `/readiness?step=2` | क्या शोरगुल वाले मंदिर में हाँ/नहीं आवाज़-आदेश पहली बार में पकड़े जाते हैं? | ☐ |
| 22 | `/readiness?step=3` | क्या बड़ा नाचता हरा ₹ नंबर पंडित को अपनी दक्षिणा समझाकर डरा देता है, या 'अनुमान' शब्द से वह समझ जाता है? | ☐ |
| 23 | `/readiness?step=4` | क्या इतने सारे सवालों के बीच शिष्य की आवाज़ हर सवाल पर मार्गदर्शन देती है, या बीच के सवाल चुप रहते हैं? | ☐ |
| 24 | `/readiness?step=5` | पैची Jio पर अगर r5Voice (आधार क्यों चाहिए) की आवाज़ नहीं चलती, तो क्या स्क्रीन पर पढ़ने लायक कोई कारण बचता है — या शक्की पंडित यहीं ऐप बंद कर देगा? | ☐ |
| 25 | `/readiness (showCelebration state)` | क्या बधाई-आवाज़ असली फ़ोन पर गर्म लगती है, और शीर्षक बनाम उप-पंक्ति का अंतर पंडित को भ्रमित नहीं करता? | ☐ |
| 26 | `/my-poojas` | Arm's length, temple daylight, no glasses — can he tell a सत्यापन-बाकी card apart from a प्रमाणित one at a glance, and does the 13px status line read at all? | ☐ |
| 27 | `/my-poojas/add (step 0)` | Does the नाम VoiceField reliably capture a spoken 'सत्यनारायण कथा' in a noisy courtyard over patchy Jio, or does it drop/garble so he can't get past step 0? | ☐ |
| 28 | `/my-poojas/add (step 1)` | On the device, does tapping मात्रा/कंपनी pop the system keyboard with no voice mic at all — confirming he has zero voice route for those two fields? | ☐ |
| 29 | `/my-poojas/add (step 2)` | Does शिष्य actually speak each of the three supply choices aloud (useVoiceOptions), so a non-reader knows what he is picking before he taps? | ☐ |
| 30 | `/my-poojas/add (step 3)` | Do the 56px number buttons feel comfortably tappable with a thick finger, no accidental neighbour hits? | ☐ |
| 31 | `/my-poojas/add (step 4)` | After he speaks '5000', is the ₹5000 the single largest element on the screen, and does शिष्य read it back for confirmation? | ☐ |
| 32 | `/my-poojas/add (step 5)` | After he taps 'भेज दीजिए, हम लगा देंगे' and returns from WhatsApp, is 'पूजा भेजें' still disabled with no spoken cue — i.e. is he genuinely trapped on this screen? | ☐ |
| 33 | `/my-poojas/add (step 6)` | Does शिष्य's closing line sound warm and reassuring (not clipped), so he leaves the screen calm rather than anxious about timing? | ☐ |
| 34 | `/my-poojas/add5` | Confirm on device that /my-poojas' add button and 'नई पूजा' voice command both land on the 7-step /add (never add5), so add5 is truly dead in prod. | ☐ |
| 35 | `/samagri` | On device, do the on-screen tier price labels actually show 'Basic/Standard/Premium' in Latin (not Devanagari), confirming the English wall? | ☐ |
| 36 | `/home (loading state)` | asli phone par: Fast-3G par yeh diya-loader itni der ruke ki Rameshwar ko lage app atak gaya — kya bina awaaz ke woh 5 second se zyada mौन rehta hai? | ☐ |
| 37 | `/home` | asli phone par arm's-length par: kya "इस महीने की कमाई" ka ₹ number sach me screen ki sabse pehli cheez hai jahan aankh jaati hai, ya bada hara GO ONLINE pill pehle dhyaan kheenchta hai? | ☐ |
| 38 | `/home (newRequestBooking state)` | asli phone par: jab nayi booking aati hai, kya playBell + शिष्य ki "नई बुकिंग आई है!" awaaz shor-bhare mandir aangan me itni sunayi deti hai ki Rameshwar chook na jaaye? | ☐ |
| 39 | `/bookings` | asli phone par thick-finger se: kya poori booking-card (row) tap karne par aasani se khulti hai, ya "जवाब दें ›" ke chhote text par hi tap register hota hai? | ☐ |
| 40 | `/bookings/[id]/request` | asli phone par TTS: kya voiceIntro "नई बुकिंग। {puja} की बुकिंग। कुल कमाई {X} रुपये।" garmजोशी se, saaf devanagari uchcharan me bolta hai — ya robotic lagta hai? | ☐ |
| 41 | `/bookings/[id]/request (showAccepted state)` | asli phone par: kya petals-drift + badge scale-spring animation aur shishya ki बधाई-line milkar sach me utsav-jaisा joyful lagti hai (na ki jaldi-jaldi nikal jaane wali flash)? | ☐ |
| 42 | `/bookings/[id]` | asli phone par: kya "🗺️ रास्ता दिखाएं" geo: link Samsung Galaxy A12 par sach me maps app kholta hai (na ki blank/त्रुटि), taaki Rameshwar ko yajman ka ghar mil jaaye? | ☐ |
| 43 | `/bookings/[id] (showSuccessScreen state)` | asli phone par: kya ringBellAfterSpeech ki ghanti sach me shishya ki completion-line KHATAM hone ke BAAD bajti hai (blessing) — na ki uski awaaz ke ऊपर (glitch jaisा)? | ☐ |
| 44 | `/earnings` | Fast-3G पर असली फ़ोन पर — क्या दीया-लोडर तीन सेकंड से ज़्यादा चुप रहता है, इतना कि रामेश्वर को लगे स्क्रीन अटक गई? | ☐ |
| 45 | `/earnings` | असली कान पर — खाली कमाई स्क्रीन पर '2-3 दिन में आपके खाते में' सुनकर क्या रामेश्वर उलझता है कि कौन-सा पैसा आ रहा है? | ☐ |
| 46 | `/earnings` | असली फ़ोन पर आर्म-लेंथ, बिना चश्मे — क्या रामेश्वर 'मिल गया' की हरी रकम और 'आना बाकी' की पीतल रकम में सिर्फ़ रंग से फ़र्क़ पकड़ पाता है? | ☐ |
| 47 | `/earnings` | असली स्पीकर पर — क्या paidVoice की गर्माहट और घंटी सचमुच 'आपका पैसा आ गया' वाली खुशी और भरोसा जगाती है (यांत्रिक नहीं लगती)? | ☐ |
| 48 | `/profile-view` | असली फ़ोन पर — क्या रामेश्वर बिना सुने समझ पाता है कि प्रोफ़ाइल सिर्फ़-देखने की है, या वह दक्षिणा रकम पर टैप करके अटक जाता है क्योंकि कुछ नहीं बोलता? | ☐ |
| 49 | `/calendar` | असली फ़ोन पर, मोटी उँगली से — क्या 48px डिब्बे में रामेश्वर बिना बग़ल का दिन छुए सही तारीख़ दबा पाता है, और क्या छुट्टी लगने पर उसे यक़ीन होता है कि लग गई? | ☐ |
| 50 | `/emergency-sos` | On the real A12 in courtyard glare: does the spoken line 'बीच का लाल बटन दबाकर रखें' clearly land as HOLD (not tap), and does the white fill-ring visibly grow over the 1.2s so he can SEE the hold registering? | ☐ |
| 51 | `/emergency` | Is the floating 'SOS' button actually rendered anywhere in the live pilot pandit build (open /home and /settings on device and look bottom-right)? If yes, it is the English one he'll find first. | ☐ |
| 52 | `/help` | Does शिष्य's opening line 'कैसे मदद करें? हमारी टीम तैयार है।' actually play warmly on entry, so a lost pandit immediately hears a human offer of help? | ☐ |
| 53 | `/help/faq` | At arm's length in courtyard glare, is the 17px question text and 16px answer body comfortably readable, or does he have to lean in / give up? | ☐ |
| 54 | `/settings` | Does 'सेटिंग्स' read as a meaningful word to a Devanagari-only elder, or as unreadable English-in-Hindi-letters that makes him unsure he's on the right screen? | ☐ |
| 55 | `/readiness (any step field) · /my-poojas/add (step 0 नाम)` | On the real device: after the 2nd and 3rd failed utterance, is the app truly silent (no spoken line, no keyboard, no new button) leaving him only the pulsing gold ring — i.e. a dead end for a man who cannot type? | ☐ |
| 56 | `/my-poojas/add · /readiness` | On a real low-RAM A12: background readiness for a 2-minute call and return — is a half-typed आधार number still there, or blank? | ☐ |
| 57 | `/readiness (save step) · /my-poojas/add (पूजा भेजें)` | Drop the network mid-save on a real device: does शिष्य actually pronounce the English 'Failed to fetch' aloud, and how alarming does the TTS make it sound to an elderly ear? | ☐ |
| 58 | `/homepage (real: hmarepanditji-pandit.vercel.app/homepage)` | At 360px in sunlight, can a non-reader instantly tell which of the two cards is 'I am a pandit' without reading any Latin text — yes/no? | ☐ |
| 59 | `/referral/[code] (real: /referral/ABC123)` | On the valid-invite screen, does the TTS speak the referrer's actual name warmly and pronounceably (not a garbled 'Pandit Ji' fallback) — yes/no? | ☐ |
| 60 | `(any unknown path, e.g. /xyz) → not-found.tsx` | Does the 'पृष्ठ नहीं मिला' voice line actually fire on mount, and is the single home button within easy thumb reach on a 360×740 screen — yes/no? | ☐ |
| 61 | `(thrown error in any dashboard route) → error.tsx` | When the boundary catches, does the retry button actually re-render the failed screen (not loop straight back into the error) — yes/no? | ☐ |
| 62 | `(root-level unhandled error) → global-error.tsx` | Is the phone number shown on screen a number a family member can actually call and reach HmarePanditJi support — yes/no? | ☐ |
| 63 | `(shown on every route transition via Suspense) → loading.tsx` | On Fast-3G, does the transition loader appear alive (spinning/animating) for the whole wait rather than flashing a frozen frame — yes/no? | ☐ |
| 64 | `/onboarding (phase=AUTH, just before redirect to /login)` | During the login handoff on a real device, does the lone diya ever look stuck/dead with no word spoken before /login appears — yes/no? | ☐ |
| 65 | `/onboarding (LANGUAGE_CONFIRM / LANGUAGE_LIST → switching state)` | On Fast-3G, picking Marathi/Tamil — is that language's wait line actually spoken and does the loader ever feel hung (no progress, no timeout) — yes/no? | ☐ |
| 66 | `/home (real: /home)` | After tapping online, does the green glow + 'परिवार अब बुला सकते हैं' read as unmistakably ON versus the offline grey state in bright glare — yes/no? | ☐ |
| 67 | `/home /bookings /bookings/[id] /calendar /earnings /my-poojas (first visit each)` | On first visit to home, does the coach bubble clearly point at the go-online button (not float detached) and dismiss cleanly on the first tap — yes/no? | ☐ |
| 68 | `/onboarding (first-ever open, SPLASH→)` | On the very first open does the warm welcome line play, and on the second open is it correctly silent — yes/no? | ☐ |
| 69 | `/onboarding (phase=TUTORIAL, slides 1-6; mic is slide 3)` | On the final slide does the spoken 'शुरू करें?' sound warm and does the register button feel comfortably tappable with a thumb — yes/no? | ☐ |

_Generated read-only from the Pandit Walk. Uncommitted deliverable._
