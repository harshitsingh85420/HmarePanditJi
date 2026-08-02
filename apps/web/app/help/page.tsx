// ─────────────────────────────────────────────────────────────
// HELP — Track 1, batch 2d. A NEW route, and the third leg of the canon's
// bottom nav. Ruled 2026-08-02 (Isj, Ruling 1): Help ships BEFORE the nav,
// because "a navigation tab is a promise the destination keeps."
//
// THE CANON'S ENTIRE DESCRIPTION OF THIS SCREEN IS ONE LINE:
//   "Help — one tappable phone number + staffed hours · cancellation policy
//    in plain words"                    (customer-canon-inventory.md:62)
// There is NO ARTBOARD. Every layout decision below is gap-fill on my taste,
// declared as such — the same licence /ceremonies was built under, and for the
// same reason: this route has no legacy shape, so building it from the
// description overwrites nothing.
//
// LANGUAGE — ENGLISH, deliberately and by law. The canon's turn-4 reversal:
// "English-first. The interface reads in English everywhere a customer must
// act." Devanagari is a typographic accent permitted in exactly two places
// (a pandit's name beneath its Roman form; the ceremony name on the
// confirmation) and "never instructions · never buttons · never anything he
// must act on." A Help screen is nothing BUT things he must act on.
//   Ruling 1 named "the जल्द उपलब्ध shape" for the honest absence. That is
// pandit-app vocabulary; the SHAPE transfers, the script does not. Flagged to
// Isj rather than pasted in.
//
// THE NUMBER IS CONFIG. See packages/utils/src/support-contact.ts for the
// wa.me lesson it encodes. When nothing real is configured — which is the
// state this ships in today — there is NO CALL CONTROL AT ALL.
//
// WHY NO DISABLED BUTTON HERE, given the canon's disabled-control law
// ("a disabled control always prints its reason beneath itself"): that law
// governs controls that EXIST and are temporarily shut. A greyed-out "Call us"
// asserts a phone line exists and is momentarily unavailable. No line exists.
// Rendering the control at all would be the fabrication wearing a helpful
// face — the same move 2c deleted from the Confirmed screen.
//
// THE CANCELLATION FIGURES ARE NOT RESTATED HERE, ON PURPOSE. The guard at
// services/api/src/lib/payment-money.test.ts pins ONE page — the legal one —
// to refund-policy.ts. A second copy of 100/50/0 on this screen would be
// unguarded, and an unguarded second copy of a refund number is exactly the
// divergence that produced the live incident (legal said 90/50/20/0 while the
// cancel screen computed 100/50/0). Plain words here; figures behind the link.
// ─────────────────────────────────────────────────────────────

import type { Metadata } from "next";
import Link from "next/link";
import { resolveSupportPhone, resolveSupportHours } from "@hmarepanditji/utils";

export const metadata: Metadata = {
  title: "Help",
  description:
    "How to reach us, and how changing or cancelling a booking works on HmarePanditJi.",
};

export default function HelpPage() {
  // Read as a COMPLETE static member expression. Next inlines NEXT_PUBLIC_*
  // textually at build time; process.env[key] or destructuring yields
  // undefined in the browser bundle.
  const support = resolveSupportPhone(process.env.NEXT_PUBLIC_SUPPORT_PHONE);
  const hours = resolveSupportHours(process.env.NEXT_PUBLIC_SUPPORT_HOURS);

  return (
    <div className="hpj-root mx-auto w-full max-w-[720px] px-4 py-8">
      <header className="mb-6">
        <h1 className="text-display font-bold text-ink">Help</h1>
        <p className="mt-2 text-body text-muted">
          If something about your booking is unclear, this page is the short version.
        </p>
      </header>

      {/* ── REACHING A PERSON ──────────────────────────────────── */}
      <section className="rounded-card border border-hairline bg-cream p-4">
        <h2 className="text-section font-semibold text-ink">Talk to us</h2>

        {support ? (
          <>
            <a
              href={support.telHref}
              className="mt-3 flex min-h-cta items-center justify-center gap-2 rounded-btn bg-saffron px-5 text-body font-semibold text-white"
            >
              <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
                call
              </span>
              Call {support.display}
            </a>
            {/* Hours ride WITH the number and never without it: staffed hours
                for a line that does not exist is a promise with no subject. */}
            {hours ? <p className="mt-2 text-label text-muted">{hours}</p> : null}
          </>
        ) : (
          <p className="mt-3 rounded-panel bg-cream-warm px-3 py-2 text-label text-muted">
            We do not have a phone line yet. Everything below can be done from your
            own bookings, and we would rather say this plainly than give you a
            number that rings nowhere.
          </p>
        )}
      </section>

      {/* ── CHANGING OR CANCELLING ─────────────────────────────── */}
      <section className="mt-4 rounded-card border border-hairline bg-cream p-4">
        <h2 className="text-section font-semibold text-ink">
          Changing or cancelling a booking
        </h2>
        <p className="mt-2 text-body text-ink">
          Plans change. How much comes back depends on how far ahead you cancel —
          the earlier you tell us, the more of it returns. The platform fee is not
          refunded when you are the one cancelling.
        </p>
        <p className="mt-2 text-body text-ink">
          You cancel from your own bookings, and the exact amount is shown to you
          before you confirm anything.
        </p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/dashboard/bookings"
            className="flex min-h-cta items-center justify-center rounded-btn bg-saffron px-5 text-body font-semibold text-white"
          >
            Go to My Bookings
          </Link>
          {/* The (legal) route group is parenthesised — it contributes nothing
              to the URL. /cancellation-policy is the live path. */}
          <Link
            href="/cancellation-policy"
            className="flex min-h-cta items-center justify-center rounded-btn border border-hairline bg-cream px-5 text-body font-semibold text-ink"
          >
            Read the full terms
          </Link>
        </div>
      </section>

      {/* ── WHAT TO EXPECT FROM PANDIT JI ──────────────────────── */}
      <section className="mt-4 rounded-card border border-hairline bg-cream p-4">
        <h2 className="text-section font-semibold text-ink">
          Before the day itself
        </h2>
        <p className="mt-2 text-body text-ink">
          Pandit ji reviews every request before it is confirmed. Once he has, his
          name and phone number appear on the booking, so you can reach him
          directly about samagri, timing, or the space you have.
        </p>
        <p className="mt-2 text-body text-muted">
          If you are still deciding what a ceremony involves, the{" "}
          <Link href="/ceremonies" className="font-semibold text-saffron underline">
            ceremony guide
          </Link>{" "}
          says how long each one runs and what it usually costs.
        </p>
      </section>
    </div>
  );
}
