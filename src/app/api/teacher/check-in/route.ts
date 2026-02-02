import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== Role.TEACHER) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { shiftId } = await req.json();
    if (!shiftId) {
      return NextResponse.json({ error: "shiftId required" }, { status: 400 });
    }

    const profile = await prisma.teacherProfile.findUnique({
      where: { userId: session.user.id },
    });
    if (!profile) {
      return NextResponse.json({ error: "Teacher profile not found" }, { status: 404 });
    }

    const teacherShift = await prisma.teacherShift.findFirst({
      where: { teacherId: profile.id, shiftId },
      include: { shift: true },
    });
    if (!teacherShift) {
      return NextResponse.json({ error: "Shift not found" }, { status: 404 });
    }
    if (teacherShift.status !== "ACCEPTED" && teacherShift.status !== "ASSIGNED") {
      return NextResponse.json({ error: "Already checked in or completed" }, { status: 400 });
    }
    const now = new Date();
    if (now < teacherShift.shift.startAt) {
      return NextResponse.json({ error: "Shift has not started yet" }, { status: 400 });
    }
    if (now > teacherShift.shift.endAt) {
      return NextResponse.json({ error: "Shift has ended" }, { status: 400 });
    }

    await prisma.teacherShift.update({
      where: { id: teacherShift.id },
      data: { status: "CHECKED_IN", checkedInAt: now },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Check-in error:", err);
    return NextResponse.json({ error: "Failed to check in" }, { status: 500 });
  }
}
