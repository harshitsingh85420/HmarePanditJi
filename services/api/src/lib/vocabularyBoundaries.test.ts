import assert from "node:assert";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { codeOnly } from "@hmarepanditji/utils/code-only";
import { notificationCategory, KNOWN_NOTIFICATION_TYPES } from "@hmarepanditji/types";

// ─────────────────────────────────────────────────────────────
// VOCABULARY BOUNDARIES — where a writer's words meet a reader's words.
// Isj order, 2026-07-28 (the cheap-confirmed-rows batch).
//
// Every row in this batch was the same defect at a different boundary: one side
// speaks a vocabulary the other side does not, and NOTHING fails at build time.
// Guards therefore go on the BOUNDARY (standing law), never on one side.
//
// Covered here:
//   R1  admin booking-status filter   UI words  → DB words
//   R2  admin paymentStatus render    UI literal → PaymentStatus enum
//   R3  admin free-text search        client key → server destructure
//   R6  notification type             21 written types → 6 render categories
//   R7  SamagriPackage price          writer column → reader column
// ─────────────────────────────────────────────────────────────

console.log("Running vocabulary-boundary guard...");

const REPO = join(__dirname, "..", "..", "..", "..");
const read = (p: string) => codeOnly(readFileSync(join(REPO, p), "utf8"));
const SCHEMA = readFileSync(join(REPO, "packages/db/prisma/schema.prisma"), "utf8");

const enumMembers = (name: string): Set<string> => {
  const m = new RegExp(`enum ${name} \\{([^}]*)\\}`).exec(SCHEMA);
  assert.ok(m, `enum ${name} not found — the reader has rotted`);
  return new Set(m![1].split("\n").map((l) => l.trim()).filter((l) => /^[A-Z_]+$/.test(l)));
};

// ── R1: the admin filter must be TRANSLATED, not pushed raw into Prisma ──
const ADMIN_CTRL = read("services/api/src/controllers/admin.controller.ts");
assert.ok(
  /where\.status = \{ in: status\.split\(","\)\.flatMap\(/.test(ADMIN_CTRL),
  "the admin booking filter must map UI vocabulary through dbStatusesForView.\n" +
    'Pushing the raw value in meant "REQUESTED"/"ACCEPTED" — legal enum members that NOTHING\n' +
    'writes — queried successfully and returned zero rows ("No bookings found"), while\n' +
    "PANDIT_REQUESTED was unfilterable by any option.",
);

// ── R2: every paymentStatus literal compared in admin is a real member ──
const PAYMENT_STATUSES = enumMembers("PaymentStatus");
const ADMIN_DETAIL = read("apps/admin/src/app/bookings/[id]/page.tsx");
for (const m of ADMIN_DETAIL.matchAll(/paymentStatus\s*===\s*["']([A-Z_]+)["']/g)) {
  assert.ok(
    PAYMENT_STATUSES.has(m[1]),
    `admin compares paymentStatus to "${m[1]}", which is not a PaymentStatus member ` +
      `(${[...PAYMENT_STATUSES].join(" | ")}). "PAID" belongs to PayoutStatus; the green pill\n` +
      `it drove could therefore only ever appear on the hard-coded MOCK.`,
  );
}

// ── R3: THE BOUNDARY — every query key the admin client sends is read ──
// The client appended `search` for months; the controller never destructured
// it, so the term vanished with no error (the route has no query schema).
const ADMIN_BOOKINGS_UI = read("apps/admin/src/app/bookings/page.tsx");
const sentKeys = [...ADMIN_BOOKINGS_UI.matchAll(/queryParams\.append\(\s*["']([a-zA-Z]+)["']/g)].map((m) => m[1]);
assert.ok(sentKeys.length >= 2, `only ${sentKeys.length} query keys parsed from the admin bookings page`);
const destructure = /const \{([^}]*)\} = query;/.exec(ADMIN_CTRL);
assert.ok(destructure, "getAllBookingsAdmin's query destructure not found");
const readKeys = new Set(destructure![1].split(",").map((s) => s.trim()).filter(Boolean));
for (const k of sentKeys) {
  assert.ok(
    readKeys.has(k),
    `the admin bookings page sends "${k}" but the controller never destructures it, so the\n` +
      `filter is silently dropped. The route has no query schema, so nothing errors — the\n` +
      `operator reads an unfiltered page as the match set.\n` +
      `  sent: ${sentKeys.join(", ")}\n  read: ${[...readKeys].join(", ")}`,
  );
}

// ── R6: THE BOUNDARY — every WRITTEN notification type is categorisable ──
// Scan what the server actually writes and prove the mapper knows it.
const NOTIF_SOURCES = [
  "services/api/src/services/notification.service.ts",
  "services/api/src/services/notification-templates.ts",
];
const written = new Set<string>();
for (const f of NOTIF_SOURCES) {
  for (const m of read(f).matchAll(/type:\s*["']([A-Z_]+)["']/g)) written.add(m[1]);
}
assert.ok(written.size >= 5, `only ${written.size} notification types parsed — the reader has rotted`);
const uncategorised = [...written].filter((t) => !KNOWN_NOTIFICATION_TYPES.includes(t));
assert.deepStrictEqual(
  uncategorised.sort(),
  [],
  `these notification types are WRITTEN but unknown to notificationCategory(), so they fall to\n` +
    `SYSTEM — a grey icon and NO deep link: ${uncategorised.join(", ")}.\n` +
    `Add them to packages/types/src/notificationCategory.ts.`,
);

// the customer screen must switch on the CATEGORY, never the raw type
const NOTIF_UI = read("apps/web/app/dashboard/notifications/page.tsx");
assert.ok(
  /switch\s*\(\s*notificationCategory\(/.test(NOTIF_UI),
  "the notifications screen must switch on notificationCategory(), not the raw written type —\n" +
    "the two vocabularies have ZERO overlap, so every row fell to `default`: grey icon, null link.",
);
assert.ok(!/switch\s*\(\s*n\.type\s*\)/.test(NOTIF_UI), "a raw-type switch survives in the notifications screen");
assert.strictEqual(notificationCategory("BOOKING_CREATED"), "BOOKING");
assert.strictEqual(notificationCategory("PAYOUT_COMPLETED"), "PAYMENT");
assert.strictEqual(notificationCategory("NOT_A_REAL_TYPE"), "SYSTEM", "unknown types must fall to SYSTEM, never to a wrong link");

// ── R7: THE BOUNDARY — the samagri writer fills the column readers read ──
const AUTH_CTRL = read("services/api/src/controllers/auth.controller.ts");
const SERVICES_TAB = read("apps/web/app/pandit/[id]/ServicesTab.tsx");
const readsFixed = /fixedPrice/.test(SERVICES_TAB);
if (readsFixed) {
  assert.ok(
    /fixedPrice:\s*numericPrice/.test(AUTH_CTRL),
    "customer readers read SamagriPackage.fixedPrice, but the live pandit write path fills only\n" +
      "`price`. Two price columns exist; the writer must fill the one the readers read.\n" +
      "NOTE this is invisible on a seeded DB — packages/db/prisma/seed.ts writes BOTH, which is\n" +
      "exactly why it survived: it only appears for packages a real pandit created.",
  );
  assert.ok(
    /fixedPrice\s*\?\?\s*p\.price|p\.fixedPrice\s*\?\?/.test(SERVICES_TAB),
    "the reader must coalesce fixedPrice ?? price so rows written before the writer fix still render",
  );
}

console.log(
  `✓ vocabulary-boundary guard passed (${PAYMENT_STATUSES.size} payment statuses; ` +
    `${sentKeys.length} admin query keys all read; ${written.size} notification types all categorised)`,
);
