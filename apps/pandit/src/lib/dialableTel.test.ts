import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
// GREP OVER SOURCE CANNOT TELL CODE FROM COMMENTARY. This guard convicted
// bookings/[id] twice for the literal "tel:null" — both matches inside the
// COMMENTS documenting the fix that removed the real tel:null. A guard that
// reads raw source punishes the file for explaining itself, which teaches
// authors to delete the explanation. codeOnly() is the one comment-stripper.
import { codeOnly } from "@hmarepanditji/utils/code-only";

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
      // comments stripped: a "tel:null" in prose ABOUT the defect is not the
      // defect. String contents survive codeOnly, so a real href still convicts.
      const text = codeOnly(readFileSync(file, "utf8"));
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

  it("code convicts, commentary does not (the false-positive that taught it)", () => {
    // the exact shape that convicted bookings/[id]: the defect NAMED in a
    // comment about its own fix. Same string, both sides of the boundary.
    const commentOnly = codeOnly('// this button rendered href="tel:null", a dead dial\nconst x = 1;');
    const realDefect = codeOnly('<a href="tel:null">Call</a>');
    const scan = (text: string): string[] => {
      const hits: string[] = [];
      let m: RegExpExecArray | null;
      TEL.lastIndex = 0;
      while ((m = TEL.exec(text)) !== null) {
        if (!m[1].includes("${") && !DIALABLE.test(m[1])) hits.push(m[1]);
      }
      return hits;
    };
    expect(scan(commentOnly), "a tel:null in PROSE about the defect must not convict").toEqual([]);
    expect(scan(realDefect), "a tel:null in an ACTUAL href must still convict — string contents survive codeOnly").toEqual(["null"]);
  });
});
