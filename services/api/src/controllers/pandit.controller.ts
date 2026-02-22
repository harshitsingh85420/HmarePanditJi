import { Request, Response, NextFunction } from "express";
import { prisma } from "@hmarepanditji/db";
import { parsePagination } from "../utils/helpers";

export async function getPandits(req: Request, res: Response, next: NextFunction) {
    try {
        const { page, limit, skip } = parsePagination(req.query as Record<string, unknown>);

        const pujaType = req.query.pujaType as string;
        const city = req.query.city as string;
        const date = req.query.date as string;
        const minRating = req.query.minRating ? Number(req.query.minRating) : undefined;
        const minDakshina = req.query.minDakshina ? Number(req.query.minDakshina) : undefined;
        const maxDakshina = req.query.maxDakshina ? Number(req.query.maxDakshina) : undefined;
        const language = req.query.language as string;
        const travelMode = req.query.travelMode as string;
        const maxDistance = req.query.maxDistance ? Number(req.query.maxDistance) : undefined;
        const sort = req.query.sort as string;
        const verificationStatus = req.query.verificationStatus ? String(req.query.verificationStatus) : "VERIFIED";

        const conditions: any[] = [];

        // Default verification filter
        conditions.push({ verificationStatus });

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
            const serviceFilter: any = { isActive: true };
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

            // The bookings are linked to user.id, not panditProfile.id. 
            // We ensure the associated user doesn't have a booking.
            conditions.push({
                user: {
                    bookingsAsPandit: {
                        none: {
                            eventDate: { gte: startOfDay, lte: endOfDay },
                            status: { in: ["CONFIRMED", "TRAVEL_BOOKED", "PANDIT_EN_ROUTE", "PANDIT_ARRIVED", "PUJA_IN_PROGRESS"] }
                        }
                    }
                }
            });
        }

        const where = { AND: conditions };

        const orderByMap: Record<string, any> = {
            rating: { rating: "desc" },
        };
        const orderBy = orderByMap[sort] ?? { rating: "desc" };

        const rawPandits = await prisma.panditProfile.findMany({
            where,
            select: {
                id: true,
                user: { select: { id: true, name: true, phone: true } },
                location: true,
                rating: true,
                totalReviews: true,
                experienceYears: true,
                specializations: true,
                languages: true,
                profilePhotoUrl: true,
                isOnline: true,
                verificationStatus: true,
                travelPreferences: true,
                completedBookings: true,
                pujaServices: {
                    where: { isActive: true },
                    select: { pujaType: true, dakshinaAmount: true, durationHours: true },
                },
            },
            orderBy,
        });

        // In-memory filters for travel Preferences JSON and price sorting etc.
        let filtered = rawPandits.map((p: any) => ({
            ...p,
            id: p.user.id, // we map id to User ID so frontend uses this for booking
            name: p.user?.name || "Pandit",
            profilePhotoUrl: p.profilePhotoUrl,
            rating: p.rating,
            totalReviews: p.totalReviews,
            completedBookings: p.completedBookings,
            experienceYears: p.experienceYears,
            location: p.location,
            specializations: p.specializations,
            languages: p.languages,
            verificationStatus: p.verificationStatus,
            travelPreferences: p.travelPreferences,
            isOnline: p.isOnline,
            pujaServices: p.pujaServices,
        }));

        if (travelMode) {
            filtered = filtered.filter((p: any) => {
                const prefs = p.travelPreferences as any;
                if (!prefs || !prefs.preferredModes) return false;
                return prefs.preferredModes.includes(travelMode);
            });
        }

        if (sort === "price_asc") {
            filtered.sort((a, b) => {
                const aPrice = Math.min(...a.pujaServices.map((s: any) => s.dakshinaAmount));
                const bPrice = Math.min(...b.pujaServices.map((s: any) => s.dakshinaAmount));
                return aPrice - bPrice;
            });
        } else if (sort === "price_desc") {
            filtered.sort((a, b) => {
                const aPrice = Math.max(...a.pujaServices.map((s: any) => s.dakshinaAmount));
                const bPrice = Math.max(...b.pujaServices.map((s: any) => s.dakshinaAmount));
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
                const distA = distanceMap.get(a.location) ?? 9999;
                const distB = distanceMap.get(b.location) ?? 9999;
                return distA - distB;
            });
        }

        const total = filtered.length;
        const paginatedPandits = filtered.slice(skip, skip + limit);

        return res.status(200).json({
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
        next(err);
    }
}

export async function getPanditProfileById(req: Request, res: Response, next: NextFunction) {
    try {
        const panditId = req.params.id;
        const pandit = await prisma.panditProfile.findUnique({
            where: { userId: panditId, verificationStatus: "VERIFIED" },
            include: {
                user: { select: { id: true, name: true, phone: true } },
                pujaServices: { where: { isActive: true } },
                samagriPackages: { where: { isActive: true } },
            }
        });

        if (!pandit) {
            return res.status(404).json({ success: false, message: "Pandit not found or not verified" });
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
            avgRating: aggregations._avg.overallRating ?? pandit.rating ?? 0,
            totalReviews: aggregations._count > 0 ? aggregations._count : pandit.totalReviews,
            distribution,
            subRatings: {
                Knowledge: aggregations._avg.knowledgeRating ?? 0,
                Punctuality: aggregations._avg.punctualityRating ?? 0,
                Communication: aggregations._avg.communicationRating ?? 0,
            }
        };

        const responseData = {
            ...pandit,
            id: pandit.user.id,
            user: {
                id: pandit.user.id,
                name: pandit.user.name ?? "Pandit Ji",
            },
            reviewSummary,
        };

        return res.status(200).json({ success: true, data: responseData });
    } catch (err) {
        next(err);
    }
}

export async function getPanditReviewsHandler(req: Request, res: Response, next: NextFunction) {
    try {
        const panditId = req.params.id;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 5;
        const skip = (page - 1) * limit;

        const reviews = await prisma.review.findMany({
            where: { revieweeId: panditId },
            skip,
            take: limit,
            orderBy: { createdAt: "desc" },
            include: {
                reviewer: { select: { name: true } },
                booking: { select: { eventType: true } }
            }
        });

        const formatted = reviews.map(r => ({
            id: r.id,
            overallRating: r.overallRating,
            comment: r.comment,
            createdAt: r.createdAt,
            reviewerName: r.isAnonymous ? "Anonymous" : r.reviewer?.name ?? "Customer",
            pujaType: r.booking?.eventType ?? "Puja Service"
        }));

        return res.status(200).json({ success: true, data: formatted });
    } catch (err) {
        next(err);
    }
}

export async function getPanditAvailabilityHandler(req: Request, res: Response, next: NextFunction) {
    try {
        const panditId = req.params.id;
        const month = parseInt(req.query.month as string);
        const year = parseInt(req.query.year as string);

        if (!month || !year) {
            return res.status(400).json({ success: false, message: "month and year are required" });
        }

        const startOfMonth = new Date(year, month - 1, 1);
        const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

        const bookings = await prisma.booking.findMany({
            where: {
                panditId,
                eventDate: { gte: startOfMonth, lte: endOfMonth },
                status: { in: ["CONFIRMED", "TRAVEL_BOOKED", "PANDIT_EN_ROUTE", "PANDIT_ARRIVED", "PUJA_IN_PROGRESS"] }
            },
            select: { eventDate: true }
        });

        const blockedDates = await prisma.panditBlockedDate.findMany({
            where: {
                panditProfile: { userId: panditId },
                date: { gte: startOfMonth, lte: endOfMonth }
            },
            select: { date: true, reason: true }
        });

        const daysInMonth = new Date(year, month, 0).getDate();
        const datesStatus = [];

        const bookedDays = new Set(bookings.map(b => b.eventDate.getDate()));
        const blockedDaysMap = new Map(blockedDates.map(b => [b.date.getDate(), b.reason]));

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

        return res.status(200).json({ success: true, data: datesStatus });
    } catch (err) {
        next(err);
    }
}
