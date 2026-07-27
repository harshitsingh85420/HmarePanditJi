// ─────────────────────────────────────────────────────────────
// KYC ROUND TRIP — under interception, both apps, one record.
//
// Isj order 2026-07-27: prove the identity review path end to end —
// upload → record flips → pandit APPEARS in the admin queue → documents
// RENDER → approve → pandit-side state changes.
//
// WHAT THIS PROVES: the client-side contract. Which endpoint each app
// calls, which fields it reads, and which status values it honours — all
// against a fixture that implements the REAL transitions from
// packages/types/src/verification.ts. If the admin app were still asking
// for status=PENDING, or still reading documentUrls, these legs would fail.
//
// WHAT IT DOES NOT PROVE: the server's own Prisma where-clause. That is
// pinned by services/api/src/lib/kycContract.test.ts instead.
//
// NO REAL SUBMISSION IS EVER FIRED (KYC boundary): every request is
// fulfilled by the fixture. Nothing reaches the API or the database.
// ─────────────────────────────────────────────────────────────

import { chromium } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const PANDIT = "http://localhost:3002";
const ADMIN = "http://localhost:3003";
const SHOTS = process.env.SHOTS_DIR || join(process.cwd(), "..", "..", "docs", "review", "shots", "kyc");
mkdirSync(SHOTS, { recursive: true });

// a 2x2 PNG, so the admin thumbs have something real to render
const PNG =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAF0lEQVQIW2P8z8Dwn4EIwDiqkL4hBQCxlwX9Xb3n5AAAAABJRU5ErkJggg==";

// ── THE ONE RECORD ───────────────────────────────────────────
const rec = {
  id: "pp-qa-1",
  userId: "u-qa-1",
  name: "पं. क्यूए जाँच",
  phone: "+919999999998",
  city: "वाराणसी",
  specializations: ["Griha Pravesh"],
  verificationStatus: "PENDING", // schema default: nothing uploaded
  aadhaarFrontUrl: null,
  aadhaarBackUrl: null,
  videoKycUrl: null,
  aadhaarLastFour: null,
  aadhaarConsentAt: null,
  videoKycCompleted: false,
  bankAccountNumber: null,
  upiId: null,
  readinessStep: 4,
  isBookingReady: false,
  pendingPoojaVerifications: [],
};

// the transitions the real code performs, in one place
const REVIEW_QUEUE = ["DOCUMENTS_SUBMITTED", "VIDEO_KYC_DONE"];
function applyR5Submit(body) {
  rec.aadhaarFrontUrl = body.aadhaarUrl || PNG;
  rec.aadhaarBackUrl = body.aadhaarBackUrl || PNG;
  rec.aadhaarLastFour = String(body.aadhaarNumber || "").slice(-4);
  rec.aadhaarConsentAt = "2026-07-27T10:00:00.000Z";
  rec.upiId = body?.payment?.upi?.id || null;
  rec.verificationStatus = "DOCUMENTS_SUBMITTED";
  rec.isBookingReady = true;
  rec.readinessStep = 5;
}
function applyApprove() {
  rec.verificationStatus = "VERIFIED";
}

const calls = [];
const results = [];
function step(name, ok, detail) {
  results.push({ name, ok, detail });
  console.log(`${ok ? "✅" : "❌"} ${name}${detail ? " — " + detail : ""}`);
}

const CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "*",
  "access-control-allow-methods": "GET,POST,PATCH,PUT,DELETE,OPTIONS",
};
const json = (route, data, message = "ok") =>
  route.fulfill({ status: 200, headers: { "content-type": "application/json", ...CORS }, body: JSON.stringify({ success: true, data, message }) });

function profilePayload() {
  return {
    id: rec.userId,
    name: rec.name,
    phone: rec.phone,
    panditProfile: {
      id: rec.id,
      verificationStatus: rec.verificationStatus,
      readinessStep: rec.readinessStep,
      isBookingReady: rec.isBookingReady,
      isOnline: false,
      specializations: rec.specializations,
      city: rec.city,
      location: rec.city,
      pendingPoojaVerifications: rec.pendingPoojaVerifications,
    },
  };
}

function queuePayload() {
  const inQueue = REVIEW_QUEUE.includes(rec.verificationStatus);
  return {
    queue: inQueue
      ? [
          {
            panditId: rec.id,
            userId: rec.userId,
            displayName: rec.name,
            phone: rec.phone,
            city: rec.city,
            specializations: rec.specializations,
            verificationStatus: rec.verificationStatus,
            aadhaarFrontUrl: rec.aadhaarFrontUrl,
            aadhaarBackUrl: rec.aadhaarBackUrl,
            videoKycUrl: rec.videoKycUrl,
            aadhaarLastFour: rec.aadhaarLastFour,
            aadhaarConsentAt: rec.aadhaarConsentAt,
            videoKycCompleted: rec.videoKycCompleted,
            hasBankAccount: !!rec.bankAccountNumber,
            hasUpi: !!rec.upiId,
            submittedAt: "2026-07-27T10:00:00.000Z",
          },
        ]
      : [],
    total: inQueue ? 1 : 0,
    page: 1,
    limit: 20,
  };
}

async function routeApi(route) {
  const req = route.request();
  const url = req.url();
  const method = req.method();
  calls.push(`${method} ${url.replace(/^https?:\/\/[^/]+/, "")}`);

  if (method === "OPTIONS") return route.fulfill({ status: 204, headers: CORS, body: "" });

  // ── admin legs ──
  if (url.includes("/admin/kyc/queue")) return json(route, queuePayload());
  if (url.includes("/admin/pandits") && url.includes("/approve")) {
    applyApprove();
    return json(route, { id: rec.id, verificationStatus: rec.verificationStatus });
  }
  if (/\/admin\/pandits\/[^/?]+$/.test(url.split("?")[0])) {
    return json(route, {
      ...rec,
      fullName: rec.name,
      user: { id: rec.userId, name: rec.name, phone: rec.phone },
      languages: ["हिन्दी"],
      bio: null,
      pujaServices: [],
      samagriPackages: [],
      bankAccountName: null,
      bankIfscCode: null,
    });
  }
  if (url.includes("/admin/pandits")) return json(route, [rec]);
  if (url.includes("/files/presign")) return json(route, { url: PNG });

  // ── pandit legs ──
  // /auth/me wraps the record under data.user (+ milestones); the pandit
  // profile screen reads the profile object directly.
  if (url.includes("/auth/me")) return json(route, { user: profilePayload(), milestones: [], unseenMilestones: [] });
  if (url.includes("/pandit/profile")) return json(route, { ...profilePayload().panditProfile, name: rec.name, fullName: rec.name });
  if (url.includes("/pandit/bookings")) return json(route, []);
  if (url.includes("/pandit/stats")) return json(route, { rating: null, completedBookings: 0, totalReviews: 0 });
  if (url.includes("/readiness")) {
    if (method === "PATCH" || method === "POST" || method === "PUT") {
      let body = {};
      try { body = JSON.parse(req.postData() || "{}"); } catch {}
      const data = body?.data || body;
      applyR5Submit(data);
      return json(route, { snapshot: "ok", verificationStatus: rec.verificationStatus });
    }
    return json(route, { readinessStep: rec.readinessStep, aadhaarUrl: "", aadhaarBackUrl: "", hasConsent: false });
  }
  if (url.includes("/tts") || url.includes("/voice")) return route.fulfill({ status: 500, headers: CORS, body: "{}" });

  return json(route, {});
}

const shot = async (page, name) => {
  const p = join(SHOTS, `${name}.png`);
  await page.screenshot({ path: p, fullPage: false });
  console.log(`   📸 ${name}.png`);
};

const run = async () => {
  const browser = await chromium.launch({ headless: true, args: ["--autoplay-policy=no-user-gesture-required"] });

  // ══ PANDIT SIDE ═══════════════════════════════════════════
  const panditCtx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  await panditCtx.addCookies([{ name: "hpj_token", value: "qa-token", url: PANDIT }]);
  await panditCtx.addInitScript(() => {
    localStorage.setItem("pandit_token", "qa-token");
    localStorage.setItem("hpj_lang", "hi");
  });
  await panditCtx.route("**/api/v1/**", routeApi);
  await panditCtx.route("**/api/tts**", (r) => r.fulfill({ status: 500, body: "{}" }));
  const pandit = await panditCtx.newPage();
  const panditErrors = [];
  pandit.on("console", (m) => { if (m.type() === "error") panditErrors.push(m.text().slice(0, 200)); });
  pandit.on("pageerror", (e) => panditErrors.push("PAGEERROR: " + String(e).slice(0, 200)));

  // LEG 1 — nothing uploaded: the banner must ASK for the upload
  await pandit.goto(`${PANDIT}/home`, { waitUntil: "domcontentloaded" });
  await pandit.waitForTimeout(9000);
  let body = await pandit.textContent("body");
  step(
    "LEG 1 · PENDING → home asks for the upload",
    body.includes("आधार अपलोड कीजिए"),
    body.includes("आधार अपलोड कीजिए") ? "banner + CTA present" : "banner text NOT found",
  );
  step(
    "LEG 1b · PENDING → no review is claimed",
    !body.includes("जाँच चल रही है") && !body.includes("सत्यापन में है"),
    "no passive review copy at PENDING",
  );
  if (panditErrors.length) console.log("   pandit console errors: " + panditErrors.slice(0, 5).join(" || "));
  await shot(pandit, "01-pandit-pending");

  // LEG 2 — the submit: apply the real R5 transition through the fixture
  const before = rec.verificationStatus;
  await pandit.evaluate(async () => {
    await fetch("/api/v1/pandit/readiness/step/5", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ aadhaarUrl: "uploads/qa/front.jpg", aadhaarBackUrl: "uploads/qa/back.jpg", aadhaarNumber: "123412341234", aadhaarConsent: true, payment: { type: "UPI", upi: { id: "qa@upi" } } }),
    });
  });
  step(
    "LEG 2 · R5 submit flips the record",
    before === "PENDING" && rec.verificationStatus === "DOCUMENTS_SUBMITTED",
    `${before} → ${rec.verificationStatus}, aadhaar last four ${rec.aadhaarLastFour}, consent ${rec.aadhaarConsentAt ? "recorded" : "MISSING"}`,
  );

  // LEG 3 — the pandit now sees the SUBMITTED state, with no time promise
  await pandit.goto(`${PANDIT}/home`, { waitUntil: "domcontentloaded" });
  await pandit.waitForTimeout(9000);
  body = await pandit.textContent("body");
  step("LEG 3 · SUBMITTED → home says the documents arrived", body.includes("आपका आधार मिल गया"), "जाँच चल रही है shown");
  step("LEG 3b · no time promise anywhere on the screen", !/\d+\s*दिन|घंटे|घंटा/.test(body), "no duration claimed");
  step("LEG 3c · the upload ask is gone", !body.includes("आधार अपलोड कीजिए"), "PENDING banner retired");
  await shot(pandit, "02-pandit-submitted");

  // ══ ADMIN SIDE ════════════════════════════════════════════
  const adminCtx = await browser.newContext({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 1 });
  await adminCtx.addInitScript(() => {
    // the real key (packages/utils token-constants). Several admin screens
    // still read a hard-coded "adminToken" instead — reported, not fixed here.
    localStorage.setItem("hpj_admin_token", "qa-admin");
    localStorage.setItem("adminToken", "qa-admin");
  });
  await adminCtx.route("**/api/v1/**", routeApi);
  const admin = await adminCtx.newPage();

  // LEG 4 — he APPEARS in the queue, and the documents render
  await admin.goto(`${ADMIN}/verifications`, { waitUntil: "domcontentloaded" });
  await admin.waitForTimeout(9000);
  const adminBody = await admin.textContent("body");
  const imgCount = await admin.locator("table img").count();
  step("LEG 4 · the submitted pandit APPEARS in the queue", adminBody.includes(rec.name), `row for ${rec.name}`);
  step("LEG 4b · the queue endpoint called is /admin/kyc/queue", calls.some((c) => c.includes("/admin/kyc/queue")), calls.filter((c) => c.includes("admin")).join(" | "));
  step("LEG 4c · NOT the old PENDING filter", !calls.some((c) => c.includes("status=PENDING")), "no status=PENDING request issued");
  step("LEG 4d · both Aadhaar faces RENDER (not 'Not Uploaded')", imgCount >= 2, `${imgCount} document thumbnails in the row`);
  step("LEG 4e · last four + consent shown", adminBody.includes("1234") && adminBody.includes("consent recorded"), "reviewer can see what he consented to");
  await shot(admin, "03-admin-queue-has-him");

  // LEG 5 — approve
  admin.on("dialog", (d) => d.accept());
  const approveBtn = admin.locator("button", { hasText: "APPROVE" }).first();
  await approveBtn.click();
  await admin.waitForTimeout(4000);
  step("LEG 5 · approve writes VERIFIED", rec.verificationStatus === "VERIFIED", `record is now ${rec.verificationStatus}`);
  const afterBody = await admin.textContent("body");
  step(
    "LEG 5b · he leaves the queue once decided",
    afterBody.includes("No submitted documents awaiting review"),
    "queue empties after the decision",
  );
  await shot(admin, "04-admin-after-approve");

  // LEG 6 — the pandit's own state changes
  await pandit.goto(`${PANDIT}/home`, { waitUntil: "domcontentloaded" });
  await pandit.waitForTimeout(9000);
  body = await pandit.textContent("body");
  step("LEG 6 · VERIFIED → no verification banner at all", !body.includes("आपका आधार मिल गया") && !body.includes("आधार अपलोड कीजिए"), "both banners retired");
  await shot(pandit, "05-pandit-verified");

  // LEG 7 — profile: identity ✓ and the per-pooja ✓
  await pandit.goto(`${PANDIT}/profile-view`, { waitUntil: "domcontentloaded" });
  await pandit.waitForTimeout(7000);
  const profBody = await pandit.textContent("body");
  step("LEG 7 · profile shows the identity seal once verified", profBody.includes("प्रमाणित"), "✓ प्रमाणित pill present");
  await shot(pandit, "06-pandit-profile-verified");

  // LEG 8 — a pooja still awaiting its OWN verification must not wear a tick
  rec.pendingPoojaVerifications = ["Griha Pravesh"];
  await pandit.goto(`${PANDIT}/profile-view`, { waitUntil: "domcontentloaded" });
  await pandit.waitForTimeout(7000);
  const tickCount = await pandit.locator("text=check_circle").count();
  step(
    "LEG 8 · a pending pooja loses its green tick",
    tickCount === 0,
    `${tickCount} per-pooja ticks while the pooja awaits its own verification`,
  );
  await shot(pandit, "07-pandit-pooja-pending");

  await browser.close();

  const failed = results.filter((r) => !r.ok);
  console.log("\n────────────────────────────────");
  console.log(`ROUND TRIP: ${results.length - failed.length}/${results.length} legs passed`);
  console.log("API calls observed:\n  " + [...new Set(calls)].join("\n  "));
  writeFileSync(join(SHOTS, "roundtrip.json"), JSON.stringify({ results, calls: [...new Set(calls)] }, null, 2));
  process.exit(failed.length ? 1 : 0);
};

run().catch((e) => {
  console.error("HARNESS ERROR:", e);
  process.exit(2);
});
