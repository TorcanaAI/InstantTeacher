import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;

    const homeworkSession = await prisma.homeworkSession.findUnique({
      where: { id },
      include: {
        messages: { orderBy: { createdAt: "asc" } },
        student: true,
      },
    });
    if (!homeworkSession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }
    if (homeworkSession.requestedByUserId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({
      id: homeworkSession.id,
      studentId: homeworkSession.studentId,
      status: homeworkSession.status,
      assistantType: homeworkSession.assistantType,
      subject: homeworkSession.subject,
      startedAt: homeworkSession.startedAt,
      endsAt: homeworkSession.endsAt,
      messages: homeworkSession.messages.map((m) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        imageUrl: m.imageUrl,
        createdAt: m.createdAt,
      })),
    });
  } catch (err) {
    console.error("Homework session get error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load session" },
      { status: 500 }
    );
  }
}
