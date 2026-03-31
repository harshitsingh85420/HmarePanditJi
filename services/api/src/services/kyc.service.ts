/**
 * HmarePanditJi — KYC Verification Service
 *
 * Handles:
 * 1. Pandit document submission (Aadhaar, certificates)
 * 2. Video KYC session management
 * 3. Admin review queue (approve/reject)
 * 4. Aadhaar encryption (Master Rule #4)
 */

import { prisma } from "@hmarepanditji/db";
import { encryptAadhaar, getAadhaarLastFour } from "../utils/aadhaar";
import { AppError } from "../middleware/errorHandler";
import { logger } from "../utils/logger";

// ─── Submit Documents ────────────────────────────────────────────────────────

/**
 * Submit Aadhaar for verification (encrypted storage).
 */
export async function submitAadhaar(
    panditUserId: string,
    aadhaarNumber: string
) {
    // NEVER log the full Aadhaar number
    const encrypted = encryptAadhaar(aadhaarNumber);
    const lastFour = getAadhaarLastFour(aadhaarNumber);

    const pandit = await prisma.panditProfile.findUnique({
        where: { userId: panditUserId },
    });

    if (!pandit) {
        throw new AppError("Pandit profile not found", 404, "NOT_FOUND");
    }

    // Store encrypted Aadhaar and last 4 digits using dedicated columns
    await prisma.panditProfile.update({
        where: { userId: panditUserId },
        data: {
            aadhaarEncrypted: encrypted,
            aadhaarLastFour: lastFour,
            aadhaarVerified: false,
        },
    });

    logger.info(
        `[KYC] Aadhaar submitted for pandit ${panditUserId} (last 4: ${lastFour})`
    );

    return { aadhaarLastFour: lastFour };
}

// ─── Submit KYC Video ────────────────────────────────────────────────────────

/**
 * Create a KYC video session record.
 */
export async function submitVideoKYC(panditUserId: string, videoUrl: string) {
    const pandit = await prisma.panditProfile.findUnique({
        where: { userId: panditUserId },
    });

    if (!pandit) {
        throw new AppError("Pandit profile not found", 404, "NOT_FOUND");
    }

    // Update pandit verification status
    await prisma.panditProfile.update({
        where: { userId: panditUserId },
        data: {
            videoKycCompleted: true,
            verificationStatus: "DOCUMENTS_SUBMITTED",
        },
    });

    logger.info(`[KYC] Video KYC submitted for pandit ${panditUserId}`);

    return { status: "submitted", videoUrl };
}

// ─── Admin: Get KYC Review Queue ─────────────────────────────────────────────

/**
 * Get pending KYC verifications for admin review.
 */
export async function getKYCQueue(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [pandits, total] = await Promise.all([
        prisma.panditProfile.findMany({
            where: {
                verificationStatus: { in: ["PENDING", "DOCUMENTS_SUBMITTED", "VIDEO_KYC_DONE"] },
                user: { is: { isActive: true } },
            },
            include: {
                user: {
                    select: {
                        id: true,
                        phone: true,
                        name: true,
                        createdAt: true,
                    },
                },
            },
            orderBy: { createdAt: "asc" },
            skip,
            take: limit,
        }),
        prisma.panditProfile.count({
            where: {
                verificationStatus: { in: ["PENDING", "DOCUMENTS_SUBMITTED", "VIDEO_KYC_DONE"] },
                user: { is: { isActive: true } },
            },
        }),
    ]);

    return {
        queue: pandits.map((p: any) => ({
            panditId: p.id,
            userId: p.userId,
            displayName: p.displayName,
            phone: p.user.phone,
            verificationStatus: p.verificationStatus,
            aadhaarVerified: p.aadhaarVerified,
            videoKycCompleted: p.videoKycCompleted,
            certificateUrls: p.certificateUrls,
            certificatesVerified: p.certificatesVerified,
            specializations: p.specializations,
            languages: p.languages,
            experienceYears: p.experienceYears,
            city: p.city,
            state: p.state,
            submittedAt: p.createdAt.toISOString(),
        })),
        total,
        page,
        limit,
    };
}

// ─── Admin: Approve/Reject KYC ───────────────────────────────────────────────

/**
 * Approve or reject a pandit's KYC application.
 */
export async function reviewKYC(
    panditId: string,
    adminUserId: string,
    decision: "approve" | "reject",
    notes?: string
) {
    const pandit = await prisma.panditProfile.findUnique({
        where: { id: panditId },
        include: { user: true },
    });

    if (!pandit) {
        throw new AppError("Pandit not found", 404, "NOT_FOUND");
    }

    if (decision === "approve") {
        await prisma.panditProfile.update({
            where: { id: panditId },
            data: {
                verificationStatus: "VERIFIED",
                aadhaarVerified: true,
                certificatesVerified: true,
            },
        });

        await prisma.user.update({
            where: { id: pandit.userId },
            data: { isVerified: true },
        });

        // Log admin action
        await prisma.adminLog.create({
            data: {
                adminUserId,
                action: "KYC_APPROVED",
                targetType: "pandit",
                targetId: panditId,
                metadata: { notes },
            },
        });

        logger.info(`[KYC] Pandit ${panditId} APPROVED by admin ${adminUserId}`);
    } else {
        await prisma.panditProfile.update({
            where: { id: panditId },
            data: {
                verificationStatus: "REJECTED",
            },
        });

        // Log admin action
        await prisma.adminLog.create({
            data: {
                adminUserId,
                action: "KYC_REJECTED",
                targetType: "pandit",
                targetId: panditId,
                metadata: { notes, reason: notes },
            },
        });

        logger.info(`[KYC] Pandit ${panditId} REJECTED by admin ${adminUserId}`);
    }

    return {
        panditId,
        decision,
        notes,
        reviewedBy: adminUserId,
        reviewedAt: new Date().toISOString(),
    };
}

// ─── Admin: Get KYC Stats ────────────────────────────────────────────────────

export async function getKYCStats() {
    const [pending, verified, rejected, total] = await Promise.all([
        prisma.panditProfile.count({
            where: { verificationStatus: { in: ["PENDING", "DOCUMENTS_SUBMITTED", "VIDEO_KYC_DONE"] } },
        }),
        prisma.panditProfile.count({ where: { verificationStatus: "VERIFIED" } }),
        prisma.panditProfile.count({ where: { verificationStatus: "REJECTED" } }),
        prisma.panditProfile.count(),
    ]);

    return { pending, verified, rejected, total };
}
