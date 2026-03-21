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

  let adminUser = existing;
  if (existing) {
    await prisma.user.update({
      where: { id: existing.id },
      data: { email: adminEmail, role: Role.ADMIN, passwordHash },
    });
    console.log("Admin user updated:", adminEmail);
    console.log("Password hash set");
  } else {
    adminUser = await prisma.user.create({
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

  // Ensure a Test Student exists for Sunshine testing (admin can act as parent)
  const TEST_STUDENT_FULL_NAME = "Test Student (Sunshine)";
  let parent = await prisma.parentProfile.findUnique({
    where: { userId: adminUser!.id },
    include: { students: true },
  });
  if (!parent) {
    parent = await prisma.parentProfile.create({
      data: {
        userId: adminUser!.id,
        fullName: "InstantTeacher Admin",
        mobile: "0400000000",
        suburb: "Perth",
      },
      include: { students: true },
    });
    console.log("Parent profile created for admin (for Sunshine testing)");
  }
  const testStudent = parent.students.find((s) => s.fullName === TEST_STUDENT_FULL_NAME);
  if (!testStudent) {
    await prisma.studentProfile.create({
      data: {
        parentId: parent.id,
        fullName: TEST_STUDENT_FULL_NAME,
        schoolYear: 3,
        schoolName: "Test School",
        subjects: ["English", "Mathematics"],
      },
    });
    console.log("Test Student (Sunshine) created for admin testing");
  } else {
    console.log("Test Student (Sunshine) already exists");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
