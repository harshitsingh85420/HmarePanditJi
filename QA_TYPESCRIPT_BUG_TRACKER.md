# 🐛 TypeScript Error Bug Tracker - HmarePanditJi

**Created:** March 27, 2026  
**QA Engineer:** [Name]  
**Timeline:** 5 Days (March 27-31, 2026)  
**Goal:** Zero TypeScript errors in production  

---

## 📊 Bug Tracking Board

### GitHub Issues Setup

**Step 1: Create Labels in GitHub**

Go to: `https://github.com/ss7706/HmarePanditJi/labels`

Create these labels:
| Label | Color | Description |
|-------|-------|-------------|
| `bug:typescript` | `#d73a4a` | TypeScript compilation errors |
| `severity:p0` | `#b60205` | Blocks production deployment |
| `severity:p1` | `#d93f0b` | High priority |
| `severity:p2` | `#fbca04` | Medium priority |
| `status:verified` | `#0e8a16` | QA verified fix |

**Step 2: Create GitHub Issue for Each File with Errors**

Use the template below for each file that has TypeScript errors.

---

## 📝 Bug Report Template

Copy this template for each GitHub Issue:

```markdown
## 🐛 TypeScript Error: [File Name]

**Bug ID:** TS-001
**Severity:** P0 (Blocks Production)
**Priority:** P0
**Labels:** bug:typescript, severity:p0

---

### File Information

**File Path:** `apps/pandit/src/path/to/file.tsx`
**Error Count:** X errors
**Category:** [Layout | Page | Component | Hook | Store | Lib | Utility]

---

### Errors Found

```typescript
// Error 1
Line XX: Expression expected

// Error 2  
Line YY: Property assignment expected

// Error 3
Line ZZ: Type 'X' is not assignable to type 'Y'
```

---

### Steps to Reproduce

1. Run `npx tsc --noEmit` in `apps/pandit` directory
2. Observe errors in console output
3. Navigate to specified file and line numbers

---

### Expected Behavior

File should compile without TypeScript errors

---

### Actual Behavior

X TypeScript errors prevent compilation

---

### Fix Applied

[Developer to fill]
- What was changed
- Why the error occurred
- How it was fixed

---

### Verification Checklist

**QA to complete after developer marks as fixed:**

- [ ] TypeScript compiles (`npx tsc --noEmit`)
- [ ] ESLint passes (`pnpm lint`)
- [ ] Build succeeds (`pnpm build`)
- [ ] Component renders correctly (no console errors)
- [ ] No regressions in functionality
- [ ] Related tests pass

**Verified By:** @qa-engineer  
**Date Verified:** YYYY-MM-DD  

---

### Status

- [ ] **Open** - Error identified, awaiting fix
- [ ] **In Progress** - Developer working on fix
- [ ] **Fixed** - Fix submitted, awaiting QA verification
- [ ] **Verified** ✅ - QA has verified the fix

---

### Assignment

**Assigned To:** @developer  
**Reported By:** @qa-engineer  
**Date Reported:** YYYY-MM-DD  
**Date Fixed:** YYYY-MM-DD  
**Date Verified:** YYYY-MM-DD  

---

### Related Issues

- Blocks: #[issue-number]
- Related to: #[issue-number]
```

---

## 📁 File Categories & Test Cases

### Category 1: Layout Files

**Files to Check:**
- `apps/pandit/src/app/layout.tsx`
- `apps/pandit/src/app/(auth)/layout.tsx`
- `apps/pandit/src/app/(registration)/layout.tsx`
- `apps/pandit/src/app/(dashboard)/layout.tsx`
- `apps/pandit/src/app/onboarding/layout.tsx`

**Test Case:**
```
TC-LAYOUT-001: Layout TypeScript Compilation
Priority: P0

Steps:
1. Navigate to apps/pandit directory
2. Run: npx tsc --noEmit --project tsconfig.json
3. Check for errors in layout files
4. Verify no implicit 'any' types
5. Verify all imports resolve correctly

Expected: Zero TypeScript errors in all layout files
Actual: [Fill during testing]
Status: Pass/Fail
```

---

### Category 2: Page Components

**Files to Check:**
- `apps/pandit/src/app/page.tsx`
- `apps/pandit/src/app/(auth)/identity/page.tsx`
- `apps/pandit/src/app/(auth)/language-list/page.tsx`
- `apps/pandit/src/app/(auth)/language-confirm/page.tsx`
- `apps/pandit/src/app/(registration)/mobile/page.tsx`
- `apps/pandit/src/app/(registration)/otp/page.tsx`
- `apps/pandit/src/app/(registration)/profile/page.tsx`
- `apps/pandit/src/app/onboarding/page.tsx`
- `apps/pandit/src/app/onboarding/screens/*.tsx`

**Test Case:**
```
TC-PAGE-001: Page Component TypeScript Compilation
Priority: P0

Steps:
1. Run TypeScript check on page components
2. Verify all React components have proper types
3. Check all props are typed correctly
4. Verify no missing imports
5. Ensure all hooks are typed

Expected: Zero TypeScript errors in all page components
Actual: [Fill during testing]
Status: Pass/Fail
```

---

### Category 3: UI Components

**Files to Check:**
- `apps/pandit/src/components/ui/Button.tsx`
- `apps/pandit/src/components/ui/Input.tsx`
- `apps/pandit/src/components/ui/Card.tsx`
- `apps/pandit/src/components/ui/Skeleton.tsx`
- `apps/pandit/src/components/ui/SkipButton.tsx`
- `apps/pandit/src/components/ui/ProgressDots.tsx`
- `apps/pandit/src/components/TopBar.tsx`
- `apps/pandit/src/components/CTAButton.tsx`
- `apps/pandit/src/components/HelpButton.tsx`
- `apps/pandit/src/components/LanguageBottomSheet.tsx`

**Test Case:**
```
TC-UI-001: UI Component TypeScript Compilation
Priority: P0

Steps:
1. Run TypeScript check on UI components
2. Verify all component props have interfaces/types
3. Check event handlers are typed
4. Verify children props are typed
5. Ensure no implicit any types

Expected: Zero TypeScript errors in all UI components
Actual: [Fill during testing]
Status: Pass/Fail
```

---

### Category 4: Voice Components

**Files to Check:**
- `apps/pandit/src/components/voice/VoiceOverlay.tsx`
- `apps/pandit/src/components/voice/VoiceIndicator.tsx`
- `apps/pandit/src/components/voice/ErrorOverlay.tsx`
- `apps/pandit/src/components/voice/ConfirmationSheet.tsx`
- `apps/pandit/src/components/voice/WaveformBar.tsx`

**Test Case:**
```
TC-VOICE-001: Voice Component TypeScript Compilation
Priority: P0

Steps:
1. Run TypeScript check on voice components
2. Verify audio/Web Audio API types are correct
3. Check microphone permission types
4. Verify event types for voice events
5. Ensure no type errors in audio handling

Expected: Zero TypeScript errors in voice components
Actual: [Fill during testing]
Status: Pass/Fail
```

---

### Category 5: Stores (Zustand)

**Files to Check:**
- `apps/pandit/src/stores/navigationStore.ts`
- `apps/pandit/src/stores/languageStore.ts`
- `apps/pandit/src/stores/registrationStore.ts`
- `apps/pandit/src/stores/onboardingStore.ts`
- `apps/pandit/src/stores/voiceStore.ts`

**Test Case:**
```
TC-STORE-001: Store TypeScript Compilation
Priority: P0

Steps:
1. Run TypeScript check on store files
2. Verify store state interfaces
3. Check action types are correct
4. Verify selector types
5. Ensure no type errors in store methods

Expected: Zero TypeScript errors in all stores
Actual: [Fill during testing]
Status: Pass/Fail
```

---

### Category 6: Hooks

**Files to Check:**
- `apps/pandit/src/hooks/useBackButton.ts`
- `apps/pandit/src/hooks/useAnalytics.ts`
- `apps/pandit/src/lib/hooks/useSarvamVoiceFlow.ts`

**Test Case:**
```
TC-HOOK-001: Custom Hook TypeScript Compilation
Priority: P0

Steps:
1. Run TypeScript check on hook files
2. Verify hook return types
3. Check parameter types
4. Verify dependency array types
5. Ensure no type errors in hook logic

Expected: Zero TypeScript errors in all hooks
Actual: [Fill during testing]
Status: Pass/Fail
```

---

### Category 7: Libraries/Utilities

**Files to Check:**
- `apps/pandit/src/lib/voice-engine.ts`
- `apps/pandit/src/lib/sarvam-tts.ts`
- `apps/pandit/src/lib/sarvamSTT.ts`
- `apps/pandit/src/lib/deepgramSTT.ts`
- `apps/pandit/src/lib/voice-scripts.ts`
- `apps/pandit/src/lib/number-mapper.ts`
- `apps/pandit/src/lib/onboarding-store.ts`

**Test Case:**
```
TC-LIB-001: Library TypeScript Compilation
Priority: P0

Steps:
1. Run TypeScript check on lib files
2. Verify function signatures
3. Check return types
4. Verify imported types
5. Ensure no type errors in utility functions

Expected: Zero TypeScript errors in all library files
Actual: [Fill during testing]
Status: Pass/Fail
```

---

### Category 8: Error Boundaries

**Files to Check:**
- `apps/pandit/src/app/error.tsx`
- `apps/pandit/src/app/global-error.tsx`
- `apps/pandit/src/app/not-found.tsx`
- `apps/pandit/src/components/ErrorBoundary.tsx`

**Test Case:**
```
TC-ERROR-001: Error Boundary TypeScript Compilation
Priority: P0

Steps:
1. Run TypeScript check on error boundary files
2. Verify error component types
3. Check error handling types
4. Verify React error boundary types
5. Ensure proper error type handling

Expected: Zero TypeScript errors in error boundaries
Actual: [Fill during testing]
Status: Pass/Fail
```

---

### Category 9: Overlays & Widgets

**Files to Check:**
- `apps/pandit/src/components/overlays/SessionTimeout.tsx`
- `apps/pandit/src/components/overlays/CelebrationOverlay.tsx`
- `apps/pandit/src/components/widgets/GlobalOverlayProvider.tsx`
- `apps/pandit/src/components/widgets/AppOverlays.tsx`

**Test Case:**
```
TC-OVERLAY-001: Overlay/Widget TypeScript Compilation
Priority: P0

Steps:
1. Run TypeScript check on overlay/widget files
2. Verify animation types
3. Check conditional rendering types
4. Verify portal types (if used)
5. Ensure no type errors in overlay logic

Expected: Zero TypeScript errors in overlays/widgets
Actual: [Fill during testing]
Status: Pass/Fail
```

---

## 📊 Bug Status Tracker

### Current Bugs

| Bug ID | File | Category | Errors | Severity | Status | Assigned To |
|--------|------|----------|--------|----------|--------|-------------|
| TS-001 | | | 0 | P0 | ⬜ Open | |
| TS-002 | | | 0 | P0 | ⬜ Open | |
| TS-003 | | | 0 | P0 | ⬜ Open | |

### Fixed Bugs (Awaiting Verification)

| Bug ID | File | Fixed Date | Verified | Verified By |
|--------|------|------------|----------|-------------|
| - | - | - | ❌ No | - |

### Verified Bugs

| Bug ID | File | Fixed Date | Verified Date | Verified By |
|--------|------|------------|---------------|-------------|
| - | - | - | - | - |

---

## 📈 Daily Progress

### Day 1 (March 27) - Setup

**Tasks:**
- [ ] Create GitHub labels
- [ ] Run initial TypeScript scan
- [ ] Create bug issues for all files with errors
- [ ] Categorize errors by file type

**End of Day Status:**
- Total Errors Found: ___
- Bugs Created: ___
- Categories: ___

---

### Day 2 (March 28) - Continue Setup

**Tasks:**
- [ ] Finish creating all bug issues
- [ ] Assign bugs to developers
- [ ] Set up bug tracking board
- [ ] Create test cases for each category

**End of Day Status:**
- Total Bugs Created: ___
- All Categories Covered: ✅/❌
- Developers Assigned: ✅/❌

---

### Day 3 (March 29) - Verification Begins

**Tasks:**
- [ ] Verify first batch of fixes (50%)
- [ ] Run TypeScript compiler on each fix
- [ ] Check for regressions
- [ ] Update bug status

**End of Day Status:**
- Bugs Verified: ___
- Verification Progress: ___%
- Regressions Found: ___

---

### Day 4 (March 30) - Complete Verification

**Tasks:**
- [ ] Verify remaining fixes (50%)
- [ ] Run full TypeScript compilation
- [ ] Run ESLint on verified files
- [ ] Check for any new errors

**End of Day Status:**
- Total Bugs Verified: ___
- Remaining Bugs: ___
- Verification Progress: 100% ✅/❌

---

### Day 5 (March 31) - Final Sign-off

**Tasks:**
- [ ] Full TypeScript compilation
- [ ] ESLint check
- [ ] Build verification
- [ ] Create QA sign-off report

**Final Checks:**
```bash
# Run in apps/pandit directory
npx tsc --noEmit
pnpm lint
pnpm build
```

**Sign-off Criteria:**
- [ ] Zero TypeScript errors
- [ ] Zero ESLint errors
- [ ] Build succeeds
- [ ] All bugs verified
- [ ] QA sign-off submitted

---

## ✅ QA Sign-off Report

### Final Verification Results

**Date:** March 31, 2026  
**QA Engineer:** [Name]

---

### TypeScript Compilation

```
Command: npx tsc --noEmit
Result: ✅ PASS / ❌ FAIL
Errors: 0
Warnings: 0
```

---

### ESLint Check

```
Command: pnpm lint
Result: ✅ PASS / ❌ FAIL
Errors: 0
Warnings: 0
```

---

### Build Verification

```
Command: pnpm build
Result: ✅ PASS / ❌ FAIL
Duration: ___ minutes
Bundle Size: ___ KB
```

---

### Bug Summary

| Category | Total | Fixed | Verified | Remaining |
|----------|-------|-------|----------|-----------|
| Layout | 0 | 0 | 0 | 0 |
| Pages | 0 | 0 | 0 | 0 |
| UI Components | 0 | 0 | 0 | 0 |
| Voice | 0 | 0 | 0 | 0 |
| Stores | 0 | 0 | 0 | 0 |
| Hooks | 0 | 0 | 0 | 0 |
| Libraries | 0 | 0 | 0 | 0 |
| Error Boundaries | 0 | 0 | 0 | 0 |
| Overlays | 0 | 0 | 0 | 0 |
| **Total** | **0** | **0** | **0** | **0** |

---

### Sign-off Declaration

I certify that:

1. All TypeScript errors have been identified and tracked
2. All fixes have been verified by QA
3. The codebase compiles without errors
4. ESLint passes with no errors
5. The build completes successfully
6. No regressions were introduced

**The codebase is ready for production deployment.**

---

**Signature:** ___________________  
**Name:** [QA Engineer Name]  
**Date:** March 31, 2026  
**Time:** _________ IST

---

### Approval

**Approved By:** Rajesh Kumar (Senior Frontend Lead)  
**Date:** _________  
**Signature:** ___________________

---

## 🚨 Quick Commands Reference

### Daily Verification

```bash
# Navigate to pandit app
cd apps/pandit

# TypeScript check
npx tsc --noEmit

# ESLint check
pnpm lint

# Build check
pnpm build

# Run tests
pnpm test
```

### Watch Mode (Continuous Monitoring)

```bash
# Watch TypeScript errors
npx tsc --noEmit --watch

# Watch ESLint errors
pnpm lint --watch
```

### Generate Error Report

```bash
# Save TypeScript errors to file
npx tsc --noEmit > ../../qa-reports/typescript-errors/day-N-errors.txt 2>&1
```

---

**Last Updated:** March 27, 2026  
**Next Update:** Daily until all bugs verified  
**Target Completion:** March 31, 2026
