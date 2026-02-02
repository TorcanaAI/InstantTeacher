"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Role } from "@prisma/client";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== Role.ADMIN) {
    throw new Error("Unauthorized");
  }
  return session.user.id;
}

export async function verifyWwcc(formData: FormData) {
  const teacherProfileId = formData.get("teacherProfileId") as string;
  if (!teacherProfileId) throw new Error("Missing teacher profile id");
  const adminId = await requireAdmin();
  await prisma.teacherProfile.update({
    where: { id: teacherProfileId },
    data: {
      wwccVerified: true,
      wwccVerifiedAt: new Date(),
      wwccVerifiedByAdminId: adminId,
    },
  });
  revalidatePath("/admin/registrations");
  revalidatePath("/admin/teachers");
  return { success: true };
}

export async function verifyTeacherRegistration(formData: FormData) {
  const teacherProfileId = formData.get("teacherProfileId") as string;
  if (!teacherProfileId) throw new Error("Missing teacher profile id");
  const adminId = await requireAdmin();
  await prisma.teacherProfile.update({
    where: { id: teacherProfileId },
    data: {
      teacherRegVerified: true,
      teacherRegVerifiedAt: new Date(),
      teacherRegVerifiedByAdminId: adminId,
    },
  });
  revalidatePath("/admin/registrations");
  revalidatePath("/admin/teachers");
  return { success: true };
}

export async function approveTeacherApplication(formData: FormData) {
  const teacherProfileId = formData.get("teacherProfileId") as string;
  if (!teacherProfileId) throw new Error("Missing teacher profile id");
  await requireAdmin();
  const profile = await prisma.teacherProfile.findUnique({
    where: { id: teacherProfileId },
  });
  if (!profile) throw new Error("Teacher not found");
  if (profile.applicationStatus !== "PENDING") throw new Error("Application is not pending");
  if (!profile.wwccVerified || !profile.teacherRegVerified) {
    throw new Error("WWCC and Teacher Registration must both be verified before approval");
  }
  await prisma.teacherProfile.update({
    where: { id: teacherProfileId },
    data: { applicationStatus: "APPROVED" },
  });
  revalidatePath("/admin/registrations");
  revalidatePath("/admin/teachers");
  return { success: true };
}

export async function rejectTeacherApplication(formData: FormData) {
  const teacherProfileId = formData.get("teacherProfileId") as string;
  const reason = (formData.get("reason") as string) || undefined;
  if (!teacherProfileId) throw new Error("Missing teacher profile id");
  await requireAdmin();
  await prisma.teacherProfile.update({
    where: { id: teacherProfileId },
    data: {
      applicationStatus: "REJECTED",
      applicationRejectedAt: new Date(),
      applicationRejectedReason: reason ?? null,
    },
  });
  revalidatePath("/admin/registrations");
  revalidatePath("/admin/teachers");
  return { success: true };
}
