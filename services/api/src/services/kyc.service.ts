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
import {
    KYC_REVIEW_QUEUE_STATUSES,
    KYC_REVIEW_QUEUE_WHERE,
    KYC_NOT_SUBMITTED_STATUSES,
    KYC_APPROVE_WRITE_STATUS,
    KYC_REJECT_WRITE_STATUS,
    KYC_SUBMITTED_WRITE_STATUS,
} from "@hmarepanditji/types";
import { encryptAadhaar, getAadhaarLastFour } from "../utils/aadhaar";
import { AppError } from "../middleware/errorHandler";
import { logger } from "../utils/logger";
import { markPanditVerified } from "../lib/verificationWriter";

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
            videoKycUrl: videoUrl,
            verificationStatus: KYC_SUBMITTED_WRITE_STATUS as any,
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

    // THE WIDENED QUEUE (Isj ruling, 2026-07-31): the submitted set OR a
    // PENDING profile with reviewable documents. PENDING-with-nothing stays
    // out — listing it is what let an admin "approve" an identity with no
    // documents. PENDING-with-documents (Tanya's shape: rows older than the
    // status vocabulary) was invisible to the only screen that could review
    // it; after §3 cleaned production it was the ONLY reviewable shape left,
    // which made the old set a lock with no key. ONE constant, shared with
    // the stats and the badge counter.
    const queueWhere = {
        AND: [
            KYC_REVIEW_QUEUE_WHERE as any,
            { user: { is: { isActive: true } } },
        ],
    };

    const [pandits, total] = await Promise.all([
        prisma.panditProfile.findMany({
            where: queueWhere,
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
            // oldest submission first — the man who has waited longest is reviewed first
            orderBy: { updatedAt: "asc" },
            skip,
            take: limit,
        }),
        prisma.panditProfile.count({ where: queueWhere }),
    ]);

    return {
        queue: pandits.map((p: any) => ({
            panditId: p.id,
            userId: p.userId,
            // displayName is optional; fullName/user.name are what registration writes
            displayName: p.displayName || p.fullName || p.user?.name || "",
            phone: p.user?.phone,
            verificationStatus: p.verificationStatus,
            // ── the identity documents, by their REAL column names ──
            aadhaarFrontUrl: p.aadhaarFrontUrl || p.aadhaarDocUrl || null,
            aadhaarBackUrl: p.aadhaarBackUrl || null,
            videoKycUrl: p.videoKycUrl || null,
            aadhaarLastFour: p.aadhaarLastFour || null,
            aadhaarConsentAt: p.aadhaarConsentAt?.toISOString() || null,
            aadhaarVerified: p.aadhaarVerified || false,
            // real column is videoKycCompleted — `videoKycVerified` never existed,
            // so this row always reported false however much video was uploaded
            videoKycCompleted: p.videoKycCompleted || false,
            // payout presence only — never the numbers themselves
            hasBankAccount: !!p.bankAccountNumber,
            hasUpi: !!p.upiId,
            certificateUrls: p.certificateUrls || [],
            certificatesVerified: p.certificatesVerified || false,
            specializations: p.specializations || [],
            languages: p.languages || [],
            experienceYears: p.experienceYears || 0,
            city: p.city || p.location || "",
            state: p.state || "",
            registeredAt: p.createdAt?.toISOString(),
            // best available submission stamp: the R5 submit is the write that
            // moved this row into the queue
            submittedAt: p.updatedAt?.toISOString(),
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
        // DELEGATED to the single writer (lib/verificationWriter.ts). This was
        // the THIRD place able to write VERIFIED — reachable at
        // POST /admin/kyc/:panditId/review while the admin UI approved through
        // two OTHER endpoints. The document flags stay here because they are
        // this path's own findings, not the identity claim itself.
        await markPanditVerified(panditId, adminUserId);
        await prisma.panditProfile.update({
            where: { id: panditId },
            data: {
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
                verificationStatus: KYC_REJECT_WRITE_STATUS as any,
                rejectionReason: notes || null,
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
    // awaitingReview and notSubmitted are DIFFERENT facts and were being added
    // together: one is a queue an admin must work through, the other is pandits
    // who have not uploaded anything and are waiting on themselves.
    const [awaitingReview, notSubmitted, verified, rejected, total] = await Promise.all([
        prisma.panditProfile.count({
            // counter=list law: the SAME widened where as getKYCQueue
            where: KYC_REVIEW_QUEUE_WHERE as any,
        }),
        prisma.panditProfile.count({
            where: { verificationStatus: { in: [...KYC_NOT_SUBMITTED_STATUSES] as any } },
        }),
        prisma.panditProfile.count({ where: { verificationStatus: KYC_APPROVE_WRITE_STATUS as any } }),
        prisma.panditProfile.count({ where: { verificationStatus: KYC_REJECT_WRITE_STATUS as any } }),
        prisma.panditProfile.count(),
    ]);

    // `pending` kept as an alias for awaitingReview so existing readers do not
    // break, but it now means "reviewable", not "reviewable + never uploaded".
    return { awaitingReview, notSubmitted, pending: awaitingReview, verified, rejected, total };
}
