"use server";

import { redirect } from "next/navigation";
import { signIn } from "@/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
import { z } from "zod";

const registerParentSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "At least 8 characters"),
  fullName: z.string().min(2),
  mobile: z.string().min(8),
  suburb: z.string().min(2),
});

export async function registerParent(formData: FormData) {
  const parsed = registerParentSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    fullName: formData.get("fullName"),
    mobile: formData.get("mobile"),
    suburb: formData.get("suburb"),
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const { email, password, fullName, mobile, suburb } = parsed.data;
  const existing = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });
  if (existing) {
    return { error: { email: ["Email already registered"] } };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      email: email.toLowerCase(),
      passwordHash,
      name: fullName,
      role: Role.PARENT,
    },
  });

  await prisma.parentProfile.create({
    data: {
      userId: user.id,
      fullName,
      mobile,
      suburb,
    },
  });

  await signIn("credentials", {
    email: user.email,
    password,
    redirectTo: "/parent/dashboard",
  });
  redirect("/parent/dashboard");
}

const registerTeacherSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  fullName: z.string().min(2),
  mobile: z.string().min(8),
  teacherType: z.enum(["STUDENT_TEACHER", "PROFESSIONAL_TEACHER"]),
  university: z.string().optional(),
  schoolName: z.string().optional(),
  subjects: z.array(z.string()).min(1),
  yearLevels: z.array(z.number().min(3).max(12)).min(1),
  wwccNumber: z.string().optional(),
  wwccExpiry: z.string().optional(),
  teacherRegistrationNumber: z.string().optional(),
  teacherRegistrationExpiry: z.string().optional(),
});

export async function registerTeacher(formData: FormData) {
  const raw = {
    email: formData.get("email"),
    password: formData.get("password"),
    fullName: formData.get("fullName"),
    mobile: formData.get("mobile"),
    teacherType: formData.get("teacherType"),
    university: formData.get("university") || undefined,
    schoolName: formData.get("schoolName") || undefined,
    subjects: formData.get("subjects")
      ? JSON.parse(formData.get("subjects") as string)
      : [],
    yearLevels: formData.get("yearLevels")
      ? JSON.parse(formData.get("yearLevels") as string).map(Number)
      : [],
    wwccNumber: formData.get("wwccNumber") || undefined,
    wwccExpiry: formData.get("wwccExpiry") || undefined,
    teacherRegistrationNumber: formData.get("teacherRegistrationNumber") || undefined,
    teacherRegistrationExpiry: formData.get("teacherRegistrationExpiry") || undefined,
  };

  const parsed = registerTeacherSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const { email, password, fullName, mobile, teacherType, university, schoolName, subjects, yearLevels, wwccNumber, wwccExpiry, teacherRegistrationNumber, teacherRegistrationExpiry } =
    parsed.data;

  const existing = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });
  if (existing) {
    return { error: { email: ["Email already registered"] } };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      email: email.toLowerCase(),
      passwordHash,
      name: fullName,
      role: Role.TEACHER,
    },
  });

  await prisma.teacherProfile.create({
    data: {
      userId: user.id,
      fullName,
      mobile,
      teacherType: teacherType as "STUDENT_TEACHER" | "PROFESSIONAL_TEACHER",
      university: university ?? undefined,
      schoolName: schoolName ?? undefined,
      subjects,
      yearLevels,
      wwccNumber: wwccNumber ?? undefined,
      wwccExpiry: wwccExpiry ? new Date(wwccExpiry) : undefined,
      teacherRegistrationNumber: teacherRegistrationNumber ?? undefined,
      teacherRegistrationExpiry: teacherRegistrationExpiry ? new Date(teacherRegistrationExpiry) : undefined,
      applicationStatus: "PENDING",
    },
  });

  await signIn("credentials", {
    email: user.email,
    password,
    redirectTo: "/teacher/dashboard",
  });
  redirect("/teacher/dashboard");
}

const createAdminSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
});

export async function createAdminUser(formData: FormData) {
  const parsed = createAdminSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    name: formData.get("name"),
  });
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const { email, password, name } = parsed.data;
  const existing = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });
  if (existing) {
    return { error: { email: ["Email already registered"] } };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: {
      email: email.toLowerCase(),
      passwordHash,
      name,
      role: Role.ADMIN,
    },
  });
  return { success: true };
}
