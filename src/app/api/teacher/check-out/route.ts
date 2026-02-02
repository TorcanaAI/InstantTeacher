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

    const { shiftId } = (await req.json()) as { shiftId: string };
    if (!shiftId) return NextResponse.json({ error: "shiftId required" }, { status: 400 });

    const profile = await prisma.teacherProfile.findUnique({
      where: { userId: session.user.id },
    });
    if (!profile) return NextResponse.json({ error: "No teacher profile" }, { status: 403 });

    const teacherShift = await prisma.teacherShift.findFirst({
      where: { teacherId: profile.id, shiftId, status: "CHECKED_IN" },
    });
    if (!teacherShift) {
      return NextResponse.json({ error: "Shift not found or not checked in" }, { status: 404 });
    }

    await prisma.teacherShift.update({
      where: { id: teacherShift.id },
      data: { status: "COMPLETED", checkedOutAt: new Date() },
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("check-out error:", err);
    return NextResponse.json({ error: "Failed to check out" }, { status: 500 });
  }
}
