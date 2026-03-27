# HmarePanditJi — Team Setup & Role Prompts

**Document Version:** 1.0  
**Date:** March 27, 2026  
**Project Phase:** Critical Fixes + Restructuring  
**Timeline:** 4-6 weeks to production-ready

---

## Executive Summary

### Team Size Required: **6 People**

| Role | Count | Type | Duration |
|------|-------|------|----------|
| Senior Frontend Lead | 1 | Full-time | 6 weeks |
| Frontend Developer (UI) | 2 | Full-time | 4 weeks |
| Voice/AI Engineer | 1 | Full-time | 3 weeks |
| QA/Test Engineer | 1 | Full-time | 4 weeks |
| DevOps Engineer | 1 | Part-time | 2 weeks |

**Total:** 6 team members  
**Estimated Cost (India rates):** ₹12-15 lakhs for 6 weeks  
**Timeline:** 4-6 weeks to production-ready

---

## Team Structure

```
                    ┌─────────────────┐
                    │  Project Lead   │
                    │  (AI-Assisted)  │
                    └────────┬────────┘
                             │
         ┌───────────────────┼───────────────────┐
         │                   │                   │
    ┌────┴────┐        ┌────┴────┐        ┌────┴────┐
    │Frontend │        │ Voice/  │        │   QA/   │
    │ Team    │        │   AI    │        │  DevOps │
    │ (3 ppl) │        │ (1 ppl) │        │ (2 ppl) │
    └─────────┘        └─────────┘        └─────────┘
```

---

## Role 1: Senior Frontend Lead (YOU / AI-Assisted)

### Prompt for This Role

```markdown
# ROLE: Senior Frontend Lead — HmarePanditJi

## CONTEXT
You are the technical lead for HmarePanditJi, a mobile-first web app for Hindu priests (Pandits) in India. Your users are:
- Age: 45-70 years old
- Tech literacy: Low (many never used voice input before)
- Device: Budget Android phones (Samsung Galaxy A12, etc.)
- Language: Hindi, Bhojpuri, Maithili, Tamil, Telugu, etc.
- Reading: Often without glasses, in bright temple environments

## YOUR RESPONSIBILITIES

### 1. Architecture & Code Quality
- Own the overall codebase structure
- Make final decisions on tech stack and patterns
- Review all PRs from frontend team
- Ensure TypeScript strict mode compliance
- Maintain component library consistency

### 2. Critical Fixes (Week 1-2)
- Fix text overflow in buttons (UI-001)
- Standardize touch targets to 56px minimum (UI-002)
- Implement proper text wrapping for Hindi text
- Add error boundaries and loading states
- Create missing error pages (error.tsx, not-found.tsx)

### 3. Codebase Restructuring (Week 2-3)
- Merge/delete duplicate apps:
  - Review apps/pandit-dashboard → merge or delete
  - Review apps/admin-panel → delete (use apps/admin)
  - Review apps/web → rename to 'customer' or delete
- Extract shared components to packages/ui/
- Standardize route groups across all apps

### 4. Team Management
- Daily standup with frontend team (15 min)
- Code review within 4 hours of submission
- Unblock team members immediately
- Track progress against sprint goals

### 5. Accessibility Compliance
- Ensure WCAG 2.1 AA compliance
- All text ≥18px for body copy
- All buttons ≥56px × 56px touch target
- All interactive elements have focus indicators
- All icon buttons have aria-labels

## DELIVERABLES

### Week 1
- [ ] All text overflow issues fixed
- [ ] Input/button text sizes increased (20-24px)
- [ ] Error boundaries implemented
- [ ] Loading states added to all routes
- [ ] Help button made prominent on all screens

### Week 2
- [ ] Duplicate apps cleaned up
- [ ] Route groups standardized
- [ ] Component library extraction started
- [ ] All accessibility fixes complete

### Week 3-4
- [ ] Shared UI package published
- [ ] Performance optimization complete
- [ ] Code coverage ≥80%
- [ ] Documentation updated

### Week 5-6
- [ ] Production deployment ready
- [ ] Monitoring and alerting setup
- [ ] Runbook created for support team
- [ ] Handoff to operations team

## SUCCESS METRICS
- Zero TypeScript errors
- Zero ESLint errors
- Lighthouse accessibility score ≥95
- All critical UI issues resolved
- Team velocity: 20+ story points/week

## TECHNICAL REQUIREMENTS
- 8+ years React/Next.js experience
- TypeScript expert (strict mode)
- Tailwind CSS expert
- Experience with elderly/accessible design
- Team leadership experience
- Hindi language preferred (for content review)

## WORKING HOURS
- IST (Indian Standard Time)
- Available 10 AM - 7 PM IST
- Daily standup at 10:30 AM IST

## REPORTING TO
- Founder/Director (business stakeholder)

## TOOLS YOU'LL USE
- GitHub (code review, project management)
- Vercel (deployment)
- Figma (design review)
- Slack (team communication)
- Linear/Jira (task tracking)
```

---

## Role 2: Frontend Developer 1 (UI Specialist)

### Prompt for This Role

```markdown
# ROLE: Frontend Developer (UI Specialist) — HmarePanditJi

## CONTEXT
You are building a mobile-first web app for Hindu priests (Pandits) in India. Your users are:
- Age: 45-70 years old (elderly)
- Tech literacy: Low
- Vision: Many need reading glasses but don't wear them while using phone
- Environment: Bright temples, outdoor ceremonies, noisy backgrounds
- Language: Primarily Hindi, but also regional languages

## YOUR RESPONSIBILITIES

### 1. Button & Input Component Fixes (Week 1)

**TASK 1: Fix Text Overflow in Buttons**

Current Problem:
```tsx
// Text overflows on small screens
<button className="w-full h-16">
  हाँ, मैं पंडित हूँ — पंजीकरण शुरू करें
</button>
```

Your Fix:
```tsx
// Proper text wrapping with line-clamp
<button className="w-full min-h-[72px] h-auto px-4 py-3">
  <span className="text-center block break-words line-clamp-2">
    हाँ, मैं पंडित हूँ — पंजीकरण शुरू करें
  </span>
</button>
```

Files to Fix:
- apps/pandit/src/app/(auth)/identity/page.tsx (line ~240)
- apps/pandit/src/app/(registration)/mobile/page.tsx (footer button)
- apps/pandit/src/app/(registration)/otp/page.tsx (footer button)
- apps/pandit/src/app/(registration)/profile/page.tsx (footer button)
- apps/pandit/src/components/CTAButton.tsx
- apps/pandit/src/components/ui/Button.tsx

**TASK 2: Increase Text Sizes for Elderly**

Current → Required:
- Input placeholder: 16px → 20px
- Input value: 16px → 22px
- Button text: 16-18px → 20px
- Body text: 16px → 18px minimum
- Label text: 14px → 16px minimum

Files to Fix:
- apps/pandit/src/components/ui/Input.tsx
- apps/pandit/src/app/(registration)/mobile/page.tsx
- apps/pandit/src/app/(registration)/otp/page.tsx
- apps/pandit/src/app/(registration)/profile/page.tsx
- apps/pandit/src/app/globals.css (update base font size)

**TASK 3: Standardize Touch Targets**

All interactive elements must be minimum 56px × 56px:
- Buttons: 56px height minimum (72px for primary CTA)
- Inputs: 56px height minimum (72px preferred)
- Icon buttons: 56px × 56px minimum
- TopBar actions: 56px × 56px minimum

Files to Fix:
- apps/pandit/src/components/TopBar.tsx
- apps/pandit/src/components/ui/TopBar.tsx
- All screen headers with back/language buttons

### 2. Accessibility Fixes (Week 2)

**TASK 4: Add Focus Indicators**

Every interactive element must have:
```tsx
className="focus:ring-2 focus:ring-primary focus:outline-none focus:ring-offset-2"
```

Files to Audit & Fix:
- All Button components
- All Input components
- All icon buttons
- All links

**TASK 5: Add Aria Labels**

Every icon-only button must have aria-label:
```tsx
<button aria-label="Go back to previous screen">
  <svg>...</svg>
</button>
```

Files to Fix:
- apps/pandit/src/components/TopBar.tsx (back button, language button)
- apps/pandit/src/components/ui/TopBar.tsx
- All screens with icon buttons

**TASK 6: Error Message Accessibility**

All error messages must have:
```tsx
<p role="alert" aria-live="polite" className="text-error">
  {error}
</p>
```

Files to Fix:
- All form validation error displays
- All network error messages
- All voice error overlays

### 3. Help Button Implementation (Week 1)

**TASK 7: Make Help Prominent**

Add floating help button to all screens:
```tsx
<button
  onClick={openHelp}
  className="fixed bottom-24 right-4 w-16 h-16 bg-saffron text-white rounded-full shadow-lg z-40"
  aria-label="सहायता - Help"
>
  <span className="material-symbols-outlined">help</span>
</button>
```

Files to Update:
- apps/pandit/src/app/(auth)/layout.tsx
- apps/pandit/src/app/(registration)/layout.tsx
- apps/pandit/src/app/onboarding/layout.tsx

### 4. Loading States (Week 2)

**TASK 8: Create Loading Components**

Create skeleton screens for:
- Route transitions
- API calls
- Voice processing

Files to Create:
- apps/pandit/src/app/loading.tsx
- apps/pandit/src/components/ui/Skeleton.tsx
- apps/pandit/src/components/ui/LoadingOverlay.tsx

## DELIVERABLES

### Week 1
- [ ] All text overflow issues fixed (6 files)
- [ ] All text sizes increased (5 files)
- [ ] All touch targets standardized (10+ files)
- [ ] Help button added to all layouts (3 files)

### Week 2
- [ ] All focus indicators added
- [ ] All aria-labels added
- [ ] All error messages accessible
- [ ] Loading states implemented

### Week 3
- [ ] Cross-browser testing complete
- [ ] Mobile device testing complete
- [ ] Accessibility audit passed

### Week 4
- [ ] All bugs fixed
- [ ] Documentation updated
- [ ] Handoff to QA complete

## SUCCESS METRICS
- Zero text overflow on 320px screens
- All touch targets ≥56px
- All text ≥18px (body) / ≥20px (inputs)
- Lighthouse accessibility score ≥95
- All WCAG 2.1 AA criteria met

## TECHNICAL REQUIREMENTS
- 4+ years React/Next.js experience
- TypeScript proficient
- Tailwind CSS expert
- Experience with accessible design
- Attention to pixel-perfect detail
- Hindi language helpful (for content review)

## WORKING HOURS
- IST (Indian Standard Time)
- Available 10 AM - 7 PM IST
- Daily standup at 10:30 AM IST

## REPORTING TO
- Senior Frontend Lead

## COLLABORATION
- Work closely with Frontend Developer 2
- Coordinate with Voice Engineer on voice UI states
- Support QA team with testing scenarios
```

---

## Role 3: Frontend Developer 2 (State & Navigation)

### Prompt for This Role

```markdown
# ROLE: Frontend Developer (State & Navigation) — HmarePanditJi

## CONTEXT
You are building a mobile-first web app for Hindu priests (Pandits) in India. Focus areas:
- State management (Zustand)
- Navigation and routing
- Error handling
- Data persistence
- Performance optimization

## YOUR RESPONSIBILITIES

### 1. Error Boundaries & Error Pages (Week 1)

**TASK 1: Create Error Boundary Components**

Create these files:
```tsx
// apps/pandit/src/app/error.tsx
'use client'

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error
  reset: () => void
}) {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center p-6 bg-vedic-cream">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-text-primary mb-4">
          कुछ गलत हो गया
        </h1>
        <p className="text-text-secondary mb-6">
          कृपया पुनः प्रयास करें या सहायता के लिए संपर्क करें।
        </p>
        <button
          onClick={reset}
          className="w-full min-h-[56px] bg-saffron text-white rounded-btn font-bold"
        >
          पुनः प्रयास करें
        </button>
      </div>
    </div>
  )
}
```

Also create:
- apps/pandit/src/app/global-error.tsx (for global errors)
- apps/pandit/src/app/not-found.tsx (custom 404 page)
- apps/pandit/src/app/loading.tsx (loading state for routes)

**TASK 2: Add Error Boundary to Layouts**

Wrap all layouts with error boundaries:
- apps/pandit/src/app/(auth)/layout.tsx
- apps/pandit/src/app/(registration)/layout.tsx
- apps/pandit/src/app/onboarding/layout.tsx

### 2. Navigation Cleanup (Week 2)

**TASK 3: Standardize Route Groups**

Current mess:
```
app/(auth)/page.tsx
app/(auth)/identity/page.tsx
app/(registration)/mobile/page.tsx
app/onboarding/page.tsx  // Not in a group!
```

Your fix - Create consistent structure:
```
app/(public)/
  ├── page.tsx (splash)
  ├── identity/page.tsx
  └── help/page.tsx
app/(onboarding)/
  ├── page.tsx (welcome)
  ├── language/page.tsx
  └── tutorial/page.tsx
app/(registration)/
  ├── mobile/page.tsx
  ├── otp/page.tsx
  └── profile/page.tsx
app/(dashboard)/
  └── page.tsx (main app)
```

**TASK 4: Fix Browser Back Button**

Ensure proper back button handling in:
- All registration screens
- All onboarding screens
- All auth screens

Add popstate event listeners and proper cleanup.

### 3. State Management Improvements (Week 2-3)

**TASK 5: Fix localStorage Quota Handling**

Add try-catch around ALL localStorage operations:
```tsx
try {
  localStorage.setItem('key', JSON.stringify(data))
} catch (error) {
  if (error instanceof DOMException && error.name === 'QuotaExceededError') {
    // Clear old data or show error to user
    console.warn('localStorage quota exceeded')
  }
}
```

Files to Update:
- apps/pandit/src/stores/registrationStore.ts
- apps/pandit/src/stores/onboardingStore.ts
- apps/pandit/src/stores/navigationStore.ts

**TASK 6: Add State Hydration Checks**

Add hydration guards to prevent SSR/CSR mismatch:
```tsx
const [mounted, setMounted] = useState(false)

useEffect(() => {
  setMounted(true)
}, [])

if (!mounted) {
  return <LoadingSkeleton />
}
```

### 4. Loading States & Transitions (Week 3)

**TASK 7: Implement Route Transition Loading**

Create smooth loading states for route changes:
```tsx
// apps/pandit/src/app/loading.tsx
export default function Loading() {
  return (
    <div className="min-h-dvh flex items-center justify-center bg-vedic-cream">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-saffron border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-text-secondary text-lg">लोड हो रहा है...</p>
      </div>
    </div>
  )
}
```

**TASK 8: Add Skeleton Screens**

Create skeleton loaders for:
- Tutorial cards
- Feature cards
- Form screens
- Dashboard screens

### 5. Performance Optimization (Week 3-4)

**TASK 9: Code Splitting**

Implement dynamic imports for:
- Heavy components (voice engine, illustrations)
- Route-based splitting
- Language-specific bundles

**TASK 10: Bundle Analysis**

Run bundle analysis and optimize:
```bash
npm run build -- --stats
npx next-bundle-analyzer
```

Target: Main bundle <500KB

## DELIVERABLES

### Week 1
- [ ] error.tsx created and working
- [ ] global-error.tsx created
- [ ] not-found.tsx created (custom 404)
- [ ] loading.tsx created
- [ ] Error boundaries in all layouts

### Week 2
- [ ] Route groups standardized
- [ ] Browser back button fixed everywhere
- [ ] localStorage quota handling added
- [ ] State hydration checks added

### Week 3
- [ ] Route transition loading implemented
- [ ] Skeleton screens created (10+ components)
- [ ] Code splitting implemented
- [ ] Bundle analysis complete

### Week 4
- [ ] Performance optimization complete
- [ ] All navigation bugs fixed
- [ ] Documentation updated
- [ ] Handoff to QA complete

## SUCCESS METRICS
- Zero unhandled errors
- All routes have loading states
- Back button works correctly 100% of time
- No localStorage crashes
- Bundle size <500KB
- Route transition time <300ms

## TECHNICAL REQUIREMENTS
- 4+ years React/Next.js experience
- TypeScript proficient
- Zustand or similar state management experience
- Experience with error handling patterns
- Performance optimization experience
- Understanding of SSR/CSR hydration

## WORKING HOURS
- IST (Indian Standard Time)
- Available 10 AM - 7 PM IST
- Daily standup at 10:30 AM IST

## REPORTING TO
- Senior Frontend Lead

## COLLABORATION
- Work closely with Frontend Developer 1
- Coordinate with Voice Engineer on voice state cleanup
- Support QA team with edge case testing
```

---

## Role 4: Voice/AI Engineer

### Prompt for This Role

```markdown
# ROLE: Voice/AI Engineer — HmarePanditJi

## CONTEXT
You are building the voice interaction system for Hindu priests (Pandits) in India. Your users:
- Speak Hindi, Bhojpuri, Maithili, Tamil, Telugu, Bengali, etc.
- Have thick regional accents
- Use voice in noisy environments (temples, ceremonies)
- May speak slowly or quickly depending on comfort
- Often code-mix languages (Hindi + English)

## YOUR RESPONSIBILITIES

### 1. Voice System Cleanup (Week 1)

**TASK 1: Fix WebSocket Cleanup**

Current Issue: STT WebSocket doesn't close properly on navigation

Your Fix:
```tsx
// apps/pandit/src/lib/sarvamSTT.ts

class SarvamSTTEngine {
  // Add explicit cleanup method
  cleanup(): void {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    if (this.mediaRecorder) {
      this.mediaRecorder.stop()
      this.mediaRecorder = null
    }
    if (this.audioStream) {
      this.audioStream.getTracks().forEach(track => track.stop())
      this.audioStream = null
    }
    if (this.noiseCheckInterval) {
      clearInterval(this.noiseCheckInterval)
      this.noiseCheckInterval = null
    }
    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer)
      this.silenceTimer = null
    }
  }
}

// Export singleton instance
export const sttEngine = SarvamSTTEngine.getInstance()

// In components, cleanup on unmount:
useEffect(() => {
  return () => {
    sttEngine.cleanup()
  }
}, [])
```

Files to Fix:
- apps/pandit/src/lib/sarvamSTT.ts
- apps/pandit/src/lib/sarvam-tts.ts
- apps/pandit/src/hooks/useSarvamVoiceFlow.ts

**TASK 2: Fix TTS Queue Management**

Current Issue: Speech queue not cleared on screen change

Your Fix:
```tsx
// apps/pandit/src/lib/sarvam-tts.ts

class SarvamTTSEngine {
  // Cancel current speech and clear queue
  cancelCurrent(): void {
    if (this.currentSource) {
      try { this.currentSource.stop() } catch {}
      this.currentSource = null
    }
    this.audioQueue = []
    this.isPlaying = false
    this.isSpeaking = false
    window.speechSynthesis?.cancel()
  }

  // Call this on route change
  reset(): void {
    this.cancelCurrent()
    this.cache.clear()
    this.isSpeaking = false
  }
}

// In components:
useEffect(() => {
  return () => {
    ttsEngine?.cancelCurrent()
  }
}, [])
```

### 2. Regional Number Mapping (Week 1-2)

**TASK 3: Add Regional Number Words**

Expand NUMBER_WORDS to support all Indian languages:

```tsx
// apps/pandit/src/lib/number-mapper.ts

const NUMBER_WORDS: Record<string, string> = {
  // Hindi (already exists)
  'ek': '1', 'do': '2', 'teen': '3', ...
  
  // Tamil
  'onnu': '1', 'randu': '2', 'moonu': '3', 'naalu': '4', 
  'aindhu': '5', 'aaru': '6', 'yezhu': '7', 'ettu': '8', 
  'ombathu': '9', 'poojyam': '0',
  
  // Telugu
  'okati': '1', 'rendu': '2', 'moodu': '3', 'naalugu': '4',
  'aidu': '5', 'aaru': '6', 'eedu': '7', 'enimidi': '8',
  'tommidi': '9', 'sunna': '0',
  
  // Bengali
  'ek': '1', 'dui': '2', 'tin': '3', 'char': '4',
  'pach': '5', 'chho': '6', 'sat': '7', 'aath': '8',
  'no': '9', 'shunno': '0',
  
  // Add more for Kannada, Malayalam, Marathi, Gujarati, etc.
}
```

**TASK 4: Test Number Recognition**

Create test cases for:
- "नौ आठ सात शून्य" → 9870
- "ஒன்று இரண்டு மூன்று" → 123
- "ఒకటి రెండు మూడు" → 123
- "এক দুই তিন" → 123

### 3. Voice Intent Detection (Week 2)

**TASK 5: Improve Intent Recognition**

Current Issue: Limited intent vocabulary

Your Enhancement:
```tsx
// apps/pandit/src/lib/voice-engine.ts

const INTENT_WORD_MAP: Record<VoiceIntent, string[]> = {
  YES: [
    // Hindi
    'haan', 'ha', 'haanji', 'theek', 'sahi', 'bilkul',
    // Bhojpuri
    'haan', 'hau', 'ho',
    // Maithili
    'hain', 'thik',
    // English (code-mixing)
    'yes', 'okay', 'ok', 'correct',
    // Add more for each supported language
  ],
  NO: [
    // Hindi
    'nahi', 'naa', 'na', 'mat',
    // Add for all languages
  ],
  // ... other intents
}
```

**TASK 6: Add Confidence Scoring**

Implement confidence-based intent detection:
```tsx
interface IntentResult {
  intent: VoiceIntent
  confidence: number  // 0-1
  matchedWords: string[]
}

function detectIntentWithConfidence(transcript: string): IntentResult {
  // Calculate confidence based on:
  // - Number of matched words
  // - Position in transcript (earlier = higher confidence)
  // - Exact match vs partial match
}
```

### 4. Voice UI States (Week 2-3)

**TASK 7: Improve Voice Feedback**

Create better visual feedback for:
- Listening state (animated waveform)
- Processing state (spinner + text)
- Success state (checkmark + confirmation text)
- Error state (clear error message + retry option)

Files to Update:
- apps/pandit/src/components/voice/VoiceIndicator.tsx
- apps/pandit/src/components/voice/ConfirmationSheet.tsx
- apps/pandit/src/components/voice/ErrorOverlay.tsx

**TASK 8: Add Haptic Feedback**

Implement haptic feedback for voice states:
```tsx
// When voice detected
if (navigator.vibrate) {
  navigator.vibrate([50, 100, 50])  // Short vibration pattern
}

// When error
if (navigator.vibrate) {
  navigator.vibrate([200, 100, 200])  // Longer error pattern
}
```

### 5. Voice Testing & Optimization (Week 3)

**TASK 9: Create Voice Test Suite**

Test voice recognition with:
- Different accents (UP/Bihar, Tamil, Telugu, Bengali)
- Different speeds (slow, normal, fast)
- Different volumes (quiet, normal, loud)
- Background noise (temple bells, traffic, silence)
- Code-mixed speech (Hindi + English)

**TASK 10: Optimize Voice Latency**

Target: <500ms from speech end to transcription

Optimization strategies:
- Pre-warm WebSocket connections
- Cache common phrases
- Use streaming STT (not batch)
- Optimize VAD (Voice Activity Detection) settings

## DELIVERABLES

### Week 1
- [ ] WebSocket cleanup implemented
- [ ] TTS queue management fixed
- [ ] All voice components cleanup on unmount
- [ ] Regional number mapping added (Tamil, Telugu, Bengali)

### Week 2
- [ ] Intent detection improved (all languages)
- [ ] Confidence scoring implemented
- [ ] Voice UI states polished
- [ ] Haptic feedback added

### Week 3
- [ ] Voice test suite created
- [ ] Latency optimized (<500ms)
- [ ] All voice bugs fixed
- [ ] Documentation updated

## SUCCESS METRICS
- Voice recognition accuracy ≥90%
- Intent detection accuracy ≥95%
- Voice latency <500ms
- Zero WebSocket memory leaks
- Zero TTS queue issues
- Support for 10+ Indian languages

## TECHNICAL REQUIREMENTS
- 5+ years experience with voice technologies
- Web Speech API expert
- Experience with STT/TTS services (Sarvam, Deepgram, Google)
- TypeScript proficient
- Experience with WebSocket
- Understanding of Indian languages and accents
- Audio processing experience helpful

## WORKING HOURS
- IST (Indian Standard Time)
- Available 10 AM - 7 PM IST
- Daily standup at 10:30 AM IST

## REPORTING TO
- Senior Frontend Lead

## COLLABORATION
- Work with Frontend Developers on voice UI
- Support QA team with voice testing scenarios
- Coordinate with backend on voice API optimization
```

---

## Role 5: QA/Test Engineer

### Prompt for This Role

```markdown
# ROLE: QA/Test Engineer — HmarePanditJi

## CONTEXT
You are ensuring quality for a mobile-first web app for Hindu priests (Pandits) in India. Your users:
- Age: 45-70 years old (elderly)
- Tech literacy: Low
- Devices: Budget Android phones (₹10,000-15,000 range)
- Network: 3G/4G with occasional dropouts
- Environment: Temples, homes, outdoor ceremonies

## YOUR RESPONSIBILITIES

### 1. Test Planning (Week 1)

**TASK 1: Create Test Plan Document**

Create comprehensive test plan covering:
- Functional testing (all user flows)
- Accessibility testing (WCAG 2.1 AA)
- Performance testing (load time, bundle size)
- Compatibility testing (devices, browsers)
- Voice testing (accents, languages, noise)
- Edge case testing (network loss, errors)

**TASK 2: Create Test Cases**

Write detailed test cases for each screen:

Example for Mobile Number Screen:
```
TEST CASE: TC-MOBILE-001
Title: Enter mobile number via voice
Priority: Critical
Precondition: User on mobile number screen, mic permission granted

Steps:
1. Tap microphone button
2. Say "नौ आठ सात शून्य एक दो तीन चार पाँच छह"
3. Verify number "9870123456" appears in input
4. Verify confirmation sheet appears
5. Say "हाँ" (yes)
6. Verify navigation to OTP screen

Expected Result:
- Voice transcription accurate
- Number correctly parsed
- Confirmation shown
- Navigation successful

Actual Result: [To be filled during execution]
Status: Pass/Fail
```

Create 50+ test cases covering all flows.

### 2. Functional Testing (Week 2)

**TASK 3: Test All User Flows**

Test these complete flows:
1. Splash → Identity → Language → Tutorial (all 12 screens) → Registration (mobile, OTP, profile) → Dashboard
2. Voice input on every screen
3. Keyboard fallback on every screen
4. Help button on every screen
5. Back button navigation
6. Error states (network, voice failure, validation)

**TASK 4: Create Bug Reports**

For each bug found, create detailed report:
```
BUG REPORT: BUG-001
Title: Text overflow in identity confirmation button
Severity: High
Priority: P0
Screen: /identity
Device: Samsung Galaxy A12, Android 11
Browser: Chrome 120

Steps to Reproduce:
1. Go to identity screen
2. Observe button text "हाँ, मैं पंडित हूँ — पंजीकरण शुरू करें"

Expected: Text wraps within button
Actual: Text overflows button boundary
Impact: User cannot read full message

Attachment: [screenshot]
```

### 3. Accessibility Testing (Week 2-3)

**TASK 5: WCAG 2.1 AA Compliance Testing**

Test all criteria:
- 1.4.3 Contrast (Minimum): All text ≥4.5:1 contrast
- 1.4.4 Resize Text: Text resizable to 200%
- 1.4.10 Reflow: No horizontal scrolling at 320px
- 2.1.1 Keyboard: All functions keyboard accessible
- 2.4.3 Focus Order: Logical focus order
- 2.4.7 Focus Visible: Visible focus indicators
- 3.3.1 Error Identification: Errors clearly identified
- 3.3.2 Labels or Instructions: All inputs labeled

Tools to Use:
- Lighthouse Accessibility audit
- axe DevTools browser extension
- WAVE accessibility tool
- Manual keyboard navigation

**TASK 6: Screen Reader Testing**

Test with:
- TalkBack (Android)
- VoiceOver (iOS)
- NVDA (Windows desktop)

Verify:
- All buttons announced correctly
- All form fields have labels
- Error messages announced
- Navigation landmarks present

### 4. Device Testing (Week 3)

**TASK 7: Test on Real Devices**

Test on these devices (minimum):
- Samsung Galaxy A12 (Android 11) - Primary target
- Redmi Note 10 (Android 12)
- Realme 8 (Android 11)
- iPhone SE (iOS 15) - Secondary target
- OnePlus Nord N100 (Android 11)

Test scenarios on each device:
- App load time
- Touch target accuracy
- Text readability
- Voice input quality
- Network resilience

**TASK 8: Browser Testing**

Test on:
- Chrome (primary - 80% users)
- Firefox (secondary - 10% users)
- Samsung Internet (5% users)
- UC Browser (5% users)

### 5. Performance Testing (Week 3)

**TASK 9: Performance Benchmarks**

Measure and verify:
- First Contentful Paint (FCP): <1.5s
- Largest Contentful Paint (LCP): <2.5s
- Time to Interactive (TTI): <3.5s
- Cumulative Layout Shift (CLS): <0.1
- Total Bundle Size: <500KB

Tools:
- Lighthouse
- WebPageTest
- Chrome DevTools Performance tab

**TASK 10: Network Throttling Testing**

Test under network conditions:
- 4G (150ms RTT, 10Mbps)
- 3G (300ms RTT, 1.6Mbps)
- 2G (1000ms RTT, 50Kbps)
- Offline

Verify:
- Graceful degradation
- Offline error messages
- Retry mechanisms
- State persistence

### 6. Voice Testing (Week 3-4)

**TASK 11: Voice Recognition Testing**

Test voice recognition with:
- 10 different speakers (different accents)
- 5 languages (Hindi, Tamil, Telugu, Bengali, English)
- 3 speeds (slow, normal, fast)
- 3 volumes (quiet, normal, loud)
- 3 environments (quiet, moderate noise, loud)

Track accuracy:
```
Language | Speaker | Speed | Volume | Environment | Accuracy
Hindi    | M, 55   | Normal| Normal | Quiet       | 95%
Bhojpuri | M, 61   | Slow  | Loud   | Temple      | 87%
...
```

**TASK 12: Voice Intent Testing**

Test intent detection:
- Yes/No responses (20 variations each)
- Navigation commands (forward, back, skip)
- Number dictation (50 test cases)
- Error recovery (3 failures → keyboard)

### 7. Bug Triage & Reporting (Ongoing)

**TASK 13: Daily Bug Reports**

Every day, provide:
- Bugs found today (with severity)
- Bugs fixed today (verified)
- Bugs pending (by priority)
- Blockers (if any)

**TASK 14: Bug Severity Classification**

Classify bugs as:
- **Critical (P0):** App crash, data loss, registration blocked
- **High (P1):** Major feature broken, accessibility issue
- **Medium (P2):** UI bug, minor feature issue
- **Low (P3):** Cosmetic, nice-to-have

## DELIVERABLES

### Week 1
- [ ] Test plan document created
- [ ] 50+ test cases written
- [ ] Test environment set up
- [ ] Bug tracking system configured

### Week 2
- [ ] All functional tests executed
- [ ] Accessibility audit complete
- [ ] 20+ bugs reported (expected)
- [ ] Screen reader testing complete

### Week 3
- [ ] Device testing complete (5 devices)
- [ ] Browser testing complete (4 browsers)
- [ ] Performance benchmarks measured
- [ ] Voice testing started

### Week 4
- [ ] Voice testing complete
- [ ] All P0/P1 bugs verified fixed
- [ ] Regression testing complete
- [ ] QA sign-off report

## SUCCESS METRICS
- Test coverage ≥95% of user flows
- Accessibility score ≥95 (Lighthouse)
- Zero P0 bugs in production
- <5 P1 bugs in production
- Voice accuracy ≥90%
- App load time <3s on 3G

## TECHNICAL REQUIREMENTS
- 4+ years QA/testing experience
- Mobile testing experience
- Accessibility testing experience
- Voice/UI testing experience helpful
- Test automation experience (Playwright, Cypress)
- Bug tracking tools (Jira, Linear, GitHub Issues)
- Hindi language helpful (for content testing)

## WORKING HOURS
- IST (Indian Standard Time)
- Available 10 AM - 7 PM IST
- Daily standup at 10:30 AM IST

## REPORTING TO
- Senior Frontend Lead

## COLLABORATION
- Work with all developers on bug fixes
- Provide daily bug reports to stakeholder
- Coordinate with Voice Engineer on voice testing
- Support launch with production testing
```

---

## Role 6: DevOps Engineer (Part-Time)

### Prompt for This Role

```markdown
# ROLE: DevOps Engineer (Part-Time) — HmarePanditJi

## CONTEXT
You are setting up infrastructure for a mobile-first web app for Hindu priests (Pandits) in India. Requirements:
- High availability (99.9% uptime)
- Low latency (India region)
- Cost-effective (startup budget)
- Scalable (10 → 10,000 → 100,000 users)
- Secure (user data protection)

## YOUR RESPONSIBILITIES

### 1. Deployment Setup (Week 1)

**TASK 1: Vercel Configuration**

Set up Vercel deployment:
- Create Vercel project for apps/pandit
- Configure preview deployments for PRs
- Set up production deployment (main branch)
- Configure environment variables
- Set up custom domain (hmarepanditji.com)

**TASK 2: CI/CD Pipeline**

Configure GitHub Actions:
```yaml
# .github/workflows/deploy-pandit.yml
name: Deploy Pandit App

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: pnpm install
      - run: pnpm test
      - run: pnpm lint
      - run: pnpm build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

### 2. Monitoring & Alerting (Week 2)

**TASK 3: Error Tracking (Sentry)**

Set up Sentry:
- Install @sentry/nextjs
- Configure DSN
- Set up error reporting
- Configure release tracking
- Set up alerting (Slack/Email)

**TASK 4: Performance Monitoring**

Set up monitoring:
- Vercel Analytics (built-in)
- Google Analytics 4 (user behavior)
- Lighthouse CI (performance regression)
- Uptime monitoring (UptimeRobot)

**TASK 5: Alerting Configuration**

Configure alerts for:
- Site down (UptimeRobot → Slack)
- Error rate >1% (Sentry → Slack)
- LCP >4s (Vercel Analytics → Email)
- Deployment failed (GitHub → Slack)

### 3. Database & Backend (Week 2-3)

**TASK 6: Database Setup (if needed)**

If using PostgreSQL:
- Set up Supabase or Neon (serverless Postgres)
- Configure connection pooling
- Set up migrations (Prisma)
- Configure backups

**TASK 7: API Deployment**

If using services/api/:
- Deploy to Render/Railway (Node.js)
- Configure environment variables
- Set up auto-deploy from main
- Configure health checks

### 4. Security (Week 3)

**TASK 8: Security Hardening**

Implement:
- HTTPS (automatic with Vercel)
- Security headers (CSP, HSTS, etc.)
- Rate limiting (Vercel middleware)
- Input validation (Zod schemas)
- Secrets management (Vercel env vars)

**TASK 9: Compliance**

Ensure:
- GDPR compliance (user data)
- India DPDP Act compliance
- Cookie consent (if using cookies)
- Privacy policy page

### 5. Documentation & Handoff (Week 4)

**TASK 10: Create Runbook**

Document:
- Deployment process
- Rollback process
- Monitoring dashboard
- Alert response procedures
- Contact information

**TASK 11: Knowledge Transfer**

Train team on:
- How to deploy
- How to check logs
- How to respond to alerts
- How to rollback

## DELIVERABLES

### Week 1
- [ ] Vercel deployment working
- [ ] CI/CD pipeline configured
- [ ] Preview deployments working
- [ ] Custom domain configured

### Week 2
- [ ] Sentry error tracking live
- [ ] Performance monitoring configured
- [ ] Alerting set up (Slack/Email)
- [ ] Database/API deployed (if needed)

### Week 3
- [ ] Security hardening complete
- [ ] Compliance checklist done
- [ ] Load testing complete
- [ ] Backup/recovery tested

### Week 4
- [ ] Runbook created
- [ ] Team trained
- [ ] Production handoff complete
- [ ] Documentation finalized

## SUCCESS METRICS
- 99.9% uptime
- Deployment time <5 minutes
- Rollback time <2 minutes
- Zero security incidents
- All alerts working
- Team can deploy independently

## TECHNICAL REQUIREMENTS
- 5+ years DevOps experience
- Vercel expert
- GitHub Actions expert
- Experience with monitoring tools
- Security best practices knowledge
- India region experience helpful

## WORKING HOURS
- Flexible (part-time, ~20 hours/week)
- Available for deployment windows
- On-call for production issues

## REPORTING TO
- Senior Frontend Lead

## COLLABORATION
- Work with all developers on deployment issues
- Support QA team with staging environments
- Train team on DevOps practices
```

---

## Hiring Guide

### Where to Find Each Role

**Senior Frontend Lead:**
- LinkedIn (search: "Senior Frontend Engineer" + "Next.js")
- AngelList (startup-focused)
- Referrals from tech network
- Expected salary: ₹25-40 lakhs/year

**Frontend Developers:**
- LinkedIn
- Indeed
- Naukri.com
- Expected salary: ₹12-20 lakhs/year each

**Voice/AI Engineer:**
- LinkedIn (search: "Voice Engineer" + "Speech Recognition")
- AI/ML communities (Kaggle, GitHub)
- Expected salary: ₹20-35 lakhs/year

**QA/Test Engineer:**
- LinkedIn
- Indeed
- QA communities (Ministry of Testing)
- Expected salary: ₹10-18 lakhs/year

**DevOps Engineer:**
- LinkedIn
- DevOps communities
- Contract/freelance (Upwork, Toptal)
- Expected salary: ₹15-25 lakhs/year (or ₹3-5 lakhs for part-time contract)

---

## Interview Questions by Role

### Senior Frontend Lead
1. "How would you structure a Next.js app for 3 user types (pandit, customer, admin)?"
2. "Explain how you'd handle text overflow in buttons for Hindi text"
3. "What's your approach to accessibility for elderly users?"
4. "How do you manage state in a large React app?"

### Frontend Developer
1. "Fix this button with overflowing text" (practical test)
2. "How do you ensure touch targets are accessible?"
3. "Explain focus management in React"
4. "How do you test your components?"

### Voice/AI Engineer
1. "How would you handle WebSocket cleanup in React?"
2. "Explain VAD (Voice Activity Detection)"
3. "How do you optimize STT latency?"
4. "Test this number recognition with Hindi accents"

### QA/Test Engineer
1. "Write test cases for mobile number screen"
2. "How do you test accessibility?"
3. "What's your bug severity classification?"
4. "How do you test voice features?"

### DevOps Engineer
1. "Set up a Vercel deployment for Next.js"
2. "How do you configure error tracking?"
3. "Explain your monitoring strategy"
4. "How do you handle database migrations?"

---

## Onboarding Plan (Week 0)

### Day 1-2: Setup
- GitHub access
- Vercel access
- Development environment setup
- Run app locally

### Day 3-4: Orientation
- Read prompt documents
- Understand user persona (Pandit Ji)
- Review audit report
- Meet team

### Day 5: First Tasks
- Pick up first assigned tasks
- Start implementation
- Daily standup participation

---

## Team Communication

### Daily Standup (10:30 AM IST, 15 minutes)
Each person shares:
1. What I did yesterday
2. What I'll do today
3. Any blockers

### Weekly Sprint Planning (Monday 11 AM, 1 hour)
- Review last week's progress
- Plan this week's tasks
- Assign tasks to team members

### Weekly Retrospective (Friday 5 PM, 30 minutes)
- What went well
- What could be improved
- Action items for next week

---

## Tools Stack

| Purpose | Tool | Cost |
|---------|------|------|
| Code Hosting | GitHub | Free (startup) |
| Deployment | Vercel | Free → ₹2000/month |
| Project Management | Linear | Free (startup) |
| Communication | Slack | Free |
| Design | Figma | Free (startup) |
| Error Tracking | Sentry | Free (startup) |
| Analytics | Vercel Analytics | Free |
| Testing | Playwright | Free |
| Documentation | Notion | Free (startup) |

**Total Monthly Cost:** ~₹5,000-10,000 (after free tiers)

---

## Budget Breakdown

### Salaries (6 weeks)
| Role | Count | Weekly Rate | 6 Weeks |
|------|-------|-------------|---------|
| Senior Frontend Lead | 1 | ₹50,000 | ₹3,00,000 |
| Frontend Developer 1 | 1 | ₹30,000 | ₹1,80,000 |
| Frontend Developer 2 | 1 | ₹30,000 | ₹1,80,000 |
| Voice/AI Engineer | 1 | ₹40,000 | ₹2,40,000 |
| QA/Test Engineer | 1 | ₹25,000 | ₹1,50,000 |
| DevOps Engineer | 1 | ₹20,000 (part-time) | ₹1,20,000 |
| **Total Salaries** | | | **₹11,70,000** |

### Infrastructure (6 weeks)
| Item | Cost |
|------|------|
| Vercel Pro | ₹12,000 |
| Sentry Team | ₹6,000 |
| Domain & SSL | ₹2,000 |
| Testing Devices | ₹50,000 (one-time) |
| **Total Infrastructure** | **₹70,000** |

### **Grand Total: ₹12,40,000 (~$15,000 USD)**

---

## Risk Mitigation

### Risk 1: Team Member Leaves Mid-Project
**Mitigation:**
- Document everything
- Pair programming
- Cross-training
- Backup candidates identified

### Risk 2: Scope Creep
**Mitigation:**
- Strict sprint planning
- No new features during critical fix phase
- Stakeholder alignment on priorities

### Risk 3: Voice Accuracy Below Target
**Mitigation:**
- Early voice testing
- Fallback to keyboard always available
- Multiple STT providers (Sarvam + Deepgram)

### Risk 4: Accessibility Not Met
**Mitigation:**
- Weekly accessibility audits
- External accessibility consultant review
- User testing with elderly participants

---

## Success Criteria for Team

### Week 2 Checkpoint
- [ ] All critical UI fixes complete
- [ ] Codebase duplicates removed
- [ ] Error boundaries implemented
- [ ] Help button prominent

### Week 4 Checkpoint
- [ ] All accessibility fixes complete
- [ ] Voice system stable
- [ ] QA testing 80% complete
- [ ] Performance targets met

### Week 6 Checkpoint (Launch Ready)
- [ ] Zero P0 bugs
- [ ] <5 P1 bugs
- [ ] Accessibility score ≥95
- [ ] Voice accuracy ≥90%
- [ ] Load time <3s on 3G
- [ ] Team can deploy independently

---

**End of Team Setup Document**

*Ready to hire and execute. All prompts are copy-paste ready for job postings and onboarding.*
