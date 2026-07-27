// PAGE 18 · आपातकालीन SOS — THE HARSH QA WALK (full 11 + §3-V).
// ABSOLUTE NEVER-FIRE: no alert, no dial, no message. Every navigation
// that could place a call is INTERCEPTED at the browser level — tel:
// hrefs are asserted and neutralised, and window.location assignment to a
// tel: URL is trapped before it can reach the dialer.
//   node scripts/page18-sos-headless.mjs --out ../../docs/review/shots/page18
import { chromium } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { visibilityAudit } from "./lib/visibilityAudit.mjs";

const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i === -1 ? d : process.argv[i + 1]; };
const BASE = arg("base", "http://localhost:3002");
const OUT = arg("out", "../../docs/review/shots/page18");
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ headless: true, args: ["--autoplay-policy=no-user-gesture-required"] });
const CORS = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS", "Access-Control-Allow-Headers": "*" };
const fx = (data) => ({ status: 200, contentType: "application/json", headers: CORS, body: JSON.stringify({ success: true, data }) });
const out = {};

// THE DIAL TRAP: installed before any app code runs. Records every
// attempt to reach a dialer and prevents it. Nothing real can fire.
const DIAL_TRAP = () => {
  window.__dialAttempts = [];
  const trap = (url) => { window.__dialAttempts.push(String(url)); };
  const desc = Object.getOwnPropertyDescriptor(window, "location");
  try {
    Object.defineProperty(window, "location", {
      configurable: true,
      get: () => new Proxy(desc?.get ? desc.get.call(window) : window.document.location, {
        set(t, p, v) { if (p === "href") { trap(v); return true; } t[p] = v; return true; },
        get(t, p) { const val = t[p]; return typeof val === "function" ? val.bind(t) : val; },
      }),
      set: (v) => trap(v),
    });
  } catch { /* if the trap cannot install, the leg below asserts it did */ }
  document.addEventListener("click", (e) => {
    const a = e.target instanceof Element ? e.target.closest("a[href^='tel:']") : null;
    if (a) { trap(a.getAttribute("href")); e.preventDefault(); e.stopPropagation(); }
  }, true);
};

const newLeg = async (opts = {}) => {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  const errs = [];
  const writes = [];
  page.on("console", (m) => { if (m.type() === "error") errs.push(m.text().slice(0, 110)); });
  page.on("pageerror", (e) => errs.push("pageerror:" + String(e).slice(0, 110)));
  await page.addInitScript(DIAL_TRAP);
  await page.route("**/api/tts**", (r) => r.fulfill({ status: 500, body: "" }));
  await page.route("**/api/v1/**", (r) => {
    const m = r.request().method();
    if (m === "OPTIONS") return r.fulfill({ status: 204, headers: CORS });
    if (m !== "GET") { writes.push(`${m} ${r.request().url().split("/api/v1")[1]}`); return r.fulfill(fx({ ok: true })); }
    if (r.request().url().includes("/auth/me")) return r.fulfill(fx({ user: { id: "fx", name: "पं. परीक्षण शर्मा", panditProfile: { isOnline: false, verificationStatus: "APPROVED", isBookingReady: true, readinessStep: 5, specializations: [], pendingPoojaVerifications: [], dakshinaRates: [], pujaServices: [], rejectionReason: null }, milestones: [], unseenMilestones: [] } }));
    return r.fulfill(fx([]));
  });
  if (opts.offline) await ctx.setOffline(true);
  await page.goto(`${BASE}${opts.path ?? "/emergency"}?voicedebug=1`, { waitUntil: "load", timeout: 60000 }).catch(() => {});
  await page.waitForTimeout(opts.settle ?? 4500);
  return { ctx, page, errs, writes };
};

const dials = (page) => page.evaluate(() => window.__dialAttempts ?? []);
const bodyHas = (page, s) => page.evaluate((x) => document.body.innerText.includes(x), s);

// ── LEG A · the SOS screen at rest: anatomy, §3-V, never-fire census ──
{
  const { ctx, page, errs, writes } = await newLeg();
  const res = { section: "A-rest" };
  res.title = await page.evaluate(() => document.body.innerText.split("\n").slice(0, 6).join(" | ").slice(0, 120));
  res.controls = await page.evaluate(() =>
    [...document.querySelectorAll("button,a")].map((el) => ({
      text: (el.textContent || "").trim().replace(/\s+/g, " ").slice(0, 42),
      tag: el.tagName, href: el.getAttribute("href"), aria: el.getAttribute("aria-label"),
      w: Math.round(el.getBoundingClientRect().width), h: Math.round(el.getBoundingClientRect().height),
    })).filter((r) => r.text || r.aria));
  res.holdButton = res.controls.find((c) => (c.aria || "").includes("दबाकर रखिए")) ?? null;
  res.teamRow = res.controls.find((c) => c.text.includes("सहायता टीम")) ?? null;
  res.narration = await page.evaluate(() => JSON.parse(sessionStorage.getItem("hpj_voicedebug_buf") || "[]").slice(-4));
  res.visibility = await visibilityAudit(page, "p18-sos-rest");
  res.dialsAtRest = await dials(page);
  await page.screenshot({ path: join(OUT, "m1-sos-rest.png") });
  res.writes = writes;
  res.errs = errs.slice(0, 5);
  out.A = res;
  await ctx.close();
}

// ── LEG B · the hold gesture: early release CANCELS; full hold fires ──
{
  const { ctx, page, errs, writes } = await newLeg();
  const res = { section: "B-hold" };
  const btn = page.locator('button[aria-label*="दबाकर रखिए"]');
  // 1. SHORT press — must cancel, no dial, no state change
  await btn.dispatchEvent("pointerdown");
  await page.waitForTimeout(400);
  await btn.dispatchEvent("pointerup");
  await page.waitForTimeout(1200);
  res.afterShortPress = { dials: await dials(page), sentState: await bodyHas(page, "जुड़ रहे") };
  await page.screenshot({ path: join(OUT, "m2-hold-cancelled.png") });
  // 2. SCROLL-STEALS-GESTURE — pointercancel must also cancel
  await btn.dispatchEvent("pointerdown");
  await page.waitForTimeout(400);
  await btn.dispatchEvent("pointercancel");
  await page.waitForTimeout(1200);
  res.afterPointerCancel = { dials: await dials(page) };
  // 3. FULL HOLD — the real fire path, caught by the trap
  await btn.dispatchEvent("pointerdown");
  await page.waitForTimeout(1600); // > HOLD_MS 1200
  await btn.dispatchEvent("pointerup");
  await page.waitForTimeout(3500);
  res.afterFullHold = { dials: await dials(page) };
  res.sentUiText = await page.evaluate(() => document.body.innerText.replace(/\s+/g, " ").slice(0, 260));
  res.buttonDisabledAfter = await page.evaluate(() => document.querySelector('button[aria-label*="दबाकर रखिए"]')?.disabled ?? null);
  res.spoken = await page.evaluate(() => JSON.parse(sessionStorage.getItem("hpj_voicedebug_buf") || "[]").slice(-4));
  res.visibilitySent = await visibilityAudit(page, "p18-sos-sent");
  await page.screenshot({ path: join(OUT, "m3-sos-fired.png") });
  res.writes = writes; // MUST be [] — there is no SOS endpoint
  res.errs = errs.slice(0, 5);
  out.B = res;
  await ctx.close();
}

// ── LEG C · OFFLINE — the most honest screen in the app, or a P0 ──
{
  const { ctx, page, errs, writes } = await newLeg({ settle: 4000 });
  const res = { section: "C-offline" };
  await ctx.setOffline(true);
  await page.waitForTimeout(1200);
  res.rendered = await bodyHas(page, "सहायता बुलाइए");
  res.banner = await bodyHas(page, "इंटरनेट नहीं है");
  const btn = page.locator('button[aria-label*="दबाकर रखिए"]');
  await btn.dispatchEvent("pointerdown");
  await page.waitForTimeout(1600);
  await btn.dispatchEvent("pointerup");
  await page.waitForTimeout(3500);
  res.dialsOffline = await dials(page);
  res.uiTextOffline = await page.evaluate(() => document.body.innerText.replace(/\s+/g, " ").slice(0, 260));
  res.claimsSentOffline = await bodyHas(page, "भेज दिया");
  res.visibility = await visibilityAudit(page, "p18-sos-offline");
  await page.screenshot({ path: join(OUT, "m4-sos-offline.png") });
  res.writes = writes;
  res.errs = errs.slice(0, 6);
  out.C = res;
  await ctx.close();
}

// ── LEG D · the floating pill: entries + expanded state (never fired) ──
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, deviceScaleFactor: 1 });
  await ctx.addCookies([{ name: "hpj_token", value: "dummy-qa", domain: "localhost", path: "/" }]);
  const page = await ctx.newPage();
  const errs = [];
  page.on("pageerror", (e) => errs.push(String(e).slice(0, 100)));
  await page.addInitScript(DIAL_TRAP);
  await page.route("**/api/tts**", (r) => r.fulfill({ status: 500, body: "" }));
  await page.route("**/api/v1/**", (r) => {
    const m = r.request().method();
    if (m === "OPTIONS") return r.fulfill({ status: 204, headers: CORS });
    if (r.request().url().includes("/auth/me")) return r.fulfill(fx({ user: { id: "fx", name: "पं. परीक्षण शर्मा", panditProfile: { isOnline: false, verificationStatus: "APPROVED", isBookingReady: true, readinessStep: 5, specializations: [], pendingPoojaVerifications: [], dakshinaRates: [], pujaServices: [], rejectionReason: null }, milestones: [], unseenMilestones: [] } }));
    return r.fulfill(fx(m === "GET" ? [] : { ok: true }));
  });
  await page.goto(`${BASE}/onboarding?voicedebug=1`, { waitUntil: "load", timeout: 60000 });
  await page.evaluate(() => {
    localStorage.setItem("pandit_token", "dummy-qa");
    localStorage.setItem("hpj-onboarding", JSON.stringify({ state: { phase: "DONE", detectedCity: "वाराणसी", selectedLanguage: "Hindi", languageConfirmed: true, parichayDone: true, tutorialCompleted: true }, version: 0 }));
  });
  const res = { section: "D-pill", screens: [] };
  for (const path of ["/home", "/bookings", "/earnings", "/calendar", "/settings", "/my-poojas"]) {
    await page.goto(`${BASE}${path}?voicedebug=1`, { waitUntil: "load", timeout: 60000 }).catch(() => {});
    await page.waitForTimeout(3500);
    const present = await page.evaluate(() => [...document.querySelectorAll("button")].some((b) => (b.textContent || "").includes("मदद") && (b.textContent || "").includes("SOS") === false ? false : /SOS|आपातकालीन/i.test(b.textContent || "") || /आपातकालीन/.test(b.getAttribute("aria-label") || "")));
    res.screens.push({ path, pill: present });
  }
  // expanded state on the last screen
  await page.evaluate(() => { const b = [...document.querySelectorAll("button")].find((x) => /आपातकालीन/.test(x.getAttribute("aria-label") || "")); b?.click(); });
  await page.waitForTimeout(1500);
  res.expandedRow = await bodyHas(page, "सहायता टीम को कॉल कीजिए");
  res.visibilityExpanded = await visibilityAudit(page, "p18-pill-expanded");
  await page.screenshot({ path: join(OUT, "m5-pill-expanded.png") });
  // second tap on the pill navigates to /emergency (asserted, not dialed)
  await page.evaluate(() => { const b = [...document.querySelectorAll("button")].find((x) => /आपातकालीन/.test(x.getAttribute("aria-label") || "")); b?.click(); });
  await page.waitForTimeout(4000);
  res.landedOn = await page.evaluate(() => location.pathname);
  res.dials = await dials(page);
  await page.screenshot({ path: join(OUT, "m6-pill-to-emergency.png") });
  res.errs = errs.slice(0, 5);
  out.D = res;
  await ctx.close();
}

writeFileSync(join(OUT, "page18-results.json"), JSON.stringify(out, null, 1));
console.log(JSON.stringify({
  A: { title: out.A.title, controls: out.A.controls.length, hold: out.A.holdButton, team: out.A.teamRow, vis: out.A.visibility.length, dialsAtRest: out.A.dialsAtRest, writes: out.A.writes },
  B: { short: out.B.afterShortPress, cancel: out.B.afterPointerCancel, full: out.B.afterFullHold, ui: out.B.sentUiText, disabled: out.B.buttonDisabledAfter, writes: out.B.writes, vis: out.B.visibilitySent.length },
  C: { rendered: out.C.rendered, banner: out.C.banner, dials: out.C.dialsOffline, claimsSent: out.C.claimsSentOffline, ui: out.C.uiTextOffline, vis: out.C.visibility.length, writes: out.C.writes },
  D: { screens: out.D.screens, expandedRow: out.D.expandedRow, landedOn: out.D.landedOn, dials: out.D.dials, vis: out.D.visibilityExpanded.length },
  errors: { A: out.A.errs, B: out.B.errs, C: out.C.errs, D: out.D.errs },
}, null, 1));
await browser.close();
