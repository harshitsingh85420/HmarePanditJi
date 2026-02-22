// @ts-nocheck
import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { prisma } from "@hmarepanditji/db";
import { sendSuccess, sendPaginated } from "../utils/response";
import { AppError } from "../middleware/errorHandler";

// existing stats controller
export const getDashboardStats = async (req: Request, res: Response, next: NextFunction) => {
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

        sendSuccess(res, {
            todaysBookings: { total: todaysTotal, confirmed: todaysConfirmed, inProgress: todaysInProgress },
            pendingActions: { travel: travelCount, verification: verifyCount, payouts: payoutCount, cancellations: cancelCount },
            monthlyRevenue: { current: currentRev, previous: prevRev, percentChange },
            activePandits: { verified, online }
        });
    } catch (err) {
        next(err);
    }
};

export const getAlerts = async (req: Request, res: Response, next: NextFunction) => {
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

        sendSuccess(res, alerts);
    } catch (err) {
        next(err);
    }
};

export const getActivityFeed = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));
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

        sendSuccess(res, feed);
    } catch (err) {
        next(err);
    }
};

export const getTravelQueue = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const tab = req.query.tab as string || "pending";
        const where: Record<string, any> = {
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

        sendSuccess(res, bookings);
    } catch (err) {
        next(err);
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

export const travelCalculate = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { calculatedTravelCost, travelNotes, travelBreakdown } = calculateTravelSchema.parse(req.body);
        const updated = await prisma.booking.update({
            where: { id: req.params.id },
            data: {
                calculatedTravelCost,
                ...(travelNotes && { travelNotes }),
                ...(travelBreakdown && { travelBreakdown }),
                travelStatus: "ADMIN_CALCULATING"
            }
        });

        sendSuccess(res, updated);
    } catch (err) {
        next(err);
    }
};

const travelBookedSchema = z.object({
    travelBookingDetails: z.any().optional(),
    actualTravelCost: z.number().int().min(0),
    travelDocumentUrls: z.array(z.string()).optional()
});

export const travelBooked = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { travelBookingDetails, actualTravelCost, travelDocumentUrls } = travelBookedSchema.parse(req.body);

        const booking = await prisma.booking.findUnique({ where: { id: req.params.id } });
        if (!booking) throw new AppError("Booking not found", 404, "NOT_FOUND");

        const updated = await prisma.booking.update({
            where: { id: req.params.id },
            data: {
                travelStatus: "BOOKED",
                ...(travelBookingDetails && { travelBookingDetails }),
                travelCost: actualTravelCost,
                ...(travelDocumentUrls && { travelDocumentUrls }),
                ...(booking.status === "CONFIRMED" && { status: "TRAVEL_BOOKED" })
            },
            include: {
                pandit: { select: { id: true, name: true, phone: true } },
                customer: { select: { id: true, name: true, phone: true } },
            }
        });

        if (booking.status === "CONFIRMED") {
            await prisma.bookingStatusUpdate.create({
                data: {
                    bookingId: updated.id,
                    fromStatus: "CONFIRMED",
                    toStatus: "TRAVEL_BOOKED",
                    updatedById: req.user!.id,
                    note: "Travel booked by Admin"
                }
            });
        }

        try {
            const { NotificationService } = await import("../services/notification.service");
            const { getNotificationTemplate } = await import("../services/notification-templates");
            const ns = new NotificationService();

            if (updated.pandit?.id) {
                const pInfo = getNotificationTemplate("TRAVEL_BOOKED_PANDIT", {
                    id: updated.id.substring(0, 8).toUpperCase(),
                    mode: updated.travelMode ?? "Transport",
                    details: updated.travelNotes ?? "N/A",
                    reference: updated.travelBookingRef ?? "See app"
                });
                await ns.notify({ userId: updated.pandit.id, type: "TRAVEL_BOOKED", title: pInfo.title, message: pInfo.message, smsMessage: pInfo.smsMessage });
            }

            if (updated.customer?.id) {
                const cInfo = getNotificationTemplate("TRAVEL_BOOKED", {
                    id: updated.id.substring(0, 8).toUpperCase(),
                    travelMode: updated.travelMode ?? "Transport",
                    details: updated.travelNotes ?? "N/A"
                });
                await ns.notify({ userId: updated.customer.id, type: "TRAVEL_BOOKED", title: cInfo.title, message: cInfo.message, smsMessage: cInfo.smsMessage });
            }
        } catch (e) {
            console.error("Failed to send travel booked notification", e);
        }

        sendSuccess(res, updated);
    } catch (err) {
        next(err);
    }
};

// ========================== PANDIT QUEUE ==========================

export const getPanditsAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const page = Math.max(1, Number(req.query.page) || 1);
        const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));
        const skip = (page - 1) * limit;

        const status = req.query.status as string;
        const search = req.query.search as string;

        const where: any = {};
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

        sendPaginated(res, pandits, total, page, limit, { totalPending, oldestPendingDays, avgWaitHours });
    } catch (err) {
        next(err);
    }
};

export const getPanditAdminDetail = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const panditId = req.params.panditId;
        const pandit = await prisma.panditProfile.findUnique({
            where: { id: panditId },
            include: {
                user: true,
                pujaServices: true,
                samagriPackages: true,
            }
        });

        if (!pandit) {
            return next(new AppError("Pandit not found", 404, "NOT_FOUND"));
        }

        sendSuccess(res, pandit);
    } catch (err) {
        next(err);
    }
};

const verifySchema = z.object({
    action: z.enum(["APPROVE", "REJECT", "REQUEST_INFO"]),
    reason: z.string().optional(),
    notes: z.string().optional(),
    requestedDocuments: z.array(z.string()).optional(),
});

export const updatePanditVerification = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { action, reason, notes, requestedDocuments } = verifySchema.parse(req.body);
        const panditId = req.params.panditId;

        const pandit = await prisma.panditProfile.findUnique({
            where: { id: panditId },
            include: { user: true }
        });

        if (!pandit) throw new AppError("Pandit not found", 404, "NOT_FOUND");

        let verificationStatus: any = pandit.verificationStatus;
        const updateData: any = {};

        if (notes !== undefined) {
            updateData.adminNotes = notes;
        }

        if (action === "APPROVE") {
            verificationStatus = "VERIFIED";
            updateData.profileCompletionPercent = 100;
            updateData.verifiedAt = new Date();
            updateData.verifiedById = req.user?.id || "admin";
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

        sendSuccess(res, updated);
    } catch (err) {
        next(err);
    }
};

// ========================== ALL BOOKINGS ==========================

export const getAllBookingsAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const page = Math.max(1, Number(req.query.page) || 1);
        const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));
        const skip = (page - 1) * limit;

        const { status, dateFrom, dateTo, city, pandit, customer, paymentStatus, travelStatus } = req.query;

        const where: any = {};
        if (status) where.status = { in: (status as string).split(",") };
        if (dateFrom && dateTo) {
            where.eventDate = {
                gte: new Date(dateFrom as string),
                lte: new Date(dateTo as string)
            };
        }
        if (city) where.venueCity = { contains: city as string, mode: "insensitive" };
        if (paymentStatus) where.paymentStatus = paymentStatus;
        if (travelStatus) where.travelStatus = travelStatus;

        if (pandit) {
            where.pandit = {
                OR: [
                    { name: { contains: pandit as string, mode: "insensitive" } },
                    { phone: { contains: pandit as string } }
                ]
            };
        }
        if (customer) {
            where.customer = {
                OR: [
                    { name: { contains: customer as string, mode: "insensitive" } },
                    { phone: { contains: customer as string } }
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
        } catch (e) { }

        sendPaginated(res, bookings, total, page, limit, { totalGmv: totalGmvNumber, thisMonthGmv: thisMonthGmvNumber });
    } catch (err) {
        next(err);
    }
};

export const getBookingAdminDetail = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const booking = await prisma.booking.findUnique({
            where: { id: req.params.bookingId },
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

        sendSuccess(res, booking);
    } catch (err) {
        next(err);
    }
};

export const updateBookingStatusAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { status, notes } = req.body;
        if (!status) throw new AppError("Status is required", 400);

        const booking = await prisma.booking.findUnique({ where: { id: req.params.id } });
        if (!booking) throw new AppError("Booking not found", 404);

        const updated = await prisma.booking.update({
            where: { id: req.params.id },
            data: {
                status,
                ...(notes && { adminNotes: (booking.adminNotes ? booking.adminNotes + "\n" : "") + `[${new Date().toISOString()}] ${notes}` })
            }
        });

        await prisma.bookingStatusUpdate.create({
            data: {
                bookingId: updated.id,
                fromStatus: booking.status,
                toStatus: status,
                updatedById: req.user!.id,
                note: notes || "Admin changed status manually"
            }
        });

        sendSuccess(res, updated);
    } catch (err) {
        next(err);
    }
};

export const reassignPanditAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { newPanditId, reason } = req.body;
        if (!newPanditId) throw new AppError("newPanditId is required", 400);

        const booking = await prisma.booking.findUnique({ where: { id: req.params.id } });
        if (!booking) throw new AppError("Booking not found", 404);

        const updated = await prisma.booking.update({
            where: { id: req.params.id },
            data: {
                panditId: newPanditId,
                status: "PANDIT_REQUESTED",
                adminNotes: (booking.adminNotes ? booking.adminNotes + "\n" : "") + `[${new Date().toISOString()}] Admin Reassigned to ${newPanditId}. Reason: ${reason}`
            }
        });

        await prisma.bookingStatusUpdate.create({
            data: {
                bookingId: updated.id,
                fromStatus: booking.status,
                toStatus: "PANDIT_REQUESTED",
                updatedById: req.user!.id,
                note: `Reassigned pandit. Reason: ${reason}`
            }
        });

        sendSuccess(res, updated, "Pandit reassigned successfully");
    } catch (err) {
        next(err);
    }
};

// ========================== SUPPORT TICKETS ==========================

export const getSupportTickets = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const page = Math.max(1, Number(req.query.page) || 1);
        const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));
        const skip = (page - 1) * limit;

        const { status, priority } = req.query;
        const where: any = {};
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

        sendPaginated(res, tickets, total, page, limit);
    } catch (err) {
        next(err);
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

export const createSupportTicket = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = createTicketSchema.parse(req.body);
        const ticket = await prisma.supportTicket.create({
            data: {
                ...data,
                createdBy: req.user!.id
            }
        });
        sendSuccess(res, ticket, "Ticket created", 201);
    } catch (err) {
        next(err);
    }
};

const updateTicketSchema = z.object({
    status: z.string().optional(),
    priority: z.string().optional(),
    resolution: z.string().optional(),
});

export const updateSupportTicket = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = updateTicketSchema.parse(req.body);
        const ticket = await prisma.supportTicket.update({
            where: { id: req.params.id },
            data
        });
        sendSuccess(res, ticket);
    } catch (err) {
        next(err);
    }
};
