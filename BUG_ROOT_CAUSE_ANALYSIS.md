# 🔍 BUG ROOT CAUSE ANALYSIS
## QA Test Results: Deep Dive & Fix Plan

**Date:** March 22, 2026  
**Analyzed By:** Senior Full-Stack Developer  
**Based On:** QA_TEST_RESULTS.md findings

---

## 📊 EXECUTIVE SUMMARY

**Total Bugs Found:** 5 (1 CRITICAL, 2 MAJOR, 2 MINOR)  
**Root Cause Pattern:** State management fragmentation + Voice flow logic issues  
**Estimated Fix Time:** 2-3 hours  
**Risk Level:** HIGH - Data loss bug blocks all users who make mistakes

---

## 🔴 BUG-001: Mobile Number Wiped on Back Navigation

### Severity: CRITICAL
**Impact:** 100% data loss on back navigation from OTP screen

### Root Cause Analysis:

The issue lies in **`RegistrationFlow.tsx`** component state management:

```tsx
// RegistrationFlow.tsx - Line ~370
if (step === 'mobile') {
  return (
    <MobileNumberScreen
      language={language}
      onComplete={(mobile: string) => {
        setData(prev => ({ ...prev, mobile }));
        setStep('otp');
      }}
      onBack={() => goBackToTutorial()}
    />
  );
}

if (step === 'otp') {
  return (
    <OTPScreen
      mobile={data.mobile}  // ← Passes mobile DOWN
      language={language}
      onVerified={() => setStep('profile_name')}
      onBack={() => setStep('mobile')}  // ← Goes back to mobile screen
    />
  );
}
```

**The Problem:**
1. When user enters mobile number → `setData()` stores it in React state
2. Navigation to OTP → State persists (good)
3. User clicks BACK → `setStep('mobile')` re-renders MobileNumberScreen
4. **BUT:** `MobileNumberScreen` is a **functional component that re-initializes** on every render
5. The `mobile` state inside `MobileNumberScreen.tsx` is **local state**:
   ```tsx
   // MobileNumberScreen.tsx - Line 58
   const [mobile, setMobile] = useState('');  // ← RESETS to empty string!
   ```
6. No prop is passed from parent to restore the previously entered mobile

**Why Zustand Store Doesn't Help:**
- `registrationStore.ts` exists with `setMobile()` and persistence
- **BUT** `MobileNumberScreen` doesn't use it
- State is purely local React state

### Fix Strategy:

**Option A (Recommended):** Use Zustand store for mobile number persistence
```tsx
// MobileNumberScreen.tsx
import { useRegistrationStore } from '@/stores/registrationStore';

export default function MobileNumberScreen({ language, onComplete, onBack }: Props) {
  const { mobile, setMobile } = useRegistrationStore(state => state.data);
  const updateMobile = useRegistrationStore(state => state.setMobile);
  
  // Initialize from store on mount
  useEffect(() => {
    // Mobile already loaded from store via hook
  }, []);
  
  const handleSubmit = (num: string) => {
    updateMobile(num); // Persist to store
    // ... rest of logic
  };
}
```

**Option B:** Pass mobile as prop from RegistrationFlow parent
```tsx
// RegistrationFlow.tsx
if (step === 'mobile') {
  return (
    <MobileNumberScreen
      language={language}
      initialMobile={data.mobile}  // ← Pass from parent state
      onComplete={(mobile: string) => {
        setData(prev => ({ ...prev, mobile }));
        setStep('otp');
      }}
      onBack={goBackToTutorial}
    />
  );
}

// MobileNumberScreen.tsx
interface Props {
  initialMobile?: string;  // ← New prop
}

export default function MobileNumberScreen({ initialMobile = '', ... }: Props) {
  const [mobile, setMobile] = useState(initialMobile);  // ← Initialize from prop
}
```

**Recommended:** Option A (Zustand) - Consistent with app architecture, auto-persists to localStorage

---

## 🟠 BUG-002: Voice Overlays Block Keyboard Fallback

### Severity: MAJOR
**Impact:** Elderly users can't switch to keyboard when voice fails

### Root Cause Analysis:

Looking at **`ErrorOverlay.tsx`** structure:

```tsx
// ErrorOverlay.tsx - Line 78
return (
  <AnimatePresence>
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-safe"
    >
      {/* Error Card */}
      <motion.div className="...">
        {/* Action buttons */}
        <div className="flex gap-3">
          {error.showRetry && (
            <motion.button onClick={onRetry}>...</motion.button>
          )}
          <motion.button onClick={onUseKeyboard}>...</motion.button>
        </div>
      </motion.div>
    </motion.div>
  </AnimatePresence>
)
```

**The Problem:**
1. Error overlay uses `z-50` (very high z-index)
2. Overlay covers full bottom of screen
3. Keyboard toggle button (if present in parent) is **behind** the overlay
4. Overlay's `pointer-events-none` is NOT set, so it blocks all clicks to elements behind it

**Additional Issue from QA:**
- Voice failure cascade takes **over 3 minutes** instead of 36 seconds
- Looking at `useSarvamVoiceFlow.ts`:
  ```tsx
  // Line 98-113: Timeout handling
  () => {
    incrementError();  // ← Increments error count
    setVoiceState('error_1');
    
    if (repromptCountRef.current < 1 && repromptScript) {
      repromptCountRef.current += 1;
      // Reprompts and restarts listening
      // This adds ANOTHER 12+ seconds
    }
  }
  ```
- Each timeout = 12 seconds
- With reprompt = 12s + 12s = 24s per error state
- V-05 (error_1) → 12-24s
- V-06 (error_2) → 24-48s  
- V-07 (error_3) → 36-72s+
- **Total: 72-144 seconds (1.2-2.4 minutes) minimum**, not counting speech time

### Fix Strategy:

**Fix 1: Reduce timeout durations for faster keyboard fallback**
```tsx
// useSarvamVoiceFlow.ts
const DEFAULT_TIMEOUT_MS = 8000;  // Reduced from 12000
const ELDERLY_TIMEOUT_MS = 10000; // Reduced from 12000

// Only one reprompt before keyboard
if (repromptCountRef.current < 1 && repromptScript) {
  // ... reprompt logic
}
```

**Fix 2: Add pointer-events-none to overlay when keyboard should be clickable**
```tsx
// ErrorOverlay.tsx
<motion.div
  className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-safe"
  style={{ pointerEvents: isError3 ? 'none' : 'auto' }}  // ← Let clicks through on V-07
>
  <motion.div style={{ pointerEvents: 'auto' }}>  // ← Card still clickable
    {/* Error card content */}
  </motion.div>
</motion.div>
```

**Fix 3: Ensure keyboard toggle is ABOVE overlay**
```tsx
// MobileNumberScreen.tsx - Move KeyboardToggle to higher z-index
<div className="relative z-[60]">  {/* Above overlay's z-50 */}
  <KeyboardToggle onClick={...} />
</div>
```

---

## 🟠 BUG-003: Voice Confirmation During Keyboard Entry

### Severity: MAJOR
**Impact:** Confusing UX for users who intentionally chose keyboard

### Root Cause Analysis:

**`MobileNumberScreen.tsx`** voice flow logic:

```tsx
// MobileNumberScreen.tsx - Line 62
const { isListening, isSpeaking, transcript, restartListening } = useSarvamVoiceFlow({
  language,
  script: MIC_CLOSE_SCRIPT,
  // ...
  onIntent: (intentOrRaw) => {
    if (intentOrRaw.startsWith('RAW:')) {
      const raw = intentOrRaw.slice(4);
      const digits = normalizeMobile(raw);
      if (digits.length === 10) {
        setMobile(digits);
        setConfirming(true);
        void speakWithSarvam({
          text: `${digits.split('').join('... ')} — क्या यह नंबर सही है?`,
          languageCode: 'hi-IN',
        });
      }
    }
  },
});

// Line 117: Keypad input handler
const handleKeypadInput = (val: string) => {
  if (mobile.length >= 10) return;
  setMobile(prev => prev + val);
  setError('');
};
```

**The Problem:**
1. User clicks "Keyboard" toggle → Should disable voice confirmation
2. User types 10 digits via keypad
3. **BUT:** `useSarvamVoiceFlow` is STILL LISTENING in background
4. If user speaks while typing (e.g., saying digits aloud), voice triggers confirmation overlay
5. Even if user stays silent, the confirmation logic doesn't distinguish between voice vs keyboard input

**Missing Logic:**
- No `isKeyboardMode` state check before showing confirmation
- `useSarvamVoiceFlow` doesn't have a `disabled` option being used
- Voice confirmation should be skipped for keyboard input

### Fix Strategy:

**Add keyboard mode state and disable voice confirmation:**

```tsx
// MobileNumberScreen.tsx
export default function MobileNumberScreen({ language, onComplete, onBack }: Props) {
  const [mobile, setMobile] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [isKeyboardMode, setIsKeyboardMode] = useState(false);  // ← NEW
  
  const { isListening, isSpeaking, transcript, restartListening, stopFlow } = useSarvamVoiceFlow({
    language,
    script: MIC_CLOSE_SCRIPT,
    disabled: isKeyboardMode,  // ← Disable voice when keyboard active
    onIntent: (intentOrRaw) => {
      // Only show voice confirmation if NOT in keyboard mode
      if (isKeyboardMode) return;  // ← Skip voice confirmation
      
      // ... existing logic
    },
  });

  const handleKeyboardToggle = () => {
    setIsKeyboardMode(prev => !prev);
    if (!isKeyboardMode) {
      stopFlow();  // Stop current voice flow
    } else {
      restartListening();  // Resume voice
    }
  };

  const handleKeypadComplete = () => {
    if (mobile.length === 10) {
      // Direct submit for keyboard input - NO voice confirmation
      handleSubmit(mobile);
    }
  };
}
```

---

## 🟡 BUG-004: Transient "1 Error" Red Toast

### Severity: MINOR
**Impact:** Confusing background error messages

### Root Cause Analysis:

This is likely from **unhandled Promise rejections** in the voice flow:

```tsx
// MobileNumberScreen.tsx - Line 99
const handleSubmit = (num: string) => {
  const clean = num.replace(/\D/g, '');
  if (clean.length !== 10) {
    setError('10 अंकों का नंबर चाहिए');
    return;
  }
  stopCurrentSpeech();
  void speakWithSarvam({  // ← Fire-and-forget async
    text: 'धन्यवाद। अब OTP भेज रहे हैं।',
    languageCode: 'hi-IN',
    onEnd: () => onComplete(clean),
  });
};
```

**The Problem:**
1. `speakWithSarvam()` returns a Promise
2. If TTS fails (network, API error), Promise rejects
3. No `.catch()` handler → Unhandled rejection
4. React shows generic error toast

### Fix Strategy:

**Add error handling to all async voice calls:**

```tsx
// MobileNumberScreen.tsx
const handleSubmit = (num: string) => {
  const clean = num.replace(/\D/g, '');
  if (clean.length !== 10) {
    setError('10 अंकों का नंबर चाहिए');
    return;
  }
  stopCurrentSpeech();
  speakWithSarvam({
    text: 'धन्यवाद। अब OTP भेज रहे हैं।',
    languageCode: 'hi-IN',
    onEnd: () => onComplete(clean),
  }).catch((err) => {
    console.error('TTS failed:', err);
    // Still navigate even if TTS fails
    onComplete(clean);
  });
};
```

---

## 🟡 BUG-005: Voice Bar Clips Viewport

### Severity: MINOR
**Impact:** Visual overlap with input field

### Root Cause Analysis:

**Layout structure issue:**

```tsx
// MobileNumberScreen.tsx - Line 144
{/* Voice listening indicator */}
<AnimatePresence>
  <motion.div
    className="w-full mb-4 flex items-center justify-between gap-3 px-4 py-2 bg-primary-lt rounded-xl border border-primary/20"
  >
    {/* Voice bars and text */}
  </motion.div>
</AnimatePresence>

{/* Number Display */}
<div className="w-full text-center py-5 rounded-2xl border-2 mb-4">
  {/* Number display */}
</div>

{/* Text input */}
<input
  className="w-full px-4 py-3 border-2 border-vedic-border rounded-xl ... mb-4"
/>
```

**The Problem:**
1. Voice indicator is absolutely positioned or fixed in some states
2. When keyboard appears (mobile), viewport height changes
3. Voice indicator doesn't adjust → Overlaps input
4. Screen doesn't scroll to keep input visible

### Fix Strategy:

**Ensure proper spacing and scroll behavior:**

```tsx
// MobileNumberScreen.tsx
<main className="min-h-dvh max-w-[390px] mx-auto ... flex flex-col relative overflow-hidden">
  {/* Header - shrink-0 to prevent compression */}
  <header className="pt-8 px-6 pb-2 flex items-center gap-3 shrink-0">
    {/* ... */}
  </header>

  {/* Content - flex-grow with overflow-auto */}
  <div className="flex-grow flex flex-col items-center px-6 pt-2 overflow-y-auto">
    {/* Voice indicator - only show when relevant */}
    <AnimatePresence>
      {(isListening || isSpeaking) && !isKeyboardMode && (
        <motion.div className="w-full mb-4">
          {/* Voice indicator */}
        </motion.div>
      )}
    </AnimatePresence>

    {/* Rest of content */}
  </div>

  {/* Footer - shrink-0 to stay at bottom */}
  <footer className="px-6 pb-10 pt-3 bg-vedic-cream/90 backdrop-blur-sm shrink-0">
    {/* ... */}
  </footer>
</main>
```

---

## 📋 FIX IMPLEMENTATION PRIORITY

### Phase 1: Critical Bug (BUG-001) - 30 minutes
1. Add Zustand store usage to MobileNumberScreen
2. Persist mobile number to store on entry
3. Restore from store on component re-mount
4. Test: Enter number → Navigate to OTP → Back → Number persists

### Phase 2: Major Bugs (BUG-002, BUG-003) - 1 hour
1. Reduce voice timeout durations in useSarvamVoiceFlow
2. Add keyboard mode state to MobileNumberScreen
3. Disable voice confirmation when keyboard active
4. Fix overlay z-index and pointer-events
5. Test: Voice failure → Keyboard becomes clickable quickly

### Phase 3: Minor Bugs (BUG-004, BUG-005) - 30 minutes
1. Add .catch() handlers to all speakWithSarvam calls
2. Fix viewport clipping with proper flexbox layout
3. Test: All error states handled gracefully

### Phase 4: Verification - 30 minutes
1. Re-run all QA tests from Sessions 1-2
2. Verify all 5 bugs are fixed
3. Test edge cases (rapid navigation, network loss during voice)

---

## 🎯 SUCCESS CRITERIA

**After fixes:**
- ✅ Mobile number persists through back/forward navigation
- ✅ Voice failure cascade completes in ≤40 seconds
- ✅ Keyboard toggle immediately accessible when voice fails
- ✅ No voice confirmation overlay when using keyboard
- ✅ No unhandled error toasts
- ✅ No visual overlap on any screen state

**QA Sign-off Required:** Re-run BUG-001 through BUG-005 tests and confirm all PASS

---

## 📝 ADDITIONAL RECOMMENDATIONS

### Long-term Improvements:

1. **Unified State Management:**
   - Migrate ALL registration state to Zustand store
   - Remove local React state from all screens
   - Single source of truth for mobile, OTP, name, city

2. **Voice Flow Architecture:**
   - Create a central VoiceOrchestrator component
   - Manage voice/keyboard mode globally per screen
   - Prevent overlapping voice + keyboard flows

3. **Error Boundary:**
   - Add React Error Boundary around voice components
   - Graceful fallback when voice engine fails
   - User-friendly error messages

4. **Performance:**
   - Pre-cache voice scripts for common flows
   - Reduce TTS latency with streaming
   - Optimize STT timeout for Indian accents

---

**Ready to implement fixes. Awaiting approval to proceed.**
