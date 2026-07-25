// PAGE 9 होम (the pandit dashboard) headless walk — harsh-QA 2026-07-25.
// PROD probe session; the probe IS the day-one empty dashboard. Also
// collects the SOS-fix after-proof (rects + shot) on /readiness/hub.
//   node scripts/page9-home-headless.mjs --out ../../docs/review/shots/page9

import { chromium } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i === -1 ? d : process.argv[i + 1]; };
const BASE = arg("base", "https://hmarepanditji-pandit.vercel.app");
const OUT = arg("out", "shots-page9");
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ headless: true, args: ["--autoplay-policy=no-user-gesture-required"] });
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
const page = await ctx.newPage();
const errs = [];
page.on("console", (m) => { if (m.type() === "error") errs.push(m.text().slice(0, 90)); });
page.on("pageerror", (e) => errs.push("pageerror:" + String(e).slice(0, 90)));

const out = {};
const POPONLY = process.argv.includes("--populated-only");
if (POPONLY) {
  // local: interception fulfills every API call before it leaves — no CORS,
  // no login; a dummy token satisfies the layout guard
  await page.goto(`${BASE}/home?voicedebug=1`, { waitUntil: "load", timeout: 60000 }).catch(() => {});
  await page.evaluate(() => localStorage.setItem("pandit_token", "dummy-qa-token"));
}
// ── probe login ──
if (!POPONLY) {
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
out.landed = await page.evaluate(() => location.pathname);
}

if (!POPONLY) {
// ── होम full-page state ──
await page.goto(`${BASE}/home`, { waitUntil: "load", timeout: 60000 });
await page.waitForTimeout(9000);
await page.mouse.click(30, 400); // unlock
await page.waitForTimeout(2000);
await page.screenshot({ path: join(OUT, "home-top.png") });
out.home = await page.evaluate(() => {
  const t = document.body.innerText;
  return {
    greeting: (t.match(/नमस्ते, [^\n]*/) || [""])[0],
    dateLine: (t.match(/(सोम|मंगल|बुध|गुरु|शुक्र|शनि|रवि)वार[^\n]*/) || [""])[0],
    muhuratChip: t.includes("शुभ मुहूर्त"),
    pendingBanner: t.includes("सत्यापन में है"),
    earningsZero: t.includes("₹0"),
    taiyariHero: t.includes("बुकिंग पाने की तैयारी"),
    taiyariPill: /\d\/5 पूरे/.test(t),
    emptyToday: t.includes("आज कोई बुकिंग नहीं"),
    statRow: /रेटिंग|पूरी हुईं/.test(t),
    nextBookingHero: t.includes("अगली बुकिंग"),
    goOnline: /ऑनलाइन जाइए|ऑफलाइन जाइए/.test(t),
  };
});
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
await page.waitForTimeout(1200);
await page.screenshot({ path: join(OUT, "home-bottom.png") });

// SOS-vs-orb rects on HOME (the FAB floats on every dashboard screen)
out.sosHome = await page.evaluate(() => {
  const sos = [...document.querySelectorAll("button")].find((b) => b.textContent.includes("मदद"));
  const orb = document.querySelector('button[aria-label*="शिष्य"]');
  const r = (el) => el ? el.getBoundingClientRect() : null;
  const a = r(sos), b = r(orb);
  return { sos: a && { x: Math.round(a.x), y: Math.round(a.y), w: Math.round(a.width), h: Math.round(a.height) }, orb: b && { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height) }, overlap: !!(a && b && a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height) };
});

// ── taps: settings gear, तैयारी hero, bottom nav (arg-passed, no closures) ──
out.taps = [];
const tap = async (kind, needle, label) => {
  await page.goto(`${BASE}/home`, { waitUntil: "load", timeout: 60000 });
  await page.waitForTimeout(6000);
  const ok = await page.evaluate(([k, n]) => {
    const all = [...document.querySelectorAll("a,button,[role=button]")];
    let el = null;
    if (k === "glyph") el = all.find((x) => x.querySelector('[class*="material-symbols"]')?.textContent?.trim() === n);
    else {
      const hits = all.filter((x) => (x.textContent || "").includes(n));
      el = hits[hits.length - 1] || null;
    }
    if (el) { el.click(); return true; }
    return false;
  }, [kind, needle]);
  await page.waitForTimeout(4000);
  out.taps.push({ label, ok, dest: await page.evaluate(() => location.pathname) });
};
await tap("glyph", "settings", "settings-gear");
await tap("text", "बुकिंग पाने की तैयारी", "taiyari-hero");
for (const nav of ["बुकिंग", "कमाई", "कैलेंडर"]) await tap("text", nav, `nav-${nav}`);
}

// ── POPULATED LEG: route-interception fixtures on the LIVE bundle —
// real components, controlled data, ZERO prod writes ──
const fx = (data) => ({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true, data }) });
const today = new Date().toISOString().slice(0, 10);
await page.route("**/api/v1/auth/me", (r) => r.fulfill(fx({ user: { id: "fx", name: "पं. परीक्षण शर्मा", panditProfile: { isOnline: false, verificationStatus: "APPROVED", isBookingReady: true, readinessStep: 5, rejectionReason: null }, milestones: [], unseenMilestones: [] } })));
await page.route("**/api/v1/pandit/bookings**", (r) => {
  const u = r.request().url();
  // REAL shape: res.data is a BARE ARRAY; fields pujaType/eventDate/status
  const b1 = { id: "fx1", pujaType: "गृह प्रवेश पूजा", eventDate: `${today}T09:00:00.000Z`, status: "CONFIRMED", dakshina: 5600, customerName: "शर्मा परिवार", venueAddress: "अस्सी घाट, वाराणसी" };
  if (u.includes("status=REQUESTED")) return r.fulfill(fx([]));
  return r.fulfill(fx([b1]));
});
await page.route("**/api/v1/pandit/earnings/summary", (r) => r.fulfill(fx({ today: 0, month: 12500, pendingPayout: 3000 })));
await page.route("**/api/v1/pandit/stats", (r) => r.fulfill(fx({ rating: 4.8, reviewCount: 12, completedBookings: 9, completionPct: 96 })));
await page.route("**/api/v1/pandit/status", (r) => r.fulfill(fx({ isOnline: true })));
await page.goto(`${BASE}/home`, { waitUntil: "load", timeout: 60000 });
await page.waitForTimeout(9000);
await page.screenshot({ path: join(OUT, "home-populated.png") });
out.populated = await page.evaluate(() => {
  const t = document.body.innerText;
  return {
    nextBookingHero: t.includes("अगली बुकिंग") || t.includes("गृह प्रवेश"),
    statRow: /रेटिंग|पूरी हुईं|4.8/.test(t),
    goOnlinePill: /ऑनलाइन जाइए/.test(t),
    month: t.includes("12,500") || t.includes("12500"),
    todayRow: t.includes("शर्मा परिवार") || t.includes("गृह प्रवेश"),
    taiyariHeroGone: !t.includes("बुकिंग पाने की तैयारी"),
  };
});
// GO-ONLINE toggle: intercepted PATCH → optimistic online state, no prod write
const toggled = await page.evaluate(() => {
  const el = [...document.querySelectorAll("button")].find((x) => x.textContent.includes("ऑनलाइन जाइए"));
  if (el) { el.click(); return true; }
  return false;
});
await page.waitForTimeout(4000);
out.populated.toggled = toggled;
out.populated.onlineAfter = await page.evaluate(() => /ऑफलाइन जाइए|परिवार अब आपको बुला सकते हैं/.test(document.body.innerText));
await page.screenshot({ path: join(OUT, "home-online.png") });
await page.unrouteAll({ behavior: "ignoreErrors" });

if (!POPONLY) {
// ── SOS after-proof on the hub (same session, fixed bundle) ──
await page.goto(`${BASE}/readiness/hub`, { waitUntil: "load", timeout: 60000 });
await page.waitForTimeout(7000);
await page.screenshot({ path: join(OUT, "hub-after-sos-fix.png") });
out.sosHub = await page.evaluate(() => {
  const sos = [...document.querySelectorAll("button")].find((b) => b.textContent.includes("मदद"));
  const orb = document.querySelector('button[aria-label*="शिष्य"]');
  const r = (el) => el ? el.getBoundingClientRect() : null;
  const a = r(sos), b = r(orb);
  return { sos: a && { x: Math.round(a.x), y: Math.round(a.y), h: Math.round(a.height) }, orb: b && { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height) }, overlap: !!(a && b && a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height) };
});
// BOTH independently TAPPABLE: (1) SOS tap expands its quick-action panel
// (first tap only — the inner action would dial support; never fired);
out.sosTap = await page.evaluate(() => {
  const sos = [...document.querySelectorAll("button")].find((b) => b.textContent.includes("मदद"));
  if (!sos) return { tapped: false };
  sos.click();
  return { tapped: true };
});
await page.waitForTimeout(1500);
out.sosTap.expanded = await page.evaluate(() => /सहायता|टीम|कॉल/.test(document.body.innerText));
await page.screenshot({ path: join(OUT, "sos-expanded.png") });
await page.evaluate(() => { const sos = [...document.querySelectorAll("button")].find((b) => b.textContent.includes("मदद")); sos?.click(); }); // collapse
await page.waitForTimeout(800);
// (2) orb tap sleeps → asleep aria → wake (the one-orb law intact under the FAB fix)
out.orbTap = await page.evaluate(() => { const o = document.querySelector('button[aria-label="शिष्य को सुला दें"]'); if (o) { o.click(); return true; } return false; });
await page.waitForTimeout(2500);
out.orbAsleep = await page.evaluate(() => !!document.querySelector('button[aria-label="शिष्य को जगाइए"]'));
await page.evaluate(() => { const w = [...document.querySelectorAll("button")].find((b) => b.textContent.includes("जगाइए")) || document.querySelector('button[aria-label="शिष्य को जगाइए"]'); w?.click(); });
await page.waitForTimeout(1500);
// व→और render confirmation on the same hub visit
out.vAurRendered = await page.evaluate(() => document.body.innerText.includes("पूजाएँ और दक्षिणा") && !document.body.innerText.includes("पूजाएँ व दक्षिणा"));
}

out.narration = await page.evaluate(() => (JSON.parse(sessionStorage.getItem("hpj_voicedebug_buf") || "[]")).filter((l) => l.includes("speak ")).slice(-8));
out.errs = errs.slice(0, 8);
writeFileSync(join(OUT, "results.json"), JSON.stringify(out, null, 1));
await browser.close();
console.log("PAGE9 RUN COMPLETE", JSON.stringify({ landed: out.landed, sosHubOverlap: out.sosHub?.overlap }));
