-- AlterTable
ALTER TABLE "Property" ADD COLUMN IF NOT EXISTS "overview" TEXT,
ADD COLUMN IF NOT EXISTS "aboutProperty" TEXT,
ADD COLUMN IF NOT EXISTS "listedBy" TEXT,
ADD COLUMN IF NOT EXISTS "categorizedImages" TEXT;

-- CreateTable
CREATE TABLE IF NOT EXISTS "TenantRequest" (
    "id"                TEXT NOT NULL,
    "tenantId"          TEXT NOT NULL,
    "tenantName"        TEXT,
    "tenantEmail"       TEXT,
    "preferredLocation" TEXT NOT NULL,
    "budget"            DOUBLE PRECISION NOT NULL,
    "propertyType"      "PropertyType" NOT NULL DEFAULT 'Self_contain',
    "notes"             TEXT,
    "status"            TEXT NOT NULL DEFAULT 'active',
    "createdAt"         TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"         TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TenantRequest_pkey" PRIMARY KEY ("id")
);
