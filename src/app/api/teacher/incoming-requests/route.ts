import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

/**
 * GET /api/teacher/incoming-requests
 * Returns PAID sessions with no teacher assigned yet, for which this teacher is eligible (checked in, subject/year match).
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== Role.TEACHER) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
          include: { shift: true },
        },
      },
    });

    if (!profile || profile.applicationStatus !== "APPROVED") {
      return NextResponse.json({ requests: [] });
    }

    // Teacher must be checked in to receive requests
    const isCheckedIn = profile.shifts.length > 0;
    if (!isCheckedIn) {
      return NextResponse.json({ requests: [] });
    }

    const now = new Date();
    const requests = await prisma.tutoringSession.findMany({
      where: {
        status: "PAID",
        teacherId: null,
        subject: { in: profile.subjects },
        yearLevel: { in: profile.yearLevels },
        requestedAt: { gte: new Date(now.getTime() - 10 * 60 * 1000) }, // last 10 min
      },
      include: { student: true },
      orderBy: { requestedAt: "asc" },
      take: 20,
    });

    // Conflict-of-interest: exclude same school
    const filtered = requests.filter((r) => {
      if (profile.schoolName && profile.schoolName === r.student.schoolName) return false;
      if (profile.blockedSchools.includes(r.student.schoolName)) return false;
      return true;
    });

    return NextResponse.json({
      requests: filtered.map((r) => ({
        id: r.id,
        subject: r.subject,
        section: r.section,
        yearLevel: r.yearLevel,
        durationMinutes: r.durationMinutes,
        studentPrompt: r.studentPrompt,
        studentName: r.student.fullName,
        requestedAt: r.requestedAt.toISOString(),
      })),
    });
  } catch (err) {
    console.error("incoming-requests error:", err);
    return NextResponse.json({ error: "Failed to load requests" }, { status: 500 });
  }
}
