import { FastifyRequest, FastifyReply } from "fastify";
import { prisma } from "@hmarepanditji/db";
import { AppError } from "../middleware/errorHandler";
import { sendSuccess } from "../utils/response";

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

        await prisma.pujaService.deleteMany({ where: { panditProfileId: profile.id } });

        const pujaLinks = pujaTypes.map((pt: string) => ({
            panditProfileId: profile.id,
            pujaType: pt,
            dakshinaAmount: 0,
            durationHours: 2,
        }));
        await prisma.pujaService.createMany({ data: pujaLinks });

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
                items: pkg.items.map((it: string) => ({ itemName: it, quantity: '1' })),
            }));

            for (const p of samagriData) {
                await prisma.samagriPackage.create({ data: p as any });
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

        await prisma.panditProfile.update({
            where: { id: profile.id },
            data: { verificationStatus: "DOCUMENTS_SUBMITTED" }
        });

        await prisma.panditProfile.update({
            where: { id: profile.id },
            data: {
                aadhaarFrontUrl,
                aadhaarBackUrl,
                videoKycUrl: videoUrl,
            }
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

    const body = request.body as any;
    const { name, city } = body;

    if (!name || String(name).trim().length < 3) {
        return reply.status(400).send({
            success: false,
            error: { code: "validation_error", message: "Name must be at least 3 characters." }
        });
    }

    if (!city || String(city).trim().length === 0) {
        return reply.status(400).send({
            success: false,
            error: { code: "validation_error", message: "City is required." }
        });
    }

    const cleanName = String(name).trim();
    const cleanCity = String(city).trim();

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
