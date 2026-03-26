# Native Speaker QA Review Workflow

**Project:** HmarePanditJi - Voice Scripts
**Version:** 1.0
**Date:** March 26, 2026
**Author:** Voice Script Team

---

## 📋 Overview

This document outlines the QA review workflow for native speakers to validate voice scripts in their respective languages. The goal is to ensure all 1,845 scripts sound natural, culturally appropriate, and technically correct before TTS generation.

---

## 🎯 Review Objectives

### Primary Goals

1. **Natural Sound:** Scripts should sound conversational, not robotic or translated
2. **Cultural Appropriateness:** Respect for Hindu priest audience (age 45-70)
3. **Linguistic Accuracy:** Correct grammar, syntax, and vocabulary
4. **Emotional Tone:** Warm, respectful, and helpful throughout
5. **Technical Correctness:** Proper pronunciation guides and transliteration

---

## 👥 Native Speaker Roles

### Required Reviewers

| Priority | Languages | Reviewers Needed | Review Time |
|----------|-----------|-----------------|-------------|
| 1 | Hindi, Tamil, Telugu, Bengali, Marathi | 2 per language | 4 hours each |
| 2 | Gujarati, Kannada, Malayalam, Punjabi, Odia | 1 per language | 3 hours each |
| 3 | English, Bhojpuri, Maithili, Sanskrit, Assamese | 1 per language | 2 hours each |

### Reviewer Qualifications

**Required:**
- Native speaker of assigned language
- Fluent in Hindi or English (for cross-reference)
- Age 30+ (to understand target audience perspective)
- Available for 2-4 hour review session

**Preferred:**
- Experience in translation or content review
- Familiarity with Hindu religious/cultural context
- Understanding of voice/TTS systems
- Age 40+ (closer to target demographic)

---

## 📝 Review Process

### Step 1: Preparation (15 minutes)

**Reviewer receives:**
- Script files for their language (TypeScript format)
- English reference version
- Audio samples (if available)
- This review workflow document
- Access to feedback form

**Reviewer sets up:**
- Quiet environment for audio review
- Headphones for TTS playback
- Note-taking tool (provided template)

### Step 2: Script Review (60-90 minutes)

**For each screen (S-0.1 to S-0.12):**

1. **Read the English version** first to understand the intended meaning
2. **Read the translated version** in your language
3. **Evaluate each line** on the following criteria:

   - [ ] **Accuracy:** Does the translation convey the same meaning?
   - [ ] **Naturalness:** Does it sound like natural spoken language?
   - [ ] **Respect Level:** Is the formality appropriate for addressing Pandit Ji?
   - [ ] **Cultural Fit:** Are honorifics and religious terms correct?
   - [ ] **Length:** Is the sentence too long for 8-second audio?
   - [ ] **Flow:** Does it read smoothly when spoken aloud?

4. **Mark issues** using the issue tagging system (see below)

### Step 3: Audio Review (30-45 minutes)

**If TTS audio is available:**

1. **Listen to each script** at normal speed (1.0x)
2. **Listen again** at slower speed (0.75x) if needed
3. **Evaluate audio quality:**

   - [ ] **Pronunciation:** Are words pronounced correctly?
   - [ ] **Pacing:** Is the speed appropriate (not too fast/slow)?
   - [ ] **Intonation:** Does the voice rise/fall naturally?
   - [ ] **Pauses:** Are pauses in the right places?
   - [ ] **Emotional Tone:** Does it sound warm and respectful?

4. **Note any audio issues** for TTS team

### Step 4: Feedback Submission (15 minutes)

**Complete the feedback form:**

1. **Overall rating** for the language (1-5 stars)
2. **List of critical issues** that must be fixed
3. **List of suggestions** for improvement
4. **Sign-off decision** (Approve / Approve with Changes / Reject)

---

## 🏷️ Issue Tagging System

### Issue Severity

| Severity | Code | Description | Action Required |
|----------|------|-------------|-----------------|
| Critical | P0 | Wrong meaning, offensive content, grammatical error | Fix immediately |
| High | P1 | Unnatural phrasing, wrong honorific, awkward translation | Fix before TTS |
| Medium | P2 | Minor grammar issue, could be more natural | Fix if time permits |
| Low | P3 | Stylistic preference, optional improvement | Note for future |

### Issue Categories

| Category | Code | Examples |
|----------|------|----------|
| Translation | TRANS | Wrong meaning, missing words, added words |
| Grammar | GRAM | Incorrect verb form, wrong gender, case error |
| Tone | TONE | Too informal, too formal, wrong emotion |
| Cultural | CULT | Wrong honorific, inappropriate term, religious error |
| Technical | TECH | Too long, hard to pronounce, TTS issue |
| Pacing | PACE | Sentence too long for 8 seconds |

### Issue Tag Format

```
[SEVERITY]-[CATEGORY]-[SCREEN]-[LINE]

Examples:
P0-TRANS-S-0.1-3  (Critical translation error in S-0.1 line 3)
P1-TONE-S-0.2-1   (High priority tone issue in S-0.2 line 1)
P2-GRAM-S-0.3-4   (Medium grammar issue in S-0.3 line 4)
```

---

## 📊 Review Template

### Per-Screen Review Form

```markdown
## Screen: [S-0.X - Screen Name]
**Language:** [Language Name]
**Reviewer:** [Name]
**Date:** [Date]

### Overall Impression
- Naturalness: ⭐⭐⭐⭐⭐ (1-5)
- Accuracy: ⭐⭐⭐⭐⭐ (1-5)
- Cultural Fit: ⭐⭐⭐⭐⭐ (1-5)
- Audio Quality: ⭐⭐⭐⭐⭐ (1-5) [if applicable]

### Issues Found

| Line | Issue Tag | Description | Suggested Fix |
|------|-----------|-------------|---------------|
| 1 | | | |
| 2 | | | |
| 3 | | | |
| 4 | | | |
| 5 | | | |

### Comments
[Any additional feedback]

### Sign-off
- [ ] ✅ Approve (ready for production)
- [ ] 🔄 Approve with Changes (fix P1/P2 issues)
- [ ] ❌ Reject (needs major revision)
```

---

## 📱 Review Tools

### Required Tools

1. **Text Editor:** VS Code or any TypeScript-compatible editor
2. **Audio Player:** VLC or web-based player
3. **Spreadsheet:** Google Sheets or Excel for issue tracking
4. **Communication:** Slack for team coordination

### Optional Tools

1. **TTS Testing:** Access to Sarvam Bulbul v3 demo
2. **Recording Tool:** For recording alternative pronunciations
3. **Dictionary:** Language-specific dictionary for verification

---

## 🎓 Training Materials

### For New Reviewers

**Watch these videos:**
1. Introduction to HmarePanditJi (5 min)
2. Understanding the Target Audience (10 min)
3. Voice Script Best Practices (15 min)
4. Using the Review Tools (10 min)

**Read these documents:**
1. VOICE_SCRIPT_GUIDELINES.md
2. This workflow document
3. Sample reviewed scripts (provided)

**Practice session:**
- Review one sample screen with mentor
- Get feedback on your reviews
- Calibrate severity ratings

---

## 📅 Review Schedule

### Week 1 (March 28 - April 3, 2026)

| Date | Languages | Reviewers | Scripts |
|------|-----------|-----------|---------|
| Mar 28 | Hindi | 2 reviewers | S-0.1 to S-0.3 |
| Mar 29 | Tamil, Telugu | 4 reviewers | S-0.1 to S-0.3 |
| Mar 30 | Bengali, Marathi | 4 reviewers | S-0.1 to S-0.3 |
| Mar 31 | Hindi | 2 reviewers | S-0.4 to S-0.6 |
| Apr 1 | Tamil, Telugu | 4 reviewers | S-0.4 to S-0.6 |
| Apr 2 | Bengali, Marathi | 4 reviewers | S-0.4 to S-0.6 |
| Apr 3 | All Priority 1 | 10 reviewers | Review fixes |

### Week 2 (April 4 - April 10, 2026)

| Date | Languages | Reviewers | Scripts |
|------|-----------|-----------|---------|
| Apr 4 | Priority 2 (5 langs) | 5 reviewers | S-0.1 to S-0.6 |
| Apr 5 | Priority 2 (5 langs) | 5 reviewers | S-0.7 to S-0.12 |
| Apr 6 | Priority 3 (5 langs) | 5 reviewers | All screens |
| Apr 7-10 | All languages | All reviewers | Final sign-off |

---

## 💰 Compensation

### Reviewer Payment

| Priority | Payment per Language | Payment per Reviewer |
|----------|---------------------|---------------------|
| Priority 1 | ₹5,000 | ₹2,500 (2 reviewers) |
| Priority 2 | ₹3,000 | ₹3,000 (1 reviewer) |
| Priority 3 | ₹2,000 | ₹2,000 (1 reviewer) |

**Total Budget:** ₹42,000

### Payment Schedule

- 50% upfront upon assignment
- 50% upon completion and sign-off
- Bonus for early completion (within 2 days)

---

## 📞 Contact & Support

### Review Support Team

| Role | Name | Contact | Availability |
|------|------|---------|--------------|
| Review Coordinator | Pending | review@hmarepanditji.org | 9 AM - 6 PM IST |
| Technical Support | Pending | tech@hmarepanditji.org | 24/7 |
| Language Lead (Hindi) | Dr. Priya Sharma | priya@hmarepanditji.org | 10 AM - 4 PM IST |

### Communication Channels

- **Slack:** #voice-qa-review
- **Email:** voice-review@hmarepanditji.org
- **Emergency:** +91-XXX-XXX-XXXX (Review Coordinator)

---

## ✅ Quality Metrics

### Review Quality Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Review Completion | 100% | Scripts reviewed / Scripts assigned |
| Issue Detection Rate | >95% | Issues found / Total issues |
| Reviewer Agreement | >90% | Issues both reviewers agree on |
| Turnaround Time | <3 days | Assignment to completion |
| Sign-off Rate | >80% | Scripts approved on first pass |

### Reviewer Performance

| Metric | Excellent | Good | Needs Improvement |
|--------|-----------|------|-------------------|
| Accuracy | >95% | 85-95% | <85% |
| Speed | <2 days | 2-3 days | >3 days |
| Detail | >20 issues/screen | 10-20 issues/screen | <10 issues/screen |
| Communication | Proactive | Responsive | Delayed |

---

## 📄 Sign-off Checklist

### Before Approving a Language

- [ ] All 12 screens reviewed (S-0.1 to S-0.12)
- [ ] All 5 variants per screen reviewed
- [ ] All P0 and P1 issues fixed
- [ ] P2 issues documented for future
- [ ] Audio samples listened to (if available)
- [ ] Cultural sensitivity verified
- [ ] Religious terminology checked
- [ ] Emotional tone consistent
- [ ] Second reviewer approval obtained
- [ ] Final sign-off form submitted

---

## 📊 Progress Tracking

### Review Dashboard

| Language | Assigned | In Progress | Review Complete | Issues Found | Issues Fixed | Sign-off |
|----------|----------|-------------|-----------------|--------------|--------------|----------|
| Hindi | ✅ | ✅ | ⏳ | - | - | ❌ |
| Tamil | 🔴 | - | - | - | - | ❌ |
| Telugu | 🔴 | - | - | - | - | ❌ |
| Bengali | 🔴 | - | - | - | - | ❌ |
| Marathi | 🔴 | - | - | - | - | ❌ |

**Legend:**
- ✅ Complete
- 🔴 Not Started
- ⏳ In Progress
- ❌ Not Signed Off

---

**Document Version:** 1.0
**Last Updated:** March 26, 2026
**Next Review:** April 1, 2026
