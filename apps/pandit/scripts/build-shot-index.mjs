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
