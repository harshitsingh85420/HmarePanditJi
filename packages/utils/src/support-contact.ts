// ─────────────────────────────────────────────────────────────
// THE OPS CONTACT IS AN ENV TRUTH, NEVER A SOURCE LITERAL.
//
// Ruled 2026-08-02 (Isj, Ruling 1): "THE NUMBER COMES FROM CONFIG, never a
// source literal (the wa.me lesson — ops contact is an env truth). If no real
// number is configured yet, the screen says so honestly — an honest absence
// beats a dead number."
//
// THE wa.me LESSON, restated so this file explains itself: the condemned tree
// carries six reads of NEXT_PUBLIC_WHATSAPP_NUMBER and every one of them ends
// `?? "919999999999"`. A fallback shaped like a phone number is worse than no
// number — it renders a live-looking control that dials nothing, and nobody
// can tell by looking. The defect is not the missing number; it is the
// FALLBACK that hides the missing number.
//
// So this module returns `null` rather than a string, and the caller is
// therefore forced to decide whether the CONTROL EXISTS AT ALL — not merely
// what its href says. `href={x ?? "#"}` cannot be written against this API
// without the author noticing they are writing it.
//
// WHY IT LIVES IN packages/utils AND NOT apps/web/lib: the guard that pins
// this law (services/api/src/lib/supportContact.test.ts) must EXECUTE the
// resolver against planted specimens, not merely grep for it. A guard that
// re-implements the logic it checks proves only that two copies agree.
// This module has no React and no DOM, exactly like api-base.ts, so a bare
// node+tsx guard can import and run it.
// ─────────────────────────────────────────────────────────────

export interface SupportContact {
  /** Human-readable, e.g. "+91 98765 43210". Never rendered when null. */
  display: string;
  /** A tel: href that dials a real number, or the object does not exist. */
  telHref: string;
}

/**
 * Placeholders are detected STRUCTURALLY, not enumerated.
 *
 * The enumeration instinct is the one this project has already paid for twice
 * (cityKey normalises the nukta rather than listing every spelling). A list of
 * known fakes is a list of the fakes someone thought of; the shapes below are
 * what "not a real number" actually looks like.
 */
function isPlaceholderShape(raw: string, digits: string): boolean {
  // 1. The literal template shape — "91XXXXXXXXXX", "+91-XXXXX-XXXXX".
  //    Checked on the RAW value, because stripping non-digits deletes the X.
  if (/x{4,}/i.test(raw)) return true;
  // 2. One digit repeated — 9999999999, 0000000000, and 919999999999.
  //    The country code is stripped ONLY at the length that makes it a country
  //    code (12 = 91 + 10). Stripping "91" off any string that starts with it
  //    would maul the real mobile 9123456789 into "23456789" and get it
  //    refused by rule 3 below — a false negative that would send the operator
  //    straight back to a source literal.
  const local = digits.length === 12 && digits.startsWith("91") ? digits.slice(2) : digits;
  if (/^(\d)\1+$/.test(local)) return true;
  // 3. A straight run up or down — 1234567890, 9876543210.
  //    9876543210 is the single most common fake Indian number in demos and
  //    it passes every "is it a valid mobile" check ever written.
  const ASC = "01234567890123456789";
  const DESC = "98765432109876543210";
  if (local.length >= 8 && (ASC.includes(local) || DESC.includes(local))) return true;
  return false;
}

/**
 * Resolve the configured support number, or null when nothing real is set.
 *
 * @param rawEnv value of process.env.NEXT_PUBLIC_SUPPORT_PHONE.
 *   NEXT_PUBLIC_* is inlined at BUILD time, so an unset var arrives as the
 *   EMPTY STRING and not as undefined — `??` would never fire. Trim and test,
 *   the same way resolveApiBase does (api-base.ts:36).
 *
 * @returns null when the value is absent, a placeholder, or not a number this
 *   country can dial. Null means: RENDER NO CALL CONTROL.
 */
export function resolveSupportPhone(rawEnv: string | undefined): SupportContact | null {
  const raw = (rawEnv || "").trim();
  if (raw === "") return null;

  const digits = raw.replace(/\D/g, "");
  if (digits === "") return null;
  if (isPlaceholderShape(raw, digits)) return null;

  // Indian mobile: optional 91 country code, then 10 digits opening 6-9.
  const mobile = /^(?:91)?([6-9]\d{9})$/.exec(digits);
  if (mobile) {
    const local = mobile[1];
    return {
      display: `+91 ${local.slice(0, 5)} ${local.slice(5)}`,
      telHref: `tel:+91${local}`,
    };
  }

  // A landline with its STD code — 011 2345 6789 and friends. An ops desk is
  // allowed to be a landline; refusing one would push the operator back to a
  // source literal, which is the defect this module exists to prevent.
  const landline = /^(?:91)?(0\d{9,10})$/.exec(digits);
  if (landline) {
    // The trunk 0 is a domestic-dialling artefact and must not survive into an
    // international href. Display and href carry the SAME digits, so what the
    // customer reads is what his handset dials.
    const national = landline[1].slice(1);
    return { display: `+91 ${national}`, telHref: `tel:+91${national}` };
  }

  // Anything else is not dialable from an Indian handset with confidence.
  // Refusing is the honest answer: a wrong number rings a stranger.
  return null;
}

/** True only when a call control should be RENDERED AT ALL. */
export function canCallSupport(rawEnv: string | undefined): boolean {
  return resolveSupportPhone(rawEnv) !== null;
}

/**
 * Staffed hours, or null.
 *
 * Hours are a SEPARATE truth from the number and must never be hard-coded
 * beside it: the pandit app prints "सुबह 8 – रात 10" statically above an
 * always-live call row, so at 3am it promises staff who are not there. A
 * caption is a claim about people.
 *
 * The caller must additionally refuse to render hours when there is no number
 * — staffed hours for a line that does not exist is a promise with no subject.
 */
export function resolveSupportHours(rawEnv: string | undefined): string | null {
  const s = (rawEnv || "").trim();
  return s === "" ? null : s;
}
