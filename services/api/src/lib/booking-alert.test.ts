import assert from "node:assert";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// ─────────────────────────────────────────────────────────────
// BUILD-FAILING GUARD — F19 booking alert (founder GO, 2026-07-23).
// Live incident: booking SMS was a code-level stub — NotificationService.notify
// wrote a DB row and sent NOTHING (the Twilio call was commented out), while a
// fully-built real sender (notifyNewBookingToPandit) sat uncalled. A pandit
// with the app closed never learned a booking arrived.
// Pins:
//  1. The payment-capture moment (PANDIT_REQUESTED — when the booking becomes
//     his to accept) calls the REAL notifyNewBookingToPandit with the REAL
//     bookingNumber (the old template built HPJ-<uuid-fragment>).
//  2. The pandit's User row (phone) is loaded for it.
//  3. The SMS body obeys the REGISTER LAW (Devanagari, आप-forms — the old
//     draft was roman Hindi) and the TRUTHFUL-STATE ruling: the pandit is told
//     "हम आपको फ़ोन भी करेंगे" — the operator call is the guaranteed path
//     (pilot-ops-runbook.md §2); this SMS is best-effort, never the promise.
//  4. The real Twilio channel exists behind it (not a stub).
// PROVEN-TO-FAIL: re-stub the call site or re-romanise the message → red.
// ─────────────────────────────────────────────────────────────

console.log("Running booking-alert guard (F19: real SMS + register + truthful-state)…");

const SRC = join(__dirname, "..");
const paymentSvc = readFileSync(join(SRC, "services", "payment.service.ts"), "utf8");
const notifSvc = readFileSync(join(SRC, "services", "notification.service.ts"), "utf8");

// 1) the capture site calls the REAL sender with the REAL booking number
const captureIdx = paymentSvc.indexOf("processPaymentSuccess");
assert.ok(captureIdx > 0, "processPaymentSuccess must exist");
const captureBlock = paymentSvc.slice(captureIdx);
assert.ok(/notifyNewBookingToPandit\(\{/.test(captureBlock), "payment capture must call the REAL notifyNewBookingToPandit (not the stub notify)");
assert.ok(/bookingNumber:\s*updated\.bookingNumber/.test(captureBlock), "the alert must carry the REAL bookingNumber (HPJ-2026-…), not a uuid fragment");

// 2) the pandit's phone is actually loadable at that site
assert.ok(/pandit:\s*\{\s*include:\s*\{\s*user:\s*true\s*\}\s*\}/.test(captureBlock), "processPaymentSuccess must include pandit.user (the phone lives on User)");
assert.ok(/panditPhone:\s*booking\.pandit\.user\?\.phone/.test(captureBlock), "the alert must be addressed to the pandit's real phone");

// 3) register law + truthful-state in the SMS body
const msgIdx = notifSvc.indexOf("notifyNewBookingToPandit");
const msgBlock = notifSvc.slice(msgIdx, notifSvc.indexOf("export async function", msgIdx + 10));
assert.ok(/नई बुकिंग/.test(msgBlock), "SMS must be Devanagari (register law)");
assert.ok(/स्वीकार कीजिए/.test(msgBlock), "SMS must use respectful -इए imperative (register law)");
assert.ok(/हम आपको फ़ोन भी करेंगे/.test(msgBlock), "TRUTHFUL-STATE: the pandit is promised the CALL — the guaranteed path — not an app alert");
for (const roman of ["nayi booking", "Accept/Reject", "Aapki net earning", "App mein"]) {
  assert.ok(!msgBlock.includes(roman), `roman-Hindi leftover "${roman}" must not return (register law)`);
}

// 4) the real Twilio channel is behind it (graceful stub only when keys absent)
assert.ok(/client\.messages\.create\(\{\s*body,\s*from:\s*env\.TWILIO_PHONE_NUMBER/.test(notifSvc), "the real Twilio send path must exist behind sendSms");

console.log("booking-alert guard: real sender wired at capture, real bookingNumber, register-clean Devanagari, फ़ोन promise present ✅");
