// PAGE 15 · सेटिंग्स — THE HARSH QA WALK (full 11 + §3-V incl. root width).
// Recon: wf_ac1710ec-8ed. All legs under full interception. NEVER-FIRE list:
// the tel: support row and the SOS inner dial (real dialer), and every
// my-poojas money write one tap away (dakshina POST / specialization DELETE).
//   node scripts/page15-settings-headless.mjs --out ../../docs/review/shots/page15
import { chromium } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { visibilityAudit } from "./lib/visibilityAudit.mjs";

const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i === -1 ? d : process.argv[i + 1]; };
const BASE = arg("base", "http://localhost:3002");
const OUT = arg("out", "../../docs/review/shots/page15");
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ headless: true, args: ["--autoplay-policy=no-user-gesture-required"] });
const CORS = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS", "Access-Control-Allow-Headers": "*" };
const fx = (data) => ({ status: 200, contentType: "application/json", headers: CORS, body: JSON.stringify({ success: true, data }) });
const out = {};

const ME = { user: { id: "fx", name: "पं. परीक्षण शर्मा", panditProfile: { isOnline: false, verificationStatus: "APPROVED", isBookingReady: true, readinessStep: 5, rejectionReason: null, specializations: [], pendingPoojaVerifications: [], dakshinaRates: [], pujaServices: [] }, milestones: [], unseenMilestones: [] } };

const newLeg = async (opts = {}) => {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, deviceScaleFactor: 1 });
  await ctx.addCookies([{ name: "hpj_token", value: "dummy-qa", domain: "localhost", path: "/" }]);
  const page = await ctx.newPage();
  const errs = [];
  const writes = [];
  const translateCalls = [];
  page.on("console", (m) => { if (m.type() === "error") errs.push(m.text().slice(0, 110)); });
  page.on("pageerror", (e) => errs.push("pageerror:" + String(e).slice(0, 110)));
  await page.route("**/api/tts**", (r) => r.fulfill({ status: 500, body: "" }));
  await page.route("**/api/v1/**", (r) => {
    const u = r.request().url();
    const m = r.request().method();
    if (u.includes("/voice/translate")) translateCalls.push(`${m} ${u}`);
    if (m === "OPTIONS") return r.fulfill({ status: 204, headers: CORS });
    if (m !== "GET") { writes.push(`${m} ${u.split("/api/v1")[1]}`); return r.fulfill(fx({ ok: true })); }
    if (u.includes("/auth/me")) return r.fulfill(fx(ME));
    if (u.includes("/pandit/stats")) return r.fulfill(fx({ rating: 4.8, reviewCount: 12, completedBookings: 9, completionPct: 96 }));
    if (u.includes("/pandit/pooja-verifications")) return r.fulfill(fx({ latest: [], history: [] }));
    return r.fulfill(fx([]));
  });
  await page.goto(`${BASE}/onboarding?voicedebug=1`, { waitUntil: "load", timeout: 60000 });
  await page.evaluate((sound) => {
    localStorage.setItem("pandit_token", "dummy-qa");
    localStorage.setItem("hpj-onboarding", JSON.stringify({ state: { phase: "DONE", detectedCity: "वाराणसी", selectedLanguage: "Hindi", languageConfirmed: true, parichayDone: true, tutorialCompleted: true }, version: 0 }));
    for (const k of Object.keys(localStorage)) if (k.startsWith("tip_seen")) localStorage.removeItem(k);
    if (sound === null) localStorage.removeItem("sound_enabled");
    else localStorage.setItem("sound_enabled", sound);
  }, opts.sound ?? null);
  await page.goto(`${BASE}/settings?voicedebug=1`, { waitUntil: "load", timeout: 60000 });
  await page.waitForTimeout(opts.settle ?? 5500);
  return { ctx, page, errs, writes, translateCalls };
};

const bodyHas = (page, s) => page.evaluate((x) => document.body.innerText.includes(x), s);
const clickText = (page, txt) => page.evaluate((x) => { const b = [...document.querySelectorAll("button,a")].find((el) => (el.textContent || "").includes(x)); b?.click(); }, txt);

// ── LEG A · anatomy, census, §3-V, narration, dead-claim audit ──
{
  const { ctx, page, errs, writes } = await newLeg();
  const res = { section: "A-anatomy" };
  res.title = await page.evaluate(() => document.querySelector("h1,header")?.textContent?.trim().slice(0, 30));
  res.noBack = await page.evaluate(() => ![...document.querySelectorAll("button")].some((b) => (b.getAttribute("aria-label") || "").includes("पीछे")));
  res.rows = await page.evaluate(() =>
    [...document.querySelectorAll("button,a")]
      .map((el) => ({
        text: (el.textContent || "").trim().replace(/\s+/g, " ").slice(0, 40),
        tag: el.tagName,
        href: el.getAttribute("href"),
        role: el.getAttribute("role"),
        aria: el.getAttribute("aria-label"),
        h: Math.round(el.getBoundingClientRect().height),
      }))
      .filter((r) => r.text || r.aria),
  );
  // §9: the dialer row must EXIST and be tel: — asserted, never tapped
  res.telRow = res.rows.find((r) => (r.href || "").startsWith("tel:")) ?? null;
  // §9 dead-claim audit: what the mount narration promises vs what exists
  res.narration = await page.evaluate(() => JSON.parse(sessionStorage.getItem("hpj_voicedebug_buf") || "[]").filter((l) => l.includes("speak")).slice(-4));
  res.introPromisesVoiceToggle = res.narration.some((l) => l.includes("आवाज़ चालू या बंद"));
  res.voiceToggleExists = await page.evaluate(() =>
    [...document.querySelectorAll('[role="switch"]')].some((s) => {
      const card = s.closest("div")?.parentElement?.textContent || "";
      return card.includes("आवाज़") && !card.includes("घंटी");
    }),
  );
  res.switchCount = await page.evaluate(() => document.querySelectorAll('[role="switch"]').length);
  res.switchAria = await page.evaluate(() => [...document.querySelectorAll('[role="switch"]')].map((s) => s.getAttribute("aria-label")));
  res.languageValue = await page.evaluate(() => {
    const row = [...document.querySelectorAll("button")].find((b) => (b.textContent || "").includes("भाषा"));
    return row ? (row.textContent || "").trim().replace(/\s+/g, " ") : null;
  });
  res.visibility = await visibilityAudit(page, "p15-settings");
  await page.screenshot({ path: join(OUT, "j1-settings-full.png") });
  res.writes = writes; // must be []
  res.errs = errs.slice(0, 5);
  out.A = res;
  await ctx.close();
}

// ── LEG B · the ONE toggle: state, persistence, refresh, round-trip ──
{
  const { ctx, page, errs, writes } = await newLeg({ sound: null }); // absent key = ON by default
  const res = { section: "B-toggle" };
  const knob = () => page.evaluate(() => document.querySelector('[role="switch"]')?.getAttribute("aria-checked"));
  res.defaultAbsentKey = await knob();
  res.storedBefore = await page.evaluate(() => localStorage.getItem("sound_enabled"));
  await page.evaluate(() => document.querySelector('[role="switch"]')?.click());
  await page.waitForTimeout(1200);
  res.afterToggle = await knob();
  res.storedAfter = await page.evaluate(() => localStorage.getItem("sound_enabled"));
  res.serverWrites = [...writes]; // THE QUESTION: is there any round-trip at all?
  res.spokeOnToggle = await page.evaluate(() => JSON.parse(sessionStorage.getItem("hpj_voicedebug_buf") || "[]").filter((l) => l.includes("speak")).slice(-2));
  await page.screenshot({ path: join(OUT, "j2-toggle-off.png") });
  // refresh persistence
  await page.reload({ waitUntil: "load" });
  await page.waitForTimeout(4500);
  res.afterRefresh = await knob();
  res.storedAfterRefresh = await page.evaluate(() => localStorage.getItem("sound_enabled"));
  // FIRST-PAINT FLASH: mount default is true, the effect corrects it
  const l2 = await newLeg({ sound: "false", settle: 150 });
  res.firstPaintWhileOff = await l2.page.evaluate(() => document.querySelector('[role="switch"]')?.getAttribute("aria-checked"));
  await l2.page.screenshot({ path: join(OUT, "j3-first-paint-flash.png") });
  await l2.page.waitForTimeout(3000);
  res.settledWhileOff = await l2.page.evaluate(() => document.querySelector('[role="switch"]')?.getAttribute("aria-checked"));
  await l2.ctx.close();
  res.errs = errs.slice(0, 5);
  out.B = res;
  await ctx.close();
}

// ── LEG C · every drill-in row navigates (money screens looked at, never fired) ──
{
  const { ctx, page, errs, writes } = await newLeg();
  const res = { section: "C-nav", hops: [] };
  const hop = async (label, needle) => {
    await page.goto(`${BASE}/settings?voicedebug=1`, { waitUntil: "load", timeout: 60000 });
    await page.waitForTimeout(3500);
    await clickText(page, needle);
    await page.waitForTimeout(4000);
    const where = await page.evaluate(() => location.pathname);
    res.hops.push({ label, where });
    await page.screenshot({ path: join(OUT, `j4-hop-${label}.png`) });
  };
  await hop("profile", "प्रोफ़ाइल");
  await hop("mypoojas", "मेरी पूजाएँ");
  await hop("help", "मदद व सहायता");
  res.writesAcrossHops = writes; // must be [] — no money write anywhere
  res.errs = errs.slice(0, 5);
  out.C = res;
  await ctx.close();
}

// ── LEG D · about-sheet + logout confirm (cancel = no purge) ──
{
  const { ctx, page, errs } = await newLeg();
  const res = { section: "D-sheets" };
  await clickText(page, "शिष्य के बारे में");
  await page.waitForTimeout(1500);
  res.aboutOpen = await bodyHas(page, "शिष्य");
  await page.screenshot({ path: join(OUT, "j5-about-sheet.png") });
  res.visibilityAbout = await visibilityAudit(page, "p15-about-sheet");
  await page.keyboard.press("Escape").catch(() => {});
  await page.evaluate(() => { const b = [...document.querySelectorAll("button")].find((x) => (x.textContent || "").trim() === "ठीक है" || (x.getAttribute("aria-label") || "").includes("बंद")); b?.click(); });
  await page.waitForTimeout(800);
  // logout: confirm appears, CANCEL leaves the token alone
  await clickText(page, "लॉगआउट");
  await page.waitForTimeout(1000);
  res.confirmShown = await bodyHas(page, "क्या आप वाकई लॉगआउट");
  await page.screenshot({ path: join(OUT, "j6-logout-confirm.png") });
  await clickText(page, "नहीं");
  await page.waitForTimeout(800);
  res.tokenAfterCancel = await page.evaluate(() => localStorage.getItem("pandit_token"));
  res.stillOnSettings = await page.evaluate(() => location.pathname);
  res.errs = errs.slice(0, 5);
  out.D = res;
  await ctx.close();
}

// ── LEG E · भाषा row under Ruling ख: zero translate requests ──
{
  const { ctx, page, errs, translateCalls } = await newLeg();
  const res = { section: "E-language" };
  await clickText(page, "भाषा");
  await page.waitForTimeout(5000);
  res.where = await page.evaluate(() => location.pathname);
  res.listShown = await bodyHas(page, "भाषा");
  await page.screenshot({ path: join(OUT, "j7-language-list.png") });
  // pick a non-Hindi tile twice (arm + select) — Ruling ख must hold
  await page.evaluate(() => { const b = [...document.querySelectorAll("button")].find((x) => (x.textContent || "").includes("বাংলা")); b?.click(); });
  await page.waitForTimeout(1200);
  await page.evaluate(() => { const b = [...document.querySelectorAll("button")].find((x) => (x.textContent || "").includes("বাংলা")); b?.click(); });
  await page.waitForTimeout(7000);
  res.translateCalls = translateCalls; // MUST be []
  res.landedBack = await page.evaluate(() => location.pathname);
  res.stillHindi = await page.evaluate(() => localStorage.getItem("hpj_lang_code"));
  res.noticeSpoken = await page.evaluate(() => JSON.parse(sessionStorage.getItem("hpj_voicedebug_buf") || "[]").filter((l) => l.includes("speak")).slice(-3));
  await page.screenshot({ path: join(OUT, "j8-after-language-pick.png") });
  res.errs = errs.slice(0, 5);
  out.E = res;
  await ctx.close();
}

writeFileSync(join(OUT, "page15-results.json"), JSON.stringify(out, null, 1));
console.log(JSON.stringify({
  A: { title: out.A.title, noBack: out.A.noBack, rowCount: out.A.rows.length, telRow: out.A.telRow, switches: out.A.switchCount, switchAria: out.A.switchAria, langValue: out.A.languageValue, introPromisesVoiceToggle: out.A.introPromisesVoiceToggle, voiceToggleExists: out.A.voiceToggleExists, vis: out.A.visibility.length, writes: out.A.writes },
  B: { defaultAbsentKey: out.B.defaultAbsentKey, afterToggle: out.B.afterToggle, storedAfter: out.B.storedAfter, serverWrites: out.B.serverWrites, afterRefresh: out.B.afterRefresh, firstPaintWhileOff: out.B.firstPaintWhileOff, settledWhileOff: out.B.settledWhileOff, spoke: out.B.spokeOnToggle },
  C: { hops: out.C.hops, writes: out.C.writesAcrossHops },
  D: { about: out.D.aboutOpen, visAbout: out.D.visibilityAbout.length, confirm: out.D.confirmShown, tokenAfterCancel: out.D.tokenAfterCancel, stillOn: out.D.stillOnSettings },
  E: { where: out.E.where, translateCalls: out.E.translateCalls, landedBack: out.E.landedBack, langCode: out.E.stillHindi, notice: out.E.noticeSpoken },
  errors: { A: out.A.errs, B: out.B.errs, C: out.C.errs, D: out.D.errs, E: out.E.errs },
}, null, 1));
await browser.close();
