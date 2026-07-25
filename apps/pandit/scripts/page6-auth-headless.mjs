// PAGE 6 AUTH (पंजीकरण/OTP entry) headless walk — harsh-QA 2026-07-25.
// Walks WHAT MAIN SHIPS TODAY (pre-hardening OTP shape; the hold branch is
// design-only until MSG91/DLT). Live API: today's main sends NO OTP SMS
// (no provider wired; prod issues "123456" for every number) — the walk
// uses the sanctioned live-probe number +919999999999 (check-auth-live
// convention) and stays within the 3-sends/10min server budget.
//   node scripts/page6-auth-headless.mjs --out ../../docs/review/shots/page6

import { chromium } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i === -1 ? d : process.argv[i + 1]; };
const BASE = arg("base", "http://localhost:3002");
const OUT = arg("out", "shots-page6");
const PROBE = "9999999999"; // established live-probe number (+91 added by the app)

mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ headless: true, args: ["--autoplay-policy=no-user-gesture-required"] });
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
const page = await ctx.newPage();
const errs = [];
page.on("console", (m) => { if (m.type() === "error") errs.push(m.text().slice(0, 90)); });
page.on("pageerror", (e) => errs.push("pageerror:" + String(e).slice(0, 90)));

const out = { abuse: [], otp: {} };
await page.goto(`${BASE}/login?next=/onboarding&voicedebug=1`, { waitUntil: "load", timeout: 60000 });
await page.waitForTimeout(2500);
await page.mouse.click(30, 250); // unlock gesture on empty space
await page.waitForTimeout(800);
await page.screenshot({ path: join(OUT, "step1-phone.png") });

const phoneInput = page.locator('input[type="tel"]').first();
const readState = () => page.evaluate(() => {
  const body = document.body.innerText;
  const m = body.match(/कुछ गड़बड़.*|बहुत बार.*|कृपया 10.*|OTP सही नहीं.*/); // '.' stops at line end
  return { error: m ? m[0].slice(0, 90) : "", step2: body.includes("OTP डालिए"), text: body.slice(0, 60) };
});

// ── §4 PHONE ABUSE MATRIX (each variant: fill → आगे → observe → reset) ──
const OTP_ONLY = process.argv.includes("--otp-only");
const PRODRUN = process.argv.includes("--prod"); // Render cold start: 75s law
const VARIANTS = OTP_ONLY ? [] : [
  ["placeholder-as-typed", "98765 43210"],
  ["plus91-prefixed", "+919876500050"],
  ["devanagari-digits", "१२३४५६७८९०"],
  ["letters-x10", "abcdefghij"],
  ["short-5", "12345"],
  ["leading-zero-10", "0555555555"],
  ["paste-formatted", "+91 98765-43210"],
];
for (const [name, value] of VARIANTS) {
  await phoneInput.fill(value);
  const echoed = await phoneInput.inputValue();
  await page.getByRole("button", { name: "आगे बढ़िए" }).click();
  await page.waitForTimeout(4200);
  const st = await readState();
  out.abuse.push({ name, value, echoed, advanced: st.step2, error: st.error });
  if (name === "placeholder-as-typed") await page.screenshot({ path: join(OUT, "abuse-placeholder.png") });
  if (st.step2) { out.abuse[out.abuse.length - 1].UNEXPECTED = true; break; }
  await phoneInput.fill("");
}

// ── the real send (send #1 of 3) ──
await phoneInput.fill(PROBE);
await page.getByRole("button", { name: "आगे बढ़िए" }).click();
await page.waitForTimeout(PRODRUN ? 65000 : 9000);
const s2 = await readState();
out.otp.entered = s2.step2;
await page.screenshot({ path: join(OUT, "step2-otp.png") });

if (s2.step2) {
  // wrong code ×3 via the on-screen keypad model: boxes accept setDigit via
  // paste distribution — fill box 0 with the full wrong code (multi-char
  // distribute is the app's own paste path)
  const box0 = page.locator('input[name="otp"]').first();
  for (const wrong of ["111111", "222222", "000000"]) {
    await box0.click();
    await box0.fill("");
    await box0.type(wrong, { delay: 40 });
    await page.waitForTimeout(3500);
    const st = await readState();
    out.otp["wrong_" + wrong] = { error: st.error, boxesCleared: await page.evaluate(() => ![...document.querySelectorAll('input[type="tel"]')].some((i) => i.value !== "")) };
    // clear for the next attempt (the app does NOT clear — we must)
    for (let k = 0; k < 6; k++) await page.keyboard.press("Backspace");
    await page.waitForTimeout(400);
  }
  await page.screenshot({ path: join(OUT, "otp-wrong.png") });

  // resend countdown UX: capture the ticking label, wait out the 30s, resend (send #2)
  out.otp.countdownLabel = await page.evaluate(() => {
    const m = document.body.innerText.match(/ओटीपी दोबारा भेजिए[^\n]*/);
    return m ? m[0] : null;
  });
  await page.waitForTimeout(31000);
  const resend = page.getByRole("button", { name: /ओटीपी दोबारा भेजिए/ });
  out.otp.resendClickable = (await resend.count()) > 0;
  if (out.otp.resendClickable) { await resend.first().click(); await page.waitForTimeout(4000); }

  // success leg: the static dev code (today's main issues 123456 for every number)
  await box0.click();
  await box0.type("123456", { delay: 40 });
  await page.waitForTimeout(PRODRUN ? 15000 : 9000);
  out.otp.after = await page.evaluate(() => ({ url: location.pathname + location.search, text: document.body.innerText.slice(0, 200) }));
  await page.screenshot({ path: join(OUT, "post-verify.png") });
}

out.voicedebug = await page.evaluate(() => (JSON.parse(sessionStorage.getItem("hpj_voicedebug_buf") || "[]")).filter((l) => /speak /.test(l)).slice(-8)).catch?.(() => []) ?? [];
out.errs = errs;
writeFileSync(join(OUT, "results.json"), JSON.stringify(out, null, 1));
await browser.close();
console.log("PAGE6 RUN COMPLETE", JSON.stringify({ abuse: out.abuse.length, entered: out.otp.entered }));
