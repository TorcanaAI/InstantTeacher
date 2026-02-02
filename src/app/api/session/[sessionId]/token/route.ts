import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getOrCreateRoomForSession, getAccessToken } from "@/lib/twilio";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { sessionId } = await params;
    const t = await prisma.tutoringSession.findFirst({
      where: { id: sessionId },
      include: { student: true, teacher: true },
    });

    if (!t) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const isParent = t.requestedByUserId === session.user.id;
    const isTeacher = t.teacherId === session.user.id;
    const isStudent = t.student.userId === session.user.id;

    if (!isParent && !isTeacher && !isStudent) {
      return NextResponse.json({ error: "Not authorized for this session" }, { status: 403 });
    }
    // When no teacher assigned yet, only parent/student can join (to wait)
    if (!t.teacherId && isTeacher) {
      return NextResponse.json({ error: "Teacher not yet assigned to this session" }, { status: 403 });
    }

    const identity = isTeacher
      ? `teacher-${session.user.id}`
      : `student-${t.studentId}-${session.user.id}`;

    const { roomSid, roomName } = await getOrCreateRoomForSession(sessionId);
    const token = getAccessToken(identity, roomName);

    if (["PAID", "MATCHED", "ROOM_CREATED"].includes(t.status)) {
      await prisma.tutoringSession.update({
        where: { id: sessionId },
        data: {
          status: "ROOM_CREATED",
          videoRoomId: roomName,
          videoRoomSid: roomSid,
        },
      });
    }

    return NextResponse.json({ token, roomName });
  } catch (err) {
    console.error("Session token error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to get token" },
      { status: 500 }
    );
  }
}
