import assert from "node:assert";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// ─────────────────────────────────────────────────────────────
// TRAVEL-MODE NORMALIZATION GUARD. The web wizard's "LOCAL" is not a
// TravelMode enum value — passing it raw 500'd prisma.booking.create for
// EVERY local booking (found live in the P-PAY E2E; the money path never
// reached Razorpay). createBooking must normalize: only real enum values
// pass through; anything else = no travel (mode null, NOT_REQUIRED).
// ─────────────────────────────────────────────────────────────

console.log("Running travel-mode-enum guard (booking create path)…");

const svc = readFileSync(join(__dirname, "..", "services", "booking.service.ts"), "utf8");

assert.ok(
  /\["SELF_DRIVE", "TRAIN", "FLIGHT", "CAB", "BUS"\]\.includes\(input\.travelMode \?\? ""\)/.test(svc),
  "createBooking must whitelist travelMode against the real enum",
);
assert.ok(
  !/travelMode:\s*input\.travelMode as any,/.test(svc),
  "the raw travelMode pass-through must not come back",
);
assert.ok(
  /"NOT_REQUIRED"/.test(svc),
  "non-travel bookings must record travelStatus NOT_REQUIRED",
);

console.log("travel-mode-enum guard: LOCAL & friends normalize to no-travel ✅");
