# HmarePanditJi — Complete Voice System
## Tool Recommendation + Full Script Library + Implementation Prompts
### Version 1.0 | From Splash to Registration CTA

---

# ════════════════════════════════════════════════════════════
# PART 1: THE GLOBAL VOICE TOOL VERDICT
# (100 Years of Knowledge. One Decision.)
# ════════════════════════════════════════════════════════════

## The Problem We Are Solving

Pandit Shambhu Nath Tiwari, age 61, Varanasi, speaks Hindi with a Bhojpuri accent.
He is talking to our app at 7 AM inside a temple. Bells are ringing.
His Samsung Galaxy A12 has a cracked screen protector.
His son downloaded this app. He has never used voice input before.

**The app must understand him perfectly. Every time. The first time.**

This is harder than it sounds. Here's why every mainstream option fails him:

---

## Tool-by-Tool Verdict

### TTS (Text-to-Speech) — What the App Says to the Pandit

| Tool | Hindi Quality | Indian Accent | Latency | Price | Verdict |
|------|--------------|---------------|---------|-------|---------|
| **Web Speech API** | Robotic, synthetic | Poor | 0ms (local) | Free | ❌ Makes app feel cheap. Pandit will distrust a robot voice. |
| **Google Cloud TTS (WaveNet hi-IN)** | Decent | Acceptable | 300-500ms | $4/1M chars | ⚠️ Acceptable but it's Western-built. "Varanasi" sounds wrong. |
| **Azure Neural TTS** | Good | Good | 250ms | $4/1M chars | ⚠️ Better than Google but still misses Hinglish rhythm. |
| **ElevenLabs** | Excellent | English-focused | 200ms | $5/1M chars | ❌ Built for English. Hindi quality drops sharply. Expensive. |
| **Amazon Polly (Aditi)** | Moderate | Indian English | 200ms | $4/1M chars | ❌ Outdated voice. Sounds like 2018 IVR system. |
| **Murf AI** | Good | Has Indian voices | 400ms | $13/seat | ❌ Studio-focused, not API-first. Expensive for per-call. |
| **Sarvam AI (Bulbul v3)** | **EXCELLENT** | **PURPOSE-BUILT** | **Sub-250ms streaming** | **₹15/10K chars** | ✅✅ **WINNER** |

**Why Sarvam Bulbul v3 wins for TTS:**
- Built in India, for India. Trained on Indian speech patterns.
- Says "Varanasi", "Dakshina", "Satyanarayan", "Griha Pravesh" correctly — every time.
- Handles Hinglish naturally: "Aapka booking confirm ho gaya hai" without robotic pausing at English words.
- 25+ voices including warm, respectful male voice (Ratan/Kabir) suitable for addressing a senior Pandit.
- WebSocket streaming = audio starts playing while still generating = near-zero perceived latency.
- ₹15/10K chars means a full Part 0 walkthrough (all 22 screens) costs approximately ₹2-4 per Pandit.
- SOC 2 Type II certified. ISO certified. Enterprise-grade.

---

### STT (Speech-to-Text) — What the App Hears from the Pandit

| Tool | Hindi Accuracy | Regional Accents | Streaming | Latency | Price | Verdict |
|------|---------------|-----------------|-----------|---------|-------|---------|
| **Web Speech API** | Moderate | Poor | Partial | 0ms (local) | Free | ⚠️ Fallback only. Fails on Bhojpuri accent, temple noise. |
| **Google Cloud STT (hi-IN)** | Good | Moderate | Yes | 300ms | $0.006/15s | ⚠️ Better than Web Speech but misses regional dialects. |
| **OpenAI Whisper** | Excellent | Good | No (batch) | 1-3s | $0.006/min | ❌ Batch only = 1-3 second delay. Too slow for voice UI. |
| **AssemblyAI Universal-2** | Good | Good | Yes | 200ms | $0.011/min | ⚠️ Strong for English, moderate for Hindi accents. |
| **Deepgram Nova-3 (hi)** | **EXCELLENT** | **Handles Hinglish** | **Yes (WebSocket)** | **<300ms** | **$0.0077/min** | ✅ **WINNER for Hindi/Hinglish** |
| **Sarvam AI (Saaras v3)** | **EXCELLENT** | **22 Indian languages** | **Yes (WebSocket)** | **~300ms** | **₹30/hr** | ✅ **WINNER for Regional languages** |

**The Architecture Decision:**

Use BOTH tools, intelligently routed:

```
Selected Language = Hindi or Bhojpuri or Maithili?
  → Use Deepgram Nova-3 (model: nova-3, language: hi)
    Reason: 27% WER reduction for Hindi vs Nova-2. Best Hinglish handling.
    Keyterm prompting: inject ["haan", "nahi", "dakshina", "pooja", "varanasi", ...]

Selected Language = Tamil, Telugu, Kannada, Malayalam, Bengali, Marathi, Gujarati, Odia, Punjabi?
  → Use Sarvam Saaras v3 (streaming)
    Reason: Purpose-built for Indic languages. Handles code-mixing natively.
    Covers all 22 Indian languages in one model.

Selected Language = English?
  → Use Deepgram Nova-3 (model: nova-3, language: en-IN)
    Reason: Best accuracy for Indian-accented English.

Internet unavailable?
  → Fall back to Web Speech API (silent downgrade, no error shown to user)
```

---

## THE FINAL STACK DECISION

```
┌─────────────────────────────────────────────────────────────────┐
│  TTS (App speaks to Pandit):                                    │
│  PRIMARY:  Sarvam AI — Bulbul v3                                │
│            Voice: "ratan" for formal/respectful tone           │
│            Speed: 0.9x (slightly slower for elderly users)     │
│            WebSocket streaming for near-zero latency           │
│  FALLBACK: Web Speech API (hi-IN, rate: 0.85)                  │
│                                                                 │
│  STT (App listens to Pandit):                                   │
│  PRIMARY (Hindi/Bhojpuri/Maithili/English):                    │
│            Deepgram Nova-3                                      │
│            language: "hi", model: "nova-3"                     │
│            keyterms: [pooja-vocabulary list]                    │
│            endpointing: 800ms (longer pause tolerance)          │
│  PRIMARY (Regional — Tamil/Telugu/Bengali etc.):               │
│            Sarvam Saaras v3 (streaming WebSocket)              │
│  FALLBACK: Web Speech API                                       │
│                                                                 │
│  COST ESTIMATE:                                                 │
│  Per Pandit full onboarding: ~₹3-6 TTS + ~₹1-2 STT = ₹5-8    │
│  For 10,000 Pandits onboarded: ₹50,000-80,000 (~$600-960)     │
└─────────────────────────────────────────────────────────────────┘
```

---

# ════════════════════════════════════════════════════════════
# PART 2: COMPLETE VOICE SCRIPT LIBRARY
# Every word the app says. Every screen. Start to finish.
# ════════════════════════════════════════════════════════════

## HOW TO READ THESE SCRIPTS

```
[SCREEN ID]       — Which screen this plays on
[TRIGGER]         — When exactly this plays (on_load, on_timeout, etc.)
[VOICE]           — Which Sarvam voice to use
[SPEED]           — Playback rate (0.85 = slowest, 1.0 = normal)
[PAUSE_AFTER_MS]  — How long after TTS ends before STT starts listening
[HINDI SCRIPT]    — Exact Devanagari text (feed to Sarvam Bulbul v3)
[ROMAN SCRIPT]    — Romanized Hindi (reference only, use Devanagari for API)
[ENGLISH MEANING] — What it means (for developer reference)
[MAX_DURATION_S]  — Approximate audio length at given speed
```

---

## PART 0.0: LANGUAGE SELECTION — COMPLETE VOICE SCRIPTS

---

### S-0.0.1: SPLASH SCREEN

```
[SCREEN]         S-0.0.1 Splash Screen
[TRIGGER]        SILENT — No voice on this screen
[REASON]         Phone may be in pocket. Sudden voice = bad first impression.
                 Also: TTS libraries need 300-400ms warm-up time.
                 Use this 3-second splash to pre-load Sarvam SDK.
```

---

### S-0.0.2: LOCATION PERMISSION PRE-EDUCATION

```
[SCREEN]         S-0.0.2 Location Permission
[TRIGGER]        on_screen_load, delay: 600ms
[VOICE]          ratan (warm, respectful male voice)
[SPEED]          0.88
[PAUSE_AFTER_MS] 1000ms (give Pandit time to read the screen first)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
HINDI DEVANAGARI (feed this to Sarvam Bulbul v3 API):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"नमस्ते। मैं आपका शहर जानना चाहता हूँ — ताकि आपकी भाषा अपने आप सेट हो जाए, और आपके शहर की पूजाएं आपको मिलें। आपका पूरा पता किसी को नहीं दिखेगा। क्या आप अनुमति देंगे? 'हाँ' बोलें या नीचे बटन दबाएं।"

[ROMAN]
"Namaste. Main aapka shehar jaanna chahta hoon — taaki aapki bhasha apne aap set ho jaye, aur aapke shehar ki poojayen aapko milin. Aapka poora pata kisi ko nahi dikhega. Kya aap anumati denge? 'Haan' bolein ya neeche button dabayein."

[ENGLISH] "Hello. I want to know your city — so your language sets automatically and you get poojas from your city. Your full address will not be shown to anyone. Will you allow it? Say 'yes' or press the button below."

[MAX_DURATION_S] ~8 seconds

STT STARTS: 1000ms after TTS ends
STT LISTENS FOR: YES / NO / SKIP intent (see Part 3 for intent map)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
IF YES said / button tapped → GPS permission dialog shown
[NO VOICE] during OS dialog (don't talk over the system dialog)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[TRIGGER]        on_permission_granted (after OS dialog)
"शहर मिल गया। आपके लिए भाषा सेट हो रही है।"
"Shehar mil gaya. Aapke liye bhasha set ho rahi hai."
[Duration: ~2s] → Auto-advance to S-0.0.3

[TRIGGER]        on_permission_denied (user tapped "Don't Allow")
"कोई बात नहीं। आप खुद बताइए।"
"Koi baat nahi. Aap khud bataiye."
[Duration: ~2s] → Auto-advance to S-0.0.2B

[TRIGGER]        on_timeout_12s (no response to initial prompt)
"कृपया 'हाँ' बोलें या नीचे बटन दबाएं।"
"Kripya 'Haan' bolein ya neeche button dabayein."
[Duration: ~2s] → Re-prompt once, then go to S-0.0.2B at 24s
```

---

### S-0.0.2B: MANUAL CITY ENTRY

```
[SCREEN]         S-0.0.2B Manual City Entry
[TRIGGER]        on_screen_load, delay: 500ms
[VOICE]          ratan
[SPEED]          0.88
[PAUSE_AFTER_MS] 500ms (this screen = active listening, start quickly)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"कोई बात नहीं। बस अपना शहर बताइए। बोल सकते हैं — जैसे 'वाराणसी' या 'दिल्ली' — या नीचे से छू सकते हैं।"
"Koi baat nahi. Bas apna shehar bataiye. Bol sakte hain — jaise 'Varanasi' ya 'Delhi' — ya neeche se chhoo sakte hain."
[Duration: ~5s]

STT STARTS: 500ms after TTS ends
STT LISTENS FOR: Any city name

[TRIGGER]        on_city_detected (voice recognized a city)
"[CITY_NAME] — सही है? 'हाँ' बोलें।"
"[CITY_NAME] — sahi hai? 'Haan' bolein."
[Example: "वाराणसी — सही है? 'हाँ' बोलें।"]
[Duration: ~2s]

[TRIGGER]        on_city_not_recognized (after 2 failed voice attempts)
"आवाज़ नहीं पहचान पाया। नीचे से अपना शहर चुनें या लिखें।"
"Aawaz nahi pehchaan paya. Neeche se apna shehar chunein ya likhein."
[Duration: ~3s] → Keyboard auto-opens

[TRIGGER]        on_chip_tapped (user tapped a city chip)
[NO VOICE — immediate visual transition to S-0.0.3]
[Action is obvious from the chip tap, no need for voice]
```

---

### S-0.0.3: LANGUAGE AUTO-DETECTION CONFIRMATION

```
[SCREEN]         S-0.0.3 Language Confirmation
[TRIGGER]        on_screen_load, delay: 400ms
[VOICE]          ratan
[SPEED]          0.90
[PAUSE_AFTER_MS] 800ms (card animation plays first ~600ms, then voice)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DYNAMIC — replace [CITY] and [LANGUAGE] with actual values:

"[CITY] के हिसाब से हम [LANGUAGE] सेट कर रहे हैं। क्या यह ठीक है? 'हाँ' बोलें या 'बदलें' बोलें।"

Examples by city:
  Varanasi → "वाराणसी के हिसाब से हम हिंदी सेट कर रहे हैं। क्या यह ठीक है? 'हाँ' बोलें या 'बदलें' बोलें।"
  Chennai  → "चेन्नई के हिसाब से हम Tamil सेट कर रहे हैं। Is this okay? Say 'Haan' or 'Badle'."
  Kolkata  → "कोलकाता के हिसाब से हम Bengali सेट कर रहे हैं। ठीक है? 'हाँ' बोलें या 'बदलें' बोलें।"

[Roman] "[CITY] ke hisaab se hum [LANGUAGE] set kar rahe hain. Kya yeh theek hai? 'Haan' bolein ya 'Badle' bolein."
[Duration: ~4s]

STT STARTS: 800ms after TTS ends
STT LISTENS FOR: YES (→ S-0.0.6) / CHANGE (→ S-0.0.4)

[TRIGGER]        on_yes_confirmed
"बहुत अच्छा।"
"Bahut achha."
[Duration: ~1s] → Auto-advance to S-0.0.6

[TRIGGER]        on_change_requested
"ठीक है। आप कौन सी भाषा चाहते हैं?"
"Theek hai. Aap kaun si bhasha chahte hain?"
[Duration: ~2s] → Auto-advance to S-0.0.4

[TRIGGER]        on_timeout_12s (no response)
"कृपया 'हाँ' या 'बदलें' बोलें, या नीचे बटन दबाएं।"
"Kripya 'Haan' ya 'Badlein' bolein, ya neeche button dabayein."
[Duration: ~3s] → Voice indicator pulses, buttons pulse once

[TRIGGER]        on_timeout_24s (still no response)
[NO VOICE] → Auto-confirm detected language, proceed to S-0.0.6
[Show toast: "भाषा सेट कर दी। 🌐 से बाद में बदलें।"]
```

---

### S-0.0.4: LANGUAGE SELECTION LIST

```
[SCREEN]         S-0.0.4 Language Selection List
[TRIGGER]        on_screen_load, delay: 400ms
[VOICE]          ratan
[SPEED]          0.88
[PAUSE_AFTER_MS] 300ms (voice search box is active, listen quickly)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"कृपया अपनी भाषा का नाम बोलिए। जैसे — 'भोजपुरी', 'Tamil', 'Telugu', 'Bengali' — या नीचे से चुनें।"
"Kripya apni bhasha ka naam boliye. Jaise — 'Bhojpuri', 'Tamil', 'Telugu', 'Bengali' — ya neeche se chunein."
[Duration: ~5s]

STT STARTS: 300ms after TTS ends
STT LISTENS FOR: Any language name

[TRIGGER]        on_language_voice_detected
"[LANGUAGE_NAME]? सही है?"
"[LANGUAGE_NAME]? Sahi hai?"
[Duration: ~2s] → Proceed to S-0.0.5

[TRIGGER]        on_language_not_recognized (after 2 failed attempts)
"आवाज़ नहीं पहचान पाया। नीचे से भाषा छूकर चुनें।"
"Aawaz nahi pehchaan paya. Neeche se bhasha chhookar chunein."
[Duration: ~3s] → Visual highlight on grid

[TRIGGER]        on_language_grid_tapped (user tapped a cell)
[NO VOICE — immediate visual transition to S-0.0.5]
[The tap itself is the confirmation action, no voice needed]

[TRIGGER]        on_unsupported_language_spoken
"अभी यह भाषा उपलब्ध नहीं है। सबसे नज़दीकी भाषा — हिंदी या English — चल सकती है।"
"Abhi yeh bhasha uplabdh nahi hai. Sabse najdeeki bhasha — Hindi ya English — chal sakti hai."
[Duration: ~4s]
```

---

### S-0.0.5: LANGUAGE CHOICE CONFIRMATION

```
[SCREEN]         S-0.0.5 Language Choice Confirmation
[TRIGGER]        on_screen_load, delay: 300ms
[VOICE]          ratan
[SPEED]          0.90
[PAUSE_AFTER_MS] 600ms

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DYNAMIC — replace [LANGUAGE] with pending language name:

"आपने [LANGUAGE] कही। सही है? 'हाँ' बोलें या 'नहीं' बोलें।"
"Aapne [LANGUAGE] kahi. Sahi hai? 'Haan' bolein ya 'Nahi' bolein."

Examples:
  "आपने भोजपुरी कही। सही है? 'हाँ' बोलें या 'नहीं' बोलें।"
  "Aapne Bhojpuri kahi. Sahi hai? 'Haan' bolein ya 'Nahi' bolein."
[Duration: ~3s]

STT STARTS: 600ms after TTS ends

[TRIGGER]        on_yes_confirmed
"बहुत अच्छा।"
"Bahut achha."
[Duration: ~1s] → S-0.0.6

[TRIGGER]        on_no_said
"ठीक है, फिर से चुनते हैं।"
"Theek hai, phir se chunte hain."
[Duration: ~2s] → S-0.0.4

[TRIGGER]        on_timeout_12s
"[LANGUAGE] — सही है? बटन दबाइए।"
"[LANGUAGE] — sahi hai? Button dabaiye."
[Duration: ~2s]

[TRIGGER]        on_timeout_24s
[Auto-confirm selected language] → S-0.0.6
```

---

### S-0.0.6: LANGUAGE SET — CELEBRATION

```
[SCREEN]         S-0.0.6 Language Set Celebration
[TRIGGER]        on_screen_load, delay: 200ms (fast — rides the animation energy)
[VOICE]          ratan
[SPEED]          0.92 (slightly warmer, more upbeat)
[PAUSE_AFTER_MS] N/A — no STT on this screen

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DYNAMIC — Now spoken IN the confirmed language where possible:

For Hindi:
"बहुत अच्छा! अब हम आपसे हिंदी में बात करेंगे।"
"Bahut achha! Ab hum aapse Hindi mein baat karenge."

For Bhojpuri (still speak in Hindi since Bhojpuri TTS quality is limited):
"बहुत अच्छा! भोजपुरी सेट हो गई। हम आपसे इसी भाषा में बात करेंगे।"
"Bahut achha! Bhojpuri set ho gayi. Hum aapse isi bhasha mein baat karenge."

For Tamil (bilingual confirmation):
"Romba nalla! Tamil set aachu. Ab hum aapse Tamil mein baat karenge."
[Note: Sarvam Bulbul v3 handles this code-mix naturally]

For Bengali:
"Khub bhalo! Bengali set hoyeche. Ab hum aapse Bengali mein baat karenge."

For Telugu:
"Chala manchidi! Telugu set aindi. Ab hum aapse Telugu mein baat karenge."

For all other languages (Hindi confirmation):
"बहुत अच्छा! [LANGUAGE] सेट हो गई। हम आपसे इसी भाषा में बात करेंगे।"
"Bahut achha! [LANGUAGE] set ho gayi. Hum aapse isi bhasha mein baat karenge."

[Duration: ~3s]

AUTO-ADVANCE: 1800ms after TTS starts → S-0.0.8 (first time) or S-0.1
```

---

### S-0.0.7: SAHAYATA (HELP) SCREEN

```
[SCREEN]         S-0.0.7 Help Screen
[TRIGGER]        on_screen_load, delay: 400ms
[VOICE]          ratan
[SPEED]          0.85 (slowest — calming, reassuring)
[PAUSE_AFTER_MS] N/A — no STT, user taps or calls

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"कोई बात नहीं। हम मदद के लिए यहाँ हैं। हमारी team से बात करें — बिल्कुल मुफ़्त। या नीचे 'वापस जाएं' दबाएं अगर खुद करना हो।"
"Koi baat nahi. Hum madad ke liye yahan hain. Humari team se baat karein — bilkul muft. Ya neeche 'Wapas jaayein' dabayein agar khud karna ho."
[Duration: ~5s]
```

---

### S-0.0.8: VOICE MICRO-TUTORIAL (FIRST TIME ONLY)

```
[SCREEN]         S-0.0.8 Voice Micro-Tutorial
[TRIGGER]        on_screen_load, delay: 500ms
[VOICE]          ratan
[SPEED]          0.88
[PAUSE_AFTER_MS] 500ms

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LINE 1 (Introduction):
"एक छोटी सी बात। यह app आपकी आवाज़ से चलता है।"
"Ek chhoti si baat. Yeh app aapki aawaz se chalta hai."
[Pause: 600ms]

LINE 2 (The instruction):
"जब यह orange mic दिखे और 'सुन रहा हूँ' लिखा हो — तब बोलिए।"
"Jab yeh orange mic dikhe aur 'sun raha hoon' likha ho — tab boliye."
[Pause: 600ms]

LINE 3 (The invitation):
"अभी कोशिश करिए — 'हाँ' या 'नहीं' बोलिए।"
"Abhi koshish kariye — 'Haan' ya 'Nahi' boliye."
[Duration total: ~8s]

STT STARTS: 500ms after LINE 3 ends
STT LISTENS FOR: Literally anything (any voice = success)

[TRIGGER]        on_any_voice_detected (SUCCESS)
"वाह! बिल्कुल सही। आप बहुत अच्छा कर रहे हैं।"
"Wah! Bilkul sahi. Aap bahut achha kar rahe hain."
[Duration: ~3s] → "आगे चलें" button pulses, wait for tap

[TRIGGER]        on_no_voice_20s (no voice detected)
"कोई बात नहीं अगर बोलने में दिक्कत हो। नीचे Keyboard भी है। आगे चलें बटन दबाइए।"
"Koi baat nahi agar bolne mein dikkat ho. Neeche Keyboard bhi hai. Aage chalein button dabaiye."
[Duration: ~5s] → Wait for button tap or auto-advance at 6s
```

---

## PART 0: WELCOME TUTORIAL — COMPLETE VOICE SCRIPTS

**IMPORTANT NOTE FOR ALL TUTORIAL SCREENS:**
After the Part 0.0 section, the app now speaks in the Pandit's confirmed language.
Scripts below are provided in Hindi (primary). For other languages:
- Pass the Hindi text to Sarvam's Translation API first → get translated text
- Then pass translated text to Bulbul v3 TTS for the confirmed language
- This happens at runtime — not pre-recorded

---

### S-0.1: SWAGAT (WELCOME IDENTITY)

```
[SCREEN]         S-0.1 Swagat Welcome
[TRIGGER]        on_screen_load, delay: 500ms
[VOICE]          ratan
[SPEED]          0.88
[PAUSE_AFTER_MS] 1000ms (Pandit should see the illustration first)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LINE 1 (Identity + Welcome):
"नमस्ते पंडित जी। HmarePanditJi पर आपका बहुत-बहुत स्वागत है।"
"Namaste Pandit Ji. HmarePanditJi par aapka bahut-bahut swagat hai."
[Pause: 400ms]

LINE 2 (Platform philosophy):
"यह platform आपके लिए ही बना है।"
"Yeh platform aapke liye hi bana hai."
[Pause: 300ms]

LINE 3 (Time commitment + invitation):
"अगले दो मिनट में हम देखेंगे कि यह app आपकी आमदनी में क्या बदलाव ला सकता है।"
"Agle do minute mein hum dekhenge ki yeh app aapki aamdani mein kya badlav la sakta hai."
[Pause: 400ms]

LINE 4 (Mool Mantra):
"हमारा Mool Mantra याद रखिए — 'App पंडित के लिए है, पंडित App के लिए नहीं।'"
"Humara Mool Mantra yaad rakhiye — 'App Pandit ke liye hai, Pandit App ke liye nahi.'"
[Pause: 600ms]

LINE 5 (Choice):
"अगर सीधे Registration करना हो तो 'Skip' बोलें। नहीं तो 'जानें' बोलें।"
"Agar seedhe Registration karna ho to 'Skip' bolein. Nahi to 'Jaanen' bolein."

[Total duration: ~18s]

STT STARTS: 1000ms after LINE 5 ends
STT LISTENS FOR: FORWARD/YES (→ S-0.2) / SKIP (→ Registration)
```

---

### S-0.2: INCOME HOOK (THE MOST IMPORTANT SCRIPT)

```
[SCREEN]         S-0.2 Income Hook
[TRIGGER]        on_screen_load, delay: 400ms
[VOICE]          ratan
[SPEED]          0.88
[PAUSE_AFTER_MS] 1500ms (give testimonial card time to animate in at ~600ms)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LINE 1 (Hook — specific person):
"सुनिए, वाराणसी के पंडित रामेश्वर शर्मा जी पहले महीने में अठारह हज़ार रुपये कमाते थे।"
"Suniye, Varanasi ke Pandit Rameshwar Sharma Ji pehle mahine mein aatharah hazaar rupaye kamate the."
[Pause: 300ms]

LINE 2 (The transformation):
"आज वे तीन नए तरीकों से तिरसठ हज़ार कमा रहे हैं।"
"Aaj woh teen naye tarikon se tirsath hazaar kama rahe hain."
[Pause: 500ms]

LINE 3 (The promise):
"मैं आपको भी यही तीन तरीके दिखाता हूँ।"
"Main aapko bhi yahi teen tarike dikhata hoon."
[Pause: 400ms]

LINE 4 (Direction to grid):
"इन चार tiles में से जो समझना हो उसे छू सकते हैं। या 'आगे' बोलकर सब एक-एक देख सकते हैं।"
"In chaar tiles mein se jo samajhna ho use chhoo sakte hain. Ya 'aage' bolkar sab ek-ek dekh sakte hain."

[Total duration: ~16s]

STT STARTS: 1500ms after LINE 4 ends
STT LISTENS FOR: FORWARD (→ S-0.3) / SKIP / or tile-specific commands
```

---

### S-0.3: FIXED DAKSHINA — THE BARGAINING KILLER

```
[SCREEN]         S-0.3 Fixed Dakshina
[TRIGGER]        on_screen_load, delay: 500ms
[VOICE]          ratan
[SPEED]          0.86 (slightly slower — emotional content, needs to land)
[PAUSE_AFTER_MS] 1200ms

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LINE 1 (The pain — recognition moment):
"कितनी बार ऐसा हुआ है कि आपने दो घंटे की पूजा की — और ग्राहक ने कह दिया, 'भैया, तीन हज़ार नहीं, दो हज़ार ले लो।'"
"Kitni baar aisa hua hai ki aapne do ghante ki pooja ki — aur grahak ne keh diya, 'Bhaiya, teen hazaar nahi, do hazaar le lo.'"
[Pause: 600ms (emotional pause — let it sink in)]

LINE 2 (The emotion — naming the feeling):
"आप कुछ नहीं बोल पाए।"
"Aap kuch nahi bol paye."
[Pause: 400ms]

LINE 3 (The solution):
"अब नहीं होगा यह।"
"Ab nahi hoga yeh."
[Pause: 300ms]

LINE 4 (How it works):
"आप खुद दक्षिणा तय करेंगे — platform कभी नहीं बदलेगी।"
"Aap khud dakshina tay karenge — platform kabhi nahi badlegi."
[Pause: 300ms]

LINE 5 (Customer side):
"ग्राहक को booking से पहले ही पता होता है — कितना देना है।"
"Grahak ko booking se pehle hi pata hota hai — kitna dena hai."
[Pause: 300ms]

LINE 6 (One word summary):
"मोलभाव खत्म।"
"Moalbhav khatam."
[Pause: 800ms (let that word hang in silence)]

LINE 7 (Call to action):
"'आगे' बोलें।"
"'Aage' bolein."

[Total duration: ~18s]

STT STARTS: 1200ms after LINE 7 ends
```

---

### S-0.4: ONLINE REVENUE — GHAR BAITHE + CONSULTANCY

```
[SCREEN]         S-0.4 Online Revenue
[TRIGGER]        on_screen_load, delay: 400ms
[VOICE]          ratan
[SPEED]          0.88
[PAUSE_AFTER_MS] 1000ms

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LINE 1 (Setup — new concept):
"दो बिल्कुल नए तरीके हैं — जो आप शायद अभी तक नहीं जानते।"
"Do bilkul naye tarike hain — jo aap shayad abhi tak nahi jaante."
[Pause: 300ms]

LINE 2 (Feature 1 — Ghar Baithe Pooja):
"पहला — घर बैठे पूजा। Video call से पूजा कराइए। दुनिया भर के ग्राहक मिलेंगे — NRI भी।"
"Pehla — Ghar Baithe Pooja. Video call se pooja karaiye. Duniya bhar ke grahak milenge — NRI bhi."
[Pause: 300ms]

LINE 3 (Feature 1 — Income):
"एक पूजा में दो हज़ार से पाँच हज़ार रुपये।"
"Ek pooja mein do hazaar se paanch hazaar rupaye."
[Pause: 500ms]

LINE 4 (Feature 2 — Consultancy):
"दूसरा — पंडित से बात। Phone, video, या chat पर धार्मिक सलाह दीजिए।"
"Doosra — Pandit Se Baat. Phone, video, ya chat par dharmik salah dijiye."
[Pause: 300ms]

LINE 5 (Feature 2 — Concrete example):
"बीस रुपये से पचास रुपये प्रति मिनट।"
"Bees rupaye se pachaas rupaye prati minute."
[Pause: 200ms]

LINE 6 (Worked example — THE KEY LINE):
"उदाहरण के तौर पर — बीस मिनट की एक call में आठ सौ रुपये सीधे आपको।"
"Udaaharan ke taur par — bees minute ki ek call mein aath sau rupaye seedhe aapko."
[Pause: 500ms]

LINE 7 (Combined potential):
"दोनों मिलाकर — चालीस हज़ार रुपये अलग से हर महीने।"
"Dono milakar — chaalees hazaar rupaye alag se har mahine."
[Pause: 400ms]

LINE 8 (Next):
"'आगे' बोलें।"
"'Aage' bolein."

[Total duration: ~22s]

STT STARTS: 1000ms after LINE 8 ends
```

---

### S-0.5: BACKUP PANDIT — FREE MONEY

```
[SCREEN]         S-0.5 Backup Pandit
[TRIGGER]        on_screen_load, delay: 400ms
[VOICE]          ratan
[SPEED]          0.88
[PAUSE_AFTER_MS] 1000ms

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LINE 1 (The claim — triggers curiosity/skepticism):
"यह सुनकर लगेगा — 'यह कैसे हो सकता है?'"
"Yeh sunkar lagega — 'Yeh kaise ho sakta hai?'"
[Pause: 300ms]

LINE 2 (The answer before the question is asked):
"मैं समझाता हूँ।"
"Main samjhata hoon."
[Pause: 300ms]

LINE 3 (The scenario):
"जब कोई booking होती है जिसमें ग्राहक ने backup protection लिया होता है — आपको offer आता है।"
"Jab koi booking hoti hai jisme grahak ne backup protection liya hota hai — aapko offer aata hai."
[Pause: 300ms]

LINE 4 (The offer):
"'क्या आप उस दिन backup पंडित बनेंगे?'"
"'Kya aap us din backup Pandit banenge?'"
[Pause: 400ms]

LINE 5 (You say yes):
"आप हाँ कहते हैं। उस दिन free रहते हैं।"
"Aap haan kehte hain. Us din free rehte hain."
[Pause: 400ms]

LINE 6 (Outcome 1 — even if main Pandit does the work):
"अगर मुख्य पंडित ने पूजा कर ली — भी आपको दो हज़ार रुपये मिलेंगे।"
"Agar mukhya Pandit ne pooja kar li — bhi aapko do hazaar rupaye milenge."
[Pause: 300ms]

LINE 7 (Outcome 2 — best case):
"अगर मुख्य पंडित cancel किए — तो पूरी booking आपकी और ऊपर से दो हज़ार bonus।"
"Agar mukhya Pandit cancel kiye — to poori booking aapki aur upar se do hazaar bonus."
[Pause: 500ms]

LINE 8 (Where money comes from — kills skepticism):
"यह पैसा ग्राहक ने booking के समय backup protection की extra payment की थी। वही आपको मिलता है।"
"Yeh paisa grahak ne booking ke samay backup protection ki extra payment ki thi. Wohi aapko milta hai."
[Pause: 500ms]

LINE 9 (Summary):
"दोनों तरफ से फ़ायदा।"
"Dono taraf se faayda."
[Pause: 400ms]

LINE 10 (Next):
"'आगे' बोलें।"
"'Aage' bolein."

[Total duration: ~28s]

STT STARTS: 1000ms after LINE 10 ends
```

---

### S-0.6: INSTANT PAYMENT + TRANSPARENT EARNINGS

```
[SCREEN]         S-0.6 Instant Payment
[TRIGGER]        on_screen_load, delay: 400ms
[VOICE]          ratan
[SPEED]          0.90
[PAUSE_AFTER_MS] 800ms

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LINE 1 (The headline — punchy):
"पूजा खत्म हुई। दो मिनट में पैसे बैंक में।"
"Pooja khatam hui. Do minute mein paise bank mein."
[Pause: 400ms]

LINE 2 (No waiting):
"कोई इंतज़ार नहीं। कोई 'कल देंगे' नहीं।"
"Koi intezaar nahi. Koi 'kal denge' nahi."
[Pause: 500ms]

LINE 3 (Transparency — the radical honesty line):
"और देखो — platform का share भी screen पर दिखेगा।"
"Aur dekho — platform ka share bhi screen par dikhega."
[Pause: 300ms]

LINE 4 (Anti-hidden-fees promise):
"छुपा कुछ नहीं।"
"Chhupa kuch nahi."
[Pause: 600ms]

LINE 5 (Example on screen):
"Screen पर देखें — दक्षिणा, platform का हिस्सा, यात्रा भत्ता — सब साफ़।"
"Screen par dekhein — dakshina, platform ka hissa, yatra bhatta — sab saaf."
[Pause: 400ms]

LINE 6 (Net amount):
"और नीचे लिखा है — आपको कितना मिला।"
"Aur neeche likha hai — aapko kitna mila."
[Pause: 400ms]

LINE 7 (Next):
"'आगे' बोलें।"
"'Aage' bolein."

[Total duration: ~16s]

STT STARTS: 800ms after LINE 7 ends
```

---

### S-0.7: VOICE NAVIGATION — INTERACTIVE DEMO

```
[SCREEN]         S-0.7 Voice Navigation Demo
[TRIGGER]        on_screen_load, delay: 400ms
[VOICE]          ratan
[SPEED]          0.88
[PAUSE_AFTER_MS] 300ms (quickly invite to demo)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LINE 1 (Feature statement):
"यह app आपकी आवाज़ से चलता है। टाइपिंग की कोई ज़रूरत नहीं।"
"Yeh app aapki aawaz se chalta hai. Typing ki koi zaroorat nahi."
[Pause: 400ms]

LINE 2 (The demo invitation):
"अभी कोशिश करिए — 'हाँ' या 'नहीं' बोलिए।"
"Abhi koshish kariye — 'Haan' ya 'Nahi' boliye."
[Pause: 200ms]

LINE 3 (Mic is live):
"Mic अभी सुन रहा है।"
"Mic abhi sun raha hai."

[Total duration: ~8s]

STT STARTS IMMEDIATELY: 300ms after voice (mic should feel instant)
STT LISTENS FOR: Anything at all (any detection = success)

[TRIGGER]        on_demo_success (any voice detected)
"वाह! बिल्कुल सही। आप perfect कर रहे हैं।"
"Wah! Bilkul sahi. Aap perfect kar rahe hain."
[Duration: ~3s]
→ Reset demo, offer "आगे चलें" button

[TRIGGER]        on_no_voice_15s
"कोई बात नहीं। Keyboard से भी चलता है। नीचे Keyboard button हमेशा रहेगा।"
"Koi baat nahi. Keyboard se bhi chalta hai. Neeche Keyboard button hamesha rahega."
[Duration: ~4s]
→ Main CTA button pulses

[TRIGGER]        on_high_ambient_noise_detected (>65dB)
"शोर ज़्यादा लग रहा है। शांत जगह पर जाकर try करें, या Keyboard use करें।"
"Shor zyada lag raha hai. Shaant jagah par jakar try karein, ya Keyboard use karein."
[Duration: ~4s]
```

---

### S-0.8: DUAL MODE — SMARTPHONE + KEYPAD

```
[SCREEN]         S-0.8 Dual Mode
[TRIGGER]        on_screen_load, delay: 400ms
[VOICE]          ratan
[SPEED]          0.88
[PAUSE_AFTER_MS] 1000ms

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LINE 1 (Inclusion statement):
"चाहे आपके पास smartphone हो या keypad phone — दोनों से काम चलेगा।"
"Chahe aapke paas smartphone ho ya keypad phone — dono se kaam chalega."
[Pause: 400ms]

LINE 2 (Smartphone):
"Smartphone वाले को app में सब कुछ मिलेगा — video call, chat, alerts।"
"Smartphone wale ko app mein sab kuch milega — video call, chat, alerts."
[Pause: 400ms]

LINE 3 (Keypad phone):
"Keypad phone वाले के पास नई booking आने पर call आएगी — number दबाओ, booking accept करो।"
"Keypad phone wale ke paas nayi booking aane par call aayegi — number dabao, booking accept karo."
[Pause: 500ms]

LINE 4 (THE KEY LINE — family inclusion):
"और अगर registration में बेटा या परिवार मदद करे — कोई बात नहीं।"
"Aur agar registration mein beta ya parivar madad kare — koi baat nahi."
[Pause: 300ms]

LINE 5 (Reassurance):
"पूजा आपको मिलेगी। पैसे आपके खाते में।"
"Pooja aapko milegi. Paise aapke khate mein."
[Pause: 400ms]

LINE 6 (Next):
"'आगे' बोलें।"
"'Aage' bolein."

[Total duration: ~16s]

STT STARTS: 1000ms after LINE 6 ends
```

---

### S-0.9: TRAVEL ITINERARY + CALENDAR

```
[SCREEN]         S-0.9 Travel + Calendar
[TRIGGER]        on_screen_load, delay: 400ms
[VOICE]          ratan
[SPEED]          0.90
[PAUSE_AFTER_MS] 800ms

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LINE 1 (Travel):
"Booking confirm होते ही — आपकी पसंद के हिसाब से — train हो, bus हो, या cab — पूरी यात्रा की planning platform कर देगा।"
"Booking confirm hote hi — aapki pasand ke hisaab se — train ho, bus ho, ya cab — poori yatra ki planning platform kar dega."
[Pause: 400ms]

LINE 2 (Hotel + food):
"Hotel से खाने तक।"
"Hotel se khaane tak."
[Pause: 300ms]

LINE 3 (Calendar):
"और calendar में जो दिन आप free नहीं हैं — एक बार set करो।"
"Aur calendar mein jo din aap free nahi hain — ek baar set karo."
[Pause: 300ms]

LINE 4 (Double booking killer):
"Platform उन दिनों किसी को नहीं भेजेगा। Double booking हो ही नहीं सकती।"
"Platform un dino kisi ko nahi bhejega. Double booking ho hi nahi sakti."
[Pause: 400ms]

LINE 5 (Next):
"'आगे' बोलें।"
"'Aage' bolein."

[Total duration: ~14s]

STT STARTS: 800ms after LINE 5 ends
```

---

### S-0.10: VIDEO VERIFICATION — BADGE = BENEFIT

```
[SCREEN]         S-0.10 Video Verification
[TRIGGER]        on_screen_load, delay: 400ms
[VOICE]          ratan
[SPEED]          0.88
[PAUSE_AFTER_MS] 1000ms

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LINE 1 (Lead with reward, not requirement):
"Verified होने का मतलब है — ज़्यादा bookings।"
"Verified hone ka matlab hai — zyaada bookings."
[Pause: 300ms]

LINE 2 (The data):
"Data यह कहता है — Verified पंडितों को तीन गुना ज़्यादा bookings मिलती हैं।"
"Data yeh kahta hai — Verified panditon ko teen guna zyaada bookings milti hain."
[Pause: 400ms]

LINE 3 (The requirement — positioned as small):
"इसके लिए हर पूजा के लिए सिर्फ दो मिनट का video देना होगा — एक बार।"
"Iske liye har pooja ke liye sirf do minute ka video dena hoga — ek baar."
[Pause: 300ms]

LINE 4 (Privacy — kills the main objection):
"यह video सिर्फ हमारी admin team देखेगी।"
"Yeh video sirf humari admin team dekhegi."
[Pause: 300ms]

LINE 5 (Privacy reinforced):
"Public नहीं होगी। आपकी privacy safe है।"
"Public nahi hogi. Aapki privacy safe hai."
[Pause: 500ms]

LINE 6 (Almost done — progress encouragement):
"बस एक और screen बाकी है।"
"Bas ek aur screen baaki hai."
[Pause: 300ms]

LINE 7 (Next):
"'आगे' बोलें।"
"'Aage' bolein."

[Total duration: ~16s]

STT STARTS: 1000ms after LINE 7 ends
```

---

### S-0.11: 4 GUARANTEES — SUMMARY

```
[SCREEN]         S-0.11 4 Guarantees
[TRIGGER]        on_screen_load, delay: 300ms
[VOICE]          ratan
[SPEED]          0.90
[PAUSE_AFTER_MS] 800ms

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LINE 1 (Setup):
"यह रहे HmarePanditJi के चार वादे।"
"Yeh rahe HmarePanditJi ke chaar vaade."
[Pause: 400ms]

LINE 2 (Card 1 — animates in as it's spoken):
"एक — सम्मान। Verified badge, izzat बनी रहे, कोई मोलभाव नहीं।"
"Ek — Samman. Verified badge, izzat bani rahe, koi moalbhav nahi."
[Pause: 400ms]

LINE 3 (Card 2):
"दो — सुविधा। आवाज़ से सब काम, यात्रा की planning अपने आप।"
"Do — Suwidha. Aawaz se sab kaam, yatra ki planning apne aap."
[Pause: 400ms]

LINE 4 (Card 3):
"तीन — सुरक्षा। पैसा तय, तुरंत मिलेगा, कोई धोखा नहीं।"
"Teen — Suraksha. Paisa tay, turant milega, koi dhoka nahi."
[Pause: 400ms]

LINE 5 (Card 4):
"चार — समृद्धि। Offline, online, backup — तीन जगह से नया पैसा।"
"Chaar — Samridhdhi. Offline, online, backup — teen jagah se naya paisa."
[Pause: 600ms]

LINE 6 (Social proof — placed LAST, not first):
"तीन लाख से ज़्यादा पंडित पहले से जुड़ चुके हैं।"
"Teen lakh se zyaada Pandit pehle se jud chuke hain."
[Pause: 500ms]

LINE 7 (CTA setup):
"अब Registration की बारी।"
"Ab Registration ki baari."

[Total duration: ~18s]

STT STARTS: 800ms after LINE 7 ends
STT LISTENS FOR: FORWARD/YES (→ S-0.12) / SKIP (→ Registration directly)
```

---

### S-0.12: FINAL CTA — REGISTRATION DECISION

```
[SCREEN]         S-0.12 Final CTA
[TRIGGER]        on_screen_load, delay: 500ms
[VOICE]          ratan
[SPEED]          0.88 for main script, 0.92 for confirmation
[PAUSE_AFTER_MS] 1500ms (this is a decision — give Pandit time to read)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LINE 1 (Wrap-up):
"बस इतना था HmarePanditJi का परिचय।"
"Bas itna tha HmarePanditJi ka parichay."
[Pause: 400ms]

LINE 2 (The ask):
"अब आप registration शुरू कर सकते हैं — बिल्कुल मुफ़्त, दस मिनट लगेंगे।"
"Ab aap registration shuru kar sakte hain — bilkul muft, das minute lagenge."
[Pause: 400ms]

LINE 3 (The choice — no pressure):
"क्या आप अभी शुरू करना चाहेंगे? 'हाँ' बोलें या नीचे button दबाएं।"
"Kya aap abhi shuru karna chahenge? 'Haan' bolein ya neeche button dabayein."
[Pause: 400ms]

LINE 4 (Help option):
"अगर कोई सवाल हो — screen पर helpline number है — बिल्कुल free।"
"Agar koi sawaal ho — screen par helpline number hai — bilkul free."

[Total duration: ~14s]

STT STARTS: 1500ms after LINE 4 ends
STT LISTENS FOR: YES (→ Registration) / NO/LATER (→ Dashboard + "baad mein" flow)

[TRIGGER]        on_yes_tapped_or_said (REGISTRATION)
"बहुत अच्छा! अब हम registration शुरू करते हैं।"
"Bahut achha! Ab hum registration shuru karte hain."
[Duration: ~3s] → Brief confetti → Route to /onboarding/register

[TRIGGER]        on_later_tapped (BAAD MEIN)
"ठीक है। जब भी तैयार हों, app खोलें और 'Registration' button दबाएं।"
"Theek hai. Jab bhi tayyar hon, app kholein aur 'Registration' button dabayein."
[Duration: ~4s] → Route to /dashboard

[TRIGGER]        on_timeout_30s (no response — final screen, longer patience)
"जब भी आप तैयार हों। App यहाँ रहेगा। Screen पर helpline number भी है।"
"Jab bhi aap tayyar hon. App yahan rahega. Screen par helpline number bhi hai."
[Duration: ~4s] → Remain on screen indefinitely until action
```

---

## GLOBAL ERROR + REPROMPT SCRIPTS

### Universal Error Responses (STT Failure)

```
[TRIGGER]        STT_FAILURE_1 (first unrecognized input)
"माफ़ कीजिए, फिर से बोलिए — थोड़ा धीरे और साफ़।"
"Maaf kijiye, phir se boliye — thoda dheere aur saaf."
[Duration: ~3s]

[TRIGGER]        STT_FAILURE_2 (second unrecognized input)
"आवाज़ समझ नहीं आई। कोई बात नहीं — नीचे button भी है।"
"Aawaz samajh nahi aayi. Koi baat nahi — neeche button bhi hai."
[Duration: ~3s]

[TRIGGER]        STT_FAILURE_3 (third failure — keyboard offer)
"Keyboard से जवाब दीजिए। नीचे ⌨️ button छूइए।"
"Keyboard se jawab dijiye. Neeche ⌨️ button chhoiye."
[Duration: ~3s] → Keyboard auto-opens

[TRIGGER]        AMBIENT_NOISE_HIGH (>65dB detected)
"शोर बहुत ज़्यादा है। Keyboard try करें या शांत जगह जाएं।"
"Shor bahut zyaada hai. Keyboard try karein ya shaant jagah jayein."
[Duration: ~3s]
```

### Confirmation Scripts (After User Action)

```
[TRIGGER]        ON_SWIPE_BACK (from any tutorial screen)
[NO VOICE] — Swiping back should feel instant, not slow with TTS

[TRIGGER]        ON_SKIP_CONFIRM (user said/tapped Skip)
"ठीक है। सीधे Registration पर ले जाते हैं।"
"Theek hai. Seedhe Registration par le jaate hain."
[Duration: ~2s]

[TRIGGER]        ON_LANGUAGE_CHANGE_WIDGET_OPENED (🌐 tapped mid-tutorial)
[NO VOICE] — Sheet opens silently (TTS would be jarring here)

[TRIGGER]        ON_LANGUAGE_CHANGE_CONFIRMED (new language selected in widget)
"[NEW LANGUAGE] सेट हो गई।"
"[NEW LANGUAGE] set ho gayi."
[Duration: ~1.5s] → Resume current screen in new language
```

---

# ════════════════════════════════════════════════════════════
# PART 3: IMPLEMENTATION PROMPTS FOR YOUR AI MODEL
# ════════════════════════════════════════════════════════════

---

## VOICE-IMPL-00: MASTER CONTEXT (Paste First Every Session)

```
YOU ARE IMPLEMENTING: Voice system for HmarePanditJi Pandit App
APP: apps/pandit in Turborepo monorepo, Next.js 14 App Router, TypeScript
PORT: 3002
TASK IN THIS SESSION: Voice system (TTS + STT using Sarvam AI + Deepgram)

VOICE ARCHITECTURE:
  TTS: Sarvam AI Bulbul v3 → fallback: Web Speech API
  STT: Deepgram Nova-3 (Hindi/English) → Sarvam Saaras v3 (Regional) → fallback: Web Speech API

API ENDPOINTS:
  Sarvam TTS:  POST https://api.sarvam.ai/text-to-speech
  Sarvam STT:  WebSocket wss://api.sarvam.ai/speech-to-text-streaming
  Deepgram STT: WebSocket wss://api.deepgram.com/v1/listen

ENVIRONMENT VARIABLES NEEDED (add to apps/pandit/.env.local):
  NEXT_PUBLIC_SARVAM_API_KEY=     ← Get from dashboard.sarvam.ai
  NEXT_PUBLIC_DEEPGRAM_API_KEY=   ← Get from console.deepgram.com
  [Note: In production, route through your API server, not client-side keys]

SARVAM TTS REQUEST FORMAT:
  POST https://api.sarvam.ai/text-to-speech
  Headers: { "api-subscription-key": SARVAM_API_KEY, "Content-Type": "application/json" }
  Body: {
    "inputs": ["text to speak"],
    "target_language_code": "hi-IN",  // or "ta-IN", "te-IN", etc.
    "speaker": "ratan",               // warm, respectful male voice
    "pitch": 0,
    "pace": 0.9,                      // 0.9x speed for elderly users
    "loudness": 1.0,
    "speech_sample_rate": 22050,
    "enable_preprocessing": true,     // handles numbers, abbreviations
    "model": "bulbul:v3"
  }
  Response: { "audios": ["base64_mp3_string"] }
  
  To play: 
    const audio = new Audio(`data:audio/mp3;base64,${response.audios[0]}`)
    audio.play()

DEEPGRAM STT WEBSOCKET FORMAT:
  URL: wss://api.deepgram.com/v1/listen?model=nova-3&language=hi&encoding=linear16&sample_rate=16000&endpointing=800&keyterm=haan&keyterm=nahi&keyterm=dakshina&keyterm=pooja
  Headers: { "Authorization": `Token ${DEEPGRAM_API_KEY}` }
  Send: Raw PCM audio data from MediaRecorder
  Receive: JSON with transcript and confidence

CRITICAL RULES:
1. TTS audio plays BEFORE STT starts (never overlap)
2. Minimum 300ms gap between TTS end and STT start
3. STT timeout: 12000ms (12 seconds) before first re-prompt
4. Never say "error" or "invalid" in any user-facing message
5. All error messages must suggest the NEXT action, not describe the failure
6. Pandit's voice is never stored — only transcript text
```

---

## VOICE-IMPL-01: SARVAM TTS SERVICE

```
[PASTE VOICE-IMPL-00 CONTEXT FIRST]

TASK: Create the Sarvam TTS service.
Create ONE file only.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FILE: apps/pandit/lib/sarvam-tts.ts
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

'use client'

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────

export type SarvamLanguageCode =
  | 'hi-IN'   // Hindi
  | 'bn-IN'   // Bengali
  | 'ta-IN'   // Tamil
  | 'te-IN'   // Telugu
  | 'kn-IN'   // Kannada
  | 'ml-IN'   // Malayalam
  | 'mr-IN'   // Marathi
  | 'gu-IN'   // Gujarati
  | 'pa-IN'   // Punjabi
  | 'or-IN'   // Odia (Sarvam uses 'od-IN' or 'or-IN' — check docs)
  | 'en-IN'   // English (Indian accent)

export type SarvamSpeaker =
  | 'ratan'    // Warm, respectful adult male — USE THIS for Pandit app
  | 'kabir'    // Authoritative adult male
  | 'aditya'   // Young male
  | 'priya'    // Adult female
  | 'neha'     // Young female

export interface SarvamTTSOptions {
  text: string
  languageCode?: SarvamLanguageCode
  speaker?: SarvamSpeaker
  pace?: number          // 0.5 to 2.0. Use 0.9 for elderly users.
  pitch?: number         // -1 to 1. Use 0 (neutral).
  loudness?: number      // 0.5 to 2.0. Use 1.0.
  onStart?: () => void
  onEnd?: () => void
  onError?: (error: string) => void
}

// ─────────────────────────────────────────────────────────────
// LANGUAGE → SARVAM CODE MAP
// ─────────────────────────────────────────────────────────────

export const LANGUAGE_TO_SARVAM_CODE: Record<string, SarvamLanguageCode> = {
  'Hindi': 'hi-IN',
  'Bhojpuri': 'hi-IN',    // No dedicated Bhojpuri code — hi-IN handles it
  'Maithili': 'hi-IN',    // Same
  'Bengali': 'bn-IN',
  'Tamil': 'ta-IN',
  'Telugu': 'te-IN',
  'Kannada': 'kn-IN',
  'Malayalam': 'ml-IN',
  'Marathi': 'mr-IN',
  'Gujarati': 'gu-IN',
  'Punjabi': 'pa-IN',
  'Odia': 'or-IN',
  'Sanskrit': 'hi-IN',    // Sanskrit spoken text in hi-IN voice
  'English': 'en-IN',
  'Assamese': 'hi-IN',    // Fallback to hi-IN (Sarvam may add as-IN later)
}

// ─────────────────────────────────────────────────────────────
// ACTIVE AUDIO INSTANCE (singleton — only one plays at a time)
// ─────────────────────────────────────────────────────────────

let activeAudio: HTMLAudioElement | null = null
let activeOnEnd: (() => void) | null = null

export function stopCurrentSpeech(): void {
  if (activeAudio) {
    activeAudio.pause()
    activeAudio.src = ''
    activeAudio = null
  }
  activeOnEnd = null
}

// ─────────────────────────────────────────────────────────────
// MAIN TTS FUNCTION
// ─────────────────────────────────────────────────────────────

export async function speakWithSarvam(options: SarvamTTSOptions): Promise<void> {
  const {
    text,
    languageCode = 'hi-IN',
    speaker = 'ratan',
    pace = 0.9,
    pitch = 0,
    loudness = 1.0,
    onStart,
    onEnd,
    onError,
  } = options

  if (!text || text.trim().length === 0) {
    onEnd?.()
    return
  }

  // Stop any currently playing audio
  stopCurrentSpeech()

  const apiKey = process.env.NEXT_PUBLIC_SARVAM_API_KEY

  // Fallback to Web Speech API if no key or not supported
  if (!apiKey || apiKey === 'undefined' || typeof window === 'undefined') {
    speakWithWebSpeech(text, languageCode, onStart, onEnd)
    return
  }

  try {
    onStart?.()

    const response = await fetch('https://api.sarvam.ai/text-to-speech', {
      method: 'POST',
      headers: {
        'api-subscription-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: [text],
        target_language_code: languageCode,
        speaker,
        pitch,
        pace,
        loudness,
        speech_sample_rate: 22050,
        enable_preprocessing: true,
        model: 'bulbul:v3',
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.warn('[Sarvam TTS] API error:', response.status, errorText)
      // Fallback to Web Speech API
      speakWithWebSpeech(text, languageCode, undefined, onEnd)
      return
    }

    const data = await response.json()

    if (!data.audios || data.audios.length === 0) {
      console.warn('[Sarvam TTS] No audio in response')
      speakWithWebSpeech(text, languageCode, undefined, onEnd)
      return
    }

    // Play the base64 MP3
    const audio = new Audio(`data:audio/mp3;base64,${data.audios[0]}`)
    activeAudio = audio
    activeOnEnd = onEnd ?? null

    audio.onended = () => {
      activeAudio = null
      activeOnEnd = null
      onEnd?.()
    }

    audio.onerror = (e) => {
      console.warn('[Sarvam TTS] Audio playback error:', e)
      activeAudio = null
      activeOnEnd = null
      speakWithWebSpeech(text, languageCode, undefined, onEnd)
    }

    await audio.play().catch(e => {
      console.warn('[Sarvam TTS] Play blocked (autoplay policy?):', e)
      // Autoplay blocked — call onEnd immediately
      activeAudio = null
      onEnd?.()
    })

  } catch (error) {
    console.warn('[Sarvam TTS] Network/parse error:', error)
    onError?.('NETWORK_ERROR')
    speakWithWebSpeech(text, languageCode, undefined, onEnd)
  }
}

// ─────────────────────────────────────────────────────────────
// WEB SPEECH API FALLBACK
// ─────────────────────────────────────────────────────────────

function speakWithWebSpeech(
  text: string,
  languageCode: string,
  onStart?: () => void,
  onEnd?: () => void
): void {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    onEnd?.()
    return
  }

  window.speechSynthesis.cancel()

  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = languageCode
  utterance.rate = 0.85     // Slower than Sarvam since Web Speech sounds rushed
  utterance.pitch = 1.0
  utterance.volume = 1.0

  // Try to find a matching voice
  const voices = window.speechSynthesis.getVoices()
  const langPrefix = languageCode.split('-')[0]
  const matchedVoice = voices.find(v => v.lang.startsWith(langPrefix))
  if (matchedVoice) utterance.voice = matchedVoice

  utterance.onstart = () => { onStart?.() }
  utterance.onend = () => { onEnd?.() }
  utterance.onerror = () => { onEnd?.() }

  // Chrome sometimes needs a delay
  setTimeout(() => {
    window.speechSynthesis.speak(utterance)
  }, 100)
}

// ─────────────────────────────────────────────────────────────
// PRELOAD AUDIO (call this on app start to warm up the service)
// ─────────────────────────────────────────────────────────────

// Cache for pre-loaded audio (key = text + languageCode)
const audioCache = new Map<string, string>()

export async function preloadAudio(
  text: string,
  languageCode: SarvamLanguageCode = 'hi-IN',
  speaker: SarvamSpeaker = 'ratan',
  pace: number = 0.9
): Promise<void> {
  const cacheKey = `${text}::${languageCode}::${speaker}`
  if (audioCache.has(cacheKey)) return

  const apiKey = process.env.NEXT_PUBLIC_SARVAM_API_KEY
  if (!apiKey) return

  try {
    const response = await fetch('https://api.sarvam.ai/text-to-speech', {
      method: 'POST',
      headers: {
        'api-subscription-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: [text],
        target_language_code: languageCode,
        speaker,
        pace,
        pitch: 0,
        loudness: 1.0,
        speech_sample_rate: 22050,
        enable_preprocessing: true,
        model: 'bulbul:v3',
      }),
    })
    if (!response.ok) return
    const data = await response.json()
    if (data.audios?.[0]) {
      audioCache.set(cacheKey, data.audios[0])
    }
  } catch {
    // Pre-load failure is silent — actual calls will still work
  }
}

export function playFromCache(
  text: string,
  languageCode: SarvamLanguageCode = 'hi-IN',
  speaker: SarvamSpeaker = 'ratan',
  onEnd?: () => void
): boolean {
  const cacheKey = `${text}::${languageCode}::${speaker}`
  const cached = audioCache.get(cacheKey)
  if (!cached) return false

  stopCurrentSpeech()
  const audio = new Audio(`data:audio/mp3;base64,${cached}`)
  activeAudio = audio
  audio.onended = () => { activeAudio = null; onEnd?.() }
  audio.play().catch(() => onEnd?.())
  return true
}

VERIFICATION:
- speakWithSarvam() exists and takes SarvamTTSOptions
- LANGUAGE_TO_SARVAM_CODE maps all 15 languages
- stopCurrentSpeech() cancels active audio
- Web Speech API fallback works when no API key
- preloadAudio() exists for caching
- File has 'use client' at top
```

---

## VOICE-IMPL-02: DEEPGRAM STT SERVICE (HINDI PRIMARY)

```
[PASTE VOICE-IMPL-00 CONTEXT FIRST]

TASK: Create the Deepgram Nova-3 STT service for Hindi/English recognition.
Create ONE file only.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FILE: apps/pandit/lib/deepgram-stt.ts
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

'use client'

export interface DeepgramSTTConfig {
  language?: string       // 'hi' for Hindi, 'en-IN' for Indian English
  onTranscript: (text: string, confidence: number, isFinal: boolean) => void
  onStateChange?: (state: 'connecting' | 'listening' | 'processing' | 'error' | 'stopped') => void
  onError?: (error: string) => void
  keyterms?: string[]    // Domain-specific words to boost accuracy
}

// ─────────────────────────────────────────────────────────────
// POOJA VOCABULARY — Keyterm boosting for Deepgram Nova-3
// These words are domain-specific and might not be in the base model
// ─────────────────────────────────────────────────────────────

export const POOJA_KEYTERMS = [
  // Common responses
  'haan', 'nahi', 'theek', 'sahi', 'bilkul', 'aage', 'wapas',
  'badle', 'skip', 'sahayata', 'madad',
  // City names most Pandits would speak
  'varanasi', 'kashi', 'banaras', 'lucknow', 'patna', 'delhi',
  'prayagraj', 'haridwar', 'rishikesh', 'mathura', 'vrindavan',
  'ujjain', 'nashik', 'gaya', 'tirupati',
  // Religious vocabulary
  'dakshina', 'pooja', 'puja', 'pandit', 'mandir', 'yajna', 'havan',
  'muhurat', 'kundali', 'gotra', 'vidhi', 'sankalp', 'prasad',
  'satyanarayan', 'griha', 'pravesh', 'vivah', 'mundan', 'namkaran',
  'annaprashan', 'shradh', 'navratri', 'ganesh', 'durga',
  // Language names (for S-0.0.4 screen)
  'bhojpuri', 'maithili', 'bengali', 'tamil', 'telugu', 'kannada',
  'malayalam', 'marathi', 'gujarati', 'punjabi', 'odia', 'assamese',
]

// ─────────────────────────────────────────────────────────────
// DEEPGRAM WEBSOCKET MANAGER
// ─────────────────────────────────────────────────────────────

export class DeepgramSTTSession {
  private ws: WebSocket | null = null
  private mediaRecorder: MediaRecorder | null = null
  private mediaStream: MediaStream | null = null
  private config: DeepgramSTTConfig
  private isActive = false

  constructor(config: DeepgramSTTConfig) {
    this.config = config
  }

  async start(): Promise<boolean> {
    if (this.isActive) return false

    const apiKey = process.env.NEXT_PUBLIC_DEEPGRAM_API_KEY
    if (!apiKey || typeof window === 'undefined') return false

    // Get microphone access
    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,    // Critical for temple environment
          autoGainControl: true,
          sampleRate: 16000,
          channelCount: 1,
        },
      })
    } catch (e) {
      this.config.onError?.('MIC_PERMISSION_DENIED')
      return false
    }

    // Build Deepgram WebSocket URL
    const params = new URLSearchParams({
      model: 'nova-3',
      language: this.config.language ?? 'hi',
      encoding: 'linear16',
      sample_rate: '16000',
      channels: '1',
      endpointing: '800',          // 800ms silence = end of speech (longer for elderly)
      interim_results: 'false',    // Only final results
      smart_format: 'true',        // Better punctuation/formatting
      utterance_end_ms: '1500',    // Wait 1.5s after speech ends
      vad_events: 'true',          // Voice Activity Detection events
      ...(this.config.keyterms ? 
        Object.fromEntries(this.config.keyterms.map((k, i) => [`keyterm_${i}`, k])) 
        : {}
      ),
    })

    // Add keyterms as separate params (Deepgram requires repeated params)
    const keytermString = (this.config.keyterms ?? POOJA_KEYTERMS)
      .map(k => `keyterm=${encodeURIComponent(k)}`)
      .join('&')

    const wsUrl = `wss://api.deepgram.com/v1/listen?${params.toString()}&${keytermString}`

    this.config.onStateChange?.('connecting')

    this.ws = new WebSocket(wsUrl, ['token', apiKey])

    this.ws.onopen = () => {
      this.config.onStateChange?.('listening')
      this.startRecording()
    }

    this.ws.onmessage = (event) => {
      try {
        const result = JSON.parse(event.data as string)

        // Handle transcription results
        if (result.type === 'Results' && result.channel?.alternatives?.[0]) {
          const alt = result.channel.alternatives[0]
          const transcript = alt.transcript?.trim() ?? ''
          const confidence = alt.confidence ?? 0
          const isFinal = result.is_final ?? false

          if (transcript && transcript.length > 0) {
            this.config.onStateChange?.('processing')
            this.config.onTranscript(transcript, confidence, isFinal)
          }
        }

        // Handle VAD events (voice activity)
        if (result.type === 'UtteranceEnd') {
          // User finished speaking — good signal
        }

      } catch {
        // JSON parse error — ignore
      }
    }

    this.ws.onerror = () => {
      this.config.onError?.('WEBSOCKET_ERROR')
      this.config.onStateChange?.('error')
      this.stop()
    }

    this.ws.onclose = (event) => {
      if (this.isActive && event.code !== 1000) {
        this.config.onError?.('CONNECTION_CLOSED')
      }
      this.config.onStateChange?.('stopped')
      this.isActive = false
    }

    this.isActive = true
    return true
  }

  private startRecording(): void {
    if (!this.mediaStream || !this.ws) return

    this.mediaRecorder = new MediaRecorder(this.mediaStream, {
      mimeType: 'audio/webm;codecs=pcm',
    })

    // For browsers that don't support audio/webm;codecs=pcm:
    if (!MediaRecorder.isTypeSupported('audio/webm;codecs=pcm')) {
      this.mediaRecorder = new MediaRecorder(this.mediaStream)
    }

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0 && this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(event.data)
      }
    }

    this.mediaRecorder.start(250) // Send audio in 250ms chunks
  }

  stop(): void {
    this.isActive = false

    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop()
      this.mediaRecorder = null
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop())
      this.mediaStream = null
    }

    if (this.ws) {
      // Send CloseStream message to Deepgram before closing
      if (this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'CloseStream' }))
      }
      this.ws.close(1000, 'Session ended normally')
      this.ws = null
    }
  }
}

// ─────────────────────────────────────────────────────────────
// SIMPLER FUNCTION-BASED API (for simple yes/no screens)
// ─────────────────────────────────────────────────────────────

// Quick single-shot: listen until speech detected or timeout, return transcript
export function listenOnce(
  language: string = 'hi',
  timeoutMs: number = 12000,
  onResult: (transcript: string) => void,
  onTimeout: () => void
): () => void {  // Returns cleanup function
  const session = new DeepgramSTTSession({
    language,
    keyterms: POOJA_KEYTERMS,
    onTranscript: (text, _confidence, isFinal) => {
      if (isFinal && text.length > 0) {
        cleanup()
        onResult(text)
      }
    },
    onError: () => {
      cleanup()
      onTimeout() // Treat error as timeout for simplicity
    },
  })

  let timer: ReturnType<typeof setTimeout> | null = null

  const cleanup = () => {
    if (timer) clearTimeout(timer)
    session.stop()
  }

  session.start().then(started => {
    if (!started) {
      onTimeout()
      return
    }
    timer = setTimeout(() => {
      cleanup()
      onTimeout()
    }, timeoutMs)
  })

  return cleanup
}

VERIFICATION:
- DeepgramSTTSession class has start() and stop() methods
- POOJA_KEYTERMS array has at least 40 Hindi/religious terms
- listenOnce() returns a cleanup function
- start() requests microphone with noiseSuppression: true
- WebSocket URL includes endpointing=800 parameter
```

---

## VOICE-IMPL-03: UNIFIED VOICE HOOK (THE GLUE)

```
[PASTE VOICE-IMPL-00 CONTEXT FIRST]

TASK: Create the unified voice hook that REPLACES the old voice-engine.ts.
This hook wraps Sarvam TTS + Deepgram STT into one clean API for screens.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FILE: apps/pandit/lib/hooks/useSarvamVoiceFlow.ts
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { speakWithSarvam, stopCurrentSpeech, LANGUAGE_TO_SARVAM_CODE } from '@/lib/sarvam-tts'
import { listenOnce, POOJA_KEYTERMS } from '@/lib/deepgram-stt'
import { SupportedLanguage } from '@/lib/onboarding-store'

// ─────────────────────────────────────────────────────────────
// INTENT DETECTION (Client-side, no API needed)
// ─────────────────────────────────────────────────────────────

type VoiceIntent = 'YES' | 'NO' | 'SKIP' | 'HELP' | 'CHANGE' | 'FORWARD' | 'BACK'

const INTENT_MAP: Record<VoiceIntent, string[]> = {
  YES: ['haan', 'ha ', 'haanji', 'theek', 'sahi', 'bilkul', 'ok', 'yes',
        'accha', 'thik', 'haan ji', 'zaroor', 'shi', 'correct', 'aage badho',
        'kar lo', 'de do', 'allow', 'permission'],
  NO:  ['nahi', 'naa', 'na ', ' na', 'mat', 'no ', 'galat', 'nahi chahiye',
        'nahi karna', 'nahi ji', 'deny', 'block'],
  SKIP: ['skip', 'chodo', 'chhor', 'registration', 'baad mein', 'baad me',
         'later', 'abhi nahi', 'seedha', 'doosra', 'aage jao'],
  HELP: ['sahayata', 'madad', 'help', 'samajh nahi', 'dikkat', 'problem',
         'mushkil', 'nahi samajha', 'confused'],
  CHANGE: ['badle', 'badlo', 'change', 'doosri', 'alag', 'koi aur', 'doosra',
           'change karo', 'nahi yeh'],
  FORWARD: ['aage', 'agla', 'next', 'continue', 'samajh gaya', 'theek hai',
            'aage chalein', 'dekhein', 'dikhao', 'bata', 'jaari'],
  BACK: ['pichhe', 'wapas', 'pehle wala', 'back', 'previous', 'wapas jao'],
}

export function detectVoiceIntent(transcript: string): VoiceIntent | null {
  const normalized = transcript.toLowerCase()
  for (const [intent, words] of Object.entries(INTENT_MAP)) {
    for (const word of words) {
      if (normalized.includes(word)) {
        return intent as VoiceIntent
      }
    }
  }
  return null
}

export function detectCityName(transcript: string): string | null {
  const normalized = transcript.toLowerCase()
  const cityAliases: Record<string, string> = {
    'delhi': 'Delhi', 'dilli': 'Delhi', 'new delhi': 'Delhi',
    'varanasi': 'Varanasi', 'banaras': 'Varanasi', 'kashi': 'Varanasi',
    'benares': 'Varanasi', 'benaras': 'Varanasi',
    'patna': 'Patna', 'lucknow': 'Lucknow', 'lakhnau': 'Lucknow',
    'mumbai': 'Mumbai', 'bombay': 'Mumbai',
    'kolkata': 'Kolkata', 'calcutta': 'Kolkata',
    'chennai': 'Chennai', 'madras': 'Chennai',
    'hyderabad': 'Hyderabad', 'haidrabad': 'Hyderabad',
    'bengaluru': 'Bengaluru', 'bangalore': 'Bengaluru', 'bangaluru': 'Bengaluru',
    'jaipur': 'Jaipur', 'jodhpur': 'Jodhpur', 'udaipur': 'Udaipur',
    'bhopal': 'Bhopal', 'indore': 'Indore', 'ujjain': 'Ujjain',
    'haridwar': 'Haridwar', 'hardwar': 'Haridwar',
    'rishikesh': 'Rishikesh', 'hrishikesh': 'Rishikesh',
    'mathura': 'Mathura', 'agra': 'Agra',
    'prayagraj': 'Prayagraj', 'allahabad': 'Prayagraj',
    'ahmedabad': 'Ahmedabad', 'surat': 'Surat', 'vadodara': 'Vadodara',
    'pune': 'Pune', 'nagpur': 'Nagpur', 'nashik': 'Nashik',
    'chandigarh': 'Chandigarh', 'amritsar': 'Amritsar', 'ludhiana': 'Ludhiana',
    'guwahati': 'Guwahati', 'bhubaneswar': 'Bhubaneswar',
  }
  for (const [alias, city] of Object.entries(cityAliases)) {
    if (normalized.includes(alias)) return city
  }
  return null
}

export function detectLanguageName(transcript: string): string | null {
  const normalized = transcript.toLowerCase()
  const languageAliases: Record<string, string> = {
    'hindi': 'Hindi', 'hindee': 'Hindi',
    'bhojpuri': 'Bhojpuri', 'bhojpori': 'Bhojpuri', 'bhojpuriya': 'Bhojpuri',
    'maithili': 'Maithili', 'maithil': 'Maithili',
    'bengali': 'Bengali', 'bangla': 'Bengali', 'bengali': 'Bengali',
    'tamil': 'Tamil', 'tamizh': 'Tamil', 'tameel': 'Tamil',
    'telugu': 'Telugu', 'telegu': 'Telugu',
    'kannada': 'Kannada', 'kannad': 'Kannada',
    'malayalam': 'Malayalam', 'malayali': 'Malayalam',
    'marathi': 'Marathi',
    'gujarati': 'Gujarati', 'gujrati': 'Gujarati',
    'sanskrit': 'Sanskrit', 'sanskrith': 'Sanskrit',
    'english': 'English', 'angrezi': 'English',
    'odia': 'Odia', 'oriya': 'Odia',
    'punjabi': 'Punjabi', 'panjabi': 'Punjabi',
    'assamese': 'Assamese',
  }
  for (const [alias, language] of Object.entries(languageAliases)) {
    if (normalized.includes(alias)) return language
  }
  return null
}

// ─────────────────────────────────────────────────────────────
// THE MAIN HOOK
// ─────────────────────────────────────────────────────────────

export type VoiceFlowState = 'idle' | 'speaking' | 'listening' | 'processing' | 'error'

interface UseSarvamVoiceFlowOptions {
  language: SupportedLanguage
  script: string                                  // What the app says
  onIntent?: (intent: VoiceIntent | string) => void  // Called with intent OR 'RAW:transcript'
  autoListen?: boolean                            // Listen after TTS? Default: true
  listenTimeoutMs?: number                        // Default: 12000ms
  repromptScript?: string                         // Different text for reprompt
  repromptTimeoutMs?: number                      // When to reprompt. Default: 12000ms
  initialDelayMs?: number                         // Delay before TTS starts. Default: 500ms
  disabled?: boolean                              // Disable the whole flow
}

export function useSarvamVoiceFlow(options: UseSarvamVoiceFlowOptions) {
  const {
    language,
    script,
    onIntent,
    autoListen = true,
    listenTimeoutMs = 12000,
    repromptScript,
    repromptTimeoutMs = 12000,
    initialDelayMs = 500,
    disabled = false,
  } = options

  const [voiceFlowState, setVoiceFlowState] = useState<VoiceFlowState>('idle')
  const repromptCountRef = useRef(0)
  const cleanupSTTRef = useRef<(() => void) | null>(null)
  const mountedRef = useRef(true)

  const sarvamLangCode = LANGUAGE_TO_SARVAM_CODE[language] ?? 'hi-IN'
  // For STT, use short language code
  const deepgramLang = sarvamLangCode.split('-')[0]  // 'hi-IN' → 'hi'

  const startListeningSession = useCallback(() => {
    if (!mountedRef.current || disabled) return

    setVoiceFlowState('listening')

    const cleanup = listenOnce(
      deepgramLang,
      listenTimeoutMs,
      (transcript) => {
        if (!mountedRef.current) return
        setVoiceFlowState('processing')

        // Try to detect a known intent
        const intent = detectVoiceIntent(transcript)

        if (intent) {
          onIntent?.(intent)
        } else {
          // Pass raw transcript for custom handling (city names, language names, etc.)
          onIntent?.(`RAW:${transcript}`)
        }

        setVoiceFlowState('idle')
      },
      () => {
        // Timeout
        if (!mountedRef.current) return
        if (repromptCountRef.current < 1 && repromptScript) {
          repromptCountRef.current++
          setVoiceFlowState('speaking')
          speakWithSarvam({
            text: repromptScript,
            languageCode: sarvamLangCode,
            pace: 0.88,
            onEnd: () => {
              if (mountedRef.current) startListeningSession()
            },
          })
        } else {
          setVoiceFlowState('idle')
          // Signal timeout to parent
          onIntent?.('TIMEOUT')
        }
      }
    )

    cleanupSTTRef.current = cleanup
  }, [deepgramLang, disabled, listenTimeoutMs, onIntent, repromptScript, sarvamLangCode])

  // Start TTS on mount
  useEffect(() => {
    if (disabled || !script) return

    mountedRef.current = true
    repromptCountRef.current = 0

    const timer = setTimeout(() => {
      if (!mountedRef.current) return
      setVoiceFlowState('speaking')

      speakWithSarvam({
        text: script,
        languageCode: sarvamLangCode,
        speaker: 'ratan',
        pace: 0.9,
        onEnd: () => {
          if (!mountedRef.current) return
          if (autoListen) {
            // Wait 300ms then start listening
            setTimeout(() => {
              if (mountedRef.current) startListeningSession()
            }, 300)
          } else {
            setVoiceFlowState('idle')
          }
        },
      })
    }, initialDelayMs)

    return () => {
      mountedRef.current = false
      clearTimeout(timer)
      stopCurrentSpeech()
      cleanupSTTRef.current?.()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run once on mount

  const isListening = voiceFlowState === 'listening'
  const isSpeaking = voiceFlowState === 'speaking'

  return { voiceFlowState, isListening, isSpeaking }
}

VERIFICATION:
- detectVoiceIntent() maps all common Hindi responses to VoiceIntent
- detectCityName() maps spoken city names to English city names
- detectLanguageName() maps spoken language names to SupportedLanguage values
- useSarvamVoiceFlow() returns { voiceFlowState, isListening, isSpeaking }
- Cleanup function stops both TTS and STT on unmount
- repromptCountRef prevents infinite re-prompting (max 1 reprompt)
```

---

## VOICE-IMPL-04: PRELOAD CRITICAL SCRIPTS AT APP STARTUP

```
[PASTE VOICE-IMPL-00 CONTEXT FIRST]

TASK: Create a script preloader that warms up the most important audio
during the 3-second splash screen. This eliminates the first-voice delay.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FILE: apps/pandit/lib/voice-preloader.ts
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

'use client'

import { preloadAudio, SarvamLanguageCode } from '@/lib/sarvam-tts'

// Scripts that MUST be ready before the user reaches their screen
// Listed in order of priority (preload in this order)
const CRITICAL_PRELOADS: Array<{ text: string; lang: SarvamLanguageCode }> = [
  // S-0.0.2 — First spoken words after splash
  {
    text: 'नमस्ते। मैं आपका शहर जानना चाहता हूँ — ताकि आपकी भाषा अपने आप सेट हो जाए, और आपके शहर की पूजाएं आपको मिलें। आपका पूरा पता किसी को नहीं दिखेगा। क्या आप अनुमति देंगे?',
    lang: 'hi-IN',
  },
  // Generic positive responses (used everywhere)
  { text: 'बहुत अच्छा।', lang: 'hi-IN' },
  { text: 'कोई बात नहीं।', lang: 'hi-IN' },
  // S-0.0.3 fallback (will be dynamic, but Hindi version ready)
  { text: 'हिंदी के हिसाब से हम हिंदी सेट कर रहे हैं। क्या यह ठीक है?', lang: 'hi-IN' },
  // Error messages
  { text: 'माफ़ कीजिए, फिर से बोलिए — थोड़ा धीरे और साफ़।', lang: 'hi-IN' },
  { text: 'आवाज़ समझ नहीं आई। कोई बात नहीं — नीचे button भी है।', lang: 'hi-IN' },
]

// Preload these during splash screen (runs in background)
export async function preloadCriticalAudio(): Promise<void> {
  for (const item of CRITICAL_PRELOADS) {
    await preloadAudio(item.text, item.lang, 'ratan', 0.9)
    // Small delay between requests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 200))
  }
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
UPDATE: apps/pandit/app/onboarding/screens/SplashScreen.tsx
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Add this inside the SplashScreen component's useEffect (during the 3s splash window):

import { preloadCriticalAudio } from '@/lib/voice-preloader'

// In useEffect:
preloadCriticalAudio() // Fire and forget — runs in background during splash
```

---

## VOICE-IMPL-05: UPDATE ALL SCREENS TO USE NEW VOICE HOOKS

```
[PASTE VOICE-IMPL-00 CONTEXT FIRST]

TASK: Update existing screens to use useSarvamVoiceFlow instead of old voice engine.
This is a find-and-replace operation across multiple files.

In EVERY file that currently imports from '@/lib/voice-engine' OR '@/lib/hooks/useVoiceFlow':

STEP 1: Replace the import:
  OLD: import { useVoiceFlow } from '@/lib/hooks/useVoiceFlow'
  NEW: import { useSarvamVoiceFlow } from '@/lib/hooks/useSarvamVoiceFlow'

STEP 2: Replace the hook call:
  OLD: const { isListening } = useVoiceFlow({ language, voiceScript: '...' ... })
  NEW: const { isListening, isSpeaking } = useSarvamVoiceFlow({ language, script: '...' ... })
  [Note: 'voiceScript' parameter is now called 'script']

STEP 3: In apps/pandit/lib/voice-engine.ts:
  Mark the file as DEPRECATED but keep it for now (don't delete — it's the Web Speech fallback).
  The sarvam-tts.ts and deepgram-stt.ts already call Web Speech API as fallback internally.

COMPLETE VOICE SCRIPT REFERENCE (use these exact strings in each screen):

LanguageConfirmScreen.tsx:
  script: `${detectedCity} के हिसाब से हम ${LANGUAGE_DISPLAY[language].nativeName} सेट कर रहे हैं। क्या यह ठीक है? 'हाँ' बोलें या 'बदलें' बोलें।`
  repromptScript: "कृपया 'हाँ' या 'बदलें' बोलें, या नीचे button दबाएं।"

ManualCityScreen.tsx:
  script: "कोई बात नहीं। बस अपना शहर बताइए। बोल सकते हैं — जैसे 'वाराणसी' या 'दिल्ली' — या नीचे से छू सकते हैं।"
  repromptScript: "कृपया अपना शहर का नाम बोलिए। जैसे 'दिल्ली', 'वाराणसी', 'मुंबई'।"

LanguageListScreen.tsx:
  script: "कृपया अपनी भाषा का नाम बोलिए। जैसे — 'भोजपुरी', 'Tamil', 'Telugu', 'Bengali' — या नीचे से चुनें।"
  repromptScript: "आवाज़ नहीं पहचान पाया। नीचे से भाषा छूकर चुनें।"

LanguageChoiceConfirmScreen.tsx:
  script: `आपने ${LANGUAGE_DISPLAY[pendingLanguage].nativeName} कही। सही है? 'हाँ' बोलें या 'नहीं' बोलें।`
  repromptScript: `${LANGUAGE_DISPLAY[pendingLanguage].nativeName} — सही है? बटन दबाइए।`

VoiceTutorialScreen.tsx:
  script: "एक छोटी सी बात। यह app आपकी आवाज़ से चलता है। जब orange mic दिखे — तब बोलिए। अभी कोशिश करिए — 'हाँ' या 'नहीं' बोलिए।"
  autoListen: false  ← This screen manages its own separate demo listening

TutorialSwagat.tsx:
  script: "नमस्ते पंडित जी। HmarePanditJi पर आपका बहुत-बहुत स्वागत है। यह platform आपके लिए ही बना है। अगले दो मिनट में हम देखेंगे कि यह app आपकी आमदनी में क्या बदलाव ला सकता है।"

TutorialIncome.tsx:
  script: "सुनिए, वाराणसी के पंडित रामेश्वर शर्मा जी पहले महीने में अठारह हज़ार रुपये कमाते थे। आज वे तीन नए तरीकों से तिरसठ हज़ार कमा रहे हैं। मैं आपको भी यही तीन तरीके दिखाता हूँ।"

TutorialDakshina.tsx:
  script: "कितनी बार ऐसा हुआ है कि आपने दो घंटे की पूजा की — और ग्राहक ने कह दिया, दो हज़ार ले लो। आप कुछ नहीं बोल पाए। अब नहीं होगा यह। आप खुद दक्षिणा तय करेंगे। मोलभाव खत्म।"

TutorialOnlineRevenue.tsx:
  script: "दो बिल्कुल नए तरीके हैं। पहला — घर बैठे पूजा। Video call से पूजा कराइए। एक पूजा में दो हज़ार से पाँच हज़ार रुपये। दूसरा — पंडित से बात। बीस मिनट की एक call में आठ सौ रुपये सीधे आपको।"

TutorialBackup.tsx:
  script: "यह सुनकर लगेगा — यह कैसे हो सकता है। मैं समझाता हूँ। जब कोई booking होती है — आपको offer आता है। आप हाँ कहते हैं। उस दिन free रहते हैं। मुख्य पंडित ने पूजा कर ली — भी आपको दो हज़ार। मुख्य पंडित cancel किए — पूरी booking आपकी और ऊपर से दो हज़ार। दोनों तरफ से फ़ायदा।"

TutorialPayment.tsx:
  script: "पूजा खत्म हुई। दो मिनट में पैसे बैंक में। कोई इंतज़ार नहीं। और platform का share भी screen पर दिखेगा। छुपा कुछ नहीं।"

TutorialVoiceNav.tsx:
  script: "यह app आपकी आवाज़ से चलता है। टाइपिंग की कोई ज़रूरत नहीं। अभी कोशिश करिए — 'हाँ' या 'नहीं' बोलिए। Mic अभी सुन रहा है।"
  autoListen: false  ← Demo has its own separate mic management

TutorialDualMode.tsx:
  script: "चाहे आपके पास smartphone हो या keypad phone — दोनों से काम चलेगा। और अगर registration में बेटा या परिवार मदद करे — कोई बात नहीं। पूजा आपको मिलेगी। पैसे आपके खाते में।"

TutorialTravel.tsx:
  script: "Booking confirm होते ही — train हो, bus हो, या cab — पूरी यात्रा की planning platform कर देगा। Hotel से खाने तक। और calendar में जो दिन आप free नहीं हैं — एक बार set करो। Double booking हो ही नहीं सकती।"

TutorialVideoVerify.tsx:
  script: "Verified होने का मतलब है — ज़्यादा bookings। Verified पंडितों को तीन गुना ज़्यादा bookings मिलती हैं। इसके लिए हर पूजा के लिए सिर्फ दो मिनट का video — एक बार। यह video सिर्फ हमारी admin team देखेगी। Public नहीं होगी।"

TutorialGuarantees.tsx:
  script: "यह रहे HmarePanditJi के चार वादे। एक — सम्मान। दो — सुविधा। तीन — सुरक्षा। चार — समृद्धि। तीन लाख से ज़्यादा पंडित पहले से जुड़ चुके हैं। अब Registration की बारी।"

TutorialCTA.tsx:
  script: "बस इतना था HmarePanditJi का परिचय। अब आप registration शुरू कर सकते हैं — बिल्कुल मुफ़्त, दस मिनट लगेंगे। क्या आप अभी शुरू करना चाहेंगे?"
  repromptScript: "Registration के लिए 'हाँ' बोलें। बाद में करने के लिए 'बाद में' बोलें।"

VERIFICATION: After updates, confirm:
- All screens use useSarvamVoiceFlow (not old useVoiceFlow)
- The 'script' parameter contains the EXACT Hindi text from Part 2 above
- TutorialVoiceNav and VoiceTutorialScreen have autoListen: false
- All 'repromptScript' values are shorter than the main script
```

---

## VOICE-IMPL-06: ENV + API KEY SECURITY

```
[PASTE VOICE-IMPL-00 CONTEXT FIRST]

TASK: Set up secure API key handling.
CRITICAL SECURITY NOTE: Never expose API keys directly in client-side code for production.
For Phase 1 (MVP), we use a Next.js API route as proxy.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FILE: apps/pandit/app/api/tts/route.ts (API Route Proxy)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const body = await request.json()

  const apiKey = process.env.SARVAM_API_KEY  // Server-side only (no NEXT_PUBLIC_)
  if (!apiKey) {
    return NextResponse.json({ error: 'TTS not configured' }, { status: 503 })
  }

  try {
    const sarvamResponse = await fetch('https://api.sarvam.ai/text-to-speech', {
      method: 'POST',
      headers: {
        'api-subscription-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: [body.text],
        target_language_code: body.languageCode ?? 'hi-IN',
        speaker: body.speaker ?? 'ratan',
        pitch: 0,
        pace: body.pace ?? 0.9,
        loudness: 1.0,
        speech_sample_rate: 22050,
        enable_preprocessing: true,
        model: 'bulbul:v3',
      }),
    })

    if (!sarvamResponse.ok) {
      return NextResponse.json({ error: 'TTS failed' }, { status: 500 })
    }

    const data = await sarvamResponse.json()
    return NextResponse.json({ audio: data.audios?.[0] })

  } catch {
    return NextResponse.json({ error: 'TTS error' }, { status: 500 })
  }
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
UPDATE: apps/pandit/lib/sarvam-tts.ts
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
In the speakWithSarvam function, REPLACE the direct API call with:

const response = await fetch('/api/tts', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ text, languageCode, speaker, pace }),
})
const data = await response.json()

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FILE: apps/pandit/.env.local (create if not exists)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Server-side only (no NEXT_PUBLIC_ prefix = never exposed to browser)
SARVAM_API_KEY=your_sarvam_api_key_here
DEEPGRAM_API_KEY=your_deepgram_api_key_here

# How to get keys:
# Sarvam: dashboard.sarvam.ai → API Keys → Create New Key → ₹1,000 free credits
# Deepgram: console.deepgram.com → API Keys → Create New Key → $200 free credits

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
NOTE FOR DEEPGRAM (STT):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Deepgram STT uses WebSocket which cannot be proxied easily through Next.js API routes.
For Phase 1 MVP, use NEXT_PUBLIC_DEEPGRAM_API_KEY (acceptable for MVP, change in production).
Production solution: Use Deepgram's server-side SDK in an API route + pass transcript back via SSE.

Add to .env.local:
NEXT_PUBLIC_DEEPGRAM_API_KEY=your_deepgram_api_key_here

VERIFICATION:
- apps/pandit/app/api/tts/route.ts exists and uses server-side SARVAM_API_KEY
- sarvam-tts.ts calls '/api/tts' not 'https://api.sarvam.ai' directly
- .env.local has both keys
- .env.local is in .gitignore (it should already be by default in Next.js)
```

---

# ════════════════════════════════════════════════════════════
# PART 4: TESTING CHECKLIST
# ════════════════════════════════════════════════════════════

```
HOW TO TEST THE VOICE SYSTEM BEFORE LAUNCH:

STEP 1: Get API keys
  Sarvam: dashboard.sarvam.ai → free ₹1,000 credits → enough for 1000+ onboarding sessions
  Deepgram: console.deepgram.com → $200 free → enough for 300+ hours of STT

STEP 2: Test TTS quality
  Open Chrome DevTools Console and run:
  fetch('/api/tts', {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({text: 'नमस्ते पंडित जी। आपका स्वागत है।', languageCode: 'hi-IN'})
  }).then(r => r.json()).then(d => {
    new Audio('data:audio/mp3;base64,' + d.audio).play()
  })

  Expected: You hear a warm male voice saying the Hindi text naturally.
  If it sounds robotic: check that model is 'bulbul:v3' and speaker is 'ratan'.

STEP 3: Test STT recognition
  Go to S-0.7 (Voice Navigation Demo screen)
  Allow microphone permission
  Say clearly: "हाँ"
  Expected: Success animation appears within 1 second

STEP 4: Test with regional accent
  Say "badle" (Bhojpuri pronunciation), "theek baa" (Bhojpuri for 'theek hai')
  Expected: Deepgram still recognizes YES intent
  If fails: Add more alias variants to INTENT_MAP in useSarvamVoiceFlow.ts

STEP 5: Test noise resilience
  Play temple bells audio from YouTube nearby
  Try saying "haan"
  Expected: App still recognizes after 1-2 attempts

STEP 6: Test fallback
  Remove API key from .env.local temporarily
  Run the app
  Expected: App still speaks (Web Speech API fallback), no errors shown to user

STEP 7: Test on real device
  Use Chrome's DevTools Remote Debugging with a real Android phone
  Play the full flow from S-0.0.1 (Splash) to S-0.12 (Final CTA)
  Time it: Should complete in under 4 minutes if Pandit moves through quickly
```

---

# ════════════════════════════════════════════════════════════
# APPENDIX: QUICK COPY-PASTE SCRIPTS IN ROMAN (FOR DEVELOPER REFERENCE)
# ════════════════════════════════════════════════════════════

```
All scripts below in Roman Hindi for quick developer reference.
ALWAYS use the Devanagari versions in the actual API calls to Sarvam.

S-0.0.2: "Namaste. Main aapka shehar jaanna chahta hoon — taaki aapki bhasha apne aap set ho jaye. Aapka poora pata kisi ko nahi dikhega. Kya aap anumati denge?"

S-0.0.2B: "Koi baat nahi. Bas apna shehar bataiye. Bol sakte hain — jaise 'Varanasi' ya 'Delhi' — ya neeche se chhoo sakte hain."

S-0.0.3: "[CITY] ke hisaab se hum [LANGUAGE] set kar rahe hain. Kya yeh theek hai? 'Haan' bolein ya 'Badle' bolein."

S-0.0.4: "Kripya apni bhasha ka naam boliye. Jaise — 'Bhojpuri', 'Tamil', 'Telugu', 'Bengali' — ya neeche se chunein."

S-0.0.5: "Aapne [LANGUAGE] kahi. Sahi hai? 'Haan' bolein ya 'Nahi' bolein."

S-0.0.6: "Bahut achha! Ab hum aapse [LANGUAGE] mein baat karenge."

S-0.0.8: "Ek chhoti si baat. Yeh app aapki aawaz se chalta hai. Jab orange mic dikhe — tab boliye. Abhi koshish kariye — 'Haan' ya 'Nahi' boliye."

S-0.1: "Namaste Pandit Ji. HmarePanditJi par aapka bahut-bahut swagat hai. Yeh platform aapke liye hi bana hai."

S-0.2: "Suniye, Varanasi ke Pandit Rameshwar Sharma Ji pehle mahine mein aatharah hazaar rupaye kamate the. Aaj woh tirsath hazaar kama rahe hain. Main aapko bhi yahi teen tarike dikhata hoon."

S-0.3: "Kitni baar aisa hua hai ki aapne do ghante ki pooja ki — aur grahak ne keh diya, do hazaar le lo. Aap kuch nahi bol paye. Ab nahi hoga yeh. Moalbhav khatam."

S-0.4: "Do bilkul naye tarike hain. Pehla — Ghar Baithe Pooja. Video call se pooja karaiye. Ek pooja mein do hazaar se paanch hazaar rupaye. Doosra — Pandit Se Baat. Bees minute ki ek call mein aath sau rupaye seedhe aapko."

S-0.5: "Yeh sunkar lagega — yeh kaise ho sakta hai. Main samjhata hoon. Agar mukhya Pandit ne pooja kar li — bhi aapko do hazaar. Agar mukhya Pandit cancel kiye — poori booking aapki aur upar se do hazaar. Dono taraf se faayda."

S-0.6: "Pooja khatam hui. Do minute mein paise bank mein. Koi intezaar nahi. Platform ka share bhi screen par dikhega. Chhupa kuch nahi."

S-0.7: "Yeh app aapki aawaz se chalta hai. Abhi koshish kariye — 'Haan' ya 'Nahi' boliye. Mic abhi sun raha hai."

S-0.8: "Chahe aapke paas smartphone ho ya keypad phone — dono se kaam chalega. Aur agar registration mein beta ya parivar madad kare — koi baat nahi. Pooja aapko milegi. Paise aapke khate mein."

S-0.9: "Booking confirm hote hi — train ho, bus ho, ya cab — poori yatra ki planning platform kar dega. Hotel se khaane tak. Double booking ho hi nahi sakti."

S-0.10: "Verified hone ka matlab hai — zyaada bookings. Verified panditon ko teen guna zyaada bookings milti hain. Sirf do minute ka video — ek baar. Video sirf admin team dekhegi. Public nahi hogi."

S-0.11: "Yeh rahe chaar vaade — Samman, Suwidha, Suraksha, Samridhdhi. Teen lakh se zyaada Pandit pehle se jud chuke hain. Ab Registration ki baari."

S-0.12: "Bas itna tha HmarePanditJi ka parichay. Ab aap registration shuru kar sakte hain — bilkul muft, das minute lagenge. Kya aap abhi shuru karna chahenge?"

ERROR — First failure: "Maaf kijiye, phir se boliye — thoda dheere aur saaf."
ERROR — Second failure: "Aawaz samajh nahi aayi. Koi baat nahi — neeche button bhi hai."
ERROR — Third failure: "Keyboard se jawab dijiye. Neeche keyboard button chhoiye."
```
