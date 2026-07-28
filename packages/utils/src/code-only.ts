/**
 * codeOnly — strip comments (and optionally string contents) before searching source.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * WHY THIS EXISTS — the sixth sighting of one class.
 *
 * A guard that greps raw source cannot tell CODE from PROSE. Every time, the
 * guard's own explanatory comment — the paragraph describing the forbidden
 * pattern — contains the forbidden pattern, and the guard convicts itself.
 * That has now happened six times in this campaign:
 *
 *   1. kycContract asserted a forbidden status literal that its own comment
 *      spelled out.
 *   2. a superlative deny-list containing "#1" matched the hex colour #1a140d.
 *   3. panditIdentityReads condemned the CORRECT nested `user.name`.
 *   4. paymentSourceLabels — the label prose contained the token under test.
 *   5. displayChargeBoundary — the component extractor read the comment above
 *      the expression.
 *   6. a SCOUT GREP reported "DRIFT-B: 5 sites still hand-concatenating
 *      /api/customers" when all five hits were the comments recording the fix.
 *
 * It was cured six times, per case, by hand. Ten near-copies of a
 * hand-rolled `stripComments` accumulated across the repo in THREE divergent
 * variants, none of which handled trailing comments and any of which would
 * have mangled a URL. So:
 *
 *   DISCIPLINE THAT MUST BE REMEMBERED IS A TOOL THAT WASN'T BUILT.
 *
 * This is that tool. Every guard and every scripted search routes through it.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * WHY A SCANNER AND NOT A REGEX. The obvious `replace(/\/\/.*$/gm, "")` is
 * wrong in the exact repo these guards police: `"http://localhost:3001"` and
 * `https://api.hmarepanditji.com/api/v1` both contain `//`. A regex stripper
 * silently truncates every URL in the file — and URLs are precisely what the
 * api-base guards assert on. So this walks the source with a small state
 * machine that knows strings, templates (including nested `${}`), and regex
 * literals, and only treats `//` as a comment when it is genuinely code.
 *
 * LINE NUMBERS ARE PRESERVED. Stripped spans become spaces, never deleted
 * lines, so a match index still maps to the real file:line. All ten
 * hand-rolled copies dropped lines and silently shifted every number after the
 * first comment.
 */

export interface CodeOnlyOptions {
  /**
   * Treat `#` as a line comment too. For `.env`, `.yml`, `.sh`, Dockerfiles.
   * Off by default because `#` is legal in JS/TS (private fields, `#!`).
   */
  hash?: boolean;
  /**
   * What to do with string and template literal CONTENTS.
   *   "keep"  (default) — leave them. Correct for guards that assert on
   *                       literals: token keys, URL paths, Hindi copy.
   *   "blank"           — replace contents with spaces, keeping the quotes.
   *                       Use when an identifier search must not match the
   *                       same word appearing inside user-facing text.
   */
  strings?: "keep" | "blank";
}

const isRegexStart = (prev: string): boolean => {
  // A `/` begins a regex literal (rather than division) when the previous
  // significant character cannot end an expression.
  if (prev === "") return true;
  return "(,=:[!&|?{};+-*%^~<>".includes(prev);
};

/**
 * Returns `source` with every comment replaced by spaces of equal length,
 * so offsets and line numbers are unchanged.
 *
 * @example
 *   const src = codeOnly(readFileSync(file, "utf8"));
 *   assert.ok(!src.includes("getItem(\"token\")"), "...");
 */
export function codeOnly(source: string, options: CodeOnlyOptions = {}): string {
  const { hash = false, strings = "keep" } = options;
  const out = source.split("");
  const blank = (from: number, to: number) => {
    for (let k = from; k < to; k++) if (out[k] !== "\n") out[k] = " ";
  };

  let i = 0;
  let prevSignificant = "";
  // Depth of `${ … }` interpolations we are currently inside, so a `}` knows
  // whether it closes an interpolation and returns us to template text.
  const templateStack: number[] = [];

  while (i < source.length) {
    const c = source[i];
    const next = source[i + 1];

    // ── line comment ──────────────────────────────────────────────────────
    if (c === "/" && next === "/") {
      let j = i;
      while (j < source.length && source[j] !== "\n") j++;
      blank(i, j);
      i = j;
      continue;
    }
    if (hash && c === "#") {
      let j = i;
      while (j < source.length && source[j] !== "\n") j++;
      blank(i, j);
      i = j;
      continue;
    }

    // ── block comment (covers {/* JSX */} too) ────────────────────────────
    if (c === "/" && next === "*") {
      const end = source.indexOf("*/", i + 2);
      const j = end === -1 ? source.length : end + 2;
      blank(i, j);
      i = j;
      continue;
    }

    // ── string literal ────────────────────────────────────────────────────
    if (c === '"' || c === "'") {
      const quote = c;
      let j = i + 1;
      while (j < source.length) {
        if (source[j] === "\\") { j += 2; continue; }
        if (source[j] === quote || source[j] === "\n") break;
        j++;
      }
      if (strings === "blank") blank(i + 1, j);
      i = j + 1;
      prevSignificant = quote;
      continue;
    }

    // ── template literal ──────────────────────────────────────────────────
    if (c === "`") {
      let j = i + 1;
      while (j < source.length) {
        if (source[j] === "\\") { j += 2; continue; }
        if (source[j] === "`") break;
        if (source[j] === "$" && source[j + 1] === "{") {
          // Interpolations hold real code — comments inside them must still be
          // stripped, so hand control back to the main loop.
          if (strings === "blank") blank(i + 1, j);
          templateStack.push(1);
          i = j + 2;
          prevSignificant = "{";
          break;
        }
        j++;
      }
      if (templateStack.length && i <= j) continue;
      if (strings === "blank") blank(i + 1, j);
      i = j + 1;
      prevSignificant = "`";
      continue;
    }
    if (c === "}" && templateStack.length) {
      // Close the interpolation and resume scanning template text.
      templateStack.pop();
      let j = i + 1;
      while (j < source.length) {
        if (source[j] === "\\") { j += 2; continue; }
        if (source[j] === "`") break;
        if (source[j] === "$" && source[j + 1] === "{") {
          templateStack.push(1);
          if (strings === "blank") blank(i + 1, j);
          i = j + 2;
          prevSignificant = "{";
          break;
        }
        j++;
      }
      if (templateStack.length && i <= j) continue;
      if (strings === "blank") blank(i + 1, j);
      i = j + 1;
      prevSignificant = "`";
      continue;
    }

    // ── regex literal (so `/foo\/\/bar/` is not read as a comment) ─────────
    if (c === "/" && isRegexStart(prevSignificant)) {
      let j = i + 1;
      let inClass = false;
      let closed = false;
      while (j < source.length && source[j] !== "\n") {
        if (source[j] === "\\") { j += 2; continue; }
        if (source[j] === "[") inClass = true;
        else if (source[j] === "]") inClass = false;
        else if (source[j] === "/" && !inClass) { closed = true; break; }
        j++;
      }
      if (closed) {
        i = j + 1;
        prevSignificant = "/";
        continue;
      }
    }

    if (!/\s/.test(c)) prevSignificant = c;
    i++;
  }

  return out.join("");
}

/**
 * Read a file and return it with comments stripped. The one-liner every guard
 * wants.
 */
export const codeOnlyOf = (
  readFileSyncUtf8: (p: string) => string,
  path: string,
  options?: CodeOnlyOptions,
): string => codeOnly(readFileSyncUtf8(path), options);

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * THE DELIBERATE EXCEPTION — read this before "fixing" a guard that skips
 * codeOnly(). It is documented HERE, next to the rule, so the next person sees
 * both together and does not remove one without seeing the other.
 *
 * RULE:      assert against CODE, not prose. Route every search through codeOnly().
 * EXCEPTION: unless the asserted artifact IS the comment.
 *
 * The live instance is SLOT 5 of the अभिलेख record card
 * (apps/web/components/design/PanditRecordCard.tsx). Slot 5 is RESERVED — it
 * deliberately renders nothing, and the only thing pinning that intent is the
 * comment naming it. A guard proving "slot 5 is still reserved and nobody has
 * quietly filled it" must therefore read RAW source; strip the comments and
 * the artifact under test disappears and the guard passes vacuously forever.
 *
 * So: a guard may read raw source ONLY when the thing it asserts is itself a
 * comment, and it must say so at the read site by using this constant:
 *
 *   // eslint-disable-next-line -- see RAW_SOURCE_REQUIRED in packages/utils
 *   const raw = readFileSync(p, "utf8"); // RAW_SOURCE_REQUIRED: slot 5 is a comment
 *
 * Any other raw read is the bug this file exists to prevent.
 * ─────────────────────────────────────────────────────────────────────────────
 */
export const RAW_SOURCE_REQUIRED =
  "This guard asserts on a COMMENT (e.g. the RESERVED slot-5 marker), so it must read raw source. Every other guard uses codeOnly().";
