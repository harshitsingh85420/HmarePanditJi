// ─────────────────────────────────────────────────────────────
// J1 · THE BOOKING ARC — customer → pandit, under interception.
//
// PROOF TARGET (Isj item 1): after the response-shape fix, does the customer
// actually reach the payment handoff? The decisive fact is whether
// POST /payments/create-order is called with a NON-EMPTY bookingId. Before
// the fix the id was read one level too high, came out undefined, and
// JSON.stringify dropped the key entirely.
//
// MONEY BOUNDARY: Razorpay is never opened, never charged. The checkout
// handoff is asserted at the network layer and the run stops there.
// ─────────────────────────────────────────────────────────────

import { createRequire } from "node:module";
const require_ = createRequire(import.meta.url);
const { chromium } = require_("../../../node_modules/.pnpm/@playwright+test@1.58.2/node_modules/@playwright/test");
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const WEB = "http://localhost:3000";
const SHOTS = join(process.cwd(), "..", "..", "docs", "review", "shots", "j1");
mkdirSync(SHOTS, { recursive: true });

const CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "*",
  "access-control-allow-methods": "GET,POST,PATCH,PUT,DELETE,OPTIONS",
};

// ── the one booking, shared by both actors ──
const BOOKING = {
  id: "bk-qa-j1-001",
  bookingNumber: "HPJ-QA-J1-001",
  status: "PANDIT_REQUESTED",
  eventType: "Satyanarayan Katha",
  pujaType: "Satyanarayan Katha",
  eventDate: "2026-08-09T09:00:00.000Z",
  venueCity: "पुणे",
  venueAddress: "कोथरूड, पुणे",
  dakshinaAmount: 5100,
  grandTotal: 5610, // dakshina + 10% customer-side platform fee, on top
  panditId: "pp-qa-1",
};

const PANDIT = {
  id: "pp-qa-1",
  name: "पं. क्यूए जाँच",
  verificationStatus: "VERIFIED",
  specializations: ["Satyanarayan Katha"],
  pendingPoojaVerifications: [],
  experienceYears: 22,
  location: "पुणे",
  baseDakshina: 5100,
  languages: ["हिंदी"],
  isOnline: true,
  readinessStep: 5,
  isBookingReady: true,
};

const calls = [];
const results = [];
const step = (name, ok, detail) => {
  results.push({ name, ok, detail });
  console.log(`${ok ? "✅" : "❌"} ${name}${detail ? " — " + detail : ""}`);
};

const json = (route, data, message = "ok", status = 200) =>
  route.fulfill({
    status,
    headers: { "content-type": "application/json", ...CORS },
    body: JSON.stringify({ success: true, data, message }),
  });

let createOrderBody = null;

async function routeApi(route) {
  const req = route.request();
  const url = req.url();
  const method = req.method();
  const path = url.replace(/^https?:\/\/[^/]+/, "");
  calls.push(`${method} ${path}`);

  if (method === "OPTIONS") return route.fulfill({ status: 204, headers: CORS, body: "" });

  // ── the contract under test ──
  if (method === "POST" && /\/bookings(\?|$)/.test(path)) {
    // EXACTLY the shape the real handler sends: sendSuccess(res,{booking,order})
    return json(route, { booking: BOOKING, order: { orderId: "order_QA_J1", amount: BOOKING.grandTotal * 100, keyId: "rzp_test_QA" } }, "Booking created", 201);
  }
  if (path.includes("/payments/create-order")) {
    try { createOrderBody = JSON.parse(req.postData() || "{}"); } catch { createOrderBody = {}; }
    if (!createOrderBody.bookingId) {
      return route.fulfill({
        status: 400,
        headers: { "content-type": "application/json", ...CORS },
        body: JSON.stringify({ success: false, message: "bookingId is required" }),
      });
    }
    return json(route, { orderId: "order_QA_J1", amount: BOOKING.grandTotal * 100, currency: "INR", keyId: "rzp_test_QA" }, "Razorpay order created", 201);
  }

  // ── supporting reads ──
  if (path.includes("/pandits") || path.includes("/search")) {
    return json(route, { pandits: [PANDIT], pagination: { total: 1, page: 1, limit: 10, totalPages: 1 } });
  }
  if (path.includes("/auth/me")) {
    return json(route, { user: { id: "u-qa-cust", name: "क्यूए यजमान", phone: "+919999999997", role: "CUSTOMER" } });
  }
  if (path.includes("/rituals")) {
    return json(route, [
      { id: "r1", name: "Satyanarayan Katha", nameHi: "सत्यनारायण कथा", durationHours: 3, basePrice: 5100 },
    ]);
  }
  if (path.includes("/muhurat") || path.includes("/travel")) return json(route, []);
  return json(route, []);
}

const run = async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 390, height: 900 }, deviceScaleFactor: 1 });
  await ctx.addInitScript(() => {
    localStorage.setItem("hpj_token", "qa-customer-token");
    localStorage.setItem("token", "qa-customer-token"); // the key 14 sites wrongly read
  });
  await ctx.route("**/api/v1/**", routeApi);
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e).slice(0, 160)));

  await page.goto(
    `${WEB}/booking/new?panditId=${PANDIT.id}&ritual=Satyanarayan%20Katha&date=2026-08-09`,
    { waitUntil: "domcontentloaded" },
  );
  await page.waitForTimeout(12000);

  // ── walk the wizard, best-effort, recording where it stops ──
  let reached = 0;
  for (let i = 0; i < 10; i++) {
    // fill any empty visible text/number inputs on this step
    // scope OUT the footer: the newsletter box is an input too, and a generic
    // filler happily types a venue address into it and learns nothing.
    const inputs = page.locator("main input:visible, main textarea:visible, form input:visible, form textarea:visible");
    const n = await inputs.count();
    for (let k = 0; k < n; k++) {
      const el = inputs.nth(k);
      const type = (await el.getAttribute("type")) || "text";
      if (["checkbox", "radio", "hidden", "file"].includes(type)) continue;
      const val = await el.inputValue().catch(() => "x");
      if (val) continue;
      const ph = ((await el.getAttribute("placeholder")) || "").toLowerCase();
      const nm = ((await el.getAttribute("name")) || "").toLowerCase();
      const hay = ph + " " + nm;
      if (type === "date") await el.fill("2026-08-09").catch(() => {});
      else if (/pin/.test(hay)) await el.fill("411038").catch(() => {});
      else if (type === "number" || /attend|guest|संख्या/.test(hay)) await el.fill("50").catch(() => {});
      else if (/city|शहर/.test(hay)) await el.fill("Pune").catch(() => {});
      else await el.fill("कोथरूड, पुणे").catch(() => {});
    }
    // choose the first option of any empty select
    const sels = page.locator("select:visible");
    const sn = await sels.count();
    for (let k = 0; k < sn; k++) {
      await sels.nth(k).selectOption({ index: 1 }).catch(() => {});
    }
    await page.waitForTimeout(600);

    const cta = page.locator("button", { hasText: /Continue|Review & Pay|Login & Continue|Pay/ }).first();
    if (!(await cta.count())) break;
    if (await cta.isDisabled().catch(() => true)) {
      // a required choice we could not satisfy generically — that IS the finding
      break;
    }
    await cta.click().catch(() => {});
    reached = i + 1;
    await page.waitForTimeout(2500);
    if (createOrderBody) break;
  }

  await page.screenshot({ path: join(SHOTS, "j1-customer-wizard.png"), fullPage: false });

  const bodyText = (await page.textContent("body")) || "";
  const postedBooking = calls.some((c) => /^POST \/api\/v1\/bookings/.test(c));

  step("wizard advanced under automation", reached > 0, `${reached} step(s) advanced`);
  step("POST /bookings fired", postedBooking, postedBooking ? "booking created" : "never reached submit");
  if (postedBooking) {
    step(
      "THE FIX · create-order received a REAL bookingId",
      !!(createOrderBody && createOrderBody.bookingId),
      createOrderBody ? `bookingId=${JSON.stringify(createOrderBody.bookingId)}` : "create-order never called",
    );
    step(
      "payment handoff reached (no charge fired)",
      !!(createOrderBody && createOrderBody.bookingId),
      "Razorpay order requested in test mode; checkout never opened",
    );
  }
  step("no page errors", errors.length === 0, errors.slice(0, 2).join(" || ") || "clean");

  writeFileSync(join(SHOTS, "j1.json"), JSON.stringify({ results, calls: [...new Set(calls)], createOrderBody, reached }, null, 2));
  console.log("\nAPI calls:\n  " + [...new Set(calls)].join("\n  "));
  await browser.close();
  const failed = results.filter((r) => !r.ok);
  console.log(`\nJ1 CUSTOMER LEG: ${results.length - failed.length}/${results.length} checks passed`);
};

run().catch((e) => {
  console.error("HARNESS ERROR:", e);
  process.exit(2);
});
