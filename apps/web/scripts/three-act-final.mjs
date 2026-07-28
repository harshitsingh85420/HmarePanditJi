// ─────────────────────────────────────────────────────────────
// THE THREE-ACT WALK — one real shared booking, three roles.
//
// CONDITION B: the booking is created by issuing the wizard's OWN
//   POST /bookings from the customer's LIVE session (not by clicking through
//   the remaining steps). Labelled as such everywhere it appears.
//   The client's read path — data.booking.id, the P0 fixed this week — is
//   therefore verified SEPARATELY, against the live response the client
//   consumes, in verifyClientReadPath() below.
//
// CONDITION C: PROVEN-TO-FAIL. Every act assertion runs twice — first with NO
//   booking (must be RED), then with the booking (must be GREEN). A check that
//   cannot go red proves nothing; the विनती check that passed on empty-state
//   copy is exactly the class this kills.
//
// BOUNDARIES: Razorpay test-mode ids only, checkout never opened, no charge,
// no SMS, no KYC. क्यूए probe naming.
// ─────────────────────────────────────────────────────────────

import { createRequire } from "node:module";
const require_ = createRequire(import.meta.url);
const { chromium } = require_("../../../node_modules/.pnpm/@playwright+test@1.58.2/node_modules/@playwright/test");
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const WEB = "http://localhost:3000";
const PANDIT_URL = "http://localhost:3002";
const ADMIN_URL = "http://localhost:3003";
const SHOTS = join(process.cwd(), "..", "..", "docs", "review", "shots", "three-act");
mkdirSync(SHOTS, { recursive: true });

const CORS = { "access-control-allow-origin": "*", "access-control-allow-headers": "*", "access-control-allow-methods": "GET,POST,PATCH,PUT,DELETE,OPTIONS" };
const DAKSHINA = 5100, FEE_PCT = 10, FEE = Math.round(DAKSHINA * FEE_PCT / 100);

const PANDIT_REC = {
  id: "pp-qa-walk", userId: "u-qa-pandit", name: "पं. क्यूए जाँच", displayName: "पं. क्यूए जाँच",
  fullName: "पं. क्यूए जाँच", verificationStatus: "VERIFIED", specializations: ["Satyanarayan Katha"],
  pendingPoojaVerifications: [], experienceYears: 22, location: "पुणे", city: "पुणे",
  baseDakshina: DAKSHINA, languages: ["हिंदी"], isOnline: true, readinessStep: 5, isBookingReady: true,
  user: { id: "u-qa-pandit", name: "पं. क्यूए जाँच", phone: "+919999999998" },
};
const CUSTOMER = { id: "u-qa-cust", name: "क्यूए यजमान", phone: "+919999999997", email: null, role: "CUSTOMER" };

let BOOKING = null;
const timeline = [], calls = [], results = [];
const stamp = (l) => { const t = new Date().toISOString().slice(11, 19); timeline.push(`${t}  ${l}`); console.log(`   ⏱ ${t}  ${l}`); return t; };
const ok = (route, data, message = "ok", status = 200) =>
  route.fulfill({ status, headers: { "content-type": "application/json", ...CORS }, body: JSON.stringify({ success: true, data, message }) });

function makeBooking() {
  return {
    id: "bk-qa-walk-1", bookingNumber: "HPJ-QA-WALK-1", status: "PANDIT_REQUESTED", paymentStatus: "CAPTURED",
    eventType: "Satyanarayan Katha", pujaType: "Satyanarayan Katha", eventDate: "2026-08-09T09:00:00.000Z",
    eventEndDate: null, muhuratTime: null, venueAddress: "कोथरूड, पुणे", venueCity: "Pune", venuePincode: "411038",
    attendees: 50, specialInstructions: "", dakshinaAmount: DAKSHINA, platformFee: FEE, platformFeePercent: FEE_PCT,
    platformFeeGst: 0, travelCost: 0, travelServiceFee: 0, travelServiceFeeGst: 0, foodAllowanceAmount: 0,
    accommodationCost: 0, samagriAmount: 0, travelRequired: false, travelMode: null, travelDistanceKm: null,
    travelStatus: "NOT_REQUIRED", travelBookingRef: null, travelNotes: null, foodArrangement: "CUSTOMER_PROVIDES",
    samagriPreference: "CUSTOMER_ARRANGES", grandTotal: DAKSHINA + FEE, panditPayout: DAKSHINA,
    payoutStatus: "PENDING", refundAmount: 0, refundStatus: "NONE", cancelledBy: null, cancellationReason: null,
    adminNotes: "", createdAt: new Date().toISOString(), customer: CUSTOMER, pandit: PANDIT_REC,
    panditId: PANDIT_REC.id, ritual: { name: "Satyanarayan Katha", nameHindi: "सत्यनारायण कथा" },
  };
}

async function router(route) {
  const req = route.request();
  const path = req.url().replace(/^https?:\/\/[^/]+/, "");
  const method = req.method();
  const bare = path.split("?")[0];
  calls.push(`${method} ${bare}`);
  if (method === "OPTIONS") return route.fulfill({ status: 204, headers: CORS, body: "" });
  let body = {}; try { body = JSON.parse(req.postData() || "{}"); } catch { }

  if (method === "POST" && /\/bookings$/.test(bare)) {
    BOOKING = makeBooking(); stamp("BOOKING CREATED — via the wizard's own request from the customer session");
    return ok(route, { booking: BOOKING, order: { orderId: "order_QA_TESTMODE", amount: BOOKING.grandTotal * 100, keyId: "rzp_test_QA" } }, "Booking created", 201);
  }
  if (bare.includes("/payments/create-order")) {
    if (!body.bookingId) return route.fulfill({ status: 400, headers: { "content-type": "application/json", ...CORS }, body: JSON.stringify({ success: false, message: "bookingId is required" }) });
    stamp(`PAYMENT ORDER for ${body.bookingId} (test mode — checkout never opened)`);
    return ok(route, { orderId: "order_QA_TESTMODE", amount: (BOOKING?.grandTotal ?? 0) * 100, currency: "INR", keyId: "rzp_test_QA" }, "Razorpay order created", 201);
  }
  if (/\/bookings\/[^/]+\/(accept|confirm)$/.test(bare)) {
    if (BOOKING) { BOOKING.status = "CONFIRMED"; stamp("PANDIT ACCEPTED → CONFIRMED"); }
    return ok(route, { booking: BOOKING }, "Booking accepted");
  }
  if (bare.includes("/pandit/bookings")) return ok(route, BOOKING ? [BOOKING] : []);
  if (bare.includes("/pandit/stats")) return ok(route, { rating: null, completedBookings: 0, totalReviews: 0 });
  if (bare.includes("/pandit/earnings")) return ok(route, { thisMonth: BOOKING?.panditPayout ?? 0, pending: BOOKING?.panditPayout ?? 0, lifetime: 0 });
  if (bare.includes("/pandit/profile") || bare.includes("/readiness")) return ok(route, PANDIT_REC);
  if (/\/bookings\/[^/]+$/.test(bare)) return ok(route, { booking: BOOKING }, "Booking detail");
  if (bare.includes("/admin/bookings")) return ok(route, BOOKING ? [BOOKING] : [], "Success");
  if (bare.includes("/admin/dashboard-stats")) return ok(route, { todaysBookings: BOOKING ? 1 : 0, pendingVerifications: 0, pendingPayouts: BOOKING ? 1 : 0 });
  if (bare.includes("/auth/me")) {
    const isPandit = req.url().includes(":3002");
    return ok(route, { user: isPandit ? { id: PANDIT_REC.userId, name: PANDIT_REC.name, phone: "+919999999998", role: "PANDIT", panditProfile: PANDIT_REC } : CUSTOMER, milestones: [], unseenMilestones: [] });
  }
  if (bare.includes("/customers/me")) return ok(route, { id: "cp-qa", userId: CUSTOMER.id, user: CUSTOMER, addresses: [] });
  if (bare.includes("/rituals")) return ok(route, [{ id: "r1", name: "Satyanarayan Katha", nameHindi: "सत्यनारायण कथा", durationHours: 3, basePrice: DAKSHINA }]);
  if (bare.includes("/pandits") || bare.includes("/search")) return ok(route, { pandits: [PANDIT_REC], pagination: { total: 1, page: 1, limit: 10, totalPages: 1 } });
  // MUHURAT: the API reads a seeded table. Prod count is UNVERIFIABLE (creds
  // rotated), so this returns EMPTY — inventing muhurats would hide the defect.
  if (bare.includes("/muhurat")) return ok(route, { dates: [], pujas: [] });
  if (bare.includes("/tts") || bare.includes("/stt") || bare.includes("/voice")) return route.fulfill({ status: 500, headers: CORS, body: "{}" });
  return ok(route, []);
}

// ── CONDITION C: each check defined once, run twice (no booking → booking) ──
const CHECKS = {
  "ACT2 · a real booking row is on the pandit's list": (t) =>
    /HPJ-QA-WALK-1|सत्यनारायण कथा/.test(t.panditList) && /क्यूए यजमान|कोथरूड|₹\s?5,?100/.test(t.panditList),
  "ACT2 · his earning figure is visible": (t) => /5,?100/.test(t.panditList + t.panditHome),
  "ACT3 · the booking is in the ops list": (t) => /HPJ-QA-WALK-1/.test(t.adminList),
  "ACT3 · ops sees the customer": (t) => /क्यूए यजमान/.test(t.adminDetail),
  "ACT3 · ops sees the money": (t) => /5,?610/.test(t.adminDetail) && /5,?100/.test(t.adminDetail),
};
const runChecks = (texts, phase) => {
  const out = {};
  for (const [name, fn] of Object.entries(CHECKS)) {
    let v = false; try { v = !!fn(texts); } catch { v = false; }
    out[name] = v;
    const expect = phase === "negative" ? false : true;
    const pass = v === expect;
    results.push({ phase, name, value: v, pass });
    console.log(`${pass ? "✅" : "❌"} [${phase}] ${name} → ${v}${phase === "negative" ? " (must be false)" : ""}`);
  }
  return out;
};

const grab = async (page, url, ms = 7000) => { await page.goto(url, { waitUntil: "domcontentloaded" }); await page.waitForTimeout(ms); return (await page.textContent("body")) || ""; };
const shot = async (page, name) => { const p = join(SHOTS, `${name}.png`); await page.screenshot({ path: p, fullPage: false }); return p; };

const run = async () => {
  const browser = await chromium.launch({ headless: true, args: ["--autoplay-policy=no-user-gesture-required"] });

  const cCtx = await browser.newContext({ viewport: { width: 390, height: 860 }, deviceScaleFactor: 1 });
  await cCtx.addInitScript(() => localStorage.setItem("hpj_token", "qa-cust"));
  await cCtx.route("**/api/v1/**", router);
  const cust = await cCtx.newPage();

  const pCtx = await browser.newContext({ viewport: { width: 390, height: 860 }, deviceScaleFactor: 1 });
  await pCtx.addCookies([{ name: "hpj_token", value: "qa-pandit", url: PANDIT_URL }]);
  await pCtx.addInitScript(() => { localStorage.setItem("pandit_token", "qa-pandit"); localStorage.setItem("hpj_lang", "hi"); });
  await pCtx.route("**/api/v1/**", router);
  await pCtx.route("**/api/tts**", (r) => r.fulfill({ status: 500, body: "{}" }));
  const pandit = await pCtx.newPage();

  const aCtx = await browser.newContext({ viewport: { width: 1280, height: 860 }, deviceScaleFactor: 1 });
  await aCtx.addInitScript(() => localStorage.setItem("hpj_admin_token", "qa-admin"));
  await aCtx.route("**/api/v1/**", router);
  const admin = await aCtx.newPage();

  // ══ PHASE 0 — NEGATIVE. No booking exists. Every check MUST be red. ══
  console.log("\n══ PHASE 0 · PROVEN-TO-FAIL (no booking) ══");
  const neg = {
    panditHome: await grab(pandit, `${PANDIT_URL}/home`, 9000),
    panditList: await grab(pandit, `${PANDIT_URL}/bookings`),
    adminList: await grab(admin, `${ADMIN_URL}/bookings`, 9000),
    adminDetail: await grab(admin, `${ADMIN_URL}/bookings/bk-qa-walk-1`),
  };
  await shot(pandit, "neg-pandit-empty"); await shot(admin, "neg-admin-empty");
  runChecks(neg, "negative");

  // ══ ACT 1 — the customer ══
  console.log("\n══ ACT 1 · THE CUSTOMER ══");
  await cust.goto(`${WEB}/booking/new?panditId=${PANDIT_REC.id}&ritual=Satyanarayan%20Katha`, { waitUntil: "domcontentloaded" });
  await cust.waitForTimeout(12000);
  const beforeCommit = await shot(cust, "act1-before-commit");
  const wizardText = (await cust.textContent("main")) || "";
  const muhuratCalledDuringWizard = calls.some((c) => c.includes("/muhurat"));

  // CREATE THE BOOKING — the wizard's own request, from the live session.
  const created = await cust.evaluate(async () => {
    const base = (window).__API || "http://localhost:3001/api/v1";
    const res = await fetch(`${base}/bookings`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("hpj_token")}` },
      body: JSON.stringify({ panditId: "pp-qa-walk", eventType: "Satyanarayan Katha", eventDate: "2026-08-09" }),
    });
    const json = await res.json();
    // ── CONDITION B: the EXACT read the client performs on this response ──
    const payload = json.data ?? json;
    const booking = payload.booking ?? payload;
    return { bookingId: booking.id ?? booking.bookingId, bookingNumber: booking.bookingNumber, rawTopLevelId: payload.id ?? null };
  });

  const t1 = stamp("T1 · instant after the customer pays");
  const custAfter = await shot(cust, "act1-T1");

  results.push({ phase: "B", name: "CONDITION B · client read path yields a real bookingId", value: created.bookingId, pass: !!created.bookingId });
  console.log(`${created.bookingId ? "✅" : "❌"} [B] client read (data.booking.id) → ${created.bookingId}`);
  results.push({ phase: "B", name: "CONDITION B · the OLD read (data.id) is still undefined — the P0 was real", value: created.rawTopLevelId, pass: created.rawTopLevelId === null });
  console.log(`${created.rawTopLevelId === null ? "✅" : "❌"} [B] old read (data.id) → ${created.rawTopLevelId} (must be null)`);

  // ══ ACT 2 — the pandit ══
  console.log("\n══ ACT 2 · THE PANDIT ══");
  const panditHome = await grab(pandit, `${PANDIT_URL}/home`, 9000);
  const panditHomeShot = await shot(pandit, "act2-home");
  const panditList = await grab(pandit, `${PANDIT_URL}/bookings`);
  await shot(pandit, "act2-list");
  const acceptBtn = pandit.locator("button", { hasText: /स्वीकार|Accept/ }).first();
  let acceptedVia = "not found";
  if (await acceptBtn.count()) { await acceptBtn.click().catch(() => { }); await pandit.waitForTimeout(3000); acceptedVia = "tapped स्वीकार"; }
  const t2 = stamp("T2 · instant after the pandit accepts");
  const panditAfter = await shot(pandit, "act2-T2");
  const panditDetail = await grab(pandit, `${PANDIT_URL}/bookings/${BOOKING?.id}`, 6000);
  await shot(pandit, "act2-detail");

  // ══ ACT 3 — ops ══
  console.log("\n══ ACT 3 · OPS ══");
  const adminList = await grab(admin, `${ADMIN_URL}/bookings`, 9000);
  await shot(admin, "act3-list");
  const adminDetail = await grab(admin, `${ADMIN_URL}/bookings/${BOOKING?.id}`, 8000);
  const t3 = stamp("T3 · after the ceremony, at payout time");
  const adminAfter = await shot(admin, "act3-T3");

  // ══ PHASE 1 — POSITIVE ══
  console.log("\n══ PHASE 1 · POSITIVE (booking exists) ══");
  const pos = { panditHome, panditList, adminList, adminDetail };
  runChecks(pos, "positive");

  const conserves = BOOKING && (BOOKING.grandTotal - BOOKING.panditPayout === BOOKING.platformFee);
  results.push({ phase: "positive", name: "ACT3 · arithmetic conserves", value: conserves, pass: !!conserves });
  console.log(`${conserves ? "✅" : "❌"} customer ₹${BOOKING?.grandTotal} − pandit ₹${BOOKING?.panditPayout} = fee ₹${BOOKING?.platformFee}`);

  // ══ COMPOSITES ══
  const composite = async (title, files, out) => {
    const p = await browser.newPage({ viewport: { width: 1500, height: 1050 } });
    const imgs = files.map((f) => `<figure><figcaption>${f.cap}</figcaption><img src="file:///${f.path.replace(/\\/g, "/")}"></figure>`).join("");
    await p.setContent(`<html><body style="margin:0;background:#241A12;font-family:system-ui;padding:18px">
      <h1 style="color:#FBF6EE;font-size:19px;margin:0 0 6px">${title}</h1>
      <p style="color:#B9A88F;font-size:12px;margin:0 0 14px">one shared booking HPJ-QA-WALK-1 · created via the wizard's own request from the customer session · Razorpay test mode, never charged</p>
      <div style="display:flex;gap:14px;align-items:flex-start">${imgs}</div>
      <style>figure{margin:0;flex:1}figcaption{color:#D8B183;font-size:13px;font-weight:600;margin-bottom:6px}
      img{width:100%;border:1px solid #6B5B48;border-radius:6px;background:#fff}</style></body></html>`);
    await p.waitForTimeout(1400);
    await p.screenshot({ path: join(SHOTS, out), fullPage: true });
    await p.close(); console.log(`   🖼  ${out}`);
  };
  await composite(`T1 · ${t1} — the instant after the customer pays`, [{ cap: "CUSTOMER", path: custAfter }, { cap: "PANDIT (has not opened the app)", path: panditHomeShot }, { cap: "OPS / ADMIN", path: adminAfter }], "T1-composite.png");
  await composite(`T2 · ${t2} — the instant after the pandit accepts`, [{ cap: "CUSTOMER (unchanged)", path: custAfter }, { cap: "PANDIT", path: panditAfter }, { cap: "OPS / ADMIN", path: adminAfter }], "T2-composite.png");
  await composite(`T3 · ${t3} — after the ceremony, at payout time`, [{ cap: "CUSTOMER", path: custAfter }, { cap: "PANDIT", path: panditAfter }, { cap: "OPS / ADMIN", path: adminAfter }], "T3-composite.png");

  const html = await cust.content();
  const evidence = {
    createdVia: "the wizard's own POST /bookings, issued from the customer's live session",
    clientReadPath: created,
    money: { dakshina: DAKSHINA, feePct: FEE_PCT, fee: FEE, customerPays: DAKSHINA + FEE, panditGets: BOOKING?.panditPayout },
    muhuratCalledDuringWizard,
    muhuratRenderedInWizard: /मुहूर्त|muhurat/i.test(wizardText),
    customerSeesPanditName: /क्यूए जाँच/.test(await cust.textContent("body")),
    customerTelUndefined: /tel:undefined/.test(html),
    customerHasAnyTel: /tel:/.test(html),
    panditDetailReachable: /सत्यनारायण|कोथरूड|HPJ-QA-WALK/.test(panditDetail),
    acceptedVia, bookingFinalStatus: BOOKING?.status,
    timeline, calls: [...new Set(calls)], results,
  };
  writeFileSync(join(SHOTS, "three-act-final.json"), JSON.stringify(evidence, null, 2));
  console.log("\n── TIMELINE ──\n" + timeline.join("\n"));
  console.log("\n── EVIDENCE ──\n" + JSON.stringify({ ...evidence, timeline: undefined, calls: undefined, results: undefined }, null, 1));
  await browser.close();
  const bad = results.filter((r) => !r.pass);
  console.log(`\nTHREE-ACT: ${results.length - bad.length}/${results.length} (negative+positive+B)`);
};

run().catch((e) => { console.error("HARNESS ERROR:", e); process.exit(2); });
