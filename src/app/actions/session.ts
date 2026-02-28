"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import {
  SESSION_DURATIONS,
  PLATFORM_FEE_PERCENT,
  SECTION_TYPES,
  SUBJECTS,
} from "@/lib/constants";
import type { SectionType } from "@/lib/constants";
import type { SessionStatus } from "@prisma/client";

export async function requestSession(formData: FormData) {
  const session = await auth();
  if (!session?.user || session.user.role !== Role.PARENT) {
    return { error: "Unauthorized" };
  }

  const studentId = (formData.get("studentId") as string)?.trim();
  const subject = (formData.get("subject") as string)?.trim();
  const sectionRaw = (formData.get("section") as string)?.trim() || "NAPLAN";
  const section: SectionType = SECTION_TYPES.includes(sectionRaw as SectionType) ? (sectionRaw as SectionType) : "NAPLAN";
  const yearLevel = parseInt(String(formData.get("yearLevel") ?? ""), 10);
  const durationMinutes = parseInt(String(formData.get("durationMinutes") ?? ""), 10);
  const helpType = (formData.get("helpType") as string)?.trim();
  const studentPrompt = (formData.get("studentPrompt") as string)?.trim() || null;

  const missing: string[] = [];
  if (!studentId) missing.push("student");
  if (!subject) missing.push("subject");
  if (!Number.isFinite(yearLevel) || yearLevel < 3 || yearLevel > 12) missing.push("year level");
  if (!Number.isFinite(durationMinutes)) missing.push("session length");
  if (!helpType) missing.push("help type");
  if (missing.length > 0) {
    return { error: `Please fill in: ${missing.join(", ")}.` };
  }
  if (!SUBJECTS.includes(subject as (typeof SUBJECTS)[number])) {
    return { error: "Invalid subject" };
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
      section,
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
