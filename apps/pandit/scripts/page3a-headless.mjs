// PAGE 3-A headless matrix driver (VISION UPGRADE, Isj 2026-07-25).
// The Browser pane's compositor died at loader-mount 4× and its window
// visibility is outside tool control — this Playwright chromium eye has no
// host window to lose, kills the DPR-crop class by construction
// (deviceScaleFactor: 1), and survives the loader mount.
//
// Usage:
//   node scripts/page3a-headless.mjs --base http://localhost:3002 \
//     --rows te,kn,gu,pa,ml,or,en,hi --out ../../docs/review/shots/page3a
//   node scripts/page3a-headless.mjs --base https://hmarepanditji-pandit.vercel.app \
//     --rows bn --prod --out ../../docs/review/shots/page3a
//
// Per row: seed state → confirm shot → floors/byte-truth/font evaluate →
// trusted unlock click → question TTS (live bulbul) → fetch-delay hook
// (local only) → yes click → loader shot mid-delay + waitLine text-truth →
// notice completion → voicedebug buffer + store state + console errors.
// SCOPE (ledger note): headless certifies layout/floors/truth; its
// system-fallback fonts differ from both the pane's and an A12's — the
// device-pass render list for all nine non-Devanagari scripts stands.

import { chromium } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const arg = (name, dflt) => {
  const i = process.argv.indexOf(`--${name}`);
  return i === -1 ? dflt : process.argv[i + 1];
};
const BASE = arg("base", "http://localhost:3002");
const OUT = arg("out", "shots");
const PROD = process.argv.includes("--prod");
const ROWS = arg("rows", "te").split(",");

// expected strings = the FIXED table (strings-langconfirm.ts post-audit)
const L = {
  mr: { city: "mumbai", q: "आपल्याला मराठीत बोलायला आवडेल का?", yes: "हो, मराठी चालेल", other: "दुसरी भाषा निवडावी", wait: "एक क्षण थांबावे…", notice: "भाषांतर" },
  bn: { city: "kolkata", q: "আপনি কি বাংলায় কথা বলতে চান?", yes: "হ্যাঁ, বাংলা ঠিক আছে", other: "অন্য ভাষা বেছে নিন", wait: "এক মুহূর্ত…", notice: "অনুবাদ", success: "চমৎকার" },
  ta: { city: "chennai", q: "நீங்கள் தமிழில் பேச விரும்புகிறீர்களா?", yes: "ஆம், தமிழ் சரி", other: "வேறு மொழி தேர்வு", wait: "ஒரு கணம்…", notice: "மொழிபெயர்ப்பு" },
  te: { city: "hyderabad", q: "మీరు తెలుగులో మాట్లాడాలనుకుంటున్నారా?", yes: "అవును, తెలుగు సరే", other: "వేరే భాష ఎంచుకోండి", wait: "ఒక్క క్షణం…", notice: "అనువాదం" },
  kn: { city: "bengaluru", q: "ನೀವು ಕನ್ನಡದಲ್ಲಿ ಮಾತನಾಡಲು ಬಯಸುವಿರಾ?", yes: "ಹೌದು, ಕನ್ನಡ ಸರಿ", other: "ಬೇರೆ ಭಾಷೆ ಆರಿಸಿ", wait: "ಒಂದು ಕ್ಷಣ…", notice: "ಅನುವಾದ" },
  gu: { city: "ahmedabad", q: "શું આપ ગુજરાતીમાં વાત કરવા માંગો છો?", yes: "હા, ગુજરાતી બરાબર છે", other: "બીજી ભાષા પસંદ કરો", wait: "એક ક્ષણ…", notice: "અનુવાદ" },
  pa: { city: "amritsar", q: "ਕੀ ਤੁਸੀਂ ਪੰਜਾਬੀ ਵਿੱਚ ਗੱਲ ਕਰਨਾ ਚਾਹੋਗੇ ਜੀ?", yes: "ਹਾਂ, ਪੰਜਾਬੀ ਠੀਕ ਹੈ", other: "ਹੋਰ ਭਾਸ਼ਾ ਚੁਣੋ ਜੀ", wait: "ਇੱਕ ਪਲ ਜੀ…", notice: "ਅਨੁਵਾਦ" },
  ml: { city: "kochi", q: "താങ്കൾ മലയാളത്തിൽ സംസാരിക്കാൻ ആഗ്രഹിക്കുന്നുവോ?", yes: "അതെ, മലയാളം മതി", other: "മറ്റൊരു ഭാഷ തിരഞ്ഞെടുക്കുക", wait: "ഒരു നിമിഷം…", notice: "വിവർത്തനം" },
  or: { city: "bhubaneswar", q: "ଆପଣ ଓଡ଼ିଆରେ କଥା ହେବାକୁ ଚାହାଁନ୍ତି କି?", yes: "ହଁ, ଓଡ଼ିଆ ଠିକ୍ ଅଛି", other: "ଅନ୍ୟ ଭାଷା ବାଛନ୍ତୁ", wait: "ଗୋଟିଏ ମୁହୂର୍ତ୍ତ…", notice: "ଅନୁବାଦ" },
  en: { listOnly: true, tile: "English", yes: "आगे बढ़िए", wait: "One moment, please…", notice: "Translation is not available" },
  hi: { city: "varanasi", control: true, q: "हमने आपके क्षेत्र की भाषा हिन्दी पहचानी — इसी में चलें या बदलें?", yes: "हाँ, हिन्दी ठीक है", other: "दूसरी भाषा चुनिए" },
};

mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({
  headless: true,
  args: ["--autoplay-policy=no-user-gesture-required"],
});
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
const page = await ctx.newPage();
const consoleErrs = [];
page.on("console", (m) => { if (m.type() === "error") consoleErrs.push(m.text().slice(0, 100)); });
page.on("pageerror", (e) => consoleErrs.push("pageerror:" + String(e).slice(0, 100)));

const results = [];
await page.goto(`${BASE}/onboarding?voicedebug=1`, { waitUntil: "load", timeout: 60000 });
await page.waitForTimeout(1500);

for (const code of ROWS) {
  const cfg = L[code];
  const row = { code, errsBefore: consoleErrs.length };
  try {
    // ── seed ──
    await page.evaluate(({ cfg2 }) => {
      const raw = localStorage.getItem("hpj-onboarding");
      const obj = raw ? JSON.parse(raw) : { state: {}, version: 0 };
      Object.assign(obj.state, {
        phase: cfg2.listOnly ? "LANGUAGE_LIST" : "LANGUAGE_CONFIRM",
        detectedCity: cfg2.city || "varanasi",
        selectedLanguage: "Hindi",
        languageConfirmed: false,
        preferredLanguage: null,
        parichayDone: false,
      });
      localStorage.setItem("hpj-onboarding", JSON.stringify(obj));
      sessionStorage.removeItem("hpj_voicedebug_buf");
    }, { cfg2: cfg });
    await page.reload({ waitUntil: "load" });
    await page.waitForTimeout(2500);

    // ── confirm/list shot ──
    await page.screenshot({ path: join(OUT, `${code}-confirm.png`) });

    // ── floors + byte-truth + fonts ──
    row.measure = await page.evaluate(({ cfg2 }) => {
      const btns = [...document.querySelectorAll("button")];
      const find = (t) => btns.find((b) => b.textContent.trim() === t);
      const yes = cfg2.listOnly ? null : find(cfg2.yes);
      const other = cfg2.listOnly ? null : find(cfg2.other);
      const h1 = cfg2.listOnly ? null : [...document.querySelectorAll("h1,h2,div,p")].find((e) => e.children.length === 0 && e.textContent.trim() === cfg2.q);
      const m = (el) => el ? ((r) => ({ w: Math.round(r.width), h: Math.round(r.height), font: getComputedStyle(el).fontSize, clip: el.scrollWidth > el.clientWidth + 1 }))(el.getBoundingClientRect()) : null;
      const tile = cfg2.listOnly ? !!btns.find((b) => b.textContent.includes(cfg2.tile)) : null;
      return { truth: cfg2.listOnly ? { tile } : { q: !!h1, yes: !!yes, other: !!other }, H1: m(h1), yes: m(yes), other: m(other) };
    }, { cfg2: cfg });

    // ── unlock (trusted) + question TTS ──
    await page.mouse.click(30, 650);
    await page.waitForTimeout(cfg.listOnly ? 1500 : 7000);

    // ── fetch delay so the DiyaLoader holds for the shot (local only) ──
    if (!PROD && !cfg.control) {
      await page.evaluate(() => {
        const of = window.fetch.bind(window);
        window.fetch = (u, o) => String(u).includes("/voice/translate")
          ? new Promise((res, rej) => setTimeout(() => of(u, o).then(res, rej), 2500))
          : of(u, o);
      });
    }

    // ── the switch ──
    if (cfg.listOnly) {
      await page.getByText(cfg.tile, { exact: true }).first().click();
      await page.waitForTimeout(800);
      await page.getByRole("button", { name: cfg.yes }).click();
    } else {
      // role-name matching can normalize Indic combining marks differently
      // than textContent (bn চন্দ্রবিন্দু) — fall back to the measured CTA spot
      try {
        await page.getByRole("button", { name: cfg.yes, exact: true }).click({ timeout: 5000 });
      } catch {
        // textContent match — role names normalize Indic marks differently
        const hit = await page.evaluate((label) => {
          const b = [...document.querySelectorAll("button")].find((x) => x.textContent.trim() === label);
          if (b) { b.click(); return true; }
          return false;
        }, cfg.yes);
        if (!hit) await page.mouse.click(195, 487);
      }
    }

    if (!cfg.control) {
      await page.waitForTimeout(700); // mid-delay: the loader is up
      await page.screenshot({ path: join(OUT, `${code}-loader.png`) });
      row.loaderText = await page.evaluate((w) => document.body.innerText.includes(w), cfg.wait);
      await page.waitForTimeout(PROD ? 80000 : 9000); // prod: outlive a Render cold start (same 75s law as i18n) // notice/confirm completes
    } else {
      await page.waitForTimeout(3000); // hi: direct advance, no loader
    }

    await page.screenshot({ path: join(OUT, `${code}-post.png`) });

    // ── evidence ──
    row.after = await page.evaluate(() => {
      const st = JSON.parse(localStorage.getItem("hpj-onboarding")).state;
      const buf = JSON.parse(sessionStorage.getItem("hpj_voicedebug_buf") || "[]");
      return {
        phase: st.phase, selected: st.selectedLanguage, preferred: st.preferredLanguage,
        chain: buf.filter((l) => /speak |tts params|tts status|audio ended|prefetch|switch/.test(l)).slice(-16),
      };
    });
    row.errs = consoleErrs.slice(row.errsBefore);
    row.ok = true;
  } catch (e) {
    row.ok = false;
    row.error = String(e).slice(0, 300);
    try { await page.screenshot({ path: join(OUT, `${code}-FAILED.png`) }); } catch { /* noop */ }
  }
  results.push(row);
  console.log(`ROW ${code}: ${row.ok ? "done" : "FAILED " + row.error}`);
}

writeFileSync(join(OUT, PROD ? "results-prod.json" : "results.json"), JSON.stringify(results, null, 1));
await browser.close();
console.log("MATRIX RUN COMPLETE");
