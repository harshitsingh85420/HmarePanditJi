// PAGE 11 कमाई (earnings) — harsh-QA 2026-07-25. MONEY BOUNDARY: the screen
// is read-only by construction; the never-fire list (complete→payout-create,
// admin mark-paid, bank KYC, SOS inner dial) is asserted-absent/never-fired.
// Leg A: probe prod = the day-one canon-27b empty truth.
// Leg B: LOCAL fixtures (edge gate needs cookie hpj_token + localStorage
// token + FULL /api/v1 interception + /api/tts stub).
//   node scripts/page11-earnings-headless.mjs --mode empty|fixtures --out ...

import { chromium } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i === -1 ? d : process.argv[i + 1]; };
const MODE = arg("mode", "fixtures");
const BASE = arg("base", MODE === "empty" ? "https://hmarepanditji-pandit.vercel.app" : "http://localhost:3002");
const OUT = arg("out", "shots-page11");
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ headless: true, args: ["--autoplay-policy=no-user-gesture-required"] });
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
const page = await ctx.newPage();
const errs = [];
page.on("console", (m) => { if (m.type() === "error") errs.push(m.text().slice(0, 90)); });
page.on("pageerror", (e) => errs.push("pageerror:" + String(e).slice(0, 90)));
const out = { mode: MODE };
const snap = (n) => page.screenshot({ path: join(OUT, `${MODE}-${n}.png`) });

if (MODE === "empty") {
  // ── probe login → the true ₹0 day-one screen ──
  await page.goto(`${BASE}/login?voicedebug=1`, { waitUntil: "load", timeout: 60000 });
  await page.waitForTimeout(2500);
  await page.mouse.click(30, 250);
  await page.locator('input[type="tel"]').first().fill("9999999999");
  await page.getByRole("button", { name: "आगे बढ़िए" }).click();
  await page.waitForTimeout(90000); // outlive a full 75s cold-start send + settle
  if (await page.evaluate(() => document.body.innerText.includes("OTP डालिए"))) {
    await page.locator('input[name="otp"]').first().type("123456", { delay: 40 });
    await page.waitForTimeout(15000);
  }
  await page.goto(`${BASE}/earnings`, { waitUntil: "load", timeout: 60000 });
  await page.waitForTimeout(8000);
  await page.mouse.click(30, 300);
  await page.waitForTimeout(2000);
  await snap("canon27b");
  out.empty = await page.evaluate(() => {
    const t = document.body.innerText;
    const tappables = [...document.querySelectorAll("button,a,[role=button]")].filter((e) => e.offsetParent !== null).length;
    return {
      title: t.includes("कमाई"), emptyTitle: t.includes("कमाई यहाँ दिखेगी"), diyaHint: t.includes("दीया जल रहा है"),
      noZeroHero: !/इस महीने की कमाई/.test(t), // truthful-state: no ₹0 pretending
      noPayoutControls: !/भुगतान माँगिए|बैंक बदलिए|शिकायत/.test(t),
      tappables,
    };
  });
  out.narration = await page.evaluate(() => (JSON.parse(sessionStorage.getItem("hpj_voicedebug_buf") || "[]")).filter((l) => l.includes("speak ")).slice(-5));
} else {
  // ── fixture leg on the local prod build ──
  await ctx.addCookies([{ name: "hpj_token", value: "dummy-qa", domain: "localhost", path: "/" }]);
  const fx = (data) => ({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true, data }) });
  let summary = { today: 1500, week: 5600, month: 12500, pendingPayout: 5600 };
  let paid = [
    { id: "po1", amount: 5100, status: "PAID", paidAt: "2026-07-24T10:00:00.000Z", createdAt: "2026-07-23T10:00:00.000Z", booking: { pujaType: "सत्यनारायण कथा", eventDate: "2026-07-23T09:00:00.000Z" } },
    { id: "po2", amount: 1800, status: "PAID", paidAt: "2026-07-20T10:00:00.000Z", createdAt: "2026-07-19T10:00:00.000Z", booking: { pujaType: "हवन", eventDate: "2026-07-19T09:00:00.000Z" } },
  ];
  let pending = [
    { id: "po3", amount: 5600, status: "PENDING", createdAt: "2026-07-25T08:00:00.000Z", booking: { pujaType: "गृह प्रवेश पूजा", eventDate: "2026-07-25T07:00:00.000Z" } },
  ];
  await page.route("**/api/tts**", (r) => r.fulfill({ status: 500, body: "{}" }));
  await page.route("**/api/v1/**", (r) => {
    const u = r.request().url();
    if (u.includes("/pandit/earnings/summary")) return r.fulfill(fx(summary));
    if (u.includes("/pandit/payouts") && u.includes("PENDING")) return r.fulfill(fx(pending));
    if (u.includes("/pandit/payouts") && u.includes("PAID")) return r.fulfill(fx(paid));
    if (u.includes("/auth/me")) return r.fulfill(fx({ user: { id: "fx", name: "पं. परीक्षण शर्मा", panditProfile: { isOnline: false, verificationStatus: "APPROVED", isBookingReady: true, readinessStep: 5 } }, milestones: [], unseenMilestones: [] }));
    return r.fulfill(fx([]));
  });

  // seed tokens + suppress the payout-moment for the BASE populated shot
  await page.goto(`${BASE}/home?voicedebug=1`, { waitUntil: "load", timeout: 60000 }).catch(() => {});
  await page.evaluate(() => {
    localStorage.setItem("pandit_token", "dummy-qa");
    localStorage.setItem("lastSeenPaidAt", "1"); // EPOCH MILLIS (the key is a Number) — everything is fresh: visit 1 IS the payout moment
    localStorage.removeItem("tip_seen_earningsPending");
    sessionStorage.setItem("hpj_voicedebug", "1");
  });

  // ── PAYOUT-MOMENT first (fresh PAID > old lastSeen; bookkeeping then advances it) ──
  await page.goto(`${BASE}/earnings`, { waitUntil: "load", timeout: 60000 });
  await page.waitForTimeout(6000);
  await snap("payout-moment");
  out.payoutMoment = await page.evaluate(() => {
    const t = document.body.innerText;
    const buf = JSON.parse(sessionStorage.getItem("hpj_voicedebug_buf") || "[]");
    return { banner: t.includes("आपके खाते में भेज दिए गए"), paidVoice: buf.filter((l) => l.includes("speak ")).slice(-4) };
  });

  // ── POPULATED (moment consumed; FirstUseTip due; settle past all animations) ──
  await page.goto(`${BASE}/earnings`, { waitUntil: "load", timeout: 60000 });
  await page.waitForTimeout(8000);
  await snap("populated-tip");
  out.tipVisible = await page.evaluate(() => document.body.innerText.includes("आने वाली राशि") && document.body.innerText.includes("समझा"));
  // [समझा] is a SAFE tap (localStorage only)
  await page.evaluate(() => { const b = [...document.querySelectorAll("button")].find((x) => x.textContent.trim() === "समझा"); b?.click(); });
  await page.waitForTimeout(4500); // past the tip fade + CountUp + coin arcs
  await snap("populated");
  out.populated = await page.evaluate(() => {
    const t = document.body.innerText;
    return {
      hero: t.includes("इस महीने की कमाई") && t.includes("12,500"),
      tiles: t.includes("आज") && t.includes("इस हफ़्ते") && t.includes("1,500") && t.includes("5,600"),
      milGaya: t.includes("मिल गया") && t.includes("सत्यनारायण कथा") && t.includes("5,100"),
      aanaBaki: t.includes("आना बाकी") && t.includes("गृह प्रवेश पूजा"),
      conservation: (() => { const m = t.match(/आना बाकी[\s·]*₹?([\d,]+)/); return m ? m[1] : null; })(),
      noPayoutControls: !/भुगतान माँगिए|बैंक बदलिए|शिकायत/.test(t),
    };
  });

  // ── SKEW leg: summary≠0 but both lists empty → मिल गया 🪙 EmptyState ──
  summary = { today: 0, week: 0, month: 900, pendingPayout: 0 };
  paid = []; pending = [];
  await page.goto(`${BASE}/earnings`, { waitUntil: "load", timeout: 60000 });
  await page.waitForTimeout(6000);
  await snap("skew-empty-lists");
  out.skew = await page.evaluate(() => {
    const t = document.body.innerText;
    return { heroStill: t.includes("इस महीने की कमाई"), noPendingHead: !t.includes("आना बाकी ·") };
  });
}

out.errs = errs.slice(0, 6);
writeFileSync(join(OUT, `results-${MODE}.json`), JSON.stringify(out, null, 1));
await browser.close();
console.log(`PAGE11 ${MODE} COMPLETE`, JSON.stringify(out.empty || out.populated || {}).slice(0, 120));
