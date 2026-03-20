(Screen 5 of 12 — S-0.5)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Content (adapt from S-0.5 Stitch HTML):

- Headline block (center):
    "बिना कुछ किए" (28px bold, vedic-brown)
    "₹2,000?" (44px bold, success color) ← The HERO text of this screen
    "हाँ। यह सच है।" (18px, 600, vedic-brown-2)

- TIMELINE CARD (white bg, shadow-card, rounded-card, padding 20px):
    3 steps connected by dashed vertical lines:
    Step 1: 📅 in saffron circle + "कोई पूजा Book हुई" (18px bold) + "(Backup Protection के साथ)" (15px vedic-gold)
    Dashed connector line (2px dashed vedic-border, 20px height)
    Step 2: 📲 in saffron circle + "आपको Offer आया:" + "'क्या आप Backup Pandit बनेंगे?'" (italic quote)
    Dashed connector
    Step 3: ✅ in success green circle + "आपने हाँ कहा। उस दिन Free रहे।"

- OUTCOME TABLE CARD (white bg, shadow-card, rounded-card, overflow-hidden):
    Header row (primary-lt bg, padding 14px 16px):
      Left cell: "मुख्य Pandit ने पूजा की" (15px bold vedic-brown-2)
      Right cell: "मुख्य Pandit Cancel किया" (15px bold vedic-brown-2)
      Between cells: 1px vertical vedic-border line
    Data row (white bg, padding 20px 16px):
      Left: "₹2,000" (28px bold success) + "(बिना कुछ किए!)" (14px bold success, below)
      Right: "Full Amount" (20px bold success) + "+ ₹2,000 Bonus" (16px bold success, below)
      Between cells: 1px vertical vedic-border

- ACCORDION (collapsible, show as open in initial render):
    "▾ यह पैसा कहाँ से आता है?" header (16px bold, tap to toggle)
    Content: "ग्राहक ने Booking के समय Backup Protection की extra payment की थी। वही आपको मिलता है।" (16px)
    Implement with useState(true) for open by default

- ScreenFooter: CTA → onNext

Voice: "Yeh sun ke lagega 'yeh kaise ho sakta hai.' Jab koi booking hoti hai jisme backup protection hai, aapko offer aata hai. Aap haan kehte hain. Main Pandit ne pooja kar li — bhi aapko do hazaar. Main Pandit cancel kiya — poori booking plus do hazaar. Dono taraf faayda."