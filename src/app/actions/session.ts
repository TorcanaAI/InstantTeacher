"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import {
  SESSION_DURATIONS,
  PLATFORM_FEE_PERCENT,
} from "@/lib/constants";
import type { SessionStatus } from "@prisma/client";

export async function requestSession(formData: FormData) {
  const session = await auth();
  if (!session?.user || session.user.role !== Role.PARENT) {
    return { error: "Unauthorized" };
  }

  const studentId = formData.get("studentId") as string;
  const subject = formData.get("subject") as string;
  const yearLevel = parseInt(formData.get("yearLevel") as string, 10);
  const durationMinutes = parseInt(formData.get("durationMinutes") as string, 10);
  const helpType = formData.get("helpType") as string;
  const studentPrompt = (formData.get("studentPrompt") as string) || null;

  if (!studentId || !subject || !yearLevel || !durationMinutes || !helpType) {
    return { error: "Missing required fields" };
  }

  const durationConfig = SESSION_DURATIONS.find((d) => d.minutes === durationMinutes);
  if (!durationConfig) {
    return { error: "Invalid duration" };
  }

  const student = await prisma.studentProfile.findFirst({
    where: { id: studentId },
    include: { parent: true },
  });
  if (!student || student.parent.userId !== session.user.id) {
    return { error: "Student not found" };
  }

  const pricePaid = durationConfig.priceCents;
  const platformFee = Math.round((pricePaid * PLATFORM_FEE_PERCENT) / 100);
  const teacherPayout = pricePaid - platformFee;

  // Create session without teacher; teacher accepts after payment (incoming-requests flow)
  const tutoringSession = await prisma.tutoringSession.create({
    data: {
      studentId: student.id,
      requestedByUserId: session.user.id,
      subject,
      yearLevel,
      durationMinutes,
      helpType,
      studentPrompt,
      pricePaid,
      platformFee,
      teacherPayout,
      status: "REQUESTED",
    },
  });

  return {
    sessionId: tutoringSession.id,
    priceCents: pricePaid,
    clientSecret: null as string | null, // set by Stripe API
  };
}

export async function getSessionForPayment(sessionId: string) {
  const session = await auth();
  if (!session?.user) return null;

  const t = await prisma.tutoringSession.findFirst({
    where: { id: sessionId, requestedByUserId: session.user.id },
    include: { student: true, teacher: true },
  });
  return t;
}

export async function updateSessionStatus(
  sessionId: string,
  status: SessionStatus,
  extra?: { startedAt?: Date; endedAt?: Date }
) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };

  await prisma.tutoringSession.update({
    where: { id: sessionId },
    data: { status, ...extra },
  });
  return { success: true };
}
