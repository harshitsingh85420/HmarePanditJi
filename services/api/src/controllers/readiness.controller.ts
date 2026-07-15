import { FastifyRequest, FastifyReply } from "fastify";
import { prisma } from "@hmarepanditji/db";

// ─────────────────────────────────────────────────────────────
// BOOKING-READINESS (progressive onboarding).
// Registration creates an ACCOUNT only; booking capabilities are
// earned via this resumable wizard. readinessStep is the server-side
// resume pointer (0 = not started, 5 = finished). Finishing R5 sets
// isBookingReady=true; verificationStatus stays PENDING for admin.
//   R1 pujas + dakshina   → existing /pandit/profile + /pandit/dakshina-rates
//   R2 samagri dual model → canBringSamagri + existing samagri-packages
//   R3 travel             → travelPrefs Json
//   R4 food & stay        → foodPrefs Json
//   R5 payment + aadhaar  → bank/UPI + aadhaarDocUrl (moved from the old
//                           7-step wizard, unchanged)
// ─────────────────────────────────────────────────────────────

const TRAIN_CLASSES = ["SLEEPER", "3AC", "2AC"];
const BUS_TYPES = ["AC", "NON_AC"];
const EXCLUSIONS = ["NO_FLIGHT", "NO_NIGHT", "NONE"];
const DIETARY = ["ANY", "PURE_VEG", "JAIN", "VEGAN"];
const HOTEL_TIERS = ["BUDGET", "THREE_STAR", "FOUR_STAR_PLUS"];
const KM_STEPS = [25, 50, 100, 200, 500];

function badRequest(reply: FastifyReply, message: string) {
  return reply.status(400).send({
    success: false,
    error: { code: "validation_error", message },
  });
}

async function loadProfile(request: FastifyRequest, reply: FastifyReply) {
  const userId = (request as any).user?.id || (request as any).user?.userId;
  if (!userId) {
    reply.status(401).send({ success: false, error: { code: "unauthorized", message: "Unauthorized" } });
    return null;
  }
  const profile = await prisma.panditProfile.findUnique({ where: { userId } });
  if (!profile) {
    reply.status(404).send({ success: false, error: { code: "not_found", message: "Pandit profile not found" } });
    return null;
  }
  return profile;
}

async function readinessSnapshot(profileId: string) {
  const profile = await prisma.panditProfile.findUnique({
    where: { id: profileId },
    select: {
      readinessStep: true,
      isBookingReady: true,
      canBringSamagri: true,
      travelPrefs: true,
      foodPrefs: true,
      accommodationPrefs: true,
      specializations: true,
      aadhaarDocUrl: true,
      bankAccountName: true,
      bankIfscCode: true,
      upiId: true,
      verificationStatus: true,
      dakshinaRates: { select: { pujaType: true, amount: true } },
      samagriPackages: {
        where: { isActive: true },
        select: { pujaType: true, tier: true, price: true },
      },
    },
  });
  if (!profile) return null;
  const { bankAccountName, bankIfscCode, upiId, aadhaarDocUrl, samagriPackages, ...rest } = profile;
  const samagriTiersByPuja: Record<string, number> = {};
  for (const pkg of samagriPackages) {
    samagriTiersByPuja[pkg.pujaType] = (samagriTiersByPuja[pkg.pujaType] || 0) + (pkg.price > 0 ? 1 : 0);
  }
  return {
    ...rest,
    // own-profile edit screens may prefill SAVED server values (X3);
    // bank/UPI numbers are deliberately NOT echoed back (typed-only law)
    aadhaarUrl: aadhaarDocUrl || "",
    hasAadhaar: !!aadhaarDocUrl,
    hasPayment: !!(bankAccountName && bankIfscCode) || !!upiId,
    samagriTiersByPuja,
  };
}

/** GET /pandit/readiness — resume state for the wizard */
export const getReadiness = async (request: FastifyRequest, reply: FastifyReply) => {
  const profile = await loadProfile(request, reply);
  if (!profile) return;
  const snapshot = await readinessSnapshot(profile.id);
  return reply.send({ success: true, data: snapshot });
};

/** PATCH /pandit/readiness — save one step { step: 1..5, data: {...} } */
export const patchReadiness = async (request: FastifyRequest, reply: FastifyReply) => {
  const profile = await loadProfile(request, reply);
  if (!profile) return;

  const body = (request.body || {}) as { step?: number; data?: any };
  const step = Number(body.step);
  const data = body.data || {};
  if (!Number.isInteger(step) || step < 1 || step > 5) {
    return badRequest(reply, "step must be an integer between 1 and 5.");
  }

  const update: Record<string, unknown> = {};

  if (step === 1) {
    // R1 saves through the existing specialization/dakshina endpoints;
    // here we only verify the result before advancing the pointer.
    const fresh = await prisma.panditProfile.findUnique({
      where: { id: profile.id },
      select: { specializations: true, dakshinaRates: { select: { pujaType: true, amount: true } } },
    });
    if (!fresh || fresh.specializations.length === 0) {
      return badRequest(reply, "At least one specialization is required.");
    }
    const rateByPuja = new Map(fresh.dakshinaRates.map((r) => [r.pujaType, r.amount]));
    for (const spec of fresh.specializations) {
      const amount = rateByPuja.get(spec);
      if (!amount || amount < 501 || amount > 500000) {
        return badRequest(reply, `Dakshina rate for ${spec} must be between 501 and 500,000.`);
      }
    }
  }

  if (step === 2) {
    if (typeof data.canBringSamagri !== "boolean") {
      return badRequest(reply, "canBringSamagri must be true or false.");
    }
    if (data.canBringSamagri) {
      // Builder already saved through /pandit/samagri-packages — every
      // selected puja needs at least one priced tier.
      const [fresh, packages] = await Promise.all([
        prisma.panditProfile.findUnique({ where: { id: profile.id }, select: { specializations: true } }),
        prisma.samagriPackage.findMany({
          where: { panditId: profile.id, isActive: true, price: { gt: 0 } },
          select: { pujaType: true },
        }),
      ]);
      const covered = new Set(packages.map((p) => p.pujaType));
      const missing = (fresh?.specializations || []).filter((spec) => !covered.has(spec));
      if (missing.length > 0) {
        return badRequest(reply, `Each selected puja needs at least one priced samagri tier. Missing: ${missing.join(", ")}`);
      }
    }
    update.canBringSamagri = data.canBringSamagri;
  }

  if (step === 3) {
    const tp = data.travelPrefs;
    if (!tp || typeof tp !== "object") {
      return badRequest(reply, "travelPrefs object is required.");
    }
    const ownVehicle = tp.ownVehicle || {};
    if (typeof ownVehicle.enabled !== "boolean") return badRequest(reply, "ownVehicle.enabled must be boolean.");
    if (ownVehicle.enabled && !KM_STEPS.includes(Number(ownVehicle.maxKm))) {
      return badRequest(reply, `ownVehicle.maxKm must be one of ${KM_STEPS.join(", ")}.`);
    }
    const train = tp.train || {};
    if (typeof train.enabled !== "boolean") return badRequest(reply, "train.enabled must be boolean.");
    const classes: string[] = Array.isArray(train.classes) ? train.classes : [];
    if (train.enabled && (classes.length === 0 || classes.some((c) => !TRAIN_CLASSES.includes(c)))) {
      return badRequest(reply, `train.classes must be a non-empty subset of ${TRAIN_CLASSES.join(", ")}.`);
    }
    const bus = tp.bus || {};
    if (typeof bus.enabled !== "boolean") return badRequest(reply, "bus.enabled must be boolean.");
    if (bus.enabled && !BUS_TYPES.includes(bus.ac)) {
      return badRequest(reply, `bus.ac must be one of ${BUS_TYPES.join(", ")}.`);
    }
    const flight = tp.flight || {};
    if (typeof flight.enabled !== "boolean") return badRequest(reply, "flight.enabled must be boolean.");
    const exclusions: string[] = Array.isArray(tp.exclusions) ? tp.exclusions : [];
    if (exclusions.some((e) => !EXCLUSIONS.includes(e))) {
      return badRequest(reply, `exclusions entries must be one of ${EXCLUSIONS.join(", ")}.`);
    }
    if (tp.localCabOk !== null && typeof tp.localCabOk !== "boolean") {
      return badRequest(reply, "localCabOk must be boolean or null.");
    }
    update.travelPrefs = {
      ownVehicle: { enabled: ownVehicle.enabled, maxKm: ownVehicle.enabled ? Number(ownVehicle.maxKm) : null },
      train: { enabled: train.enabled, classes: train.enabled ? classes : [] },
      bus: { enabled: bus.enabled, ac: bus.enabled ? bus.ac : null },
      flight: { enabled: flight.enabled },
      exclusions,
      localCabOk: tp.localCabOk ?? null,
    };
  }

  if (step === 4) {
    const fp = data.foodPrefs;
    if (!fp || typeof fp !== "object") {
      return badRequest(reply, "foodPrefs object is required.");
    }
    if (fp.dietary !== null && !DIETARY.includes(fp.dietary)) {
      return badRequest(reply, `dietary must be one of ${DIETARY.join(", ")} or null.`);
    }
    if (fp.hotelFoodOk !== null && typeof fp.hotelFoodOk !== "boolean") {
      return badRequest(reply, "hotelFoodOk must be boolean or null.");
    }
    if (typeof fp.allergies !== "string") {
      return badRequest(reply, "allergies must be a string (may be empty).");
    }
    if (fp.dailyAllowance !== null) {
      const allowance = Number(fp.dailyAllowance);
      if (!Number.isFinite(allowance) || allowance < 1 || allowance > 100000) {
        return badRequest(reply, "dailyAllowance must be between 1 and 100,000, or null.");
      }
    }
    // ठहराव (stay) has its OWN column — accommodationPrefs — and must NEVER be
    // written into foodPrefs (BB1: the right column). Accept a dedicated
    // accommodationPrefs object; fall back to the legacy foodPrefs.stay* fields
    // so an older client still lands its stay data in the correct column.
    const ap = (data.accommodationPrefs && typeof data.accommodationPrefs === "object") ? data.accommodationPrefs : {};
    const customerHomeOk = ap.customerHomeOk ?? fp.stayAtCustomerHome ?? null;
    const acHotelTier = ap.hotelTier ?? fp.hotelTier ?? null;
    const sharedRoomOk = ap.sharedRoomOk ?? null;
    const advanceNoticeRaw = ap.advanceNoticeDays ?? null;
    if (customerHomeOk !== null && typeof customerHomeOk !== "boolean") {
      return badRequest(reply, "accommodation customerHomeOk must be boolean or null.");
    }
    if (acHotelTier !== null && !HOTEL_TIERS.includes(acHotelTier)) {
      return badRequest(reply, `accommodation hotelTier must be one of ${HOTEL_TIERS.join(", ")} or null.`);
    }
    if (sharedRoomOk !== null && typeof sharedRoomOk !== "boolean") {
      return badRequest(reply, "sharedRoomOk must be boolean or null.");
    }
    if (advanceNoticeRaw !== null) {
      const d = Number(advanceNoticeRaw);
      if (!Number.isInteger(d) || d < 0 || d > 30) {
        return badRequest(reply, "advanceNoticeDays must be an integer 0–30, or null.");
      }
    }

    // foodPrefs is FOOD-ONLY (no stay leakage).
    update.foodPrefs = {
      dietary: fp.dietary ?? null,
      hotelFoodOk: fp.hotelFoodOk ?? null,
      allergies: String(fp.allergies || "").slice(0, 500),
      dailyAllowance: fp.dailyAllowance === null ? null : Math.round(Number(fp.dailyAllowance)),
    };
    // stay → its own column, incl. the two newly-captured fields
    update.accommodationPrefs = {
      customerHomeOk,
      hotelTier: acHotelTier,
      sharedRoomOk,
      advanceNoticeDays: advanceNoticeRaw === null ? null : Math.round(Number(advanceNoticeRaw)),
    };
  }

  if (step === 5) {
    // Moved unchanged from the old 7-step wizard: aadhaar + bank/UPI
    // (typed-only). verificationStatus stays PENDING for the admin.
    const { aadhaarUrl, payment } = data as { aadhaarUrl?: string; payment?: any };
    if (!aadhaarUrl || typeof aadhaarUrl !== "string" || aadhaarUrl.trim().length === 0) {
      return badRequest(reply, "Aadhaar photo upload is required.");
    }
    if (!payment || typeof payment !== "object") {
      return badRequest(reply, "Payment details are required.");
    }
    if (payment.type === "BANK") {
      const { accountName, accountNumber, ifsc } = payment.bank || {};
      if (!accountName || String(accountName).trim().length === 0) {
        return badRequest(reply, "Account holder name is required.");
      }
      const accNumStr = String(accountNumber || "");
      if (!/^\d{9,18}$/.test(accNumStr)) {
        return badRequest(reply, "Account number must be numeric and between 9 and 18 digits.");
      }
      const ifscStr = String(ifsc || "").toUpperCase();
      if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifscStr)) {
        return badRequest(reply, "Invalid IFSC code format.");
      }
      update.bankAccountName = accountName;
      update.bankAccountNumber = Buffer.from(accNumStr).toString("base64");
      update.bankIfscCode = ifscStr;
      update.bankIfsc = ifscStr;
      update.upiId = null;
    } else if (payment.type === "UPI") {
      const upiVal = String(payment.upi?.id || "");
      if (!/^[\w.-]{2,}@[a-zA-Z]{2,}$/.test(upiVal)) {
        return badRequest(reply, "Invalid UPI ID format.");
      }
      update.upiId = upiVal;
    } else {
      return badRequest(reply, "Select either bank account or UPI.");
    }
    update.aadhaarDocUrl = aadhaarUrl;
    update.aadhaarFrontUrl = aadhaarUrl;
    // R5 done → the pandit is booking-ready. GO ONLINE stays gated by
    // admin approval exactly as before.
    update.isBookingReady = true;
  }

  update.readinessStep = Math.max(profile.readinessStep, step);

  await prisma.panditProfile.update({ where: { id: profile.id }, data: update as any });

  const snapshot = await readinessSnapshot(profile.id);
  return reply.send({ success: true, data: snapshot });
};
