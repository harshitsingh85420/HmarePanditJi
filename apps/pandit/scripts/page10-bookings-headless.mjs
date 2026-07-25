// PAGE 10 बुकिंग arc (list + detail + request) — harsh-QA 2026-07-25.
// MONEY BOUNDARY: accept/decline/journey/complete + tel:/maps are
// ASSERT-VISIBLE-NEVER-CLICK. Probe prod = the true empty list; every
// populated state renders via route-interception fixtures (zero writes).
//   node scripts/page10-bookings-headless.mjs --out ../../docs/review/shots/page10

import { chromium } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i === -1 ? d : process.argv[i + 1]; };
const BASE = arg("base", "https://hmarepanditji-pandit.vercel.app");
const OUT = arg("out", "shots-page10");
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ headless: true, args: ["--autoplay-policy=no-user-gesture-required"] });
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
const page = await ctx.newPage();
const errs = [];
page.on("console", (m) => { if (m.type() === "error") errs.push(m.text().slice(0, 90)); });
page.on("pageerror", (e) => errs.push("pageerror:" + String(e).slice(0, 90)));

const out = {};
// ── probe login ──
await page.goto(`${BASE}/login?voicedebug=1`, { waitUntil: "load", timeout: 60000 });
await page.waitForTimeout(2500);
await page.mouse.click(30, 250);
await page.locator('input[type="tel"]').first().fill("9999999999");
await page.getByRole("button", { name: "आगे बढ़िए" }).click();
await page.waitForTimeout(65000);
if (await page.evaluate(() => document.body.innerText.includes("OTP डालिए"))) {
  await page.locator('input[name="otp"]').first().type("123456", { delay: 40 });
  await page.waitForTimeout(15000);
}

// ── EMPTY LEG (probe truth) ──
await page.goto(`${BASE}/bookings`, { waitUntil: "load", timeout: 60000 });
await page.waitForTimeout(8000);
await page.mouse.click(30, 300);
await page.waitForTimeout(1500);
await page.screenshot({ path: join(OUT, "list-empty.png") });
out.empty = await page.evaluate(() => {
  const t = document.body.innerText;
  return { title: t.includes("मेरी बुकिंग"), emptyTitle: t.includes("अभी कोई बुकिंग नहीं"), hint: t.includes("मैं नज़र रखे हूँ"), taiyariCta: t.includes("बुकिंग पाने की तैयारी") };
});

// ── FIXTURES ──
const fx = (data) => ({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true, data }) });
const row = (id, status, type, total) => ({ id, bookingNumber: `HPJ-${id}`, eventType: type, eventDate: "2026-07-28T10:30:00.000Z", venueAddress: "12 मॉडल टाउन", venueCity: "दिल्ली", grandTotal: total, status });
const ROWS4 = [row("bkreq1", "REQUESTED", "सत्यनारायण कथा", 5100), row("bkacc1", "ACCEPTED", "गृह प्रवेश पूजा", 5600), row("bkip1", "IN_PROGRESS", "हवन", 3100), row("bkdone1", "COMPLETED", "रुद्राभिषेक", 7100)];
const detailOf = (r, journey = {}) => ({ booking: { ...r, earnings: { dakshinaAmount: r.grandTotal, dakshinaNet: r.grandTotal, storedPayoutMissing: false }, journeyTimestamps: journey, acceptedAt: "2026-07-27T09:00:00.000Z", customer: { name: "श्री वर्मा", phone: "+919000000001" } } });
let listData = ROWS4;
await page.route("**/api/v1/pandit/bookings", (r) => r.fulfill(fx(listData)));
await page.route("**/api/v1/pandit/bookings/*", (r) => {
  const id = r.request().url().split("/").pop();
  const base = ROWS4.find((x) => x.id === id) || ROWS4[0];
  return r.fulfill(fx(detailOf(base, base.status === "IN_PROGRESS" ? { step1: "2026-07-28T08:00:00.000Z" } : {})));
});

// ── POPULATED LIST (4 states, 3 sections) ──
await page.goto(`${BASE}/bookings`, { waitUntil: "load", timeout: 60000 });
await page.waitForTimeout(7000);
await page.screenshot({ path: join(OUT, "list-populated.png") });
out.list = await page.evaluate(() => {
  const t = document.body.innerText;
  return { newSec: t.includes("नई विनती"), upcoming: t.includes("चालू"), done: t.includes("पूरी हुई"), jawab: t.includes("जवाब दीजिए"), total: t.includes("5,100") || t.includes("5100") };
});

// ── CANCELLED-only: the sectionless fallback ──
listData = [row("bkcan1", "CANCELLED", "मुंडन", 2100)];
await page.goto(`${BASE}/bookings`, { waitUntil: "load", timeout: 60000 });
await page.waitForTimeout(6000);
await page.screenshot({ path: join(OUT, "list-cancelled-fallback.png") });
out.cancelledFallback = await page.evaluate(() => document.body.innerText.includes("कोई बुकिंग नहीं है"));
listData = ROWS4;

// ── REQUEST VIEW (money surfaces: visible, never clicked) ──
await page.goto(`${BASE}/bookings/bkreq1/request`, { waitUntil: "load", timeout: 60000 });
await page.waitForTimeout(7000);
await page.screenshot({ path: join(OUT, "request-view.png") });
out.request = await page.evaluate(() => {
  const t = document.body.innerText;
  const btns = [...document.querySelectorAll("button")].map((b) => b.textContent.trim());
  return {
    bellHeader: t.includes("नई बुकिंग विनती"), sub: t.includes("अभी जवाब दीजिए"),
    yajman: t.includes("श्री वर्मा") || t.includes("HPJ-bkreq1"),
    tulsi: t.includes("दक्षिणा"),
    acceptVisible: btns.some((x) => x.includes("स्वीकार")), declineVisible: btns.some((x) => x.includes("अभी नहीं")),
    NEVER_CLICKED: true,
  };
});

// ── DETAIL: ACCEPTED (journey timeline, advance visible-never-clicked) ──
await page.goto(`${BASE}/bookings/bkacc1`, { waitUntil: "load", timeout: 60000 });
await page.waitForTimeout(7000);
await page.screenshot({ path: join(OUT, "detail-accepted.png") });
out.detailAccepted = await page.evaluate(() => {
  const t = document.body.innerText;
  const btns = [...document.querySelectorAll("button,a")].map((b) => b.textContent.trim());
  return {
    pill: (t.match(/✓ स्वीकृत|यात्रा में/) || [""])[0],
    journey: t.includes("पूजा यात्रा"), advanceVisible: btns.some((x) => x.includes("घर से निकले")),
    callDisc: !!document.querySelector('a[href^="tel:"]'), route: t.includes("रास्ता दिखाइए"),
    NEVER_CLICKED: true,
  };
});

// ── DETAIL deep-link on a REQUESTED booking: the wrong-pill defect ──
await page.goto(`${BASE}/bookings/bkreq1`, { waitUntil: "load", timeout: 60000 });
await page.waitForTimeout(6000);
await page.screenshot({ path: join(OUT, "detail-requested-wrongpill.png") });
out.wrongPill = await page.evaluate(() => (document.body.innerText.match(/यात्रा में|✓ स्वीकृत|✓ संपन्न/) || [""])[0]);

// ── DETAIL: COMPLETED ──
await page.goto(`${BASE}/bookings/bkdone1`, { waitUntil: "load", timeout: 60000 });
await page.waitForTimeout(6000);
await page.screenshot({ path: join(OUT, "detail-completed.png") });
out.detailCompleted = await page.evaluate(() => {
  const t = document.body.innerText;
  const btns = [...document.querySelectorAll("button")].map((b) => b.textContent.trim());
  return { pill: (t.match(/✓ संपन्न|यात्रा में/) || [""])[0], advanceGone: !btns.some((x) => x.includes("घर से निकले") || x.includes("पूजा शुरू की")), completeGone: !btns.some((x) => x.includes("पूजा संपन्न हुई")) };
});

out.narration = await page.evaluate(() => (JSON.parse(sessionStorage.getItem("hpj_voicedebug_buf") || "[]")).filter((l) => l.includes("speak ")).slice(-8));
out.errs = errs.slice(0, 8);
writeFileSync(join(OUT, "results.json"), JSON.stringify(out, null, 1));
await browser.close();
console.log("PAGE10 RUN COMPLETE", JSON.stringify({ empty: out.empty?.emptyTitle, accept: out.request?.acceptVisible }));
