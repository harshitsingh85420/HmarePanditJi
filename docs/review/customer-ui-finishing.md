# CUSTOMER UI FINISHING CAMPAIGN — Phase 0 (2026-08-03)

**Isj's verdict, verbatim intent:** "I need it to be perfect. Check the
spacing and color. Every page should be seen." His screenshot (wizard venue
step) is SPECIMEN ONE below — the orange Add button, uneven spacing, weak
label hierarchy, all named with sources.

**Status: Phase 0 delivered — census + token table + instrument + specimen
scorecard. Phase 1+ = one page per turn, journey order, money path first.**

---

## 0 · THE HEADLINE FACTS

- The canonical vocabulary EXISTS and is healthy: `tokens.css` (turn-4
  canon) + `tailwind.config.ts` agree on every hex; `components/design/*`
  and `components/design-system/*` carry ZERO raw hexes. The re-skinned
  routes (ceremonies, help, booking-confirmed, search-partial) are clean.
- The disease is scoped, not vague: **342 raw-hex occurrences in 18 files;
  686 tailwind default-palette classes in 36 files.** Worst file:
  `booking-wizard-client.tsx` (105 hexes — 81 of them the DEAD orange
  `#f49d25`, declared dead in tailwind.config.ts:21).
- **The wizard file mixes THREE color systems in one file**: slate+dead-
  orange (step 0), Stitch ink/brown `#181511/#8a7960` (steps 4-5), and zero
  blessed tokens anywhere. `#ec7f13` is nobody's canon — it survives only
  in the dead `src/` tree and old Stitch mockups.
- Isj's orange: `bg-[#f49d25]` — an arbitrary-value class of the OLD
  palette, not a tailwind default. Five hover-paired sites in the wizard
  (lines 931, 1128, 1640, 1875, 1933).

## 1 · THE PAGE CENSUS (every customer surface, one row each)

Legend: batch = canon-touched (yes/partial/no) · debts = top off-token signals.

| # | route / step | states + modals | batch | debts |
|---|---|---|---|---|
| 1 | `/` home | featured loading/empty (**"Run database seed" dev copy leaks to customers**); LanguageModal, Tutorial overlay, LocationPrompt | partial | #8a7960 ×7, #181511 ×6, #f49d25 ×3, slate/zinc ×31 |
| 2 | `/search` | loading / error+Retry / SurfaceState empty; geo soft-ask; LoginModal | partial | #1a140d ×5, **#f2a20d** (a THIRD saffron variant), slate ×8 |
| 3 | `/ceremonies` | SurfaceState loading/error; honest-absence rows | **yes** | none |
| 4 | `/help` | static; phone-configured vs honest-absence | **yes** | none |
| 5 | `/muhurat` | 4-state calendar + 4-state entries panel | partial | #f29e0d ×34, slate ×41 |
| 6 | `/muhurat-explorer` | redirect | n/a | — |
| 7 | `/voice-search` | **static mock** — fake transcript, dead controls | no | #f29e0d ×14 + dark-mock dialect |
| 8 | `/nri` | **static marketing mock, fabricated claims (4K HDR, forex)** | no | #1a2b4b ×60 (worst route file) |
| 9 | `/login` | phone → otp → name; role toggle; error banners | partial | gray-* ×26 |
| 10 | `/pandit/[id]` + tabs | server-rendered; SamagriModal + LoginModal | partial | gray ×60, #f49d25 ×10 |
| 11 | wizard wrapper | Suspense fallback | no | #f8f7f5 |
| 12 | wizard **1/7 Event Details** | validation banner; contacts import | no | **SPECIMEN ONE — §3 below** |
| 13 | wizard 2/7 Select Pandit | loading/error/empty honest states | partial | #f49d25 ×15, slate chrome |
| 14 | wizard 3/7 Travel | local vs outstation branches, 4-state options | partial | mixed `primary` + slate dialects |
| 15 | wizard 4/7 Ritual Details | delegates to src/ RitualVariationSelection (own audit needed) | no | (imported component) |
| 16 | wizard 5/7 Preferences | samagri path cards; SamagriModal + AuthModal | no | #f49d25 ×10, amber/blue/green badges |
| 17 | wizard 6/7 Review & Pay | money rulings dense; Razorpay mount | partial | **its own third dialect**: #181511 ×18, #8a7960 ×19, #f49d25 ×25 |
| 18 | wizard 7/7 Confirmed (fallback) | **mojibake emoji lines ('ðŸ"±' — encoding debt)** | partial | #f49d25 ×6, green-as-success |
| 19 | `/booking/checkout` | redirect (ruled kill) | n/a | — |
| 20 | `/booking/[id]` | **redirect → /bookings/:id which DOES NOT EXIST in the live tree — 404s** | broken | — |
| 21 | `/booking-confirmed/[id]` | SurfaceState ×3 + payment-status branches | **yes** | none |
| 22 | `/dashboard` | redirect | n/a | — |
| 23 | `/dashboard/bookings` | tabs; NO-SESSION ≠ empty (ruled) | partial | orange-600 ×4, dark #181511 layout |
| 24 | `/dashboard/bookings/[id]` | 7-status banner, 3 tabs, polling; PujaCompletionModal | partial | gray ×38, #25D366, **#137fec** |
| 25 | `…/track` | **SIMULATED map, hardcoded ETA "4h 20m", dead controls — the screen canon CUT; kill/replace candidate** | no | #137fec ×13, slate ×38 |
| 26 | `…/cancel` | refund calculator (one-source ruling) | partial | gray ×15, red ×3 |
| 27 | `…/review` | 5-dimension stars; envelope-fix noted | partial | red ×3, gray ×12 |
| 28 | `/dashboard/favorites` | loading/empty/grid; **native confirm() dialog** | no | amber ×6, gray ×8 |
| 29 | `/dashboard/notifications` | loading/empty/list; R6 mapper | partial | 5-color icon palette |
| 30 | `/dashboard/profile` | edit-in-place + address forms | no | **44 hexes of dark-mock dialect** |
| 31 | `/dashboard/profile/family` | inline add/edit forms | no | gray ×37 (densest gray file) |
| 32 | `/profile` | redirect | n/a | — |
| 33 | `/stitched` + `[slug]` | **57 raw prototype screens exposed as customer routes — kill candidates** | no | — |
| 34 | `/(legal)/about` | static; emoji tiles | no | orange ×10 |
| 35 | `/(legal)/terms` | static; [LEGAL REVIEW NEEDED] banner | no | yellow banner |
| — | global chrome | Header/Footer/BottomNav/CartSidebar/AuthModal mount on EVERY route | partial | Footer carries #181511 |

**Census-found functional debts** (not styling, filed for their own turns):
the dead `/booking/[id]` redirect; `/stitched` exposure; the track page's
fabricated map/ETA (fabrication class!); home's seed-copy leak; step-7
mojibake; TWO SamagriModal implementations (profile vs wizard).

## 2 · THE TOKEN TABLE (what the probe checks against)

| kind | canonical values | source |
|---|---|---|
| brand | saffron `#904D00` · deep `#6E3A00` · tint `#F6EDE0` · control-rule `#DBC3A4` (border-only) | tokens.css + tailwind.config.ts (agree on all) |
| text | ink `#241A12` · muted `#6B5B48` (6.07:1) | same |
| surfaces | cream `#FBF6EE` · canvas `#EFE7DA` · warm `#FFF7EC` · tint-deep `#EFE4D4` | same |
| identity green | tulsi `#2E6B4E` + tint `#E7F0EA` — **identity-verified ONLY, never generic success** | same |
| destructive | terracotta `#B0432E` outlined on `#E0B9AE` — **never filled** | same |
| chrome | well `#2A2018` · hairline `#E8DDCB` (border-only) · placeholder `#B9A88F` (glyphs only) | same |
| type | display 26 · title 20 · section 17 · body 14.5 · label 12.5 · micro 11 · money 24 tabular | tokens.css:84-92 |
| tap | `--hpj-tap: 52px` (C2 interim: floor wins; canon 46 parked) | tokens.css:94-102 |
| money law | no price below body; label/micro barred from prices; tabular everywhere | tokens.css:80-83 |
| DEAD | `#f49d25` / `#e08c14` / `#e8540a` / `#22c55e` / `#181511` / `#8a7960` / `#ec7f13` / `#137fec` / `#f29e0d` / `#f2a20d` | declared dead or never-canon |

**Token-layer defects found by the sweep (fix in Phase 1's first commit):**
1. `--hpj-settle-field` referenced (MoneyTwoZone:89) but DEFINED NOWHERE —
   the money seam's cream zone renders with no background.
2. Radii names SWAPPED between the two sources (tailwind card=12/panel=14
   vs tokens.css card=14/panel=12); tailwind `rounded-chip`=8 vs token
   chip=999; canon's 2nd-most-used radius (field 9px) has NO utility.
3. Spacing scale `--hpj-s1..s6` has no tailwind classes — spacing is the
   least-canonized token kind (why the wizard's rhythm drifts).
4. `Button` tertiary `minHeight: 44` — an unruled exception to its own
   file's 52px floor.
5. `globals.css` `.spiritual-pattern` still hardcodes dead `#f49d25`.
6. C1 (body 14.5 vs 18px floor) and C2 (tap 46/50 vs 52) remain AWAITING
   ISJ'S RULING — tokens.css:75-102 is the interim ledger.

## 3 · SPECIMEN ONE — wizard Event Details (Isj's screenshot), the scorecard

**The orange, named:** `bg-[#f49d25] text-white hover:bg-[#e08c14]`
(line 1128) — the old palette's arbitrary-value class, not a tailwind
default; declared dead in tailwind.config.ts:21. White on #f49d25 ≈ 2.2:1 —
the Add and Continue buttons FAIL contrast outright (the blessed
#904D00 gives ≈6.5:1, which is exactly why the canon swapped it).

**34 violations across five families** (full rows in the audit output):

- **COLOR (15):** Add + Continue on dead orange; 11 field focus-rings
  `focus:ring-[#f49d25]`; checkbox `accent-[#f49d25]`; icon; canvas
  `#f8f7f5`; card `bg-white border-slate-100`; all borders slate-200;
  labels/values slate-700; asterisk red-400; **error strip FILLED red**
  (system forbids filled destructive); chips slate-100.
- **SPACING (3):** three rhythms in one card (mb-3 / gap-4 / space-y-5);
  multi-day column space-y-2 vs sibling mb-1.5; family row gap-2 vs gap-4.
- **TYPE (3):** labels and values BOTH 14px (weight-only hierarchy — the
  weak hierarchy Isj saw); h2 18px off-scale; text-xs (12px) on four roles.
- **TAPS (8):** Add 32px · Add-from-Contacts 34px · name input 38px · all
  11 inputs 42px · checkbox ~16px native · chip × ~16px · **Continue 44px**
  · header back 32px — every interactive element under the 52px floor.
- **§3-V CONTRAST (5):** white-on-orange ×2 (2.2:1), red-on-red strip
  (3.4:1), slate-400 × on slate-100 (2.7:1), unstyled placeholders.

**Proposed target classes** are in the scorecard rows (saffron/ink/muted/
hairline/cream + min-h-tap + text-label/body split) — the fix is a
vocabulary swap plus ONE field-stack recipe, not a redesign.

## 4 · THE INSTRUMENT

`apps/web/scripts/ui-audit.mjs` — the static half, runnable per file:
flags (a) dead-palette hexes, (b) raw hexes outside the blessed set,
(c) default-palette tailwind classes (slate/gray/orange/amber/red/blue…),
(d) sub-floor tap signals (`py-2`/`py-2.5`/`w-8 h-8` on button/input
lines), (e) off-scale text classes (`text-xs`/`text-sm`/`text-lg` where
the token scale should speak). Output: per-file scorecard counts + line
hits. The runtime half (computed-style + bgOf contrast at 360×740) reuses
the pandit campaign's §3-V harness recipe — wired per-page during Phase 1,
where each page gets a live pass before its after-shot.

## 5 · PHASE 1 ORDER (money path first, one page per turn)

1. wizard 1/7 Event Details (specimen one — fix + before/after)
2. wizard 5/7 Preferences → 6/7 Review & Pay (money surfaces)
3. wizard 2/7, 3/7, 4/7 (+ RitualVariationSelection audit)
4. wizard 7/7 fallback (+ mojibake)
5. /pandit/[id] + tabs · 6. /login · 7. /dashboard/bookings + detail
8. dashboard forms (profile, family, cancel, review, favorites,
   notifications) · 9. /muhurat · 10. home residue + Footer
11. RULINGS NEEDED: /nri + /voice-search + /track + /stitched (kill,
    replace, or restyle — all four carry fabrication or dev-leak class
    problems beyond styling); C1/C2; the legal pages' banner.
