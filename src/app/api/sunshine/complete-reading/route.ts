import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as { sessionId: string };
    const { sessionId } = body;
    if (!sessionId) {
      return NextResponse.json({ error: "sessionId required" }, { status: 400 });
    }

    const readingSession = await prisma.sunshineReadingSession.findFirst({
      where: { id: sessionId, requestedByUserId: session.user.id },
    });
    if (!readingSession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }
    if (readingSession.status !== "IN_PROGRESS") {
      return NextResponse.json({ error: "Session not in progress" }, { status: 400 });
    }

    await prisma.sunshineReadingSession.update({
      where: { id: sessionId },
      data: { status: "COMPLETED", completedAt: new Date() },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Sunshine complete-reading error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed" },
      { status: 500 }
    );
  }
}
