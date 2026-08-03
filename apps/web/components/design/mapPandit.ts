// ONE MAPPER, EVERY READER (F-B3-5). The home featured strip carried its own
// inline card with its own field reads — the third card implementation, and
// the one that still said Pt., the green tick, 0yr and 0.0(0) after the 4b
// rebuild. A kill dies by the reader table, and a reader table stays dead
// only when there is ONE implementation to read. The single-implementation
// law applies to UI components too.

import { PanditRecordService } from "./PanditRecordCard";

export interface PanditResult {
  id: string;
  name: string;
  avatarUrl?: string;
  overallRating: number;
  totalReviews: number;
  city: string;
  languages: string[];
  experienceYears: number;
  /** ACTIVE services with per-pooja verification — THE CARD MAY ONLY PROMISE
   *  WHAT THE FILTER CAN KEEP, and this is what the filter can keep. */
  services: PanditRecordService[];
  /** THIS ONE POOJA's verification video, for the pooja being searched. */
  poojaVideo: "verified" | "pending" | "none";
  /** His rate. null → honest absence; we never print a fabricated ₹0. */
  dakshina: number | null;
  /** the honesty-ladder facts, SERVER-measured from the CityDistance matrix */
  sameCity: boolean | null;
  distanceKm: number | null;
}

/**
 * @param searchedPooja the ritual the customer is searching for. The per-pooja
 *   video claim is a property of ONE pooja, so it can only be resolved with
 *   the pooja in hand — it is threaded in, never read off the pandit record.
 */
export function mapPanditToResult(p: Record<string, unknown>, searchedPooja = ""): PanditResult {
  // WHAT GET /pandits SENDS PER ROW (the interface census of 2026-07-28,
  // extended by Track 2A and the photo work):
  //   user: { id, name } · location · rating · totalReviews · experienceYears
  //   specializations · languages · profilePhotoUrl (now the RESOLVER URL,
  //   never a raw key) · isOnline · verificationStatus · completedBookings
  //   verifiedPoojaTypes · pujaServices: [{ pujaType, dakshinaAmount,
  //   durationHours, poojaVerified, sampleViewable, ... }]
  //
  // THE CARD MAY ONLY PROMISE WHAT THE FILTER CAN KEEP (ruled 2026-08-02):
  // the chips read ACTIVE pujaServices — the column ?pujaType= filters on —
  // and NEVER specializations. Both production pandits display SATYANARAYAN
  // from specializations while ?pujaType=SATYANARAYAN returns zero; a card
  // quoting a column the search cannot honour sends the customer to an empty
  // result she was promised was full.
  const services: PanditRecordService[] = (
    (p.pujaServices as { pujaType?: string; dakshinaAmount?: number | null; poojaVerified?: boolean }[]) ?? []
  )
    .filter((s) => typeof s.pujaType === "string" && s.pujaType.length > 0)
    .map((s) => ({
      pujaType: s.pujaType as string,
      poojaVerified: s.poojaVerified === true,
      dakshinaAmount:
        typeof s.dakshinaAmount === "number" && Number.isFinite(s.dakshinaAmount) && s.dakshinaAmount > 0
          ? s.dakshinaAmount
          : null,
    }));

  // THIS ONE POOJA's video, resolved from the searched pooja's own service
  // row. Verified only when OUR review approved it; a viewable-but-unreviewed
  // sample is "pending" (designed as normal, never a warning); no sample at
  // all is honest silence.
  const searched = searchedPooja ? services.find((s) => s.pujaType === searchedPooja) : undefined;
  const searchedRaw = searchedPooja
    ? ((p.pujaServices as Record<string, unknown>[]) ?? []).find((s) => s.pujaType === searchedPooja)
    : undefined;
  const poojaVideo: PanditResult["poojaVideo"] = searched?.poojaVerified
    ? "verified"
    : searchedRaw && (searchedRaw.sampleViewable as boolean)
      ? "pending"
      : "none";

  // His rate for the searched pooja, else his lowest listed rate. Never a zero.
  const forThisPooja = searched?.dakshinaAmount ?? undefined;
  const anyRate = services
    .map((s) => s.dakshinaAmount)
    .filter((n): n is number => typeof n === "number" && Number.isFinite(n) && n > 0);
  const rawDakshina = forThisPooja ?? (anyRate.length ? Math.min(...anyRate) : undefined);
  const dakshina =
    typeof rawDakshina === "number" && Number.isFinite(rawDakshina) && rawDakshina > 0 ? rawDakshina : null;

  const apiUser = (p.user as { name?: string } | undefined) ?? undefined;

  return {
    id: String(p.id),
    name: String(apiUser?.name ?? "Pandit Ji"),
    avatarUrl: (p.profilePhotoUrl as string | undefined) ?? undefined,
    overallRating: Number(p.rating) || 0,
    totalReviews: Number(p.totalReviews) || 0,
    city: String(p.location ?? ""),
    languages: (p.languages as string[]) ?? [],
    experienceYears: Number(p.experienceYears) || 0,
    services,
    poojaVideo,
    dakshina,
    sameCity: typeof p.sameCity === "boolean" ? p.sameCity : null,
    distanceKm: typeof p.distanceKm === "number" && Number.isFinite(p.distanceKm) ? p.distanceKm : null,
  };
}
