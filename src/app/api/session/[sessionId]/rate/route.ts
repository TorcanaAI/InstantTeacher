import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { sessionId } = await params;
    const body = await req.json();
    const { rating, feedbackText } = body as { rating: number; feedbackText?: string };

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be 1–5" }, { status: 400 });
    }

    const t = await prisma.tutoringSession.findFirst({
      where: { id: sessionId, requestedByUserId: session.user.id },
      include: { teacher: { include: { teacherProfile: true } } },
    });

    if (!t || t.status !== "ENDED") {
      return NextResponse.json({ error: "Session not found or not ended" }, { status: 404 });
    }
    if (!t.teacherId || !t.teacher) {
      return NextResponse.json({ error: "Session has no teacher to rate" }, { status: 400 });
    }

    await prisma.tutoringSession.update({
      where: { id: sessionId },
      data: { rating, feedbackText: feedbackText ?? null },
    });

    const profile = t.teacher.teacherProfile;
    if (profile) {
      const totalSessions = profile.totalSessions + 1;
      const currentAvg = profile.ratingAvg ?? 0;
      const newAvg = (currentAvg * profile.totalSessions + rating) / totalSessions;
      await prisma.teacherProfile.update({
        where: { id: profile.id },
        data: { ratingAvg: newAvg, totalSessions },
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Rate session error:", err);
    return NextResponse.json({ error: "Failed to submit rating" }, { status: 500 });
  }
}
