// PAGE 5 tutorial-deck headless driver (harsh-QA, 2026-07-25).
// Same eye as page3a-headless.mjs. Three modes:
//   --mode declined  : no mic permission (headless default) — the re-offer's
//                      declined leg; the deck must complete voiceless.
//   --mode granted   : fake media device + granted permission — the REAL
//                      mid-tutorial accept leg (impossible in the pane).
//   --mode asleep    : slide-2 orb sleep/wake variant (sleep persists into
//                      the deck — re-prove on the headless eye).
// Entry state = the skip-exit staging (micLS unset, micDenied false).
//
//   node scripts/page5-tutorial-headless.mjs --mode declined \
//     --out ../../docs/review/shots/page5

import { chromium } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i === -1 ? d : process.argv[i + 1]; };
const BASE = arg("base", "http://localhost:3002");
const OUT = arg("out", "shots-page5");
const MODE = arg("mode", "declined");
const SLIDES = Number(arg("slides", "6"));
const NARRATION_SAMPLE = Number(arg("sample", "1")); // slide whose narration we let play to the end

mkdirSync(OUT, { recursive: true });
const launchArgs = ["--autoplay-policy=no-user-gesture-required"];
if (MODE === "granted" || MODE === "pregranted") launchArgs.push("--use-fake-device-for-media-stream", "--use-fake-ui-for-media-stream");
const browser = await chromium.launch({ headless: true, args: launchArgs });
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
if (MODE === "granted" || MODE === "pregranted") await ctx.grantPermissions(["microphone"], { origin: BASE });
const page = await ctx.newPage();
const errs = [];
page.on("console", (m) => { if (m.type() === "error") errs.push(m.text().slice(0, 100)); });
page.on("pageerror", (e) => errs.push("pageerror:" + String(e).slice(0, 100)));

const out = { mode: MODE, slides: [] };
await page.goto(`${BASE}/onboarding?voicedebug=1`, { waitUntil: "load", timeout: 60000 });
await page.waitForTimeout(1200);
await page.evaluate(() => {
  const raw = localStorage.getItem("hpj-onboarding");
  const obj = raw ? JSON.parse(raw) : { state: {}, version: 0 };
  Object.assign(obj.state, {
    phase: "TUTORIAL", parichayDone: true, languageConfirmed: true,
    micDenied: false, preferredLanguage: null, selectedLanguage: "Hindi",
    detectedCity: "वाराणसी", currentTutorialScreen: 1,
    tutorialStarted: false, tutorialCompleted: false,
  });
  localStorage.setItem("hpj-onboarding", JSON.stringify(obj));
  localStorage.removeItem("mic_permission_granted");
  sessionStorage.removeItem("hpj_voicedebug_buf");
});
await page.reload({ waitUntil: "load" });
await page.waitForTimeout(3000);
// first tap = audio unlock (empty strip above the footer CTA)
await page.mouse.click(30, 600);
await page.waitForTimeout(1200);

const snapshot = async (name) => page.screenshot({ path: join(OUT, `${MODE}-${name}.png`) });
const state = () => page.evaluate(() => {
  const st = JSON.parse(localStorage.getItem("hpj-onboarding")).state;
  const buf = JSON.parse(sessionStorage.getItem("hpj_voicedebug_buf") || "[]");
  return {
    phase: st.phase, slide: st.currentTutorialScreen, micDenied: st.micDenied,
    micLS: localStorage.getItem("mic_permission_granted"),
    heading: (document.querySelector("h1,h2")?.textContent || "").trim().slice(0, 60),
    text: document.body.innerText.slice(0, 400),
    chain: buf.slice(-10),
  };
});

for (let i = 1; i <= SLIDES + 2; i++) {
  const s = await state();
  if (s.phase !== "TUTORIAL") { out.exit = s; await snapshot(`exit`); break; }
  // narration settle: sampled slide plays to the end, others get a beat
  await page.waitForTimeout(s.slide === NARRATION_SAMPLE ? 16000 : 4500);

  // SLIDE 3 (स्पर्श कर जगाइए): the mute GATE wants one sleep→wake cycle —
  // do it for real (this is also the page's asleep-orb variant + PetalBurst)
  if ((MODE === "granted" || MODE === "declinedtap") && s.heading.includes("स्पर्श कर जगाइए")) {
    await page.evaluate(() => document.querySelector('button[aria-label="शिष्य को सुला दें"]')?.click());
    await page.waitForTimeout(2500);
    await snapshot(`slide3-asleep`);
    out.asleep = await state();
    out.wokeViaPill = await page.evaluate(() => {
      // either wakes: the जगाइए pill or the asleep orb itself
      const b = [...document.querySelectorAll("button")].find((x) => x.textContent.includes("जगाइए"))
        || document.querySelector('button[aria-label="शिष्य को जगाइए"]');
      if (b) { b.click(); return true; }
      return false;
    });
    await page.waitForTimeout(2500);
    await snapshot(`slide3-gateopen`);
  }

  // SLIDE 4 (बस बोलिए 🎤): the mic RE-OFFER — tap the 78px disc
  // ("माइक की अनुमति दीजिए"); granted mode has a fake device + permission,
  // declinedtap mode gets the browser's denial. Collect the outcome.
  if ((MODE === "granted" || MODE === "declinedtap") && s.heading.includes("बस बोलिए")) {
    const tapped = await page.evaluate(() => {
      // the 78px disc holds only an SVG — its label renders OUTSIDE the button
      const b = [...document.querySelectorAll("button")].find((x) => x.textContent.includes("माइक की अनुमति दीजिए"))
        || [...document.querySelectorAll("button")].find((x) => x.querySelector("svg") && Math.abs(x.getBoundingClientRect().width - 78) < 14);
      if (b) { b.click(); return true; }
      return false;
    });
    out.micTapped = tapped;
    await page.waitForTimeout(7000);
    await snapshot(`slide4-after-mic`);
    out.micOutcome = await state();
  }

  await snapshot(`slide${s.slide}`);
  out.slides.push({ ...(await state()), errsSoFar: errs.length });

  // advance: the आगे CTA (footer). Fall back to any advance-looking button.
  const advanced = await page.evaluate(() => {
    const btns = [...document.querySelectorAll("button")];
    const b = btns.find((x) => x.textContent.trim() === "आगे")
      || btns.find((x) => /आगे|शुरू|समझ/.test(x.textContent) && !x.textContent.includes("बिना"));
    if (b) { b.click(); return b.textContent.trim().slice(0, 30); }
    return null;
  });
  out.slides[out.slides.length - 1].advancedVia = advanced;
  await page.waitForTimeout(2500);
}

out.final = await state();
out.final.listenLoopPaused = await page.evaluate(() => {
  const vc = window.__hpjVoice; // exposed by the voicedebug latch
  return vc ? vc.paused : "no-controller";
});
await snapshot("final");
out.errs = errs;
writeFileSync(join(OUT, `results-${MODE}.json`), JSON.stringify(out, null, 1));
await browser.close();
console.log(`PAGE5 ${MODE} RUN COMPLETE — slides walked: ${out.slides.length}, final phase: ${out.final.phase}`);
