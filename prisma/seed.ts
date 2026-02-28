import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const ADMIN_EMAIL = "support@torcanaai.com";
const ADMIN_PASSWORD = "SouthAfrica91!";
const BCRYPT_ROUNDS = 12;

async function main() {
  const adminEmail = (process.env.ADMIN_EMAIL ?? ADMIN_EMAIL).trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD ?? ADMIN_PASSWORD;

  const passwordHash = await bcrypt.hash(adminPassword, BCRYPT_ROUNDS);

  // Find by exact email first, then by case-insensitive (PostgreSQL)
  let existing = await prisma.user.findUnique({
    where: { email: adminEmail },
  });
  if (!existing) {
    existing = await prisma.user.findFirst({
      where: { email: { equals: adminEmail, mode: "insensitive" } },
    });
  }

  if (existing) {
    await prisma.user.update({
      where: { id: existing.id },
      data: { email: adminEmail, role: Role.ADMIN, passwordHash },
    });
    console.log("Admin user updated:", adminEmail);
    console.log("Password hash set");
    return;
  }

  await prisma.user.create({
    data: {
      email: adminEmail,
      passwordHash,
      name: "InstantTeacher Admin",
      role: Role.ADMIN,
    },
  });

  console.log("Admin user created:", adminEmail);
  console.log("Password hash set");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
