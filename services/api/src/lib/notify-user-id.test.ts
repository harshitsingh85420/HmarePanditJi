import assert from "node:assert";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

// ─────────────────────────────────────────────────────────────
// BUILD-FAILING GUARD — a Notification.userId must be a USER id, never a
// PanditProfile id. The pandit's "new booking" notification silently failed
// (Notification_userId_fkey) for weeks because processPaymentSuccess notified
// with booking.pandit.id (the PROFILE id) — an empty platform: pandits never
// learned a booking arrived. Same trap at two admin sites (booking.panditId,
// which is the PanditProfile FK). This scans EVERY notify/sendNotification-
// bearing file and fails the build if a userId is sourced from a profile id.
//
// The User id comes from: .userId, .user.id, customerId (Booking.customerId is
// a User FK), panditUserId, or a plain user variable. A profile id
// (booking.panditId, <x>.pandit.id, profile.id, <x>Profile.id) is the bug.
// ─────────────────────────────────────────────────────────────

const API_SRC = join(__dirname, "..");

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    const st = statSync(p);
    if (st.isDirectory()) {
      if (entry === "node_modules" || entry === ".next" || entry === "dist") continue;
      walk(p, out);
    } else if (/\.ts$/.test(entry) && !/\.(test|spec)\.ts$/.test(entry)) {
      out.push(p);
    }
  }
  return out;
}

// Profile-id-as-userId antipatterns. Each is a userId sourced from a PROFILE:
//  - booking.panditId              → Booking.panditId is the PanditProfile FK
//  - <x>.pandit.id                 → the PanditProfile object's own id
//  - profile.id / <x>Profile.id    → a *Profile object's id
// Correct forms (.userId, .user.id, customerId, panditUserId) never match.
const BAD_PATTERNS: Array<[RegExp, string]> = [
  [/userId:\s*[\w.]*booking\.panditId\b/, "booking.panditId (PanditProfile FK) used as Notification.userId"],
  [/userId:\s*\w+\.pandit\.id\b/, "<x>.pandit.id (PanditProfile id) used as Notification.userId"],
  [/userId:\s*(?:pandit)?[Pp]rofile\.id\b/, "profile.id used as Notification.userId"],
  [/userId:\s*\w+Profile\.id\b/, "*Profile.id used as Notification.userId"],
];

console.log("Running notify-user-id guard (Notification.userId must be a User id)…");

const violations: string[] = [];
for (const file of walk(API_SRC)) {
  const rel = file.slice(API_SRC.length + 1).split("\\").join("/");
  readFileSync(file, "utf8").split("\n").forEach((line, i) => {
    for (const [re, why] of BAD_PATTERNS) {
      if (re.test(line)) violations.push(`src/${rel}:${i + 1}  ${why}\n      ${line.trim().slice(0, 100)}`);
    }
  });
}

if (violations.length) {
  console.error(`\n${violations.length} profile-id-as-userId violation(s):`);
  for (const v of violations) console.error("  " + v);
}
assert.strictEqual(violations.length, 0, "a Notification is created with a PROFILE id — use the pandit's User id (.userId / .user.id)");

// self-checks: the guard catches the known-bad, ignores the known-good
assert.ok(BAD_PATTERNS.some(([re]) => re.test("userId: booking.panditId,")), "must flag booking.panditId");
assert.ok(BAD_PATTERNS.some(([re]) => re.test("userId: booking.pandit.id }")), "must flag booking.pandit.id");
assert.ok(!BAD_PATTERNS.some(([re]) => re.test("userId: booking.pandit.userId,")), "must NOT flag .pandit.userId");
assert.ok(!BAD_PATTERNS.some(([re]) => re.test("userId: booking.customerId,")), "must NOT flag customerId");
assert.ok(!BAD_PATTERNS.some(([re]) => re.test("userId: pandit.userId,")), "must NOT flag pandit.userId");

console.log("notify-user-id guard: every Notification.userId is a User id ✅");
