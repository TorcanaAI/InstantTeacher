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

