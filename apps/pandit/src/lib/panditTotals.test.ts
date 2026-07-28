import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
// Comments are stripped by the ONE shared implementation. See
// packages/utils/src/code-only.ts for why this is a scanner and not a
// regex, and for the single documented raw-source exception.
import { codeOnly } from "../../../../packages/utils/src/code-only";
// (deep path, not the barrel: @hmarepanditji/utils re-exports auth-context.tsx,
//  which requires React — unresolvable in these bare node+tsx guard runs.)

// ─────────────────────────────────────────────────────────────
// RULING B — THE PANDIT NEVER SEES THE CUSTOMER'S TOTAL.
// Isj order, 2026-07-28, after the three-act walk caught it live.
//
// THE BREAK: the booking card rendered `b.grandTotal` — dakshina PLUS the
// customer's platform fee (₹5,610 on a ₹5,100 booking). The pandit was shown
// ₹510 more than he will ever be paid, at the exact moment he decides whether
// to accept. He would accept expecting one number and be paid another.
//
// THE LAW: no pandit-facing file may read a customer-inclusive total. He is
// owed `platformTransfersToPandit` (100% of dakshina + pass-throughs, fee never deducted),
// or `dakshinaAmount` where that is the whole of it.
//
// SCOPE: the WHOLE app. The earlier census of this class was scoped to one
// screen and passed it clean — which is exactly how the booking list kept
// leaking. (Guard-coverage law: cover the contract, not the site of the last
// burn.)
// ─────────────────────────────────────────────────────────────

const SRC = join(__dirname, "..");

// A guard that greps source must read CODE, not prose: the comment explaining
// a forbidden field would otherwise trip the assertion forbidding it.

function walk(dir: string, out: string[] = []): string[] {
  for (const e of readdirSync(dir)) {
    if (e === "node_modules" || e === ".next") continue;
    const p = join(dir, e);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.(ts|tsx)$/.test(e) && !/\.test\.tsx?$/.test(e)) out.push(p);
  }
  return out;
}

/**
 * Fields that include money the pandit does not receive. `grandTotal` is the
 * customer's charge; `platformFee` is the platform's cut. Either one printed
 * as his figure is a false promise about his earnings.
 */
const CUSTOMER_INCLUSIVE = ["grandTotal", "platformFeeGst", "travelServiceFee"];

describe("Ruling B · the pandit is never shown the customer's total", () => {
  const files = walk(SRC);

  it("scans a real number of pandit-app files", () => {
    expect(files.length).toBeGreaterThan(50);
  });

  for (const field of CUSTOMER_INCLUSIVE) {
    it(`no pandit-facing file READS \`${field}\` off a booking`, () => {
      const offenders: string[] = [];
      for (const f of files) {
        const src = codeOnly(readFileSync(f, "utf8"));
        // a property READ (b.grandTotal / booking.grandTotal), not a type-only
        // declaration and not a string
        if (new RegExp(`\\.\\s*${field}\\b`).test(src)) {
          offenders.push(f.replace(SRC, "").replace(/\\/g, "/"));
        }
      }
      expect(
        offenders,
        `these pandit-app files read \`${field}\`, which includes money the pandit does not receive. ` +
          `Show him platformTransfersToPandit (or dakshinaAmount) instead:\n  ${offenders.join("\n  ")}`,
      ).toEqual([]);
    });
  }

  it("the booking list shows his own figure", () => {
    const list = readFileSync(join(SRC, "app/(dashboard-group)/bookings/page.tsx"), "utf8");
    const code = codeOnly(list);
    expect(code).toMatch(/function panditEarns/);
    expect(code).toMatch(/panditEarns\(b\)\.toLocaleString/);
    // and the interface must not even declare the customer total, so it
    // cannot be reached for by autocomplete
    expect(code).not.toMatch(/grandTotal\s*:/);
  });
});
