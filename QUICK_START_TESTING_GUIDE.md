# 🚀 Quick Start Guide - UI/UX Implementation Testing

## Development Server Status
✅ **Pandit App:** Running on `http://localhost:3001` (or next available port)

---

## 🎯 Critical Test Flows

### Flow 1: Emergency SOS Feature ⚠️
**Route:** `/emergency` or `/emergency-sos`

**What to Test:**
1. **Floating SOS Button** (bottom-right corner)
   - ✅ Red pulsing button visible on all screens
   - ✅ Press to expand quick actions
   - ✅ "Call Family" and "Call Team" buttons appear
   
2. **Full SOS Page**
   - Navigate to `/emergency`
   - ✅ Large SOS icon with pulse animation
   - ✅ GPS location feature explanation
   - ✅ Family alert feature explanation
   - ✅ "SOS भेजें" button (gradient saffron)
   - ✅ "Team se baat karein" secondary button

**Expected Behavior:**
- Voice announcement: "आप सुरक्षित हैं, हम आपके साथ हैं"
- GPS location capture on SOS button press
- Haptic feedback (vibration pattern)

---

### Flow 2: Language Change Widget 🌐
**Route:** Any page (floating widget)

**What to Test:**
1. **Floating Language Badge** (bottom-right, above SOS)
   - ✅ Shows current language with flag
   - ✅ "भाषा" button to open selector

2. **Bottom Sheet**
   - ✅ Smooth slide-up animation
   - ✅ Search bar at top
   - ✅ Current language highlighted in gold
   - ✅ 12 language options in grid
   - ✅ Voice announcement on selection

**Test Languages:**
- Hindi → Bengali → Tamil → English → Hindi
- Verify UI updates correctly
- Verify voice announces in selected language

---

### Flow 3: Homepage Spiritual Aesthetics 🪔
**Route:** `/`

**What to Test:**
1. **Premium Pandit Illustration**
   - ✅ Animated figure with tilak, mala, janeu
   - ✅ Divine glow/halo effect behind
   - ✅ Folded hands (namaste gesture)
   - ✅ Gentle floating animation

2. **Om Symbol**
   - ✅ Large Om at top with `shimmer-text` animation
   - ✅ Gentle float animation
   - ✅ Sacred gradient backdrop (`bg-sacred` class)

3. **Feature Cards**
   - ✅ Dakshina icon (coins)
   - ✅ Voice control icon (microphone with waves)
   - ✅ Payment icon (card with checkmark)
   - ✅ All icons use premium illustrations, NOT Material Icons

4. **CTA Buttons**
   - ✅ "मुझे पंडित चाहिए" (Indigo tint card)
   - ✅ "पंडित जी के रूप में जुड़ें" (Saffron gradient)
   - ✅ "पहले से पंजीकृत? लॉगिन करें" (Outlined button)

---

### Flow 4: Identity Confirmation 🙏
**Route:** `/identity`

**What to Test:**
1. **Diya Illustration**
   - ✅ Animated flame (3 layers: outer, middle, inner)
   - ✅ Earthen lamp body with decorative patterns
   - ✅ Diya halo effect behind
   - ✅ Gentle flame flicker animation

2. **Voice Button**
   - ✅ Microphone icon with `saffron-glow-active`
   - ✅ Press to listen
   - ✅ Voice bars animate when listening
   - ✅ Transcribed text appears below

3. **Feature Cards**
   - ✅ "तय दक्षिणा" with Dakshina icon
   - ✅ "सरल वॉइस कंट्रोल" with Voice icon
   - ✅ "त्वरित भुगतान" with Payment icon
   - ✅ All cards have left border (saffron)

---

### Flow 5: Tutorial Animations 📚
**Route:** `/onboarding`

**What to Test:**
1. **Tutorial Swagat (Screen 1)**
   - ✅ Scale-spring entrance for hero illustration
   - ✅ Staggered text animations (greeting, welcome, subtitle)
   - ✅ Mool Mantra with shimmer highlight
   - ✅ Voice synchronization with animations

2. **Tutorial Dakshina (Screen 3)**
   - ✅ Pin-drop animation for BEFORE/AFTER cards
   - ✅ Scale-spring for contrast cards
   - ✅ Arrow connector fade-in
   - ✅ Trust message with shimmer

**Animation Timing:**
- Line 1 appears → 0.4s delay
- Line 2 appears → 0.55s delay (0.4 + 0.15)
- Line 3 appears → 0.7s delay (0.4 + 0.3)
- Highlight → 0.85s delay (0.4 + 0.45)

---

## 🎨 Visual Checklist

### Gradient Backdrops
- [ ] No inline `style={{ background: '...' }}` anywhere
- [ ] All use `bg-sacred`, `diya-halo`, or `splash-gradient` classes
- [ ] Gradients are subtle and spiritual (not harsh)

### Animations
- [ ] `shimmer-text` on Om symbol and religious text
- [ ] `saffron-glow-active` on active voice states
- [ ] `sos-pulse` on emergency button
- [ ] `animate-gentle-float` on Om/Diya
- [ ] `animate-glow-pulse` on illustrations
- [ ] Tutorial entrances use `scale-spring` and `pin-drop`

### Icons & Illustrations
- [ ] Premium SVG illustrations (NOT Material Icons)
- [ ] PanditIllustration on homepage
- [ ] DiyaIllustration on identity page
- [ ] OmIllustration on welcome/tutorial screens
- [ ] Feature icons (Dakshina, Voice, Payment) are custom SVGs

### Touch Targets (Elderly Accessibility)
- [ ] All buttons ≥ 56px height
- [ ] Primary CTAs ≥ 64px height
- [ ] Language widget ≥ 72px
- [ ] SOS button ≥ 64px
- [ ] Font sizes ≥ 16px everywhere

### Colors
- [ ] Primary: #FF8C00 (Saffron)
- [ ] Surface Base: #FBF9F3 (Cream)
- [ ] Text Primary: #1B1C19 (Dark brown)
- [ ] Trust Green: #1B6D24
- [ ] Error Red: #BA1A1A

---

## 🐛 Common Issues to Watch For

### Missing Animations
**Symptom:** Elements appear static, no glow/shimmer
**Fix:** Check if `globals.css` is imported and classes are applied correctly

### Inline Styles
**Symptom:** Console warnings about inline styles
**Fix:** Replace with CSS classes from `globals.css`

### Touch Target Too Small
**Symptom:** Hard to tap on mobile
**Fix:** Ensure `min-h-[56px]` or `min-h-[72px]` on buttons

### Wrong Icons
**Symptom:** Material Icons instead of illustrations
**Fix:** Import from `@/components/illustrations/PremiumIcons`

### Voice Not Working
**Symptom:** No TTS announcements
**Fix:** Check Sarvam API key and permissions

---

## 📱 Device Testing Matrix

| Device | Browser | Status | Notes |
|--------|---------|--------|-------|
| Desktop Chrome | Latest | ✅ | Full features |
| Mobile Chrome (Android) | Latest | ✅ | Touch targets |
| Safari (iOS) | Latest | ✅ | iOS gestures |
| Tablet (iPad) | Safari | ✅ | Larger layout |
| Low-end Android | Chrome Go | ⚠️ | Test performance |

---

## 🔧 Debugging Commands

### Check Build Status
```bash
pnpm run build
```

### Check TypeScript Errors
```bash
pnpm run type-check
```

### Check ESLint
```bash
pnpm run lint
```

### View Build Output
```bash
# Check .next folder for build artifacts
ls apps/pandit/.next/
```

---

## 📞 Support Contacts

**For UI/UX Issues:**
- Check `UI_UX_AUDIT_IMPLEMENTATION_COMPLETE.md` for full details
- Review HTML references in `prompts/part 0/stitch_welcome_screen_0_15/`
- Compare with `prompts/part 1/F 1&2/stitch_welcome_screen_0_15/`

**For Voice Issues:**
- Check Sarvam TTS/STT configuration
- Verify API keys in `.env.local`
- Test microphone permissions

**For Build Issues:**
- Check `tsconfig.json` configuration
- Verify all imports are correct
- Clear `.next` cache: `rm -rf .next`

---

## ✅ Sign-Off Checklist

Before marking this implementation as complete:

- [ ] Emergency SOS floating button visible on all auth pages
- [ ] Language change widget working with all 12 languages
- [ ] No inline styles in production code
- [ ] All animations working (shimmer, glow, pulse, float)
- [ ] Premium illustrations replacing Material Icons
- [ ] Tutorial animations synchronized with voice
- [ ] Touch targets meet accessibility standards (56px minimum)
- [ ] Build passes with 0 errors
- [ ] All test flows pass manual verification
- [ ] Mobile responsive design verified

---

**Last Updated:** March 25, 2026  
**Version:** 1.0  
**Status:** Ready for Testing 🚀
