import assert from "node:assert";
import { proveMatchers, proveSaw } from "./g2";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { codeOnly } from "@hmarepanditji/utils/code-only";
import {
  panditView,
  canAcceptFromView,
  ACCEPTABLE_VIEW,
  ACCEPTABLE_DB_STATUSES,
  CANCELLABLE_DB_STATUSES,
} from "./bookingStatus";

// ─────────────────────────────────────────────────────────────
// THE DEAD-CONTROL LAW, APPLIED TO STATE.
//
//     "No state that cannot be accepted may render an accept control."
//
// WHAT HAPPENED. bookingStatus.ts mapped BOTH `CREATED` (born unpaid) and
// `PANDIT_REQUESTED` (paid, awaiting the pandit) to the single view
// "REQUESTED". The pandit's नई विनती tab therefore showed an unpaid booking as
// an actionable request, and स्वीकार करें answered
//     409 invalid_state · "Only a pending booking can be accepted."
// because the accept handler hand-listed ["PANDIT_REQUESTED", "REQUESTED"].
//
// Two lists, in two files, disagreeing about one status — and the disagreement
// was invisible because the view collapsed the two states into one word. The
// first real booking this product ever took (HPJ-2026-19028) hit it, on the
// pandit's first ever request.
//
// A control that always fails is worse than no control: it teaches him the app
// is broken, and it teaches him on the booking he cares most about.
//
// WHAT THIS GUARD PINS: the two lists are now ONE derived source, the unpaid
// state is separately nameable, no accept affordance is drawn on it — and the
// couplings that the split silently broke stay fixed.
// ─────────────────────────────────────────────────────────────

console.log("Running dead-control-state guard…");

const REPO = join(__dirname, "..", "..", "..", "..");
const read = (p: string) => codeOnly(readFileSync(join(REPO, p), "utf8"));

// ── 1. the two states are SEPARATELY NAMEABLE ────────────────
assert.notStrictEqual(
  panditView("CREATED"),
  panditView("PANDIT_REQUESTED"),
  "CREATED and PANDIT_REQUESTED map to the SAME pandit view again. One is unpaid and " +
    "unacceptable, the other is acceptable — collapsing them is what made स्वीकार करें a " +
    "button that always 409s.",
);
assert.strictEqual(panditView("CREATED"), "AWAITING_PAYMENT");
assert.strictEqual(panditView("PANDIT_REQUESTED"), ACCEPTABLE_VIEW);

// ── 2. acceptability is DERIVED, and CREATED is not in it ────
assert.ok(
  !ACCEPTABLE_DB_STATUSES.includes("CREATED"),
  "CREATED is back in the acceptable set. The accept handler cannot transition from it — " +
    "processPaymentSuccess is what produces PANDIT_REQUESTED.",
);
assert.ok(ACCEPTABLE_DB_STATUSES.includes("PANDIT_REQUESTED"));
assert.ok(canAcceptFromView("REQUESTED"));
assert.ok(!canAcceptFromView("AWAITING_PAYMENT"));

// ── 3. the HANDLER derives, it does not hand-list ────────────
// This is the actual defect. Re-introducing a literal array here is how the two
// lists drifted apart the first time.
const AUTH = read("services/api/src/controllers/auth.controller.ts");
const acceptIdx = AUTH.indexOf("export const acceptBooking");
assert.ok(acceptIdx > 0, "acceptBooking not found — this guard has lost its subject");
const acceptBody = AUTH.slice(acceptIdx, acceptIdx + 2500);
assert.ok(
  /const PENDING = \[\.\.\.ACCEPTABLE_DB_STATUSES\]/.test(acceptBody),
  "acceptBooking hand-lists the statuses it accepts from instead of deriving them from " +
    "ACCEPTABLE_DB_STATUSES. A second copy of the state machine is exactly the bug this fixes.",
);
assert.ok(
  !/const PENDING = \[\s*"/.test(acceptBody),
  'acceptBooking declares PENDING as a literal string array again (`const PENDING = ["…`).',
);

// ── 4. the ADMIN CANCEL COUPLING the split nearly broke ──────
// CANCELLABLE_DB_STATUSES is derived from dbStatusesForView("REQUESTED") +
// ("ACCEPTED"). Splitting CREATED out of "REQUESTED" silently removed it from
// that set — which would have taken away ops' ability to cancel precisely the
// rows the split creates. Deriving made the omission VISIBLE, not impossible.
assert.ok(
  CANCELLABLE_DB_STATUSES.has("CREATED"),
  "CREATED fell out of the ops-cancellable set. An unpaid booking is the MOST likely thing " +
    "a customer phones to cancel; ops must be able to.",
);
// …and the route must IMPORT that one set rather than rebuild it. Rebuilding is
// how this broke: admin.routes.ts and adminStatusSets.test.ts each derived the
// set independently, the split updated one, and the guard failed on correct code.
const ADMIN = read("services/api/src/routes/admin.routes.ts");
assert.ok(
  /import \{[^}]*CANCELLABLE_DB_STATUSES[^}]*\} from "\.\.\/lib\/bookingStatus"/.test(ADMIN),
  "admin.routes.ts no longer imports CANCELLABLE_DB_STATUSES from lib/bookingStatus — if it is " +
    "deriving its own copy again, the two definitions will drift exactly as they did before.",
);
assert.ok(
  !/const CANCELLABLE_DB_STATUSES = new Set/.test(ADMIN),
  "admin.routes.ts declares its own CANCELLABLE_DB_STATUSES again — one rule, one definition.",
);

// ── 5. NO ACCEPT AFFORDANCE IS DRAWN ON THE UNPAID STATE ─────
const LIST = read("apps/pandit/src/app/(dashboard-group)/bookings/page.tsx");
assert.ok(
  /const awaitingItems = bookings\.filter\(\(b\) => b\.status === "AWAITING_PAYMENT"\)/.test(LIST),
  "the pandit list no longer buckets AWAITING_PAYMENT separately — unpaid rows have fallen " +
    "back into नई विनती, or vanished from the screen entirely",
);
// The accept SCREEN is /bookings/:id/request. Only the acceptable view may route there.
const clickIdx = LIST.indexOf("const handleCardClick");
const clickBody = LIST.slice(clickIdx, LIST.indexOf("};", clickIdx));
assert.ok(
  /b\.status === "REQUESTED"/.test(clickBody) && !/AWAITING_PAYMENT/.test(clickBody),
  "the row click routes something other than REQUESTED to /request — that screen is the " +
    "accept control, and an unpaid booking must never reach it",
);
// …and the row must not print the "answer me" affordance.
const awaitIdx = LIST.indexOf("awaitingItems.map");
assert.ok(awaitIdx > 0, "the AWAITING_PAYMENT section is gone");
const awaitSection = LIST.slice(awaitIdx, awaitIdx + 1200);
assert.ok(
  !/जवाब दीजिए/.test(awaitSection),
  'the unpaid row renders "जवाब दीजिए ›" — the affordance that cannot work',
);

// ── 6. THE UNHANDLED-STATE LIE ───────────────────────────────
// StatusChip's switch and the detail page's getStatusConfig both END in a
// default branch. StatusChip's default says "✖ रद्द" and the detail page's says
// "en route". An unhandled AWAITING_PAYMENT would have told the pandit his
// booking was CANCELLED, or that he was already travelling to it. A default
// branch that names a REAL state makes every unhandled state a lie.
const CHIP = read("apps/pandit/src/components/ui/StatusChip.tsx");
assert.ok(
  /case "AWAITING_PAYMENT":/.test(CHIP),
  'StatusChip has no case for AWAITING_PAYMENT — it falls to `default:`, which renders ' +
    '"✖ रद्द". The app would tell the pandit his booking was cancelled when it is merely unpaid.',
);
const DETAIL = read("apps/pandit/src/app/(dashboard-group)/bookings/[id]/page.tsx");
const cfgIdx = DETAIL.indexOf("const getStatusConfig");
const cfgBody = DETAIL.slice(cfgIdx, cfgIdx + 900);
assert.ok(
  /AWAITING_PAYMENT/.test(cfgBody),
  "the booking detail's getStatusConfig has no AWAITING_PAYMENT branch — it falls through to " +
    'the "en route" default, claiming the pandit is already travelling to an unpaid booking',
);
const STR = read("apps/pandit/src/lib/strings.ts");
assert.ok(
  /awaitingPayment: "/.test(STR),
  "status.awaitingPayment is missing from strings.ts — both surfaces above would render the " +
    "key name or an empty chip",
);

// ─────────────────────────────────────────────────────────────
// PROVE-TO-FAIL (law G2). Every matcher above must be shown able to SEE its
// own subject. Seven times in this campaign a guard could not match the shape
// it hunted — a `\s` inside a double-quoted string, a capture stopping at the
// wrong brace, a lookahead that excluded its target. A guard that has never
// been shown to fail is a guard that has never been shown to work.
// Each case below feeds the REAL shape the assertion is meant to catch.
// ─────────────────────────────────────────────────────────────
const mustMatch: Array<[string, RegExp, string]> = [
  [
    "hand-listed PENDING (the original defect, verbatim)",
    /const PENDING = \[\s*"/,
    '  const PENDING = ["PANDIT_REQUESTED", "REQUESTED"];',
  ],
  [
    "derived PENDING (the fix)",
    /const PENDING = \[\.\.\.ACCEPTABLE_DB_STATUSES\]/,
    "  const PENDING = [...ACCEPTABLE_DB_STATUSES];",
  ],
  [
    "the awaiting bucket, as written",
    /const awaitingItems = bookings\.filter\(\(b\) => b\.status === "AWAITING_PAYMENT"\)/,
    '  const awaitingItems = bookings.filter((b) => b.status === "AWAITING_PAYMENT");',
  ],
  [
    "the dead affordance, as written in the live row",
    /जवाब दीजिए/,
    "                            जवाब दीजिए ›",
  ],
  [
    "the chip case, as written",
    /case "AWAITING_PAYMENT":/,
    '    case "AWAITING_PAYMENT":',
  ],
  [
    "the admin import of the ONE cancellable set, as written",
    /import \{[^}]*CANCELLABLE_DB_STATUSES[^}]*\} from "\.\.\/lib\/bookingStatus"/,
    'import { dbStatusesForView, CANCELLABLE_DB_STATUSES } from "../lib/bookingStatus";',
  ],
  [
    "a re-declared local cancellable set (the regression), verbatim",
    /const CANCELLABLE_DB_STATUSES = new Set/,
    "const CANCELLABLE_DB_STATUSES = new Set<string>([",
  ],
  [
    "the strings key, as written",
    /awaitingPayment: "/,
    '    awaitingPayment: "⏳ भुगतान बाकी",',
  ],
];
proveMatchers("deadControlState", mustMatch);

// The click-routing assertion is a COMPOUND (positive AND negative); prove both
// halves independently, using the real shape of the regression it must catch.
const badClick = `const handleCardClick = (b) => {
    if (b.status === "REQUESTED" || b.status === "AWAITING_PAYMENT") {
      router.push(\`/bookings/\${b.id}/request\`);
    }`;
assert.ok(
  !(/b\.status === "REQUESTED"/.test(badClick) && !/AWAITING_PAYMENT/.test(badClick)),
  "MATCHER BLIND: the click-routing check passes a body that DOES route AWAITING_PAYMENT to " +
    "the accept screen — the exact regression it exists to catch.",
);

console.log(
  `dead-control-state guard ✅ — CREATED→${panditView("CREATED")} (unacceptable), ` +
    `acceptable=[${ACCEPTABLE_DB_STATUSES.join(", ")}], cancellable keeps CREATED, ` +
    `no accept affordance on the unpaid row, ${mustMatch.length + 1} matchers proven able to fail`,
);

// G2 observation (2026-07-31): every surface this guard greps, read non-empty.
proveSaw("deadControlState", "source files read (non-empty)",
  [AUTH, ADMIN, LIST, CHIP, DETAIL, STR].filter((s) => s.length > 0).length);
