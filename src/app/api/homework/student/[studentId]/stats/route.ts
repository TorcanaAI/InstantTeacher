import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ studentId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { studentId } = await params;

    const parent = await prisma.parentProfile.findUnique({
      where: { userId: session.user.id },
      include: { students: true },
    });
    if (!parent) {
      return NextResponse.json({ error: "Parent profile not found" }, { status: 403 });
    }
    const student = parent.students.find((s) => s.id === studentId);
    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setUTCHours(0, 0, 0, 0);

    const [questionsThisWeek, badges] = await Promise.all([
      prisma.homeworkSessionMessage.count({
        where: {
          session: { studentId },
          role: "USER",
          createdAt: { gte: startOfWeek },
        },
      }),
      prisma.studentBadge.findMany({
        where: { studentId },
        orderBy: { unlockedAt: "asc" },
      }),
    ]);

    const subjectsPracticed = await prisma.homeworkSession.findMany({
      where: { studentId, status: { in: ["ACTIVE", "ENDED"] }, subject: { not: null } },
      select: { subject: true },
      distinct: ["subject"],
    });
    const subjects = Array.from(new Set(subjectsPracticed.map((s) => s.subject).filter((x): x is string => Boolean(x))));

    return NextResponse.json({
      questionsThisWeek,
      streakCurrent: student.streakCurrent,
      subjectsPracticed: subjects,
      badgesEarned: badges.length,
      badges: badges.map((b) => ({ badgeId: b.badgeId, unlockedAt: b.unlockedAt })),
    });
  } catch (err) {
    console.error("Homework student stats error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load stats" },
      { status: 500 }
    );
  }
}
