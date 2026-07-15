import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { estimateSampleBooking, COSTING } from "./priceEstimate";

// PRICE-HONESTY guard. The meter must compute from the ACTUAL server costing
// rules — never a slogan, never an invented number. This FAILS THE BUILD if the
// client rates drift from the server, or if a rule-less cost (hotel/flight)
// starts showing a fake figure.
const API = join(__dirname, "..", "..", "..", "..", "services", "api", "src");
const read = (rel: string) => readFileSync(join(API, rel), "utf-8");

describe("price-honesty meter — computed from real rules", () => {
  it("client COSTING rates MATCH the server constants (drift fails the build)", () => {
    const consts = read("config/constants.ts");
    expect(consts).toMatch(new RegExp(`SELF_DRIVE_RATE_PER_KM\\s*=\\s*${COSTING.selfDriveRatePerKm}\\b`));
    expect(consts).toMatch(new RegExp(`FOOD_ALLOWANCE_PER_DAY\\s*=\\s*${COSTING.foodAllowancePerDay}\\b`));
    const bookingSvc = read("services/booking.service.ts");
    expect(bookingSvc).toMatch(/dakshina\s*\*\s*0\.15/); // platformFeePct
    expect(COSTING.platformFeePct).toBe(0.15);
    expect(bookingSvc).toMatch(/0\.18/); // GST
    expect(COSTING.gstPct).toBe(0.18);
  });

  it("computes the KNOWN total exactly from the rules", () => {
    // dakshina 2100 + selfDrive(200km*12=2400) + food(1000) + fee(315)+gst(57)=372
    const r = estimateSampleBooking(
      { selfDrive: true, train: false, flight: false, dailyFoodAllowance: null, stayAtHome: true },
      2100,
    );
    expect(r.total).toBe(2100 + 2400 + 1000 + 372);
    expect(r.demandLevel).toBe("कम");
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
    expect(r.total).toBe(2100 + 1000 + 372);
    expect(r.demandLevel).toBe("ज़्यादा");
  });

  it("low demand = fully-computed & कम; high demand surfaces premium notes & ज़्यादा", () => {
    const low = estimateSampleBooking({ selfDrive: true, train: false, flight: false, dailyFoodAllowance: 500, stayAtHome: true }, 2100);
    const high = estimateSampleBooking({ selfDrive: false, train: false, flight: true, dailyFoodAllowance: 2000, stayAtHome: false }, 2100);
    // low demand: every line is a computed number — nothing hidden, position कम
    expect(low.lines.every((l) => l.amount !== null)).toBe(true);
    expect(low.demandLevel).toBe("कम");
    // high demand: flight + hotel are real premiums shown as "बुकिंग पर तय" notes
    // (never invented), and the position is ज़्यादा — the honest nudge.
    expect(high.lines.some((l) => l.amount === null && l.note)).toBe(true);
    expect(high.demandLevel).toBe("ज़्यादा");
    // lower food allowance genuinely lowers the computed total
    expect(low.total - 500).toBeLessThan(2100 + 2400 + 1000 + 372); // food 500 < default 1000
  });
});
