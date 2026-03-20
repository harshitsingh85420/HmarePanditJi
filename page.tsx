— basic profile form
src/app/(registration)/complete/page.tsx — completion screen
src/app/(registration)/permissions/location/page.tsx — location permission
src/app/(registration)/permissions/notifications/page.tsx — notification permission

For each placeholder, use this minimal template:
'use client'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
export default function [ScreenName]Page() {
  const router = useRouter()
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center bg-surface-base gap-4 px-5">
      <div className="text-5xl">🪔</div>
      <h1 className="font-serif text-xl font-bold text-saffron-dark text-center">
        [Screen Name] — Coming Soon
      </h1>
      <button onClick={() => router.push('/mobile')} className="text-saffron underline text-sm">
        Skip to Mobile →
      </button>
    </div>
  )
}

STEP 2 - Fix all TypeScript errors:
Run: npx tsc --noEmit
For each error, fix it. Common fixes needed:
- Add 'use client' to all components using hooks
- Add missing type imports
- Fix optional chaining (?.  operator) where needed

STEP 3 - Run production build:
npm run build

Fix all build errors in order they appear.

STEP 4 - Start dev server:
npm run dev

STEP 5 - Test the following user flows:

FLOW 1 (Fresh user, voice path):
/ → /identity → /permissions/mic → (grant) → /mobile → (speak number) → confirmation → /otp → /profile

FLOW 2 (Fresh user, keyboard path):  
/ → /identity → /permissions/mic → (deny) → /permissions/mic-denied → /mobile → (type number) → /otp

FLOW 3 (Returning user):
/ → (detects incomplete session) → /resume → /[last step]

FLOW 4 (Network test):
Disconnect WiFi → verify amber banner appears → reconnect → verify green banner → verify state preserved

STEP 6 - Verify on mobile device or Chrome DevTools mobile emulation:
- Set device to "Galaxy S21" in DevTools
- Verify all tap targets are ≥52px
- Verify fonts are readable
- Verify no horizontal scroll
- Verify voice input works (requires HTTPS — use ngrok for testing: npx ngrok http 3000)

Report all issues found and fix them before considering this prompt complete.
```

---

## PROMPT 19 — VOICE TTS CALIBRATION & OTP AUTO-READ