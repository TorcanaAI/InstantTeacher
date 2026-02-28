/**
 * POST /api/video/create-session
 * Token-based Daily.co: create or reuse room for session, return roomUrl + token.
 * API key is server-only; never exposed to client.
 */

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  getOrCreateDailyRoomForSession,
  createDailyMeetingToken,
  isDailyConfigured,
  getDailyNotConfiguredMessage,
} from "@/lib/daily";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!isDailyConfigured()) {
      return NextResponse.json(
        { error: getDailyNotConfiguredMessage() },
        { status: 503 }
      );
    }

    const body = await req.json();
    const sessionId = typeof body.sessionId === "string" ? body.sessionId.trim() : "";
    const role = body.role === "teacher" || body.role === "student" ? body.role : null;

    if (!sessionId || !role) {
      return NextResponse.json(
        { error: "Missing or invalid sessionId or role (teacher | student)" },
        { status: 400 }
      );
    }

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

    if (role === "teacher" && !t.teacherId) {
      return NextResponse.json(
        { error: "Teacher not yet assigned to this session" },
        { status: 403 }
      );
    }

    if (role === "student" && !isParent && !isStudent) {
      return NextResponse.json(
        { error: "Only parent or student can join as student" },
        { status: 403 }
      );
    }

    // Reuse existing Daily room if present
    let roomName: string;
    let roomUrl: string;

    if (t.dailyRoomName && t.dailyRoomUrl) {
      roomName = t.dailyRoomName;
      roomUrl = t.dailyRoomUrl;
    } else {
      const room = await getOrCreateDailyRoomForSession(sessionId);
      roomName = room.roomName;
      roomUrl = room.roomUrl;
      await prisma.tutoringSession.update({
        where: { id: sessionId },
        data: {
          dailyRoomName: roomName,
          dailyRoomUrl: roomUrl,
          videoProvider: "DAILY",
          ...(["PAID", "MATCHED", "ROOM_CREATED"].includes(t.status)
            ? { status: "ROOM_CREATED" as const }
            : {}),
        },
      });
    }

    const userName =
      role === "teacher"
        ? (t.teacher?.name ?? "Teacher")
        : t.student.fullName;
    const userId = session.user.id;

    const token = await createDailyMeetingToken({
      roomName,
      role,
      userId,
      userName,
    });

    return NextResponse.json({
      roomUrl,
      token,
      roomName,
    });
  } catch (err) {
    console.error("Video create-session error:", err);
    const message = err instanceof Error ? err.message : "Failed to create video session";
    const isConfigError = typeof message === "string" && message.includes("Daily credentials not configured");
    return NextResponse.json(
      { error: message },
      { status: isConfigError ? 503 : 500 }
    );
  }
}
