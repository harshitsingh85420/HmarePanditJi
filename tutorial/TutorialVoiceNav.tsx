(Screen 7 of 12 — S-0.7)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CRITICAL: This screen is INTERACTIVE. The mic is live and responds to any speech.

Content:
- Headline: "टाइपिंग की ज़रूरत नहीं।" (30px bold, center)
- Illustration (primary-lt circle 160px):
    🎤 emoji large (64px) + sound wave SVG arcs + "हाँ" text floating to the side
    Subtitle: "बोलो → लिखाई हो जाती है"

- Instruction: "जब यह दिखे:" + mini voice pill (primary-lt bg, primary border, shows 3 tiny bars + "सुन रहा हूँ...")
- "तब बोलिए।" (28px bold, center)

- INTERACTIVE DEMO BOX (CRITICAL SECTION):
    Background: primary-lt
    Border: 2px DASHED primary  ← dashed = "interactive, try me"
    Border-radius: 20px
    Height: 104px
    Content centered: 
      🎤 icon (44px, primary) with 2 concentric pulse rings (animate-pulse-ring)
      "हाँ या नहीं बोलकर देखें" (18px, vedic-brown-2, below icon)
    
    STATE MANAGEMENT (useState):
      type DemoState = 'ready' | 'listening' | 'success'
      Initially: 'ready'
      On mount: auto-start listening (startListening from voice-engine)
      On ANY voice detection (onResult fires): set to 'success'
    
    When demoState === 'success':
      Show success pill BELOW the box (animate-scale-spring):
        success-lt bg, success border, rounded-pill, padding 12px 24px
        "✅ शाबाश! बिल्कुल सही!" (20px bold success)
      After 2000ms: reset to 'ready' and restart listening
    
    The demo box ITSELF should also show a subtle green tint when success:
      Change border to success green when demoState === 'success'

- Fallback note: "अगर बोलने में दिक्कत हो:" + "⌨️ Keyboard हमेशा नीचे है"
- ScreenFooter: CTA "अगला फ़ायदा देखें →" → onNext

Voice: "Yeh app aapki aawaz se chalta hai. Abhi koshish kariye — 'haan' ya 'nahi' boliye. Mic abhi sun raha hai."