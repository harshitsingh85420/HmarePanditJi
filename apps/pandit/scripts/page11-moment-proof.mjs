// LIVE TIMESTAMP PROOF — the folded paidVoice (narration-queue CLASS fix,
// Isj order 2026-07-25). Three legs on the LOCAL post-fix bundle:
//   momentFold : lastSeenPaidAt="1" → ₹5,100 fresh → the buffer must show
//                ONE speak carrying BOTH paidVoice AND introVoice (folded,
//                un-killable by construction) and NO bare paidVoice speak.
//   firstVisit : key absent → seeds silently to newest paidAt; NO
//                celebration in pixels or voice; narration = introVoice.
//   emptyDay1  : zero rows → introEmptyVoice (the truthful day-one line).
//   node scripts/page11-moment-proof.mjs --out ../../docs/review/shots/page11
import { chromium } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i === -1 ? d : process.argv[i + 1]; };
const BASE = arg("base", "http://localhost:3002");
const OUT = arg("out", "../../docs/review/shots/page11");
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ headless: true, args: ["--autoplay-policy=no-user-gesture-required"] });
const fx = (data) => ({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true, data }) });
const mkPayout = (o) => ({
  id: o.id, bookingId: o.id + "-bk", panditId: "fx-pandit", amount: o.amount,
  status: o.status, createdAt: o.createdAt, paidAt: o.paidAt ?? null,
  booking: { id: o.id + "-bk", pujaType: o.puja, eventType: "PUJA", eventDate: o.eventDate },
});
const out = {};

const runLeg = async (name, { world, seenAt, shot }) => {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  await ctx.addCookies([{ name: "hpj_token", value: "dummy-qa", domain: "localhost", path: "/" }]);
  const page = await ctx.newPage();
  const errs = [];
  page.on("pageerror", (e) => errs.push(String(e).slice(0, 120)));
  await page.route("**/api/tts**", (r) => r.fulfill({ status: 500, body: "" }));
  await page.route("**/api/v1/**", (r) => {
    const u = r.request().url();
    if (r.request().method() !== "GET") return r.fulfill(fx(null));
    if (u.includes("/auth/me")) return r.fulfill(fx({ user: { id: "fx", name: "पं. परीक्षण शर्मा", panditProfile: { isOnline: false, verificationStatus: "APPROVED", isBookingReady: true, readinessStep: 5, rejectionReason: null }, milestones: [], unseenMilestones: [] } }));
    if (u.includes("/pandit/earnings/summary")) return r.fulfill(fx(world === "empty" ? { today: 0, week: 0, month: 0, pendingPayout: 0 } : { today: 1100, week: 4200, month: 12500, pendingPayout: 9999 }));
    if (u.includes("/pandit/payouts") && u.includes("PENDING")) return r.fulfill(fx(world === "empty" ? [] : [mkPayout({ id: "fxp1", amount: 5600, status: "PENDING", createdAt: "2026-07-20T05:00:00.000Z", eventDate: "2026-07-18T04:30:00.000Z", puja: "गृह प्रवेश पूजा" })]));
    if (u.includes("/pandit/payouts") && u.includes("PAID")) return r.fulfill(fx(world === "empty" ? [] : [mkPayout({ id: "fxd1", amount: 5100, status: "PAID", createdAt: "2026-07-10T05:00:00.000Z", paidAt: "2026-07-24T10:00:00.000Z", eventDate: "2026-07-10T04:30:00.000Z", puja: "रुद्राभिषेक" })]));
    return r.fulfill(fx([]));
  });
  await page.goto(`${BASE}/onboarding?voicedebug=1`, { waitUntil: "load", timeout: 60000 });
  await page.evaluate((seen) => {
    localStorage.setItem("pandit_token", "dummy-qa");
    if (seen === null) localStorage.removeItem("lastSeenPaidAt");
    else localStorage.setItem("lastSeenPaidAt", seen);
    const o = { state: { phase: "DONE", detectedCity: "वाराणसी", selectedLanguage: "Hindi", languageConfirmed: true, parichayDone: true, tutorialCompleted: true }, version: 0 };
    localStorage.setItem("hpj-onboarding", JSON.stringify(o));
    for (const k of Object.keys(localStorage)) if (k.startsWith("tip_seen")) localStorage.removeItem(k);
  }, seenAt);
  await page.goto(`${BASE}/earnings?voicedebug=1`, { waitUntil: "load", timeout: 60000 });
  await page.waitForTimeout(8000);
  await page.screenshot({ path: join(OUT, shot + ".png") });
  const res = {};
  res.stamp = new Date().toISOString();
  res.errs = errs.slice(0, 5);
  res.lastSeenPaidAtAfter = await page.evaluate(() => localStorage.getItem("lastSeenPaidAt"));
  res.banner = await page.evaluate(() => document.body.innerText.includes("आपके खाते में भेज दिए गए"));
  res.speaks = await page.evaluate(() =>
    JSON.parse(sessionStorage.getItem("hpj_voicedebug_buf") || "[]").filter((l) => /speak|interrupt|ended/.test(l)).slice(-14)
  );
  // voicedebug truncates speak text at ~40 chars — match PREFIXES.
  const paidLines = res.speaks.filter((l) => l.includes("पंडित जी, 5,100 रुपये"));
  const bareIntroLines = res.speaks.filter((l) => l.includes('speak "यहाँ आपकी सारी कमाई'));
  res.paidSpeakCount = paidLines.length;
  // folded = the paid line IS the narration (one speak), no separate
  // intro speak racing it 150ms later (the old kill pattern)
  res.foldedInOne = paidLines.length === 1 && bareIntroLines.length === 0;
  res.emptyLineSpoken = res.speaks.some((l) => l.includes("यह कमाई की स्क्रीन है"));
  out[name] = res;
  await ctx.close();
};

await runLeg("momentFold", { world: "populated", seenAt: "1", shot: "d-moment-folded" });
await runLeg("firstVisit", { world: "populated", seenAt: null, shot: "e-first-visit-calm" });
await runLeg("emptyDay1", { world: "empty", seenAt: null, shot: "f-empty-truthful" });

writeFileSync(join(OUT, "moment-proof.json"), JSON.stringify(out, null, 1));
console.log(JSON.stringify({
  momentFold: { paidSpeaks: out.momentFold.paidSpeakCount, folded: out.momentFold.foldedInOne, banner: out.momentFold.banner, stamp: out.momentFold.stamp },
  firstVisit: { paidSpeaks: out.firstVisit.paidSpeakCount, banner: out.firstVisit.banner, seededTo: out.firstVisit.lastSeenPaidAtAfter },
  emptyDay1: { truthfulLine: out.emptyDay1.emptyLineSpoken, banner: out.emptyDay1.banner },
}, null, 1));
console.log("SPEAKS momentFold:", JSON.stringify(out.momentFold.speaks.slice(-6), null, 1));
await browser.close();
