import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// L1 EXACTLY-ONCE LAW, grep-enforced. The money paths (booking
// accept/reject/complete/journey) MUST go through mutateOnce (client
// single-in-flight + Idempotency-Key) and the server handlers MUST use
// the atomic conditional-transition idempotency pattern. This test FAILS
// the build if a future edit reverts to a raw api() POST or an
// unconditional prisma.update on those routes.
const SRC = join(__dirname, "..");
const read = (rel: string) => readFileSync(join(SRC, rel), "utf-8");
const API_SRC = join(SRC, "..", "..", "..", "services", "api", "src");
const readApi = (rel: string) => readFileSync(join(API_SRC, rel), "utf-8");

describe("L1 — exactly-once actions", () => {
  it("mutate.ts is the single client wrapper (in-flight dedupe + Idempotency-Key)", () => {
    const src = read("lib/mutate.ts");
    expect(src).toContain("Idempotency-Key");
    expect(src).toContain("inFlight");
    expect(src).toMatch(/export function mutateOnce/);
  });

  it("booking request screen routes accept & reject through mutateOnce (no raw api POST)", () => {
    const src = read("app/(dashboard-group)/bookings/[id]/request/page.tsx");
    expect(src).toContain("mutateOnce(`accept:");
    expect(src).toContain("mutateOnce(`reject:");
    // no direct api() POST to the mutation endpoints
    expect(src).not.toMatch(/api\(`\/pandit\/bookings\/\$\{[^}]+\}\/accept`/);
    expect(src).not.toMatch(/api\(`\/pandit\/bookings\/\$\{[^}]+\}\/reject`/);
  });

  it("booking detail screen routes complete & journey through mutateOnce", () => {
    const src = read("app/(dashboard-group)/bookings/[id]/page.tsx");
    expect(src).toContain("mutateOnce(`complete:");
    expect(src).toContain("mutateOnce(");
    expect(src).not.toMatch(/api\(`\/pandit\/bookings\/\$\{[^}]+\}\/complete`/);
  });

  // L-B — the guard must grep the handlers the client ACTUALLY calls
  // (auth.controller.ts via the singular /pandit/* routes), NOT the uncalled
  // /pandits plugin (pandit.routes.ts). The old version grepped the plugin and
  // was a FALSE GREEN while the real completeBooking/postBookingJourney stayed
  // non-idempotent (matrix C3 silent death). This is the corrected enforcement.
  it("the CLIENT-CALLED server handlers (auth.controller) are atomic + idempotent", () => {
    const src = readApi("controllers/auth.controller.ts");
    // accept, reject, complete, journey each flip via a conditional updateMany.
    const updateManyCount = (src.match(/(?:prisma|tx)\.booking\.updateMany/g) || []).length;
    expect(updateManyCount).toBeGreaterThanOrEqual(4);
    // a race / retry-after-lost-response gets idempotent success, never a bare
    // 409 false-failure that tells the pandit his completed puja failed.
    expect(src).toMatch(/idempotent:\s*true/);
    // completeBooking must NOT reject an already-COMPLETED retry with 409.
    expect(src).not.toContain("Booking is already completed.");
    // journey must be idempotent on the TARGET step, never a blind step+1 update.
    expect(src).toMatch(/booking\.journeyStep\s*>=\s*targetStep/);
    expect(src).not.toMatch(/data:\s*\{\s*journeyStep:\s*nextStep/);
  });
});
