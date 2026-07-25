// PAGE 8 तैयारी (readiness hub) headless walk — harsh-QA 2026-07-25.
// PROD probe session (+919999999999 / 123456 — the zero-SMS convention on
// today's main) for REAL card states; the आधार/KYC boundary is honored:
// UI legs only, no upload/submission ever fired.
//   node scripts/page8-readiness-headless.mjs --out ../../docs/review/shots/page8

import { chromium } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i === -1 ? d : process.argv[i + 1]; };
const BASE = arg("base", "https://hmarepanditji-pandit.vercel.app");
const OUT = arg("out", "shots-page8");
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ headless: true, args: ["--autoplay-policy=no-user-gesture-required"] });
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
const page = await ctx.newPage();
const errs = [];
page.on("console", (m) => { if (m.type() === "error") errs.push(m.text().slice(0, 90)); });
page.on("pageerror", (e) => errs.push("pageerror:" + String(e).slice(0, 90)));

const out = {};

// ── probe login (75s cold-start law) ──
await page.goto(`${BASE}/login?voicedebug=1`, { waitUntil: "load", timeout: 60000 });
await page.waitForTimeout(2500);
await page.mouse.click(30, 250);
await page.locator('input[type="tel"]').first().fill("9999999999");
await page.getByRole("button", { name: "आगे बढ़िए" }).click();
await page.waitForTimeout(65000);
const step2 = await page.evaluate(() => document.body.innerText.includes("OTP डालिए"));
out.login = { step2 };
if (step2) {
  await page.locator('input[name="otp"]').first().type("123456", { delay: 40 });
  await page.waitForTimeout(15000);
}
out.login.landed = await page.evaluate(() => location.pathname);

// ── the hub ──
const HUBPATH = arg("path", "/readiness/hub");
await page.goto(`${BASE}${HUBPATH}`, { waitUntil: "load", timeout: 60000 });
await page.waitForTimeout(8000);
await page.mouse.click(30, 200); // unlock
await page.waitForTimeout(1500);
await page.screenshot({ path: join(OUT, "hub.png") });
out.hub = await page.evaluate(() => ({
  heading: (document.querySelector("h1,h2")?.textContent || "").trim().slice(0, 60),
  text: document.body.innerText.slice(0, 900),
}));

// per-card: dump every card-ish block's text + state glyphs
out.cards = await page.evaluate(() =>
  [...document.querySelectorAll("a,button,[role=button]")]
    .map((el) => (el.textContent || "").trim().replace(/\s+/g, " ").slice(0, 90))
    .filter((t) => t.length > 8)
    .slice(0, 20),
);

// tap each card in turn (by index), record destination, come back —
// KYC boundary: we look, we never upload/submit
const CARD_TAPS = Number(arg("taps", "5"));
out.taps = [];
for (let i = 0; i < CARD_TAPS; i++) {
  await page.goto(`${BASE}${HUBPATH}`, { waitUntil: "load", timeout: 60000 });
  await page.waitForTimeout(5000);
  const tapped = await page.evaluate((idx) => {
    const cards = [...document.querySelectorAll("a,button,[role=button]")]
      .filter((el) => (el.textContent || "").trim().length > 8);
    const el = cards[idx];
    if (!el) return null;
    const label = (el.textContent || "").trim().replace(/\s+/g, " ").slice(0, 60);
    el.click();
    return label;
  }, i);
  if (!tapped) break;
  await page.waitForTimeout(4500);
  const dest = await page.evaluate(() => location.pathname);
  out.taps.push({ i, tapped, dest });
  await page.screenshot({ path: join(OUT, `tap-${i}.png`) });
}

out.narration = await page.evaluate(() => (JSON.parse(sessionStorage.getItem("hpj_voicedebug_buf") || "[]")).filter((l) => l.includes("speak ")).slice(-10));
out.errs = errs.slice(0, 10);
writeFileSync(join(OUT, "results.json"), JSON.stringify(out, null, 1));
await browser.close();
console.log("PAGE8 RUN COMPLETE", JSON.stringify({ landed: out.login.landed, cards: out.cards.length, taps: out.taps.length }));
