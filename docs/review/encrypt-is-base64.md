# RULED ORDER #2 — `encrypt()` THAT ONLY BASE64-ENCODES

**Design report, zero code.** Report-first as ruled: identity + money.
Absorbs the two census kills the #1 proof walk exposed, because they are
the same truth's surface.

---

## §1 · THE CIPHER

### 1a · It is worse than the verification said: FOUR writers, THREE formats

My register verification reported two base64 writers. The reader table
run properly finds **four writers of `bankAccountNumber`, in three
different formats, with nothing marking which is which:**

| # | writer | format | note |
|---|---|---|---|
| 1 | `onboarding.controller.ts:268` | **base64** | via `function encrypt(text) { return Buffer.from(text).toString('base64') }` (:18) |
| 2 | `readiness.controller.ts:328` | **base64** | inline `Buffer.from(accNumStr).toString("base64")` — this is the LIVE सत्यापन path |
| 3 | `pandit.routes.ts:308` | **RAW PLAINTEXT** | `bankAccountNumber: req.body.accountNumber` — and it **echoes the value straight back on the wire** at :316 |
| 4 | `voice.routes.ts:453` | **RAW PLAINTEXT** | `bankAccountNumber: data.bankAccountNumber` |

So the production column today holds a **mixture of base64 and
plaintext**. Two of the four writers do not even perform the gesture.
The one named `encrypt` is the most dangerous of the four precisely
because it reads as protection — to a reviewer, to this register, and to
whoever answers a due-diligence questionnaire.

### 1b · What IS encrypted at rest, and what is not

**Encrypted (one field):** `aadhaarEncrypted` — real AES-256-GCM,
`iv + authTag + ciphertext` hex, a format precondition, a production
refusal to encrypt under the git-readable placeholder key, and a
build-failing guard (`encryption-key-guard.test.ts`). **The correct
implementation sits fourteen lines above the base64 one in the same write
block** (`readiness.controller.ts:328` vs `:350`).

**Not encrypted (everything else):** `bankAccountNumber` (base64 or
raw), `bankIfscCode`, `bankName`, `bankAccountName`, `upiId`, phone
numbers, venue `latitude`/`longitude`, addresses.

Note `aadhaarLastFour` — a **separate stored column** holding only the
display digits. That pattern is the answer to §1d.

### 1c · Who reads the column — and a live defect nobody has named

Five readers. Two are format-safe; **two are broken by the format
mixture; one hands the raw value to the admin panel.**

| reader | what it does | verdict |
|---|---|---|
| `pandit.routes.ts:448` | `••••${bankAccountNumber.slice(-4)}` — shown to **the pandit, on his own booking/payout screen** | 🔴 **BROKEN.** On a base64 row this is the last four characters of *base64*, not the last four digits of his account. The pandit is shown a fabricated specific about his own bank account |
| `apps/admin/.../payouts/page.tsx:243` | `Last 4: ••••${slice(-4)}` — **the screen ops pays from** | 🔴 **BROKEN the same way**, and it is the operational identity check before money moves by hand |
| `admin.routes.ts:353` | returns the whole column to the admin panel | ⚠️ hands over base64 or plaintext with no indication which |
| `kyc.service.ts:155` | `!!p.bankAccountNumber` | ✅ existence only |
| `apps/admin/.../pandits/[panditId]/page.tsx:314` | `? "on file" : "—"` | ✅ existence only |

**There is no decrypt path for bank data anywhere** — a repo-wide grep
for `decrypt` outside the Aadhaar module returns nothing. So no code ever
turns the stored value back into an account number. It is read only as
"last four" and as "exists". **That is what makes the migration cheap:
nothing depends on reversibility today.** It is also what makes the two
broken readers the *whole* current cost — a wrong last-four shown to both
the pandit and the operator, with no way to tell an affected row from a
correct one.

### 1d · Recommendation — mirror the Aadhaar shape exactly

Two columns, matching the pattern already shipped and guarded:

- **`bankAccountEncrypted`** — AES-256-GCM via a shared
  `encryptBankAccount()` built on the same key path as
  `encryptAadhaar` (same prod-key refusal, same guard).
- **`bankAccountLast4`** — the four display digits, stored at write time
  from the plaintext, exactly like `aadhaarLastFour`.

This fixes three things at once: the cipher becomes real; the pandit's
and the operator's "last four" become **correct by construction** instead
of derived from an opaque blob; and the decrypt is needed at exactly
**one** site — the admin payout read, admin-only and audited — never on
the pandit wire.

**And `pandit.routes.ts:316` stops echoing the account number in a
response body regardless of format.** That is a wire leak independent of
the cipher.

### 1e · The migration — and the trap Isj named

Existing rows are classifiable with certainty, because the three formats
are disjoint:

| test | format |
|---|---|
| `/^\d{9,18}$/` | raw plaintext |
| base64-decodes to `/^\d{9,18}$/` | base64 |
| `/^[0-9a-f]{56,}$/` and decrypts | already AES |
| none of the above | unrecoverable |

**Isj's trap, stated as the rule:** *a decrypt path that accepts both
formats forever is the half-true guard again.* Agreed, and it is the
same shape as `feeLabel /10%/` — a compatibility branch that keeps
passing while the property it claims to hold quietly stops being true.

**So: one-shot migration, then a single-format reader.** Re-encrypt
plaintext and base64 rows into `bankAccountEncrypted` + `bankAccountLast4`,
drop the old column, and **the reader accepts AES only**. Anything that
fails to decrypt is treated as *bank details absent* — the pandit is
asked to re-enter, which is honest and fail-closed, never a silent
fallback.

**Isj's hand runs it on Neon**, dry-run first naming the affected rows by
count and format, as with every prior migration. **What the guard cannot
prove is that the data moved — only the dry-run's row counts and an
after-count of zero non-AES rows can.** That measurement is part of the
build's proof, not the guard's.

---

## §2 · "Secure 256-bit encrypted checkout" — dies in this item

`booking-wizard-client.tsx:1887`. Three independent reasons, any one
sufficient:

1. **It is a fabricated specific.** "256-bit" names a cipher strength the
   platform does not choose — checkout transport is TLS negotiated by
   Vercel and Razorpay. Same class as the fabricated tithi and the
   hardcoded ETA.
2. **It is self-praise on the paying screen** — census ruled-kill (a),
   sibling of the two lines already killed for asserting the platform's
   own honesty.
3. **On this specific screen it now points at §1.** A customer reading
   "encrypted" beside a payment form is being told something about how we
   hold data — and the field we hold about the person she is paying is
   base64. The claim and the defect ship in the same file.

**Replacement: nothing.** Honest silence. There is no security fact this
screen needs to assert; TLS is universal and unremarkable.

**Sibling flagged, not in scope:** `apps/web/app/nri/page.tsx:259` renders
"SSL Secure Checkout" on the fabricated NRI route. It dies with that
route, which is its own item.

---

## §3 · "This is exactly the amount charged at payment — nothing added on top" — now measurably false

`booking-wizard-client.tsx:1849`. **The #1 proof walk measured it false:**
the same sticky box that carries this sentence also renders **Settled at
booking ₹701**. Something *is* added on top of the ₹1,211 — ₹701 of cash
owed to the pandit at the ceremony. The sentence was true when the box
showed one number; the settled-at-booking row made it a lie, and no guard
noticed because it is prose.

**It cannot simply be deleted** — unlike §2, there is a real fact here the
customer needs: what she pays now versus what she pays by hand. The
honest replacement **names the two obligations separately**:

> **₹1,211 charged now.** ₹701 for samagri is handed to Pandit ji
> directly at the puja — we never take it.

Proposed exact copy for the sub-line under Pay Now (final wording is
Isj's; the requirement is that both numbers appear and the second is
named as not-ours):

- English: *"₹1,211 is charged now. ₹701 goes to Pandit ji directly at the puja — not through us."*
- The Devanagari fee line above it stays as it is; it is already honest.

**When `settledAtBooking` is ₹0** the second sentence must not render at
all — the copy states what the arithmetic contains, per the composition
pin. That coupling is what the guard in §4 pins.

---

## §4 · THE GUARD ON THE BOUNDARY — and what it cannot prove

The lesson from `feeLabel /10%/` is that a guard pinning a *literal*
certifies it after it becomes false. So this pin binds **claims to
mechanisms**, and — more importantly — **pins the writer set**, which is
the boundary version.

### Guard A · THE WRITER-SET PIN (the real boundary)

Every assignment to the bank column must go through the one helper. In
source terms: any `bankAccountNumber` / `bankAccountEncrypted` write that
is not `encryptBankAccount(` fails the build, with the file and line
named. This is directory-independent — it is what would have caught all
four of today's writers, including the two raw ones in routes files no
security guard reads. Detector proves it fires on a *new* raw writer, not
merely on the four known ones.

Companion clause: `Buffer.from(...).toString('base64')` may never appear
in a write path for a credential field, and no function named `encrypt`
may return a `Buffer.toString('base64')`.

### Guard B · THE CLAIM-TO-MECHANISM PIN

Walk the live customer and pandit trees (comments stripped, per #1) for
security-claim patterns — `encrypt`, `256-bit`, `AES`, `bank-grade`,
`SSL`, `secure checkout`. Every hit must appear in a declared allow-list
that names the code mechanism backing it, and **the declared mechanism
string must match the algorithm constant in source** (`aes-256-gcm` in
`aadhaar.ts`). A claim with no declared mechanism fails; a declared
mechanism that no longer matches the constant fails.

That is the anti-`feeLabel` construction: the guard does not assert *"the
string 256 exists"*, it asserts *"this rendered claim is backed by this
named constant, and here is the constant."*

### What these pins CAN prove

- No new security claim renders anywhere in either app without a declared, source-matched mechanism.
- No writer reaches the credential column except through the encryption helper — including writers added later, in files no one thought to guard.
- The base64 `encrypt()` cannot return, under that name or inline.
- The privacy-page Aadhaar claim stays true to the algorithm actually used.

### What these pins CANNOT prove — stated so they are never mistaken for it

- **That the key is strong or secret.** That is ops. A separate guard (`encryption-key-guard.test.ts`) covers only the known placeholder.
- **That data already written was migrated.** Only the migration's dry-run counts and an after-count of zero non-AES rows can. **The guard must not be cited as migration proof.**
- **That the database is encrypted at rest at the disk/provider level.** Neon configuration, not repo state.
- **That TLS is configured.** Vercel/Render infra, not repo state.
- **That a decrypted value is not later logged or echoed.** A separate leak concern; `pandit.routes.ts:316`'s echo is fixed by hand in this item, and a no-echo pin on response bodies is worth its own clause but is not part of the cipher claim.

---

## §5 · BUILD SCOPE, IF RULED

Report-first item; nothing built yet. If ruled as recommended:

1. `packages/db` migration — add `bankAccountEncrypted`, `bankAccountLast4`; **Isj's hand, dry-run first**.
2. `services/api/src/utils/bankAccount.ts` — `encryptBankAccount` / `decryptBankAccount` / `bankLast4`, sharing the Aadhaar key path.
3. All four writers routed through it; `pandit.routes.ts:316` stops echoing the value.
4. Both broken readers switched to `bankAccountLast4`; the admin payout read decrypts at the single site.
5. `booking-wizard-client.tsx` — §2 line deleted, §3 line replaced with the two-obligation copy coupled to `settledAtBooking > 0`.
6. Guards A and B, G2-proven, **red-then-green against the pre-fix files** — the standard set in #1.
7. Census rows for both claims marked executed.

**Proof:** the migration dry-run's row counts by format; an after-count of
zero non-AES rows; a deployed 360×740 screenshot of Review & Pay with the
new copy and no security badge; both guards red-then-green on the real
files.

---

## §6 · WHAT NEEDS YOUR WORD

1. **Two columns (`bankAccountEncrypted` + `bankAccountLast4`), mirroring the Aadhaar shape** — confirm, or say the single-column re-encrypt is preferred and accept that "last four" stays derived.
2. **Migration policy for unrecoverable rows:** treated as *bank details absent* and the pandit re-enters (my recommendation, fail-closed), or held for your manual reconciliation first.
3. **The §3 replacement copy** — the requirement is that both numbers appear and the second is named as not-ours; the exact wording is yours.
4. **Does `upiId` join this item?** It is a payment credential stored in plaintext beside the account number. It is not in your ruled scope for #2, and I have not assumed it in.
