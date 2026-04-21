# 🔧 Independent Task Breakdown - HmarePanditJi

**Total Tasks:** 87 smallest independent units  
**Can be parallelized across:** 10-15 developers  
**Estimated time per task:** 5-30 minutes each

---

## 📋 CATEGORY 1: TypeScript Compilation Errors (13 tasks) 🔴 CRITICAL

**Each task = 1 file, can be done independently**

| Task ID | File | Error Count | What to Fix |
|---------|------|-------------|-------------|
| **TS-01** | `services/api/src/controllers/admin.controller.ts` | 2 | Fix line 282: Remove invalid `travelBookingDetails` property from booking update |
| **TS-02** | `services/api/src/controllers/admin.controller.ts` | 1 | Fix line 637: Cast `status` to `BookingStatus` enum type |
| **TS-03** | `services/api/src/controllers/muhurat.controller.ts` | 1 | Fix line 223: Cast array to `MuhuratDateEntry[]` type |
| **TS-04** | `services/api/src/controllers/muhurat.controller.ts` | 1 | Fix line 315: Cast object to `SuggestedMuhuratResponse` type |
| **TS-05** | `services/api/src/controllers/onboarding.controller.ts` | 1 | Fix line 10: Fix `AuthenticatedRequest` interface to extend FastifyRequest correctly |
| **TS-06** | `services/api/src/controllers/onboarding.controller.ts` | 1 | Fix line 192: Cast samagri package create input to correct Prisma type |
| **TS-07** | `services/api/src/controllers/samagri.controller.ts` | 1 | Fix line 14: Fix `AuthenticatedPanditRequest` interface definition |
| **TS-08** | `services/api/src/controllers/samagri.controller.ts` | 1 | Fix line 58: Cast `request` to `unknown` first, then to `AuthenticatedPanditRequest` |
| **TS-09** | `services/api/src/controllers/samagri.controller.ts` | 1 | Fix line 125: Same casting fix as TS-08 |
| **TS-10** | `services/api/src/controllers/samagri.controller.ts` | 1 | Fix line 194: Same casting fix as TS-08 |
| **TS-11** | `services/api/src/controllers/samagri.controller.ts` | 1 | Fix line 235: Same casting fix as TS-08 |
| **TS-12** | `services/api/src/routes/pandit.routes.ts` | 1 | Fix line 1186: Fix type mismatch in booking map function (customer name null handling) |
| **TS-13** | `services/api/src/routes/pandit.routes.ts` | 1 | Fix line 1428: Fix type mismatch in review map function (reviewer name null handling) |

---

## 📋 CATEGORY 2: Remove Unused Imports/Variables (6 tasks) 🟠 QUICK WINS

**Each task = 1-3 lines to delete, takes 2 minutes**

| Task ID | File | Line | What to Remove |
|---------|------|------|----------------|
| **UI-01** | `apps/pandit/src/app/(auth)/identity/page.tsx` | 6 | Remove unused import: `useRegistrationStore` |
| **UI-02** | `apps/pandit/src/app/(auth)/identity/page.tsx` | 32 | Remove unused variable: `confirmed` |
| **UI-03** | `apps/pandit/src/app/(auth)/identity/page.tsx` | 122 | Remove unused function: `handleManualDeny` |
| **UI-04** | `apps/pandit/src/app/(auth)/language-list/page.tsx` | 9 | Remove unused import: `replaceScriptPlaceholders` |
| **UI-05** | `apps/pandit/src/app/(auth)/language-list/page.tsx` | 14 | Remove unused variable: `setPhase` |
| **UI-06** | `apps/pandit/src/app/(auth)/referral/[code]/page.tsx` | 26 | Remove unused variable: `isLoading` |

---

## 📋 CATEGORY 3: Add `.catch()` to Promise Chains (18 tasks) 🟡 RELIABILITY

**Each task = add `.catch(console.error)` to one promise chain, takes 3 minutes**

### Web App (8 promises):

| Task ID | File | Line | Promise to Fix |
|---------|------|------|----------------|
| **PC-01** | `apps/web/src/components/GurujiAIChat.tsx` | 64 | Add `.catch()` to `.then(() => setPuterReady(true))` |
| **PC-02** | `apps/web/src/app/pandit/[id]/profile-client.tsx` | 327 | Add `.catch()` to availability calendar fetch chain |
| **PC-03** | `apps/web/src/app/pandit/[id]/profile-client.tsx` | 688 | Add `.catch()` to `navigator.clipboard.writeText()` |
| **PC-04** | `apps/web/src/app/pandit/[id]/profile-client.tsx` | 880 | Add `.catch()` to `fetchProfile()` call |
| **PC-05** | `apps/web/components/SamagriModal.tsx` | 62 | Add `.catch()` to cart load promise chain |
| **PC-06** | `apps/web/app/page.tsx` | 265 | Add `.catch()` to featured pandits fetch |
| **PC-07** | `apps/web/app/booking/new/booking-wizard-client.tsx` | 256 | Add `.catch()` to rituals fetch |
| **PC-08** | `apps/web/app/booking/new/booking-wizard-client.tsx` | 271 | Add `.catch()` to pandits fetch |

### Pandit App (6 promises):

| Task ID | File | Line | Promise to Fix |
|---------|------|------|----------------|
| **PC-09** | `apps/pandit/src/hooks/useVoice.ts` | 183 | Add `.catch()` to `getUserMedia()` call |
| **PC-10** | `apps/pandit/src/lib/voice-engine.ts` | 146 | Add `.catch()` to `getUserMedia()` call |
| **PC-11** | `apps/pandit/src/app/(registration)/permissions/location/page.tsx` | 27 | Add `.catch()` to geolocation promise |
| **PC-12** | `apps/pandit/src/app/(registration)/permissions/mic-denied/page.tsx` | 32 | Add `.catch()` to getUserMedia |
| **PC-13** | `apps/pandit/src/app/(registration)/permissions/mic/page.tsx` | 16 | Add `.catch()` to getUserMedia |
| **PC-14** | `apps/pandit/src/app/(registration)/otp/page.tsx` | 92 | Add `.catch()` to WebOTP read |

### Admin App (4 promises):

| Task ID | File | Line | Promise to Fix |
|---------|------|------|----------------|
| **PC-15** | `apps/admin/src/components/AdminSidebar.tsx` | 19 | Add `.catch()` to admin badges fetch |
| **PC-16** | `apps/admin/src/components/ActivityFeed.tsx` | 21 | Add `.catch()` to activity feed fetch |
| **PC-17** | `apps/admin/src/app/travel-desk/page.tsx` | 24 | Add `.catch()` to travel queue fetch |
| **PC-18** | `apps/admin/src/app/pandits/page.tsx` | 22 | Add `.catch()` to pandits list fetch |

---

## 📋 CATEGORY 4: Fix Empty onClick Handlers (10 tasks) 🟢 CODE QUALITY

**Each task = add TODO comment or implement functionality, takes 5 minutes**

| Task ID | File | Line | Empty Handler Location |
|---------|------|------|------------------------|
| **EO-01** | `apps/pandit/src/app/(auth)/help/page.tsx` | 31 | Language button `onClick={() => {}}` |
| **EO-02** | `apps/pandit/src/app/(auth)/welcome/page.tsx` | 30 | Button with no-op handler |
| **EO-03** | `apps/pandit/src/app/(auth)/voice-tutorial/page.tsx` | 62 | Button with no-op handler |
| **EO-04** | `apps/pandit/src/app/(auth)/language-confirm/page.tsx` | 55 | Language switch button |
| **EO-05** | `apps/pandit/src/app/(auth)/language-choice/page.tsx` | 42 | Button with no-op handler |
| **EO-06** | `apps/pandit/src/app/(auth)/manual-city/page.tsx` | 81 | Button with no-op handler |
| **EO-07** | `apps/pandit/src/app/(auth)/location-permission/page.tsx` | 63 | Button with no-op handler |
| **EO-08** | `apps/pandit/src/app/(auth)/language-list/page.tsx` | ~70 | Globe icon button `onClick={() => {}}` |
| **EO-09** | `apps/pandit/src/app/(registration)/layout.tsx` | 167 | Close button with no-op |
| **EO-10** | `packages/ui/components/ui/tabs.tsx` | 15 | `onValueChange: () => {}` |

---

## 📋 CATEGORY 5: Replace console.log with Logger (10 tasks) 🟡 CODE QUALITY

**Each task = replace `console.log/error/warn` with `logger.info/error/warn`, takes 3 minutes**

| Task ID | File | Lines | Console Statements |
|---------|------|-------|-------------------|
| **CL-01** | `apps/web/src/stores/authStore.ts` | 106 | Replace `console.debug` with logger |
| **CL-02** | `apps/web/src/context/auth-context.tsx` | 96 | Replace `console.debug` with logger |
| **CL-03** | `apps/pandit/src/app/(auth)/identity/page.tsx` | ~68,75,95 | Replace 3 console statements with logger |
| **CL-04** | `apps/pandit/src/lib/hooks/useWakeLock.ts` | 30,49 | Replace 2 console.debug with logger |
| **CL-05** | `apps/pandit/src/lib/onboarding-store.ts` | 267 | Replace console.log with logger |
| **CL-06** | `apps/pandit/src/lib/voice-preloader.ts` | Various | Replace console.log with logger |
| **CL-07** | `apps/pandit/src/lib/sarvam-tts.ts` | Various | Replace console.log/warn with logger |
| **CL-08** | `apps/pandit/src/lib/deepgramSTT.ts` | Various | Replace console.log/warn/error with logger |
| **CL-09** | `apps/pandit/src/lib/deepgram-stt.ts` | Various | Replace console statements with logger |
| **CL-10** | `apps/pandit/src/lib/voice-engine.ts` | Various | Replace debug console with logger |

---

## 📋 CATEGORY 6: Standardize Token Naming (48 instances → 3 tasks) 🔴 SECURITY

**Group all token usage by app, fix together**

| Task ID | App | Instances | What to Do |
|---------|-----|-----------|------------|
| **TK-01** | **Admin App** | ~18 instances | Change all `localStorage.getItem("adminToken")` to use consistent constant `ADMIN_TOKEN_KEY` |
| **TK-02** | **Web App** | ~25 instances | Change all `localStorage.getItem("token")` and `localStorage.getItem("hpj_token")` to use consistent constant `USER_TOKEN_KEY` |
| **TK-03** | **Shared Utils** | ~5 instances | Update `packages/utils/src/auth-context.tsx` to use standardized token constants |

**Each task includes:**
1. Create constants file with `ADMIN_TOKEN_KEY = 'hpj_admin_token'` and `USER_TOKEN_KEY = 'hpj_user_token'`
2. Find-replace all instances in that app
3. Update documentation

---

## 📋 CATEGORY 7: Fix setTimeout Without Cleanup (30 tasks) 🟡 RELIABILITY

**Each task = wrap setTimeout in useEffect with cleanup return, takes 5 minutes**

### Web App (10 setTimeouts):

| Task ID | File | Line | What to Fix |
|---------|------|------|-------------|
| **ST-01** | `apps/web/src/components/voice-search-modal.tsx` | 23,29 | Add cleanup for setTimeout and setInterval |
| **ST-02** | `apps/web/src/components/muhurat/muhurat-page-client.tsx` | 252,270 | Add cleanup for 2 setTimeout calls |
| **ST-03** | `apps/web/src/components/LoginModal.tsx` | 21 | Add cleanup for setTimeout |
| **ST-04** | `apps/web/src/components/GurujiAIChat.tsx` | 82 | Add cleanup for setTimeout |
| **ST-05** | `apps/web/src/components/auth-modal.tsx` | 121 | Add cleanup for setInterval |
| **ST-06** | `apps/web/src/app/pandit/onboarding/voice/page.tsx` | 14 | Add cleanup for setTimeout |
| **ST-07** | `apps/web/src/app/dashboard/favorites/page.tsx` | 76,79 | Add cleanup for 2 setTimeout calls |
| **ST-08** | `apps/web/app/dashboard/bookings/[bookingId]/page.tsx` | 57 | Add cleanup for setInterval |
| **ST-09** | `apps/web/app/dashboard/bookings/[bookingId]/review/page.tsx` | 104 | Add cleanup for setTimeout |
| **ST-10** | `apps/web/app/dashboard/bookings/[bookingId]/cancel/page.tsx` | 115 | Add cleanup for setTimeout |

### Pandit App (12 setTimeouts):

| Task ID | File | Line | What to Fix |
|---------|------|------|-------------|
| **ST-11** | `apps/pandit/src/components/voice/VoiceOverlay.tsx` | 57 | Add cleanup for setTimeout with ref |
| **ST-12** | `apps/pandit/src/components/voice/ErrorOverlay.tsx` | 49,53 | Add cleanup for 2 setTimeout calls |
| **ST-13** | `apps/pandit/src/components/voice/ConfirmationSheet.tsx` | 51,70 | Add cleanup for setTimeout and setInterval |
| **ST-14** | `apps/pandit/src/components/emergency/EmergencySOS.tsx` | 31 | Add cleanup for setTimeout |
| **ST-15** | `apps/pandit/src/components/overlays/VoiceTutorialOverlay.tsx` | 37,47 | Add cleanup for 2 setTimeout calls |
| **ST-16** | `apps/pandit/src/components/overlays/SessionTimeoutSheet.tsx` | 14 | Add cleanup for setInterval |
| **ST-17** | `apps/pandit/src/hooks/useVoice.ts` | 116,143,253 | Add cleanup for setTimeout calls without timeoutRef |
| **ST-18** | `apps/pandit/src/lib/hooks/useVoiceFlow.ts` | 129 | Add cleanup for setTimeout |
| **ST-19** | `apps/pandit/src/lib/hooks/useVoiceCascade.ts` | 129 | Add cleanup for setTimeout |
| **ST-20** | `apps/pandit/src/lib/hooks/useSarvamVoiceFlow.ts` | 89,256,271 | Add cleanup for 3 setTimeout calls |
| **ST-21** | `apps/pandit/src/lib/voice-preloader.ts` | 89 | Add cleanup for setTimeout |
| **ST-22** | `apps/pandit/src/app/resume/page.tsx` | 76 | Add cleanup for setTimeout |

### Admin App (5 setTimeouts):

| Task ID | File | Line | What to Fix |
|---------|------|------|-------------|
| **ST-23** | `apps/admin/src/app/verification/page.tsx` | 122,128 | Add cleanup for 2 setTimeout calls |
| **ST-24** | `apps/admin/src/app/customers/page.tsx` | 44 | Add cleanup for setTimeout |
| **ST-25** | `apps/admin/src/app/settings/page.tsx` | 34 | Add cleanup for setTimeout |
| **ST-26** | `apps/admin/src/app/bookings/[id]/page.tsx` | 132 | Add cleanup for setTimeout |
| **ST-27** | `apps/admin/src/app/bookings/page.tsx` | 89 | Add cleanup for setTimeout |

### Shared UI (3 setTimeouts):

| Task ID | File | Line | What to Fix |
|---------|------|------|-------------|
| **ST-28** | `packages/ui/Toast.tsx` | 27 | Add cleanup for setTimeout (toast auto-dismiss) |
| **ST-29** | `packages/ui/OtpInput.tsx` | 65,123 | Add cleanup for 2 setTimeout calls |
| **ST-30** | `packages/ui/Modal.tsx` | 36 | Add cleanup for setTimeout |

---

## 📋 CATEGORY 8: Fix Empty Context/Default Functions (3 tasks) 🟢 LOW PRIORITY

**Each task = add warning log to empty function, takes 2 minutes**

| Task ID | File | What to Fix |
|---------|------|-------------|
| **EF-01** | `apps/web/src/context/auth-context.tsx` | Add console.warn to 5 empty default context functions |
| **EF-02** | `packages/ui/components/ui/select.tsx` | Add warning to 3 empty callback defaults |
| **EF-03** | `apps/pandit/src/stores/uiStore.ts` | Add warning to 10 empty SSR default functions |

---

## 📊 SUMMARY TABLE

| Category | Task Count | Priority | Avg Time/Task | Can Parallelize? |
|----------|-----------|----------|---------------|------------------|
| **TS** - TypeScript Errors | 13 | 🔴 Critical | 10 min | ✅ Yes (different files) |
| **UI** - Unused Imports | 6 | 🟠 High | 2 min | ✅ Yes |
| **PC** - Promise .catch() | 18 | 🟡 Medium | 3 min | ✅ Yes |
| **EO** - Empty onClick | 10 | 🟡 Medium | 5 min | ✅ Yes |
| **CL** - Console to Logger | 10 | 🟡 Medium | 3 min | ✅ Yes |
| **TK** - Token Standardization | 3 | 🔴 High | 30 min | ✅ Yes (by app) |
| **ST** - setTimeout Cleanup | 30 | 🟡 Medium | 5 min | ✅ Yes |
| **EF** - Empty Functions | 3 | 🟢 Low | 2 min | ✅ Yes |
| **TOTAL** | **93** | | | **100% Parallel** |

---

## 🚀 HOW TO DISTRIBUTE TO TEAM

### **Developer 1** (Senior - TypeScript Expert):
- TS-01 through TS-13 (all 13 TypeScript errors)

### **Developer 2** (Junior - Quick Wins):
- UI-01 through UI-06 (unused imports)
- EF-01 through EF-03 (empty functions)

### **Developer 3** (Mid-level):
- PC-01 through PC-08 (web app promise chains)

### **Developer 4** (Mid-level):
- PC-09 through PC-18 (pandit + admin promise chains)

### **Developer 5** (Junior):
- EO-01 through EO-10 (empty onClick handlers)

### **Developer 6** (Mid-level):
- CL-01 through CL-05 (console replacements - web + pandit)

### **Developer 7** (Mid-level):
- CL-06 through CL-10 (console replacements - voice/audio files)

### **Developer 8** (Senior - Security):
- TK-01 through TK-03 (token standardization)

### **Developers 9-12** (Any level):
- ST-01 through ST-30 (setTimeout cleanup - split 8 tasks each)

---

## ✅ VERIFICATION CHECKLIST

After all tasks are completed, run:

```bash
# TypeScript compilation
pnpm --filter @hmarepanditji/api exec tsc --noEmit
pnpm --filter @hmarepanditji/web exec tsc --noEmit
pnpm --filter @hmarepanditji/pandit exec tsc --noEmit
pnpm --filter @hmarepanditji/admin exec tsc --noEmit

# Linting
pnpm lint

# Security check
grep -r "NEXT_PUBLIC_.*API_KEY" apps/ --include="*.ts" --include="*.tsx"
grep -r "localStorage.*token" apps/ --include="*.ts" --include="*.tsx"
```

**Expected result:** 0 errors, 0 warnings

---

**Each task is 100% independent - can be worked on simultaneously by different developers!** 🚀
