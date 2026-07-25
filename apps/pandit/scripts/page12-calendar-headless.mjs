// PAGE 12 · कैलेंडर — THE HARSH QA WALK (full 11 + §3-V native).
// Recon: workflow wf_ef3f316e-924. Fixtures per recon (T04:30Z = 10:00 IST
// so LOCAL booking keys and UTC blocked keys agree). Today = 2026-07-25.
// MONEY/MUTATION BOUNDARY: the छुट्टी toggle POST/DELETEs — it fires ONLY
// under full **/api/v1/** interception (non-GET fulfilled inert). No prod
// leg touches a day cell.
//   node scripts/page12-calendar-headless.mjs --out ../../docs/review/shots/page12
import { chromium } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { visibilityAudit } from "./lib/visibilityAudit.mjs";

const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i === -1 ? d : process.argv[i + 1]; };
const BASE = arg("base", "http://localhost:3002");
const OUT = arg("out", "../../docs/review/shots/page12");
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ headless: true, args: ["--autoplay-policy=no-user-gesture-required"] });
const fx = (data) => ({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true, data }) });
const out = {};

const BOOKINGS_POPULATED = [
  { id: "fxb1", eventDate: "2026-07-27T04:30:00.000Z", status: "ACCEPTED" },
  { id: "fxb2", eventDate: "2026-07-30T04:30:00.000Z", status: "IN_PROGRESS" },
  { id: "fxb3", eventDate: "2026-07-05T04:30:00.000Z", status: "ACCEPTED" }, // past → dot suppressed
  { id: "fxb4", eventDate: "2026-08-12T04:30:00.000Z", status: "ACCEPTED" }, // next month
];
const BLOCKED_POPULATED = [{ id: "fxd1", date: "2026-07-28T00:00:00.000Z" }];

const newLeg = async (world) => {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, deviceScaleFactor: 1 });
  await ctx.addCookies([{ name: "hpj_token", value: "dummy-qa", domain: "localhost", path: "/" }]);
  const page = await ctx.newPage();
  const errs = [];
  const writes = [];
  page.on("console", (m) => { if (m.type() === "error") errs.push(m.text().slice(0, 120)); });
  page.on("pageerror", (e) => errs.push("pageerror:" + String(e).slice(0, 120)));
  await page.route("**/api/tts**", (r) => r.fulfill({ status: 500, body: "" }));
  await page.route("**/api/v1/**", (r) => {
    const u = r.request().url();
    const m = r.request().method();
    if (m !== "GET") { writes.push(`${m} ${u.split("/api/v1")[1]}`); return r.fulfill(fx(null)); } // inert
    if (u.includes("/auth/me")) return r.fulfill(fx({ user: { id: "fx", name: "पं. परीक्षण शर्मा", panditProfile: { isOnline: false, verificationStatus: "APPROVED", isBookingReady: true, readinessStep: 5, rejectionReason: null }, milestones: [], unseenMilestones: [] } }));
    if (u.includes("/pandit/blocked-dates")) return r.fulfill(fx(world.blocked));
    if (u.includes("/pandit/bookings")) return r.fulfill(fx(world.bookings));
    return r.fulfill(fx([]));
  });
  await page.goto(`${BASE}/onboarding?voicedebug=1`, { waitUntil: "load", timeout: 60000 });
  await page.evaluate(() => {
    localStorage.setItem("pandit_token", "dummy-qa");
    const o = { state: { phase: "DONE", detectedCity: "वाराणसी", selectedLanguage: "Hindi", languageConfirmed: true, parichayDone: true, tutorialCompleted: true }, version: 0 };
    localStorage.setItem("hpj-onboarding", JSON.stringify(o));
    for (const k of Object.keys(localStorage)) if (k.startsWith("tip_seen")) localStorage.removeItem(k);
  });
  await page.goto(`${BASE}/calendar?voicedebug=1`, { waitUntil: "load", timeout: 60000 });
  await page.waitForTimeout(6500);
  return { ctx, page, errs, writes };
};

const gridState = (page) => page.evaluate(() => {
  const heads = [...document.querySelectorAll(".grid-cols-7")][0];
  const grid = [...document.querySelectorAll(".grid-cols-7")][1];
  const headTexts = heads ? [...heads.children].map((c) => c.textContent.trim()) : [];
  const slots = grid ? [...grid.children].map((c) => ({
    tag: c.tagName, text: (c.textContent || "").trim().replace(/\s+/g, ""),
    disabled: c.disabled ?? null, cls: (c.className || "").slice(0, 90),
  })) : [];
  const h2 = document.querySelector("h2")?.textContent?.trim();
  const note = document.body.innerText.includes("इस महीने अभी कोई बुकिंग नहीं");
  return { headTexts, h2, note, slotCount: slots.length, slots };
});

const cellBtn = (page, day) => page.evaluateHandle((d) => {
  const grid = [...document.querySelectorAll(".grid-cols-7")][1];
  return [...grid.children].find((c) => c.tagName === "BUTTON" && (c.textContent || "").trim().replace(/\s+/g, "").replace(/[●✕]/g, "") === String(d));
}, day);

// ── LEG A · populated July: anatomy + §3 + §3-V + §7 census ──
{
  const { ctx, page, errs, writes } = await newLeg({ bookings: BOOKINGS_POPULATED, blocked: BLOCKED_POPULATED });
  const res = { section: "A-populated" };
  res.grid = await gridState(page);
  res.measure = await page.evaluate(() => {
    const heads = [...document.querySelectorAll(".grid-cols-7")][0];
    const grid = [...document.querySelectorAll(".grid-cols-7")][1];
    const cell = [...grid.children].find((c) => c.tagName === "BUTTON");
    const legend = [...document.querySelectorAll("main span")].find((s) => s.textContent.trim() === "खाली");
    const prev = document.querySelector('[aria-label="पिछला महीना"]');
    const r = prev?.getBoundingClientRect();
    return {
      headFont: heads ? getComputedStyle(heads.children[0]).fontSize : null,
      cellRect: cell ? `${Math.round(cell.getBoundingClientRect().width)}x${Math.round(cell.getBoundingClientRect().height)}` : null,
      legendFont: legend ? getComputedStyle(legend).fontSize : null,
      arrowTarget: r ? `${Math.round(r.width)}x${Math.round(r.height)}` : null,
      title: document.querySelector("h1,header")?.textContent?.trim().slice(0, 60),
    };
  });
  // day-state census
  const stateOf = (d) => {
    const s = res.grid.slots.find((x) => x.tag === "BUTTON" && x.text.replace(/[●✕]/g, "") === String(d));
    return s ? { text: s.text, disabled: s.disabled, cls: s.cls } : null;
  };
  res.day5_pastBooked = stateOf(5);   // disabled, NO dot
  res.day25_today = stateOf(25);      // available (no today marker by canon)
  res.day27_accepted = stateOf(27);   // ●
  res.day28_blocked = stateOf(28);    // ✕
  res.day30_inprogress = stateOf(30); // ●
  res.leadingPads = res.grid.slots.slice(0, 3).map((s) => s.tag); // Jul 1 2026 = Wed → 3 pads
  res.censusTappable = await page.evaluate(() =>
    [...document.querySelectorAll("button,a,[role=button]")].filter((el) => !el.disabled && el.getBoundingClientRect().width > 0)
      .map((el) => (el.getAttribute("aria-label") || el.textContent || "").trim().replace(/\s+/g, " ").slice(0, 30))
  );
  res.visibility = await visibilityAudit(page, "p12-populated-tip-up"); // tip still up: proves new placement
  await page.screenshot({ path: join(OUT, "g1-populated-july-tip.png") });
  await page.evaluate(() => { const b = [...document.querySelectorAll("button")].find((x) => x.textContent.trim() === "समझा"); b?.click(); });
  await page.waitForTimeout(1200);
  res.visibilityAfterTip = await visibilityAudit(page, "p12-populated");
  await page.screenshot({ path: join(OUT, "g2-populated-july.png") });
  res.narration = await page.evaluate(() => JSON.parse(sessionStorage.getItem("hpj_voicedebug_buf") || "[]").filter((l) => l.includes("speak")).slice(-8));

  // ── month nav (same ctx): ◀ June, ▶▶ August (fxb4 dot), ▶ Sep (note) ──
  await page.click('[aria-label="पिछला महीना"]');
  await page.waitForTimeout(600);
  res.juneH2 = (await gridState(page)).h2;
  await page.screenshot({ path: join(OUT, "g3-june-all-past.png") });
  await page.click('[aria-label="अगला महीना"]'); await page.waitForTimeout(300);
  await page.click('[aria-label="अगला महीना"]'); await page.waitForTimeout(600);
  const aug = await gridState(page);
  res.augustH2 = aug.h2;
  res.august12dot = aug.slots.some((s) => s.text === "12●");
  res.augustNote = aug.note; // fxb4 exists → note must be ABSENT
  res.visibilityAugust = await visibilityAudit(page, "p12-august");
  await page.screenshot({ path: join(OUT, "g4-august-dot12.png") });
  await page.click('[aria-label="अगला महीना"]'); await page.waitForTimeout(600);
  const sep = await gridState(page);
  res.septemberNote = sep.note; // no bookings → note VISIBLE
  await page.screenshot({ path: join(OUT, "g5-september-empty-note.png") });
  // nav spam: 10 fast ▶ then verify header integrity
  for (let i = 0; i < 10; i++) await page.click('[aria-label="अगला महीना"]', { delay: 15 });
  await page.waitForTimeout(600);
  res.spamH2 = (await gridState(page)).h2; // जुलाई 2027
  res.errsA = errs.slice(0, 6);
  res.writesA = writes; // must be []
  out.A = res;
  await ctx.close();
}

// ── LEG B · interactions: past/booked/available taps + stability + abuse ──
{
  const { ctx, page, errs, writes } = await newLeg({ bookings: BOOKINGS_POPULATED, blocked: BLOCKED_POPULATED });
  const res = { section: "B-interactions" };
  await page.evaluate(() => { const b = [...document.querySelectorAll("button")].find((x) => x.textContent.trim() === "समझा"); b?.click(); });
  await page.waitForTimeout(800);
  const rectOf = async (d) => {
    const h = await cellBtn(page, d);
    return await h.evaluate((el) => { const r = el.getBoundingClientRect(); return `${Math.round(r.left)},${Math.round(r.top)} ${Math.round(r.width)}x${Math.round(r.height)}`; });
  };
  // past tap → silent
  const past = await cellBtn(page, 10);
  await past.evaluate((el) => el.click());
  await page.waitForTimeout(700);
  res.pastTapToast = await page.evaluate(() => document.body.innerText.includes("इस दिन बुकिंग है"));
  // booked tap → toast + speak, NO write
  const booked = await cellBtn(page, 27);
  await booked.evaluate((el) => el.click());
  await page.waitForTimeout(900);
  res.bookedTapToast = await page.evaluate(() => document.body.innerText.includes("इस दिन बुकिंग है"));
  await page.screenshot({ path: join(OUT, "g6-booked-tap-toast.png") });
  res.writesAfterBookedTap = [...writes];
  // available toggle (29): stability + POST, re-tap DELETE
  res.stabilityBefore = await rectOf(15);
  const avail = await cellBtn(page, 29);
  await avail.evaluate((el) => el.click());
  await page.waitForTimeout(900);
  res.day29AfterBlock = (await gridState(page)).slots.find((s) => s.text.startsWith("29"))?.text;
  res.stabilityAfter = await rectOf(15); // BADGE-SLOT LAW: unchanged
  await page.screenshot({ path: join(OUT, "g7-day29-blocked.png") });
  await avail.evaluate((el) => el.click());
  await page.waitForTimeout(900);
  res.day29AfterUnblock = (await gridState(page)).slots.find((s) => s.text.startsWith("29"))?.text;
  // double-tap abuse (31)
  const d31 = await cellBtn(page, 31);
  await d31.evaluate((el) => { el.click(); el.click(); });
  await page.waitForTimeout(1200);
  res.day31AfterDoubleTap = (await gridState(page)).slots.find((s) => s.text.startsWith("31"))?.text;
  res.writes = writes; // expect block/unblock pairs, fixture-only
  res.speaks = await page.evaluate(() => JSON.parse(sessionStorage.getItem("hpj_voicedebug_buf") || "[]").filter((l) => l.includes("speak")).slice(-6));
  res.errs = errs.slice(0, 6);
  out.B = res;
  await ctx.close();
}

// ── LEG C · REQUESTED-only month: note hidden yet ZERO dots (§10 seam) ──
{
  const { ctx, page, errs } = await newLeg({ bookings: [{ id: "fxr1", eventDate: "2026-07-27T04:30:00.000Z", status: "REQUESTED" }], blocked: [] });
  const g = await gridState(page);
  out.C = {
    section: "C-requested-seam",
    noteHidden: !g.note, // monthHasBookings counts ANY status
    anyDots: g.slots.some((s) => s.text.includes("●")), // but no dot renders
    errs: errs.slice(0, 4),
  };
  await page.screenshot({ path: join(OUT, "g8-requested-seam.png") });
  await ctx.close();
}

// ── LEG D · empty world: truthful note + all available + §3-V ──
{
  const { ctx, page, errs } = await newLeg({ bookings: [], blocked: [] });
  const g = await gridState(page);
  out.D = {
    section: "D-empty",
    note: g.note,
    anyDots: g.slots.some((s) => s.text.includes("●") || s.text.includes("✕")),
    visibility: await visibilityAudit(page, "p12-empty"),
    errs: errs.slice(0, 4),
  };
  await page.screenshot({ path: join(OUT, "g9-empty-world.png") });
  await ctx.close();
}

// ── LEG E · §6 nav/persistence: tip one-shot + bottom-nav round trip ──
{
  const { ctx, page, errs } = await newLeg({ bookings: BOOKINGS_POPULATED, blocked: BLOCKED_POPULATED });
  const res = { section: "E-nav" };
  res.tipFirstVisit = await page.evaluate(() => document.body.innerText.includes("तारीख़ बंद कीजिए"));
  await page.evaluate(() => { const b = [...document.querySelectorAll("button")].find((x) => x.textContent.trim() === "समझा"); b?.click(); });
  await page.waitForTimeout(800);
  await page.evaluate(() => { const links = [...document.querySelectorAll("a,button")]; links.find((l) => (l.textContent || "").includes("कमाई"))?.click(); });
  await page.waitForTimeout(3000);
  res.wentTo = await page.evaluate(() => location.pathname);
  await page.goBack();
  await page.waitForTimeout(3500);
  res.backTo = await page.evaluate(() => location.pathname);
  res.tipOnReturn = await page.evaluate(() => document.body.innerText.includes("तारीख़ बंद कीजिए")); // must be false
  res.gridStillRendered = (await gridState(page)).slotCount;
  res.errs = errs.slice(0, 4);
  out.E = res;
  await ctx.close();
}

writeFileSync(join(OUT, "page12-results.json"), JSON.stringify(out, null, 1));
const A = out.A, B = out.B;
console.log(JSON.stringify({
  weekStart: { heads: A.grid.headTexts, sundayFirst: A.grid.headTexts[0] === "र", leadingPads: A.leadingPads },
  days: { past5: A.day5_pastBooked, today25: A.day25_today?.text, d27: A.day27_accepted?.text, d28: A.day28_blocked?.text, d30: A.day30_inprogress?.text },
  monthNav: { june: A.juneH2, august: A.augustH2, aug12dot: A.august12dot, augNote: A.augustNote, sepNote: A.septemberNote, spam: A.spamH2 },
  visibility: { tipUp: A.visibility.length, after: A.visibilityAfterTip.length, august: A.visibilityAugust.length, empty: out.D.visibility.length },
  interactions: { pastSilent: !B.pastTapToast, bookedToast: B.bookedTapToast, writesAfterBookedTap: B.writesAfterBookedTap.length, d29: [B.day29AfterBlock, B.day29AfterUnblock], d31double: B.day31AfterDoubleTap, stability: B.stabilityBefore === B.stabilityAfter, writes: B.writes },
  seams: { requestedNoteHidden: out.C.noteHidden, requestedDots: out.C.anyDots, emptyNote: out.D.note },
  nav: { tipOnce: out.E.tipFirstVisit && !out.E.tipOnReturn, roundTrip: [out.E.wentTo, out.E.backTo] },
  errors: { A: A.errsA, B: B.errs, C: out.C.errs, D: out.D.errs, E: out.E.errs },
  measure: A.measure,
  writesA: A.writesA,
}, null, 1));
await browser.close();
