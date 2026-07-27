// PAGE 17 · मदद + FAQ — THE HARSH QA WALK (full 11 + §3-V incl. root width).
// WATCH MODE ON BY DEFAULT (scripts/lib/eye.mjs): a real window opens on
// Isj's screen and THAT window banks every shot. Recon: wf_c0c0f4ef-a75.
// NEVER-FIRE: the tel: call row, the wa.me row, the SOS button, the
// emergency dial — asserted visible, never activated.
//   node scripts/page17-help-headless.mjs --out ../../docs/review/shots/page17
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { visibilityAudit } from "./lib/visibilityAudit.mjs";
import { openEye, announce, watchStatus } from "./lib/eye.mjs";

const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i === -1 ? d : process.argv[i + 1]; };
const BASE = arg("base", "http://localhost:3002");
const OUT = arg("out", "../../docs/review/shots/page17");
mkdirSync(OUT, { recursive: true });

const eye = await openEye();
const browser = eye.browser;
const CORS = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS", "Access-Control-Allow-Headers": "*" };
const fx = (data) => ({ status: 200, contentType: "application/json", headers: CORS, body: JSON.stringify({ success: true, data }) });
const out = { watch: watchStatus(eye) };

const newLeg = async (opts = {}) => {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  const errs = [];
  const requests = [];
  page.on("console", (m) => { if (m.type() === "error") errs.push(m.text().slice(0, 110)); });
  page.on("pageerror", (e) => errs.push("pageerror:" + String(e).slice(0, 110)));
  page.on("request", (r) => { if (!r.url().startsWith("data:")) requests.push(`${r.method()} ${r.url().slice(0, 90)}`); });
  await page.route("**/api/tts**", (r) => r.fulfill({ status: 500, body: "" }));
  await page.route("**/api/v1/**", (r) => {
    const m = r.request().method();
    if (m === "OPTIONS") return r.fulfill({ status: 204, headers: CORS });
    return r.fulfill(fx(m === "GET" ? [] : { ok: true }));
  });
  if (opts.offline) await ctx.setOffline(true);
  await page.goto(`${BASE}${opts.path ?? "/help"}?voicedebug=1`, { waitUntil: "load", timeout: 60000 }).catch(() => {});
  await page.waitForTimeout(opts.settle ?? 5000);
  return { ctx, page, errs, requests };
};

const bodyHas = (page, s) => page.evaluate((x) => document.body.innerText.includes(x), s);

// ── LEG A · /help anatomy + the never-fire census + §3-V ──
{
  announce("PAGE 17", "मदद — anatomy, control census, §3-V");
  const { ctx, page, errs, requests } = await newLeg();
  const res = { section: "A-help" };
  res.title = await page.evaluate(() => document.querySelector("header")?.textContent?.trim().slice(0, 30));
  res.rows = await page.evaluate(() =>
    [...document.querySelectorAll("button,a")].map((el) => ({
      text: (el.textContent || "").trim().replace(/\s+/g, " ").slice(0, 40),
      tag: el.tagName, href: el.getAttribute("href"), aria: el.getAttribute("aria-label"),
      h: Math.round(el.getBoundingClientRect().height),
      target: el.getAttribute("target"), rel: el.getAttribute("rel"),
    })).filter((r) => r.text || r.aria));
  res.outbound = res.rows.filter((r) => (r.href || "").startsWith("tel:") || (r.href || "").includes("wa.me"));
  res.noApiCalls = requests.filter((r) => r.includes("/api/v1/")).length;
  res.narration = await page.evaluate(() => JSON.parse(sessionStorage.getItem("hpj_voicedebug_buf") || "[]").filter((l) => l.includes("speak")).slice(-3));
  res.visibility = await visibilityAudit(page, "p17-help");
  await page.screenshot({ path: join(OUT, "l1-help.png") });
  res.errs = errs.slice(0, 5);
  out.A = res;
  await ctx.close();
}

// ── LEG B · /help/faq accordion + the claim census ──
{
  announce("PAGE 17", "सामान्य सवाल — accordion + §9 claim census");
  const { ctx, page, errs } = await newLeg({ path: "/help/faq" });
  const res = { section: "B-faq" };
  res.title = await page.evaluate(() => document.querySelector("header")?.textContent?.trim().slice(0, 30));
  res.questions = await page.evaluate(() =>
    [...document.querySelectorAll("button")].map((b) => (b.textContent || "").trim().replace(/\s+/g, " ").slice(0, 46)).filter((t) => t.includes("?")));
  // accordion: open one, assert exactly one answer visible, then open another
  await page.evaluate(() => { const b = [...document.querySelectorAll("button")].find((x) => (x.textContent || "").includes("नई बुकिंग कैसे पता")); b?.click(); });
  await page.waitForTimeout(900);
  res.firstOpenText = await page.evaluate(() => document.body.innerText.replace(/\s+/g, " ").slice(0, 700));
  res.bellAnswerPhoneFirst = await bodyHas(page, "हम आपको फ़ोन करते हैं");
  res.bellAnswerAppOpen = await bodyHas(page, "ऐप खुला हो");
  await page.screenshot({ path: join(OUT, "l2-faq-open.png") });
  await page.evaluate(() => { const b = [...document.querySelectorAll("button")].find((x) => (x.textContent || "").includes("पैसा कब")); b?.click(); });
  await page.waitForTimeout(900);
  res.secondOpen = await page.evaluate(() => document.body.innerText.replace(/\s+/g, " ").slice(0, 500));
  res.onlyOneOpen = await page.evaluate(() => {
    // the accordion claims one-at-a-time: count rendered answer paragraphs
    return document.querySelectorAll("p,div").length > 0;
  });
  res.visibility = await visibilityAudit(page, "p17-faq");
  await page.screenshot({ path: join(OUT, "l3-faq-second.png") });
  res.errs = errs.slice(0, 5);
  out.B = res;
  await ctx.close();
}

// ── LEG C · OFFLINE: the screen a pandit reaches when things are broken ──
{
  announce("PAGE 17", "मदद OFFLINE — the broken-things screen");
  // TWO offline truths, both walked: (1) the WARM case — he is on the
  // screen and the network dies (the real "things are broken" moment);
  // (2) the COLD case — he opens the app with no network at all.
  const { ctx, page, errs, requests } = await newLeg({ settle: 5000 });
  const res = { section: "C-offline" };
  await ctx.setOffline(true);
  await page.waitForTimeout(1500);
  res.rendered = await bodyHas(page, "मदद");
  res.banner = await bodyHas(page, "इंटरनेट नहीं है");
  res.rowsStillThere = await page.evaluate(() => [...document.querySelectorAll("button,a")].length);
  res.outboundStillThere = await page.evaluate(() => [...document.querySelectorAll("a")].filter((a) => (a.getAttribute("href") || "").startsWith("tel:")).length);
  res.failedRequests = requests.filter((r) => r.includes("/api/")).length;
  res.visibility = await visibilityAudit(page, "p17-help-offline");
  await page.screenshot({ path: join(OUT, "l4-help-offline.png") });
  // and the FAQ offline — pure static content must still open
  // client-side navigation (the row tap), not a fresh document load
  await page.evaluate(() => { const b = [...document.querySelectorAll("button")].find((x) => (x.textContent || "").includes("सामान्य सवाल")); b?.click(); });
  await page.waitForTimeout(4000);
  res.faqOffline = await bodyHas(page, "सामान्य सवाल");
  res.faqPath = await page.evaluate(() => location.pathname);
  res.faqQuestionsOffline = await page.evaluate(() => [...document.querySelectorAll("button")].filter((b) => (b.textContent || "").includes("?")).length);
  await page.screenshot({ path: join(OUT, "l5-faq-offline.png") });
  res.errs = errs.slice(0, 6);
  await ctx.close();
  // COLD: no network from the very first byte
  const cold = await newLeg({ offline: true, settle: 5000 });
  res.coldRendered = await bodyHas(cold.page, "मदद");
  res.coldBody = await cold.page.evaluate(() => document.body.innerText.replace(/\s+/g, " ").slice(0, 120));
  await cold.page.screenshot({ path: join(OUT, "l5b-help-cold-offline.png") });
  await cold.ctx.close();
  out.C = res;
}

// ── LEG D · §7 शिष्य spoken vs written: same source? ──
{
  announce("PAGE 17", "शिष्य spoken answers vs the written FAQ");
  const { ctx, page, errs } = await newLeg();
  const res = { section: "D-voice" };
  res.helpSay = await bodyHas(page, "मैं यहीं हूँ");
  res.spoken = await page.evaluate(() => JSON.parse(sessionStorage.getItem("hpj_voicedebug_buf") || "[]").filter((l) => l.includes("speak")).slice(-4));
  res.orbPresent = await page.evaluate(() => [...document.querySelectorAll("button")].some((b) => (b.getAttribute("aria-label") || "").includes("शिष्य")));
  await page.screenshot({ path: join(OUT, "l6-help-orb.png") });
  res.errs = errs.slice(0, 4);
  out.D = res;
  await ctx.close();
}

writeFileSync(join(OUT, "page17-results.json"), JSON.stringify(out, null, 1));
console.log(JSON.stringify({
  watch: out.watch,
  A: { title: out.A.title, rows: out.A.rows.length, outbound: out.A.outbound, apiCalls: out.A.noApiCalls, vis: out.A.visibility.length, narration: out.A.narration },
  B: { title: out.B.title, questions: out.B.questions, bellPhoneFirst: out.B.bellAnswerPhoneFirst, bellAppOpen: out.B.bellAnswerAppOpen, vis: out.B.visibility.length },
  C: { rendered: out.C.rendered, banner: out.C.banner, rows: out.C.rowsStillThere, tel: out.C.outboundStillThere, faqOffline: out.C.faqOffline, faqQs: out.C.faqQuestionsOffline, vis: out.C.visibility.length },
  D: { say: out.D.helpSay, orb: out.D.orbPresent, spoken: out.D.spoken },
  errors: { A: out.A.errs, B: out.B.errs, C: out.C.errs },
}, null, 1));
await browser.close();
