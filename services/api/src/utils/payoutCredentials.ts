/**
 * HmarePanditJi — PAYOUT CREDENTIAL CIPHER (ruled order #2, Isj 2026-08-04)
 *
 * THE DEFECT THIS REPLACES: `bankAccountNumber` was written in three formats
 * at once — base64 by `function encrypt(text) { return Buffer.from(text)
 * .toString('base64') }` in onboarding.controller.ts, base64 inline in
 * readiness.controller.ts, and RAW PLAINTEXT by pandit.routes.ts and
 * voice.routes.ts. `upiId` was plaintext throughout. Nothing ever decrypted
 * either: they were read only as `slice(-4)`, which on a base64 row printed
 * the last four characters of BASE64 to the pandit as his own account digits,
 * and to the operator as the identity check before money moved by hand.
 *
 * THE SHAPE, mirroring Aadhaar exactly:
 *   <field>Encrypted  — AES-256-GCM ciphertext, for the ONE admin-only
 *                       decrypt site (the payout screen Isj pays from)
 *   <field>Last4/Masked — the DISPLAY value, stored at capture from the
 *                       plaintext, so every masked surface is correct by
 *                       construction and never derived from the blob
 *
 * ONE CIPHER, ONE KEY PATH: both come from utils/aadhaar.ts, so the
 * production refusal to encrypt under the git-readable placeholder key
 * protects payout credentials too.
 *
 * FAIL-CLOSED, NOT BACKWARD-COMPATIBLE. `tryDecryptPayoutField` returns null
 * for anything that is not AES — it never falls back to base64 or plaintext.
 * A decrypt path that accepts both formats forever is the half-true guard
 * again (Isj): it keeps passing while the property it claims stops being
 * true, exactly like a label guard pinned to the old value. An unreadable
 * row is BANK DETAILS ABSENT, surfaced to the pandit on his own screen and
 * to the operator before anyone is paid — never a silent fallback.
 */

import crypto from "crypto";
import { ALGORITHM, getEncryptionKey } from "./aadhaar";

const IV_LENGTH = 16;
const TAG_LENGTH = 16;
const ENCODING = "hex" as const;

/** AES-256-GCM. Returns hex: iv + authTag + ciphertext (the Aadhaar layout). */
export function encryptPayoutField(plaintext: string): string {
  const value = String(plaintext ?? "").trim();
  if (!value) throw new Error("Refusing to encrypt an empty payout credential");
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(value, "utf8", ENCODING);
  encrypted += cipher.final(ENCODING);
  return iv.toString(ENCODING) + cipher.getAuthTag().toString(ENCODING) + encrypted;
}

/** Strict decrypt. Throws on any non-AES or tampered value — callers that
 *  must not throw use tryDecryptPayoutField. */
export function decryptPayoutField(encryptedHex: string): string {
  const key = getEncryptionKey();
  const iv = Buffer.from(encryptedHex.slice(0, IV_LENGTH * 2), ENCODING);
  const authTag = Buffer.from(encryptedHex.slice(IV_LENGTH * 2, (IV_LENGTH + TAG_LENGTH) * 2), ENCODING);
  const ciphertext = encryptedHex.slice((IV_LENGTH + TAG_LENGTH) * 2);
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  let out = decipher.update(ciphertext, ENCODING, "utf8");
  out += decipher.final("utf8");
  return out;
}

/** THE FAIL-CLOSED READ. null means "we cannot read this" — treat as absent. */
export function tryDecryptPayoutField(value: string | null | undefined): string | null {
  if (!value || !isAesCiphertext(value)) return null;
  try {
    return decryptPayoutField(value);
  } catch {
    return null;
  }
}

/** Shape test only — hex, and long enough to carry iv + tag + at least one
 *  byte. Used by the reader (fail-closed) and by the migration classifier. */
export function isAesCiphertext(value: string | null | undefined): boolean {
  if (!value) return false;
  const min = (IV_LENGTH + TAG_LENGTH) * 2 + 2;
  return value.length >= min && value.length % 2 === 0 && /^[0-9a-f]+$/.test(value);
}

/** The STORED display value for a bank account. Never derived from ciphertext. */
export function bankAccountLast4(accountNumber: string): string {
  const digits = String(accountNumber ?? "").replace(/\D/g, "");
  return digits.slice(-4);
}

/** The STORED display value for a UPI id: two leading characters, then the
 *  handle. `ramesh@okhdfc` → `ra•••@okhdfc`. Enough for a pandit to recognise
 *  his own, not enough to pay it. */
export function maskUpiId(upiId: string): string {
  const value = String(upiId ?? "").trim();
  const at = value.indexOf("@");
  if (at < 1) return "•••";
  const local = value.slice(0, at);
  const handle = value.slice(at);
  return `${local.slice(0, 2)}•••${handle}`;
}

/**
 * THE MIGRATION CLASSIFIER. The three legacy formats are disjoint, so every
 * stored row lands in exactly one bucket — which is what lets the dry-run
 * name the rows BY FORMAT before Isj applies anything.
 */
export type LegacyFormat = "aes" | "plaintext" | "base64" | "unrecoverable";

export function classifyLegacyBankValue(value: string | null | undefined): LegacyFormat {
  if (!value) return "unrecoverable";
  if (isAesCiphertext(value) && tryDecryptPayoutField(value) !== null) return "aes";
  if (/^\d{9,18}$/.test(value)) return "plaintext";
  try {
    const decoded = Buffer.from(value, "base64").toString("utf8");
    if (/^\d{9,18}$/.test(decoded)) return "base64";
  } catch {
    /* fall through */
  }
  return "unrecoverable";
}

export function classifyLegacyUpiValue(value: string | null | undefined): LegacyFormat {
  if (!value) return "unrecoverable";
  if (isAesCiphertext(value) && tryDecryptPayoutField(value) !== null) return "aes";
  if (/^[\w.-]{2,}@[a-zA-Z]{2,}$/.test(value)) return "plaintext";
  try {
    const decoded = Buffer.from(value, "base64").toString("utf8");
    if (/^[\w.-]{2,}@[a-zA-Z]{2,}$/.test(decoded)) return "base64";
  } catch {
    /* fall through */
  }
  return "unrecoverable";
}

/** Recover a legacy value to plaintext for the backfill. null = unrecoverable. */
export function recoverLegacyValue(value: string | null | undefined, kind: "bank" | "upi"): string | null {
  const format = kind === "bank" ? classifyLegacyBankValue(value) : classifyLegacyUpiValue(value);
  if (format === "aes") return tryDecryptPayoutField(value!);
  if (format === "plaintext") return value!;
  if (format === "base64") return Buffer.from(value!, "base64").toString("utf8");
  return null;
}
