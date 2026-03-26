# HmarePanditJi — Freelancer Hiring Guide
**Quick-Start Guide for Hiring 5 Freelancers**

---

## 🎯 ROLES TO HIRE (5 Positions)

| # | Role | Skills Required | Duration | Budget (INR) | Priority |
|---|------|----------------|----------|--------------|----------|
| 1 | Backend Developer | Next.js API routes, Sarvam/Deepgram SDKs, Redis, rate limiting | 5 days | ₹75,000 | 🔴 CRITICAL |
| 2 | Voice Script Specialist | Hindi + 14 languages, TTS scriptwriting, linguistics PhD preferred | 15 days | ₹1,50,000 | 🔴 CRITICAL |
| 3 | UI/Animation Developer | Framer Motion, React, Tailwind, mobile-first design | 12 days | ₹1,44,000 | 🟡 HIGH |
| 4 | Voice UI Component Dev | React, accessibility (WCAG 2.1 AA), animation | 9 days | ₹90,000 | 🟡 HIGH |
| 5 | Translation Specialist | Sarvam Mayura API, i18n, 14 Indian languages | 5 days | ₹60,000 | 🟢 MEDIUM |

**Total Budget:** ₹5,19,000 (~$6,250 USD)

---

## 📝 JOB DESCRIPTIONS (Copy-Paste Ready)

### Job Post 1: Backend Developer (Next.js + Voice APIs)

**Title:** Backend Developer for Voice-First Indian App (Next.js, Sarvam AI)

**Description:**
We're building HmarePanditJi, a voice-first mobile app for Hindu priests across India. We need a backend developer to create 4 secure API routes for TTS (text-to-speech), STT (speech-to-text), translation, and referral validation.

**Tech Stack:**
- Next.js 14 App Router
- Sarvam AI SDK (Bulbul v3 TTS, Saaras v3 STT)
- Deepgram SDK (Nova-3 streaming STT)
- Redis (token caching)
- Rate limiting (express-rate-limit or similar)

**Tasks:**
1. Create `/api/tts` route (Sarvam Bulbul v3 proxy)
2. Create `/api/stt-token` route (time-limited token generator)
3. Create `/api/translate` route (Sarvam Mayura proxy)
4. Update `/api/referral/validate` route (database validation)
5. Write API documentation

**Requirements:**
- 3+ years Next.js experience
- Experience with voice APIs (Sarvam, Deepgram, Google Cloud TTS/STT)
- Understanding of rate limiting and API security
- Ability to write clean, documented code
- Available for 5 days (full-time equivalent)

**Deliverables:**
- 4 working API routes with error handling
- `.env.local.example` file
- `API_ROUTES.md` documentation
- All routes tested with curl commands

**Budget:** ₹75,000 (fixed price)
**Timeline:** 5 days (March 26 - April 1, 2026)
**Payment:** 30% upfront, 40% midpoint, 30% on completion

**To Apply:**
Send:
1. GitHub profile with Next.js projects
2. Example of API route you've built
3. Confirm you can start immediately
4. Your experience with voice APIs (TTS/STT)

**Contact:** [Your Email/Slack]

---

### Job Post 2: Voice Script Specialist (Hindi + Indian Languages)

**Title:** Voice Script Writer for AI TTS (Hindi + 14 Indian Languages)

**Description:**
We need a linguistics expert to write 2,250 voice scripts for our text-to-speech system. The app serves Hindu priests across India in 15 languages. You'll write scripts that sound warm, respectful, and natural when spoken by AI.

**Languages Required:**
Hindi, Tamil, Telugu, Bengali, Marathi, Gujarati, Kannada, Malayalam, Punjabi, Odia, English, Bhojpuri, Maithili, Sanskrit, Assamese

**Tasks:**
1. Write voice script guidelines document
2. Write 405 scripts for Part 0.0 (9 screens × 3 variants × 15 languages)
3. Write 1,845 scripts for Part 0 (12 screens × 13 avg variants × 15 languages)
4. Test all scripts via Sarvam TTS API
5. Get native speaker review for 5 priority languages
6. Write QA report

**Requirements:**
- PhD or MA in Linguistics (preferred)
- Native Hindi speaker with fluency in 3+ Indian languages
- Experience writing TTS scripts or voiceovers
- Understanding of Hindu priest/pandit context (cultural sensitivity)
- Attention to detail (pause durations, emotional tone)
- Available for 15 days

**Deliverables:**
- `VOICE_SCRIPT_GUIDELINES.md`
- 2,250 voice scripts (TypeScript files)
- `VOICE_SCRIPT_QA_REPORT.md`
- All scripts tested and QA-approved

**Budget:** ₹1,50,000 (fixed price)
**Timeline:** 15 days (March 26 - April 10, 2026)
**Payment:** 30% upfront, 40% midpoint, 30% on completion

**To Apply:**
Send:
1. CV highlighting linguistics background
2. Sample of voiceover/TTS script you've written
3. List of Indian languages you speak/write fluently
4. Your experience with TTS systems (if any)

**Contact:** [Your Email/Slack]

---

### Job Post 3: UI/Animation Developer (Framer Motion Expert)

**Title:** UI Developer for Mobile App (Framer Motion, React, Tailwind)

**Description:**
We're building a voice-first onboarding flow for Hindu priests in India. We need a UI developer to implement 11 tutorial screens with beautiful Framer Motion animations. Each screen must work flawlessly on mobile (390px viewport).

**Tech Stack:**
- React 18 + TypeScript
- Next.js 14 App Router
- Framer Motion v11 (animations)
- Tailwind CSS v3
- Mobile-first responsive design

**Tasks:**
1. Implement 11 tutorial screens (S-0.2 to S-0.12)
2. Add Framer Motion animations (cards, buttons, illustrations)
3. Integrate voice scripts (play on load, listen for response)
4. Ensure mobile responsiveness (390px viewport)
5. Add keyboard fallback options
6. Write clean, documented code

**Screens to Build:**
- S-0.2: Income Hook (testimonial card + 4 tiles)
- S-0.3: Fixed Dakshina (emotional narrative)
- S-0.4: Online Revenue (dual cards)
- S-0.5: Backup Pandit (3-step explanation)
- S-0.6: Instant Payment (payment breakdown)
- S-0.7: Voice Nav Demo (interactive mic)
- S-0.8: Dual Mode (smartphone vs keypad)
- S-0.9: Travel Calendar (map + calendar)
- S-0.10: Video Verification (badge animation)
- S-0.11: 4 Guarantees (4 cards)
- S-0.12: Final CTA (decision screen)

**Requirements:**
- 3+ years React/TypeScript experience
- Strong Framer Motion portfolio (show animations you've built)
- Experience with mobile-first design (390px viewport)
- Understanding of accessibility (WCAG 2.1 AA)
- Available for 12 days (full-time equivalent)

**Deliverables:**
- 11 screen components (TypeScript + TSX)
- All animations working at 60fps
- Mobile responsive on all screens
- Lighthouse score >90

**Budget:** ₹1,44,000 (fixed price)
**Timeline:** 12 days (April 1 - April 12, 2026)
**Payment:** 30% upfront, 40% midpoint, 30% on completion

**To Apply:**
Send:
1. Portfolio with Framer Motion animations
2. GitHub profile with React projects
3. Example of mobile-first responsive design you've built
4. Confirm availability for 12 days starting April 1

**Contact:** [Your Email/Slack]

---

### Job Post 4: Voice UI Component Developer (React + Accessibility)

**Title:** React Component Developer for Voice UI (Accessibility Expert)

**Description:**
We need a React component developer to build 7 voice overlay components with WCAG 2.1 AA accessibility compliance. These components provide visual feedback for voice interactions (listening, speaking, errors).

**Tech Stack:**
- React 18 + TypeScript
- Framer Motion v11
- Tailwind CSS v3
- Accessibility (WCAG 2.1 AA)
- Screen reader testing (NVDA, JAWS)

**Components to Build:**
1. VoiceOverlay (waveform bars + pulsing ring)
2. ConfirmationSheet (bottom sheet with yes/no buttons)
3. ErrorOverlay (3 error states)
4. NetworkBanner (online/offline indicator)
5. CelebrationOverlay (confetti + checkmark)
6. TopBar (ॐ symbol + language globe)
7. SahayataBar (help button + helpline)

**Requirements:**
- 3+ years React/TypeScript experience
- Strong understanding of accessibility (WCAG 2.1 AA)
- Experience with screen reader testing
- Framer Motion animation skills
- Available for 9 days (full-time equivalent)

**Deliverables:**
- 7 component files (TypeScript + TSX)
- All components accessibility-tested
- `COMPONENTS.md` documentation
- axe DevTools report (no violations)

**Budget:** ₹90,000 (fixed price)
**Timeline:** 9 days (April 1 - April 9, 2026)
**Payment:** 30% upfront, 40% midpoint, 30% on completion

**To Apply:**
Send:
1. Portfolio with accessible components you've built
2. GitHub profile
3. Experience with WCAG 2.1 AA compliance (examples)
4. Confirm availability for 9 days starting April 1

**Contact:** [Your Email/Slack]

---

### Job Post 5: Translation Specialist (Sarvam Mayura API)

**Title:** Translation API Integration Specialist (Sarvam Mayura, 14 Languages)

**Description:**
We need a translation specialist to integrate Sarvam Mayura API and build a runtime language switching pipeline for 14 Indian languages.

**Tech Stack:**
- Sarvam Mayura Translation API
- Next.js 14
- TypeScript
- LRU caching
- i18n best practices

**Tasks:**
1. Integrate Sarvam Mayura API (`/api/translate` route)
2. Build translation engine with caching
3. Implement runtime language switching
4. Create language validator (normalize codes, fallbacks)
5. Test with 14 Indian languages

**Languages:**
Hindi, Tamil, Telugu, Bengali, Marathi, Gujarati, Kannada, Malayalam, Punjabi, Odia, English, Bhojpuri, Maithili, Sanskrit, Assamese

**Requirements:**
- Experience with Sarvam Mayura API (or Google Translate API)
- Understanding of i18n best practices
- Familiarity with Indian languages (BCP-47 codes)
- Available for 5 days (full-time equivalent)

**Deliverables:**
- `sarvam-translate.ts` (translation engine)
- `language-switcher.ts` (runtime switching)
- `language-validator.ts` (code normalization)
- Integration test report (all 14 languages working)

**Budget:** ₹60,000 (fixed price)
**Timeline:** 5 days (April 1 - April 5, 2026)
**Payment:** 30% upfront, 40% midpoint, 30% on completion

**To Apply:**
Send:
1. GitHub profile
2. Experience with translation APIs (examples)
3. List of Indian languages you're familiar with
4. Confirm availability for 5 days starting April 1

**Contact:** [Your Email/Slack]

---

## 🎯 WHERE TO POST JOBS

### Indian Freelance Platforms (Recommended)
1. **Instahyre** (instahyre.com)
   - Best for: Backend Dev, UI Dev
   - Cost: Free to post
   - Response time: 2-3 days

2. **Cutshort** (cutshort.io)
   - Best for: All roles
   - Cost: Free to post
   - Response time: 1-2 days

3. **Hirist** (hirist.com)
   - Best for: Backend Dev, UI Dev
   - Cost: Free to post
   - Response time: 2-4 days

4. **LinkedIn Jobs (India)**
   - Best for: Voice Script Specialist (reach linguistics PhDs)
   - Cost: Free (1 job post/month)
   - Response time: 3-5 days

5. **AngelList India (Wellfound)**
   - Best for: All startup roles
   - Cost: Free
   - Response time: 2-3 days

### International Platforms
1. **Upwork**
   - Best for: Voice Script Specialist (global talent)
   - Cost: 10% freelancer fee
   - Response time: 1-2 days

2. **Toptal**
   - Best for: Backend Dev (top 3% talent)
   - Cost: Higher rates ($60-100/hr)
   - Response time: 3-5 days (screening required)

3. **Fiverr Pro**
   - Best for: Translation Specialist
   - Cost: 20% freelancer fee
   - Response time: 1-2 days

---

## ✅ SCREENING CHECKLIST

### Backend Developer Screening
**Questions to Ask:**
1. "Show me a Next.js API route you've built with rate limiting."
2. "Have you worked with Sarvam AI or Deepgram before? If yes, show example."
3. "How would you handle API key security in a Next.js app?"
4. "What's your approach to error handling and logging?"

**Red Flags:**
- ❌ No API route examples in portfolio
- ❌ Can't explain rate limiting implementation
- ❌ No experience with environment variables
- ❌ Vague answers about security

---

### Voice Script Specialist Screening
**Questions to Ask:**
1. "How many Indian languages do you speak/write fluently?"
2. "Have you written TTS scripts before? Share examples."
3. "What's the difference between writing for human voice vs AI TTS?"
4. "How would you handle pause durations and emotional tone?"

**Red Flags:**
- ❌ Claims fluency in 14 languages but can't write in native script
- ❌ No portfolio of voiceover/TTS scripts
- ❌ Doesn't understand TTS limitations (pauses, pacing)
- ❌ No understanding of Hindu priest cultural context

---

### UI/Animation Developer Screening
**Questions to Ask:**
1. "Show me 3 Framer Motion animations you've built."
2. "How do you ensure animations run at 60fps on mobile?"
3. "What's your approach to mobile-first responsive design?"
4. "How do you test accessibility (WCAG 2.1 AA)?"

**Red Flags:**
- ❌ Portfolio only has desktop examples
- ❌ Can't explain animation performance optimization
- ❌ No mobile-first projects
- ❌ Unfamiliar with accessibility testing tools

---

### Voice UI Component Developer Screening
**Questions to Ask:**
1. "Show me an accessible component you've built with screen reader support."
2. "How do you test for WCAG 2.1 AA compliance?"
3. "What tools do you use for accessibility auditing?"
4. "Explain how you'd implement a waveform animation."

**Red Flags:**
- ❌ No accessibility portfolio
- ❌ Can't name accessibility testing tools (axe, NVDA, JAWS)
- ❌ Unfamiliar with ARIA labels
- ❌ No animation experience

---

### Translation Specialist Screening
**Questions to Ask:**
1. "Have you integrated Sarvam Mayura API before? Show example."
2. "How do you handle language code normalization (e.g., 'bangla' → 'bn-IN')?"
3. "What's your approach to caching translated text?"
4. "How would you handle translation failures (fallback strategy)?"

**Red Flags:**
- ❌ No API integration experience
- ❌ Unfamiliar with BCP-47 language codes
- ❌ No caching strategy
- ❌ Can't explain fallback mechanisms

---

## 💼 INTERVIEW PROCESS

### Round 1: Initial Screening (30 min)
**Goal:** Verify skills and availability

**Agenda:**
1. Candidate introduces themselves (5 min)
2. Review portfolio/GitHub (10 min)
3. Technical questions (10 min)
4. Discuss timeline, budget, payment terms (5 min)

**Decision:** Pass to Round 2 or Reject

---

### Round 2: Technical Test (Take-home, 2-4 hours)
**Goal:** Assess actual coding ability

**Backend Developer Test:**
```
Create a simple `/api/echo` route that:
1. Accepts POST with JSON body
2. Validates input (text field required, max 100 chars)
3. Returns JSON with echoed text + timestamp
4. Adds rate limiting (10 requests/minute per IP)
5. Logs all requests to console

Submit: GitHub repo link + curl test commands
Time limit: 2 hours
```

**Voice Script Specialist Test:**
```
Write 5 voice scripts for S-0.0.2 Location Permission:
1. Hindi (on_screen_load)
2. Hindi (on_permission_denied)
3. Tamil (on_screen_load)
4. Telugu (on_screen_load)
5. English (on_screen_load)

Include: text, roman transliteration, English meaning, pause duration, speaker, pace
Time limit: 4 hours
```

**UI/Animation Developer Test:**
```
Create a simple animated card component:
1. Card with title, subtitle, icon
2. Fade-in animation on mount
3. Hover scale effect (1.05x)
4. Tap animation (0.97x scale)
5. Responsive (mobile + desktop)

Submit: GitHub repo link + deployed demo (Vercel/Netlify)
Time limit: 3 hours
```

**Voice UI Component Developer Test:**
```
Create a simple waveform animation component:
1. 5 bars with staggered animation
2. Bars animate height (8px → 24px → 12px → 32px → 16px)
3. Infinite loop
4. Accessible (aria-label: "Voice waveform")
5. Respects prefers-reduced-motion

Submit: GitHub repo link + deployed demo
Time limit: 3 hours
```

**Translation Specialist Test:**
```
Create a simple translation utility:
1. Function to normalize language codes ('bangla' → 'bn-IN', 'hindi' → 'hi-IN')
2. LRU cache (max 100 entries)
3. Fallback to 'hi-IN' for unknown codes
4. Write unit tests for 5 languages

Submit: GitHub repo link
Time limit: 2 hours
```

---

### Round 3: Final Interview (30 min)
**Goal:** Culture fit, communication, finalize offer

**Agenda:**
1. Review technical test together (15 min)
2. Discuss project requirements in detail (10 min)
3. Answer candidate questions (5 min)

**Decision:** Hire or Reject (within 24 hours)

---

## 📄 OFFER LETTER TEMPLATE

```
Subject: Offer for [Role] — HmarePanditJi

Dear [Candidate Name],

We are pleased to offer you the position of [Role] for HmarePanditJi, a voice-first mobile app for Hindu priests across India.

**Role:** [Role Name]
**Duration:** [X] days ([Start Date] - [End Date])
**Budget:** ₹[Amount] (fixed price)
**Payment Schedule:**
  - 30% upfront: ₹[Amount] (on [Date])
  - 40% midpoint: ₹[Amount] (on [Date], after Week 2 review)
  - 30% final: ₹[Amount] (on [Date], after production deployment)

**Deliverables:**
1. [Deliverable 1]
2. [Deliverable 2]
3. [Deliverable 3]

**Reporting:** You will report to [Your Name], Project Lead
**Communication:** Daily standup (10 AM IST, Slack), Weekly demo (Friday 3 PM IST, Zoom)
**Tools:** GitHub (code), Slack (communication), Zoom (meetings)

**Start Date:** [Date]
**Work Arrangement:** Remote (work from anywhere)

To accept this offer, please reply to this email by [Date]. We look forward to working with you!

Best regards,
[Your Name]
Project Lead, HmarePanditJi
[Your Email]
[Your Phone]
```

---

## 🚀 ONBOARDING CHECKLIST (Day 1)

### Before They Start
- [ ] Send offer letter + get acceptance
- [ ] Add to GitHub repo (invite as collaborator)
- [ ] Add to Slack channel (`#hmarepanditji-dev`)
- [ ] Schedule Day 1 kickoff call (Zoom)
- [ ] Prepare `.env.local` file with API keys (share securely via 1Password or similar)

### Day 1 Kickoff Call (30 min)
**Agenda:**
1. Team introductions (5 min)
2. Project overview (10 min)
3. Review their specific tasks + deliverables (10 min)
4. Q&A (5 min)

**Send After Call:**
- Task card (from `FREELANCER_TASK_CARDS.md`)
- Link to `TASK_BREAKDOWN_COMPLETE.md`
- Link to `PROJECT_MASTER_TRACKER.md`
- API keys (if needed for their role)

### Day 1 End-of-Day Check-in (15 min, Slack huddle)
**Questions:**
1. "Were you able to set up the development environment?"
2. "Do you have everything you need to start tomorrow?"
3. "Any blockers or questions?"

---

## 🎯 SUCCESS METRICS

### Week 1 Success Criteria
- [ ] All 5 freelancers hired and onboarded
- [ ] All 5 attended Day 1 kickoff
- [ ] Backend Dev: `/api/tts` route working
- [ ] Voice Script Specialist: 75 scripts complete (S-0.0.2)
- [ ] UI Dev: S-0.2 Income Hook screen complete
- [ ] Component Dev: VoiceOverlay component complete
- [ ] Translation Specialist: Sarvam Mayura integration working

### Week 2 Success Criteria
- [ ] All 405 Part 0.0 scripts complete
- [ ] All 11 tutorial screens complete
- [ ] All 7 voice components complete
- [ ] Translation pipeline working for 5 languages
- [ ] End-to-end flow: S-0.1 → S-0.12 working

### Week 3-4 Success Criteria
- [ ] All 2,250 scripts complete
- [ ] E2E tests passing (15 scenarios)
- [ ] Lighthouse score >90
- [ ] Accessibility audit passed (WCAG 2.1 AA)
- [ ] Production deployment successful

---

**Hiring Timeline:**
- **March 24-25:** Post jobs, screen candidates
- **March 26:** Interviews, technical tests
- **March 27:** Send offers, get acceptances
- **March 28:** Onboard all 5 freelancers
- **March 29:** Day 1 kickoff, work begins

**Good luck with hiring! 🚀**
