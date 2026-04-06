-- CreateEnum
CREATE TYPE "Role" AS ENUM ('tenant', 'agent', 'admin');

-- CreateEnum
CREATE TYPE "PropertyType" AS ENUM ('Apartment', 'House', 'Duplex', 'Bungalow');

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
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'tenant',
    "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
    "isKycVerified" BOOLEAN NOT NULL DEFAULT false,
    "phone" TEXT,
    "agencyName" TEXT,
    "nin" TEXT,
    "whatsappNumber" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PendingReg" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'tenant',
    "otp" TEXT NOT NULL,
    "otpExpiry" TIMESTAMP(3) NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PendingReg_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Property" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "district" TEXT NOT NULL,
    "address" TEXT,
    "type" "PropertyType" NOT NULL DEFAULT 'Apartment',
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "baseRent" DOUBLE PRECISION NOT NULL,
    "serviceCharge" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "cautionFee" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "agencyFee" DOUBLE PRECISION,
    "legalFee" DOUBLE PRECISION,
    "totalInitialPayment" DOUBLE PRECISION,
    "images" TEXT[],
    "videoUrl" TEXT,
    "bedrooms" INTEGER,
    "bathrooms" INTEGER,
    "sqm" DOUBLE PRECISION,
    "furnished" BOOLEAN NOT NULL DEFAULT false,
    "parking" BOOLEAN NOT NULL DEFAULT false,
    "agentId" TEXT NOT NULL,
    "agentName" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verificationStage" "VerificationStage" NOT NULL DEFAULT 'listing_created',
    "status" "PropertyStatus" NOT NULL DEFAULT 'available',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Property_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "propertyId" TEXT,
    "type" "TransactionType" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'completed',
    "description" TEXT,
    "reference" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "amountKobo" DOUBLE PRECISION NOT NULL,
    "description" TEXT,
    "status" "PaymentStatus" NOT NULL DEFAULT 'pending',
    "inspectionDate" TIMESTAMP(3),
    "releaseDate" TIMESTAMP(3),
    "paystackData" JSONB,
    "transferReference" TEXT,
    "recipientCode" TEXT,
    "propertyTitle" TEXT,
    "agentName" TEXT,
    "tenantEmail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentBank" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "bankCode" TEXT NOT NULL,
    "bankName" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "accountName" TEXT NOT NULL,
    "recipientCode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

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
