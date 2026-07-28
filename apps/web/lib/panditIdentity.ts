/**
 * THE PANDIT'S NAME AND NUMBER — one resolver, used everywhere.
 *
 * THE BREAK THIS EXISTS FOR (found by the three-act walk, owed four turns):
 * the customer's booking screens read `booking.pandit.name` and
 * `booking.pandit.phone`. `PanditProfile` has NEITHER column — the API serves
 * the booking with `pandit: { include: { user: true } }`, so the human's name
 * and number live at `pandit.user.name` / `pandit.user.phone`.
 *
 * The result shipped as:
 *   "Pt. " followed by nothing, and  href="tel:undefined"
 * on the booking detail and the live-tracking screen — i.e. **on the day of
 * the ceremony, the only way the customer has to reach his pandit.**
 *
 * THE UNREACHABILITY PATTERN: callers take a `BookingPandit`, whose type does
 * NOT declare `name` or `phone` at the top level. Reading `pandit.name` is now
 * a compile error rather than a silent undefined — the wrong read cannot be
 * written, which is stronger than catching it afterwards.
 */

/** The pandit as a booking response actually carries him. */
export interface BookingPandit {
  id?: string;
  /** PanditProfile columns that DO exist. */
  displayName?: string | null;
  fullName?: string | null;
  profilePhotoUrl?: string | null;
  city?: string | null;
  location?: string | null;
  /** The human. Name and phone live HERE, and only here. */
  user?: {
    id?: string;
    name?: string | null;
    phone?: string | null;
    email?: string | null;
  } | null;
}

/**
 * His display name, or null when we genuinely do not have one.
 *
 * Returns NULL rather than a placeholder so callers must decide what to show.
 * `"Pt. " + null` is at least visibly empty; the old bug rendered a confident
 * honorific attached to nothing.
 */
export function panditName(pandit: BookingPandit | null | undefined): string | null {
  if (!pandit) return null;
  const n = pandit.user?.name || pandit.displayName || pandit.fullName;
  return n && String(n).trim() ? String(n).trim() : null;
}

/** "Pt. Ramesh Sharma", or null — never a bare honorific. */
export function panditTitleName(pandit: BookingPandit | null | undefined): string | null {
  const n = panditName(pandit);
  return n ? `Pt. ${n}` : null;
}

/** The initial for an avatar fallback, or null. */
export function panditInitial(pandit: BookingPandit | null | undefined): string | null {
  const n = panditName(pandit);
  return n ? n.charAt(0) : null;
}

/**
 * His phone number, or null.
 *
 * CALLERS MUST NOT BUILD A tel: LINK WHEN THIS IS NULL. `tel:undefined` and
 * `https://wa.me/` are dead links that look live — the customer taps them on
 * the day of the ceremony and nothing happens. Use `canCall()` to gate the
 * control's existence, not just its href.
 */
export function panditPhone(pandit: BookingPandit | null | undefined): string | null {
  const p = pandit?.user?.phone;
  return p && String(p).trim() ? String(p).trim() : null;
}

/** True only when a call control should be RENDERED AT ALL. */
export function canCall(pandit: BookingPandit | null | undefined): boolean {
  return panditPhone(pandit) !== null;
}

/** tel: href, or null when there is no number to dial. */
export function telHref(pandit: BookingPandit | null | undefined): string | null {
  const p = panditPhone(pandit);
  return p ? `tel:${p}` : null;
}

/** wa.me href, or null. Never the bare domain. */
export function whatsappHref(pandit: BookingPandit | null | undefined): string | null {
  const p = panditPhone(pandit);
  return p ? `https://wa.me/${p.replace(/[^\d]/g, "")}` : null;
}
