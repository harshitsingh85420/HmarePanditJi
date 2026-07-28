import assert from "node:assert";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
// Comments are stripped by the ONE shared implementation. See
// packages/utils/src/code-only.ts for why this is a scanner and not a
// regex, and for the single documented raw-source exception.
import { codeOnly } from "@hmarepanditji/utils/code-only";
// (the /code-only SUBPATH, not the barrel: the barrel re-exports
//  auth-context.tsx, which requires React — unresolvable in bare node+tsx.)

// ─────────────────────────────────────────────────────────────
// THE EVENT-DAY PAIR — the customer must be able to see and call his pandit.
// Isj order, owed four turns; found by the three-act walk.
//
// THE BREAK: the customer's booking screens read `booking.pandit.name` and
// `booking.pandit.phone`. PanditProfile has NEITHER column. The API serves the
// booking with `pandit: { include: { user: true } }`, so both live at
// `pandit.user.*`. What shipped:
//     "Pt. "  followed by nothing        and    href="tel:undefined"
// on the booking detail AND the live-tracking screen — on the day of the
// ceremony, the customer's only way to reach the man who is coming.
//
// THE LAW: no client file may read `name` or `phone` directly off a booking's
// pandit. Everything goes through apps/web/lib/panditIdentity.ts, whose
// BookingPandit type does not DECLARE those fields at the top level — so the
// wrong read is a compile error, not a silent undefined.
// "Fix the read, then make the wrong read impossible to write."
// ─────────────────────────────────────────────────────────────

console.log("Running pandit-identity read guard (the event-day pair)...");

const REPO = join(__dirname, "..", "..", "..", "..");

function walk(dir: string, out: string[] = []): string[] {
  for (const e of readdirSync(dir)) {
    if (e === "node_modules" || e === ".next" || e === "dist") continue;
    const p = join(dir, e);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.(ts|tsx)$/.test(e) && !/\.test\.tsx?$/.test(e)) out.push(p);
  }
  return out;
}

// ── 1. the resolver exists and refuses to invent a number ─────
const LIB = codeOnly(readFileSync(join(REPO, "apps/web/lib/panditIdentity.ts"), "utf8"));
for (const fn of ["panditName", "panditTitleName", "panditPhone", "canCall", "telHref", "whatsappHref"]) {
  assert.ok(new RegExp(`export function ${fn}\\b`).test(LIB), `panditIdentity must export ${fn}`);
}
assert.ok(
  /pandit\?\.user\?\.phone/.test(LIB),
  "the phone must be resolved from pandit.user.phone — the only place it exists",
);
// the UNREACHABILITY half: the shared type must NOT declare name/phone at the
// top level, or autocomplete will offer the wrong read again.
const iface = LIB.slice(LIB.indexOf("export interface BookingPandit"), LIB.indexOf("export function panditName"));
// Strip the NESTED user block first — `user.name` and `user.phone` are the
// CORRECT fields and must stay. Only a TOP-LEVEL name/phone is the wrong read.
const topLevel = iface.replace(/user\?\s*:\s*\{[\s\S]*?\}\s*\|\s*null;/, "user?: <stripped>;");
assert.ok(/user\?\s*:/.test(iface), "BookingPandit must carry the nested `user` — that is where name and phone live");
assert.ok(!/^\s{2}name\??\s*:/m.test(topLevel), "BookingPandit must NOT declare a top-level `name` — that is the wrong read");
assert.ok(!/^\s{2}phone\??\s*:/m.test(topLevel), "BookingPandit must NOT declare a top-level `phone` — that is the wrong read");

// ── 2. no client file reads them off a booking's pandit ───────
const offenders: string[] = [];
for (const app of ["apps/web/app", "apps/web/components"]) {
  for (const f of walk(join(REPO, app))) {
    const src = codeOnly(readFileSync(f, "utf8"));
    // booking.pandit.name / booking.pandit?.phone / b.pandit.name …
    if (/\bpandit\s*\??\s*\.\s*(name|phone)\b/.test(src)) {
      // a LOCAL object the file built itself (e.g. `const pandit = { name }`)
      // is legitimate — only flag reads off a BOOKING's pandit.
      if (/\b\w+\s*\??\s*\.\s*pandit\s*\??\s*\.\s*(name|phone)\b/.test(src)) {
        offenders.push(f.replace(REPO, "").replace(/\\/g, "/"));
      }
    }
  }
}
assert.deepStrictEqual(
  offenders,
  [],
  `these files read name/phone off a booking's pandit, where neither column exists.\n` +
    `Use panditTitleName()/telHref() from apps/web/lib/panditIdentity:\n  ${offenders.join("\n  ")}`,
);

// ── 3. no dead tel:/wa.me link can be constructed ─────────────
const deadLinks: string[] = [];
for (const app of ["apps/web/app", "apps/web/components"]) {
  for (const f of walk(join(REPO, app))) {
    const src = codeOnly(readFileSync(f, "utf8"));
    // a tel: built by interpolation must come from telHref(), which returns
    // null rather than the string "tel:undefined"
    if (/href=\{`tel:\$\{/.test(src) || /href=\{`https:\/\/wa\.me\/\$\{/.test(src)) {
      deadLinks.push(f.replace(REPO, "").replace(/\\/g, "/"));
    }
  }
}
assert.deepStrictEqual(
  deadLinks,
  [],
  `these files interpolate a tel:/wa.me href directly. When the number is missing that renders\n` +
    `tel:undefined — a dead link that looks live, tapped on the day of the ceremony.\n` +
    `Use telHref()/whatsappHref() and gate the control with canCall():\n  ${deadLinks.join("\n  ")}`,
);

console.log("✓ pandit-identity read guard passed (no bare name/phone reads, no dead tel: links)");
