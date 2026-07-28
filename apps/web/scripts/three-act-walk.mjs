// ─────────────────────────────────────────────────────────────
// THE THREE-ACT WALK — one booking, three roles, three surfaces.
//
// ONE in-memory booking is shared by all three app contexts, so what the
// customer creates is literally what the pandit sees and what ops sees. The
// fixture speaks the REAL server shapes, verified in source this session:
//   POST /bookings            → sendSuccess(res, { booking, order })
//   POST /bookings/:id/accept → sendSuccess(res, { booking })
//   GET  /bookings/:id        → sendSuccess(res, { booking })
//   POST /payments/create-order → sendSuccess(res, order)   [flat]
//
// BOUNDARIES: Razorpay test-mode identifiers only, checkout never opened, no
// charge, no SMS, no KYC. क्यूए probe naming throughout.
// ─────────────────────────────────────────────────────────────

import { createRequire } from "node:module";
const require_ = createRequire(import.meta.url);
const { chromium } = require_("../../../node_modules/.pnpm/@playwright+test@1.58.2/node_modules/@playwright/test");
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const WEB = "http://localhost:3000";
const PANDIT = "http://localhost:3002";
const ADMIN = "http://localhost:3003";
const SHOTS = join(process.cwd(), "..", "..", "docs", "review", "shots", "three-act");
mkdirSync(SHOTS, { recursive: true });

const CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "*",
  "access-control-allow-methods": "GET,POST,PATCH,PUT,DELETE,OPTIONS",
};

const DAKSHINA = 5100;
const FEE_PCT = 10; // Ruling B: charged to the CUSTOMER, on top. Pandit keeps 100%.
const FEE = Math.round(DAKSHINA * FEE_PCT / 100);

const PANDIT_REC = {
  id: "pp-qa-walk",
  userId: "u-qa-pandit",
  name: "पं. क्यूए जाँच",
  displayName: "पं. क्यूए जाँच",
  fullName: "पं. क्यूए जाँच",
  verificationStatus: "VERIFIED",
  specializations: ["Satyanarayan Katha"],
  pendingPoojaVerifications: [],
  experienceYears: 22,
  location: "पुणे",
  city: "पुणे",
  baseDakshina: DAKSHINA,
  languages: ["हिंदी"],
  isOnline: true,
  readinessStep: 5,
  isBookingReady: true,
  user: { id: "u-qa-pandit", name: "पं. क्यूए जाँच", phone: "+919999999998" },
};

const CUSTOMER = { id: "u-qa-cust", name: "क्यूए यजमान", phone: "+919999999997", email: null, role: "CUSTOMER" };

// THE ONE BOOKING — mutated by the walk, read by all three apps.
let BOOKING = null;
const timeline = [];
const stamp = (label) => {
  const t = new Date().toISOString().slice(11, 19);
  timeline.push(`${t}  ${label}`);
  console.log(`   ⏱ ${t}  ${label}`);
  return t;
};

const calls = [];
const notes = [];
const results = [];
const step = (n, ok, d) => { results.push({ n, ok, d }); console.log(`${ok ? "✅" : "❌"} ${n}${d ? " — " + d : ""}`); };

const ok = (route, data, message = "ok", status = 200) =>
  route.fulfill({ status, headers: { "content-type": "application/json", ...CORS }, body: JSON.stringify({ success: true, data, message }) });

function makeBooking(body) {
  const now = new Date().toISOString();
  return {
    id: "bk-qa-walk-1",
    bookingNumber: "HPJ-QA-WALK-1",
    status: "PANDIT_REQUESTED",
    paymentStatus: "CAPTURED",
    eventType: "Satyanarayan Katha",
    pujaType: "Satyanarayan Katha",
    eventDate: body?.eventDate || "2026-08-09T09:00:00.000Z",
    eventEndDate: null,
    muhuratTime: body?.muhuratTime || null,
    venueAddress: body?.venueLine1 || "कोथरूड, पुणे",
    venueCity: body?.venueCity || "Pune",
    venuePincode: body?.venuePincode || "411038",
    attendees: body?.attendees ?? 50,
    specialInstructions: body?.specialInstructions || "",
    dakshinaAmount: DAKSHINA,
    platformFee: FEE,
    platformFeePercent: FEE_PCT,   // the snapshot invariant, frozen at creation
    platformFeeGst: 0,             // fee is GST-inclusive; never on the dakshina
    travelCost: 0, travelServiceFee: 0, travelServiceFeeGst: 0,
    foodAllowanceAmount: 0, accommodationCost: 0, samagriAmount: 0,
    travelRequired: false, travelMode: null, travelDistanceKm: null,
    travelStatus: "NOT_REQUIRED", travelBookingRef: null, travelNotes: null,
    foodArrangement: "CUSTOMER_PROVIDES", samagriPreference: "CUSTOMER_ARRANGES",
    grandTotal: DAKSHINA + FEE,    // customer pays dakshina + fee ON TOP
    panditPayout: DAKSHINA,        // pandit keeps 100% — no deduction
    payoutStatus: "PENDING",
    refundAmount: 0, refundStatus: "NONE",
    cancelledBy: null, cancellationReason: null,
    adminNotes: "", createdAt: now,
    customer: CUSTOMER,
    pandit: PANDIT_REC,
    panditId: PANDIT_REC.id,
    ritual: { name: "Satyanarayan Katha", nameHindi: "सत्यनारायण कथा" },
  };
}

async function router(route) {
  const req = route.request();
  const path = req.url().replace(/^https?:\/\/[^/]+/, "");
  const method = req.method();
  calls.push(`${method} ${path.split("?")[0]}`);
  if (method === "OPTIONS") return route.fulfill({ status: 204, headers: CORS, body: "" });

  let body = {};
  try { body = JSON.parse(req.postData() || "{}"); } catch { }

  // ── ACT 1: the customer creates the booking ──
  if (method === "POST" && /\/bookings$/.test(path.split("?")[0])) {
    BOOKING = makeBooking(body);
    stamp("BOOKING CREATED (customer)");
    return ok(route, { booking: BOOKING, order: { orderId: "order_QA_TESTMODE", amount: BOOKING.grandTotal * 100, keyId: "rzp_test_QA" } }, "Booking created", 201);
  }
  if (path.includes("/payments/create-order")) {
    if (!body.bookingId) {
      return route.fulfill({ status: 400, headers: { "content-type": "application/json", ...CORS }, body: JSON.stringify({ success: false, message: "bookingId is required" }) });
    }
    stamp(`PAYMENT ORDER REQUESTED for ${body.bookingId} (test mode, never charged)`);
    return ok(route, { orderId: "order_QA_TESTMODE", amount: (BOOKING?.grandTotal ?? 0) * 100, currency: "INR", keyId: "rzp_test_QA" }, "Razorpay order created", 201);
  }

  // ── ACT 2: the pandit accepts ──
  if (/\/bookings\/[^/]+\/accept$/.test(path)) {
    if (BOOKING) { BOOKING.status = "CONFIRMED"; stamp("PANDIT ACCEPTED → status CONFIRMED"); }
    return ok(route, { booking: BOOKING }, "Booking accepted");
  }
  if (path.includes("/pandit/bookings")) {
    // the pandit's own list — only what exists
    return ok(route, BOOKING ? [BOOKING] : []);
  }
  if (path.includes("/pandit/stats")) return ok(route, { rating: null, completedBookings: 0, totalReviews: 0 });
  if (path.includes("/pandit/earnings")) {
    return ok(route, { thisMonth: BOOKING?.panditPayout ?? 0, pending: BOOKING?.panditPayout ?? 0, lifetime: 0 });
  }
  if (path.includes("/pandit/profile") || path.includes("/pandit/readiness")) return ok(route, PANDIT_REC);

  // ── shared reads ──
  if (/\/bookings\/[^/]+$/.test(path.split("?")[0])) return ok(route, { booking: BOOKING }, "Booking detail");
  if (path.includes("/admin/bookings")) return ok(route, BOOKING ? [BOOKING] : [], "Success");
  if (path.includes("/admin/dashboard-stats")) return ok(route, { todaysBookings: BOOKING ? 1 : 0, pendingVerifications: 0, pendingPayouts: BOOKING ? 1 : 0 });
  if (path.includes("/auth/me")) {
    const isPandit = req.url().includes(":3002");
    return ok(route, { user: isPandit ? { id: PANDIT_REC.userId, name: PANDIT_REC.name, phone: "+919999999998", role: "PANDIT", panditProfile: PANDIT_REC } : CUSTOMER, milestones: [], unseenMilestones: [] });
  }
  if (path.includes("/customers/me")) return ok(route, { id: "cp-qa", userId: CUSTOMER.id, user: CUSTOMER, addresses: [] });
  if (path.includes("/rituals")) return ok(route, [{ id: "r1", name: "Satyanarayan Katha", nameHindi: "सत्यनारायण कथा", durationHours: 3, basePrice: DAKSHINA }]);
  if (path.includes("/pandits") || path.includes("/search")) return ok(route, { pandits: [PANDIT_REC], pagination: { total: 1, page: 1, limit: 10, totalPages: 1 } });
  if (path.includes("/muhurat")) {
    // WHAT MUHURAT IS THE CUSTOMER SHOWN? The API reads a seeded table. This
    // fixture returns EMPTY deliberately: we are recording what the product
    // does, and inventing muhurats here would hide the very defect under audit.
    notes.push("muhurat endpoint called; fixture returned empty (prod seed unverifiable — credentials rotated)");
    return ok(route, { dates: [] });
  }
  if (path.includes("/tts") || path.includes("/stt") || path.includes("/voice")) {
    return route.fulfill({ status: 500, headers: CORS, body: "{}" });
  }
  return ok(route, []);
}

const shot = async (page, name) => {
  const p = join(SHOTS, `${name}.png`);
  await page.screenshot({ path: p, fullPage: false });
  return p;
};

const run = async () => {
  const browser = await chromium.launch({ headless: true, args: ["--autoplay-policy=no-user-gesture-required"] });

  // ══ ACT 1 — THE CUSTOMER ══
  const cCtx = await browser.newContext({ viewport: { width: 390, height: 860 }, deviceScaleFactor: 1 });
  await cCtx.addInitScript(() => { localStorage.setItem("hpj_token", "qa-cust"); });
  await cCtx.route("**/api/v1/**", router);
  const cust = await cCtx.newPage();
  const cErr = [];
  cust.on("pageerror", (e) => cErr.push(String(e).slice(0, 140)));

  await cust.goto(`${WEB}/booking/new?panditId=${PANDIT_REC.id}&ritual=Satyanarayan%20Katha`, { waitUntil: "domcontentloaded" });
  await cust.waitForTimeout(13000);

  // ── PURPOSE-BUILT STEP 0 DRIVER — by field, not generically ──
  const main = cust.locator("main");
  await main.locator("select").first().selectOption({ index: 1 }).catch(() => { });
  await main.locator('input[type="date"]').first().fill("2026-08-09").catch(() => { });
  const byLabel = async (label, value) => {
    const box = main.locator(`xpath=//label[contains(., ${JSON.stringify(label)})]/following::input[1]`).first();
    if (await box.count()) await box.fill(value).catch(() => { });
  };
  await byLabel("Venue Address", "कोथरूड, पुणे");
  await byLabel("City", "Pune");
  await byLabel("Pincode", "411038");
  await byLabel("Attendees", "50");
  await byLabel("Guests", "50");
  await cust.waitForTimeout(800);
  const beforeCommit = await shot(cust, "act1-01-before-committing");
  const step0Text = (await cust.textContent("main")) || "";

  // advance as far as the wizard allows
  let advanced = 0;
  for (let i = 0; i < 8; i++) {
    const cta = cust.locator("main button", { hasText: /Continue|Review & Pay|Login & Continue|Pay Now|Confirm/ }).first();
    if (!(await cta.count())) break;
    if (await cta.isDisabled().catch(() => true)) break;
    await cta.click().catch(() => { });
    advanced++;
    await cust.waitForTimeout(2200);
    // fill whatever the new step requires, by type
    const empties = main.locator("input:visible");
    const n = await empties.count();
    for (let k = 0; k < n; k++) {
      const el = empties.nth(k);
      const t = (await el.getAttribute("type")) || "text";
      if (["checkbox", "radio", "file", "hidden"].includes(t)) continue;
      if (await el.inputValue().catch(() => "x")) continue;
      await el.fill(t === "number" ? "1" : t === "date" ? "2026-08-09" : "क्यूए").catch(() => { });
    }
    const sels = main.locator("select:visible");
    const sn = await sels.count();
    for (let k = 0; k < sn; k++) await sels.nth(k).selectOption({ index: 1 }).catch(() => { });

    // Some steps are chosen with BUTTON CARDS, not inputs — ritual variation,
    // samagri mode, food/stay. A field-filler alone never satisfies them and
    // the wizard silently keeps Continue disabled. Pick the first real choice.
    const cta2 = main.locator("button", { hasText: /Continue|Review & Pay|Login & Continue|Pay Now|Confirm/ }).first();
    if ((await cta2.count()) && (await cta2.isDisabled().catch(() => true))) {
      const choices = main.locator("button:visible");
      const cn = await choices.count();
      for (let k = 0; k < cn; k++) {
        const b = choices.nth(k);
        const label = ((await b.textContent().catch(() => "")) || "").trim();
        if (!label) continue;
        if (/Back|Continue|Review & Pay|Login|Pay Now|Confirm|Add from Contacts/i.test(label)) continue;
        await b.click().catch(() => { });
        await cust.waitForTimeout(500);
        if (!(await cta2.isDisabled().catch(() => true))) break;
      }
    }
    if (BOOKING) break;
  }

  step("ACT 1 · step 0 accepted the purpose-built fill", advanced > 0, `${advanced} step(s) advanced`);
  step("ACT 1 · the booking was created", !!BOOKING, BOOKING ? BOOKING.bookingNumber : "wizard never reached submit — THIS HOP IS DEAD, act stops here");

  const t1 = stamp("T1 · instant after the customer pays");
  const custAfter = await shot(cust, "act1-02-T1-after-pay");
  const custText = (await cust.textContent("body")) || "";

  // ══ ACT 2 — THE PANDIT ══
  const pCtx = await browser.newContext({ viewport: { width: 390, height: 860 }, deviceScaleFactor: 1 });
  await pCtx.addCookies([{ name: "hpj_token", value: "qa-pandit", url: PANDIT }]);
  await pCtx.addInitScript(() => { localStorage.setItem("pandit_token", "qa-pandit"); localStorage.setItem("hpj_lang", "hi"); });
  await pCtx.route("**/api/v1/**", router);
  await pCtx.route("**/api/tts**", (r) => r.fulfill({ status: 500, body: "{}" }));
  const pandit = await pCtx.newPage();
  const pErr = [];
  pandit.on("pageerror", (e) => pErr.push(String(e).slice(0, 140)));

  // arrive COLD, the way he would — no seeding, no deep link
  await pandit.goto(`${PANDIT}/home`, { waitUntil: "domcontentloaded" });
  await pandit.waitForTimeout(9000);
  const panditHomeT1 = await shot(pandit, "act2-01-T1-pandit-home");
  const panditHomeText = (await pandit.textContent("body")) || "";

  await pandit.goto(`${PANDIT}/bookings`, { waitUntil: "domcontentloaded" });
  await pandit.waitForTimeout(7000);
  const panditListText = (await pandit.textContent("body")) || "";
  await shot(pandit, "act2-02-booking-list");
  step("ACT 2 · नई विनती is visible on his bookings screen", /विनती|नई|क्यूए|सत्यनारायण/.test(panditListText), "arrived cold, no seeding");

  // he accepts
  const acceptBtn = pandit.locator("button", { hasText: /स्वीकार|स्वीकृत|Accept/ }).first();
  let accepted = false;
  if (await acceptBtn.count()) {
    await acceptBtn.click().catch(() => { });
    await pandit.waitForTimeout(3000);
    accepted = BOOKING?.status === "CONFIRMED";
  }
  const t2 = stamp("T2 · instant after the pandit accepts");
  const panditAfter = await shot(pandit, "act2-03-T2-after-accept");
  step("ACT 2 · accept moved the booking to CONFIRMED", accepted, BOOKING ? `status=${BOOKING.status}` : "no booking");

  // is booking detail reachable at last?
  let detailReachable = false;
  if (BOOKING) {
    await pandit.goto(`${PANDIT}/bookings/${BOOKING.id}`, { waitUntil: "domcontentloaded" });
    await pandit.waitForTimeout(6000);
    const dt = (await pandit.textContent("body")) || "";
    detailReachable = /सत्यनारायण|कोथरूड|क्यूए/.test(dt);
    await shot(pandit, "act2-04-booking-detail");
  }
  step("ACT 2 · booking detail is REACHABLE (the traversal gap)", detailReachable, detailReachable ? "opened" : "still unreachable");

  // ══ ACT 3 — OPS ══
  const aCtx = await browser.newContext({ viewport: { width: 1280, height: 860 }, deviceScaleFactor: 1 });
  await aCtx.addInitScript(() => localStorage.setItem("hpj_admin_token", "qa-admin"));
  await aCtx.route("**/api/v1/**", router);
  const admin = await aCtx.newPage();
  const aErr = [];
  admin.on("pageerror", (e) => aErr.push(String(e).slice(0, 140)));
  await admin.goto(`${ADMIN}/bookings`, { waitUntil: "domcontentloaded" });
  await admin.waitForTimeout(9000);
  const adminListText = (await admin.textContent("body")) || "";
  await shot(admin, "act3-01-admin-list");
  step("ACT 3 · the booking appears in admin", /HPJ-QA-WALK|क्यूए|Satyanarayan/.test(adminListText), "ops list");

  if (BOOKING) {
    await admin.goto(`${ADMIN}/bookings/${BOOKING.id}`, { waitUntil: "domcontentloaded" });
    await admin.waitForTimeout(8000);
  }
  const t3 = stamp("T3 · after the ceremony, at payout time");
  const adminAfter = await shot(admin, "act3-02-T3-admin-detail");
  const adminText = (await admin.textContent("body")) || "";
  step("ACT 3 · ops sees both sides and the money", /क्यूए यजमान|यजमान|Customer/.test(adminText) && /5,?100|5,?610/.test(adminText), "customer + pandit + figures");

  // conservation, from the booking the three apps shared
  if (BOOKING) {
    const conserves = BOOKING.grandTotal - BOOKING.panditPayout === BOOKING.platformFee;
    step(
      "ACT 3 · payout arithmetic conserves (Ruling B)",
      conserves,
      `customer ₹${BOOKING.grandTotal} − pandit ₹${BOOKING.panditPayout} = fee ₹${BOOKING.platformFee}`,
    );
  }

  // ══ THE COMPOSITES — same moment, three surfaces, one frame ══
  const composite = async (title, files, out) => {
    const page = await browser.newPage({ viewport: { width: 1500, height: 1000 } });
    const imgs = files.map((f) => `<figure><figcaption>${f.cap}</figcaption><img src="file:///${f.path.replace(/\\/g, "/")}"></figure>`).join("");
    await page.setContent(`<html><body style="margin:0;background:#241A12;font-family:system-ui;padding:18px">
      <h1 style="color:#FBF6EE;font-size:20px;margin:0 0 14px">${title}</h1>
      <div style="display:flex;gap:14px;align-items:flex-start">${imgs}</div>
      <style>figure{margin:0;flex:1}figcaption{color:#D8B183;font-size:13px;font-weight:600;margin-bottom:6px}
      img{width:100%;border:1px solid #6B5B48;border-radius:6px;background:#fff}</style></body></html>`);
    await page.waitForTimeout(1200);
    await page.screenshot({ path: join(SHOTS, out), fullPage: true });
    await page.close();
    console.log(`   🖼  ${out}`);
  };

  await composite(`T1 · ${t1} — the instant after the customer pays`,
    [{ cap: "CUSTOMER", path: custAfter }, { cap: "PANDIT (arrived cold)", path: panditHomeT1 }, { cap: "OPS / ADMIN", path: adminAfter }],
    "T1-composite.png");
  await composite(`T2 · ${t2} — the instant after the pandit accepts`,
    [{ cap: "CUSTOMER", path: custAfter }, { cap: "PANDIT", path: panditAfter }, { cap: "OPS / ADMIN", path: adminAfter }],
    "T2-composite.png");
  await composite(`T3 · ${t3} — after the ceremony, at payout time`,
    [{ cap: "CUSTOMER", path: custAfter }, { cap: "PANDIT", path: panditAfter }, { cap: "OPS / ADMIN", path: adminAfter }],
    "T3-composite.png");

  // ── evidence for the narration ──
  const evidence = {
    booking: BOOKING,
    money: BOOKING ? { dakshina: BOOKING.dakshinaAmount, feePct: BOOKING.platformFeePercent, fee: BOOKING.platformFee, customerPays: BOOKING.grandTotal, panditGets: BOOKING.panditPayout } : null,
    customerSeesAfterPay: custText.slice(0, 1500),
    customerMentionsPanditName: /क्यूए जाँच/.test(custText),
    customerHasTelLink: /tel:/.test(await cust.content()),
    customerTelUndefined: /tel:undefined/.test(await cust.content()),
    customerMentionsAwaiting: /(प्रतीक्षा|awaiting|pending|स्वीकार)/i.test(custText),
    muhuratShownAtCommit: /muhurat|मुहूर्त/i.test(step0Text),
    panditHomeMentionsBooking: /विनती|नई बुकिंग|सत्यनारायण/.test(panditHomeText),
    timeline, calls: [...new Set(calls)], notes,
    errors: { customer: cErr, pandit: pErr, admin: aErr },
    results,
  };
  writeFileSync(join(SHOTS, "three-act.json"), JSON.stringify(evidence, null, 2));

  console.log("\n── TIMELINE ──\n" + timeline.join("\n"));
  console.log("\n── MONEY ──\n" + JSON.stringify(evidence.money));
  console.log("\n── ERRORS ──\n" + JSON.stringify(evidence.errors));
  await browser.close();
  const failed = results.filter((r) => !r.ok);
  console.log(`\nTHREE-ACT WALK: ${results.length - failed.length}/${results.length} checks passed`);
};

run().catch((e) => { console.error("HARNESS ERROR:", e); process.exit(2); });
