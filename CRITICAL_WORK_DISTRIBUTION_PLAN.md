# CRITICAL WORK DISTRIBUTION PLAN
## TypeScript & ESLint Error Resolution Sprint

**Date:** March 27, 2026
**Priority:** CRITICAL - Blocks Production Deployment
**Timeline:** 3-5 Days

---

## 🚨 CRITICAL FINDING

**1000+ TypeScript Errors** and **500+ ESLint Errors** detected across the codebase.

### Root Cause Analysis

The errors are NOT in template/tutorial files as previously thought. Errors are in **CORE APPLICATION FILES**:

**Affected Areas:**
- ✅ All page components in `apps/pandit/src/app/`
- ✅ All UI components in `apps/pandit/src/components/ui/`
- ✅ All layout files
- ✅ All hook files
- ✅ All store files

**Error Pattern:**
```typescript
// Example error pattern - files contain malformed code
src/app/(auth)/identity/page.tsx(35,16): error TS1109: Expression expected.
src/components/ui/Button.tsx(12,78): error TS1131: Property or signature expected.
```

This suggests **files were corrupted** or **saved incorrectly** (possibly template literals saved as actual code).

---

## 👥 TEAM WORK DISTRIBUTION

### **Senior Frontend Lead** (YOU)
**Responsibility:** Overall coordination + Core architecture files

#### Tasks:
1. **Project Coordination**
   - Daily standup at 10:30 AM IST
   - Code review within 4 hours of submission
   - Track progress against this plan
   - Unblock team members immediately

2. **Files to Fix Personally** (Critical Path)
   - `apps/pandit/src/app/(auth)/layout.tsx`
   - `apps/pandit/src/app/(registration)/layout.tsx`
   - `apps/pandit/src/app/onboarding/layout.tsx`
   - `apps/pandit/src/app/(public)/layout.tsx`
   - `apps/pandit/src/app/(dashboard-group)/layout.tsx`
   - `apps/pandit/src/app/(onboarding-group)/layout.tsx`
   - `apps/pandit/src/app/error.tsx`
   - `apps/pandit/src/app/global-error.tsx`
   - `apps/pandit/src/app/not-found.tsx`
   - `apps/pandit/src/app/loading.tsx`

3. **Component Library**
   - `apps/pandit/src/components/ui/Button.tsx`
   - `apps/pandit/src/components/ui/Input.tsx`
   - `apps/pandit/src/components/ui/Card.tsx`
   - `apps/pandit/src/components/TopBar.tsx`
   - `apps/pandit/src/components/CTAButton.tsx`

**Success Criteria:** Zero errors in layout files + core UI components

---

### **Frontend Developer 1** (UI Specialist)
**Responsibility:** Page components & UI consistency

#### Files to Fix:

**Auth Group** (Priority 1):
- `apps/pandit/src/app/(auth)/page.tsx`
- `apps/pandit/src/app/(auth)/identity/page.tsx`
- `apps/pandit/src/app/(auth)/language-choice/page.tsx`
- `apps/pandit/src/app/(auth)/language-confirm/page.tsx`
- `apps/pandit/src/app/(auth)/language-list/page.tsx`
- `apps/pandit/src/app/(auth)/language-set/page.tsx`
- `apps/pandit/src/app/(auth)/language-confirm/page.tsx`
- `apps/pandit/src/app/(auth)/login/page.tsx`
- `apps/pandit/src/app/(auth)/help/page.tsx`
- `apps/pandit/src/app/(auth)/welcome/page.tsx`

**Registration Group** (Priority 2):
- `apps/pandit/src/app/(registration)/mobile/page.tsx`
- `apps/pandit/src/app/(registration)/otp/page.tsx`
- `apps/pandit/src/app/(registration)/profile/page.tsx`
- `apps/pandit/src/app/(registration)/complete/page.tsx`

**Permissions** (Priority 3):
- `apps/pandit/src/app/(registration)/permissions/location/page.tsx`
- `apps/pandit/src/app/(registration)/permissions/mic/page.tsx`
- `apps/pandit/src/app/(registration)/permissions/mic-denied/page.tsx`
- `apps/pandit/src/app/(registration)/permissions/notifications/page.tsx`

**Onboarding Screens** (Priority 4):
- `apps/pandit/src/app/onboarding/screens/*.tsx` (all screen files)

**Success Criteria:** Zero errors in all page components

---

### **Frontend Developer 2** (State & Navigation)
**Responsibility:** Components, hooks, stores, utilities

#### Files to Fix:

**Component Files** (Priority 1):
- `apps/pandit/src/components/HelpButton.tsx`
- `apps/pandit/src/components/KeyboardToggle.tsx`
- `apps/pandit/src/components/LanguageBottomSheet.tsx`
- `apps/pandit/src/components/LanguageChangeBottomSheet.tsx`
- `apps/pandit/src/components/ProgressDots.tsx`
- `apps/pandit/src/components/SkipButton.tsx`

**Overlay Components** (Priority 2):
- `apps/pandit/src/components/overlays/CelebrationOverlay.tsx`
- `apps/pandit/src/components/overlays/NoiseWarningOverlay.tsx`
- `apps/pandit/src/components/overlays/SessionSaveNotice.tsx`
- `apps/pandit/src/components/overlays/SessionTimeout.tsx`
- `apps/pandit/src/components/overlays/SessionTimeoutSheet.tsx`

**Screen Components** (Priority 3):
- `apps/pandit/src/components/screens/LocationPermissionScreen.tsx`
- `apps/pandit/src/components/screens/NotificationsPermissionScreen.tsx`

**Voice Components** (Priority 4):
- `apps/pandit/src/components/voice/ConfirmationSheet.tsx`
- `apps/pandit/src/components/voice/ErrorOverlay.tsx`
- `apps/pandit/src/components/voice/VoiceIndicator.tsx`
- `apps/pandit/src/components/voice/VoiceOverlay.tsx`
- `apps/pandit/src/components/voice/WaveformBar.tsx`

**Widget Components** (Priority 5):
- `apps/pandit/src/components/widgets/AppOverlays.tsx`
- `apps/pandit/src/components/widgets/EmergencySOSFloating.tsx`
- `apps/pandit/src/components/widgets/GlobalOverlayProvider.tsx`
- `apps/pandit/src/components/widgets/LanguageChangeWidget.tsx`

**Skeleton Components** (Priority 6):
- `apps/pandit/src/components/skeletons/index.tsx`

**Utility Components** (Priority 7):
- `apps/pandit/src/components/ui/CompletionBadge.tsx`
- `apps/pandit/src/components/ui/CTAButton.tsx`
- `apps/pandit/src/components/ui/LanguageBottomSheet.tsx`
- `apps/pandit/src/components/ui/LoadingOverlay.tsx`
- `apps/pandit/src/components/ui/ProgressDots.tsx`
- `apps/pandit/src/components/ui/SahayataBar.tsx`
- `apps/pandit/src/components/ui/Skeleton.tsx`
- `apps/pandit/src/components/ui/SkipButton.tsx`
- `apps/pandit/src/components/ui/TutorialAnimations.tsx`

**Hooks** (Priority 8):
- `apps/pandit/src/hooks/useAnalytics.ts`
- `apps/pandit/src/hooks/useBackButton.ts` (if exists)
- `apps/pandit/src/hooks/useSarvamVoiceFlow.ts` (if exists)

**Utilities** (Priority 9):
- `apps/pandit/src/lib/hydration-guard.tsx`

**Success Criteria:** Zero errors in all components, hooks, and utilities

---

### **Voice/AI Engineer**
**Responsibility:** Voice engine files + language support

#### Files to Fix:

**Voice Engine** (Priority 1):
- Check all files in `apps/pandit/src/lib/` related to voice
- `apps/pandit/src/lib/sarvamSTT.ts` (if exists)
- `apps/pandit/src/lib/sarvam-tts.ts` (if exists)
- `apps/pandit/src/lib/voice-engine.ts` (if exists)
- `apps/pandit/src/lib/number-mapper.ts` (if exists)

**Voice Scripts** (Priority 2):
- Review `voice/scripts_part0/` directory
- Identify files that should be `.json` or `.txt` instead of `.ts/.tsx`
- Rename/move inappropriate files

**Voice Components** (Support Frontend Dev 2):
- `apps/pandit/src/components/voice/ConfirmationSheet.tsx`
- `apps/pandit/src/components/voice/ErrorOverlay.tsx`
- `apps/pandit/src/components/voice/VoiceIndicator.tsx`
- `apps/pandit/src/components/voice/VoiceOverlay.tsx`
- `apps/pandit/src/components/voice/WaveformBar.tsx`

**Success Criteria:**
- Zero errors in voice engine files
- All voice scripts properly formatted
- Voice components working correctly

---

### **QA/Test Engineer**
**Responsibility:** Testing + Bug tracking

#### Tasks:

**Day 1-2: Setup**
1. Set up bug tracking board (GitHub Issues or Linear)
2. Create bug report template for TypeScript errors
3. Create test case for each file category

**Day 3-4: Testing**
1. Test each file after developer fixes
2. Run TypeScript compiler on each fix
3. Verify no regressions

**Day 5: Final Verification**
1. Full TypeScript compilation
2. ESLint check
3. Build verification
4. Create QA sign-off report

**Bug Tracking Template:**
```markdown
## Bug: [File Name] TypeScript Errors

**Severity:** P0 (Blocks Production)
**File:** `path/to/file.tsx`
**Error Count:** X errors

### Errors Found:
- Line XX: Expression expected
- Line YY: Property assignment expected

### Fix Applied:
[Developer to fill]

### Verification:
- [ ] TypeScript compiles
- [ ] ESLint passes
- [ ] Component renders correctly
- [ ] No regressions

**Status:** Open → In Progress → Fixed → Verified
```

**Success Criteria:**
- All bugs tracked
- All fixes verified
- Final QA sign-off document

---

### **DevOps Engineer** (Part-Time)
**Responsibility:** CI/CD + Build verification

#### Tasks:

**Day 1: CI/CD Update**
1. Update GitHub Actions workflow to run TypeScript check
2. Add ESLint check to pipeline
3. Configure build artifacts

**Day 3: Build Verification**
1. Test full build process
2. Verify bundle size
3. Check deployment to Vercel preview

**Day 5: Production Prep**
1. Prepare production deployment
2. Set up monitoring for errors
3. Create rollback plan

**Success Criteria:**
- CI/CD pipeline green
- Build completes successfully
- Deployment working

---

## 📅 DAILY SCHEDULE

### **Day 1 (March 27)**
**Goal:** Understand scope + Fix critical layout files

**Morning (10 AM - 1 PM):**
- 10:00-10:30: Team standup + role assignment
- 10:30-1:00: Individual file analysis

**Afternoon (2 PM - 7 PM):**
- 2:00-5:00: Fix critical files (layouts)
- 5:00-6:00: Code review
- 6:00-7:00: Progress update

**End of Day Target:**
- ✅ All layout files fixed
- ✅ Build process understood
- ✅ Bug tracking set up

---

### **Day 2 (March 28)**
**Goal:** Fix all page components

**Morning:**
- 10:00-10:30: Standup
- 10:30-1:00: Fix auth group pages

**Afternoon:**
- 2:00-5:00: Fix registration group pages
- 5:00-6:00: Code review
- 6:00-7:00: QA testing starts

**End of Day Target:**
- ✅ All auth pages fixed
- ✅ All registration pages fixed
- ✅ 50% of components fixed

---

### **Day 3 (March 29)**
**Goal:** Fix all components + hooks

**Morning:**
- 10:00-10:30: Standup
- 10:30-1:00: Fix UI components

**Afternoon:**
- 2:00-5:00: Fix overlay + voice components
- 5:00-6:00: Fix hooks + utilities
- 6:00-7:00: Code review

**End of Day Target:**
- ✅ All components fixed
- ✅ All hooks fixed
- ✅ All utilities fixed

---

### **Day 4 (March 30)**
**Goal:** Full testing + bug fixes

**Morning:**
- 10:00-10:30: Standup
- 10:30-1:00: QA testing
- 1:00-2:00: Bug fix sprint

**Afternoon:**
- 2:00-5:00: Continue bug fixes
- 5:00-6:00: Final code review
- 6:00-7:00: Build verification

**End of Day Target:**
- ✅ Zero TypeScript errors
- ✅ Zero ESLint errors
- ✅ Build passes

---

### **Day 5 (March 31)**
**Goal:** Production readiness

**Morning:**
- 10:00-10:30: Standup
- 10:30-12:00: Final verification
- 12:00-1:00: Documentation update

**Afternoon:**
- 2:00-4:00: QA sign-off
- 4:00-5:00: DevOps deployment test
- 5:00-6:00: Team retrospective
- 6:00-7:00: Celebration! 🎉

**End of Day Target:**
- ✅ Production ready
- ✅ All documentation updated
- ✅ Team trained on deployment

---

## 📊 PROGRESS TRACKING

### Daily Standup Format (10:30 AM IST, 15 minutes)

Each person shares:
1. **Yesterday:** What I fixed
2. **Today:** What I'll fix
3. **Blockers:** Any issues

### Progress Board

Create a GitHub Project or Linear board with these columns:
```
Backlog → In Progress → Code Review → QA Testing → Done
```

### Daily Progress Report Template

```markdown
## Daily Progress Report - [Date]

### Overall Status
- TypeScript Errors: XXX → YYY (ZZ% reduction)
- ESLint Errors: XXX → YYY (ZZ% reduction)
- Files Fixed: XX / XX

### By Team Member
**Senior Frontend Lead:**
- Fixed: [list files]
- In Progress: [list files]
- Blockers: [any]

**Frontend Developer 1:**
- Fixed: [list files]
- In Progress: [list files]
- Blockers: [any]

**Frontend Developer 2:**
- Fixed: [list files]
- In Progress: [list files]
- Blockers: [any]

**Voice/AI Engineer:**
- Fixed: [list files]
- In Progress: [list files]
- Blockers: [any]

### QA Status
- Files Tested: XX
- Bugs Found: XX
- Bugs Fixed: XX
- Pending Verification: XX

### Tomorrow's Goals
[What we'll achieve tomorrow]
```

---

## 🛠️ TECHNICAL APPROACH

### Step 1: Analyze Error Pattern
```bash
# Run TypeScript check
cd apps/pandit
npx tsc --noEmit

# Run ESLint check
npx eslint . --ext .ts,.tsx
```

### Step 2: Identify File Corruption
Most errors show:
- `Expression expected`
- `Property assignment expected`
- `Declaration or statement expected`

This indicates **files contain template literals or malformed code**.

### Step 3: Fix Strategy

**For each file:**
1. Read the file
2. Identify the corruption pattern
3. Rewrite the file with proper TypeScript/JSX
4. Test compilation
5. Commit changes

**Common Fix Pattern:**
```typescript
// ❌ BROKEN (template literal saved as code)
const component = `
  <div className="...">
    {hindiText}
  </div>
`

// ✅ FIXED (proper JSX)
const component = (
  <div className="...">
    {hindiText}
  </div>
)
```

### Step 4: Verification
```bash
# After fixing each file
npx tsc --noEmit path/to/file.tsx

# After fixing all files
npm run build
```

---

## 📝 SUCCESS METRICS

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| TypeScript Errors | 0 | 1000+ | ❌ |
| ESLint Errors | 0 | 500+ | ❌ |
| Build Status | Pass | Fail | ❌ |
| Lighthouse Accessibility | ≥95 | Unknown | ⏳ |
| Code Coverage | ≥80% | Unknown | ⏳ |

---

## 🚨 RISK MITIGATION

### Risk 1: Files Too Corrupted to Fix
**Mitigation:**
- Check git history for last good version
- Restore from backup
- Rewrite file from scratch if needed

### Risk 2: Fix Takes Longer Than Expected
**Mitigation:**
- Prioritize critical path files (layouts, core components)
- Defer non-critical files (animations, optional features)
- Add more developers if needed

### Risk 3: New Bugs Introduced
**Mitigation:**
- QA testing after each fix
- Daily regression testing
- Feature flags for risky changes

---

## 📞 COMMUNICATION

### Tools
- **GitHub:** Code review + project management
- **Slack:** Team communication
- **Vercel:** Deployment previews
- **Linear/Jira:** Bug tracking (optional)

### Escalation Path
1. Developer → Senior Frontend Lead (immediate)
2. Senior Frontend Lead → Project Stakeholder (if blocked >4 hours)
3. Project Stakeholder → Emergency contact (if critical path blocked)

---

## 🎯 FINAL DELIVERABLES

### Day 5 EOD:
- ✅ Zero TypeScript errors
- ✅ Zero ESLint errors
- ✅ Build passes successfully
- ✅ All tests passing
- ✅ QA sign-off document
- ✅ Deployment to production ready
- ✅ Team trained on deployment process

---

**Let's get this done! 🚀**

*Questions? Reach out to Senior Frontend Lead during standup or on Slack.*
