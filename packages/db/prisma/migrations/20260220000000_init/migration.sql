-- CreateEnum
CREATE TYPE "Role" AS ENUM ('CUSTOMER', 'PANDIT', 'ADMIN');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('PENDING', 'DOCUMENTS_SUBMITTED', 'VIDEO_KYC_DONE', 'VERIFIED', 'REJECTED');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('CREATED', 'PANDIT_REQUESTED', 'CONFIRMED', 'TRAVEL_BOOKED', 'PANDIT_EN_ROUTE', 'PANDIT_ARRIVED', 'PUJA_IN_PROGRESS', 'COMPLETED', 'CANCELLATION_REQUESTED', 'CANCELLED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "TravelMode" AS ENUM ('SELF_DRIVE', 'TRAIN', 'FLIGHT', 'CAB', 'BUS');

-- CreateEnum
CREATE TYPE "TravelStatus" AS ENUM ('NOT_REQUIRED', 'PENDING', 'BOOKED', 'IN_TRANSIT', 'ARRIVED');

-- CreateEnum
CREATE TYPE "SamagriPreference" AS ENUM ('PANDIT_BRINGS', 'CUSTOMER_ARRANGES', 'NEED_HELP');

-- CreateEnum
CREATE TYPE "FoodArrangement" AS ENUM ('CUSTOMER_PROVIDES', 'PLATFORM_ALLOWANCE');

-- CreateEnum
CREATE TYPE "AccommodationArrangement" AS ENUM ('NOT_NEEDED', 'CUSTOMER_ARRANGES', 'PLATFORM_BOOKS');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'AUTHORIZED', 'CAPTURED', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "PayoutStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "RefundStatus" AS ENUM ('NONE', 'PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "PackageType" AS ENUM ('BASIC', 'STANDARD', 'PREMIUM');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "role" "Role" NOT NULL DEFAULT 'CUSTOMER',
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "preferredLanguages" TEXT[],
    "gotra" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CustomerProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Address" (
    "id" TEXT NOT NULL,
    "customerProfileId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "fullAddress" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "pincode" TEXT NOT NULL,
    "landmark" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Address_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PanditProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bio" TEXT,
    "experienceYears" INTEGER NOT NULL DEFAULT 0,
    "languages" TEXT[],
    "specializations" TEXT[],
    "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "aadhaarVerified" BOOLEAN NOT NULL DEFAULT false,
    "videoKycCompleted" BOOLEAN NOT NULL DEFAULT false,
    "certificateUrls" TEXT[],
    "aadhaarFrontUrl" TEXT,
    "aadhaarBackUrl" TEXT,
    "videoKycUrl" TEXT,
    "profilePhotoUrl" TEXT,
    "location" TEXT NOT NULL,
    "fullAddress" TEXT,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalReviews" INTEGER NOT NULL DEFAULT 0,
    "completedBookings" INTEGER NOT NULL DEFAULT 0,
    "travelPreferences" JSONB NOT NULL DEFAULT '{}',
    "bankAccountName" TEXT,
    "bankAccountNumber" TEXT,
    "bankIfscCode" TEXT,
    "bankName" TEXT,
    "bankVerified" BOOLEAN NOT NULL DEFAULT false,
    "upiId" TEXT,
    "deviceOs" TEXT,
    "deviceModel" TEXT,
    "appVersion" TEXT,
    "isOnline" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PanditProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PujaService" (
    "id" TEXT NOT NULL,
    "panditProfileId" TEXT NOT NULL,
    "pujaType" TEXT NOT NULL,
    "dakshinaAmount" INTEGER NOT NULL,
    "durationHours" DOUBLE PRECISION NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PujaService_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SamagriPackage" (
    "id" TEXT NOT NULL,
    "panditProfileId" TEXT NOT NULL,
    "packageName" TEXT NOT NULL,
    "packageType" "PackageType" NOT NULL,
    "pujaType" TEXT NOT NULL,
    "fixedPrice" INTEGER NOT NULL,
    "items" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SamagriPackage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PanditBlockedDate" (
    "id" TEXT NOT NULL,
    "panditProfileId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "reason" TEXT,
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "recurringRule" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PanditBlockedDate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Booking" (
    "id" TEXT NOT NULL,
    "bookingNumber" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "panditId" TEXT,
    "status" "BookingStatus" NOT NULL DEFAULT 'CREATED',
    "eventType" TEXT NOT NULL,
    "eventDate" TIMESTAMP(3) NOT NULL,
    "eventEndDate" TIMESTAMP(3),
    "muhuratTime" TEXT,
    "muhuratSuggested" BOOLEAN NOT NULL DEFAULT false,
    "venueAddress" TEXT NOT NULL,
    "venueCity" TEXT NOT NULL,
    "venuePincode" TEXT NOT NULL,
    "venueLatitude" DOUBLE PRECISION,
    "venueLongitude" DOUBLE PRECISION,
    "attendees" INTEGER,
    "specialInstructions" TEXT,
    "travelRequired" BOOLEAN NOT NULL DEFAULT false,
    "travelMode" "TravelMode",
    "travelDistanceKm" DOUBLE PRECISION,
    "travelStatus" "TravelStatus" NOT NULL DEFAULT 'NOT_REQUIRED',
    "travelBookingRef" TEXT,
    "travelNotes" TEXT,
    "foodArrangement" "FoodArrangement" NOT NULL DEFAULT 'CUSTOMER_PROVIDES',
    "foodAllowanceDays" INTEGER NOT NULL DEFAULT 0,
    "foodAllowanceAmount" INTEGER NOT NULL DEFAULT 0,
    "accommodationArrangement" "AccommodationArrangement" NOT NULL DEFAULT 'NOT_NEEDED',
    "accommodationCost" INTEGER NOT NULL DEFAULT 0,
    "samagriPreference" "SamagriPreference" NOT NULL DEFAULT 'PANDIT_BRINGS',
    "samagriPackageId" TEXT,
    "samagriCustomList" JSONB,
    "samagriAmount" INTEGER NOT NULL DEFAULT 0,
    "samagriNotes" TEXT,
    "dakshinaAmount" INTEGER NOT NULL DEFAULT 0,
    "travelCost" INTEGER NOT NULL DEFAULT 0,
    "platformFee" INTEGER NOT NULL DEFAULT 0,
    "platformFeeGst" INTEGER NOT NULL DEFAULT 0,
    "travelServiceFee" INTEGER NOT NULL DEFAULT 0,
    "travelServiceFeeGst" INTEGER NOT NULL DEFAULT 0,
    "grandTotal" INTEGER NOT NULL DEFAULT 0,
    "panditPayout" INTEGER NOT NULL DEFAULT 0,
    "payoutStatus" "PayoutStatus" NOT NULL DEFAULT 'PENDING',
    "payoutReference" TEXT,
    "payoutCompletedAt" TIMESTAMP(3),
    "cancelledBy" TEXT,
    "cancellationReason" TEXT,
    "cancellationRequestedAt" TIMESTAMP(3),
    "refundAmount" INTEGER NOT NULL DEFAULT 0,
    "refundStatus" "RefundStatus" NOT NULL DEFAULT 'NONE',
    "refundReference" TEXT,
    "razorpayOrderId" TEXT,
    "razorpayPaymentId" TEXT,
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BookingStatusUpdate" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "fromStatus" "BookingStatus" NOT NULL,
    "toStatus" "BookingStatus" NOT NULL,
    "updatedById" TEXT NOT NULL,
    "note" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BookingStatusUpdate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "revieweeId" TEXT NOT NULL,
    "overallRating" DOUBLE PRECISION NOT NULL,
    "knowledgeRating" DOUBLE PRECISION,
    "punctualityRating" DOUBLE PRECISION,
    "communicationRating" DOUBLE PRECISION,
    "comment" TEXT,
    "isAnonymous" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FavoritePandit" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "panditId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FavoritePandit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MuhuratDate" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "pujaType" TEXT NOT NULL,
    "timeWindow" TEXT NOT NULL,
    "significance" TEXT,
    "source" TEXT NOT NULL,

    CONSTRAINT "MuhuratDate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CityDistance" (
    "id" TEXT NOT NULL,
    "fromCity" TEXT NOT NULL,
    "toCity" TEXT NOT NULL,
    "distanceKm" DOUBLE PRECISION NOT NULL,
    "estimatedDriveHours" DOUBLE PRECISION,

    CONSTRAINT "CityDistance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_isActive_idx" ON "User"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "CustomerProfile_userId_key" ON "CustomerProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PanditProfile_userId_key" ON "PanditProfile"("userId");

-- CreateIndex
CREATE INDEX "PanditProfile_verificationStatus_idx" ON "PanditProfile"("verificationStatus");

-- CreateIndex
CREATE INDEX "PanditProfile_location_idx" ON "PanditProfile"("location");

-- CreateIndex
CREATE INDEX "PanditProfile_isOnline_idx" ON "PanditProfile"("isOnline");

-- CreateIndex
CREATE INDEX "PanditProfile_rating_idx" ON "PanditProfile"("rating");

-- CreateIndex
CREATE INDEX "PujaService_panditProfileId_idx" ON "PujaService"("panditProfileId");

-- CreateIndex
CREATE INDEX "PujaService_pujaType_idx" ON "PujaService"("pujaType");

-- CreateIndex
CREATE INDEX "SamagriPackage_panditProfileId_idx" ON "SamagriPackage"("panditProfileId");

-- CreateIndex
CREATE INDEX "PanditBlockedDate_panditProfileId_idx" ON "PanditBlockedDate"("panditProfileId");

-- CreateIndex
CREATE INDEX "PanditBlockedDate_date_idx" ON "PanditBlockedDate"("date");

-- CreateIndex
CREATE UNIQUE INDEX "Booking_bookingNumber_key" ON "Booking"("bookingNumber");

-- CreateIndex
CREATE INDEX "Booking_customerId_idx" ON "Booking"("customerId");

-- CreateIndex
CREATE INDEX "Booking_panditId_idx" ON "Booking"("panditId");

-- CreateIndex
CREATE INDEX "Booking_status_idx" ON "Booking"("status");

-- CreateIndex
CREATE INDEX "Booking_eventDate_idx" ON "Booking"("eventDate");

-- CreateIndex
CREATE INDEX "Booking_bookingNumber_idx" ON "Booking"("bookingNumber");

-- CreateIndex
CREATE INDEX "Booking_paymentStatus_idx" ON "Booking"("paymentStatus");

-- CreateIndex
CREATE INDEX "BookingStatusUpdate_bookingId_idx" ON "BookingStatusUpdate"("bookingId");

-- CreateIndex
CREATE UNIQUE INDEX "Review_bookingId_key" ON "Review"("bookingId");

-- CreateIndex
CREATE INDEX "Review_revieweeId_idx" ON "Review"("revieweeId");

-- CreateIndex
CREATE INDEX "FavoritePandit_customerId_idx" ON "FavoritePandit"("customerId");

-- CreateIndex
CREATE UNIQUE INDEX "FavoritePandit_customerId_panditId_key" ON "FavoritePandit"("customerId", "panditId");

-- CreateIndex
CREATE INDEX "MuhuratDate_date_idx" ON "MuhuratDate"("date");

-- CreateIndex
CREATE INDEX "MuhuratDate_pujaType_idx" ON "MuhuratDate"("pujaType");

-- CreateIndex
CREATE UNIQUE INDEX "MuhuratDate_date_pujaType_timeWindow_key" ON "MuhuratDate"("date", "pujaType", "timeWindow");

-- CreateIndex
CREATE INDEX "CityDistance_fromCity_idx" ON "CityDistance"("fromCity");

-- CreateIndex
CREATE UNIQUE INDEX "CityDistance_fromCity_toCity_key" ON "CityDistance"("fromCity", "toCity");

-- AddForeignKey
ALTER TABLE "CustomerProfile" ADD CONSTRAINT "CustomerProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_customerProfileId_fkey" FOREIGN KEY ("customerProfileId") REFERENCES "CustomerProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PanditProfile" ADD CONSTRAINT "PanditProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PujaService" ADD CONSTRAINT "PujaService_panditProfileId_fkey" FOREIGN KEY ("panditProfileId") REFERENCES "PanditProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SamagriPackage" ADD CONSTRAINT "SamagriPackage_panditProfileId_fkey" FOREIGN KEY ("panditProfileId") REFERENCES "PanditProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PanditBlockedDate" ADD CONSTRAINT "PanditBlockedDate_panditProfileId_fkey" FOREIGN KEY ("panditProfileId") REFERENCES "PanditProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_panditId_fkey" FOREIGN KEY ("panditId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingStatusUpdate" ADD CONSTRAINT "BookingStatusUpdate_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingStatusUpdate" ADD CONSTRAINT "BookingStatusUpdate_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_revieweeId_fkey" FOREIGN KEY ("revieweeId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FavoritePandit" ADD CONSTRAINT "FavoritePandit_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FavoritePandit" ADD CONSTRAINT "FavoritePandit_panditId_fkey" FOREIGN KEY ("panditId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
