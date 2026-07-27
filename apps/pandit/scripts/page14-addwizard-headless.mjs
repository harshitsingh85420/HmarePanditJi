// PAGE 14 · पूजा जोड़ें (the add wizard) — THE HARSH QA WALK (full 11 + §3-V).
// Recon: wf_d3bdea9e-171. Fixture legs local (full interception + CORS);
// the LIVE P0-regression leg runs with --live against prod on the probe
// account (one OTP send; unique Devanagari pooja name; residue documented).
//   node scripts/page14-addwizard-headless.mjs --out ../../docs/review/shots/page14 [--live]
import { chromium } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { visibilityAudit } from "./lib/visibilityAudit.mjs";

const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i === -1 ? d : process.argv[i + 1]; };
const BASE = arg("base", "http://localhost:3002");
const OUT = arg("out", "../../docs/review/shots/page14");
const LIVE = process.argv.includes("--live");
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ headless: true, args: ["--autoplay-policy=no-user-gesture-required"] });
const CORS = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS", "Access-Control-Allow-Headers": "*" };
const fx = (data) => ({ status: 200, contentType: "application/json", headers: CORS, body: JSON.stringify({ success: true, data }) });
const out = {};

const newLeg = async (opts = {}) => {
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
      if (opts.floorReject && u.includes("/pandit/pooja-config")) {
        return r.fulfill({ status: 400, contentType: "application/json", headers: CORS, body: JSON.stringify({ success: false, error: { code: "dakshina_below_floor", message: "इस पूजा की दक्षिणा कम से कम ₹501 रखिए — आपने ₹301 भरी है।" } }) });
      }
      return r.fulfill(fx({ ok: true }));
    }
    if (u.includes("/auth/me")) return r.fulfill(fx({ user: { id: "fx", name: "पं. परीक्षण शर्मा", panditProfile: { isOnline: false, verificationStatus: "APPROVED", isBookingReady: true, readinessStep: 5, rejectionReason: null, specializations: [], pendingPoojaVerifications: [], dakshinaRates: [], pujaServices: [] }, milestones: [], unseenMilestones: [] } }));
    if (u.includes("/pandit/pooja-verifications")) return r.fulfill(fx({ latest: opts.pendingTypes ? opts.pendingTypes.map((t) => ({ poojaType: t, status: "PENDING" })) : [], history: [] }));
    return r.fulfill(fx([]));
  });
  await page.goto(`${BASE}/onboarding?voicedebug=1`, { waitUntil: "load", timeout: 60000 });
  await page.evaluate((draft) => {
    localStorage.setItem("pandit_token", "dummy-qa");
    localStorage.setItem("hpj-onboarding", JSON.stringify({ state: { phase: "DONE", detectedCity: "वाराणसी", selectedLanguage: "Hindi", languageConfirmed: true, parichayDone: true, tutorialCompleted: true }, version: 0 }));
    for (const k of Object.keys(localStorage)) if (k.startsWith("tip_seen")) localStorage.removeItem(k);
    if (draft === null) localStorage.removeItem("add-pooja-draft");
    else localStorage.setItem("add-pooja-draft", draft);
  }, opts.draft ?? null);
  await page.goto(`${BASE}/my-poojas/add?voicedebug=1`, { waitUntil: "load", timeout: 60000 });
  await page.waitForTimeout(opts.settle ?? 5000);
  return { ctx, page, errs, writes };
};

const bodyHas = (page, s) => page.evaluate((x) => document.body.innerText.includes(x), s);
// fill by placeholder, with a JS-set fallback: on the live prod bundle the
// locator fill timed out on actionability (continuous ambient animation
// keeps the element from settling "stable") though the field is visible and
// editable — the React-compatible value set drives the same onChange.
const fillPh = async (page, ph, v) => {
  try {
    await page.getByPlaceholder(ph).fill(v, { timeout: 8000 });
  } catch {
    await page.evaluate(([sel, val]) => {
      const fields = [...document.querySelectorAll("input, textarea")];
      const el = fields.find((i) => (i.placeholder || "").includes(sel)) || fields.find((i) => sel.includes((i.placeholder || "@none@")));
      if (!el) throw new Error("no field ~ " + sel + " | present: " + fields.map((i) => JSON.stringify(i.placeholder)).join(" ~ "));
      const proto = el.tagName === "TEXTAREA" ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
      Object.getOwnPropertyDescriptor(proto, "value").set.call(el, val);
      el.dispatchEvent(new Event("input", { bubbles: true }));
      el.dispatchEvent(new Event("change", { bubbles: true }));
    }, [ph, v]);
  }
};
const clickText = (page, txt) => page.evaluate((x) => { const b = [...document.querySelectorAll("button")].find((el) => (el.textContent || "").includes(x)); b?.click(); }, txt);

// ── LEG A · step 0 (canon 18a): anatomy + name abuse + pill ──
if (!LIVE) {
  const { ctx, page, errs, writes } = await newLeg();
  const res = { section: "A-step0" };
  res.title = await bodyHas(page, "पूजा जोड़िए");
  res.stepBar = await page.evaluate(() => document.querySelector('[role="progressbar"]')?.getAttribute("aria-label"));
  res.noTileGrid = await page.evaluate(() => ![...document.querySelectorAll("button")].some((b) => /कथा|हवन|गृह/.test(b.textContent || ""))); // free-text path, no preset grid
  res.aageDisabledEmpty = await page.evaluate(() => [...document.querySelectorAll("button")].find((b) => (b.textContent || "").includes("आगे —"))?.disabled);
  // name abuse matrix
  const abuse = {};
  for (const [k, v] of [["roman", "Satyanarayan Katha"], ["mixed", "Satya कथा 108"], ["emoji", "🕉️ पूजा"], ["long246", "क".repeat(246)], ["whitespace", "   "]]) {
    await fillPh(page, "जैसे सत्यनारायण कथा", v);
    await page.waitForTimeout(350);
    abuse[k] = {
      accepted: await page.evaluate(() => document.querySelectorAll("input")[0]?.value?.length ?? 0),
      aageEnabled: await page.evaluate(() => ![...document.querySelectorAll("button")].find((b) => (b.textContent || "").includes("आगे —"))?.disabled),
    };
  }
  res.abuse = abuse;
  // desc echo quote
  await fillPh(page, "जैसे सत्यनारायण कथा", "क्यूए जाँच पूजा");
  await fillPh(page, "संक्षेप में बोलिए", "घर की शांति के लिए");
  await page.waitForTimeout(400);
  res.echoQuote = await bodyHas(page, "“घर की शांति के लिए”");
  await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(300);
  res.visibility = await visibilityAudit(page, "p14-step0");
  await page.screenshot({ path: join(OUT, "i1-step0-18a.png") });
  res.writes = writes; // must be []
  res.errs = errs.slice(0, 4);
  out.A = res;
  await ctx.close();

  // pill leg: PENDING row matching the typed name
  const l2 = await newLeg({ pendingTypes: ["क्यूए जाँच पूजा"] });
  await fillPh(l2.page, "जैसे सत्यनारायण कथा", "क्यूए जाँच पूजा");
  await l2.page.waitForTimeout(600);
  out.A.pendingPill = await bodyHas(l2.page, "प्रतीक्षा में");
  await l2.page.screenshot({ path: join(OUT, "i2-step0-pending-pill.png") });
  await l2.ctx.close();
}

// ── LEG B · step 1 samagri (18b) ─────────────────────────────
if (!LIVE) {
  const { ctx, page, errs } = await newLeg({ draft: JSON.stringify({ v: 5, step: 1, name: "क्यूए जाँच पूजा", desc: "", items: { BASIC: [], STANDARD: [], PREMIUM: [] }, prices: { BASIC: null, STANDARD: null, PREMIUM: null }, supplyMode: null, teamSize: 1, dakshina: null, videoUrl: "", sentViaWhatsapp: false, consent: false }) });
  const res = { section: "B-step1" };
  res.title = await bodyHas(page, "सामग्री के तीन स्तर");
  res.hint = await bodyHas(page, "ऊपर का स्तर नीचे वाला सब अपने आप जोड़ लेता है");
  res.addDisabledEmpty = await page.evaluate(() => [...document.querySelectorAll("button")].find((b) => (b.textContent || "").trim() === "जोड़िए")?.disabled);
  await fillPh(page, "सामान का नाम", "गंगाजल");
  await clickText(page, "जोड़िए");
  await page.waitForTimeout(500);
  res.itemAdded = await bodyHas(page, "गंगाजल");
  res.blankBrandBecomesKoiBhi = await bodyHas(page, "कोई भी");
  await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(300);
  res.visibility = await visibilityAudit(page, "p14-step1");
  await page.screenshot({ path: join(OUT, "i3-step1-18b.png") });
  res.errs = errs.slice(0, 4);
  out.B = res;
  await ctx.close();
}

// ── LEG C · step 2 (18c): the money step boundary walk ───────
if (!LIVE) {
  const { ctx, page, errs } = await newLeg({ draft: JSON.stringify({ v: 5, step: 2, name: "क्यूए जाँच पूजा", desc: "", items: { BASIC: [], STANDARD: [], PREMIUM: [] }, prices: { BASIC: null, STANDARD: null, PREMIUM: null }, supplyMode: null, teamSize: 1, dakshina: null, videoUrl: "", sentViaWhatsapp: false, consent: false }) });
  const res = { section: "C-step2" };
  res.title = await bodyHas(page, "और थोड़ी बातें");
  res.threeTiles = await Promise.all(["हाँ, मैं लाऊँगा", "प्लेटफ़ॉर्म बेचे", "सिर्फ़ सूची"].map((t) => bodyHas(page, t)));
  await clickText(page, "हाँ, मैं लाऊँगा");
  await page.waitForTimeout(400);
  res.brandWarning = await bodyHas(page, "जो कंपनी बताई, वही सामान लाना होगा");
  res.teamNoZero = await page.evaluate(() => ![...document.querySelectorAll("button")].some((b) => (b.textContent || "").trim() === "0"));
  await page.evaluate(() => { const b = [...document.querySelectorAll("button")].find((el) => (el.textContent || "").trim() === "3"); b?.click(); });
  await page.waitForTimeout(300);
  res.teamCaption = await bodyHas(page, "3 पंडित (आप सहित)");
  // dakshina boundary walk
  const dk = {};
  const aageOn = () => page.evaluate(() => ![...document.querySelectorAll("button")].find((b) => (b.textContent || "").includes("आगे —"))?.disabled);
  // NOTE: the field is a native input[type=number] — the BROWSER drops
  // non-numeric keystrokes (Devanagari digits, ₹-formatted paste) before
  // the app sees them. The harness records that truth per variant.
  for (const [k, v] of [["zero", "0"], ["negative", "-500"], ["one", "1"], ["b500", "500"], ["b501", "501"], ["huge", "9999999"], ["devanagariDigits", "५१००"], ["pasteFormatted", "₹5,100"]]) {
    const inp = page.getByPlaceholder("₹ राशि");
    await inp.fill("").catch(() => {});
    await page.waitForTimeout(200);
    let typeable = true;
    try {
      await inp.fill(v, { timeout: 2500 });
    } catch {
      typeable = false;
      await inp.pressSequentially(v, { timeout: 2500 }).catch(() => {});
    }
    await page.waitForTimeout(400);
    dk[k] = {
      typeable,
      fieldValue: await page.evaluate(() => [...document.querySelectorAll('input[type="number"]')].map((i) => i.value).find((x) => x !== "") ?? ""),
      aage: await aageOn(),
    };
  }
  res.dakshina = dk;
  await fillPh(page, "₹ राशि", "5100");
  await page.waitForTimeout(500);
  res.leafBarAt5100 = await bodyHas(page, "₹5,100");
  res.moneyCensus = await page.evaluate(() => ({ percent: (document.body.innerText.match(/[\d]+\s*(%|प्रतिशत)/g) || []), commission: (document.body.innerText.match(/कमीशन|कटौती/g) || []) }));
  await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(300);
  res.visibility = await visibilityAudit(page, "p14-step2");
  await page.screenshot({ path: join(OUT, "i4-step2-18c-money.png") });
  res.errs = errs.slice(0, 4);
  out.C = res;
  await ctx.close();
}

// ── LEG D · step 3 (18d) + submit + double-submit + floor loop ─
if (!LIVE) {
  const draft3 = (dak) => JSON.stringify({ v: 5, step: 3, name: "क्यूए जाँच पूजा", desc: "घर की शांति", items: { BASIC: [], STANDARD: [], PREMIUM: [] }, prices: { BASIC: null, STANDARD: null, PREMIUM: null }, supplyMode: "LIST_ONLY", teamSize: 2, dakshina: dak, videoUrl: "", sentViaWhatsapp: false, consent: false });
  const { ctx, page, errs, writes } = await newLeg({ draft: draft3(5100) });
  const res = { section: "D-step3-submit" };
  res.title = await bodyHas(page, "सत्यापन वीडियो");
  res.jamaDisabled = await page.evaluate(() => [...document.querySelectorAll("button")].find((b) => (b.textContent || "").includes("जमा कीजिए"))?.disabled);
  await fillPh(page, "https://youtu.be/…", "https://youtu.be/dQw4w9WgXcQ");
  await page.waitForTimeout(700);
  res.embedPreview = await page.evaluate(() => !!document.querySelector("iframe"));
  res.jamaStillDisabledNoConsent = await page.evaluate(() => [...document.querySelectorAll("button")].find((b) => (b.textContent || "").includes("जमा कीजिए"))?.disabled);
  await page.evaluate(() => { const b = [...document.querySelectorAll("button,[role=switch],input[type=checkbox],label")].find((el) => (el.textContent || "").includes("यह वीडियो मेरा है") || (el.getAttribute("aria-label") || "").includes("वीडियो मेरा")); b?.click(); });
  await page.waitForTimeout(500);
  res.consentOn = await page.evaluate(() => ![...document.querySelectorAll("button")].find((b) => (b.textContent || "").includes("जमा कीजिए"))?.disabled);
  await page.screenshot({ path: join(OUT, "i5-step3-18d.png") });
  // double-submit
  await page.evaluate(() => { const b = [...document.querySelectorAll("button")].find((el) => (el.textContent || "").includes("जमा कीजिए")); b?.click(); b?.click(); });
  await page.waitForTimeout(2500);
  res.doneCard = await bodyHas(page, "भेज दी गई");
  res.writes = writes; // expect config + verification, ONE each (no samagri — empty tiers)
  await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(300);
  res.visibilityDone = await visibilityAudit(page, "p14-step4");
  await page.screenshot({ path: join(OUT, "i6-step4-18e-done.png") });
  // FIX-2 PROOF: after submit, a fresh /my-poojas/add opens CLEAN at step 0
  await page.goto(`${BASE}/my-poojas/add?voicedebug=1`, { waitUntil: "load", timeout: 60000 });
  await page.waitForTimeout(4000);
  res.secondAddClean = await page.evaluate(() => {
    const t = document.body.innerText;
    return t.includes("पूजा जोड़िए") && !t.includes("क्यूए जाँच पूजा") && (document.querySelectorAll("input")[0]?.value ?? "") === "";
  });
  await page.screenshot({ path: join(OUT, "i7-second-add-clean.png") });
  res.errs = errs.slice(0, 4);
  out.D = res;
  await ctx.close();

  // floor-reject loop: F11-04 INSIDE the wizard (shown + spoken + back to step 2)
  const l2 = await newLeg({ draft: draft3(301), floorReject: true });
  await fillPh(l2.page, "https://youtu.be/…", "https://youtu.be/dQw4w9WgXcQ");
  await l2.page.evaluate(() => { const b = [...document.querySelectorAll("button,[role=switch],input[type=checkbox],label")].find((el) => (el.textContent || "").includes("यह वीडियो मेरा है") || (el.getAttribute("aria-label") || "").includes("वीडियो मेरा")); b?.click(); });
  await l2.page.waitForTimeout(500);
  await clickText(l2.page, "जमा कीजिए");
  await l2.page.waitForTimeout(6000); // speakAndWait completes before go(2)
  out.D.floor = {
    shown: await bodyHas(l2.page, "₹501"),
    spoken: await l2.page.evaluate(() => JSON.parse(sessionStorage.getItem("hpj_voicedebug_buf") || "[]").some((l) => l.includes("501"))),
    landedStep2: await bodyHas(l2.page, "और थोड़ी बातें"),
  };
  await l2.page.screenshot({ path: join(OUT, "i8-floor-loop.png") });
  await l2.ctx.close();
}

// ── LEG E · draft/F5 matrix (the two fixes + clamps) ─────────
if (!LIVE) {
  const mk = (extra) => JSON.stringify({ v: 5, step: 0, name: "ड्राफ़्ट पूजा", desc: "x", items: { BASIC: [], STANDARD: [], PREMIUM: [] }, prices: { BASIC: null, STANDARD: null, PREMIUM: null }, supplyMode: null, teamSize: 1, dakshina: null, videoUrl: "", sentViaWhatsapp: false, consent: false, ...extra });
  const res = { section: "E-draft" };
  const stepShown = async (page) => {
    const t = await page.evaluate(() => document.body.innerText);
    if (t.includes("सत्यापन वीडियो")) return 3;
    if (t.includes("और थोड़ी बातें")) return 2;
    if (t.includes("सामग्री के तीन स्तर")) return 1;
    if (t.includes("भेज दी गई") || t.includes("पूजा की स्थिति")) return 4;
    return 0;
  };
  // FIX-1 PROOF: v5 draft step 3 → STAYS 3 (the old bug regressed it to 2)
  const a = await newLeg({ draft: mk({ step: 3 }) });
  res.v5step3Stays = await stepShown(a.page);
  await a.page.screenshot({ path: join(OUT, "i9-f5-video-stays.png") });
  await a.ctx.close();
  // old 7-step draft {step:5} → migrates to 3 (video) — the map's real job
  const b = await newLeg({ draft: JSON.stringify({ step: 5, name: "पुरानी", desc: "" }) });
  res.old7step5Migrates = await stepShown(b.page);
  await b.ctx.close();
  // junk step clamps
  const c = await newLeg({ draft: mk({ step: 99 }) });
  res.v5step99Clamps = await stepShown(c.page);
  await c.ctx.close();
  // garbage JSON → EMPTY
  const e2 = await newLeg({ draft: "{{{not json" });
  res.junkJsonStep0 = await stepShown(e2.page);
  await e2.ctx.close();
  // per-keystroke persistence: type on step 0, reload, field restored
  const f = await newLeg();
  await fillPh(f.page, "जैसे सत्यनारायण कथा", "एफ़-पाँच पूजा");
  await f.page.waitForTimeout(600);
  await f.page.reload({ waitUntil: "load" });
  await f.page.waitForTimeout(4000);
  res.f5FieldRestored = await f.page.evaluate(() => document.querySelectorAll("input")[0]?.value ?? "");
  await f.ctx.close();
  out.E = res;
}

// ── LEG F · LIVE P0 REGRESSION (prod, probe, --live only) ────
if (LIVE) {
  const PROD = "https://hmarepanditji-pandit.vercel.app";
  const NAME = `क्यूए हवन जाँच ${new Date().getDate()} जुलाई`;
  const ctx = await browser.newContext({ viewport: { width: 360, height: 740 }, hasTouch: true, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  const res = { section: "F-live", name: NAME };
  const badHeaders = [];
  const chain = [];
  page.on("request", (r) => {
    if (r.method() !== "GET" && r.url().includes("/api/v1/")) {
      const h = r.headers();
      chain.push(`${r.method()} ${r.url().split("/api/v1")[1]}`);
      for (const [k, v] of Object.entries(h)) {
        // eslint-disable-next-line no-control-regex
        if (/[^\x00-\xFF]/.test(v)) badHeaders.push(`${k}: ${v.slice(0, 40)}`);
      }
    }
  });
  page.on("response", async (r) => {
    if (r.request().method() !== "GET" && r.url().includes("/api/v1/")) {
      let detail = "";
      if (r.status() >= 400) { try { detail = " " + (await r.text()).slice(0, 160); } catch { /* body consumed */ } }
      chain.push(`  → ${r.status()} ${r.url().split("/api/v1")[1]}${detail}`);
    }
  });
  await page.goto(`${PROD}/login?next=/my-poojas&voicedebug=1`, { waitUntil: "load", timeout: 60000 });
  await page.waitForTimeout(2500);
  await page.mouse.click(30, 250);
  await page.waitForTimeout(800);
  await page.locator('input[type="tel"]').first().fill("9999999999");
  await page.getByRole("button", { name: "आगे बढ़िए" }).click();
  await page.waitForTimeout(90000); // cold-start law
  const otp = page.locator('input[name="otp"]').first();
  await otp.click();
  await otp.type("123456", { delay: 40 });
  await page.waitForTimeout(15000);
  res.loggedIn = await page.evaluate(() => location.pathname);
  res.afterOtpText = await page.evaluate(() => document.body.innerText.slice(0, 160).replace(/\s+/g, " "));
  await page.screenshot({ path: join(OUT, "i9a-live-after-otp.png") });
  if (res.loggedIn.includes("/login")) {
    res.abort = "LOGIN DID NOT COMPLETE — no wizard leg run (OTP send budget preserved)";
    out.F = res;
    await ctx.close();
    writeFileSync(join(OUT, "page14-results.json"), JSON.stringify(out, null, 1));
    console.log(JSON.stringify({ F: res }, null, 1));
    await browser.close();
    process.exit(0);
  }
  await page.goto(`${PROD}/my-poojas/add?voicedebug=1`, { waitUntil: "load", timeout: 60000 });
  // DETERMINISTIC ENTRY: seed a clean v5 draft at step 0 (a bare remove let
  // the live page resume mid-wizard — the draft is re-persisted per
  // keystroke, so "absent" is a race; "explicitly step 0" is not).
  await page.evaluate(() => localStorage.setItem("add-pooja-draft", JSON.stringify({ v: 5, step: 0, name: "", desc: "", items: { BASIC: [], STANDARD: [], PREMIUM: [] }, prices: { BASIC: null, STANDARD: null, PREMIUM: null }, supplyMode: null, teamSize: 1, dakshina: null, videoUrl: "", sentViaWhatsapp: false, consent: false })));
  await page.reload({ waitUntil: "load" });
  await page.waitForTimeout(6000);
  res.wizardPath = await page.evaluate(() => location.pathname);
  res.wizardText = await page.evaluate(() => document.body.innerText.slice(0, 140).replace(/\s+/g, " "));
  await page.screenshot({ path: join(OUT, "i9b-live-wizard-entry.png") });
  res.progress = [];
  const step = async (label, fn) => {
    try { await fn(); res.progress.push(label + ":ok"); }
    catch (e) { res.progress.push(label + ":FAIL " + String(e).slice(0, 80)); }
  };
  await step("name", () => fillPh(page, "जैसे सत्यनारायण कथा", NAME));
  await step("desc", () => fillPh(page, "संक्षेप में बोलिए", "क्यूए जाँच — कृपया अनदेखा कीजिए"));
  await clickText(page, "आगे —");
  await page.waitForTimeout(1500);
  await clickText(page, "आगे —"); // skip samagri (empty tiers → no samagri POST)
  await page.waitForTimeout(1500);
  await clickText(page, "सिर्फ़ सूची");
  await page.waitForTimeout(500);
  await step("dakshina", () => fillPh(page, "₹ राशि", "2101"));
  await page.waitForTimeout(500);
  await clickText(page, "आगे —");
  await page.waitForTimeout(1500);
  await step("videoUrl", () => fillPh(page, "https://youtu.be/…", "https://youtu.be/dQw4w9WgXcQ"));
  await page.evaluate(() => { const b = [...document.querySelectorAll("button,[role=switch],input[type=checkbox],label")].find((el) => (el.textContent || "").includes("यह वीडियो मेरा है") || (el.getAttribute("aria-label") || "").includes("वीडियो मेरा")); b?.click(); });
  await page.waitForTimeout(600);
  await page.screenshot({ path: join(OUT, "i10-live-prefill.png") });
  await clickText(page, "जमा कीजिए");
  await page.waitForTimeout(12000);
  res.doneCard = await bodyHas(page, "भेज दी गई");
  res.chain = chain;
  res.badHeaders = badHeaders; // the Idempotency-class sibling scan — must be []
  await page.screenshot({ path: join(OUT, "i11-live-done.png") });
  // verify: PENDING row via the app's own authenticated fetch + the pill
  res.pendingRow = await page.evaluate(async (name) => {
    const token = localStorage.getItem("pandit_token");
    const r = await fetch("https://hmarepanditji-api.onrender.com/api/v1/pandit/pooja-verifications", { headers: { Authorization: `Bearer ${token}` } });
    const j = await r.json();
    const row = (j.data?.latest || []).find((x) => x.poojaType === name);
    return row ? { status: row.status, version: row.version } : null;
  }, NAME);
  await page.goto(`${PROD}/my-poojas/add?voicedebug=1`, { waitUntil: "load", timeout: 60000 });
  await page.waitForTimeout(4000);
  await step("reentry-name", () => fillPh(page, "जैसे सत्यनारायण कथा", NAME));
  await page.waitForTimeout(800);
  res.pendingPillOnReentry = await bodyHas(page, "प्रतीक्षा में");
  await page.screenshot({ path: join(OUT, "i12-live-pending-pill.png") });
  // survives refresh
  await page.reload({ waitUntil: "load" });
  await page.waitForTimeout(4000);
  res.rowSurvivesRefresh = await page.evaluate(async (name) => {
    const token = localStorage.getItem("pandit_token");
    const r = await fetch("https://hmarepanditji-api.onrender.com/api/v1/pandit/pooja-verifications", { headers: { Authorization: `Bearer ${token}` } });
    const j = await r.json();
    return (j.data?.latest || []).some((x) => x.poojaType === name);
  }, NAME);
  // cleanup: clear the local draft (server residue documented in the report)
  await page.evaluate(() => localStorage.removeItem("add-pooja-draft"));
  out.F = res;
  await ctx.close();
}

writeFileSync(join(OUT, "page14-results.json"), JSON.stringify(out, null, 1));
console.log(JSON.stringify(LIVE ? { F: out.F } : {
  A: { title: out.A.title, bar: out.A.stepBar, freeTextNoGrid: out.A.noTileGrid, aageGate: out.A.aageDisabledEmpty, abuse: out.A.abuse, echo: out.A.echoQuote, pill: out.A.pendingPill, vis: out.A.visibility.length, writes: out.A.writes },
  B: { title: out.B.title, addGate: out.B.addDisabledEmpty, item: out.B.itemAdded, koiBhi: out.B.blankBrandBecomesKoiBhi, vis: out.B.visibility.length },
  C: { tiles: out.C.threeTiles, warn: out.C.brandWarning, noZero: out.C.teamNoZero, dakshina: out.C.dakshina, leaf5100: out.C.leafBarAt5100, census: out.C.moneyCensus, vis: out.C.visibility.length },
  D: { jamaGate: [out.D.jamaDisabled, out.D.jamaStillDisabledNoConsent, out.D.consentOn], embed: out.D.embedPreview, done: out.D.doneCard, writes: out.D.writes, secondAddClean: out.D.secondAddClean, floor: out.D.floor, vis: out.D.visibilityDone.length },
  E: out.E,
}, null, 1));
await browser.close();
