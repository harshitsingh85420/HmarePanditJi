// ─────────────────────────────────────────────────────────────────────────────
// F12-02 — EVERY SAMAGRI ITEM CARRIES QUANTITY + COMPANY/BRAND NAME.
//
// WHY THIS FILE EXISTS AT ALL. Before it, the "shape" of a samagri item was
// written down in FIVE places that did not agree with each other:
//
//   schema.prisma (comment)  { itemName, quantity, qualityNotes? }
//   pandit.routes.ts (zod)   { itemName, quantity, qualityNotes? }
//   samagri.controller.ts    { itemName, quantity }              (hand-rolled loop)
//   onboarding.controller.ts { itemName, quantity: '1' }         (from a bare string)
//   auth.controller.ts       items: any                          (NO validation)
//   …and the pandit app POSTs { name, qty, brand? }
//
// So the field list was duplicated four times and the live pandit-app write path
// (POST /pandit/samagri-packages → auth.controller.saveSamagriPackages) validated
// NOTHING — it wrote whatever JSON arrived straight into the Json column. Adding
// a brand field to any one of those lists would have been theatre. The shape is
// now defined ONCE, here, and every write path resolves through it.
//
// ── THE COMPATIBILITY DECISION (stated explicitly, as required) ───────────────
// brand is REQUIRED-ON-WRITE, OPTIONAL-ON-READ.
//
//   * ON WRITE  — validateSamagriItems() rejects an item with no brand. From now
//     on no new item can be stored without one, which is what F12-02 asks for and
//     what F12-04 ("जिस कंपनी का नाम बताया है, वही कंपनी का सामान लाना होगा")
//     needs in order not to be a lie: you cannot bind a customer to a company
//     name that was never captured.
//   * ON READ   — readSamagriItems() tolerates its absence and NEVER throws.
//     items is a Json column, so the rows already in the database have no brand
//     key. There is no migration to backfill them with (we do not know which
//     company a pandit meant — inventing one would be a fabrication). A legacy
//     row therefore loads with brand: null, and every read surface must treat
//     null as "no company was named", not as an error.
//
// Because the column is Json, NO PRISMA MIGRATION IS REQUIRED. This is a shape +
// validation change only.
//
// ── "कोई भी" IS A REAL ANSWER, NOT A MISSING ONE ──────────────────────────────
// Requiring a brand for नारियल or फूल-माला would be absurd — no one buys a
// branded coconut. But the fix for that is NOT to let the field be silently
// omitted; it is to make "no company binds here" a thing the pandit SAYS. That
// is SAMAGRI_BRAND_ANY ("कोई भी"). It is an ordinary non-empty string as far as
// validation is concerned; its only privilege is that the client offers it as a
// one-tap default so a 62-year-old is never trapped by fifteen mandatory fields.
// isBrandBinding() is what a read surface asks before quoting F12-04's promise.
//
// ── FIELD ALIASES ARE A FACT OF THIS CODEBASE, NOT A CONVENIENCE ──────────────
// Two vocabularies for the same item are already persisted in production rows:
// { itemName, quantity } (server-authored) and { name, qty } (pandit-app and
// DEFAULT_SAMAGRI authored). Picking one and rejecting the other would 400 the
// live pandit editor on its very next save. So the normaliser ACCEPTS both and
// emits one canonical shape — which is also how the duplication finally dies.
// ─────────────────────────────────────────────────────────────────────────────

import { z } from "zod";
import type { Prisma } from "@hmarepanditji/db";

/** The value a pandit gives when no company binds for this item. A real answer. */
export const SAMAGRI_BRAND_ANY = "कोई भी";

/** The ONE canonical item shape. Everything written to SamagriPackage.items is this. */
export interface SamagriItem {
  /** What the item is. Devanagari, pandit's own words. */
  itemName: string;
  /** How much of it. Free text ("500 ग्राम", "11", "1 पैकेट") — never a number. */
  quantity: string;
  /** The company/brand. SAMAGRI_BRAND_ANY when no company binds. Never empty. */
  brand: string;
  /** Optional free-text note about quality. Pre-existing field, kept. */
  qualityNotes?: string;
}

/**
 * The same item as it comes back OUT of the database, where legacy rows written
 * before F12-02 have no brand key at all. brand is nullable HERE and only here.
 */
export interface StoredSamagriItem {
  itemName: string;
  quantity: string;
  brand: string | null;
  qualityNotes?: string;
}

/**
 * Zod mirror of SamagriItem for the route-level `validate()` preHandler in
 * pandit.routes.ts. Derived from the same field list rather than retyped, so the
 * duplication this file exists to kill cannot creep back in through the router.
 * Accepts either vocabulary; the controller/service still calls
 * validateSamagriItems() to canonicalise.
 */
export const samagriItemSchema = z
  .object({
    itemName: z.string().optional(),
    name: z.string().optional(),
    quantity: z.union([z.string(), z.number()]).optional(),
    qty: z.union([z.string(), z.number()]).optional(),
    brand: z.string().optional(),
    company: z.string().optional(),
    qualityNotes: z.string().optional(),
  })
  .passthrough()
  .refine((v) => Boolean(v.itemName ?? v.name), { message: "हर सामग्री का नाम ज़रूरी है।" })
  .refine((v) => v.quantity !== undefined || v.qty !== undefined, { message: "हर सामग्री की मात्रा ज़रूरी है।" })
  .refine((v) => Boolean((v.brand ?? v.company ?? "").trim()), { message: "हर सामग्री के साथ कंपनी का नाम ज़रूरी है।" });

/** Read one aliased field off an unknown object without throwing. */
function pick(raw: Record<string, unknown>, ...keys: string[]): string {
  for (const k of keys) {
    const v = raw[k];
    if (typeof v === "string" && v.trim()) return v.trim();
    // A voice-entered quantity can arrive as a number ("11"). 0 is not a quantity.
    if (typeof v === "number" && Number.isFinite(v) && v !== 0) return String(v);
  }
  return "";
}

export type SamagriItemsCheck =
  | { ok: true; items: SamagriItem[] }
  | { ok: false; message: string };

/**
 * THE ONE CHECK every server WRITE path calls.
 *
 * Accepts an unknown payload, returns the canonical items or an actionable
 * Devanagari message naming the item and the missing field — a 62-year-old
 * cannot act on "validation failed", but he can act on
 * "'देसी घी' के साथ कंपनी का नाम बताइए". Never throws.
 */
export function validateSamagriItems(raw: unknown): SamagriItemsCheck {
  if (!Array.isArray(raw)) {
    return { ok: false, message: "सामग्री की सूची भेजी नहीं गई।" };
  }

  const items: SamagriItem[] = [];
  for (let i = 0; i < raw.length; i++) {
    const entry = raw[i];
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
      return { ok: false, message: `सूची में ${i + 1} नंबर की सामग्री सही नहीं है।` };
    }
    const obj = entry as Record<string, unknown>;

    const itemName = pick(obj, "itemName", "name");
    if (!itemName) {
      return { ok: false, message: `सूची में ${i + 1} नंबर की सामग्री का नाम नहीं है।` };
    }

    const quantity = pick(obj, "quantity", "qty");
    if (!quantity) {
      return { ok: false, message: `'${itemName}' की मात्रा बताइए — कितना चाहिए?` };
    }

    // F12-02, the whole point: no brand, no write.
    const brand = pick(obj, "brand", "company");
    if (!brand) {
      return {
        ok: false,
        message: `'${itemName}' के साथ कंपनी का नाम बताइए। किसी भी कंपनी का चलेगा तो "${SAMAGRI_BRAND_ANY}" कहिए।`,
      };
    }

    const item: SamagriItem = { itemName, quantity, brand };
    const notes = pick(obj, "qualityNotes");
    if (notes) item.qualityNotes = notes;
    items.push(item);
  }

  return { ok: true, items };
}

/**
 * THE ONE READ. Legacy rows have no brand key; this must not crash and must not
 * pretend a brand exists. Anything unparseable degrades to an empty list rather
 * than throwing — a samagri list that fails to render must never take down the
 * booking screen that contains it.
 */
export function readSamagriItems(raw: unknown): StoredSamagriItem[] {
  if (!Array.isArray(raw)) return [];
  const out: StoredSamagriItem[] = [];
  for (const entry of raw) {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) continue;
    const obj = entry as Record<string, unknown>;
    const itemName = pick(obj, "itemName", "name");
    if (!itemName) continue;
    const brand = pick(obj, "brand", "company");
    const item: StoredSamagriItem = {
      itemName,
      quantity: pick(obj, "quantity", "qty"),
      brand: brand || null, // legacy row → null, NOT "" and NOT a guessed company
    };
    const notes = pick(obj, "qualityNotes");
    if (notes) item.qualityNotes = notes;
    out.push(item);
  }
  return out;
}

/**
 * Prisma types a Json column as InputJsonValue, which a plain interface array
 * does not satisfy (no index signature). The cast is unavoidable; it lives HERE,
 * once, applied only to items that validateSamagriItems() has already accepted —
 * rather than as a scattering of `as any` at each write site, which is precisely
 * how an unvalidated payload reached the column in the first place.
 */
export function asJsonItems(items: SamagriItem[]): Prisma.InputJsonValue {
  return items as unknown as Prisma.InputJsonValue;
}

/**
 * The pandit app speaks { name, qty, brand } — that is the vocabulary its
 * components (SamagriTiers, SamagriPackageEditor) and the पूजा जोड़ें wizard
 * already use on the wire. Storage speaks the canonical { itemName, quantity }.
 * Translate at the boundary, HERE, so neither side hand-rolls the mapping and
 * the alias list stays in one file. brand is passed through as-is: null on a
 * legacy row, and the client decides how to present that.
 */
export function toPanditAppItems(
  items: StoredSamagriItem[],
): Array<{ name: string; qty: string; brand: string | null }> {
  return items.map((it) => ({ name: it.itemName, qty: it.quantity, brand: it.brand }));
}

/**
 * Does a company name actually BIND the customer for this item (F12-04)?
 * false for a legacy row (nobody named a company) and false for "कोई भी"
 * (a company was considered and explicitly waived). TRUTHFUL-STATE: never
 * promise "वही कंपनी का सामान लाना होगा" about an item with no company.
 */
export function isBrandBinding(brand: string | null | undefined): boolean {
  const b = (brand ?? "").trim();
  return b.length > 0 && b !== SAMAGRI_BRAND_ANY;
}
