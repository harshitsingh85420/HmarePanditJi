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
            await prisma.samagriPackage.deleteMany({ where: { panditProfileId: profile.id } });

            const samagriData = packages.map((pkg) => ({
                panditProfileId: profile.id,
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

export const submitOnboarding = async (request: FastifyRequest, reply: FastifyReply) => {
    const req = request as AuthenticatedRequest;
    const userId = req.user.id;

    // Extract the body
    const body = request.body as any;
    const { name, city, specializations, experience, teamSize, dakshina, aadhaarUrl, payment } = body;

    // Validate name
    if (!name || name.trim().length < 3) {
        return reply.status(400).send({
            success: false,
            error: { code: "validation_error", message: "Name must be at least 3 characters." }
        });
    }

    // Validate city
    if (!city || city.trim().length === 0) {
        return reply.status(400).send({
            success: false,
            error: { code: "validation_error", message: "City is required." }
        });
    }

    // Validate specializations
    if (!Array.isArray(specializations) || specializations.length === 0) {
        return reply.status(400).send({
            success: false,
            error: { code: "validation_error", message: "At least one specialization is required." }
        });
    }

    const validSpecs = ["SATYANARAYAN", "GRIHA_PRAVESH", "VIVAH", "MUNDAN", "NAAMKARAN", "HAVAN", "RUDRABHISHEK", "SHRADH"];
    for (const spec of specializations) {
        if (!validSpecs.includes(spec)) {
            return reply.status(400).send({
                success: false,
                error: { code: "validation_error", message: `Invalid specialization: ${spec}` }
            });
        }
    }

    // Validate experience and team size
    const expNum = Number(experience);
    if (isNaN(expNum) || expNum < 0 || expNum > 60) {
        return reply.status(400).send({
            success: false,
            error: { code: "validation_error", message: "Experience must be between 0 and 60 years." }
        });
    }

    const teamNum = Number(teamSize);
    if (isNaN(teamNum) || teamNum < 1 || teamNum > 10) {
        return reply.status(400).send({
            success: false,
            error: { code: "validation_error", message: "Team size must be between 1 and 10." }
        });
    }

    // Validate dakshina rates
    if (!dakshina || typeof dakshina !== "object") {
        return reply.status(400).send({
            success: false,
            error: { code: "validation_error", message: "Dakshina rates are required." }
        });
    }
    for (const spec of specializations) {
        const rate = Number(dakshina[spec]);
        if (isNaN(rate) || rate < 501 || rate > 500000) {
            return reply.status(400).send({
                success: false,
                error: { code: "validation_error", message: `Dakshina rate for ${spec} must be between 501 and 500,000.` }
            });
        }
    }

    // Validate Aadhaar URL
    if (!aadhaarUrl || typeof aadhaarUrl !== "string" || aadhaarUrl.trim().length === 0) {
        return reply.status(400).send({
            success: false,
            error: { code: "validation_error", message: "Aadhaar photo upload is required." }
        });
    }

    // Validate Payment
    if (!payment || typeof payment !== "object") {
        return reply.status(400).send({
            success: false,
            error: { code: "validation_error", message: "Payment details are required." }
        });
    }

    let bankAccountName: string | null = null;
    let bankAccountNumber: string | null = null;
    let bankIfscCode: string | null = null;
    let upiId: string | null = null;

    let hasBank = false;
    let hasUpi = false;

    if (payment.type === "BANK") {
        const { accountName, accountNumber, ifsc } = payment.bank || {};
        if (!accountName || accountName.trim().length === 0) {
            return reply.status(400).send({
                success: false,
                error: { code: "validation_error", message: "Account holder name is required." }
            });
        }
        const accNumStr = String(accountNumber || "");
        if (!/^\d{9,18}$/.test(accNumStr)) {
            return reply.status(400).send({
                success: false,
                error: { code: "validation_error", message: "Account number must be numeric and between 9 and 18 digits." }
            });
        }
        const ifscStr = String(ifsc || "").toUpperCase();
        if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifscStr)) {
            return reply.status(400).send({
                success: false,
                error: { code: "validation_error", message: "Invalid IFSC code format." }
            });
        }
        bankAccountName = accountName;
        bankAccountNumber = Buffer.from(accNumStr).toString('base64');
        bankIfscCode = ifscStr;
        hasBank = true;
    } else if (payment.type === "UPI") {
        const upiVal = String(payment.upi?.id || "");
        if (!/^[\w.-]{2,}@[a-zA-Z]{2,}$/.test(upiVal)) {
            return reply.status(400).send({
                success: false,
                error: { code: "validation_error", message: "Invalid UPI ID format." }
            });
        }
        upiId = upiVal;
        hasUpi = true;
    } else {
        return reply.status(400).send({
            success: false,
            error: { code: "validation_error", message: "Select either bank account or UPI." }
        });
    }

    if (!hasBank && !hasUpi) {
        return reply.status(400).send({
            success: false,
            error: { code: "validation_error", message: "At least one payment method (Bank or UPI) must be complete." }
        });
    }

    try {
        await prisma.$transaction(async (tx) => {
            // Update User name
            await tx.user.update({
                where: { id: userId },
                data: { name }
            });

            // Find or Create PanditProfile
            let profile = await tx.panditProfile.findUnique({
                where: { userId }
            });

            const profileData = {
                fullName: name,
                location: city,
                city,
                experienceYears: expNum,
                yearsExperience: expNum,
                teamSize: teamNum,
                aadhaarDocUrl: aadhaarUrl,
                aadhaarFrontUrl: aadhaarUrl,
                specializations,
                verificationStatus: "PENDING" as any,
                bankAccountName,
                bankAccountNumber,
                bankIfscCode,
                bankIfsc: bankIfscCode,
                upiId
            };

            if (profile) {
                profile = await tx.panditProfile.update({
                    where: { id: profile.id },
                    data: profileData
                });
            } else {
                profile = await tx.panditProfile.create({
                    data: {
                        userId,
                        ...profileData
                    }
                });
            }

            // Remove existing dakshina rates
            await tx.dakshinaRate.deleteMany({
                where: { panditId: profile.id }
            });

            // Write DakshinaRate rows
            const ratesData = specializations.map((spec) => ({
                panditId: profile.id,
                pujaType: spec,
                amount: Number(dakshina[spec])
            }));

            await tx.dakshinaRate.createMany({
                data: ratesData
            });
        });

        return reply.send({
            success: true,
            data: {
                message: "Onboarding submitted successfully."
            }
        });
    } catch (err: any) {
        return reply.status(500).send({
            success: false,
            error: { code: "server_error", message: err.message || "Failed to submit onboarding." }
        });
    }
};
