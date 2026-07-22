import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { estimateSampleBooking, COSTING } from "./priceEstimate";

// PRICE-HONESTY guard. The meter must compute from the ACTUAL server costing
// rules — never a slogan, never an invented number. This FAILS THE BUILD if the
// client rates drift from the server, if a rule-less cost (hotel/flight) starts
// showing a fake figure, or if a fee line sneaks onto this pandit-facing meter.
// Founder decision 2026-07-21 (CONFLICT_RULINGS #7): the pandit keeps 100% of
// the dakshina; the platform fee is a SEPARATE charge the CUSTOMER pays on top
// and NEVER reduces the payout. So the meter mirrors the pandit's PAYOUT —
// dakshina + pass-throughs — with no fee line.
const API = join(__dirname, "..", "..", "..", "..", "services", "api", "src");
const read = (rel: string) => readFileSync(join(API, rel), "utf-8");

describe("price-honesty meter — computed from real rules", () => {
  it("client COSTING rates MATCH the server constants (drift fails the build)", () => {
    const consts = read("config/constants.ts");
    expect(consts).toMatch(new RegExp(`SELF_DRIVE_RATE_PER_KM\\s*=\\s*${COSTING.selfDriveRatePerKm}\\b`));
    expect(consts).toMatch(new RegExp(`FOOD_ALLOWANCE_PER_DAY\\s*=\\s*${COSTING.foodAllowancePerDay}\\b`));
    // platform fee is the single PLATFORM_FEE_PERCENT constant — the client rate must equal it/100
    const m = consts.match(/PLATFORM_FEE_PERCENT\s*=\s*(\d+)/);
    expect(m).toBeTruthy();
    expect(COSTING.platformFeePct).toBe(Number(m![1]) / 100);
    // the ONE money source computes the fee from the constant
    const pricing = read("utils/pricing.ts");
    expect(pricing).toMatch(/\*\s*\(PLATFORM_FEE_PERCENT\s*\/\s*100\)/);
  });

  it("100% PAYOUT: the pandit meter shows dakshina + pass-throughs, NO fee deduction", () => {
    const r = estimateSampleBooking(
      { selfDrive: true, train: false, flight: false, dailyFoodAllowance: null, stayAtHome: true },
      2100,
    );
    // dakshina 2100 + selfDrive(200km×12=2400) + food(1000) — nothing taken out
    expect(r.total).toBe(2100 + 2400 + 1000);
    expect(r.lines.every((l) => !l.label.includes("शुल्क") && !l.label.includes("GST"))).toBe(true);
    expect(r.demandLevel).toBe("कम");
    // the server payout matches: panditPayout = dakshina + pass-throughs, with
    // the platform fee NEVER subtracted (the fee is customer-paid, on top).
    const pricing = read("utils/pricing.ts");
    expect(pricing).toMatch(/const panditPayout = dakshinaAmount \+ travelCost \+ foodAllowanceAmount \+ accommodationCost;/);
    // and the customer grandTotal DOES add the fee on top (separate charge)
    expect(pricing).toMatch(/const grandTotal =\s*\n?\s*dakshinaAmount \+\s*\n?\s*platformFee \+/);
  });

  it("NEVER invents a number for a rule-less cost (flight, hotel)", () => {
    const r = estimateSampleBooking(
      { selfDrive: false, train: false, flight: true, dailyFoodAllowance: null, stayAtHome: false },
      2100,
    );
    const flight = r.lines.find((l) => l.label.includes("हवाई"));
    const hotel = r.lines.find((l) => l.label.includes("होटल"));
    expect(flight?.amount).toBeNull(); // no rule → note, not a number
    expect(hotel?.amount).toBeNull();
    expect(flight?.note).toBeTruthy();
    // the uncomputable costs are NOT summed into the total
    expect(r.total).toBe(2100 + 1000);
    expect(r.demandLevel).toBe("ज़्यादा");
  });

  it("low demand = fully-computed & कम; high demand surfaces premium notes & ज़्यादा", () => {
    const low = estimateSampleBooking({ selfDrive: true, train: false, flight: false, dailyFoodAllowance: 500, stayAtHome: true }, 2100);
    const high = estimateSampleBooking({ selfDrive: false, train: false, flight: true, dailyFoodAllowance: 2000, stayAtHome: false }, 2100);
    // low demand: every line is a computed number — nothing hidden, position कम
    expect(low.lines.every((l) => l.amount !== null)).toBe(true);
    expect(low.demandLevel).toBe("कम");
    expect(low.total).toBe(2100 + 2400 + 500); // lower allowance genuinely lowers the total
    // high demand: flight + hotel are real premiums shown as "बुकिंग पर तय" notes
    // (never invented), and the position is ज़्यादा — the honest nudge.
    expect(high.lines.some((l) => l.amount === null && l.note)).toBe(true);
    expect(high.demandLevel).toBe("ज़्यादा");
  });
});
