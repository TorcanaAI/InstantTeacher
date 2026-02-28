import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { SUBJECTS } from "@/lib/constants";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as { studentId: string; subject: string };
    const { studentId, subject } = body;
    if (!studentId || !subject) {
      return NextResponse.json(
        { error: "studentId and subject required" },
        { status: 400 }
      );
    }
    if (!SUBJECTS.includes(subject as (typeof SUBJECTS)[number])) {
      return NextResponse.json({ error: "Invalid subject" }, { status: 400 });
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

    const block = await prisma.sunshineQuestionBlock.findFirst({
      where: { studentId, questionsRemaining: { gt: 0 } },
      orderBy: { createdAt: "asc" },
    });
    if (!block) {
      return NextResponse.json(
        { error: "No questions remaining. Purchase a block of 5 for $5." },
        { status: 402 }
      );
    }

    await prisma.$transaction([
      prisma.sunshineQuestionBlock.update({
        where: { id: block.id },
        data: { questionsRemaining: block.questionsRemaining - 1 },
      }),
      prisma.sunshineQuestionUse.create({
        data: { blockId: block.id, studentId, subject },
      }),
    ]);

    return NextResponse.json({ ok: true, questionsRemaining: block.questionsRemaining - 1 });
  } catch (err) {
    console.error("Sunshine use-question error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed" },
      { status: 500 }
    );
  }
}
