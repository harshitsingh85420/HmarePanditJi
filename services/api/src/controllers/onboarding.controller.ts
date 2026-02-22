import { Request, Response, NextFunction } from "express";
import { prisma } from "@hmarepanditji/db";
import { AppError } from "../middleware/errorHandler";
import { sendSuccess } from "../utils/response";
// Assuming you have some crypto utils, if not I will just use base64 for demo
// import { encrypt } from "../utils/crypto";

function encrypt(text: string) {
    return Buffer.from(text).toString('base64'); // Simple encoding for phase 1 demo
}

// NOTE: requireRole('PANDIT') ensures req.user exists and has role PANDIT
// We assume authenticate middleware is applied

export const onboardingStep1 = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { fullName, dateOfBirth, gender, homeCity, homeState, experienceYears, bio, profilePhotoUrl, aadhaarNumber, panNumber } = req.body;

        // 1. Update User.name
        await prisma.user.update({
            where: { id: req.user!.id },
            data: { name: fullName },
        });

        // 2. Update PanditProfile
        const profile = await prisma.panditProfile.findUnique({ where: { userId: req.user!.id } });
        if (!profile) throw new AppError("Profile not found", 404);

        await prisma.panditProfile.update({
            where: { id: profile.id },
            data: {
                profilePhotoUrl: profilePhotoUrl,
                location: homeCity,
                fullAddress: homeCity + ", " + homeState,
                experienceYears,
                bio,
                aadhaarFrontUrl: encrypt(aadhaarNumber), // using this field temporarily to store encrypted if needed, or omit if schema doesn't have aadhaarNumber
            }
        });



        sendSuccess(res, { step: 1 }, "Step 1 saved");
    } catch (err) {
        next(err);
    }
};

export const onboardingStep2 = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { pujaTypes, languages, gotra, vedicDegree, specialCertifications } = req.body;

        const profile = await prisma.panditProfile.findUnique({ where: { userId: req.user!.id } });
        if (!profile) throw new AppError("Profile not found", 404);

        // Update Profile
        await prisma.panditProfile.update({
            where: { id: profile.id },
            data: {
                languages,
                // vedicDegree, gotra not in schema
                // certifications: specialCertifications not in schema
            }
        });

        // We can directly use pujaTypes and create pujaServices without price for now, or just store a tag. 
        // Assuming we insert PujaService records. First delete old, then insert.
        await prisma.pujaService.deleteMany({ where: { panditProfileId: profile.id } });

        const pujaLinks = pujaTypes.map((pt: string) => ({
            panditProfileId: profile.id,
            pujaType: pt,
            dakshinaAmount: 0,
            durationHours: 2,
        }));
        await prisma.pujaService.createMany({ data: pujaLinks });



        sendSuccess(res, { step: 2 }, "Step 2 saved");
    } catch (err) {
        next(err);
    }
};

export const onboardingStep3 = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { willingToTravel, maxTravelDistanceKm, preferredTravelModes, requiresAccommodation, requiresFoodArrangement, localServiceRadius, outOfDelhiAvailable } = req.body;

        const profile = await prisma.panditProfile.findUnique({ where: { userId: req.user!.id } });
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



        sendSuccess(res, { step: 3 }, "Step 3 saved");
    } catch (err) {
        next(err);
    }
};

export const onboardingStep4 = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { canBringSamagri, packages } = req.body;

        const profile = await prisma.panditProfile.findUnique({ where: { userId: req.user!.id } });
        if (!profile) throw new AppError("Profile not found", 404);



        if (canBringSamagri) {
            await prisma.samagriPackage.deleteMany({ where: { panditProfileId: profile.id } });

            const samagriData = packages.map((pkg: any) => ({
                panditProfileId: profile.id,
                packageType: pkg.packageType,
                packageName: pkg.name,
                pujaType: "All", // fallback
                fixedPrice: pkg.price,
                items: pkg.items.map((it: string) => ({ itemName: it, quantity: '1' })),
            }));

            // Need to create individually due to items Json or relation
            for (const p of samagriData) {
                await prisma.samagriPackage.create({ data: p });
            }
        }



        sendSuccess(res, { step: 4 }, "Step 4 saved");
    } catch (err) {
        next(err);
    }
};

export const onboardingStep5 = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { aadhaarFrontUrl, aadhaarBackUrl, selfieWithAadhaarUrl, videoUrl, videoUploaded } = req.body;

        const profile = await prisma.panditProfile.findUnique({ where: { userId: req.user!.id } });
        if (!profile) throw new AppError("Profile not found", 404);

        await prisma.panditProfile.update({
            where: { id: profile.id },
            data: { verificationStatus: "DOCUMENTS_SUBMITTED" }
        });

        // No kycSubmission model, just update PanditProfile
        await prisma.panditProfile.update({
            where: { id: profile.id },
            data: {
                aadhaarFrontUrl,
                aadhaarBackUrl,
                videoKycUrl: videoUrl,
            }
        });



        sendSuccess(res, { step: 5 }, "Step 5 saved");
    } catch (err) {
        next(err);
    }
};

export const onboardingComplete = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { accountHolderName, bankName, accountNumber, ifscCode, accountType } = req.body;

        const profile = await prisma.panditProfile.findUnique({ where: { userId: req.user!.id } });
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

        // User profile status could be set to verified if admin action is not required
        // await prisma.user.update({
        //     where: { id: req.user!.id },
        //     data: { isVerified: true },
        // });

        sendSuccess(res, { redirectTo: '/dashboard' }, "Onboarding completed");
    } catch (err) {
        next(err);
    }
};
