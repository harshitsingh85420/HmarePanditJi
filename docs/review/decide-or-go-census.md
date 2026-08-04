# THE DECIDE-OR-GO CENSUS — customer surfaces (updated 2026-08-03)

> THE LAW (Isj): EVERY ELEMENT ON A CUSTOMER SURFACE EITHER HELPS THE CUSTOMER DECIDE OR IT GOES.
>
> THE THIRD FACE (Isj, 2026-08-03, verbatim): IF IT RECURS ON EVERY PROFILE, IT IS GENERAL —
> IT BELONGS ON THE MAIN/GENERAL PAGE, SAID ONCE; THE PROFILE SPEAKS ONLY WHAT DIFFERENTIATES.
>
> 337 elements: **21 RECURRING-GENERAL · 68 NOISE · 7 DOOR · 241 DECIDES**.
> Executed so far: the three pre-ruled kills + the ruled profile/card kills of 2026-08-03.
> Everything else awaits per-row rulings.

## THE TWO DRAFTED GENERAL LINES (English-first, for the main page — await voice-check)

- **(a) identity:** "Every Pandit ji here has passed Aadhaar and video verification before being listed — it is our door, not a badge."
- **(b) money:** "Dakshina goes entirely to your Pandit ji. You pay a 10% platform fee, shown at booking."
- **(c) video:** "Every ceremony video is reviewed by us before it appears."

## RECURRING-GENERAL (23)

| surface | element | quote / evidence | was | its one general home |
|---|---|---|---|---|
| /search + / (every card list) | samagri-settlement money fact | "Samagri & travel are settled directly with the Pandit ji — never added here, never estimated." — search-client list foot (added batch 3) | DECIDES | how-it-works / the booking samagri step, said once — the fact is about the FLOW, not this pandit |
| /search + / (every card list) | we-are-new honest absence | "No reviews yet — we're new." — search-client list foot | DECIDES | the strip/list header's honest subtitle, once per surface — never per card, never per list-foot repeat |
| / (home) | hero H1 | "Book Verified Pandits with Fixed Dakshina & Transparent Pricing" — apps/web/app/page.tsx:452 | DECIDES | ONE line on the main page / how-it-works (draft below); profiles say nothing |
| / (home) | hero sub, sentence 1 | "Experience seamless spiritual ceremonies with Aadhaar-verified experts." — apps/web/app/page.tsx:455 | DOOR | ONE line on the main page / how-it-works (draft below); profiles say nothing |
| / (home) | hero floating card | "Aadhaar Verified" / "Aadhaar + Video Verified" — apps/web/app/page.tsx:484-485 | DOOR | ONE line on the main page / how-it-works (draft below); profiles say nothing |
| / (home) | empty-state line 1 | "No verified pandits yet" — apps/web/app/page.tsx:170 | DECIDES | ONE line on the main page / how-it-works (draft below); profiles say nothing |
| / (home) | value card 1 (Aadhaar) | "Aadhaar Verified Trust" / "Every Pandit undergoes rigorous Aadhaar verification and video KYC before appearing on the platform." — apps/web/app/page.tsx:544-545 | DOOR | ONE line on the main page / how-it-works (draft below); profiles say nothing |
| / (home) | value card 3 (fee + 100% dakshina) | "Fee Shown Before You Pay" / "The platform fee appears as its own line before payment — and your Pandit receives 100% of the dakshina, always." — apps/web/app/page.tsx:564-565 | DECIDES | main page once + the booking review step where the fee is charged (already present there); cards show the NUMBER |
| / (home) | fabricated stat 2 | "2,500+" / "Verified Pandits" — apps/web/app/page.tsx:588-589 | NOISE | ONE line on the main page / how-it-works (draft below); profiles say nothing |
| / (home) | tutorial slide 2 | "Book with verified Pandits from Delhi-NCR and nationwide." — apps/web/app/page.tsx:48 | DOOR | ONE line on the main page / how-it-works (draft below); profiles say nothing |
| /booking/new | quoted price + source label | {fmt(quoted)} + "पूजा की आधार दक्षिणा" / "Dakshina" — booking-wizard-client.tsx:1304-1308 | DECIDES | ONE line on the main page / how-it-works (draft below); profiles say nothing |
| /booking/new | platform fee self-justification clause | "Keeps the app free for Pandit Ji — added on top, so he receives 100% of the dakshina. Non-refundable (वापस नहीं होगा)." — booking-wizard-client.tsx:1789 | NOISE | main page once + the booking review step where the fee is charged (already present there); cards show the NUMBER |
| /dashboard/favorites | empty-state body | "Explore our verified pandits and save your favorites." — apps/web/app/dashboard/favorites/page.tsx:94 | DOOR | ONE line on the main page / how-it-works (draft below); profiles say nothing |
| /pandit/[id] | hardcoded Vedic/Verified Priest tile | "Vedic" / "Verified Priest" — page.tsx:103-104 | DOOR | ONE line on the main page / how-it-works (draft below); profiles say nothing |
| /pandit/[id] | certificate platform-verified claim | "Verified by Platform ✅" — page.tsx:143 | NOISE | ONE line on the main page / how-it-works (draft below); profiles say nothing |
| /pandit/[id] | hero identity-verified check icon | title="Verified Vedic Priest" (material icon `verified`) — page.tsx:225 | DOOR | ONE line on the main page / how-it-works (draft below); profiles say nothing |
| /pandit/[id] | reviews honest empty state | "No reviews yet" / "Be the first to review Pandit Ji after your puja." — page.tsx:299-300 | DECIDES | once per surface (the list foot), never per card |
| /pandit/[id] | unverified-puja disclosure (sentence 1) | "इस पूजा का वीडियो अभी हमने नहीं देखा — आप ख़ुद सुनकर तय कीजिए।" — ServicesTab.tsx:130 | DECIDES | general page: "every ceremony video is reviewed before it appears"; the card shows only the video control |
| /pandit/[id] | identity-verified sentence (sentence 2) | "पंडित जी की पहचान सत्यापित है — यह अलग बात है।" — ServicesTab.tsx:132 | DOOR | ONE line on the main page / how-it-works (draft below); profiles say nothing |
| /search (card) | identity verified row | "पहचान सत्यापित" :169, "आधार · मानव जाँच" :170 — apps/web/components/design/PanditRecordCard.tsx | DOOR | ONE line on the main page / how-it-works (draft below); profiles say nothing |
| /search (dead data) | 'Verified Vedic' badge field (never rendered) | badges: p.verificationStatus === "VERIFIED" ? ["Verified Vedic"] : [] — apps/web/app/search/search-client.tsx:187 | DOOR | ONE line on the main page / how-it-works (draft below); profiles say nothing |
| /search (footer) | no-reviews notice, Hindi | "अभी कोई समीक्षा नहीं — यह मंच नया है" — apps/web/components/design/Verification.tsx:170 (rendered search-client.tsx:830) | DECIDES | once per surface (the list foot), never per card |
| unrouted (dead export) | IdentityVerifiedPill | {short ? "पहचान" : "पहचान सत्यापित"} — apps/web/components/design/Verification.tsx:55 | DOOR | ONE line on the main page / how-it-works (draft below); profiles say nothing |

## NOISE (68)

| surface | element | quote / evidence | recommendation |
|---|---|---|---|
| / (home) | hero trust badge | "Authentic & Trusted" — apps/web/app/page.tsx:445 | ruled kill — self-assurance sibling of 'सभी दाम असली हैं' |
| / (home) | dead Download App button | "Download App" — apps/web/app/page.tsx:468 | kill — no onClick, no href, no shipped app; a dead promise on the front door |
| / (home) | search input (dead) | placeholder "Search for Pandits or ceremonies…" — apps/web/app/page.tsx:88 | wire or kill — input has no value/onChange; typed text never reaches handleSearch, so the front-door search box is decorative |
| / (home) | Search All India toggle | "Search All India" — apps/web/app/page.tsx:95 | kill or wire — static knob with no state; filters nothing |
| / (home) | empty-state line 2 (dev text) | "Run database seed to populate pandit data" — apps/web/app/page.tsx:171 | kill — developer text on the customer front door |
| / (home) | value-prop section header | "Our Value Proposition" — apps/web/app/page.tsx:536 | replace — subject is the platform's own virtue; rename to the facts it holds ('How pricing works') |
| / (home) | value-prop section subtitle | "Ensuring a seamless religious experience through technology, punctuality, and trust." — apps/web/app/page.tsx:537 | ruled kill — pure self-assurance |
| / (home) | social-proof header | "Trusted by Thousands of Families" — apps/web/app/page.tsx:579 | kill — fabricated self-praise on a pre-launch platform |
| / (home) | social-proof subtitle | "Spreading spiritual harmony across the nation through reliable service." — apps/web/app/page.tsx:580 | kill — self-praise, zero content |
| / (home) | fabricated stat 1 | "50,000+" / "Successful Ceremonies" — apps/web/app/page.tsx:584-585 | kill — hard-coded fiction; the muhurat-calendar defect in statistic form |
| / (home) | fabricated stat 3 | "40+" / "Cities Covered" — apps/web/app/page.tsx:592-593 | kill — fabricated; SUPPORTED_CITIES itself lists 15 |
| / (home) | CTA subtitle | "Join thousands of families who trust HmarePanditJi for their sacred rituals and auspicious beginnings." — apps/web/app/page.tsx:607 | kill — fabricated thousands + self-praise |
| / (home) | dead Contact Sales button | "Contact Sales" — apps/web/app/page.tsx:614 | kill — no handler, and 'Sales' is B2B template text on a consumer puja app |
| / (home) | language modal subtitle | "Continue in your preferred language." — apps/web/app/page.tsx:336 | kill — restates the two buttons beneath it |
| /booking/new | RITUALS_FALLBACK dataset (mojibake + invented prices) | { name: "Griha Pravesh", nameHindi: "à¤—à¥ƒà¤¹ à¤ªà¥à¤°à¤µà¥‡à¤¶", baseDakshina: 11000 } … — apps/web/app/booking/new/booking-wizard-client.tsx:181-190, rendered :1008-1012 | kill the fallback dataset — the Hindi strings are encoding-corrupted and render as literal mojibake in the dropdown, and the hardcoded baseDakshina values feed form.dakshina (a fabricated price on the money path) whenever the API is slow or down; replace with honest loading/error states |
| /booking/new | travel coordination promise | "Choose travel mode preferred by Pandit Ji. Platform will coordinate logistics for non self-drive options." — booking-wizard-client.tsx:1344-1345 | kill the second sentence — an unbacked promise (travel is cut from v1; the outstation path still fails server-side per F-J4-8). Keep the instruction half |
| /booking/new | redundant samagri badges | "Fixed Package" / "Custom List" chips — booking-wizard-client.tsx:1588, 1596 | kill — each badge repeats the card label beside it; differentiates nothing |
| /booking/new | dakshina filler sub-line | "Standard professional fees for main ritual" — booking-wizard-client.tsx:1739 | replace with the price's SOURCE (pandit's own rate vs पूजा की आधार दक्षिणा — known at step 1, dropped here); "standard professional fees" explains nothing |
| /booking/new | add-ons section heading | "Recommended Add-ons" — booking-wizard-client.tsx:1803 | replace with "Add-ons" — recommended by no one; unattributed persuasion **✅ MOOT 2026-08-04 — the whole section died with its last two children; the heading needed no rewrite.** |
| /booking/new | Premium Backup add-on (priced, undelivered) | "Premium Backup" + "Guaranteed replacement within 2 hrs if emergency" + "+ ₹9,999" — booking-wizard-client.tsx:1810-1814 | kill — same class as the ruled-out ₹499 muhurat consultation: no server field, no fee line, no pandit-side surface; the 'guarantee' travels only as a prose line in specialInstructions (:765). A ₹9,999 promise nothing implements **✅ EXECUTED 2026-08-04 (Isj, ruled order #1) — control deleted; survives ONLY as a named future with four preconditions (see journey-walk-ledger). Pinned by customerObligation.test.ts + the widened promise-truth walk.** |
| /booking/new | SAFE badge | "SAFE" — booking-wizard-client.tsx:1811 | kill — pure persuasion chip **✅ EXECUTED 2026-08-04 — died with the backup control it decorated.** |
| /booking/new | Nirmalya Visarjan add-on (priced, nobody told) | "Nirmalya Visarjan" + "Eco-friendly floral waste management" + "+ ₹500" — booking-wizard-client.tsx:1845-1847 | kill — worse than backup: the ₹500 enters settledAtBooking but NOTHING reaches the pandit (specialInstructions :756-766 never mentions visarjan); the customer owes money for a service no one is asked to perform **✅ EXECUTED 2026-08-04 (Isj, ruled order #1) — control deleted, NO named future. Same pins.** |
| /booking/new | price self-assurance line | "This is exactly the amount charged at payment — nothing added on top" — booking-wizard-client.tsx:1896 | ruled kill (a) — sibling of "सभी दाम असली हैं": a sentence asserting the platform's honesty; display=charge is enforced by the payment-money guard, not by prose |
| /booking/new | encryption trust badge | "Secure 256-bit encrypted checkout" (+ green verified_user icon) — booking-wizard-client.tsx:1934 | ruled kill (a) sibling — platform self-praise; "256-bit" is a fabricated specific (cipher varies), and every checkout on the internet is TLS |
| /booking/new | SMS-sent claim (mojibake) | "ðŸ“± Confirmation SMS sent to your phone" — booking-wizard-client.tsx:948 | kill or verify — the emoji is encoding-corrupted and renders as literal mojibake, and the SMS claim is unverified; only state it if an SMS actually goes out |
| /booking/new | family-chip remove glyph (mojibake) | "Ã—" — booking-wizard-client.tsx:1173 | fix — encoding-corrupted ×; customers see literal "Ã—" on every family-member chip |
| /dashboard/bookings/[bookingId] | banner CONFIRMED | "✅ Booking Confirmed — Pandit will arrive on schedule" — apps/web/app/dashboard/bookings/[bookingId]/page.tsx:108 | replace with "Booking Confirmed" alone — the tail promises punctuality nothing enforces, and the Badge at :137 already carries the status |
| /dashboard/bookings/[bookingId] | banner TRAVEL_BOOKED | "✈️ Travel Arranged — All set for your puja" — apps/web/app/dashboard/bookings/[bookingId]/page.tsx:109 | replace with "Travel Arranged" — "All set" is reassurance filler |
| /dashboard/bookings/[bookingId] | Live Track Pandit button | "Live Track Pandit" — apps/web/app/dashboard/bookings/[bookingId]/page.tsx:251 | kill until tracking is real — the canon CUT the tracking screen ("static map, 4 dead controls", track/page.tsx still exists) and booking-confirmed already deleted its twin claim |
| /dashboard/bookings/[bookingId] | receipt DocumentCard | "Booking Confirmation Receipt" / "Auto-generated formal receipt for your booking" / "Download PDF" → alert("Downloading receipt...") — apps/web/app/dashboard/bookings/[bookingId]/page.tsx:277-283 | kill or wire — the action is a developer alert() stub wearing a live control's face |
| /dashboard/bookings/[bookingId] | travel-docs DocumentCard | "Travel Tickets & Voucher" / "Tickets arranged by platform" / "View Documents" → alert("Viewing travel docs...") — apps/web/app/dashboard/bookings/[bookingId]/page.tsx:305-311 | kill or wire — same alert() stub class as the receipt card |
| /dashboard/bookings/[bookingId] | 30-minutes-prior promise (Itinerary tab) | "{panditTitleName(booking.pandit) ?? 'Your pandit'} will arrive 30 minutes prior." — apps/web/app/dashboard/components/ItineraryTimeline.tsx:20 | kill unless a real 30-minute-early commitment exists somewhere — sibling of "will arrive on schedule" |
| /dashboard/bookings/[bookingId] | Patrika blessing | "🙏 शुभम् भवतु 🙏" — apps/web/app/dashboard/components/MuhuratPatrika.tsx:43 | founder call — ceremonial content of the keepsake, not platform self-praise; keep if the certificate stays |
| /dashboard/bookings/[bookingId] | Patrika VERIFIED stamp | "VERIFIED" (round red rubber-stamp) — apps/web/app/dashboard/components/MuhuratPatrika.tsx:51 | kill — a fabricated seal verified by no one, of nothing; fake officialdom on a document a customer may share |
| /dashboard/bookings/[bookingId] | rotating blessing | "शुभ हो! भगवान आपकी सभी मनोकामनाएं पूरी करें।" (+2 siblings) — apps/web/app/dashboard/components/PujaCompletionModal.tsx:22-24,48 | founder call — warmth at the completion moment, carries no platform claim; strict law says it goes, taste may say it stays |
| /help | no-phone virtue tail | "and we would rather say this plainly than give you a number that rings nowhere." — apps/web/app/help/page.tsx:91-92 | kill — the subject is the platform's own virtue (self-praise about honesty); the plain statement already did the work |
| /pandit/[id] | bio fallback (fabricated first-person) | "Hi, I am an experienced Pandit Ji available for all types of Pujas and Anushthans. My rituals follow authentic Vedic traditions." — page.tsx:81 | kill — replace with honest empty state ("पंडित जी ने अभी परिचय नहीं लिखा"); never fabricate the pandit's own voice. Slot itself (real bio) stays |
| /pandit/[id] | invented certificate name | "Vedic Shiksha Praman Patra {idx + 1}" — page.tsx:141 | kill — the name is fabricated for an unexamined upload (certificateUrls is just URLs); show neutral "प्रमाणपत्र {n}" + a view link |
| /pandit/[id] | subtitle fallback | {specializations?.[0] || 'Vedic Priest & Ritual Expert'} — page.tsx:227 | slot (first specialization) is DECIDES — keep; kill the fabricated 'Vedic Priest & Ritual Expert' fallback, render nothing when absent |
| /pandit/[id] | Watch Intro button | "Watch Intro" — page.tsx:231 | kill — dead control: no onClick, no intro video exists anywhere |
| /pandit/[id] | favourite heart button | "❤️" — page.tsx:267-269 | kill or wire — dead control, no onClick |
| /pandit/[id] | Share Profile button | "Share Profile" — page.tsx:270-273 | kill or wire — dead control, no onClick |
| /pandit/[id] | Load More Reviews button | "Load More Reviews" — page.tsx:393-395 | kill or wire — dead control (no onClick, sits in an async server component; pagination never happens) |
| /pandit/[id] | service description fallback | "Complete ${service.pujaType} ceremony with full vedic rituals." — ServicesTab.tsx:75 | kill fallback (render nothing when no description); real description slot stays |
| /pandit/[id] | booked-day tooltip fabricated count | title = status === "booked" ? "1 booking" — AvailabilityCalendar.tsx:171 | replace with "Booked" — the count 1 is not in the data; a fabricated specific |
| /pandit/[id] | desktop CTA over-claiming label | "Check Availability & Book" — BookingCTA.tsx:77 | replace with "Book Now" — the button checks nothing; it routes straight to the wizard |
| /search | Search All India toggle + subtitle | "Search All India" :430, "Broaden your search" :433 — apps/web/app/search/search-client.tsx | kill or wire — mutates state but fetchPandits (:210-247) never sends searchAllIndia; a filter that filters nothing is a lie in toggle form |
| /search | Regions Coverage checkboxes | "Regions Coverage" :459; "Varanasi (Kashi)…Mathura" (REGIONS :91-97) — apps/web/app/search/search-client.tsx | kill or wire — filters.regions never sent to the API; dead control |
| /search | Experience filter radios | "Experience" :488; "15+ Years","10+ Years","5+ Years" :491 — apps/web/app/search/search-client.tsx | kill or wire — filters.experience never sent to the API; dead control |
| /search | promo banner | "Upcoming Events" :529, "Ganga Aarti Special / Varanasi" :532-534 — apps/web/app/search/search-client.tsx | kill — hardcoded promo, no data or link behind it |
| /search | Search-All-India active chip | "Search All India: ON" — apps/web/app/search/search-client.tsx:737 | kill with the toggle — echoes a filter that does nothing |
| /search | list count micro-label | {pandits.length} पंडित जी उपलब्ध — apps/web/app/search/search-client.tsx:805 | kill — duplicates the :709 header count (and diverges from it after Load More); one count per screen |
| /search | real-prices self-assurance | "सभी दाम असली हैं" — apps/web/components/design/GuestMode.tsx:62 (rendered search-client.tsx:806) | ruled kill (a) — delete RealPricesNote and its callsite |
| /search (card) | pooja video pending row | "इस पूजा का वीडियो" :202 / "जाँच में" :204 — apps/web/components/design/PanditRecordCard.tsx | kill on search card (borderline — founder to rule): an unwatchable, unreviewed video helps no choice; show only the verified state |
| /search (dead code) | EnhancedPanditCard component (never rendered) | function EnhancedPanditCard — apps/web/app/search/search-client.tsx:251-394; contains unconditional 5 filled stars :303-311, "₹{(t.price / 1000).toFixed(0)}k" (always ₹0k) :348, "Next: {pandit.nextSlot}" (never set) :332, "Ritual Specialist"/"Scholar" :295 | kill — delete dead component; if ever revived it would fabricate a five-star row and ₹0k fares |
| /search (footer) | money note, English tail | "Samagri & travel settled directly with the pandit. Never added here, never estimated." — apps/web/components/design/Verification.tsx:155 | keep the translation clause, kill "Never added here, never estimated." — self-assurance sibling of ruled kill (a) |
| /search (footer) | no-reviews notice, English tail | "No stars anywhere until real reviews exist." — apps/web/components/design/Verification.tsx:171 | ruled kill (sibling of a) — platform-virtue self-assurance; the Hindi fact line carries the content |
| /search (guest only) | guest strip | "पूरा मंच देखिए · खाता बाद में" — apps/web/components/design/GuestMode.tsx:47 (thumb variant :39; rendered search-client.tsx:803 for guests only) | kill as assurance-class sibling UNLESS founder exempts as guest-mode affordance (design-canon 'paywall at commitment'); it is already guest-only |
| app-wide: Footer | brand tagline | "Empowering devotees through accessible technology for a divine spiritual experience." — apps/web/components/Footer.tsx:17 | ruled kill — self-assurance class; subject is the platform's own virtue |
| app-wide: Footer | Upcoming Puja link | "Upcoming Puja" (href /muhurat) — apps/web/components/Footer.tsx:25 | ruled kill — doors the canon-cut muhurat, and the label does not even match the destination |
| app-wide: Footer | Pricing Details ghost link | "Pricing Details" (href /pricing) — apps/web/components/Footer.tsx:26 | kill or build — /pricing does not exist in apps/web/app (verified); a 404 dressed as a link (F-J4-15 class) |
| app-wide: Footer | newsletter block (dead form) | "Newsletter" / "Stay updated with spiritual events and offers." / placeholder "Email address" / send — apps/web/components/Footer.tsx:42-46 | kill — no handler, no newsletter system; collects nothing, promises 'offers' that don't exist |
| app-wide: Footer | Admin Portal link | "Admin Portal" — apps/web/components/Footer.tsx:55-57 | kill — ops door on a customer surface; developer text in link form |
| app-wide: Footer | social icons (dead) | public / forum / mail icons, all href="#" — apps/web/components/Footer.tsx:59-61 | kill until real profiles exist — three links to nowhere |
| app-wide: Header | nav link Muhurat Explorer | "Muhurat Explorer" (href /muhurat) — apps/web/components/Header.tsx:47 | ruled kill — canon deletes muhurat outright ('fabricated data → nothing'); endpoint measured returning empty; Home already cut its section, the header still doors it |
| app-wide: Header | nav link For Pandits | "For Pandits" — apps/web/components/Header.tsx:48 | drop from customer header; keep the footer entry as the supply-side door |
| app-wide: Header | guest status chip | "Exploring as Guest" — apps/web/components/Header.tsx:108-110 | kill or fold into GuestStrip — turn-2 law makes GuestStrip ('पूरा मंच देखिए · खाता बाद में') the one guest voice; this chip is a second, English, status-flavoured one |
| unrouted (dead export) | PoojaVideoBadge pending | "इस पूजा का वीडियो जाँच में" — apps/web/components/design/Verification.tsx:82 | kill (same borderline class as the card's जाँच में row) — unverifiable claim; founder to rule with row 28 |

## DOOR (7)

| surface | element | quote / evidence | recommendation |
|---|---|---|---|
| / (home) | featured section subtitle | "Verified experts ready to travel anywhere" — apps/web/app/page.tsx:152 | replace with a fact ('Sorted by rating') — 'Verified' is the door class; 'ready to travel anywhere' is an unverified claim |
| / (home) | green check badge on card | "✅" — apps/web/app/page.tsx:191 | ruled kill — identity-verified badge class (b); every listed pandit passed it |
| /booking/new | 'verified pandit' step subtitle | "Choose a verified pandit for your {form.ritualName}" — booking-wizard-client.tsx:1192 | drop "verified" — every pandit in the list passed the same gate; "Choose a pandit for your {ritual}" |
| /dashboard/favorites | identity badge | "✓ पहचान" when verificationStatus === 'VERIFIED' — apps/web/app/dashboard/favorites/page.tsx:127 | ruled kill — the पहचान-सत्यापित identity-badge class on a customer surface |
| /pandit/[id] | metadata title verified claim | `${pandit.user.name} — Verified Pandit | HmarePanditJi` — apps/web/app/pandit/[id]/page.tsx:25 | ruled kill (b) — tab/SEO title wears the universal identity badge; founder may carve out SEO, but on-surface it differentiates nothing |
| /pandit/[id] | 'verified ratings' qualifier | "{totalReviews} verified ratings" — page.tsx:320 | drop "verified" — every rating necessarily comes through a booking; the adjective differentiates nothing. Keep the count |
| /search (card) | identity pending row | "पहचान जाँच बाकी" — apps/web/components/design/PanditRecordCard.tsx:176 | ruled kill (sibling of the badge) — dies with :169; if identity gates listing, this state never reaches a customer |

## DECIDES (241)

| surface | element | quote / evidence | recommendation |
|---|---|---|---|
| / (home) | hero sub, sentence 2 | "Every cost — dakshina, travel, platform fee — is itemised before you pay." — apps/web/app/page.tsx:455 | keep — true, build-guarded pricing fact |
| / (home) | hero CTA | "Book Now" — apps/web/app/page.tsx:465 | keep — routes to /search |
| / (home) | search CTA | "Explore Now" — apps/web/app/page.tsx:106 | keep — routes to /search (though today always with empty params, see dead input row) |
| / (home) | featured section header | "⭐ Highly Rated Pandits" — apps/web/app/page.tsx:151 | keep — names a real sort (sort=rating) |
| / (home) | View All Pandits links | "View All Pandits →" — apps/web/app/page.tsx:158,231 | keep |
| / (home) | empty-state link | "Browse All Pandits →" — apps/web/app/page.tsx:173 | keep |
| / (home) | pandit name slot | "Pt. {p.name}" — apps/web/app/page.tsx:190 | keep — renders DB data |
| / (home) | city + experience slot | "{p.location} · {p.experienceYears}yr exp" — apps/web/app/page.tsx:193 | keep — TRUE city beats fabricated km; compute honest distance only once location is granted (ruled: flag, don't invent) |
| / (home) | rating slot | "⭐ {p.rating.toFixed(1)} ({p.totalReviews})" — apps/web/app/page.tsx:195-197 | keep — real reviews when they exist; verify the underlying rows are not seed-fabricated |
| / (home) | specialization chips slot | "{s}" (specializations.slice(0,3)) — apps/web/app/page.tsx:203-205 | keep — puja chips |
| / (home) | card CTA View Profile | "View Profile" — apps/web/app/page.tsx:214 | keep |
| / (home) | card CTA Book Now | "Book Now" — apps/web/app/page.tsx:220 | keep wording; note it routes to /login, which fights the paywall-at-commitment law — route, not text, needs the fix |
| / (home) | Popular Services header | "Popular Services" — apps/web/app/page.tsx:496 | keep section; consider renaming to 'Ceremonies' — no popularity data backs 'Popular' |
| / (home) | ceremony-guide entry link | "What each ceremony involves →" — apps/web/app/page.tsx:502 | keep — the guide's named entry point |
| / (home) | puja tiles (emoji + Roman + Devanagari) | "{c.emoji} {c.label} {c.sub}" from PUJA_TYPES — apps/web/app/page.tsx:514-526 | keep — canon vocabulary, canonical filter links |
| / (home) | value card 2 (travel) | "Travel Costs Upfront" / "The Pandit's travel allowance is itemised in your booking total before you pay — no hidden logistics charges, no surprises on the day." — apps/web/app/page.tsx:553-554 | keep the itemisation fact; trim the 'no surprises on the day' self-assurance tail |
| / (home) | CTA header | "Ready to book your ceremony?" — apps/web/app/page.tsx:606 | keep — plain CTA |
| / (home) | CTA button | "Get Started Now" — apps/web/app/page.tsx:611 | keep — routes to /search |
| / (home) | language modal title | "Choose App Language" — apps/web/app/page.tsx:335 | keep — utility |
| / (home) | language buttons | "Continue in English" / "Hindi mein jaari rakhein" — apps/web/app/page.tsx:342,348 | keep |
| / (home) | tutorial chrome | "Tutorial {n}/{4}" / "Skip Tutorial" / "Skip" / "Next" / "Start Exploring" — apps/web/app/page.tsx:361,364,378,384 | keep — utility chrome, wording fine |
| / (home) | tutorial slide 1 | "Explore all pujas without registration." — apps/web/app/page.tsx:47 | keep — says what the guest CAN do (turn-2 law) |
| / (home) | tutorial slide 3 | "Manage travel, food, samagri — all in one place." — apps/web/app/page.tsx:49 | keep — names real booking line items; trim the 'all in one place' filler |
| / (home) | tutorial slide 4 | "Guest Mode — no need to register until you book." — apps/web/app/page.tsx:50 | keep — states the gate's true location |
| / (home) | location prompt title | "Allow location access to find pandits near you?" — apps/web/app/page.tsx:398 | keep |
| / (home) | location prompt subtitle | "This is optional. You can continue without sharing location." — apps/web/app/page.tsx:401 | keep — honest, non-coercive |
| / (home) | location prompt buttons | "Not Now" / "Allow Location" — apps/web/app/page.tsx:408,414 | keep |
| / (home) | location result toasts | "Location enabled — we can show pandits near you." (+2 siblings) — apps/web/app/page.tsx:312,319,323 | keep — honest status; note nothing on Home actually uses the granted location yet |
| / (home) | floating replay-tutorial button | "?" (title "Replay tutorial") — apps/web/app/page.tsx:427-437 | keep ONE — duplicates Header's identical '?' button on ≥sm viewports |
| /booking-confirmed/[bookingId] | loading state | "Loading your booking…" — apps/web/components/design-system/SurfaceState.tsx:69 via booking-confirmed/[bookingId]/page.tsx:116 | keep |
| /booking-confirmed/[bookingId] | error state | "We couldn't load your booking" / "This is our side, not yours — nothing about your booking has changed." / "Try again" — apps/web/components/design-system/SurfaceState.tsx:82-94 via page.tsx:117 | keep (ERROR≠EMPTY done right, retry enforced by type) |
| /booking-confirmed/[bookingId] | not-found state | "We couldn't find that booking" / "It may belong to a different account." / "See My Bookings" — apps/web/app/booking-confirmed/[bookingId]/page.tsx:123-131 | keep (honest empty with a way out) |
| /booking-confirmed/[bookingId] | H1 payment-truth heading | "🙏 Booking confirmed" / "🙏 Booking received" — apps/web/app/booking-confirmed/[bookingId]/page.tsx:148 | keep (reads paymentStatus instead of asserting) |
| /booking-confirmed/[bookingId] | status subline | "Booking confirmed" / "Booking created — payment pending" — apps/web/app/booking-confirmed/[bookingId]/page.tsx:151 | keep the pending variant; replace the paid variant — it repeats the H1 verbatim one line above |
| /booking-confirmed/[bookingId] | Booking ID row | "Booking ID" + "{booking.bookingNumber}" — apps/web/app/booking-confirmed/[bookingId]/page.tsx:159-160 | keep |
| /booking-confirmed/[bookingId] | amount row | "Amount paid"/"Amount due" + "₹{booking.grandTotal}" — apps/web/app/booking-confirmed/[bookingId]/page.tsx:164-169 | keep (label itself reads the payment truth) |
| /booking-confirmed/[bookingId] | fee disclosure | "Includes a ₹{platformFee} platform fee" — apps/web/app/booking-confirmed/[bookingId]/page.tsx:172 | keep |
| /booking-confirmed/[bookingId] | ceremony/date/pandit rows | "Ceremony"/"Date"/"Pandit ji" + values, fallback "Not assigned yet" — apps/web/app/booking-confirmed/[bookingId]/page.tsx:180-195 | keep (honest fallback) |
| /booking-confirmed/[bookingId] | next-steps heading | "What happens next" — apps/web/app/booking-confirmed/[bookingId]/page.tsx:202 | keep |
| /booking-confirmed/[bookingId] | paid step row | "Payment received" / "Your payment has been processed." — apps/web/app/booking-confirmed/[bookingId]/page.tsx:205 | keep (renders only when CAPTURED) |
| /booking-confirmed/[bookingId] | pending step row | "Payment pending" / "This booking is held, but it is not confirmed until the payment is made." — apps/web/app/booking-confirmed/[bookingId]/page.tsx:207-210 | keep (the exact truth the deleted fabrication hid) |
| /booking-confirmed/[bookingId] | pandit-confirms step row | "Pandit ji confirms" / "Pandit ji will review the request and confirm." — apps/web/app/booking-confirmed/[bookingId]/page.tsx:212 | keep |
| /booking-confirmed/[bookingId] | keep-ready step row | "What to keep ready" / "Once confirmed, you will see Pandit ji's name and phone number on the booking." — apps/web/app/booking-confirmed/[bookingId]/page.tsx:213-216 | replace the title — the body is about the phone number appearing, not about anything the customer keeps ready |
| /booking-confirmed/[bookingId] | disabled pay control | "Complete payment" (disabled) — apps/web/app/booking-confirmed/[bookingId]/page.tsx:229-234 | keep (disabled-with-reason per canon law; F-J7-3's door) |
| /booking-confirmed/[bookingId] | disabled-control reason | "Online payment opens once our payment confirmation is live — until then, call us and we will take it from there." — apps/web/app/booking-confirmed/[bookingId]/page.tsx:236-239 | replace "call us" — /help ships stating "We do not have a phone line yet"; this instructs an impossible action, align the two surfaces |
| /booking-confirmed/[bookingId] | copy CTA + feedback | "Copy details" :248 + alert "Copied to clipboard!" :93 — apps/web/app/booking-confirmed/[bookingId]/page.tsx | keep (swap native alert for a toast when convenient) |
| /booking-confirmed/[bookingId] | view-details CTA | "View details →" — apps/web/app/booking-confirmed/[bookingId]/page.tsx:251-255 | keep |
| /booking/new | ritual option slot (live data) | "{r.name} ({r.nameHindi}) · {r.durationMinutes} min" — booking-wizard-client.tsx:1010 | keep (renders API data once loaded) |
| /booking/new | pandit-list error state | "पंडित जी की सूची अभी नहीं आ पाई" + "यह कनेक्शन की समस्या है — इसका मतलब यह नहीं कि कोई पंडित जी उपलब्ध नहीं हैं।" — booking-wizard-client.tsx:1208-1210 | keep |
| /booking/new | pandit-list honest empty state | "इस पूजा के लिए अभी कोई पंडित जी नहीं मिले" + "…अभी कोई सत्यापित पंडित जी उपलब्ध नहीं हैं। दूसरी पूजा चुनिए, या हमसे संपर्क कीजिए।" — booking-wizard-client.tsx:1224-1226 | keep the empty state; drop the DOOR word "सत्यापित" inside it |
| /booking/new | pandit card facts (name/rating/reviews/city) | {p.displayName} · star {p.averageRating} · "{p.totalReviews} reviews" · {p.city} — booking-wizard-client.tsx:1275-1288 | keep; render honest no-reviews when totalReviews=0 (raw "0" rating reads as a score). Ruling (c) flag: TRUE city stays for now — here honest distance IS computable (venue city known + server distance matrix); until wired, do not invent km |
| /booking/new | pandit specialization mini-chips | {p.specializations.slice(0, 3)} — booking-wizard-client.tsx:1291-1293 | keep |
| /booking/new | honest unpriced-pandit state | "दक्षिणा तय नहीं" / "बुकिंग अभी नहीं" — booking-wizard-client.tsx:1299-1300 | keep — absence rendered as absence, selection honestly blocked |
| /booking/new | local-booking explainer | "Local Booking Detected" + "Pandit and venue are in the same city, so travel/accommodation step is auto-skipped as per platform policy." — booking-wizard-client.tsx:1328-1332 | keep the fact; drop "as per platform policy" (platform-voice filler). Note: branch is near-unreachable — next() skips step 2 for local bookings |
| /booking/new | local food-allowance note | "Food allowance remains optional for puja day only. Outstation travel policies do not apply here." — booking-wizard-client.tsx:1334 | keep, reword plainer |
| /booking/new | travel error state | "यात्रा का खर्च अभी नहीं आ पाया" + "…बिना सही खर्च के आगे बढ़ना ठीक नहीं — कृपया फिर कोशिश कीजिए।" — booking-wizard-client.tsx:1357-1359 | keep |
| /booking/new | travel honest empty state | "इस रास्ते के लिए यात्रा विकल्प नहीं मिले" + "हमारे पास इन दोनों शहरों के बीच का खर्च दर्ज नहीं है।" — booking-wizard-client.tsx:1365-1367 | keep |
| /booking/new | travel option cards | {t.label} + "Est. {t.estimatedDuration}" / "Standard Travel" + {fmt(t.totalCost)} — booking-wizard-client.tsx:1411-1417 | keep (real API costs); kill the "Standard Travel" filler fallback — render nothing when duration is absent |
| /booking/new | food arrangement options | "Yes, I will provide meals on puja days" / "No, please add food allowance" + real ₹/day descs — booking-wizard-client.tsx:1439-1445 | keep — a real money choice with real numbers |
| /booking/new | food policy disclosure | "Platform policy: food allowance is non-negotiable at ₹1,000/day. Outstation travel days are always counted…" — booking-wizard-client.tsx:1475-1476 | keep — explains the money math before it lands in the total |
| /booking/new | accommodation choice buttons | "Customer will arrange hotel" / "Book via platform" — booking-wizard-client.tsx:1488-1489 | keep the choice (posted to server); FLAG "Book via platform": no booking flow exists — accommodation is settled offline at the puja; wording promises a service, verify or rename honestly |
| /booking/new | local cab checkbox | "Add local cab (hotel to/from venue) via platform" — booking-wizard-client.tsx:1544 | keep (editable money input); flag the ₹800 seed default — an invented starting number, seed empty or from a real quote |
| /booking/new | samagri path cards | "Pandit's Fixed Package" / "Platform Custom List" + descs — booking-wizard-client.tsx:1586-1598 | keep — a real choice with real consequences |
| /booking/new | selected samagri summary | "{packageName} Package" / "Custom Item List" + "Selected" + "Total: {fmt}" — booking-wizard-client.tsx:1638-1648 | keep |
| /booking/new | review-screen event facts | Event Type / Primary Pandit / Date & Time / Venue values — booking-wizard-client.tsx:1707-1723 | keep — the booking's own facts, the screen's whole job |
| /booking/new | samagri itemization row | "Samagri Package" + "Settled at booking — paid directly to Pandit Ji, not charged now" — booking-wizard-client.tsx:1748-1749 | keep — says exactly when and to whom the money moves |
| /booking/new | logistics breakdown rows | "Travel Allowance ({form.travelMode})" / "Local cab…" / "Food Allowance ({n} days)" / "Accommodation — settled at booking…" — booking-wizard-client.tsx:1757-1777 | keep |
| /booking/new | platform fee line + amount | "Platform Fee" + {fmt(platformFee)} — booking-wizard-client.tsx:1788, 1791 | keep — fee named with its real amount before payment |
| /booking/new | sticky total rows | "Dakshina + travel + food" / "प्लेटफ़ॉर्म शुल्क (वापस नहीं होगा)" / "Settled at booking" / "Pay Now" + amounts — booking-wizard-client.tsx:1872-1893 | keep — honest fee-disclosed composition (founder P0) |
| /booking/new | confirmation headline | "Booking Confirmed!" + "Your booking has been placed successfully." — booking-wizard-client.tsx:924-925 | keep (fallback screen; primary path routes to /booking-confirmed/[id]) |
| /booking/new | booking number chip + placeholder fallback | {form.bookingNumber || "HPJ-XXXXXX"} — booking-wizard-client.tsx:927 | keep the slot; kill the "HPJ-XXXXXX" developer placeholder AND the client-minted `HPJ-${Date.now()}` fallback (:807) — an absent number should render as absence, not a fabricated one |
| /booking/new | confirmation facts | {form.ritualName} / event date / {form.panditName} — booking-wizard-client.tsx:932-941 | keep |
| /booking/new | amount-paid line | "{fmt(payNow)} paid" — booking-wizard-client.tsx:944 | keep, but show the SERVER order amount (form.orderAmount — the figure actually charged), not client-computed payNow |
| /booking/new | pandit-notified next-step line (mojibake) | "ðŸ™ Pandit Ji will be notified and will confirm shortly" — booking-wizard-client.tsx:949 | keep — tells the customer what happens next (accept flow is real); fix the corrupted emoji |
| /ceremonies | page title | "Ceremony guide" — apps/web/app/ceremonies/page.tsx:98 | keep — canon ★ screen |
| /ceremonies | intro paragraph | "What each ceremony involves — how long it runs and what it usually costs. Written plainly, so you know what you are booking before you book it." — apps/web/app/ceremonies/page.tsx:100-101 | keep first sentence; cut 'Written plainly…' — self-referential filler |
| /ceremonies | loading + error states | SurfaceState kind="loading"/"error" with retry — apps/web/app/ceremonies/page.tsx:106-108 | keep — error ≠ empty, with retry |
| /ceremonies | ceremony name + Devanagari slot | "{label}" / "{r?.nameHindi || PUJA_LABELS_HI[t]}" — apps/web/app/ceremonies/page.tsx:122-125 | keep — renders data, canon vocabulary |
| /ceremonies | price range slot | "₹{basePriceMin}–₹{basePriceMax}" — apps/web/app/ceremonies/page.tsx:130-134 | keep — real price, money-floor compliant |
| /ceremonies | duration row | "How long" → "about {n} hours" / "Not recorded yet" — apps/web/app/ceremonies/page.tsx:140-144 | keep — real field with honest absence fallback |
| /ceremonies | four honest-absence rows | "How many people can sit" / "What to keep ready" / "Who brings the samagri" / "Flat / havan notes" each → "Not recorded yet" — apps/web/app/ceremonies/page.tsx:52-57,151-155 | keep (honest absence is the canon's own rule); founder may collapse 4 identical 'Not recorded yet' rows into one line until data exists |
| /ceremonies | unmatched-ceremony note | "We do not have the details for this ceremony yet — you can still book a Pandit ji for it." — apps/web/app/ceremonies/page.tsx:160-163 | keep — honest empty state that still opens the path |
| /ceremonies | per-ceremony CTA | "Find a Pandit ji for {label}" — apps/web/app/ceremonies/page.tsx:171 | keep — links with canonical pujaType value |
| /dashboard/bookings | page title | "My Bookings" — apps/web/app/dashboard/bookings/page.tsx:76 | keep (orientation chrome, wording clean) |
| /dashboard/bookings | filter tabs | "All" / "Upcoming" / "Completed" / "Cancelled" — apps/web/app/dashboard/bookings/page.tsx:58-63 | keep (working filters) |
| /dashboard/bookings | loading line | "Loading bookings..." — apps/web/app/dashboard/bookings/page.tsx:82 | keep (honest wait state) |
| /dashboard/bookings | signed-out heading (+🔒 glyph :91) | "बुकिंग देखने के लिए लॉगिन कीजिए" — apps/web/app/dashboard/bookings/page.tsx:92 | keep the state; flag Devanagari-on-action against turn-4 English-first law |
| /dashboard/bookings | signed-out body | "आपका सेशन नहीं मिला — इसका मतलब यह नहीं कि आपकी कोई बुकिंग नहीं है।" — apps/web/app/dashboard/bookings/page.tsx:94 | keep (no-session ≠ no-data, Isj ruling honored); same language flag |
| /dashboard/bookings | login CTA | "लॉगिन कीजिए →" — apps/web/app/dashboard/bookings/page.tsx:97 | keep action; replace script with English — turn-4 law: "never buttons" |
| /dashboard/bookings | empty-state heading (+🪔 glyph :104) | "अभी तक कोई बुकिंग नहीं है" — apps/web/app/dashboard/bookings/page.tsx:105 | keep copy; fix ERROR≠EMPTY — fetch catch leaves [] and this honest-empty fires on server failure |
| /dashboard/bookings | empty-state body | "You haven't made any bookings yet." — apps/web/app/dashboard/bookings/page.tsx:106 | keep; it restates :105 in the other script — pick one language per turn-4 |
| /dashboard/bookings | empty-state CTA | "Explore Pandits →" — apps/web/app/dashboard/bookings/page.tsx:108 | keep (routes to the decision surface) |
| /dashboard/bookings | event-type icon slot (BookingCard) | getEventIcon → 🎊/🏠/📖/🕊️/🙏/🕉️ — apps/web/app/dashboard/components/BookingCard.tsx:5-13,47 | keep (scan aid keyed to the booking's own event type) |
| /dashboard/bookings | event type (BookingCard) | "{booking.eventType}" — apps/web/app/dashboard/components/BookingCard.tsx:50 | keep (data slot, booking's own fact) |
| /dashboard/bookings | event date (BookingCard) | "{formattedDate}" (hi-IN long form) — apps/web/app/dashboard/components/BookingCard.tsx:51 | keep |
| /dashboard/bookings | pandit name (BookingCard) | "{panditTitleName(booking.pandit)}" — apps/web/app/dashboard/components/BookingCard.tsx:53 | keep (renders only when a name exists) |
| /dashboard/bookings | venue city (BookingCard) | "{booking.venueCity}" — apps/web/app/dashboard/components/BookingCard.tsx:55 | keep — this is the customer's own venue, not the ruled pandit-city class |
| /dashboard/bookings | status badge (BookingCard) | "Pending/Awaiting Pandit/Confirmed/Travel Ready/Pandit On Way/Pandit Arrived/Puja Started/Completed/Cancelled/Refunded" — apps/web/app/dashboard/components/BookingCard.tsx:17-27,58 | keep (friendly labels — the detail page should borrow these, see its Badge row) |
| /dashboard/bookings | price (BookingCard) | "₹{booking.grandTotal.toLocaleString('en-IN')}" — apps/web/app/dashboard/components/BookingCard.tsx:60 | keep |
| /dashboard/bookings | fee disclosure (BookingCard) | "इसमें ₹{platformFee} प्लेटफ़ॉर्म शुल्क शामिल है" — apps/web/app/dashboard/components/BookingCard.tsx:63 | keep (founder P0 disclosure); flag Devanagari — the confirmed screen's identical disclosure was reversed to English 2026-08-02 |
| /dashboard/bookings/[bookingId] | loading line | "Loading booking details..." — apps/web/app/dashboard/bookings/[bookingId]/page.tsx:73 | keep |
| /dashboard/bookings/[bookingId] | not-found line | "Booking not found." — apps/web/app/dashboard/bookings/[bookingId]/page.tsx:74 | keep for a true miss; fix ERROR≠EMPTY — the fetch catch lands here too, telling a customer his booking doesn't exist when the server hiccuped |
| /dashboard/bookings/[bookingId] | back link | "Back to My Bookings" — apps/web/app/dashboard/bookings/[bookingId]/page.tsx:129 | keep (chrome, wording clean) |
| /dashboard/bookings/[bookingId] | H1 event type | "{booking.eventType}" — apps/web/app/dashboard/bookings/[bookingId]/page.tsx:133 | keep |
| /dashboard/bookings/[bookingId] | booking number | "Booking ID: {booking.bookingNumber}" — apps/web/app/dashboard/bookings/[bookingId]/page.tsx:134 | keep (support reference) |
| /dashboard/bookings/[bookingId] | status Badge | "{booking.status.replace(/_/g, ' ')}" — apps/web/app/dashboard/bookings/[bookingId]/page.tsx:137 | replace raw spaced enum ("PANDIT EN ROUTE") with BookingCard.tsx:17-27's friendly labels |
| /dashboard/bookings/[bookingId] | banner PANDIT_EN_ROUTE | "🚗 Pandit is on the way!" — apps/web/app/dashboard/bookings/[bookingId]/page.tsx:110 | keep (live status fact) |
| /dashboard/bookings/[bookingId] | banner PANDIT_ARRIVED | "🙏 Pandit has arrived!" — apps/web/app/dashboard/bookings/[bookingId]/page.tsx:111 | keep |
| /dashboard/bookings/[bookingId] | banner PUJA_IN_PROGRESS | "🕉️ Puja is happening..." — apps/web/app/dashboard/bookings/[bookingId]/page.tsx:112 | keep |
| /dashboard/bookings/[bookingId] | banner COMPLETED | "✅ Puja Completed — Share your experience!" — apps/web/app/dashboard/bookings/[bookingId]/page.tsx:113 | keep (status + a real next action) |
| /dashboard/bookings/[bookingId] | banner CANCELLED | "❌ Booking Cancelled" — apps/web/app/dashboard/bookings/[bookingId]/page.tsx:114 | keep |
| /dashboard/bookings/[bookingId] | banner default | "Status: ${booking.status}" — apps/web/app/dashboard/bookings/[bookingId]/page.tsx:106 | replace raw enum with friendly label (PANDIT_REQUESTED and REFUNDED fall through to this) |
| /dashboard/bookings/[bookingId] | detail tabs | "Overview" / "Itinerary" / "Documents" — apps/web/app/dashboard/bookings/[bookingId]/page.tsx:77-79 | keep |
| /dashboard/bookings/[bookingId] | Event Details card (heading + 📅 Date & Time + value) | "Event Details" :154, "Date & Time" :159, "{formattedDate}" :160 — apps/web/app/dashboard/bookings/[bookingId]/page.tsx | keep |
| /dashboard/bookings/[bookingId] | muhurat line | "शुभ मुहूर्त: {booking.muhuratTime}" — apps/web/app/dashboard/bookings/[bookingId]/page.tsx:161 | keep (renders only when set) |
| /dashboard/bookings/[bookingId] | venue block (📍 label + address/city/pincode) | "Venue" :167, "{booking.venueAddress}" :168, "{booking.venueCity}, {booking.venuePincode}" :169 — apps/web/app/dashboard/bookings/[bookingId]/page.tsx | keep |
| /dashboard/bookings/[bookingId] | maps link | "Open in Maps" — apps/web/app/dashboard/bookings/[bookingId]/page.tsx:171 | keep |
| /dashboard/bookings/[bookingId] | special instructions (📝 label + value) | "Special Instructions" :179, "{booking.specialInstructions}" :180 — apps/web/app/dashboard/bookings/[bookingId]/page.tsx | keep (conditional on data) |
| /dashboard/bookings/[bookingId] | Assigned Pandit heading + name slot | "Assigned Pandit" :190, "{panditTitleName(booking.pandit) ?? 'Pandit being assigned'}" :199 — apps/web/app/dashboard/bookings/[bookingId]/page.tsx | keep (honest fallback replaced the bare-honorific bug) |
| /dashboard/bookings/[bookingId] | profile link | "View Profile →" — apps/web/app/dashboard/bookings/[bookingId]/page.tsx:201 | keep |
| /dashboard/bookings/[bookingId] | contact buttons | "Call" :211 / "WhatsApp" :215 — apps/web/app/dashboard/bookings/[bookingId]/page.tsx | keep (gated on a real number — the tel:undefined dead-link class is already dead) |
| /dashboard/bookings/[bookingId] | phone-gating note | "Phone number will be visible closer to event date after travel is confirmed." — apps/web/app/dashboard/bookings/[bookingId]/page.tsx:220 | keep; fix wording — showContact (:120) opens the phone at CONFIRMED, before any travel, so "after travel is confirmed" misstates the real gate |
| /dashboard/bookings/[bookingId] | assignment-pending state (🕒 + heading + body) | "Pandit Assignment Pending" :227, "आपकी पूजा के लिए पंडित जी खोजे जा रहे हैं।" :232 — apps/web/app/dashboard/bookings/[bookingId]/page.tsx | keep (specific, superlative already removed); flag Devanagari sentence vs turn-4 |
| /dashboard/bookings/[bookingId] | Status Tracker heading + timeline steps | "Status Tracker" :240; step labels "h.toStatus.replace(/_/g,' ')" + DB note — apps/web/app/dashboard/bookings/[bookingId]/page.tsx:83-101 | keep; replace raw spaced enums ("TRAVEL BOOKED") with friendly labels |
| /dashboard/bookings/[bookingId] | price breakdown card | <PriceBreakdown breakdown={booking} /> — apps/web/app/dashboard/bookings/[bookingId]/page.tsx:245 | keep (price facts; its labels live in packages/ui — outside this census's file set, audit there) |
| /dashboard/bookings/[bookingId] | review CTA | "⭐ Write Review" — apps/web/app/dashboard/bookings/[bookingId]/page.tsx:256 | keep |
| /dashboard/bookings/[bookingId] | cancel CTA | "Cancel Booking" — apps/web/app/dashboard/bookings/[bookingId]/page.tsx:261 | keep |
| /dashboard/bookings/[bookingId] | Muhurat Patrika DocumentCard | "Muhurat Patrika" / "Auspicious Timing Certificate" / "View Certificate" — apps/web/app/dashboard/bookings/[bookingId]/page.tsx:286-292 | keep (opens the real Patrika view) |
| /dashboard/bookings/[bookingId] | completion-certificate DocumentCard | "Puja Completion Certificate" / "View & Share" — apps/web/app/dashboard/bookings/[bookingId]/page.tsx:296-301 | keep (opens the real modal) |
| /dashboard/bookings/[bookingId] | muhurat-view back button | "Back to Documents" — apps/web/app/dashboard/bookings/[bookingId]/page.tsx:319 | keep |
| /dashboard/bookings/[bookingId] | MUHURAT WINDOW block (Itinerary tab) | "🕉️ MUHURAT WINDOW" + "शुभ मुहूर्त: {muhuratTime || 'निर्धारित नहीं'}" + venue line — apps/web/app/dashboard/components/ItineraryTimeline.tsx:11-18,54-57 | keep (booking facts, honest निर्धारित-नहीं fallback) |
| /dashboard/bookings/[bookingId] | travel-plan heading (Itinerary tab) | "✈️ Outstation Booking Travel Plan" — apps/web/app/dashboard/components/ItineraryTimeline.tsx:30 | keep |
| /dashboard/bookings/[bookingId] | travel-managed note (Itinerary tab) | "Travel arrangements for the pandit are managed by the admin. Real-time updates will appear here once booked." — apps/web/app/dashboard/components/ItineraryTimeline.tsx:33 | replace "managed by the admin" (internal vocabulary) with "we arrange..."; verify "real-time updates" against the cut tracking screen |
| /dashboard/bookings/[bookingId] | journey section (Itinerary tab) | "Journey to Venue" :38, "🚕 Transport Arranged" :42, "Status: {booking.travelStatus}" :43 — apps/web/app/dashboard/components/ItineraryTimeline.tsx | replace raw travelStatus enum with a friendly label; "Transport Arranged" renders before anything is arranged — condition it |
| /dashboard/bookings/[bookingId] | Puja Day heading (Itinerary tab) | "Puja Day" — apps/web/app/dashboard/components/ItineraryTimeline.tsx:49 | keep |
| /dashboard/bookings/[bookingId] | Patrika title | "श्री मुहूर्त पत्रिका" + "(Auspicious Timing Certificate)" — apps/web/app/dashboard/components/MuhuratPatrika.tsx:9-10 | keep (document identity; ceremonial Devanagari on a keepsake artifact — flag to founder whether turn-4's two-place rule covers it) |
| /dashboard/bookings/[bookingId] | Patrika fact rows | "पूजा:/दिनांक:/मुहूर्त:/कर्ता:/स्थान:/पुरोहित:" + booking values, fallbacks "निर्धारित नहीं"/"यजमान"/"___" — apps/web/app/dashboard/components/MuhuratPatrika.tsx:14-39 | keep (booking's own facts, honest fallbacks) |
| /dashboard/bookings/[bookingId] | Patrika footer brand + ID | "HmarePanditJi" / "ID: {booking.bookingNumber}" — apps/web/app/dashboard/components/MuhuratPatrika.tsx:46-47 | keep (provenance + reference) |
| /dashboard/bookings/[bookingId] | completion modal heading | "पूजा संपन्न हुई!" — apps/web/app/dashboard/components/PujaCompletionModal.tsx:43 | keep (completion fact) |
| /dashboard/bookings/[bookingId] | completion modal subtitle | "Puja Completed Successfully!" — apps/web/app/dashboard/components/PujaCompletionModal.tsx:45 | keep one of the two duplicate scripts; drop "Successfully" (filler) |
| /dashboard/bookings/[bookingId] | conducted-by row | "Conducted by" + "{panditTitleName(booking.pandit) ?? 'Unknown'}" — apps/web/app/dashboard/components/PujaCompletionModal.tsx:57-58 | keep; replace fallback "Unknown" — never render "Unknown" on a completed puja (hide the row instead) |
| /dashboard/bookings/[bookingId] | modal review CTA | "Rate Your Experience" — apps/web/app/dashboard/components/PujaCompletionModal.tsx:65 | keep |
| /dashboard/bookings/[bookingId] | modal dismiss CTA | "View Booking Details" — apps/web/app/dashboard/components/PujaCompletionModal.tsx:68 | keep (closes onto the details beneath — label is accurate) |
| /dashboard/favorites | empty-state heading | "आपने अभी तक कोई पंडित जी सेव नहीं किया है" — apps/web/app/dashboard/favorites/page.tsx:93 | keep copy; fix ERROR≠EMPTY — a failed fetch leaves [] and this honest-empty fires; language flag vs turn-4 |
| /dashboard/favorites | empty-state CTA | "Explore Pandits →" — apps/web/app/dashboard/favorites/page.tsx:96 | keep |
| /dashboard/favorites | page title | "My Favorites" (+ red heart icon) — apps/web/app/dashboard/favorites/page.tsx:104-105 | keep |
| /dashboard/favorites | remove confirm dialog | "Remove from favorites?" (native confirm) — apps/web/app/dashboard/favorites/page.tsx:63 | keep (guards a destructive tap) |
| /dashboard/favorites | photo slot + fallback | profilePhotoUrl img, else 🙏 — apps/web/app/dashboard/favorites/page.tsx:118-122 | keep (data slot) |
| /dashboard/favorites | pandit name slot | "{pandit.name}" — apps/web/app/dashboard/favorites/page.tsx:126 | keep (data slot) |
| /dashboard/favorites | rating + review count | "{profile.rating.toFixed(1)}" + "({profile.totalReviews} reviews)" — apps/web/app/dashboard/favorites/page.tsx:131-132 | keep when reviews exist; guard the zero case — "0.0 (0 reviews)" renders as a fabricated-looking score, hide until real |
| /dashboard/favorites | location line | "{profile.location}" (MapPin) — apps/web/app/dashboard/favorites/page.tsx:136 | ruled (c): replace with honest computed distance when the customer's location is known; TRUE city stays until then — never fabricate km |
| /dashboard/favorites | experience line | "{profile.experienceYears} years experience" — apps/web/app/dashboard/favorites/page.tsx:139 | keep (differentiating fact) |
| /dashboard/favorites | specialization chips | "{spec}" ×3 via specializations.slice(0, 3) — apps/web/app/dashboard/favorites/page.tsx:145-149 | keep (puja chips) |
| /dashboard/favorites | overflow chip | "+{specializations.length - 3} more" — apps/web/app/dashboard/favorites/page.tsx:150-153 | keep |
| /dashboard/favorites | remove button | "Remove" — apps/web/app/dashboard/favorites/page.tsx:164 | keep |
| /dashboard/favorites | book CTA | "Book Again →" — apps/web/app/dashboard/favorites/page.tsx:171 | replace label with "Book →" — "Again" asserts a booking history a merely-saved favorite may not have |
| /help | page title | "Help" — apps/web/app/help/page.tsx:63 | keep |
| /help | intro line | "If something about your booking is unclear, this page is the short version." — apps/web/app/help/page.tsx:64-66 | keep (sets scope, no self-praise) |
| /help | Talk to us heading | "Talk to us" — apps/web/app/help/page.tsx:71 | keep |
| /help | call CTA (config-gated) | "Call {support.display}" — apps/web/app/help/page.tsx:77-82 | keep (renders only when a real number is configured) |
| /help | staffed-hours line | "{hours}" — apps/web/app/help/page.tsx:86 | keep (rides only with the number, per the comment's own law) |
| /help | no-phone honest absence (first clause) | "We do not have a phone line yet. Everything below can be done from your own bookings," — apps/web/app/help/page.tsx:90-91 | keep (honest absence — the जल्द-उपलब्ध shape in English) |
| /help | cancellation heading | "Changing or cancelling a booking" — apps/web/app/help/page.tsx:99-100 | keep |
| /help | refund plain-words para | "Plans change. How much comes back depends on how far ahead you cancel — the earlier you tell us, the more of it returns. The platform fee is not refunded when you are the one cancelling." — apps/web/app/help/page.tsx:102-106 | keep (figures deliberately live only behind the guarded legal page) |
| /help | exact-amount sentence | "You cancel from your own bookings, and the exact amount is shown to you before you confirm anything." — apps/web/app/help/page.tsx:107-110 | keep |
| /help | bookings CTA | "Go to My Bookings" — apps/web/app/help/page.tsx:112-117 | keep |
| /help | terms link | "Read the full terms" — apps/web/app/help/page.tsx:120-125 | keep |
| /help | expectations heading | "Before the day itself" — apps/web/app/help/page.tsx:131-133 | keep |
| /help | pandit-review expectation para | "Pandit ji reviews every request before it is confirmed. Once he has, his name and phone number appear on the booking, so you can reach him directly about samagri, timing, or the space you have." — apps/web/app/help/page.tsx:134-138 | keep (specific process fact, matches the booking surfaces) |
| /help | ceremony-guide pointer | "If you are still deciding what a ceremony involves, the ceremony guide says how long each one runs and what it usually costs." — apps/web/app/help/page.tsx:139-145 | keep (routes to duration + cost — decision data) |
| /pandit/[id] | experience stat tile | "{experienceYears}+ Years" / "Experience" — page.tsx:88-89 | keep (renders DB data) |
| /pandit/[id] | ceremonies stat tile | "{completedBookings}" / "Ceremonies Performed" — page.tsx:93-94 | keep (renders DB data) |
| /pandit/[id] | rating stat tile | "{formattedRating} Rating" / "{totalRev} Reviews" — page.tsx:98-99 | keep, but when totalRev=0 render an honest "No reviews yet" instead of "0.0 Rating" |
| /pandit/[id] | language chips | "{lang}" — page.tsx:114 | keep (renders data) |
| /pandit/[id] | specialization chips | "{spec}" — page.tsx:124 | keep (renders data) |
| /pandit/[id] | online-now dot | title="Online now" — page.tsx:217 | keep (renders isOnline) |
| /pandit/[id] | hero location line | "{location} | {experienceYears}+ Years Experience | {completedBookings}+ Ceremonies" — page.tsx:236 | keep — ruling (c) flag: TRUE city stays (customer location unknown here, so no honest distance is computable; do not invent km) |
| /pandit/[id] | hero rating stat | "{formattedRating}" + "{totalRev} Reviews" — page.tsx:243-245 | keep; same 0-review honesty fix as the About tile |
| /pandit/[id] | hero ceremonies stat | "{completedBookings}+" / "Ceremonies" — page.tsx:249-250 | keep; drop the "+" when the count is 0 ("0+" reads as invented) |
| /pandit/[id] | travel-range badge | "✈️ Available All-India" / "🚗 Regional Travel" / "📍 Local (Delhi-NCR)" — page.tsx:59-63, rendered :254-255 | keep (derived from real maxTravelDistance) — but FLAG: travel is cut from v1 and outstation booking fails, so "Available All-India" advertises a journey the platform cannot currently complete |
| /pandit/[id] | star distribution rows | "{d.star} Stars" + "{Math.round(d.percentage)}%" — page.tsx:326-330 | keep |
| /pandit/[id] | sub-rating tiles | "Vedic Knowledge" / "Punctuality" / "Communication" + values — page.tsx:338-347 | keep |
| /pandit/[id] | individual review rows | {review.reviewerName}, date, stars, "Puja: {review.pujaType}", {review.comment} — page.tsx:366-390 | keep (real reviews, renders data) |
| /pandit/[id] | puja card title + hardcoded emoji | "💍 {service.pujaType}" — apps/web/app/pandit/[id]/ServicesTab.tsx:54 | keep title (data); replace the hardcoded 💍 — a wedding ring renders on every puja type including Rudrabhishek |
| /pandit/[id] | पूजा सत्यापित badge | "पूजा सत्यापित" — ServicesTab.tsx:62 | keep — per-puja video verification, genuinely differentiating (not the DOOR class) |
| /pandit/[id] | पूजा सत्यापन बाकी badge | "पूजा सत्यापन बाकी" — ServicesTab.tsx:66 | keep — honest differentiating state |
| /pandit/[id] | service price chip | "₹{service.dakshinaAmount}" — ServicesTab.tsx:71 | keep |
| /pandit/[id] | duration line | "⏱️ Duration: ~{service.durationHours} hours" — ServicesTab.tsx:79 | keep |
| /pandit/[id] | charges-composition note | "ⓘ Standard charges applied (+ samagri + travel if applicable)" — ServicesTab.tsx:82 | reword — keep the useful fact (samagri and travel are extra); "Standard charges applied" says nothing |
| /pandit/[id] | samagri price / honest absence | "Samagri: ₹{X}+" / "Not priced yet" — ServicesTab.tsx:88 | keep |
| /pandit/[id] | samagri view control | "[View & Choose →]" — ServicesTab.tsx:94 | keep control (opens real samagri prices); drop the dev-style square brackets |
| /pandit/[id] | sample video link | "▶ सत्यापित वीडियो सुनिए" / "पंडित जी का वीडियो ख़ुद सुनिए" — ServicesTab.tsx:121-123 | keep — the actual thing to judge by |
| /pandit/[id] | video honest absence | "वीडियो अभी उपलब्ध नहीं" — ServicesTab.tsx:126 | keep |
| /pandit/[id] | services honest empty state | "No services listed yet." — ServicesTab.tsx:155 | keep |
| /pandit/[id] | availability error state | "उपलब्धता अभी लोड नहीं हो पाई" + "यह कनेक्शन की समस्या है — इसका मतलब यह नहीं कि पंडित जी उपलब्ध नहीं हैं।" — apps/web/app/pandit/[id]/AvailabilityCalendar.tsx:119-121 | keep — ERROR != EMPTY done right |
| /pandit/[id] | availability honest empty state | "इस महीने की उपलब्धता दर्ज नहीं है" + "पंडित जी ने {monthName} {year} के लिए अपनी तारीख़ें अभी नहीं भरी हैं। दूसरा महीना देखिए।" — AvailabilityCalendar.tsx:133-135 | keep |
| /pandit/[id] | calendar day cells + legend | status-coloured day numbers :179; "Available" / "Booked" / "Blocked" — AvailabilityCalendar.tsx:187-189 | keep (renders real availability data) |
| /pandit/[id] | CTA honest price absence | "Dakshina" / "Not listed yet" — apps/web/app/pandit/[id]/BookingCTA.tsx:44-45 (mobile), 64-65 (desktop) | keep — absence rendered as absence, not ₹0 |
| /pandit/[id] | CTA starting price | "Starting from" / "₹{lowestPrice.toLocaleString('en-IN')}" — BookingCTA.tsx:49-50, 69-70 | keep |
| /search | screen header (pooja name) | {filters.ritual || "पंडित जी"} — apps/web/app/search/search-client.tsx:694 | keep — names the pooja being searched |
| /search | loading status | "Loading…" — apps/web/app/search/search-client.tsx:698 | keep — honest status |
| /search | header result count + city | `${pagination.total} पंडित जी` — apps/web/app/search/search-client.tsx:709 (· {location} :710) | keep — already truth-fixed from '{total} verified pandits' (comment :702-707) |
| /search | sort options | "Best Match / Rating / Price (Low → High) / Price (High → Low) / Distance" — apps/web/app/search/search-client.tsx:722-726 | keep — Distance correctly gated on city |
| /search | active ritual chip | {filters.ritual} — apps/web/app/search/search-client.tsx:745 | keep — states the active filter |
| /search | active date chip | {filters.date} — apps/web/app/search/search-client.tsx:753 | keep — states the active filter |
| /search | error banner + retry | "Failed to load pandits. Please try again." :607 (rendered :760), "Retry" :765 — apps/web/app/search/search-client.tsx | keep — honest failure state |
| /search | empty-state headline | "No pandits found" — apps/web/app/search/search-client.tsx:784 | keep — honest empty state |
| /search | empty-state hint | "Try adjusting your filters or search all India" — apps/web/app/search/search-client.tsx:786 | keep first clause; drop 'or search all India' — it points at the dead toggle |
| /search | empty-state reset button | "Clear All Filters" — apps/web/app/search/search-client.tsx:792 | keep — functional recovery action |
| /search | load-more button | "Load More ({pagination.total - pandits.length} more)" — apps/web/app/search/search-client.tsx:841 | keep — real remaining count |
| /search (card) | monogram avatar fallback | ch || "🙏" — apps/web/components/design/PanditRecordCard.tsx:48 | keep — honest fallback for missing photo, no fake portrait |
| /search (card) | pandit name slot | {name} — apps/web/components/design/PanditRecordCard.tsx:126 (renders DB data) | keep |
| /search (card) | roman transliteration slot | {romanName} — apps/web/components/design/PanditRecordCard.tsx:128 (renders DB data) | keep — reading aid, never machine-generated; note: search API sends none, so it never renders today (search-client.tsx:181) |
| /search (card) | dakshina price | ₹{(dakshina as number).toLocaleString("en-IN")} :135, "दक्षिणा" :137 — apps/web/components/design/PanditRecordCard.tsx | keep — the primary decision number |
| /search (card) | dakshina truthful-null | "दक्षिणा तय नहीं" — apps/web/components/design/PanditRecordCard.tsx:140 | keep — honest empty state, beats an invented ₹0 |
| /search (card) | pooja video verified row + watch link | "इस पूजा का वीडियो" :187, "देखें{poojaVideoDuration…}" :193 — apps/web/components/design/PanditRecordCard.tsx | keep — offering-specific, watchable proof; but unreachable today: mapper hardcodes poojaVideo="none" (search-client.tsx:159); wire when API sends per-pooja state |
| /search (card) | experience row | `${experienceYears} वर्ष अनुभव` — apps/web/components/design/PanditRecordCard.tsx:213 | keep — renders only when > 0 |
| /search (card) | per-pooja count | यह पूजा {poojaCount}+ बार — apps/web/components/design/PanditRecordCard.tsx:217 | keep — renders only when a real count exists; never fed today |
| /search (card) | place row (locality, city) | {place} — apps/web/components/design/PanditRecordCard.tsx:227 (built :107; renders DB data) | keep per ruling (c) — TRUE city beats fabricated distance; search API sends no distance (search-client.tsx:153), so do not invent km |
| /search (card) | distance value | `आपसे ${Math.round(distanceKm)} कि.मी.` — apps/web/components/design/PanditRecordCard.tsx:232 | keep — renders only when a real distance exists; wire when the API computes one |
| /search (card) | profile CTA | "प्रोफ़ाइल देखें" — apps/web/components/design/PanditRecordCard.tsx:245 | keep — the card's one action |
| /search (footer) | money note, Hindi fact | "सामग्री व यात्रा — पंडित जी से सीधे" — apps/web/components/design/Verification.tsx:153 (rendered search-client.tsx:831) | keep — tells the customer what the price excludes; a booking fact |
| app-wide: BottomNav | three tabs | "Home" / "Bookings" / "Help" — apps/web/components/BottomNav.tsx:34-36 | keep — canon-verbatim 3 tabs; every destination verified to resolve |
| app-wide: Footer | brand block | "HmarePanditJi" + temple_hindu icon — apps/web/components/Footer.tsx:13-14 | keep — brand chrome |
| app-wide: Footer | column headers | "Quick Links" / "Support" — apps/web/components/Footer.tsx:22,32 | keep — structural chrome, wording fine |
| app-wide: Footer | Find a Pandit link | "Find a Pandit" — apps/web/components/Footer.tsx:24 | keep |
| app-wide: Footer | For Pandits link | "For Pandits" — apps/web/components/Footer.tsx:27 | keep — footer is the right single home for the supply-side door |
| app-wide: Footer | Help Center link | "Help Center" — apps/web/components/Footer.tsx:34 | keep — /help exists |
| app-wide: Footer | legal links | "Privacy Policy" / "Terms of Service" — apps/web/components/Footer.tsx:35-36 | keep — routes exist via (legal) group |
| app-wide: Footer | Cancellation Policy link | "Cancellation Policy" — apps/web/components/Footer.tsx:37 | keep — genuinely decision-relevant before booking; route exists |
| app-wide: Footer | copyright line | "© 2026 HmarePanditJi Technologies Pvt. Ltd. All rights reserved." — apps/web/components/Footer.tsx:52 | keep — legal chrome; verify the entity name is the real registered one |
| app-wide: Header | logo wordmark | "HmarePanditJi" — apps/web/components/Header.tsx:66 | keep — brand chrome |
| app-wide: Header | nav links Home / Find Pandits | "Home" / "Find Pandits" — apps/web/components/Header.tsx:45-46 | keep |
| app-wide: Header | replay-tutorial button | "?" (title "Replay tutorial") — apps/web/components/Header.tsx:96-104 | keep, but dedupe with the Home page's floating '?' (page.tsx:427) |
| app-wide: Header | Sign In buttons | "Sign In" — apps/web/components/Header.tsx:117,198-201 | keep — the one gate, quietly offered |
| app-wide: Header | My Bookings link | "My Bookings" — apps/web/components/Header.tsx:126 | keep |
| app-wide: Header | user initial avatar slot | "{userInitial}" — apps/web/components/Header.tsx:128-130 | keep — renders data |
| unrouted (dead export) | PoojaVideoBadge verified | "इस पूजा का वीडियो सत्यापित" :90, "देखें" :93 — apps/web/components/design/Verification.tsx | keep the component for the profile surface — offering-specific watchable proof; currently unconsumed |
| unrouted (dead export) | Dakshina component (price + truthful-null) | "दक्षिणा तय नहीं" :124, ₹{amount…} :131, "दक्षिणा" :133 — apps/web/components/design/Verification.tsx | keep — reusable honest price block; currently unconsumed |
| unrouted (dead export) | Dakshina payment-channel note | "ऑनलाइन · paid online" — apps/web/components/design/Verification.tsx:136 | keep — states how the number is paid, a booking fact |
| unrouted (dead export) | BookingGatePromise | "बुकिंग पक्की करने के लिए" :78, "पंडित जी, तारीख और दाम — सब वैसे ही रहेंगे" :80 — apps/web/components/design/GuestMode.tsx | keep — the booking's own facts preserved through the gate; wire it at the बुक करें gate (currently unconsumed) |

