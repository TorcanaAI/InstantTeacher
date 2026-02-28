-- Add session extension fields to TutoringSession
ALTER TABLE "TutoringSession" ADD COLUMN IF NOT EXISTS "stripePaymentMethodId" TEXT;
ALTER TABLE "TutoringSession" ADD COLUMN IF NOT EXISTS "allowsIncrementalCharges" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "TutoringSession" ADD COLUMN IF NOT EXISTS "totalExtendedMinutes" INTEGER NOT NULL DEFAULT 0;

-- Create SessionExtension table
CREATE TABLE IF NOT EXISTS "SessionExtension" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "extensionMinutes" INTEGER NOT NULL,
    "priceCents" INTEGER NOT NULL,
    "platformFee" INTEGER NOT NULL,
    "teacherPayout" INTEGER NOT NULL,
    "stripePaymentIntentId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "extendedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SessionExtension_pkey" PRIMARY KEY ("id")
);

-- Create indexes
CREATE INDEX IF NOT EXISTS "SessionExtension_sessionId_idx" ON "SessionExtension"("sessionId");
CREATE INDEX IF NOT EXISTS "SessionExtension_stripePaymentIntentId_idx" ON "SessionExtension"("stripePaymentIntentId");

-- Add foreign key
ALTER TABLE "SessionExtension" ADD CONSTRAINT "SessionExtension_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "TutoringSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Create unique constraint on stripePaymentIntentId
CREATE UNIQUE INDEX IF NOT EXISTS "SessionExtension_stripePaymentIntentId_key" ON "SessionExtension"("stripePaymentIntentId");
