# EMOJI → ICONOGRAPHY SWEEP — 2026-07-31 (owed since before the स्थान page)

The same question the glyph matcher asks, at platform scale: every
user-facing emoji is un-themed OS-rendered iconography — it ignores the
design system, varies by device, and (per the FOUC/स्थान findings) reads as
un-designed. **The icon-system ruling is Isj's**; this is the census he
rules on.

## Scope and instrument

Census over the LIVE trees only (apps/pandit/src · apps/web/app ·
apps/web/components), comments stripped, .tsx non-test files — the same
scratchpad instrument as the glyph-scope proof (glyph-emoji-sweep.mjs).
Dead tree excluded (condemned). **90 distinct emoji.**

## Canon column, honest

Where the mockup-match campaign ESTABLISHED canon equivalents, they are
named; everything else is UNKNOWN — not "no equivalent", but "not yet
checked against the artboards":

| category | emoji (examples) | canon shows |
|---|---|---|
| Nav / chrome | 🏠 📅 📿 🔔 | BottomNav canon iconography (mockup-match batch, ported) — emoji remnants are stragglers |
| Celebration | 🌸 🌼 🪔 ✨ 🪙 | canon celebration/tutorial artboards use petal/diya vector graphics (tutorial choreography work) |
| Panchang / sky | 🕉 🌤 ☀ 🌙 | PanchangStrip canon has sun/moon iconography (शुभ-मुहूर्त chip work) |
| Devotional | 🙏 (30 files) 🛕 🔱 📿 | UNKNOWN — 🙏 is the platform's most-used glyph and closest to a brand mark; ruling needed most here |
| Status / feedback | ✅ ⚠ ❌ ✕ ✖ | UNKNOWN — likely lucide equivalents exist in the design system |
| Money / commerce | 💰 🛍 📦 🚗 🏨 ✈ | UNKNOWN — PriceHonestyMeter/CartSidebar carry several |
| Voice / SOS | 🎤 🎙 🔊 📞 🆘 💤 | UNKNOWN — SOS iconography is safety-critical; port only with Isj's eyes |
| Life events | 💍 👶 🔥 🚩 📜 | UNKNOWN — pooja-type markers |

## The census, verbatim from the instrument

```
── GLYPH-CLAIM SWEEP, uncovered trees ──
apps/pandit/src: 1 glyph-claim file(s)
   /apps/pandit/src/app/(dashboard-group)/profile-view/page.tsx
apps/admin/src: 0 glyph-claim file(s)
apps/web/src: 1 glyph-claim file(s)
   /apps/web/src/app/pandit/[id]/profile-client.tsx

── EMOJI CENSUS, live trees (pandit + web live) ──
90 distinct emoji across the live trees
🙏   30 file(s)  page.tsx, page.tsx, layout.tsx, page.tsx …
✓   12 file(s)  page.tsx, HomeView.tsx, page.tsx, page.tsx …
🪔   11 file(s)  page.tsx, HomeView.tsx, page.tsx, page.tsx …
🕉   10 file(s)  page.tsx, PanchangStrip.tsx, page.tsx, layout.tsx …
✅    9 file(s)  page.tsx, page.tsx, page.tsx, page.tsx …
📿    6 file(s)  page.tsx, page.tsx, page.tsx, BottomNav.tsx …
💰    5 file(s)  page.tsx, page.tsx, page.tsx, page.tsx …
🔔    5 file(s)  page.tsx, HomeView.tsx, page.tsx, TutorialV2.tsx …
📅    5 file(s)  page.tsx, HomeView.tsx, BottomNav.tsx, page.tsx …
⚠    5 file(s)  HomeView.tsx, page.tsx, global-error.tsx, ParichayScreen.tsx …
📍    5 file(s)  HomeView.tsx, LocationPermissionScreen.tsx, page.tsx, ItineraryTimeline.tsx …
🏠    5 file(s)  page.tsx, page.tsx, BottomNav.tsx, BookingCard.tsx …
🌼    5 file(s)  TutorialV2.tsx, CelebrationOverlay.tsx, CelebrationScreen.tsx, SlideCanvas.tsx …
🌸    5 file(s)  TutorialV2.tsx, CelebrationOverlay.tsx, CelebrationScreen.tsx, SunriseSplash.tsx …
✈    5 file(s)  page.tsx, ItineraryTimeline.tsx, page.tsx, page.tsx …
✕    3 file(s)  page.tsx, VoiceDebugPanel.tsx, CartSidebar.tsx
★    3 file(s)  HomeView.tsx, page.tsx, page.tsx
🛍    3 file(s)  page.tsx, PriceHonestyMeter.tsx, CartSidebar.tsx
💍    3 file(s)  page.tsx, page.tsx, ServicesTab.tsx
👶    3 file(s)  page.tsx, page.tsx, page.tsx
🔥    3 file(s)  page.tsx, page.tsx, page.tsx
🔊    3 file(s)  page.tsx, Toast.tsx, VoiceDebugPanel.tsx
🚗    3 file(s)  PriceHonestyMeter.tsx, page.tsx, TravelOptionsTab.tsx
💬    2 file(s)  page.tsx, page.tsx
🌤    2 file(s)  page.tsx, HomeView.tsx
🎉    2 file(s)  page.tsx, RegistrationScreen.tsx
🪙    2 file(s)  page.tsx, CelebrationScreen.tsx
📋    2 file(s)  HomeView.tsx, page.tsx
👇    2 file(s)  page.tsx, PriceHonestyMeter.tsx
📝    2 file(s)  page.tsx, page.tsx
✨    2 file(s)  page.tsx, SamagriModal.tsx
🛕    2 file(s)  page.tsx, page.tsx
✖    2 file(s)  page.tsx, SamagriPackageEditor.tsx
📖    2 file(s)  page.tsx, BookingCard.tsx
🚩    2 file(s)  page.tsx, page.tsx
🏨    2 file(s)  page.tsx, PriceHonestyMeter.tsx
⚙    2 file(s)  page.tsx, VoiceDebugPanel.tsx
🏙    2 file(s)  RegistrationScreen.tsx, LocationPermissionScreen.tsx
💤    2 file(s)  TutorialV2.tsx, ShishyaOrb.tsx
📞    2 file(s)  VoiceField.tsx, EmergencySOSFloating.tsx
🔒    2 file(s)  page.tsx, page.tsx
📜    2 file(s)  page.tsx, page.tsx
📦    2 file(s)  CartSidebar.tsx, SamagriModal.tsx
🤝    1 file(s)  page.tsx
🎙    1 file(s)  page.tsx
⚡    1 file(s)  page.tsx
🎤    1 file(s)  page.tsx
🎁    1 file(s)  page.tsx
❌    1 file(s)  HomeView.tsx
🚚    1 file(s)  page.tsx
🔱    1 file(s)  page.tsx
🪷    1 file(s)  page.tsx
✗    1 file(s)  page.tsx
🔄    1 file(s)  page.tsx
🏡    1 file(s)  page.tsx
💑    1 file(s)  page.tsx
🍼    1 file(s)  page.tsx
💦    1 file(s)  page.tsx
👵    1 file(s)  page.tsx
🌿    1 file(s)  page.tsx
💡    1 file(s)  page.tsx
🌟    1 file(s)  page.tsx
🎐    1 file(s)  page.tsx
🟢    1 file(s)  page.tsx
🍲    1 file(s)  PriceHonestyMeter.tsx
🔸    1 file(s)  SamagriTiers.tsx
🐞    1 file(s)  VoiceDebugPanel.tsx
💸    1 file(s)  page.tsx
📧    1 file(s)  page.tsx
📱    1 file(s)  page.tsx
📘    1 file(s)  page.tsx
📸    1 file(s)  page.tsx
🐦    1 file(s)  page.tsx
🕒    1 file(s)  page.tsx
📄    1 file(s)  page.tsx
🎫    1 file(s)  page.tsx
🟡    1 file(s)  page.tsx
🎊    1 file(s)  BookingCard.tsx
🕊    1 file(s)  BookingCard.tsx
🚕    1 file(s)  ItineraryTimeline.tsx
😕    1 file(s)  error.tsx
💳    1 file(s)  page.tsx
🧪    1 file(s)  page.tsx
🔶    1 file(s)  page.tsx
🎓    1 file(s)  page.tsx
❤    1 file(s)  page.tsx
✍    1 file(s)  page.tsx
🚂    1 file(s)  TravelOptionsTab.tsx
🛤    1 file(s)  TravelOptionsTab.tsx
🛒    1 file(s)  CartSidebar.tsx
```
