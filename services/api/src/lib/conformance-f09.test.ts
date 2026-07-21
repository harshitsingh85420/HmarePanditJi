import assert from "node:assert";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// ─────────────────────────────────────────────────────────────────────────────
// CONFORMANCE GUARD — F09-01 (rejection carries the reason: spoken + written).
//
// Register line: docs/pandit-pov-conformance-register.md
//   F09-01 | Rejection notification carries the reason, spoken + written | 🟡
//
// This guard PINS CURRENT BEHAVIOUR. It is not a wish-list. There are two
// rejection surfaces in the product and they are NOT equally complete:
//
//   (A) PROFILE / KYC rejection  — admin rejects the pandit himself.
//       Reason is mandatory at the API, persisted, pushed in the notification
//       (in-app + SMS), and on the home screen it is BOTH SPOKEN and WRITTEN.
//       This half is the ✅ in the 🟡.
//
//   (B) PER-PUJA verification rejection — admin rejects one puja's video.
//       Reason is mandatory at the API, persisted, pushed in the notification
//       (in-app + SMS), and on मेरी पूजाएँ it is WRITTEN — but never SPOKEN.
//       This half is the ❌ in the 🟡, and it is pinned below as an explicit
//       KNOWN-GAP assertion (see the GAP block at the bottom).
//
// A 62-year-old priest who cannot read fluently learns WHY he was rejected
// only if the reason is voiced. That is why "spoken" is a register clause and
// not a nicety, and why the gap is worth freezing rather than quietly tolerating.
// ─────────────────────────────────────────────────────────────────────────────

const API_SRC = join(__dirname, "..");
const REPO = join(__dirname, "..", "..", "..", "..");
const PANDIT_SRC = join(REPO, "apps", "pandit", "src");

const readApi = (rel: string) => readFileSync(join(API_SRC, rel), "utf8");
const readPandit = (rel: string) => readFileSync(join(PANDIT_SRC, rel), "utf8");

/** Slice a source file from `start` up to the next `stop` marker after it. */
function slice(src: string, start: string, stop: string, label: string): string {
  const a = src.indexOf(start);
  assert.ok(a >= 0, `${label}: could not find "${start}" — guard is stale, fix the guard`);
  const b = src.indexOf(stop, a + start.length);
  return b > a ? src.slice(a, b) : src.slice(a);
}

console.log("Running conformance-f09 guard (F09-01: rejection reason carried, spoken + written)…");

// ─── F09-01 (A1) API: KYC rejection demands a reason, stores it, notifies with it
{
  const adminRoutes = readApi("routes/admin.routes.ts");
  const rejectRoute = slice(
    adminRoutes,
    'fastify.post("/pandits/:id/reject"',
    'fastify.post("/pandits/:id/force-offline"',
    "F09-01 admin KYC reject route",
  );

  assert.ok(
    /if \(!reason\)[\s\S]{0,160}status\(400\)/.test(rejectRoute),
    "F09-01: a KYC rejection with no reason must be refused 400 — a reasonless rejection carries nothing to surface",
  );
  assert.ok(
    /rejectionReason:\s*reason/.test(rejectRoute),
    "F09-01: the KYC rejection reason must be persisted on the profile",
  );
  assert.ok(
    /getNotificationTemplate\("VERIFICATION_REJECTED",\s*\{\s*reason\s*\}\)/.test(rejectRoute),
    "F09-01: the KYC rejection notification must be built with the reason passed in",
  );
  assert.ok(
    /notificationService\.notify\(\{[\s\S]{0,240}message:\s*tmpl\.message[\s\S]{0,120}smsMessage:\s*tmpl\.smsMessage/.test(rejectRoute),
    "F09-01: the reason-bearing template must reach the pandit over BOTH in-app and SMS",
  );
}

// ─── F09-01 (A2) The notification template actually interpolates the reason.
// Without this the reason would be accepted, stored, passed along — and dropped
// on the floor at the last step. Assert BOTH channels, not just one.
{
  const tmpl = readApi("services/notification-templates.ts");
  const block = slice(tmpl, "case 'VERIFICATION_REJECTED':", "case '", "F09-01 VERIFICATION_REJECTED template");

  assert.ok(
    /message:\s*`[^`]*\$\{data\.reason\}/.test(block),
    "F09-01: the in-app VERIFICATION_REJECTED message must interpolate ${data.reason}",
  );
  assert.ok(
    /smsMessage:\s*`[^`]*\$\{data\.reason\}/.test(block),
    "F09-01: the SMS VERIFICATION_REJECTED message must interpolate ${data.reason}",
  );
}

// ─── F09-01 (B1) API: per-puja rejection demands a reason, stores it, notifies
// with it — in Devanagari, on both channels.
{
  const ctrl = readApi("controllers/poojaVerification.controller.ts");
  const reject = slice(ctrl, "export const rejectPoojaVerification", "\nexport const", "F09-01 rejectPoojaVerification");

  assert.ok(
    /if \(!reason \|\| !reason\.trim\(\)\)[\s\S]{0,140}status\(400\)/.test(reject),
    "F09-01: a per-puja rejection with a missing/blank reason must be refused 400",
  );
  assert.ok(
    /rejectionReason:\s*reason\.trim\(\)/.test(reject),
    "F09-01: the per-puja rejection reason must be persisted (trimmed) on the verification row",
  );
  assert.ok(
    /message:\s*`[^`]*कारण:\s*\$\{reason\.trim\(\)\}/.test(reject),
    "F09-01: the in-app per-puja rejection message must carry the reason after कारण:",
  );
  assert.ok(
    /smsMessage:\s*`[^`]*कारण:\s*\$\{reason\.trim\(\)\}/.test(reject),
    "F09-01: the SMS per-puja rejection message must carry the reason after कारण:",
  );
  assert.ok(
    /rejectionReason:\s*row\.rejectionReason/.test(reject),
    "F09-01: the reject response must echo rejectionReason back",
  );
}

// ─── F09-01 (B2) API: the pandit's own read path returns the reason.
// getMyPoojaVerifications must hand back whole rows — a `select` here would
// silently strip rejectionReason and the UI would render a bare ✗.
{
  const ctrl = readApi("controllers/poojaVerification.controller.ts");
  const mine = slice(ctrl, "export const getMyPoojaVerifications", "\nexport const", "F09-01 getMyPoojaVerifications");

  assert.ok(
    /poojaVerification\.findMany\(/.test(mine),
    "F09-01: the pandit read path must query poojaVerification",
  );
  assert.ok(
    !/select:/.test(mine),
    "F09-01: getMyPoojaVerifications must NOT narrow with select — that would drop rejectionReason before it reaches the pandit",
  );
  assert.ok(
    /latest:\s*\[\.\.\.byType\.values\(\)\]/.test(mine),
    "F09-01: the per-puja effective state (highest version) must be exposed as `latest`",
  );
}

// ─── F09-01 (C) PANDIT UI, KYC banner: the reason is SPOKEN **and** WRITTEN.
// This is the half of F09-01 that is genuinely met. Two DISTINCT sites: a
// narration call that interpolates the reason, and a rendered text node.
{
  const home = readPandit("app/(dashboard-group)/home/HomeView.tsx");
  const lines = home.split(/\r?\n/);

  const spokenIdx = lines.findIndex(
    (l) => l.includes("renderNarrate") && l.includes("rejectionReason"),
  );
  assert.ok(
    spokenIdx >= 0,
    "F09-01: the home rejection banner must SPEAK the reason — renderNarrate() must interpolate rejectionReason",
  );

  const writtenIdx = lines.findIndex(
    (l, i) => i !== spokenIdx && /\{rejectionReason \|\|/.test(l) && !l.includes("renderNarrate"),
  );
  assert.ok(
    writtenIdx >= 0,
    "F09-01: the home rejection banner must also WRITE the reason as visible text",
  );
  assert.notStrictEqual(
    spokenIdx,
    writtenIdx,
    "F09-01: spoken and written must be two separate renders, not one line double-counted",
  );

  // The banner is reachable only in the rejected state — pin that it is gated
  // on isRejected, so this is not narration that fires for every pandit.
  assert.ok(
    /\{isRejected && \(/.test(home),
    "F09-01: the reason banner must be gated on isRejected",
  );

  // Passing the reason down from the page is what makes any of it real.
  const homePage = readPandit("app/(dashboard-group)/home/page.tsx");
  assert.ok(
    /rejectionReason=\{profile\?\.panditProfile\?\.rejectionReason \|\| null\}/.test(homePage),
    "F09-01: the real server-side rejectionReason must be wired into HomeView (not a placeholder)",
  );
}

// ─── F09-01 (D) PANDIT UI, per-puja: the reason IS written on मेरी पूजाएँ.
{
  const myPoojas = readPandit("app/(dashboard-group)/my-poojas/page.tsx");

  assert.ok(
    /v\?\.status === "REJECTED" && v\?\.rejectionReason/.test(myPoojas),
    "F09-01: the per-puja reason must render only for a REJECTED puja that actually has a reason",
  );
  assert.ok(
    /t\("myPoojas\.rejectedReasonPrefix"\)\}\s*\{v\.rejectionReason\}/.test(myPoojas),
    "F09-01: the per-puja rejection reason must be WRITTEN with its कारण: prefix",
  );
  assert.ok(
    /rejectionReason:\s*r\.rejectionReason \?\? null/.test(myPoojas),
    "F09-01: the reason must be carried out of the API response into per-puja view state",
  );
}

// ═══ KNOWN GAP ═══════════════════════════════════════════════════════════════
// F09-01 (E) — THIS ASSERTION DOCUMENTS A GAP, NOT A DESIRED PROPERTY.
//
// On मेरी पूजाएँ the per-puja rejection reason is written but NEVER spoken.
// The screen mounts exactly one <Narrate>, and it reads the generic screen
// intro — not the reason. That is the ❌ half of F09-01's 🟡.
//
// If someone adds narration of the reason here (which they SHOULD — it closes
// F09-01), this assertion fails ON PURPOSE. That failure is the signal to flip
// F09-01 from 🟡 to ✅ in docs/pandit-pov-conformance-register.md and delete
// this block. Do not "fix" it by weakening the assertion.
// ═════════════════════════════════════════════════════════════════════════════
{
  const myPoojas = readPandit("app/(dashboard-group)/my-poojas/page.tsx");

  // The narration mechanism is present on this screen — so the gap is a
  // genuine omission, not the absence of any voice capability at all.
  assert.ok(
    /import \{ Narrate \} from "@\/hooks\/useScreenVoice"/.test(myPoojas),
    "F09-01: मेरी पूजाएँ must import Narrate (the voice mechanism exists on this screen)",
  );
  const narrations = myPoojas.match(/<Narrate[\s\S]{0,200}?\/>/g) ?? [];
  assert.ok(
    narrations.length > 0,
    "F09-01: मेरी पूजाएँ must mount at least one <Narrate> (else this gap assertion is vacuous)",
  );
  assert.ok(
    narrations.every((n) => !n.includes("rejectionReason")),
    "F09-01 GAP CLOSED: मेरी पूजाएँ now speaks the per-puja rejection reason. " +
      "This is an IMPROVEMENT — update F09-01 from 🟡 to ✅ in " +
      "docs/pandit-pov-conformance-register.md and delete the KNOWN GAP block in this guard.",
  );
}

console.log(
  "conformance-f09 guard: F09-01 reason carried API→notification→UI; " +
    "KYC banner spoken+written ✅; per-puja written-only (gap pinned) ✅",
);
