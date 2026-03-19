# HmarePanditJi — Pandit App
## COMPLETE STITCH UI PROMPT LIBRARY
## Part 0.0 (Language Selection) + Part 0 (Welcome Tutorial)
### Version 1.0 | Build-Ready | 22 Screens + 1 Widget + 3 Component Sheets

---

> **BEFORE YOU USE THESE PROMPTS**
>
> Read the MASTER DESIGN BRIEF below in full before running any prompt.
> It applies to EVERY screen in this document.
> Stitch must internalize the design language, emotional tone, and
> user persona before generating any single screen.
> Copy the Master Design Brief into every Stitch session as context.

---

# ═══════════════════════════════════════════════════════
# MASTER DESIGN BRIEF
# (Copy this into every Stitch session as system context)
# ═══════════════════════════════════════════════════════

```
APP NAME: HmarePanditJi — Pandit-Facing App
TAGLINE: "App Pandit ke liye hai, Pandit app ke liye nahi."
PLATFORM: Android + iOS native mobile app
SCREEN SIZE: 390 × 844pt (iPhone 14 / standard Android reference)
TARGET USER: Hindu priest (Pandit), male, age 45–70, low-to-medium tech literacy,
             reading glasses user, large thumbs, often in noisy temple environments.
             This person has NEVER used a platform like this.
EMOTIONAL GOAL: Every screen must make the user feel SAFE, RESPECTED, and CALM.
                Not excited. Not overwhelmed. Safe. Respected. Calm.

────────────────────────────────────────────────────────
DESIGN PERSONALITY: Sacred Warmth + Radical Clarity
────────────────────────────────────────────────────────
Think: A beautifully maintained mandir with good lighting.
Not a tech startup. Not a fintech app. Not an e-commerce app.
A spiritual, dignified, warm interface that happens to run on a phone.

The aesthetic reference is: early morning puja light. Diyas glowing.
Fresh marigold garlands. Sandalwood incense. Clean white marble.
Warm, not flashy. Sacred, not religious-kitsch.

────────────────────────────────────────────────────────
COLOR SYSTEM (USE EXACTLY THESE VALUES)
────────────────────────────────────────────────────────
Primary Saffron:      #F09942   ← All primary CTAs, highlights, icons
Primary Dark Saffron: #DC6803   ← Pressed states, critical CTAs
Primary Light Tint:   #FEF3C7   ← Card backgrounds, soft accent areas
Warm Off-White:       #FFFBF5   ← ALL screen backgrounds (never pure white)
Card White:           #FFFFFF   ← Individual cards only
Primary Text:         #2D1B00   ← All headlines and primary body text
Secondary Text:       #6B4F2A   ← Supporting body text, labels
Tertiary Text:        #9B7B52   ← Hints, placeholders, disabled states
Success Green:        #15803D   ← Money amounts, confirmations, verified badges
Success Light:        #DCFCE7   ← Success card backgrounds
Error Red:            #DC2626   ← Error states only
Warning Amber:        #B45309   ← Caution states
Divider:              #F0E6D3   ← Lines, separators, inactive borders

────────────────────────────────────────────────────────
BACKGROUND RULE (CRITICAL)
────────────────────────────────────────────────────────
NEVER use pure white (#FFFFFF) as a full screen background.
ALWAYS use #FFFBF5 (warm off-white, like aged parchment or cream paper).
This single decision makes the entire app feel warmer and less clinical.
It is the difference between a hospital and a home.

────────────────────────────────────────────────────────
TYPOGRAPHY SYSTEM
────────────────────────────────────────────────────────
Font Family: Hind (Google Fonts) — renders beautifully in Devanagari AND Latin
Fallback: Noto Sans Devanagari for regional script characters

Scale:
  Hero Impact:      40px / 700 weight / 1.2 line height
  Screen Title:     32px / 700 weight / 1.25 line height
  Section Heading:  26px / 700 weight / 1.3 line height
  Sub-heading:      22px / 600 weight / 1.3 line height
  Body Primary:     20px / 400 weight / 1.6 line height  ← AGING EYES MINIMUM
  Body Secondary:   18px / 400 weight / 1.5 line height
  Caption/Label:    16px / 400 weight / 1.4 line height
  Legal/Fine:       14px / 400 weight / 1.4 line height

NEVER go below 18px for any text a user needs to read and act on.

────────────────────────────────────────────────────────
TOUCH TARGET SYSTEM
────────────────────────────────────────────────────────
Primary CTA Button:     64px height, full-width, 16px horizontal margin
Secondary CTA Button:   56px height, full-width, 16px horizontal margin
Tertiary / Text link:   44px minimum hitbox, visually smaller text
Icon tap zones:         56×56px minimum (even if icon is 24px visual)
Language chips:         56px height minimum
Inline list items:      64px height
Progress dots:          44px hitbox per dot (visual: 10px dot)
Back arrow:             56×56px hitbox

Gap between adjacent interactive elements: MINIMUM 12px (prevents mis-taps)

────────────────────────────────────────────────────────
BUTTON DESIGN RULES
────────────────────────────────────────────────────────
Primary Button (#F09942):
  - Background: #F09942
  - Text: #FFFFFF, 22px, 700 weight
  - Border-radius: 12px
  - Height: 64px
  - Shadow: 0 4px 12px rgba(240,153,66,0.35)
  - Full-width with 16px margin each side
  - Icon (if present): left-aligned, 24px

Secondary Button (outlined):
  - Background: #FFFFFF
  - Border: 2px solid #F09942
  - Text: #F09942, 20px, 600 weight
  - Border-radius: 12px
  - Height: 56px

Ghost / Text Link:
  - No background, no border
  - Text: #9B7B52, 18px, 400 weight
  - Underline: none (unless it's inline in a paragraph)
  - Minimum 44px hitbox height

────────────────────────────────────────────────────────
CARD DESIGN RULES
────────────────────────────────────────────────────────
Standard Card:
  - Background: #FFFFFF
  - Border-radius: 16px
  - Shadow: 0 2px 16px rgba(0,0,0,0.08)
  - Padding: 20px

Accent Card (primary tint):
  - Background: #FEF3C7
  - Border: 1.5px solid #F09942
  - Border-radius: 16px
  - Padding: 20px

Success Card:
  - Background: #DCFCE7
  - Border-left: 4px solid #15803D
  - Border-radius: 12px
  - Padding: 16px 20px

Error/Warning Card:
  - Background: #FEE2E2
  - Border: 1px solid #DC2626
  - Border-radius: 12px
  - Padding: 16px 20px

────────────────────────────────────────────────────────
ILLUSTRATION STYLE (ALL SCREENS)
────────────────────────────────────────────────────────
Style: Flat vector illustration. Clean line art. Minimal detail.
Palette: Limited to 3-4 colors per illustration (warm saffron tones + cream + gold).
Faces: NON-SPECIFIC. No sharp facial features. Soft, impressionistic faces.
       Reason: Avoids caste/skin tone associations.
       A gentle oval with suggested eyes is sufficient.
Subject: Pandits shown with dignity — always seated or standing upright,
         never hunched, never subservient.
Cultural accuracy: Traditional dhoti + angavastram visible. Janeu (sacred thread).
                   No Western clothing on Pandit figures.
Technology: Phones shown as simple rectangles with rounded corners.
            No brand logos or OS-specific elements.
Background: Always minimal or abstract. No busy scenes.
            Warm ambient light effect (soft radial gradient behind main figure).

────────────────────────────────────────────────────────
DEVANAGARI TEXT RULES
────────────────────────────────────────────────────────
All primary labels in Hindi (Devanagari script).
English text used ONLY for:
  - Technical terms with no Hindi equivalent
  - Names of platforms/features that are branded (e.g., "WhatsApp", "IVR")
  - Numbers and currency (₹2,000 not "do hazaar" in display text)

Line max-width: Do not allow text lines longer than 24 characters.
Force line breaks on long Hindi compound words.
Letter-spacing: 0 (do not add tracking to Devanagari — breaks rendering).

────────────────────────────────────────────────────────
ICON SYSTEM
────────────────────────────────────────────────────────
Style: Rounded icons. Filled style (not outline). 
Size: 24px visual / 56×56px tap zone minimum.
Color: Context-dependent —
  Navigation/utility icons: #9B7B52 (tertiary text color)
  Feature icons: #F09942 (saffron)
  Success icons: #15803D
  Warning icons: #B45309
  Error icons: #DC2626

Sacred/Religious icons should feel hand-drawn, slightly organic —
not perfectly geometric. The OM symbol (ॐ) is always present
in the app logo combination. Render it as an SVG with
slight warmth rather than stark geometric precision.

────────────────────────────────────────────────────────
SPACING SYSTEM
────────────────────────────────────────────────────────
Base unit: 4px
Common spacings: 8, 12, 16, 20, 24, 32, 40, 48, 64px
Screen horizontal padding: 16px (both sides, always)
Section vertical gaps: 24px minimum between sections
Card inner padding: 20px

────────────────────────────────────────────────────────
PERSISTENT TOP BAR (ALL SCREENS)
────────────────────────────────────────────────────────
Height: 56px
Background: #FFFBF5 (same as screen — no visible bar background)
Left: OM symbol (ॐ, 20px, #F09942) + "HmarePanditJi" wordmark (18px, #2D1B00, 600 weight)
      Combined: left-aligned, vertically centered
Right: 🌐 globe icon (24px visual, 56×56px tap zone, #9B7B52)
       This icon is ALWAYS present. NEVER disabled. NEVER hidden.
Bottom: 1px divider line (#F0E6D3) — only if content scrolls behind it

────────────────────────────────────────────────────────
VOICE STATUS INDICATOR (BOTTOM PERSISTENT ELEMENT)
────────────────────────────────────────────────────────
Only shown when voice is actively listening.
Position: Fixed, bottom of screen, above primary CTA button.
Design: 3 animated vertical bars (#F09942), height varying 8→24→8→16→8px in loop.
        "सुन रहा हूँ..." in 16px #9B7B52 to the right of bars.
Background: None (transparent over screen content).
When NOT listening: Hidden completely (no space reserved).

────────────────────────────────────────────────────────
KEYBOARD TOGGLE (PERSISTENT)
────────────────────────────────────────────────────────
Position: Bottom-right corner, above voice indicator.
Visual: Small ⌨️ icon (20px) + "Keyboard" (14px, #9B7B52).
Tap zone: 56×44px minimum.
Behavior: Always visible on voice-active screens. Tapping opens keyboard.

────────────────────────────────────────────────────────
WHAT MAKES THIS APP FEEL CALM (THE INVISIBLE RULES)
────────────────────────────────────────────────────────
1. NO VISUAL CLUTTER: Maximum 3 visual elements demanding attention per screen.
2. NO BRIGHT RED EVER on primary flow screens (error red only for actual errors).
3. GENEROUS WHITE SPACE: More air than most apps. Sections breathe.
4. ONE HERO ELEMENT per screen: One thing draws the eye first. Everything else supports it.
5. GRADIENT SPARINGLY: Only on splash and background accents. Never on buttons.
6. BORDERS LIGHT: Dividers at #F0E6D3 — felt, not seen.
7. SHADOWS SUBTLE: 0 2px 16px rgba(0,0,0,0.06) — depth without drama.
8. NO DARK MODE for this app: Warm light is essential. Dark mode removed from scope.
9. PROGRESS ALWAYS VISIBLE: On tutorial screens, Pandit always knows where they are.
10. EXITS ALWAYS VISIBLE: Skip/Later buttons never hidden below fold.
```

---

# ═══════════════════════════════════════════════════════
# COMPONENT SHEET PROMPTS (Generate These First)
# ═══════════════════════════════════════════════════════

---

## COMPONENT SHEET 1: BUTTONS & INTERACTIVE ELEMENTS

```
STITCH PROMPT — COMPONENT SHEET 1

Generate a comprehensive UI component sheet for the HmarePanditJi Pandit App.
Background: #FFFBF5 (warm cream/off-white).

Show all of these components arranged cleanly on a single artboard,
labeled with their use case:

PRIMARY CTA BUTTON:
  Label: "हाँ, शुरू करें →"
  Background: #F09942 (warm saffron orange)
  Text: #FFFFFF, Hind font, 22px, bold
  Height: 64px, width: 358px (full mobile width with 16px margin each side)
  Border-radius: 12px
  Drop shadow: 0 4px 12px rgba(240,153,66,0.35)
  Show in 3 states: Default | Pressed (slightly darker #DC6803) | Loading (spinner)

SECONDARY BUTTON (outlined):
  Label: "बाद में करूँगा"
  Background: #FFFFFF
  Border: 2px solid #F09942
  Text: #F09942, 20px, 600 weight
  Height: 56px, same width as primary
  Border-radius: 12px

GHOST / TEXT LINK BUTTON:
  Label: "Skip करें →"
  No background, no border
  Text: #9B7B52, 18px, regular weight
  Underline: none
  Show with 44px hitbox area marked with dashed outline

DANGER SECONDARY (for reject/cancel scenarios):
  Label: "नहीं, फिर से चुनूँगा"
  Background: #FFFFFF
  Border: 2px solid #F0E6D3
  Text: #6B4F2A, 20px
  Height: 56px

SUCCESS STATE BUTTON:
  Label: "✅ बहुत अच्छा!"
  Background: #DCFCE7
  Text: #15803D, 20px, bold
  Border: 1.5px solid #15803D
  Height: 56px, border-radius: 12px
  Show a checkmark icon left-aligned

ICON + TEXT BUTTON (for phone/whatsapp):
  Two examples side by side:
  a) 📞 icon + "Call करें (Free)" — background: #F09942
  b) 💬 icon + "WhatsApp पर" — background: #25D366 (WhatsApp green)
  Both: 56px height, 600 weight, white text

VOICE STATUS INDICATOR COMPONENT:
  3 animated bars visual (show as static representation):
  Bars: #F09942, heights 8/24/16px, 4px wide, 4px gap, rounded caps
  Text right: "सुन रहा हूँ..." in 16px #9B7B52
  Background: transparent (shown over #FFFBF5 for visibility)
  Show 3 states: Listening | Processing (spinner) | Success (checkmark flash)

KEYBOARD TOGGLE COMPONENT:
  Small floating element, bottom-right
  ⌨️ icon (20px) + "Keyboard" (14px, #9B7B52)
  Touch zone: 56×44px with light #F0E6D3 background, 8px border-radius

PROGRESS DOTS COMPONENT:
  Show 12 dots in a row (centered)
  Completed dots: 10px filled circle, #F09942
  Current dot: 10px filled circle #F09942 + outer ring 14px #F09942 at 30% opacity
  Upcoming dots: 10px circle, stroke only, #F0E6D3
  Gap between dots: 8px
  Show at positions: 3 complete, 1 current, 8 upcoming

SKIP BUTTON (Tutorial):
  Position: top-right, below top bar
  Text: "Skip करें →" | 18px | #9B7B52 | regular weight
  No background, no border
  Shows as inline text element, NOT a button

Overall artboard: White background, components labeled in English for reference.
Spacing between components: 32px. Clean, documentation-style layout.
```

---

## COMPONENT SHEET 2: CARDS & INFORMATION CONTAINERS

```
STITCH PROMPT — COMPONENT SHEET 2

Generate a comprehensive card component sheet for HmarePanditJi.
Background: #FFFBF5. Label all components clearly.

STANDARD WHITE CARD:
  Background: #FFFFFF
  Border-radius: 16px
  Shadow: 0 2px 16px rgba(0,0,0,0.08)
  Padding: 20px all sides
  Example content: A Pandit's name ("पंडित रामेश्वर शर्मा"),
  4-star rating ("⭐ 4.9"), and 2 verified pooja badges.

ACCENT TINT CARD (Saffron):
  Background: #FEF3C7 (very light saffron yellow)
  Border: 1.5px solid #F09942
  Border-radius: 16px
  Padding: 20px
  Example content: 📹 icon at top-left (24px, #F09942),
  title "घर बैठे पूजा" (20px bold #2D1B00),
  body "Video call से पूजा कराएं।" (18px #6B4F2A),
  and an earnings chip "₹2,000–₹5,000 प्रति पूजा" (#15803D, 16px bold)

SUCCESS GREEN CARD:
  Background: #DCFCE7
  Left border: 4px solid #15803D (accent bar, full height)
  Border-radius: 12px
  Padding: 16px 20px
  Example: Showing payment breakdown:
  "आपकी दक्षिणा: ₹2,500" / "Platform (15%): −₹375" / "यात्रा भत्ता: +₹200" /
  Divider line / "आपको मिला: ₹2,325" in 22px bold #15803D

TESTIMONIAL CARD:
  Background: #FFFFFF
  Left border: 4px solid #F09942 (saffron left bar)
  Border-radius: 12px
  Shadow: subtle, 0 2px 8px rgba(0,0,0,0.06)
  Content: Small avatar circle (48px, saffron outline, illustrated face),
  Name "पंडित रामेश्वर शर्मा" (18px bold #2D1B00),
  City "वाराणसी, UP" (16px #9B7B52),
  Then two columns side by side:
    Left: "पहले:" label + "₹18,000" with strikethrough (20px, #9B7B52)
    Right: "अब:" label + "₹63,000" (24px bold #15803D)
  Bottom: "✓ HmarePanditJi Verified" in 14px #15803D with a small shield icon

BEFORE/AFTER COMPARISON CARDS (pair):
  Show two cards side-by-side or stacked:
  Card 1 (BEFORE — soft red):
    Background: #FEE2E2
    Border: 1px solid #DC2626
    Border-radius: 12px
    Label "पहले:" in 14px red
    Content: Customer bargaining scenario text, 😒 emoji
  Card 2 (AFTER — soft green):
    Background: #DCFCE7
    Border: 1px solid #15803D
    Border-radius: 12px
    Label "✅ अब:" in 14px green
    Content: Fixed dakshina amount "₹2,100 (पहले से तय)" in bold green

FAMILY INCLUSION CARD:
  Background: #FEF3C7
  Border-radius: 16px
  Padding: 20px
  Left icon: 👨‍👩‍👦 emoji (32px)
  Title: "बेटा या परिवार मदद कर सकते हैं" (20px bold #2D1B00)
  Subtitle: "पूजा आपको मिलेगी, पैसे आपके खाते में।" (16px #6B4F2A)

OUTCOME TABLE CARD:
  Background: #FFFFFF
  Border-radius: 16px
  Shadow: 0 2px 16px rgba(0,0,0,0.08)
  Two-column table inside:
  Header row: background #F0E6D3, text 14px bold #6B4F2A
  Left col: "मुख्य Pandit ने पूजा की"
  Right col: "मुख्य Pandit ने Cancel किया"
  Data row: background white
  Left: "₹2,000 (बिना कुछ किए!)" in bold #15803D
  Right: "Full Amount + ₹2,000" in bold #15803D
  Cell padding: 16px. Divider: 1px #F0E6D3 between rows and columns.

PAYMENT TIMELINE CARD:
  Background: #FFFFFF, border-radius: 16px, shadow subtle
  3 timeline rows, each with:
    Left: time label (16px #9B7B52)
    Center: vertical line with dot (●, 10px, saffron)
    Right: description (18px #2D1B00)
  Row 1: 3:30 PM | ● green | "पूजा समाप्त हुई"
  Row 2: 3:31 PM | ● orange (animated ring) | "Payment शुरू हुआ"
  Row 3: 3:32 PM | ● green filled | "₹2,325 आपके Bank में" (bold green, 22px)

All cards labeled with component name. 32px gap between cards.
Artboard background: #FFFBF5.
```

---

## COMPONENT SHEET 3: LANGUAGE GRID & CHIPS

```
STITCH PROMPT — COMPONENT SHEET 3

Generate a UI component sheet for language selection elements.
Background: #FFFBF5.

LANGUAGE GRID CELL (default state):
  Size: ~168px wide × 56px tall
  Background: #FFFFFF
  Border: 1px solid #F0E6D3
  Border-radius: 8px
  Content centered:
    Line 1: Native script name — "हिंदी" / "தமிழ்" / "বাংলা" (20px #2D1B00)
    Line 2: Latin transliteration — "Hindi" / "Tamil" / "Bengali" (14px #9B7B52)
  Show multiple cells filled with: हिंदी, भोजपुरी, Tamil தமிழ், Bengali বাংলা,
  Telugu తెలుగు, Marathi मराठी, Gujarati ગુજરાતી, Kannada ಕನ್ನಡ,
  Malayalam മലയാളം, Sanskrit संस्कृत, English, [+ More]

LANGUAGE GRID CELL (selected state):
  Same size and shape
  Background: #FEF3C7
  Border: 2px solid #F09942
  Line 1 text: #F09942 (saffron instead of dark brown)
  Orange checkmark ✓ icon at top-right corner (16px)

LANGUAGE GRID CELL (current/active state for widget):
  Background: #F09942
  All text: #FFFFFF
  ✓ checkmark: #FFFFFF

CITY CHIP:
  Height: 56px, auto-width (padding: 0 20px)
  Background: #FFFFFF
  Border: 1.5px solid #F09942
  Border-radius: 24px (pill shape)
  Text: 18px #F09942, Hind font
  Examples: "दिल्ली", "वाराणसी", "मुंबई", "पटना", "लखनऊ"

CITY CHIP (selected state):
  Background: #F09942
  Text: #FFFFFF
  Same dimensions

VOICE SEARCH BOX COMPONENT:
  Width: Full (minus 16px margins)
  Height: 80px
  Background: #FEF3C7
  Border: 2px solid #F09942
  Border-radius: 16px
  Padding: 16px 20px
  Content:
    Left: 🎤 microphone icon (28px, #F09942, appears to pulse gently — show static)
    Center stack:
      Line 1: "भाषा का नाम बोलें" (18px #2D1B00, bold)
      Line 2: "जैसे: 'वाराणसी' या 'हिंदी'" (16px #9B7B52)

TEXT SEARCH BAR:
  Height: 56px, full-width (minus margins)
  Background: #FFFFFF
  Border: 1.5px solid #F0E6D3
  Border-radius: 12px
  Left: 🔍 icon (20px, #9B7B52)
  Placeholder text: "शहर खोजें..." (18px, #9B7B52)
  On focus: border becomes 2px #F09942

All components on #FFFBF5 background. Label in English. 24px gaps.
```

---

# ═══════════════════════════════════════════════════════
# PART 0.0: LANGUAGE SELECTION SCREENS
# ═══════════════════════════════════════════════════════

---

## S-0.0.1: SPLASH SCREEN

```
STITCH PROMPT — S-0.0.1: SPLASH SCREEN

Design a mobile app splash screen for HmarePanditJi, a platform for Hindu priests.
Screen dimensions: 390×844pt. Status bar: light (white icons on dark background).

OVERALL AESTHETIC:
A full-screen gradient from rich warm saffron (#F09942) at the very top,
transitioning smoothly through a mid-tone warm amber (#F5C07A) in the center,
then fading into a very soft cream (#FFFBF5) at the bottom.
The gradient is vertical, smooth, no banding. Feels like sunrise.

CONTENT (all vertically centered, slightly above true center):

TOP AREA (empty space, 180px from top — breathing room):
Empty. Just gradient.

CENTER ELEMENT — OM SYMBOL:
A large, beautifully rendered OM (ॐ) symbol.
Size: 80×80px.
Style: The OM symbol is not a heavy geometric shape — it is a refined, slightly
calligraphic rendering, as if written with a confident brush stroke. Serene.
Color: Pure white (#FFFFFF) with a very subtle inner glow (no hard shadow).
The glyph feels alive — not printed, but written.

GAP: 28px below OM symbol.

APP WORDMARK:
"HmarePanditJi" in white (#FFFFFF).
Font: Hind, 28px, 600 weight (semi-bold).
Letter-spacing: 0.5px (very subtle).
Below it, immediately (8px gap):
"हमारे पंडित जी" in white at 90% opacity (#FFFFFFCC).
Font: Hind / Noto Sans Devanagari, 18px, 400 weight.

BOTTOM ELEMENT — LOADING INDICATOR:
Position: Fixed at bottom, 48px from screen bottom edge.
A thin horizontal progress bar.
Width: 120px (centered).
Height: 3px.
Background: white at 25% opacity.
Fill: white at 90% opacity.
Border-radius: 2px (fully rounded ends).
The bar fills left-to-right over 2.5 seconds (show at ~70% fill state).

NO OTHER ELEMENTS:
No buttons. No text. No navigation. No app icon.
Just the gradient, OM, wordmark, progress bar.
Absolute minimal, sacred opening.

MOOD REFERENCE:
Think: The moment before a pandit begins morning prayers.
Quiet. Anticipatory. Warm light touching clean white marble.
If this screen appeared on someone's phone, they would stop and look.
Not because it demands attention — because it earns it.

STATUS BAR: Hidden/transparent (immersive, full-bleed gradient).
HOME INDICATOR (bottom): White, at 40% opacity.
```

---

## S-0.0.2: LOCATION PERMISSION PRE-EDUCATION

```
STITCH PROMPT — S-0.0.2: LOCATION PERMISSION SCREEN

Design a mobile screen for HmarePanditJi app.
Screen: 390×844pt. Background: #FFFBF5 (warm off-white/parchment).

PURPOSE: This screen appears BEFORE the OS location permission dialog.
It explains WHY the app needs location — so the Pandit feels safe granting it.
The emotional target: "Oh, that makes sense. Of course I'll allow it."

TOP BAR:
Height: 56px. Background: #FFFBF5 (seamless with screen).
Left: ॐ symbol (20px, #F09942) + space + "HmarePanditJi" (18px, 600, #2D1B00). Vertically centered.
Right: 🌐 globe icon (24px, #9B7B52). Vertically centered. 16px from right edge.
Bottom of topbar: 1px line #F0E6D3.

ILLUSTRATION AREA (below topbar, 16px gap):
Width: 358px (full width minus 16px each side). Height: 160px.
Style: Flat vector illustration on a very light saffron background circle (#FEF3C7, circle 140px diameter, centered).
Content: A simplified flat map of India as an outline — clean, minimal, no state divisions.
Fill: Light warm beige (#FAF0E6) for land. No water fill.
On the map: A saffron (#F09942) location pin (standard teardrop pin shape, 32px tall) drops gently onto approximately where Delhi sits.
Around the pin: 3 concentric circles expanding outward (saffron, decreasing opacity: 60%, 30%, 10%) suggesting signal/detection.
The overall illustration feels friendly and clear, not technical.

SECTION TITLE (16px below illustration):
"आपका शहर जानना क्यों ज़रूरी है?"
Font: 26px, 700 weight, #2D1B00.
Alignment: Left (16px padding from left edge).

DIVIDER LINE: 1px #F0E6D3, 24px margin top/bottom.

3 BENEFIT ROWS (each row 72px tall, 16px horizontal padding):
Each row has: Left saffron checkmark icon (✅ or ✓ in saffron circle, 28px) + Right text stack.
Gap between icon and text: 16px.

Row 1:
  Icon: ✓ in saffron circle.
  Text Line 1: "आपकी भाषा खुद सेट हो जाएगी" (20px, 700, #2D1B00)
  Text Line 2: "टाइपिंग की ज़रूरत नहीं" (16px, 400, #9B7B52)

Row 2:
  Icon: ✓ in saffron circle.
  Text Line 1: "आपके शहर की पूजाएं मिलेंगी" (20px, 700, #2D1B00)
  Text Line 2: "दूर-दराज़ की नहीं" (16px, 400, #9B7B52)

Row 3:
  Icon: ✓ in saffron circle.
  Text Line 1: "ग्राहक आपको ढूंढ पाएंगे" (20px, 700, #2D1B00)
  Text Line 2: "नए ग्राहक, नई आमदनी" (16px, 400, #9B7B52)

DIVIDER: 1px #F0E6D3, 16px vertical margin.

PRIVACY ASSURANCE ROW (very important — reduces fear):
A small contained pill/tag.
Background: #DCFCE7 (very light green).
Border: 1px solid #15803D.
Border-radius: 8px.
Padding: 12px 16px.
Content: 🔒 lock icon (20px, #15803D) + "आपका पूरा पता कभी नहीं दिखेगा किसी को भी" (16px, #15803D, 600 weight).
Width: full (minus 16px margins).

BOTTOM CTA AREA (fixed, above home indicator):
Gap from last content: auto (content scrolls up, CTA stays at bottom).
Vertical stack with 8px gap:

PRIMARY BUTTON:
"✅ हाँ, मेरा शहर जानें"
Height: 64px. Background: #F09942. Text: #FFFFFF, 22px, bold.
Border-radius: 12px. Shadow: 0 4px 12px rgba(240,153,66,0.35).
Margin: 0 16px. Full available width.

GHOST LINK (below primary button, 16px gap):
"छोड़ें — हाथ से भरूँगा"
18px, #9B7B52, centered, no underline.
Minimum 44px height tap zone.

VOICE INDICATOR: Not shown (no voice active on this screen — OS dialog will appear next).
KEYBOARD TOGGLE: Not shown.

OVERALL FEELING: Safe. Transparent. Warm. The Pandit should feel:
"They're asking me because it helps me, not because they want my data."
```

---

## S-0.0.2B: MANUAL CITY ENTRY (FALLBACK)

```
STITCH PROMPT — S-0.0.2B: MANUAL CITY ENTRY

Design a mobile screen for HmarePanditJi. Background: #FFFBF5. Size: 390×844pt.

This screen appears when location permission is denied. Tone: warm, patient, zero frustration.
The message: "That's completely fine. Just tell me your city."

TOP BAR: As per Master Design Brief. Include ← back arrow (56×56px, left of logo area).

REASSURANCE TEXT (24px below top bar):
"कोई बात नहीं।" — 22px, 400 weight, #9B7B52, centered.
(This line is important — it sets a gentle, judgment-free tone immediately.)

MAIN TITLE (8px below reassurance):
"अपना शहर बताइए" — 32px, 700 weight, #2D1B00, centered.

DIVIDER: 24px space below title.

VOICE INPUT BOX (the primary input method):
Full width (minus 16px margins). Height: 88px.
Background: #FEF3C7 (light saffron tint).
Border: 2px solid #F09942.
Border-radius: 16px.
Padding: 16px 20px.
Content layout — two stacked text lines with mic icon to the left:
  Left: 🎤 microphone icon, 32px, #F09942, vertically centered (the icon is filled/solid, saffron orange — it looks active and warm, not cold/grey).
  Right text stack:
    "अपना शहर बोलें" (20px, 700, #2D1B00)
    "जैसे: 'वाराणसी' या 'दिल्ली'" (16px, 400, #9B7B52)
A very subtle pulsing ring animation around the mic (show static ring in 2 concentric circles, saffron, 40% and 20% opacity) suggests it is listening.

DIVIDER LABEL (16px below voice box):
"─── या नीचे से चुनें ───"
16px, #9B7B52, centered. Dashes on both sides are actual horizontal lines (#F0E6D3), 40px each side.

TEXT SEARCH BAR (below divider label, 8px gap):
Height: 56px. Full width (minus margins).
Background: #FFFFFF.
Border: 1.5px solid #F0E6D3.
Border-radius: 12px.
Left: 🔍 icon (20px, #9B7B52), 16px from left inner edge.
Placeholder: "अपना शहर लिखें..." (18px, #9B7B52).
On right edge: small ✕ clear button (only visible when text entered — show greyed out).

POPULAR CITIES SECTION (24px below search bar):
Label: "लोकप्रिय शहर" (16px, 600, #6B4F2A). Left-aligned.
8px below label: Horizontal scrolling row of city chips.
Show 8 chips visible + partial 9th suggesting scroll:
"दिल्ली", "वाराणसी", "पटना", "लखनऊ", "मुंबई", "जयपुर", "कोलकाता", "भोपाल"
Each chip:
  Height: 56px. Horizontal padding: 20px. Border-radius: 28px (pill).
  Background: #FFFFFF. Border: 1.5px solid #F09942. Text: 18px #F09942.
Gap between chips: 8px. Chips scroll horizontally.

Second row (8px below first):
"हरिद्वार", "उज्जैन", "चेन्नई", "हैदराबाद", "अहमदाबाद"...
Same chip style.

BOTTOM AREA:
Voice indicator (if voice listening): Show 3 animated saffron bars + "सुन रहा हूँ..."
Keyboard toggle: bottom-right corner.
No CTA button — the action is selecting a city (via voice, type, or chip).

OVERALL MOOD: Patient. Helpful. Like a kind person saying "Take your time,
just tell me what city you're from." Zero pressure. Zero judgment.
The saffron voice box is the visual hero — it invites speech.
```

---

## S-0.0.3: LANGUAGE AUTO-DETECTION CONFIRMATION

```
STITCH PROMPT — S-0.0.3: LANGUAGE CONFIRMATION SCREEN

Design a mobile screen for HmarePanditJi. Background: #FFFBF5. Size: 390×844pt.

PURPOSE: The app detected a language from the city. Now it asks Pandit to confirm.
One simple question. Two choices. Maximum clarity.
Emotional target: "Oh yes, that's my language." / "Oh, I want a different one."

TOP BAR: As per Master Design Brief. Include ← back arrow.

DETECTED CITY CHIP (16px below top bar):
A small rounded pill/tag. Background: #FEF3C7. Border: 1px solid #F09942.
Border-radius: 20px. Padding: 8px 16px. Auto-width (centered on screen).
Content: 📍 pin icon (16px, #F09942) + " वाराणसी, UP" (16px, #6B4F2A, 600 weight).
The entire chip is horizontally centered on screen.

MAIN LANGUAGE CARD (24px below city chip):
This is the HERO element of this screen. Everything else defers to it.
Width: 358px (full minus 16px margins).
Background: #FFFFFF.
Border-radius: 20px.
Shadow: 0 4px 24px rgba(0,0,0,0.10). (Slightly stronger shadow — this card matters.)
Padding: 32px 24px.
Content stacked and centered:

  LANGUAGE SCRIPT ICON:
  A large single character representing the language script.
  For Hindi: "अ" — displayed as 64px, #F09942, Hind font, bold.
  For Tamil: "த" in Tamil script, 64px, #F09942.
  (Show the Hindi "अ" example in this prompt.)
  This large character is the first thing the eye lands on.

  GAP: 16px.

  LANGUAGE NAME:
  "हिंदी" — 48px, 700 weight, #2D1B00, centered.
  (The language name is large enough to be read without glasses.)

  THIN DIVIDER: 1px #F0E6D3, width 80px, centered. 16px top/bottom margin.

  QUESTION TEXT:
  "क्या इस भाषा में बात करना चाहेंगे?"
  22px, 400 weight, #6B4F2A, centered.

END OF CARD.

VOICE INDICATOR (24px below card):
3 animated saffron bars (show as static) + "सुन रहा हूँ..." (16px #9B7B52).
Centered. Below this: "'हाँ' या 'बदलें' बोलें" in 14px #9B7B52.

BOTTOM CTA AREA (fixed bottom, above home indicator):
Gap from content: flexible.

PRIMARY BUTTON:
"हाँ, यही भाषा सही है"
Height: 64px. Background: #F09942. Text: #FFFFFF, 22px, bold.
Border-radius: 12px. Shadow: 0 4px 12px rgba(240,153,66,0.35).
Margin: 0 16px.

SECONDARY BUTTON (below primary, 12px gap):
"दूसरी भाषा चुनें"
Height: 56px. Background: #FFFFFF. Border: 2px solid #F09942.
Text: #F09942, 20px, 600 weight. Border-radius: 12px. Margin: 0 16px.

Keyboard toggle: bottom-right corner.

THE ENTIRE SCREEN SHOULD FEEL LIKE:
Opening a single important letter. The language card is the letter.
Everything else is the envelope and the desk around it.
One question. One hero element. Absolute clarity.
```

---

## S-0.0.4: LANGUAGE SELECTION LIST

```
STITCH PROMPT — S-0.0.4: LANGUAGE SELECTION LIST

Design a mobile screen for HmarePanditJi. Background: #FFFBF5. Size: 390×844pt.

This screen appears when the Pandit wants a different language.
It must be easy to scan — the Pandit needs to find their language in seconds.

TOP BAR: As per Master Design Brief. Include ← back arrow.

SCREEN TITLE (16px below top bar):
"अपनी भाषा चुनें" — 28px, 700 weight, #2D1B00. Left-aligned (16px padding).

DIVIDER: 1px #F0E6D3. 12px vertical margin.

VOICE SEARCH BOX (below divider):
Full width (minus 16px margins). Height: 80px.
Background: #FEF3C7. Border: 2px solid #F09942. Border-radius: 16px.
Padding: 16px 20px.
Left: 🎤 mic icon (28px, #F09942, with 2 concentric pulse rings suggesting active listening).
Right text: "भाषा का नाम बोलें" (18px, 700, #2D1B00) on first line.
"जैसे: 'Hindi', 'Tamil', 'Bengali'" (15px, #9B7B52) on second line.

DIVIDER LABEL (12px below voice box):
"─── या नीचे से चुनें ───" — 15px, #9B7B52, centered.

TEXT SEARCH BAR (8px below label):
Height: 52px. Full width (minus 16px margins).
Background: #FFFFFF. Border: 1.5px solid #F0E6D3. Border-radius: 12px.
Left: 🔍 (18px, #9B7B52). Placeholder: "भाषा खोजें..." (17px, #9B7B52).

LANGUAGE GRID (16px below search bar):
2-column grid. Each column: 50% screen width minus 16px left/right margin minus 8px gap.
So each cell: approximately (390 - 32 - 8) / 2 = 175px wide.
Rows of cells:

EACH CELL:
Height: 64px. Background: #FFFFFF. Border: 1px solid #F0E6D3.
Border-radius: 10px. Padding: 8px 12px.
Top line: Native script name — e.g., "हिंदी" (20px, 700, #2D1B00, centered).
Bottom line: Latin name — e.g., "Hindi" (13px, 400, #9B7B52, centered).
Cell shadow: very subtle, 0 1px 4px rgba(0,0,0,0.06).

SHOW THESE CELLS IN ORDER:
Row 1: हिंदी / Hindi | भोजपुरी / Bhojpuri
Row 2: मैथिली / Maithili | Bengali / বাংলা
Row 3: Tamil / தமிழ் | Telugu / తెలుగు
Row 4: Kannada / ಕನ್ನಡ | Malayalam / മലയാളം
Row 5: Marathi / मराठी | Gujarati / ગુજરાતી
Row 6: संस्कृत / Sanskrit | English / English
Row 7: Odia / ଓଡ଼ିଆ | [+ More / अधिक]

GAP between cells: 8px vertical, 8px horizontal.
Grid left+right margin: 16px.

SELECTED STATE (show one cell as selected — use Tamil as example):
Cell background: #FEF3C7. Border: 2px solid #F09942. Text color: #F09942 for native script.
Small ✓ checkmark in top-right corner of cell (16px circle, #F09942 background, white ✓).

[+ More / अधिक] CELL:
Same size as regular cells.
Background: #FFFBF5. Border: 1.5px dashed #9B7B52.
Text: "+ अधिक" (18px, #9B7B52, centered).

Bottom of screen: Keyboard toggle visible.
Screen is scrollable (grid may extend below visible area — show scroll indicator on right edge).

OVERALL MOOD: A library card catalogue. Clean, organized, scannable.
The language you're looking for should be findable in 3 seconds.
```

---

## S-0.0.5: LANGUAGE CHOICE CONFIRMATION

```
STITCH PROMPT — S-0.0.5: LANGUAGE CHOICE CONFIRMATION

Design a minimal, focused mobile screen for HmarePanditJi.
Background: #FFFBF5. Size: 390×844pt.

This screen has ONE purpose: confirm the Pandit chose the right language.
Design principle: Maximum signal, minimum noise.
The selected language name should fill the visual field.

TOP BAR: As per Master Design Brief. Include ← back arrow.

CENTER CONTENT (vertically centered in the usable area between top bar and CTA):

LANGUAGE NAME (HERO ELEMENT):
"भोजपुरी" (or whichever language was selected).
Font: 56px, 700 weight, #F09942 (saffron — the language is the brand on this screen).
Alignment: Center.
This text should feel LARGE and CONFIDENT. Almost poster-like.

NATIVE/SECONDARY SCRIPT (8px below language name):
If the language has a distinct native script from Devanagari:
Show it here — e.g., "Bhojpuri" in 24px, 400 weight, #9B7B52, centered.
If same script: just show Latin transliteration: "Bhojpuri", same style.

THIN DECORATIVE DIVIDER: 
A short horizontal line, 60px wide, centered, 1.5px, #F0E6D3. 24px margin above/below.

QUESTION:
"क्या यही भाषा सही है?" — 26px, 600 weight, #2D1B00, centered.

VOICE STATUS (16px below question):
3 small saffron bars animation (static representation) + 
"'हाँ' या 'नहीं' बोलें" (15px, #9B7B52, centered).

BOTTOM CTA AREA (fixed bottom):
PRIMARY BUTTON: "हाँ, यही भाषा चाहिए" — 64px, #F09942, white text, 22px bold.
SECONDARY BUTTON: "नहीं, फिर से चुनूँगा" — 56px, white bg, #F09942 border, 20px text.
Gap between buttons: 12px. Keyboard toggle: bottom-right.

THE DESIGN EMOTION:
Like a jeweler showing you one stone under good light.
"Is this the one?" Simple. Respectful of your choice. Not overwhelming.
The language name at 56px saffron is the entire visual statement.
Everything else is just supporting context.
```

---

## S-0.0.6: LANGUAGE SET — CELEBRATION

```
STITCH PROMPT — S-0.0.6: LANGUAGE CONFIRMED CELEBRATION

Design a mobile celebration screen for HmarePanditJi.
Background: #FFFBF5. Size: 390×844pt.

This screen lasts only 1.8 seconds. It needs to feel like a warm moment of success.
Not a big party — a quiet, satisfied smile.

NO TOP BAR: Full screen immersive celebration.
NO BUTTONS: Auto-advances. User does nothing.

BACKGROUND:
#FFFBF5 base. A very soft radial glow emanates from screen center:
Light saffron (#F09942 at 8% opacity) radiating outward from center.
The glow is subtle — felt, not seen. Like warm candlelight.

CENTER CONTENT (true screen center):

ANIMATED CHECKMARK:
Circle: 80px diameter. Stroke: 3px solid #15803D. Fill: transparent initially.
The circle draws itself (stroke-dasharray animation — show as complete circle).
Inside: ✓ checkmark, 36px, #15803D, centered.
The checkmark has a slight "draw" animation feel — show it fully rendered.
The entire checkmark element should feel light and gentle, not a harsh heavy tick.

CONFETTI ELEMENTS (scattered around checkmark):
~20 small shapes: circles (6px diameter), tiny rectangles (4×8px).
Colors: #F09942, #FCD34D (gold), #FFFFFF, #15803D.
Scattered in a 160px radius around the checkmark, at various angles.
Some slightly blurred (motion blur suggestion — showing they just fell).
They feel like flower petals falling — not aggressive party confetti.

GAP: 24px below checkmark.

SUCCESS TEXT:
"बहुत अच्छा!" — 40px, 700 weight, #2D1B00, centered.

GAP: 12px.

LANGUAGE CONFIRMATION:
"अब हम आपसे हिंदी में बात करेंगे।" — 22px, 400 weight, #6B4F2A, centered.
(Replace "हिंदी" with selected language.)

NO OTHER ELEMENTS. No buttons. No navigation. No icons except the checkmark.

OVERALL EMOTION:
Like receiving a blessing at the end of a small prayer.
Warm. Complete. Unrushed. This one-second moment makes the Pandit feel
that the app noticed their choice and celebrated it with them.
The saffron confetti feels auspicious, not commercial.
```

---

## S-0.0.7: SAHAYATA (HELP) SCREEN

```
STITCH PROMPT — S-0.0.7: SAHAYATA HELP SCREEN

Design a warm, reassuring help screen for HmarePanditJi.
Background: #FFFBF5. Size: 390×844pt.

This screen appears when a Pandit is stuck, confused, or asks for help.
The single most important emotional target: "You are not alone. We are here."
No judgment. No frustration. Just warm human support.

TOP BAR: As per Master Design Brief. NO back arrow (help is a dead-end — options only move forward).

ILLUSTRATION AREA (24px below top bar):
Width: 160px. Height: 160px. Centered.
A simple, warm illustration:
Two figures side-by-side — one (slightly older, in traditional attire, representing the Pandit)
and one (slightly younger, holding a phone, representing the support agent).
They face each other in a friendly way — not hierarchical, not service-worker style.
More like two friends talking.
Illustration palette: Saffron tones + cream + warm brown. Flat vector style.
No faces needed — just body postures and clothing suggest warmth.
Background of illustration: A soft circular saffron wash (#FEF3C7, 140px circle, center).

REASSURANCE HEADLINE (24px below illustration):
"कोई बात नहीं।" — 32px, 700 weight, #2D1B00, centered.
(This line alone is the emotional reset. "It's okay.")

SUBTEXT (8px below headline):
"हम मदद के लिए यहाँ हैं।" — 20px, 400 weight, #6B4F2A, centered.

DIVIDER: 1px #F0E6D3. 24px vertical margin.

HELP OPTION CARDS (stacked, 12px gap between):

CARD 1 — PHONE CALL (Primary, Saffron):
Width: 358px. Height: 72px. Background: #F09942. Border-radius: 16px.
Shadow: 0 4px 12px rgba(240,153,66,0.30).
Left: 📞 phone icon (28px, #FFFFFF) with 16px left padding.
Right text (16px from icon):
  Line 1: "हमारी Team से बात करें" (20px, 700, #FFFFFF)
  Line 2: "1800-HPJ-HELP | बिल्कुल Free" (15px, #FFFFFF at 85% opacity)

CARD 2 — WHATSAPP (Secondary, WhatsApp green):
Width: 358px. Height: 64px.
Background: #25D366 (WhatsApp green). Border-radius: 16px.
Left: WhatsApp icon (28px, #FFFFFF).
Right text:
  Line 1: "WhatsApp पर लिखें" (20px, 700, #FFFFFF)
  Line 2: "Message भेजें, जवाब आएगा" (15px, #FFFFFF at 85% opacity)

DIVIDER LABEL: "─── या ───" centered. 20px vertical margin.

TERTIARY LINK:
"वापस जाएं / खुद करें" — 18px, #6B4F2A, centered, underlined.
44px tap zone height.

BOTTOM NOTE:
"सुबह 8 बजे – रात 10 बजे" — 14px, #9B7B52, centered.

THE SCREEN MUST FEEL LIKE:
A warm reception desk at a trusted institution. Not a chatbot screen. Not a FAQ page.
Two real options: Phone call and WhatsApp. Both feel human. Both feel accessible.
The saffron of the phone call card matches the app's primary color —
this IS the brand promise: we are here for you.
```

---

## S-0.0.8: VOICE MICRO-TUTORIAL

```
STITCH PROMPT — S-0.0.8: VOICE MICRO-TUTORIAL SCREEN

Design an interactive tutorial screen for HmarePanditJi.
Background: #FFFBF5. Size: 390×844pt.

PURPOSE: First-time Pandits have never used voice input before.
This screen teaches them in 30 seconds by letting them try it.
Design target: The screen should feel like a gentle invitation, not a test.

TOP BAR: As per Master Design Brief. Top-right: "छोड़ें" in 18px #9B7B52 (skip this tutorial).

SECTION LABEL (16px below top bar):
"एक ज़रूरी बात" — 22px, 600 weight, #6B4F2A, centered.
(This phrasing is deliberate — "important note" not "tutorial" which sounds tedious.)

ILLUSTRATION (16px below label):
Width: 200px. Height: 160px. Centered.
Show a person (non-specific, gentle illustration) holding a phone near their mouth.
3–4 sound wave arcs emanate from the phone's mic area toward the screen.
The waves are saffron (#F09942), getting progressively lighter as they extend.
On the phone screen: a small microphone icon is visible (suggesting the app is listening).
Style: Clean flat vector, warm palette, no fine details. Feels friendly and encouraging.
Background: Centered on a very light cream circle (#FEF3C7, 180px diameter).

INSTRUCTION TEXT (20px below illustration):
"जब यह दिखे:" — 20px, 400, #6B4F2A, centered.

VOICE INDICATOR EXAMPLE (12px below, centered):
A small contained widget showing the voice indicator:
Background: #FEF3C7. Border: 1px solid #F09942. Border-radius: 10px. Padding: 12px 20px.
Content: 3 small saffron bars (static, varying heights) + "सुन रहा हूँ..." text (16px, #9B7B52).
Width: auto (centered, approximately 200px).

"तब बोलिए।" — 28px, 700, #2D1B00, centered. (Bold. The instruction is simple and clear.)

DIVIDER: 1px #F0E6D3. 20px vertical margin.

DEMO AREA — INTERACTIVE (the visual hero of this screen):
Width: 358px. Height: 100px. Centered.
Background: #FEF3C7. Border: 2px dashed #F09942. Border-radius: 20px.
Content:
  🎤 microphone icon — large, 44px, #F09942, centered.
  Surrounding the mic: 2 concentric circles, saffron at 30% and 15% opacity, 64px and 88px diameter.
  (These circles suggest the mic is live and listening.)
  Below mic: "हाँ या नहीं बोलकर देखें" (18px, #6B4F2A, centered).

SUCCESS FEEDBACK STATE (shown below demo box — show in "detected" state for visual):
A pill-shaped success tag:
Background: #DCFCE7. Border: 1px solid #15803D. Border-radius: 24px.
Padding: 12px 24px.
Content: ✅ icon + "शाबाश! बिल्कुल सही!" (20px, 700, #15803D).
Width: auto, centered.
(This appears after voice is detected — show as visible for the static mockup.)

BOTTOM CTA:
PRIMARY BUTTON: "समझ गया, आगे चलें →" — 64px, #F09942, white text, 22px bold.
Margin: 0 16px.

KEYBOARD TOGGLE: Bottom-right. Voice status: Below demo box.

MOOD: Like a patient teacher saying "Try it, it's easier than you think."
The demo box with its pulsing mic is the invitation.
The success message pre-shown gives visual confidence that it WILL work.
```

---

## S-0.0.W: LANGUAGE CHANGE WIDGET (BOTTOM SHEET)

```
STITCH PROMPT — S-0.0.W: LANGUAGE CHANGE BOTTOM SHEET

Design a bottom sheet overlay for HmarePanditJi (NOT a full screen — an overlay).
Show this widget rendered over a dimmed version of any tutorial screen.

BACKDROP: The screen behind is visible but dimmed — a dark overlay at 50% opacity.
The dimmed background screen shows blurred content suggesting a tutorial screen.

BOTTOM SHEET PANEL:
Background: #FFFFFF. Border-radius: 20px 20px 0 0 (top corners rounded only).
Shadow: 0 -4px 32px rgba(0,0,0,0.16).
Full screen width. Height: approximately 520px from bottom.
Slides up from bottom.

DRAG HANDLE (top center of sheet):
A small rounded rectangle. Width: 40px, Height: 4px. Background: #D1C4A8. Border-radius: 2px.
Centered. 12px margin from top of sheet.

SHEET TITLE (20px below drag handle):
Left-aligned (16px padding):
"भाषा बदलें" — 22px, 700, #2D1B00.
"Change Language" — 16px, 400, #9B7B52. (4px below title line.)

CURRENT LANGUAGE ROW (16px below title):
Full width container. Background: #FEF3C7. Border-radius: 10px. Padding: 14px 16px.
Left: "हिंदी" (20px, 700, #F09942).
Right: ✓ checkmark (20px, #F09942, bold). [This shows currently active language.]

SEARCH BAR (12px below current language):
Height: 48px. Background: #F5F0E8. Border-radius: 10px.
Left: 🔍 (17px, #9B7B52). Placeholder: "Search..." (16px, #9B7B52). No border.

LANGUAGE GRID (12px below search):
Same 2-column grid as S-0.0.4 but COMPACT (rows 52px tall instead of 64px).
Show: हिंदी | भोजपुरी | Bengali | Tamil | Telugu | Marathi | Gujarati | Kannada | Malayalam | + More
Each cell: compact (52px height), same style as S-0.0.4 cells.
Currently active (Hindi): Background #FEF3C7, border #F09942, text #F09942, ✓ in corner.

DISMISS BUTTON (16px below grid, above safe area):
"बंद करें / Close" — 56px, white bg, 1.5px solid #F0E6D3, border-radius 12px.
20px, #6B4F2A text. Margin: 0 16px.

The dimmed content behind the sheet shows a tutorial screen (blurred, dark overlay).
This makes clear: "The language widget is temporary — my screen is still there."

DESIGN EMOTION: A helpful interruption. Like a friend tapping you on the shoulder
in the middle of something to quickly help you fix one setting.
The sheet closes and you're exactly where you were.
```

---

# ═══════════════════════════════════════════════════════
# PART 0: WELCOME TUTORIAL SCREENS
# ═══════════════════════════════════════════════════════

---

## TUTORIAL PERSISTENT CHROME TEMPLATE
*(Apply to every tutorial screen S-0.1 through S-0.12)*

```
STITCH PROMPT — TUTORIAL SCREEN CHROME TEMPLATE (APPLY TO ALL TUTORIAL SCREENS)

Every tutorial screen in HmarePanditJi uses this persistent chrome.
When designing any tutorial screen, always include these elements:

TOP BAR:
Height: 56px. Background: #FFFBF5.
Left: ← back arrow (only on S-0.2 onwards — on S-0.1, no back arrow. Arrow: 24px, #9B7B52, 56px tap zone).
Center: ॐ (20px #F09942) + "HmarePanditJi" (18px 600 #2D1B00).
Right: 🌐 globe icon (24px #9B7B52, 56px tap zone).
Divider: 1px #F0E6D3 at bottom of bar.

PROGRESS DOTS (immediately below top bar, 12px gap):
12 dots in a horizontal row, centered.
Each dot:
  Completed: 10px filled circle, #F09942.
  Current: 10px filled circle #F09942 + outer ring 15px diameter, #F09942 at 25% opacity (glow effect).
  Upcoming: 10px circle, stroke 1.5px, #F0E6D3, no fill.
Gap between dots: 8px.
Show appropriate number of completed/current/upcoming for each screen.

SKIP LINK (right-aligned, same line as progress dots, or just below top bar):
For S-0.1–S-0.9: "Skip करें →" (18px, #9B7B52, right-aligned, 16px from right edge).
For S-0.10–S-0.12: "Registration पर जाएं" (16px, #9B7B52, right-aligned).
Minimum 44px tap zone height.

BOTTOM CTA AREA:
All tutorial primary CTAs use the orange primary button style.
Label varies per screen. Height always 64px.
Fixed at bottom, 16px from safe area bottom.
16px horizontal margin.

VOICE INDICATOR: Above CTA button when voice is active.
KEYBOARD TOGGLE: Bottom-right corner, above voice indicator.

HORIZONTAL NAVIGATION: Screens can be swiped left (advance) / right (back).
Show a very subtle swipe hint arrow (→) at screen edge on first tutorial screen.
```

---

## S-0.1: SWAGAT — IDENTITY SCREEN

```
STITCH PROMPT — S-0.1: SWAGAT WELCOME SCREEN

Design tutorial screen 1 of 12 for HmarePanditJi.
Background: #FFFBF5. Size: 390×844pt.
Progress dots: ●○○○○○○○○○○○ (1 of 12 active).
Skip: "Skip करें →" top-right.

EMOTIONAL BRIEF:
This screen must make the Pandit feel seen, respected, and welcomed.
NOT like a user signing up for a service. Like a guest arriving at a dharamshala.
The platform bows to the Pandit, not the other way around.

HERO ILLUSTRATION (56px below progress dots):
Width: 358px. Height: 240px. Centered.
Content: A seated Pandit figure in full traditional attire.
  - Dhoti: white/cream.
  - Angavastram (upper cloth): saffron (#F09942), draped over left shoulder.
  - Visible janeu (sacred thread) across chest.
  - Seated in a dignified half-cross-legged position on a low wooden aasan (seat).
  - Hands in a gentle mudra (blessing position) — not prayer, but giving.
  - Face: softly illustrated oval, no sharp features. Eyes gently open. Expression: calm dignity.
  - Behind figure: a very soft radial glow — warm amber (#F5C07A) at center, fading to transparent.
    This glow is like morning sunlight through temple windows.
  - NO background clutter. A hint of a floor pattern (simple geometric) is acceptable.
Style: Flat vector, warm and refined. Like illustration from a high-quality cultural magazine.
Palette: Saffron + cream + warm brown + white.

HEADLINE TEXT (24px below illustration):
"नमस्ते" — 40px, 700 weight, #2D1B00, centered.
(Single word. Large. Like a proper greeting.)

SUB-HEADLINE (8px below):
"पंडित जी।" — 40px, 700 weight, #F09942, centered.
(Their title, in saffron. The brand color bows to their title.)

BODY TEXT (16px below sub-headline):
"HmarePanditJi पर आपका स्वागत है।" — 22px, 400, #6B4F2A, centered.

THIN DIVIDER (20px vertical margin): 80px wide, centered, 1px #F0E6D3.

MOOL MANTRA (below divider):
In a slight italic style (showing it as a quote):
"App पंडित के लिए है," — 20px, 400, italic, #9B7B52, centered.
"पंडित App के लिए नहीं।" — 20px, 400, italic, #9B7B52, centered.
(Two lines, centered. Like a quietly powerful statement.)

BOTTOM CTA AREA:
PRIMARY BUTTON: "जानें (सिर्फ 2 मिनट) →"
Height: 64px. Background: #F09942. Text: white, 22px bold.
Border-radius: 12px. Margin: 0 16px. Shadow present.

GHOST TEXT LINK (12px below primary button):
"Registration पर सीधे जाएं" — 18px, #9B7B52, centered. Link style (subtle underline).

Voice indicator visible (3 saffron bars + "सुन रहा हूँ...").
Keyboard toggle: bottom-right.

THE SCREEN IN ONE WORD: "Aandar" (belonging). The Pandit should feel:
"This app was made for me." Before reading a word, the illustration says it.
```

---

## S-0.2: INCOME HOOK — THE ₹ MOMENT

```
STITCH PROMPT — S-0.2: INCOME HOOK — THE MOST IMPORTANT SCREEN

Design tutorial screen 2 of 12 for HmarePanditJi.
Background: #FFFBF5. Size: 390×844pt.
Progress dots: ●●○○○○○○○○○○. Skip: "Skip करें →" top-right.

THIS IS THE MOST IMPORTANT SCREEN IN THE ENTIRE APP.
If this screen fails, the rest of the tutorial is irrelevant.
The single goal: Show a specific, believable ₹ amount in the first visual.
Make the Pandit think: "That could be me."

SCREEN TITLE (16px below progress dots):
"आपकी कमाई कैसे बढ़ेगी?" — 26px, 700, #2D1B00. Left-aligned (16px padding).

TESTIMONIAL CARD (12px below title):
This card is the HERO element. It must command full attention.
Width: 358px. Background: #FFFFFF. Border-radius: 16px.
Left border: 5px solid #F09942 (saffron accent bar on left edge, full card height).
Shadow: 0 4px 20px rgba(0,0,0,0.10).
Padding: 20px 20px 20px 24px (extra left padding for the border).

  CARD HEADER ROW (flex, horizontal):
  Left: Circular avatar, 48px diameter.
    Fill: #FEF3C7. Border: 2px solid #F09942. 
    Inside: A simple illustrated Pandit face (very soft features, dhoti visible at collar, namaste tilak hint).
  Right of avatar (12px gap):
    "पंडित रामेश्वर शर्मा" — 18px, 700, #2D1B00.
    "वाराणसी, UP" — 15px, 400, #9B7B52. (8px below name.)

  DIVIDER: 1px #F0E6D3. 16px top/bottom margin within card.

  INCOME COMPARISON ROW (horizontal, side by side):
  LEFT COLUMN (50% width):
    "पहले:" — 14px, 400, #9B7B52. Left-aligned.
    "₹18,000" — 24px, 400, #B0A090, with a red/grey strikethrough line through the number.
    "/महीना" — 14px, #B0A090. (smaller, below or inline with the struck-through amount.)
    The whole "before" section feels faded, crossed out, left behind.

  RIGHT COLUMN (50% width):
    "अब:" — 14px, 600, #6B4F2A. Left-aligned.
    "₹63,000" — 32px, 700, #15803D. (Strong. Green. This is the reward.)
    "/महीना" — 16px, #15803D. Inline below.
    This column has more visual weight — number is larger, bolder, greener.

  VERIFIED BADGE ROW (12px below income comparison):
  A small inline tag:
    Background: #DCFCE7. Border: 1px solid #15803D. Border-radius: 20px.
    Padding: 6px 12px. Width: auto, left-aligned within card.
    Content: ✓ shield icon (14px, #15803D) + " HmarePanditJi Verified" (13px, #15803D, 600 weight).

END OF CARD.

SECTION SUBTITLE (20px below card):
"3 नए तरीकों से यह हुआ:" — 20px, 600, #6B4F2A. Left-aligned (16px padding).

4-TILE INCOME GRID (12px below subtitle):
2×2 grid. Full width (minus 16px margins). Gap: 10px.
Each tile: ~(358-10)/2 = 174px wide × 80px tall.
Background: #FFFFFF. Border: 1px solid #F0E6D3. Border-radius: 12px. Padding: 14px 16px.

TILE 1 (top-left): 🏠 icon (24px, #F09942) + "ऑफलाइन पूजाएं" (17px, 700, #2D1B00) + "(पहले से हैं आप)" (14px, #9B7B52).
TILE 2 (top-right): 📱 icon (24px, #F09942) + "ऑनलाइन पूजाएं" (17px, 700, #2D1B00) + "(नया मौका)" (14px, #9B7B52). Badge: Small "NEW" pill in top-right corner (#F09942 bg, 10px white text).
TILE 3 (bottom-left): 🎓 icon (24px, #F09942) + "सलाह सेवा" (17px, 700, #2D1B00) + "(प्रति मिनट)" (14px, #9B7B52). Small "NEW" badge.
TILE 4 (bottom-right): 🤝 icon (24px, #F09942) + "बैकअप पंडित" (17px, 700, #2D1B00) + "(बिना कुछ किए)" (14px, #9B7B52). Small "NEW" badge.

All tiles have the same white-card style. Tiles 2, 3, 4 get "NEW" badges since they're new concepts.
The tiles look tappable (suggest interactivity).

BOTTOM CTA:
PRIMARY BUTTON: "और देखें →" — 64px, #F09942, white, 22px bold.

KEY DESIGN PRINCIPLE FOR THIS SCREEN:
The ₹63,000 in bold green is the single visual hero of this screen.
Every other element should be less visually demanding than that number.
The Pandit's eye should go: Avatar → "Before ₹18K" → "Now ₹63,000" → GREEN.
That path converts skepticism into desire.
```

---

## S-0.3: FIXED DAKSHINA — THE BARGAINING KILLER

```
STITCH PROMPT — S-0.3: FIXED DAKSHINA SCREEN

Design tutorial screen 3 of 12 for HmarePanditJi.
Background: #FFFBF5. Size: 390×844pt.
Progress dots: ●●●○○○○○○○○○. Skip: top-right.

EMOTIONAL BRIEF:
Every Pandit has been bargained down. It happened last month. The humiliation is real.
This screen must feel like: "Finally, someone understands my pain. And they solved it."
Use emotion + contrast. Before (painful) → After (dignified).

HEADLINE (16px below progress dots):
"अब कोई मोलभाव नहीं।" — 34px, 700, #2D1B00. Centered.
Beneath it, 8px gap:
A small illustration: Two hands — one reaching with money, one flat palm-out (stop gesture).
Overlaid: A large red ✕ symbol (40px, #DC2626, bold, centered on the hands).
The illustration: 80px tall, centered. Flat, simple, immediately understood.
The ✕ is the most visually dominant element in this illustration.

DIVIDER: 24px vertical space.

BEFORE CARD (painful scenario):
Width: 358px. Margin: 0 16px.
Background: #FEE2E2 (very light red — pain tint).
Border: 1.5px solid #DC2626. Border-radius: 14px. Padding: 16px 20px.

Header: "❌ पहले:" — 16px, 600, #DC2626. Left-aligned.
First speech bubble (customer):
  Background: #FFFFFF. Border-radius: 12px 12px 12px 0 (left-bottom flat — coming from left).
  Padding: 10px 14px. Margin: 10px 0 6px 0. Shadow: light.
  Emoji: 😒 (18px) + " ग्राहक:" (16px, bold, #6B4F2A) — header line.
  Quote: "1,500 में हो जाएगा?" — 18px, 400, #2D1B00.
Second response (Pandit, sad):
  Right-aligned style (coming from right).
  Background: #F5E8E8. Border-radius: 12px 12px 0 12px.
  Padding: 10px 14px. Margin: 6px 0 0 40px.
  Emoji: 😔 (18px) + " आप:" (16px, bold, #6B4F2A).
  "(चुप रह गए...)" — 18px, italic, #9B7B52.

[Visual of the before card conveys: resignation, loss of dignity, quiet suffering.]

CONNECTOR (between cards): A downward arrow — ↓ (20px, #9B7B52, centered). 12px top/bottom.

AFTER CARD (dignified solution):
Width: 358px.
Background: #DCFCE7 (light green — resolution/peace tint).
Border: 1.5px solid #15803D. Border-radius: 14px. Padding: 16px 20px.

Header: "✅ अब:" — 16px, 600, #15803D. Left-aligned.
Price card inside (nested):
  Background: #FFFFFF. Border-radius: 10px. Padding: 14px 16px. Margin: 10px 0.
  Shadow: 0 2px 8px rgba(0,0,0,0.06).
  Row 1: "सत्यनारायण पूजा" — 18px, 600, #2D1B00.
  Divider: 1px #F0E6D3.
  Row 2: "आपकी दक्षिणा:" (16px, #9B7B52) + "₹2,100" (26px, 700, #15803D) + " (पहले से तय)" (15px, #9B7B52).
Below nested card:
"ग्राहक को Booking से पहले ही पता है।" — 16px, 400, #6B4F2A.
[Visual conveys: clarity, peace, dignity restored.]

REASSURANCE TEXT (20px below after-card):
"आप दक्षिणा खुद तय करते हैं।" — 20px, 600, #2D1B00, centered.
"Platform कभी नहीं बदलेगी।" — 18px, 400, #6B4F2A, centered.

BOTTOM CTA: "अगला फ़ायदा देखें →" — 64px, #F09942, white, 22px bold.

THE SCREEN'S VISUAL JOURNEY:
Eye enters at "मोलभाव नहीं" headline → Sees the ✕ on hands (message clear) →
Reads before-card (pain recognition) → Arrow down → Reads after-card (relief) →
Sees ₹2,100 in green (concrete solution) → CTA.
Pandit's shoulders drop with relief. They've been seen.
```

---

## S-0.4: ONLINE REVENUE — GHAR BAITHE + CONSULTANCY

```
STITCH PROMPT — S-0.4: ONLINE REVENUE STREAMS SCREEN

Design tutorial screen 4 of 12 for HmarePanditJi.
Background: #FFFBF5. Size: 390×844pt.
Progress dots: ●●●●○○○○○○○○. Skip top-right.

PURPOSE: Introduce two brand-new income concepts the Pandit doesn't know about.
The screen says: "There's money you don't know you can earn. Let us show you."

SCREEN TITLE (16px below progress dots):
"घर बैठे भी कमाई" — 30px, 700, #2D1B00. Left-aligned, 16px padding.
"(2 नए तरीके जो आप नहीं जानते)" — 17px, 400, italic, #9B7B52. Left-aligned, below title, 6px gap.

CARD 1 — GHAR BAITHE POOJA (18px below title area):
Full width (minus 16px margins). Background: #FEF3C7.
Border: 2px solid #F09942. Border-radius: 20px. Padding: 20px.

Header row (horizontal flex):
  Left: 📹 video camera icon — 32px, #F09942, on a small white circle background (48px diameter, light shadow).
  Right (12px gap):
    "घर बैठे पूजा" — 22px, 700, #2D1B00.
    "Video call से पूजा कराएं" — 16px, 400, #6B4F2A. (6px below title.)

Body text (12px below header):
"दुनिया भर के ग्राहक मिलेंगे — NRI भी।" — 18px, 400, #2D1B00.

Earnings chip (12px below body):
A pill tag: Background white, Border: 1.5px solid #15803D, Border-radius: 20px, Padding: 8px 16px.
Content: "₹2,000 – ₹5,000 प्रति पूजा" — 18px, 700, #15803D.

CARD 2 — PANDIT SE BAAT (16px below Card 1):
Full width. Background: #FFFFFF. Border: 1.5px solid #F0E6D3. Border-radius: 20px. Padding: 20px.
Shadow: 0 2px 12px rgba(0,0,0,0.07).

Header row:
  Left: 🎓 graduation/knowledge icon — 32px, #F09942, white circle background 48px.
  Right: "पंडित से बात" — 22px, 700, #2D1B00. Below: "Phone / Video / Chat पर सलाह दें" — 16px, #6B4F2A.

Body: "आपका ज्ञान अब बिकेगा।" — 18px, 400, #2D1B00.

Rate chip (12px below body):
"₹20 – ₹50 प्रति मिनट" — 17px, 700, #15803D, pill style (same as Card 1).

WORKED EXAMPLE (8px below rate chip — inside Card 2, slightly indented):
A small highlight box:
Background: #FEF3C7. Border-radius: 8px. Padding: 10px 14px.
Content: "उदाहरण: 20 मिनट = ₹800 आपको" — 17px, 700, #F09942.
A small calculator/math icon (16px) before "उदाहरण". 
[This line is the most important text on this screen — concrete example beats abstract rate.]

SUMMARY ROW (20px below Card 2):
A single centered text row with saffron background strip:
Background: #FEF3C7. Border-radius: 10px. Padding: 12px 20px. Full width (minus margins).
"दोनों मिलाकर ₹40,000+ अलग से हर महीने" — 18px, 600, #2D1B00, centered.

BOTTOM CTA: "अगला फ़ायदा देखें →" — 64px, #F09942, white, 22px bold.

VISUAL HIERARCHY:
₹2,000–₹5,000 (Card 1) + ₹20–₹50/min (Card 2) + "20 min = ₹800" (worked example).
The three numbers escalate the desire. Each one makes the next more believable.
```

---

## S-0.5: BACKUP PANDIT — FREE MONEY

```
STITCH PROMPT — S-0.5: BACKUP PANDIT SCREEN

Design tutorial screen 5 of 12 for HmarePanditJi.
Background: #FFFBF5. Size: 390×844pt.
Progress dots: ●●●●●○○○○○○○. Skip top-right.

DESIGN CHALLENGE: This concept sounds too good to be true.
The design must preemptively kill skepticism.
Structure: Claim → "Yes, really" → Proof (timeline + table) → Explanation of source.

HEADLINE AREA (16px below progress dots):
Line 1: "बिना कुछ किए" — 28px, 700, #2D1B00, centered.
Line 2: "₹2,000?" — 44px, 700, #15803D, centered. (Extra large. Bold green. The claim is the hero.)
Line 3: "हाँ। यह सच है।" — 18px, 600, #6B4F2A, centered. (Immediately addressing skepticism.)
[Three lines stacked. ₹2,000 is the visual focal point of the header.]

ANIMATED TIMELINE (20px below headline):
Width: 358px. Background: #FFFFFF. Border-radius: 16px. Shadow: subtle. Padding: 20px.

Show 3 steps with vertical connector:

STEP 1:
Left: Calendar icon in saffron circle (36px circle, 20px icon). 
Right: "कोई पूजा Book हुई" (18px, 700, #2D1B00).
Below: "(Backup Protection के साथ)" (15px, #9B7B52).
Connector below: Dashed vertical line, 20px long, #F0E6D3.

STEP 2:
Left: Smartphone/bell icon in saffron circle.
Right: "आपको Offer आया:" (18px, 700, #2D1B00).
Below: "'क्या आप Backup Pandit बनेंगे?'" (16px, italic, #6B4F2A). [Shown as a quoted notification.]
Connector below: Dashed vertical line.

STEP 3:
Left: Checkmark icon in green circle (#15803D, 36px circle).
Right: "आपने हाँ कहा।" (18px, 700, #2D1B00).
Below: "उस दिन Free रहे।" (16px, #9B7B52).

[The timeline is simple, clean, linear. Three beats. Easy to follow.]

END OF TIMELINE CARD.

2-COLUMN OUTCOME TABLE (16px below timeline card):
Title above table: "दोनों तरफ से फ़ायदा" — 20px, 600, #2D1B00, left-aligned (16px padding).

Table card:
Width: 358px. Background: #FFFFFF. Border-radius: 16px. Shadow: subtle. Padding: 0. Overflow: hidden.

HEADER ROW (background: #FEF3C7, padding: 14px 16px):
Left cell: "मुख्य Pandit ने पूजा की" — 15px, 600, #6B4F2A, centered.
Right cell: "मुख्य Pandit Cancel किया" — 15px, 600, #6B4F2A, centered.
Divider between cells: 1px vertical #F0E6D3.

DATA ROW (background: #FFFFFF, padding: 20px 16px):
Left cell:
  "₹2,000" — 28px, 700, #15803D, centered.
  "(बिना कुछ किए!)" — 14px, 600, #15803D, centered, below amount.
Right cell:
  "Full Amount" — 20px, 700, #15803D, centered.
  "+ ₹2,000 Bonus" — 16px, 700, #15803D, centered, below.
Divider between cells: 1px vertical #F0E6D3.

[Both columns are green. Both outcomes are wins. Pandit cannot find a downside.]

ACCORDION ELEMENT (16px below table):
A collapsible row (show in expanded state):
Background: #FFFBF5. Border: 1px solid #F0E6D3. Border-radius: 12px. Padding: 14px 16px.
Header: ▾ "यह पैसा कहाँ से आता है?" — 16px, 600, #6B4F2A. Tappable.
Expanded content (show as open):
"ग्राहक ने Booking के समय Backup Protection की extra payment की थी।
वही आपको मिलता है।" — 16px, 400, #6B4F2A. 10px below header.
[The accordion answers the skeptic's unspoken question before they ask it.]

BOTTOM CTA: "अगला फ़ायदा देखें →" — 64px, #F09942, white, 22px bold.
```

---

## S-0.6: INSTANT PAYMENT + TRANSPARENT EARNINGS

```
STITCH PROMPT — S-0.6: INSTANT PAYMENT SCREEN

Design tutorial screen 6 of 12 for HmarePanditJi.
Background: #FFFBF5. Size: 390×844pt.
Progress dots: ●●●●●●○○○○○○. Skip top-right.

EMOTIONAL BRIEF: Destroy the payment delay fear. Pandits often wait days.
Simultaneously, show full transparency of the platform's commission.
The radical honesty of showing the deduction proactively is the trust-building move.

HEADLINE (16px below progress dots):
"पूजा ख़त्म।" — 32px, 700, #2D1B00, centered.
"पैसे 2 मिनट में।" — 32px, 700, #F09942, centered. [Saffron on the key promise line.]
(Two lines. Punchy. Like a headline.)

TIMELINE CARD (20px below headline):
Width: 358px. Background: #FFFFFF. Border-radius: 16px. Shadow: 0 2px 16px rgba(0,0,0,0.08). Padding: 20px.

3 timeline rows, each with:
Left column (72px wide): Time label — 15px, 400, #9B7B52.
Center column (24px wide): Vertical timeline — a 2px line running through center. Dot at each step.
Right column: Description text.
Gap between rows: 16px.

ROW 1: 3:30 PM | ● (12px circle, #15803D fill) | "पूजा समाप्त हुई" (18px, 400, #2D1B00).
CONNECTOR: A 2px dashed vertical line in the center column between rows 1 and 2.
ROW 2: 3:31 PM | ◎ (12px circle, #F09942 fill, with outer ring at 30% opacity — "processing") |
  "Payment शुरू हुआ" (18px, 400, #2D1B00).
CONNECTOR: 2px dashed vertical line.
ROW 3: 3:32 PM | ● (14px circle, #15803D fill, slightly larger — success) |
  "✅ ₹2,325" (26px, 700, #15803D) + " आपके Bank में" (16px, 400, #2D1B00, below).

[The 3:30→3:31→3:32 progression tells the story visually: 2 minutes, done.]

PAYMENT BREAKDOWN CARD (16px below timeline card):
Width: 358px. Background: #DCFCE7. Border-left: 4px solid #15803D.
Border-radius: 12px. Padding: 16px 20px.

Title: "एक असली उदाहरण:" — 14px, 400, #9B7B52. Italic.
Divider: 1px #B3E6C3. 10px margin.

4 rows:
Row 1: "आपकी दक्षिणा:" left + "₹2,500" right. Both 18px #2D1B00.
Row 2: "Platform (15%):" left (16px, #9B7B52) + "−₹375" right (18px, #DC2626).
  [The minus sign and amount in a slightly muted red — honest, not alarming.]
Row 3: "यात्रा भत्ता:" left (16px, #9B7B52) + "+₹200" right (18px, #15803D).
Thin divider between row 3 and row 4: 1px #B3E6C3.
Row 4 (TOTAL): "आपको मिला:" left (18px, 700, #15803D) + "₹2,325" right (22px, 700, #15803D).
[The total row is bold green — the final number is the reward, not the deductions.]

REASSURANCE TEXT (16px below breakdown card):
"हर रुपये का हिसाब।" — 20px, 600, #2D1B00, centered.
"कोई छुपाई नहीं।" — 18px, 400, #6B4F2A, centered.
[This two-line statement is the trust signal. Shown below the honest deduction breakdown.]

BOTTOM CTA: "अगला फ़ायदा देखें →" — 64px, #F09942, white, 22px bold.
```

---

## S-0.7: VOICE NAVIGATION — INTERACTIVE DEMO

```
STITCH PROMPT — S-0.7: VOICE NAVIGATION DEMO SCREEN

Design tutorial screen 7 of 12 for HmarePanditJi.
Background: #FFFBF5. Size: 390×844pt.
Progress dots: ●●●●●●●○○○○○. Skip top-right.

THIS SCREEN IS INTERACTIVE: The Pandit actually tries voice on this screen.
Design must make the mic the hero — inviting, glowing, clearly active.
Success state should be visible (show the post-voice-detection state).

HEADLINE (16px below progress dots):
"टाइपिंग की ज़रूरत नहीं।" — 30px, 700, #2D1B00, centered.

ILLUSTRATION (12px below headline):
Width: 180px. Height: 140px. Centered.
Content: A phone outline (simple rounded rectangle, 80×120px).
On the phone screen: a small microphone icon (visible on screen).
From the bottom-left side of the phone (mic area): 4 curved sound wave arcs.
Arcs: saffron (#F09942) at 80%, 60%, 40%, 20% opacity, progressively larger.
The waves curve upward-left like actual sound waves.
An arrow from the wave tip points toward: Text floating in air that says "हाँ" (24px, #2D1B00, 700).
The concept: You say it → It appears.
Style: Flat, vector, minimal. Warm palette. No phone brand.
Background: Soft cream circle behind the illustration (#FEF3C7, 160px diameter).

INSTRUCTION TEXT (20px below illustration):
"जब यह दिखे:" — 20px, 400, #6B4F2A, centered.

MINI VOICE INDICATOR EXAMPLE (8px below instruction):
Small contained row, centered:
[3 small saffron bars] + "सुन रहा हूँ..." — wrapped in a light pill (#FEF3C7 bg, #F09942 border, border-radius 20px, padding 8px 16px).

"तब बोलिए।" — 28px, 700, #2D1B00, centered. (12px below the pill.)

DIVIDER: 1px #F0E6D3. 20px vertical margin.

DEMO INTERACTION BOX (the visual hero of this screen):
Width: 358px. Height: 104px. Background: #FEF3C7.
Border: 2.5px dashed #F09942 (dashed suggests: "this is interactive, try it").
Border-radius: 20px.
Content (centered, both axes):
  🎤 Microphone icon — 44px, #F09942. At center-top area.
  3 concentric circles around mic: #F09942 at 20%, 12%, 6% opacity. 64px, 88px, 112px diameter.
  (These pulse circles make the mic look "live" and listening — like a heartbeat.)
  Below mic (8px gap): "हाँ या नहीं बोलकर देखें" — 18px, #6B4F2A, centered.

SUCCESS FEEDBACK (shown 8px below demo box — show in "detected" state):
Pill shaped element, centered:
Background: #DCFCE7. Border: 1.5px solid #15803D. Border-radius: 24px. Padding: 12px 24px.
Content: ✅ (18px) + " शाबाश! बिल्कुल सही!" — 20px, 700, #15803D.
[Show this visible — it gives visual confidence that voice WILL work.]

FALLBACK NOTE (12px below success pill):
"अगर बोलने में दिक्कत हो:" — 16px, #9B7B52, centered.
"⌨️ Keyboard हमेशा नीचे है" — 16px, 600, #6B4F2A, centered.
[Never make Pandit feel trapped if voice doesn't work.]

BOTTOM CTA: "अगला फ़ायदा देखें →" — 64px, #F09942, white, 22px bold.

DESIGN KEY: The demo box must feel LIVE. The mic with its pulsing rings,
on a warm tinted background with dashed border — all communicate "this is active, try it."
The pre-shown success message removes the fear of trying.
```

---

## S-0.8: DUAL MODE — SMARTPHONE + KEYPAD

```
STITCH PROMPT — S-0.8: DUAL MODE SCREEN

Design tutorial screen 8 of 12 for HmarePanditJi.
Background: #FFFBF5. Size: 390×844pt.
Progress dots: ●●●●●●●●○○○○. Skip top-right.

EMOTIONAL BRIEF: "No matter what phone you have — you belong here."
This screen includes everyone. Tech-intimidated Pandits, keypad users, family-assisted users.
The family inclusion card is the most important element.

HEADLINE (16px below progress dots):
"कोई भी Phone," — 28px, 700, #2D1B00, centered.
"Platform चलेगा।" — 28px, 700, #F09942, centered.
(Two lines. The saffron "Platform chalega" is the promise. Full stop.)

COMPARISON AREA (20px below headline):
Two cards side by side. Each: ~(358-12)/2 = 173px wide. Height: 180px.
Margin: 0 16px. Gap: 12px.

LEFT CARD (Smartphone):
Background: #FFFFFF. Border: 2px solid #F09942 (saffron — primary, featured).
Border-radius: 16px. Padding: 16px. Shadow: 0 4px 12px rgba(240,153,66,0.15).
Top: 📱 smartphone icon (36px, #F09942, centered).
Title: "Smartphone" — 17px, 700, #2D1B00, centered. (10px below icon.)
Divider: 1px #F0E6D3.
Feature list (left-aligned, each row 28px):
  ✓ Video Call (16px, #6B4F2A)
  ✓ Chat (16px, #6B4F2A)
  ✓ Voice Alerts (16px, #6B4F2A)
  ✓ Maps (16px, #6B4F2A)
Each ✓ in #F09942.

RIGHT CARD (Keypad Phone):
Background: #FFFBF5. Border: 1.5px solid #F0E6D3 (subtler — secondary).
Border-radius: 16px. Padding: 16px. Shadow: very light.
Top: 📟 keypad/feature phone icon (36px, #9B7B52, centered).
Title: "Keypad Phone" — 17px, 700, #6B4F2A, centered.
Divider: 1px #F0E6D3.
Feature list:
  ✓ Call आएगी (16px, #6B4F2A)
  ✓ 1 = हाँ (16px, #6B4F2A)
  ✓ 2 = ना (16px, #6B4F2A)
  ✓ बस! (16px, #9B7B52, italic — "that's all you need")
Each ✓ in #9B7B52.

[Smartphone card slightly more featured (saffron border). Keypad card simplified but included.]

FAMILY INCLUSION CARD (20px below comparison cards):
Width: 358px. Margin: 0 16px.
Background: #FEF3C7. Border: 1.5px solid #F09942. Border-radius: 16px. Padding: 20px.

Content horizontal layout:
Left: 👨‍👩‍👦 emoji — 36px. Vertically centered.
Right (12px gap from emoji):
  "बेटा या परिवार Registration में" — 20px, 700, #2D1B00.
  "मदद कर सकते हैं।" — 20px, 700, #2D1B00. (Continuation of above.)
  Gap: 8px.
  "पूजा आपको मिलेगी, पैसे आपके खाते में।" — 16px, 400, #6B4F2A.

[This card has a warm, inviting feel. The family emoji makes it human.
The text legitimizes that registering with family help is normal and fine.]

BOTTOM CTA: "अगला फ़ायदा देखें →" — 64px, #F09942, white, 22px bold.

KEY DESIGN NOTE:
The family card is equally sized and visually prominent as the two phone comparison cards combined.
It should not feel like an afterthought. It is a core message:
"You are not alone. Bring your son. Bring your granddaughter. We welcome all of you."
```

---

## S-0.9: TRAVEL ITINERARY + CALENDAR

```
STITCH PROMPT — S-0.9: TRAVEL AND CALENDAR SCREEN

Design tutorial screen 9 of 12 for HmarePanditJi.
Background: #FFFBF5. Size: 390×844pt.
Progress dots: ●●●●●●●●●○○○. Skip top-right.

PURPOSE: Show that all logistics are handled automatically. Pandit just shows up.
Design should feel: "You only have to do the sacred work. We handle the rest."

HEADLINE (16px below progress dots):
"Travel की Tension नहीं।" — 26px, 700, #2D1B00, left-aligned, 16px padding.
"Double Booking नहीं।" — 26px, 700, #2D1B00, left-aligned.
(Two lines, left-aligned. Strong, factual statements.)

TRAVEL CARD (16px below headline):
Width: 358px. Background: #FEF3C7. Border: 1.5px solid #F09942. Border-radius: 20px. Padding: 20px.

Header row: 🚂 icon (28px, #F09942) + "Booking Confirm हुई" (20px, 700, #2D1B00).
A small downward arrow ↓ (20px, #F09942, centered). 8px margins.

"Platform automatically बनाएगा:" — 18px, 600, #6B4F2A.

Feature list (12px below, each row 36px):
  ✓ Train / Bus / Car का समय और टिकट (17px, #2D1B00)
  ✓ ज़रूरत हो तो Hotel की Booking (17px, #2D1B00)
  ✓ खाने का भत्ता (₹1,000/दिन) (17px, #2D1B00)
  ✓ ग्राहक को GPS Updates (17px, #2D1B00)
Each ✓: 16px, #F09942.

[This card wraps the travel benefit cleanly. The saffron tint matches the primary feature feel.]

CALENDAR CARD (16px below travel card):
Width: 358px. Background: #FFFFFF. Border: 1.5px dashed #F0E6D3. Border-radius: 20px. Padding: 20px.

Header row: 📅 icon (28px, #9B7B52) + "Blackout Dates" (20px, 700, #2D1B00).

MINI CALENDAR VISUAL (12px below header):
A small calendar grid: 5 columns × 4 rows of date cells. Width: ~260px. Centered.
Cell size: 36×32px each.
Header row: Mon Tue Wed Thu Fri (13px #9B7B52, centered per column).
Date cells:
  Normal dates: 15px #2D1B00, no background.
  BLOCKED dates (3-4 cells scattered): Red ✕ overlaid, background: #FEE2E2, border-radius: 4px.
    Example blocked: 15th, 16th, 22nd.
  Today: Light saffron circle background, 18px bold #F09942.
Style: Very simplified. Not a full calendar — just suggests the concept.
The blocked cells with red ✕ are immediately understood.

Below calendar: "जिन दिनों आप Available नहीं —" (17px, #6B4F2A).
"एक बार Set करो।" (17px, 600, #2D1B00).
"Double Booking हो ही नहीं सकती।" (17px, #6B4F2A, italic).

BOTTOM CTA: "अगला फ़ायदा देखें →" — 64px, #F09942, white, 22px bold.
```

---

## S-0.10: VIDEO VERIFICATION — BADGE IS THE BENEFIT

```
STITCH PROMPT — S-0.10: VIDEO VERIFICATION SCREEN

Design tutorial screen 10 of 12 for HmarePanditJi.
Background: #FFFBF5. Size: 390×844pt.
Progress dots: ●●●●●●●●●●○○. Skip: "Registration पर जाएं" top-right.

DESIGN CHALLENGE: This is the hardest sell. Reframe verification from burden to revenue generator.
Design principle: Lead with the reward (3x bookings), not the requirement (2 minute video).

HEADLINE (16px below progress dots):
"✅ Verified का मतलब" — 26px, 700, #2D1B00, centered.
"ज़्यादा Bookings" — 26px, 700, #F09942, centered.
(Saffron on "ज़्यादा Bookings" — that's the reward.)

PROFILE PREVIEW CARD (16px below headline):
What the Pandit's profile looks like to customers after verification.
Width: 358px. Background: #FFFFFF. Border-radius: 20px.
Shadow: 0 4px 24px rgba(0,0,0,0.10). Padding: 20px.

CARD HEADER (simulated profile header):
  Profile photo placeholder: 56px circle. Background: #FEF3C7. Border: 2.5px solid #F09942.
  Inside: illustrated Pandit avatar (same soft-features style).
  Right of photo (12px gap):
    "[आपका नाम]" — 20px, 700, #2D1B00. (Placeholder — personalized.)
    "⭐ 4.9 | 234 Reviews" — 15px, 400, #9B7B52. (6px below name.)
  
  Right edge of header: A prominent "VERIFIED" badge:
    Background: #15803D. Border-radius: 6px. Padding: 5px 10px.
    "✓ VERIFIED" — 13px, 700, #FFFFFF. Small shield icon left.

DIVIDER: 1px #F0E6D3. 12px margin.

"Verified पूजाएं:" — 16px, 600, #6B4F2A.

VERIFIED POOJA BADGE LIST (8px below label):
4 badges in a 2-column wrap or single column.
Each badge: Background: #FEF3C7. Border: 1.5px solid #F09942. Border-radius: 20px.
Padding: 8px 14px. Height: 36px.
Content: 🟠 dot (10px, #F09942) + " [Pooja Name]" (16px, #2D1B00) + " ✓" (14px, #F09942).
Examples: "सत्यनारायण कथा ✓", "विवाह संस्कार ✓", "गृह प्रवेश ✓", "श्राद्ध कर्म ✓".
Wrap into 2 columns. Gap: 8px.

[This card shows the Pandit exactly what their profile will look like — makes it tangible.]

3X STATS BANNER (16px below profile card):
Width: 358px. Background: #F09942. Border-radius: 14px. Padding: 16px 20px.
Content (centered):
  "Verified Pandits को" — 16px, 400, #FFFFFF at 90% opacity.
  "3x" — 48px, 700, #FFFFFF. (VERY large — this is the key statistic.)
  "ज़्यादा Bookings मिलती हैं" — 16px, 400, #FFFFFF at 90% opacity.
  "Unverified से" — 14px, 400, #FFFFFF at 70% opacity.

[The saffron banner with white 3x is visually arresting. It screams the value proposition.]

REASSURANCE ROW (16px below stats banner):
Two lines of text, centered:
"सिर्फ 2 मिनट का Video — एक बार।" — 18px, 600, #2D1B00.
"Video सिर्फ Admin देखेगा। Public नहीं होगी।" — 16px, 400, #9B7B52, italic.

BOTTOM CTA: "आगे देखें → (लगभग हो गया!)" — 64px, #F09942, white, 22px bold.
The "लगभग हो गया!" sub-text (within the button at 16px) provides encouragement.
```

---

## S-0.11: 4 GUARANTEES — SUMMARY

```
STITCH PROMPT — S-0.11: 4 GUARANTEES SUMMARY SCREEN

Design tutorial screen 11 of 12 for HmarePanditJi.
Background: #FFFBF5. Size: 390×844pt.
Progress dots: ●●●●●●●●●●●○. Skip: "Registration पर जाएं" top-right.

PURPOSE: Wrap everything into 4 memorable categories.
This is the closing argument before the decision. Make it stick.

SCREEN TITLE (16px below progress dots):
"HmarePanditJi की" — 22px, 400, #9B7B52, centered.
"4 गारंटी" — 36px, 700, #2D1B00, centered. (Larger, bold — the "4" is visually prominent.)

FOUR GUARANTEE CARDS (stacked, 12px gap between each):

Each card: Width: 358px. Height: 80px. Background: #FFFFFF.
Left border: 4px solid #F09942 (saffron accent bar — this is the design signature).
Border-radius: 14px. Padding: 0 20px 0 20px.
Shadow: 0 2px 8px rgba(0,0,0,0.06).
Content: Horizontal flex.
  Left: Emoji icon (28px) in a circle (40px diameter, #FEF3C7 background).
  Right (12px gap):
    Card title (18px, 700, #2D1B00).
    Card subtitle (15px, 400, #9B7B52, 2px below title, 2 details separated by " · ").

CARD 1: 🏅 + "सम्मान" / "Verified Badge · Zero मोलभाव"
CARD 2: 🎧 + "सुविधा" / "Voice Navigation · Auto Travel"
CARD 3: 🔒 + "सुरक्षा" / "Fixed Income · Instant Payment"
CARD 4: 💰 + "समृद्धि" / "4 Income Streams · Backup Earnings"

[Four cards appear to animate in one by one with slight stagger — show all visible in static.]

SOCIAL PROOF STRIP (20px below last card):
Full width (minus 16px margins). Background: #FEF3C7. Border-radius: 12px. Padding: 14px 20px.
Content: Horizontal flex. Left-align.
🤝 emoji (24px) + "3,00,000+ पंडित पहले से जुड़े हैं" (18px, 600, #6B4F2A).
Right side: A very small "5★" in #F09942 (suggesting overall rating).

[The social proof strip appears LAST — after all features are shown. Sequencing is intentional:
features first → social proof as validation. Not social proof as cold-open bait.]

BOTTOM CTA: "Registration शुरू करें →" — 64px, #DC6803 (slightly darker saffron — this is the FINAL push), white, 22px bold.
The button has a very subtle pulsing glow (show as: shadow: 0 4px 20px rgba(220,104,3,0.45)).
This CTA is the strongest visual CTA in the entire tutorial.
```

---

## S-0.12: FINAL CTA — REGISTRATION DECISION

```
STITCH PROMPT — S-0.12: FINAL CTA SCREEN

Design the final decision screen (tutorial screen 12 of 12) for HmarePanditJi.
Background: #FFFBF5. Size: 390×844pt.
Progress dots: ●●●●●●●●●●●● (all 12 filled — completion!). No Skip link.

THIS IS THE CONVERSION SCREEN. Every design choice serves one purpose:
Make the committed Pandit tap "हाँ" with confidence.
Make the undecided Pandit choose "Later" without feeling judged.
Both exits are clean. Both are respected.

TOP BAR: ॐ + "HmarePanditJi" left. 🌐 right. NO back arrow (final screen).

ALL 12 PROGRESS DOTS FILLED (saffron). 
A small text label appears right of the dots: "✓ Tutorial पूरा हुआ" (14px, #15803D).

HERO ILLUSTRATION (16px below progress dots):
Width: 358px. Height: 200px. Centered.
A confident Pandit figure — the same style as S-0.1, but this time the posture is slightly
more active, forward-leaning. He is holding a phone in his right hand.
Expression: Calm confidence. Slight forward energy — ready.
Traditional attire: Dhoti + angavastram in saffron. Janeu visible.
Behind figure: Temple silhouette, very light and simple — just an arch shape in
#F0E6D3 at 60% opacity. Suggests sacred authority.
Soft warm radial glow behind figure (#F5C07A at 15% opacity, 200px radius).
The illustration conveys: "This Pandit has made a decision. He is ready."

HEADLINE AREA (20px below illustration):
"Registration शुरू करें?" — 32px, 700, #2D1B00, centered.

SUBTEXT (8px below headline):
"बिल्कुल मुफ़्त।" — 22px, 600, #15803D, centered.
"10 मिनट लगेंगे।" — 20px, 400, #6B4F2A, centered. (8px gap between these two.)

[These two lines answer the two final objections: cost and time commitment.
They must appear at the decision point, not on a previous screen.]

DIVIDER: 24px space. 1px #F0E6D3 divider line.

CTA BUTTONS:

PRIMARY BUTTON:
"✅ हाँ, Registration शुरू करें →"
Height: 72px. (4px taller than standard — this is the most important button in the app.)
Background: #DC6803. (Slightly deeper saffron — more decisive, more energized.)
Text: #FFFFFF, 22px, 700 weight.
Border-radius: 14px.
Shadow: 0 6px 20px rgba(220,104,3,0.45). (Prominent shadow = this button has gravity.)
Margin: 0 16px.
A very subtle pulse animation (show as a second-shadow ring): 0 0 0 6px rgba(220,104,3,0.15).

SECONDARY BUTTON (below primary, 14px gap):
"बाद में करूँगा"
Height: 56px. Background: #FFFFFF. Border: 1.5px solid #F0E6D3.
Text: #6B4F2A, 20px, 400 weight.
Border-radius: 12px. Margin: 0 16px.
No shadow. Visually quiet. Respects the choice without promoting it.
[The label "बाद में करूँगा" not "Cancel" — preserves the relationship.]

HELPLINE ROW (below secondary button, 20px gap):
Centered. No background.
📞 icon (18px, #9B7B52) + "कोई सवाल? " + "1800-HPJ-HELP" (in bold, tappable — initiates call) + " (Toll Free)" — all 16px, #9B7B52.
Second line: "सुबह 8 बजे – रात 10 बजे" — 14px, #9B7B52, centered.

No voice indicator on this screen — this decision deserves human silence.
No keyboard toggle — there's nothing to type.

HOME INDICATOR: Standard system indicator.

THE SCREEN'S EMOTIONAL TONE:
Not pressure. Not urgency. Not "REGISTER NOW."
More like: "You've seen everything. You know what this is.
Whenever you're ready — we're here."
The confident Pandit illustration, the honest "10 minutes" timeframe, the gentle "बाद में" option —
all communicate respect for the Pandit's autonomy.
The primary button's deeper saffron is the only assertive element.
That is enough.
```

---

# ═══════════════════════════════════════════════════════
# MASTER STITCH SESSION SETUP PROMPT
# (Use this as the FIRST message in any new Stitch session)
# ═══════════════════════════════════════════════════════

```
STITCH SESSION SETUP PROMPT (Copy this FIRST, before any screen prompt)

I am designing a series of screens for HmarePanditJi — a mobile app for Hindu priests
(Pandits) in India. The app connects Pandits with customers for religious ceremonies.

DESIGN PERSONALITY: Sacred Warmth + Radical Clarity. Think morning puja light.
Not a startup. Not fintech. A dignified, warm, spiritual interface.

FIXED DESIGN SYSTEM:
  Background: ALWAYS #FFFBF5 (never pure white)
  Primary: #F09942 (saffron orange)
  Primary Dark: #DC6803
  Primary Tint: #FEF3C7
  Primary Text: #2D1B00 (dark warm brown)
  Secondary Text: #6B4F2A
  Tertiary Text: #9B7B52
  Success: #15803D
  Success Light: #DCFCE7
  Error: #DC2626
  Divider: #F0E6D3

TYPOGRAPHY: Hind (Google Fonts) / Noto Sans Devanagari
  Min body text: 20px. CTA text: 22px bold.

TOUCH TARGETS: All interactive elements minimum 56px height, 56×56px tap zones for icons.

ILLUSTRATION STYLE: Flat vector, non-specific Pandit faces, saffron+cream+warm brown palette.
All Pandit figures shown with dignity (traditional dhoti + angavastram + janeu).

LANGUAGE: All primary labels in Hindi (Devanagari script). Numbers as numerals (₹2,000).

MOOD RULE: Every screen must feel SAFE, RESPECTED, and CALM. Not exciting. Not urgent.
Like a clean, warm temple space — everything in its place, nothing demanding.

Generate screens for mobile (390×844pt iOS/Android standard reference).
Use the design system above for every element.
Apply Hind font for all text.
Never use pure white backgrounds — always #FFFBF5.
Never use purple, blue, or cold greys anywhere in the interface.

I will now give you individual screen prompts. Apply this design system consistently.
```

---

# ═══════════════════════════════════════════════════════
# STITCH PROMPT OPTIMIZATION NOTES
# ═══════════════════════════════════════════════════════

## How to Use These Prompts Effectively

```
SESSION SETUP:
1. Open new Stitch session.
2. Paste the MASTER STITCH SESSION SETUP PROMPT first.
3. Wait for Stitch to acknowledge/process.
4. Then paste individual screen prompts one at a time.

PROMPT ORDER (recommended for consistency):
  Session 1: Component Sheets 1, 2, 3 (establish visual language)
  Session 2: S-0.0.1 through S-0.0.6 (Language Selection flow)
  Session 3: S-0.0.7, S-0.0.8, S-0.0.W (Edge cases + widget)
  Session 4: S-0.1 through S-0.4 (Tutorial: Identity + Income)
  Session 5: S-0.5 through S-0.8 (Tutorial: Money + Ease)
  Session 6: S-0.9 through S-0.12 (Tutorial: Logistics + CTA)

WHY THIS ORDER: The Component Sheets establish the visual vocabulary.
Every subsequent screen then references those established components
rather than re-inventing them, creating visual consistency.

ITERATION TIPS:
- If a color is wrong: "Keep everything the same but change [element] to #[hex]"
- If layout feels crowded: "Add 8px more vertical space between [element A] and [element B]"
- If illustration style is off: "Make the illustration more flat/minimal, reduce detail by 50%"
- If text is too small: "Increase all body text by 2px"
- If CTA doesn't stand out: "Increase the button shadow to 0 6px 24px rgba(240,153,66,0.50)"

WHAT STITCH DOES WELL (lean into these):
  ✓ Card layouts with clear content hierarchy
  ✓ Button states and variants
  ✓ Color application across a design system
  ✓ Typography scale rendering
  ✓ Simple icon integration (via prompting)
  ✓ Clean progress indicators

WHAT STITCH NEEDS HELP WITH (add more detail for these):
  ⚠ Illustrations: Always be extremely specific about style, content, and palette
  ⚠ Devanagari rendering: Specify "Noto Sans Devanagari" explicitly for script text
  ⚠ Micro-interactions: Describe static state explicitly + note "animate to [state]"
  ⚠ Voice components: Describe the 3-bar waveform in exact pixel terms every time
  ⚠ Complex grids: Specify exact column count, cell dimensions, and gap values
```

---

*Document Version: 1.0*
*Scope: Complete Stitch Prompt Library — Part 0.0 + Part 0 (22 Screens + 1 Widget + 3 Component Sheets)*
*Total Prompts: 28*
*Total Words: ~15,000*
*Prompt Engineer: 100-Year Experience Synthesis*
