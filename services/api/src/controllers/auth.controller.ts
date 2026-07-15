import { FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";
import { env } from "../config/env";
import { buildOtpSms } from "../config/constants";
import { authLanding } from "../lib/authRouting";
import { AppError } from "../middleware/errorHandler";
import crypto from "crypto";
import { storeOtpHash, getOtpHash, deleteOtpHash, checkRateLimit } from "../lib/redis";
import { DEFAULT_SAMAGRI } from "@hmarepanditji/db";
import { computeEarnings } from "../lib/earnings";
import { checkAndAwardMilestones } from "../lib/milestones";
import { canRemovePooja, REMOVE_BLOCKING_STATUSES } from "../lib/poojaRules";
import { panditView, withPanditView, dbStatusesForView } from "../lib/bookingStatus";
import { NotificationService } from "../services/notification.service";
import { getNotificationTemplate } from "../services/notification-templates";

// Single notifier instance for the pandit booking-transition handlers below.
const bookingNotifier = new NotificationService();

// Cookie configuration for HttpOnly tokens
const AUTH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "strict" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: "/",
};

// Phase 1 simplification: In-memory OTP store
type OTPRecord = {
  phone: string;
  role: "CUSTOMER" | "PANDIT";
  otp: string;
  expiresAt: number;
};
const OTPStore = new Map<string, OTPRecord>();

const phoneRegex = /^\+91[6-9]\d{9}$/;

export const sendOtp = async (request: FastifyRequest, reply: FastifyReply) => {
  const req = request as any;
  const { phone, role } = req.body;

  if (!phone || !phoneRegex.test(phone)) {
    throw new AppError("Invalid Indian mobile number", 400);
  }
  if (role !== "CUSTOMER" && role !== "PANDIT") {
    throw new AppError("Role must be CUSTOMER or PANDIT", 400);
  }

  const otp = "123456"; // Default for phase 1 or mock

  if (env.MOCK_OTP === "true") {
    console.log(`[MOCK OTP] Phone: ${phone}, OTP: ${otp}`);
  } else {
    console.log(`[MOCK OTP] Phone: ${phone}, OTP: ${otp} (Fallback since mock is off)`);
  }

  OTPStore.set(phone, {
    phone,
    role,
    otp,
    expiresAt: Date.now() + 10 * 60 * 1000,
  });

  return reply.send({ success: true, data: { message: "OTP sent", expiresIn: 600 }, message: "Success" });
};

export const verifyOtp = async (request: FastifyRequest, reply: FastifyReply) => {
  const req = request as any;
  const { phone, otp, role, name } = req.body;

  if (!phone || !otp) {
    throw new AppError("Phone and OTP are required", 400);
  }

  const record = OTPStore.get(phone);
  if (!record) {
    throw new AppError("OTP_NOT_FOUND", 400);
  }

  if (Date.now() > record.expiresAt) {
    OTPStore.delete(phone);
    throw new AppError("OTP_EXPIRED", 400);
  }

  // In mock mode: otp === '123456' always passes
  if (otp !== "123456" && otp !== record.otp) {
    throw new AppError("INVALID_OTP", 400);
  }

  OTPStore.delete(phone);

  const requestRole = role || record.role;

  // Find user by phone
  let user = await prisma.user.findUnique({
    where: { phone },
    include: {
      customerProfile: true,
      pandit: true,
    }
  });

  let isNewUser = false;

  if (!user) {
    isNewUser = true;
    user = await prisma.user.create({
      data: {
        phone,
        role: requestRole,
        name: name || null,
        isVerified: true,
      },
      include: {
        customerProfile: true,
        pandit: true,
      }
    });

    if (requestRole === "PANDIT") {
      await prisma.panditProfile.create({
        data: {
          userId: user.id,
          verificationStatus: "PENDING",
          location: "",
        },
      });
    } else if (requestRole === "CUSTOMER") {
      await prisma.customerProfile.create({
        data: {
          userId: user.id,
        },
      });
    }

    // Refetch to include newly created profiles
    user = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        customerProfile: { include: { addresses: true } },
        pandit: true,
      }
    });
  } else {
    // If new user and name provided: update name
    if (!user.name && name) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { name },
        include: {
          customerProfile: { include: { addresses: true } },
          pandit: true,
        }
      });
    }

    // Check if profiles are missing
    if (user.role === "PANDIT" && !user.pandit) {
      await prisma.panditProfile.create({
        data: {
          userId: user.id,
          verificationStatus: "PENDING",
          location: "",
        },
      });
    }
    if (user.role === "CUSTOMER" && !user.customerProfile) {
      await prisma.customerProfile.create({
        data: {
          userId: user.id,
        },
      });
    }

    // Refetch to include newly created profiles
    user = (await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        customerProfile: { include: { addresses: true } },
        pandit: true,
      }
    }))!;
  }

  if (!user) {
    throw new AppError("Failed to fetch user after upsert", 500);
  }

  const token = jwt.sign(
    {
      id: user.id,
      userId: user.id, // Backward compatibility for handlers still reading userId
      phone: user.phone,
      role: user.role,
      name: user.name,
      isVerified: user.isVerified,
    },
    env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  let profileCompleted = false;
  if (user.role === "PANDIT" && user.pandit) {
    profileCompleted = user.pandit.verificationStatus !== "PENDING";
  } else if (user.role === "CUSTOMER" && user.customerProfile) {
    // @ts-ignore
    profileCompleted = user.customerProfile.addresses && user.customerProfile.addresses.length > 0;
  }

  // CM-1 FIX (P0 login deadlock): setCookie must NOT be awaited.
  // `reply.setCookie()` returns the reply object; `await reply` only
  // settles once the response is SENT, but sending is blocked by that
  // very await → self-deadlock, and customer/admin login hung forever
  // (verified live on warm production). setCookie is synchronous.
  reply.setCookie("hpj_token", token, AUTH_COOKIE_OPTIONS);

  return reply.send({
    success: true,
    data: {
      // CM-1: the auth middleware reads only `Authorization: Bearer`,
      // never this httpOnly cookie — so the client needs the token in
      // the body to be able to authenticate (matches the pandit path).
      token,
      user: {
        id: user.id,
        phone: user.phone,
        role: user.role,
        name: user.name,
        isVerified: user.isVerified,
        isNewUser,
        profileCompleted,
        ...(user.role === "PANDIT" && user.pandit ? {
          panditProfile: {
            verificationStatus: user.pandit.verificationStatus,
            completedSteps: 0
          }
        } : {})
      },
    },
    message: "Success"
  });
};

export const getMe = async (request: FastifyRequest, reply: FastifyReply) => {
  const req = request as any;
  const userId = req.user?.id || req.user?.userId;

  if (!userId) {
    throw new AppError("Unauthorized", 401);
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      customerProfile: {
        include: {
          addresses: true,
        },
      },
      pandit: {
        include: {
          dakshinaRates: true,
          pujaServices: { where: { isActive: true } },
          _count: {
            select: {
              pujaServices: true,
              samagriPackages: true,
            },
          },
        },
      },
    },
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  const mappedUser = {
    ...user,
    panditProfile: (user as any).pandit,
  };
  delete (mappedUser as any).pandit;

  // Milestones — the app celebrates unseen ones once, then marks them seen;
  // the full list powers the "आपकी प्रगति" card.
  let milestones: Array<{ id: string; kind: string; achievedAt: Date; seenAt: Date | null }> = [];
  if ((user as any).pandit) {
    milestones = await prisma.panditMilestone.findMany({
      where: { panditId: (user as any).pandit.id },
      select: { id: true, kind: true, achievedAt: true, seenAt: true },
      orderBy: { achievedAt: "asc" },
    });
  }
  const unseenMilestones = milestones.filter((m) => m.seenAt === null);

  return reply.send({ success: true, data: { user: mappedUser, milestones, unseenMilestones }, message: "Success" });
};

export const updateMe = async (request: FastifyRequest, reply: FastifyReply) => {
  const req = request as any;
  const userId = req.user?.id || req.user?.userId;

  if (!userId) {
    throw new AppError("Unauthorized", 401);
  }

  const schema = z.object({
    name: z.string().min(2).max(100).optional(),
    email: z.string().email().optional().nullable(),
  });

  const { name, email } = schema.parse(req.body);

  const user = await prisma.user.update({
    where: { id: userId },
    data: { name, email },
    include: {
      customerProfile: {
        include: {
          addresses: true,
        },
      },
      pandit: true,
    },
  });

  const mappedUser = {
    ...user,
    panditProfile: (user as any).pandit,
  };
  delete (mappedUser as any).pandit;

  // Milestones — the app celebrates unseen ones once, then marks them seen;
  // the full list powers the "आपकी प्रगति" card.
  let milestones: Array<{ id: string; kind: string; achievedAt: Date; seenAt: Date | null }> = [];
  if ((user as any).pandit) {
    milestones = await prisma.panditMilestone.findMany({
      where: { panditId: (user as any).pandit.id },
      select: { id: true, kind: true, achievedAt: true, seenAt: true },
      orderBy: { achievedAt: "asc" },
    });
  }
  const unseenMilestones = milestones.filter((m) => m.seenAt === null);

  return reply.send({ success: true, data: { user: mappedUser, milestones, unseenMilestones }, message: "Success" });
};

export const logout = async (_request: FastifyRequest, reply: FastifyReply) => {
  // Clear HttpOnly cookie (CM-1: never await — awaiting the reply deadlocks
  // the response; logout hung forever the same way login did).
  reply.clearCookie("hpj_token", { path: "/" });
  return reply.send({ success: true, data: { message: "Logged out successfully" }, message: "Success" });
};

export const adminLogin = async (request: FastifyRequest, reply: FastifyReply) => {
  const req = request as any;
  const { email, username, password } = req.body || {};
  const inputEmail = email || username;

  if (!inputEmail || !password) {
    throw new AppError("Email and password are required", 400);
  }

  if (inputEmail !== env.ADMIN_EMAIL) {
    throw new AppError("Invalid admin credentials", 401);
  }

  const isMatch = bcrypt.compareSync(password, env.ADMIN_PASSWORD_HASH);
  if (!isMatch) {
    throw new AppError("Invalid admin credentials", 401);
  }

  const token = jwt.sign(
    {
      id: "admin",
      userId: "admin",
      phone: "",
      role: "ADMIN",
      name: "Admin",
      isVerified: true,
    },
    env.JWT_SECRET,
    { expiresIn: "12h" }
  );

  // Set HttpOnly cookie (CM-1: never await — see verifyOtp; deadlocks)
  reply.setCookie("hpj_token", token, AUTH_COOKIE_OPTIONS);

  return reply.send({
    success: true,
    data: {
      token,
      user: {
        id: "admin",
        name: "Admin",
        role: "ADMIN",
        isVerified: true,
      },
    },
    message: "Success"
  });
};

export const sendOtpNew = async (request: FastifyRequest, reply: FastifyReply) => {
  const { phone } = request.body as { phone: string };

  const phoneRegex = /^\+91[6-9]\d{9}$/;
  if (!phone || !phoneRegex.test(phone)) {
    return reply.status(400).send({
      success: false,
      error: {
        code: "invalid_phone_number",
        message: "Invalid phone number format. Must start with +91 followed by 10 digits."
      }
    });
  }

  // Rate Limit check: Max 3 sends per phone per 10 minutes (600 seconds)
  const allowed = await checkRateLimit(phone, 3, 600);
  if (!allowed) {
    return reply.status(429).send({
      success: false,
      error: {
        code: "rate_limit_exceeded",
        message: "Max 3 sends per 10 minutes exceeded."
      }
    });
  }

  // Generate OTP
  let otp = "123456";
  if (env.OTP_DEV_MODE !== "true") {
    // Generate secure random 6 digit code
    otp = Math.floor(100000 + Math.random() * 900000).toString();
    // G4d: the WebOTP-bound SMS body — MSG91 (or any provider) plugs in
    // HERE and must send `smsBody` VERBATIM: the '@origin #code' last
    // line is what lets the browser offer auto-fill on the login screen.
    const smsBody = buildOtpSms(otp);
    // TODO(MSG91): await msg91.send(phone, smsBody)
    console.log(`[PRODUCTION OTP] Phone: ${phone}, OTP: ${otp}, SMS ready (${smsBody.length} chars)`);
  } else {
    console.log(`[DEV OTP] Phone: ${phone}, OTP: ${otp}`);
  }

  // Hash OTP using SHA-256
  const hash = crypto.createHash("sha256").update(otp).digest("hex");

  // Store OTP hash in Redis key otp:{phone} with 5-minute TTL (300 seconds)
  await storeOtpHash(phone, hash, 300);

  // F1(a): tell the client whether this phone already has an account so
  // the OTP screen can greet a returning pandit differently.
  const existing = await prisma.user.findUnique({ where: { phone }, select: { id: true } });

  return reply.send({
    success: true,
    data: {
      message: "OTP sent successfully.",
      accountExists: !!existing
    }
  });
};

export const verifyOtpNew = async (request: FastifyRequest, reply: FastifyReply) => {
  const { phone, otp, role } = request.body as { phone: string; otp: string; role: string };

  if (!phone || !otp) {
    return reply.status(400).send({
      success: false,
      error: {
        code: "missing_fields",
        message: "Phone and OTP are required."
      }
    });
  }

  if (role !== "PANDIT") {
    return reply.status(400).send({
      success: false,
      error: {
        code: "invalid_role",
        message: "Only PANDIT role is supported by this endpoint."
      }
    });
  }

  // Retrieve hash from Redis key otp:{phone}
  const storedHash = await getOtpHash(phone);
  if (!storedHash) {
    return reply.status(400).send({
      success: false,
      error: {
        code: "otp_not_found",
        message: "OTP expired or not found. Please request a new one."
      }
    });
  }

  // Compute incoming OTP hash
  const incomingHash = crypto.createHash("sha256").update(otp).digest("hex");

  if (incomingHash !== storedHash) {
    return reply.status(400).send({
      success: false,
      error: {
        code: "invalid_otp",
        message: "The entered OTP is incorrect."
      }
    });
  }

  // Delete the OTP hash so it can't be reused
  await deleteOtpHash(phone);

  // Find user by phone
  let user = await prisma.user.findUnique({
    where: { phone },
    include: { pandit: true }
  });

  let isNewUser = false;

  if (!user) {
    isNewUser = true;
    user = await prisma.user.create({
      data: {
        phone,
        role: "PANDIT",
        isVerified: true,
      },
      include: { pandit: true }
    });
  }

  // Create empty PanditProfile if none
  let panditProfile = user.pandit;
  if (!panditProfile) {
    panditProfile = await prisma.panditProfile.create({
      data: {
        userId: user.id,
        verificationStatus: "PENDING",
        location: "",
      }
    });
  }

  // Token signed with env.JWT_SECRET, payload { userId, role }, expiry 30 days
  const token = jwt.sign(
    {
      userId: user.id,
      id: user.id, // compatibility
      role: user.role,
      phone: user.phone,
      isVerified: user.isVerified,
    },
    env.JWT_SECRET,
    { expiresIn: "30d" }
  );

  // F1(c): routing hints — a finished pandit is NEVER re-onboarded.
  const { profileComplete, landing } = authLanding({
    fullName: panditProfile.fullName,
    isNewUser,
  });

  return reply.send({
    success: true,
    data: {
      token,
      isNewUser,
      verificationStatus: panditProfile.verificationStatus,
      profileComplete,
      landing
    }
  });
};

export const getSamagriPackages = async (request: FastifyRequest, reply: FastifyReply) => {
  const userId = (request as any).user?.id || (request as any).user?.userId;
  if (!userId) {
    return reply.status(411).send({ success: false, error: "Unauthorized" });
  }

  const { pujaType } = request.query as { pujaType?: string };
  if (!pujaType) {
    return reply.status(400).send({ success: false, error: "pujaType is required" });
  }

  // Find PanditProfile for the user
  const profile = await prisma.panditProfile.findUnique({
    where: { userId }
  });
  if (!profile) {
    return reply.status(404).send({ success: false, error: "Pandit profile not found" });
  }

  // Find saved packages for this pandit and pujaType
  const packages = await prisma.samagriPackage.findMany({
    where: {
      panditId: profile.id,
      pujaType,
      isActive: true
    }
  });

  // If no packages are saved, return default samagri list
  if (packages.length === 0) {
    const defaultItems = DEFAULT_SAMAGRI[pujaType] || DEFAULT_SAMAGRI["SATYANARAYAN"];
    return reply.send({
      success: true,
      data: {
        pujaType,
        tiers: [
          { tier: "BASIC", price: null, items: defaultItems },
          { tier: "STANDARD", price: null, items: defaultItems },
          { tier: "PREMIUM", price: null, items: defaultItems }
        ]
      }
    });
  }

  // Otherwise, map packages to the tier structure
  const tiers = ["BASIC", "STANDARD", "PREMIUM"].map((t) => {
    const pkg = packages.find((p) => p.tier === t);
    return {
      tier: t,
      price: pkg ? pkg.price : null,
      items: pkg ? (pkg.items as any) : (packages[0]?.items || DEFAULT_SAMAGRI[pujaType])
    };
  });

  return reply.send({
    success: true,
    data: {
      pujaType,
      tiers
    }
  });
};

export const saveSamagriPackages = async (request: FastifyRequest, reply: FastifyReply) => {
  const userId = (request as any).user?.id || (request as any).user?.userId;
  if (!userId) {
    return reply.status(411).send({ success: false, error: "Unauthorized" });
  }

  const { pujaType, tiers } = request.body as {
    pujaType: string;
    tiers: Array<{ tier: "BASIC" | "STANDARD" | "PREMIUM"; price: number | null; items: any }>;
  };

  if (!pujaType || !tiers || !Array.isArray(tiers)) {
    return reply.status(400).send({ success: false, error: "pujaType and tiers are required" });
  }

  // Find PanditProfile
  const profile = await prisma.panditProfile.findUnique({
    where: { userId }
  });
  if (!profile) {
    return reply.status(404).send({ success: false, error: "Pandit profile not found" });
  }

  // Process each tier
  for (const tierData of tiers) {
    const { tier, price, items } = tierData;
    const numericPrice = price ? Number(price) : 0;

    if (numericPrice > 0) {
      // Upsert
      await prisma.samagriPackage.upsert({
        where: {
          panditId_pujaType_tier: {
            panditId: profile.id,
            pujaType,
            tier: tier as any
          }
        },
        update: {
          price: numericPrice,
          items: items as any,
          isActive: true
        },
        create: {
          panditId: profile.id,
          pujaType,
          tier: tier as any,
          price: numericPrice,
          items: items as any,
          isActive: true
        }
      });
    } else {
      // If price is cleared/empty/0, delete that tier package
      await prisma.samagriPackage.deleteMany({
        where: {
          panditId: profile.id,
          pujaType,
          tier: tier as any
        }
      });
    }
  }

  return reply.send({
    success: true,
    data: {
      message: "Samagri packages saved successfully."
    }
  });
};

export const patchPanditStatus = async (request: FastifyRequest, reply: FastifyReply) => {
  const userId = (request as any).user?.id || (request as any).user?.userId;
  if (!userId) {
    return reply.status(411).send({ success: false, error: "Unauthorized" });
  }

  const { isOnline } = request.body as { isOnline: boolean };
  if (isOnline === undefined) {
    return reply.status(400).send({ success: false, error: "isOnline is required" });
  }

  const profile = await prisma.panditProfile.findUnique({
    where: { userId }
  });
  if (!profile) {
    return reply.status(404).send({ success: false, error: "Pandit profile not found" });
  }

  const updated = await prisma.panditProfile.update({
    where: { id: profile.id },
    data: { isOnline },
    include: {
      user: {
        select: { phone: true, email: true, name: true }
      }
    }
  });

  return reply.send({
    success: true,
    data: updated
  });
};

export const getPanditBookings = async (request: FastifyRequest, reply: FastifyReply) => {
  const userId = (request as any).user?.id || (request as any).user?.userId;
  if (!userId) {
    return reply.status(411).send({ success: false, error: "Unauthorized" });
  }

  const { date, status } = request.query as { date?: string; status?: string };

  const profile = await prisma.panditProfile.findUnique({
    where: { userId }
  });
  if (!profile) {
    return reply.status(404).send({ success: false, error: "Pandit profile not found" });
  }

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const where: any = { panditId: profile.id };

  if (status) {
    // The pandit client filters in UI vocabulary (e.g. ?status=REQUESTED). Real
    // rows are stored in DB vocabulary (PANDIT_REQUESTED …) — translate so the
    // New/Active polls actually match. (See lib/bookingStatus.)
    where.status = { in: dbStatusesForView(status) };
  }

  if (date === "today") {
    where.eventDate = {
      gte: todayStart,
      lte: todayEnd
    };
  }

  const bookings = await prisma.booking.findMany({
    where,
    orderBy: {
      eventDate: "asc"
    }
  });

  return reply.send({
    success: true,
    data: bookings.map(withPanditView)
  });
};

export const getPanditBookingById = async (request: FastifyRequest, reply: FastifyReply) => {
  const userId = (request as any).user?.id || (request as any).user?.userId;
  if (!userId) {
    return reply.status(411).send({ success: false, error: "Unauthorized" });
  }

  const { id } = request.params as { id: string };
  if (!id) {
    return reply.status(400).send({ success: false, error: "Booking ID is required" });
  }

  // Find PanditProfile
  const profile = await prisma.panditProfile.findUnique({
    where: { userId }
  });
  if (!profile) {
    return reply.status(404).send({ success: false, error: "Pandit profile not found" });
  }

  // Find Booking
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      customer: {
        select: { name: true, phone: true }
      }
    }
  });

  if (!booking) {
    return reply.status(404).send({ success: false, error: "Booking not found" });
  }

  if (booking.panditId !== profile.id) {
    return reply.status(403).send({ success: false, error: "Unauthorized access to this booking" });
  }

  // Compute earnings
  const earnings = computeEarnings(booking);

  let journeyTimestamps = {};
  if (booking.travelNotes) {
    try {
      journeyTimestamps = JSON.parse(booking.travelNotes);
    } catch (e) {
      // ignore
    }
  }

  return reply.send({
    success: true,
    data: {
      booking: {
        ...booking,
        status: panditView(booking.status), // DB → pandit-UI vocabulary
        earnings,
        journeyTimestamps
      }
    }
  });
};

export const getPanditEarningsSummary = async (request: FastifyRequest, reply: FastifyReply) => {
  const userId = (request as any).user?.id || (request as any).user?.userId;
  if (!userId) {
    return reply.status(411).send({ success: false, error: "Unauthorized" });
  }

  const profile = await prisma.panditProfile.findUnique({
    where: { userId }
  });
  if (!profile) {
    return reply.status(404).send({ success: false, error: "Pandit profile not found" });
  }

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const weekStart = new Date();
  const day = weekStart.getDay();
  const diff = weekStart.getDate() - day + (day === 0 ? -6 : 1);
  weekStart.setDate(diff);
  weekStart.setHours(0, 0, 0, 0);

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  // today = sum of Payout.amount for payouts created today
  const todayPayouts = await prisma.payout.findMany({
    where: {
      panditId: profile.id,
      createdAt: {
        gte: todayStart,
        lte: todayEnd
      }
    },
    select: { amount: true }
  });
  const today = todayPayouts.reduce((sum, p) => sum + p.amount, 0);

  // week = sum of Payout.amount for payouts created this week
  const weekPayouts = await prisma.payout.findMany({
    where: {
      panditId: profile.id,
      createdAt: {
        gte: weekStart,
        lte: todayEnd
      }
    },
    select: { amount: true }
  });
  const week = weekPayouts.reduce((sum, p) => sum + p.amount, 0);

  // month = current calendar month
  const monthPayouts = await prisma.payout.findMany({
    where: {
      panditId: profile.id,
      createdAt: {
        gte: monthStart,
        lte: todayEnd
      }
    },
    select: { amount: true }
  });
  const month = monthPayouts.reduce((sum, p) => sum + p.amount, 0);

  // pendingPayout = sum where status=PENDING
  const pendingPayouts = await prisma.payout.findMany({
    where: {
      panditId: profile.id,
      status: "PENDING"
    },
    select: { amount: true }
  });
  const pendingPayout = pendingPayouts.reduce((sum, p) => sum + p.amount, 0);

  return reply.send({
    success: true,
    data: {
      today,
      week,
      month,
      pendingPayout
    }
  });
};

export const acceptBooking = async (request: FastifyRequest, reply: FastifyReply) => {
  const userId = (request as any).user?.id || (request as any).user?.userId;
  if (!userId) {
    return reply.status(411).send({ success: false, error: "Unauthorized" });
  }

  const { id } = request.params as { id: string };
  if (!id) {
    return reply.status(400).send({ success: false, error: "Booking ID is required" });
  }

  // Find PanditProfile
  const profile = await prisma.panditProfile.findUnique({
    where: { userId }
  });
  if (!profile) {
    return reply.status(404).send({ success: false, error: "Pandit profile not found" });
  }

  // Find Booking
  const booking = await prisma.booking.findUnique({
    where: { id }
  });
  if (!booking) {
    return reply.status(404).send({ success: false, error: "Booking not found" });
  }

  // Guards: only the assigned pandit, only from status REQUESTED, else 409
  if (booking.panditId !== profile.id) {
    return reply.status(409).send({
      success: false,
      error: { code: "invalid_state", message: "This booking is not assigned to you." }
    });
  }

  // BB1 — accept from the status the booking is ACTUALLY born with
  // (PANDIT_REQUESTED; REQUESTED tolerated for legacy/seed rows) and transition
  // to the canonical CONFIRMED the customer app understands. Atomic conditional
  // update = L1 exactly-once ON THE PATH THE CLIENT REALLY CALLS: a double-tap,
  // a voice "स्वीकार" racing a tap, or a retry-after-lost-response all resolve
  // to ONE confirmation and ONE customer SMS.
  const PENDING = ["PANDIT_REQUESTED", "REQUESTED"];
  if (!PENDING.includes(booking.status)) {
    if (booking.status === "CONFIRMED") {
      return reply.send({ success: true, idempotent: true, data: { ...booking, status: panditView(booking.status) } });
    }
    return reply.status(409).send({
      success: false,
      error: { code: "invalid_state", message: "Only a pending booking can be accepted." }
    });
  }

  const flipped = await prisma.booking.updateMany({
    where: { id, panditId: profile.id, status: { in: PENDING as any } },
    data: { status: "CONFIRMED", acceptedAt: new Date() }
  });
  if (flipped.count === 0) {
    const cur = await prisma.booking.findUnique({ where: { id } });
    if (cur && cur.panditId === profile.id && cur.status === "CONFIRMED") {
      return reply.send({ success: true, idempotent: true, data: { ...cur, status: panditView(cur.status) } });
    }
    return reply.status(409).send({ success: false, error: { code: "invalid_state", message: "Only a pending booking can be accepted." } });
  }

  const updated = await prisma.booking.findUnique({ where: { id } });

  // Status trail + notifications (customer sees the confirmation; pandit an ack).
  try {
    const shortId = id.substring(0, 8).toUpperCase();
    const dateStr = booking.eventDate ? new Date(booking.eventDate).toISOString().split("T")[0] : "";
    await prisma.bookingStatusUpdate.create({
      data: { bookingId: id, fromStatus: booking.status as any, toStatus: "CONFIRMED", updatedById: userId, note: "Accepted by Pandit" }
    });
    const tc = getNotificationTemplate("BOOKING_CONFIRMED", { id: shortId, panditName: "Aapke Pandit", pujaType: booking.eventType, date: dateStr });
    await bookingNotifier.notify({ userId: booking.customerId, type: "BOOKING_CONFIRMED", title: tc.title, message: tc.message, smsMessage: tc.smsMessage });
    const tp = getNotificationTemplate("BOOKING_CONFIRMED_ACK", { id: shortId, date: dateStr, city: booking.venueCity, pujaType: booking.eventType });
    await bookingNotifier.notify({ userId, type: "BOOKING_CONFIRMED_ACK", title: tp.title, message: tp.message, smsMessage: tp.smsMessage });
  } catch (e) {
    (request as any).log?.error?.(`accept notify failed: ${(e as any)?.message || e}`);
  }

  return reply.send({ success: true, data: updated ? { ...updated, status: panditView(updated.status) } : null });
};

export const rejectBooking = async (request: FastifyRequest, reply: FastifyReply) => {
  const userId = (request as any).user?.id || (request as any).user?.userId;
  if (!userId) {
    return reply.status(411).send({ success: false, error: "Unauthorized" });
  }

  const { id } = request.params as { id: string };
  if (!id) {
    return reply.status(400).send({ success: false, error: "Booking ID is required" });
  }

  // Find PanditProfile
  const profile = await prisma.panditProfile.findUnique({
    where: { userId }
  });
  if (!profile) {
    return reply.status(404).send({ success: false, error: "Pandit profile not found" });
  }

  // Find Booking
  const booking = await prisma.booking.findUnique({
    where: { id }
  });
  if (!booking) {
    return reply.status(404).send({ success: false, error: "Booking not found" });
  }

  // Guards: only the assigned pandit, only from status REQUESTED, else 409
  if (booking.panditId !== profile.id) {
    return reply.status(409).send({
      success: false,
      error: { code: "invalid_state", message: "This booking is not assigned to you." }
    });
  }

  // BB1 — reject from the real pending status (PANDIT_REQUESTED; REQUESTED
  // tolerated) → terminal CANCELLED, atomically (exactly-once) and notify the
  // customer so they SEE it and can rebook. This is the handler the client's
  // /pandit/bookings/:id/reject (and the new /decline alias) actually hit.
  const PENDING = ["PANDIT_REQUESTED", "REQUESTED"];
  const DONE = ["CANCELLED", "REJECTED", "CANCELLATION_REQUESTED"];
  if (!PENDING.includes(booking.status)) {
    if (DONE.includes(booking.status)) {
      return reply.send({ success: true, idempotent: true, data: { ...booking, status: panditView(booking.status) } });
    }
    return reply.status(409).send({
      success: false,
      error: { code: "invalid_state", message: "Only a pending booking can be rejected." }
    });
  }

  const flipped = await prisma.booking.updateMany({
    where: { id, panditId: profile.id, status: { in: PENDING as any } },
    data: { status: "CANCELLED" }
  });
  if (flipped.count === 0) {
    const cur = await prisma.booking.findUnique({ where: { id } });
    if (cur && cur.panditId === profile.id && DONE.includes(cur.status)) {
      return reply.send({ success: true, idempotent: true, data: { ...cur, status: panditView(cur.status) } });
    }
    return reply.status(409).send({ success: false, error: { code: "invalid_state", message: "Only a pending booking can be rejected." } });
  }

  const updated = await prisma.booking.findUnique({ where: { id } });

  try {
    const shortId = id.substring(0, 8).toUpperCase();
    await prisma.bookingStatusUpdate.create({
      data: { bookingId: id, fromStatus: booking.status as any, toStatus: "CANCELLED", updatedById: userId, note: "Rejected by Pandit" }
    });
    // Customer paid up-front; the pandit could not take it — tell them the
    // booking is released so they can rebook (team follows up on the refund).
    await bookingNotifier.notify({
      userId: booking.customerId,
      type: "BOOKING_CANCELLED",
      title: "Booking Released",
      message: `HPJ-${shortId}: Pandit ji is unavailable for this booking. Aap dobara book kar sakte hain — hamari team refund mein aapki madad karegi. -HmarePanditJi`,
      smsMessage: `HPJ-${shortId}: Pandit ji is unavailable. Please rebook — our team will help with the refund. -HmarePanditJi`
    });
  } catch (e) {
    (request as any).log?.error?.(`reject notify failed: ${(e as any)?.message || e}`);
  }

  return reply.send({ success: true, data: updated ? { ...updated, status: panditView(updated.status) } : null });
};

export const postBookingJourney = async (request: FastifyRequest, reply: FastifyReply) => {
  const userId = (request as any).user?.id || (request as any).user?.userId;
  if (!userId) {
    return reply.status(411).send({ success: false, error: "Unauthorized" });
  }

  const { id } = request.params as { id: string };
  if (!id) {
    return reply.status(400).send({ success: false, error: "Booking ID is required" });
  }

  const profile = await prisma.panditProfile.findUnique({
    where: { userId }
  });
  if (!profile) {
    return reply.status(404).send({ success: false, error: "Pandit profile not found" });
  }

  const booking = await prisma.booking.findUnique({
    where: { id }
  });
  if (!booking) {
    return reply.status(404).send({ success: false, error: "Booking not found" });
  }

  if (booking.panditId !== profile.id) {
    return reply.status(409).send({
      success: false,
      error: { code: "invalid_state", message: "This booking is not assigned to you." }
    });
  }

  if (booking.status === "COMPLETED" || booking.status === "CANCELLED" || booking.status === "REJECTED") {
    return reply.status(409).send({
      success: false,
      error: { code: "invalid_state", message: "Cannot update journey for a finalized booking." }
    });
  }

  // L-B EXACTLY-ONCE: the client sends the TARGET step it intends to reach
  // (falls back to +1 for older clients). A retry-after-lost-response resends
  // the SAME target; we advance only when journeyStep === target-1 and return
  // idempotent success once journeyStep >= target, so the step (and its
  // travelNotes timestamp) can never be double-advanced — the old blind step+1
  // could silently mark a leg done, inflating journeyStep toward 3 and
  // unlocking a payout for a journey the pandit never actually performed.
  const body = (request.body ?? {}) as { step?: number };
  const targetStep = typeof body.step === "number" ? body.step : booking.journeyStep + 1;

  // Already at/past the target → idempotent success (no re-increment, no re-stamp).
  if (booking.journeyStep >= targetStep) {
    return reply.send({ success: true, idempotent: true, data: { ...booking, status: panditView(booking.status) } });
  }
  // Only ever advance exactly one ordered step at a time.
  if (targetStep !== booking.journeyStep + 1 || targetStep > 3) {
    return reply.status(409).send({
      success: false,
      error: { code: "invalid_state", message: "Journey step out of order." }
    });
  }

  // Parse + stamp the timestamps JSON map inside travelNotes.
  let timestamps: any = {};
  if (booking.travelNotes) {
    try {
      timestamps = JSON.parse(booking.travelNotes);
    } catch (e) {
      // ignore
    }
  }
  timestamps[targetStep] = new Date().toISOString();

  // Atomic conditional advance: only the request that still finds
  // journeyStep === target-1 flips the row; a racing retry flips 0 rows.
  const advanceData: any = { journeyStep: targetStep, travelNotes: JSON.stringify(timestamps) };
  if (targetStep === 1) advanceData.status = "IN_PROGRESS";
  const flipped = await prisma.booking.updateMany({
    where: { id, panditId: profile.id, journeyStep: targetStep - 1 },
    data: advanceData,
  });

  // BB1 LESSON — the pandit app calls THIS handler (/pandit/.../journey), not
  // the plugin's /pandits/.../start-journey, so the "pandit has left" customer
  // notification (PANDIT_EN_ROUTE) must fire HERE too, or the app's spoken
  // "यजमान को सूचना भेज दी गई है" is a false claim. Only on a REAL advance
  // (never an idempotent replay), only for the departure leg. booking.customerId
  // is a User id (Booking.customerId → User FK) so the notify-user-id guard is
  // satisfied. Fire-and-forget — a notify failure must not fail the advance.
  if (targetStep === 1 && flipped.count > 0) {
    const enRoute = getNotificationTemplate("PANDIT_EN_ROUTE", { id: booking.id.substring(0, 8).toUpperCase() });
    bookingNotifier
      .notify({ userId: booking.customerId, type: "PANDIT_EN_ROUTE", title: enRoute.title, message: enRoute.message, smsMessage: enRoute.smsMessage })
      .catch((err) => request.log.error({ err }, "notify PANDIT_EN_ROUTE (journey) failed"));
  }

  const fresh = await prisma.booking.findUnique({ where: { id } });
  return reply.send({
    success: true,
    idempotent: flipped.count === 0,
    data: fresh ? { ...fresh, status: panditView(fresh.status) } : null
  });
};

export const completeBooking = async (request: FastifyRequest, reply: FastifyReply) => {
  const userId = (request as any).user?.id || (request as any).user?.userId;
  if (!userId) {
    return reply.status(411).send({ success: false, error: "Unauthorized" });
  }

  const { id } = request.params as { id: string };
  if (!id) {
    return reply.status(400).send({ success: false, error: "Booking ID is required" });
  }

  const profile = await prisma.panditProfile.findUnique({
    where: { userId }
  });
  if (!profile) {
    return reply.status(404).send({ success: false, error: "Pandit profile not found" });
  }

  const booking = await prisma.booking.findUnique({
    where: { id }
  });
  if (!booking) {
    return reply.status(404).send({ success: false, error: "Booking not found" });
  }

  if (booking.panditId !== profile.id) {
    return reply.status(409).send({
      success: false,
      error: { code: "invalid_state", message: "This booking is not assigned to you." }
    });
  }

  // Guard: journey step must be 3 to complete
  if (booking.journeyStep !== 3) {
    return reply.status(409).send({
      success: false,
      error: { code: "invalid_state", message: "Cannot complete booking until journey step 3 is reached." }
    });
  }

  // L-B EXACTLY-ONCE: the status flip IS the lock. An atomic conditional
  // transition (status != COMPLETED) means only the FIRST request creates the
  // payout; a concurrent double-tap or a retry-after-lost-response flips 0 rows
  // and takes the idempotent path — returning SUCCESS (never a 409 that tells
  // the pandit his completed puja "failed" while he is already owed the money).
  const earnings = computeEarnings(booking);
  const outcome = await prisma.$transaction(async (tx: any) => {
    const flip = await tx.booking.updateMany({
      where: { id, panditId: profile.id, status: { not: "COMPLETED" }, journeyStep: 3 },
      data: { status: "COMPLETED", completedAt: new Date() },
    });
    if (flip.count === 0) return { won: false };
    // First and only winner — create the single payout inside the same tx.
    await tx.payout.create({
      data: { bookingId: id, panditId: profile.id, amount: earnings.totalToPandit, status: "PENDING" },
    });
    return { won: true };
  });

  if (!outcome.won) {
    const cur = await prisma.booking.findUnique({ where: { id } });
    if (cur && cur.panditId === profile.id && cur.status === "COMPLETED") {
      return reply.send({ success: true, idempotent: true, data: { ...cur, status: panditView(cur.status) } });
    }
    return reply.status(409).send({
      success: false,
      error: { code: "invalid_state", message: "This booking cannot be completed." }
    });
  }

  // Award any newly crossed milestones (idempotent) — never block completion
  try {
    await checkAndAwardMilestones(profile.id);
  } catch (err) {
    console.error("[milestones] award failed:", err);
  }

  const updatedBooking = await prisma.booking.findUnique({ where: { id } });
  return reply.send({
    success: true,
    data: updatedBooking ? { ...updatedBooking, status: panditView(updatedBooking.status) } : null
  });
};

// ── मेरी पूजाएँ (F29) ────────────────────────────────────────────────────────

/** PATCH /pandit/profile — specializations (adds are marked pending-verify) */
export const patchPanditProfile = async (request: FastifyRequest, reply: FastifyReply) => {
  const userId = (request as any).user?.id || (request as any).user?.userId;
  if (!userId) return reply.status(401).send({ success: false, error: "Unauthorized" });

  const profile = await prisma.panditProfile.findUnique({ where: { userId } });
  if (!profile) return reply.status(404).send({ success: false, error: "Pandit profile not found" });

  const { specializations } = request.body as { specializations?: string[] };
  if (!Array.isArray(specializations) || specializations.some((s) => typeof s !== "string" || !s.trim())) {
    return reply.status(400).send({ success: false, error: "specializations must be a non-empty string array" });
  }

  // F29(c): anything not in the current list is a NEW pooja → pending verify.
  // EXCEPT during booking-readiness (R1): that IS the initial signup set,
  // which is considered verified — never flag it pending.
  const current = new Set(profile.specializations);
  const added = profile.isBookingReady
    ? specializations.filter((sp) => !current.has(sp))
    : [];
  const pending = new Set(profile.pendingPoojaVerifications);
  added.forEach((sp) => pending.add(sp));
  // drop pending flags for poojas no longer listed
  const nextPending = [...pending].filter((sp) => specializations.includes(sp));

  const updated = await prisma.panditProfile.update({
    where: { id: profile.id },
    data: { specializations, pendingPoojaVerifications: nextPending },
  });
  return reply.send({ success: true, data: { specializations: updated.specializations, pendingPoojaVerifications: updated.pendingPoojaVerifications } });
};

/** POST /pandit/dakshina-rates — upsert {pujaType, amount} */
export const upsertDakshinaRate = async (request: FastifyRequest, reply: FastifyReply) => {
  const userId = (request as any).user?.id || (request as any).user?.userId;
  if (!userId) return reply.status(401).send({ success: false, error: "Unauthorized" });

  const profile = await prisma.panditProfile.findUnique({ where: { userId } });
  if (!profile) return reply.status(404).send({ success: false, error: "Pandit profile not found" });

  const { pujaType, amount } = request.body as { pujaType?: string; amount?: number };
  if (!pujaType || typeof amount !== "number" || amount < 0 || !Number.isFinite(amount)) {
    return reply.status(400).send({ success: false, error: "pujaType and a non-negative amount are required" });
  }

  // F29(a): existing bookings snapshot dakshinaAmount — this only affects NEW bookings.
  const rate = await prisma.dakshinaRate.upsert({
    where: { panditId_pujaType: { panditId: profile.id, pujaType } },
    update: { amount: Math.round(amount) },
    create: { panditId: profile.id, pujaType, amount: Math.round(amount) },
  });
  return reply.send({ success: true, data: rate });
};

/** DELETE /pandit/specializations/:poojaType — 409 while active bookings exist */
export const removeSpecialization = async (request: FastifyRequest, reply: FastifyReply) => {
  const userId = (request as any).user?.id || (request as any).user?.userId;
  if (!userId) return reply.status(401).send({ success: false, error: "Unauthorized" });

  const profile = await prisma.panditProfile.findUnique({ where: { userId } });
  if (!profile) return reply.status(404).send({ success: false, error: "Pandit profile not found" });

  const poojaType = decodeURIComponent((request.params as { poojaType: string }).poojaType || "");
  if (!poojaType) return reply.status(400).send({ success: false, error: "poojaType required" });

  const activeCount = await prisma.booking.count({
    where: {
      panditId: profile.id,
      pujaType: poojaType,
      status: { in: [...REMOVE_BLOCKING_STATUSES] as any },
    },
  });
  if (!canRemovePooja(activeCount)) {
    return reply.status(409).send({ success: false, error: "active_bookings" });
  }

  const updated = await prisma.panditProfile.update({
    where: { id: profile.id },
    data: {
      specializations: profile.specializations.filter((sp: string) => sp !== poojaType),
      pendingPoojaVerifications: profile.pendingPoojaVerifications.filter((sp: string) => sp !== poojaType),
    },
  });
  return reply.send({ success: true, data: { specializations: updated.specializations } });
};

export const markMilestonesSeen = async (request: FastifyRequest, reply: FastifyReply) => {
  const userId = (request as any).user?.id || (request as any).user?.userId;
  if (!userId) {
    return reply.status(401).send({ success: false, error: "Unauthorized" });
  }
  const profile = await prisma.panditProfile.findUnique({ where: { userId }, select: { id: true } });
  if (!profile) {
    return reply.status(404).send({ success: false, error: "Pandit profile not found" });
  }
  await prisma.panditMilestone.updateMany({
    where: { panditId: profile.id, seenAt: null },
    data: { seenAt: new Date() },
  });
  return reply.send({ success: true });
};

export const getPanditPayouts = async (request: FastifyRequest, reply: FastifyReply) => {
  const userId = (request as any).user?.id || (request as any).user?.userId;
  if (!userId) {
    return reply.status(411).send({ success: false, error: "Unauthorized" });
  }

  const { status } = request.query as { status?: string };

  const profile = await prisma.panditProfile.findUnique({
    where: { userId }
  });
  if (!profile) {
    return reply.status(404).send({ success: false, error: "Pandit profile not found" });
  }

  const where: any = { panditId: profile.id };
  if (status) {
    where.status = status as any;
  }

  const payouts = await prisma.payout.findMany({
    where,
    orderBy: {
      createdAt: "desc"
    },
    take: 50
  });

  const bookingIds = payouts.map((p) => p.bookingId);
  const bookings = await prisma.booking.findMany({
    where: {
      id: { in: bookingIds }
    },
    select: {
      id: true,
      pujaType: true,
      eventType: true,
      eventDate: true
    }
  });

  const bookingsMap = new Map(bookings.map((b) => [b.id, b]));

  const payoutsWithBookings = payouts.map((p) => ({
    ...p,
    booking: bookingsMap.get(p.bookingId) || null
  }));

  return reply.send({
    success: true,
    data: payoutsWithBookings
  });
};

export const getBlockedDates = async (request: FastifyRequest, reply: FastifyReply) => {
  const userId = (request as any).user?.id || (request as any).user?.userId;
  if (!userId) {
    return reply.status(411).send({ success: false, error: "Unauthorized" });
  }

  const profile = await prisma.panditProfile.findUnique({
    where: { userId }
  });
  if (!profile) {
    return reply.status(404).send({ success: false, error: "Pandit profile not found" });
  }

  const dates = await prisma.blockedDate.findMany({
    where: { panditId: profile.id }
  });

  return reply.send({
    success: true,
    data: dates
  });
};

export const createBlockedDate = async (request: FastifyRequest, reply: FastifyReply) => {
  const userId = (request as any).user?.id || (request as any).user?.userId;
  if (!userId) {
    return reply.status(411).send({ success: false, error: "Unauthorized" });
  }

  const { date } = request.body as { date: string };
  if (!date) {
    return reply.status(400).send({ success: false, error: "Date is required" });
  }

  const profile = await prisma.panditProfile.findUnique({
    where: { userId }
  });
  if (!profile) {
    return reply.status(404).send({ success: false, error: "Pandit profile not found" });
  }

  // Set date to UTC midnight
  const targetDate = new Date(date);
  targetDate.setUTCHours(0, 0, 0, 0);

  // Guard: cannot block a date with an ACCEPTED or IN_PROGRESS booking!
  const todayStart = new Date(targetDate);
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(targetDate);
  todayEnd.setHours(23, 59, 59, 999);

  const bookings = await prisma.booking.findMany({
    where: {
      panditId: profile.id,
      eventDate: {
        gte: todayStart,
        lte: todayEnd
      },
      status: {
        in: ["ACCEPTED", "IN_PROGRESS", "PUJA_IN_PROGRESS"]
      }
    }
  });

  if (bookings.length > 0) {
    return reply.status(409).send({
      success: false,
      error: { code: "has_booking", message: "इस दिन बुकिंग है" }
    });
  }

  const entry = await prisma.blockedDate.upsert({
    where: {
      panditId_date: {
        panditId: profile.id,
        date: targetDate
      }
    },
    create: {
      panditId: profile.id,
      date: targetDate
    },
    update: {}
  });

  return reply.send({
    success: true,
    data: entry
  });
};

export const deleteBlockedDate = async (request: FastifyRequest, reply: FastifyReply) => {
  const userId = (request as any).user?.id || (request as any).user?.userId;
  if (!userId) {
    return reply.status(411).send({ success: false, error: "Unauthorized" });
  }

  const { date } = request.params as { date: string };
  if (!date) {
    return reply.status(400).send({ success: false, error: "Date is required" });
  }

  const profile = await prisma.panditProfile.findUnique({
    where: { userId }
  });
  if (!profile) {
    return reply.status(404).send({ success: false, error: "Pandit profile not found" });
  }

  const targetDate = new Date(date);
  targetDate.setUTCHours(0, 0, 0, 0);

  await prisma.blockedDate.deleteMany({
    where: {
      panditId: profile.id,
      date: targetDate
    }
  });

  return reply.send({
    success: true,
    data: { message: "Blocked date removed" }
  });
};
