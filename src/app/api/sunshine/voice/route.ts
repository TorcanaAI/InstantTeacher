import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { SUBJECTS } from "@/lib/constants";
import { sunshineAnswerStream } from "@/lib/sunshineVoice";

export const dynamic = "force-dynamic";

/**
 * POST: Generate Sunshine voice response (OpenAI → ElevenLabs stream).
 * Admin: skips payment/session validation, unlimited testing.
 * Others: requires question balance (deducts one).
 * Returns: audio/mpeg stream. No audio stored.
 */
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as {
      studentId: string;
      subject: string;
      question: string;
    };
    const { studentId, subject, question } = body;
    const questionText = (question ?? "").trim();
    if (!questionText) {
      return NextResponse.json({ error: "question is required" }, { status: 400 });
    }
    if (!SUBJECTS.includes(subject as (typeof SUBJECTS)[number])) {
      return NextResponse.json({ error: "Invalid subject" }, { status: 400 });
    }

    const role = (session.user as { role?: Role }).role;
    const isAdmin = role === Role.ADMIN;

    if (!isAdmin) {
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
    }

    const audioStream = await sunshineAnswerStream(questionText, subject);
    return new Response(audioStream, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Sunshine voice failed";
    if (message.includes("not configured") || message.includes("ELEVENLABS") || message.includes("OPENAI")) {
      return NextResponse.json({ error: message }, { status: 503 });
    }
    console.error("Sunshine voice error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
