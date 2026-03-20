(Screen 1 of 12 — S-0.1)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Content (adapt from the Stitch HTML for S-0.1 Welcome screen):

- Hero illustration area (240px):
    A seated Pandit figure. Use the SVG pattern: a saffron circle (200px, primary-lt bg)
    with a centered "🧘" emoji at 96px as placeholder (production will use custom SVG illustration)
    Add animate-gentle-float to the emoji wrapper
    Add a subtle radial glow behind: absolute div, bg-primary/12, 200px circle, blur-xl

- Greeting section:
    "नमस्ते" (40px, 700, vedic-brown, center)
    "पंडित जी।" (40px, 700, primary, center) ← saffron on their title is respectful
    "HmarePanditJi पर आपका स्वागत है।" (22px, vedic-brown-2, center)

- Thin divider (80px wide, center, vedic-border)

- Mool Mantra (italic, center, vedic-gold):
    "App पंडित के लिए है,"
    "पंडित App के लिए नहीं।"

- ScreenFooter with isListening:
    PRIMARY CTA: "जानें (सिर्फ 2 मिनट) →" → onNext
    GHOST text: "Registration पर सीधे जाएं" → onSkip

Voice script: "Namaste Pandit Ji. HmarePanditJi par aapka swagat hai. Ye platform aapke liye bana hai. Agle do minute mein hum dekhenge ki yeh app aapki aamdani mein kya badlav la sakta hai."