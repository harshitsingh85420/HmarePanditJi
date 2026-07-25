// PAGE 7 पंजीकरण (RegistrationScreen — the FLOW C single-screen form).
// Dummy-token walk: entry/fields/validation/draft-F5/narration are client-
// side; /auth/me + submit are API-dependent (localhost CORS-blocked → the
// mount resume's fetch-fail leg lands on REGISTRATION by design).
//   node scripts/page7-registration-headless.mjs --out ../../docs/review/shots/page7

import { chromium } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i === -1 ? d : process.argv[i + 1]; };
const BASE = arg("base", "http://localhost:3002");
const OUT = arg("out", "shots-page7");
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ headless: true, args: ["--autoplay-policy=no-user-gesture-required"] });
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
const page = await ctx.newPage();
const errs = [];
page.on("console", (m) => { if (m.type() === "error") errs.push(m.text().slice(0, 90)); });
page.on("pageerror", (e) => errs.push("pageerror:" + String(e).slice(0, 90)));

const out = {};
const seed = (returning) => page.evaluate((ret) => {
  localStorage.setItem("pandit_token", "dummy-qa-token");
  const raw = localStorage.getItem("hpj-onboarding");
  const obj = raw ? JSON.parse(raw) : { state: {}, version: 0 };
  Object.assign(obj.state, { phase: "REGISTRATION", languageConfirmed: true, parichayDone: true, tutorialCompleted: true, detectedCity: "वाराणसी", selectedLanguage: "Hindi" });
  localStorage.setItem("hpj-onboarding", JSON.stringify(obj));
  localStorage.removeItem("hpj-registration");
  if (ret) sessionStorage.setItem("hpj_returning_incomplete", ret);
  else sessionStorage.removeItem("hpj_returning_incomplete");
  sessionStorage.setItem("hpj_voicedebug", "1");
}, returning);

const body = () => page.evaluate(() => document.body.innerText.slice(0, 500));
const errorLine = () => page.evaluate(() => {
  const m = document.body.innerText.match(/नाम कम से कम.*|शहर का नाम.*|कुछ गड़बड़.*/);
  return m ? m[0].slice(0, 80) : "";
});

// ── ENTRY A: fresh account (flag absent) ──
await page.goto(`${BASE}/onboarding?voicedebug=1`, { waitUntil: "load", timeout: 60000 });
await page.waitForTimeout(1500);
await seed(null);
await page.reload({ waitUntil: "load" });
await page.waitForTimeout(6000); // mount resume: /auth/me fails (CORS) → FLOW C
await page.mouse.click(30, 500); // unlock
await page.waitForTimeout(1500);
await page.screenshot({ path: join(OUT, "entry-fresh.png") });
out.fresh = { text: await body(), ctaKhata: (await body()).includes("खाता बनाइए") };

// fields
const inputs = page.locator("input");
const nameInput = inputs.nth(0);
const cityInput = inputs.nth(1);
out.cityPrefill = await cityInput.inputValue(); // detection prefill (वाराणसी expected)

// §4 ABUSE — empty submit (city prefilled, name empty)
await page.getByRole("button", { name: /खाता बनाइए/ }).click();
await page.waitForTimeout(2500);
out.abuse_emptyName = await errorLine();
await page.screenshot({ path: join(OUT, "abuse-empty-name.png") });

// name too short
await nameInput.fill("पं");
await page.getByRole("button", { name: /खाता बनाइए/ }).click();
await page.waitForTimeout(2500);
out.abuse_shortName = await errorLine();

// length extreme + roman name accepted? (no cap by design — record truth)
const longName = "पंडित " + "रामरामरामराम".repeat(20);
await nameInput.fill(longName);
out.longNameEchoLen = (await nameInput.inputValue()).length;
await nameInput.fill("Pt. Ramesh Sharma"); // roman — is it accepted silently?
await cityInput.fill("");
await page.getByRole("button", { name: /खाता बनाइए/ }).click();
await page.waitForTimeout(2500);
out.abuse_emptyCity = await errorLine();
await page.screenshot({ path: join(OUT, "abuse-empty-city.png") });

// §5 DRAFT / F5: set both, reload, check restore
await nameInput.fill("पंडित परीक्षण शर्मा");
await cityInput.fill("काशी");
await page.waitForTimeout(800);
await page.reload({ waitUntil: "load" });
await page.waitForTimeout(6000);
out.afterF5 = {
  name: await page.locator("input").nth(0).inputValue(),
  city: await page.locator("input").nth(1).inputValue(),
};
await page.screenshot({ path: join(OUT, "after-f5.png") });

// submit with valid fields → API-dependent (CORS) → observe the failure copy
await page.mouse.click(30, 500);
await page.waitForTimeout(800);
await page.getByRole("button", { name: /खाता बनाइए/ }).click();
await page.waitForTimeout(6000);
out.submitFailCopy = await page.evaluate(() => {
  const m = document.body.innerText.match(/कुछ गड़बड़.*|खाता नहीं.*|सर्वर.*/);
  return m ? m[0].slice(0, 90) : "(no visible error)";
});
await page.screenshot({ path: join(OUT, "submit-fail.png") });

// ── ENTRY B: FLOW C returning-incomplete (flag = "1") ──
await seed("1");
await page.reload({ waitUntil: "load" });
await page.waitForTimeout(6000);
out.flowC = { ctaComplete: (await body()).includes("प्रोफ़ाइल पूरी कीजिए") };
await page.screenshot({ path: join(OUT, "entry-flowc.png") });

// back law: on-screen back → TUTORIAL last slide
const back = page.locator('button[aria-label*="पीछे"], button:has(.material-symbols-outlined)').first();
try { await back.click(); await page.waitForTimeout(2500); } catch { /* noop */ }
out.backLands = await page.evaluate(() => {
  const st = JSON.parse(localStorage.getItem("hpj-onboarding")).state;
  return { phase: st.phase, slide: st.currentTutorialScreen };
});

out.narration = await page.evaluate(() => (JSON.parse(sessionStorage.getItem("hpj_voicedebug_buf") || "[]")).filter((l) => l.includes("speak ")).slice(-8));
out.errs = errs;
writeFileSync(join(OUT, "results.json"), JSON.stringify(out, null, 1));
await browser.close();
console.log("PAGE7 RUN COMPLETE");
