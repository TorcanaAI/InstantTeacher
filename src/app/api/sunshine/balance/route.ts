import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get("studentId");
    if (!studentId) {
      return NextResponse.json({ error: "studentId required" }, { status: 400 });
    }

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

    const blocks = await prisma.sunshineQuestionBlock.findMany({
      where: { studentId },
      orderBy: { createdAt: "asc" },
    });
    const questionsRemaining = blocks.reduce((sum, b) => sum + b.questionsRemaining, 0);

    const paidReadingAvailable = await prisma.sunshineReadingSession.findFirst({
      where: {
        studentId,
        status: "PAID",
      },
    });

    return NextResponse.json({
      questionsRemaining,
      hasPaidReadingSession: !!paidReadingAvailable,
      readingSessionId: paidReadingAvailable?.id ?? null,
    });
  } catch (err) {
    console.error("Sunshine balance error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed" },
      { status: 500 }
    );
  }
}
