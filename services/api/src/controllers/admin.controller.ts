import { FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { prisma } from "@hmarepanditji/db";
import { AppError } from "../middleware/errorHandler";
import { logger } from "../utils/logger";

// Helper to build success response
function successBody<T>(data: T, message = "Success"): { success: boolean; data: T; message: string } {
    return { success: true, data, message };
}

function paginatedBody<T>(data: T, total: number, page: number, limit: number, message = "Success") {
    return {
        success: true,
        data,
        message,
        meta: { page, limit, total, totalPages: Math.ceil(total / limit) }
    };
}

// existing stats controller
export const getDashboardStats = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date(todayStart);
        todayEnd.setDate(todayEnd.getDate() + 1);

        const now = new Date();
        const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const prevMonthEnd = new Date(currentMonthStart);

        const [
            todaysBookingsEvents,
            monthlyRevenueCurrent,
            monthlyRevenuePrev,
            activePanditsVers,
            travelCount,
            verifyCount,
            payoutCount,
            cancelCount
        ] = await Promise.all([
            prisma.booking.findMany({
                where: { eventDate: { gte: todayStart, lt: todayEnd } },
                select: { status: true }
            }),
            prisma.booking.aggregate({
                where: { paymentStatus: "CAPTURED", updatedAt: { gte: currentMonthStart } },
                _sum: { grandTotal: true },
            }),
            prisma.booking.aggregate({
                where: { paymentStatus: "CAPTURED", updatedAt: { gte: prevMonthStart, lt: prevMonthEnd } },
                _sum: { grandTotal: true },
            }),
            prisma.panditProfile.findMany({ select: { verificationStatus: true, isOnline: true } }),
            prisma.booking.count({ where: { travelRequired: true, travelStatus: "PENDING", status: { notIn: ["CANCELLED", "REFUNDED", "CREATED"] } } }),
            prisma.panditProfile.count({ where: { verificationStatus: "DOCUMENTS_SUBMITTED" } }),
            prisma.booking.count({ where: { paymentStatus: "CAPTURED", status: "COMPLETED", payoutStatus: "PENDING" } }),
            prisma.booking.count({ where: { status: { in: ["CANCELLED", "REFUNDED"] }, refundStatus: "PENDING" } }),
        ]);

        const todaysTotal = todaysBookingsEvents.length;
        let todaysConfirmed = 0;
        let todaysInProgress = 0;
        for (const b of todaysBookingsEvents) {
            if (b.status === "CONFIRMED") todaysConfirmed++;
            else if (["PANDIT_EN_ROUTE", "PANDIT_ARRIVED", "PUJA_IN_PROGRESS"].includes(b.status)) todaysInProgress++;
        }

        const currentRev = monthlyRevenueCurrent._sum?.grandTotal ?? 0;
        const prevRev = monthlyRevenuePrev._sum?.grandTotal ?? 0;
        let percentChange = 0;
        if (prevRev > 0) percentChange = Math.round(((currentRev - prevRev) / prevRev) * 100);

        let verified = 0;
        let online = 0;
        for (const p of activePanditsVers) {
            if (p.verificationStatus === "VERIFIED") verified++;
            if (p.isOnline) online++;
        }

        return reply.send(successBody({
            todaysBookings: { total: todaysTotal, confirmed: todaysConfirmed, inProgress: todaysInProgress },
            pendingActions: { travel: travelCount, verification: verifyCount, payouts: payoutCount, cancellations: cancelCount },
            monthlyRevenue: { current: currentRev, previous: prevRev, percentChange },
            activePandits: { verified, online }
        }));
    } catch (err) {
        throw err;
    }
};

export const getAlerts = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const now = new Date();
        const in48hrs = new Date(now.getTime() + 48 * 60 * 60 * 1000);
        const ago24hrs = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const ago48hrs = new Date(now.getTime() - 48 * 60 * 60 * 1000);

        const [urgentTravel, pendingVerifications, pendingPayouts, cancellations] = await Promise.all([
            prisma.booking.findMany({
                where: { eventDate: { lt: in48hrs, gt: now }, travelStatus: "PENDING", travelRequired: true },
                select: { id: true, bookingNumber: true, eventDate: true, pandit: { select: { name: true } } },
                take: 10
            }),
            prisma.panditProfile.findMany({
                where: { verificationStatus: "DOCUMENTS_SUBMITTED", updatedAt: { lt: ago24hrs } },
                select: { id: true, user: { select: { name: true } } },
                take: 10
            }),
            prisma.booking.findMany({
                where: { status: "COMPLETED", payoutStatus: "PENDING", updatedAt: { lt: ago48hrs } },
                select: { id: true, bookingNumber: true, panditPayout: true, pandit: { select: { name: true } } },
                take: 10
            }),
            prisma.booking.findMany({
                where: { status: "CANCELLATION_REQUESTED" },
                select: { id: true, bookingNumber: true, customer: { select: { name: true } } },
                take: 10
            })
        ]);

        const alerts = [];
        for (const t of urgentTravel) {
            alerts.push({
                type: "TRAVEL", severity: "HIGH",
                message: `URGENT: Booking ${t.bookingNumber} has event in <48 hours, travel NOT booked. Pandit ${t.pandit?.name ?? '-'} needs travel arranged.`,
                actionUrl: "/travel-desk", bookingId: t.id
            });
        }
        for (const v of pendingVerifications) {
            alerts.push({
                type: "VERIFICATION", severity: "MEDIUM",
                message: `${v.user?.name ?? 'Pandit'} submitted documents >24 hours ago — review needed.`,
                actionUrl: `/pandits/${v.id}`, bookingId: null
            });
        }
        for (const p of pendingPayouts) {
            alerts.push({
                type: "PAYOUT", severity: "MEDIUM",
                message: `₹${p.panditPayout} payout pending for ${p.pandit?.name ?? 'Pandit'} — Booking ${p.bookingNumber}.`,
                actionUrl: "/payouts", bookingId: p.id
            });
        }
        for (const c of cancellations) {
            alerts.push({
                type: "CANCELLATION", severity: "LOW",
                message: `Customer ${c.customer?.name ?? ''} requested cancellation for ${c.bookingNumber}.`,
                actionUrl: "/cancellations", bookingId: c.id
            });
        }

        return reply.send(successBody(alerts));
    } catch (err) {
        throw err;
    }
};

export const getActivityFeed = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const query = request.query as Record<string, string | undefined>;
        const limit = Math.min(50, Math.max(1, Number(query.limit) || 20));
        const events = await prisma.bookingStatusUpdate.findMany({
            take: limit,
            orderBy: { createdAt: "desc" },
            include: {
                booking: { select: { bookingNumber: true, grandTotal: true, pandit: { select: { name: true } } } },
                updatedBy: { select: { name: true, role: true } }
            }
        });

        const feed = events.map(e => {
            let icon = "📝";
            let msg = `${e.updatedBy.name} changed status to ${e.toStatus} for ${e.booking.bookingNumber}`;
            if (e.toStatus === "CONFIRMED") { icon = "✅"; msg = `Booking ${e.booking.bookingNumber} confirmed`; }
            else if (e.toStatus === "COMPLETED") { icon = "🌸"; msg = `Pandit ${e.booking.pandit?.name} marked puja as completed (${e.booking.bookingNumber})`; }
            else if (e.toStatus === "CREATED") { icon = "🆕"; msg = `New booking ${e.booking.bookingNumber} created (₹${e.booking.grandTotal})`; }
            else if (e.toStatus === "TRAVEL_BOOKED") { icon = "✈️"; msg = `Travel booked for ${e.booking.bookingNumber}`; }

            return {
                id: e.id,
                icon,
                message: msg,
                createdAt: e.createdAt,
                bookingId: e.bookingId
            };
        });

        return reply.send(successBody(feed));
    } catch (err) {
        throw err;
    }
};

export const getTravelQueue = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const query = request.query as Record<string, string | undefined>;
        const tab = query.tab || "pending";
        const where: Record<string, unknown> = {
            travelRequired: true,
            status: { notIn: ["CANCELLED", "REFUNDED", "CREATED"] }
        };

        if (tab === "pending") {
            where.status = "CONFIRMED";
            where.travelStatus = "PENDING";
        } else if (tab === "calculating") {
            where.travelStatus = "ADMIN_CALCULATING";
        } else if (tab === "booked") {
            where.travelStatus = "BOOKED";
            const ago30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
            where.updatedAt = { gte: ago30 };
        }

        const bookings = await prisma.booking.findMany({
            where,
            orderBy: { eventDate: "asc" },
            select: {
                id: true, bookingNumber: true, eventType: true, eventDate: true, venueCity: true,
                venueAddress: true, travelMode: true, travelDistanceKm: true, travelStatus: true,
                travelBookingRef: true, travelNotes: true, travelCost: true, status: true,
                calculatedTravelCost: true, travelBreakdown: true, travelBookingDetails: true,
                pandit: { select: { id: true, name: true, phone: true, panditProfile: { select: { location: true } } } },
                customer: { select: { id: true, name: true, phone: true } }
            }
        });

        return reply.send(successBody(bookings));
    } catch (err) {
        throw err;
    }
};

const calculateTravelSchema = z.object({
    calculatedTravelCost: z.number().int().min(0),
    travelNotes: z.string().optional(),
    travelBreakdown: z.object({
        outbound: z.number().int().optional(),
        return: z.number().int().optional(),
        localCab: z.number().int().optional(),
        accommodation: z.number().int().optional(),
    }).optional()
});

export const travelCalculate = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const { calculatedTravelCost, travelNotes, travelBreakdown } = calculateTravelSchema.parse(request.body);
        const params = request.params as Record<string, string>;
        const updated = await prisma.booking.update({
            where: { id: params.id },
            data: {
                calculatedTravelCost,
                ...(travelNotes && { travelNotes }),
                ...(travelBreakdown && { travelBreakdown }),
                travelStatus: "ADMIN_CALCULATING"
            }
        });

        return reply.send(successBody(updated));
    } catch (err) {
        throw err;
    }
};

const travelBookedSchema = z.object({
    travelBookingDetails: z.record(z.unknown()).optional(),
    actualTravelCost: z.number().int().min(0),
    travelDocumentUrls: z.array(z.string()).optional()
});

export const travelBooked = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const { travelBookingDetails, actualTravelCost, travelDocumentUrls } = travelBookedSchema.parse(request.body);
        const params = request.params as Record<string, string>;

        const booking = await prisma.booking.findUnique({ where: { id: params.id } });
        if (!booking) throw new AppError("Booking not found", 404, "NOT_FOUND");

        const updated = await prisma.booking.update({
            where: { id: params.id },
            data: {
                travelStatus: "BOOKED",
                ...(travelBookingDetails && { travelBookingDetails: travelBookingDetails as any }),
                travelCost: actualTravelCost,
                ...(travelDocumentUrls && { travelDocumentUrls }),
            },
        });

        if (booking.status === "CONFIRMED") {
            const authRequest = request as FastifyRequest & { user: { id: string } };
            await prisma.bookingStatusUpdate.create({
                data: {
                    bookingId: updated.id,
                    fromStatus: "CONFIRMED",
                    toStatus: "TRAVEL_BOOKED",
                    updatedById: authRequest.user!.id,
                    note: "Travel booked by Admin"
                }
            });
        }

        try {
            const { NotificationService } = await import("../services/notification.service");
            const { getNotificationTemplate } = await import("../services/notification-templates");
            const ns = new NotificationService();

            if (updated.panditId) {
                const pInfo = getNotificationTemplate("TRAVEL_BOOKED_PANDIT", {
                    id: updated.id.substring(0, 8).toUpperCase(),
                    mode: updated.travelMode ?? "Transport",
                    details: updated.travelNotes ?? "N/A",
                    reference: updated.travelBookingRef ?? "See app"
                });
                await ns.notify({ userId: updated.panditId, type: "TRAVEL_BOOKED", title: pInfo.title, message: pInfo.message, smsMessage: pInfo.smsMessage });
            }

            if (updated.customerId) {
                const cInfo = getNotificationTemplate("TRAVEL_BOOKED", {
                    id: updated.id.substring(0, 8).toUpperCase(),
                    travelMode: updated.travelMode ?? "Transport",
                    details: updated.travelNotes ?? "N/A"
                });
                await ns.notify({ userId: updated.customerId, type: "TRAVEL_BOOKED", title: cInfo.title, message: cInfo.message, smsMessage: cInfo.smsMessage });
            }
        } catch (e) {
            console.error("Failed to send travel booked notification", e);
        }

        return reply.send(successBody(updated));
    } catch (err) {
        throw err;
    }
};

// ========================== PANDIT QUEUE ==========================

export const getPanditsAdmin = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const query = request.query as Record<string, string | undefined>;
        const page = Math.max(1, Number(query.page) || 1);
        const limit = Math.min(50, Math.max(1, Number(query.limit) || 20));
        const skip = (page - 1) * limit;

        const status = query.status;
        const search = query.search;

        const where: Record<string, unknown> = {};
        if (status) {
            if (status === "pending") {
                where.verificationStatus = { in: ["DOCUMENTS_SUBMITTED", "VIDEO_KYC_DONE"] };
            } else if (status === "verified") {
                where.verificationStatus = "VERIFIED";
            } else if (status === "rejected") {
                where.verificationStatus = "REJECTED";
            }
        }

        if (search) {
            where.user = {
                OR: [
                    { name: { contains: search, mode: "insensitive" } },
                    { phone: { contains: search, mode: "insensitive" } },
                ]
            };
        }

        const [pandits, total] = await Promise.all([
            prisma.panditProfile.findMany({
                where,
                skip,
                take: limit,
                orderBy: status === "pending" ? { updatedAt: "asc" } : { createdAt: "desc" },
                include: {
                    user: { select: { id: true, name: true, phone: true } }
                }
            }),
            prisma.panditProfile.count({ where })
        ]);

        const pendingProfiles = await prisma.panditProfile.findMany({
            where: { verificationStatus: { in: ["DOCUMENTS_SUBMITTED", "VIDEO_KYC_DONE"] } },
            select: { updatedAt: true }
        });

        const totalPending = pendingProfiles.length;
        let oldestPendingDays = 0;
        let avgWaitHours = 0;

        if (totalPending > 0) {
            const now = new Date().getTime();
            let totalWaitTimeMs = 0;
            let oldestMs = now;

            for (const p of pendingProfiles) {
                const waitMs = now - new Date(p.updatedAt).getTime();
                totalWaitTimeMs += waitMs;
                if (new Date(p.updatedAt).getTime() < oldestMs) {
                    oldestMs = new Date(p.updatedAt).getTime();
                }
            }

            oldestPendingDays = Math.floor((now - oldestMs) / (1000 * 60 * 60 * 24));
            avgWaitHours = Math.floor(Math.round(totalWaitTimeMs / totalPending) / (1000 * 60 * 60));
        }

        return reply.send(paginatedBody(pandits, total, page, limit, "Success"));
    } catch (err) {
        throw err;
    }
};

export const getPanditAdminDetail = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const params = request.params as Record<string, string>;
        const panditId = params.panditId;
        const pandit = await prisma.panditProfile.findUnique({
            where: { id: panditId },
            include: {
                user: true,
                pujaServices: true,
                samagriPackages: true,
            }
        });

        if (!pandit) {
            throw new AppError("Pandit not found", 404, "NOT_FOUND");
        }

        return reply.send(successBody(pandit));
    } catch (err) {
        throw err;
    }
};

const verifySchema = z.object({
    action: z.enum(["APPROVE", "REJECT", "REQUEST_INFO"]),
    reason: z.string().optional(),
    notes: z.string().optional(),
    requestedDocuments: z.array(z.string()).optional(),
});

export const updatePanditVerification = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const { action, reason, notes, requestedDocuments } = verifySchema.parse(request.body);
        const params = request.params as Record<string, string>;
        const panditId = params.panditId;

        const pandit = await prisma.panditProfile.findUnique({
            where: { id: panditId },
            include: { user: true }
        });

        if (!pandit) throw new AppError("Pandit not found", 404, "NOT_FOUND");

        let verificationStatus: string = pandit.verificationStatus;
        const updateData: Record<string, unknown> = {};

        if (notes !== undefined) {
            updateData.adminNotes = notes;
        }

        if (action === "APPROVE") {
            verificationStatus = "VERIFIED";
            updateData.profileCompletionPercent = 100;
            updateData.verifiedAt = new Date();
            const authRequest = request as FastifyRequest & { user?: { id: string } };
            updateData.verifiedById = authRequest.user?.id || "admin";
        } else if (action === "REJECT") {
            verificationStatus = "REJECTED";
            if (reason) updateData.rejectionReason = reason;
        } else if (action === "REQUEST_INFO") {
            verificationStatus = "PENDING";
        }

        updateData.verificationStatus = verificationStatus;

        const updated = await prisma.panditProfile.update({
            where: { id: panditId },
            data: updateData
        });

        // Notifications
        try {
            const { NotificationService } = await import("../services/notification.service");
            const { getNotificationTemplate } = await import("../services/notification-templates");
            const ns = new NotificationService();

            if (action === "APPROVE") {
                const tmpl = getNotificationTemplate("VERIFICATION_APPROVED", {});
                await ns.notify({ userId: pandit.userId, type: "VERIFICATION", title: tmpl.title, message: tmpl.message, smsMessage: tmpl.smsMessage });
            } else if (action === "REJECT") {
                const tmpl = getNotificationTemplate("VERIFICATION_REJECTED", { reason: reason || "Unknown" });
                await ns.notify({ userId: pandit.userId, type: "VERIFICATION", title: tmpl.title, message: tmpl.message, smsMessage: tmpl.smsMessage });
            } else if (action === "REQUEST_INFO") {
                await ns.notify({ userId: pandit.userId, type: "VERIFICATION", title: "Info Requested", message: "Additional Info needed: " + (requestedDocuments?.join(", ") || "") });
            }
        } catch (err) {
            console.error("Failed to send verification notification", err);
        }

        return reply.send(successBody(updated));
    } catch (err) {
        throw err;
    }
};

// ========================== ALL BOOKINGS ==========================

export const getAllBookingsAdmin = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const query = request.query as Record<string, string | undefined>;
        const page = Math.max(1, Number(query.page) || 1);
        const limit = Math.min(50, Math.max(1, Number(query.limit) || 20));
        const skip = (page - 1) * limit;

        const { status, dateFrom, dateTo, city, pandit, customer, paymentStatus, travelStatus } = query;

        const where: Record<string, unknown> = {};
        if (status) where.status = { in: status.split(",") };
        if (dateFrom && dateTo) {
            where.eventDate = {
                gte: new Date(dateFrom),
                lte: new Date(dateTo)
            };
        }
        if (city) where.venueCity = { contains: city, mode: "insensitive" };
        if (paymentStatus) where.paymentStatus = paymentStatus;
        if (travelStatus) where.travelStatus = travelStatus;

        if (pandit) {
            where.pandit = {
                OR: [
                    { name: { contains: pandit, mode: "insensitive" } },
                    { phone: { contains: pandit } }
                ]
            };
        }
        if (customer) {
            where.customer = {
                OR: [
                    { name: { contains: customer, mode: "insensitive" } },
                    { phone: { contains: customer } }
                ]
            };
        }

        const [bookings, total, stats] = await Promise.all([
            prisma.booking.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: "desc" },
                select: {
                    id: true, bookingNumber: true, eventType: true, eventDate: true, status: true,
                    grandTotal: true, paymentStatus: true, travelStatus: true, payoutStatus: true,
                    customer: { select: { id: true, name: true, phone: true } },
                    pandit: { select: { id: true, name: true, phone: true } },
                    createdAt: true
                }
            }),
            prisma.booking.count({ where }),
            prisma.booking.aggregate({ where, _sum: { grandTotal: true } })
        ]);

        const totalGmv = stats._sum.grandTotal || 0;

        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const thisMonthStats = await prisma.booking.aggregate({
            where: { ...where, paymentStatus: "CAPTURED", createdAt: { gte: startOfMonth } },
            _sum: { grandTotal: true }
        });
        const thisMonthGmv = thisMonthStats._sum.grandTotal || 0;

        let totalGmvNumber = 0;
        let thisMonthGmvNumber = 0;

        try {
            totalGmvNumber = Number(totalGmv);
            thisMonthGmvNumber = Number(thisMonthGmv);
        } catch (e) {
            logger.warn('Failed to parse GMV numbers:', e);
        }

        return reply.send(paginatedBody(bookings, total, page, limit, "Success"));
    } catch (err) {
        throw err;
    }
};

export const getBookingAdminDetail = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const params = request.params as Record<string, string>;
        const booking = await prisma.booking.findUnique({
            where: { id: params.bookingId },
            include: {
                customer: { include: { customerProfile: true } },
                pandit: { include: { panditProfile: true } },
                statusUpdates: {
                    include: { updatedBy: { select: { id: true, name: true, role: true } } },
                    orderBy: { createdAt: "desc" }
                }
            }
        });

        if (!booking) throw new AppError("Booking not found", 404);

        return reply.send(successBody(booking));
    } catch (err) {
        throw err;
    }
};

export const updateBookingStatusAdmin = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const params = request.params as Record<string, string>;
        const { status, notes } = request.body as Record<string, string>;
        if (!status) throw new AppError("Status is required", 400);

        const booking = await prisma.booking.findUnique({ where: { id: params.id } });
        if (!booking) throw new AppError("Booking not found", 404);

        const updated = await prisma.booking.update({
            where: { id: params.id },
            data: {
                status: status as any, // Will be validated by Zod schema upstream
                ...(notes && { adminNotes: (booking.adminNotes ? booking.adminNotes + "\n" : "") + `[${new Date().toISOString()}] ${notes}` })
            }
        });

        const authRequest = request as FastifyRequest & { user: { id: string } };
        await prisma.bookingStatusUpdate.create({
            data: {
                bookingId: updated.id,
                fromStatus: booking.status,
                toStatus: status as any,
                updatedById: authRequest.user!.id,
                note: notes || "Admin changed status manually"
            }
        });

        return reply.send(successBody(updated));
    } catch (err) {
        throw err;
    }
};

export const reassignPanditAdmin = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const params = request.params as Record<string, string>;
        const { newPanditId, reason } = request.body as Record<string, string>;
        if (!newPanditId) throw new AppError("newPanditId is required", 400);

        const booking = await prisma.booking.findUnique({ where: { id: params.id } });
        if (!booking) throw new AppError("Booking not found", 404);

        const updated = await prisma.booking.update({
            where: { id: params.id },
            data: {
                panditId: newPanditId,
                status: "PANDIT_REQUESTED",
                adminNotes: (booking.adminNotes ? booking.adminNotes + "\n" : "") + `[${new Date().toISOString()}] Admin Reassigned to ${newPanditId}. Reason: ${reason}`
            }
        });

        const authRequest = request as FastifyRequest & { user: { id: string } };
        await prisma.bookingStatusUpdate.create({
            data: {
                bookingId: updated.id,
                fromStatus: booking.status,
                toStatus: "PANDIT_REQUESTED",
                updatedById: authRequest.user!.id,
                note: `Reassigned pandit. Reason: ${reason}`
            }
        });

        return reply.send(successBody(updated, "Pandit reassigned successfully"));
    } catch (err) {
        throw err;
    }
};

// ========================== SUPPORT TICKETS ==========================

export const getSupportTickets = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const query = request.query as Record<string, string | undefined>;
        const page = Math.max(1, Number(query.page) || 1);
        const limit = Math.min(50, Math.max(1, Number(query.limit) || 20));
        const skip = (page - 1) * limit;

        const { status, priority } = query;
        const where: Record<string, unknown> = {};
        if (status) where.status = status;
        if (priority) where.priority = priority;

        const [tickets, total] = await Promise.all([
            prisma.supportTicket.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: "desc" }
            }),
            prisma.supportTicket.count({ where })
        ]);

        return reply.send(paginatedBody(tickets, total, page, limit));
    } catch (err) {
        throw err;
    }
};

const createTicketSchema = z.object({
    source: z.string(),
    type: z.string(),
    subject: z.string(),
    description: z.string(),
    priority: z.string(),
    status: z.string(),
    relatedBookingId: z.string().optional().nullable(),
    relatedUserId: z.string().optional().nullable(),
});

export const createSupportTicket = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const data = createTicketSchema.parse(request.body);
        const authRequest = request as FastifyRequest & { user: { id: string } };
        const ticket = await prisma.supportTicket.create({
            data: {
                ...data,
                createdBy: authRequest.user!.id
            }
        });
        return reply.code(201).send(successBody(ticket, "Ticket created"));
    } catch (err) {
        throw err;
    }
};

const updateTicketSchema = z.object({
    status: z.string().optional(),
    priority: z.string().optional(),
    resolution: z.string().optional(),
});

export const updateSupportTicket = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const params = request.params as Record<string, string>;
        const data = updateTicketSchema.parse(request.body);
        const ticket = await prisma.supportTicket.update({
            where: { id: params.id },
            data
        });
        return reply.send(successBody(ticket));
    } catch (err) {
        throw err;
    }
};
