# HmarePanditJi — Complete Task Breakdown & Team Assignment
**Project:** Voice-First Pandit Onboarding (Part 0.0 + Part 0 + Part 1)  
**Timeline:** 4 Weeks (March 26 - April 23, 2026)  
**Team:** 5 Freelancers + 1 Senior Dev + 1 QA  

---

## TEAM STRUCTURE

```
┌─────────────────────────────────────────────────────────────┐
│                    PROJECT ORG CHART                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Senior Full-Stack Dev (You)                                │
│  ├─ Technical Lead & Architecture                           │
│  ├─ Code Reviews                                            │
│  └─ Integration & Deployment                                │
│                                                             │
│  Freelancer 1: Backend Developer (Rajesh Kumar)             │
│  ├─ API Routes (4 routes)                                   │
│  ├─ Security & Rate Limiting                                │
│  └─ Sarvam/Deepgram Integration                            │
│                                                             │
│  Freelancer 2: Voice Script Specialist (Dr. Priya Sharma)   │
│  ├─ 2,250 Voice Scripts (Hindi + 14 languages)              │
│  ├─ TTS Quality Assurance                                   │
│  └─ Pronunciation Guide                                     │
│                                                             │
│  Freelancer 3: UI/Animation Developer (Arjun Mehta)         │
│  ├─ 11 Tutorial Screens (S-0.2 to S-0.12)                   │
│  ├─ Framer Motion Animations                                │
│  └─ Responsive Design                                       │
│                                                             │
│  Freelancer 4: Voice UI Component Dev (Sneha Patel)         │
│  ├─ 7 Voice Overlay Components                              │
│  ├─ Accessibility (WCAG 2.1 AA)                             │
│  └─ Visual Feedback System                                  │
│                                                             │
│  Freelancer 5: Translation Specialist (Vikram Singh)        │
│  ├─ Sarvam Mayura Integration                               │
│  ├─ 14 Language Translation Pipeline                        │
│  └─ Runtime Language Switching                              │
│                                                             │
│  QA Engineer (Internal)                                     │
│  ├─ E2E Test Coverage                                       │
│  ├─ Manual Testing (5 devices)                              │
│  └─ Performance Testing                                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## WEEK 1: FOUNDATION (March 26 - April 1)

### 🟢 Freelancer 1: Backend Developer (Rajesh Kumar)
**Sprint Goal:** All 4 API routes operational with security

#### Task 1.1: `/api/tts` Route (Days 1-2)
**File:** `apps/pandit/src/app/api/tts/route.ts`

**Requirements:**
```typescript
// POST /api/tts
// Request:
{
  "text": "नमस्ते पंडित जी",
  "languageCode": "hi-IN",
  "speaker": "priya",
  "pace": 0.82,
  "pitch": 0,
  "loudness": 1.0
}

// Response:
{
  "audioBase64": "UklGRi...",  // MP3 base64 string
  "duration": 2.3,  // seconds
  "cacheHit": false
}
```

**Implementation Checklist:**
- [ ] Import Sarvam AI SDK (`sarvamai` package)
- [ ] Initialize client with `process.env.SARVAM_API_KEY`
- [ ] Validate input (text length < 2500 chars, valid language code)
- [ ] Call Sarvam Bulbul v3 TTS API
- [ ] Return base64 audio with duration
- [ ] Add error handling (500 on API failure, 400 on invalid input)
- [ ] Add rate limiting (100 requests/minute per IP)
- [ ] Add logging (request ID, latency, success/failure)

**Acceptance Criteria:**
```bash
# Test command (must return audioBase64):
curl -X POST http://localhost:3002/api/tts \
  -H "Content-Type: application/json" \
  -d '{"text":"नमस्ते","languageCode":"hi-IN","speaker":"priya","pace":0.82}'

# Expected: JSON with audioBase64 field (2000+ chars)
# Latency: < 800ms
```

**Dependencies:** None  
**Estimated Effort:** 2 days  
**Deliverable:** Working `/api/tts` route with tests

---

#### Task 1.2: `/api/stt-token` Route (Day 3)
**File:** `apps/pandit/src/app/api/stt-token/route.ts`

**Requirements:**
```typescript
// POST /api/stt-token
// Request: { "sessionId": "session_123" }
// Response:
{
  "token": "sk_live_abc123...",  // Time-limited token
  "expiresAt": 1711564800000,     // Unix timestamp (60 seconds)
  "provider": "deepgram" | "sarvam"
}
```

**Implementation Checklist:**
- [ ] Generate time-limited token (60 second expiry)
- [ ] Store token in Redis/memory cache with expiry
- [ ] Return token with provider info
- [ ] Add rate limiting (10 tokens/minute per IP)
- [ ] Add session validation (check sessionId exists)

**Acceptance Criteria:**
```bash
curl -X POST http://localhost:3002/api/stt-token \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"session_test_123"}'

# Expected: JSON with token, expiresAt < 60 seconds from now
```

**Dependencies:** None  
**Estimated Effort:** 1 day  
**Deliverable:** Working `/api/stt-token` route

---

#### Task 1.3: `/api/translate` Route (Day 4)
**File:** `apps/pandit/src/app/api/translate/route.ts`

**Requirements:**
```typescript
// POST /api/translate
// Request:
{
  "text": "Hello Pandit Ji",
  "sourceLanguage": "en-IN",
  "targetLanguage": "hi-IN"
}

// Response:
{
  "translatedText": "नमस्ते पंडित जी",
  "confidence": 0.95
}
```

**Implementation Checklist:**
- [ ] Import Sarvam Mayura translation API
- [ ] Validate language codes (11 supported languages)
- [ ] Call Mayura translation API
- [ ] Return translated text with confidence score
- [ ] Add caching for common phrases (LRU cache, 500 entries)
- [ ] Add error handling (fallback to Hindi if translation fails)

**Acceptance Criteria:**
```bash
curl -X POST http://localhost:3002/api/translate \
  -H "Content-Type: application/json" \
  -d '{"text":"Welcome","sourceLanguage":"en-IN","targetLanguage":"hi-IN"}'

# Expected: {"translatedText":"स्वागत है","confidence":0.92}
```

**Dependencies:** None  
**Estimated Effort:** 1 day  
**Deliverable:** Working `/api/translate` route

---

#### Task 1.4: `/api/referral/validate` Route (Day 5)
**File:** `apps/pandit/src/app/api/referral/validate/route.ts` (Update existing)

**Requirements:**
```typescript
// POST /api/referral/validate
// Request: { "referralCode": "REF123" }
// Response:
{
  "valid": true,
  "referrerName": "Pandit Sharma",
  "bonus": 100  // Rs. credited to both users
}
```

**Implementation Checklist:**
- [ ] Check referral code format (6 chars, alphanumeric)
- [ ] Query database for referral code (Prisma: `prisma.referral.findUnique()`)
- [ ] Validate code not expired (created < 30 days ago)
- [ ] Validate referrer account active
- [ ] Return referrer details + bonus amount
- [ ] Add rate limiting (20 requests/minute)

**Acceptance Criteria:**
```bash
curl -X POST http://localhost:3002/api/referral/validate \
  -H "Content-Type: application/json" \
  -d '{"referralCode":"TEST123"}'

# Expected: {"valid":true,"referrerName":"Test User","bonus":100}
# OR: {"valid":false,"error":"Invalid code"}
```

**Dependencies:** Database schema verification  
**Estimated Effort:** 1 day  
**Deliverable:** Updated `/api/referral/validate` route

---

#### Task 1.5: Environment Setup & Documentation (Day 5 PM)
**Files:** `apps/pandit/.env.local.example`, `API_ROUTES.md`

**Checklist:**
- [ ] Create `.env.local.example` with all required keys:
  ```
  NEXT_PUBLIC_SARVAM_API_KEY=sk_live_...
  NEXT_PUBLIC_DEEPGRAM_API_KEY=...
  SARVAM_API_KEY=sk_live_...  # Server-side only
  DEEPGRAM_API_KEY=...        # Server-side only
  REDIS_URL=redis://localhost:6379  # For token caching
  RATE_LIMIT_TTL=60  # seconds
  RATE_LIMIT_MAX=100  # requests per minute
  ```
- [ ] Write `API_ROUTES.md` documentation:
  - Endpoint URLs
  - Request/Response schemas
  - Error codes
  - Rate limits
  - Example curl commands

**Deliverable:** Complete documentation

---

### 🟡 Freelancer 2: Voice Script Specialist (Dr. Priya Sharma)
**Sprint Goal:** Part 0.0 scripts complete (9 screens, 135 scripts)

#### Task 2.1: Script Writing Guidelines (Day 1 AM)
**File:** `VOICE_SCRIPT_GUIDELINES.md`

**Deliverable:** Style guide document with:
- [ ] TTS voice settings (speaker, pace, pitch per screen type)
- [ ] Pause durations (0.3s, 0.5s, 1.0s, 1.5s usage)
- [ ] Emotional tone (respectful, warm, reassuring)
- [ ] Number pronunciation rules ("nau ath saat" → 987)
- [ ] Hinglish code-mixing guidelines
- [ ] Regional language adaptation notes

**Template:**
```typescript
{
  screenId: "S-0.0.2",
  trigger: "on_screen_load",
  text: "नमस्ते। मैं आपका शहर जानना चाहता हूँ।",
  romanTransliteration: "Namaste. Main aapka shehar jaanna chahta hoon.",
  englishMeaning: "Hello. I want to know your city.",
  language: "hi-IN",
  speaker: "priya",
  pace: 0.82,
  pitch: 0,
  pauseAfterMs: 1000,
  maxDurationS: 8,
  emotionalTone: "warm_respectful",
  priority: "critical"
}
```

---

#### Task 2.2: S-0.0.2 Location Permission Scripts (Day 1 PM)
**File:** `voice-scripts-part0/002-location-permission.ts`

**Required Scripts (15 languages × 3 variants = 45 scripts):**

**Hindi Example:**
```typescript
export const S_0_0_2_SCRIPTS = [
  {
    screenId: "S-0.0.2",
    trigger: "on_screen_load",
    text: "नमस्ते। मैं आपका शहर जानना चाहता हूँ — ताकि आपकी भाषा अपने आप सेट हो जाए, और आपके शहर की पूजाएं आपको मिलें। आपका पूरा पता किसी को नहीं दिखेगा। क्या आप अनुमति देंगे? 'हाँ' बोलें या नीचे बटन दबाएं।",
    language: "hi-IN",
    speaker: "priya",
    pace: 0.88,
    pauseAfterMs: 1000,
  },
  {
    screenId: "S-0.0.2",
    trigger: "on_permission_granted",
    text: "शहर मिल गया। आपके लिए भाषा सेट हो रही है।",
    language: "hi-IN",
    speaker: "priya",
    pace: 0.90,
    pauseAfterMs: 500,
  },
  {
    screenId: "S-0.0.2",
    trigger: "on_permission_denied",
    text: "कोई बात नहीं। आप खुद बताइए।",
    language: "hi-IN",
    speaker: "priya",
    pace: 0.88,
    pauseAfterMs: 500,
  },
  {
    screenId: "S-0.0.2",
    trigger: "on_timeout_12s",
    text: "कृपया 'हाँ' बोलें या नीचे बटन दबाएं।",
    language: "hi-IN",
    speaker: "priya",
    pace: 0.88,
    pauseAfterMs: 500,
  },
]
```

**Tamil Translation Example:**
```typescript
{
  screenId: "S-0.0.2",
  trigger: "on_screen_load",
  text: "Vanakkam. Ungal oorai therindhu kollavendum — ungal bhashai apne aap set aagum, ungal oorai poojaigal ungalukku kidaikum. Ungal pooraana address yaarakkum theriyaathu. Anumathi tharuveergala? 'Aam' solunga allathu keezhe button amukkunga.",
  language: "ta-IN",
  speaker: "priya",
  pace: 0.85,
  pauseAfterMs: 1000,
}
```

**Languages Required:**
1. Hindi (hi-IN) — Base language
2. Bhojpuri (hi-IN fallback)
3. Maithili (hi-IN fallback)
4. Bengali (bn-IN)
5. Tamil (ta-IN)
6. Telugu (te-IN)
7. Kannada (kn-IN)
8. Malayalam (ml-IN)
9. Marathi (mr-IN)
10. Gujarati (gu-IN)
11. Sanskrit (hi-IN fallback)
12. English (en-IN)
13. Odia (or-IN)
14. Punjabi (pa-IN)
15. Assamese (hi-IN fallback)

**Deliverable:** 45 scripts (15 languages × 3 variants)

---

#### Task 2.3: S-0.0.2B Manual City Entry (Day 2 AM)
**File:** `voice-scripts-part0/002b-manual-city.ts`

**Required Scripts (15 languages × 2 variants = 30 scripts):**

```typescript
export const S_0_0_2B_SCRIPTS = [
  {
    screenId: "S-0.0.2B",
    trigger: "on_screen_load",
    text: "कोई बात नहीं। बस अपना शहर बताइए। बोल सकते हैं — जैसे 'वाराणसी' या 'दिल्ली' — या नीचे से छू सकते हैं।",
    language: "hi-IN",
    speaker: "priya",
    pace: 0.88,
    pauseAfterMs: 500,
  },
  {
    screenId: "S-0.0.2B",
    trigger: "on_city_detected",
    text: "[CITY_NAME] — सही है? 'हाँ' बोलें।",
    language: "hi-IN",
    speaker: "priya",
    pace: 0.90,
    pauseAfterMs: 500,
    dynamicVariables: ["CITY_NAME"],
  },
  {
    screenId: "S-0.0.2B",
    trigger: "on_city_not_recognized",
    text: "आवाज़ नहीं पहचान पाया। नीचे से अपना शहर चुनें या लिखें।",
    language: "hi-IN",
    speaker: "priya",
    pace: 0.85,
    pauseAfterMs: 500,
  },
]
```

**Deliverable:** 30 scripts

---

#### Task 2.4: S-0.0.3 through S-0.0.8 Scripts (Days 2-5)
**Files:** `voice-scripts-part0/003-language-confirm.ts` through `voice-scripts-part0/008-voice-tutorial.ts`

**Screen Breakdown:**

| Screen | Variants | Languages | Total Scripts | Priority |
|--------|----------|-----------|---------------|----------|
| S-0.0.3 Language Confirm | 4 | 15 | 60 | Critical |
| S-0.0.4 Language List | 4 | 15 | 60 | Critical |
| S-0.0.5 Language Choice | 4 | 15 | 60 | Critical |
| S-0.0.6 Celebration | 5 | 15 | 75 | Critical |
| S-0.0.7 Help | 1 | 15 | 15 | Medium |
| S-0.0.8 Voice Tutorial | 3 | 15 | 45 | High |
| **Total** | **21** | **15** | **315** | |

**S-0.0.6 Celebration Example (5 language variants):**
```typescript
// Hindi
{
  screenId: "S-0.0.6",
  text: "बहुत अच्छा! अब हम आपसे हिंदी में बात करेंगे।",
  language: "hi-IN",
  speaker: "priya",
  pace: 0.92,
}
// Tamil
{
  screenId: "S-0.0.6",
  text: "Romba nalla! Innum ungal kooda Tamil la pesuvom.",
  language: "ta-IN",
  speaker: "priya",
  pace: 0.90,
}
// Bengali
{
  screenId: "S-0.0.6",
  text: "Khub bhalo! Ekhon theke apnar sathe Bengali te kotha bolbo.",
  language: "bn-IN",
  speaker: "priya",
  pace: 0.90,
}
// Telugu
{
  screenId: "S-0.0.6",
  text: "Chala manchidi! Inka mee tho Telugu lo matladutamu.",
  language: "te-IN",
  speaker: "priya",
  pace: 0.90,
}
// English
{
  screenId: "S-0.0.6",
  text: "Excellent! Now we will speak with you in English.",
  language: "en-IN",
  speaker: "priya",
  pace: 0.88,
}
```

**Deliverable:** 315 scripts across 6 files

---

#### Task 2.5: Script QA & TTS Testing (Day 5 PM)
**File:** `scripts/test-all-voice-scripts.mjs`

**Checklist:**
- [ ] Test all 405 Part 0.0 scripts through Sarvam TTS API
- [ ] Verify audio plays without clicks/gaps
- [ ] Check pronunciation of city names (Varanasi, Chennai, Kolkata)
- [ ] Verify number pronunciation ("nau ath saat" → 987)
- [ ] Validate pause durations (not too long, not too short)
- [ ] Get native speaker review for 5 priority languages (Hindi, Tamil, Telugu, Bengali, Marathi)

**Deliverable:** QA report with issues list

---

### 🔵 Freelancer 3: UI/Animation Developer (Arjun Mehta)
**Sprint Goal:** 11 tutorial screens (S-0.2 to S-0.12) implemented

#### Task 3.1: Setup & Design System Review (Day 1 AM)
**Files to Review:**
- `apps/pandit/tailwind.config.ts` (color tokens, animations)
- `apps/pandit/src/app/globals.css` (global styles)
- `prompts/part 0/stitch_welcome_screen_0_15/` (HTML mockups)

**Checklist:**
- [ ] Install Framer Motion: `npm install framer-motion`
- [ ] Verify all animation keyframes exist
- [ ] Test on mobile viewport (390px wide)
- [ ] Set up Storybook for component preview (optional)

---

#### Task 3.2: S-0.2 Income Hook Screen (Day 1 PM - Day 2)
**File:** `apps/pandit/src/app/(auth)/income-hook/page.tsx`

**Spec Requirements:**
- Testimonial card with Pandit Ramesh Sharma photo
- 4 income tiles (tap targets 72px min)
- Progress dots (dot 2 of 12 active)
- Voice indicator (pulsing orange bars)
- Skip button (top-right)
- "आगे" CTA button (bottom)

**Implementation:**
```tsx
'use client'

import { motion } from 'framer-motion'
import { useVoice } from '@/hooks/useVoice'
import TopBar from '@/components/TopBar'
import ProgressDots from '@/components/ProgressDots'
import CTAButton from '@/components/CTAButton'
import { speakWithSarvam } from '@/lib/sarvam-tts'

export default function IncomeHookScreen() {
  const { startListening, isListening } = useVoice({
    inputType: 'yes_no',
    onResult: (text, confidence) => {
      if (text === 'haan' || text === 'aage') {
        router.push('/fixed-dakshina')
      }
    },
  })

  useEffect(() => {
    // Play income hook script on load
    speakWithSarvam({
      text: "सुनिए, वाराणसी के पंडित रामेश्वर शर्मा जी पहले महीने में अठारह हज़ार रुपये कमाते थे। आज वे तीन नए तरीकों से तिरसठ हज़ार कमा रहे हैं। मैं आपको भी यही तीन तरीके दिखाता हूँ। इन चार tiles में से जो समझना हो उसे छू सकते हैं। या 'आगे' बोलकर सब एक-एक देख सकते हैं।",
      languageCode: 'hi-IN',
      speaker: 'priya',
      pace: 0.88,
      onEnd: () => startListening(),
    })
  }, [])

  return (
    <div className="min-h-screen bg-vedic-cream">
      <TopBar showBack onBack={handleBack} />
      <ProgressDots total={12} current={2} />
      
      {/* Testimonial Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mx-4 mt-8 bg-white rounded-card shadow-card p-6"
      >
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary-lt flex items-center justify-center text-2xl">
            👨‍🦳
          </div>
          <div>
            <p className="font-bold text-vedic-brown text-lg">पंडित रामेश्वर शर्मा</p>
            <p className="text-sm text-vedic-gold">वाराणसी</p>
            <p className="text-xs text-success font-bold mt-1">₹18,000 → ₹63,000/महीना</p>
          </div>
        </div>
      </motion.div>

      {/* 4 Income Tiles */}
      <div className="grid grid-cols-2 gap-3 mx-4 mt-6">
        <IncomeTile
          icon="💰"
          title="Fix Dakshina"
          subtitle="कोई मोलभाव नहीं"
          onTap={() => router.push('/fixed-dakshina')}
        />
        <IncomeTile
          icon="📱"
          title="Online Pooja"
          subtitle="घर बैठे कमाई"
          onTap={() => router.push('/online-revenue')}
        />
        <IncomeTile
          icon="🎁"
          title="Backup Income"
          subtitle="फ्री में ₹2,000"
          onTap={() => router.push('/backup-pandit')}
        />
        <IncomeTile
          icon="⚡"
          title="Instant Payment"
          subtitle="2 मिनट में बैंक"
          onTap={() => router.push('/instant-payment')}
        />
      </div>

      {/* CTA Button */}
      <div className="px-4 pb-8 mt-8">
        <CTAButton
          label="आगे →"
          onClick={() => router.push('/fixed-dakshina')}
          variant="primary"
        />
      </div>
    </div>
  )
}

function IncomeTile({ icon, title, subtitle, onTap }: Props) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={onTap}
      className="bg-white rounded-card shadow-card p-4 text-left min-h-[120px]"
    >
      <div className="text-3xl mb-2">{icon}</div>
      <div className="font-bold text-vedic-brown text-base">{title}</div>
      <div className="text-xs text-vedic-gold mt-1">{subtitle}</div>
    </motion.button>
  )
}
```

**Acceptance Criteria:**
- [ ] Testimonial card animates in at 600ms
- [ ] 4 tiles are tappable (72px min height)
- [ ] Voice script plays on load
- [ ] "आगे" button advances to S-0.3
- [ ] Skip button goes to registration
- [ ] Works on 390px viewport

**Deliverable:** Working S-0.2 screen

---

#### Task 3.3: S-0.3 through S-0.12 Screens (Days 3-10)
**Screen Schedule:**

| Day | Screen | Key Features | Complexity |
|-----|--------|-------------|------------|
| 3 | S-0.3 Fixed Dakshina | Emotional narrative, before/after cards | Medium |
| 4 | S-0.4 Online Revenue | Dual cards (Ghar Baithe + Consultancy) | Medium |
| 5 | S-0.5 Backup Pandit | 3-step explanation, skepticism handling | High |
| 6 | S-0.6 Instant Payment | Payment breakdown animation | Medium |
| 7 | S-0.7 Voice Nav Demo | Interactive voice demo (mic live) | High |
| 8 | S-0.8 Dual Mode | Smartphone vs keypad comparison | Low |
| 9 | S-0.9 Travel Calendar | Map + calendar integration | Medium |
| 10 | S-0.10 Video Verification | Badge animation, privacy assurance | Medium |
| 11 | S-0.11 4 Guarantees | 4 cards with icons, social proof | Medium |
| 12 | S-0.12 Final CTA | Decision screen, helpline number | Low |

**Each Screen Must Have:**
- [ ] TopBar with back button + language globe
- [ ] Progress dots (correct dot highlighted)
- [ ] Animated illustration (Framer Motion)
- [ ] Voice script that plays on load
- [ ] Voice indicator (pulsing bars when listening)
- [ ] CTA button ("आगे" or "Skip")
- [ ] Skip button (top-right)
- [ ] Responsive design (390px viewport)
- [ ] Keyboard fallback option

**Deliverable:** 11 fully functional screens

---

### 🟣 Freelancer 4: Voice UI Component Developer (Sneha Patel)
**Sprint Goal:** 7 voice overlay components

#### Task 4.1: VoiceOverlay Component (Days 1-2)
**File:** `apps/pandit/src/components/voice/VoiceOverlay.tsx`

**Spec (V-02 Active Listening):**
- 5 animated waveform bars (orange gradient)
- "सुन रहा हूँ..." text
- Pulsing orange ring around mic icon
- Real-time interim transcript display
- Auto-hide after 3s silence

**Implementation:**
```tsx
'use client'

import { motion } from 'framer-motion'

interface VoiceOverlayProps {
  isListening: boolean
  interimText?: string
  noiseLevel?: number  // 0-100
}

export default function VoiceOverlay({
  isListening,
  interimText,
  noiseLevel = 0,
}: VoiceOverlayProps) {
  if (!isListening) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center pb-32 pointer-events-none"
    >
      {/* Pulsing Ring */}
      <div className="absolute w-32 h-32 rounded-full border-4 border-primary/30 animate-pulse-ring" />
      <div className="absolute w-24 h-24 rounded-full border-4 border-primary/50 animate-pulse-ring" style={{ animationDelay: '0.2s' }} />
      
      {/* Waveform Bars */}
      <div className="flex items-end gap-1 h-12 mb-4">
        {[0, 1, 2, 3, 4].map((i) => (
          <motion.div
            key={i}
            className="w-2 bg-gradient-to-t from-primary-dk to-primary rounded-full"
            animate={{
              height: ['8px', '24px', '12px', '32px', '16px'],
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay: i * 0.15,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* Listening Text */}
      <div className="bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg">
        <p className="text-vedic-gold text-sm font-medium">सुन रहा हूँ...</p>
        {interimText && (
          <p className="text-vedic-brown text-xs mt-1">{interimText}</p>
        )}
      </div>

      {/* Noise Warning */}
      {noiseLevel > 65 && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="absolute bottom-24 bg-warning-amber-bg border border-warning-amber rounded-full px-4 py-2"
        >
          <p className="text-warning text-xs font-medium">
            शोर ज़्यादा है • शांत जगह जाएं
          </p>
        </motion.div>
      )}
    </motion.div>
  )
}
```

**Acceptance Criteria:**
- [ ] Waveform bars animate smoothly (no jank)
- [ ] Pulsing ring visible on dark backgrounds
- [ ] Interim text updates in real-time
- [ ] Noise warning appears at >65dB
- [ ] Auto-hides after 3s silence

**Deliverable:** VoiceOverlay component

---

#### Task 4.2: ConfirmationSheet Component (Day 3)
**File:** `apps/pandit/src/components/voice/ConfirmationSheet.tsx`

**Spec (V-04 Confirmation Loop):**
- Bottom sheet slides up
- Shows transcribed text in large font
- "हाँ, सही है" (green) and "नहीं, बदलें" (red) buttons
- Auto-dismiss after 15s countdown

**Deliverable:** Working confirmation sheet

---

#### Task 4.3: ErrorOverlay Component (Days 4-5)
**File:** `apps/pandit/src/components/voice/ErrorOverlay.tsx`

**Spec (V-05, V-06, V-07):**
- Error 1: "माफ़ कीजिए, फिर से बोलिए — थोड़ा धीरे और साफ़।"
- Error 2: "आवाज़ समझ नहीं आई। कोई बात नहीं — नीचे button भी है।"
- Error 3: "Keyboard से जवाब दीजिए। नीचे ⌨️ button छूइए।" (keyboard auto-opens)

**Deliverable:** Error overlay with 3 states

---

#### Task 4.4: NetworkBanner Component (Day 6)
**File:** `apps/pandit/src/components/overlays/NetworkBanner.tsx`

**Spec (X-01):**
- Top banner (sticky)
- Online: "Reconnected ✓" (green, 2s then hide)
- Offline: "Network chala gaya. Keyboard use karein." (amber, stays visible)

**Deliverable:** Network banner

---

#### Task 4.5: CelebrationOverlay Component (Day 7)
**File:** `apps/pandit/src/components/overlays/CelebrationOverlay.tsx`

**Spec (T-02):**
- Full-screen overlay (1.4s duration)
- Saffron glow ring animation
- Checkmark draw animation
- Confetti particles (5-10 pieces)
- Text: "बहुत अच्छा! ✓"

**Deliverable:** Celebration overlay

---

#### Task 4.6: TopBar Component (Day 8)
**File:** `apps/pandit/src/components/TopBar.tsx`

**Spec:**
- ॐ symbol (left)
- "HmarePanditJi" text
- Globe icon (right, language change)
- Back button (conditional)
- Saffron gradient background

**Deliverable:** TopBar component

---

#### Task 4.7: SahayataBar Component (Day 9)
**File:** `apps/pandit/src/components/SahayataBar.tsx`

**Spec:**
- Bottom bar (sticky)
- "सहायता" text + phone icon
- Helpline number on tap
- Call button

**Deliverable:** SahayataBar component

---

### 🟠 Freelancer 5: Translation Specialist (Vikram Singh)
**Sprint Goal:** Sarvam Mayura integration + 14 language pipeline

#### Task 5.1: Sarvam Mayura Integration (Days 1-2)
**File:** `apps/pandit/src/lib/sarvam-translate.ts`

**Implementation:**
```typescript
'use client'

interface TranslationOptions {
  text: string
  sourceLanguage: string  // BCP-47 code
  targetLanguage: string  // BCP-47 code
  onResult?: (translatedText: string, confidence: number) => void
  onError?: (error: string) => void
}

class SarvamTranslateEngine {
  private static instance: SarvamTranslateEngine
  private cache = new Map<string, string>()  // LRU cache

  static getInstance(): SarvamTranslateEngine {
    if (!SarvamTranslateEngine.instance) {
      SarvamTranslateEngine.instance = new SarvamTranslateEngine()
    }
    return SarvamTranslateEngine.instance
  }

  async translate(options: TranslationOptions): Promise<void> {
    const { text, sourceLanguage, targetLanguage, onResult, onError } = options

    // Check cache first
    const cacheKey = `${sourceLanguage}->${targetLanguage}:${text}`
    if (this.cache.has(cacheKey)) {
      onResult?.(this.cache.get(cacheKey)!, 1.0)
      return
    }

    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          sourceLanguage,
          targetLanguage,
        }),
      })

      if (!response.ok) throw new Error('Translation failed')

      const data = await response.json()
      this.cache.set(cacheKey, data.translatedText)
      onResult?.(data.translatedText, data.confidence)
    } catch (error: any) {
      onError?.(error.message)
      // Fallback to Hindi if translation fails
      if (targetLanguage !== 'hi-IN') {
        onResult?.(text, 0.5)  // Return original with low confidence
      }
    }
  }
}

export const translateEngine = SarvamTranslateEngine.getInstance()
```

**Deliverable:** Working translation engine

---

#### Task 5.2: Runtime Language Switching (Days 3-4)
**File:** `apps/pandit/src/lib/language-switcher.ts`

**Implementation:**
```typescript
// Dynamic language switching for voice scripts
export async function getScriptInLanguage(
  scriptId: string,
  targetLanguage: string
): Promise<VoiceScript | null> {
  // Fetch base Hindi script
  const hindiScript = await fetchScript(scriptId, 'hi-IN')
  if (!hindiScript) return null

  // If target is Hindi, return as-is
  if (targetLanguage === 'hi-IN') return hindiScript

  // Translate to target language
  return new Promise((resolve) => {
    translateEngine.translate({
      text: hindiScript.text,
      sourceLanguage: 'hi-IN',
      targetLanguage,
      onResult: (translatedText, confidence) => {
        resolve({
          ...hindiScript,
          text: translatedText,
          language: targetLanguage,
        })
      },
      onError: () => resolve(hindiScript),  // Fallback to Hindi
    })
  })
}
```

**Deliverable:** Language switching utility

---

#### Task 5.3: Language Validation & Fallback (Day 5)
**File:** `apps/pandit/src/lib/language-validator.ts`

**Implementation:**
```typescript
// Validate and normalize language codes
export function normalizeLanguageCode(code: string): string {
  const validLanguages = [
    'hi-IN', 'bn-IN', 'ta-IN', 'te-IN', 'kn-IN', 'ml-IN',
    'mr-IN', 'gu-IN', 'pa-IN', 'or-IN', 'en-IN'
  ]

  const normalized = code.toLowerCase()
  if (validLanguages.includes(normalized)) return normalized

  // Fallback mappings
  const fallbacks: Record<string, string> = {
    'bhojpuri': 'hi-IN',
    'maithili': 'hi-IN',
    'sanskrit': 'hi-IN',
    'assamese': 'hi-IN',
    'bangla': 'bn-IN',
    'tamil': 'ta-IN',
    // ... more mappings
  }

  return fallbacks[normalized] || 'hi-IN'
}
```

**Deliverable:** Language validation utility

---

## WEEK 2-3: INTEGRATION (April 2-15)

### All Team Members
**Sprint Goal:** End-to-end integration testing

#### Integration Tasks (Shared)

**Task INT-001: Voice Script Pre-warming (Day 1)**
**Owner:** Freelancer 1 (Backend) + Freelancer 2 (Scripts)

**File:** `apps/pandit/src/app/(auth)/page.tsx`

```typescript
useEffect(() => {
  // Pre-warm TTS cache on app load
  import('@/lib/sarvam-tts').then(({ preWarmCache }) => {
    preWarmCache(PART_0_SCRIPTS)
  })
}, [])
```

**Acceptance:** All Part 0.0 scripts cached within 5s of app load

---

**Task INT-002: Voice Flow Orchestration (Days 2-3)**
**Owner:** Freelancer 3 (UI) + Freelancer 4 (Components)

**File:** `apps/pandit/src/app/onboarding/page.tsx`

**Checklist:**
- [ ] Import all 12 screen components
- [ ] Wire up voice state machine
- [ ] Test transitions (S-0.1 → S-0.2 → ... → S-0.12)
- [ ] Verify voice plays before STT starts
- [ ] Test error cascade (3 errors → keyboard)

---

**Task INT-003: API Route Integration (Days 4-5)**
**Owner:** Freelancer 1 (Backend)

**Checklist:**
- [ ] Update `sarvam-tts.ts` to call `/api/tts` instead of direct Sarvam API
- [ ] Update `deepgramSTT.ts` to call `/api/stt-token` for WebSocket auth
- [ ] Update `sarvam-translate.ts` to call `/api/translate`
- [ ] Test all routes with Postman
- [ ] Add error handling (retry logic, fallbacks)

---

**Task INT-004: E2E Test Coverage (Days 6-10)**
**Owner:** QA Engineer + All Freelancers

**Files:** `apps/pandit/e2e/part0-tutorial.spec.ts`

**Test Scenarios:**
```typescript
test('Part 0 Tutorial complete flow', async ({ page }) => {
  await page.goto('/onboarding')
  
  // S-0.1 Welcome
  await expect(page).toHaveText('नमस्ते पंडित जी')
  await page.getByText('आगे').click()
  
  // S-0.2 Income Hook
  await expect(page).toHaveText('पंडित रामेश्वर शर्मा')
  await page.getByText('आगे').click()
  
  // ... through S-0.12
  
  // Final CTA
  await page.getByText('Registration').click()
  await expect(page).toHaveURL('/registration/mobile')
})
```

**Deliverable:** 15 E2E tests covering all screens

---

## WEEK 4: POLISH & DEPLOY (April 16-23)

### All Team Members
**Sprint Goal:** Production-ready deployment

#### Task POL-001: Performance Optimization
**Owner:** Freelancer 1 + Freelancer 3

**Checklist:**
- [ ] Lazy load voice scripts (code splitting)
- [ ] Optimize images (WebP format, <100KB each)
- [ ] Minify CSS/JS (Next.js build)
- [ ] Enable gzip compression
- [ ] Add service worker for offline caching

**Target:** Lighthouse score >90

---

#### Task POL-002: Accessibility Audit
**Owner:** Freelancer 4 + QA

**Checklist:**
- [ ] All buttons have `aria-label`
- [ ] Voice indicator has screen reader text
- [ ] Color contrast meets WCAG 2.1 AA (4.5:1 for text)
- [ ] Keyboard navigation works (Tab, Enter, Escape)
- [ ] Focus indicators visible

**Tool:** axe DevTools browser extension

---

#### Task POL-003: Device Testing Matrix
**Owner:** QA Engineer

**Devices:**
1. Samsung Galaxy A12 (Android 11) — Primary target
2. Redmi Note 10 (Android 12)
3. iPhone SE 2020 (iOS 15)
4. OnePlus Nord (Android 12)
5. Chrome Desktop (Windows 11) — Fallback

**Test Scenarios per Device:**
- [ ] Part 0.0 complete flow (language selection)
- [ ] Part 0 tutorial (S-0.1 to S-0.12)
- [ ] Registration (mobile → OTP → profile)
- [ ] Voice recognition (say "nau ath saat" → verify "9870")
- [ ] Offline mode (airplane mode → keyboard fallback)
- [ ] Noise test (play temple bells audio at 70dB → verify keyboard suggestion)

**Deliverable:** Device test report

---

#### Task POL-004: Documentation Handoff
**Owner:** All Freelancers

**Files to Create:**
- `VOICE_SCRIPTS.md` — All 2,250 scripts documented
- `API_ROUTES.md` — All 4 routes documented
- `COMPONENTS.md` — All 7 UI components documented
- `DEPLOYMENT.md` — Production deployment guide
- `TROUBLESHOOTING.md` — Common issues + fixes

---

## DELIVERABLES SUMMARY

### Freelancer 1: Backend Developer
| Deliverable | File | Due Date | Status |
|------------|------|----------|--------|
| `/api/tts` route | `apps/pandit/src/app/api/tts/route.ts` | Day 2 | ⬜ |
| `/api/stt-token` route | `apps/pandit/src/app/api/stt-token/route.ts` | Day 3 | ⬜ |
| `/api/translate` route | `apps/pandit/src/app/api/translate/route.ts` | Day 4 | ⬜ |
| `/api/referral/validate` | `apps/pandit/src/app/api/referral/validate/route.ts` | Day 5 | ⬜ |
| `.env.local.example` | `apps/pandit/.env.local.example` | Day 5 | ⬜ |
| `API_ROUTES.md` | `docs/API_ROUTES.md` | Day 5 | ⬜ |

### Freelancer 2: Voice Script Specialist
| Deliverable | File | Due Date | Status |
|------------|------|----------|--------|
| Script Guidelines | `VOICE_SCRIPT_GUIDELINES.md` | Day 1 | ⬜ |
| S-0.0.2 Scripts | `voice-scripts-part0/002-location-permission.ts` | Day 1 | ⬜ |
| S-0.0.2B Scripts | `voice-scripts-part0/002b-manual-city.ts` | Day 2 | ⬜ |
| S-0.0.3 to S-0.0.8 | `voice-scripts-part0/003-*.ts` through `008-*.ts` | Day 4 | ⬜ |
| QA Report | `VOICE_SCRIPT_QA_REPORT.md` | Day 5 | ⬜ |
| **Total:** 405 scripts | | | |

### Freelancer 3: UI/Animation Developer
| Deliverable | File | Due Date | Status |
|------------|------|----------|--------|
| S-0.2 Income Hook | `apps/pandit/src/app/(auth)/income-hook/page.tsx` | Day 2 | ⬜ |
| S-0.3 Fixed Dakshina | `apps/pandit/src/app/(auth)/fixed-dakshina/page.tsx` | Day 3 | ⬜ |
| S-0.4 Online Revenue | `apps/pandit/src/app/(auth)/online-revenue/page.tsx` | Day 4 | ⬜ |
| S-0.5 Backup Pandit | `apps/pandit/src/app/(auth)/backup-pandit/page.tsx` | Day 5 | ⬜ |
| S-0.6 Instant Payment | `apps/pandit/src/app/(auth)/instant-payment/page.tsx` | Day 6 | ⬜ |
| S-0.7 Voice Nav Demo | `apps/pandit/src/app/(auth)/voice-nav-demo/page.tsx` | Day 7 | ⬜ |
| S-0.8 Dual Mode | `apps/pandit/src/app/(auth)/dual-mode/page.tsx` | Day 8 | ⬜ |
| S-0.9 Travel Calendar | `apps/pandit/src/app/(auth)/travel-calendar/page.tsx` | Day 9 | ⬜ |
| S-0.10 Video Verification | `apps/pandit/src/app/(auth)/video-verification/page.tsx` | Day 10 | ⬜ |
| S-0.11 4 Guarantees | `apps/pandit/src/app/(auth)/four-guarantees/page.tsx` | Day 11 | ⬜ |
| S-0.12 Final CTA | `apps/pandit/src/app/(auth)/final-cta/page.tsx` | Day 12 | ⬜ |

### Freelancer 4: Voice UI Component Developer
| Deliverable | File | Due Date | Status |
|------------|------|----------|--------|
| VoiceOverlay | `apps/pandit/src/components/voice/VoiceOverlay.tsx` | Day 2 | ⬜ |
| ConfirmationSheet | `apps/pandit/src/components/voice/ConfirmationSheet.tsx` | Day 3 | ⬜ |
| ErrorOverlay | `apps/pandit/src/components/voice/ErrorOverlay.tsx` | Day 5 | ⬜ |
| NetworkBanner | `apps/pandit/src/components/overlays/NetworkBanner.tsx` | Day 6 | ⬜ |
| CelebrationOverlay | `apps/pandit/src/components/overlays/CelebrationOverlay.tsx` | Day 7 | ⬜ |
| TopBar | `apps/pandit/src/components/TopBar.tsx` | Day 8 | ⬜ |
| SahayataBar | `apps/pandit/src/components/SahayataBar.tsx` | Day 9 | ⬜ |
| `COMPONENTS.md` | `docs/COMPONENTS.md` | Day 9 | ⬜ |

### Freelancer 5: Translation Specialist
| Deliverable | File | Due Date | Status |
|------------|------|----------|--------|
| Translation Engine | `apps/pandit/src/lib/sarvam-translate.ts` | Day 2 | ⬜ |
| Language Switcher | `apps/pandit/src/lib/language-switcher.ts` | Day 4 | ⬜ |
| Language Validator | `apps/pandit/src/lib/language-validator.ts` | Day 5 | ⬜ |
| 14 Language Pipeline | Integration test report | Day 5 | ⬜ |

---

## DEPENDENCIES MATRIX

| Task | Depends On | Blocks |
|------|-----------|--------|
| `/api/tts` route | None | All voice screens (S-0.1 to S-0.12) |
| Voice scripts | None | UI screens, TTS pre-warming |
| UI screens | Voice scripts | E2E testing |
| Voice components | None | All screens |
| Translation engine | `/api/translate` route | Multi-language support |
| E2E tests | All screens | Production deployment |

---

## RISK MITIGATION

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Sarvam API rate limits | Medium | High | Implement caching, pre-warm off-peak |
| Voice scripts delayed | High | Critical | Hire backup scriptwriter, prioritize Hindi first |
| UI animations janky | Medium | Medium | Test on target device (Galaxy A12) early |
| API routes expose keys | Low | Critical | Security review before deployment |
| Translation quality poor | Medium | High | Native speaker QA for 5 priority languages |

---

## COMMUNICATION PLAN

**Daily Standup (15 min, 10 AM IST):**
- What I did yesterday
- What I'm doing today
- Blockers

**Weekly Demo (Friday 3 PM IST):**
- Each freelancer demos their week's work
- QA reports bugs
- Adjust priorities for next week

**Tools:**
- Slack channel: `#hmarepanditji-dev`
- GitHub repo: `hmarepanditji/hmarepanditji`
- Project board: GitHub Projects (Kanban)

---

## BUDGET BREAKDOWN

| Freelancer | Rate/Day | Days | Total (INR) |
|-----------|----------|------|-------------|
| Backend Dev | ₹15,000 | 5 | ₹75,000 |
| Voice Script Specialist | ₹10,000 | 15 | ₹1,50,000 |
| UI/Animation Dev | ₹12,000 | 12 | ₹1,44,000 |
| Voice UI Component Dev | ₹10,000 | 9 | ₹90,000 |
| Translation Specialist | ₹12,000 | 5 | ₹60,000 |
| **Total** | | **46** | **₹5,19,000** |

**USD:** ~$6,250 (at ₹83/$)

**Payment Schedule:**
- 30% upfront (on hiring)
- 40% after Week 2 (midpoint review)
- 30% after Week 4 (final delivery)

---

**Document End**  
**Next Action:** Share with stakeholders, approve budget, begin hiring
