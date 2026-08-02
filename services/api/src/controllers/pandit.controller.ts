import { FastifyRequest, FastifyReply } from "fastify";
import { prisma } from "@hmarepanditji/db";
import { parsePagination } from "../utils/helpers";
import { PUBLIC_REVIEW_SELECT, toPublicReview } from "../services/review.service";

// THE WIRE MUST CARRY A URL A BROWSER CAN FOLLOW. profilePhotoUrl stores a
// bare R2 key; the projections map it to the public photo resolver. The URL
// must be ABSOLUTE — a relative /api/v1/... resolves against the WEB app's
// origin and 404s, which is the "public but unresolvable" defect reborn in a
// new costume. Same env-with-known-default pattern as the webhook registrar
// (payment.routes.ts).
const API_PUBLIC_ORIGIN = (process.env.API_PUBLIC_URL || "https://hmarepanditji-api.onrender.com").replace(/\/+$/, "");
const publicPhotoUrl = (userId: string | undefined, key: string | null): string | null =>
    key && userId ? `${API_PUBLIC_ORIGIN}/api/v1/pandits/${userId}/photo` : null;

interface PanditQueryParams {
    pujaType?: string;
    city?: string;
    date?: string;
    minRating?: string;
    minDakshina?: string;
    maxDakshina?: string;
    language?: string;
    travelMode?: string;
    maxDistance?: string;
    sort?: string;
    /** @deprecated F-B3-1 (ruled 2026-08-02): DEAD on this route. The public
     *  listing hard-filters VERIFIED; a caller-supplied value is ignored, not
     *  honoured. Kept in the interface only so a reader searching for the name
     *  finds this sentence instead of concluding it was never accepted. */
    verificationStatus?: never;
    page?: string;
    limit?: string;
}

interface PujaServiceFilter {
    isActive: boolean;
    pujaType?: string;
    dakshinaAmount?: { gte?: number; lte?: number };
}

/**
 * The customer-safe view of a pooja sample.
 *
 * ONLY the latest version per poojaType counts (the join is ordered version
 * desc). YOUTUBE exposes videoId — an embed needs nothing more, and the raw
 * videoUrl would add nothing but a leak. UPLOAD exposes NOTHING: publicUrl is
 * a bare file URL with no unlisting semantics, so those rows read as
 * "sample not viewable yet" until the storage is signed/expiring.
 */
type SafeVerification = {
  poojaType: string;
  status: string;
  videoProvider: string;
  videoId: string | null;
  thumbnailUrl: string | null;
};
function sampleFor(vs: SafeVerification[] | undefined, pujaType: string) {
  const v = (vs ?? []).find((x) => x.poojaType === pujaType);
  const youtube = v?.videoProvider === "YOUTUBE" && !!v.videoId;
  return {
    poojaVerified: v?.status === "APPROVED",
    // Listenable in BOTH states — the badge says who vouched, not whether it
    // can be heard.
    sampleVideoId: youtube ? v!.videoId : null,
    sampleThumbnailUrl: youtube ? v!.thumbnailUrl : null,
    sampleViewable: youtube,
  };
}

interface RawPandit {
    id: string;
    // PHANTOM REMOVED: the public list select deliberately OMITS phone
    // ("a directory of every pandit's personal number is not something a
    // search result should hand out"). Declaring it here made a read of a
    // field the query never returns typecheck. tsc caught it the moment the
    // select changed — which is why these are deleted, not fixed.
    user: { id: string; name: string | null };
    location: string | null;
    rating: number;
    totalReviews: number;
    experienceYears: number;
    specializations: string[];
    languages: string[];
    profilePhotoUrl: string | null;
    isOnline: boolean;
    // IDENTITY verification (KYC). Ambiguous on its own — see below.
    verificationStatus: string;
    // travelPreferences DELETED: removed from the public select on
    // 2026-07-29 because a JSON blob is not an allow-list. Declaring it
    // here would make a read of a field the query no longer returns
    // typecheck — the phantom-field shape. tsc caught it the moment the
    // select changed, which is the point of deleting rather than fixing.
    completedBookings: number;
    // PER-PUJA सत्यापन — the OTHER verification, and the one the booking
    // gate actually reads (booking.service.ts:116-125).
    poojaVerifications?: SafeVerification[];
    pujaServices: Array<{
        pujaType: string;
        dakshinaAmount: number | null;
        durationHours: number | null;
        poojaVerified?: boolean;
    }>;
}

interface FilteredPandit extends Omit<RawPandit, "pujaServices"> {
    name: string;
    // BOTH verifications, named. A surface that renders one tick for
    // both is the collapse PAGE 16 forbids.
    identityVerified: boolean;
    verifiedPoojaTypes: string[];
    pujaServices: Array<{
        pujaType: string;
        dakshinaAmount: number | null;
        durationHours: number | null;
        poojaVerified: boolean;
    }>;
}

interface DateStatusEntry {
    date: string;
    status: "past" | "blocked" | "booked" | "available";
    reason?: string | null;
}

export async function getPandits(request: FastifyRequest, reply: FastifyReply) {
    try {
        const query = request.query as PanditQueryParams & Record<string, unknown>;
        const { page, limit, skip } = parsePagination(query);

        const pujaType = query.pujaType as string;
        const city = query.city as string;
        const date = query.date as string;
        const minRating = query.minRating ? Number(query.minRating) : undefined;
        const minDakshina = query.minDakshina ? Number(query.minDakshina) : undefined;
        const maxDakshina = query.maxDakshina ? Number(query.maxDakshina) : undefined;
        const language = query.language as string;
        const travelMode = query.travelMode as string;
        const maxDistance = query.maxDistance ? Number(query.maxDistance) : undefined;
        const sort = query.sort as string;

        const conditions: Record<string, unknown>[] = [];

        // ─────────────────────────────────────────────────────────────
        // F-B3-1 · RULED 2026-08-02 (Isj) — A DEFAULT IS NOT A BOUNDARY.
        //
        // This line USED to read:
        //     query.verificationStatus ? String(query.verificationStatus) : "VERIFIED"
        // — a default, not a floor. Measured live, anonymous, no auth:
        //     /pandits?limit=30                          -> 2   (the verified)
        //     /pandits?verificationStatus=PENDING&limit=30 -> 7 (unverified,
        //       including at least one name that does not look like seed data)
        // The route is mounted bare (pandit.routes.ts) with no Fastify schema
        // and no Zod validation; the param list is a TypeScript interface,
        // erased at runtime, so the querystring was simply believed.
        //
        // A default describes what happens when nobody asks. A BOUNDARY is
        // what happens when somebody does.
        //
        // The ruling: the customer route HARD-FILTERS VERIFIED server-side and
        // `verificationStatus` is DEAD on this route. Ops is unaffected — the
        // admin surfaces read their own authenticated endpoints, which is where
        // the distinction belongs.
        //
        // This also makes the identity ruling's premise TRUE: "listed means
        // Aadhaar-passed" is only a fact if listing is gated. It was not.
        // ─────────────────────────────────────────────────────────────
        conditions.push({ verificationStatus: "VERIFIED" });

        if (city) {
            if (maxDistance) {
                const connections = await prisma.cityDistance.findMany({
                    where: {
                        OR: [
                            { fromCity: city, distanceKm: { lte: maxDistance } },
                            { toCity: city, distanceKm: { lte: maxDistance } },
                        ],
                    }
                });
                const validCities = new Set<string>([city]);
                for (const c of connections) {
                    validCities.add(c.fromCity === city ? c.toCity : c.fromCity);
                }
                conditions.push({ location: { in: Array.from(validCities), mode: "insensitive" } });
            } else {
                conditions.push({ location: { equals: city, mode: "insensitive" } });
            }
        }

        if (minRating) conditions.push({ rating: { gte: minRating } });

        if (language) {
            conditions.push({ languages: { has: language } });
        }

        if (pujaType || minDakshina !== undefined || maxDakshina !== undefined) {
            const serviceFilter: PujaServiceFilter = { isActive: true };
            if (pujaType) serviceFilter.pujaType = pujaType;
            if (minDakshina !== undefined) serviceFilter.dakshinaAmount = { gte: minDakshina };
            if (maxDakshina !== undefined) {
                serviceFilter.dakshinaAmount = {
                    ...serviceFilter.dakshinaAmount,
                    lte: maxDakshina,
                };
            }
            conditions.push({ pujaServices: { some: serviceFilter } });
        }

        if (date) {
            const targetDate = new Date(date);
            const startOfDay = new Date(targetDate);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(targetDate);
            endOfDay.setHours(23, 59, 59, 999);

            conditions.push({
                blockedDates: {
                    none: {
                        date: { gte: startOfDay, lte: endOfDay }
                    }
                }
            });

            conditions.push({
                bookings: {
                    none: {
                        eventDate: { gte: startOfDay, lte: endOfDay },
                        status: { in: ["CONFIRMED", "TRAVEL_BOOKED", "PANDIT_EN_ROUTE", "PANDIT_ARRIVED", "PUJA_IN_PROGRESS"] }
                    }
                }
            });
        }

        const where = { AND: conditions };

        const orderByMap: Record<string, Record<string, "asc" | "desc">> = {
            rating: { rating: "desc" },
        };
        const orderBy = orderByMap[sort] ?? { rating: "desc" };

        const rawPandits = await prisma.panditProfile.findMany({
            where,
            select: {
                id: true,
                // phone deliberately NOT selected: this list is public, and a
                // directory of every pandit's personal number is not something
                // a search result should hand out. Contact goes through a booking.
                user: { select: { id: true, name: true } },
                location: true,
                rating: true,
                totalReviews: true,
                experienceYears: true,
                specializations: true,
                languages: true,
                profilePhotoUrl: true,
                isOnline: true,
                verificationStatus: true,
                // travelPreferences REMOVED (Isj ruling, 2026-07-29). It is a JSON
                // BLOB, not an allow-list: any key added to it later would become
                // public with nobody deciding so — the exact hazard the detail
                // allow-list exists to close, sitting in the LIST, which is the
                // most-fetched anonymous surface. It also had no consumer: travel
                // is pending removal from v1. If distance ever needs to surface it
                // gets an explicit scalar, never a blob.
                // NOTE the response below is built with `...p`, so this select IS
                // the public contract — adding a field here publishes it.
                completedBookings: true,
                pujaServices: {
                    where: { isActive: true },
                    select: { pujaType: true, dakshinaAmount: true, durationHours: true },
                },
                // ── THE TWO VERIFICATIONS, NAMED SEPARATELY ──────────────
                // PAGE 16's ruling: identity and पूजा must read differently and
                // must NEVER collapse into one tick. `verificationStatus` above
                // is IDENTITY (KYC). This is the OTHER one: per-puja video
                // सत्यापन, which is what booking.service.ts:116-125 actually
                // gates on. A customer used to see a VERIFIED badge, fill a
                // 7-step wizard and be refused at submit by a rule that
                // appeared on NO customer surface (cgrep over apps/web: 0 hits).
                // Not sensitive — it IS the trust claim.
                poojaVerifications: {
                    // NOT filtered to APPROVED any more: under the 2026-07-29 ruling
                    // सत्यापन INFORMS, so an unverified sample is still listenable —
                    // the difference is who has vouched, not whether it can be heard.
                    // videoUrl and publicUrl are NEVER selected. For YOUTUBE the
                    // videoId is all an embed needs; for UPLOAD, publicUrl is a bare
                    // file URL with no unlisting semantics, so those rows expose NO
                    // media identifier at all until it is signed/expiring.
                    select: {
                        poojaType: true,
                        status: true,
                        videoProvider: true,
                        videoId: true,
                        thumbnailUrl: true,
                    },
                    orderBy: { version: "desc" },
                },
            },
            orderBy,
        }) as RawPandit[];

        // In-memory filters for travel Preferences JSON and price sorting etc.
        let filtered: FilteredPandit[] = rawPandits.map((p) => ({
            ...p,
            id: p.user.id, // we map id to User ID so frontend uses this for booking
            name: p.user?.name || "Pandit",
            // THE KEY NEVER REACHES THE WIRE. profilePhotoUrl stores a bare R2
            // key no unauthenticated client can resolve (customers cannot
            // presign — canPresign hard-denies them). The wire carries the
            // public resolver URL instead: stable, cacheable, and 404 for a
            // photoless or unverified pandit — the client renders the initial.
            // (p.user.id, not p.userId — the list select carries the user
            // relation, not the scalar, and an undefined id here would mint
            // the literal URL "/pandits/undefined/photo" for every row.)
            profilePhotoUrl: publicPhotoUrl(p.user?.id, p.profilePhotoUrl),
            rating: p.rating,
            totalReviews: p.totalReviews,
            completedBookings: p.completedBookings,
            experienceYears: p.experienceYears,
            location: p.location,
            specializations: p.specializations,
            languages: p.languages,
            // BOTH VERIFICATIONS, NAMED. `verificationStatus` is kept for
            // existing readers but is ambiguous on its own — these two are not.
            verificationStatus: p.verificationStatus,
            // The RAW relation never reaches the wire. It is selected only to
            // derive the two fields below, then dropped: an array that is not in
            // the response cannot leak a field a future `select` widening adds.
            // Unreachability beats a guard here — and an EMPTY array (which is
            // all a guest sees today, since nothing is APPROVED) could never have
            // PROVEN its element shape on the wire anyway.
            poojaVerifications: undefined,
            identityVerified: p.verificationStatus === "VERIFIED",
            verifiedPoojaTypes: (p.poojaVerifications ?? [])
                .filter((v: { status: string }) => v.status === "APPROVED")
                .map((v: { poojaType: string }) => v.poojaType),
            isOnline: p.isOnline,
            // Each service carries its OWN verification, so a card can mark the
            // unbookable ones at the point of CHOICE instead of at submit.
            pujaServices: (p.pujaServices ?? []).map((s) => ({
                ...s,
                ...sampleFor(p.poojaVerifications as any, s.pujaType),
            })),
        }));

        // The travelMode filter was removed with travelPreferences. It read that
        // blob, and no client has ever sent travelMode (the search screen sends
        // city / language / minRating / sort). Left in place without its data,
        // `!prefs` would be true for EVERY row and the filter would return an
        // EMPTY list rather than an unfiltered one — a dead filter that becomes
        // a total blackout the moment someone passes the parameter.

        if (sort === "price_asc") {
            filtered.sort((a, b) => {
                const aPrice = Math.min(...a.pujaServices.map((s) => s.dakshinaAmount ?? 0));
                const bPrice = Math.min(...b.pujaServices.map((s) => s.dakshinaAmount ?? 0));
                return aPrice - bPrice;
            });
        } else if (sort === "price_desc") {
            filtered.sort((a, b) => {
                const aPrice = Math.max(...a.pujaServices.map((s) => s.dakshinaAmount ?? 0));
                const bPrice = Math.max(...b.pujaServices.map((s) => s.dakshinaAmount ?? 0));
                return bPrice - aPrice;
            });
        } else if (sort === "distance" && city) {
            const distanceMap = new Map<string, number>();
            const connections = await prisma.cityDistance.findMany({
                where: { OR: [{ fromCity: city }, { toCity: city }] }
            });
            for (const c of connections) {
                distanceMap.set(c.fromCity === city ? c.toCity : c.fromCity, c.distanceKm);
            }
            distanceMap.set(city, 0);

            filtered.sort((a, b) => {
                const distA = distanceMap.get(a.location ?? "") ?? 9999;
                const distB = distanceMap.get(b.location ?? "") ?? 9999;
                return distA - distB;
            });
        }

        const total = filtered.length;
        const paginatedPandits = filtered.slice(skip, skip + limit);

        return reply.code(200).send({
            success: true,
            data: {
                pandits: paginatedPandits,
                pagination: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit),
                },
            }
        });
    } catch (err) {
        throw err;
    }
}

export async function getPanditProfileById(request: FastifyRequest, reply: FastifyReply) {
    try {
        const params = request.params as Record<string, string>;
        const panditId = params.id;
        // ─────────────────────────────────────────────────────────────
        // PUBLIC SURFACE — this route is served with NO auth (see the
        // scoped exemption in app.ts). The customer pandit-detail page is a
        // logged-out SSR render, so everything selected here is world-
        // readable. Treat this select as a publication decision.
        //
        // This was `include:`, which returns EVERY scalar on PanditProfile,
        // and the handler below spreads the row wholesale (`...pandit`).
        // That published, unauthenticated: bankAccountNumber, bankIfscCode,
        // bankAccountName, upiId, bankIfsc, aadhaarFrontUrl, aadhaarBackUrl,
        // aadhaarDocUrl, aadhaarEncrypted, aadhaarLastFour, fullAddress,
        // latitude and longitude — a pandit's bank account and Aadhaar
        // photographs, for the cost of one GET.
        //
        // An explicit allow-list is used rather than an exclude-list on
        // purpose: with `include`, every column added to the model in future
        // is public by default and silently so. Here, a new column is
        // private until someone deliberately adds it below.
        //
        // `phone` is also dropped: the customer app never rendered it, and a
        // directory of every pandit's personal number is not something a
        // detail page should hand out. Contact happens through a booking.
        // ─────────────────────────────────────────────────────────────
        const pandit = await prisma.panditProfile.findUnique({
            where: { userId: panditId, verificationStatus: "VERIFIED" },
            select: {
                id: true,
                userId: true,
                displayName: true,
                fullName: true,
                bio: true,
                experienceYears: true,
                yearsExperience: true,
                languages: true,
                specializations: true,
                sect: true,
                profilePhotoUrl: true,
                photoUrl: true,
                location: true,
                city: true,
                state: true,
                rating: true,
                totalReviews: true,
                completedBookings: true,
                isOnline: true,
                verificationStatus: true,
                canBringSamagri: true,
                teamSize: true,
                createdAt: true,
                user: { select: { id: true, name: true } },
                // ── THE TWO VERIFICATIONS, NAMED SEPARATELY ──────────────
                // PAGE 16's ruling: identity and पूजा must read differently and
                // must NEVER collapse into one tick. `verificationStatus` above
                // is IDENTITY (KYC). This is the OTHER one: per-puja video
                // सत्यापन, which is what booking.service.ts:116-125 actually
                // gates on. A customer used to see a VERIFIED badge, fill a
                // 7-step wizard and be refused at submit by a rule that
                // appeared on NO customer surface (cgrep over apps/web: 0 hits).
                // Not sensitive — it IS the trust claim.
                poojaVerifications: {
                    // NOT filtered to APPROVED any more: under the 2026-07-29 ruling
                    // सत्यापन INFORMS, so an unverified sample is still listenable —
                    // the difference is who has vouched, not whether it can be heard.
                    // videoUrl and publicUrl are NEVER selected. For YOUTUBE the
                    // videoId is all an embed needs; for UPLOAD, publicUrl is a bare
                    // file URL with no unlisting semantics, so those rows expose NO
                    // media identifier at all until it is signed/expiring.
                    select: {
                        poojaType: true,
                        status: true,
                        videoProvider: true,
                        videoId: true,
                        thumbnailUrl: true,
                    },
                    orderBy: { version: "desc" },
                },
                // Relations are allow-listed too. Left unnarrowed they return
                // every scalar of their own model, so the "new column is
                // public by default" hazard just moves one level down —
                // a bank or contact field added to PujaService or
                // SamagriPackage later would publish itself silently.
                pujaServices: {
                    where: { isActive: true },
                    select: {
                        id: true,
                        pujaType: true,
                        dakshinaAmount: true,
                        durationHours: true,
                        description: true,
                    },
                },
                samagriPackages: {
                    where: { isActive: true },
                    select: {
                        id: true,
                        packageName: true,
                        packageType: true,
                        pujaType: true,
                        tier: true,
                        price: true,
                        fixedPrice: true,
                        items: true,
                    },
                },
            }
        });

        if (!pandit) {
            return reply.code(404).send({ success: false, message: "Pandit not found or not verified" });
        }

        const aggregations = await prisma.review.aggregate({
            where: { revieweeId: panditId },
            _avg: {
                overallRating: true,
                knowledgeRating: true,
                punctualityRating: true,
                communicationRating: true,
            },
            _count: true,
        });

        const distribution = await Promise.all([5, 4, 3, 2, 1].map(async (star) => {
            const count = await prisma.review.count({
                where: { revieweeId: panditId, overallRating: star },
            });
            return { star, count, percentage: aggregations._count > 0 ? (count / aggregations._count) * 100 : 0 };
        }));

        const reviewSummary = {
            // TRUTHFUL-NULL (Isj, 2026-07-30). These two lines fell back to the
            // STORED scalar precisely when the review count was zero — which is how
            // a seeded 4.8/47 reached customers against an empty Review table. The
            // `??` was not neutral: it instructed the API to show the fabricated
            // value in exactly the condition where the true answer is "none".
            avgRating: aggregations._count > 0 ? aggregations._avg.overallRating : null,
            totalReviews: aggregations._count,
            distribution,
            subRatings: {
                Knowledge: aggregations._avg.knowledgeRating ?? 0,
                Punctuality: aggregations._avg.punctualityRating ?? 0,
                Communication: aggregations._avg.communicationRating ?? 0,
            }
        };

        // THE TWO VERIFICATIONS, NAMED (PAGE 16). `verificationStatus` is
        // IDENTITY; per-puja सत्यापन is what the booking gate reads. A surface
        // that renders one tick for both is the collapse the ruling forbids.
        const verifiedPoojaTypes = (pandit.poojaVerifications ?? [])
            .filter((v: { status: string }) => v.status === "APPROVED")
            .map((v: { poojaType: string }) => v.poojaType);
        const responseData = {
            ...pandit,
            id: pandit.user.id,
            user: {
                id: pandit.user.id,
                name: pandit.user.name ?? "Pandit Ji",
            },
            // the wire carries the public resolver, never the raw R2 key —
            // same mapping as the list; the detail route is VERIFIED-only so
            // the resolver's own status check can never 404 a photo it serves.
            profilePhotoUrl: publicPhotoUrl(pandit.user.id, pandit.profilePhotoUrl),
            // photoUrl is one of the two DEAD photo columns (nothing writes
            // it); filed to the dead-column census. Never map it to the wire
            // as if it were live.
            photoUrl: null,
            // Same as the list: derived-only, never shipped raw.
            poojaVerifications: undefined,
            identityVerified: pandit.verificationStatus === "VERIFIED",
            verifiedPoojaTypes,
            pujaServices: (pandit.pujaServices ?? []).map((s: { pujaType: string } & Record<string, unknown>) => ({
                ...s,
                ...sampleFor(pandit.poojaVerifications as any, s.pujaType),
            })),
            reviewSummary,
        };

        return reply.code(200).send({ success: true, data: responseData });
    } catch (err) {
        throw err;
    }
}

export async function getPanditReviewsHandler(request: FastifyRequest, reply: FastifyReply) {
    try {
        const params = request.params as Record<string, string>;
        const query = request.query as Record<string, string | undefined>;
        const panditId = params.id;
        const page = parseInt(query.page || "1");
        const limit = parseInt(query.limit || "5");
        const skip = (page - 1) * limit;

        // SHARED with the twin route (GET /reviews/pandit/:panditId) — see
        // PUBLIC_REVIEW_SELECT in review.service.ts. This handler's anonymisation
        // was always correct; its twin's was not, and the twin was the public one.
        // Both now read one projection and one mapper so the pair cannot drift a
        // third time. `include` also became `select`: include returns every scalar
        // on Review, which is how the other side ended up shipping fields nobody
        // chose to expose.
        const reviews = await prisma.review.findMany({
            where: { revieweeId: panditId },
            skip,
            take: limit,
            orderBy: { createdAt: "desc" },
            select: PUBLIC_REVIEW_SELECT
        });

        const formatted = reviews.map(toPublicReview);

        return reply.code(200).send({ success: true, data: formatted });
    } catch (err) {
        throw err;
    }
}

export async function getPanditAvailabilityHandler(request: FastifyRequest, reply: FastifyReply) {
    try {
        const params = request.params as Record<string, string>;
        const query = request.query as Record<string, string | undefined>;
        const panditId = params.id;
        const month = parseInt(query.month || "0");
        const year = parseInt(query.year || "0");

        if (!month || !year) {
            return reply.code(400).send({ success: false, message: "month and year are required" });
        }

        const startOfMonth = new Date(year, month - 1, 1);
        const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

        // Public route :id is the pandit's User.id; Booking/BlockedDate FK is PanditProfile.id
        const profile = await prisma.panditProfile.findUnique({ where: { userId: panditId }, select: { id: true } });
        if (!profile) {
            return reply.code(404).send({ success: false, message: "Pandit not found" });
        }

        const bookings = await prisma.booking.findMany({
            where: {
                panditId: profile.id,
                eventDate: { gte: startOfMonth, lte: endOfMonth },
                status: { in: ["CONFIRMED", "TRAVEL_BOOKED", "PANDIT_EN_ROUTE", "PANDIT_ARRIVED", "PUJA_IN_PROGRESS"] }
            },
            select: { eventDate: true }
        });

        const blockedDates = await prisma.blockedDate.findMany({
            where: {
                panditId: profile.id,
                date: { gte: startOfMonth, lte: endOfMonth }
            },
            select: { date: true, reason: true }
        });

        const daysInMonth = new Date(year, month, 0).getDate();
        const datesStatus: DateStatusEntry[] = [];

        const bookedDays = new Set(bookings.map((b) => b.eventDate.getDate()));
        const blockedDaysMap = new Map<number, string | null>(blockedDates.map((b) => [b.date.getDate(), b.reason]));

        const today = new Date();
        const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month - 1;
        const isPastMonth = today.getFullYear() > year || (today.getFullYear() === year && today.getMonth() > month - 1);

        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
            if (isPastMonth || (isCurrentMonth && day < today.getDate())) {
                datesStatus.push({ date: dateStr, status: "past" });
                continue;
            }

            if (blockedDaysMap.has(day)) {
                datesStatus.push({ date: dateStr, status: "blocked", reason: blockedDaysMap.get(day) || "Unavailable" });
            } else if (bookedDays.has(day)) {
                datesStatus.push({ date: dateStr, status: "booked" });
            } else {
                datesStatus.push({ date: dateStr, status: "available" });
            }
        }

        return reply.code(200).send({ success: true, data: datesStatus });
    } catch (err) {
        throw err;
    }
}
