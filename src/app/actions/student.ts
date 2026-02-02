"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function addStudent(formData: FormData) {
  const session = await auth();
  if (!session?.user || session.user.role !== Role.PARENT) {
    return { error: "Unauthorized" };
  }

  const parent = await prisma.parentProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!parent) return { error: "Parent profile not found" };

  const fullName = formData.get("fullName") as string;
  const schoolYear = parseInt(formData.get("schoolYear") as string, 10);
  const schoolName = (formData.get("schoolName") as string).trim();
  const subjectsRaw = formData.get("subjects");
  const subjects = subjectsRaw ? (JSON.parse(subjectsRaw as string) as string[]) : [];

  if (!fullName || !schoolName || schoolYear < 3 || schoolYear > 12) {
    return { error: "Invalid input. Name, school and year (3–12) required." };
  }

  await prisma.studentProfile.create({
    data: {
      parentId: parent.id,
      fullName,
      schoolYear,
      schoolName,
      subjects,
      timezone: "Australia/Perth",
    },
  });

  revalidatePath("/parent/dashboard");
  return { success: true };
}
