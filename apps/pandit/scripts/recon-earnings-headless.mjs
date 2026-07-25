// कमाई (frame 19) RECON PROBE — read-only, harsh-QA 2026-07-25.
// Leg A: PROD day-one truth (probe account, zero payouts) → frame-27b whole-screen empty.
// Leg B: populated via route-interception fixtures on the LIVE bundle (dummy token,
//        EVERY /api/v1/** fulfilled locally — zero prod reads/writes).
// Leg C: payout-moment banner (fresh paidAt vs cleared lastSeenPaidAt).
// MONEY BOUNDARY: no tap on anything but login controls; earnings screen is
// enumerated (buttons/links dumped), never actuated.
//   node scripts/recon-earnings-headless.mjs --out <dir>

import { chromium } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i === -1 ? d : process.argv[i + 1]; };
const BASE = arg("base", "https://hmarepanditji-pandit.vercel.app");
const OUT = arg("out", "recon-earnings-shots");
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ headless: true, args: ["--autoplay-policy=no-user-gesture-required"] });
const out = { legA: {}, legB: {}, legC: {} };

const grabControls = (page) => page.evaluate(() => {
  return [...document.querySelectorAll("a,button,[role=button]")].map((el) => ({
    tag: el.tagName.toLowerCase(),
    aria: el.getAttribute("aria-label") || null,
    href: el.getAttribute("href") || null,
    text: (el.textContent || "").trim().replace(/\s+/g, " ").slice(0, 60),
  }));
});
const grabNarration = (page) => page.evaluate(() =>
  JSON.parse(sessionStorage.getItem("hpj_voicedebug_buf") || "[]").filter((l) => l.includes("speak")).slice(-10)
);

// ────────────────────────── LEG A: PROD DAY-ONE ──────────────────────────
{
  const ctx = await browser.newContext({ viewport: { width: 360, height: 740 }, hasTouch: true, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  const errs = [];
  page.on("console", (m) => { if (m.type() === "error") errs.push(m.text().slice(0, 90)); });
  page.on("pageerror", (e) => errs.push("pageerror:" + String(e).slice(0, 90)));

  await page.goto(`${BASE}/login?voicedebug=1`, { waitUntil: "load", timeout: 60000 });
  await page.waitForTimeout(2500);
  await page.mouse.click(30, 250); // audio unlock
  await page.locator('input[type="tel"]').first().fill("9999999999");
  await page.getByRole("button", { name: "आगे बढ़िए" }).click();
  await page.waitForTimeout(65000); // Render cold start
  if (await page.evaluate(() => document.body.innerText.includes("OTP डालिए"))) {
    await page.locator('input[name="otp"]').first().type("123456", { delay: 40 });
    await page.waitForTimeout(15000);
  }
  out.legA.landed = await page.evaluate(() => location.pathname);

  await page.goto(`${BASE}/earnings?voicedebug=1`, { waitUntil: "load", timeout: 60000 });
  await page.waitForTimeout(1200);
  out.legA.loader = await page.evaluate(() => document.body.innerText.includes("एक क्षण"));
  await page.waitForTimeout(9000); // APIs resolve + settle
  await page.screenshot({ path: join(OUT, "a-dayone-earnings.png") });
  out.legA.state = await page.evaluate(() => {
    const t = document.body.innerText;
    return {
      title: t.includes("कमाई"),
      emptyTitle: t.includes("कमाई यहाँ दिखेगी"),
      emptyHint: t.includes("पहली पूजा का इंतज़ार है"),
      heroAbsent: !t.includes("इस महीने की कमाई"),
      tilesAbsent: !t.includes("इस हफ़्ते"),
      sectionsAbsent: !t.includes("मिल गया") && !t.includes("आना बाकी"),
      zeroRupeeAbsent: !/₹\s*0/.test(t),
      raw: t.slice(0, 600),
    };
  });
  out.legA.controls = await grabControls(page);
  out.legA.narration = await grabNarration(page);
  out.legA.errs = errs.slice(0, 8);
  await ctx.close();
}

// ────────── shared fixture plumbing for legs B/C (zero prod traffic) ──────────
const fx = (data) => ({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true, data }) });
const mkPayout = (o) => ({
  id: o.id, bookingId: o.id + "-bk", panditId: "fx-pandit", amount: o.amount,
  status: o.status, createdAt: o.createdAt, paidAt: o.paidAt ?? null,
  booking: { id: o.id + "-bk", pujaType: o.puja, eventType: o.event || "PUJA", eventDate: o.eventDate },
});
const SUMMARY = { today: 1100, week: 4200, month: 12500, pendingPayout: 9999 }; // 9999 ≠ Σ rows ON PURPOSE: heading must show ₹8,200 (conservation-by-construction)
const PENDING = [
  mkPayout({ id: "fxp1", amount: 5600, status: "PENDING", createdAt: "2026-07-20T05:00:00.000Z", eventDate: "2026-07-18T04:30:00.000Z", puja: "गृह प्रवेश पूजा", event: "GRIHA_PRAVESH" }),
  mkPayout({ id: "fxp2", amount: 2600, status: "PENDING", createdAt: "2026-07-22T05:00:00.000Z", eventDate: "2026-07-21T04:30:00.000Z", puja: "सत्यनारायण कथा", event: "SATYANARAYAN" }),
];
const paidRow = (paidAt) => [
  mkPayout({ id: "fxd1", amount: 5100, status: "PAID", createdAt: "2026-07-10T05:00:00.000Z", paidAt, eventDate: "2026-07-10T04:30:00.000Z", puja: "रुद्राभिषेक", event: "RUDRABHISHEK" }),
];
const wire = async (ctx, { paidAt }) => {
  await ctx.route("**/api/v1/**", (r) => {
    const u = r.request().url();
    if (r.request().method() !== "GET") return r.fulfill(fx(null)); // nothing may write
    if (u.includes("/pandit/earnings/summary")) return r.fulfill(fx(SUMMARY));
    if (u.includes("/pandit/payouts") && u.includes("status=PENDING")) return r.fulfill(fx(PENDING));
    if (u.includes("/pandit/payouts") && u.includes("status=PAID")) return r.fulfill(fx(paidRow(paidAt)));
    if (u.includes("/auth/me")) return r.fulfill(fx({ user: { id: "fx", name: "पं. परीक्षण शर्मा", panditProfile: { isOnline: false, verificationStatus: "APPROVED", isBookingReady: true, readinessStep: 5, rejectionReason: null }, milestones: [], unseenMilestones: [] } }));
    return r.fulfill(fx(null));
  });
  await ctx.route("**/api/tts**", (r) => r.fulfill({ status: 500, body: "" })); // no Sarvam burn
};

// ────────────────────────── LEG B: POPULATED (banner suppressed) ──────────────────────────
{
  const ctx = await browser.newContext({ viewport: { width: 360, height: 740 }, hasTouch: true, deviceScaleFactor: 1 });
  await ctx.addInitScript(() => {
    localStorage.setItem("pandit_token", "dummy-qa-token");
    localStorage.setItem("lastSeenPaidAt", String(Date.now())); // newer than fixture paidAt → no payout-moment
  });
  await wire(ctx, { paidAt: "2026-07-12T10:00:00.000Z" });
  const page = await ctx.newPage();
  const errs = [];
  page.on("console", (m) => { if (m.type() === "error") errs.push(m.text().slice(0, 90)); });
  await page.goto(`${BASE}/earnings?voicedebug=1`, { waitUntil: "load", timeout: 60000 });
  await page.waitForTimeout(6000); // fetches instant; CountUp 200+1500ms + settle
  await page.screenshot({ path: join(OUT, "b-populated-top.png") });
  out.legB.state = await page.evaluate(() => {
    const t = document.body.innerText;
    return {
      hero: t.includes("इस महीने की कमाई") && t.includes("12,500"),
      tileToday: t.includes("आज") && t.includes("1,100"),
      tileWeek: t.includes("इस हफ़्ते") && t.includes("4,200"),
      paidSection: t.includes("मिल गया") && t.includes("5,100"),
      paidDate: t.includes("12 जुलाई"),
      pendingHeadingIsSumOfRows: t.includes("8,200"),
      summaryFigureLeaked: t.includes("9,999"),
      pendingRows: t.includes("5,600") && t.includes("2,600"),
      pendingDates: t.includes("18 जुलाई") && t.includes("21 जुलाई"),
      bannerAbsent: !t.includes("आपके खाते में भेज दिए गए"),
      coachTip: t.includes("आने वाली राशि") || t.includes("चौबीस घंटे"),
      raw: t.slice(0, 900),
    };
  });
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(800);
  await page.screenshot({ path: join(OUT, "b-populated-bottom.png") });
  out.legB.controls = await grabControls(page);
  out.legB.narration = await grabNarration(page);
  out.legB.errs = errs.slice(0, 8);
  await ctx.close();
}

// ────────────────────────── LEG C: PAYOUT MOMENT ──────────────────────────
{
  const ctx = await browser.newContext({ viewport: { width: 360, height: 740 }, hasTouch: true, deviceScaleFactor: 1 });
  await ctx.addInitScript(() => {
    localStorage.setItem("pandit_token", "dummy-qa-token");
    localStorage.removeItem("lastSeenPaidAt"); // fresh paidAt > 0 → THE MOMENT
  });
  await wire(ctx, { paidAt: new Date().toISOString() });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/earnings?voicedebug=1`, { waitUntil: "load", timeout: 60000 });
  await page.waitForTimeout(6000);
  await page.screenshot({ path: join(OUT, "c-payout-moment.png") });
  out.legC.state = await page.evaluate(() => {
    const t = document.body.innerText;
    return {
      banner: t.includes("आपके खाते में भेज दिए गए"),
      bannerAmount: t.includes("5,100"),
      lastSeenPaidAtWritten: Number(localStorage.getItem("lastSeenPaidAt") || 0) > 0,
      raw: t.slice(0, 400),
    };
  });
  out.legC.narration = await grabNarration(page);
  await ctx.close();
}

writeFileSync(join(OUT, "results.json"), JSON.stringify(out, null, 1));
await browser.close();
console.log("EARNINGS RECON COMPLETE", JSON.stringify({
  dayoneEmpty: out.legA.state?.emptyTitle, conservation: out.legB.state?.pendingHeadingIsSumOfRows,
  leak: out.legB.state?.summaryFigureLeaked, banner: out.legC.state?.banner,
}));
