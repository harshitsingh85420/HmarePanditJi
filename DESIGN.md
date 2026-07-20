# HmarePanditJi — Design Canon (Pandit app)

**Canonical source:** `design/canon/हमारे पंडित जी.dc.html` (Claude Design
export, ingested at `1b46960`). Its own title line states the scope:

> `पंडित ऐप · सम्पूर्ण UI सिस्टम — 28 स्क्रीन · आरती थीम`

28 pandit screens, Aarti theme. Component mockups ship alongside it in
`design/canon/`. **Scope is the pandit app only.**

Anything that disagrees with `design/canon/` is not canon. In particular the
Stitch set under `prompts/` (and the `DESIGN.md` inside
`prompts/part 1/F 1&2/stitch_welcome_screen_0_15/saffron_glow/`) is **legacy**
— it is a different, superseded design language. It is kept as a historical
artifact and deliberately not rewritten.

---

## Palette — SINDOOR (evidence-final)

Ruling #1 is settled by measurement, not preference. Hex frequency counted
directly from the canon artboard vs. the legacy Stitch set:

| Colour | canon `design/canon/` | legacy `/prompts` |
| --- | --- | --- |
| `#B23A1A` sindoor | **99 — most-used colour** | 0 |
| `#904D00` saffron | **0** | 223 |

The two sets use disjoint palettes. The app implements the canon: **21 of 21**
of the canon's most-used colours are present in
`apps/pandit/tailwind.config.ts`, and `#904D00` appears nowhere in app source
on any branch.

### Core roles

| Role | Value | Token |
| --- | --- | --- |
| Primary (sindoor) | `#B23A1A` | `saffron.DEFAULT` / `saffron.500` |
| Ink (body text) | `#341A13` | `temple.700` |
| Paper (cards) | `#FFFDF8` | `card` |
| Cream (chandan ground) | `#FFF6E9` | `chandan` |
| Screen ground | `#FAF3E6` | `cream` |
| Trust green — money | `#1E7A46` | `leaf.500` |
| Trust green — deep | `#155C34` | `leaf.700` |
| Error | `#C2321E` | `danger` |

### Supporting ramp (all canon-verified)

`#7A250E` saffron-700 · `#FDEEE7` saffron-50 · `#F4B096` saffron-200 ·
`#D95F38` saffron-400 · `#47241A` temple-600 · `#8A6F5C` softgrey ·
`#F0DFC4` sand · `#E7DCC9` sand-200 · `#E4D6C1` sand-300 · `#C9BBA6` sand-400 ·
`#E7B54A` gold · `#B8860B` brassdark · `#F2A02C` genda · `#E4F3E9` leaf-100

> **Naming caveat.** The Tailwind key is `saffron` but its value is sindoor
> `#B23A1A`. The key is a legacy name kept to avoid renaming every class in the
> app; the value is canon-correct. Do not "fix" the name into the hue.

---

## Screen map

| Canon | Route |
| --- | --- |
| 1–6 splash · location · language · parichay · tutorial · registration | `/onboarding` |
| 7 OTP | `/login`, `/otp` |
| 8 home / dashboard | `/home` |
| 9 new booking request | `/bookings/[id]/request` |
| 10 booking detail | `/bookings/[id]` |
| 11 booking list | `/bookings` |
| 12–17 readiness (आधार · भोजन · यात्रा · ठहरना · दाम मीटर) | `/readiness` |
| 18 add puja (सामग्री · दक्षिणा) | `/my-poojas/add` |
| 19 कमाई | `/earnings` |
| 20 calendar | `/calendar` |
| 21 मेरी पूजाएँ | `/my-poojas` |
| 22 settings | `/settings` |
| 23 मदद / सहायता | `/help` |
| 24 profile | `/profile-view` |
| 25 emergency SOS | `/emergency-sos` |
| 26–28 celebration · empty · loading | cross-cutting components |

Component mockups map to: `DiyaLoader`, `GoOnline` pill, `ShishyaOrb`,
`BottomNav` (ThaliNav), `Toran`, calendar grid, `PriceHonestyMeter`,
`SamagriTiers`, `MoneyCount` (CountUp), and `PhoneFrame` (artboard chrome —
not an app component).

**Undesigned routes** (no canon screen): `/identity`, `/samagri`, `/resume`,
`/complete`, `/referral/[code]`, `/mobile`, `/permissions/*` (partly implied by
canon 2 and 4), and the duplicate-looking `/dashboard`, `/homepage`,
`/profile`, `/emergency`. Internal-only, out of scope: `/design*`,
`/dev/font-compare`, `/test-voice`.
