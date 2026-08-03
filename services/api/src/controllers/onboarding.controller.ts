import { FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { prisma } from "@hmarepanditji/db";
import { AppError } from "../middleware/errorHandler";
import { sendSuccess } from "../utils/response";
// F12-02: the item shape lives in ONE place. Do not re-declare the field list here.
import { validateSamagriItems, SAMAGRI_BRAND_ANY } from "../lib/samagriItem";

interface AuthenticatedUser {
    id: string;
}

// Simple interface without extending FastifyRequest
interface AuthenticatedRequest {
    user: AuthenticatedUser;
}

function encrypt(text: string) {
    return Buffer.from(text).toString('base64');
}

// BATCH FOUR (Isj, 2026-07-28) — the registration name/city contract.
// Deliberately NO script restriction: the pandit's own name in roman letters
// is accepted. Only length is bounded, and it is bounded HERE (server-side),
// because the client cap alone is not a cap.
const NAME_MAX = 100;
const CITY_MAX = 60;
export const onboardingSchema = z.object({
    name: z
        .string({ required_error: "Name must be at least 3 characters." })
        .trim()
        .min(3, "Name must be at least 3 characters.")
        .max(NAME_MAX, `Name must be at most ${NAME_MAX} characters.`),
    city: z
        .string({ required_error: "City is required." })
        .trim()
        .min(1, "City is required.")
        .max(CITY_MAX, `City must be at most ${CITY_MAX} characters.`),
});

interface Step1Body {
    fullName: string;
    dateOfBirth?: string;
    gender?: string;
    homeCity: string;
    homeState: string;
    experienceYears: number;
    bio?: string;
    profilePhotoUrl?: string;
    aadhaarNumber?: string;
    panNumber?: string;
}

interface Step2Body {
    pujaTypes: string[];
    languages: string[];
    gotra?: string;
    vedicDegree?: string;
    specialCertifications?: string[];
}

interface Step3Body {
    willingToTravel: boolean;
    maxTravelDistanceKm: number;
    preferredTravelModes: string[];
    requiresAccommodation: boolean;
    requiresFoodArrangement: boolean;
    localServiceRadius: number;
    outOfDelhiAvailable: boolean;
}

interface SamagriPackageItem {
    packageType: string;
    name: string;
    price: number;
    items: string[];
}

interface Step4Body {
    canBringSamagri: boolean;
    packages: SamagriPackageItem[];
}

interface Step5Body {
    aadhaarFrontUrl?: string;
    aadhaarBackUrl?: string;
    selfieWithAadhaarUrl?: string;
    videoUrl?: string;
    videoUploaded?: boolean;
}

interface Step6Body {
    accountHolderName: string;
    bankName: string;
    accountNumber: string;
    ifscCode: string;
    accountType?: string;
}

export const onboardingStep1 = async (request: FastifyRequest, reply: FastifyReply) => {
    const req = request as AuthenticatedRequest;
    try {
        const body = request.body as Step1Body;
        const { fullName, homeCity, homeState, experienceYears, bio, profilePhotoUrl } = body;

        await prisma.user.update({
            where: { id: req.user.id },
            data: { name: fullName },
        });

        const profile = await prisma.panditProfile.findUnique({ where: { userId: req.user.id } });
        if (!profile) throw new AppError("Profile not found", 404);

        await prisma.panditProfile.update({
            where: { id: profile.id },
            data: {
                profilePhotoUrl: profilePhotoUrl,
                location: homeCity,
                fullAddress: homeCity + ", " + homeState,
                experienceYears,
                bio,
            }
        });

        return sendSuccess(reply, { step: 1 }, "Step 1 saved");
    } catch (err) {
        throw err;
    }
};

export const onboardingStep2 = async (request: FastifyRequest, reply: FastifyReply) => {
    const req = request as AuthenticatedRequest;
    try {
        const body = request.body as Step2Body;
        const { pujaTypes, languages } = body;

        const profile = await prisma.panditProfile.findUnique({ where: { userId: req.user.id } });
        if (!profile) throw new AppError("Profile not found", 404);

        await prisma.panditProfile.update({
            where: { id: profile.id },
            data: {
                languages,
            }
        });

        // W6 CLOSED (2026-08-03). This block was deleteMany + createMany WITHOUT
        // the isActive field — the schema default published ₹0 rows silently,
        // and the deleteMany could erase rows an admin had reviewed. The
        // endpoint has zero app callers; the service-write is removed rather
        // than fixed, because a caller-less writer of a published row is a
        // hole, not a feature. Specializations (below) still record the
        // declared poojas; the real listing path is the wizard.

        return sendSuccess(reply, { step: 2 }, "Step 2 saved");
    } catch (err) {
        throw err;
    }
};

export const onboardingStep3 = async (request: FastifyRequest, reply: FastifyReply) => {
    const req = request as AuthenticatedRequest;
    try {
        const body = request.body as Step3Body;
        const { willingToTravel, maxTravelDistanceKm, preferredTravelModes, requiresAccommodation, requiresFoodArrangement, localServiceRadius, outOfDelhiAvailable } = body;

        const profile = await prisma.panditProfile.findUnique({ where: { userId: req.user.id } });
        if (!profile) throw new AppError("Profile not found", 404);

        const travelPrefs = {
            willingToTravel,
            maxDistanceKm: willingToTravel ? maxTravelDistanceKm : 0,
            preferredModes: willingToTravel ? preferredTravelModes : [],
            requiresAccommodation,
            requiresFoodArrangement,
            localServiceRadius,
            outOfDelhiAvailable,
        };

        await prisma.panditProfile.update({
            where: { id: profile.id },
            data: { travelPreferences: travelPrefs }
        });

        return sendSuccess(reply, { step: 3 }, "Step 3 saved");
    } catch (err) {
        throw err;
    }
};

export const onboardingStep4 = async (request: FastifyRequest, reply: FastifyReply) => {
    const req = request as AuthenticatedRequest;
    try {
        const body = request.body as Step4Body;
        const { canBringSamagri, packages } = body;

        const profile = await prisma.panditProfile.findUnique({ where: { userId: req.user.id } });
        if (!profile) throw new AppError("Profile not found", 404);

        if (canBringSamagri) {
            await prisma.samagriPackage.deleteMany({ where: { panditId: profile.id } });

            const samagriData = packages.map((pkg) => ({
                panditId: profile.id,
                packageType: pkg.packageType,
                packageName: pkg.name,
                pujaType: "All",
                fixedPrice: pkg.price,
                // F12-02: this legacy step-4 body carries items as BARE STRINGS —
                // it collects neither a quantity nor a company. The quantity '1'
                // below is a pre-existing fabrication (flagged, not introduced
                // here). The brand is NOT fabricated: SAMAGRI_BRAND_ANY truthfully
                // records "no company was named", which is exactly the state of a
                // list typed as plain names. Inventing a company here would make
                // F12-04's binding promise a lie.
                items: pkg.items.map((it: string) => ({
                    itemName: it,
                    quantity: '1',
                    brand: SAMAGRI_BRAND_ANY,
                })),
            }));

            for (const p of samagriData) {
                const itemsCheck = validateSamagriItems(p.items);
                if (!itemsCheck.ok) throw new AppError(itemsCheck.message, 400);
                await prisma.samagriPackage.create({ data: { ...p, items: itemsCheck.items } as any });
            }
        }

        return sendSuccess(reply, { step: 4 }, "Step 4 saved");
    } catch (err) {
        throw err;
    }
};

export const onboardingStep5 = async (request: FastifyRequest, reply: FastifyReply) => {
    const req = request as AuthenticatedRequest;
    try {
        const body = request.body as Step5Body;
        const { aadhaarFrontUrl, aadhaarBackUrl, videoUrl } = body;

        const profile = await prisma.panditProfile.findUnique({ where: { userId: req.user.id } });
        if (!profile) throw new AppError("Profile not found", 404);

        // ONE UPDATE. This was two: the status advanced FIRST, then the URLs
        // were written separately. A failure between them produces exactly the
        // row KYC_REVIEW_QUEUE_STATUSES warns about — submitted, with nothing
        // to look at — and ops cannot tell it from a real submission.
        // readiness.controller.ts step 5 already writes documents and status in
        // one statement; this is the same rule applied to the other path.
        await prisma.panditProfile.update({
            where: { id: profile.id },
            data: {
                aadhaarFrontUrl,
                aadhaarBackUrl,
                videoKycUrl: videoUrl,
                verificationStatus: "DOCUMENTS_SUBMITTED",
            },
        });

        return sendSuccess(reply, { step: 5 }, "Step 5 saved");
    } catch (err) {
        throw err;
    }
};

export const onboardingComplete = async (request: FastifyRequest, reply: FastifyReply) => {
    const req = request as AuthenticatedRequest;
    try {
        const body = request.body as Step6Body;
        const { accountHolderName, bankName, accountNumber, ifscCode } = body;

        const profile = await prisma.panditProfile.findUnique({ where: { userId: req.user.id } });
        if (!profile) throw new AppError("Profile not found", 404);

        await prisma.panditProfile.update({
            where: { id: profile.id },
            data: {
                bankAccountName: accountHolderName,
                bankAccountNumber: encrypt(accountNumber),
                bankIfscCode: ifscCode,
                bankName,
            }
        });

        return sendSuccess(reply, { redirectTo: '/dashboard' }, "Onboarding completed");
    } catch (err) {
        throw err;
    }
};

// PROGRESSIVE ONBOARDING: registration creates an ACCOUNT only — name +
// city, nothing else. Pujas/dakshina/samagri/travel/food/bank/aadhaar are
// earned later via the booking-readiness flow (GET/PATCH /pandit/readiness).
export const submitOnboarding = async (request: FastifyRequest, reply: FastifyReply) => {
    const req = request as AuthenticatedRequest;
    const userId = req.user.id;

    // NAME/CITY CONTRACT (Isj ruling, 2026-07-28 — BATCH FOUR).
    //
    // SCRIPT: roman names are ACCEPTED. A pandit's name is HIS data, not our UI
    // copy — the no-roman law governs strings we write, never what he types.
    // "Pt. Ramesh Sharma" is a real way a real pandit writes his own name, and
    // rejecting it would be the app correcting the guru. No script rule here,
    // deliberately.
    //
    // LENGTH: capped server-side. The client had no cap and the server had no
    // cap either, so a 246-character name reached the database and echoed back
    // in full across every screen that renders it.
    const body = request.body as any;
    const parsed = onboardingSchema.safeParse({ name: body?.name, city: body?.city });
    if (!parsed.success) {
        const first = parsed.error.issues[0];
        return reply.status(400).send({
            success: false,
            error: { code: "validation_error", message: first?.message || "Invalid name or city." }
        });
    }

    const cleanName = parsed.data.name.trim();
    const cleanCity = parsed.data.city.trim();

    try {
        await prisma.$transaction(async (tx) => {
            await tx.user.update({
                where: { id: userId },
                data: { name: cleanName }
            });

            const profileData = {
                fullName: cleanName,
                location: cleanCity,
                city: cleanCity,
            };

            const profile = await tx.panditProfile.findUnique({ where: { userId } });
            if (profile) {
                await tx.panditProfile.update({ where: { id: profile.id }, data: profileData });
            } else {
                await tx.panditProfile.create({ data: { userId, ...profileData } });
            }
        });

        return reply.send({
            success: true,
            data: {
                message: "Account created."
            }
        });
    } catch (err: any) {
        return reply.status(500).send({
            success: false,
            error: { code: "server_error", message: err.message || "Failed to create account." }
        });
    }
};
