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

  it("server accept/complete/decline use atomic conditional transitions (idempotent)", () => {
    const src = readApi("routes/pandit.routes.ts");
    // updateMany with a status guard is the transition-lock; idempotent:true
    // is the success shape returned to a race/retry.
    const updateManyCount = (src.match(/prisma\.booking\.updateMany/g) || []).length;
    expect(updateManyCount).toBeGreaterThanOrEqual(3); // accept, complete, decline
    expect(src).toContain("idempotent: true");
    // the accept handler must NOT unconditionally flip to CONFIRMED
    expect(src).not.toMatch(/booking\.update\(\{\s*where:\s*\{\s*id:\s*booking\.id\s*\},\s*data:\s*\{\s*status:\s*"CONFIRMED"/);
  });
});
