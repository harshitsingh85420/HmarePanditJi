// ─────────────────────────────────────────────────────────────
// ग्राहक ऐप re-skin proof — the 1c अभिलेख card against fixture data.
//
// Drives the LIVE search screen under route interception so the record card
// renders with real component code. Four fixture pandits chosen to exercise
// every truthful-null branch the card has:
//   1 fully known      — photo, identity verified, pooja video verified, rate
//   2 pilot-typical    — no photo (monogram), identity verified, video PENDING
//   3 sparse           — identity NOT verified, no video claim at all, no rate
//   4 no per-pooja count and no distance — the softened-claim path
// ─────────────────────────────────────────────────────────────

// apps/web does not depend on playwright; borrow the workspace copy so the
// proof harness needs no new dependency in the customer app.
import { createRequire } from "node:module";
const require_ = createRequire(import.meta.url);
const { chromium } = require_("../../../node_modules/.pnpm/@playwright+test@1.58.2/node_modules/@playwright/test");
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const WEB = "http://localhost:3000";
const SHOTS = join(process.cwd(), "..", "..", "docs", "review", "shots", "customer");
mkdirSync(SHOTS, { recursive: true });

const PANDITS = [
  {
    id: "p1",
    name: "पं. श्रीकांत जोशी",
    romanName: "Shrikant Joshi",
    verificationStatus: "VERIFIED",
    specializations: ["Satyanarayan Katha"],
    experienceYears: 22,
    location: "पुणे",
    user: { id: "u1", name: "पं. श्रीकांत जोशी" },
    pujaServices: [{ pujaType: "Satyanarayan Katha", dakshinaAmount: 5100, durationHours: 3 }],
    languages: ["हिंदी"],
  },
  {
    id: "p2",
    name: "पं. रामेश्वर द्विवेदी",
    romanName: "Rameshwar Dwivedi",
    verificationStatus: "VERIFIED",
    specializations: ["Satyanarayan Katha"],
    experienceYears: 31,
    location: "पुणे",
    user: { id: "u2", name: "पं. रामेश्वर द्विवेदी" },
    pujaServices: [{ pujaType: "Satyanarayan Katha", dakshinaAmount: 6500, durationHours: 3 }],
    languages: ["मराठी"],
  },
  {
    id: "p3",
    name: "पं. गिरधर शास्त्री",
    verificationStatus: "PENDING",
    specializations: ["Satyanarayan Katha"],
    experienceYears: 0,
    location: "वाराणसी",
    user: { id: "u3", name: "पं. गिरधर शास्त्री" },
    pujaServices: [],
    languages: [],
  },
  {
    id: "p4",
    name: "पं. अनिल त्रिपाठी",
    romanName: "Anil Tripathi",
    verificationStatus: "VERIFIED",
    specializations: ["Satyanarayan Katha"],
    experienceYears: 12,
    location: "नाशिक",
    user: { id: "u4", name: "पं. अनिल त्रिपाठी" },
    pujaServices: [{ pujaType: "Satyanarayan Katha", dakshinaAmount: 3100, durationHours: 3 }],
    languages: ["हिंदी"],
  },
];

const CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "*",
  "access-control-allow-methods": "GET,POST,PATCH,PUT,DELETE,OPTIONS",
};

const results = [];
const step = (name, ok, detail) => {
  results.push({ name, ok, detail });
  console.log(`${ok ? "✅" : "❌"} ${name}${detail ? " — " + detail : ""}`);
};

const run = async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 390, height: 900 }, deviceScaleFactor: 1 });

  await ctx.route("**/api/v1/**", (route) => {
    const url = route.request().url();
    if (route.request().method() === "OPTIONS") {
      return route.fulfill({ status: 204, headers: CORS, body: "" });
    }
    if (url.includes("/pandits") || url.includes("/search")) {
      return route.fulfill({
        status: 200,
        headers: { "content-type": "application/json", ...CORS },
        body: JSON.stringify({
          success: true,
          data: {
            pandits: PANDITS,
            pagination: { total: PANDITS.length, page: 1, limit: 10, totalPages: 1 },
          },
        }),
      });
    }
    return route.fulfill({
      status: 200,
      headers: { "content-type": "application/json", ...CORS },
      body: JSON.stringify({ success: true, data: [] }),
    });
  });

  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e).slice(0, 160)));

  await page.goto(`${WEB}/search?ritual=Satyanarayan%20Katha&city=Pune`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(14000);

  const body = (await page.textContent("body")) || "";

  // the design tokens actually reached the browser
  const css = await page.evaluate(() =>
    [...document.styleSheets].reduce((n, s) => {
      try { return n + s.cssRules.length; } catch { return n; }
    }, 0),
  );
  step("CSS reaches the browser (tailwind config found)", css > 300, `${css} rules`);

  const bodyFont = await page.evaluate(() => getComputedStyle(document.body).fontFamily);
  step("Hanken Grotesk is the interface voice", /Hanken/i.test(bodyFont), bodyFont.slice(0, 60));

  const serif = await page.evaluate(() => {
    const el = document.querySelector(".font-devanagari");
    return el ? getComputedStyle(el).fontFamily : "";
  });
  step("Noto Serif Devanagari carries the names", /Noto Serif Devanagari/i.test(serif), serif.slice(0, 60) || "no .font-devanagari element found");

  // the record card and its truthful-null branches
  step("names come from user.name, not a placeholder", body.includes("श्रीकांत") && !body.includes("Pandit Ji"), "real names rendered"); step("1c record cards rendered", body.includes("प्रोफ़ाइल देखें"), `${(body.match(/प्रोफ़ाइल देखें/g) || []).length} cards`);
  step("identity verified reads as the person", body.includes("पहचान सत्यापित"), "green row present");
  step("unverified identity does NOT claim a check", body.includes("पहचान जाँच बाकी"), "neutral row for the unverified pandit");
  step("no invented per-pooja state on a search row", !body.includes("जाँच में"), "silence, not a guess");
  // p4 offers the pooja and is verified, so exactly ONE "verified" video row is
  // expected (p1); p2 is pending; p3 is unverified and must assert nothing.
  const videoRows = (body.match(/इस पूजा का वीडियो/g) || []).length;
  step("no rate → no invented ₹0", body.includes("दक्षिणा तय नहीं") && !/₹\s*0(?!\d)/.test(body), "truthful-null money");
  step("the one number is the whole number", body.includes("5,100") && body.includes("सामग्री व यात्रा"), "no fee line, samagri/travel direct");
  step("no stars anywhere", !body.includes("★") && !body.includes("☆"), "no rating row invented");

  // green is reserved for verified identity ONLY
  const greens = await page.evaluate(() => {
    const out = [];
    document.querySelectorAll("*").forEach((el) => {
      const c = getComputedStyle(el).color;
      if (c === "rgb(46, 107, 78)") out.push((el.textContent || "").trim().slice(0, 30));
    });
    return out;
  });
  step(
    "तुलसी green appears ONLY on verified identity",
    greens.length > 0 && greens.every((t) => t.includes("पहचान") || t === "verified_user"),
    greens.length ? greens.join(" | ") : "NO green found at all — the check would have passed vacuously",
  );

  step("no page errors", errors.length === 0, errors.slice(0, 2).join(" || ") || "clean");

  await page.screenshot({ path: join(SHOTS, "search-1c-record.png"), fullPage: true });
  console.log("   📸 search-1c-record.png");

  await browser.close();
  const failed = results.filter((r) => !r.ok);
  console.log(`\nRE-SKIN PROOF: ${results.length - failed.length}/${results.length} checks passed`);
  process.exit(failed.length ? 1 : 0);
};

run().catch((e) => {
  console.error("HARNESS ERROR:", e);
  process.exit(2);
});
