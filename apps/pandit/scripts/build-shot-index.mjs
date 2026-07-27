// CONTACT SHEET generator (Isj order, 2026-07-25) — one self-contained
// gallery of every banked QA shot, grouped by page, captioned, newest
// first within a page. Plain HTML + <img src="relative">, no build step:
// double-click docs/review/shots/index.html and it works.
// Regenerating this is part of CLOSING EVERY PAGE (ledger checklist).
//   node scripts/build-shot-index.mjs

import { readdirSync, statSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = join(import.meta.dirname, "..", "..", "..", "docs", "review", "shots");

// folder → { title, order } ; captions: "<folder>/<file>" → what it proves
const GROUPS = {
  page3a: { order: 3, title: "PAGE 3-A · भाषा LANGUAGE MATRIX (11 languages, headless)" },
  page5: { order: 5, title: "PAGE 5 · TUTORIAL DECK (6 slides, 3 modes)" },
  page6: { order: 6.1, title: "PAGE 6 · AUTH — pre-fix walk (local)" },
  "page6-prod": { order: 6.2, title: "PAGE 6 · AUTH — OTP legs (production)" },
  "page6-fixed": { order: 6.3, title: "PAGE 6 · AUTH — post-fix re-verify (3-way error copy + normalizer)" },
  page7: { order: 7, title: "PAGE 7 · पंजीकरण (FLOW C form)" },
  page8: { order: 8.1, title: "PAGE 8 · तैयारी — wizard R1 (first entry)" },
  "page8-hub": { order: 8.2, title: "PAGE 8 · तैयारी hub (0/5 ladder; SOS overlap BEFORE)" },
  page9: { order: 9.1, title: "PAGE 9 · होम — empty leg + SOS 104px rects" },
  "page9-final": { order: 9.2, title: "PAGE 9 · होम — SOS AFTER (116px), tap-proofs" },
  "page9-populated": { order: 9.3, title: "PAGE 9 · होम — populated leg (fixtures; venueAddress fix proof)" },
  page10: { order: 10, title: "PAGE 10 · बुकिंग arc (list + detail + request; money surfaces seen-never-fired)" },
  page11: { order: 11, title: "PAGE 11 · कमाई (read-only money; conservation proven in pixels + voice)" },
  "retro-sweep": { order: 11.5, title: "§3-V RETRO-SWEEP (17 states, pages 1-11) — 2 real bugs found+fixed; final table = one contrast-token family" },
  page12: { order: 12, title: "PAGE 12 · कैलेंडर (Sunday-start ruled canon; छुट्टी toggle fixture-only; §3-V native)" },
  page13: { order: 13, title: "PAGE 13 · मेरी पूजाएँ (3-state badges; Ruling #7 money census clean; the Hindi Idempotency-Key P0 found+fixed here)" },
  page14: { order: 14, title: "PAGE 14 · पूजा जोड़ें (5-step wizard, first walk with a LIVE submit chain; the 430-in-390 device clip found+fixed here)" },
};
const CAPTIONS = {
  "page3a/ta-confirm.png": "Tamil detect-confirm — calibration shot: headless eye matches the pane's banked frame; fixed strings render",
  "page3a/ta-loader.png": "THE first DiyaLoader frame ever captured — ஒரு கணம்… byte-true (the step that killed the pane 4×)",
  "page3a/mr-loader.png": "Marathi loader — the FIXED reverential थांबावे renders",
  "page3a/bn-loader.png": "Bengali loader — এক মুহূর্ত…",
  "page3a/en-confirm.png": "English is LIST-ONLY — the list entry leg",
  "page3a/en-loader.png": "en loader — the FIXED 'One moment, please…'",
  "page3a/gu-confirm.png": "Gujarati confirm — the FIXED reverential આપ renders",
  "page3a/pa-confirm.png": "Punjabi confirm — BOTH fixed ਜੀ strings render",
  "page3a/ml-confirm.png": "Malayalam confirm — FIXED താങ്കൾ; 3-line question wraps, no clip",
  "page3a/or-confirm.png": "Odia confirm — clean incl ଡ଼; or-IN TTS 502 reported separately",
  "page3a/te-confirm.png": "Telugu confirm — మీరు honorific",
  "page3a/kn-confirm.png": "Kannada confirm — ನೀವು honorific",
  "page3a/hi-confirm.png": "Hindi control row",
  "page3a/bn-post.png": "PROD SUCCESS LEG: the app fully switched to Bengali (परिचय in Bengali) — v1's true success path",
  "page5/declined-slide2.png": "Deck slide 2 (नई बुकिंग) — declined mode",
  "page5/granted-slide4-after-mic.png": "CROWN: mid-tutorial mic ACCEPT — 'सुन रहा हूँ… बोलिए — नमस्ते' listening chip + voice bars (fake device grant); asleep orb persisted from slide 3",
  "page5/granted-slide3-asleep.png": "Slide-3 mute gate: orb asleep inside the deck",
  "page6/step1-phone.png": "AUTH step 1 (pre-fix)",
  "page6-prod/step2-otp.png": "OTP step 2 on prod: 6 boxes, keypad, resend — keypad 0-row near the fold (device-pass flag)",
  "page6-prod/post-verify.png": "123456 verify → /home as the probe (टेस्ट जी)",
  "page6-fixed/abuse-placeholder.png": "Post-fix: placeholder-as-typed normalizes to 9876543210 (the trap closed)",
  "page7/entry-fresh.png": "पंजीकरण fresh entry — खाता बनाइए",
  "page7/entry-flowc.png": "FLOW C — CTA flips to प्रोफ़ाइल पूरी कीजिए",
  "page7/after-f5.png": "THE §5 answer: mid-form F5 — both fields restored (per-keystroke draft)",
  "page7/abuse-empty-name.png": "Actionable per-field error copy (shown + spoken)",
  "page8/hub.png": "Wizard R1 tile grid (bare /readiness entry)",
  "page8-hub/hub.png": "तैयारी hub 0/5 — one अभी कीजिए, four बाकी; SOS OVERLAPPING THE ORB (the P1, before)",
  "page9/home-top.png": "होम day-one empty leg: greeting, ⚠️ banner, ₹0 hero, तैयारी hero, nav",
  "page9-final/hub-after-sos-fix.png": "SOS AFTER (116px): 8px gap, both whole; पूजाएँ और दक्षिणा renders (व→और)",
  "page9-final/sos-expanded.png": "SOS tap-proof: quick-action expands (dial action never fired)",
  "page9-populated/home-populated.png": "Populated leg: hero, ₹12,500, GO-ONLINE pill + first-time coach overlay; the row renders through the venueAddress fix",
  "page9-populated/home-online.png": "Optimistic online after intercepted toggle — 'परिवार अब आपको बुला सकते हैं ✓'",
  "page10/list-empty.png": "Empty list (probe truth): orb medallion + मैं नज़र रखे हूँ 🙏 + तैयारी CTA",
  "page10/list-populated.png": "3 sections, 4 states: rails, ₹totals, जवाब दीजिए ›",
  "page10/list-cancelled-fallback.png": "FINDING: cancelled-only list = sectionless 🌤️ fallback (booking vanishes)",
  "page10/request-view.png": "Request view: bell header, accept/decline SEEN-NEVER-FIRED; FINDING: कुल ₹0 under आपको मिलेगा ₹5,100",
  "page10/detail-accepted.png": "Detail ✓स्वीकृत + NEW route coach overlay discovered; call disc never dialed",
  "page10/detail-requested-wrongpill.png": "FINDING: REQUESTED deep-link shows the यात्रा में pill (truth violation)",
  "page10/detail-completed.png": "COMPLETED: ✓संपन्न, advance+complete correctly gone",
  "page11/empty-canon27b.png": "PROD day-one: canon-27b empty — no ₹0 pretending; 7 tappables exactly",
  "page11/fixtures-payout-moment.png": "Payout moment: banner + spoken ₹6,900 = Σ fresh PAID (voice conservation)",
  "page11/fixtures-populated-tip.png": "FirstUseTip आने वाली राशि over the pending block",
  "page11/fixtures-populated.png": "Populated: hero ₹12,500, tiles, मिल गया rows, आना बाकी heading = Σ rows",
  "page11/fixtures-skew-empty-lists.png": "Skew leg: summary≠0 with empty lists — the 3-way मिल गया branch",
  "page11/d-moment-folded.png": "CLASS-FIX PROOF: payout moment on the fixed bundle — ONE folded utterance (paidVoice+intro), banner ✓, no kill (timestamps in moment-proof.json)",
  "page11/e-first-visit-calm.png": "First-ever visit: history NEVER replays as freshly-paid — calm screen, key seeded silently",
  "page11/f-empty-truthful.png": "Day-one empty + the NEW truthful intro heard live (no promised राशि)",
  "retro-sweep/p9-home-populated.png": "THE INVISIBLE HERO: अगली-बुकिंग card was 354×4px (button flex-shrink) — this frame is pre-fix evidence",
  "retro-sweep/p10-list-populated.png": "समझा at y=-43: the coach card anchored past the top edge (pre-fix evidence, sliver at top)",
  "retro-sweep/p11-earnings-populated.png": "Earnings populated under the sweep — the आना बाकी 2.95:1 brass label (product-call row)",
  "page12/g1-populated-july-tip.png": "कैलेंडर first visit: tip UP in the new in-viewport placement (clear of SOS), grid behind",
  "page12/g2-populated-july.png": "July populated: र-first heads, 3 pads, 5 disabled-no-dot, 25 plain today, 27● 28✕ 30●",
  "page12/g4-august-dot12.png": "▶▶ August: dot on 12 renders WITHOUT refetch; empty-note correctly absent",
  "page12/g5-september-empty-note.png": "▶ September: इस महीने अभी कोई बुकिंग नहीं — per-month re-evaluation",
  "page12/g6-booked-tap-toast.png": "Booked-day tap: toast+voice इस दिन बुकिंग है, ZERO writes",
  "page12/g7-day29-blocked.png": "छुट्टी toggle (fixture-only): 29✕ optimistic + POST; grid geometry unmoved (badge-slot law)",
  "page12/g8-requested-seam.png": "§10 SEAM: REQUESTED-only month — note hidden yet zero dots; the विनती is invisible here",
  "page12/g9-empty-world.png": "Empty world: truthful note + all-available grid",
  "page13/h1-empty-27c.png": "Canon-27c empty: 🛕 + truthful hint; FINDING: two add-CTAs (canon draws one)",
  "page13/h3-populated-3state.png": "The 3-state census: ✓प्रमाणित ×2 · ⏳बाकी (grey price) · ✗अस्वीकृत + कारण + 🔄 resubmit; 4 prices en-IN, zero % claims",
  "page13/h5-price-saved.png": "P0 EVIDENCE frame: the save that THREW pre-network (Hindi Idempotency-Key) — post-fix it lands 1 POST + ₹6,100",
  "page13/h7-floor-reject.png": "Floor leg: the server's exact ₹501 minimum now SHOWN and SPOKEN (was swallowed into कुछ गड़बड़)",
  "page13/h9-keytrap-zero.png": "FINDING: canonical-vs-Hindi rate key mismatch renders ₹0 for a priced pooja (two-vocabulary seam)",
  "page13/h10-celebration.png": "Fresh APPROVED → आप प्रमाणित हैं! (first-ever run stays silent + seeds — history never celebrates)",
  "page13/h12-add-step0.png": "Add-wizard entry (step 0) — zero writes until जमा; the wizard is PAGE 14",
  "page13/h6a-delete-ask.png": "FIX 1: the ✖ now ASKS — shown+spoken; arming and cancel both write NOTHING",
  "page13/h1-empty-27c.png": "FIX 2 (after): the empty screen carries ONE add control (canon 27c)",
  "page14/i1-step0-18a.png": "Step 0 / canon 18a: free-text name (no tile grid exists) + spoken-description panel with the echo quote",
  "page14/i2-step0-pending-pill.png": "⏳ प्रतीक्षा में — gated on the typed name already holding a PENDING row (truthful-state)",
  "page14/i3-step1-18b.png": "Step 1 / 18b AFTER the 430-in-390 fix: tabs, item row and both inputs fit the device",
  "page14/i4-step2-18c-money.png": "Step 2 / 18c the money step: 3 supply tiles, team 1-5 (no zero), dakshina + leaf bar — zero % claims",
  "page14/i5-step3-18d.png": "Step 3 / 18d: night panel → YouTube embed; जमा stays disabled until link AND consent",
  "page14/i6-step4-18e-done.png": "Step 4 / 18e: the pending card ONLY (प्रमाणित/अस्वीकृत would be untrue one second after submit)",
  "page14/i7-second-add-clean.png": "DRAFT FIX: the next add opens CLEAN — the persist effect no longer resurrects the submitted draft",
  "page14/i8-floor-loop.png": "Floor loop inside the wizard: the exact ₹501 line shown AND spoken, then back to step 2",
  "page14/i9-f5-video-stays.png": "F5 on the वीडियो step STAYS on वीडियो (v5 marker; it used to regress two steps)",
  "page14/i9a-live-after-otp.png": "LIVE prod, post-OTP: the empty मेरी पूजाएँ with exactly ONE add CTA — fix 2 in production pixels",
  "page14/i10-live-prefill.png": "LIVE prod: the wizard filled with a pure-Devanagari pooja name, ready to submit",
  "page14/i11-live-done.png": "🏆 THE P0 PROOF: 200 + 200 on the live API and the done card — this exact path threw pre-network before the fix",
  "page14/i12-live-pending-pill.png": "LIVE re-entry: ⏳ प्रतीक्षा में returns for the submitted name; the PENDING v1 row survives refresh",
};

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
let html = `<!doctype html><meta charset="utf-8"><title>HmarePanditJi — QA shot index</title>
<meta name="robots" content="noindex, nofollow">
<style>body{font-family:system-ui;background:#FFF9EE;color:#341A13;margin:24px}h1{font-size:22px}
h2{font-size:17px;border-bottom:2px solid #F0DFC4;padding-bottom:4px;margin-top:34px}
.grid{display:flex;flex-wrap:wrap;gap:14px}figure{margin:0;width:210px}
img{width:210px;border:1px solid #E7DCC9;border-radius:8px;background:#fff}
figcaption{font-size:12px;line-height:1.45;margin-top:4px;color:#5A2E20}</style>
<h1>🪔 HmarePanditJi — harsh-QA shot index</h1>
<p>Generated by <code>apps/pandit/scripts/build-shot-index.mjs</code> — regenerate at every page closure. Grouped by page; newest first within each group.</p>`;

const groups = Object.entries(GROUPS).sort((a, b) => a[1].order - b[1].order);
for (const [dir, meta] of groups) {
  const abs = join(ROOT, dir);
  let files;
  try {
    files = readdirSync(abs).filter((f) => f.endsWith(".png"));
  } catch { continue; }
  files.sort((a, b) => statSync(join(abs, b)).mtimeMs - statSync(join(abs, a)).mtimeMs);
  if (!files.length) continue;
  html += `<h2>${esc(meta.title)}</h2><div class="grid">`;
  for (const f of files) {
    const key = `${dir}/${f}`;
    const cap = CAPTIONS[key] || f.replace(".png", "").replace(/-/g, " ");
    html += `<figure><a href="${key}"><img loading="lazy" src="${key}" alt=""></a><figcaption><b>${esc(f)}</b><br>${esc(cap)}</figcaption></figure>`;
  }
  html += `</div>`;
}
writeFileSync(join(ROOT, "index.html"), html);
console.log("contact sheet written:", relative(process.cwd(), join(ROOT, "index.html")));
