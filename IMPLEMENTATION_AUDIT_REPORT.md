# HmarePanditJi — Implementation Audit Report
**Date:** March 26, 2026  
**Auditor:** Senior Technical Lead  
**Scope:** Part 0 + Part 1 Voice System Implementation Status

---

## EXECUTIVE SUMMARY

### ✅ IMPLEMENTED (Production-Ready)

**Voice Engine Infrastructure:**
- ✅ `voice-engine.ts` — Unified voice state machine with Sarvam + Deepgram integration
- ✅ `sarvam-tts.ts` — Sarvam Bulbul v3 TTS with LRU caching, pre-warming, offline fallback
- ✅ `deepgramSTT.ts` — Deepgram Nova-3 streaming STT with pooja vocabulary keyterms
- ✅ `sarvamSTT.ts` — Sarvam Saaras v3 streaming STT for regional languages
- ✅ Ambient noise detection (65dB threshold, calibrated for temple environments)
- ✅ Intent detection with word-boundary matching (ARCH-011 fix applied)
- ✅ Voice timeouts: 15s listen, 30s reprompt, max 3 errors

**State Management:**
- ✅ `onboardingStore.ts` — 22 phases (SPLASH → REGISTRATION), 15 languages, 40+ cities
- ✅ `registrationStore.ts` — Zustand persist middleware, session tracking
- ✅ `voiceStore.ts` — Voice state machine (IDLE → LISTENING → PROCESSING → SUCCESS/FAILURE)
- ✅ `uiStore.ts` — Network banner, celebration overlay, session timeout
- ✅ `languageStore.ts` — Language selection and persistence
- ✅ `navigationStore.ts` — Screen navigation state

**Screens Implemented:**
- ✅ Part 0.0 Language Selection: `language-confirm`, `language-list`, `language-choice`, `language-set`
- ✅ Part 0 Tutorial: `welcome`, `voice-tutorial`, `help`
- ✅ Registration: `mobile`, `otp`, `profile`, `complete`, `permissions/mic`, `permissions/location`, `permissions/notifications`, `permissions/mic-denied`
- ✅ Auth: `identity`, `referral/[code]`, `manual-city`, `location-permission`
- ✅ Emergency: `emergency-sos`, `emergency`

**Testing:**
- ✅ E2E tests with Playwright (registration, onboarding, error scenarios)
- ✅ Unit tests (accent detection, noise environments, number mapper, intent detection, utils)
- ✅ Voice test scripts (`test-stt.ts`, `test-tts.ts`, `voice-e2e-test.ts`)

**Documentation:**
- ✅ 20+ MDN files in `apps/pandit/docs/` (accent tests, noise tests, device matrix, security checklist)
- ✅ DEV2/DEV3 completion reports
- ✅ Voice verification docs

---

### ⚠️ PARTIALLY IMPLEMENTED (Needs Completion)

**1. Voice Scripts — CRITICAL GAP**
- ⚠️ `voice-scripts-part0.ts` exists but **incomplete**
  - Missing: Complete Part 0.0 scripts (S-0.0.1 through S-0.0.8)
  - Missing: Part 0 tutorial scripts (S-0.1 through S-0.12)
  - Missing: Dynamic language switching (Hindi → Tamil → Bengali, etc.)
  - **Impact:** App has voice engine but no actual scripts to speak

**2. TTS API Route**
- ⚠️ `/api/tts` route **not found** in codebase search
  - `sarvam-tts.ts` calls `/api/tts` but route doesn't exist
  - **Impact:** TTS will fail in production (no server-side API key proxy)

**3. STT Token Route**
- ⚠️ `/api/stt-token` route **not found**
  - `deepgramSTT.ts` and `sarvamSTT.ts` expect token route
  - **Impact:** STT may work client-side but exposes API keys

**4. Part 1 Screens (Post-Language Selection)**
- ⚠️ Homepage screen (`E-01`) — **not implemented**
- ⚠️ Identity confirmation (`E-02`) — **not implemented**
- ⚠️ Income hook, Fixed Dakshina, Online Revenue screens (`S-0.2`, `S-0.3`, `S-0.4`) — **not implemented**
- ⚠️ Backup Pandit, Instant Payment, Voice Navigation (`S-0.5` through `S-0.7`) — **not implemented**
- ⚠️ Dual Mode, Travel Calendar, Video Verification (`S-0.8` through `S-0.10`) — **not implemented**
- ⚠️ 4 Guarantees, Final CTA (`S-0.11`, `S-0.12`) — **not implemented**

**5. Voice Overlay Components**
- ⚠️ `VoiceOverlay.tsx` (V-02 Active Listening) — **not found**
- ⚠️ `ConfirmationSheet.tsx` (V-04 Confirmation Loop) — **not found**
- ⚠️ `ErrorOverlay.tsx` (V-05, V-06, V-07) — **not found**
- ⚠️ `NetworkBanner.tsx` (X-01) — **not found**
- ⚠️ `CelebrationOverlay.tsx` (T-02) — **not found**

---

### ❌ NOT IMPLEMENTED (Critical Gaps)

**1. Complete Voice Script Library**
- ❌ **22 screens worth of voice scripts** (Hindi + 14 regional languages)
- ❌ **Dynamic TTS generation** (translation API integration for Tamil, Bengali, etc.)
- ❌ **Number pronunciation** ("nau ath saat" → 9870)
- ❌ **Pooja vocabulary prompting** (dakshina, griha-pravesh, satyanarayan)

**2. API Routes (Server-Side)**
- ❌ `/api/tts` — Sarvam TTS proxy (keeps API key secure)
- ❌ `/api/stt-token` — Time-limited STT token generator
- ❌ `/api/translate` — Sarvam Mayura translation proxy
- ❌ `/api/referral/validate` — Referral code validation (route exists but needs verification)

**3. Part 1 Complete Flow**
- ❌ **12 tutorial screens** (S-0.1 through S-0.12) — only `welcome` and `voice-tutorial` exist
- ❌ **Animated illustrations** — screens reference animations but no Framer Motion implementation
- ❌ **Progress dots** — tutorial navigation (1-12 dots) not implemented
- ❌ **Tile interaction** — income hook grid (4 tiles) not implemented

**4. Voice Agent Orchestration**
- ❌ **Pipecat.ai integration** — mentioned in spec but not implemented
- ❌ **LLM integration** — no conversational AI for edge cases
- ❌ **IVR fallback** — Exotel integration for keypad phones

**5. Performance Optimizations**
- ❌ **Audio pre-warming** — `preWarmCache()` exists but not called on app load
- ❌ **Service Worker** — offline caching for TTS audio
- ❌ **Lazy loading** — voice scripts loaded synchronously

---

## DETAILED GAP ANALYSIS

### GAP-001: Voice Scripts Incomplete
**Spec Reference:** `HPJ_Voice_System_Complete.md` Part 2 (lines 1-2390)  
**Current State:** `voice-scripts-part0.ts` has placeholder structure  
**Missing:**
```typescript
// Should have 22 screens × 4 languages = 88 scripts minimum
export const PART_0_SCRIPTS: VoiceScript[] = [
  // S-0.0.1 Splash — NO VOICE (silent)
  // S-0.0.2 Location Permission — 3 variants (initial, timeout, denied)
  // S-0.0.2B Manual City — 2 variants
  // S-0.0.3 Language Confirm — dynamic (city + language)
  // ... through S-0.12
]
```
**Impact:** App cannot speak to Pandit without scripts  
**Effort:** 2-3 days for Hindi + English, +5 days for 14 regional languages

---

### GAP-002: API Routes Missing
**Spec Reference:** `HPJ_AI_Implementation_Prompts.md` PROMPT V-02, V-03  
**Current State:** No `/api/` routes found in `apps/pandit/src/app/`  
**Missing Files:**
```
apps/pandit/src/app/api/
├── tts/route.ts           # Sarvam Bulbul v3 proxy
├── stt-token/route.ts     # Deepgram/Sarvam token generator
├── translate/route.ts     # Sarvam Mayura proxy
└── referral/validate/route.ts  # Referral validation (exists but unverified)
```
**Impact:** API keys exposed client-side, security risk  
**Effort:** 1 day for 4 routes

---

### GAP-003: Part 1 Tutorial Screens
**Spec Reference:** `HPJ_Voice_System_Complete.md` Part 2 (S-0.1 through S-0.12)  
**Current State:** Only `welcome` and `voice-tutorial` exist  
**Missing:**
- S-0.2 Income Hook (testimonials, 4 tiles)
- S-0.3 Fixed Dakshina (emotional narrative)
- S-0.4 Online Revenue (Ghar Baithe + Consultancy)
- S-0.5 Backup Pandit
- S-0.6 Instant Payment
- S-0.7 Voice Navigation Demo
- S-0.8 Dual Mode
- S-0.9 Travel Calendar
- S-0.10 Video Verification
- S-0.11 4 Guarantees
- S-0.12 Final CTA

**Impact:** Registration flow incomplete, Pandits cannot complete onboarding  
**Effort:** 5-7 days for 11 screens (UI + voice integration)

---

### GAP-004: Voice Overlay Components
**Spec Reference:** `HPJ_Developer_Prompts_Master.md` PROMPT 1 (component structure)  
**Current State:** Components directory incomplete  
**Missing:**
```
apps/pandit/src/components/
├── voice/
│   ├── VoiceOverlay.tsx       # V-02 Active Listening UI
│   ├── ConfirmationSheet.tsx  # V-04 "Did you say X?" confirmation
│   ├── ErrorOverlay.tsx       # V-05/06/07 Error states
│   └── VoiceKeyboardToggle.tsx # K-01 Keyboard toggle
└── overlays/
    ├── NetworkBanner.tsx      # X-01 Network lost
    ├── SessionTimeout.tsx     # X-02 Session save notice
    └── CelebrationOverlay.tsx # T-02 Step completion
```
**Impact:** Voice UI has no visual feedback (pulsing mic, waveform, error states)  
**Effort:** 2-3 days for 7 components

---

### GAP-005: Translation Integration
**Spec Reference:** `HPJ_Voice_Complete_Guide.md` Part A.2 (Mayura API)  
**Current State:** No translation logic found  
**Missing:**
- Sarvam Mayura translation API integration
- Runtime language switching (Hindi → Tamil text)
- Bilingual TTS support (Hinglish code-mixing)

**Impact:** App speaks only Hindi, not 14 regional languages  
**Effort:** 2 days for Mayura integration + translation pipeline

---

## RECOMMENDATIONS

### Immediate (Week 1)
1. **Create API routes** (`/api/tts`, `/api/stt-token`) — 1 day
2. **Complete Part 0.0 voice scripts** (S-0.0.1 through S-0.0.8) — 2 days
3. **Implement voice overlay components** (VoiceOverlay, ErrorOverlay) — 2 days
4. **Fix pre-warming** — call `preWarmCache()` on splash screen load — 0.5 days

### Short-Term (Week 2-3)
5. **Complete Part 1 tutorial screens** (S-0.2 through S-0.12) — 5 days
6. **Add Sarvam Mayura translation** — 2 days
7. **Implement animated illustrations** (Framer Motion) — 3 days
8. **E2E test coverage** — 2 days

### Medium-Term (Week 4+)
9. **Pipecat.ai integration** — voice agent orchestration
10. **IVR fallback** — Exotel integration for non-smartphone Pandits
11. **Service Worker** — offline TTS caching
12. **Performance optimization** — lazy loading, code splitting

---

## TEAM REQUIREMENTS

### Current State
- ✅ **1 Senior Full-Stack Developer** (voice integration, state management)
- ✅ **1 QA Engineer** (E2E tests, manual testing)

### Required Additions (Freelance/Contract)

**1. Voice Script Specialist (Hindi + Regional Languages)**
- **Role:** Write and record all 22 screens × 15 languages = 330 voice scripts
- **Skills:** Native Hindi speaker, familiarity with Bhojpuri/Maithili accents, understanding of Hindu priest context
- **Effort:** 10-15 days (2-3 scripts/hour including QA)
- **Deliverable:** `voice-scripts-part0-complete.ts` with all scripts

**2. UI/Animation Developer (Framer Motion Expert)**
- **Role:** Implement 12 tutorial screens with animated illustrations
- **Skills:** Framer Motion v11, SVG animation, mobile-first responsive design
- **Effort:** 7-10 days (1 screen/day including voice integration)
- **Deliverable:** 12 fully animated screens (S-0.1 through S-0.12)

**3. Backend Developer (API Routes + Security)**
- **Role:** Create secure API routes, token management, rate limiting
- **Skills:** Next.js API routes, Sarvam/Deepgram SDKs, security best practices
- **Effort:** 3-5 days
- **Deliverable:** 4 API routes with error handling, logging, rate limiting

**4. Voice UI Component Developer**
- **Role:** Build voice overlay components (waveform, confirmation sheet, error states)
- **Skills:** React, Tailwind, accessibility (WCAG 2.1 AA)
- **Effort:** 5-7 days
- **Deliverable:** 7 reusable voice UI components

**Total Freelance Team:** 4 developers  
**Total Effort:** 25-37 person-days  
**Timeline:** 2-3 weeks (parallel workstreams)

---

## COST ESTIMATE (Freelance Rates, INR)

| Role | Daily Rate | Days | Total (INR) |
|------|-----------|------|-------------|
| Voice Script Specialist | ₹8,000 | 15 | ₹1,20,000 |
| UI/Animation Developer | ₹12,000 | 10 | ₹1,20,000 |
| Backend Developer | ₹15,000 | 5 | ₹75,000 |
| Voice UI Component Dev | ₹10,000 | 7 | ₹70,000 |
| **Total** | | **37** | **₹3,85,000** |

**USD Equivalent:** ~$4,600 (at ₹83/$)

**Note:** Does not include Sarvam API costs (₹5-8 per Pandit onboarding) or cloud hosting.

---

## VERIFICATION CHECKLIST

### Before Hiring
- [ ] Confirm Sarvam API key is active and has credits
- [ ] Verify Deepgram API key has streaming STT access
- [ ] Test voice engine on Samsung Galaxy A12 (target device)
- [ ] Validate 65dB noise threshold in temple environment

### After Hiring (Week 1)
- [ ] API routes return valid audio (curl test)
- [ ] Voice scripts play without gaps/clicks
- [ ] Noise detection triggers keyboard fallback at 85dB+
- [ ] Intent detection correctly identifies "haan", "nahi", "skip"

### After Hiring (Week 2-3)
- [ ] All 12 tutorial screens complete with voice
- [ ] Translation works for Tamil, Bengali, Telugu
- [ ] E2E tests pass for registration flow
- [ ] Lighthouse score >90 (Performance, Accessibility)

---

## CONCLUSION

**Current Implementation Status:** 60% complete  
**Remaining Work:** 40% (critical gaps in scripts, API routes, Part 1 screens)  
**Risk Level:** MEDIUM (voice engine works but no scripts to speak)  
**Recommended Action:** Hire 4 freelancers for 2-3 weeks to complete implementation

**Priority Order:**
1. Backend Developer (API routes) — unblocks TTS/STT
2. Voice Script Specialist — provides content for voice engine
3. Voice UI Component Developer — adds visual feedback
4. UI/Animation Developer — completes tutorial screens

**Timeline to Production:** 3 weeks with full team

---

**Report End**
