import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const ADMIN_EMAIL = "support@torcanaai.com";
const ADMIN_PASSWORD = "SouthAfrica91!";
const BCRYPT_ROUNDS = 12;

type BootstrapParent = { email: string; password: string; name: string };

function bootstrapParentsFromEnv(): BootstrapParent[] {
  const raw = process.env.BOOTSTRAP_PARENT_ACCOUNTS?.trim();
  if (!raw) return [];
  try {
    const data = JSON.parse(raw) as unknown;
    if (!Array.isArray(data)) {
      console.error("[seed] BOOTSTRAP_PARENT_ACCOUNTS must be a JSON array; skipping.");
      return [];
    }
    const out: BootstrapParent[] = [];
    for (const item of data) {
      if (!item || typeof item !== "object") continue;
      const o = item as Record<string, unknown>;
      if (typeof o.email !== "string" || typeof o.password !== "string") continue;
      const email = o.email.trim();
      const password = o.password;
      const name =
        typeof o.name === "string" && o.name.trim()
          ? o.name.trim()
          : email.split("@")[0] || "Parent";
      out.push({ email, password, name });
    }
    return out;
  } catch {
    console.error("[seed] BOOTSTRAP_PARENT_ACCOUNTS JSON parse failed; skipping.");
    return [];
  }
}

async function ensureParentUser(prisma: PrismaClient, p: BootstrapParent) {
  const email = p.email.trim().toLowerCase();
  const hash = await bcrypt.hash(p.password, BCRYPT_ROUNDS);
  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    user = await prisma.user.findFirst({
      where: { email: { equals: email, mode: "insensitive" } },
    });
  }
  if (user) {
    await prisma.user.update({
      where: { id: user.id },
      data: { email, name: p.name, role: Role.PARENT, passwordHash: hash, banned: false },
    });
    console.log("Parent user updated:", email);
  } else {
    user = await prisma.user.create({
      data: {
        email,
        name: p.name,
        role: Role.PARENT,
        passwordHash: hash,
      },
    });
    console.log("Parent user created:", email);
  }

  const profile = await prisma.parentProfile.findUnique({ where: { userId: user.id } });
  if (!profile) {
    await prisma.parentProfile.create({
      data: {
        userId: user.id,
        fullName: p.name,
        mobile: "0400000000",
        suburb: "Perth",
      },
    });
    console.log("Parent profile created for:", email);
  }
}

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

  /** Always PARENT + these credentials; re-run seed to repair password/role. */
  const permanentParents = [
    {
      email: "kyliekritzinger@gmail.com",
      password: process.env.SEED_KYLIE_PASSWORD ?? "Kylie1",
      name: "Kylie Kritzinger",
    },
    {
      email: "giselavanrenen@gmail.com",
      password: process.env.SEED_GISELA_PASSWORD ?? "Gisela1",
      name: "Gisela Van Renen",
    },
  ] as const;

  for (const p of permanentParents) {
    await ensureParentUser(prisma, {
      email: p.email,
      password: p.password,
      name: p.name,
    });
  }

  // Optional: Vercel / CI — set BOOTSTRAP_PARENT_ACCOUNTS (JSON array) to force passwords into DB on deploy.
  for (const p of bootstrapParentsFromEnv()) {
    await ensureParentUser(prisma, p);
    console.log("Bootstrap parent ensured (from env):", p.email.trim().toLowerCase());
  }

  const clubTrials = [
    {
      code: "INSTANT-CNC",
      referenceNote: "Currambine Netball Club",
      maxUses: 250,
      expiryDays: 7,
    },
    {
      code: "INSTANT-WDRU",
      referenceNote: "Wanneroo District Rugby Club",
      maxUses: 350,
      expiryDays: 7,
    },
    {
      code: "INSTANT-HNC",
      referenceNote: "Hocking Netball Club",
      maxUses: 250,
      expiryDays: 7,
    },
  ] as const;

  for (const t of clubTrials) {
    await prisma.trialCoupon.upsert({
      where: { code: t.code },
      create: {
        code: t.code,
        referenceNote: t.referenceNote,
        maxUses: t.maxUses,
        usedCount: 0,
        expiryDays: t.expiryDays,
      },
      update: {
        referenceNote: t.referenceNote,
        maxUses: t.maxUses,
        expiryDays: t.expiryDays,
      },
    });
    console.log("Trial code ensured:", t.code);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
