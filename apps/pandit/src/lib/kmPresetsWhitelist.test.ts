import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// ─────────────────────────────────────────────────────────────
// KM PRESETS ⊆ SERVER WHITELIST (PAGE 8 P1, Isj option (a), 2026-07-25).
// The R3 travel form's distance pills included 10 and 999 ("100+ कि.मी.")
// while the API's KM_STEPS whitelist didn't — choosing either made the
// save 400-fail. The server list was widened; this guard reads BOTH
// source files so the two can never drift apart again (single-source by
// pin: any new client pill must exist server-side before it ships).
// ─────────────────────────────────────────────────────────────

const REPO = join(__dirname, "..", "..", "..", "..");

const parseArray = (src: string, marker: string): number[] => {
  const i = src.indexOf(marker);
  expect(i, `${marker} not found`).toBeGreaterThan(-1);
  const m = src.slice(i).match(/\[([\d,\s]+)\]/);
  expect(m, `${marker} has no literal array`).toBeTruthy();
  return m![1].split(",").map((x) => Number(x.trim())).filter((n) => !Number.isNaN(n));
};

describe("R3 distance pills — client presets ⊆ server whitelist", () => {
  it("every client KM preset is accepted by the API", () => {
    // client presets are { km, label } objects — collect the km: values
    const wizardSrc = readFileSync(join(REPO, "apps", "pandit", "src", "app", "(dashboard-group)", "readiness", "page.tsx"), "utf8");
    const presetsBlock = wizardSrc.slice(wizardSrc.indexOf("KM_PRESETS"), wizardSrc.indexOf("];", wizardSrc.indexOf("KM_PRESETS")));
    const client = [...presetsBlock.matchAll(/km:\s*(\d+)/g)].map((m) => Number(m[1]));
    const server = parseArray(
      readFileSync(join(REPO, "services", "api", "src", "controllers", "readiness.controller.ts"), "utf8"),
      "const KM_STEPS",
    );
    expect(client.length).toBeGreaterThanOrEqual(3);
    for (const km of client) {
      expect(server, `client offers ${km} कि.मी. but the server would 400 it`).toContain(km);
    }
  });
});
