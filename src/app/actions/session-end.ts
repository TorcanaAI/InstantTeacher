"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function endSessionAction(sessionId: string) {
  const session = await auth();
  if (!session?.user) return;

  const t = await prisma.tutoringSession.findFirst({
    where: { id: sessionId },
  });
  if (!t) return;

  const isParticipant =
    t.requestedByUserId === session.user.id ||
    t.teacherId === session.user.id;

  if (!isParticipant) return;

  if (t.status === "IN_PROGRESS" || t.status === "TEACHER_JOINED" || t.status === "STUDENT_WAITING" || t.status === "ROOM_CREATED") {
    await prisma.tutoringSession.update({
      where: { id: sessionId },
      data: { status: "ENDED", endedAt: new Date() },
    });
  }
}
