// ─────────────────────────────────────────────────────────────
// TOKEN + ENVELOPE — live proof, both surfaces.
//
// Isj item 1: "an admin opens a booking detail without crashing; a logged-in
// customer reaches an authenticated page."
//
// The fixture asserts the REAL server shapes:
//   GET /bookings/:id  → sendSuccess(res, { booking })   [wrapped]
//   GET /customers/me  → sendSuccess(res, customer)      [flat]
// and 401s any request whose bearer is missing/empty — so a surviving
// wrong-key read shows up as a blank screen, exactly as it did in production.
// ─────────────────────────────────────────────────────────────

import { createRequire } from "node:module";
const require_ = createRequire(import.meta.url);
const { chromium } = require_("../../../node_modules/.pnpm/@playwright+test@1.58.2/node_modules/@playwright/test");
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const WEB = "http://localhost:3000";
const ADMIN = "http://localhost:3003";
const SHOTS = join(process.cwd(), "..", "..", "docs", "review", "shots", "token-envelope");
mkdirSync(SHOTS, { recursive: true });

const CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "*",
  "access-control-allow-methods": "GET,POST,PATCH,PUT,DELETE,OPTIONS",
};

const BOOKING = {
  id: "bk-qa-te-1",
  bookingNumber: "HPJ-QA-TE-1",
  status: "CONFIRMED",
  paymentStatus: "CAPTURED",
  eventType: "Satyanarayan Katha",
  eventDate: "2026-08-09T09:00:00.000Z",
  eventEndDate: null,
  muhuratTime: "09:00 - 12:00",
  venueAddress: "कोथरूड, पुणे",
  venueCity: "पुणे",
  venuePincode: "411038",
  dakshinaAmount: 5100,
  grandTotal: 5610,
  foodArrangement: "CUSTOMER_PROVIDES",
  samagriPreference: "PANDIT_BRINGS",
  travelStatus: "NOT_REQUIRED",
  travelRequired: false,
  travelMode: null,
  travelDistanceKm: null,
  payoutStatus: "PENDING",
  panditPayout: 5100,
  platformFee: 510,
  platformFeeGst: 92,
  travelServiceFee: 0,
  travelServiceFeeGst: 0,
  travelCost: 0,
  foodAllowanceAmount: 0,
  accommodationCost: 0,
  refundAmount: 0,
  refundStatus: "NONE",
  attendees: 50,
  adminNotes: "",
  createdAt: "2026-07-28T10:00:00.000Z",
  customer: { id: "u-qa-cust", name: "क्यूए यजमान", phone: "+919999999997" },
  pandit: { id: "pp-qa-1", displayName: "पं. क्यूए जाँच", user: { name: "पं. क्यूए जाँच", phone: "+919999999998" } },
};

const results = [];
const unauthorized = [];
const step = (n, ok, d) => { results.push({ n, ok, d }); console.log(`${ok ? "✅" : "❌"} ${n}${d ? " — " + d : ""}`); };

function makeRouter(label) {
  return async (route) => {
    const req = route.request();
    const path = req.url().replace(/^https?:\/\/[^/]+/, "");
    if (req.method() === "OPTIONS") return route.fulfill({ status: 204, headers: CORS, body: "" });

    // THE POINT: an empty/missing bearer must 401, as the real API does.
    // /auth/me is deliberately COOKIE-authenticated (auth-context sends
    // credentials:"include" against the HttpOnly hpj_token cookie), so it
    // carries no bearer by design. Exempting it: a blanket bearer rule would
    // report the app's correct behaviour as a break.
    const isCookieAuth = path.includes("/auth/me");
    const auth = (await req.headerValue("authorization")) || "";
    const bearer = auth.replace(/^Bearer\s*/i, "").trim();
    if (!isCookieAuth && (!bearer || bearer === "null" || bearer === "undefined")) {
      unauthorized.push(`${label} ${path}`);
      return route.fulfill({
        status: 401,
        headers: { "content-type": "application/json", ...CORS },
        body: JSON.stringify({ success: false, error: { message: "Unauthorized" } }),
      });
    }

    const ok = (data, message = "ok") =>
      route.fulfill({ status: 200, headers: { "content-type": "application/json", ...CORS }, body: JSON.stringify({ success: true, data, message }) });

    if (/\/bookings\/[^/]+$/.test(path.split("?")[0])) return ok({ booking: BOOKING }, "Booking detail");
    if (path.includes("/customers/me/favorites")) return ok([]);
    // GET /customers/me returns a CustomerProfile with a NESTED user —
    // verified against customer.routes.ts:66 rather than assumed. The page's
    // profileData.user read is correct; the first fixture here was flat and
    // wrongly made a working page look broken.
    if (path.includes("/customers/me"))
      return ok({
        id: "cp-qa-1",
        userId: "u-qa-cust",
        user: { id: "u-qa-cust", name: "क्यूए यजमान", phone: "+919999999997", email: null, role: "CUSTOMER", isVerified: true },
        addresses: [],
      });
    if (path.includes("/auth/me")) return ok({ user: { id: "u-qa-cust", name: "क्यूए यजमान", phone: "+919999999997", role: "CUSTOMER" } });
    if (path.includes("/notifications")) return ok([]);
    return ok([]);
  };
}

const run = async () => {
  const browser = await chromium.launch({ headless: true });

  // ── ADMIN: open a booking detail ──
  const aCtx = await browser.newContext({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 1 });
  await aCtx.addInitScript(() => localStorage.setItem("hpj_admin_token", "qa-admin-token"));
  await aCtx.route("**/api/v1/**", makeRouter("admin"));
  const admin = await aCtx.newPage();
  const aErr = [];
  admin.on("pageerror", (e) => aErr.push(String(e).slice(0, 160)));
  await admin.goto(`${ADMIN}/bookings/${BOOKING.id}`, { waitUntil: "domcontentloaded" });
  await admin.waitForTimeout(11000);
  const aBody = (await admin.textContent("body")) || "";
  await admin.screenshot({ path: join(SHOTS, "admin-booking-detail.png"), fullPage: false });

  step("ADMIN · booking detail renders without crashing", aErr.length === 0, aErr[0] || "no page errors");
  step("ADMIN · the REAL booking is shown", aBody.includes(BOOKING.bookingNumber), `looked for ${BOOKING.bookingNumber}`);
  step(
    "ADMIN · the fabricated MOCK is gone",
    !aBody.includes("BK-240201-001") && !aBody.includes("Vikram Malhotra"),
    "no invented booking under a real URL",
  );
  step("ADMIN · no request sent an empty bearer", !unauthorized.some((u) => u.startsWith("admin")), unauthorized.filter((u) => u.startsWith("admin")).join(" | ") || "all authorized");

  // ── CUSTOMER: reach an authenticated page ──
  const cCtx = await browser.newContext({ viewport: { width: 390, height: 900 }, deviceScaleFactor: 1 });
  await cCtx.addInitScript(() => localStorage.setItem("hpj_token", "qa-customer-token"));
  await cCtx.route("**/api/v1/**", makeRouter("web"));
  const cust = await cCtx.newPage();
  const cErr = [];
  cust.on("pageerror", (e) => cErr.push(String(e).slice(0, 160)));
  await cust.goto(`${WEB}/dashboard/profile`, { waitUntil: "domcontentloaded" });
  await cust.waitForTimeout(11000);
  const cBody = (await cust.textContent("body")) || "";
  await cust.screenshot({ path: join(SHOTS, "customer-profile.png"), fullPage: false });

  step("CUSTOMER · authenticated page renders", cErr.length === 0, cErr[0] || "no page errors");
  step(
    "CUSTOMER · no request sent an empty bearer",
    !unauthorized.some((u) => u.startsWith("web")),
    unauthorized.filter((u) => u.startsWith("web")).join(" | ") || "all authorized",
  );
  step("CUSTOMER · his own data reached the screen", cBody.includes("क्यूए यजमान") || cBody.includes("9999999997"), "profile populated");

  await browser.close();
  writeFileSync(join(SHOTS, "token-envelope.json"), JSON.stringify({ results, unauthorized }, null, 2));
  const failed = results.filter((r) => !r.ok);
  console.log(`\nTOKEN+ENVELOPE: ${results.length - failed.length}/${results.length} checks passed`);
  if (unauthorized.length) console.log("401s (empty bearer):\n  " + unauthorized.join("\n  "));
  process.exit(failed.length ? 1 : 0);
};

run().catch((e) => { console.error("HARNESS ERROR:", e); process.exit(2); });
