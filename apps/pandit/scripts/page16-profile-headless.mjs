// PAGE 16 · प्रोफ़ाइल — THE HARSH QA WALK (full 11 + §3-V incl. root width).
// Recon: wf_6975ace6-05c. All legs intercepted. NEVER-FIRED: the tel: edit
// row on this screen, the SOS inner dial, and every my-poojas money write
// one tap away. The screen is READ-ONLY by design (editing = a phone call).
//   node scripts/page16-profile-headless.mjs --out ../../docs/review/shots/page16
import { chromium } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { visibilityAudit } from "./lib/visibilityAudit.mjs";

const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i === -1 ? d : process.argv[i + 1]; };
const BASE = arg("base", "http://localhost:3002");
const OUT = arg("out", "../../docs/review/shots/page16");
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ headless: true, args: ["--autoplay-policy=no-user-gesture-required"] });
const CORS = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS", "Access-Control-Allow-Headers": "*" };
const fx = (data) => ({ status: 200, contentType: "application/json", headers: CORS, body: JSON.stringify({ success: true, data }) });
const out = {};

const PROFILE_FULL = {
  fullName: "पं. परीक्षण शर्मा", displayName: null, city: "वाराणसी", location: "Varanasi",
  profilePhotoUrl: null, photoUrl: null,
  specializations: ["सत्यनारायण कथा", "गृह प्रवेश", "रुद्राभिषेक"],
  pendingPoojaVerifications: [], verificationStatus: "VERIFIED",
  experienceYears: 22, isOnline: false, isBookingReady: true, readinessStep: 5, rejectionReason: null,
  dakshinaRates: [
    { id: "r1", pujaType: "सत्यनारायण कथा", amount: 5100 },
    { id: "r2", pujaType: "गृह प्रवेश", amount: 8100 },
    { id: "r3", pujaType: "रुद्राभिषेक", amount: 11000 },
  ],
  pujaServices: [],
};
const PROFILE_NEW = {
  fullName: null, displayName: null, city: null, location: null, profilePhotoUrl: null, photoUrl: null,
  specializations: [], pendingPoojaVerifications: [], verificationStatus: "PENDING",
  experienceYears: 0, isOnline: false, isBookingReady: false, readinessStep: 0, rejectionReason: null,
  dakshinaRates: [], pujaServices: [],
};

const newLeg = async (opts) => {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, deviceScaleFactor: 1 });
  await ctx.addCookies([{ name: "hpj_token", value: "dummy-qa", domain: "localhost", path: "/" }]);
  const page = await ctx.newPage();
  const errs = [];
  const writes = [];
  page.on("console", (m) => { if (m.type() === "error") errs.push(m.text().slice(0, 110)); });
  page.on("pageerror", (e) => errs.push("pageerror:" + String(e).slice(0, 110)));
  await page.route("**/api/tts**", (r) => r.fulfill({ status: 500, body: "" }));
  await page.route("**/api/v1/**", (r) => {
    const u = r.request().url();
    const m = r.request().method();
    if (m === "OPTIONS") return r.fulfill({ status: 204, headers: CORS });
    if (m !== "GET") { writes.push(`${m} ${u.split("/api/v1")[1]}`); return r.fulfill(fx({ ok: true })); }
    if (u.includes("/auth/me")) return r.fulfill(fx({ user: { id: "fx", name: "पं. परीक्षण शर्मा", panditProfile: opts.profile, milestones: [], unseenMilestones: [] } }));
    if (u.includes("/pandit/stats")) return r.fulfill(fx(opts.stats));
    if (u.includes("/pandit/pooja-verifications")) return r.fulfill(fx({ latest: [], history: [] }));
    return r.fulfill(fx([]));
  });
  await page.goto(`${BASE}/onboarding?voicedebug=1`, { waitUntil: "load", timeout: 60000 });
  await page.evaluate(() => {
    localStorage.setItem("pandit_token", "dummy-qa");
    localStorage.setItem("hpj-onboarding", JSON.stringify({ state: { phase: "DONE", detectedCity: "वाराणसी", selectedLanguage: "Hindi", languageConfirmed: true, parichayDone: true, tutorialCompleted: true }, version: 0 }));
    for (const k of Object.keys(localStorage)) if (k.startsWith("tip_seen")) localStorage.removeItem(k);
  });
  await page.goto(`${BASE}/profile-view?voicedebug=1`, { waitUntil: "load", timeout: 60000 });
  await page.waitForTimeout(opts.settle ?? 5500);
  return { ctx, page, errs, writes };
};

const bodyHas = (page, s) => page.evaluate((x) => document.body.innerText.includes(x), s);
const census = (page) => page.evaluate(() => {
  const t = document.body.innerText;
  return {
    seal: !!document.querySelector(".material-symbols-outlined,.material-symbols-filled")
      && /verified/.test(document.body.innerHTML),
    pillVerified: t.includes("प्रमाणित"),
    pillRating: /रेटिंग/.test(t),
    headingVerifiedPoojas: t.includes("प्रमाणित पूजाएँ"),
    headingPlainPoojas: t.includes("आपकी पूजाएँ"),
    greenTicks: document.querySelectorAll(".material-symbols-outlined").length,
    tiles: ["पूजाएँ", "बुकिंग", "साल अनुभव"].map((x) => t.includes(x)),
    rupees: t.match(/₹[\d,]+/g) || [],
    dashes: (t.match(/—/g) || []).length,
    name: t.slice(0, 60).replace(/\s+/g, " "),
    zeroClaims: /\b0 (पूजाएँ|बुकिंग|साल)/.test(t),
  };
});

// ── LEG A · populated + VERIFIED: anatomy, claim census, §3-V ──
{
  const { ctx, page, errs, writes } = await newLeg({ profile: PROFILE_FULL, stats: { rating: 4.8, reviewCount: 12, completedBookings: 9, completionPct: 96 } });
  const res = { section: "A-verified" };
  res.state = await census(page);
  res.controls = await page.evaluate(() =>
    [...document.querySelectorAll("button,a")].map((el) => ({
      text: (el.textContent || "").trim().replace(/\s+/g, " ").slice(0, 34),
      tag: el.tagName, href: el.getAttribute("href"), aria: el.getAttribute("aria-label"),
    })).filter((r) => r.text || r.aria));
  res.telRow = res.controls.find((c) => (c.href || "").startsWith("tel:")) ?? null;
  res.editableFields = await page.evaluate(() => document.querySelectorAll("input,textarea,select").length);
  res.narration = await page.evaluate(() => JSON.parse(sessionStorage.getItem("hpj_voicedebug_buf") || "[]").filter((l) => l.includes("speak")).slice(-3));
  res.visibility = await visibilityAudit(page, "p16-verified");
  await page.screenshot({ path: join(OUT, "k1-verified.png") });
  res.writes = writes; // must be []
  res.errs = errs.slice(0, 5);
  out.A = res;
  await ctx.close();
}

// ── LEG B · brand-new pandit: no fake zeros, no unearned badges ──
{
  const { ctx, page, errs } = await newLeg({ profile: PROFILE_NEW, stats: { rating: null, reviewCount: 0, completedBookings: 0, completionPct: null } });
  const res = { section: "B-brandnew" };
  res.state = await census(page);
  res.visibility = await visibilityAudit(page, "p16-brandnew");
  await page.screenshot({ path: join(OUT, "k2-brandnew.png") });
  res.errs = errs.slice(0, 5);
  out.B = res;
  await ctx.close();
}

// ── LEG C · THE CLAIM DEFECT: unverified pandit, unverified poojas ──
{
  const { ctx, page, errs } = await newLeg({
    profile: { ...PROFILE_FULL, verificationStatus: "PENDING" },
    stats: { rating: null, reviewCount: 0, completedBookings: 0, completionPct: null },
  });
  const res = { section: "C-unverified-claims" };
  res.state = await census(page);
  // the heading must NOT claim प्रमाणित, and a green tick beside every pooja
  // is a claim about EACH pooja's verification — which nothing backs
  res.headingHonest = !res.state.headingVerifiedPoojas && res.state.headingPlainPoojas;
  res.ticksStillDrawn = await page.evaluate(() => document.body.innerHTML.match(/check_circle/g)?.length ?? 0);
  res.visibility = await visibilityAudit(page, "p16-unverified");
  await page.screenshot({ path: join(OUT, "k3-unverified-ticks.png") });
  res.errs = errs.slice(0, 5);
  out.C = res;
  await ctx.close();
}

// ── LEG D · the ⭐ rating pill: does the CLIENT render it when fed? ──
{
  const { ctx, page, errs } = await newLeg({ profile: PROFILE_FULL, stats: { rating: 4.8, reviewCount: 12, completedBookings: 9, completionPct: 96 } });
  const res = { section: "D-rating" };
  res.pillWithRating = await bodyHas(page, "रेटिंग");
  await page.screenshot({ path: join(OUT, "k4-rating-pill.png") });
  const l2 = await newLeg({ profile: PROFILE_FULL, stats: { rating: null, reviewCount: 0, completedBookings: 9, completionPct: 96 } });
  res.pillWithoutRating = await bodyHas(l2.page, "रेटिंग");
  await l2.ctx.close();
  res.errs = errs.slice(0, 4);
  out.D = res;
  await ctx.close();
}

// ── LEG E · nav + read-only proof (no write anywhere) ──
{
  const { ctx, page, errs, writes } = await newLeg({ profile: PROFILE_FULL, stats: { rating: 4.8, reviewCount: 12, completedBookings: 9, completionPct: 96 } });
  const res = { section: "E-nav" };
  await page.evaluate(() => { const b = [...document.querySelectorAll("button")].find((x) => (x.getAttribute("aria-label") || "").includes("पीछे")); b?.click(); });
  await page.waitForTimeout(3500);
  res.backTo = await page.evaluate(() => location.pathname);
  await page.goBack();
  await page.waitForTimeout(3000);
  await page.evaluate(() => { const b = [...document.querySelectorAll("button,a")].find((x) => (x.textContent || "").includes("मेरी पूजाएँ")); b?.click(); });
  await page.waitForTimeout(4000);
  res.poojasHop = await page.evaluate(() => location.pathname);
  res.writes = writes; // must be []
  res.errs = errs.slice(0, 5);
  out.E = res;
  await ctx.close();
}

writeFileSync(join(OUT, "page16-results.json"), JSON.stringify(out, null, 1));
console.log(JSON.stringify({
  A: { state: out.A.state, controls: out.A.controls.length, tel: out.A.telRow, inputs: out.A.editableFields, vis: out.A.visibility.length, writes: out.A.writes, narration: out.A.narration },
  B: { state: out.B.state, vis: out.B.visibility.length },
  C: { heading: out.C.state.headingVerifiedPoojas ? "प्रमाणित पूजाएँ" : "आपकी पूजाएँ", honest: out.C.headingHonest, ticks: out.C.ticksStillDrawn, pillVerified: out.C.state.pillVerified, vis: out.C.visibility.length },
  D: out.D,
  E: { backTo: out.E.backTo, poojasHop: out.E.poojasHop, writes: out.E.writes },
  errors: { A: out.A.errs, B: out.B.errs, C: out.C.errs, E: out.E.errs },
}, null, 1));
await browser.close();
