// कमाई populated legs ONLY — page9 POPONLY recipe (goto → evaluate setItem → re-goto).
import { chromium } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const BASE = "https://hmarepanditji-pandit.vercel.app";
const OUT = process.argv[2] || "recon-earnings-shots";
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ headless: true, args: ["--autoplay-policy=no-user-gesture-required"] });
const out = {};

const fx = (data) => ({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true, data }) });
const mkPayout = (o) => ({
  id: o.id, bookingId: o.id + "-bk", panditId: "fx-pandit", amount: o.amount,
  status: o.status, createdAt: o.createdAt, paidAt: o.paidAt ?? null,
  booking: { id: o.id + "-bk", pujaType: o.puja, eventType: o.event || "PUJA", eventDate: o.eventDate },
});
const SUMMARY = { today: 1100, week: 4200, month: 12500, pendingPayout: 9999 };
const PENDING = [
  mkPayout({ id: "fxp1", amount: 5600, status: "PENDING", createdAt: "2026-07-20T05:00:00.000Z", eventDate: "2026-07-18T04:30:00.000Z", puja: "गृह प्रवेश पूजा", event: "GRIHA_PRAVESH" }),
  mkPayout({ id: "fxp2", amount: 2600, status: "PENDING", createdAt: "2026-07-22T05:00:00.000Z", eventDate: "2026-07-21T04:30:00.000Z", puja: "सत्यनारायण कथा", event: "SATYANARAYAN" }),
];
const paidRow = (paidAt) => [
  mkPayout({ id: "fxd1", amount: 5100, status: "PAID", createdAt: "2026-07-10T05:00:00.000Z", paidAt, eventDate: "2026-07-10T04:30:00.000Z", puja: "रुद्राभिषेक", event: "RUDRABHISHEK" }),
];

const runLeg = async (name, { paidAt, seenAt, shot }) => {
  const ctx = await browser.newContext({ viewport: { width: 360, height: 740 }, hasTouch: true, deviceScaleFactor: 1 });
  // middleware.ts:44 gates /earnings SERVER-SIDE on the hpj_token COOKIE —
  // localStorage alone bounces at the edge before any client JS runs.
  await ctx.addCookies([{ name: "hpj_token", value: "dummy-qa-token", domain: "hmarepanditji-pandit.vercel.app", path: "/" }]);
  const page = await ctx.newPage();
  const errs = [];
  page.on("console", (m) => { if (m.type() === "error") errs.push(m.text().slice(0, 120)); });
  page.on("pageerror", (e) => errs.push("pageerror:" + String(e).slice(0, 120)));

  await page.route("**/api/v1/**", (r) => {
    const u = r.request().url();
    if (r.request().method() !== "GET") return r.fulfill(fx(null)); // nothing may write
    if (u.includes("/pandit/earnings/summary")) return r.fulfill(fx(SUMMARY));
    if (u.includes("/pandit/payouts") && u.includes("status=PENDING")) return r.fulfill(fx(PENDING));
    if (u.includes("/pandit/payouts") && u.includes("status=PAID")) return r.fulfill(fx(paidRow(paidAt)));
    if (u.includes("/auth/me")) return r.fulfill(fx({ user: { id: "fx", name: "पं. परीक्षण शर्मा", panditProfile: { isOnline: false, verificationStatus: "APPROVED", isBookingReady: true, readinessStep: 5, rejectionReason: null }, milestones: [], unseenMilestones: [] } }));
    return r.fulfill(fx(null));
  });
  await page.route("**/api/tts**", (r) => r.fulfill({ status: 500, body: "" }));

  // page9 recipe: land once (any route), THEN seed storage, THEN go to target
  await page.goto(`${BASE}/home?voicedebug=1`, { waitUntil: "load", timeout: 60000 }).catch(() => {});
  await page.evaluate((seen) => {
    localStorage.setItem("pandit_token", "dummy-qa-token");
    if (seen === "now") localStorage.setItem("lastSeenPaidAt", String(Date.now()));
    else localStorage.removeItem("lastSeenPaidAt");
    localStorage.setItem("tip_seen_earningsPending", "false"); // tip should fire fresh
  }, seenAt);
  await page.goto(`${BASE}/earnings?voicedebug=1`, { waitUntil: "load", timeout: 60000 });
  await page.waitForTimeout(6500); // instant fetches + CountUp 200+1500ms + settle + tip delay 900ms
  await page.screenshot({ path: join(OUT, shot + "-top.png") });
  const res = {};
  res.where = await page.evaluate(() => location.pathname);
  res.tokenStill = await page.evaluate(() => localStorage.getItem("pandit_token"));
  res.state = await page.evaluate(() => {
    const t = document.body.innerText;
    return {
      hero: t.includes("इस महीने की कमाई") && t.includes("12,500"),
      tileToday: t.includes("आज") && t.includes("1,100"),
      tileWeek: t.includes("इस हफ़्ते") && t.includes("4,200"),
      paidSection: t.includes("मिल गया") && t.includes("5,100"),
      paidDate: t.includes("12 जुलाई"),
      pendingHeadingIsSumOfRows: t.includes("8,200"),
      summaryFigureLeaked: t.includes("9,999"),
      pendingRows: t.includes("5,600") && t.includes("2,600"),
      pendingDates: t.includes("18 जुलाई") && t.includes("21 जुलाई"),
      banner: t.includes("आपके खाते में भेज दिए गए"),
      coachTipShown: t.includes("चौबीस घंटे में खाते"),
      raw: t.slice(0, 900),
    };
  });
  res.lastSeenPaidAtAfter = await page.evaluate(() => localStorage.getItem("lastSeenPaidAt"));
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(700);
  await page.screenshot({ path: join(OUT, shot + "-bottom.png") });
  res.controls = await page.evaluate(() =>
    [...document.querySelectorAll("a,button,[role=button]")].map((el) => ({
      tag: el.tagName.toLowerCase(), aria: el.getAttribute("aria-label") || null,
      href: el.getAttribute("href") || null, text: (el.textContent || "").trim().replace(/\s+/g, " ").slice(0, 60),
    }))
  );
  res.narration = await page.evaluate(() =>
    JSON.parse(sessionStorage.getItem("hpj_voicedebug_buf") || "[]").filter((l) => l.includes("speak")).slice(-8)
  );
  res.errs = errs.slice(0, 8);
  out[name] = res;
  await ctx.close();
};

await runLeg("populated", { paidAt: "2026-07-12T10:00:00.000Z", seenAt: "now", shot: "b-populated" });
await runLeg("payoutMoment", { paidAt: new Date().toISOString(), seenAt: "clear", shot: "c-payout-moment" });

writeFileSync(join(OUT, "results-populated.json"), JSON.stringify(out, null, 1));
await browser.close();
console.log("POPULATED RECON COMPLETE", JSON.stringify({
  where: out.populated?.where, conservation: out.populated?.state?.pendingHeadingIsSumOfRows,
  leak: out.populated?.state?.summaryFigureLeaked, banner: out.payoutMoment?.state?.banner,
}));
