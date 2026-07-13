import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

// ─────────────────────────────────────────────────────────────
// L2 (truthful-state, safety slice) — BUILD-FAILING DIALABLE-TEL GUARD.
// A `tel:` link the phone cannot dial is a broken promise on the exact
// screens where it matters most: the SOS / help buttons. `tel:+911800PANDIT`
// shipped and silently did nothing when tapped. LAW: every `tel:` URL in
// the pandit app is dialable — only a leading `+` and digits (separators
// space/-/(/) allowed for readability). Any letter → build fails here.
// ─────────────────────────────────────────────────────────────

const SRC = join(__dirname, "..");
// capture the tel: target up to the closing quote
const TEL = /tel:([^"'`\s)]+)/g;
// dialable = optional leading +, then digits and cosmetic separators only
const DIALABLE = /^\+?[0-9()\-\s]+$/;

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    const st = statSync(p);
    if (st.isDirectory()) {
      if (entry === "node_modules" || entry === ".next") continue;
      walk(p, out);
    } else if (/\.(tsx?|jsx?)$/.test(entry) && !/\.test\.(tsx?|jsx?)$/.test(entry)) {
      out.push(p);
    }
  }
  return out;
}

describe("L2 dialable-tel guard", () => {
  it("every tel: link in the pandit app is dialable (digits only)", () => {
    const violations: string[] = [];
    for (const file of walk(SRC)) {
      const text = readFileSync(file, "utf8");
      let m: RegExpExecArray | null;
      TEL.lastIndex = 0;
      while ((m = TEL.exec(text)) !== null) {
        const num = m[1];
        // dynamic targets (tel:${phoneVar}) are runtime data, not a static
        // literal the guard can verify — the value's correctness is the
        // app's data responsibility, not this static check.
        if (num.includes("${")) continue;
        if (!DIALABLE.test(num)) {
          violations.push(`${file.replace(SRC, "src")}  tel:${num}`);
        }
      }
    }
    expect(violations, `non-dialable tel: link(s) — the phone cannot call these:\n${violations.join("\n")}`).toEqual([]);
  });

  it("the guard actually rejects a lettered number (self-check)", () => {
    expect(DIALABLE.test("+911800PANDIT")).toBe(false);
    expect(DIALABLE.test("18004654357")).toBe(true);
    expect(DIALABLE.test("+91 1800-465-4357")).toBe(true);
  });
});
