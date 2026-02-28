import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET: Fetch session data needed for extension button (teacher only).
 * Returns: startedAt, durationMinutes, totalExtendedMinutes, allowsIncrementalCharges
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { sessionId } = await params;
    const t = await prisma.tutoringSession.findFirst({
      where: { id: sessionId, teacherId: session.user.id },
      include: {
        extensions: { where: { status: "SUCCEEDED" } },
      },
    });

    if (!t) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    if (!t.startedAt) {
      return NextResponse.json({ error: "Session has not started" }, { status: 400 });
    }

    const totalExtendedMinutes = t.extensions.reduce((sum, ext) => sum + ext.extensionMinutes, 0);

    return NextResponse.json({
      startedAt: t.startedAt.toISOString(),
      durationMinutes: t.durationMinutes,
      totalExtendedMinutes,
      allowsIncrementalCharges: t.allowsIncrementalCharges,
    });
  } catch (err) {
    console.error("Extension data fetch error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch session data" },
      { status: 500 }
    );
  }
}
