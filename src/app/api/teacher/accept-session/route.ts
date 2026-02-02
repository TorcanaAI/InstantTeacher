import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

/**
 * POST /api/teacher/accept-session
 * Body: { sessionId: string }
 * Locks the session to this teacher and sets status MATCHED.
 */
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== Role.TEACHER) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { sessionId } = (await req.json()) as { sessionId: string };
    if (!sessionId) {
      return NextResponse.json({ error: "sessionId required" }, { status: 400 });
    }

    const profile = await prisma.teacherProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        shifts: {
          where: {
            status: "CHECKED_IN",
            shift: {
              startAt: { lte: new Date() },
              endAt: { gte: new Date() },
            },
          },
        },
      },
    });

    if (!profile || profile.applicationStatus !== "APPROVED") {
      return NextResponse.json({ error: "Not eligible to accept" }, { status: 403 });
    }
    if (profile.shifts.length === 0) {
      return NextResponse.json({ error: "You must be checked in to accept requests" }, { status: 403 });
    }

    const t = await prisma.tutoringSession.findFirst({
      where: { id: sessionId, status: "PAID", teacherId: null },
      include: { student: true },
    });

    if (!t) {
      return NextResponse.json({ error: "Session not available or already taken" }, { status: 404 });
    }
    if (!profile.subjects.includes(t.subject) || !profile.yearLevels.includes(t.yearLevel)) {
      return NextResponse.json({ error: "Subject or year level mismatch" }, { status: 400 });
    }
    if (profile.schoolName === t.student.schoolName || profile.blockedSchools.includes(t.student.schoolName)) {
      return NextResponse.json({ error: "Conflict of interest" }, { status: 400 });
    }

    await prisma.tutoringSession.update({
      where: { id: sessionId },
      data: {
        teacherId: session.user.id,
        status: "MATCHED",
        matchedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, sessionId });
  } catch (err) {
    console.error("accept-session error:", err);
    return NextResponse.json({ error: "Failed to accept session" }, { status: 500 });
  }
}
