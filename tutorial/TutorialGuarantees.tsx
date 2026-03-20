(Screen 11 of 12 — S-0.11)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Content:
- Headline:
    "HmarePanditJi की" (22px, vedic-gold)
    "4 गारंटी" (36px bold, vedic-brown)

- 4 GUARANTEE CARDS (stacked, gap-3, each animates-fade-up with stagger):
    Each card: white bg, border-l-[6px] border-primary-dk, rounded-r-xl (no left radius), shadow-sm
    Height: 80px, padding 0 16px 0 20px (extra left for the border)
    Content: horizontal flex, gap-4:
      Icon in primary-lt circle (40px):
        Card 1: 🏅 + "सम्मान" (18px bold) + "Verified Badge · Zero मोलभाव" (15px vedic-gold)
        Card 2: 🎧 + "सुविधा" + "Voice Navigation · Auto Travel"
        Card 3: 🔒 + "सुरक्षा" + "Fixed Income · Instant Payment"
        Card 4: 💰 + "समृद्धि" + "4 Income Streams · Backup Earnings"
    Animation delays: cards animate in with animation-delay 0ms, 200ms, 400ms, 600ms
    Use CSS animation-delay with animate-fade-up class

- SOCIAL PROOF STRIP (primary-lt/50 bg, primary/20 border, rounded-pill, padding 14px 20px):
    🤝 emoji (24px) + "3,00,000+ पंडित पहले से जुड़े हैं" (18px 600 vedic-brown)
    THIS STRIP APPEARS LAST (after all 4 cards) — intentional sequencing

- ScreenFooter: CTA "Registration शुरू करें →" (use variant='primary-dk') → onNext

Voice: "Yeh rahe chaar vaade. Samman, Suwidha, Suraksha, Samridhdhi. Teen lakh se zyada pandit pehle se jud chuke hain. Ab registration ki baari."