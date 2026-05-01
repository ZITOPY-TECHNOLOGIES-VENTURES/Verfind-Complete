-- Verifind V2 — initial migration (clean rebuild)

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('tenant', 'agent', 'admin');

-- CreateEnum
CREATE TYPE "PropertyType" AS ENUM ('Self_contain', 'One_bedroom', 'Two_bedroom', 'Three_bedroom', 'Detached_duplex');

-- CreateEnum
CREATE TYPE "PropertyStatus" AS ENUM ('available', 'under_offer', 'rented');

-- CreateEnum
CREATE TYPE "VerificationStage" AS ENUM ('listing_created', 'docs_uploaded', 'agent_vetted', 'inspection_scheduled', 'verified');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('deposit', 'withdrawal', 'escrow_hold', 'escrow_release');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('pending', 'confirmed', 'releasing', 'released', 'failed', 'refunded');

-- CreateTable
CREATE TABLE "User" (
    "id"               TEXT NOT NULL,
    "username"         TEXT NOT NULL,
    "email"            TEXT NOT NULL,
    "password"         TEXT NOT NULL,
    "role"             "Role" NOT NULL DEFAULT 'tenant',
    "isEmailVerified"  BOOLEAN NOT NULL DEFAULT false,
    "isKycVerified"    BOOLEAN NOT NULL DEFAULT false,
    "phone"            TEXT,
    "isPhoneVerified"  BOOLEAN NOT NULL DEFAULT false,
    "businessName"     TEXT,
    "nin"              TEXT,
    "driverLicenseUrl" TEXT,
    "cacDocUrl"        TEXT,
    "currentAddress"   TEXT,
    "ninUrl"           TEXT,
    "createdAt"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"        TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PendingReg" (
    "id"        TEXT NOT NULL,
    "username"  TEXT NOT NULL,
    "email"     TEXT NOT NULL,
    "password"  TEXT NOT NULL,
    "role"      "Role" NOT NULL DEFAULT 'tenant',
    "phone"     TEXT,
    "nin"       TEXT,
    "otp"       TEXT NOT NULL,
    "otpExpiry" TIMESTAMP(3) NOT NULL,
    "attempts"  INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PendingReg_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Property" (
    "id"                  TEXT NOT NULL,
    "title"               TEXT NOT NULL,
    "description"         TEXT,
    "district"            TEXT NOT NULL,
    "address"             TEXT,
    "type"                "PropertyType" NOT NULL DEFAULT 'Self_contain',
    "lat"                 DOUBLE PRECISION,
    "lng"                 DOUBLE PRECISION,
    "baseRent"            DOUBLE PRECISION NOT NULL,
    "serviceCharge"       DOUBLE PRECISION NOT NULL DEFAULT 0,
    "cautionFee"          DOUBLE PRECISION NOT NULL DEFAULT 0,
    "agencyFee"           DOUBLE PRECISION,
    "legalFee"            DOUBLE PRECISION,
    "totalInitialPayment" DOUBLE PRECISION,
    "images"              TEXT[],
    "videoUrl"            TEXT NOT NULL,
    "bedrooms"            INTEGER,
    "bathrooms"           INTEGER,
    "sqm"                 DOUBLE PRECISION,
    "furnished"           BOOLEAN NOT NULL DEFAULT false,
    "parking"             BOOLEAN NOT NULL DEFAULT false,
    "listingMode"         TEXT NOT NULL DEFAULT 'Rent',
    "isFeatured"          BOOLEAN NOT NULL DEFAULT false,
    "agentId"             TEXT NOT NULL,
    "agentName"           TEXT,
    "isVerified"          BOOLEAN NOT NULL DEFAULT false,
    "verificationStage"   "VerificationStage" NOT NULL DEFAULT 'listing_created',
    "status"              "PropertyStatus" NOT NULL DEFAULT 'available',
    "createdAt"           TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"           TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Property_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Booking" (
    "id"            TEXT NOT NULL,
    "propertyId"    TEXT NOT NULL,
    "tenantId"      TEXT NOT NULL,
    "agentId"       TEXT NOT NULL,
    "requestedDate" TIMESTAMP(3) NOT NULL,
    "status"        TEXT NOT NULL DEFAULT 'pending',
    "agentNote"     TEXT,
    "propertyTitle" TEXT,
    "tenantName"    TEXT,
    "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"     TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id"          TEXT NOT NULL,
    "userId"      TEXT NOT NULL,
    "propertyId"  TEXT,
    "type"        "TransactionType" NOT NULL,
    "amount"      DOUBLE PRECISION NOT NULL,
    "status"      TEXT NOT NULL DEFAULT 'completed',
    "description" TEXT,
    "reference"   TEXT,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id"                    TEXT NOT NULL,
    "reference"             TEXT NOT NULL,
    "propertyId"            TEXT NOT NULL,
    "tenantId"              TEXT NOT NULL,
    "agentId"               TEXT NOT NULL,
    "amount"                DOUBLE PRECISION NOT NULL,
    "amountKobo"            DOUBLE PRECISION NOT NULL,
    "description"           TEXT,
    "status"                "PaymentStatus" NOT NULL DEFAULT 'pending',
    "tenantConfirmedMoveIn" BOOLEAN NOT NULL DEFAULT false,
    "moveInConfirmedAt"     TIMESTAMP(3),
    "inspectionDate"        TIMESTAMP(3),
    "releaseDate"           TIMESTAMP(3),
    "paystackData"          JSONB,
    "transferReference"     TEXT,
    "recipientCode"         TEXT,
    "propertyTitle"         TEXT,
    "agentName"             TEXT,
    "tenantEmail"           TEXT,
    "createdAt"             TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"             TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentBank" (
    "id"            TEXT NOT NULL,
    "agentId"       TEXT NOT NULL,
    "bankCode"      TEXT NOT NULL,
    "bankName"      TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "accountName"   TEXT NOT NULL,
    "recipientCode" TEXT NOT NULL,
    "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"     TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgentBank_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "PendingReg_email_key" ON "PendingReg"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_reference_key" ON "Payment"("reference");

-- CreateIndex
CREATE UNIQUE INDEX "AgentBank_agentId_key" ON "AgentBank"("agentId");
