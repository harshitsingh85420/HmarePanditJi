// PAGE 13 · मेरी पूजाएँ — THE HARSH QA WALK (full 11 + §3-V native).
// Recon: wf_a8a553f4-4c2. ALL legs run under full **/api/v1/** interception —
// this screen's ✖ delete, dakshina save (a MONEY WRITE, voice-completable)
// and the add-wizard submit chain never touch prod. Money law here:
// every ₹ string is the pandit's RAW rate — zero split/commission claims
// (Ruling #7: 100% to pandit; the fee is customer-side, guarded server-side).
//   node scripts/page13-mypoojas-headless.mjs --out ../../docs/review/shots/page13
import { chromium } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { visibilityAudit } from "./lib/visibilityAudit.mjs";

const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i === -1 ? d : process.argv[i + 1]; };
const BASE = arg("base", "http://localhost:3002");
const OUT = arg("out", "../../docs/review/shots/page13");
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ headless: true, args: ["--autoplay-policy=no-user-gesture-required"] });
// CORS on every fulfill + explicit OPTIONS: the Idempotency-Key header
// preflights; when Render sleeps the real-server preflight path dies
// (ERR_CONNECTION_CLOSED flake) — the harness answers them itself.
const CORS = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS", "Access-Control-Allow-Headers": "*" };
const fx = (data) => ({ status: 200, contentType: "application/json", headers: CORS, body: JSON.stringify({ success: true, data }) });
const out = {};

const ME = (profile) => ({ user: { id: "fx", name: "पं. परीक्षण शर्मा", panditProfile: { isOnline: false, verificationStatus: "APPROVED", isBookingReady: true, readinessStep: 5, rejectionReason: null, ...profile }, milestones: [], unseenMilestones: [] } });
const POP_PROFILE = {
  specializations: ["सत्यनारायण कथा", "गृह प्रवेश", "रुद्राभिषेक", "नवग्रह शांति"],
  pendingPoojaVerifications: [],
  dakshinaRates: [
    { id: "r1", pujaType: "सत्यनारायण कथा", amount: 5100 },
    { id: "r2", pujaType: "गृह प्रवेश", amount: 8100 },
    { id: "r3", pujaType: "रुद्राभिषेक", amount: 11000 },
    { id: "r4", pujaType: "नवग्रह शांति", amount: 7500 },
  ],
  pujaServices: [],
};
const POP_VERIF = {
  latest: [
    { poojaType: "सत्यनारायण कथा", status: "APPROVED", rejectionReason: null, version: 1, videoProvider: "YOUTUBE" },
    { poojaType: "गृह प्रवेश", status: "APPROVED", rejectionReason: null, version: 1, videoProvider: "YOUTUBE" },
    { poojaType: "रुद्राभिषेक", status: "PENDING", rejectionReason: null, version: 1, videoProvider: "YOUTUBE" },
    { poojaType: "नवग्रह शांति", status: "REJECTED", rejectionReason: "वीडियो धुंधला है", version: 1, videoProvider: "YOUTUBE" },
  ],
  history: [],
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
    if (m !== "GET") {
      writes.push(`${m} ${u.split("/api/v1")[1]}`);
      if (opts.floorReject && u.includes("/pandit/dakshina-rates")) {
        return r.fulfill({ status: 400, contentType: "application/json", headers: CORS, body: JSON.stringify({ success: false, error: { code: "dakshina_below_floor", message: "दक्षिणा कम से कम ₹501 रखिए — आपने ₹101 भरा है।", floor: 501 } }) });
      }
      if (opts.deleteBlocked && u.includes("/pandit/specializations/")) {
        return r.fulfill({ status: 409, contentType: "application/json", headers: CORS, body: JSON.stringify({ success: false, error: "active_bookings" }) });
      }
      return r.fulfill(fx({ ok: true }));
    }
    if (u.includes("/auth/me")) return r.fulfill(fx(ME(opts.profile)));
    if (u.includes("/pandit/pooja-verifications")) {
      if (opts.verifFail) return r.fulfill({ status: 500, body: "{}" });
      return r.fulfill(fx(opts.verif));
    }
    return r.fulfill(fx([]));
  });
  await page.goto(`${BASE}/onboarding?voicedebug=1`, { waitUntil: "load", timeout: 60000 });
  await page.evaluate((seed) => {
    localStorage.setItem("pandit_token", "dummy-qa");
    const o = { state: { phase: "DONE", detectedCity: "वाराणसी", selectedLanguage: "Hindi", languageConfirmed: true, parichayDone: true, tutorialCompleted: true }, version: 0 };
    localStorage.setItem("hpj-onboarding", JSON.stringify(o));
    for (const k of Object.keys(localStorage)) if (k.startsWith("tip_seen")) localStorage.removeItem(k);
    localStorage.removeItem("add-pooja-draft");
    if (seed === null) localStorage.removeItem("hpj_seen_approved_poojas");
    else localStorage.setItem("hpj_seen_approved_poojas", seed);
  }, opts.seenApproved ?? null);
  await page.goto(`${BASE}/my-poojas?voicedebug=1`, { waitUntil: "load", timeout: 60000 });
  await page.waitForTimeout(opts.settle ?? 6500);
  return { ctx, page, errs, writes };
};

const moneyCensus = (page) => page.evaluate(() => {
  const txt = document.body.innerText;
  return {
    rupeeStrings: (txt.match(/₹[\d,]+/g) || []),
    percentStrings: (txt.match(/[\d]+\s*(%|प्रतिशत)/g) || []),
    commissionWords: (txt.match(/कमीशन|commission|कटौती|काटा|शुल्क/g) || []),
  };
});

// ── LEG A · EMPTY (canon 27c) ────────────────────────────────
{
  const { ctx, page, errs, writes } = await newLeg({ profile: { specializations: [], pendingPoojaVerifications: [], dakshinaRates: [], pujaServices: [] }, verif: { latest: [], history: [] } });
  const res = { section: "A-empty" };
  res.state = await page.evaluate(() => {
    const t = document.body.innerText;
    return {
      title: t.includes("मेरी पूजाएँ"),
      emptyTitle: t.includes("अभी कोई पूजा नहीं जोड़ी"),
      emptyHint: t.includes("पहली पूजा जोड़िए — मैं हर कदम बताऊँगा"),
      addCtaCount: [...document.querySelectorAll("button,a")].filter((b) => (b.textContent || "").includes("पूजा जोड़िए")).length,
    };
  });
  res.money = await moneyCensus(page);
  res.visibility = await visibilityAudit(page, "p13-empty");
  res.narration = await page.evaluate(() => JSON.parse(sessionStorage.getItem("hpj_voicedebug_buf") || "[]").filter((l) => l.includes("speak")).slice(-4));
  res.errs = errs.slice(0, 5);
  res.writes = writes;
  await page.screenshot({ path: join(OUT, "h1-empty-27c.png") });
  out.A = res;
  await ctx.close();
}

// ── LEG B · POPULATED 3-state + census + §3-V ────────────────
{
  const { ctx, page, errs, writes } = await newLeg({ profile: POP_PROFILE, verif: POP_VERIF });
  const res = { section: "B-populated" };
  res.cards = await page.evaluate(() => {
    const cards = [...document.querySelectorAll("main .flex.flex-col > div, main div")].filter((d) => /सत्यनारायण कथा|गृह प्रवेश|रुद्राभिषेक|नवग्रह शांति/.test(d.textContent || "") && d.querySelector("button"));
    const t = document.body.innerText;
    return {
      approved: t.includes("✓ प्रमाणित"),
      pending: t.includes("⏳ सत्यापन बाकी"),
      rejected: t.includes("अस्वीकृत"),
      reason: t.includes("कारण:") && t.includes("वीडियो धुंधला है"),
      resubmitRow: t.includes("दुबारा भेजिए"),
      prices: ["₹5,100", "₹8,100", "₹11,000", "₹7,500"].map((p) => t.includes(p)),
    };
  });
  res.money = await moneyCensus(page);
  res.tipUp = await page.evaluate(() => document.body.innerText.includes("नई पूजा जोड़िए") && document.body.innerText.includes("समझा"));
  res.visibilityTip = await visibilityAudit(page, "p13-populated-tip");
  await page.screenshot({ path: join(OUT, "h2-populated-tip.png") });
  await page.evaluate(() => { const b = [...document.querySelectorAll("button")].find((x) => x.textContent.trim() === "समझा"); b?.click(); });
  await page.waitForTimeout(1000);
  res.visibility = await visibilityAudit(page, "p13-populated");
  await page.screenshot({ path: join(OUT, "h3-populated-3state.png") });
  res.narration = await page.evaluate(() => JSON.parse(sessionStorage.getItem("hpj_voicedebug_buf") || "[]").filter((l) => l.includes("speak")).slice(-4));
  res.errs = errs.slice(0, 5);
  res.writesDuringRender = writes; // must be []
  out.B = res;
  await ctx.close();
}

// ── LEG C · money-write interactions (fixture-only) ──────────
{
  const { ctx, page, errs, writes } = await newLeg({ profile: POP_PROFILE, verif: POP_VERIF });
  const res = { section: "C-interactions" };
  await page.evaluate(() => { const b = [...document.querySelectorAll("button")].find((x) => x.textContent.trim() === "समझा"); b?.click(); });
  await page.waitForTimeout(800);
  // price tap opens the inline editor
  await page.evaluate(() => { const b = [...document.querySelectorAll("button")].find((x) => (x.getAttribute("aria-label") || "").includes("सत्यनारायण कथा की दक्षिणा")); b?.click(); });
  await page.waitForTimeout(1200);
  res.editorOpen = await page.evaluate(() => document.body.innerText.includes("सेव कीजिए"));
  await page.screenshot({ path: join(OUT, "h4-editor-open.png") });
  // type a new value + save → exactly one POST
  await page.evaluate(() => {
    const inp = [...document.querySelectorAll("input")].find((i) => i.closest("div")?.textContent?.includes("सेव") || true);
    if (inp) { const set = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set; set.call(inp, "6100"); inp.dispatchEvent(new Event("input", { bubbles: true })); }
  });
  await page.evaluate(() => { const b = [...document.querySelectorAll("button")].find((x) => x.textContent.includes("सेव कीजिए")); b?.click(); b?.click(); });
  await page.waitForTimeout(1500);
  res.saveWrites = [...writes];
  res.priceAfterSave = await page.evaluate(() => document.body.innerText.includes("₹6,100"));
  await page.screenshot({ path: join(OUT, "h5-price-saved.png") });
  // ✖ delete — पP1: NO confirmation before the DELETE fires
  const before = writes.length;
  await page.evaluate(() => { const b = [...document.querySelectorAll("button")].find((x) => (x.getAttribute("aria-label") || "").includes("नवग्रह शांति हटाइए")); b?.click(); });
  await page.waitForTimeout(1200);
  res.deleteFiredWithoutConfirm = writes.length > before && writes[writes.length - 1].startsWith("DELETE");
  res.deleteWrites = writes.slice(before);
  await page.screenshot({ path: join(OUT, "h6-after-delete.png") });
  res.speaks = await page.evaluate(() => JSON.parse(sessionStorage.getItem("hpj_voicedebug_buf") || "[]").filter((l) => l.includes("speak")).slice(-5));
  res.errs = errs.slice(0, 5);
  out.C = res;
  await ctx.close();
}

// ── LEG C2 · floor-reject: shown AND spoken (Q6) ─────────────
{
  const { ctx, page, errs, writes } = await newLeg({ profile: POP_PROFILE, verif: POP_VERIF, floorReject: true });
  const res = { section: "C2-floor" };
  await page.evaluate(() => { const b = [...document.querySelectorAll("button")].find((x) => x.textContent.trim() === "समझा"); b?.click(); });
  await page.waitForTimeout(600);
  await page.evaluate(() => { const b = [...document.querySelectorAll("button")].find((x) => (x.getAttribute("aria-label") || "").includes("सत्यनारायण कथा की दक्षिणा")); b?.click(); });
  await page.waitForTimeout(1000);
  await page.evaluate(() => {
    const inp = [...document.querySelectorAll("input")][0];
    if (inp) { const set = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set; set.call(inp, "101"); inp.dispatchEvent(new Event("input", { bubbles: true })); }
  });
  await page.evaluate(() => { const b = [...document.querySelectorAll("button")].find((x) => x.textContent.includes("सेव कीजिए")); b?.click(); });
  await page.waitForTimeout(2500);
  res.errorShown = await page.evaluate(() => document.body.innerText.includes("₹501"));
  res.errorSpoken = await page.evaluate(() => JSON.parse(sessionStorage.getItem("hpj_voicedebug_buf") || "[]").some((l) => l.includes("501")));
  res.writes = writes;
  await page.screenshot({ path: join(OUT, "h7-floor-reject.png") });
  res.errs = errs.slice(0, 5);
  out.C2 = res;
  await ctx.close();
}

// ── LEG C3 · delete 409 active_bookings (bare-string error) ──
{
  const { ctx, page, errs } = await newLeg({ profile: POP_PROFILE, verif: POP_VERIF, deleteBlocked: true });
  const res = { section: "C3-delete-blocked" };
  await page.evaluate(() => { const b = [...document.querySelectorAll("button")].find((x) => x.textContent.trim() === "समझा"); b?.click(); });
  await page.waitForTimeout(600);
  await page.evaluate(() => { const b = [...document.querySelectorAll("button")].find((x) => (x.getAttribute("aria-label") || "").includes("गृह प्रवेश हटाइए")); b?.click(); });
  await page.waitForTimeout(1500);
  res.blockedToast = await page.evaluate(() => /बुकिंग|हटा नहीं/.test(document.body.innerText));
  res.cardStillThere = await page.evaluate(() => document.body.innerText.includes("गृह प्रवेश"));
  await page.screenshot({ path: join(OUT, "h8-delete-blocked.png") });
  res.errs = errs.slice(0, 5);
  out.C3 = res;
  await ctx.close();
}

// ── LEG D · ₹0 KEY-MISMATCH TRAP (canonical vs Hindi keys) ───
{
  const { ctx, page, errs } = await newLeg({
    profile: { ...POP_PROFILE, specializations: ["सत्यनारायण कथा"], dakshinaRates: [{ id: "r1", pujaType: "SATYANARAYAN", amount: 5100 }] },
    verif: { latest: [{ poojaType: "सत्यनारायण कथा", status: "APPROVED", rejectionReason: null }], history: [] },
  });
  const res = { section: "D-keytrap" };
  res.zeroRendered = await page.evaluate(() => document.body.innerText.includes("₹0"));
  await page.screenshot({ path: join(OUT, "h9-keytrap-zero.png") });
  res.errs = errs.slice(0, 5);
  out.D = res;
  await ctx.close();
}

// ── LEG E · celebration freshness (silent first-run seed) ────
{
  // E1: seen key ABSENT → NO overlay (silent seed). settle 2500 — the
  // overlay auto-dismisses at 3200ms, a late check reads false.
  const l1 = await newLeg({ profile: POP_PROFILE, verif: POP_VERIF, settle: 2500 });
  const e1Overlay = await l1.page.evaluate(() => document.body.innerText.includes("आप प्रमाणित हैं!"));
  const e1Seeded = await l1.page.evaluate(() => localStorage.getItem("hpj_seen_approved_poojas"));
  await l1.ctx.close();
  // E2: seen=["गृह प्रवेश"] + APPROVED सत्यनारायण arrives → overlay
  const l2 = await newLeg({ profile: POP_PROFILE, verif: POP_VERIF, seenApproved: '["गृह प्रवेश"]', settle: 2500 });
  const e2Overlay = await l2.page.evaluate(() => document.body.innerText.includes("आप प्रमाणित हैं!"));
  await l2.page.screenshot({ path: join(OUT, "h10-celebration.png") });
  await l2.ctx.close();
  out.E = { section: "E-celebration", firstRunSilent: !e1Overlay, firstRunSeeded: e1Seeded, freshApprovalCelebrates: e2Overlay };
}

// ── LEG F · legacy 2-state fallback + nav/§6 ─────────────────
{
  const { ctx, page, errs } = await newLeg({ profile: { ...POP_PROFILE, pendingPoojaVerifications: ["रुद्राभिषेक"] }, verif: null, verifFail: true });
  const res = { section: "F-legacy-nav" };
  res.legacy = await page.evaluate(() => {
    const t = document.body.innerText;
    return { pending: t.includes("⏳ सत्यापन बाकी"), approvedDefault: t.includes("✓ प्रमाणित"), noRejected: !t.includes("अस्वीकृत") };
  });
  await page.screenshot({ path: join(OUT, "h11-legacy-2state.png") });
  // tip one-shot + back → /settings
  await page.evaluate(() => { const b = [...document.querySelectorAll("button")].find((x) => x.textContent.trim() === "समझा"); b?.click(); });
  await page.waitForTimeout(600);
  await page.evaluate(() => { const b = [...document.querySelectorAll("button")].find((x) => (x.getAttribute("aria-label") || "") === "पीछे" || (x.getAttribute("aria-label") || "").includes("पीछे")); b?.click(); });
  await page.waitForTimeout(2500);
  res.backTo = await page.evaluate(() => location.pathname);
  await page.goBack();
  await page.waitForTimeout(3000);
  res.tipOnReturn = await page.evaluate(() => document.body.innerText.includes("नई पूजा जोड़कर दक्षिणा तय कीजिए"));
  res.errs = errs.slice(0, 5);
  out.F = res;
  await ctx.close();
}

// ── LEG G · add-wizard ENTRY (step 0 only — wizard = own page) ─
{
  const { ctx, page, errs, writes } = await newLeg({ profile: POP_PROFILE, verif: POP_VERIF });
  const res = { section: "G-add-entry" };
  await page.evaluate(() => { const b = [...document.querySelectorAll("button")].find((x) => x.textContent.trim() === "समझा"); b?.click(); });
  await page.waitForTimeout(600);
  await page.evaluate(() => { const b = [...document.querySelectorAll("button,a")].find((x) => (x.textContent || "").includes("नई पूजा जोड़िए")); b?.click(); });
  await page.waitForTimeout(4500);
  res.where = await page.evaluate(() => location.pathname);
  res.step0 = await page.evaluate(() => {
    const t = document.body.innerText;
    return { title: t.includes("पूजा जोड़िए") || t.includes("कौन सी पूजा"), waitPill: t.includes("प्रतीक्षा में") };
  });
  res.visibility = await visibilityAudit(page, "p13-add-step0");
  await page.screenshot({ path: join(OUT, "h12-add-step0.png") });
  res.writes = writes; // must be [] — step 0 is draft-local
  res.errs = errs.slice(0, 5);
  out.G = res;
  await ctx.close();
}

writeFileSync(join(OUT, "page13-results.json"), JSON.stringify(out, null, 1));
console.log(JSON.stringify({
  empty: out.A.state,
  emptyMoney: out.A.money,
  populated: out.B.cards,
  popMoney: out.B.money,
  vis: { empty: out.A.visibility.length, popTip: out.B.visibilityTip.length, pop: out.B.visibility.length, addStep0: out.G.visibility.length },
  editor: { open: out.C.editorOpen, saveWrites: out.C.saveWrites, priceAfter: out.C.priceAfterSave, deleteNoConfirm: out.C.deleteFiredWithoutConfirm, deleteWrites: out.C.deleteWrites },
  floor: { shown: out.C2.errorShown, spoken: out.C2.errorSpoken, writes: out.C2.writes },
  deleteBlocked: out.C3,
  keytrap: out.D.zeroRendered,
  celebration: out.E,
  legacy: out.F.legacy,
  nav: { backTo: out.F.backTo, tipOnReturn: out.F.tipOnReturn },
  addEntry: { where: out.G.where, step0: out.G.step0, writes: out.G.writes },
  errors: { A: out.A.errs, B: out.B.errs, C: out.C.errs, C2: out.C2.errs, C3: out.C3.errs, F: out.F.errs, G: out.G.errs },
}, null, 1));
await browser.close();
