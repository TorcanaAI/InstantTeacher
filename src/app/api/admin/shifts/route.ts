import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== Role.ADMIN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { startAt, endAt, requiredTeacherCount, subjectFocus, yearFocus } = body as {
      startAt: string;
      endAt: string;
      requiredTeacherCount: number;
      subjectFocus: string[];
      yearFocus: number[];
    };

    if (!startAt || !endAt) {
      return NextResponse.json({ error: "startAt and endAt required" }, { status: 400 });
    }

    const shift = await prisma.shift.create({
      data: {
        startAt: new Date(startAt),
        endAt: new Date(endAt),
        requiredTeacherCount: requiredTeacherCount ?? 1,
        subjectFocus: subjectFocus ?? [],
        yearFocus: yearFocus ?? [3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
        createdByAdminId: session.user.id,
      },
    });

    return NextResponse.json({ id: shift.id });
  } catch (err) {
    console.error("Create shift error:", err);
    return NextResponse.json({ error: "Failed to create shift" }, { status: 500 });
  }
}
