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
6. ~~C1/C2 awaiting ruling~~ — **GRADUATED (Isj, 2026-08-03, `de3d437`)**:
   canon scale with the ≥14.5px money floor; 52px taps; the tertiary-44
   exception and canon-46 died with it. tokens.css carries the ruling.

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

---

# PHASE 0-P — THE CAMPAIGN EXPANDS TO THE PANDIT APP (2026-08-03)

**Isj's order, from his मेरी पूजाएँ screenshot: "all UI to be verified like
this."** Specimen two (that card) is FIXED and deployed (`844ecda`) —
before/after shot in the turn record; all five named violations dead
(one-pill status, two-truths hierarchy, primary 52px door, quiet हटाइए
behind the earned confirm, inline 22px emoji).

## 0-P.1 · The pandit vocabulary (what the audit judges against)

| kind | canonical values | source |
|---|---|---|
| brand | SINDOOR scale under the legacy key `saffron` — 500 `#B23A1A`, 50-900 tints/shades | tailwind.config.ts:39-44 |
| surfaces | cream `#FAF3E6` · card `#FFFDF8` · chandan/cardtint/peach/goldpale/parchment · sand scale | :45-57 |
| text | temple 500-700 · ink `#3A1F1B` · softgrey `#7E6553` (dhoop darkened for 4.5:1, ruled) · brassdark `#8A6508` | :46-83 |
| accents | leaf 100/500/700 + leafpale · gold · danger `#C2321E` · genda; festive rani/neel/kesar/gulal (illustration-only) | :58-90 |
| radii | "only five numbers": 18 (tile/cta) · 16 (field/btn) · 22 (surface) · 14 (inset) · 999 (chip) + card 20/canvas 28 | :97-122 |
| **floors (RULED — Ruling #2, the pandit-side law)** | **body ≥18px · labels ≥15px · taps ≥52px** — enforced by globals 18px base + scattered per-file guards, NOT by a repo-wide sweep | CONFLICT_RULINGS.md:354-399 |
| type classes | .t-hero/.t-title/.t-body/.t-hint/.t-money(-hero) in globals.css | globals.css:399-445 |

**Token-layer defects found (Phase 1-P's first commit):** ① the 15px label
floor has NO enforcing token — the theme's own `label-xs` (12px),
`label-sm`/`body-xs` (14px) sit BELOW their role floors, so a screen can go
under-floor using only blessed tokens; ② `.t-hero/.t-money/.t-money-hero`
declare `font-weight: 700` then `400` two lines later — the 400 silently
wins against the "Noto 700" comment, unpinned; ③ two overlapping minHeight
vocabularies (touch-* vs btn/confirm/input) with no canonical pick; ④ the
legacy splash palette (#FF8C00 family) and body `#FFFBF5` are unblessed
pre-canon residue; ⑤ `.t-hint` at 16px sits between the two floors with no
assigned role.

## 0-P.2 · The census (42 page files → ~23 real screens + steps)

**The headline: the pandit app's disease is DIFFERENT from the customer
app's.** Default-palette debt is nearly eradicated and sub-15px text almost
gone (the mockup-match campaign did its work). The dominant "debt" — 173
raw-hex lines — is mostly **canon-exact-by-literal**: artboard hexes
deliberately inlined during the exact-UI campaign. The fix there is
TOKENIZATION, not re-skin. The real hot spots:

| rank | surface | the actual problem |
|---|---|---|
| 1 | **HomeView.tsx** | the app's biggest palette pocket: 18 default-palette classes (amber/blue/red/slate) in the KYC pending/submitted/rejected banners + 16 hexes |
| 2 | **homepage / referral / parichay** | the three PRE-CANON survivors: legacy vocabulary, English copy ("Joining free", "Login"), homepage's indigo ×4 + 40px language button + text-xs/sm ×4 |
| 3 | **bookings list** | ~9 inline `fontSize:'16px'` interactive affordances under the 18sp floor (invisible to class-regex — needs the inline-style-aware pass) |
| 4 | login / readiness | one bg-red-50 error banner each + readiness' slate payment-tab track |
| 5 | canon-literal tokenization | bookings 24 · add 20 · request 15 · readiness 14 · earnings 12 · hub 12 · settings 11 (mechanical, low-risk) |

Canon-touched: 16 screens YES (dense markers), 2 post-canon kit-clean
(samagri chapter, profile-photo), 3 legacy NO, plus redirects/dev routes.
Census gaps recorded honestly: onboarding sub-screens (Parichay/Location/
Language/Tutorial×16/Registration) live outside the page glob and need
their own sweep; shared components (Header/Toast/EmptyState/…) repeat
their debt on every route and were not double-counted.

## 0-P.3 · The instrument, pandit variant

The customer scanner does not transfer as-is: the pandit variant needs
(a) the sindoor blessed set above, (b) floors at 18/15 not 14.5/12.5,
(c) an **inline-style `fontSize` pass** (the bookings finding proves
class-regex alone under-reports), (d) single-digit `text-[Npx]` sizes.
Built as `apps/pandit/scripts/ui-audit.mjs` when Phase 1-P's first page
turn opens — its spec is this section.

## 0-P.4 · Order proposal (journey + money + daily-use first)

1. **HomeView KYC banners + hexes** (the daily-use surface, worst pocket)
2. bookings list (inline-16px floor breaches — money-adjacent daily surface)
3. bookings/[id] + request (money path; mostly tokenization)
4. earnings (money; tokenization + the .t-money weight defect)
5. token-layer cleanup commit (floors into the scale, weight fix, one
   minHeight vocabulary) — unblocks everything after
6. add wizard + samagri chapter (tokenization; already floor-clean)
7. readiness R1-R5 + hub · 8. settings/profile-view/help · 9. the three
   legacy screens (homepage/referral/parichay — restyle or kill-list per
   decide-or-go) · 10. onboarding sub-screens sweep (the census gap)

**The standing rule: whichever surface Isj photographs next JUMPS this
queue — his camera has out-hunted every instrument, and the queue serves it.**
