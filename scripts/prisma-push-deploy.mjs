/**
 * Build-time DB init for Vercel.
 *
 * We intentionally avoid `prisma db push` because in your DB it may propose dropping
 * non-empty legacy tables not present in the current Prisma schema.
 *
 * Instead, we create only the tables/enums required by the app's Homework + Admin
 * dashboard if they're missing.
 */
import { PrismaClient } from "@prisma/client";

const shouldInit = process.env.VERCEL === "1" || process.env.RUN_DB_PUSH === "1";

async function main() {
  if (!shouldInit) {
    console.log(
      "[build] Skipping DB init locally (not Vercel/CI). Force: RUN_DB_PUSH=1 npm run build"
    );
    return;
  }

  const prisma = new PrismaClient();
  try {
    console.log("[build] Running targeted DB init (Homework tables/enums)…");

    // Enums first
    await prisma.$executeRawUnsafe(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'AssistantType') THEN
          CREATE TYPE "AssistantType" AS ENUM ('SUNSHINE', 'JACK');
        END IF;
      END $$;
    `);

    await prisma.$executeRawUnsafe(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'HomeworkSessionStatus') THEN
          CREATE TYPE "HomeworkSessionStatus" AS ENUM ('PENDING_PAYMENT', 'ACTIVE', 'ENDED', 'CANCELLED');
        END IF;
      END $$;
    `);

    await prisma.$executeRawUnsafe(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'SubscriptionPlan') THEN
          CREATE TYPE "SubscriptionPlan" AS ENUM ('WEEKLY', 'MONTHLY');
        END IF;
      END $$;
    `);

    await prisma.$executeRawUnsafe(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'SubscriptionStatus') THEN
          CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'CANCELED', 'PAST_DUE');
        END IF;
      END $$;
    `);

    // HomeworkSession
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "HomeworkSession" (
        "id" TEXT NOT NULL,
        "studentId" TEXT NOT NULL,
        "requestedByUserId" TEXT NOT NULL,
        "assistantType" "AssistantType" NOT NULL,
        "status" "HomeworkSessionStatus" NOT NULL DEFAULT 'ACTIVE',
        "subject" TEXT,
        "sessionType" TEXT NOT NULL DEFAULT 'HOMEWORK',
        "startedAt" TIMESTAMP(3),
        "endsAt" TIMESTAMP(3),
        "stripePaymentIntentId" TEXT,
        "stripeSubscriptionId" TEXT,
        "pricePaidCents" INTEGER NOT NULL DEFAULT 0,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "HomeworkSession_pkey" PRIMARY KEY ("id")
      );
    `);

    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "HomeworkSession_stripePaymentIntentId_key"
      ON "HomeworkSession"("stripePaymentIntentId");
    `);

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "HomeworkSession_studentId_idx" ON "HomeworkSession"("studentId");
    `);
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "HomeworkSession_requestedByUserId_idx" ON "HomeworkSession"("requestedByUserId");
    `);
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "HomeworkSession_status_idx" ON "HomeworkSession"("status");
    `);
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "HomeworkSession_endsAt_idx" ON "HomeworkSession"("endsAt");
    `);

    // HomeworkSessionMessage
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "HomeworkSessionMessage" (
        "id" TEXT NOT NULL,
        "sessionId" TEXT NOT NULL,
        "role" TEXT NOT NULL,
        "content" TEXT NOT NULL,
        "imageUrl" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "HomeworkSessionMessage_pkey" PRIMARY KEY ("id")
      );
    `);

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "HomeworkSessionMessage_sessionId_idx"
      ON "HomeworkSessionMessage"("sessionId");
    `);

    // Subscription (admin dashboard metrics depend on it)
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Subscription" (
        "id" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "stripeSubscriptionId" TEXT,
        "stripePriceId" TEXT,
        "plan" "SubscriptionPlan" NOT NULL,
        "status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
        "currentPeriodEnd" TIMESTAMP(3),
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
      );
    `);

    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "Subscription_userId_key"
      ON "Subscription"("userId");
    `);

    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "Subscription_stripeSubscriptionId_key"
      ON "Subscription"("stripeSubscriptionId");
    `);

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "Subscription_userId_idx" ON "Subscription"("userId");
    `);
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "Subscription_status_idx" ON "Subscription"("status");
    `);

    // TrialCoupon (admin "Trials" page depends on it)
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "TrialCoupon" (
        "id" TEXT NOT NULL,
        "code" TEXT NOT NULL,
        "referenceNote" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "usedAt" TIMESTAMP(3),
        "usedByUserId" TEXT,
        CONSTRAINT "TrialCoupon_pkey" PRIMARY KEY ("id")
      );
    `);

    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "TrialCoupon_code_key" ON "TrialCoupon"("code");
    `);

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "TrialCoupon_code_idx" ON "TrialCoupon"("code");
    `);

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "TrialCoupon_usedAt_idx" ON "TrialCoupon"("usedAt");
    `);

    await prisma.$executeRawUnsafe(
      `ALTER TABLE "TrialCoupon" ADD COLUMN IF NOT EXISTS "maxUses" INTEGER NOT NULL DEFAULT 1;`
    );
    await prisma.$executeRawUnsafe(
      `ALTER TABLE "TrialCoupon" ADD COLUMN IF NOT EXISTS "usedCount" INTEGER NOT NULL DEFAULT 0;`
    );
    await prisma.$executeRawUnsafe(
      `ALTER TABLE "TrialCoupon" ADD COLUMN IF NOT EXISTS "expiryDays" INTEGER NOT NULL DEFAULT 7;`
    );

    // TrialCodeRedemption (1/account, 1/card, global cap; Stripe pm_… stored)
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "TrialCodeRedemption" (
        "id" TEXT NOT NULL,
        "trialCouponId" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "paymentMethodId" TEXT NOT NULL,
        "redeemedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "trialEndDate" TIMESTAMP(3) NOT NULL,
        "stripeSubscriptionId" TEXT,
        CONSTRAINT "TrialCodeRedemption_pkey" PRIMARY KEY ("id")
      );
    `);

    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "TrialCodeRedemption_stripeSubscriptionId_key"
      ON "TrialCodeRedemption"("stripeSubscriptionId");
    `);
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "TrialCodeRedemption_trialCouponId_idx" ON "TrialCodeRedemption"("trialCouponId");
    `);
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "TrialCodeRedemption_userId_idx" ON "TrialCodeRedemption"("userId");
    `);
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "TrialCodeRedemption_paymentMethodId_idx" ON "TrialCodeRedemption"("paymentMethodId");
    `);
    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "TrialCodeRedemption_trialCouponId_userId_key"
      ON "TrialCodeRedemption"("trialCouponId", "userId");
    `);
    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "TrialCodeRedemption_trialCouponId_paymentMethodId_key"
      ON "TrialCodeRedemption"("trialCouponId", "paymentMethodId");
    `);

    await prisma.$executeRawUnsafe(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'TrialCodeRedemption_trialCouponId_fkey'
        ) THEN
          ALTER TABLE "TrialCodeRedemption"
          ADD CONSTRAINT "TrialCodeRedemption_trialCouponId_fkey"
          FOREIGN KEY ("trialCouponId") REFERENCES "TrialCoupon"("id") ON DELETE CASCADE ON UPDATE CASCADE;
        END IF;
      END $$;
    `);
    await prisma.$executeRawUnsafe(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'TrialCodeRedemption_userId_fkey'
        ) THEN
          ALTER TABLE "TrialCodeRedemption"
          ADD CONSTRAINT "TrialCodeRedemption_userId_fkey"
          FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
        END IF;
      END $$;
    `);

    // Note: Prisma schema has `usedByUserId` but we intentionally skip FKs here
    // because this targeted init is only about making the app usable.

    // StudentProfile (admin dashboard metrics depend on it)
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "StudentProfile" (
        "id" TEXT NOT NULL,
        "parentId" TEXT NOT NULL,
        "userId" TEXT,
        "fullName" TEXT NOT NULL,
        "schoolYear" INTEGER NOT NULL,
        "schoolName" TEXT NOT NULL,
        "timezone" TEXT NOT NULL DEFAULT 'Australia/Perth',
        "subjects" TEXT[] NOT NULL,
        "guardianConsent" BOOLEAN,
        "streakCurrent" INTEGER NOT NULL DEFAULT 0,
        "streakLastActivityDate" TIMESTAMP(3),
        "examQuestionsCompleted" INTEGER NOT NULL DEFAULT 0,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "StudentProfile_pkey" PRIMARY KEY ("id")
      );
    `);

    // If StudentProfile already existed with an older schema, ensure required columns exist.
    // (CREATE TABLE IF NOT EXISTS won't add missing columns.)
    await prisma.$executeRawUnsafe(
      `ALTER TABLE "StudentProfile" ADD COLUMN IF NOT EXISTS "timezone" TEXT NOT NULL DEFAULT 'Australia/Perth';`
    );
    await prisma.$executeRawUnsafe(
      `ALTER TABLE "StudentProfile" ADD COLUMN IF NOT EXISTS "subjects" TEXT[] NOT NULL DEFAULT '{}'::TEXT[];`
    );
    await prisma.$executeRawUnsafe(
      `ALTER TABLE "StudentProfile" ADD COLUMN IF NOT EXISTS "guardianConsent" BOOLEAN;`
    );
    await prisma.$executeRawUnsafe(
      `ALTER TABLE "StudentProfile" ADD COLUMN IF NOT EXISTS "streakCurrent" INTEGER NOT NULL DEFAULT 0;`
    );
    await prisma.$executeRawUnsafe(
      `ALTER TABLE "StudentProfile" ADD COLUMN IF NOT EXISTS "streakLastActivityDate" TIMESTAMP(3);`
    );
    await prisma.$executeRawUnsafe(
      `ALTER TABLE "StudentProfile" ADD COLUMN IF NOT EXISTS "examQuestionsCompleted" INTEGER NOT NULL DEFAULT 0;`
    );
    await prisma.$executeRawUnsafe(
      `ALTER TABLE "StudentProfile" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;`
    );

    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "StudentProfile_userId_key" ON "StudentProfile"("userId");
    `);

    console.log("[build] DB init complete.");
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error("[build] DB init failed:", err);
  process.exit(1);
});
