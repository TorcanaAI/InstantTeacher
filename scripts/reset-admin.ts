/**
 * Create or reset the admin user in the database pointed to by DATABASE_URL.
 * Use this when admin login fails (e.g. production DB was never seeded or you forgot the password).
 *
 * 1. Pull production env: npx vercel env pull .env.vercel --environment=production
 * 2. Set DATABASE_URL from .env.vercel, and set ADMIN_EMAIL + ADMIN_PASSWORD to your desired login
 * 3. Run: npx tsx scripts/reset-admin.ts
 *
 * Or run after: $env:DATABASE_URL = (Get-Content .env.vercel | Select-String 'DATABASE_URL').ToString().Split('=',2)[1].Trim('"')
 * Then: $env:ADMIN_EMAIL = "your@email.com"; $env:ADMIN_PASSWORD = "YourPassword"; npx tsx scripts/reset-admin.ts
 */

import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = (process.env.ADMIN_EMAIL ?? "support@torcanaai.com").trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD ?? "SouthAfrica91!";

  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not set. Pull Vercel env or set it in .env");
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(adminPassword, 10);

  const existing = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (existing) {
    if (existing.role !== Role.ADMIN) {
      await prisma.user.update({
        where: { id: existing.id },
        data: { role: Role.ADMIN, passwordHash },
      });
      console.log("User updated to admin and password reset:", adminEmail);
    } else {
      await prisma.user.update({
        where: { id: existing.id },
        data: { passwordHash },
      });
      console.log("Admin password reset:", adminEmail);
    }
  } else {
    await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash,
        name: "InstantTeacher Admin",
        role: Role.ADMIN,
      },
    });
    console.log("Admin user created:", adminEmail);
  }

  console.log("Done. Log in at /login with the email and password you set.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
