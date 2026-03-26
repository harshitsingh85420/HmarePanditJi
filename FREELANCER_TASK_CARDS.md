# Freelancer Task Cards — HmarePanditJi
**Print and distribute to each team member**

---

## 🟢 CARD 1: Backend Developer (Rajesh Kumar)

### Your Mission (Week 1)
Build 4 secure API routes that power all voice interactions.

### Daily Tasks

#### Day 1-2: `/api/tts` Route
```
✅ Create: apps/pandit/src/app/api/tts/route.ts
✅ Import Sarvam AI SDK
✅ Validate input (text < 2500 chars)
✅ Call Sarvam Bulbul v3 API
✅ Return base64 audio
✅ Add rate limiting (100 req/min)
✅ Test with curl command provided
```

#### Day 3: `/api/stt-token` Route
```
✅ Create: apps/pandit/src/app/api/stt-token/route.ts
✅ Generate 60-second tokens
✅ Store in Redis/memory cache
✅ Return token with expiry
```

#### Day 4: `/api/translate` Route
```
✅ Create: apps/pandit/src/app/api/translate/route.ts
✅ Call Sarvam Mayura API
✅ Add LRU cache (500 entries)
✅ Return translated text + confidence
```

#### Day 5: `/api/referral/validate` + Docs
```
✅ Update existing route
✅ Add environment variables
✅ Write API_ROUTES.md documentation
```

### Acceptance Tests (Run These)
```bash
# Test TTS route
curl -X POST http://localhost:3002/api/tts \
  -H "Content-Type: application/json" \
  -d '{"text":"नमस्ते","languageCode":"hi-IN","speaker":"priya","pace":0.82}'

# Expected: JSON with audioBase64 (2000+ chars)

# Test STT token route
curl -X POST http://localhost:3002/api/stt-token \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"test_123"}'

# Expected: JSON with token, expiresAt < 60s

# Test translate route
curl -X POST http://localhost:3002/api/translate \
  -H "Content-Type: application/json" \
  -d '{"text":"Welcome","sourceLanguage":"en-IN","targetLanguage":"hi-IN"}'

# Expected: {"translatedText":"स्वागत है","confidence":0.92}
```

### Deliverables (Due Day 5 PM)
- [ ] 4 working API routes
- [ ] `.env.local.example` file
- [ ] `API_ROUTES.md` documentation
- [ ] All tests passing

### Contact
- Slack: `@rajesh.backend`
- GitHub: Assign PRs to `@rajesh-kumar-dev`

---

## 🟡 CARD 2: Voice Script Specialist (Dr. Priya Sharma)

### Your Mission (Week 1)
Write 405 voice scripts for Part 0.0 (9 screens × 3 variants × 15 languages)

### Daily Tasks

#### Day 1 AM: Guidelines
```
✅ Write VOICE_SCRIPT_GUIDELINES.md
✅ Define TTS settings per screen type
✅ Create script template
```

#### Day 1 PM: S-0.0.2 Location Permission
```
✅ Write 15 Hindi scripts (3 variants)
✅ Write 15 Tamil scripts
✅ Write 15 Telugu scripts
✅ Write 15 Bengali scripts
✅ Write 15 Marathi scripts
Total: 75 scripts
```

#### Day 2 AM: S-0.0.2B Manual City
```
✅ Write 30 scripts (15 languages × 2 variants)
✅ Include dynamic [CITY_NAME] variable
```

#### Day 2 PM - Day 4: S-0.0.3 to S-0.0.8
```
✅ S-0.0.3: 60 scripts (15 × 4)
✅ S-0.0.4: 60 scripts (15 × 4)
✅ S-0.0.5: 60 scripts (15 × 4)
✅ S-0.0.6: 75 scripts (15 × 5) ← Celebration (5 language variants!)
✅ S-0.0.7: 15 scripts (15 × 1)
✅ S-0.0.8: 45 scripts (15 × 3)
Total: 315 scripts
```

#### Day 5: QA & Testing
```
✅ Test all 405 scripts via Sarvam TTS
✅ Verify pronunciation (Varanasi, Chennai, Kolkata)
✅ Check pause durations
✅ Get native speaker review (5 languages)
✅ Write QA report
```

### Script Template (Use This)
```typescript
{
  screenId: "S-0.0.2",
  trigger: "on_screen_load",
  text: "नमस्ते। मैं आपका शहर जानना चाहता हूँ।",
  romanTransliteration: "Namaste. Main aapka shehar jaanna chahta hoon.",
  englishMeaning: "Hello. I want to know your city.",
  language: "hi-IN",
  speaker: "priya",
  pace: 0.88,
  pauseAfterMs: 1000,
  maxDurationS: 8,
  emotionalTone: "warm_respectful",
}
```

### Priority Languages (In Order)
1. Hindi (hi-IN) — Base, do first
2. Tamil (ta-IN) — High priority
3. Telugu (te-IN) — High priority
4. Bengali (bn-IN) — High priority
5. Marathi (mr-IN) — Medium priority
6. Gujarati (gu-IN) — Medium
7. Kannada (kn-IN) — Medium
8. Malayalam (ml-IN) — Medium
9. Punjabi (pa-IN) — Low
10. Odia (or-IN) — Low
11. English (en-IN) — Low
12. Bhojpuri (hi-IN fallback)
13. Maithili (hi-IN fallback)
14. Sanskrit (hi-IN fallback)
15. Assamese (hi-IN fallback)

### Deliverables (Due Day 5 PM)
- [ ] `VOICE_SCRIPT_GUIDELINES.md`
- [ ] 405 voice scripts (10 TypeScript files)
- [ ] `VOICE_SCRIPT_QA_REPORT.md`

### Contact
- Slack: `@priya.voice`
- GitHub: Assign PRs to `@dr-priya-sharma`

---

## 🔵 CARD 3: UI/Animation Developer (Arjun Mehta)

### Your Mission (Week 2)
Build 11 tutorial screens (S-0.2 to S-0.12) with Framer Motion animations

### Daily Tasks

#### Day 1: S-0.2 Income Hook
```
✅ Create: apps/pandit/src/app/(auth)/income-hook/page.tsx
✅ Testimonial card (Pandit Ramesh Sharma)
✅ 4 income tiles (tap targets 72px min)
✅ Voice script on load
✅ "आगे" CTA button
✅ Skip button
```

#### Day 2: S-0.3 Fixed Dakshina
```
✅ Emotional narrative animation
✅ Before/after cards
✅ "मोलभाव खत्म" highlight
```

#### Day 3: S-0.4 Online Revenue
```
✅ Dual cards (Ghar Baithe + Consultancy)
✅ Income calculation animation
```

#### Day 4: S-0.5 Backup Pandit
```
✅ 3-step explanation flow
✅ Skepticism handling ("यह कैसे हो सकता है?")
✅ Payment breakdown
```

#### Day 5: S-0.6 Instant Payment
```
✅ Payment breakdown animation
✅ Bank transfer visualization
```

#### Day 6: S-0.7 Voice Nav Demo
```
✅ Interactive voice demo (mic live)
✅ Real-time transcript display
✅ Success/failure states
```

#### Day 7: S-0.8 Dual Mode
```
✅ Smartphone vs keypad comparison
✅ Family help inclusion message
```

#### Day 8: S-0.9 Travel Calendar
```
✅ Map animation
✅ Calendar integration
✅ Double booking prevention
```

#### Day 9: S-0.10 Video Verification
```
✅ Badge animation
✅ Privacy assurance
✅ "3 lakh Pandits" social proof
```

#### Day 10: S-0.11 4 Guarantees
```
✅ 4 cards with icons
✅ Animated reveal
✅ Social proof at end
```

#### Day 11: S-0.12 Final CTA
```
✅ Decision screen
✅ Helpline number display
✅ Confetti on "Yes"
```

### Each Screen Must Have
```
✅ TopBar (ॐ + globe + back button)
✅ Progress dots (correct dot active)
✅ Animated illustration (Framer Motion)
✅ Voice script (plays on load)
✅ Voice indicator (pulsing bars)
✅ CTA button ("आगे" or "Skip")
✅ Skip button (top-right)
✅ Responsive (390px viewport)
✅ Keyboard fallback option
```

### Acceptance Tests
```
✅ Test on Chrome DevTools (390x844 viewport)
✅ Test on Samsung Galaxy A12 (physical device)
✅ Lighthouse score >90
✅ No console errors
✅ All animations 60fps
```

### Deliverables (Due Day 11 PM)
- [ ] 11 screen components
- [ ] All voice integrations working
- [ ] Mobile responsive

### Contact
- Slack: `@arjun.ui`
- GitHub: Assign PRs to `@arjun-mehta-dev`

---

## 🟣 CARD 4: Voice UI Component Developer (Sneha Patel)

### Your Mission (Week 2)
Build 7 voice overlay components with accessibility (WCAG 2.1 AA)

### Daily Tasks

#### Day 1-2: VoiceOverlay (V-02)
```
✅ Create: apps/pandit/src/components/voice/VoiceOverlay.tsx
✅ 5 waveform bars (orange gradient)
✅ Pulsing ring animation
✅ Real-time interim transcript
✅ Noise warning (>65dB)
✅ Auto-hide after 3s silence
```

#### Day 3: ConfirmationSheet (V-04)
```
✅ Create: apps/pandit/src/components/voice/ConfirmationSheet.tsx
✅ Bottom sheet slide-up animation
✅ Transcribed text (large font)
✅ "हाँ, सही है" (green) button
✅ "नहीं, बदलें" (red) button
✅ 15s countdown auto-dismiss
```

#### Day 4-5: ErrorOverlay (V-05/V-06/V-07)
```
✅ Create: apps/pandit/src/components/voice/ErrorOverlay.tsx
✅ Error 1: "माफ़ कीजिए, फिर से बोलिए"
✅ Error 2: "आवाज़ समझ नहीं आई"
✅ Error 3: "Keyboard से जवाब दीजिए" + auto-open keyboard
```

#### Day 6: NetworkBanner (X-01)
```
✅ Create: apps/pandit/src/components/overlays/NetworkBanner.tsx
✅ Online: "Reconnected ✓" (green, 2s)
✅ Offline: "Network chala gaya" (amber, sticky)
```

#### Day 7: CelebrationOverlay (T-02)
```
✅ Create: apps/pandit/src/components/overlays/CelebrationOverlay.tsx
✅ Saffron glow ring
✅ Checkmark draw animation
✅ Confetti (5-10 particles)
✅ 1.4s duration
```

#### Day 8: TopBar
```
✅ Create: apps/pandit/src/components/TopBar.tsx
✅ ॐ symbol + "HmarePanditJi" text
✅ Globe icon (language change)
✅ Back button (conditional)
✅ Saffron gradient background
```

#### Day 9: SahayataBar
```
✅ Create: apps/pandit/src/components/SahayataBar.tsx
✅ "सहायता" text + phone icon
✅ Helpline number on tap
✅ Call button
✅ Write COMPONENTS.md documentation
```

### Accessibility Checklist (Every Component)
```
✅ All buttons have aria-label
✅ Voice indicator has screen reader text
✅ Color contrast 4.5:1 minimum
✅ Keyboard navigation (Tab, Enter, Escape)
✅ Focus indicators visible
✅ No motion for users with prefers-reduced-motion
```

### Deliverables (Due Day 9 PM)
- [ ] 7 component files
- [ ] `COMPONENTS.md` documentation
- [ ] All accessibility tests passing

### Contact
- Slack: `@sneha.components`
- GitHub: Assign PRs to `@sneha-patel-dev`

---

## 🟠 CARD 5: Translation Specialist (Vikram Singh)

### Your Mission (Week 2)
Integrate Sarvam Mayura + build 14-language translation pipeline

### Daily Tasks

#### Day 1-2: Translation Engine
```
✅ Create: apps/pandit/src/lib/sarvam-translate.ts
✅ Call /api/translate route
✅ Implement LRU cache (500 entries)
✅ Add error handling + fallback to Hindi
```

#### Day 3-4: Language Switcher
```
✅ Create: apps/pandit/src/lib/language-switcher.ts
✅ Runtime script translation
✅ Dynamic language switching
✅ Test with 5 priority languages
```

#### Day 5: Language Validator
```
✅ Create: apps/pandit/src/lib/language-validator.ts
✅ Normalize language codes
✅ Fallback mappings (Bhojpuri → hi-IN, etc.)
✅ Validate all 15 languages
```

### Acceptance Tests
```typescript
// Test translation engine
translateEngine.translate({
  text: "Welcome Pandit Ji",
  sourceLanguage: "en-IN",
  targetLanguage: "hi-IN",
  onResult: (text, confidence) => {
    console.log(text) // "स्वागत है पंडित जी"
    console.log(confidence) // 0.95
  }
})

// Test language switcher
const tamilScript = await getScriptInLanguage("S-0.0.2", "ta-IN")
console.log(tamilScript.text) // Tamil translation
```

### Deliverables (Due Day 5 PM)
- [ ] `sarvam-translate.ts`
- [ ] `language-switcher.ts`
- [ ] `language-validator.ts`
- [ ] Integration test report

### Contact
- Slack: `@vikram.translation`
- GitHub: Assign PRs to `@vikram-singh-dev`

---

## 📋 COMMON INFORMATION FOR ALL

### Project Setup (Day 1 AM)
```bash
# Clone repo
git clone https://github.com/hmarepanditji/hmarepanditji.git
cd hmarepanditji

# Install dependencies
npm install

# Set up environment
cp apps/pandit/.env.local.example apps/pandit/.env.local
# Add your API keys (get from Senior Dev)

# Start dev server
npm run dev -- --filter=@hmarepanditji/pandit
# Runs on http://localhost:3002
```

### Git Workflow
```bash
# Create feature branch
git checkout -b feature/your-task-name

# Commit frequently
git add .
git commit -m "feat: implement [task name]"

# Push daily
git push origin feature/your-task-name

# Create PR when done
# Assign to: @senior-dev-review
# Label: [your-name], [task-type]
```

### Communication
- **Daily Standup:** 10 AM IST (Slack huddle)
- **Weekly Demo:** Friday 3 PM IST (Zoom)
- **Slack Channel:** `#hmarepanditji-dev`
- **GitHub:** All PRs to `main` branch

### Payment Schedule
- **30% upfront:** On hiring (Day 1)
- **40% midpoint:** After Week 2 review (Day 10)
- **30% final:** After Week 4 delivery (Day 23)

### Escalation Path
1. Blocker > 4 hours → Post in Slack `#hmarepanditji-dev`
2. No response in 2 hours → DM Senior Dev directly
3. Critical bug → Call Senior Dev (phone number in Slack)

---

**Print these cards and distribute on Day 1**
