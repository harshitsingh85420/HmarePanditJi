// §3-V RETRO-SWEEP (Isj order, 2026-07-25): visibilityAudit over every
// fixture-reachable banked state of PAGES 1-11, on the local prod build.
// No voicedebug latch (the 🐞 badge is debug chrome, not product).
//   node scripts/retro-visibility-sweep.mjs --out ../../docs/review/shots/retro-sweep

import { chromium } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { visibilityAudit } from "./lib/visibilityAudit.mjs";

const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i === -1 ? d : process.argv[i + 1]; };
const BASE = arg("base", "http://localhost:3002");
const OUT = arg("out", "retro-sweep");
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ headless: true, args: ["--autoplay-policy=no-user-gesture-required"] });
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
const page = await ctx.newPage();
// SWEEP v2 LESSON: the auth seed BOUNCED every /onboarding state to /home
// (p2-p7 all audited the same populated home in v1). Onboarding/login/
// registration sweep UNAUTHED; the cookie+token land only for p8+.

const fx = (data) => ({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true, data }) });
const today = new Date().toISOString().slice(0, 10);
const bkRow = (id, status, type, total) => ({ id, bookingNumber: `HPJ-${id}`, eventType: type, eventDate: "2026-07-28T10:30:00.000Z", venueAddress: "12 मॉडल टाउन", venueCity: "दिल्ली", grandTotal: total, status });
const ROWS4 = [bkRow("bkreq1", "REQUESTED", "सत्यनारायण कथा", 5100), bkRow("bkacc1", "ACCEPTED", "गृह प्रवेश पूजा", 5600), bkRow("bkip1", "IN_PROGRESS", "हवन", 3100), bkRow("bkdone1", "COMPLETED", "रुद्राभिषेक", 7100)];
const ME = { user: { id: "fx", name: "पं. परीक्षण शर्मा", panditProfile: { isOnline: false, verificationStatus: "APPROVED", isBookingReady: true, readinessStep: 5, rejectionReason: null }, milestones: [], unseenMilestones: [] } };
const ME_DAY1 = { user: { id: "fx", name: "पं. परीक्षण शर्मा", panditProfile: { isOnline: false, verificationStatus: "PENDING", isBookingReady: false, readinessStep: 0, rejectionReason: null }, milestones: [], unseenMilestones: [] } };
let world = "populated";
let earnings = { summary: { today: 1500, week: 5600, month: 12500, pendingPayout: 5600 }, paid: [{ id: "po1", amount: 5100, status: "PAID", paidAt: "2026-07-24T10:00:00.000Z", createdAt: "2026-07-23T10:00:00.000Z", booking: { pujaType: "सत्यनारायण कथा" } }], pending: [{ id: "po3", amount: 5600, status: "PENDING", createdAt: "2026-07-25T08:00:00.000Z", booking: { pujaType: "गृह प्रवेश पूजा", eventDate: "2026-07-25T07:00:00.000Z" } }] };

await page.route("**/api/tts**", (r) => r.fulfill({ status: 500, body: "{}" }));
await page.route("**/api/v1/**", (r) => {
  const u = r.request().url();
  const me = world === "day1" ? ME_DAY1 : ME;
  if (u.includes("/auth/me")) return r.fulfill(fx(me));
  if (u.includes("/pandit/earnings/summary")) return r.fulfill(fx(world === "day1" ? { today: 0, week: 0, month: 0, pendingPayout: 0 } : earnings.summary));
  if (u.includes("/pandit/payouts") && u.includes("PENDING")) return r.fulfill(fx(world === "day1" ? [] : earnings.pending));
  if (u.includes("/pandit/payouts") && u.includes("PAID")) return r.fulfill(fx(world === "day1" ? [] : earnings.paid));
  if (u.includes("/pandit/bookings/") && !u.includes("?")) {
    const id = u.split("/").pop();
    const base = ROWS4.find((x) => x.id === id) || ROWS4[0];
    return r.fulfill(fx({ booking: { ...base, earnings: { dakshinaAmount: base.grandTotal, dakshinaNet: base.grandTotal, totalToPandit: base.grandTotal, storedPayoutMissing: false }, journeyTimestamps: {}, acceptedAt: "2026-07-27T09:00:00.000Z", customer: { name: "श्री वर्मा", phone: "+919000000001" } } }));
  }
  if (u.includes("/pandit/bookings")) return r.fulfill(fx(world === "day1" ? [] : ROWS4));
  if (u.includes("/pandit/readiness")) return r.fulfill(fx({ readinessStep: 0, specializations: [], dakshinaBySpec: {}, samagriTiersByPuja: {}, travel: null, foodPrefs: null, accommodationPrefs: null }));
  if (u.includes("/pandit/stats")) return r.fulfill(fx(world === "day1" ? { rating: null, reviewCount: 0, completedBookings: 0, completionPct: null } : { rating: 4.8, reviewCount: 12, completedBookings: 9, completionPct: 96 }));
  if (u.includes("/muhurat")) return r.fulfill(fx({ muhurats: [] }));
  return r.fulfill(fx([]));
});

const seedPhase = (phase, extra) => page.evaluate(([ph, ex]) => {
  localStorage.removeItem("pandit_token"); // onboarding states are UNAUTHED
  const raw = localStorage.getItem("hpj-onboarding");
  const obj = raw ? JSON.parse(raw) : { state: {}, version: 0 };
  Object.assign(obj.state, { phase: ph, detectedCity: "वाराणसी", selectedLanguage: "Hindi", languageConfirmed: true, parichayDone: true, tutorialCompleted: true, currentTutorialScreen: 1, preferredLanguage: null }, ex || {});
  localStorage.setItem("hpj-onboarding", JSON.stringify(obj));
  for (const k of Object.keys(localStorage)) if (k.startsWith("tip_seen")) localStorage.removeItem(k);
}, [phase, extra]);

const seedAuth = async () => {
  await ctx.addCookies([{ name: "hpj_token", value: "dummy-qa", domain: "localhost", path: "/" }]);
  await page.goto(`${BASE}/onboarding`, { waitUntil: "load", timeout: 60000 });
  await page.evaluate(() => {
    localStorage.setItem("pandit_token", "dummy-qa");
    localStorage.setItem("lastSeenPaidAt", String(Date.parse("2026-07-25T00:00:00Z")));
    const raw = localStorage.getItem("hpj-onboarding");
    const obj = raw ? JSON.parse(raw) : { state: {}, version: 0 };
    Object.assign(obj.state, { phase: "DONE", detectedCity: "वाराणसी", selectedLanguage: "Hindi", languageConfirmed: true, parichayDone: true, tutorialCompleted: true });
    localStorage.setItem("hpj-onboarding", JSON.stringify(obj));
    for (const k of Object.keys(localStorage)) if (k.startsWith("tip_seen")) localStorage.removeItem(k);
  });
};

const all = [];
const sweep = async (name, url, opts = {}) => {
  try {
    if (opts.phase) { await page.goto(`${BASE}/onboarding`, { waitUntil: "load", timeout: 60000 }); await seedPhase(opts.phase, opts.extra); }
    await page.goto(`${BASE}${url}`, { waitUntil: "load", timeout: 60000 });
    await page.waitForTimeout(opts.settle ?? 6500);
    if (opts.pre) await opts.pre();
    const v = await visibilityAudit(page, name);
    all.push(...v);
    await page.screenshot({ path: join(OUT, `${name}.png`) });
    console.log(`${name}: ${v.length} violation(s)`);
  } catch (e) {
    all.push({ state: name, el: "-", check: "SWEEP-ERROR", numbers: String(e).slice(0, 90) });
    console.log(`${name}: ERROR ${String(e).slice(0, 80)}`);
  }
};

// onboarding states (client-seeded)
await sweep("p2-sthaan", "/onboarding", { phase: "LOCATION_PERMISSION", extra: { languageConfirmed: false, parichayDone: false } });
await sweep("p3-bhasha-confirm", "/onboarding", { phase: "LANGUAGE_CONFIRM", extra: { languageConfirmed: false, parichayDone: false } });
await sweep("p3-bhasha-list", "/onboarding", { phase: "LANGUAGE_LIST", extra: { languageConfirmed: false, parichayDone: false } });
await sweep("p4-parichay-needstart", "/onboarding", { phase: "PARICHAY", extra: { parichayDone: false } });
await sweep("p5-tutorial-slide1", "/onboarding", { phase: "TUTORIAL", extra: { tutorialCompleted: false } });
// auth + registration
await sweep("p6-login-step1", "/login", { settle: 4500 });
await sweep("p7-registration", "/onboarding", { phase: "REGISTRATION" });
// dashboard block — NOW the auth lands
await seedAuth();
// readiness
await sweep("p8-hub-0of5", "/readiness/hub");
await sweep("p8-wizard-r1", "/readiness?step=1");
// home
world = "day1"; await sweep("p9-home-day1", "/home");
world = "populated"; await sweep("p9-home-populated", "/home", { settle: 9000 });
// bookings
await sweep("p10-list-populated", "/bookings");
await sweep("p10-request", "/bookings/bkreq1/request");
await sweep("p10-detail-accepted", "/bookings/bkacc1", {
  pre: async () => { await page.evaluate(() => { const b = [...document.querySelectorAll("button")].find((x) => x.textContent.trim() === "समझा"); b?.click(); }); await page.waitForTimeout(2500); },
});
// earnings
world = "day1"; await sweep("p11-earnings-day1", "/earnings");
world = "populated"; await sweep("p11-earnings-populated", "/earnings", {
  settle: 8000,
  pre: async () => { await page.evaluate(() => { const b = [...document.querySelectorAll("button")].find((x) => x.textContent.trim() === "समझा"); b?.click(); }); await page.waitForTimeout(4000); },
});

writeFileSync(join(OUT, "violations.json"), JSON.stringify(all, null, 1));
const byState = {};
for (const v of all) (byState[v.state] ||= []).push(v);
console.log("=== SWEEP TABLE ===");
for (const [s, vs] of Object.entries(byState)) for (const v of vs) console.log(`${s} | ${v.check} | ${String(v.el).slice(0, 38)} | ${v.numbers}`);
console.log(`TOTAL: ${all.length} across ${new Set(all.map((v) => v.state)).size} state(s) of 17 swept`);
await browser.close();
